module.exports = (RED) => {
  'use strict';

  const Helper = require('../lib/discovery-helper');

  function HADiscovery(config) {
    const self = this;
    self.config = config;

    RED.nodes.createNode(self, config);

    try {
      self.broker = RED.nodes.getNode(self.config.server);
    } catch (_) {}

    if (!self.broker) {
      return;
    }

    self.setMaxListeners(0);
    self.devices_values = [];

    const getTopic = () => {
      return (self.config.topic || '').replace(/[/+#]+$/g, '');
    };

    const buildTopic = (topic) => {
      return getTopic() + topic;
    };

    const parserTopic = (topic) => {
      // <discovery_prefix>/<component>/[<node_id>/]<object_id>/config
      // Home Assistant
      // homeassistant/binary_sensor/garden/config
      // Esphome
      // homeassistant/binary_sensor/bathroom-fan/status/config
      // zigbee2mqtt
      // homeassistant/binary_sensor/0x00158d000392b2df/contact/config
      const parts = topic.split('/');

      if (parts.length === 4) {
        return {
          prefix: parts[0],
          component: parts[1],
          node_id: '',
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

    const isConfigTopic = (topic) => {
      const parts = parserTopic(topic);
      return parts.prefix === getTopic() && parts.last === 'config';
    };

    const getComponentTopic = (topic) => {
      const parts = parserTopic(topic);
      return parts.component;
    };

    const getDevices = (callback, refresh = false) => {
      let count = 0;
      let watchdog = null;
      let timeout = null;

      const onMessageConfig = (topic, message) => {
        if (!isConfigTopic(topic)) {
          return;
        }

        let payload = message.toString();
        payload = Helper.isJson(payload) ? JSON.parse(payload) : payload;

        if (typeof payload !== 'object') {
          return;
        }

        let device = Helper.long2shot(payload);
        if (device.dev && Array.isArray(device.dev.ids)) {
          const ids = device.dev.ids.join('_');
          device.dev.ids = ids;
        }

        // build component
        device.component = getComponentTopic(topic);
        device = Helper.buildDevice(device, self.devices_values);

        self.devices.push(device);
        count += 1;
      };

      const done = () => {
        if (self.broker.client) {
          self.broker.client.unsubscribe(buildTopic('/#'));
          self.broker.client.removeListener('message', onMessageConfig);
        }
        clearInterval(watchdog);
        clearTimeout(timeout);
      };

      if (refresh || self.devices === undefined || self.devices.length === 0) {
        self.log('MQTT fetch devices ...');

        self.devices = [];

        self.broker.client.subscribe(buildTopic('/#'));
        self.broker.client.on('message', onMessageConfig);

        let last = 0;
        watchdog = setInterval(() => {
          if (last === count) {
            done();
            if (callback) {
              try {
                callback(self.devices);
              } catch (_) {}
            }
            return self.devices;
          }
          last = count;
        }, 0.5 * 1000);

        timeout = setTimeout(() => {
          done();
          self.error(
            `Error: getDevices timeout, unsubscribe "${buildTopic('/#')}"`
          );
        }, 5 * 1000);
      } else {
        self.log('MQTT cache devices ...');
        if (callback) {
          try {
            callback(self.devices);
          } catch (_) {}
        }
        return self.devices;
      }
    };

    self.getDevices = (callback, refresh) => getDevices(callback, refresh);
    const onConnect = () => {
      self.getDevices(() => {
        self.broker.client.subscribe('#');
      }, true);
    };

    const getKeyByValue = (obj, val) => {
      let found;
      Object.keys(obj).some((key) => {
        if (obj[key] === val) {
          found = key;
        } else if (typeof obj[key] === 'object') {
          found = getKeyByValue(obj[key], val);
        }
        if (found) return found;
      });
      return found;
    };

    const onMessage = (topic, message) => {
      if (isConfigTopic(topic)) {
        return;
      }

      let payload = message.toString();
      payload = Helper.isJson(payload) ? JSON.parse(payload) : payload;

      // save value
      self.devices_values[topic] = payload;

      if (self.devices !== undefined) {
        self.devices.forEach((dev) => {
          let device = dev;
          const key = getKeyByValue(device, topic);
          if (key) {
            device = Helper.buildDevice(device, self.devices_values);
            if (
              device.current_status !== undefined &&
              device.current_value !== undefined
            ) {
              self.emit('onMessage', device);
            }
          }
          return device;
        });
      }
    };

    self.broker.register(this);
    self.broker.client.on('connect', onConnect);
    self.broker.client.on('message', onMessage);

    self.on('close', (_, done) => {
      if (self.broker.client) {
        self.broker.client.removeListener('connect', onConnect);
        self.broker.client.removeListener('message', onMessage);
      }
      done();
    });
  }

  RED.nodes.registerType('ha-discovery', HADiscovery);
};
