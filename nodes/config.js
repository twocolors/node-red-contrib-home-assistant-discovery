module.exports = function (RED) {
  "use strict";

  const Helper = require("../lib/discovery-helper");
  const Sensor = require("../lib/component/sensor");
  const Switch = require("../lib/component/switch");

  function HADiscovery(config) {
    RED.nodes.createNode(this, config);

    let broker = RED.nodes.getNode(config.server);
    if (!broker) return;

    let node = this;
    node.config = config;
    node.broker = broker;

    node.devices = [];
    node.devices_values = {};

    let getTopic = () => {
      return (node.config?.topic ?? "").replace(/[\/+#]+$/g, "");
    };

    let buildTopic = (path) => {
      return getTopic() + (path ?? "");
    };

    let parserTopic = (topic) => {
      // <discovery_prefix>/<component>/[<node_id>/]<object_id>/config
      // Home Assistant
      // homeassistant/binary_sensor/garden/config
      // Esphome
      // homeassistant/binary_sensor/bathroom-fan/status/config
      // zigbee2mqtt
      // homeassistant/binary_sensor/0x00158d000392b2df/contact/config
      let parts = topic.split("/");

      if (parts.length === 4) {
        return {
          prefix: parts[0],
          component: parts[1],
          node_id: "",
          object_id: parts[2],
          last: parts[3],
        };
      }

      return {
        prefix: parts[0],
        component: parts[1],
        node_id: parts[2],
        object_id: parts[3],
        last: parts[4],
      };
    };

    let isConfigTopic = (topic) => {
      let parts = parserTopic(topic);
      return parts.prefix == getTopic() && parts.last == "config";
    };

    let getComponentTopic = (topic) => {
      let parts = parserTopic(topic);
      return parts.component;
    };

    let setStatus = (device) => {
      return node.devices_values[device?.avty_t] ?? null;
    };

    node.getDevices = (callback, refresh = false) => {
      let count = 0;
      let watchdog = null;
      let timeout = null;

      let onMessageConfig = (topic, message) => {
        if (!isConfigTopic(topic)) return;

        let payload = message.toString();
        payload = Helper.isJson(payload) ? JSON.parse(payload) : payload;

        if (typeof payload !== "object") return;

        let device = Helper.long2shot(payload);
        // +bad hack for z2m
        if (Array.isArray(device?.dev?.ids)) {
          device.dev.ids = device.dev.ids[0];
        }
        if (Array.isArray(device?.avty)) {
          device.avty_t = device.avty[0]["topic"];
          delete device.avty;
        }
        // -bad hack for z2m

        // build device
        device.component = getComponentTopic(topic);
        device.current_status = setStatus(device);

        // support component
        switch (device?.component) {
          case "sensor":
            device.current_value = Sensor.setValue(node.devices_values, device);
            device.homekit = Sensor.setHomekit(device);
            device.support = true;
            break;
          case "switch":
            device.current_value = Switch.setValue(node.devices_values, device);
            device.homekit = Switch.setHomekit(device);
            device.support = true;
            break;
          default:
            break;
        }

        node.devices.push(device);
        count++;
      };

      let _done = () => {
        if (node.broker?.client) {
          node.broker?.client?.unsubscribe(buildTopic("/#"));
          node.broker?.client?.removeListener("message", onMessageConfig);
        }
        clearInterval(watchdog);
        clearTimeout(timeout);
      };

      if (refresh || node.devices?.length === 0) {
        node.log("MQTT fetch devices ...");

        node.devices = [];

        node.broker?.client?.subscribe(buildTopic("/#"));
        node.broker?.client?.on("message", onMessageConfig);

        let last = 0;
        watchdog = setInterval(() => {
          if (count == last) {
            _done();
            if (typeof callback === "function") {
              callback(node.devices);
            }
            return node.devices;
          }
          count = last;
        }, 0.5 * 1000);

        timeout = setTimeout(() => {
          _done();
          node.error(
            'Error: getDevices timeout, unsubscribe "' + buildTopic("/#") + '"'
          );
        }, 5 * 1000);
      } else {
        node.log("MQTT cache devices ...");
        if (typeof callback === "function") {
          callback(node.devices);
        }
        return node.devices;
      }
    };

    let onConnect = () => {
      node.getDevices(() => {
        node.broker?.client?.subscribe("#");
      }, true);
    };

    let getKeyByValue = (obj, val) => {
      return Object.keys(obj).find((key) => obj[key] === val);
    };

    let onMessage = (topic, message) => {
      if (isConfigTopic(topic)) return;

      let payload = message.toString();
      payload = Helper.isJson(payload) ? JSON.parse(payload) : payload;

      // save value
      node.devices_values[topic] = payload;

      for (let i in node.devices) {
        let key = getKeyByValue(node.devices[i], topic);
        if (!key) continue;

        // set value device
        let device = node.devices[i];
        device.current_status = setStatus(device);
        switch (device?.component) {
          case "sensor":
            device.current_value = Sensor.setValue(node.devices_values, device);
            device.homekit = Sensor.setHomekit(device);
            break;
          case "switch":
            device.current_value = Switch.setValue(node.devices_values, device);
            device.homekit = Switch.setHomekit(device);
            break;
          default:
            break;
        }
        node.devices[i] = device;

        node.emit("onMessage", node.devices[i]);
      }
    };

    node.broker?.register(this);
    node.broker?.client?.on("connect", onConnect);
    node.broker?.client?.on("message", onMessage);

    node.on("close", () => {
      if (node.broker?.client) {
        node.broker?.client?.removeListener("connect", onConnect);
        node.broker?.client?.removeListener("message", onMessage);
      }
    });
  }

  RED.nodes.registerType("ha-discovery", HADiscovery);
};
