'use strict';

module.exports = class BinarySensor {
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

    // https://github.com/Koenkk/zigbee2mqtt/blob/master/lib/extension/homeassistant.ts#L518
    if (device.dev_cla) {
      const cla = device.dev_cla.toLowerCase();
      // ContactSensor
      if (cla === 'door') {
        message.ContactSensor = {
          ContactSensorState: device.current_value ? 0 : 1,
        };
        message.ContactSensor_Inverse = {
          ContactSensorState: device.current_value ? 1 : 0,
        };
      }

      // MotionSensor, OccupancySensor
      if (cla === 'motion') {
        message.MotionSensor = {
          MotionDetected: device.current_value,
        };
        message.OccupancySensor = {
          OccupancyDetected: device.current_value ? 1 : 0,
        };
      }

      // WaterLeak
      if (cla === 'moisture') {
        message.LeakSensor = {
          LeakDetected: device.current_value ? 1 : 0,
        };
      }

      // Smoke
      if (cla === 'smoke') {
        message.SmokeSensor = {
          SmokeDetected: device.current_value ? 1 : 0,
        };
      }
    }

    return message;
  }
};
