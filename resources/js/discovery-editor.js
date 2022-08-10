class DiscoveryEditor {
  constructor(node, config = {}) {
    this.node = node;
    this.refresh = false;
    this.devices = null;

    this.config = Object.assign(
      {
        allow_out: false,
      },
      config
    );
    this.dev_id = node.dev_id;
    this.uniq_id = node.uniq_id;

    return this;
  }

  async build() {
    let that = this;
    await that.buildDevices().then(() => {
      that.buildPayload();
    });
    that.bind();
  }

  bind() {
    let that = this;
    that
      .getRefreshButton()
      .off("click")
      .on("click", () => {
        that.refresh = true;
        that.build();
      });
    that
      .getServerInput()
      .off("change")
      .on("change", () => {
        that.refresh = true;
        that.build();
      });
    that
      .getDevIdInput()
      .off("change")
      .on("change", () => {
        that.dev_id = that.getDevIdInput().val();
        that.build();
      });
  }

  async getDevices() {
    let that = this;

    if (that.devices === null || that.refresh) {
      await $.getJSON("ha-discovery/getDevices", {
        serverNode: that.getServerInput().val(),
        forceRefresh: that.refresh,
      })
        .done(function (data) {
          if (!data || data.length <= 0) return;
          that.refresh = false;
          that.devices = data;
        })
        .fail(function (err) {
          RED.notify(err.responseText, "error");
        });
    }
  }

  async buildDevices() {
    let that = this;

    await that.getDevices();
    if (that.devices.length > 0) {
      let $val = that.dev_id || that.getDevIdInput().val();

      let devices = {};
      that
        .getDevIdInput()
        .empty()
        .append(
          that.devices.map((elm) => {
            let ids = elm.dev.ids;
            let name = elm.dev.name;
            let mdl = elm.dev.mdl;
            if (!devices[ids] && elm.support) {
              devices[ids] = ids;
              return $("<option>").val(ids).text(`${name} (${mdl})`);
            }
          })
        )
        .val($val)
        .prop("disabled", false);
    }
  }

  async buildPayload() {
    let that = this;
    let $dev_id = that.dev_id || that.getDevIdInput().val();
    if (that.devices.length > 0 && $dev_id) {
      let $val = that.uniq_id || that.getUniqIdInput().val();

      let discovery = $("<optgroup>").attr("label", "Discovery");
      let homekit = $("<optgroup>").attr("label", "HomeKit");

      that.getUniqIdInput().empty();

      that.devices.map((elm) => {
        let name = elm.name;
        let unit_of_meas = elm.unit_of_meas;
        let uniq_id = elm.uniq_id;
        let ids = elm.dev.ids;

        if ($dev_id == ids && elm.support) {
          $("<option>")
            .val(uniq_id)
            .text(name + (unit_of_meas ? ", " + unit_of_meas : ""))
            .appendTo(discovery);
          that.getUniqIdInput().append(discovery);

          if (!that.config.allow_out) {
            if (elm.homekit) {
              $.each(elm.homekit, function (index) {
                $("<option>")
                  .val(uniq_id + ":" + index)
                  .text(index + " (" + name + ")")
                  .appendTo(homekit);
                that.getUniqIdInput().append(homekit);
              });
            }
          }
        }
      });

      // if (that.config.allow_out) {
      //   that
      //     .getUniqIdInput()
      //     .prepend($("<option>").val("msg.topic").text("msg.topic"));
      // }

      that.getUniqIdInput().val($val).prop("disabled", false);
    }
  }

  getServerInput() {
    return $("#node-input-server");
  }

  getDevIdInput() {
    return $("#node-input-dev_id");
  }

  getUniqIdInput() {
    return $("#node-input-uniq_id");
  }

  getRefreshButton() {
    return $("#force-refresh");
  }
}
