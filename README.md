# node-red-contrib-home-assistant-discovery

[![platform](https://img.shields.io/badge/platform-Node--RED-red?logo=nodered)](https://nodered.org)
[![Min Node Version](https://img.shields.io/node/v/node-red-contrib-home-assistant-discovery.svg)](https://nodejs.org/en/)
[![GitHub version](https://img.shields.io/github/package-json/v/twocolors/node-red-contrib-home-assistant-discovery?logo=npm)](https://www.npmjs.com/package/node-red-contrib-home-assistant-discovery)
[![GitHub stars](https://img.shields.io/github/stars/twocolors/node-red-contrib-home-assistant-discovery)](https://github.com/twocolors/node-red-contrib-home-assistant-discovery/stargazers)
[![Package Quality](https://packagequality.com/shield/node-red-contrib-home-assistant-discovery.svg)](https://packagequality.com/#?package=node-red-contrib-home-assistant-discovery)

[![issues](https://img.shields.io/github/issues/twocolors/node-red-contrib-home-assistant-discovery?logo=github)](https://github.com/twocolors/node-red-contrib-home-assistant-discovery/issues)
![GitHub last commit](https://img.shields.io/github/last-commit/twocolors/node-red-contrib-home-assistant-discovery)
![NPM Total Downloads](https://img.shields.io/npm/dt/node-red-contrib-home-assistant-discovery.svg)
![NPM Downloads per month](https://img.shields.io/npm/dm/node-red-contrib-home-assistant-discovery)
![Repo size](https://img.shields.io/github/repo-size/twocolors/node-red-contrib-home-assistant-discovery)

## About

Nodes for controlling Home Assistant MQTT Discovery devices in Node-RED

More informations about [MQTT Discovery](https://www.home-assistant.io/docs/mqtt/discovery/)

Available nodes are:
* ha-discovery-in
* ha-discovery-out

Support components (list test):
* switch (ESPHome)
* sensor (ESPHome, Zigbee2MQTT)
* binary_sensor (Zigbee2MQTT)

## Changelog

### 0.0.6
- fix "homekit NO_RESPONSE"

### 0.0.5
- fix "start up message"
- fix 404 error on get list devices
- node name if empty

### 0.0.3
- tiny png image for README
- save value if not response list devices
- more examples
- support NO_RESPONSE on HomeKit device
- support Binary Sensor (test in Zigbee2MQTT on MCCGQ01LM)

## Pictures

<img src="https://github.com/twocolors/node-red-contrib-home-assistant-discovery/raw/main/readme/flow.png">
<img src="https://github.com/twocolors/node-red-contrib-home-assistant-discovery/raw/main/readme/server.png">
<img src="https://github.com/twocolors/node-red-contrib-home-assistant-discovery/raw/main/readme/in.png">
<img src="https://github.com/twocolors/node-red-contrib-home-assistant-discovery/raw/main/readme/out.png">
