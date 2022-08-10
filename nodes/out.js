module.exports = function (RED) {
  "use strict";

  const Helper = require("../lib/discovery-helper");
  const Switch = require("../lib/component/switch");

  function HADiscoveryOut(config) {
    RED.nodes.createNode(this, config);

    let serverNode = RED.nodes.getNode(config.server);
    if (!serverNode) return;
    if (!config.dev_id || !config.uniq_id) return;

    let node = this;
    node.cleanTimer = null;
    node.server = serverNode;
    node.dev_id = config.dev_id;
    node.uniq_id = config.uniq_id;
    node.qos = Number(config.qos || 0);
    node.retain = config.retain === true || config.retain === "true" || false;
    node.payload = config.payload;
    node.payload_type = config.payload_type; // 'msg', 'flow', 'global', 'env', 'str', 'num', 'json'

    node.current_status = null;

    let isDevice = (obj) => {
      return node.dev_id == obj?.dev?.ids && node.uniq_id == obj?.uniq_id;
    };

    node.onStatus = (obj) => {
      if (obj) {
        node.status({
          fill: `${obj.color}`,
          shape: "dot",
          text: `${obj.text}`,
        });
      }
    };

    node.onMessage = (device) => {
      if (!isDevice(device)) return;

      // update status
      if (device.current_status !== null) {
        if (node.current_status === null) {
          node.current_status = device.current_status;
        }

        node.onStatus({
          color: device.current_status == "online" ? "green" : "red",
          text: device.current_status,
        });
      }
    };

    node.onInput = (message) => {
      clearTimeout(node.cleanTimer);

      let payload;
      switch (node.payload_type) {
        case "flow":
        case "global":
        case "env":
          payload = RED.util.evaluateNodeProperty(
            node.payload,
            node.payload_type,
            node,
            message
          );
          break;
        case "str":
          payload = node.payload;
          break;
        case "num":
          payload = parseInt(node.payload);
          break;
        case "json":
          if (Helper.isJson(node.payload)) {
            payload = JSON.parse(node.payload);
          } else {
            node.warn("Incorrect payload. Waiting for valid JSON");
            node.onStatus({
              color: "red",
              text: "Incorrect payload. Waiting for valid JSON",
            });
            node.cleanTimer = setTimeout(() => {
              node.onStatus({
                color: node.current_status == "online" ? "green" : "red",
                text: node.current_status,
              });
            }, 3*1000);
          }
          break;
        case "msg":
        default:
          payload = message[node.payload];
          break;
      }

      node.server.devices.map((device) => {
        if (!isDevice(device)) return;

        switch (device?.component) {
          case "switch":
            Switch.send(node.server, device, payload, {
              retain: node.retain,
              qos: node.qos,
            })
            break;
          default:
            node.warn("this Component not support");
            break;
        }
      });
    };

    node.server.on("onMessage", node.onMessage);
    node.on("input", node.onInput);
    node.on("close", () => {
      node.server.removeListener("onMessage", node.onMessage);
    });
  }

  RED.nodes.registerType("ha-discovery-out", HADiscoveryOut);
};
