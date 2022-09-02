'use strict';

module.exports = class Sensor {
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

    if (device.dev_cla) {
      const cla = device.dev_cla.toLowerCase();
      // TemperatureSensor
      if (cla === 'temperature') {
        message.TemperatureSensor = {
          CurrentTemperature: parseFloat(device.current_value),
        };
      }

      // HumiditySensor
      if (cla === 'humidity') {
        message.HumiditySensor = {
          CurrentRelativeHumidity: parseFloat(device.current_value),
        };
      }

      // Battery
      if (cla === 'battery') {
        message.Battery = {
          BatteryLevel: parseInt(device.current_value),
          StatusLowBattery: parseInt(device.current_value) <= 15 ? 1 : 0,
        };
      }
    }

    return message;
  }
};
