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
  themes: {
    dark: require('./themes/dark'),
    light: require('./themes/light')
  },
  controller: {
    Application: Application,
    Keyboard: require('./controller/Keyboard'),
    LoopManager: require('./controller/LoopManager')
  },
  Application: Application,

  // alias
  run: Application.run
};
module.exports = t3;