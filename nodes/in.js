module.exports = (RED) => {
  'use strict';

  function HADiscoveryIn(config) {
    const self = this;
    self.config = config;

    RED.nodes.createNode(self, config);

    try {
      self.serverNode = RED.nodes.getNode(self.config.server);
    } catch (_) {}

    if (!self.serverNode || !self.config.dev_id || !self.config.uniq_id) {
      return;
    }

    self.first = false;

    const getUniqId = () => {
      return self.config.uniq_id.split(':')[0];
    };

    const getHomekit = () => {
      return self.config.uniq_id.split(':')[1];
    };

    const thisDevice = (device = {}) => {
      return (
        getUniqId() === device.uniq_id &&
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
        if (self.current_status === undefined) {
          setStatus({
            fill: device.current_status === 'online' ? 'green' : 'red',
            shape: 'dot',
            text: device.current_status,
          });

          self.current_status = device.current_status;
        }
      }

      // update value
      if (device.current_value !== undefined) {
        if (!self.config.start && !self.first) {
          self.current_value = device.current_value;
          self.current_status = device.current_status;
          self.first = true;
          return;
        }

        if (self.config.filter) {
          if (
            JSON.stringify(self.current_value) ===
              JSON.stringify(device.current_value) &&
            self.current_status === device.current_status
          ) {
            return;
          }
        }

        // save value
        self.current_value = device.current_value;
        self.current_status = device.current_status;

        // format payload
        const homekit = getHomekit();
        let payload = device.current_value;
        if (homekit) {
          payload = device.homekit[homekit];
          if (payload !== undefined) {
            if (device.current_status === 'offline') {
              Object.keys(payload).forEach((key) => {
                payload[key] = 'NO_RESPONSE';
              });
            }
          } else {
            return;
          }
        }

        // bad hack for first key
        const key = Object.keys(payload).shift();
        setStatus(
          {
            fill: 'yellow',
            shape: 'dot',
            text: homekit ? `${key}: ${payload[key]}` : payload,
          },
          3000
        );

        self.send({
          payload,
          payload_raw: device.current_value,
          device,
        });
      }
    };

    setStatus({
      fill: 'blue',
      shape: 'dot',
      text: 'waiting',
    });

    self.onMessage = (message) => onMessage(message);
    self.serverNode.on('onMessage', self.onMessage);
    self.on('close', (_, done) => {
      self.serverNode.removeListener('onMessage', self.onMessage);
      done();
    });
  }

  RED.nodes.registerType('ha-discovery-in', HADiscoveryIn);
};
