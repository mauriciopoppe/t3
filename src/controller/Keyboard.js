/**
 * @module  controller/Keyboard
 */

/**
 * Keyboard helper
 * @class
 */
function Keyboard() {
  /**
   * Each index correspond to the ascii value of the
   * key pressed
   * @type {Array}
   */
  this.keys = [];
};

/**
 * Adds the keydown and keyup listeners
 */
Keyboard.prototype.init = function () {
  var me = this,
    i;
  for (i = 0; i < 256; i += 1) {
    me.keys[i] = false;
  }
  document.addEventListener('keydown', me.onKeyDown(), false);
  document.addEventListener('keyup', me.onKeyUp(), false);
};

/**
 * Sets `event.keycode` as a preseed key
 * @return {function}
 */
Keyboard.prototype.onKeyDown = function () {
  var me = this;
  return function (event) {
    me.keys[event.keyCode] = true;
  };
};

/**
 * Sets `event.keycode` as an unpressed key
 * @return {function}
 */
Keyboard.prototype.onKeyUp = function () {
  var me = this;
  return function (event) {
    me.keys[event.keyCode] = false;
  };
};

/**
 * Gets the pressed state of the key `key`
 * @param  {string} key
 * @return {boolean}
 */
Keyboard.prototype.get = function (key) {
  return this.keys[key.charCodeAt(0)];
};

/**
 * Sets the pressed state of the key `key` to `value`
 * @param {string} key
 * @param {boolean} value
 */
Keyboard.prototype.set = function (key, value) {
  this.keys[key.charCodeAt(0)] = value;
};

module.exports = Keyboard;