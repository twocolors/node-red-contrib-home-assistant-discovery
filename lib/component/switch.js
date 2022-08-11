"use strict";

module.exports = new (class Switch {
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

    if (typeof payload === "undefined" || payload === null) return msg;

    //Switch
    if (payload.current_value === "ON" || payload.current_value === "OFF") {
      msg["Switch"] = {
        On: payload.current_value === "ON",
      };
    }

    return msg;
  };

  send = (server, device, payload, options) => {
    if ("cmd_t" in device) {
      server.broker?.client?.publish(device?.cmd_t, payload, options);
    }
  };
})();
