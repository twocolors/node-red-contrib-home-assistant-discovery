'use strict';

module.exports = class Switch {
  static build(dev, values = []) {
    const device = dev;
    device.support = true;
    device.current_value = this.setValue(device, values);
    device.homekit = this.setHomekit(device);
    return device;
  }

  static setValue(device, values = []) {
    const reJson = /^{{\s*?value_json\.([\w|-|.]+)\s*?}}$/i;
    let payload;

    if ('stat_t' in device) {
      // "val_tpl": "{{ value_json.contact }}"
      if ('val_tpl' in device) {
        if (values[device.stat_t] !== undefined) {
          const json = values[device.stat_t];
          const keyJson = device.val_tpl.match(reJson)[1];
          payload = json[keyJson];
        }
      } else {
        payload = values[device.stat_t];
      }
    }

    return payload;
  }

  static setHomekit(device) {
    const message = {};

    if (device === undefined || device.current_value === undefined) {
      return message;
    }

    // Switch
    if (device.current_value === 'ON' || device.current_value === 'OFF') {
      message.Switch = {
        On: device.current_value === 'ON',
      };
    }

    return message;
  }

  static publish(server, device, payload, options) {
    if ('cmd_t' in device) {
      server.broker.client.publish(device.cmd_t, payload, options);
    }
  }
};
