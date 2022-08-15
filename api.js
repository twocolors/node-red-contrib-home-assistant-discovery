module.exports = function (RED) {
  "use strict";

  const NODE_PATH = "/ha-discovery/";

  RED.httpAdmin.get(NODE_PATH + "getDevices", function (req, res) {
    let config = req.query;
    let serverNode = RED.nodes.getNode(config.serverNode);
    let force = config.forceRefresh
      ? ["1", "yes", "true", "on"].includes(config.forceRefresh.toLowerCase())
      : false;

    if (serverNode && serverNode.type == "ha-discovery") {
      serverNode.getDevices(function (items) {
        if (items) {
          res.json(items);
        } else {
          res.status(404).end();
        }
      }, force);
    } else {
      res.json([]);
    }
  });

  RED.httpAdmin.get(NODE_PATH + "*/*", function (req, res) {
    var options = {
      root: __dirname + "/resources/" + req.params[0] + "/",
      dotfiles: "deny",
    };
    res.sendFile(req.params[1], options);
  });
};
