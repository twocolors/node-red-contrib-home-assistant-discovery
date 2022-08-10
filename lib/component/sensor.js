"use strict";

module.exports = new (class Sensor {
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

    return payload;
  };

  setHomekit = (payload) => {
    var msg = {};

    if (typeof payload === 'undefined' || payload === null) return msg;
    let dev_cla = payload?.dev_cla?.toLowerCase();

    //TemperatureSensor
    if (dev_cla == "temperature") {
      msg["TemperatureSensor"] = {
        CurrentTemperature: parseFloat(payload.current_value),
      };
    }

    //HumiditySensor
    if (dev_cla == "humidity") {
      msg["HumiditySensor"] = {
        CurrentRelativeHumidity: parseFloat(payload.current_value),
      };
    }

    //Battery
    if (dev_cla == "battery") {
      msg["Battery"] = {
        BatteryLevel: parseInt(payload.current_value),
        StatusLowBattery: parseInt(payload.current_value) <= 15 ? 1 : 0,
      };
    }

    return msg;
  };
})();
