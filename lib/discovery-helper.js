"use strict";

module.exports = new (class Helper {
  isJson(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  long2shot(obj) {
    let keysMap = {
      action_topic: "act_t",
      action_template: "act_tpl",
      automation_type: "atype",
      aux_command_topic: "aux_cmd_t",
      aux_state_template: "aux_stat_tpl",
      aux_state_topic: "aux_stat_t",
      available_tones: "av_tones",
      availability: "avty",
      availability_mode: "avty_mode",
      availability_topic: "avty_t",
      availability_template: "avty_tpl",
      away_mode_command_topic: "away_mode_cmd_t",
      away_mode_state_template: "away_mode_stat_tpl",
      away_mode_state_topic: "away_mode_stat_t",
      blue_template: "b_tpl",
      brightness_command_topic: "bri_cmd_t",
      brightness_command_template: "bri_cmd_tpl",
      brightness_scale: "bri_scl",
      brightness_state_topic: "bri_stat_t",
      brightness_template: "bri_tpl",
      brightness_value_template: "bri_val_tpl",
      color_temp_command_template: "clr_temp_cmd_tpl",
      battery_level_topic: "bat_lev_t",
      battery_level_template: "bat_lev_tpl",
      charging_topic: "chrg_t",
      charging_template: "chrg_tpl",
      color_temp_command_topic: "clr_temp_cmd_t",
      color_temp_state_topic: "clr_temp_stat_t",
      color_temp_template: "clr_temp_tpl",
      color_temp_value_template: "clr_temp_val_tpl",
      cleaning_topic: "cln_t",
      cleaning_template: "cln_tpl",
      command_off_template: "cmd_off_tpl",
      command_on_template: "cmd_on_tpl",
      command_topic: "cmd_t",
      command_template: "cmd_tpl",
      code_arm_required: "cod_arm_req",
      code_disarm_required: "cod_dis_req",
      code_trigger_required: "cod_trig_req",
      current_temperature_topic: "curr_temp_t",
      current_temperature_template: "curr_temp_tpl",
      device: "dev",
      device_class: "dev_cla",
      docked_topic: "dock_t",
      docked_template: "dock_tpl",
      encoding: "e",
      entity_category: "ent_cat",
      error_topic: "err_t",
      error_template: "err_tpl",
      fan_speed_topic: "fanspd_t",
      fan_speed_template: "fanspd_tpl",
      fan_speed_list: "fanspd_lst",
      flash_time_long: "flsh_tlng",
      flash_time_short: "flsh_tsht",
      effect_command_topic: "fx_cmd_t",
      effect_command_template: "fx_cmd_tpl",
      effect_list: "fx_list",
      effect_state_topic: "fx_stat_t",
      effect_template: "fx_tpl",
      effect_value_template: "fx_val_tpl",
      expire_after: "exp_aft",
      fan_mode_command_template: "fan_mode_cmd_tpl",
      fan_mode_command_topic: "fan_mode_cmd_t",
      fan_mode_state_template: "fan_mode_stat_tpl",
      fan_mode_state_topic: "fan_mode_stat_t",
      force_update: "frc_upd",
      green_template: "g_tpl",
      hold_command_template: "hold_cmd_tpl",
      hold_command_topic: "hold_cmd_t",
      hold_state_template: "hold_stat_tpl",
      hold_state_topic: "hold_stat_t",
      hs_command_topic: "hs_cmd_t",
      hs_state_topic: "hs_stat_t",
      hs_value_template: "hs_val_tpl",
      icon: "ic",
      initial: "init",
      target_humidity_command_topic: "hum_cmd_t",
      target_humidity_command_template: "hum_cmd_tpl",
      target_humidity_state_topic: "hum_stat_t",
      target_humidity_state_template: "hum_stat_tpl",
      json_attributes: "json_attr",
      json_attributes_topic: "json_attr_t",
      json_attributes_template: "json_attr_tpl",
      max_mireds: "max_mirs",
      min_mireds: "min_mirs",
      max_temp: "max_temp",
      min_temp: "min_temp",
      max_humidity: "max_hum",
      min_humidity: "min_hum",
      mode_command_template: "mode_cmd_tpl",
      mode_command_topic: "mode_cmd_t",
      mode_state_template: "mode_stat_tpl",
      mode_state_topic: "mode_stat_t",
      modes: "modes",
      name: "name",
      object_id: "obj_id",
      off_delay: "off_dly",
      on_command_type: "on_cmd_type",
      optimistic: "opt",
      oscillation_command_topic: "osc_cmd_t",
      oscillation_command_template: "osc_cmd_tpl",
      oscillation_state_topic: "osc_stat_t",
      oscillation_value_template: "osc_val_tpl",
      percentage_command_topic: "pct_cmd_t",
      percentage_command_template: "pct_cmd_tpl",
      percentage_state_topic: "pct_stat_t",
      percentage_value_template: "pct_val_tpl",
      payload: "pl",
      payload_arm_away: "pl_arm_away",
      payload_arm_home: "pl_arm_home",
      payload_arm_custom_bypass: "pl_arm_custom_b",
      payload_arm_night: "pl_arm_nite",
      payload_available: "pl_avail",
      payload_clean_spot: "pl_cln_sp",
      payload_close: "pl_cls",
      payload_disarm: "pl_disarm",
      payload_home: "pl_home",
      payload_lock: "pl_lock",
      payload_locate: "pl_loc",
      payload_not_available: "pl_not_avail",
      payload_not_home: "pl_not_home",
      payload_off: "pl_off",
      payload_on: "pl_on",
      payload_open: "pl_open",
      payload_oscillation_off: "pl_osc_off",
      payload_oscillation_on: "pl_osc_on",
      payload_pause: "pl_paus",
      payload_stop: "pl_stop",
      payload_start: "pl_strt",
      payload_start_pause: "pl_stpa",
      payload_return_to_base: "pl_ret",
      payload_reset_humidity: "pl_rst_hum",
      payload_reset_mode: "pl_rst_mode",
      payload_reset_percentage: "pl_rst_pct",
      payload_reset_preset_mode: "pl_rst_pr_mode",
      payload_turn_off: "pl_toff",
      payload_turn_on: "pl_ton",
      payload_trigger: "pl_trig",
      payload_unlock: "pl_unlk",
      position_closed: "pos_clsd",
      position_open: "pos_open",
      power_command_topic: "pow_cmd_t",
      power_state_topic: "pow_stat_t",
      power_state_template: "pow_stat_tpl",
      preset_mode_command_topic: "pr_mode_cmd_t",
      preset_mode_command_template: "pr_mode_cmd_tpl",
      preset_mode_state_topic: "pr_mode_stat_t",
      preset_mode_value_template: "pr_mode_val_tpl",
      preset_modes: "pr_modes",
      red_template: "r_tpl",
      retain: "ret",
      rgb_command_template: "rgb_cmd_tpl",
      rgb_command_topic: "rgb_cmd_t",
      rgb_state_topic: "rgb_stat_t",
      rgb_value_template: "rgb_val_tpl",
      send_command_topic: "send_cmd_t",
      send_if_off: "send_if_off",
      set_fan_speed_topic: "set_fan_spd_t",
      set_position_template: "set_pos_tpl",
      set_position_topic: "set_pos_t",
      position_topic: "pos_t",
      position_template: "pos_tpl",
      speed_range_min: "spd_rng_min",
      speed_range_max: "spd_rng_max",
      source_type: "src_type",
      state_class: "stat_cla",
      state_closed: "stat_clsd",
      state_closing: "stat_closing",
      state_off: "stat_off",
      state_on: "stat_on",
      state_open: "stat_open",
      state_opening: "stat_opening",
      state_stopped: "stat_stopped",
      state_locked: "stat_locked",
      state_unlocked: "stat_unlocked",
      state_topic: "stat_t",
      state_template: "stat_tpl",
      state_value_template: "stat_val_tpl",
      subtype: "stype",
      support_duration: "sup_duration",
      support_volume_set: "sup_vol",
      supported_features: "sup_feat",
      supported_turn_off: "sup_off",
      swing_mode_command_template: "swing_mode_cmd_tpl",
      swing_mode_command_topic: "swing_mode_cmd_t",
      swing_mode_state_template: "swing_mode_stat_tpl",
      swing_mode_state_topic: "swing_mode_stat_t",
      temperature_command_template: "temp_cmd_tpl",
      temperature_command_topic: "temp_cmd_t",
      temperature_high_command_template: "temp_hi_cmd_tpl",
      temperature_high_command_topic: "temp_hi_cmd_t",
      temperature_high_state_template: "temp_hi_stat_tpl",
      temperature_high_state_topic: "temp_hi_stat_t",
      temperature_low_command_template: "temp_lo_cmd_tpl",
      temperature_low_command_topic: "temp_lo_cmd_t",
      temperature_low_state_template: "temp_lo_stat_tpl",
      temperature_low_state_topic: "temp_lo_stat_t",
      temperature_state_template: "temp_stat_tpl",
      temperature_state_topic: "temp_stat_t",
      temperature_unit: "temp_unit",
      tilt_closed_value: "tilt_clsd_val",
      tilt_command_topic: "tilt_cmd_t",
      tilt_command_template: "tilt_cmd_tpl",
      tilt_invert_state: "tilt_inv_stat",
      tilt_max: "tilt_max",
      tilt_min: "tilt_min",
      tilt_opened_value: "tilt_opnd_val",
      tilt_optimistic: "tilt_opt",
      tilt_status_topic: "tilt_status_t",
      tilt_status_template: "tilt_status_tpl",
      topic: "t",
      unique_id: "uniq_id",
      unit_of_measurement: "unit_of_meas",
      value_template: "val_tpl",
      white_value_command_topic: "whit_val_cmd_t",
      white_value_scale: "whit_val_scl",
      white_value_state_topic: "whit_val_stat_t",
      white_value_template: "whit_val_tpl",
      xy_command_topic: "xy_cmd_t",
      xy_state_topic: "xy_stat_t",
      xy_value_template: "xy_val_tpl",
      configuration_url: "cu",
      connections: "cns",
      identifiers: "ids",
      name: "name",
      manufacturer: "mf",
      model: "mdl",
      sw_version: "sw",
      suggested_area: "sa",
    };

    return Object.keys(obj).reduce((old, key) => {
      if (!Array.isArray(obj[key]) && typeof obj[key] === "object") {
        obj[key] = this.long2shot(obj[key]);
      }

      const renamed = {
        [keysMap[key] || key]: obj[key],
      };

      return {
        ...old,
        ...renamed,
      };
    }, {});
  }

  payload2homekit(payload) {
    var msg = {};

    if (!payload) return msg;
    let dev_cla = payload?.dev_cla?.toLowerCase();
    let component = payload?.component?.toLowerCase();

    // sensor
    if (component == "sensor") {
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
    }

    // switch
    if (component == "switch") {
      //Switch
      if (payload.current_value === "ON" || payload.current_value === "OFF") {
        msg["Switch"] = {
          On: payload.current_value === "ON",
        };
      }
    }

    return msg;
  }
})();
