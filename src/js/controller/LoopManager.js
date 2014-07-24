var THREE = require('THREE');
var Application = require('./Application');

function LoopManager(application, renderImmediately) {
  /**
   * Reference to the application
   * @type {Application}
   */
  this.application = application;
  /**
   * Clock helper (its delta method is used to update the camera)
   */
  this.clock = new THREE.Clock();
  /**
   * Toggle to pause the animation
   */
  this.pause = !renderImmediately;
  /**
   * Frames per second
   */
  this.fps = 60;

  /**
   * dat.gui folder reference
   * @type {dat.gui}
   */
  this.guiControllers = {};
}

LoopManager.prototype = {
  constructor: LoopManager,

  initDatGui: function (gui) {
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
  },

  /**
   * Animation loop (calls application.update and application.render)
   */
  animate: function () {
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

      // loop on request animation loop
      // - see details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
      window.requestAnimationFrame(loop);
    };

    loop();

    return me;
  },

  start: function () {
    var me = this;
    me.guiControllers.pause.setValue(false);
  },

  stop: function () {
    var me = this;
    me.guiControllers.pause.setValue(true);
  }
};

module.exports = LoopManager;