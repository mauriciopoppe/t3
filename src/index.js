require('./lib/OrbitControls');

/**
 * t3
 * @namespace
 * @type {Object}
 */
var Application = require('./controller/Application');
var t3 = {
  model: {
    Coordinates: require('./model/Coordinates')
  },
  controller: {
    Application: Application,
    Keyboard: require('./controller/Keyboard'),
    LoopManager: require('./controller/LoopManager')
  },
  // it's better to use t3.run
  Application: Application,
  run: Application.run
};
module.exports = t3;