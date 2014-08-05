var THREE = require('THREE');
var Application = require('./Application');

/**
 * @module  controller/LoopManager
 */

/**
 * The loop managers controls the calls made to `requestAnimationFrame`
 * of an Application
 * @class
 * @param {controller/LoopManager} application Applicaton whose frame rate
 * will be controlled
 * @param {boolean} renderImmediately True to start the call
 * to request animation frame immediately
 */
function LoopManager(application, renderImmediately) {
  /**
   * Reference to the application
   * @type {controller/Application}
   */
  this.application = application;
  /**
   * Clock helper (its delta method is used to update the camera)
   * @type {THREE.Clock()}
   */
  this.clock = new THREE.Clock();
  /**
   * Toggle to pause the animation
   * @type {boolean}
   */
  this.pause = !renderImmediately;
  /**
   * Frames per second
   * @type {number}
   */
  this.fps = 60;

  /**
   * dat.gui folder objects
   * @type {Object}
   */
  this.guiControllers = {};
};

/**
 * Initializes a folder to control the frame rate and sets
 * the paused state of the app
 * @param  {dat.gui} gui
 * @return {this}
 */
LoopManager.prototype.initDatGui = function (gui) {
  var me = this,
      folder = gui.addFolder('Game Loop');
  folder
    .add(this, 'fps', 10, 60, 1)
    .name('Frame rate');
  
  me.guiControllers.pause = folder
    .add(this, 'pause')
    .name('Paused')
    .onFinishChange(function (paused) {
      if (!paused) {
        me.animate();
      }
      me.application.maskVisible(paused);
    });
  return this;
};

/**
 * Animation loop (calls application.update and application.render)
 * @return {this}
 */
LoopManager.prototype.animate = function () {
  var me = this,
    elapsedTime = 0,
    loop;

  loop = function () {
    if (me.pause) {
      return;
    }

    var delta = me.clock.getDelta(),
      frameRateInS = 1 / me.fps;

    // constraint delta to be <= frameRate
    // (to avoid frames with a big delta caused because of the app sent to sleep)
    delta = Math.min(delta, frameRateInS);
    elapsedTime += delta;

    if (elapsedTime >= frameRateInS) {

      // update the world and render its objects
      me.application.update(delta);
      me.application.render();

      elapsedTime -= frameRateInS;
    }

    // details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
    window.requestAnimationFrame(loop);
  };

  loop();

  return me;
};

/**
 * Starts the animation
 */
LoopManager.prototype.start = function () {
  var me = this;
  me.guiControllers.pause.setValue(false);
};

/**
 * Stops the animation
 */
LoopManager.prototype.stop = function () {
  var me = this;
  me.guiControllers.pause.setValue(true);
};

module.exports = LoopManager;