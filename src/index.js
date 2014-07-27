require('./lib/OrbitControls');

/**
 * t3
 * @namespace
 * @type {Object}
 */
var t3 = {
  model: {
    Coordinates: require('./model/Coordinates')
  },
  Application: require('./controller/Application')
};
module.exports = t3;