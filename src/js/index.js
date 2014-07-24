require('./lib/OrbitControls');

var T3 = {
  model: {
    Coordinates: require('./model/Coordinates')
  },
  Application: require('./controller/Application')
};
window.T3 = T3;
module.exports = T3;