require('./lib/OrbitControls');

var extend = require('extend');

/**
 * t3
 * @namespace
 * @type {Object}
 */
var Application = require('./Application');
extend(Application, {
  model: {
    Coordinates: require('./model/Coordinates')
  },
  themes: require('./themes/')
});

module.exports = Application;