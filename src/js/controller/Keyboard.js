function Keyboard() {
  this.keys = [];
}

Keyboard.prototype = {
  init: function (options) {
    var me = this,
      i;
    for (i = 0; i < 256; i += 1) {
      me.keys[i] = false;
    }
    document.addEventListener('keydown', me.onKeyDown(), false);
    document.addEventListener('keyup', me.onKeyUp(), false);
  },

  onKeyDown: function () {
    var me = this;
    return function (event) {
      me.keys[event.keyCode] = true;
    };
  },

  onKeyUp: function () {
    var me = this;
    return function (event) {
      me.keys[event.keyCode] = false;
    };
  },

  get: function (key) {
    return this.keys[key.charCodeAt(0)];
  },

  set: function (key, value) {
    this.keys[key.charCodeAt(0)] = value;
  }
};

module.exports = Keyboard;