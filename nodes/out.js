module.exports = (RED) => {
  'use strict';

  const Switch = require('../lib/component/switch');

  function HADiscoveryOut(config) {
    const self = this;
    self.config = config;

    RED.nodes.createNode(self, config);

    try {
      self.serverNode = RED.nodes.getNode(self.config.server);
    } catch (_) {}

    if (!self.serverNode || !self.config.dev_id || !self.config.uniq_id) {
      return;
    }

    const thisDevice = (device = {}) => {
      return (
        self.config.uniq_id === device.uniq_id &&
        device.dev &&
        device.dev.ids &&
        self.config.dev_id === device.dev.ids
      );
    };

    const clearStatus = (delay = 0) => {
      setTimeout(() => {
        if (self.current_status) {
          self.status({
            fill: self.current_status === 'online' ? 'green' : 'red',
            shape: 'dot',
            text: self.current_status,
          });
        } else {
          self.status({});
        }
      }, delay);
    };

    const setStatus = (status, timeout) => {
      self.status(status);
      if (timeout) {
        clearStatus(timeout);
      }
    };

    const onMessage = (device) => {
      if (!thisDevice(device)) {
        return;
      }

      // update status
      if (device.current_status !== undefined) {
        if (self.current_status !== device.current_status) {
          setStatus({
            fill: device.current_status === 'online' ? 'green' : 'red',
            shape: 'dot',
            text: device.current_status,
          });

          self.current_status = device.current_status;
        }
      }
    };

    const onInput = (message) => {
      const payload = RED.util.evaluateNodeProperty(
        self.config.payload,
        self.config.payload_type,
        self,
        message
      );

      self.serverNode.devices.map((device) => {
        if (!thisDevice(device)) {
          return;
        }

        setStatus({ fill: 'yellow', shape: 'dot', text: `${payload}` }, 3000);

        if (device.component === 'switch') {
          Switch.publish(self.serverNode, device, payload, {
            retain: Number(self.config.qos || 0),
            qos:
              self.config.retain === true ||
              self.config.retain === 'true' ||
              false,
          });
        } else {
          self.warn('this Component not support');
        }
      });
    };

    setStatus({
      fill: 'blue',
      shape: 'dot',
      text: 'waiting',
    });

    self.onMessage = (message) => onMessage(message);
    self.serverNode.on('onMessage', self.onMessage);
    self.onInput = (message) => onInput(message);
    self.on('input', self.onInput);
    self.on('close', (_, done) => {
      self.serverNode.removeListener('onMessage', self.onMessage);
      done();
    });
  }

  RED.nodes.registerType('ha-discovery-out', HADiscoveryOut);
};
