module.exports = function (RED) {
  "use strict";

  function HADiscoveryIn(config) {
    RED.nodes.createNode(this, config);

    let serverNode = RED.nodes.getNode(config.server);
    if (!serverNode) return;
    if (!config.dev_id || !config.uniq_id) return;

    let node = this;
    node.server = serverNode;
    node.dev_id = config.dev_id;
    node.uniq_id = config.uniq_id.split(":")[0];
    node.homekit = config.uniq_id.split(":")[1];
    node.start = config.start;
    node.filter = config.filter;

    node.current_value = null;
    node.current_status = null;
    node.first = true;

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

      // update value
      if (device.current_value !== null) {
        if (node.first && !node.start) {
          node.current_value = device.current_value;
          node.current_status = device.current_status;
          node.first = false;
          return;
        }

        if (node.filter) {
          if (
            JSON.stringify(node.current_value) ===
              JSON.stringify(device.current_value) &&
            node.current_status === device.current_status
          ) {
            return;
          }
        }

        let payload = device.current_value;
        if (node.homekit) {
          if (device.homekit[node.homekit]) {
            payload = device.homekit[node.homekit];
          } else {
            return;
          }
        }

        node.send({
          payload: payload,
          payload_raw: device.current_value,
          device: device,
        });

        node.current_value = device.current_value;
        node.current_status = device.current_status;
      }
    };

    node.server.on("onMessage", node.onMessage);
    node.on("close", () => {
      node.server.removeListener("onMessage", node.onMessage);
    });
  }

  RED.nodes.registerType("ha-discovery-in", HADiscoveryIn);
};
