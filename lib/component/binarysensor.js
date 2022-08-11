"use strict";

module.exports = new (class BinarySensor {
  setValue = (values, device) => {
    let re_json = /^{{\s*?value_json\.([\w|-|\.]+)\s*?}}$/i;
    let payload = null;

    // "val_tpl": "{{ value_json.contact }}"
    if ("val_tpl" in device) {
      let value_json = device.val_tpl.match(re_json)[1];
      payload = values[device?.stat_t]?.[value_json];
    } else {
      payload = values[device?.stat_t];
    }

    return typeof payload !== "undefined" ? payload : null;
  };

  setHomekit = (payload) => {
    var msg = {};

    if (
      typeof payload === "undefined" ||
      payload === null ||
      payload.current_value === null
    )
      return msg;
    let dev_cla = payload?.dev_cla?.toLowerCase();

    //https://github.com/Koenkk/zigbee2mqtt/blob/master/lib/extension/homeassistant.ts#L518
    //ContactSensor
    if (dev_cla == "door") {
      msg["ContactSensor"] = {
        ContactSensorState: payload.current_value ? 0 : 1,
      };
      msg["ContactSensor_Inverse"] = {
        ContactSensorState: payload.current_value ? 1 : 0,
      };
    }

    //MotionSensor, OccupancySensor
    if (dev_cla == "motion") {
      msg["MotionSensor"] = {
        MotionDetected: payload.current_value,
      };
      msg["OccupancySensor"] = {
        OccupancyDetected: payload.current_value ? 1 : 0,
      };
    }

    //WaterLeak
    if (dev_cla == "moisture") {
      msg["LeakSensor"] = {
        LeakDetected: payload.current_value ? 1 : 0,
      };
    }

    //Smoke
    if (dev_cla == "smoke") {
      msg["SmokeSensor"] = {
        SmokeDetected: payload.current_value ? 1 : 0,
      };
    }

    return msg;
  };
})();
