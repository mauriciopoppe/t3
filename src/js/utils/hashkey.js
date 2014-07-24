var _ = require('lodash'),
  hidden = '__hashkey__';
module.exports = function (obj) {
  var uniqueId = obj;
  if (obj && (typeof obj === 'function' || typeof obj === 'object')) {
    if (!obj.hasOwnProperty(hidden)) {
      Object.defineProperty(obj, hidden, {
        value: _.uniqueId()
      });
    }
    uniqueId = obj[hidden];
  }
  return typeof obj + '-' + uniqueId;
};