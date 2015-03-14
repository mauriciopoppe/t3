!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.t3=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;
var undefined;

var isPlainObject = function isPlainObject(obj) {
	'use strict';
	if (!obj || toString.call(obj) !== '[object Object]') {
		return false;
	}

	var has_own_constructor = hasOwn.call(obj, 'constructor');
	var has_is_property_of_method = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !has_own_constructor && !has_is_property_of_method) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {}

	return key === undefined || hasOwn.call(obj, key);
};

module.exports = function extend() {
	'use strict';
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target === copy) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if (deep && copy && (isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
					if (copyIsArray) {
						copyIsArray = false;
						clone = src && Array.isArray(src) ? src : [];
					} else {
						clone = src && isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[name] = extend(deep, clone, copy);

				// Don't bring in undefined values
				} else if (copy !== undefined) {
					target[name] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{}],2:[function(_dereq_,module,exports){
(function (global){
'use strict';

var assert = function (condition, message) {
  if (!condition) {
    throw message || 'assertion failed';
  }
};

var emptyFn = function () {};
var extend = _dereq_('extend');
var Stats = _dereq_('T3.Stats');
var dat = _dereq_('T3.dat');
var THREE = (typeof window !== "undefined" ? window.THREE : typeof global !== "undefined" ? global.THREE : null);

var Coordinates = _dereq_('../model/Coordinates');
var Keyboard = _dereq_('./Keyboard');
var LoopManager = _dereq_('./LoopManager');
var THREEx = _dereq_('../lib/THREEx/');
/**
 * @module controller/Application
 */

/**
 * Each instance controls one element of the DOM, besides creating
 * the canvas for the three.js app it creates a dat.gui instance
 * (to control objects of the app with a gui) and a Stats instance
 * (to view the current framerate)
 *
 * @class
 * @param {Object} config An object containing the following:
 * @param {string} [config.id=null] The id of the DOM element to inject the elements to
 * @param {number} [config.width=window.innerWidth]
 * The width of the canvas
 * @param {number} [config.height=window.innerHeight]
 * The height of the canvas
 * @param {boolean} [config.renderImmediately=true]
 * False to disable the game loop when the application starts, if
 * you want to resume the loop call `application.loopManager.start()`
 * @param {boolean} [config.injectCache=false]
 * True to add a wrapper over `THREE.Object3D.prototype.add` and
 * `THREE.Object3D.prototype.remove` so that it catches the last element
 * and perform additional operations over it, with this mechanism
 * we allow the application to have an internal cache of the elements of
 * the application
 * @param {boolean} [config.fullScreen=false]
 * True to make this app fullscreen adding additional support for
 * window resize events
 * @param {string} [config.theme='dark']
 * Theme used in the default scene, it can be `light` or `dark`
 * @param {object} [config.ambientConfig={}]
 * Additional configuration for the ambient, see the class {@link
 * Coordinates}
 * @param {object} [config.defaultSceneConfig={}] Additional config
 * for the default scene created for this world
 */
function Application(config) {
  config = extend({
    selector: null,
    width: window.innerWidth,
    height: window.innerHeight,
    renderImmediately: true,
    injectCache: false,
    fullScreen: false,
    theme: 'dark',
    helpersConfig: {},
    defaultSceneConfig: {
      fog: true
    }
  }, config);

  this.initialConfig = config;

  /**
   * Scenes in this world, each scene should be mapped with
   * a unique id
   * @type {Object}
   */
  this.scenes = {};

  /**
   * The active scene of this world
   * @type {THREE.Scene}
   */
  this.activeScene = null;

  /**
   * Reference to the cameras used in this world
   * @type {Array}
   */
  this.cameras = {};

  /**
   * The world can have many cameras, so the this is a reference to
   * the active camera that's being used right now
   * @type {T3.model.Camera}
   */
  this.activeCamera = null;

  /**
   * THREE Renderer
   * @type {Object}
   */
  this.renderer = null;

  /**
   * Keyboard manager
   * @type {Object}
   */
  this.keyboard = null;

  /**
   * Dat gui manager
   * @type {Object}
   */
  this.datgui = null;

  /**
   * Reference to the Stats instance (needed to call update
   * on the method {@link module:controller/Application#update})
   * @type {Object}
   */
  this.stats = null;

  /**
   * Reference to the local loop manager
   * @type {LoopManager}
   */
  this.loopManager = null;

  /**
   * Colors for the default scene
   * @type {Object}
   */
  this.theme = null;

  /**
   * Application cache
   * @type {Object}
   */
  this.__t3cache__ = {};

  Application.prototype.initApplication.call(this);
}

/**
 * Getter for the initial config
 * @return {Object}
 */
Application.prototype.getConfig = function () {
  return this.initialConfig;
};

/**
 * Bootstrap the application with the following steps:
 *
 * - Enabling cache injection
 * - Set the theme
 * - Create the renderer, default scene, default camera, some random lights
 * - Initializes dat.gui, Stats, a mask when the application is paised
 * - Initializes fullScreen events, keyboard and some helper objects
 * - Calls the game loop
 *
 */
Application.prototype.initApplication = function () {
  var me = this,
    config = me.getConfig();

  me.injectCache(config.injectCache);

  // theme
  me.setTheme(config.theme);

  // defaults
  me.createDefaultRenderer();
  me.createDefaultScene();
  me.createDefaultCamera();
  me.createDefaultLights();

  // utils
  me.initDatGui();
  me.initStats();
  me.initMask()
    .maskVisible(!config.renderImmediately);
  me.initFullScreen();
  me.initKeyboard();
  me.initCoordinates();

  // game loop
  me.gameLoop();
};

/**
 * Sets the active scene (it must be a registered scene registered
 * with {@link #addScene})
 * @param {string} key The string which was used to register the scene
 * @return {this}
 */
Application.prototype.setActiveScene = function (key) {
  this.activeScene = this.scenes[key];
  return this;
};

/**
 * Adds a scene to the scene pool
 * @param {THREE.Scene} scene
 * @param {string} key
 * @return {this}
 */
Application.prototype.addScene = function (scene, key) {
  console.assert(scene instanceof THREE.Scene);
  this.scenes[key] = scene;
  return this;
};

/**
 * Creates a scene called 'default' and sets it as the active one
 * @return {this}
 */
Application.prototype.createDefaultScene = function () {
  var me = this,
    config = me.getConfig(),
    defaultScene = new THREE.Scene();
  if (config.defaultSceneConfig.fog) {
    defaultScene.fog = new THREE.Fog(me.theme.fogColor, 2000, 4000);
  }
  me
    .addScene(defaultScene, 'default')
    .setActiveScene('default');
  return me;
};

/**
 * Creates the default THREE.WebGLRenderer used in the world
 * @return {this}
 */
Application.prototype.createDefaultRenderer = function () {
  var me = this,
    config = me.getConfig();
  var renderer = new THREE.WebGLRenderer({
//      antialias: true
  });
  renderer.setClearColor(me.theme.clearColor, 1);
  renderer.setSize(config.width, config.height);
  document
    .querySelector(config.selector)
    .appendChild(renderer.domElement);
  me.renderer = renderer;
  return me;
};

Application.prototype.setActiveCamera = function (key) {
  this.activeCamera = this.cameras[key];
  return this;
};

Application.prototype.addCamera = function (camera, key) {
  console.assert(camera instanceof THREE.PerspectiveCamera ||
    camera instanceof THREE.OrthographicCamera);
  this.cameras[key] = camera;
  return this;
};

/**
 * Create the default camera used in this world which is
 * a `THREE.PerspectiveCamera`, it also adds orbit controls
 * by calling {@link #createCameraControls}
 */
Application.prototype.createDefaultCamera = function () {
  var me = this,
    config = me.getConfig(),
    width = config.width,
    height = config.height,
    defaults = {
      fov: 38,
      ratio: width / height,
      near: 1,
      far: 10000
    },
    defaultCamera;

  defaultCamera = new THREE.PerspectiveCamera(
    defaults.fov,
    defaults.ratio,
    defaults.near,
    defaults.far
  );
  defaultCamera.position.set(500, 300, 500);

  // transparently support window resize
  if (config.fullScreen) {
    THREEx.WindowResize.bind(me.renderer, defaultCamera);
  }

  me
    .createCameraControls(defaultCamera)
    .addCamera(defaultCamera, 'default')
    .setActiveCamera('default');

  return me;
};

/**
 * Creates OrbitControls over the `camera` passed as param
 * @param  {THREE.PerspectiveCamera|THREE.OrtographicCamera} camera
 * @return {this}
 */
Application.prototype.createCameraControls = function (camera) {
  var me = this;
  camera.cameraControls = new THREE.OrbitControls(
    camera,
    me.renderer.domElement
  );
  // avoid panning to see the bottom face
  //camera.cameraControls.maxPolarAngle = Math.PI / 2 * 0.99;
  //camera.cameraControls.target.set(100, 100, 100);
  camera.cameraControls.target.set(0, 0, 0);
  return me;
};

/**
 * Creates some random lights in the default scene
 * @return {this}
 */
Application.prototype.createDefaultLights = function () {
  var light,
      scene = this.scenes['default'];

  light = new THREE.AmbientLight(0x222222);
  scene.add(light).cache('ambient-light-1');

  light = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
  light.position.set( 200, 400, 500 );
  scene.add(light).cache('directional-light-1');

  light = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
  light.position.set( -500, 250, -200 );
  scene.add(light).cache('directional-light-2');

  return this;
};

/**
 * Sets the theme to be used in the default scene
 * @param {string} name Either the string `dark` or `light`
 * @todo Make the theme system extensible
 * @return {this}
 */
Application.prototype.setTheme = function (name) {
  var me = this,
    themes = _dereq_('../').themes;
  assert(themes[name]);
  me.theme = themes[name];
  return me;
};

/**
 * Creates a mask on top of the canvas when it's paused
 * @return {this}
 */
Application.prototype.initMask = function () {
  var me = this,
    config = me.getConfig(),
    mask,
    hidden;
  mask = document.createElement('div');
  mask.className = 't3-mask';
  // mask.style.display = 'none';
  mask.style.position = 'absolute';
  mask.style.top = '0px';
  mask.style.width = '100%';
  mask.style.height = '100%';
  mask.style.background = 'rgba(0,0,0,0.5)';

  document
    .querySelector(config.selector)
    .appendChild(mask);

  me.mask = mask;
  return me;
};

/**
 * Updates the mask visibility
 * @param  {boolean} v True to make it visible
 */
Application.prototype.maskVisible = function (v) {
  var mask = this.mask;
  mask.style.display = v ? 'block' : 'none';
};

/**
 * Inits the dat.gui helper which is placed under the
 * DOM element identified by the initial configuration selector
 * @return {this}
 */
Application.prototype.initDatGui = function () {
  var me = this,
    config = me.getConfig(),
    gui = new dat.GUI({
      autoPlace: false
    });

  extend(gui.domElement.style, {
    position: 'absolute',
    top: '0px',
    right: '0px',
    zIndex: '1'
  });
  document
    .querySelector(config.selector)
    .appendChild(gui.domElement);
  me.datgui = gui;
  return me;
};

/**
 * Init the Stats helper which is placed under the
 * DOM element identified by the initial configuration selector
 * @return {this}
 */
Application.prototype.initStats = function () {
  var me = this,
    config = me.getConfig(),
    stats;
  // add Stats.js - https://github.com/mrdoob/stats.js
  stats = new Stats();
  extend(stats.domElement.style, {
    position: 'absolute',
    zIndex: 1,
    bottom: '0px'
  });
  document
    .querySelector(config.selector)
    .appendChild( stats.domElement );
  me.stats = stats;
  return me;
};

/**
 * Binds the F key to make a world go full screen
 * @todo This should be used only when the canvas is active
 */
Application.prototype.initFullScreen = function () {
  var config = this.getConfig();
  // allow 'f' to go fullscreen where this feature is supported
  if(config.fullScreen && THREEx.FullScreen.available()) {
    THREEx.FullScreen.bindKey();
  }
};

/**
 * Initializes the coordinate helper (its wrapped in a model in T3)
 */
Application.prototype.initCoordinates = function () {
  var config = this.getConfig();
  this.scenes['default']
    .add(
      new Coordinates(config.helpersConfig, this.theme)
        .initDatGui(this.datgui)
        .mesh
    );
};

/**
 * Initis the keyboard helper
 * @return {this}
 */
Application.prototype.initKeyboard = function () {
  this.keyboard = new Keyboard();
  return this;
};

/**
 * Initializes the game loop by creating an instance of {@link LoopManager}
 * @return {this}
 */
Application.prototype.gameLoop = function () {
  var config = this.getConfig();
  this.loopManager = new LoopManager(this, config.renderImmediately)
    .initDatGui(this.datgui)
    .animate();
  return this;
};

/**
 * Update phase, the world updates by default:
 *
 * - The stats helper
 * - The camera controls if the active camera has one
 *
 * @param {number} delta The number of seconds elapsed
 */
Application.prototype.update = function (delta) {
  var me = this;

  // stats helper
  me.stats.update();

  // camera update
  if (me.activeCamera.cameraControls) {
    me.activeCamera.cameraControls.update(delta);
  }
};

/**
 * Render phase, calls `this.renderer` with `this.activeScene` and
 * `this.activeCamera`
 */
Application.prototype.render = function () {
  var me = this;
  me.renderer.render(
    me.activeScene,
    me.activeCamera
  );
};

/**
 * Wraps `THREE.Object3D.prototype.add` and `THREE.Object3D.prototype.remove`
 * with functions that save the last object which `add` or `remove` have been
 * called with, this allows to call the method `cache` which will cache
 * the object with an identifier allowing fast object retrieval
 *
 * @example
 *
 *   var instance = t3.Application.run({
 *     injectCache: true,
 *     init: function () {
 *       var group = new THREE.Object3D();
 *       var innerGroup = new THREE.Object3D();
 *
 *       var geometry = new THREE.BoxGeometry(1,1,1);
 *       var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
 *       var cube = new THREE.Mesh(geometry, material);
 *
 *       innerGroup
 *         .add(cube)
 *         .cache('myCube');
 *
 *       group
 *         .add(innerGroup)
 *         .cache('innerGroup');
 *
 *       // removal example
 *       // group
 *       //   .remove(innerGroup)
 *       //   .cache();
 *
 *       this.activeScene
 *         .add(group)
 *         .cache('group');
 *     },
 *
 *     update: function (delta) {
 *       var cube = this.getFromCache('myCube');
 *       // perform operations on the cube
 *     }
 *   });
 *
 * @param  {boolean} inject True to enable this behavior
 */
Application.prototype.injectCache = function (inject) {
  var me = this,
      lastObject,
      lastMethod,
      add = THREE.Object3D.prototype.add,
      remove = THREE.Object3D.prototype.remove,
      cache = this.__t3cache__;

  if (inject) {
    THREE.Object3D.prototype.add = function (object) {
      lastMethod = 'add';
      lastObject = object;
      return add.apply(this, arguments);
    };

    THREE.Object3D.prototype.remove = function (object) {
      lastMethod = 'remove';
      lastObject = object;
      return remove.apply(this, arguments);
    };

    THREE.Object3D.prototype.cache = function (name) {
      assert(lastObject, 'T3.Application.prototype.cache: this method' +
        ' needs a previous call to add/remove');
      if (lastMethod === 'add') {
        lastObject.name = lastObject.name || name;
        assert(lastObject.name);
        cache[lastObject.name] = lastObject;
      } else {
        assert(lastObject.name);
        delete cache[lastObject.name];
      }
      lastObject = null;
      return me;
    };
  } else {
    THREE.Object3D.prototype.cache = function () {
      return this;
    };
  }
};

/**
 * Gets an object from the cache if `injectCache` was enabled and
 * an object was registered with {@link #cache}
 * @param  {string} name
 * @return {THREE.Object3D}
 */
Application.prototype.getFromCache = function (name) {
  return this.__t3cache__[name];
};

/**
 * @static
 * Creates a subclass of Application whose instances don't need to
 * worry about the inheritance process
 * @param  {Object} options The same object passed to the {@link Application}
 * constructor
 * @param {Object} options.init Initialization phase, function called in
 * the constructor of the subclass
 * @param {Object} options.update Update phase, function called as the
 * update function of the subclass, it also calls Application's update
 * @return {t3.QuickLaunch} An instance of the subclass created in
 * this function
 */
Application.run = function (options) {
  options.init = options.init || emptyFn;
  options.update = options.update || emptyFn;
  assert(options.selector, 'canvas selector required');

  var QuickLaunch = function (options) {
    Application.call(this, options);
    options.init.call(this, options);
  };
  QuickLaunch.prototype = Object.create(Application.prototype);

  QuickLaunch.prototype.update = function (delta) {
    Application.prototype.update.call(this, delta);
    options.update.call(this, delta);
  };

  return new QuickLaunch(options);
};

module.exports = Application;
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../":5,"../lib/THREEx/":9,"../model/Coordinates":12,"./Keyboard":3,"./LoopManager":4,"T3.Stats":11,"T3.dat":10,"extend":1}],3:[function(_dereq_,module,exports){
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
}

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
},{}],4:[function(_dereq_,module,exports){
(function (global){
var THREE = (typeof window !== "undefined" ? window.THREE : typeof global !== "undefined" ? global.THREE : null);
var Application = _dereq_('./Application');

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
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Application":2}],5:[function(_dereq_,module,exports){
_dereq_('./lib/OrbitControls');

/**
 * t3
 * @namespace
 * @type {Object}
 */
var Application = _dereq_('./controller/Application');
var t3 = {
  model: {
    Coordinates: _dereq_('./model/Coordinates')
  },
  themes: {
    dark: _dereq_('./themes/dark'),
    'default': _dereq_('./themes/default'),
    light: _dereq_('./themes/light')
  },
  controller: {
    Application: Application,
    Keyboard: _dereq_('./controller/Keyboard'),
    LoopManager: _dereq_('./controller/LoopManager')
  },
  Application: Application,

  // alias
  run: Application.run
};
module.exports = t3;
},{"./controller/Application":2,"./controller/Keyboard":3,"./controller/LoopManager":4,"./lib/OrbitControls":6,"./model/Coordinates":12,"./themes/dark":13,"./themes/default":14,"./themes/light":15}],6:[function(_dereq_,module,exports){
/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */
/*global THREE, console */

// This set of controls performs orbiting, dollying (zooming), and panning. It maintains
// the "up" direction as +Y, unlike the TrackballControls. Touch on tablet and phones is
// supported.
//
//    Orbit - left mouse / touch: one finger move
//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
//    Pan - right mouse, or arrow keys / touch: three finter swipe
//
// This is a drop-in replacement for (most) TrackballControls used in examples.
// That is, include this js file and wherever you see:
//    	controls = new THREE.TrackballControls( camera );
//      controls.target.z = 150;
// Simple substitute "OrbitControls" and the control should work as-is.

THREE.OrbitControls = function ( object, domElement ) {

	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// API

	// Set to false to disable this control
	this.enabled = true;

	// "target" sets the location of focus, where the control orbits around
	// and where it pans with respect to.
	this.target = new THREE.Vector3();

	// center is old, deprecated; use "target" instead
	this.center = this.target;

	// This option actually enables dollying in and out; left as "zoom" for
	// backwards compatibility
	this.noZoom = false;
	this.zoomSpeed = 1.0;

	// Limits to how far you can dolly in and out
	this.minDistance = 0;
	this.maxDistance = Infinity;

	// Set to true to disable this control
	this.noRotate = false;
	this.rotateSpeed = 1.0;

	// Set to true to disable this control
	this.noPan = false;
	this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

	// Set to true to automatically rotate around the target
	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	// How far you can orbit vertically, upper and lower limits.
	// Range is 0 to Math.PI radians.
	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians

	// Set to true to disable use of the keys
	this.noKeys = false;

	// The four arrow keys
	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

	////////////
	// internals

	var scope = this;

	var EPS = 0.000001;

	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();

	var panStart = new THREE.Vector2();
	var panEnd = new THREE.Vector2();
	var panDelta = new THREE.Vector2();
	var panOffset = new THREE.Vector3();

	var offset = new THREE.Vector3();

	var dollyStart = new THREE.Vector2();
	var dollyEnd = new THREE.Vector2();
	var dollyDelta = new THREE.Vector2();

	var phiDelta = 0;
	var thetaDelta = 0;
	var scale = 1;
	var pan = new THREE.Vector3();

	var lastPosition = new THREE.Vector3();
	var lastQuaternion = new THREE.Quaternion();

	var STATE = { NONE : -1, ROTATE : 0, DOLLY : 1, PAN : 2, TOUCH_ROTATE : 3, TOUCH_DOLLY : 4, TOUCH_PAN : 5 };

	var state = STATE.NONE;

	// for reset

	this.target0 = this.target.clone();
	this.position0 = this.object.position.clone();

	// so camera.up is the orbit axis

	var quat = new THREE.Quaternion().setFromUnitVectors( object.up, new THREE.Vector3( 0, 1, 0 ) );
	var quatInverse = quat.clone().inverse();

	// events

	var changeEvent = { type: 'change' };
	var startEvent = { type: 'start'};
	var endEvent = { type: 'end'};

	this.rotateLeft = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		thetaDelta -= angle;

	};

	this.rotateUp = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		phiDelta -= angle;

	};

	// pass in distance in world space to move left
	this.panLeft = function ( distance ) {

		var te = this.object.matrix.elements;

		// get X column of matrix
		panOffset.set( te[ 0 ], te[ 1 ], te[ 2 ] );
		panOffset.multiplyScalar( - distance );
		
		pan.add( panOffset );

	};

	// pass in distance in world space to move up
	this.panUp = function ( distance ) {

		var te = this.object.matrix.elements;

		// get Y column of matrix
		panOffset.set( te[ 4 ], te[ 5 ], te[ 6 ] );
		panOffset.multiplyScalar( distance );
		
		pan.add( panOffset );

	};
	
	// pass in x,y of change desired in pixel space,
	// right and down are positive
	this.pan = function ( deltaX, deltaY ) {

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		if ( scope.object.fov !== undefined ) {

			// perspective
			var position = scope.object.position;
			var offset = position.clone().sub( scope.target );
			var targetDistance = offset.length();

			// half of the fov is center to top of screen
			targetDistance *= Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 );

			// we actually don't use screenWidth, since perspective camera is fixed to screen height
			scope.panLeft( 2 * deltaX * targetDistance / element.clientHeight );
			scope.panUp( 2 * deltaY * targetDistance / element.clientHeight );

		} else if ( scope.object.top !== undefined ) {

			// orthographic
			scope.panLeft( deltaX * (scope.object.right - scope.object.left) / element.clientWidth );
			scope.panUp( deltaY * (scope.object.top - scope.object.bottom) / element.clientHeight );

		} else {

			// camera neither orthographic or perspective
			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );

		}

	};

	this.dollyIn = function ( dollyScale ) {

		if ( dollyScale === undefined ) {

			dollyScale = getZoomScale();

		}

		scale /= dollyScale;

	};

	this.dollyOut = function ( dollyScale ) {

		if ( dollyScale === undefined ) {

			dollyScale = getZoomScale();

		}

		scale *= dollyScale;

	};

	this.update = function () {

		var position = this.object.position;

		offset.copy( position ).sub( this.target );

		// rotate offset to "y-axis-is-up" space
		offset.applyQuaternion( quat );

		// angle from z-axis around y-axis

		var theta = Math.atan2( offset.x, offset.z );

		// angle from y-axis

		var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

		if ( this.autoRotate ) {

			this.rotateLeft( getAutoRotationAngle() );

		}

		theta += thetaDelta;
		phi += phiDelta;

		// restrict phi to be between desired limits
		phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, phi ) );

		// restrict phi to be betwee EPS and PI-EPS
		phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

		var radius = offset.length() * scale;

		// restrict radius to be between desired limits
		radius = Math.max( this.minDistance, Math.min( this.maxDistance, radius ) );
		
		// move target to panned location
		this.target.add( pan );

		offset.x = radius * Math.sin( phi ) * Math.sin( theta );
		offset.y = radius * Math.cos( phi );
		offset.z = radius * Math.sin( phi ) * Math.cos( theta );

		// rotate offset back to "camera-up-vector-is-up" space
		offset.applyQuaternion( quatInverse );

		position.copy( this.target ).add( offset );

		this.object.lookAt( this.target );

		thetaDelta = 0;
		phiDelta = 0;
		scale = 1;
		pan.set( 0, 0, 0 );

		// update condition is:
		// min(camera displacement, camera rotation in radians)^2 > EPS
		// using small-angle approximation cos(x/2) = 1 - x^2 / 8

		if ( lastPosition.distanceToSquared( this.object.position ) > EPS
		    || 8 * (1 - lastQuaternion.dot(this.object.quaternion)) > EPS ) {

			this.dispatchEvent( changeEvent );

			lastPosition.copy( this.object.position );
			lastQuaternion.copy (this.object.quaternion );

		}

	};


	this.reset = function () {

		state = STATE.NONE;

		this.target.copy( this.target0 );
		this.object.position.copy( this.position0 );

		this.update();

	};

	function getAutoRotationAngle() {

		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

	}

	function getZoomScale() {

		return Math.pow( 0.95, scope.zoomSpeed );

	}

	function onMouseDown( event ) {

		if ( scope.enabled === false ) return;
		event.preventDefault();

		if ( event.button === 0 ) {
			if ( scope.noRotate === true ) return;

			state = STATE.ROTATE;

			rotateStart.set( event.clientX, event.clientY );

		} else if ( event.button === 1 ) {
			if ( scope.noZoom === true ) return;

			state = STATE.DOLLY;

			dollyStart.set( event.clientX, event.clientY );

		} else if ( event.button === 2 ) {
			if ( scope.noPan === true ) return;

			state = STATE.PAN;

			panStart.set( event.clientX, event.clientY );

		}

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseup', onMouseUp, false );
		scope.dispatchEvent( startEvent );

	}

	function onMouseMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		if ( state === STATE.ROTATE ) {

			if ( scope.noRotate === true ) return;

			rotateEnd.set( event.clientX, event.clientY );
			rotateDelta.subVectors( rotateEnd, rotateStart );

			// rotating across whole screen goes 360 degrees around
			scope.rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );

			// rotating up and down along whole screen attempts to go 360, but limited to 180
			scope.rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

			rotateStart.copy( rotateEnd );

		} else if ( state === STATE.DOLLY ) {

			if ( scope.noZoom === true ) return;

			dollyEnd.set( event.clientX, event.clientY );
			dollyDelta.subVectors( dollyEnd, dollyStart );

			if ( dollyDelta.y > 0 ) {

				scope.dollyIn();

			} else {

				scope.dollyOut();

			}

			dollyStart.copy( dollyEnd );

		} else if ( state === STATE.PAN ) {

			if ( scope.noPan === true ) return;

			panEnd.set( event.clientX, event.clientY );
			panDelta.subVectors( panEnd, panStart );
			
			scope.pan( panDelta.x, panDelta.y );

			panStart.copy( panEnd );

		}

		scope.update();

	}

	function onMouseUp( /* event */ ) {

		if ( scope.enabled === false ) return;

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );
		scope.dispatchEvent( endEvent );
		state = STATE.NONE;

	}

	function onMouseWheel( event ) {

		if ( scope.enabled === false || scope.noZoom === true ) return;

		event.preventDefault();
		event.stopPropagation();

		var delta = 0;

		if ( event.wheelDelta !== undefined ) { // WebKit / Opera / Explorer 9

			delta = event.wheelDelta;

		} else if ( event.detail !== undefined ) { // Firefox

			delta = - event.detail;

		}

		if ( delta > 0 ) {

			scope.dollyOut();

		} else {

			scope.dollyIn();

		}

		scope.update();
		scope.dispatchEvent( startEvent );
		scope.dispatchEvent( endEvent );

	}

	function onKeyDown( event ) {

		if ( scope.enabled === false || scope.noKeys === true || scope.noPan === true ) return;
		
		switch ( event.keyCode ) {

			case scope.keys.UP:
				scope.pan( 0, scope.keyPanSpeed );
				scope.update();
				break;

			case scope.keys.BOTTOM:
				scope.pan( 0, - scope.keyPanSpeed );
				scope.update();
				break;

			case scope.keys.LEFT:
				scope.pan( scope.keyPanSpeed, 0 );
				scope.update();
				break;

			case scope.keys.RIGHT:
				scope.pan( - scope.keyPanSpeed, 0 );
				scope.update();
				break;

		}

	}

	function touchstart( event ) {

		if ( scope.enabled === false ) return;

		switch ( event.touches.length ) {

			case 1:	// one-fingered touch: rotate

				if ( scope.noRotate === true ) return;

				state = STATE.TOUCH_ROTATE;

				rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				break;

			case 2:	// two-fingered touch: dolly

				if ( scope.noZoom === true ) return;

				state = STATE.TOUCH_DOLLY;

				var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
				var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
				var distance = Math.sqrt( dx * dx + dy * dy );
				dollyStart.set( 0, distance );
				break;

			case 3: // three-fingered touch: pan

				if ( scope.noPan === true ) return;

				state = STATE.TOUCH_PAN;

				panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				break;

			default:

				state = STATE.NONE;

		}

		scope.dispatchEvent( startEvent );

	}

	function touchmove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		switch ( event.touches.length ) {

			case 1: // one-fingered touch: rotate

				if ( scope.noRotate === true ) return;
				if ( state !== STATE.TOUCH_ROTATE ) return;

				rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				rotateDelta.subVectors( rotateEnd, rotateStart );

				// rotating across whole screen goes 360 degrees around
				scope.rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );
				// rotating up and down along whole screen attempts to go 360, but limited to 180
				scope.rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

				rotateStart.copy( rotateEnd );

				scope.update();
				break;

			case 2: // two-fingered touch: dolly

				if ( scope.noZoom === true ) return;
				if ( state !== STATE.TOUCH_DOLLY ) return;

				var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
				var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
				var distance = Math.sqrt( dx * dx + dy * dy );

				dollyEnd.set( 0, distance );
				dollyDelta.subVectors( dollyEnd, dollyStart );

				if ( dollyDelta.y > 0 ) {

					scope.dollyOut();

				} else {

					scope.dollyIn();

				}

				dollyStart.copy( dollyEnd );

				scope.update();
				break;

			case 3: // three-fingered touch: pan

				if ( scope.noPan === true ) return;
				if ( state !== STATE.TOUCH_PAN ) return;

				panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				panDelta.subVectors( panEnd, panStart );
				
				scope.pan( panDelta.x, panDelta.y );

				panStart.copy( panEnd );

				scope.update();
				break;

			default:

				state = STATE.NONE;

		}

	}

	function touchend( /* event */ ) {

		if ( scope.enabled === false ) return;

		scope.dispatchEvent( endEvent );
		state = STATE.NONE;

	}

	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	this.domElement.addEventListener( 'mousedown', onMouseDown, false );
	this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
	this.domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox

	this.domElement.addEventListener( 'touchstart', touchstart, false );
	this.domElement.addEventListener( 'touchend', touchend, false );
	this.domElement.addEventListener( 'touchmove', touchmove, false );

	window.addEventListener( 'keydown', onKeyDown, false );

	// force an update at start
	this.update();

};

THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );

},{}],7:[function(_dereq_,module,exports){
/**
 * @module  lib/THREEx/FullScreen
 */

/**
* This helper makes it easy to handle the fullscreen API:
* 
* - it hides the prefix for each browser
* - it hides the little discrepencies of the various vendor API
* - at the time of this writing (nov 2011) it is available in 
* 
*   [firefox nightly](http://blog.pearce.org.nz/2011/11/firefoxs-html-full-screen-api-enabled.html),
*   [webkit nightly](http://peter.sh/2011/01/javascript-full-screen-api-navigation-timing-and-repeating-css-gradients/) and
*   [chrome stable](http://updates.html5rocks.com/2011/10/Let-Your-Content-Do-the-Talking-Fullscreen-API).
* 
* @namespace
*/
var fullScreen = {};

/**
 * test if it is possible to have fullscreen
 * @returns {boolean} true if fullscreen API is available, false otherwise
 */
fullScreen.available = function () {
  return this._hasWebkitFullScreen || this._hasMozFullScreen;
};

/**
 * Test if fullscreen is currently activated
 * @returns {boolean} true if fullscreen is currently activated, false otherwise
 */
fullScreen.activated = function () {
  if (this._hasWebkitFullScreen) {
    return document.webkitIsFullScreen;
  } else if (this._hasMozFullScreen) {
    return document.mozFullScreen;
  } else {
    console.assert(false);
  }
};

/**
 * Request fullscreen on a given element
 * @param {DomElement} element to make fullscreen. optional. default to document.body
 */
fullScreen.request = function (element) {
  element = element || document.body;
  if (this._hasWebkitFullScreen) {
    element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
  } else if (this._hasMozFullScreen) {
    element.mozRequestFullScreen();
  } else {
    console.assert(false);
  }
};

/**
 * Cancel fullscreen
 */
fullScreen.cancel = function () {
  if (this._hasWebkitFullScreen) {
    document.webkitCancelFullScreen();
  } else if (this._hasMozFullScreen) {
    document.mozCancelFullScreen();
  } else {
    console.assert(false);
  }
};


// internal functions to know which fullscreen API implementation is available
fullScreen._hasWebkitFullScreen = 'webkitCancelFullScreen' in document ? true : false;
fullScreen._hasMozFullScreen = 'mozCancelFullScreen' in document ? true : false;

/**
 * Bind a key to renderer screenshot
 * @param {Object} opts
 * @param {Object} [opts.charcode=f]
 * @param {Object} [opts.dblClick=false] True to make it go
 * fullscreen on double click
 */
fullScreen.bindKey = function (opts) {
  opts = opts || {};
  var charCode = opts.charCode || 'f'.charCodeAt(0);
  var dblclick = opts.dblclick !== undefined ? opts.dblclick : false;
  var element = opts.element;

  var toggle = function () {
    if (fullScreen.activated()) {
      fullScreen.cancel();
    } else {
      fullScreen.request(element);
    }
  };

  // callback to handle keypress
  var __bind = function (fn, me) {
    return function () {
      return fn.apply(me, arguments);
    };
  };
  var onKeyPress = __bind(function (event) {
    // return now if the KeyPress isnt for the proper charCode
    if (event.which !== charCode) { return; }
    // toggle fullscreen
    toggle();
  }, this);

  // listen to keypress
  // NOTE: for firefox it seems mandatory to listen to document directly
  document.addEventListener('keypress', onKeyPress, false);
  // listen to dblclick
  dblclick && document.addEventListener('dblclick', toggle, false);

  return {
    unbind: function () {
      document.removeEventListener('keypress', onKeyPress, false);
      dblclick && document.removeEventListener('dblclick', toggle, false);
    }
  };
};

module.exports = fullScreen;
},{}],8:[function(_dereq_,module,exports){
/**
 * @module  lib/THREEx/WindowResize
 */

/**
 * This helper makes it easy to handle window resize.
 * It will update renderer and camera when window is resized.
 *
 * @example
 * // Start updating renderer and camera
 * var windowResize = WindowResize(aRenderer, aCamera);
 * //Start updating renderer and camera
 * windowResize.stop()
 *
 * @namespace
 * @param {Object} renderer the renderer to update
 * @param {Object} Camera the camera to update
 */
var windowResize = function (renderer, camera) {
	var callback = function() {
		// notify the renderer of the size change
		renderer.setSize( window.innerWidth, window.innerHeight );
		// update the camera
		camera.aspect	= window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
	};
	// bind the resize event
	window.addEventListener('resize', callback, false);
	// return .stop() the function to stop watching window resize
	return {
		stop	: function(){
			window.removeEventListener('resize', callback);
		}
	};
};

/**
 * @static
 * @param  {THREE.WebGLRenderer} renderer
 * @param  {THREE.PerspectiveCamera} camera
 * @return {Object}
 */
windowResize.bind	= function(renderer, camera){
	return windowResize(renderer, camera);
};

module.exports = windowResize;
},{}],9:[function(_dereq_,module,exports){
/**
 * @name THREEx
 * three.js extensions
 * @type {Object}
 */
module.exports = {
  WindowResize: _dereq_('./WindowResize'),
  FullScreen: _dereq_('./FullScreen')
};
},{"./FullScreen":7,"./WindowResize":8}],10:[function(_dereq_,module,exports){
(function (global){
;__browserify_shim_require__=_dereq_;(function browserifyShim(module, exports, _dereq_, define, browserify_shim__define__module__export__) {
/**
 * dat-gui JavaScript Controller Library
 * http://code.google.com/p/dat-gui
 *
 * Copyright 2011 Data Arts Team, Google Creative Lab
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */
var dat=dat||{};dat.gui=dat.gui||{};dat.utils=dat.utils||{};dat.controllers=dat.controllers||{};dat.dom=dat.dom||{};dat.color=dat.color||{};dat.utils.css=function(){return{load:function(e,a){var a=a||document,c=a.createElement("link");c.type="text/css";c.rel="stylesheet";c.href=e;a.getElementsByTagName("head")[0].appendChild(c)},inject:function(e,a){var a=a||document,c=document.createElement("style");c.type="text/css";c.innerHTML=e;a.getElementsByTagName("head")[0].appendChild(c)}}}();
dat.utils.common=function(){var e=Array.prototype.forEach,a=Array.prototype.slice;return{BREAK:{},extend:function(c){this.each(a.call(arguments,1),function(a){for(var f in a)this.isUndefined(a[f])||(c[f]=a[f])},this);return c},defaults:function(c){this.each(a.call(arguments,1),function(a){for(var f in a)this.isUndefined(c[f])&&(c[f]=a[f])},this);return c},compose:function(){var c=a.call(arguments);return function(){for(var d=a.call(arguments),f=c.length-1;f>=0;f--)d=[c[f].apply(this,d)];return d[0]}},
each:function(a,d,f){if(e&&a.forEach===e)a.forEach(d,f);else if(a.length===a.length+0)for(var b=0,n=a.length;b<n;b++){if(b in a&&d.call(f,a[b],b)===this.BREAK)break}else for(b in a)if(d.call(f,a[b],b)===this.BREAK)break},defer:function(a){setTimeout(a,0)},toArray:function(c){return c.toArray?c.toArray():a.call(c)},isUndefined:function(a){return a===void 0},isNull:function(a){return a===null},isNaN:function(a){return a!==a},isArray:Array.isArray||function(a){return a.constructor===Array},isObject:function(a){return a===
Object(a)},isNumber:function(a){return a===a+0},isString:function(a){return a===a+""},isBoolean:function(a){return a===false||a===true},isFunction:function(a){return Object.prototype.toString.call(a)==="[object Function]"}}}();
dat.controllers.Controller=function(e){var a=function(a,d){this.initialValue=a[d];this.domElement=document.createElement("div");this.object=a;this.property=d;this.__onFinishChange=this.__onChange=void 0};e.extend(a.prototype,{onChange:function(a){this.__onChange=a;return this},onFinishChange:function(a){this.__onFinishChange=a;return this},setValue:function(a){this.object[this.property]=a;this.__onChange&&this.__onChange.call(this,a);this.updateDisplay();return this},getValue:function(){return this.object[this.property]},
updateDisplay:function(){return this},isModified:function(){return this.initialValue!==this.getValue()}});return a}(dat.utils.common);
dat.dom.dom=function(e){function a(b){if(b==="0"||e.isUndefined(b))return 0;b=b.match(d);return!e.isNull(b)?parseFloat(b[1]):0}var c={};e.each({HTMLEvents:["change"],MouseEvents:["click","mousemove","mousedown","mouseup","mouseover"],KeyboardEvents:["keydown"]},function(b,a){e.each(b,function(b){c[b]=a})});var d=/(\d+(\.\d+)?)px/,f={makeSelectable:function(b,a){if(!(b===void 0||b.style===void 0))b.onselectstart=a?function(){return false}:function(){},b.style.MozUserSelect=a?"auto":"none",b.style.KhtmlUserSelect=
a?"auto":"none",b.unselectable=a?"on":"off"},makeFullscreen:function(b,a,d){e.isUndefined(a)&&(a=true);e.isUndefined(d)&&(d=true);b.style.position="absolute";if(a)b.style.left=0,b.style.right=0;if(d)b.style.top=0,b.style.bottom=0},fakeEvent:function(b,a,d,f){var d=d||{},m=c[a];if(!m)throw Error("Event type "+a+" not supported.");var l=document.createEvent(m);switch(m){case "MouseEvents":l.initMouseEvent(a,d.bubbles||false,d.cancelable||true,window,d.clickCount||1,0,0,d.x||d.clientX||0,d.y||d.clientY||
0,false,false,false,false,0,null);break;case "KeyboardEvents":m=l.initKeyboardEvent||l.initKeyEvent;e.defaults(d,{cancelable:true,ctrlKey:false,altKey:false,shiftKey:false,metaKey:false,keyCode:void 0,charCode:void 0});m(a,d.bubbles||false,d.cancelable,window,d.ctrlKey,d.altKey,d.shiftKey,d.metaKey,d.keyCode,d.charCode);break;default:l.initEvent(a,d.bubbles||false,d.cancelable||true)}e.defaults(l,f);b.dispatchEvent(l)},bind:function(b,a,d,c){b.addEventListener?b.addEventListener(a,d,c||false):b.attachEvent&&
b.attachEvent("on"+a,d);return f},unbind:function(b,a,d,c){b.removeEventListener?b.removeEventListener(a,d,c||false):b.detachEvent&&b.detachEvent("on"+a,d);return f},addClass:function(b,a){if(b.className===void 0)b.className=a;else if(b.className!==a){var d=b.className.split(/ +/);if(d.indexOf(a)==-1)d.push(a),b.className=d.join(" ").replace(/^\s+/,"").replace(/\s+$/,"")}return f},removeClass:function(b,a){if(a){if(b.className!==void 0)if(b.className===a)b.removeAttribute("class");else{var d=b.className.split(/ +/),
c=d.indexOf(a);if(c!=-1)d.splice(c,1),b.className=d.join(" ")}}else b.className=void 0;return f},hasClass:function(a,d){return RegExp("(?:^|\\s+)"+d+"(?:\\s+|$)").test(a.className)||false},getWidth:function(b){b=getComputedStyle(b);return a(b["border-left-width"])+a(b["border-right-width"])+a(b["padding-left"])+a(b["padding-right"])+a(b.width)},getHeight:function(b){b=getComputedStyle(b);return a(b["border-top-width"])+a(b["border-bottom-width"])+a(b["padding-top"])+a(b["padding-bottom"])+a(b.height)},
getOffset:function(a){var d={left:0,top:0};if(a.offsetParent){do d.left+=a.offsetLeft,d.top+=a.offsetTop;while(a=a.offsetParent)}return d},isActive:function(a){return a===document.activeElement&&(a.type||a.href)}};return f}(dat.utils.common);
dat.controllers.OptionController=function(e,a,c){var d=function(f,b,e){d.superclass.call(this,f,b);var h=this;this.__select=document.createElement("select");if(c.isArray(e)){var j={};c.each(e,function(a){j[a]=a});e=j}c.each(e,function(a,b){var d=document.createElement("option");d.innerHTML=b;d.setAttribute("value",a);h.__select.appendChild(d)});this.updateDisplay();a.bind(this.__select,"change",function(){h.setValue(this.options[this.selectedIndex].value)});this.domElement.appendChild(this.__select)};
d.superclass=e;c.extend(d.prototype,e.prototype,{setValue:function(a){a=d.superclass.prototype.setValue.call(this,a);this.__onFinishChange&&this.__onFinishChange.call(this,this.getValue());return a},updateDisplay:function(){this.__select.value=this.getValue();return d.superclass.prototype.updateDisplay.call(this)}});return d}(dat.controllers.Controller,dat.dom.dom,dat.utils.common);
dat.controllers.NumberController=function(e,a){var c=function(d,f,b){c.superclass.call(this,d,f);b=b||{};this.__min=b.min;this.__max=b.max;this.__step=b.step;d=this.__impliedStep=a.isUndefined(this.__step)?this.initialValue==0?1:Math.pow(10,Math.floor(Math.log(this.initialValue)/Math.LN10))/10:this.__step;d=d.toString();this.__precision=d.indexOf(".")>-1?d.length-d.indexOf(".")-1:0};c.superclass=e;a.extend(c.prototype,e.prototype,{setValue:function(a){if(this.__min!==void 0&&a<this.__min)a=this.__min;
else if(this.__max!==void 0&&a>this.__max)a=this.__max;this.__step!==void 0&&a%this.__step!=0&&(a=Math.round(a/this.__step)*this.__step);return c.superclass.prototype.setValue.call(this,a)},min:function(a){this.__min=a;return this},max:function(a){this.__max=a;return this},step:function(a){this.__step=a;return this}});return c}(dat.controllers.Controller,dat.utils.common);
dat.controllers.NumberControllerBox=function(e,a,c){var d=function(f,b,e){function h(){var a=parseFloat(l.__input.value);c.isNaN(a)||l.setValue(a)}function j(a){var b=o-a.clientY;l.setValue(l.getValue()+b*l.__impliedStep);o=a.clientY}function m(){a.unbind(window,"mousemove",j);a.unbind(window,"mouseup",m)}this.__truncationSuspended=false;d.superclass.call(this,f,b,e);var l=this,o;this.__input=document.createElement("input");this.__input.setAttribute("type","text");a.bind(this.__input,"change",h);
a.bind(this.__input,"blur",function(){h();l.__onFinishChange&&l.__onFinishChange.call(l,l.getValue())});a.bind(this.__input,"mousedown",function(b){a.bind(window,"mousemove",j);a.bind(window,"mouseup",m);o=b.clientY});a.bind(this.__input,"keydown",function(a){if(a.keyCode===13)l.__truncationSuspended=true,this.blur(),l.__truncationSuspended=false});this.updateDisplay();this.domElement.appendChild(this.__input)};d.superclass=e;c.extend(d.prototype,e.prototype,{updateDisplay:function(){var a=this.__input,
b;if(this.__truncationSuspended)b=this.getValue();else{b=this.getValue();var c=Math.pow(10,this.__precision);b=Math.round(b*c)/c}a.value=b;return d.superclass.prototype.updateDisplay.call(this)}});return d}(dat.controllers.NumberController,dat.dom.dom,dat.utils.common);
dat.controllers.NumberControllerSlider=function(e,a,c,d,f){var b=function(d,c,f,e,l){function o(b){b.preventDefault();var d=a.getOffset(g.__background),c=a.getWidth(g.__background);g.setValue(g.__min+(g.__max-g.__min)*((b.clientX-d.left)/(d.left+c-d.left)));return false}function y(){a.unbind(window,"mousemove",o);a.unbind(window,"mouseup",y);g.__onFinishChange&&g.__onFinishChange.call(g,g.getValue())}b.superclass.call(this,d,c,{min:f,max:e,step:l});var g=this;this.__background=document.createElement("div");
this.__foreground=document.createElement("div");a.bind(this.__background,"mousedown",function(b){a.bind(window,"mousemove",o);a.bind(window,"mouseup",y);o(b)});a.addClass(this.__background,"slider");a.addClass(this.__foreground,"slider-fg");this.updateDisplay();this.__background.appendChild(this.__foreground);this.domElement.appendChild(this.__background)};b.superclass=e;b.useDefaultStyles=function(){c.inject(f)};d.extend(b.prototype,e.prototype,{updateDisplay:function(){this.__foreground.style.width=
(this.getValue()-this.__min)/(this.__max-this.__min)*100+"%";return b.superclass.prototype.updateDisplay.call(this)}});return b}(dat.controllers.NumberController,dat.dom.dom,dat.utils.css,dat.utils.common,".slider {\n  box-shadow: inset 0 2px 4px rgba(0,0,0,0.15);\n  height: 1em;\n  border-radius: 1em;\n  background-color: #eee;\n  padding: 0 0.5em;\n  overflow: hidden;\n}\n\n.slider-fg {\n  padding: 1px 0 2px 0;\n  background-color: #aaa;\n  height: 1em;\n  margin-left: -0.5em;\n  padding-right: 0.5em;\n  border-radius: 1em 0 0 1em;\n}\n\n.slider-fg:after {\n  display: inline-block;\n  border-radius: 1em;\n  background-color: #fff;\n  border:  1px solid #aaa;\n  content: '';\n  float: right;\n  margin-right: -1em;\n  margin-top: -1px;\n  height: 0.9em;\n  width: 0.9em;\n}");
dat.controllers.FunctionController=function(e,a,c){var d=function(c,b,e){d.superclass.call(this,c,b);var h=this;this.__button=document.createElement("div");this.__button.innerHTML=e===void 0?"Fire":e;a.bind(this.__button,"click",function(a){a.preventDefault();h.fire();return false});a.addClass(this.__button,"button");this.domElement.appendChild(this.__button)};d.superclass=e;c.extend(d.prototype,e.prototype,{fire:function(){this.__onChange&&this.__onChange.call(this);this.__onFinishChange&&this.__onFinishChange.call(this,
this.getValue());this.getValue().call(this.object)}});return d}(dat.controllers.Controller,dat.dom.dom,dat.utils.common);
dat.controllers.BooleanController=function(e,a,c){var d=function(c,b){d.superclass.call(this,c,b);var e=this;this.__prev=this.getValue();this.__checkbox=document.createElement("input");this.__checkbox.setAttribute("type","checkbox");a.bind(this.__checkbox,"change",function(){e.setValue(!e.__prev)},false);this.domElement.appendChild(this.__checkbox);this.updateDisplay()};d.superclass=e;c.extend(d.prototype,e.prototype,{setValue:function(a){a=d.superclass.prototype.setValue.call(this,a);this.__onFinishChange&&
this.__onFinishChange.call(this,this.getValue());this.__prev=this.getValue();return a},updateDisplay:function(){this.getValue()===true?(this.__checkbox.setAttribute("checked","checked"),this.__checkbox.checked=true):this.__checkbox.checked=false;return d.superclass.prototype.updateDisplay.call(this)}});return d}(dat.controllers.Controller,dat.dom.dom,dat.utils.common);
dat.color.toString=function(e){return function(a){if(a.a==1||e.isUndefined(a.a)){for(a=a.hex.toString(16);a.length<6;)a="0"+a;return"#"+a}else return"rgba("+Math.round(a.r)+","+Math.round(a.g)+","+Math.round(a.b)+","+a.a+")"}}(dat.utils.common);
dat.color.interpret=function(e,a){var c,d,f=[{litmus:a.isString,conversions:{THREE_CHAR_HEX:{read:function(a){a=a.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);return a===null?false:{space:"HEX",hex:parseInt("0x"+a[1].toString()+a[1].toString()+a[2].toString()+a[2].toString()+a[3].toString()+a[3].toString())}},write:e},SIX_CHAR_HEX:{read:function(a){a=a.match(/^#([A-F0-9]{6})$/i);return a===null?false:{space:"HEX",hex:parseInt("0x"+a[1].toString())}},write:e},CSS_RGB:{read:function(a){a=a.match(/^rgb\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
return a===null?false:{space:"RGB",r:parseFloat(a[1]),g:parseFloat(a[2]),b:parseFloat(a[3])}},write:e},CSS_RGBA:{read:function(a){a=a.match(/^rgba\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\,\s*(.+)\s*\)/);return a===null?false:{space:"RGB",r:parseFloat(a[1]),g:parseFloat(a[2]),b:parseFloat(a[3]),a:parseFloat(a[4])}},write:e}}},{litmus:a.isNumber,conversions:{HEX:{read:function(a){return{space:"HEX",hex:a,conversionName:"HEX"}},write:function(a){return a.hex}}}},{litmus:a.isArray,conversions:{RGB_ARRAY:{read:function(a){return a.length!=
3?false:{space:"RGB",r:a[0],g:a[1],b:a[2]}},write:function(a){return[a.r,a.g,a.b]}},RGBA_ARRAY:{read:function(a){return a.length!=4?false:{space:"RGB",r:a[0],g:a[1],b:a[2],a:a[3]}},write:function(a){return[a.r,a.g,a.b,a.a]}}}},{litmus:a.isObject,conversions:{RGBA_OBJ:{read:function(b){return a.isNumber(b.r)&&a.isNumber(b.g)&&a.isNumber(b.b)&&a.isNumber(b.a)?{space:"RGB",r:b.r,g:b.g,b:b.b,a:b.a}:false},write:function(a){return{r:a.r,g:a.g,b:a.b,a:a.a}}},RGB_OBJ:{read:function(b){return a.isNumber(b.r)&&
a.isNumber(b.g)&&a.isNumber(b.b)?{space:"RGB",r:b.r,g:b.g,b:b.b}:false},write:function(a){return{r:a.r,g:a.g,b:a.b}}},HSVA_OBJ:{read:function(b){return a.isNumber(b.h)&&a.isNumber(b.s)&&a.isNumber(b.v)&&a.isNumber(b.a)?{space:"HSV",h:b.h,s:b.s,v:b.v,a:b.a}:false},write:function(a){return{h:a.h,s:a.s,v:a.v,a:a.a}}},HSV_OBJ:{read:function(b){return a.isNumber(b.h)&&a.isNumber(b.s)&&a.isNumber(b.v)?{space:"HSV",h:b.h,s:b.s,v:b.v}:false},write:function(a){return{h:a.h,s:a.s,v:a.v}}}}}];return function(){d=
false;var b=arguments.length>1?a.toArray(arguments):arguments[0];a.each(f,function(e){if(e.litmus(b))return a.each(e.conversions,function(e,f){c=e.read(b);if(d===false&&c!==false)return d=c,c.conversionName=f,c.conversion=e,a.BREAK}),a.BREAK});return d}}(dat.color.toString,dat.utils.common);
dat.GUI=dat.gui.GUI=function(e,a,c,d,f,b,n,h,j,m,l,o,y,g,i){function q(a,b,r,c){if(b[r]===void 0)throw Error("Object "+b+' has no property "'+r+'"');c.color?b=new l(b,r):(b=[b,r].concat(c.factoryArgs),b=d.apply(a,b));if(c.before instanceof f)c.before=c.before.__li;t(a,b);g.addClass(b.domElement,"c");r=document.createElement("span");g.addClass(r,"property-name");r.innerHTML=b.property;var e=document.createElement("div");e.appendChild(r);e.appendChild(b.domElement);c=s(a,e,c.before);g.addClass(c,k.CLASS_CONTROLLER_ROW);
g.addClass(c,typeof b.getValue());p(a,c,b);a.__controllers.push(b);return b}function s(a,b,d){var c=document.createElement("li");b&&c.appendChild(b);d?a.__ul.insertBefore(c,params.before):a.__ul.appendChild(c);a.onResize();return c}function p(a,d,c){c.__li=d;c.__gui=a;i.extend(c,{options:function(b){if(arguments.length>1)return c.remove(),q(a,c.object,c.property,{before:c.__li.nextElementSibling,factoryArgs:[i.toArray(arguments)]});if(i.isArray(b)||i.isObject(b))return c.remove(),q(a,c.object,c.property,
{before:c.__li.nextElementSibling,factoryArgs:[b]})},name:function(a){c.__li.firstElementChild.firstElementChild.innerHTML=a;return c},listen:function(){c.__gui.listen(c);return c},remove:function(){c.__gui.remove(c);return c}});if(c instanceof j){var e=new h(c.object,c.property,{min:c.__min,max:c.__max,step:c.__step});i.each(["updateDisplay","onChange","onFinishChange"],function(a){var b=c[a],H=e[a];c[a]=e[a]=function(){var a=Array.prototype.slice.call(arguments);b.apply(c,a);return H.apply(e,a)}});
g.addClass(d,"has-slider");c.domElement.insertBefore(e.domElement,c.domElement.firstElementChild)}else if(c instanceof h){var f=function(b){return i.isNumber(c.__min)&&i.isNumber(c.__max)?(c.remove(),q(a,c.object,c.property,{before:c.__li.nextElementSibling,factoryArgs:[c.__min,c.__max,c.__step]})):b};c.min=i.compose(f,c.min);c.max=i.compose(f,c.max)}else if(c instanceof b)g.bind(d,"click",function(){g.fakeEvent(c.__checkbox,"click")}),g.bind(c.__checkbox,"click",function(a){a.stopPropagation()});
else if(c instanceof n)g.bind(d,"click",function(){g.fakeEvent(c.__button,"click")}),g.bind(d,"mouseover",function(){g.addClass(c.__button,"hover")}),g.bind(d,"mouseout",function(){g.removeClass(c.__button,"hover")});else if(c instanceof l)g.addClass(d,"color"),c.updateDisplay=i.compose(function(a){d.style.borderLeftColor=c.__color.toString();return a},c.updateDisplay),c.updateDisplay();c.setValue=i.compose(function(b){a.getRoot().__preset_select&&c.isModified()&&B(a.getRoot(),true);return b},c.setValue)}
function t(a,b){var c=a.getRoot(),d=c.__rememberedObjects.indexOf(b.object);if(d!=-1){var e=c.__rememberedObjectIndecesToControllers[d];e===void 0&&(e={},c.__rememberedObjectIndecesToControllers[d]=e);e[b.property]=b;if(c.load&&c.load.remembered){c=c.load.remembered;if(c[a.preset])c=c[a.preset];else if(c[w])c=c[w];else return;if(c[d]&&c[d][b.property]!==void 0)d=c[d][b.property],b.initialValue=d,b.setValue(d)}}}function I(a){var b=a.__save_row=document.createElement("li");g.addClass(a.domElement,
"has-save");a.__ul.insertBefore(b,a.__ul.firstChild);g.addClass(b,"save-row");var c=document.createElement("span");c.innerHTML="&nbsp;";g.addClass(c,"button gears");var d=document.createElement("span");d.innerHTML="Save";g.addClass(d,"button");g.addClass(d,"save");var e=document.createElement("span");e.innerHTML="New";g.addClass(e,"button");g.addClass(e,"save-as");var f=document.createElement("span");f.innerHTML="Revert";g.addClass(f,"button");g.addClass(f,"revert");var m=a.__preset_select=document.createElement("select");
a.load&&a.load.remembered?i.each(a.load.remembered,function(b,c){C(a,c,c==a.preset)}):C(a,w,false);g.bind(m,"change",function(){for(var b=0;b<a.__preset_select.length;b++)a.__preset_select[b].innerHTML=a.__preset_select[b].value;a.preset=this.value});b.appendChild(m);b.appendChild(c);b.appendChild(d);b.appendChild(e);b.appendChild(f);if(u){var b=document.getElementById("dg-save-locally"),l=document.getElementById("dg-local-explain");b.style.display="block";b=document.getElementById("dg-local-storage");
localStorage.getItem(document.location.href+".isLocal")==="true"&&b.setAttribute("checked","checked");var o=function(){l.style.display=a.useLocalStorage?"block":"none"};o();g.bind(b,"change",function(){a.useLocalStorage=!a.useLocalStorage;o()})}var h=document.getElementById("dg-new-constructor");g.bind(h,"keydown",function(a){a.metaKey&&(a.which===67||a.keyCode==67)&&x.hide()});g.bind(c,"click",function(){h.innerHTML=JSON.stringify(a.getSaveObject(),void 0,2);x.show();h.focus();h.select()});g.bind(d,
"click",function(){a.save()});g.bind(e,"click",function(){var b=prompt("Enter a new preset name.");b&&a.saveAs(b)});g.bind(f,"click",function(){a.revert()})}function J(a){function b(f){f.preventDefault();e=f.clientX;g.addClass(a.__closeButton,k.CLASS_DRAG);g.bind(window,"mousemove",c);g.bind(window,"mouseup",d);return false}function c(b){b.preventDefault();a.width+=e-b.clientX;a.onResize();e=b.clientX;return false}function d(){g.removeClass(a.__closeButton,k.CLASS_DRAG);g.unbind(window,"mousemove",
c);g.unbind(window,"mouseup",d)}a.__resize_handle=document.createElement("div");i.extend(a.__resize_handle.style,{width:"6px",marginLeft:"-3px",height:"200px",cursor:"ew-resize",position:"absolute"});var e;g.bind(a.__resize_handle,"mousedown",b);g.bind(a.__closeButton,"mousedown",b);a.domElement.insertBefore(a.__resize_handle,a.domElement.firstElementChild)}function D(a,b){a.domElement.style.width=b+"px";if(a.__save_row&&a.autoPlace)a.__save_row.style.width=b+"px";if(a.__closeButton)a.__closeButton.style.width=
b+"px"}function z(a,b){var c={};i.each(a.__rememberedObjects,function(d,e){var f={};i.each(a.__rememberedObjectIndecesToControllers[e],function(a,c){f[c]=b?a.initialValue:a.getValue()});c[e]=f});return c}function C(a,b,c){var d=document.createElement("option");d.innerHTML=b;d.value=b;a.__preset_select.appendChild(d);if(c)a.__preset_select.selectedIndex=a.__preset_select.length-1}function B(a,b){var c=a.__preset_select[a.__preset_select.selectedIndex];c.innerHTML=b?c.value+"*":c.value}function E(a){a.length!=
0&&o(function(){E(a)});i.each(a,function(a){a.updateDisplay()})}e.inject(c);var w="Default",u;try{u="localStorage"in window&&window.localStorage!==null}catch(K){u=false}var x,F=true,v,A=false,G=[],k=function(a){function b(){localStorage.setItem(document.location.href+".gui",JSON.stringify(d.getSaveObject()))}function c(){var a=d.getRoot();a.width+=1;i.defer(function(){a.width-=1})}var d=this;this.domElement=document.createElement("div");this.__ul=document.createElement("ul");this.domElement.appendChild(this.__ul);
g.addClass(this.domElement,"dg");this.__folders={};this.__controllers=[];this.__rememberedObjects=[];this.__rememberedObjectIndecesToControllers=[];this.__listening=[];a=a||{};a=i.defaults(a,{autoPlace:true,width:k.DEFAULT_WIDTH});a=i.defaults(a,{resizable:a.autoPlace,hideable:a.autoPlace});if(i.isUndefined(a.load))a.load={preset:w};else if(a.preset)a.load.preset=a.preset;i.isUndefined(a.parent)&&a.hideable&&G.push(this);a.resizable=i.isUndefined(a.parent)&&a.resizable;if(a.autoPlace&&i.isUndefined(a.scrollable))a.scrollable=
true;var e=u&&localStorage.getItem(document.location.href+".isLocal")==="true";Object.defineProperties(this,{parent:{get:function(){return a.parent}},scrollable:{get:function(){return a.scrollable}},autoPlace:{get:function(){return a.autoPlace}},preset:{get:function(){return d.parent?d.getRoot().preset:a.load.preset},set:function(b){d.parent?d.getRoot().preset=b:a.load.preset=b;for(b=0;b<this.__preset_select.length;b++)if(this.__preset_select[b].value==this.preset)this.__preset_select.selectedIndex=
b;d.revert()}},width:{get:function(){return a.width},set:function(b){a.width=b;D(d,b)}},name:{get:function(){return a.name},set:function(b){a.name=b;if(m)m.innerHTML=a.name}},closed:{get:function(){return a.closed},set:function(b){a.closed=b;a.closed?g.addClass(d.__ul,k.CLASS_CLOSED):g.removeClass(d.__ul,k.CLASS_CLOSED);this.onResize();if(d.__closeButton)d.__closeButton.innerHTML=b?k.TEXT_OPEN:k.TEXT_CLOSED}},load:{get:function(){return a.load}},useLocalStorage:{get:function(){return e},set:function(a){u&&
((e=a)?g.bind(window,"unload",b):g.unbind(window,"unload",b),localStorage.setItem(document.location.href+".isLocal",a))}}});if(i.isUndefined(a.parent)){a.closed=false;g.addClass(this.domElement,k.CLASS_MAIN);g.makeSelectable(this.domElement,false);if(u&&e){d.useLocalStorage=true;var f=localStorage.getItem(document.location.href+".gui");if(f)a.load=JSON.parse(f)}this.__closeButton=document.createElement("div");this.__closeButton.innerHTML=k.TEXT_CLOSED;g.addClass(this.__closeButton,k.CLASS_CLOSE_BUTTON);
this.domElement.appendChild(this.__closeButton);g.bind(this.__closeButton,"click",function(){d.closed=!d.closed})}else{if(a.closed===void 0)a.closed=true;var m=document.createTextNode(a.name);g.addClass(m,"controller-name");f=s(d,m);g.addClass(this.__ul,k.CLASS_CLOSED);g.addClass(f,"title");g.bind(f,"click",function(a){a.preventDefault();d.closed=!d.closed;return false});if(!a.closed)this.closed=false}a.autoPlace&&(i.isUndefined(a.parent)&&(F&&(v=document.createElement("div"),g.addClass(v,"dg"),g.addClass(v,
k.CLASS_AUTO_PLACE_CONTAINER),document.body.appendChild(v),F=false),v.appendChild(this.domElement),g.addClass(this.domElement,k.CLASS_AUTO_PLACE)),this.parent||D(d,a.width));g.bind(window,"resize",function(){d.onResize()});g.bind(this.__ul,"webkitTransitionEnd",function(){d.onResize()});g.bind(this.__ul,"transitionend",function(){d.onResize()});g.bind(this.__ul,"oTransitionEnd",function(){d.onResize()});this.onResize();a.resizable&&J(this);d.getRoot();a.parent||c()};k.toggleHide=function(){A=!A;i.each(G,
function(a){a.domElement.style.zIndex=A?-999:999;a.domElement.style.opacity=A?0:1})};k.CLASS_AUTO_PLACE="a";k.CLASS_AUTO_PLACE_CONTAINER="ac";k.CLASS_MAIN="main";k.CLASS_CONTROLLER_ROW="cr";k.CLASS_TOO_TALL="taller-than-window";k.CLASS_CLOSED="closed";k.CLASS_CLOSE_BUTTON="close-button";k.CLASS_DRAG="drag";k.DEFAULT_WIDTH=245;k.TEXT_CLOSED="Close Controls";k.TEXT_OPEN="Open Controls";g.bind(window,"keydown",function(a){document.activeElement.type!=="text"&&(a.which===72||a.keyCode==72)&&k.toggleHide()},
false);i.extend(k.prototype,{add:function(a,b){return q(this,a,b,{factoryArgs:Array.prototype.slice.call(arguments,2)})},addColor:function(a,b){return q(this,a,b,{color:true})},remove:function(a){this.__ul.removeChild(a.__li);this.__controllers.slice(this.__controllers.indexOf(a),1);var b=this;i.defer(function(){b.onResize()})},destroy:function(){this.autoPlace&&v.removeChild(this.domElement)},addFolder:function(a){if(this.__folders[a]!==void 0)throw Error('You already have a folder in this GUI by the name "'+
a+'"');var b={name:a,parent:this};b.autoPlace=this.autoPlace;if(this.load&&this.load.folders&&this.load.folders[a])b.closed=this.load.folders[a].closed,b.load=this.load.folders[a];b=new k(b);this.__folders[a]=b;a=s(this,b.domElement);g.addClass(a,"folder");return b},open:function(){this.closed=false},close:function(){this.closed=true},onResize:function(){var a=this.getRoot();if(a.scrollable){var b=g.getOffset(a.__ul).top,c=0;i.each(a.__ul.childNodes,function(b){a.autoPlace&&b===a.__save_row||(c+=
g.getHeight(b))});window.innerHeight-b-20<c?(g.addClass(a.domElement,k.CLASS_TOO_TALL),a.__ul.style.height=window.innerHeight-b-20+"px"):(g.removeClass(a.domElement,k.CLASS_TOO_TALL),a.__ul.style.height="auto")}a.__resize_handle&&i.defer(function(){a.__resize_handle.style.height=a.__ul.offsetHeight+"px"});if(a.__closeButton)a.__closeButton.style.width=a.width+"px"},remember:function(){if(i.isUndefined(x))x=new y,x.domElement.innerHTML=a;if(this.parent)throw Error("You can only call remember on a top level GUI.");
var b=this;i.each(Array.prototype.slice.call(arguments),function(a){b.__rememberedObjects.length==0&&I(b);b.__rememberedObjects.indexOf(a)==-1&&b.__rememberedObjects.push(a)});this.autoPlace&&D(this,this.width)},getRoot:function(){for(var a=this;a.parent;)a=a.parent;return a},getSaveObject:function(){var a=this.load;a.closed=this.closed;if(this.__rememberedObjects.length>0){a.preset=this.preset;if(!a.remembered)a.remembered={};a.remembered[this.preset]=z(this)}a.folders={};i.each(this.__folders,function(b,
c){a.folders[c]=b.getSaveObject()});return a},save:function(){if(!this.load.remembered)this.load.remembered={};this.load.remembered[this.preset]=z(this);B(this,false)},saveAs:function(a){if(!this.load.remembered)this.load.remembered={},this.load.remembered[w]=z(this,true);this.load.remembered[a]=z(this);this.preset=a;C(this,a,true)},revert:function(a){i.each(this.__controllers,function(b){this.getRoot().load.remembered?t(a||this.getRoot(),b):b.setValue(b.initialValue)},this);i.each(this.__folders,
function(a){a.revert(a)});a||B(this.getRoot(),false)},listen:function(a){var b=this.__listening.length==0;this.__listening.push(a);b&&E(this.__listening)}});return k}(dat.utils.css,'<div id="dg-save" class="dg dialogue">\n\n  Here\'s the new load parameter for your <code>GUI</code>\'s constructor:\n\n  <textarea id="dg-new-constructor"></textarea>\n\n  <div id="dg-save-locally">\n\n    <input id="dg-local-storage" type="checkbox"/> Automatically save\n    values to <code>localStorage</code> on exit.\n\n    <div id="dg-local-explain">The values saved to <code>localStorage</code> will\n      override those passed to <code>dat.GUI</code>\'s constructor. This makes it\n      easier to work incrementally, but <code>localStorage</code> is fragile,\n      and your friends may not see the same values you do.\n      \n    </div>\n    \n  </div>\n\n</div>',
".dg ul{list-style:none;margin:0;padding:0;width:100%;clear:both}.dg.ac{position:fixed;top:0;left:0;right:0;height:0;z-index:0}.dg:not(.ac) .main{overflow:hidden}.dg.main{-webkit-transition:opacity 0.1s linear;-o-transition:opacity 0.1s linear;-moz-transition:opacity 0.1s linear;transition:opacity 0.1s linear}.dg.main.taller-than-window{overflow-y:auto}.dg.main.taller-than-window .close-button{opacity:1;margin-top:-1px;border-top:1px solid #2c2c2c}.dg.main ul.closed .close-button{opacity:1 !important}.dg.main:hover .close-button,.dg.main .close-button.drag{opacity:1}.dg.main .close-button{-webkit-transition:opacity 0.1s linear;-o-transition:opacity 0.1s linear;-moz-transition:opacity 0.1s linear;transition:opacity 0.1s linear;border:0;position:absolute;line-height:19px;height:20px;cursor:pointer;text-align:center;background-color:#000}.dg.main .close-button:hover{background-color:#111}.dg.a{float:right;margin-right:15px;overflow-x:hidden}.dg.a.has-save ul{margin-top:27px}.dg.a.has-save ul.closed{margin-top:0}.dg.a .save-row{position:fixed;top:0;z-index:1002}.dg li{-webkit-transition:height 0.1s ease-out;-o-transition:height 0.1s ease-out;-moz-transition:height 0.1s ease-out;transition:height 0.1s ease-out}.dg li:not(.folder){cursor:auto;height:27px;line-height:27px;overflow:hidden;padding:0 4px 0 5px}.dg li.folder{padding:0;border-left:4px solid rgba(0,0,0,0)}.dg li.title{cursor:pointer;margin-left:-4px}.dg .closed li:not(.title),.dg .closed ul li,.dg .closed ul li > *{height:0;overflow:hidden;border:0}.dg .cr{clear:both;padding-left:3px;height:27px}.dg .property-name{cursor:default;float:left;clear:left;width:40%;overflow:hidden;text-overflow:ellipsis}.dg .c{float:left;width:60%}.dg .c input[type=text]{border:0;margin-top:4px;padding:3px;width:100%;float:right}.dg .has-slider input[type=text]{width:30%;margin-left:0}.dg .slider{float:left;width:66%;margin-left:-5px;margin-right:0;height:19px;margin-top:4px}.dg .slider-fg{height:100%}.dg .c input[type=checkbox]{margin-top:9px}.dg .c select{margin-top:5px}.dg .cr.function,.dg .cr.function .property-name,.dg .cr.function *,.dg .cr.boolean,.dg .cr.boolean *{cursor:pointer}.dg .selector{display:none;position:absolute;margin-left:-9px;margin-top:23px;z-index:10}.dg .c:hover .selector,.dg .selector.drag{display:block}.dg li.save-row{padding:0}.dg li.save-row .button{display:inline-block;padding:0px 6px}.dg.dialogue{background-color:#222;width:460px;padding:15px;font-size:13px;line-height:15px}#dg-new-constructor{padding:10px;color:#222;font-family:Monaco, monospace;font-size:10px;border:0;resize:none;box-shadow:inset 1px 1px 1px #888;word-wrap:break-word;margin:12px 0;display:block;width:440px;overflow-y:scroll;height:100px;position:relative}#dg-local-explain{display:none;font-size:11px;line-height:17px;border-radius:3px;background-color:#333;padding:8px;margin-top:10px}#dg-local-explain code{font-size:10px}#dat-gui-save-locally{display:none}.dg{color:#eee;font:11px 'Lucida Grande', sans-serif;text-shadow:0 -1px 0 #111}.dg.main::-webkit-scrollbar{width:5px;background:#1a1a1a}.dg.main::-webkit-scrollbar-corner{height:0;display:none}.dg.main::-webkit-scrollbar-thumb{border-radius:5px;background:#676767}.dg li:not(.folder){background:#1a1a1a;border-bottom:1px solid #2c2c2c}.dg li.save-row{line-height:25px;background:#dad5cb;border:0}.dg li.save-row select{margin-left:5px;width:108px}.dg li.save-row .button{margin-left:5px;margin-top:1px;border-radius:2px;font-size:9px;line-height:7px;padding:4px 4px 5px 4px;background:#c5bdad;color:#fff;text-shadow:0 1px 0 #b0a58f;box-shadow:0 -1px 0 #b0a58f;cursor:pointer}.dg li.save-row .button.gears{background:#c5bdad url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQJJREFUeNpiYKAU/P//PwGIC/ApCABiBSAW+I8AClAcgKxQ4T9hoMAEUrxx2QSGN6+egDX+/vWT4e7N82AMYoPAx/evwWoYoSYbACX2s7KxCxzcsezDh3evFoDEBYTEEqycggWAzA9AuUSQQgeYPa9fPv6/YWm/Acx5IPb7ty/fw+QZblw67vDs8R0YHyQhgObx+yAJkBqmG5dPPDh1aPOGR/eugW0G4vlIoTIfyFcA+QekhhHJhPdQxbiAIguMBTQZrPD7108M6roWYDFQiIAAv6Aow/1bFwXgis+f2LUAynwoIaNcz8XNx3Dl7MEJUDGQpx9gtQ8YCueB+D26OECAAQDadt7e46D42QAAAABJRU5ErkJggg==) 2px 1px no-repeat;height:7px;width:8px}.dg li.save-row .button:hover{background-color:#bab19e;box-shadow:0 -1px 0 #b0a58f}.dg li.folder{border-bottom:0}.dg li.title{padding-left:16px;background:#000 url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==) 6px 10px no-repeat;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.2)}.dg .closed li.title{background-image:url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlGIWqMCbWAEAOw==)}.dg .cr.boolean{border-left:3px solid #806787}.dg .cr.function{border-left:3px solid #e61d5f}.dg .cr.number{border-left:3px solid #2fa1d6}.dg .cr.number input[type=text]{color:#2fa1d6}.dg .cr.string{border-left:3px solid #1ed36f}.dg .cr.string input[type=text]{color:#1ed36f}.dg .cr.function:hover,.dg .cr.boolean:hover{background:#111}.dg .c input[type=text]{background:#303030;outline:none}.dg .c input[type=text]:hover{background:#3c3c3c}.dg .c input[type=text]:focus{background:#494949;color:#fff}.dg .c .slider{background:#303030;cursor:ew-resize}.dg .c .slider-fg{background:#2fa1d6}.dg .c .slider:hover{background:#3c3c3c}.dg .c .slider:hover .slider-fg{background:#44abda}\n",
dat.controllers.factory=function(e,a,c,d,f,b,n){return function(h,j,m,l){var o=h[j];if(n.isArray(m)||n.isObject(m))return new e(h,j,m);if(n.isNumber(o))return n.isNumber(m)&&n.isNumber(l)?new c(h,j,m,l):new a(h,j,{min:m,max:l});if(n.isString(o))return new d(h,j);if(n.isFunction(o))return new f(h,j,"");if(n.isBoolean(o))return new b(h,j)}}(dat.controllers.OptionController,dat.controllers.NumberControllerBox,dat.controllers.NumberControllerSlider,dat.controllers.StringController=function(e,a,c){var d=
function(c,b){function e(){h.setValue(h.__input.value)}d.superclass.call(this,c,b);var h=this;this.__input=document.createElement("input");this.__input.setAttribute("type","text");a.bind(this.__input,"keyup",e);a.bind(this.__input,"change",e);a.bind(this.__input,"blur",function(){h.__onFinishChange&&h.__onFinishChange.call(h,h.getValue())});a.bind(this.__input,"keydown",function(a){a.keyCode===13&&this.blur()});this.updateDisplay();this.domElement.appendChild(this.__input)};d.superclass=e;c.extend(d.prototype,
e.prototype,{updateDisplay:function(){if(!a.isActive(this.__input))this.__input.value=this.getValue();return d.superclass.prototype.updateDisplay.call(this)}});return d}(dat.controllers.Controller,dat.dom.dom,dat.utils.common),dat.controllers.FunctionController,dat.controllers.BooleanController,dat.utils.common),dat.controllers.Controller,dat.controllers.BooleanController,dat.controllers.FunctionController,dat.controllers.NumberControllerBox,dat.controllers.NumberControllerSlider,dat.controllers.OptionController,
dat.controllers.ColorController=function(e,a,c,d,f){function b(a,b,c,d){a.style.background="";f.each(j,function(e){a.style.cssText+="background: "+e+"linear-gradient("+b+", "+c+" 0%, "+d+" 100%); "})}function n(a){a.style.background="";a.style.cssText+="background: -moz-linear-gradient(top,  #ff0000 0%, #ff00ff 17%, #0000ff 34%, #00ffff 50%, #00ff00 67%, #ffff00 84%, #ff0000 100%);";a.style.cssText+="background: -webkit-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
a.style.cssText+="background: -o-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";a.style.cssText+="background: -ms-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";a.style.cssText+="background: linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);"}var h=function(e,l){function o(b){q(b);a.bind(window,"mousemove",q);a.bind(window,
"mouseup",j)}function j(){a.unbind(window,"mousemove",q);a.unbind(window,"mouseup",j)}function g(){var a=d(this.value);a!==false?(p.__color.__state=a,p.setValue(p.__color.toOriginal())):this.value=p.__color.toString()}function i(){a.unbind(window,"mousemove",s);a.unbind(window,"mouseup",i)}function q(b){b.preventDefault();var c=a.getWidth(p.__saturation_field),d=a.getOffset(p.__saturation_field),e=(b.clientX-d.left+document.body.scrollLeft)/c,b=1-(b.clientY-d.top+document.body.scrollTop)/c;b>1?b=
1:b<0&&(b=0);e>1?e=1:e<0&&(e=0);p.__color.v=b;p.__color.s=e;p.setValue(p.__color.toOriginal());return false}function s(b){b.preventDefault();var c=a.getHeight(p.__hue_field),d=a.getOffset(p.__hue_field),b=1-(b.clientY-d.top+document.body.scrollTop)/c;b>1?b=1:b<0&&(b=0);p.__color.h=b*360;p.setValue(p.__color.toOriginal());return false}h.superclass.call(this,e,l);this.__color=new c(this.getValue());this.__temp=new c(0);var p=this;this.domElement=document.createElement("div");a.makeSelectable(this.domElement,
false);this.__selector=document.createElement("div");this.__selector.className="selector";this.__saturation_field=document.createElement("div");this.__saturation_field.className="saturation-field";this.__field_knob=document.createElement("div");this.__field_knob.className="field-knob";this.__field_knob_border="2px solid ";this.__hue_knob=document.createElement("div");this.__hue_knob.className="hue-knob";this.__hue_field=document.createElement("div");this.__hue_field.className="hue-field";this.__input=
document.createElement("input");this.__input.type="text";this.__input_textShadow="0 1px 1px ";a.bind(this.__input,"keydown",function(a){a.keyCode===13&&g.call(this)});a.bind(this.__input,"blur",g);a.bind(this.__selector,"mousedown",function(){a.addClass(this,"drag").bind(window,"mouseup",function(){a.removeClass(p.__selector,"drag")})});var t=document.createElement("div");f.extend(this.__selector.style,{width:"122px",height:"102px",padding:"3px",backgroundColor:"#222",boxShadow:"0px 1px 3px rgba(0,0,0,0.3)"});
f.extend(this.__field_knob.style,{position:"absolute",width:"12px",height:"12px",border:this.__field_knob_border+(this.__color.v<0.5?"#fff":"#000"),boxShadow:"0px 1px 3px rgba(0,0,0,0.5)",borderRadius:"12px",zIndex:1});f.extend(this.__hue_knob.style,{position:"absolute",width:"15px",height:"2px",borderRight:"4px solid #fff",zIndex:1});f.extend(this.__saturation_field.style,{width:"100px",height:"100px",border:"1px solid #555",marginRight:"3px",display:"inline-block",cursor:"pointer"});f.extend(t.style,
{width:"100%",height:"100%",background:"none"});b(t,"top","rgba(0,0,0,0)","#000");f.extend(this.__hue_field.style,{width:"15px",height:"100px",display:"inline-block",border:"1px solid #555",cursor:"ns-resize"});n(this.__hue_field);f.extend(this.__input.style,{outline:"none",textAlign:"center",color:"#fff",border:0,fontWeight:"bold",textShadow:this.__input_textShadow+"rgba(0,0,0,0.7)"});a.bind(this.__saturation_field,"mousedown",o);a.bind(this.__field_knob,"mousedown",o);a.bind(this.__hue_field,"mousedown",
function(b){s(b);a.bind(window,"mousemove",s);a.bind(window,"mouseup",i)});this.__saturation_field.appendChild(t);this.__selector.appendChild(this.__field_knob);this.__selector.appendChild(this.__saturation_field);this.__selector.appendChild(this.__hue_field);this.__hue_field.appendChild(this.__hue_knob);this.domElement.appendChild(this.__input);this.domElement.appendChild(this.__selector);this.updateDisplay()};h.superclass=e;f.extend(h.prototype,e.prototype,{updateDisplay:function(){var a=d(this.getValue());
if(a!==false){var e=false;f.each(c.COMPONENTS,function(b){if(!f.isUndefined(a[b])&&!f.isUndefined(this.__color.__state[b])&&a[b]!==this.__color.__state[b])return e=true,{}},this);e&&f.extend(this.__color.__state,a)}f.extend(this.__temp.__state,this.__color.__state);this.__temp.a=1;var h=this.__color.v<0.5||this.__color.s>0.5?255:0,j=255-h;f.extend(this.__field_knob.style,{marginLeft:100*this.__color.s-7+"px",marginTop:100*(1-this.__color.v)-7+"px",backgroundColor:this.__temp.toString(),border:this.__field_knob_border+
"rgb("+h+","+h+","+h+")"});this.__hue_knob.style.marginTop=(1-this.__color.h/360)*100+"px";this.__temp.s=1;this.__temp.v=1;b(this.__saturation_field,"left","#fff",this.__temp.toString());f.extend(this.__input.style,{backgroundColor:this.__input.value=this.__color.toString(),color:"rgb("+h+","+h+","+h+")",textShadow:this.__input_textShadow+"rgba("+j+","+j+","+j+",.7)"})}});var j=["-moz-","-o-","-webkit-","-ms-",""];return h}(dat.controllers.Controller,dat.dom.dom,dat.color.Color=function(e,a,c,d){function f(a,
b,c){Object.defineProperty(a,b,{get:function(){if(this.__state.space==="RGB")return this.__state[b];n(this,b,c);return this.__state[b]},set:function(a){if(this.__state.space!=="RGB")n(this,b,c),this.__state.space="RGB";this.__state[b]=a}})}function b(a,b){Object.defineProperty(a,b,{get:function(){if(this.__state.space==="HSV")return this.__state[b];h(this);return this.__state[b]},set:function(a){if(this.__state.space!=="HSV")h(this),this.__state.space="HSV";this.__state[b]=a}})}function n(b,c,e){if(b.__state.space===
"HEX")b.__state[c]=a.component_from_hex(b.__state.hex,e);else if(b.__state.space==="HSV")d.extend(b.__state,a.hsv_to_rgb(b.__state.h,b.__state.s,b.__state.v));else throw"Corrupted color state";}function h(b){var c=a.rgb_to_hsv(b.r,b.g,b.b);d.extend(b.__state,{s:c.s,v:c.v});if(d.isNaN(c.h)){if(d.isUndefined(b.__state.h))b.__state.h=0}else b.__state.h=c.h}var j=function(){this.__state=e.apply(this,arguments);if(this.__state===false)throw"Failed to interpret color arguments";this.__state.a=this.__state.a||
1};j.COMPONENTS="r,g,b,h,s,v,hex,a".split(",");d.extend(j.prototype,{toString:function(){return c(this)},toOriginal:function(){return this.__state.conversion.write(this)}});f(j.prototype,"r",2);f(j.prototype,"g",1);f(j.prototype,"b",0);b(j.prototype,"h");b(j.prototype,"s");b(j.prototype,"v");Object.defineProperty(j.prototype,"a",{get:function(){return this.__state.a},set:function(a){this.__state.a=a}});Object.defineProperty(j.prototype,"hex",{get:function(){if(!this.__state.space!=="HEX")this.__state.hex=
a.rgb_to_hex(this.r,this.g,this.b);return this.__state.hex},set:function(a){this.__state.space="HEX";this.__state.hex=a}});return j}(dat.color.interpret,dat.color.math=function(){var e;return{hsv_to_rgb:function(a,c,d){var e=a/60-Math.floor(a/60),b=d*(1-c),n=d*(1-e*c),c=d*(1-(1-e)*c),a=[[d,c,b],[n,d,b],[b,d,c],[b,n,d],[c,b,d],[d,b,n]][Math.floor(a/60)%6];return{r:a[0]*255,g:a[1]*255,b:a[2]*255}},rgb_to_hsv:function(a,c,d){var e=Math.min(a,c,d),b=Math.max(a,c,d),e=b-e;if(b==0)return{h:NaN,s:0,v:0};
a=a==b?(c-d)/e:c==b?2+(d-a)/e:4+(a-c)/e;a/=6;a<0&&(a+=1);return{h:a*360,s:e/b,v:b/255}},rgb_to_hex:function(a,c,d){a=this.hex_with_component(0,2,a);a=this.hex_with_component(a,1,c);return a=this.hex_with_component(a,0,d)},component_from_hex:function(a,c){return a>>c*8&255},hex_with_component:function(a,c,d){return d<<(e=c*8)|a&~(255<<e)}}}(),dat.color.toString,dat.utils.common),dat.color.interpret,dat.utils.common),dat.utils.requestAnimationFrame=function(){return window.webkitRequestAnimationFrame||
window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(e){window.setTimeout(e,1E3/60)}}(),dat.dom.CenteredDiv=function(e,a){var c=function(){this.backgroundElement=document.createElement("div");a.extend(this.backgroundElement.style,{backgroundColor:"rgba(0,0,0,0.8)",top:0,left:0,display:"none",zIndex:"1000",opacity:0,WebkitTransition:"opacity 0.2s linear"});e.makeFullscreen(this.backgroundElement);this.backgroundElement.style.position="fixed";this.domElement=
document.createElement("div");a.extend(this.domElement.style,{position:"fixed",display:"none",zIndex:"1001",opacity:0,WebkitTransition:"-webkit-transform 0.2s ease-out, opacity 0.2s linear"});document.body.appendChild(this.backgroundElement);document.body.appendChild(this.domElement);var c=this;e.bind(this.backgroundElement,"click",function(){c.hide()})};c.prototype.show=function(){var c=this;this.backgroundElement.style.display="block";this.domElement.style.display="block";this.domElement.style.opacity=
0;this.domElement.style.webkitTransform="scale(1.1)";this.layout();a.defer(function(){c.backgroundElement.style.opacity=1;c.domElement.style.opacity=1;c.domElement.style.webkitTransform="scale(1)"})};c.prototype.hide=function(){var a=this,c=function(){a.domElement.style.display="none";a.backgroundElement.style.display="none";e.unbind(a.domElement,"webkitTransitionEnd",c);e.unbind(a.domElement,"transitionend",c);e.unbind(a.domElement,"oTransitionEnd",c)};e.bind(this.domElement,"webkitTransitionEnd",
c);e.bind(this.domElement,"transitionend",c);e.bind(this.domElement,"oTransitionEnd",c);this.backgroundElement.style.opacity=0;this.domElement.style.opacity=0;this.domElement.style.webkitTransform="scale(1.1)"};c.prototype.layout=function(){this.domElement.style.left=window.innerWidth/2-e.getWidth(this.domElement)/2+"px";this.domElement.style.top=window.innerHeight/2-e.getHeight(this.domElement)/2+"px"};return c}(dat.dom.dom,dat.utils.common),dat.dom.dom,dat.utils.common);
; browserify_shim__define__module__export__(typeof dat != "undefined" ? dat : window.dat);

}).call(global, undefined, undefined, undefined, undefined, function defineExport(ex) { module.exports = ex; });

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],11:[function(_dereq_,module,exports){
(function (global){
;__browserify_shim_require__=_dereq_;(function browserifyShim(module, exports, _dereq_, define, browserify_shim__define__module__export__) {
// stats.js - http://github.com/mrdoob/stats.js
var Stats=function(){var l=Date.now(),m=l,g=0,n=Infinity,o=0,h=0,p=Infinity,q=0,r=0,s=0,f=document.createElement("div");f.id="stats";f.addEventListener("mousedown",function(b){b.preventDefault();t(++s%2)},!1);f.style.cssText="width:80px;opacity:0.9;cursor:pointer";var a=document.createElement("div");a.id="fps";a.style.cssText="padding:0 0 3px 3px;text-align:left;background-color:#002";f.appendChild(a);var i=document.createElement("div");i.id="fpsText";i.style.cssText="color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";
i.innerHTML="FPS";a.appendChild(i);var c=document.createElement("div");c.id="fpsGraph";c.style.cssText="position:relative;width:74px;height:30px;background-color:#0ff";for(a.appendChild(c);74>c.children.length;){var j=document.createElement("span");j.style.cssText="width:1px;height:30px;float:left;background-color:#113";c.appendChild(j)}var d=document.createElement("div");d.id="ms";d.style.cssText="padding:0 0 3px 3px;text-align:left;background-color:#020;display:none";f.appendChild(d);var k=document.createElement("div");
k.id="msText";k.style.cssText="color:#0f0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";k.innerHTML="MS";d.appendChild(k);var e=document.createElement("div");e.id="msGraph";e.style.cssText="position:relative;width:74px;height:30px;background-color:#0f0";for(d.appendChild(e);74>e.children.length;)j=document.createElement("span"),j.style.cssText="width:1px;height:30px;float:left;background-color:#131",e.appendChild(j);var t=function(b){s=b;switch(s){case 0:a.style.display=
"block";d.style.display="none";break;case 1:a.style.display="none",d.style.display="block"}};return{REVISION:11,domElement:f,setMode:t,begin:function(){l=Date.now()},end:function(){var b=Date.now();g=b-l;n=Math.min(n,g);o=Math.max(o,g);k.textContent=g+" MS ("+n+"-"+o+")";var a=Math.min(30,30-30*(g/200));e.appendChild(e.firstChild).style.height=a+"px";r++;b>m+1E3&&(h=Math.round(1E3*r/(b-m)),p=Math.min(p,h),q=Math.max(q,h),i.textContent=h+" FPS ("+p+"-"+q+")",a=Math.min(30,30-30*(h/100)),c.appendChild(c.firstChild).style.height=
a+"px",m=b,r=0);return b},update:function(){l=this.end()}}};

; browserify_shim__define__module__export__(typeof Stats != "undefined" ? Stats : window.Stats);

}).call(global, undefined, undefined, undefined, undefined, function defineExport(ex) { module.exports = ex; });

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],12:[function(_dereq_,module,exports){
(function (global){
var THREE = (typeof window !== "undefined" ? window.THREE : typeof global !== "undefined" ? global.THREE : null);

/**
 * @module  model/Coordinates
 */

/**
 * Coordinates helper, it creates the axes, ground and grids
 * shown in the world
 * @class
 * @param {Object} config
 * @param {Object} theme
 */
function Coordinates(config, theme) {
  config = config || {};

  /**
   * Group where all the objects (axes, ground, grids) are put
   * @type {THREE.Object3D}
   */
  this.mesh = new THREE.Object3D();

  /**
   * Axes object, the mesh representing the axes is under this object 
   * under `mesh`
   * @type {Object}
   */
  this.axes = {
    name: 'Axes',
    mesh: this.drawAllAxes({axisLength:100,axisRadius:1,axisTess:50}),
    visible: config.axes !== undefined ? config.axes : true
  };

  /**
   * Ground object, the mesh representing the axes is under this object
   * under `mesh`
   * @type {Object}
   */
  this.ground = {
    name: 'Ground',
    mesh: this.drawGround({size:100000, color: theme.groundColor}),
    visible: config.ground !== undefined ? config.ground : true
  };
  
  /**
   * GridXZ object, the mesh representing the axes is under this object
   * under `mesh`
   * @type {Object}
   */
  this.gridX = {
    name: 'XZ grid',
    mesh: this.drawGrid({size:10000, scale:0.01, color: theme.gridColor}),
    visible: config.gridX !== undefined ? config.gridX : true
  };

  /**
   * GridYZ object, the mesh representing the axes is under this object
   * under `mesh`
   * @type {Object}
   */  
  this.gridY = {
    name: 'YZ grid',
    mesh: this.drawGrid({size:10000, scale:0.01, orientation:"y", color: theme.gridColor}),
    visible: config.gridY !== undefined ? config.gridY : false
  };
  
  /**
   * GridXY object, the mesh representing the axes is under this object
   * under `mesh`
   * @type {Object}
   */
  this.gridZ = {
    name: 'XY grid',
    mesh: this.drawGrid({size:10000, scale:0.01, orientation:"z", color: theme.gridColor}),
    visible: config.gridZ !== undefined ? config.gridZ : false
  };

  Coordinates.prototype.init.call(this, config);
}

/**
 * Adds the axes, ground, grid meshes to `this.mesh`
 * @param  {object} options
 * @return {this}
 */
Coordinates.prototype.init = function (options) {
  var me = this;
  for (var key in me) {
    if (me.hasOwnProperty(key)) {
      var v = me[key];
      if (v.mesh) {
        me.mesh.add(v.mesh);
        v.mesh.visible = v.visible;
      }
    }
  }

  return me;
};

/**
 * Creates a dat.gui folder which has controls for the 
 * ground, axes and grids
 * @param  {dat.gui} gui
 * @return {this}
 */
Coordinates.prototype.initDatGui = function (gui) {
  var me = this,
    folder;

  folder = gui.addFolder('Scene helpers');
  for (var key in me) {
    if (me.hasOwnProperty(key)) {
      var v = me[key];
      if (v.hasOwnProperty('mesh')) {
        folder.add(v, 'visible')
          .name(v.name)
          .onFinishChange((function (property) {
            return function (newValue) {
              property.mesh.visible = newValue;
            };
          })(v));
      }
    }
  }
  return me;
};

/**
 * Draws a grid
 * @param  {object} params
 * @param  {object} params.size=100
 * @param  {object} params.scale=0.1
 * @param  {object} params.color=#505050
 * @param  {object} params.orientation=0.1
 * @return {THREE.Mesh}
 */
Coordinates.prototype.drawGrid = function (params) {
  params = params || {};
  var color = params.color !== undefined ? params.color:'#505050';
  var orientation = params.orientation !== undefined ? params.orientation:"x";
  var grid = new THREE.GridHelper( 500, 10 );
  grid.setColors( 0xa8a8a8, color );
  if (orientation === "x") {
    grid.rotation.x = - Math.PI / 2;
  } else if (orientation === "y") {
    grid.rotation.y = - Math.PI / 2;
  } else if (orientation === "z") {
    grid.rotation.z = - Math.PI / 2;
  }
  return grid;
};

/**
 * Draws the ground
 * @param  {object} params
 * @param  {object} params.size=100
 * @param  {object} params.scale=0x000000
 * @param  {object} params.offset=-0.2
 * @return {THREE.Mesh}
 */
Coordinates.prototype.drawGround = function (params) {
  params = params || {};
  var size = params.size !== undefined ? params.size:100;
  var color = params.color !== undefined ? params.color:0x000000;
  var offset = params.offset !== undefined ? params.offset:-0.5;

  var ground = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      opacity: 0.6,
      color: color
    })
  );
  ground.rotation.x = - Math.PI / 2;
  ground.position.y = offset;
  return ground;
};

/**
 * Draws an axis
 * @param  {object} params
 * @param  {object} params.axisRadius=0.04
 * @param  {object} params.axisLength=11
 * @param  {object} params.axisTess=46
 * @param  {object} params.axisOrientation=x
 * @return {THREE.Mesh}
 */
Coordinates.prototype.drawAxes = function (params) {
  // x = red, y = green, z = blue  (RGB = xyz)
  params = params || {};
  var axisRadius = params.axisRadius !== undefined ? params.axisRadius:0.04;
  var axisLength = params.axisLength !== undefined ? params.axisLength:11;
  var axisTess = params.axisTess !== undefined ? params.axisTess:48;
  var axisOrientation = params.axisOrientation !== undefined ? params.axisOrientation:"x";

  var wrap = new THREE.Object3D();
  var axisMaterial = new THREE.MeshLambertMaterial({ color: 0x000000, side: THREE.DoubleSide });
  var axis = new THREE.Mesh(
    new THREE.CylinderGeometry(axisRadius, axisRadius, axisLength, axisTess, 1, true), 
    axisMaterial
  );
  if (axisOrientation === "x") {
    axis.rotation.z = - Math.PI / 2;
    axis.position.x = axisLength/2-1;
  } else if (axisOrientation === "y") {
    axis.position.y = axisLength/2-1;
  }
  
  wrap.add( axis );
  
  var arrow = new THREE.Mesh(
    new THREE.CylinderGeometry(0, 4*axisRadius, 8*axisRadius, axisTess, 1, true), 
    axisMaterial
  );
  if (axisOrientation === "x") {
    arrow.rotation.z = - Math.PI / 2;
    arrow.position.x = axisLength - 1 + axisRadius*4/2;
  } else if (axisOrientation === "y") {
    arrow.position.y = axisLength - 1 + axisRadius*4/2;
  }

  wrap.add( arrow );
  return wrap;
};

/**
 * Creates an Object3D which contains all axes
 * @param  {Object} params
 * @param  {object} params.axisRadius=0.04  cylinder radius
 * @param  {object} params.axisLength=11    cylinder length
 * @param  {object} params.axisTess=46      cylinder tesselation
 * @return {THREE.Object3D}
 */
Coordinates.prototype.drawAllAxes = function (params) {
  params = params || {};
  var axisRadius = params.axisRadius !== undefined ? params.axisRadius:0.04;
  var axisLength = params.axisLength !== undefined ? params.axisLength:10;
  var axisTess = params.axisTess !== undefined ? params.axisTess:24;

  var wrap = new THREE.Object3D();

  var axisXMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000 });
  var axisYMaterial = new THREE.MeshLambertMaterial({ color: 0x00FF00 });
  var axisZMaterial = new THREE.MeshLambertMaterial({ color: 0x0000FF });
  axisXMaterial.side = THREE.DoubleSide;
  axisYMaterial.side = THREE.DoubleSide;
  axisZMaterial.side = THREE.DoubleSide;
  var axisX = new THREE.Mesh(
    new THREE.CylinderGeometry(axisRadius, axisRadius, axisLength, axisTess, 1, true), 
    axisXMaterial
  );
  var axisY = new THREE.Mesh(
    new THREE.CylinderGeometry(axisRadius, axisRadius, axisLength, axisTess, 1, true), 
    axisYMaterial
  );
  var axisZ = new THREE.Mesh(
    new THREE.CylinderGeometry(axisRadius, axisRadius, axisLength, axisTess, 1, true), 
    axisZMaterial
  );
  axisX.rotation.z = - Math.PI / 2;
  axisX.position.x = axisLength/2-1;

  axisY.position.y = axisLength/2-1;
  
  axisZ.rotation.y = - Math.PI / 2;
  axisZ.rotation.z = - Math.PI / 2;
  axisZ.position.z = axisLength/2-1;

  wrap.add( axisX );
  wrap.add( axisY );
  wrap.add( axisZ );

  var arrowX = new THREE.Mesh(
    new THREE.CylinderGeometry(0, 4*axisRadius, 4*axisRadius, axisTess, 1, true), 
    axisXMaterial
  );
  var arrowY = new THREE.Mesh(
    new THREE.CylinderGeometry(0, 4*axisRadius, 4*axisRadius, axisTess, 1, true), 
    axisYMaterial
  );
  var arrowZ = new THREE.Mesh(
    new THREE.CylinderGeometry(0, 4*axisRadius, 4*axisRadius, axisTess, 1, true), 
    axisZMaterial
  );
  arrowX.rotation.z = - Math.PI / 2;
  arrowX.position.x = axisLength - 1 + axisRadius*4/2;

  arrowY.position.y = axisLength - 1 + axisRadius*4/2;

  arrowZ.rotation.z = - Math.PI / 2;
  arrowZ.rotation.y = - Math.PI / 2;
  arrowZ.position.z = axisLength - 1 + axisRadius*4/2;

  wrap.add( arrowX );
  wrap.add( arrowY );
  wrap.add( arrowZ );
  return wrap;
};

module.exports = Coordinates;
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],13:[function(_dereq_,module,exports){
/**
 * @module  themes/dark
 */

/**
 * Dark theme
 * @type {Object}
 */
module.exports = {
	clearColor: 0x3f3f3f,
	fogColor: 0x3f3f3f,
  groundColor: 0x333333,
  gridColor: 0x555555
};
},{}],14:[function(_dereq_,module,exports){
/**
 * @module  themes/dark
 */

/**
 * Dark theme
 * @type {Object}
 */
module.exports = {
	clearColor: 0xaaaaaa,
	fogColor: 0xaaaaaa,
	groundColor: 0xaaaaaa
};
},{}],15:[function(_dereq_,module,exports){
/**
 * @module themes/light
 */

/**
 * Light theme
 * @name LightTheme
 * @type {Object}
 */
module.exports = {
	clearColor: 0xf2fcff,
  fogColor: 0xf2fcff,
	groundColor: 0xeeeeee
};
},{}]},{},[5])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tYXVyaWNpby9Eb2N1bWVudHMvd2ViL21hdXJpenp6aW8ubWUvVDMvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9tYXVyaWNpby9Eb2N1bWVudHMvd2ViL21hdXJpenp6aW8ubWUvVDMvbm9kZV9tb2R1bGVzL2V4dGVuZC9pbmRleC5qcyIsIi9Vc2Vycy9tYXVyaWNpby9Eb2N1bWVudHMvd2ViL21hdXJpenp6aW8ubWUvVDMvc3JjL2NvbnRyb2xsZXIvQXBwbGljYXRpb24uanMiLCIvVXNlcnMvbWF1cmljaW8vRG9jdW1lbnRzL3dlYi9tYXVyaXp6emlvLm1lL1QzL3NyYy9jb250cm9sbGVyL0tleWJvYXJkLmpzIiwiL1VzZXJzL21hdXJpY2lvL0RvY3VtZW50cy93ZWIvbWF1cml6enppby5tZS9UMy9zcmMvY29udHJvbGxlci9Mb29wTWFuYWdlci5qcyIsIi9Vc2Vycy9tYXVyaWNpby9Eb2N1bWVudHMvd2ViL21hdXJpenp6aW8ubWUvVDMvc3JjL2luZGV4LmpzIiwiL1VzZXJzL21hdXJpY2lvL0RvY3VtZW50cy93ZWIvbWF1cml6enppby5tZS9UMy9zcmMvbGliL09yYml0Q29udHJvbHMuanMiLCIvVXNlcnMvbWF1cmljaW8vRG9jdW1lbnRzL3dlYi9tYXVyaXp6emlvLm1lL1QzL3NyYy9saWIvVEhSRUV4L0Z1bGxTY3JlZW4uanMiLCIvVXNlcnMvbWF1cmljaW8vRG9jdW1lbnRzL3dlYi9tYXVyaXp6emlvLm1lL1QzL3NyYy9saWIvVEhSRUV4L1dpbmRvd1Jlc2l6ZS5qcyIsIi9Vc2Vycy9tYXVyaWNpby9Eb2N1bWVudHMvd2ViL21hdXJpenp6aW8ubWUvVDMvc3JjL2xpYi9USFJFRXgvaW5kZXguanMiLCIvVXNlcnMvbWF1cmljaW8vRG9jdW1lbnRzL3dlYi9tYXVyaXp6emlvLm1lL1QzL3NyYy9saWIvZGF0Lmd1aS5taW4uanMiLCIvVXNlcnMvbWF1cmljaW8vRG9jdW1lbnRzL3dlYi9tYXVyaXp6emlvLm1lL1QzL3NyYy9saWIvc3RhdHMubWluLmpzIiwiL1VzZXJzL21hdXJpY2lvL0RvY3VtZW50cy93ZWIvbWF1cml6enppby5tZS9UMy9zcmMvbW9kZWwvQ29vcmRpbmF0ZXMuanMiLCIvVXNlcnMvbWF1cmljaW8vRG9jdW1lbnRzL3dlYi9tYXVyaXp6emlvLm1lL1QzL3NyYy90aGVtZXMvZGFyay5qcyIsIi9Vc2Vycy9tYXVyaWNpby9Eb2N1bWVudHMvd2ViL21hdXJpenp6aW8ubWUvVDMvc3JjL3RoZW1lcy9kZWZhdWx0LmpzIiwiL1VzZXJzL21hdXJpY2lvL0RvY3VtZW50cy93ZWIvbWF1cml6enppby5tZS9UMy9zcmMvdGhlbWVzL2xpZ2h0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdG9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdm9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG52YXIgdW5kZWZpbmVkO1xuXG52YXIgaXNQbGFpbk9iamVjdCA9IGZ1bmN0aW9uIGlzUGxhaW5PYmplY3Qob2JqKSB7XG5cdCd1c2Ugc3RyaWN0Jztcblx0aWYgKCFvYmogfHwgdG9TdHJpbmcuY2FsbChvYmopICE9PSAnW29iamVjdCBPYmplY3RdJykge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHZhciBoYXNfb3duX2NvbnN0cnVjdG9yID0gaGFzT3duLmNhbGwob2JqLCAnY29uc3RydWN0b3InKTtcblx0dmFyIGhhc19pc19wcm9wZXJ0eV9vZl9tZXRob2QgPSBvYmouY29uc3RydWN0b3IgJiYgb2JqLmNvbnN0cnVjdG9yLnByb3RvdHlwZSAmJiBoYXNPd24uY2FsbChvYmouY29uc3RydWN0b3IucHJvdG90eXBlLCAnaXNQcm90b3R5cGVPZicpO1xuXHQvLyBOb3Qgb3duIGNvbnN0cnVjdG9yIHByb3BlcnR5IG11c3QgYmUgT2JqZWN0XG5cdGlmIChvYmouY29uc3RydWN0b3IgJiYgIWhhc19vd25fY29uc3RydWN0b3IgJiYgIWhhc19pc19wcm9wZXJ0eV9vZl9tZXRob2QpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvLyBPd24gcHJvcGVydGllcyBhcmUgZW51bWVyYXRlZCBmaXJzdGx5LCBzbyB0byBzcGVlZCB1cCxcblx0Ly8gaWYgbGFzdCBvbmUgaXMgb3duLCB0aGVuIGFsbCBwcm9wZXJ0aWVzIGFyZSBvd24uXG5cdHZhciBrZXk7XG5cdGZvciAoa2V5IGluIG9iaikge31cblxuXHRyZXR1cm4ga2V5ID09PSB1bmRlZmluZWQgfHwgaGFzT3duLmNhbGwob2JqLCBrZXkpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBleHRlbmQoKSB7XG5cdCd1c2Ugc3RyaWN0Jztcblx0dmFyIG9wdGlvbnMsIG5hbWUsIHNyYywgY29weSwgY29weUlzQXJyYXksIGNsb25lLFxuXHRcdHRhcmdldCA9IGFyZ3VtZW50c1swXSxcblx0XHRpID0gMSxcblx0XHRsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoLFxuXHRcdGRlZXAgPSBmYWxzZTtcblxuXHQvLyBIYW5kbGUgYSBkZWVwIGNvcHkgc2l0dWF0aW9uXG5cdGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnYm9vbGVhbicpIHtcblx0XHRkZWVwID0gdGFyZ2V0O1xuXHRcdHRhcmdldCA9IGFyZ3VtZW50c1sxXSB8fCB7fTtcblx0XHQvLyBza2lwIHRoZSBib29sZWFuIGFuZCB0aGUgdGFyZ2V0XG5cdFx0aSA9IDI7XG5cdH0gZWxzZSBpZiAoKHR5cGVvZiB0YXJnZXQgIT09ICdvYmplY3QnICYmIHR5cGVvZiB0YXJnZXQgIT09ICdmdW5jdGlvbicpIHx8IHRhcmdldCA9PSBudWxsKSB7XG5cdFx0dGFyZ2V0ID0ge307XG5cdH1cblxuXHRmb3IgKDsgaSA8IGxlbmd0aDsgKytpKSB7XG5cdFx0b3B0aW9ucyA9IGFyZ3VtZW50c1tpXTtcblx0XHQvLyBPbmx5IGRlYWwgd2l0aCBub24tbnVsbC91bmRlZmluZWQgdmFsdWVzXG5cdFx0aWYgKG9wdGlvbnMgIT0gbnVsbCkge1xuXHRcdFx0Ly8gRXh0ZW5kIHRoZSBiYXNlIG9iamVjdFxuXHRcdFx0Zm9yIChuYW1lIGluIG9wdGlvbnMpIHtcblx0XHRcdFx0c3JjID0gdGFyZ2V0W25hbWVdO1xuXHRcdFx0XHRjb3B5ID0gb3B0aW9uc1tuYW1lXTtcblxuXHRcdFx0XHQvLyBQcmV2ZW50IG5ldmVyLWVuZGluZyBsb29wXG5cdFx0XHRcdGlmICh0YXJnZXQgPT09IGNvcHkpIHtcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFJlY3Vyc2UgaWYgd2UncmUgbWVyZ2luZyBwbGFpbiBvYmplY3RzIG9yIGFycmF5c1xuXHRcdFx0XHRpZiAoZGVlcCAmJiBjb3B5ICYmIChpc1BsYWluT2JqZWN0KGNvcHkpIHx8IChjb3B5SXNBcnJheSA9IEFycmF5LmlzQXJyYXkoY29weSkpKSkge1xuXHRcdFx0XHRcdGlmIChjb3B5SXNBcnJheSkge1xuXHRcdFx0XHRcdFx0Y29weUlzQXJyYXkgPSBmYWxzZTtcblx0XHRcdFx0XHRcdGNsb25lID0gc3JjICYmIEFycmF5LmlzQXJyYXkoc3JjKSA/IHNyYyA6IFtdO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRjbG9uZSA9IHNyYyAmJiBpc1BsYWluT2JqZWN0KHNyYykgPyBzcmMgOiB7fTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBOZXZlciBtb3ZlIG9yaWdpbmFsIG9iamVjdHMsIGNsb25lIHRoZW1cblx0XHRcdFx0XHR0YXJnZXRbbmFtZV0gPSBleHRlbmQoZGVlcCwgY2xvbmUsIGNvcHkpO1xuXG5cdFx0XHRcdC8vIERvbid0IGJyaW5nIGluIHVuZGVmaW5lZCB2YWx1ZXNcblx0XHRcdFx0fSBlbHNlIGlmIChjb3B5ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHR0YXJnZXRbbmFtZV0gPSBjb3B5O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly8gUmV0dXJuIHRoZSBtb2RpZmllZCBvYmplY3Rcblx0cmV0dXJuIHRhcmdldDtcbn07XG5cbiIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIGFzc2VydCA9IGZ1bmN0aW9uIChjb25kaXRpb24sIG1lc3NhZ2UpIHtcbiAgaWYgKCFjb25kaXRpb24pIHtcbiAgICB0aHJvdyBtZXNzYWdlIHx8ICdhc3NlcnRpb24gZmFpbGVkJztcbiAgfVxufTtcblxudmFyIGVtcHR5Rm4gPSBmdW5jdGlvbiAoKSB7fTtcbnZhciBleHRlbmQgPSByZXF1aXJlKCdleHRlbmQnKTtcbnZhciBTdGF0cyA9IHJlcXVpcmUoJ1QzLlN0YXRzJyk7XG52YXIgZGF0ID0gcmVxdWlyZSgnVDMuZGF0Jyk7XG52YXIgVEhSRUUgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5USFJFRSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuVEhSRUUgOiBudWxsKTtcblxudmFyIENvb3JkaW5hdGVzID0gcmVxdWlyZSgnLi4vbW9kZWwvQ29vcmRpbmF0ZXMnKTtcbnZhciBLZXlib2FyZCA9IHJlcXVpcmUoJy4vS2V5Ym9hcmQnKTtcbnZhciBMb29wTWFuYWdlciA9IHJlcXVpcmUoJy4vTG9vcE1hbmFnZXInKTtcbnZhciBUSFJFRXggPSByZXF1aXJlKCcuLi9saWIvVEhSRUV4LycpO1xuLyoqXG4gKiBAbW9kdWxlIGNvbnRyb2xsZXIvQXBwbGljYXRpb25cbiAqL1xuXG4vKipcbiAqIEVhY2ggaW5zdGFuY2UgY29udHJvbHMgb25lIGVsZW1lbnQgb2YgdGhlIERPTSwgYmVzaWRlcyBjcmVhdGluZ1xuICogdGhlIGNhbnZhcyBmb3IgdGhlIHRocmVlLmpzIGFwcCBpdCBjcmVhdGVzIGEgZGF0Lmd1aSBpbnN0YW5jZVxuICogKHRvIGNvbnRyb2wgb2JqZWN0cyBvZiB0aGUgYXBwIHdpdGggYSBndWkpIGFuZCBhIFN0YXRzIGluc3RhbmNlXG4gKiAodG8gdmlldyB0aGUgY3VycmVudCBmcmFtZXJhdGUpXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIEFuIG9iamVjdCBjb250YWluaW5nIHRoZSBmb2xsb3dpbmc6XG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvbmZpZy5pZD1udWxsXSBUaGUgaWQgb2YgdGhlIERPTSBlbGVtZW50IHRvIGluamVjdCB0aGUgZWxlbWVudHMgdG9cbiAqIEBwYXJhbSB7bnVtYmVyfSBbY29uZmlnLndpZHRoPXdpbmRvdy5pbm5lcldpZHRoXVxuICogVGhlIHdpZHRoIG9mIHRoZSBjYW52YXNcbiAqIEBwYXJhbSB7bnVtYmVyfSBbY29uZmlnLmhlaWdodD13aW5kb3cuaW5uZXJIZWlnaHRdXG4gKiBUaGUgaGVpZ2h0IG9mIHRoZSBjYW52YXNcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NvbmZpZy5yZW5kZXJJbW1lZGlhdGVseT10cnVlXVxuICogRmFsc2UgdG8gZGlzYWJsZSB0aGUgZ2FtZSBsb29wIHdoZW4gdGhlIGFwcGxpY2F0aW9uIHN0YXJ0cywgaWZcbiAqIHlvdSB3YW50IHRvIHJlc3VtZSB0aGUgbG9vcCBjYWxsIGBhcHBsaWNhdGlvbi5sb29wTWFuYWdlci5zdGFydCgpYFxuICogQHBhcmFtIHtib29sZWFufSBbY29uZmlnLmluamVjdENhY2hlPWZhbHNlXVxuICogVHJ1ZSB0byBhZGQgYSB3cmFwcGVyIG92ZXIgYFRIUkVFLk9iamVjdDNELnByb3RvdHlwZS5hZGRgIGFuZFxuICogYFRIUkVFLk9iamVjdDNELnByb3RvdHlwZS5yZW1vdmVgIHNvIHRoYXQgaXQgY2F0Y2hlcyB0aGUgbGFzdCBlbGVtZW50XG4gKiBhbmQgcGVyZm9ybSBhZGRpdGlvbmFsIG9wZXJhdGlvbnMgb3ZlciBpdCwgd2l0aCB0aGlzIG1lY2hhbmlzbVxuICogd2UgYWxsb3cgdGhlIGFwcGxpY2F0aW9uIHRvIGhhdmUgYW4gaW50ZXJuYWwgY2FjaGUgb2YgdGhlIGVsZW1lbnRzIG9mXG4gKiB0aGUgYXBwbGljYXRpb25cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NvbmZpZy5mdWxsU2NyZWVuPWZhbHNlXVxuICogVHJ1ZSB0byBtYWtlIHRoaXMgYXBwIGZ1bGxzY3JlZW4gYWRkaW5nIGFkZGl0aW9uYWwgc3VwcG9ydCBmb3JcbiAqIHdpbmRvdyByZXNpemUgZXZlbnRzXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvbmZpZy50aGVtZT0nZGFyayddXG4gKiBUaGVtZSB1c2VkIGluIHRoZSBkZWZhdWx0IHNjZW5lLCBpdCBjYW4gYmUgYGxpZ2h0YCBvciBgZGFya2BcbiAqIEBwYXJhbSB7b2JqZWN0fSBbY29uZmlnLmFtYmllbnRDb25maWc9e31dXG4gKiBBZGRpdGlvbmFsIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBhbWJpZW50LCBzZWUgdGhlIGNsYXNzIHtAbGlua1xuICogQ29vcmRpbmF0ZXN9XG4gKiBAcGFyYW0ge29iamVjdH0gW2NvbmZpZy5kZWZhdWx0U2NlbmVDb25maWc9e31dIEFkZGl0aW9uYWwgY29uZmlnXG4gKiBmb3IgdGhlIGRlZmF1bHQgc2NlbmUgY3JlYXRlZCBmb3IgdGhpcyB3b3JsZFxuICovXG5mdW5jdGlvbiBBcHBsaWNhdGlvbihjb25maWcpIHtcbiAgY29uZmlnID0gZXh0ZW5kKHtcbiAgICBzZWxlY3RvcjogbnVsbCxcbiAgICB3aWR0aDogd2luZG93LmlubmVyV2lkdGgsXG4gICAgaGVpZ2h0OiB3aW5kb3cuaW5uZXJIZWlnaHQsXG4gICAgcmVuZGVySW1tZWRpYXRlbHk6IHRydWUsXG4gICAgaW5qZWN0Q2FjaGU6IGZhbHNlLFxuICAgIGZ1bGxTY3JlZW46IGZhbHNlLFxuICAgIHRoZW1lOiAnZGFyaycsXG4gICAgaGVscGVyc0NvbmZpZzoge30sXG4gICAgZGVmYXVsdFNjZW5lQ29uZmlnOiB7XG4gICAgICBmb2c6IHRydWVcbiAgICB9XG4gIH0sIGNvbmZpZyk7XG5cbiAgdGhpcy5pbml0aWFsQ29uZmlnID0gY29uZmlnO1xuXG4gIC8qKlxuICAgKiBTY2VuZXMgaW4gdGhpcyB3b3JsZCwgZWFjaCBzY2VuZSBzaG91bGQgYmUgbWFwcGVkIHdpdGhcbiAgICogYSB1bmlxdWUgaWRcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIHRoaXMuc2NlbmVzID0ge307XG5cbiAgLyoqXG4gICAqIFRoZSBhY3RpdmUgc2NlbmUgb2YgdGhpcyB3b3JsZFxuICAgKiBAdHlwZSB7VEhSRUUuU2NlbmV9XG4gICAqL1xuICB0aGlzLmFjdGl2ZVNjZW5lID0gbnVsbDtcblxuICAvKipcbiAgICogUmVmZXJlbmNlIHRvIHRoZSBjYW1lcmFzIHVzZWQgaW4gdGhpcyB3b3JsZFxuICAgKiBAdHlwZSB7QXJyYXl9XG4gICAqL1xuICB0aGlzLmNhbWVyYXMgPSB7fTtcblxuICAvKipcbiAgICogVGhlIHdvcmxkIGNhbiBoYXZlIG1hbnkgY2FtZXJhcywgc28gdGhlIHRoaXMgaXMgYSByZWZlcmVuY2UgdG9cbiAgICogdGhlIGFjdGl2ZSBjYW1lcmEgdGhhdCdzIGJlaW5nIHVzZWQgcmlnaHQgbm93XG4gICAqIEB0eXBlIHtUMy5tb2RlbC5DYW1lcmF9XG4gICAqL1xuICB0aGlzLmFjdGl2ZUNhbWVyYSA9IG51bGw7XG5cbiAgLyoqXG4gICAqIFRIUkVFIFJlbmRlcmVyXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICB0aGlzLnJlbmRlcmVyID0gbnVsbDtcblxuICAvKipcbiAgICogS2V5Ym9hcmQgbWFuYWdlclxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgdGhpcy5rZXlib2FyZCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIERhdCBndWkgbWFuYWdlclxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgdGhpcy5kYXRndWkgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBSZWZlcmVuY2UgdG8gdGhlIFN0YXRzIGluc3RhbmNlIChuZWVkZWQgdG8gY2FsbCB1cGRhdGVcbiAgICogb24gdGhlIG1ldGhvZCB7QGxpbmsgbW9kdWxlOmNvbnRyb2xsZXIvQXBwbGljYXRpb24jdXBkYXRlfSlcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIHRoaXMuc3RhdHMgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBSZWZlcmVuY2UgdG8gdGhlIGxvY2FsIGxvb3AgbWFuYWdlclxuICAgKiBAdHlwZSB7TG9vcE1hbmFnZXJ9XG4gICAqL1xuICB0aGlzLmxvb3BNYW5hZ2VyID0gbnVsbDtcblxuICAvKipcbiAgICogQ29sb3JzIGZvciB0aGUgZGVmYXVsdCBzY2VuZVxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgdGhpcy50aGVtZSA9IG51bGw7XG5cbiAgLyoqXG4gICAqIEFwcGxpY2F0aW9uIGNhY2hlXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICB0aGlzLl9fdDNjYWNoZV9fID0ge307XG5cbiAgQXBwbGljYXRpb24ucHJvdG90eXBlLmluaXRBcHBsaWNhdGlvbi5jYWxsKHRoaXMpO1xufVxuXG4vKipcbiAqIEdldHRlciBmb3IgdGhlIGluaXRpYWwgY29uZmlnXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5nZXRDb25maWcgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmluaXRpYWxDb25maWc7XG59O1xuXG4vKipcbiAqIEJvb3RzdHJhcCB0aGUgYXBwbGljYXRpb24gd2l0aCB0aGUgZm9sbG93aW5nIHN0ZXBzOlxuICpcbiAqIC0gRW5hYmxpbmcgY2FjaGUgaW5qZWN0aW9uXG4gKiAtIFNldCB0aGUgdGhlbWVcbiAqIC0gQ3JlYXRlIHRoZSByZW5kZXJlciwgZGVmYXVsdCBzY2VuZSwgZGVmYXVsdCBjYW1lcmEsIHNvbWUgcmFuZG9tIGxpZ2h0c1xuICogLSBJbml0aWFsaXplcyBkYXQuZ3VpLCBTdGF0cywgYSBtYXNrIHdoZW4gdGhlIGFwcGxpY2F0aW9uIGlzIHBhaXNlZFxuICogLSBJbml0aWFsaXplcyBmdWxsU2NyZWVuIGV2ZW50cywga2V5Ym9hcmQgYW5kIHNvbWUgaGVscGVyIG9iamVjdHNcbiAqIC0gQ2FsbHMgdGhlIGdhbWUgbG9vcFxuICpcbiAqL1xuQXBwbGljYXRpb24ucHJvdG90eXBlLmluaXRBcHBsaWNhdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG1lID0gdGhpcyxcbiAgICBjb25maWcgPSBtZS5nZXRDb25maWcoKTtcblxuICBtZS5pbmplY3RDYWNoZShjb25maWcuaW5qZWN0Q2FjaGUpO1xuXG4gIC8vIHRoZW1lXG4gIG1lLnNldFRoZW1lKGNvbmZpZy50aGVtZSk7XG5cbiAgLy8gZGVmYXVsdHNcbiAgbWUuY3JlYXRlRGVmYXVsdFJlbmRlcmVyKCk7XG4gIG1lLmNyZWF0ZURlZmF1bHRTY2VuZSgpO1xuICBtZS5jcmVhdGVEZWZhdWx0Q2FtZXJhKCk7XG4gIG1lLmNyZWF0ZURlZmF1bHRMaWdodHMoKTtcblxuICAvLyB1dGlsc1xuICBtZS5pbml0RGF0R3VpKCk7XG4gIG1lLmluaXRTdGF0cygpO1xuICBtZS5pbml0TWFzaygpXG4gICAgLm1hc2tWaXNpYmxlKCFjb25maWcucmVuZGVySW1tZWRpYXRlbHkpO1xuICBtZS5pbml0RnVsbFNjcmVlbigpO1xuICBtZS5pbml0S2V5Ym9hcmQoKTtcbiAgbWUuaW5pdENvb3JkaW5hdGVzKCk7XG5cbiAgLy8gZ2FtZSBsb29wXG4gIG1lLmdhbWVMb29wKCk7XG59O1xuXG4vKipcbiAqIFNldHMgdGhlIGFjdGl2ZSBzY2VuZSAoaXQgbXVzdCBiZSBhIHJlZ2lzdGVyZWQgc2NlbmUgcmVnaXN0ZXJlZFxuICogd2l0aCB7QGxpbmsgI2FkZFNjZW5lfSlcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIHN0cmluZyB3aGljaCB3YXMgdXNlZCB0byByZWdpc3RlciB0aGUgc2NlbmVcbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5zZXRBY3RpdmVTY2VuZSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgdGhpcy5hY3RpdmVTY2VuZSA9IHRoaXMuc2NlbmVzW2tleV07XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGRzIGEgc2NlbmUgdG8gdGhlIHNjZW5lIHBvb2xcbiAqIEBwYXJhbSB7VEhSRUUuU2NlbmV9IHNjZW5lXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5BcHBsaWNhdGlvbi5wcm90b3R5cGUuYWRkU2NlbmUgPSBmdW5jdGlvbiAoc2NlbmUsIGtleSkge1xuICBjb25zb2xlLmFzc2VydChzY2VuZSBpbnN0YW5jZW9mIFRIUkVFLlNjZW5lKTtcbiAgdGhpcy5zY2VuZXNba2V5XSA9IHNjZW5lO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIHNjZW5lIGNhbGxlZCAnZGVmYXVsdCcgYW5kIHNldHMgaXQgYXMgdGhlIGFjdGl2ZSBvbmVcbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5jcmVhdGVEZWZhdWx0U2NlbmUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBtZSA9IHRoaXMsXG4gICAgY29uZmlnID0gbWUuZ2V0Q29uZmlnKCksXG4gICAgZGVmYXVsdFNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG4gIGlmIChjb25maWcuZGVmYXVsdFNjZW5lQ29uZmlnLmZvZykge1xuICAgIGRlZmF1bHRTY2VuZS5mb2cgPSBuZXcgVEhSRUUuRm9nKG1lLnRoZW1lLmZvZ0NvbG9yLCAyMDAwLCA0MDAwKTtcbiAgfVxuICBtZVxuICAgIC5hZGRTY2VuZShkZWZhdWx0U2NlbmUsICdkZWZhdWx0JylcbiAgICAuc2V0QWN0aXZlU2NlbmUoJ2RlZmF1bHQnKTtcbiAgcmV0dXJuIG1lO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIHRoZSBkZWZhdWx0IFRIUkVFLldlYkdMUmVuZGVyZXIgdXNlZCBpbiB0aGUgd29ybGRcbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5jcmVhdGVEZWZhdWx0UmVuZGVyZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBtZSA9IHRoaXMsXG4gICAgY29uZmlnID0gbWUuZ2V0Q29uZmlnKCk7XG4gIHZhciByZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHtcbi8vICAgICAgYW50aWFsaWFzOiB0cnVlXG4gIH0pO1xuICByZW5kZXJlci5zZXRDbGVhckNvbG9yKG1lLnRoZW1lLmNsZWFyQ29sb3IsIDEpO1xuICByZW5kZXJlci5zZXRTaXplKGNvbmZpZy53aWR0aCwgY29uZmlnLmhlaWdodCk7XG4gIGRvY3VtZW50XG4gICAgLnF1ZXJ5U2VsZWN0b3IoY29uZmlnLnNlbGVjdG9yKVxuICAgIC5hcHBlbmRDaGlsZChyZW5kZXJlci5kb21FbGVtZW50KTtcbiAgbWUucmVuZGVyZXIgPSByZW5kZXJlcjtcbiAgcmV0dXJuIG1lO1xufTtcblxuQXBwbGljYXRpb24ucHJvdG90eXBlLnNldEFjdGl2ZUNhbWVyYSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgdGhpcy5hY3RpdmVDYW1lcmEgPSB0aGlzLmNhbWVyYXNba2V5XTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5BcHBsaWNhdGlvbi5wcm90b3R5cGUuYWRkQ2FtZXJhID0gZnVuY3Rpb24gKGNhbWVyYSwga2V5KSB7XG4gIGNvbnNvbGUuYXNzZXJ0KGNhbWVyYSBpbnN0YW5jZW9mIFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhIHx8XG4gICAgY2FtZXJhIGluc3RhbmNlb2YgVEhSRUUuT3J0aG9ncmFwaGljQ2FtZXJhKTtcbiAgdGhpcy5jYW1lcmFzW2tleV0gPSBjYW1lcmE7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBDcmVhdGUgdGhlIGRlZmF1bHQgY2FtZXJhIHVzZWQgaW4gdGhpcyB3b3JsZCB3aGljaCBpc1xuICogYSBgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmFgLCBpdCBhbHNvIGFkZHMgb3JiaXQgY29udHJvbHNcbiAqIGJ5IGNhbGxpbmcge0BsaW5rICNjcmVhdGVDYW1lcmFDb250cm9sc31cbiAqL1xuQXBwbGljYXRpb24ucHJvdG90eXBlLmNyZWF0ZURlZmF1bHRDYW1lcmEgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBtZSA9IHRoaXMsXG4gICAgY29uZmlnID0gbWUuZ2V0Q29uZmlnKCksXG4gICAgd2lkdGggPSBjb25maWcud2lkdGgsXG4gICAgaGVpZ2h0ID0gY29uZmlnLmhlaWdodCxcbiAgICBkZWZhdWx0cyA9IHtcbiAgICAgIGZvdjogMzgsXG4gICAgICByYXRpbzogd2lkdGggLyBoZWlnaHQsXG4gICAgICBuZWFyOiAxLFxuICAgICAgZmFyOiAxMDAwMFxuICAgIH0sXG4gICAgZGVmYXVsdENhbWVyYTtcblxuICBkZWZhdWx0Q2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKFxuICAgIGRlZmF1bHRzLmZvdixcbiAgICBkZWZhdWx0cy5yYXRpbyxcbiAgICBkZWZhdWx0cy5uZWFyLFxuICAgIGRlZmF1bHRzLmZhclxuICApO1xuICBkZWZhdWx0Q2FtZXJhLnBvc2l0aW9uLnNldCg1MDAsIDMwMCwgNTAwKTtcblxuICAvLyB0cmFuc3BhcmVudGx5IHN1cHBvcnQgd2luZG93IHJlc2l6ZVxuICBpZiAoY29uZmlnLmZ1bGxTY3JlZW4pIHtcbiAgICBUSFJFRXguV2luZG93UmVzaXplLmJpbmQobWUucmVuZGVyZXIsIGRlZmF1bHRDYW1lcmEpO1xuICB9XG5cbiAgbWVcbiAgICAuY3JlYXRlQ2FtZXJhQ29udHJvbHMoZGVmYXVsdENhbWVyYSlcbiAgICAuYWRkQ2FtZXJhKGRlZmF1bHRDYW1lcmEsICdkZWZhdWx0JylcbiAgICAuc2V0QWN0aXZlQ2FtZXJhKCdkZWZhdWx0Jyk7XG5cbiAgcmV0dXJuIG1lO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIE9yYml0Q29udHJvbHMgb3ZlciB0aGUgYGNhbWVyYWAgcGFzc2VkIGFzIHBhcmFtXG4gKiBAcGFyYW0gIHtUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYXxUSFJFRS5PcnRvZ3JhcGhpY0NhbWVyYX0gY2FtZXJhXG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5BcHBsaWNhdGlvbi5wcm90b3R5cGUuY3JlYXRlQ2FtZXJhQ29udHJvbHMgPSBmdW5jdGlvbiAoY2FtZXJhKSB7XG4gIHZhciBtZSA9IHRoaXM7XG4gIGNhbWVyYS5jYW1lcmFDb250cm9scyA9IG5ldyBUSFJFRS5PcmJpdENvbnRyb2xzKFxuICAgIGNhbWVyYSxcbiAgICBtZS5yZW5kZXJlci5kb21FbGVtZW50XG4gICk7XG4gIC8vIGF2b2lkIHBhbm5pbmcgdG8gc2VlIHRoZSBib3R0b20gZmFjZVxuICAvL2NhbWVyYS5jYW1lcmFDb250cm9scy5tYXhQb2xhckFuZ2xlID0gTWF0aC5QSSAvIDIgKiAwLjk5O1xuICAvL2NhbWVyYS5jYW1lcmFDb250cm9scy50YXJnZXQuc2V0KDEwMCwgMTAwLCAxMDApO1xuICBjYW1lcmEuY2FtZXJhQ29udHJvbHMudGFyZ2V0LnNldCgwLCAwLCAwKTtcbiAgcmV0dXJuIG1lO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIHNvbWUgcmFuZG9tIGxpZ2h0cyBpbiB0aGUgZGVmYXVsdCBzY2VuZVxuICogQHJldHVybiB7dGhpc31cbiAqL1xuQXBwbGljYXRpb24ucHJvdG90eXBlLmNyZWF0ZURlZmF1bHRMaWdodHMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBsaWdodCxcbiAgICAgIHNjZW5lID0gdGhpcy5zY2VuZXNbJ2RlZmF1bHQnXTtcblxuICBsaWdodCA9IG5ldyBUSFJFRS5BbWJpZW50TGlnaHQoMHgyMjIyMjIpO1xuICBzY2VuZS5hZGQobGlnaHQpLmNhY2hlKCdhbWJpZW50LWxpZ2h0LTEnKTtcblxuICBsaWdodCA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KCAweEZGRkZGRiwgMS4wICk7XG4gIGxpZ2h0LnBvc2l0aW9uLnNldCggMjAwLCA0MDAsIDUwMCApO1xuICBzY2VuZS5hZGQobGlnaHQpLmNhY2hlKCdkaXJlY3Rpb25hbC1saWdodC0xJyk7XG5cbiAgbGlnaHQgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCggMHhGRkZGRkYsIDEuMCApO1xuICBsaWdodC5wb3NpdGlvbi5zZXQoIC01MDAsIDI1MCwgLTIwMCApO1xuICBzY2VuZS5hZGQobGlnaHQpLmNhY2hlKCdkaXJlY3Rpb25hbC1saWdodC0yJyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldHMgdGhlIHRoZW1lIHRvIGJlIHVzZWQgaW4gdGhlIGRlZmF1bHQgc2NlbmVcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIEVpdGhlciB0aGUgc3RyaW5nIGBkYXJrYCBvciBgbGlnaHRgXG4gKiBAdG9kbyBNYWtlIHRoZSB0aGVtZSBzeXN0ZW0gZXh0ZW5zaWJsZVxuICogQHJldHVybiB7dGhpc31cbiAqL1xuQXBwbGljYXRpb24ucHJvdG90eXBlLnNldFRoZW1lID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgdmFyIG1lID0gdGhpcyxcbiAgICB0aGVtZXMgPSByZXF1aXJlKCcuLi8nKS50aGVtZXM7XG4gIGFzc2VydCh0aGVtZXNbbmFtZV0pO1xuICBtZS50aGVtZSA9IHRoZW1lc1tuYW1lXTtcbiAgcmV0dXJuIG1lO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbWFzayBvbiB0b3Agb2YgdGhlIGNhbnZhcyB3aGVuIGl0J3MgcGF1c2VkXG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5BcHBsaWNhdGlvbi5wcm90b3R5cGUuaW5pdE1hc2sgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBtZSA9IHRoaXMsXG4gICAgY29uZmlnID0gbWUuZ2V0Q29uZmlnKCksXG4gICAgbWFzayxcbiAgICBoaWRkZW47XG4gIG1hc2sgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgbWFzay5jbGFzc05hbWUgPSAndDMtbWFzayc7XG4gIC8vIG1hc2suc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgbWFzay5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gIG1hc2suc3R5bGUudG9wID0gJzBweCc7XG4gIG1hc2suc3R5bGUud2lkdGggPSAnMTAwJSc7XG4gIG1hc2suc3R5bGUuaGVpZ2h0ID0gJzEwMCUnO1xuICBtYXNrLnN0eWxlLmJhY2tncm91bmQgPSAncmdiYSgwLDAsMCwwLjUpJztcblxuICBkb2N1bWVudFxuICAgIC5xdWVyeVNlbGVjdG9yKGNvbmZpZy5zZWxlY3RvcilcbiAgICAuYXBwZW5kQ2hpbGQobWFzayk7XG5cbiAgbWUubWFzayA9IG1hc2s7XG4gIHJldHVybiBtZTtcbn07XG5cbi8qKlxuICogVXBkYXRlcyB0aGUgbWFzayB2aXNpYmlsaXR5XG4gKiBAcGFyYW0gIHtib29sZWFufSB2IFRydWUgdG8gbWFrZSBpdCB2aXNpYmxlXG4gKi9cbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5tYXNrVmlzaWJsZSA9IGZ1bmN0aW9uICh2KSB7XG4gIHZhciBtYXNrID0gdGhpcy5tYXNrO1xuICBtYXNrLnN0eWxlLmRpc3BsYXkgPSB2ID8gJ2Jsb2NrJyA6ICdub25lJztcbn07XG5cbi8qKlxuICogSW5pdHMgdGhlIGRhdC5ndWkgaGVscGVyIHdoaWNoIGlzIHBsYWNlZCB1bmRlciB0aGVcbiAqIERPTSBlbGVtZW50IGlkZW50aWZpZWQgYnkgdGhlIGluaXRpYWwgY29uZmlndXJhdGlvbiBzZWxlY3RvclxuICogQHJldHVybiB7dGhpc31cbiAqL1xuQXBwbGljYXRpb24ucHJvdG90eXBlLmluaXREYXRHdWkgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBtZSA9IHRoaXMsXG4gICAgY29uZmlnID0gbWUuZ2V0Q29uZmlnKCksXG4gICAgZ3VpID0gbmV3IGRhdC5HVUkoe1xuICAgICAgYXV0b1BsYWNlOiBmYWxzZVxuICAgIH0pO1xuXG4gIGV4dGVuZChndWkuZG9tRWxlbWVudC5zdHlsZSwge1xuICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgIHRvcDogJzBweCcsXG4gICAgcmlnaHQ6ICcwcHgnLFxuICAgIHpJbmRleDogJzEnXG4gIH0pO1xuICBkb2N1bWVudFxuICAgIC5xdWVyeVNlbGVjdG9yKGNvbmZpZy5zZWxlY3RvcilcbiAgICAuYXBwZW5kQ2hpbGQoZ3VpLmRvbUVsZW1lbnQpO1xuICBtZS5kYXRndWkgPSBndWk7XG4gIHJldHVybiBtZTtcbn07XG5cbi8qKlxuICogSW5pdCB0aGUgU3RhdHMgaGVscGVyIHdoaWNoIGlzIHBsYWNlZCB1bmRlciB0aGVcbiAqIERPTSBlbGVtZW50IGlkZW50aWZpZWQgYnkgdGhlIGluaXRpYWwgY29uZmlndXJhdGlvbiBzZWxlY3RvclxuICogQHJldHVybiB7dGhpc31cbiAqL1xuQXBwbGljYXRpb24ucHJvdG90eXBlLmluaXRTdGF0cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG1lID0gdGhpcyxcbiAgICBjb25maWcgPSBtZS5nZXRDb25maWcoKSxcbiAgICBzdGF0cztcbiAgLy8gYWRkIFN0YXRzLmpzIC0gaHR0cHM6Ly9naXRodWIuY29tL21yZG9vYi9zdGF0cy5qc1xuICBzdGF0cyA9IG5ldyBTdGF0cygpO1xuICBleHRlbmQoc3RhdHMuZG9tRWxlbWVudC5zdHlsZSwge1xuICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgIHpJbmRleDogMSxcbiAgICBib3R0b206ICcwcHgnXG4gIH0pO1xuICBkb2N1bWVudFxuICAgIC5xdWVyeVNlbGVjdG9yKGNvbmZpZy5zZWxlY3RvcilcbiAgICAuYXBwZW5kQ2hpbGQoIHN0YXRzLmRvbUVsZW1lbnQgKTtcbiAgbWUuc3RhdHMgPSBzdGF0cztcbiAgcmV0dXJuIG1lO1xufTtcblxuLyoqXG4gKiBCaW5kcyB0aGUgRiBrZXkgdG8gbWFrZSBhIHdvcmxkIGdvIGZ1bGwgc2NyZWVuXG4gKiBAdG9kbyBUaGlzIHNob3VsZCBiZSB1c2VkIG9ubHkgd2hlbiB0aGUgY2FudmFzIGlzIGFjdGl2ZVxuICovXG5BcHBsaWNhdGlvbi5wcm90b3R5cGUuaW5pdEZ1bGxTY3JlZW4gPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjb25maWcgPSB0aGlzLmdldENvbmZpZygpO1xuICAvLyBhbGxvdyAnZicgdG8gZ28gZnVsbHNjcmVlbiB3aGVyZSB0aGlzIGZlYXR1cmUgaXMgc3VwcG9ydGVkXG4gIGlmKGNvbmZpZy5mdWxsU2NyZWVuICYmIFRIUkVFeC5GdWxsU2NyZWVuLmF2YWlsYWJsZSgpKSB7XG4gICAgVEhSRUV4LkZ1bGxTY3JlZW4uYmluZEtleSgpO1xuICB9XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemVzIHRoZSBjb29yZGluYXRlIGhlbHBlciAoaXRzIHdyYXBwZWQgaW4gYSBtb2RlbCBpbiBUMylcbiAqL1xuQXBwbGljYXRpb24ucHJvdG90eXBlLmluaXRDb29yZGluYXRlcyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGNvbmZpZyA9IHRoaXMuZ2V0Q29uZmlnKCk7XG4gIHRoaXMuc2NlbmVzWydkZWZhdWx0J11cbiAgICAuYWRkKFxuICAgICAgbmV3IENvb3JkaW5hdGVzKGNvbmZpZy5oZWxwZXJzQ29uZmlnLCB0aGlzLnRoZW1lKVxuICAgICAgICAuaW5pdERhdEd1aSh0aGlzLmRhdGd1aSlcbiAgICAgICAgLm1lc2hcbiAgICApO1xufTtcblxuLyoqXG4gKiBJbml0aXMgdGhlIGtleWJvYXJkIGhlbHBlclxuICogQHJldHVybiB7dGhpc31cbiAqL1xuQXBwbGljYXRpb24ucHJvdG90eXBlLmluaXRLZXlib2FyZCA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5rZXlib2FyZCA9IG5ldyBLZXlib2FyZCgpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW5pdGlhbGl6ZXMgdGhlIGdhbWUgbG9vcCBieSBjcmVhdGluZyBhbiBpbnN0YW5jZSBvZiB7QGxpbmsgTG9vcE1hbmFnZXJ9XG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5BcHBsaWNhdGlvbi5wcm90b3R5cGUuZ2FtZUxvb3AgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjb25maWcgPSB0aGlzLmdldENvbmZpZygpO1xuICB0aGlzLmxvb3BNYW5hZ2VyID0gbmV3IExvb3BNYW5hZ2VyKHRoaXMsIGNvbmZpZy5yZW5kZXJJbW1lZGlhdGVseSlcbiAgICAuaW5pdERhdEd1aSh0aGlzLmRhdGd1aSlcbiAgICAuYW5pbWF0ZSgpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogVXBkYXRlIHBoYXNlLCB0aGUgd29ybGQgdXBkYXRlcyBieSBkZWZhdWx0OlxuICpcbiAqIC0gVGhlIHN0YXRzIGhlbHBlclxuICogLSBUaGUgY2FtZXJhIGNvbnRyb2xzIGlmIHRoZSBhY3RpdmUgY2FtZXJhIGhhcyBvbmVcbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gZGVsdGEgVGhlIG51bWJlciBvZiBzZWNvbmRzIGVsYXBzZWRcbiAqL1xuQXBwbGljYXRpb24ucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChkZWx0YSkge1xuICB2YXIgbWUgPSB0aGlzO1xuXG4gIC8vIHN0YXRzIGhlbHBlclxuICBtZS5zdGF0cy51cGRhdGUoKTtcblxuICAvLyBjYW1lcmEgdXBkYXRlXG4gIGlmIChtZS5hY3RpdmVDYW1lcmEuY2FtZXJhQ29udHJvbHMpIHtcbiAgICBtZS5hY3RpdmVDYW1lcmEuY2FtZXJhQ29udHJvbHMudXBkYXRlKGRlbHRhKTtcbiAgfVxufTtcblxuLyoqXG4gKiBSZW5kZXIgcGhhc2UsIGNhbGxzIGB0aGlzLnJlbmRlcmVyYCB3aXRoIGB0aGlzLmFjdGl2ZVNjZW5lYCBhbmRcbiAqIGB0aGlzLmFjdGl2ZUNhbWVyYWBcbiAqL1xuQXBwbGljYXRpb24ucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG1lID0gdGhpcztcbiAgbWUucmVuZGVyZXIucmVuZGVyKFxuICAgIG1lLmFjdGl2ZVNjZW5lLFxuICAgIG1lLmFjdGl2ZUNhbWVyYVxuICApO1xufTtcblxuLyoqXG4gKiBXcmFwcyBgVEhSRUUuT2JqZWN0M0QucHJvdG90eXBlLmFkZGAgYW5kIGBUSFJFRS5PYmplY3QzRC5wcm90b3R5cGUucmVtb3ZlYFxuICogd2l0aCBmdW5jdGlvbnMgdGhhdCBzYXZlIHRoZSBsYXN0IG9iamVjdCB3aGljaCBgYWRkYCBvciBgcmVtb3ZlYCBoYXZlIGJlZW5cbiAqIGNhbGxlZCB3aXRoLCB0aGlzIGFsbG93cyB0byBjYWxsIHRoZSBtZXRob2QgYGNhY2hlYCB3aGljaCB3aWxsIGNhY2hlXG4gKiB0aGUgb2JqZWN0IHdpdGggYW4gaWRlbnRpZmllciBhbGxvd2luZyBmYXN0IG9iamVjdCByZXRyaWV2YWxcbiAqXG4gKiBAZXhhbXBsZVxuICpcbiAqICAgdmFyIGluc3RhbmNlID0gdDMuQXBwbGljYXRpb24ucnVuKHtcbiAqICAgICBpbmplY3RDYWNoZTogdHJ1ZSxcbiAqICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gKiAgICAgICB2YXIgZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcbiAqICAgICAgIHZhciBpbm5lckdyb3VwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XG4gKlxuICogICAgICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5KDEsMSwxKTtcbiAqICAgICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7Y29sb3I6IDB4MDBmZjAwfSk7XG4gKiAgICAgICB2YXIgY3ViZSA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XG4gKlxuICogICAgICAgaW5uZXJHcm91cFxuICogICAgICAgICAuYWRkKGN1YmUpXG4gKiAgICAgICAgIC5jYWNoZSgnbXlDdWJlJyk7XG4gKlxuICogICAgICAgZ3JvdXBcbiAqICAgICAgICAgLmFkZChpbm5lckdyb3VwKVxuICogICAgICAgICAuY2FjaGUoJ2lubmVyR3JvdXAnKTtcbiAqXG4gKiAgICAgICAvLyByZW1vdmFsIGV4YW1wbGVcbiAqICAgICAgIC8vIGdyb3VwXG4gKiAgICAgICAvLyAgIC5yZW1vdmUoaW5uZXJHcm91cClcbiAqICAgICAgIC8vICAgLmNhY2hlKCk7XG4gKlxuICogICAgICAgdGhpcy5hY3RpdmVTY2VuZVxuICogICAgICAgICAuYWRkKGdyb3VwKVxuICogICAgICAgICAuY2FjaGUoJ2dyb3VwJyk7XG4gKiAgICAgfSxcbiAqXG4gKiAgICAgdXBkYXRlOiBmdW5jdGlvbiAoZGVsdGEpIHtcbiAqICAgICAgIHZhciBjdWJlID0gdGhpcy5nZXRGcm9tQ2FjaGUoJ215Q3ViZScpO1xuICogICAgICAgLy8gcGVyZm9ybSBvcGVyYXRpb25zIG9uIHRoZSBjdWJlXG4gKiAgICAgfVxuICogICB9KTtcbiAqXG4gKiBAcGFyYW0gIHtib29sZWFufSBpbmplY3QgVHJ1ZSB0byBlbmFibGUgdGhpcyBiZWhhdmlvclxuICovXG5BcHBsaWNhdGlvbi5wcm90b3R5cGUuaW5qZWN0Q2FjaGUgPSBmdW5jdGlvbiAoaW5qZWN0KSB7XG4gIHZhciBtZSA9IHRoaXMsXG4gICAgICBsYXN0T2JqZWN0LFxuICAgICAgbGFzdE1ldGhvZCxcbiAgICAgIGFkZCA9IFRIUkVFLk9iamVjdDNELnByb3RvdHlwZS5hZGQsXG4gICAgICByZW1vdmUgPSBUSFJFRS5PYmplY3QzRC5wcm90b3R5cGUucmVtb3ZlLFxuICAgICAgY2FjaGUgPSB0aGlzLl9fdDNjYWNoZV9fO1xuXG4gIGlmIChpbmplY3QpIHtcbiAgICBUSFJFRS5PYmplY3QzRC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgICAgbGFzdE1ldGhvZCA9ICdhZGQnO1xuICAgICAgbGFzdE9iamVjdCA9IG9iamVjdDtcbiAgICAgIHJldHVybiBhZGQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgVEhSRUUuT2JqZWN0M0QucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICAgIGxhc3RNZXRob2QgPSAncmVtb3ZlJztcbiAgICAgIGxhc3RPYmplY3QgPSBvYmplY3Q7XG4gICAgICByZXR1cm4gcmVtb3ZlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIFRIUkVFLk9iamVjdDNELnByb3RvdHlwZS5jYWNoZSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICBhc3NlcnQobGFzdE9iamVjdCwgJ1QzLkFwcGxpY2F0aW9uLnByb3RvdHlwZS5jYWNoZTogdGhpcyBtZXRob2QnICtcbiAgICAgICAgJyBuZWVkcyBhIHByZXZpb3VzIGNhbGwgdG8gYWRkL3JlbW92ZScpO1xuICAgICAgaWYgKGxhc3RNZXRob2QgPT09ICdhZGQnKSB7XG4gICAgICAgIGxhc3RPYmplY3QubmFtZSA9IGxhc3RPYmplY3QubmFtZSB8fCBuYW1lO1xuICAgICAgICBhc3NlcnQobGFzdE9iamVjdC5uYW1lKTtcbiAgICAgICAgY2FjaGVbbGFzdE9iamVjdC5uYW1lXSA9IGxhc3RPYmplY3Q7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhc3NlcnQobGFzdE9iamVjdC5uYW1lKTtcbiAgICAgICAgZGVsZXRlIGNhY2hlW2xhc3RPYmplY3QubmFtZV07XG4gICAgICB9XG4gICAgICBsYXN0T2JqZWN0ID0gbnVsbDtcbiAgICAgIHJldHVybiBtZTtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIFRIUkVFLk9iamVjdDNELnByb3RvdHlwZS5jYWNoZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gIH1cbn07XG5cbi8qKlxuICogR2V0cyBhbiBvYmplY3QgZnJvbSB0aGUgY2FjaGUgaWYgYGluamVjdENhY2hlYCB3YXMgZW5hYmxlZCBhbmRcbiAqIGFuIG9iamVjdCB3YXMgcmVnaXN0ZXJlZCB3aXRoIHtAbGluayAjY2FjaGV9XG4gKiBAcGFyYW0gIHtzdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge1RIUkVFLk9iamVjdDNEfVxuICovXG5BcHBsaWNhdGlvbi5wcm90b3R5cGUuZ2V0RnJvbUNhY2hlID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIHRoaXMuX190M2NhY2hlX19bbmFtZV07XG59O1xuXG4vKipcbiAqIEBzdGF0aWNcbiAqIENyZWF0ZXMgYSBzdWJjbGFzcyBvZiBBcHBsaWNhdGlvbiB3aG9zZSBpbnN0YW5jZXMgZG9uJ3QgbmVlZCB0b1xuICogd29ycnkgYWJvdXQgdGhlIGluaGVyaXRhbmNlIHByb2Nlc3NcbiAqIEBwYXJhbSAge09iamVjdH0gb3B0aW9ucyBUaGUgc2FtZSBvYmplY3QgcGFzc2VkIHRvIHRoZSB7QGxpbmsgQXBwbGljYXRpb259XG4gKiBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMuaW5pdCBJbml0aWFsaXphdGlvbiBwaGFzZSwgZnVuY3Rpb24gY2FsbGVkIGluXG4gKiB0aGUgY29uc3RydWN0b3Igb2YgdGhlIHN1YmNsYXNzXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucy51cGRhdGUgVXBkYXRlIHBoYXNlLCBmdW5jdGlvbiBjYWxsZWQgYXMgdGhlXG4gKiB1cGRhdGUgZnVuY3Rpb24gb2YgdGhlIHN1YmNsYXNzLCBpdCBhbHNvIGNhbGxzIEFwcGxpY2F0aW9uJ3MgdXBkYXRlXG4gKiBAcmV0dXJuIHt0My5RdWlja0xhdW5jaH0gQW4gaW5zdGFuY2Ugb2YgdGhlIHN1YmNsYXNzIGNyZWF0ZWQgaW5cbiAqIHRoaXMgZnVuY3Rpb25cbiAqL1xuQXBwbGljYXRpb24ucnVuID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgb3B0aW9ucy5pbml0ID0gb3B0aW9ucy5pbml0IHx8IGVtcHR5Rm47XG4gIG9wdGlvbnMudXBkYXRlID0gb3B0aW9ucy51cGRhdGUgfHwgZW1wdHlGbjtcbiAgYXNzZXJ0KG9wdGlvbnMuc2VsZWN0b3IsICdjYW52YXMgc2VsZWN0b3IgcmVxdWlyZWQnKTtcblxuICB2YXIgUXVpY2tMYXVuY2ggPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIEFwcGxpY2F0aW9uLmNhbGwodGhpcywgb3B0aW9ucyk7XG4gICAgb3B0aW9ucy5pbml0LmNhbGwodGhpcywgb3B0aW9ucyk7XG4gIH07XG4gIFF1aWNrTGF1bmNoLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQXBwbGljYXRpb24ucHJvdG90eXBlKTtcblxuICBRdWlja0xhdW5jaC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKGRlbHRhKSB7XG4gICAgQXBwbGljYXRpb24ucHJvdG90eXBlLnVwZGF0ZS5jYWxsKHRoaXMsIGRlbHRhKTtcbiAgICBvcHRpb25zLnVwZGF0ZS5jYWxsKHRoaXMsIGRlbHRhKTtcbiAgfTtcblxuICByZXR1cm4gbmV3IFF1aWNrTGF1bmNoKG9wdGlvbnMpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBBcHBsaWNhdGlvbjtcbn0pLmNhbGwodGhpcyx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiLyoqXG4gKiBAbW9kdWxlICBjb250cm9sbGVyL0tleWJvYXJkXG4gKi9cblxuLyoqXG4gKiBLZXlib2FyZCBoZWxwZXJcbiAqIEBjbGFzc1xuICovXG5mdW5jdGlvbiBLZXlib2FyZCgpIHtcbiAgLyoqXG4gICAqIEVhY2ggaW5kZXggY29ycmVzcG9uZCB0byB0aGUgYXNjaWkgdmFsdWUgb2YgdGhlXG4gICAqIGtleSBwcmVzc2VkXG4gICAqIEB0eXBlIHtBcnJheX1cbiAgICovXG4gIHRoaXMua2V5cyA9IFtdO1xufVxuXG4vKipcbiAqIEFkZHMgdGhlIGtleWRvd24gYW5kIGtleXVwIGxpc3RlbmVyc1xuICovXG5LZXlib2FyZC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG1lID0gdGhpcyxcbiAgICBpO1xuICBmb3IgKGkgPSAwOyBpIDwgMjU2OyBpICs9IDEpIHtcbiAgICBtZS5rZXlzW2ldID0gZmFsc2U7XG4gIH1cbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG1lLm9uS2V5RG93bigpLCBmYWxzZSk7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgbWUub25LZXlVcCgpLCBmYWxzZSk7XG59O1xuXG4vKipcbiAqIFNldHMgYGV2ZW50LmtleWNvZGVgIGFzIGEgcHJlc2VlZCBrZXlcbiAqIEByZXR1cm4ge2Z1bmN0aW9ufVxuICovXG5LZXlib2FyZC5wcm90b3R5cGUub25LZXlEb3duID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbWUgPSB0aGlzO1xuICByZXR1cm4gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgbWUua2V5c1tldmVudC5rZXlDb2RlXSA9IHRydWU7XG4gIH07XG59O1xuXG4vKipcbiAqIFNldHMgYGV2ZW50LmtleWNvZGVgIGFzIGFuIHVucHJlc3NlZCBrZXlcbiAqIEByZXR1cm4ge2Z1bmN0aW9ufVxuICovXG5LZXlib2FyZC5wcm90b3R5cGUub25LZXlVcCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG1lID0gdGhpcztcbiAgcmV0dXJuIGZ1bmN0aW9uIChldmVudCkge1xuICAgIG1lLmtleXNbZXZlbnQua2V5Q29kZV0gPSBmYWxzZTtcbiAgfTtcbn07XG5cbi8qKlxuICogR2V0cyB0aGUgcHJlc3NlZCBzdGF0ZSBvZiB0aGUga2V5IGBrZXlgXG4gKiBAcGFyYW0gIHtzdHJpbmd9IGtleVxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuS2V5Ym9hcmQucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuIHRoaXMua2V5c1trZXkuY2hhckNvZGVBdCgwKV07XG59O1xuXG4vKipcbiAqIFNldHMgdGhlIHByZXNzZWQgc3RhdGUgb2YgdGhlIGtleSBga2V5YCB0byBgdmFsdWVgXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge2Jvb2xlYW59IHZhbHVlXG4gKi9cbktleWJvYXJkLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICB0aGlzLmtleXNba2V5LmNoYXJDb2RlQXQoMCldID0gdmFsdWU7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEtleWJvYXJkOyIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbnZhciBUSFJFRSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlRIUkVFIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5USFJFRSA6IG51bGwpO1xudmFyIEFwcGxpY2F0aW9uID0gcmVxdWlyZSgnLi9BcHBsaWNhdGlvbicpO1xuXG4vKipcbiAqIEBtb2R1bGUgIGNvbnRyb2xsZXIvTG9vcE1hbmFnZXJcbiAqL1xuXG4vKipcbiAqIFRoZSBsb29wIG1hbmFnZXJzIGNvbnRyb2xzIHRoZSBjYWxscyBtYWRlIHRvIGByZXF1ZXN0QW5pbWF0aW9uRnJhbWVgXG4gKiBvZiBhbiBBcHBsaWNhdGlvblxuICogQGNsYXNzXG4gKiBAcGFyYW0ge2NvbnRyb2xsZXIvTG9vcE1hbmFnZXJ9IGFwcGxpY2F0aW9uIEFwcGxpY2F0b24gd2hvc2UgZnJhbWUgcmF0ZVxuICogd2lsbCBiZSBjb250cm9sbGVkXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHJlbmRlckltbWVkaWF0ZWx5IFRydWUgdG8gc3RhcnQgdGhlIGNhbGxcbiAqIHRvIHJlcXVlc3QgYW5pbWF0aW9uIGZyYW1lIGltbWVkaWF0ZWx5XG4gKi9cbmZ1bmN0aW9uIExvb3BNYW5hZ2VyKGFwcGxpY2F0aW9uLCByZW5kZXJJbW1lZGlhdGVseSkge1xuICAvKipcbiAgICogUmVmZXJlbmNlIHRvIHRoZSBhcHBsaWNhdGlvblxuICAgKiBAdHlwZSB7Y29udHJvbGxlci9BcHBsaWNhdGlvbn1cbiAgICovXG4gIHRoaXMuYXBwbGljYXRpb24gPSBhcHBsaWNhdGlvbjtcbiAgLyoqXG4gICAqIENsb2NrIGhlbHBlciAoaXRzIGRlbHRhIG1ldGhvZCBpcyB1c2VkIHRvIHVwZGF0ZSB0aGUgY2FtZXJhKVxuICAgKiBAdHlwZSB7VEhSRUUuQ2xvY2soKX1cbiAgICovXG4gIHRoaXMuY2xvY2sgPSBuZXcgVEhSRUUuQ2xvY2soKTtcbiAgLyoqXG4gICAqIFRvZ2dsZSB0byBwYXVzZSB0aGUgYW5pbWF0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKi9cbiAgdGhpcy5wYXVzZSA9ICFyZW5kZXJJbW1lZGlhdGVseTtcbiAgLyoqXG4gICAqIEZyYW1lcyBwZXIgc2Vjb25kXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqL1xuICB0aGlzLmZwcyA9IDYwO1xuXG4gIC8qKlxuICAgKiBkYXQuZ3VpIGZvbGRlciBvYmplY3RzXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICB0aGlzLmd1aUNvbnRyb2xsZXJzID0ge307XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemVzIGEgZm9sZGVyIHRvIGNvbnRyb2wgdGhlIGZyYW1lIHJhdGUgYW5kIHNldHNcbiAqIHRoZSBwYXVzZWQgc3RhdGUgb2YgdGhlIGFwcFxuICogQHBhcmFtICB7ZGF0Lmd1aX0gZ3VpXG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5Mb29wTWFuYWdlci5wcm90b3R5cGUuaW5pdERhdEd1aSA9IGZ1bmN0aW9uIChndWkpIHtcbiAgdmFyIG1lID0gdGhpcyxcbiAgICAgIGZvbGRlciA9IGd1aS5hZGRGb2xkZXIoJ0dhbWUgTG9vcCcpO1xuICBmb2xkZXJcbiAgICAuYWRkKHRoaXMsICdmcHMnLCAxMCwgNjAsIDEpXG4gICAgLm5hbWUoJ0ZyYW1lIHJhdGUnKTtcbiAgXG4gIG1lLmd1aUNvbnRyb2xsZXJzLnBhdXNlID0gZm9sZGVyXG4gICAgLmFkZCh0aGlzLCAncGF1c2UnKVxuICAgIC5uYW1lKCdQYXVzZWQnKVxuICAgIC5vbkZpbmlzaENoYW5nZShmdW5jdGlvbiAocGF1c2VkKSB7XG4gICAgICBpZiAoIXBhdXNlZCkge1xuICAgICAgICBtZS5hbmltYXRlKCk7XG4gICAgICB9XG4gICAgICBtZS5hcHBsaWNhdGlvbi5tYXNrVmlzaWJsZShwYXVzZWQpO1xuICAgIH0pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQW5pbWF0aW9uIGxvb3AgKGNhbGxzIGFwcGxpY2F0aW9uLnVwZGF0ZSBhbmQgYXBwbGljYXRpb24ucmVuZGVyKVxuICogQHJldHVybiB7dGhpc31cbiAqL1xuTG9vcE1hbmFnZXIucHJvdG90eXBlLmFuaW1hdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBtZSA9IHRoaXMsXG4gICAgZWxhcHNlZFRpbWUgPSAwLFxuICAgIGxvb3A7XG5cbiAgbG9vcCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAobWUucGF1c2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgZGVsdGEgPSBtZS5jbG9jay5nZXREZWx0YSgpLFxuICAgICAgZnJhbWVSYXRlSW5TID0gMSAvIG1lLmZwcztcblxuICAgIC8vIGNvbnN0cmFpbnQgZGVsdGEgdG8gYmUgPD0gZnJhbWVSYXRlXG4gICAgLy8gKHRvIGF2b2lkIGZyYW1lcyB3aXRoIGEgYmlnIGRlbHRhIGNhdXNlZCBiZWNhdXNlIG9mIHRoZSBhcHAgc2VudCB0byBzbGVlcClcbiAgICBkZWx0YSA9IE1hdGgubWluKGRlbHRhLCBmcmFtZVJhdGVJblMpO1xuICAgIGVsYXBzZWRUaW1lICs9IGRlbHRhO1xuXG4gICAgaWYgKGVsYXBzZWRUaW1lID49IGZyYW1lUmF0ZUluUykge1xuXG4gICAgICAvLyB1cGRhdGUgdGhlIHdvcmxkIGFuZCByZW5kZXIgaXRzIG9iamVjdHNcbiAgICAgIG1lLmFwcGxpY2F0aW9uLnVwZGF0ZShkZWx0YSk7XG4gICAgICBtZS5hcHBsaWNhdGlvbi5yZW5kZXIoKTtcblxuICAgICAgZWxhcHNlZFRpbWUgLT0gZnJhbWVSYXRlSW5TO1xuICAgIH1cblxuICAgIC8vIGRldGFpbHMgYXQgaHR0cDovL215Lm9wZXJhLmNvbS9lbW9sbGVyL2Jsb2cvMjAxMS8xMi8yMC9yZXF1ZXN0YW5pbWF0aW9uZnJhbWUtZm9yLXNtYXJ0LWVyLWFuaW1hdGluZ1xuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobG9vcCk7XG4gIH07XG5cbiAgbG9vcCgpO1xuXG4gIHJldHVybiBtZTtcbn07XG5cbi8qKlxuICogU3RhcnRzIHRoZSBhbmltYXRpb25cbiAqL1xuTG9vcE1hbmFnZXIucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbWUgPSB0aGlzO1xuICBtZS5ndWlDb250cm9sbGVycy5wYXVzZS5zZXRWYWx1ZShmYWxzZSk7XG59O1xuXG4vKipcbiAqIFN0b3BzIHRoZSBhbmltYXRpb25cbiAqL1xuTG9vcE1hbmFnZXIucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBtZSA9IHRoaXM7XG4gIG1lLmd1aUNvbnRyb2xsZXJzLnBhdXNlLnNldFZhbHVlKHRydWUpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMb29wTWFuYWdlcjtcbn0pLmNhbGwodGhpcyx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwicmVxdWlyZSgnLi9saWIvT3JiaXRDb250cm9scycpO1xuXG4vKipcbiAqIHQzXG4gKiBAbmFtZXNwYWNlXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG52YXIgQXBwbGljYXRpb24gPSByZXF1aXJlKCcuL2NvbnRyb2xsZXIvQXBwbGljYXRpb24nKTtcbnZhciB0MyA9IHtcbiAgbW9kZWw6IHtcbiAgICBDb29yZGluYXRlczogcmVxdWlyZSgnLi9tb2RlbC9Db29yZGluYXRlcycpXG4gIH0sXG4gIHRoZW1lczoge1xuICAgIGRhcms6IHJlcXVpcmUoJy4vdGhlbWVzL2RhcmsnKSxcbiAgICAnZGVmYXVsdCc6IHJlcXVpcmUoJy4vdGhlbWVzL2RlZmF1bHQnKSxcbiAgICBsaWdodDogcmVxdWlyZSgnLi90aGVtZXMvbGlnaHQnKVxuICB9LFxuICBjb250cm9sbGVyOiB7XG4gICAgQXBwbGljYXRpb246IEFwcGxpY2F0aW9uLFxuICAgIEtleWJvYXJkOiByZXF1aXJlKCcuL2NvbnRyb2xsZXIvS2V5Ym9hcmQnKSxcbiAgICBMb29wTWFuYWdlcjogcmVxdWlyZSgnLi9jb250cm9sbGVyL0xvb3BNYW5hZ2VyJylcbiAgfSxcbiAgQXBwbGljYXRpb246IEFwcGxpY2F0aW9uLFxuXG4gIC8vIGFsaWFzXG4gIHJ1bjogQXBwbGljYXRpb24ucnVuXG59O1xubW9kdWxlLmV4cG9ydHMgPSB0MzsiLCIvKipcbiAqIEBhdXRob3IgcWlhbyAvIGh0dHBzOi8vZ2l0aHViLmNvbS9xaWFvXG4gKiBAYXV0aG9yIG1yZG9vYiAvIGh0dHA6Ly9tcmRvb2IuY29tXG4gKiBAYXV0aG9yIGFsdGVyZWRxIC8gaHR0cDovL2FsdGVyZWRxdWFsaWEuY29tL1xuICogQGF1dGhvciBXZXN0TGFuZ2xleSAvIGh0dHA6Ly9naXRodWIuY29tL1dlc3RMYW5nbGV5XG4gKiBAYXV0aG9yIGVyaWNoNjY2IC8gaHR0cDovL2VyaWNoYWluZXMuY29tXG4gKi9cbi8qZ2xvYmFsIFRIUkVFLCBjb25zb2xlICovXG5cbi8vIFRoaXMgc2V0IG9mIGNvbnRyb2xzIHBlcmZvcm1zIG9yYml0aW5nLCBkb2xseWluZyAoem9vbWluZyksIGFuZCBwYW5uaW5nLiBJdCBtYWludGFpbnNcbi8vIHRoZSBcInVwXCIgZGlyZWN0aW9uIGFzICtZLCB1bmxpa2UgdGhlIFRyYWNrYmFsbENvbnRyb2xzLiBUb3VjaCBvbiB0YWJsZXQgYW5kIHBob25lcyBpc1xuLy8gc3VwcG9ydGVkLlxuLy9cbi8vICAgIE9yYml0IC0gbGVmdCBtb3VzZSAvIHRvdWNoOiBvbmUgZmluZ2VyIG1vdmVcbi8vICAgIFpvb20gLSBtaWRkbGUgbW91c2UsIG9yIG1vdXNld2hlZWwgLyB0b3VjaDogdHdvIGZpbmdlciBzcHJlYWQgb3Igc3F1aXNoXG4vLyAgICBQYW4gLSByaWdodCBtb3VzZSwgb3IgYXJyb3cga2V5cyAvIHRvdWNoOiB0aHJlZSBmaW50ZXIgc3dpcGVcbi8vXG4vLyBUaGlzIGlzIGEgZHJvcC1pbiByZXBsYWNlbWVudCBmb3IgKG1vc3QpIFRyYWNrYmFsbENvbnRyb2xzIHVzZWQgaW4gZXhhbXBsZXMuXG4vLyBUaGF0IGlzLCBpbmNsdWRlIHRoaXMganMgZmlsZSBhbmQgd2hlcmV2ZXIgeW91IHNlZTpcbi8vICAgIFx0Y29udHJvbHMgPSBuZXcgVEhSRUUuVHJhY2tiYWxsQ29udHJvbHMoIGNhbWVyYSApO1xuLy8gICAgICBjb250cm9scy50YXJnZXQueiA9IDE1MDtcbi8vIFNpbXBsZSBzdWJzdGl0dXRlIFwiT3JiaXRDb250cm9sc1wiIGFuZCB0aGUgY29udHJvbCBzaG91bGQgd29yayBhcy1pcy5cblxuVEhSRUUuT3JiaXRDb250cm9scyA9IGZ1bmN0aW9uICggb2JqZWN0LCBkb21FbGVtZW50ICkge1xuXG5cdHRoaXMub2JqZWN0ID0gb2JqZWN0O1xuXHR0aGlzLmRvbUVsZW1lbnQgPSAoIGRvbUVsZW1lbnQgIT09IHVuZGVmaW5lZCApID8gZG9tRWxlbWVudCA6IGRvY3VtZW50O1xuXG5cdC8vIEFQSVxuXG5cdC8vIFNldCB0byBmYWxzZSB0byBkaXNhYmxlIHRoaXMgY29udHJvbFxuXHR0aGlzLmVuYWJsZWQgPSB0cnVlO1xuXG5cdC8vIFwidGFyZ2V0XCIgc2V0cyB0aGUgbG9jYXRpb24gb2YgZm9jdXMsIHdoZXJlIHRoZSBjb250cm9sIG9yYml0cyBhcm91bmRcblx0Ly8gYW5kIHdoZXJlIGl0IHBhbnMgd2l0aCByZXNwZWN0IHRvLlxuXHR0aGlzLnRhcmdldCA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cblx0Ly8gY2VudGVyIGlzIG9sZCwgZGVwcmVjYXRlZDsgdXNlIFwidGFyZ2V0XCIgaW5zdGVhZFxuXHR0aGlzLmNlbnRlciA9IHRoaXMudGFyZ2V0O1xuXG5cdC8vIFRoaXMgb3B0aW9uIGFjdHVhbGx5IGVuYWJsZXMgZG9sbHlpbmcgaW4gYW5kIG91dDsgbGVmdCBhcyBcInpvb21cIiBmb3Jcblx0Ly8gYmFja3dhcmRzIGNvbXBhdGliaWxpdHlcblx0dGhpcy5ub1pvb20gPSBmYWxzZTtcblx0dGhpcy56b29tU3BlZWQgPSAxLjA7XG5cblx0Ly8gTGltaXRzIHRvIGhvdyBmYXIgeW91IGNhbiBkb2xseSBpbiBhbmQgb3V0XG5cdHRoaXMubWluRGlzdGFuY2UgPSAwO1xuXHR0aGlzLm1heERpc3RhbmNlID0gSW5maW5pdHk7XG5cblx0Ly8gU2V0IHRvIHRydWUgdG8gZGlzYWJsZSB0aGlzIGNvbnRyb2xcblx0dGhpcy5ub1JvdGF0ZSA9IGZhbHNlO1xuXHR0aGlzLnJvdGF0ZVNwZWVkID0gMS4wO1xuXG5cdC8vIFNldCB0byB0cnVlIHRvIGRpc2FibGUgdGhpcyBjb250cm9sXG5cdHRoaXMubm9QYW4gPSBmYWxzZTtcblx0dGhpcy5rZXlQYW5TcGVlZCA9IDcuMDtcdC8vIHBpeGVscyBtb3ZlZCBwZXIgYXJyb3cga2V5IHB1c2hcblxuXHQvLyBTZXQgdG8gdHJ1ZSB0byBhdXRvbWF0aWNhbGx5IHJvdGF0ZSBhcm91bmQgdGhlIHRhcmdldFxuXHR0aGlzLmF1dG9Sb3RhdGUgPSBmYWxzZTtcblx0dGhpcy5hdXRvUm90YXRlU3BlZWQgPSAyLjA7IC8vIDMwIHNlY29uZHMgcGVyIHJvdW5kIHdoZW4gZnBzIGlzIDYwXG5cblx0Ly8gSG93IGZhciB5b3UgY2FuIG9yYml0IHZlcnRpY2FsbHksIHVwcGVyIGFuZCBsb3dlciBsaW1pdHMuXG5cdC8vIFJhbmdlIGlzIDAgdG8gTWF0aC5QSSByYWRpYW5zLlxuXHR0aGlzLm1pblBvbGFyQW5nbGUgPSAwOyAvLyByYWRpYW5zXG5cdHRoaXMubWF4UG9sYXJBbmdsZSA9IE1hdGguUEk7IC8vIHJhZGlhbnNcblxuXHQvLyBTZXQgdG8gdHJ1ZSB0byBkaXNhYmxlIHVzZSBvZiB0aGUga2V5c1xuXHR0aGlzLm5vS2V5cyA9IGZhbHNlO1xuXG5cdC8vIFRoZSBmb3VyIGFycm93IGtleXNcblx0dGhpcy5rZXlzID0geyBMRUZUOiAzNywgVVA6IDM4LCBSSUdIVDogMzksIEJPVFRPTTogNDAgfTtcblxuXHQvLy8vLy8vLy8vLy9cblx0Ly8gaW50ZXJuYWxzXG5cblx0dmFyIHNjb3BlID0gdGhpcztcblxuXHR2YXIgRVBTID0gMC4wMDAwMDE7XG5cblx0dmFyIHJvdGF0ZVN0YXJ0ID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblx0dmFyIHJvdGF0ZUVuZCA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cdHZhciByb3RhdGVEZWx0YSA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cblx0dmFyIHBhblN0YXJ0ID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblx0dmFyIHBhbkVuZCA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cdHZhciBwYW5EZWx0YSA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cdHZhciBwYW5PZmZzZXQgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuXG5cdHZhciBvZmZzZXQgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuXG5cdHZhciBkb2xseVN0YXJ0ID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblx0dmFyIGRvbGx5RW5kID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblx0dmFyIGRvbGx5RGVsdGEgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXG5cdHZhciBwaGlEZWx0YSA9IDA7XG5cdHZhciB0aGV0YURlbHRhID0gMDtcblx0dmFyIHNjYWxlID0gMTtcblx0dmFyIHBhbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cblx0dmFyIGxhc3RQb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cdHZhciBsYXN0UXVhdGVybmlvbiA9IG5ldyBUSFJFRS5RdWF0ZXJuaW9uKCk7XG5cblx0dmFyIFNUQVRFID0geyBOT05FIDogLTEsIFJPVEFURSA6IDAsIERPTExZIDogMSwgUEFOIDogMiwgVE9VQ0hfUk9UQVRFIDogMywgVE9VQ0hfRE9MTFkgOiA0LCBUT1VDSF9QQU4gOiA1IH07XG5cblx0dmFyIHN0YXRlID0gU1RBVEUuTk9ORTtcblxuXHQvLyBmb3IgcmVzZXRcblxuXHR0aGlzLnRhcmdldDAgPSB0aGlzLnRhcmdldC5jbG9uZSgpO1xuXHR0aGlzLnBvc2l0aW9uMCA9IHRoaXMub2JqZWN0LnBvc2l0aW9uLmNsb25lKCk7XG5cblx0Ly8gc28gY2FtZXJhLnVwIGlzIHRoZSBvcmJpdCBheGlzXG5cblx0dmFyIHF1YXQgPSBuZXcgVEhSRUUuUXVhdGVybmlvbigpLnNldEZyb21Vbml0VmVjdG9ycyggb2JqZWN0LnVwLCBuZXcgVEhSRUUuVmVjdG9yMyggMCwgMSwgMCApICk7XG5cdHZhciBxdWF0SW52ZXJzZSA9IHF1YXQuY2xvbmUoKS5pbnZlcnNlKCk7XG5cblx0Ly8gZXZlbnRzXG5cblx0dmFyIGNoYW5nZUV2ZW50ID0geyB0eXBlOiAnY2hhbmdlJyB9O1xuXHR2YXIgc3RhcnRFdmVudCA9IHsgdHlwZTogJ3N0YXJ0J307XG5cdHZhciBlbmRFdmVudCA9IHsgdHlwZTogJ2VuZCd9O1xuXG5cdHRoaXMucm90YXRlTGVmdCA9IGZ1bmN0aW9uICggYW5nbGUgKSB7XG5cblx0XHRpZiAoIGFuZ2xlID09PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdGFuZ2xlID0gZ2V0QXV0b1JvdGF0aW9uQW5nbGUoKTtcblxuXHRcdH1cblxuXHRcdHRoZXRhRGVsdGEgLT0gYW5nbGU7XG5cblx0fTtcblxuXHR0aGlzLnJvdGF0ZVVwID0gZnVuY3Rpb24gKCBhbmdsZSApIHtcblxuXHRcdGlmICggYW5nbGUgPT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0YW5nbGUgPSBnZXRBdXRvUm90YXRpb25BbmdsZSgpO1xuXG5cdFx0fVxuXG5cdFx0cGhpRGVsdGEgLT0gYW5nbGU7XG5cblx0fTtcblxuXHQvLyBwYXNzIGluIGRpc3RhbmNlIGluIHdvcmxkIHNwYWNlIHRvIG1vdmUgbGVmdFxuXHR0aGlzLnBhbkxlZnQgPSBmdW5jdGlvbiAoIGRpc3RhbmNlICkge1xuXG5cdFx0dmFyIHRlID0gdGhpcy5vYmplY3QubWF0cml4LmVsZW1lbnRzO1xuXG5cdFx0Ly8gZ2V0IFggY29sdW1uIG9mIG1hdHJpeFxuXHRcdHBhbk9mZnNldC5zZXQoIHRlWyAwIF0sIHRlWyAxIF0sIHRlWyAyIF0gKTtcblx0XHRwYW5PZmZzZXQubXVsdGlwbHlTY2FsYXIoIC0gZGlzdGFuY2UgKTtcblx0XHRcblx0XHRwYW4uYWRkKCBwYW5PZmZzZXQgKTtcblxuXHR9O1xuXG5cdC8vIHBhc3MgaW4gZGlzdGFuY2UgaW4gd29ybGQgc3BhY2UgdG8gbW92ZSB1cFxuXHR0aGlzLnBhblVwID0gZnVuY3Rpb24gKCBkaXN0YW5jZSApIHtcblxuXHRcdHZhciB0ZSA9IHRoaXMub2JqZWN0Lm1hdHJpeC5lbGVtZW50cztcblxuXHRcdC8vIGdldCBZIGNvbHVtbiBvZiBtYXRyaXhcblx0XHRwYW5PZmZzZXQuc2V0KCB0ZVsgNCBdLCB0ZVsgNSBdLCB0ZVsgNiBdICk7XG5cdFx0cGFuT2Zmc2V0Lm11bHRpcGx5U2NhbGFyKCBkaXN0YW5jZSApO1xuXHRcdFxuXHRcdHBhbi5hZGQoIHBhbk9mZnNldCApO1xuXG5cdH07XG5cdFxuXHQvLyBwYXNzIGluIHgseSBvZiBjaGFuZ2UgZGVzaXJlZCBpbiBwaXhlbCBzcGFjZSxcblx0Ly8gcmlnaHQgYW5kIGRvd24gYXJlIHBvc2l0aXZlXG5cdHRoaXMucGFuID0gZnVuY3Rpb24gKCBkZWx0YVgsIGRlbHRhWSApIHtcblxuXHRcdHZhciBlbGVtZW50ID0gc2NvcGUuZG9tRWxlbWVudCA9PT0gZG9jdW1lbnQgPyBzY29wZS5kb21FbGVtZW50LmJvZHkgOiBzY29wZS5kb21FbGVtZW50O1xuXG5cdFx0aWYgKCBzY29wZS5vYmplY3QuZm92ICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdC8vIHBlcnNwZWN0aXZlXG5cdFx0XHR2YXIgcG9zaXRpb24gPSBzY29wZS5vYmplY3QucG9zaXRpb247XG5cdFx0XHR2YXIgb2Zmc2V0ID0gcG9zaXRpb24uY2xvbmUoKS5zdWIoIHNjb3BlLnRhcmdldCApO1xuXHRcdFx0dmFyIHRhcmdldERpc3RhbmNlID0gb2Zmc2V0Lmxlbmd0aCgpO1xuXG5cdFx0XHQvLyBoYWxmIG9mIHRoZSBmb3YgaXMgY2VudGVyIHRvIHRvcCBvZiBzY3JlZW5cblx0XHRcdHRhcmdldERpc3RhbmNlICo9IE1hdGgudGFuKCAoIHNjb3BlLm9iamVjdC5mb3YgLyAyICkgKiBNYXRoLlBJIC8gMTgwLjAgKTtcblxuXHRcdFx0Ly8gd2UgYWN0dWFsbHkgZG9uJ3QgdXNlIHNjcmVlbldpZHRoLCBzaW5jZSBwZXJzcGVjdGl2ZSBjYW1lcmEgaXMgZml4ZWQgdG8gc2NyZWVuIGhlaWdodFxuXHRcdFx0c2NvcGUucGFuTGVmdCggMiAqIGRlbHRhWCAqIHRhcmdldERpc3RhbmNlIC8gZWxlbWVudC5jbGllbnRIZWlnaHQgKTtcblx0XHRcdHNjb3BlLnBhblVwKCAyICogZGVsdGFZICogdGFyZ2V0RGlzdGFuY2UgLyBlbGVtZW50LmNsaWVudEhlaWdodCApO1xuXG5cdFx0fSBlbHNlIGlmICggc2NvcGUub2JqZWN0LnRvcCAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHQvLyBvcnRob2dyYXBoaWNcblx0XHRcdHNjb3BlLnBhbkxlZnQoIGRlbHRhWCAqIChzY29wZS5vYmplY3QucmlnaHQgLSBzY29wZS5vYmplY3QubGVmdCkgLyBlbGVtZW50LmNsaWVudFdpZHRoICk7XG5cdFx0XHRzY29wZS5wYW5VcCggZGVsdGFZICogKHNjb3BlLm9iamVjdC50b3AgLSBzY29wZS5vYmplY3QuYm90dG9tKSAvIGVsZW1lbnQuY2xpZW50SGVpZ2h0ICk7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHQvLyBjYW1lcmEgbmVpdGhlciBvcnRob2dyYXBoaWMgb3IgcGVyc3BlY3RpdmVcblx0XHRcdGNvbnNvbGUud2FybiggJ1dBUk5JTkc6IE9yYml0Q29udHJvbHMuanMgZW5jb3VudGVyZWQgYW4gdW5rbm93biBjYW1lcmEgdHlwZSAtIHBhbiBkaXNhYmxlZC4nICk7XG5cblx0XHR9XG5cblx0fTtcblxuXHR0aGlzLmRvbGx5SW4gPSBmdW5jdGlvbiAoIGRvbGx5U2NhbGUgKSB7XG5cblx0XHRpZiAoIGRvbGx5U2NhbGUgPT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0ZG9sbHlTY2FsZSA9IGdldFpvb21TY2FsZSgpO1xuXG5cdFx0fVxuXG5cdFx0c2NhbGUgLz0gZG9sbHlTY2FsZTtcblxuXHR9O1xuXG5cdHRoaXMuZG9sbHlPdXQgPSBmdW5jdGlvbiAoIGRvbGx5U2NhbGUgKSB7XG5cblx0XHRpZiAoIGRvbGx5U2NhbGUgPT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0ZG9sbHlTY2FsZSA9IGdldFpvb21TY2FsZSgpO1xuXG5cdFx0fVxuXG5cdFx0c2NhbGUgKj0gZG9sbHlTY2FsZTtcblxuXHR9O1xuXG5cdHRoaXMudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuXG5cdFx0dmFyIHBvc2l0aW9uID0gdGhpcy5vYmplY3QucG9zaXRpb247XG5cblx0XHRvZmZzZXQuY29weSggcG9zaXRpb24gKS5zdWIoIHRoaXMudGFyZ2V0ICk7XG5cblx0XHQvLyByb3RhdGUgb2Zmc2V0IHRvIFwieS1heGlzLWlzLXVwXCIgc3BhY2Vcblx0XHRvZmZzZXQuYXBwbHlRdWF0ZXJuaW9uKCBxdWF0ICk7XG5cblx0XHQvLyBhbmdsZSBmcm9tIHotYXhpcyBhcm91bmQgeS1heGlzXG5cblx0XHR2YXIgdGhldGEgPSBNYXRoLmF0YW4yKCBvZmZzZXQueCwgb2Zmc2V0LnogKTtcblxuXHRcdC8vIGFuZ2xlIGZyb20geS1heGlzXG5cblx0XHR2YXIgcGhpID0gTWF0aC5hdGFuMiggTWF0aC5zcXJ0KCBvZmZzZXQueCAqIG9mZnNldC54ICsgb2Zmc2V0LnogKiBvZmZzZXQueiApLCBvZmZzZXQueSApO1xuXG5cdFx0aWYgKCB0aGlzLmF1dG9Sb3RhdGUgKSB7XG5cblx0XHRcdHRoaXMucm90YXRlTGVmdCggZ2V0QXV0b1JvdGF0aW9uQW5nbGUoKSApO1xuXG5cdFx0fVxuXG5cdFx0dGhldGEgKz0gdGhldGFEZWx0YTtcblx0XHRwaGkgKz0gcGhpRGVsdGE7XG5cblx0XHQvLyByZXN0cmljdCBwaGkgdG8gYmUgYmV0d2VlbiBkZXNpcmVkIGxpbWl0c1xuXHRcdHBoaSA9IE1hdGgubWF4KCB0aGlzLm1pblBvbGFyQW5nbGUsIE1hdGgubWluKCB0aGlzLm1heFBvbGFyQW5nbGUsIHBoaSApICk7XG5cblx0XHQvLyByZXN0cmljdCBwaGkgdG8gYmUgYmV0d2VlIEVQUyBhbmQgUEktRVBTXG5cdFx0cGhpID0gTWF0aC5tYXgoIEVQUywgTWF0aC5taW4oIE1hdGguUEkgLSBFUFMsIHBoaSApICk7XG5cblx0XHR2YXIgcmFkaXVzID0gb2Zmc2V0Lmxlbmd0aCgpICogc2NhbGU7XG5cblx0XHQvLyByZXN0cmljdCByYWRpdXMgdG8gYmUgYmV0d2VlbiBkZXNpcmVkIGxpbWl0c1xuXHRcdHJhZGl1cyA9IE1hdGgubWF4KCB0aGlzLm1pbkRpc3RhbmNlLCBNYXRoLm1pbiggdGhpcy5tYXhEaXN0YW5jZSwgcmFkaXVzICkgKTtcblx0XHRcblx0XHQvLyBtb3ZlIHRhcmdldCB0byBwYW5uZWQgbG9jYXRpb25cblx0XHR0aGlzLnRhcmdldC5hZGQoIHBhbiApO1xuXG5cdFx0b2Zmc2V0LnggPSByYWRpdXMgKiBNYXRoLnNpbiggcGhpICkgKiBNYXRoLnNpbiggdGhldGEgKTtcblx0XHRvZmZzZXQueSA9IHJhZGl1cyAqIE1hdGguY29zKCBwaGkgKTtcblx0XHRvZmZzZXQueiA9IHJhZGl1cyAqIE1hdGguc2luKCBwaGkgKSAqIE1hdGguY29zKCB0aGV0YSApO1xuXG5cdFx0Ly8gcm90YXRlIG9mZnNldCBiYWNrIHRvIFwiY2FtZXJhLXVwLXZlY3Rvci1pcy11cFwiIHNwYWNlXG5cdFx0b2Zmc2V0LmFwcGx5UXVhdGVybmlvbiggcXVhdEludmVyc2UgKTtcblxuXHRcdHBvc2l0aW9uLmNvcHkoIHRoaXMudGFyZ2V0ICkuYWRkKCBvZmZzZXQgKTtcblxuXHRcdHRoaXMub2JqZWN0Lmxvb2tBdCggdGhpcy50YXJnZXQgKTtcblxuXHRcdHRoZXRhRGVsdGEgPSAwO1xuXHRcdHBoaURlbHRhID0gMDtcblx0XHRzY2FsZSA9IDE7XG5cdFx0cGFuLnNldCggMCwgMCwgMCApO1xuXG5cdFx0Ly8gdXBkYXRlIGNvbmRpdGlvbiBpczpcblx0XHQvLyBtaW4oY2FtZXJhIGRpc3BsYWNlbWVudCwgY2FtZXJhIHJvdGF0aW9uIGluIHJhZGlhbnMpXjIgPiBFUFNcblx0XHQvLyB1c2luZyBzbWFsbC1hbmdsZSBhcHByb3hpbWF0aW9uIGNvcyh4LzIpID0gMSAtIHheMiAvIDhcblxuXHRcdGlmICggbGFzdFBvc2l0aW9uLmRpc3RhbmNlVG9TcXVhcmVkKCB0aGlzLm9iamVjdC5wb3NpdGlvbiApID4gRVBTXG5cdFx0ICAgIHx8IDggKiAoMSAtIGxhc3RRdWF0ZXJuaW9uLmRvdCh0aGlzLm9iamVjdC5xdWF0ZXJuaW9uKSkgPiBFUFMgKSB7XG5cblx0XHRcdHRoaXMuZGlzcGF0Y2hFdmVudCggY2hhbmdlRXZlbnQgKTtcblxuXHRcdFx0bGFzdFBvc2l0aW9uLmNvcHkoIHRoaXMub2JqZWN0LnBvc2l0aW9uICk7XG5cdFx0XHRsYXN0UXVhdGVybmlvbi5jb3B5ICh0aGlzLm9iamVjdC5xdWF0ZXJuaW9uICk7XG5cblx0XHR9XG5cblx0fTtcblxuXG5cdHRoaXMucmVzZXQgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHRzdGF0ZSA9IFNUQVRFLk5PTkU7XG5cblx0XHR0aGlzLnRhcmdldC5jb3B5KCB0aGlzLnRhcmdldDAgKTtcblx0XHR0aGlzLm9iamVjdC5wb3NpdGlvbi5jb3B5KCB0aGlzLnBvc2l0aW9uMCApO1xuXG5cdFx0dGhpcy51cGRhdGUoKTtcblxuXHR9O1xuXG5cdGZ1bmN0aW9uIGdldEF1dG9Sb3RhdGlvbkFuZ2xlKCkge1xuXG5cdFx0cmV0dXJuIDIgKiBNYXRoLlBJIC8gNjAgLyA2MCAqIHNjb3BlLmF1dG9Sb3RhdGVTcGVlZDtcblxuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0Wm9vbVNjYWxlKCkge1xuXG5cdFx0cmV0dXJuIE1hdGgucG93KCAwLjk1LCBzY29wZS56b29tU3BlZWQgKTtcblxuXHR9XG5cblx0ZnVuY3Rpb24gb25Nb3VzZURvd24oIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBzY29wZS5lbmFibGVkID09PSBmYWxzZSApIHJldHVybjtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0aWYgKCBldmVudC5idXR0b24gPT09IDAgKSB7XG5cdFx0XHRpZiAoIHNjb3BlLm5vUm90YXRlID09PSB0cnVlICkgcmV0dXJuO1xuXG5cdFx0XHRzdGF0ZSA9IFNUQVRFLlJPVEFURTtcblxuXHRcdFx0cm90YXRlU3RhcnQuc2V0KCBldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZICk7XG5cblx0XHR9IGVsc2UgaWYgKCBldmVudC5idXR0b24gPT09IDEgKSB7XG5cdFx0XHRpZiAoIHNjb3BlLm5vWm9vbSA9PT0gdHJ1ZSApIHJldHVybjtcblxuXHRcdFx0c3RhdGUgPSBTVEFURS5ET0xMWTtcblxuXHRcdFx0ZG9sbHlTdGFydC5zZXQoIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkgKTtcblxuXHRcdH0gZWxzZSBpZiAoIGV2ZW50LmJ1dHRvbiA9PT0gMiApIHtcblx0XHRcdGlmICggc2NvcGUubm9QYW4gPT09IHRydWUgKSByZXR1cm47XG5cblx0XHRcdHN0YXRlID0gU1RBVEUuUEFOO1xuXG5cdFx0XHRwYW5TdGFydC5zZXQoIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkgKTtcblxuXHRcdH1cblxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZW1vdmUnLCBvbk1vdXNlTW92ZSwgZmFsc2UgKTtcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2V1cCcsIG9uTW91c2VVcCwgZmFsc2UgKTtcblx0XHRzY29wZS5kaXNwYXRjaEV2ZW50KCBzdGFydEV2ZW50ICk7XG5cblx0fVxuXG5cdGZ1bmN0aW9uIG9uTW91c2VNb3ZlKCBldmVudCApIHtcblxuXHRcdGlmICggc2NvcGUuZW5hYmxlZCA9PT0gZmFsc2UgKSByZXR1cm47XG5cblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0dmFyIGVsZW1lbnQgPSBzY29wZS5kb21FbGVtZW50ID09PSBkb2N1bWVudCA/IHNjb3BlLmRvbUVsZW1lbnQuYm9keSA6IHNjb3BlLmRvbUVsZW1lbnQ7XG5cblx0XHRpZiAoIHN0YXRlID09PSBTVEFURS5ST1RBVEUgKSB7XG5cblx0XHRcdGlmICggc2NvcGUubm9Sb3RhdGUgPT09IHRydWUgKSByZXR1cm47XG5cblx0XHRcdHJvdGF0ZUVuZC5zZXQoIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkgKTtcblx0XHRcdHJvdGF0ZURlbHRhLnN1YlZlY3RvcnMoIHJvdGF0ZUVuZCwgcm90YXRlU3RhcnQgKTtcblxuXHRcdFx0Ly8gcm90YXRpbmcgYWNyb3NzIHdob2xlIHNjcmVlbiBnb2VzIDM2MCBkZWdyZWVzIGFyb3VuZFxuXHRcdFx0c2NvcGUucm90YXRlTGVmdCggMiAqIE1hdGguUEkgKiByb3RhdGVEZWx0YS54IC8gZWxlbWVudC5jbGllbnRXaWR0aCAqIHNjb3BlLnJvdGF0ZVNwZWVkICk7XG5cblx0XHRcdC8vIHJvdGF0aW5nIHVwIGFuZCBkb3duIGFsb25nIHdob2xlIHNjcmVlbiBhdHRlbXB0cyB0byBnbyAzNjAsIGJ1dCBsaW1pdGVkIHRvIDE4MFxuXHRcdFx0c2NvcGUucm90YXRlVXAoIDIgKiBNYXRoLlBJICogcm90YXRlRGVsdGEueSAvIGVsZW1lbnQuY2xpZW50SGVpZ2h0ICogc2NvcGUucm90YXRlU3BlZWQgKTtcblxuXHRcdFx0cm90YXRlU3RhcnQuY29weSggcm90YXRlRW5kICk7XG5cblx0XHR9IGVsc2UgaWYgKCBzdGF0ZSA9PT0gU1RBVEUuRE9MTFkgKSB7XG5cblx0XHRcdGlmICggc2NvcGUubm9ab29tID09PSB0cnVlICkgcmV0dXJuO1xuXG5cdFx0XHRkb2xseUVuZC5zZXQoIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkgKTtcblx0XHRcdGRvbGx5RGVsdGEuc3ViVmVjdG9ycyggZG9sbHlFbmQsIGRvbGx5U3RhcnQgKTtcblxuXHRcdFx0aWYgKCBkb2xseURlbHRhLnkgPiAwICkge1xuXG5cdFx0XHRcdHNjb3BlLmRvbGx5SW4oKTtcblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRzY29wZS5kb2xseU91dCgpO1xuXG5cdFx0XHR9XG5cblx0XHRcdGRvbGx5U3RhcnQuY29weSggZG9sbHlFbmQgKTtcblxuXHRcdH0gZWxzZSBpZiAoIHN0YXRlID09PSBTVEFURS5QQU4gKSB7XG5cblx0XHRcdGlmICggc2NvcGUubm9QYW4gPT09IHRydWUgKSByZXR1cm47XG5cblx0XHRcdHBhbkVuZC5zZXQoIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkgKTtcblx0XHRcdHBhbkRlbHRhLnN1YlZlY3RvcnMoIHBhbkVuZCwgcGFuU3RhcnQgKTtcblx0XHRcdFxuXHRcdFx0c2NvcGUucGFuKCBwYW5EZWx0YS54LCBwYW5EZWx0YS55ICk7XG5cblx0XHRcdHBhblN0YXJ0LmNvcHkoIHBhbkVuZCApO1xuXG5cdFx0fVxuXG5cdFx0c2NvcGUudXBkYXRlKCk7XG5cblx0fVxuXG5cdGZ1bmN0aW9uIG9uTW91c2VVcCggLyogZXZlbnQgKi8gKSB7XG5cblx0XHRpZiAoIHNjb3BlLmVuYWJsZWQgPT09IGZhbHNlICkgcmV0dXJuO1xuXG5cdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNlbW92ZScsIG9uTW91c2VNb3ZlLCBmYWxzZSApO1xuXHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdtb3VzZXVwJywgb25Nb3VzZVVwLCBmYWxzZSApO1xuXHRcdHNjb3BlLmRpc3BhdGNoRXZlbnQoIGVuZEV2ZW50ICk7XG5cdFx0c3RhdGUgPSBTVEFURS5OT05FO1xuXG5cdH1cblxuXHRmdW5jdGlvbiBvbk1vdXNlV2hlZWwoIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBzY29wZS5lbmFibGVkID09PSBmYWxzZSB8fCBzY29wZS5ub1pvb20gPT09IHRydWUgKSByZXR1cm47XG5cblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0dmFyIGRlbHRhID0gMDtcblxuXHRcdGlmICggZXZlbnQud2hlZWxEZWx0YSAhPT0gdW5kZWZpbmVkICkgeyAvLyBXZWJLaXQgLyBPcGVyYSAvIEV4cGxvcmVyIDlcblxuXHRcdFx0ZGVsdGEgPSBldmVudC53aGVlbERlbHRhO1xuXG5cdFx0fSBlbHNlIGlmICggZXZlbnQuZGV0YWlsICE9PSB1bmRlZmluZWQgKSB7IC8vIEZpcmVmb3hcblxuXHRcdFx0ZGVsdGEgPSAtIGV2ZW50LmRldGFpbDtcblxuXHRcdH1cblxuXHRcdGlmICggZGVsdGEgPiAwICkge1xuXG5cdFx0XHRzY29wZS5kb2xseU91dCgpO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0c2NvcGUuZG9sbHlJbigpO1xuXG5cdFx0fVxuXG5cdFx0c2NvcGUudXBkYXRlKCk7XG5cdFx0c2NvcGUuZGlzcGF0Y2hFdmVudCggc3RhcnRFdmVudCApO1xuXHRcdHNjb3BlLmRpc3BhdGNoRXZlbnQoIGVuZEV2ZW50ICk7XG5cblx0fVxuXG5cdGZ1bmN0aW9uIG9uS2V5RG93biggZXZlbnQgKSB7XG5cblx0XHRpZiAoIHNjb3BlLmVuYWJsZWQgPT09IGZhbHNlIHx8IHNjb3BlLm5vS2V5cyA9PT0gdHJ1ZSB8fCBzY29wZS5ub1BhbiA9PT0gdHJ1ZSApIHJldHVybjtcblx0XHRcblx0XHRzd2l0Y2ggKCBldmVudC5rZXlDb2RlICkge1xuXG5cdFx0XHRjYXNlIHNjb3BlLmtleXMuVVA6XG5cdFx0XHRcdHNjb3BlLnBhbiggMCwgc2NvcGUua2V5UGFuU3BlZWQgKTtcblx0XHRcdFx0c2NvcGUudXBkYXRlKCk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIHNjb3BlLmtleXMuQk9UVE9NOlxuXHRcdFx0XHRzY29wZS5wYW4oIDAsIC0gc2NvcGUua2V5UGFuU3BlZWQgKTtcblx0XHRcdFx0c2NvcGUudXBkYXRlKCk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIHNjb3BlLmtleXMuTEVGVDpcblx0XHRcdFx0c2NvcGUucGFuKCBzY29wZS5rZXlQYW5TcGVlZCwgMCApO1xuXHRcdFx0XHRzY29wZS51cGRhdGUoKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2Ugc2NvcGUua2V5cy5SSUdIVDpcblx0XHRcdFx0c2NvcGUucGFuKCAtIHNjb3BlLmtleVBhblNwZWVkLCAwICk7XG5cdFx0XHRcdHNjb3BlLnVwZGF0ZSgpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdH1cblxuXHR9XG5cblx0ZnVuY3Rpb24gdG91Y2hzdGFydCggZXZlbnQgKSB7XG5cblx0XHRpZiAoIHNjb3BlLmVuYWJsZWQgPT09IGZhbHNlICkgcmV0dXJuO1xuXG5cdFx0c3dpdGNoICggZXZlbnQudG91Y2hlcy5sZW5ndGggKSB7XG5cblx0XHRcdGNhc2UgMTpcdC8vIG9uZS1maW5nZXJlZCB0b3VjaDogcm90YXRlXG5cblx0XHRcdFx0aWYgKCBzY29wZS5ub1JvdGF0ZSA9PT0gdHJ1ZSApIHJldHVybjtcblxuXHRcdFx0XHRzdGF0ZSA9IFNUQVRFLlRPVUNIX1JPVEFURTtcblxuXHRcdFx0XHRyb3RhdGVTdGFydC5zZXQoIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCwgZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZICk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIDI6XHQvLyB0d28tZmluZ2VyZWQgdG91Y2g6IGRvbGx5XG5cblx0XHRcdFx0aWYgKCBzY29wZS5ub1pvb20gPT09IHRydWUgKSByZXR1cm47XG5cblx0XHRcdFx0c3RhdGUgPSBTVEFURS5UT1VDSF9ET0xMWTtcblxuXHRcdFx0XHR2YXIgZHggPSBldmVudC50b3VjaGVzWyAwIF0ucGFnZVggLSBldmVudC50b3VjaGVzWyAxIF0ucGFnZVg7XG5cdFx0XHRcdHZhciBkeSA9IGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSAtIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWTtcblx0XHRcdFx0dmFyIGRpc3RhbmNlID0gTWF0aC5zcXJ0KCBkeCAqIGR4ICsgZHkgKiBkeSApO1xuXHRcdFx0XHRkb2xseVN0YXJ0LnNldCggMCwgZGlzdGFuY2UgKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgMzogLy8gdGhyZWUtZmluZ2VyZWQgdG91Y2g6IHBhblxuXG5cdFx0XHRcdGlmICggc2NvcGUubm9QYW4gPT09IHRydWUgKSByZXR1cm47XG5cblx0XHRcdFx0c3RhdGUgPSBTVEFURS5UT1VDSF9QQU47XG5cblx0XHRcdFx0cGFuU3RhcnQuc2V0KCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVgsIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSApO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0ZGVmYXVsdDpcblxuXHRcdFx0XHRzdGF0ZSA9IFNUQVRFLk5PTkU7XG5cblx0XHR9XG5cblx0XHRzY29wZS5kaXNwYXRjaEV2ZW50KCBzdGFydEV2ZW50ICk7XG5cblx0fVxuXG5cdGZ1bmN0aW9uIHRvdWNobW92ZSggZXZlbnQgKSB7XG5cblx0XHRpZiAoIHNjb3BlLmVuYWJsZWQgPT09IGZhbHNlICkgcmV0dXJuO1xuXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdHZhciBlbGVtZW50ID0gc2NvcGUuZG9tRWxlbWVudCA9PT0gZG9jdW1lbnQgPyBzY29wZS5kb21FbGVtZW50LmJvZHkgOiBzY29wZS5kb21FbGVtZW50O1xuXG5cdFx0c3dpdGNoICggZXZlbnQudG91Y2hlcy5sZW5ndGggKSB7XG5cblx0XHRcdGNhc2UgMTogLy8gb25lLWZpbmdlcmVkIHRvdWNoOiByb3RhdGVcblxuXHRcdFx0XHRpZiAoIHNjb3BlLm5vUm90YXRlID09PSB0cnVlICkgcmV0dXJuO1xuXHRcdFx0XHRpZiAoIHN0YXRlICE9PSBTVEFURS5UT1VDSF9ST1RBVEUgKSByZXR1cm47XG5cblx0XHRcdFx0cm90YXRlRW5kLnNldCggZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VYLCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgKTtcblx0XHRcdFx0cm90YXRlRGVsdGEuc3ViVmVjdG9ycyggcm90YXRlRW5kLCByb3RhdGVTdGFydCApO1xuXG5cdFx0XHRcdC8vIHJvdGF0aW5nIGFjcm9zcyB3aG9sZSBzY3JlZW4gZ29lcyAzNjAgZGVncmVlcyBhcm91bmRcblx0XHRcdFx0c2NvcGUucm90YXRlTGVmdCggMiAqIE1hdGguUEkgKiByb3RhdGVEZWx0YS54IC8gZWxlbWVudC5jbGllbnRXaWR0aCAqIHNjb3BlLnJvdGF0ZVNwZWVkICk7XG5cdFx0XHRcdC8vIHJvdGF0aW5nIHVwIGFuZCBkb3duIGFsb25nIHdob2xlIHNjcmVlbiBhdHRlbXB0cyB0byBnbyAzNjAsIGJ1dCBsaW1pdGVkIHRvIDE4MFxuXHRcdFx0XHRzY29wZS5yb3RhdGVVcCggMiAqIE1hdGguUEkgKiByb3RhdGVEZWx0YS55IC8gZWxlbWVudC5jbGllbnRIZWlnaHQgKiBzY29wZS5yb3RhdGVTcGVlZCApO1xuXG5cdFx0XHRcdHJvdGF0ZVN0YXJ0LmNvcHkoIHJvdGF0ZUVuZCApO1xuXG5cdFx0XHRcdHNjb3BlLnVwZGF0ZSgpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAyOiAvLyB0d28tZmluZ2VyZWQgdG91Y2g6IGRvbGx5XG5cblx0XHRcdFx0aWYgKCBzY29wZS5ub1pvb20gPT09IHRydWUgKSByZXR1cm47XG5cdFx0XHRcdGlmICggc3RhdGUgIT09IFNUQVRFLlRPVUNIX0RPTExZICkgcmV0dXJuO1xuXG5cdFx0XHRcdHZhciBkeCA9IGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCAtIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWDtcblx0XHRcdFx0dmFyIGR5ID0gZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZIC0gZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VZO1xuXHRcdFx0XHR2YXIgZGlzdGFuY2UgPSBNYXRoLnNxcnQoIGR4ICogZHggKyBkeSAqIGR5ICk7XG5cblx0XHRcdFx0ZG9sbHlFbmQuc2V0KCAwLCBkaXN0YW5jZSApO1xuXHRcdFx0XHRkb2xseURlbHRhLnN1YlZlY3RvcnMoIGRvbGx5RW5kLCBkb2xseVN0YXJ0ICk7XG5cblx0XHRcdFx0aWYgKCBkb2xseURlbHRhLnkgPiAwICkge1xuXG5cdFx0XHRcdFx0c2NvcGUuZG9sbHlPdXQoKTtcblxuXHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0c2NvcGUuZG9sbHlJbigpO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRkb2xseVN0YXJ0LmNvcHkoIGRvbGx5RW5kICk7XG5cblx0XHRcdFx0c2NvcGUudXBkYXRlKCk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIDM6IC8vIHRocmVlLWZpbmdlcmVkIHRvdWNoOiBwYW5cblxuXHRcdFx0XHRpZiAoIHNjb3BlLm5vUGFuID09PSB0cnVlICkgcmV0dXJuO1xuXHRcdFx0XHRpZiAoIHN0YXRlICE9PSBTVEFURS5UT1VDSF9QQU4gKSByZXR1cm47XG5cblx0XHRcdFx0cGFuRW5kLnNldCggZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VYLCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgKTtcblx0XHRcdFx0cGFuRGVsdGEuc3ViVmVjdG9ycyggcGFuRW5kLCBwYW5TdGFydCApO1xuXHRcdFx0XHRcblx0XHRcdFx0c2NvcGUucGFuKCBwYW5EZWx0YS54LCBwYW5EZWx0YS55ICk7XG5cblx0XHRcdFx0cGFuU3RhcnQuY29weSggcGFuRW5kICk7XG5cblx0XHRcdFx0c2NvcGUudXBkYXRlKCk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OlxuXG5cdFx0XHRcdHN0YXRlID0gU1RBVEUuTk9ORTtcblxuXHRcdH1cblxuXHR9XG5cblx0ZnVuY3Rpb24gdG91Y2hlbmQoIC8qIGV2ZW50ICovICkge1xuXG5cdFx0aWYgKCBzY29wZS5lbmFibGVkID09PSBmYWxzZSApIHJldHVybjtcblxuXHRcdHNjb3BlLmRpc3BhdGNoRXZlbnQoIGVuZEV2ZW50ICk7XG5cdFx0c3RhdGUgPSBTVEFURS5OT05FO1xuXG5cdH1cblxuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2NvbnRleHRtZW51JywgZnVuY3Rpb24gKCBldmVudCApIHsgZXZlbnQucHJldmVudERlZmF1bHQoKTsgfSwgZmFsc2UgKTtcblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZWRvd24nLCBvbk1vdXNlRG93biwgZmFsc2UgKTtcblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZXdoZWVsJywgb25Nb3VzZVdoZWVsLCBmYWxzZSApO1xuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ0RPTU1vdXNlU2Nyb2xsJywgb25Nb3VzZVdoZWVsLCBmYWxzZSApOyAvLyBmaXJlZm94XG5cblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0JywgdG91Y2hzdGFydCwgZmFsc2UgKTtcblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaGVuZCcsIHRvdWNoZW5kLCBmYWxzZSApO1xuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNobW92ZScsIHRvdWNobW92ZSwgZmFsc2UgKTtcblxuXHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCBvbktleURvd24sIGZhbHNlICk7XG5cblx0Ly8gZm9yY2UgYW4gdXBkYXRlIGF0IHN0YXJ0XG5cdHRoaXMudXBkYXRlKCk7XG5cbn07XG5cblRIUkVFLk9yYml0Q29udHJvbHMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVEhSRUUuRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZSApO1xuIiwiLyoqXG4gKiBAbW9kdWxlICBsaWIvVEhSRUV4L0Z1bGxTY3JlZW5cbiAqL1xuXG4vKipcbiogVGhpcyBoZWxwZXIgbWFrZXMgaXQgZWFzeSB0byBoYW5kbGUgdGhlIGZ1bGxzY3JlZW4gQVBJOlxuKiBcbiogLSBpdCBoaWRlcyB0aGUgcHJlZml4IGZvciBlYWNoIGJyb3dzZXJcbiogLSBpdCBoaWRlcyB0aGUgbGl0dGxlIGRpc2NyZXBlbmNpZXMgb2YgdGhlIHZhcmlvdXMgdmVuZG9yIEFQSVxuKiAtIGF0IHRoZSB0aW1lIG9mIHRoaXMgd3JpdGluZyAobm92IDIwMTEpIGl0IGlzIGF2YWlsYWJsZSBpbiBcbiogXG4qICAgW2ZpcmVmb3ggbmlnaHRseV0oaHR0cDovL2Jsb2cucGVhcmNlLm9yZy5uei8yMDExLzExL2ZpcmVmb3hzLWh0bWwtZnVsbC1zY3JlZW4tYXBpLWVuYWJsZWQuaHRtbCksXG4qICAgW3dlYmtpdCBuaWdodGx5XShodHRwOi8vcGV0ZXIuc2gvMjAxMS8wMS9qYXZhc2NyaXB0LWZ1bGwtc2NyZWVuLWFwaS1uYXZpZ2F0aW9uLXRpbWluZy1hbmQtcmVwZWF0aW5nLWNzcy1ncmFkaWVudHMvKSBhbmRcbiogICBbY2hyb21lIHN0YWJsZV0oaHR0cDovL3VwZGF0ZXMuaHRtbDVyb2Nrcy5jb20vMjAxMS8xMC9MZXQtWW91ci1Db250ZW50LURvLXRoZS1UYWxraW5nLUZ1bGxzY3JlZW4tQVBJKS5cbiogXG4qIEBuYW1lc3BhY2VcbiovXG52YXIgZnVsbFNjcmVlbiA9IHt9O1xuXG4vKipcbiAqIHRlc3QgaWYgaXQgaXMgcG9zc2libGUgdG8gaGF2ZSBmdWxsc2NyZWVuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiBmdWxsc2NyZWVuIEFQSSBpcyBhdmFpbGFibGUsIGZhbHNlIG90aGVyd2lzZVxuICovXG5mdWxsU2NyZWVuLmF2YWlsYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuX2hhc1dlYmtpdEZ1bGxTY3JlZW4gfHwgdGhpcy5faGFzTW96RnVsbFNjcmVlbjtcbn07XG5cbi8qKlxuICogVGVzdCBpZiBmdWxsc2NyZWVuIGlzIGN1cnJlbnRseSBhY3RpdmF0ZWRcbiAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIGZ1bGxzY3JlZW4gaXMgY3VycmVudGx5IGFjdGl2YXRlZCwgZmFsc2Ugb3RoZXJ3aXNlXG4gKi9cbmZ1bGxTY3JlZW4uYWN0aXZhdGVkID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5faGFzV2Via2l0RnVsbFNjcmVlbikge1xuICAgIHJldHVybiBkb2N1bWVudC53ZWJraXRJc0Z1bGxTY3JlZW47XG4gIH0gZWxzZSBpZiAodGhpcy5faGFzTW96RnVsbFNjcmVlbikge1xuICAgIHJldHVybiBkb2N1bWVudC5tb3pGdWxsU2NyZWVuO1xuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUuYXNzZXJ0KGZhbHNlKTtcbiAgfVxufTtcblxuLyoqXG4gKiBSZXF1ZXN0IGZ1bGxzY3JlZW4gb24gYSBnaXZlbiBlbGVtZW50XG4gKiBAcGFyYW0ge0RvbUVsZW1lbnR9IGVsZW1lbnQgdG8gbWFrZSBmdWxsc2NyZWVuLiBvcHRpb25hbC4gZGVmYXVsdCB0byBkb2N1bWVudC5ib2R5XG4gKi9cbmZ1bGxTY3JlZW4ucmVxdWVzdCA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIGVsZW1lbnQgPSBlbGVtZW50IHx8IGRvY3VtZW50LmJvZHk7XG4gIGlmICh0aGlzLl9oYXNXZWJraXRGdWxsU2NyZWVuKSB7XG4gICAgZWxlbWVudC53ZWJraXRSZXF1ZXN0RnVsbFNjcmVlbihFbGVtZW50LkFMTE9XX0tFWUJPQVJEX0lOUFVUKTtcbiAgfSBlbHNlIGlmICh0aGlzLl9oYXNNb3pGdWxsU2NyZWVuKSB7XG4gICAgZWxlbWVudC5tb3pSZXF1ZXN0RnVsbFNjcmVlbigpO1xuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUuYXNzZXJ0KGZhbHNlKTtcbiAgfVxufTtcblxuLyoqXG4gKiBDYW5jZWwgZnVsbHNjcmVlblxuICovXG5mdWxsU2NyZWVuLmNhbmNlbCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuX2hhc1dlYmtpdEZ1bGxTY3JlZW4pIHtcbiAgICBkb2N1bWVudC53ZWJraXRDYW5jZWxGdWxsU2NyZWVuKCk7XG4gIH0gZWxzZSBpZiAodGhpcy5faGFzTW96RnVsbFNjcmVlbikge1xuICAgIGRvY3VtZW50Lm1vekNhbmNlbEZ1bGxTY3JlZW4oKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmFzc2VydChmYWxzZSk7XG4gIH1cbn07XG5cblxuLy8gaW50ZXJuYWwgZnVuY3Rpb25zIHRvIGtub3cgd2hpY2ggZnVsbHNjcmVlbiBBUEkgaW1wbGVtZW50YXRpb24gaXMgYXZhaWxhYmxlXG5mdWxsU2NyZWVuLl9oYXNXZWJraXRGdWxsU2NyZWVuID0gJ3dlYmtpdENhbmNlbEZ1bGxTY3JlZW4nIGluIGRvY3VtZW50ID8gdHJ1ZSA6IGZhbHNlO1xuZnVsbFNjcmVlbi5faGFzTW96RnVsbFNjcmVlbiA9ICdtb3pDYW5jZWxGdWxsU2NyZWVuJyBpbiBkb2N1bWVudCA/IHRydWUgOiBmYWxzZTtcblxuLyoqXG4gKiBCaW5kIGEga2V5IHRvIHJlbmRlcmVyIHNjcmVlbnNob3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdHMuY2hhcmNvZGU9Zl1cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0cy5kYmxDbGljaz1mYWxzZV0gVHJ1ZSB0byBtYWtlIGl0IGdvXG4gKiBmdWxsc2NyZWVuIG9uIGRvdWJsZSBjbGlja1xuICovXG5mdWxsU2NyZWVuLmJpbmRLZXkgPSBmdW5jdGlvbiAob3B0cykge1xuICBvcHRzID0gb3B0cyB8fCB7fTtcbiAgdmFyIGNoYXJDb2RlID0gb3B0cy5jaGFyQ29kZSB8fCAnZicuY2hhckNvZGVBdCgwKTtcbiAgdmFyIGRibGNsaWNrID0gb3B0cy5kYmxjbGljayAhPT0gdW5kZWZpbmVkID8gb3B0cy5kYmxjbGljayA6IGZhbHNlO1xuICB2YXIgZWxlbWVudCA9IG9wdHMuZWxlbWVudDtcblxuICB2YXIgdG9nZ2xlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChmdWxsU2NyZWVuLmFjdGl2YXRlZCgpKSB7XG4gICAgICBmdWxsU2NyZWVuLmNhbmNlbCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmdWxsU2NyZWVuLnJlcXVlc3QoZWxlbWVudCk7XG4gICAgfVxuICB9O1xuXG4gIC8vIGNhbGxiYWNrIHRvIGhhbmRsZSBrZXlwcmVzc1xuICB2YXIgX19iaW5kID0gZnVuY3Rpb24gKGZuLCBtZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gZm4uYXBwbHkobWUsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfTtcbiAgdmFyIG9uS2V5UHJlc3MgPSBfX2JpbmQoZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgLy8gcmV0dXJuIG5vdyBpZiB0aGUgS2V5UHJlc3MgaXNudCBmb3IgdGhlIHByb3BlciBjaGFyQ29kZVxuICAgIGlmIChldmVudC53aGljaCAhPT0gY2hhckNvZGUpIHsgcmV0dXJuOyB9XG4gICAgLy8gdG9nZ2xlIGZ1bGxzY3JlZW5cbiAgICB0b2dnbGUoKTtcbiAgfSwgdGhpcyk7XG5cbiAgLy8gbGlzdGVuIHRvIGtleXByZXNzXG4gIC8vIE5PVEU6IGZvciBmaXJlZm94IGl0IHNlZW1zIG1hbmRhdG9yeSB0byBsaXN0ZW4gdG8gZG9jdW1lbnQgZGlyZWN0bHlcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5cHJlc3MnLCBvbktleVByZXNzLCBmYWxzZSk7XG4gIC8vIGxpc3RlbiB0byBkYmxjbGlja1xuICBkYmxjbGljayAmJiBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdkYmxjbGljaycsIHRvZ2dsZSwgZmFsc2UpO1xuXG4gIHJldHVybiB7XG4gICAgdW5iaW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlwcmVzcycsIG9uS2V5UHJlc3MsIGZhbHNlKTtcbiAgICAgIGRibGNsaWNrICYmIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RibGNsaWNrJywgdG9nZ2xlLCBmYWxzZSk7XG4gICAgfVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdWxsU2NyZWVuOyIsIi8qKlxuICogQG1vZHVsZSAgbGliL1RIUkVFeC9XaW5kb3dSZXNpemVcbiAqL1xuXG4vKipcbiAqIFRoaXMgaGVscGVyIG1ha2VzIGl0IGVhc3kgdG8gaGFuZGxlIHdpbmRvdyByZXNpemUuXG4gKiBJdCB3aWxsIHVwZGF0ZSByZW5kZXJlciBhbmQgY2FtZXJhIHdoZW4gd2luZG93IGlzIHJlc2l6ZWQuXG4gKlxuICogQGV4YW1wbGVcbiAqIC8vIFN0YXJ0IHVwZGF0aW5nIHJlbmRlcmVyIGFuZCBjYW1lcmFcbiAqIHZhciB3aW5kb3dSZXNpemUgPSBXaW5kb3dSZXNpemUoYVJlbmRlcmVyLCBhQ2FtZXJhKTtcbiAqIC8vU3RhcnQgdXBkYXRpbmcgcmVuZGVyZXIgYW5kIGNhbWVyYVxuICogd2luZG93UmVzaXplLnN0b3AoKVxuICpcbiAqIEBuYW1lc3BhY2VcbiAqIEBwYXJhbSB7T2JqZWN0fSByZW5kZXJlciB0aGUgcmVuZGVyZXIgdG8gdXBkYXRlXG4gKiBAcGFyYW0ge09iamVjdH0gQ2FtZXJhIHRoZSBjYW1lcmEgdG8gdXBkYXRlXG4gKi9cbnZhciB3aW5kb3dSZXNpemUgPSBmdW5jdGlvbiAocmVuZGVyZXIsIGNhbWVyYSkge1xuXHR2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcblx0XHQvLyBub3RpZnkgdGhlIHJlbmRlcmVyIG9mIHRoZSBzaXplIGNoYW5nZVxuXHRcdHJlbmRlcmVyLnNldFNpemUoIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQgKTtcblx0XHQvLyB1cGRhdGUgdGhlIGNhbWVyYVxuXHRcdGNhbWVyYS5hc3BlY3RcdD0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cdFx0Y2FtZXJhLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcblx0fTtcblx0Ly8gYmluZCB0aGUgcmVzaXplIGV2ZW50XG5cdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBjYWxsYmFjaywgZmFsc2UpO1xuXHQvLyByZXR1cm4gLnN0b3AoKSB0aGUgZnVuY3Rpb24gdG8gc3RvcCB3YXRjaGluZyB3aW5kb3cgcmVzaXplXG5cdHJldHVybiB7XG5cdFx0c3RvcFx0OiBmdW5jdGlvbigpe1xuXHRcdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGNhbGxiYWNrKTtcblx0XHR9XG5cdH07XG59O1xuXG4vKipcbiAqIEBzdGF0aWNcbiAqIEBwYXJhbSAge1RIUkVFLldlYkdMUmVuZGVyZXJ9IHJlbmRlcmVyXG4gKiBAcGFyYW0gIHtUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYX0gY2FtZXJhXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbndpbmRvd1Jlc2l6ZS5iaW5kXHQ9IGZ1bmN0aW9uKHJlbmRlcmVyLCBjYW1lcmEpe1xuXHRyZXR1cm4gd2luZG93UmVzaXplKHJlbmRlcmVyLCBjYW1lcmEpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB3aW5kb3dSZXNpemU7IiwiLyoqXG4gKiBAbmFtZSBUSFJFRXhcbiAqIHRocmVlLmpzIGV4dGVuc2lvbnNcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuICBXaW5kb3dSZXNpemU6IHJlcXVpcmUoJy4vV2luZG93UmVzaXplJyksXG4gIEZ1bGxTY3JlZW46IHJlcXVpcmUoJy4vRnVsbFNjcmVlbicpXG59OyIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbjtfX2Jyb3dzZXJpZnlfc2hpbV9yZXF1aXJlX189cmVxdWlyZTsoZnVuY3Rpb24gYnJvd3NlcmlmeVNoaW0obW9kdWxlLCBleHBvcnRzLCByZXF1aXJlLCBkZWZpbmUsIGJyb3dzZXJpZnlfc2hpbV9fZGVmaW5lX19tb2R1bGVfX2V4cG9ydF9fKSB7XG4vKipcbiAqIGRhdC1ndWkgSmF2YVNjcmlwdCBDb250cm9sbGVyIExpYnJhcnlcbiAqIGh0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC9kYXQtZ3VpXG4gKlxuICogQ29weXJpZ2h0IDIwMTEgRGF0YSBBcnRzIFRlYW0sIEdvb2dsZSBDcmVhdGl2ZSBMYWJcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKi9cbnZhciBkYXQ9ZGF0fHx7fTtkYXQuZ3VpPWRhdC5ndWl8fHt9O2RhdC51dGlscz1kYXQudXRpbHN8fHt9O2RhdC5jb250cm9sbGVycz1kYXQuY29udHJvbGxlcnN8fHt9O2RhdC5kb209ZGF0LmRvbXx8e307ZGF0LmNvbG9yPWRhdC5jb2xvcnx8e307ZGF0LnV0aWxzLmNzcz1mdW5jdGlvbigpe3JldHVybntsb2FkOmZ1bmN0aW9uKGUsYSl7dmFyIGE9YXx8ZG9jdW1lbnQsYz1hLmNyZWF0ZUVsZW1lbnQoXCJsaW5rXCIpO2MudHlwZT1cInRleHQvY3NzXCI7Yy5yZWw9XCJzdHlsZXNoZWV0XCI7Yy5ocmVmPWU7YS5nZXRFbGVtZW50c0J5VGFnTmFtZShcImhlYWRcIilbMF0uYXBwZW5kQ2hpbGQoYyl9LGluamVjdDpmdW5jdGlvbihlLGEpe3ZhciBhPWF8fGRvY3VtZW50LGM9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO2MudHlwZT1cInRleHQvY3NzXCI7Yy5pbm5lckhUTUw9ZTthLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaGVhZFwiKVswXS5hcHBlbmRDaGlsZChjKX19fSgpO1xuZGF0LnV0aWxzLmNvbW1vbj1mdW5jdGlvbigpe3ZhciBlPUFycmF5LnByb3RvdHlwZS5mb3JFYWNoLGE9QXJyYXkucHJvdG90eXBlLnNsaWNlO3JldHVybntCUkVBSzp7fSxleHRlbmQ6ZnVuY3Rpb24oYyl7dGhpcy5lYWNoKGEuY2FsbChhcmd1bWVudHMsMSksZnVuY3Rpb24oYSl7Zm9yKHZhciBmIGluIGEpdGhpcy5pc1VuZGVmaW5lZChhW2ZdKXx8KGNbZl09YVtmXSl9LHRoaXMpO3JldHVybiBjfSxkZWZhdWx0czpmdW5jdGlvbihjKXt0aGlzLmVhY2goYS5jYWxsKGFyZ3VtZW50cywxKSxmdW5jdGlvbihhKXtmb3IodmFyIGYgaW4gYSl0aGlzLmlzVW5kZWZpbmVkKGNbZl0pJiYoY1tmXT1hW2ZdKX0sdGhpcyk7cmV0dXJuIGN9LGNvbXBvc2U6ZnVuY3Rpb24oKXt2YXIgYz1hLmNhbGwoYXJndW1lbnRzKTtyZXR1cm4gZnVuY3Rpb24oKXtmb3IodmFyIGQ9YS5jYWxsKGFyZ3VtZW50cyksZj1jLmxlbmd0aC0xO2Y+PTA7Zi0tKWQ9W2NbZl0uYXBwbHkodGhpcyxkKV07cmV0dXJuIGRbMF19fSxcbmVhY2g6ZnVuY3Rpb24oYSxkLGYpe2lmKGUmJmEuZm9yRWFjaD09PWUpYS5mb3JFYWNoKGQsZik7ZWxzZSBpZihhLmxlbmd0aD09PWEubGVuZ3RoKzApZm9yKHZhciBiPTAsbj1hLmxlbmd0aDtiPG47YisrKXtpZihiIGluIGEmJmQuY2FsbChmLGFbYl0sYik9PT10aGlzLkJSRUFLKWJyZWFrfWVsc2UgZm9yKGIgaW4gYSlpZihkLmNhbGwoZixhW2JdLGIpPT09dGhpcy5CUkVBSylicmVha30sZGVmZXI6ZnVuY3Rpb24oYSl7c2V0VGltZW91dChhLDApfSx0b0FycmF5OmZ1bmN0aW9uKGMpe3JldHVybiBjLnRvQXJyYXk/Yy50b0FycmF5KCk6YS5jYWxsKGMpfSxpc1VuZGVmaW5lZDpmdW5jdGlvbihhKXtyZXR1cm4gYT09PXZvaWQgMH0saXNOdWxsOmZ1bmN0aW9uKGEpe3JldHVybiBhPT09bnVsbH0saXNOYU46ZnVuY3Rpb24oYSl7cmV0dXJuIGEhPT1hfSxpc0FycmF5OkFycmF5LmlzQXJyYXl8fGZ1bmN0aW9uKGEpe3JldHVybiBhLmNvbnN0cnVjdG9yPT09QXJyYXl9LGlzT2JqZWN0OmZ1bmN0aW9uKGEpe3JldHVybiBhPT09XG5PYmplY3QoYSl9LGlzTnVtYmVyOmZ1bmN0aW9uKGEpe3JldHVybiBhPT09YSswfSxpc1N0cmluZzpmdW5jdGlvbihhKXtyZXR1cm4gYT09PWErXCJcIn0saXNCb29sZWFuOmZ1bmN0aW9uKGEpe3JldHVybiBhPT09ZmFsc2V8fGE9PT10cnVlfSxpc0Z1bmN0aW9uOmZ1bmN0aW9uKGEpe3JldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYSk9PT1cIltvYmplY3QgRnVuY3Rpb25dXCJ9fX0oKTtcbmRhdC5jb250cm9sbGVycy5Db250cm9sbGVyPWZ1bmN0aW9uKGUpe3ZhciBhPWZ1bmN0aW9uKGEsZCl7dGhpcy5pbml0aWFsVmFsdWU9YVtkXTt0aGlzLmRvbUVsZW1lbnQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTt0aGlzLm9iamVjdD1hO3RoaXMucHJvcGVydHk9ZDt0aGlzLl9fb25GaW5pc2hDaGFuZ2U9dGhpcy5fX29uQ2hhbmdlPXZvaWQgMH07ZS5leHRlbmQoYS5wcm90b3R5cGUse29uQ2hhbmdlOmZ1bmN0aW9uKGEpe3RoaXMuX19vbkNoYW5nZT1hO3JldHVybiB0aGlzfSxvbkZpbmlzaENoYW5nZTpmdW5jdGlvbihhKXt0aGlzLl9fb25GaW5pc2hDaGFuZ2U9YTtyZXR1cm4gdGhpc30sc2V0VmFsdWU6ZnVuY3Rpb24oYSl7dGhpcy5vYmplY3RbdGhpcy5wcm9wZXJ0eV09YTt0aGlzLl9fb25DaGFuZ2UmJnRoaXMuX19vbkNoYW5nZS5jYWxsKHRoaXMsYSk7dGhpcy51cGRhdGVEaXNwbGF5KCk7cmV0dXJuIHRoaXN9LGdldFZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMub2JqZWN0W3RoaXMucHJvcGVydHldfSxcbnVwZGF0ZURpc3BsYXk6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpc30saXNNb2RpZmllZDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmluaXRpYWxWYWx1ZSE9PXRoaXMuZ2V0VmFsdWUoKX19KTtyZXR1cm4gYX0oZGF0LnV0aWxzLmNvbW1vbik7XG5kYXQuZG9tLmRvbT1mdW5jdGlvbihlKXtmdW5jdGlvbiBhKGIpe2lmKGI9PT1cIjBcInx8ZS5pc1VuZGVmaW5lZChiKSlyZXR1cm4gMDtiPWIubWF0Y2goZCk7cmV0dXJuIWUuaXNOdWxsKGIpP3BhcnNlRmxvYXQoYlsxXSk6MH12YXIgYz17fTtlLmVhY2goe0hUTUxFdmVudHM6W1wiY2hhbmdlXCJdLE1vdXNlRXZlbnRzOltcImNsaWNrXCIsXCJtb3VzZW1vdmVcIixcIm1vdXNlZG93blwiLFwibW91c2V1cFwiLFwibW91c2VvdmVyXCJdLEtleWJvYXJkRXZlbnRzOltcImtleWRvd25cIl19LGZ1bmN0aW9uKGIsYSl7ZS5lYWNoKGIsZnVuY3Rpb24oYil7Y1tiXT1hfSl9KTt2YXIgZD0vKFxcZCsoXFwuXFxkKyk/KXB4LyxmPXttYWtlU2VsZWN0YWJsZTpmdW5jdGlvbihiLGEpe2lmKCEoYj09PXZvaWQgMHx8Yi5zdHlsZT09PXZvaWQgMCkpYi5vbnNlbGVjdHN0YXJ0PWE/ZnVuY3Rpb24oKXtyZXR1cm4gZmFsc2V9OmZ1bmN0aW9uKCl7fSxiLnN0eWxlLk1velVzZXJTZWxlY3Q9YT9cImF1dG9cIjpcIm5vbmVcIixiLnN0eWxlLktodG1sVXNlclNlbGVjdD1cbmE/XCJhdXRvXCI6XCJub25lXCIsYi51bnNlbGVjdGFibGU9YT9cIm9uXCI6XCJvZmZcIn0sbWFrZUZ1bGxzY3JlZW46ZnVuY3Rpb24oYixhLGQpe2UuaXNVbmRlZmluZWQoYSkmJihhPXRydWUpO2UuaXNVbmRlZmluZWQoZCkmJihkPXRydWUpO2Iuc3R5bGUucG9zaXRpb249XCJhYnNvbHV0ZVwiO2lmKGEpYi5zdHlsZS5sZWZ0PTAsYi5zdHlsZS5yaWdodD0wO2lmKGQpYi5zdHlsZS50b3A9MCxiLnN0eWxlLmJvdHRvbT0wfSxmYWtlRXZlbnQ6ZnVuY3Rpb24oYixhLGQsZil7dmFyIGQ9ZHx8e30sbT1jW2FdO2lmKCFtKXRocm93IEVycm9yKFwiRXZlbnQgdHlwZSBcIithK1wiIG5vdCBzdXBwb3J0ZWQuXCIpO3ZhciBsPWRvY3VtZW50LmNyZWF0ZUV2ZW50KG0pO3N3aXRjaChtKXtjYXNlIFwiTW91c2VFdmVudHNcIjpsLmluaXRNb3VzZUV2ZW50KGEsZC5idWJibGVzfHxmYWxzZSxkLmNhbmNlbGFibGV8fHRydWUsd2luZG93LGQuY2xpY2tDb3VudHx8MSwwLDAsZC54fHxkLmNsaWVudFh8fDAsZC55fHxkLmNsaWVudFl8fFxuMCxmYWxzZSxmYWxzZSxmYWxzZSxmYWxzZSwwLG51bGwpO2JyZWFrO2Nhc2UgXCJLZXlib2FyZEV2ZW50c1wiOm09bC5pbml0S2V5Ym9hcmRFdmVudHx8bC5pbml0S2V5RXZlbnQ7ZS5kZWZhdWx0cyhkLHtjYW5jZWxhYmxlOnRydWUsY3RybEtleTpmYWxzZSxhbHRLZXk6ZmFsc2Usc2hpZnRLZXk6ZmFsc2UsbWV0YUtleTpmYWxzZSxrZXlDb2RlOnZvaWQgMCxjaGFyQ29kZTp2b2lkIDB9KTttKGEsZC5idWJibGVzfHxmYWxzZSxkLmNhbmNlbGFibGUsd2luZG93LGQuY3RybEtleSxkLmFsdEtleSxkLnNoaWZ0S2V5LGQubWV0YUtleSxkLmtleUNvZGUsZC5jaGFyQ29kZSk7YnJlYWs7ZGVmYXVsdDpsLmluaXRFdmVudChhLGQuYnViYmxlc3x8ZmFsc2UsZC5jYW5jZWxhYmxlfHx0cnVlKX1lLmRlZmF1bHRzKGwsZik7Yi5kaXNwYXRjaEV2ZW50KGwpfSxiaW5kOmZ1bmN0aW9uKGIsYSxkLGMpe2IuYWRkRXZlbnRMaXN0ZW5lcj9iLmFkZEV2ZW50TGlzdGVuZXIoYSxkLGN8fGZhbHNlKTpiLmF0dGFjaEV2ZW50JiZcbmIuYXR0YWNoRXZlbnQoXCJvblwiK2EsZCk7cmV0dXJuIGZ9LHVuYmluZDpmdW5jdGlvbihiLGEsZCxjKXtiLnJlbW92ZUV2ZW50TGlzdGVuZXI/Yi5yZW1vdmVFdmVudExpc3RlbmVyKGEsZCxjfHxmYWxzZSk6Yi5kZXRhY2hFdmVudCYmYi5kZXRhY2hFdmVudChcIm9uXCIrYSxkKTtyZXR1cm4gZn0sYWRkQ2xhc3M6ZnVuY3Rpb24oYixhKXtpZihiLmNsYXNzTmFtZT09PXZvaWQgMCliLmNsYXNzTmFtZT1hO2Vsc2UgaWYoYi5jbGFzc05hbWUhPT1hKXt2YXIgZD1iLmNsYXNzTmFtZS5zcGxpdCgvICsvKTtpZihkLmluZGV4T2YoYSk9PS0xKWQucHVzaChhKSxiLmNsYXNzTmFtZT1kLmpvaW4oXCIgXCIpLnJlcGxhY2UoL15cXHMrLyxcIlwiKS5yZXBsYWNlKC9cXHMrJC8sXCJcIil9cmV0dXJuIGZ9LHJlbW92ZUNsYXNzOmZ1bmN0aW9uKGIsYSl7aWYoYSl7aWYoYi5jbGFzc05hbWUhPT12b2lkIDApaWYoYi5jbGFzc05hbWU9PT1hKWIucmVtb3ZlQXR0cmlidXRlKFwiY2xhc3NcIik7ZWxzZXt2YXIgZD1iLmNsYXNzTmFtZS5zcGxpdCgvICsvKSxcbmM9ZC5pbmRleE9mKGEpO2lmKGMhPS0xKWQuc3BsaWNlKGMsMSksYi5jbGFzc05hbWU9ZC5qb2luKFwiIFwiKX19ZWxzZSBiLmNsYXNzTmFtZT12b2lkIDA7cmV0dXJuIGZ9LGhhc0NsYXNzOmZ1bmN0aW9uKGEsZCl7cmV0dXJuIFJlZ0V4cChcIig/Ol58XFxcXHMrKVwiK2QrXCIoPzpcXFxccyt8JClcIikudGVzdChhLmNsYXNzTmFtZSl8fGZhbHNlfSxnZXRXaWR0aDpmdW5jdGlvbihiKXtiPWdldENvbXB1dGVkU3R5bGUoYik7cmV0dXJuIGEoYltcImJvcmRlci1sZWZ0LXdpZHRoXCJdKSthKGJbXCJib3JkZXItcmlnaHQtd2lkdGhcIl0pK2EoYltcInBhZGRpbmctbGVmdFwiXSkrYShiW1wicGFkZGluZy1yaWdodFwiXSkrYShiLndpZHRoKX0sZ2V0SGVpZ2h0OmZ1bmN0aW9uKGIpe2I9Z2V0Q29tcHV0ZWRTdHlsZShiKTtyZXR1cm4gYShiW1wiYm9yZGVyLXRvcC13aWR0aFwiXSkrYShiW1wiYm9yZGVyLWJvdHRvbS13aWR0aFwiXSkrYShiW1wicGFkZGluZy10b3BcIl0pK2EoYltcInBhZGRpbmctYm90dG9tXCJdKSthKGIuaGVpZ2h0KX0sXG5nZXRPZmZzZXQ6ZnVuY3Rpb24oYSl7dmFyIGQ9e2xlZnQ6MCx0b3A6MH07aWYoYS5vZmZzZXRQYXJlbnQpe2RvIGQubGVmdCs9YS5vZmZzZXRMZWZ0LGQudG9wKz1hLm9mZnNldFRvcDt3aGlsZShhPWEub2Zmc2V0UGFyZW50KX1yZXR1cm4gZH0saXNBY3RpdmU6ZnVuY3Rpb24oYSl7cmV0dXJuIGE9PT1kb2N1bWVudC5hY3RpdmVFbGVtZW50JiYoYS50eXBlfHxhLmhyZWYpfX07cmV0dXJuIGZ9KGRhdC51dGlscy5jb21tb24pO1xuZGF0LmNvbnRyb2xsZXJzLk9wdGlvbkNvbnRyb2xsZXI9ZnVuY3Rpb24oZSxhLGMpe3ZhciBkPWZ1bmN0aW9uKGYsYixlKXtkLnN1cGVyY2xhc3MuY2FsbCh0aGlzLGYsYik7dmFyIGg9dGhpczt0aGlzLl9fc2VsZWN0PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzZWxlY3RcIik7aWYoYy5pc0FycmF5KGUpKXt2YXIgaj17fTtjLmVhY2goZSxmdW5jdGlvbihhKXtqW2FdPWF9KTtlPWp9Yy5lYWNoKGUsZnVuY3Rpb24oYSxiKXt2YXIgZD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIpO2QuaW5uZXJIVE1MPWI7ZC5zZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiLGEpO2guX19zZWxlY3QuYXBwZW5kQ2hpbGQoZCl9KTt0aGlzLnVwZGF0ZURpc3BsYXkoKTthLmJpbmQodGhpcy5fX3NlbGVjdCxcImNoYW5nZVwiLGZ1bmN0aW9uKCl7aC5zZXRWYWx1ZSh0aGlzLm9wdGlvbnNbdGhpcy5zZWxlY3RlZEluZGV4XS52YWx1ZSl9KTt0aGlzLmRvbUVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5fX3NlbGVjdCl9O1xuZC5zdXBlcmNsYXNzPWU7Yy5leHRlbmQoZC5wcm90b3R5cGUsZS5wcm90b3R5cGUse3NldFZhbHVlOmZ1bmN0aW9uKGEpe2E9ZC5zdXBlcmNsYXNzLnByb3RvdHlwZS5zZXRWYWx1ZS5jYWxsKHRoaXMsYSk7dGhpcy5fX29uRmluaXNoQ2hhbmdlJiZ0aGlzLl9fb25GaW5pc2hDaGFuZ2UuY2FsbCh0aGlzLHRoaXMuZ2V0VmFsdWUoKSk7cmV0dXJuIGF9LHVwZGF0ZURpc3BsYXk6ZnVuY3Rpb24oKXt0aGlzLl9fc2VsZWN0LnZhbHVlPXRoaXMuZ2V0VmFsdWUoKTtyZXR1cm4gZC5zdXBlcmNsYXNzLnByb3RvdHlwZS51cGRhdGVEaXNwbGF5LmNhbGwodGhpcyl9fSk7cmV0dXJuIGR9KGRhdC5jb250cm9sbGVycy5Db250cm9sbGVyLGRhdC5kb20uZG9tLGRhdC51dGlscy5jb21tb24pO1xuZGF0LmNvbnRyb2xsZXJzLk51bWJlckNvbnRyb2xsZXI9ZnVuY3Rpb24oZSxhKXt2YXIgYz1mdW5jdGlvbihkLGYsYil7Yy5zdXBlcmNsYXNzLmNhbGwodGhpcyxkLGYpO2I9Ynx8e307dGhpcy5fX21pbj1iLm1pbjt0aGlzLl9fbWF4PWIubWF4O3RoaXMuX19zdGVwPWIuc3RlcDtkPXRoaXMuX19pbXBsaWVkU3RlcD1hLmlzVW5kZWZpbmVkKHRoaXMuX19zdGVwKT90aGlzLmluaXRpYWxWYWx1ZT09MD8xOk1hdGgucG93KDEwLE1hdGguZmxvb3IoTWF0aC5sb2codGhpcy5pbml0aWFsVmFsdWUpL01hdGguTE4xMCkpLzEwOnRoaXMuX19zdGVwO2Q9ZC50b1N0cmluZygpO3RoaXMuX19wcmVjaXNpb249ZC5pbmRleE9mKFwiLlwiKT4tMT9kLmxlbmd0aC1kLmluZGV4T2YoXCIuXCIpLTE6MH07Yy5zdXBlcmNsYXNzPWU7YS5leHRlbmQoYy5wcm90b3R5cGUsZS5wcm90b3R5cGUse3NldFZhbHVlOmZ1bmN0aW9uKGEpe2lmKHRoaXMuX19taW4hPT12b2lkIDAmJmE8dGhpcy5fX21pbilhPXRoaXMuX19taW47XG5lbHNlIGlmKHRoaXMuX19tYXghPT12b2lkIDAmJmE+dGhpcy5fX21heClhPXRoaXMuX19tYXg7dGhpcy5fX3N0ZXAhPT12b2lkIDAmJmEldGhpcy5fX3N0ZXAhPTAmJihhPU1hdGgucm91bmQoYS90aGlzLl9fc3RlcCkqdGhpcy5fX3N0ZXApO3JldHVybiBjLnN1cGVyY2xhc3MucHJvdG90eXBlLnNldFZhbHVlLmNhbGwodGhpcyxhKX0sbWluOmZ1bmN0aW9uKGEpe3RoaXMuX19taW49YTtyZXR1cm4gdGhpc30sbWF4OmZ1bmN0aW9uKGEpe3RoaXMuX19tYXg9YTtyZXR1cm4gdGhpc30sc3RlcDpmdW5jdGlvbihhKXt0aGlzLl9fc3RlcD1hO3JldHVybiB0aGlzfX0pO3JldHVybiBjfShkYXQuY29udHJvbGxlcnMuQ29udHJvbGxlcixkYXQudXRpbHMuY29tbW9uKTtcbmRhdC5jb250cm9sbGVycy5OdW1iZXJDb250cm9sbGVyQm94PWZ1bmN0aW9uKGUsYSxjKXt2YXIgZD1mdW5jdGlvbihmLGIsZSl7ZnVuY3Rpb24gaCgpe3ZhciBhPXBhcnNlRmxvYXQobC5fX2lucHV0LnZhbHVlKTtjLmlzTmFOKGEpfHxsLnNldFZhbHVlKGEpfWZ1bmN0aW9uIGooYSl7dmFyIGI9by1hLmNsaWVudFk7bC5zZXRWYWx1ZShsLmdldFZhbHVlKCkrYipsLl9faW1wbGllZFN0ZXApO289YS5jbGllbnRZfWZ1bmN0aW9uIG0oKXthLnVuYmluZCh3aW5kb3csXCJtb3VzZW1vdmVcIixqKTthLnVuYmluZCh3aW5kb3csXCJtb3VzZXVwXCIsbSl9dGhpcy5fX3RydW5jYXRpb25TdXNwZW5kZWQ9ZmFsc2U7ZC5zdXBlcmNsYXNzLmNhbGwodGhpcyxmLGIsZSk7dmFyIGw9dGhpcyxvO3RoaXMuX19pbnB1dD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7dGhpcy5fX2lucHV0LnNldEF0dHJpYnV0ZShcInR5cGVcIixcInRleHRcIik7YS5iaW5kKHRoaXMuX19pbnB1dCxcImNoYW5nZVwiLGgpO1xuYS5iaW5kKHRoaXMuX19pbnB1dCxcImJsdXJcIixmdW5jdGlvbigpe2goKTtsLl9fb25GaW5pc2hDaGFuZ2UmJmwuX19vbkZpbmlzaENoYW5nZS5jYWxsKGwsbC5nZXRWYWx1ZSgpKX0pO2EuYmluZCh0aGlzLl9faW5wdXQsXCJtb3VzZWRvd25cIixmdW5jdGlvbihiKXthLmJpbmQod2luZG93LFwibW91c2Vtb3ZlXCIsaik7YS5iaW5kKHdpbmRvdyxcIm1vdXNldXBcIixtKTtvPWIuY2xpZW50WX0pO2EuYmluZCh0aGlzLl9faW5wdXQsXCJrZXlkb3duXCIsZnVuY3Rpb24oYSl7aWYoYS5rZXlDb2RlPT09MTMpbC5fX3RydW5jYXRpb25TdXNwZW5kZWQ9dHJ1ZSx0aGlzLmJsdXIoKSxsLl9fdHJ1bmNhdGlvblN1c3BlbmRlZD1mYWxzZX0pO3RoaXMudXBkYXRlRGlzcGxheSgpO3RoaXMuZG9tRWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLl9faW5wdXQpfTtkLnN1cGVyY2xhc3M9ZTtjLmV4dGVuZChkLnByb3RvdHlwZSxlLnByb3RvdHlwZSx7dXBkYXRlRGlzcGxheTpmdW5jdGlvbigpe3ZhciBhPXRoaXMuX19pbnB1dCxcbmI7aWYodGhpcy5fX3RydW5jYXRpb25TdXNwZW5kZWQpYj10aGlzLmdldFZhbHVlKCk7ZWxzZXtiPXRoaXMuZ2V0VmFsdWUoKTt2YXIgYz1NYXRoLnBvdygxMCx0aGlzLl9fcHJlY2lzaW9uKTtiPU1hdGgucm91bmQoYipjKS9jfWEudmFsdWU9YjtyZXR1cm4gZC5zdXBlcmNsYXNzLnByb3RvdHlwZS51cGRhdGVEaXNwbGF5LmNhbGwodGhpcyl9fSk7cmV0dXJuIGR9KGRhdC5jb250cm9sbGVycy5OdW1iZXJDb250cm9sbGVyLGRhdC5kb20uZG9tLGRhdC51dGlscy5jb21tb24pO1xuZGF0LmNvbnRyb2xsZXJzLk51bWJlckNvbnRyb2xsZXJTbGlkZXI9ZnVuY3Rpb24oZSxhLGMsZCxmKXt2YXIgYj1mdW5jdGlvbihkLGMsZixlLGwpe2Z1bmN0aW9uIG8oYil7Yi5wcmV2ZW50RGVmYXVsdCgpO3ZhciBkPWEuZ2V0T2Zmc2V0KGcuX19iYWNrZ3JvdW5kKSxjPWEuZ2V0V2lkdGgoZy5fX2JhY2tncm91bmQpO2cuc2V0VmFsdWUoZy5fX21pbisoZy5fX21heC1nLl9fbWluKSooKGIuY2xpZW50WC1kLmxlZnQpLyhkLmxlZnQrYy1kLmxlZnQpKSk7cmV0dXJuIGZhbHNlfWZ1bmN0aW9uIHkoKXthLnVuYmluZCh3aW5kb3csXCJtb3VzZW1vdmVcIixvKTthLnVuYmluZCh3aW5kb3csXCJtb3VzZXVwXCIseSk7Zy5fX29uRmluaXNoQ2hhbmdlJiZnLl9fb25GaW5pc2hDaGFuZ2UuY2FsbChnLGcuZ2V0VmFsdWUoKSl9Yi5zdXBlcmNsYXNzLmNhbGwodGhpcyxkLGMse21pbjpmLG1heDplLHN0ZXA6bH0pO3ZhciBnPXRoaXM7dGhpcy5fX2JhY2tncm91bmQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbnRoaXMuX19mb3JlZ3JvdW5kPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7YS5iaW5kKHRoaXMuX19iYWNrZ3JvdW5kLFwibW91c2Vkb3duXCIsZnVuY3Rpb24oYil7YS5iaW5kKHdpbmRvdyxcIm1vdXNlbW92ZVwiLG8pO2EuYmluZCh3aW5kb3csXCJtb3VzZXVwXCIseSk7byhiKX0pO2EuYWRkQ2xhc3ModGhpcy5fX2JhY2tncm91bmQsXCJzbGlkZXJcIik7YS5hZGRDbGFzcyh0aGlzLl9fZm9yZWdyb3VuZCxcInNsaWRlci1mZ1wiKTt0aGlzLnVwZGF0ZURpc3BsYXkoKTt0aGlzLl9fYmFja2dyb3VuZC5hcHBlbmRDaGlsZCh0aGlzLl9fZm9yZWdyb3VuZCk7dGhpcy5kb21FbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX19iYWNrZ3JvdW5kKX07Yi5zdXBlcmNsYXNzPWU7Yi51c2VEZWZhdWx0U3R5bGVzPWZ1bmN0aW9uKCl7Yy5pbmplY3QoZil9O2QuZXh0ZW5kKGIucHJvdG90eXBlLGUucHJvdG90eXBlLHt1cGRhdGVEaXNwbGF5OmZ1bmN0aW9uKCl7dGhpcy5fX2ZvcmVncm91bmQuc3R5bGUud2lkdGg9XG4odGhpcy5nZXRWYWx1ZSgpLXRoaXMuX19taW4pLyh0aGlzLl9fbWF4LXRoaXMuX19taW4pKjEwMCtcIiVcIjtyZXR1cm4gYi5zdXBlcmNsYXNzLnByb3RvdHlwZS51cGRhdGVEaXNwbGF5LmNhbGwodGhpcyl9fSk7cmV0dXJuIGJ9KGRhdC5jb250cm9sbGVycy5OdW1iZXJDb250cm9sbGVyLGRhdC5kb20uZG9tLGRhdC51dGlscy5jc3MsZGF0LnV0aWxzLmNvbW1vbixcIi5zbGlkZXIge1xcbiAgYm94LXNoYWRvdzogaW5zZXQgMCAycHggNHB4IHJnYmEoMCwwLDAsMC4xNSk7XFxuICBoZWlnaHQ6IDFlbTtcXG4gIGJvcmRlci1yYWRpdXM6IDFlbTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNlZWU7XFxuICBwYWRkaW5nOiAwIDAuNWVtO1xcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcXG59XFxuXFxuLnNsaWRlci1mZyB7XFxuICBwYWRkaW5nOiAxcHggMCAycHggMDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNhYWE7XFxuICBoZWlnaHQ6IDFlbTtcXG4gIG1hcmdpbi1sZWZ0OiAtMC41ZW07XFxuICBwYWRkaW5nLXJpZ2h0OiAwLjVlbTtcXG4gIGJvcmRlci1yYWRpdXM6IDFlbSAwIDAgMWVtO1xcbn1cXG5cXG4uc2xpZGVyLWZnOmFmdGVyIHtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIGJvcmRlci1yYWRpdXM6IDFlbTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICBib3JkZXI6ICAxcHggc29saWQgI2FhYTtcXG4gIGNvbnRlbnQ6ICcnO1xcbiAgZmxvYXQ6IHJpZ2h0O1xcbiAgbWFyZ2luLXJpZ2h0OiAtMWVtO1xcbiAgbWFyZ2luLXRvcDogLTFweDtcXG4gIGhlaWdodDogMC45ZW07XFxuICB3aWR0aDogMC45ZW07XFxufVwiKTtcbmRhdC5jb250cm9sbGVycy5GdW5jdGlvbkNvbnRyb2xsZXI9ZnVuY3Rpb24oZSxhLGMpe3ZhciBkPWZ1bmN0aW9uKGMsYixlKXtkLnN1cGVyY2xhc3MuY2FsbCh0aGlzLGMsYik7dmFyIGg9dGhpczt0aGlzLl9fYnV0dG9uPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7dGhpcy5fX2J1dHRvbi5pbm5lckhUTUw9ZT09PXZvaWQgMD9cIkZpcmVcIjplO2EuYmluZCh0aGlzLl9fYnV0dG9uLFwiY2xpY2tcIixmdW5jdGlvbihhKXthLnByZXZlbnREZWZhdWx0KCk7aC5maXJlKCk7cmV0dXJuIGZhbHNlfSk7YS5hZGRDbGFzcyh0aGlzLl9fYnV0dG9uLFwiYnV0dG9uXCIpO3RoaXMuZG9tRWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLl9fYnV0dG9uKX07ZC5zdXBlcmNsYXNzPWU7Yy5leHRlbmQoZC5wcm90b3R5cGUsZS5wcm90b3R5cGUse2ZpcmU6ZnVuY3Rpb24oKXt0aGlzLl9fb25DaGFuZ2UmJnRoaXMuX19vbkNoYW5nZS5jYWxsKHRoaXMpO3RoaXMuX19vbkZpbmlzaENoYW5nZSYmdGhpcy5fX29uRmluaXNoQ2hhbmdlLmNhbGwodGhpcyxcbnRoaXMuZ2V0VmFsdWUoKSk7dGhpcy5nZXRWYWx1ZSgpLmNhbGwodGhpcy5vYmplY3QpfX0pO3JldHVybiBkfShkYXQuY29udHJvbGxlcnMuQ29udHJvbGxlcixkYXQuZG9tLmRvbSxkYXQudXRpbHMuY29tbW9uKTtcbmRhdC5jb250cm9sbGVycy5Cb29sZWFuQ29udHJvbGxlcj1mdW5jdGlvbihlLGEsYyl7dmFyIGQ9ZnVuY3Rpb24oYyxiKXtkLnN1cGVyY2xhc3MuY2FsbCh0aGlzLGMsYik7dmFyIGU9dGhpczt0aGlzLl9fcHJldj10aGlzLmdldFZhbHVlKCk7dGhpcy5fX2NoZWNrYm94PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTt0aGlzLl9fY2hlY2tib3guc2V0QXR0cmlidXRlKFwidHlwZVwiLFwiY2hlY2tib3hcIik7YS5iaW5kKHRoaXMuX19jaGVja2JveCxcImNoYW5nZVwiLGZ1bmN0aW9uKCl7ZS5zZXRWYWx1ZSghZS5fX3ByZXYpfSxmYWxzZSk7dGhpcy5kb21FbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX19jaGVja2JveCk7dGhpcy51cGRhdGVEaXNwbGF5KCl9O2Quc3VwZXJjbGFzcz1lO2MuZXh0ZW5kKGQucHJvdG90eXBlLGUucHJvdG90eXBlLHtzZXRWYWx1ZTpmdW5jdGlvbihhKXthPWQuc3VwZXJjbGFzcy5wcm90b3R5cGUuc2V0VmFsdWUuY2FsbCh0aGlzLGEpO3RoaXMuX19vbkZpbmlzaENoYW5nZSYmXG50aGlzLl9fb25GaW5pc2hDaGFuZ2UuY2FsbCh0aGlzLHRoaXMuZ2V0VmFsdWUoKSk7dGhpcy5fX3ByZXY9dGhpcy5nZXRWYWx1ZSgpO3JldHVybiBhfSx1cGRhdGVEaXNwbGF5OmZ1bmN0aW9uKCl7dGhpcy5nZXRWYWx1ZSgpPT09dHJ1ZT8odGhpcy5fX2NoZWNrYm94LnNldEF0dHJpYnV0ZShcImNoZWNrZWRcIixcImNoZWNrZWRcIiksdGhpcy5fX2NoZWNrYm94LmNoZWNrZWQ9dHJ1ZSk6dGhpcy5fX2NoZWNrYm94LmNoZWNrZWQ9ZmFsc2U7cmV0dXJuIGQuc3VwZXJjbGFzcy5wcm90b3R5cGUudXBkYXRlRGlzcGxheS5jYWxsKHRoaXMpfX0pO3JldHVybiBkfShkYXQuY29udHJvbGxlcnMuQ29udHJvbGxlcixkYXQuZG9tLmRvbSxkYXQudXRpbHMuY29tbW9uKTtcbmRhdC5jb2xvci50b1N0cmluZz1mdW5jdGlvbihlKXtyZXR1cm4gZnVuY3Rpb24oYSl7aWYoYS5hPT0xfHxlLmlzVW5kZWZpbmVkKGEuYSkpe2ZvcihhPWEuaGV4LnRvU3RyaW5nKDE2KTthLmxlbmd0aDw2OylhPVwiMFwiK2E7cmV0dXJuXCIjXCIrYX1lbHNlIHJldHVyblwicmdiYShcIitNYXRoLnJvdW5kKGEucikrXCIsXCIrTWF0aC5yb3VuZChhLmcpK1wiLFwiK01hdGgucm91bmQoYS5iKStcIixcIithLmErXCIpXCJ9fShkYXQudXRpbHMuY29tbW9uKTtcbmRhdC5jb2xvci5pbnRlcnByZXQ9ZnVuY3Rpb24oZSxhKXt2YXIgYyxkLGY9W3tsaXRtdXM6YS5pc1N0cmluZyxjb252ZXJzaW9uczp7VEhSRUVfQ0hBUl9IRVg6e3JlYWQ6ZnVuY3Rpb24oYSl7YT1hLm1hdGNoKC9eIyhbQS1GMC05XSkoW0EtRjAtOV0pKFtBLUYwLTldKSQvaSk7cmV0dXJuIGE9PT1udWxsP2ZhbHNlOntzcGFjZTpcIkhFWFwiLGhleDpwYXJzZUludChcIjB4XCIrYVsxXS50b1N0cmluZygpK2FbMV0udG9TdHJpbmcoKSthWzJdLnRvU3RyaW5nKCkrYVsyXS50b1N0cmluZygpK2FbM10udG9TdHJpbmcoKSthWzNdLnRvU3RyaW5nKCkpfX0sd3JpdGU6ZX0sU0lYX0NIQVJfSEVYOntyZWFkOmZ1bmN0aW9uKGEpe2E9YS5tYXRjaCgvXiMoW0EtRjAtOV17Nn0pJC9pKTtyZXR1cm4gYT09PW51bGw/ZmFsc2U6e3NwYWNlOlwiSEVYXCIsaGV4OnBhcnNlSW50KFwiMHhcIithWzFdLnRvU3RyaW5nKCkpfX0sd3JpdGU6ZX0sQ1NTX1JHQjp7cmVhZDpmdW5jdGlvbihhKXthPWEubWF0Y2goL15yZ2JcXChcXHMqKC4rKVxccyosXFxzKiguKylcXHMqLFxccyooLispXFxzKlxcKS8pO1xucmV0dXJuIGE9PT1udWxsP2ZhbHNlOntzcGFjZTpcIlJHQlwiLHI6cGFyc2VGbG9hdChhWzFdKSxnOnBhcnNlRmxvYXQoYVsyXSksYjpwYXJzZUZsb2F0KGFbM10pfX0sd3JpdGU6ZX0sQ1NTX1JHQkE6e3JlYWQ6ZnVuY3Rpb24oYSl7YT1hLm1hdGNoKC9ecmdiYVxcKFxccyooLispXFxzKixcXHMqKC4rKVxccyosXFxzKiguKylcXHMqXFwsXFxzKiguKylcXHMqXFwpLyk7cmV0dXJuIGE9PT1udWxsP2ZhbHNlOntzcGFjZTpcIlJHQlwiLHI6cGFyc2VGbG9hdChhWzFdKSxnOnBhcnNlRmxvYXQoYVsyXSksYjpwYXJzZUZsb2F0KGFbM10pLGE6cGFyc2VGbG9hdChhWzRdKX19LHdyaXRlOmV9fX0se2xpdG11czphLmlzTnVtYmVyLGNvbnZlcnNpb25zOntIRVg6e3JlYWQ6ZnVuY3Rpb24oYSl7cmV0dXJue3NwYWNlOlwiSEVYXCIsaGV4OmEsY29udmVyc2lvbk5hbWU6XCJIRVhcIn19LHdyaXRlOmZ1bmN0aW9uKGEpe3JldHVybiBhLmhleH19fX0se2xpdG11czphLmlzQXJyYXksY29udmVyc2lvbnM6e1JHQl9BUlJBWTp7cmVhZDpmdW5jdGlvbihhKXtyZXR1cm4gYS5sZW5ndGghPVxuMz9mYWxzZTp7c3BhY2U6XCJSR0JcIixyOmFbMF0sZzphWzFdLGI6YVsyXX19LHdyaXRlOmZ1bmN0aW9uKGEpe3JldHVyblthLnIsYS5nLGEuYl19fSxSR0JBX0FSUkFZOntyZWFkOmZ1bmN0aW9uKGEpe3JldHVybiBhLmxlbmd0aCE9ND9mYWxzZTp7c3BhY2U6XCJSR0JcIixyOmFbMF0sZzphWzFdLGI6YVsyXSxhOmFbM119fSx3cml0ZTpmdW5jdGlvbihhKXtyZXR1cm5bYS5yLGEuZyxhLmIsYS5hXX19fX0se2xpdG11czphLmlzT2JqZWN0LGNvbnZlcnNpb25zOntSR0JBX09CSjp7cmVhZDpmdW5jdGlvbihiKXtyZXR1cm4gYS5pc051bWJlcihiLnIpJiZhLmlzTnVtYmVyKGIuZykmJmEuaXNOdW1iZXIoYi5iKSYmYS5pc051bWJlcihiLmEpP3tzcGFjZTpcIlJHQlwiLHI6Yi5yLGc6Yi5nLGI6Yi5iLGE6Yi5hfTpmYWxzZX0sd3JpdGU6ZnVuY3Rpb24oYSl7cmV0dXJue3I6YS5yLGc6YS5nLGI6YS5iLGE6YS5hfX19LFJHQl9PQko6e3JlYWQ6ZnVuY3Rpb24oYil7cmV0dXJuIGEuaXNOdW1iZXIoYi5yKSYmXG5hLmlzTnVtYmVyKGIuZykmJmEuaXNOdW1iZXIoYi5iKT97c3BhY2U6XCJSR0JcIixyOmIucixnOmIuZyxiOmIuYn06ZmFsc2V9LHdyaXRlOmZ1bmN0aW9uKGEpe3JldHVybntyOmEucixnOmEuZyxiOmEuYn19fSxIU1ZBX09CSjp7cmVhZDpmdW5jdGlvbihiKXtyZXR1cm4gYS5pc051bWJlcihiLmgpJiZhLmlzTnVtYmVyKGIucykmJmEuaXNOdW1iZXIoYi52KSYmYS5pc051bWJlcihiLmEpP3tzcGFjZTpcIkhTVlwiLGg6Yi5oLHM6Yi5zLHY6Yi52LGE6Yi5hfTpmYWxzZX0sd3JpdGU6ZnVuY3Rpb24oYSl7cmV0dXJue2g6YS5oLHM6YS5zLHY6YS52LGE6YS5hfX19LEhTVl9PQko6e3JlYWQ6ZnVuY3Rpb24oYil7cmV0dXJuIGEuaXNOdW1iZXIoYi5oKSYmYS5pc051bWJlcihiLnMpJiZhLmlzTnVtYmVyKGIudik/e3NwYWNlOlwiSFNWXCIsaDpiLmgsczpiLnMsdjpiLnZ9OmZhbHNlfSx3cml0ZTpmdW5jdGlvbihhKXtyZXR1cm57aDphLmgsczphLnMsdjphLnZ9fX19fV07cmV0dXJuIGZ1bmN0aW9uKCl7ZD1cbmZhbHNlO3ZhciBiPWFyZ3VtZW50cy5sZW5ndGg+MT9hLnRvQXJyYXkoYXJndW1lbnRzKTphcmd1bWVudHNbMF07YS5lYWNoKGYsZnVuY3Rpb24oZSl7aWYoZS5saXRtdXMoYikpcmV0dXJuIGEuZWFjaChlLmNvbnZlcnNpb25zLGZ1bmN0aW9uKGUsZil7Yz1lLnJlYWQoYik7aWYoZD09PWZhbHNlJiZjIT09ZmFsc2UpcmV0dXJuIGQ9YyxjLmNvbnZlcnNpb25OYW1lPWYsYy5jb252ZXJzaW9uPWUsYS5CUkVBS30pLGEuQlJFQUt9KTtyZXR1cm4gZH19KGRhdC5jb2xvci50b1N0cmluZyxkYXQudXRpbHMuY29tbW9uKTtcbmRhdC5HVUk9ZGF0Lmd1aS5HVUk9ZnVuY3Rpb24oZSxhLGMsZCxmLGIsbixoLGosbSxsLG8seSxnLGkpe2Z1bmN0aW9uIHEoYSxiLHIsYyl7aWYoYltyXT09PXZvaWQgMCl0aHJvdyBFcnJvcihcIk9iamVjdCBcIitiKycgaGFzIG5vIHByb3BlcnR5IFwiJytyKydcIicpO2MuY29sb3I/Yj1uZXcgbChiLHIpOihiPVtiLHJdLmNvbmNhdChjLmZhY3RvcnlBcmdzKSxiPWQuYXBwbHkoYSxiKSk7aWYoYy5iZWZvcmUgaW5zdGFuY2VvZiBmKWMuYmVmb3JlPWMuYmVmb3JlLl9fbGk7dChhLGIpO2cuYWRkQ2xhc3MoYi5kb21FbGVtZW50LFwiY1wiKTtyPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO2cuYWRkQ2xhc3MocixcInByb3BlcnR5LW5hbWVcIik7ci5pbm5lckhUTUw9Yi5wcm9wZXJ0eTt2YXIgZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO2UuYXBwZW5kQ2hpbGQocik7ZS5hcHBlbmRDaGlsZChiLmRvbUVsZW1lbnQpO2M9cyhhLGUsYy5iZWZvcmUpO2cuYWRkQ2xhc3MoYyxrLkNMQVNTX0NPTlRST0xMRVJfUk9XKTtcbmcuYWRkQ2xhc3MoYyx0eXBlb2YgYi5nZXRWYWx1ZSgpKTtwKGEsYyxiKTthLl9fY29udHJvbGxlcnMucHVzaChiKTtyZXR1cm4gYn1mdW5jdGlvbiBzKGEsYixkKXt2YXIgYz1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7YiYmYy5hcHBlbmRDaGlsZChiKTtkP2EuX191bC5pbnNlcnRCZWZvcmUoYyxwYXJhbXMuYmVmb3JlKTphLl9fdWwuYXBwZW5kQ2hpbGQoYyk7YS5vblJlc2l6ZSgpO3JldHVybiBjfWZ1bmN0aW9uIHAoYSxkLGMpe2MuX19saT1kO2MuX19ndWk9YTtpLmV4dGVuZChjLHtvcHRpb25zOmZ1bmN0aW9uKGIpe2lmKGFyZ3VtZW50cy5sZW5ndGg+MSlyZXR1cm4gYy5yZW1vdmUoKSxxKGEsYy5vYmplY3QsYy5wcm9wZXJ0eSx7YmVmb3JlOmMuX19saS5uZXh0RWxlbWVudFNpYmxpbmcsZmFjdG9yeUFyZ3M6W2kudG9BcnJheShhcmd1bWVudHMpXX0pO2lmKGkuaXNBcnJheShiKXx8aS5pc09iamVjdChiKSlyZXR1cm4gYy5yZW1vdmUoKSxxKGEsYy5vYmplY3QsYy5wcm9wZXJ0eSxcbntiZWZvcmU6Yy5fX2xpLm5leHRFbGVtZW50U2libGluZyxmYWN0b3J5QXJnczpbYl19KX0sbmFtZTpmdW5jdGlvbihhKXtjLl9fbGkuZmlyc3RFbGVtZW50Q2hpbGQuZmlyc3RFbGVtZW50Q2hpbGQuaW5uZXJIVE1MPWE7cmV0dXJuIGN9LGxpc3RlbjpmdW5jdGlvbigpe2MuX19ndWkubGlzdGVuKGMpO3JldHVybiBjfSxyZW1vdmU6ZnVuY3Rpb24oKXtjLl9fZ3VpLnJlbW92ZShjKTtyZXR1cm4gY319KTtpZihjIGluc3RhbmNlb2Ygail7dmFyIGU9bmV3IGgoYy5vYmplY3QsYy5wcm9wZXJ0eSx7bWluOmMuX19taW4sbWF4OmMuX19tYXgsc3RlcDpjLl9fc3RlcH0pO2kuZWFjaChbXCJ1cGRhdGVEaXNwbGF5XCIsXCJvbkNoYW5nZVwiLFwib25GaW5pc2hDaGFuZ2VcIl0sZnVuY3Rpb24oYSl7dmFyIGI9Y1thXSxIPWVbYV07Y1thXT1lW2FdPWZ1bmN0aW9uKCl7dmFyIGE9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtiLmFwcGx5KGMsYSk7cmV0dXJuIEguYXBwbHkoZSxhKX19KTtcbmcuYWRkQ2xhc3MoZCxcImhhcy1zbGlkZXJcIik7Yy5kb21FbGVtZW50Lmluc2VydEJlZm9yZShlLmRvbUVsZW1lbnQsYy5kb21FbGVtZW50LmZpcnN0RWxlbWVudENoaWxkKX1lbHNlIGlmKGMgaW5zdGFuY2VvZiBoKXt2YXIgZj1mdW5jdGlvbihiKXtyZXR1cm4gaS5pc051bWJlcihjLl9fbWluKSYmaS5pc051bWJlcihjLl9fbWF4KT8oYy5yZW1vdmUoKSxxKGEsYy5vYmplY3QsYy5wcm9wZXJ0eSx7YmVmb3JlOmMuX19saS5uZXh0RWxlbWVudFNpYmxpbmcsZmFjdG9yeUFyZ3M6W2MuX19taW4sYy5fX21heCxjLl9fc3RlcF19KSk6Yn07Yy5taW49aS5jb21wb3NlKGYsYy5taW4pO2MubWF4PWkuY29tcG9zZShmLGMubWF4KX1lbHNlIGlmKGMgaW5zdGFuY2VvZiBiKWcuYmluZChkLFwiY2xpY2tcIixmdW5jdGlvbigpe2cuZmFrZUV2ZW50KGMuX19jaGVja2JveCxcImNsaWNrXCIpfSksZy5iaW5kKGMuX19jaGVja2JveCxcImNsaWNrXCIsZnVuY3Rpb24oYSl7YS5zdG9wUHJvcGFnYXRpb24oKX0pO1xuZWxzZSBpZihjIGluc3RhbmNlb2YgbilnLmJpbmQoZCxcImNsaWNrXCIsZnVuY3Rpb24oKXtnLmZha2VFdmVudChjLl9fYnV0dG9uLFwiY2xpY2tcIil9KSxnLmJpbmQoZCxcIm1vdXNlb3ZlclwiLGZ1bmN0aW9uKCl7Zy5hZGRDbGFzcyhjLl9fYnV0dG9uLFwiaG92ZXJcIil9KSxnLmJpbmQoZCxcIm1vdXNlb3V0XCIsZnVuY3Rpb24oKXtnLnJlbW92ZUNsYXNzKGMuX19idXR0b24sXCJob3ZlclwiKX0pO2Vsc2UgaWYoYyBpbnN0YW5jZW9mIGwpZy5hZGRDbGFzcyhkLFwiY29sb3JcIiksYy51cGRhdGVEaXNwbGF5PWkuY29tcG9zZShmdW5jdGlvbihhKXtkLnN0eWxlLmJvcmRlckxlZnRDb2xvcj1jLl9fY29sb3IudG9TdHJpbmcoKTtyZXR1cm4gYX0sYy51cGRhdGVEaXNwbGF5KSxjLnVwZGF0ZURpc3BsYXkoKTtjLnNldFZhbHVlPWkuY29tcG9zZShmdW5jdGlvbihiKXthLmdldFJvb3QoKS5fX3ByZXNldF9zZWxlY3QmJmMuaXNNb2RpZmllZCgpJiZCKGEuZ2V0Um9vdCgpLHRydWUpO3JldHVybiBifSxjLnNldFZhbHVlKX1cbmZ1bmN0aW9uIHQoYSxiKXt2YXIgYz1hLmdldFJvb3QoKSxkPWMuX19yZW1lbWJlcmVkT2JqZWN0cy5pbmRleE9mKGIub2JqZWN0KTtpZihkIT0tMSl7dmFyIGU9Yy5fX3JlbWVtYmVyZWRPYmplY3RJbmRlY2VzVG9Db250cm9sbGVyc1tkXTtlPT09dm9pZCAwJiYoZT17fSxjLl9fcmVtZW1iZXJlZE9iamVjdEluZGVjZXNUb0NvbnRyb2xsZXJzW2RdPWUpO2VbYi5wcm9wZXJ0eV09YjtpZihjLmxvYWQmJmMubG9hZC5yZW1lbWJlcmVkKXtjPWMubG9hZC5yZW1lbWJlcmVkO2lmKGNbYS5wcmVzZXRdKWM9Y1thLnByZXNldF07ZWxzZSBpZihjW3ddKWM9Y1t3XTtlbHNlIHJldHVybjtpZihjW2RdJiZjW2RdW2IucHJvcGVydHldIT09dm9pZCAwKWQ9Y1tkXVtiLnByb3BlcnR5XSxiLmluaXRpYWxWYWx1ZT1kLGIuc2V0VmFsdWUoZCl9fX1mdW5jdGlvbiBJKGEpe3ZhciBiPWEuX19zYXZlX3Jvdz1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7Zy5hZGRDbGFzcyhhLmRvbUVsZW1lbnQsXG5cImhhcy1zYXZlXCIpO2EuX191bC5pbnNlcnRCZWZvcmUoYixhLl9fdWwuZmlyc3RDaGlsZCk7Zy5hZGRDbGFzcyhiLFwic2F2ZS1yb3dcIik7dmFyIGM9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7Yy5pbm5lckhUTUw9XCImbmJzcDtcIjtnLmFkZENsYXNzKGMsXCJidXR0b24gZ2VhcnNcIik7dmFyIGQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7ZC5pbm5lckhUTUw9XCJTYXZlXCI7Zy5hZGRDbGFzcyhkLFwiYnV0dG9uXCIpO2cuYWRkQ2xhc3MoZCxcInNhdmVcIik7dmFyIGU9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7ZS5pbm5lckhUTUw9XCJOZXdcIjtnLmFkZENsYXNzKGUsXCJidXR0b25cIik7Zy5hZGRDbGFzcyhlLFwic2F2ZS1hc1wiKTt2YXIgZj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtmLmlubmVySFRNTD1cIlJldmVydFwiO2cuYWRkQ2xhc3MoZixcImJ1dHRvblwiKTtnLmFkZENsYXNzKGYsXCJyZXZlcnRcIik7dmFyIG09YS5fX3ByZXNldF9zZWxlY3Q9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNlbGVjdFwiKTtcbmEubG9hZCYmYS5sb2FkLnJlbWVtYmVyZWQ/aS5lYWNoKGEubG9hZC5yZW1lbWJlcmVkLGZ1bmN0aW9uKGIsYyl7QyhhLGMsYz09YS5wcmVzZXQpfSk6QyhhLHcsZmFsc2UpO2cuYmluZChtLFwiY2hhbmdlXCIsZnVuY3Rpb24oKXtmb3IodmFyIGI9MDtiPGEuX19wcmVzZXRfc2VsZWN0Lmxlbmd0aDtiKyspYS5fX3ByZXNldF9zZWxlY3RbYl0uaW5uZXJIVE1MPWEuX19wcmVzZXRfc2VsZWN0W2JdLnZhbHVlO2EucHJlc2V0PXRoaXMudmFsdWV9KTtiLmFwcGVuZENoaWxkKG0pO2IuYXBwZW5kQ2hpbGQoYyk7Yi5hcHBlbmRDaGlsZChkKTtiLmFwcGVuZENoaWxkKGUpO2IuYXBwZW5kQ2hpbGQoZik7aWYodSl7dmFyIGI9ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZy1zYXZlLWxvY2FsbHlcIiksbD1kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRnLWxvY2FsLWV4cGxhaW5cIik7Yi5zdHlsZS5kaXNwbGF5PVwiYmxvY2tcIjtiPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGctbG9jYWwtc3RvcmFnZVwiKTtcbmxvY2FsU3RvcmFnZS5nZXRJdGVtKGRvY3VtZW50LmxvY2F0aW9uLmhyZWYrXCIuaXNMb2NhbFwiKT09PVwidHJ1ZVwiJiZiLnNldEF0dHJpYnV0ZShcImNoZWNrZWRcIixcImNoZWNrZWRcIik7dmFyIG89ZnVuY3Rpb24oKXtsLnN0eWxlLmRpc3BsYXk9YS51c2VMb2NhbFN0b3JhZ2U/XCJibG9ja1wiOlwibm9uZVwifTtvKCk7Zy5iaW5kKGIsXCJjaGFuZ2VcIixmdW5jdGlvbigpe2EudXNlTG9jYWxTdG9yYWdlPSFhLnVzZUxvY2FsU3RvcmFnZTtvKCl9KX12YXIgaD1kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRnLW5ldy1jb25zdHJ1Y3RvclwiKTtnLmJpbmQoaCxcImtleWRvd25cIixmdW5jdGlvbihhKXthLm1ldGFLZXkmJihhLndoaWNoPT09Njd8fGEua2V5Q29kZT09NjcpJiZ4LmhpZGUoKX0pO2cuYmluZChjLFwiY2xpY2tcIixmdW5jdGlvbigpe2guaW5uZXJIVE1MPUpTT04uc3RyaW5naWZ5KGEuZ2V0U2F2ZU9iamVjdCgpLHZvaWQgMCwyKTt4LnNob3coKTtoLmZvY3VzKCk7aC5zZWxlY3QoKX0pO2cuYmluZChkLFxuXCJjbGlja1wiLGZ1bmN0aW9uKCl7YS5zYXZlKCl9KTtnLmJpbmQoZSxcImNsaWNrXCIsZnVuY3Rpb24oKXt2YXIgYj1wcm9tcHQoXCJFbnRlciBhIG5ldyBwcmVzZXQgbmFtZS5cIik7YiYmYS5zYXZlQXMoYil9KTtnLmJpbmQoZixcImNsaWNrXCIsZnVuY3Rpb24oKXthLnJldmVydCgpfSl9ZnVuY3Rpb24gSihhKXtmdW5jdGlvbiBiKGYpe2YucHJldmVudERlZmF1bHQoKTtlPWYuY2xpZW50WDtnLmFkZENsYXNzKGEuX19jbG9zZUJ1dHRvbixrLkNMQVNTX0RSQUcpO2cuYmluZCh3aW5kb3csXCJtb3VzZW1vdmVcIixjKTtnLmJpbmQod2luZG93LFwibW91c2V1cFwiLGQpO3JldHVybiBmYWxzZX1mdW5jdGlvbiBjKGIpe2IucHJldmVudERlZmF1bHQoKTthLndpZHRoKz1lLWIuY2xpZW50WDthLm9uUmVzaXplKCk7ZT1iLmNsaWVudFg7cmV0dXJuIGZhbHNlfWZ1bmN0aW9uIGQoKXtnLnJlbW92ZUNsYXNzKGEuX19jbG9zZUJ1dHRvbixrLkNMQVNTX0RSQUcpO2cudW5iaW5kKHdpbmRvdyxcIm1vdXNlbW92ZVwiLFxuYyk7Zy51bmJpbmQod2luZG93LFwibW91c2V1cFwiLGQpfWEuX19yZXNpemVfaGFuZGxlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7aS5leHRlbmQoYS5fX3Jlc2l6ZV9oYW5kbGUuc3R5bGUse3dpZHRoOlwiNnB4XCIsbWFyZ2luTGVmdDpcIi0zcHhcIixoZWlnaHQ6XCIyMDBweFwiLGN1cnNvcjpcImV3LXJlc2l6ZVwiLHBvc2l0aW9uOlwiYWJzb2x1dGVcIn0pO3ZhciBlO2cuYmluZChhLl9fcmVzaXplX2hhbmRsZSxcIm1vdXNlZG93blwiLGIpO2cuYmluZChhLl9fY2xvc2VCdXR0b24sXCJtb3VzZWRvd25cIixiKTthLmRvbUVsZW1lbnQuaW5zZXJ0QmVmb3JlKGEuX19yZXNpemVfaGFuZGxlLGEuZG9tRWxlbWVudC5maXJzdEVsZW1lbnRDaGlsZCl9ZnVuY3Rpb24gRChhLGIpe2EuZG9tRWxlbWVudC5zdHlsZS53aWR0aD1iK1wicHhcIjtpZihhLl9fc2F2ZV9yb3cmJmEuYXV0b1BsYWNlKWEuX19zYXZlX3Jvdy5zdHlsZS53aWR0aD1iK1wicHhcIjtpZihhLl9fY2xvc2VCdXR0b24pYS5fX2Nsb3NlQnV0dG9uLnN0eWxlLndpZHRoPVxuYitcInB4XCJ9ZnVuY3Rpb24geihhLGIpe3ZhciBjPXt9O2kuZWFjaChhLl9fcmVtZW1iZXJlZE9iamVjdHMsZnVuY3Rpb24oZCxlKXt2YXIgZj17fTtpLmVhY2goYS5fX3JlbWVtYmVyZWRPYmplY3RJbmRlY2VzVG9Db250cm9sbGVyc1tlXSxmdW5jdGlvbihhLGMpe2ZbY109Yj9hLmluaXRpYWxWYWx1ZTphLmdldFZhbHVlKCl9KTtjW2VdPWZ9KTtyZXR1cm4gY31mdW5jdGlvbiBDKGEsYixjKXt2YXIgZD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIpO2QuaW5uZXJIVE1MPWI7ZC52YWx1ZT1iO2EuX19wcmVzZXRfc2VsZWN0LmFwcGVuZENoaWxkKGQpO2lmKGMpYS5fX3ByZXNldF9zZWxlY3Quc2VsZWN0ZWRJbmRleD1hLl9fcHJlc2V0X3NlbGVjdC5sZW5ndGgtMX1mdW5jdGlvbiBCKGEsYil7dmFyIGM9YS5fX3ByZXNldF9zZWxlY3RbYS5fX3ByZXNldF9zZWxlY3Quc2VsZWN0ZWRJbmRleF07Yy5pbm5lckhUTUw9Yj9jLnZhbHVlK1wiKlwiOmMudmFsdWV9ZnVuY3Rpb24gRShhKXthLmxlbmd0aCE9XG4wJiZvKGZ1bmN0aW9uKCl7RShhKX0pO2kuZWFjaChhLGZ1bmN0aW9uKGEpe2EudXBkYXRlRGlzcGxheSgpfSl9ZS5pbmplY3QoYyk7dmFyIHc9XCJEZWZhdWx0XCIsdTt0cnl7dT1cImxvY2FsU3RvcmFnZVwiaW4gd2luZG93JiZ3aW5kb3cubG9jYWxTdG9yYWdlIT09bnVsbH1jYXRjaChLKXt1PWZhbHNlfXZhciB4LEY9dHJ1ZSx2LEE9ZmFsc2UsRz1bXSxrPWZ1bmN0aW9uKGEpe2Z1bmN0aW9uIGIoKXtsb2NhbFN0b3JhZ2Uuc2V0SXRlbShkb2N1bWVudC5sb2NhdGlvbi5ocmVmK1wiLmd1aVwiLEpTT04uc3RyaW5naWZ5KGQuZ2V0U2F2ZU9iamVjdCgpKSl9ZnVuY3Rpb24gYygpe3ZhciBhPWQuZ2V0Um9vdCgpO2Eud2lkdGgrPTE7aS5kZWZlcihmdW5jdGlvbigpe2Eud2lkdGgtPTF9KX12YXIgZD10aGlzO3RoaXMuZG9tRWxlbWVudD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO3RoaXMuX191bD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidWxcIik7dGhpcy5kb21FbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX191bCk7XG5nLmFkZENsYXNzKHRoaXMuZG9tRWxlbWVudCxcImRnXCIpO3RoaXMuX19mb2xkZXJzPXt9O3RoaXMuX19jb250cm9sbGVycz1bXTt0aGlzLl9fcmVtZW1iZXJlZE9iamVjdHM9W107dGhpcy5fX3JlbWVtYmVyZWRPYmplY3RJbmRlY2VzVG9Db250cm9sbGVycz1bXTt0aGlzLl9fbGlzdGVuaW5nPVtdO2E9YXx8e307YT1pLmRlZmF1bHRzKGEse2F1dG9QbGFjZTp0cnVlLHdpZHRoOmsuREVGQVVMVF9XSURUSH0pO2E9aS5kZWZhdWx0cyhhLHtyZXNpemFibGU6YS5hdXRvUGxhY2UsaGlkZWFibGU6YS5hdXRvUGxhY2V9KTtpZihpLmlzVW5kZWZpbmVkKGEubG9hZCkpYS5sb2FkPXtwcmVzZXQ6d307ZWxzZSBpZihhLnByZXNldClhLmxvYWQucHJlc2V0PWEucHJlc2V0O2kuaXNVbmRlZmluZWQoYS5wYXJlbnQpJiZhLmhpZGVhYmxlJiZHLnB1c2godGhpcyk7YS5yZXNpemFibGU9aS5pc1VuZGVmaW5lZChhLnBhcmVudCkmJmEucmVzaXphYmxlO2lmKGEuYXV0b1BsYWNlJiZpLmlzVW5kZWZpbmVkKGEuc2Nyb2xsYWJsZSkpYS5zY3JvbGxhYmxlPVxudHJ1ZTt2YXIgZT11JiZsb2NhbFN0b3JhZ2UuZ2V0SXRlbShkb2N1bWVudC5sb2NhdGlvbi5ocmVmK1wiLmlzTG9jYWxcIik9PT1cInRydWVcIjtPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLHtwYXJlbnQ6e2dldDpmdW5jdGlvbigpe3JldHVybiBhLnBhcmVudH19LHNjcm9sbGFibGU6e2dldDpmdW5jdGlvbigpe3JldHVybiBhLnNjcm9sbGFibGV9fSxhdXRvUGxhY2U6e2dldDpmdW5jdGlvbigpe3JldHVybiBhLmF1dG9QbGFjZX19LHByZXNldDp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIGQucGFyZW50P2QuZ2V0Um9vdCgpLnByZXNldDphLmxvYWQucHJlc2V0fSxzZXQ6ZnVuY3Rpb24oYil7ZC5wYXJlbnQ/ZC5nZXRSb290KCkucHJlc2V0PWI6YS5sb2FkLnByZXNldD1iO2ZvcihiPTA7Yjx0aGlzLl9fcHJlc2V0X3NlbGVjdC5sZW5ndGg7YisrKWlmKHRoaXMuX19wcmVzZXRfc2VsZWN0W2JdLnZhbHVlPT10aGlzLnByZXNldCl0aGlzLl9fcHJlc2V0X3NlbGVjdC5zZWxlY3RlZEluZGV4PVxuYjtkLnJldmVydCgpfX0sd2lkdGg6e2dldDpmdW5jdGlvbigpe3JldHVybiBhLndpZHRofSxzZXQ6ZnVuY3Rpb24oYil7YS53aWR0aD1iO0QoZCxiKX19LG5hbWU6e2dldDpmdW5jdGlvbigpe3JldHVybiBhLm5hbWV9LHNldDpmdW5jdGlvbihiKXthLm5hbWU9YjtpZihtKW0uaW5uZXJIVE1MPWEubmFtZX19LGNsb3NlZDp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIGEuY2xvc2VkfSxzZXQ6ZnVuY3Rpb24oYil7YS5jbG9zZWQ9YjthLmNsb3NlZD9nLmFkZENsYXNzKGQuX191bCxrLkNMQVNTX0NMT1NFRCk6Zy5yZW1vdmVDbGFzcyhkLl9fdWwsay5DTEFTU19DTE9TRUQpO3RoaXMub25SZXNpemUoKTtpZihkLl9fY2xvc2VCdXR0b24pZC5fX2Nsb3NlQnV0dG9uLmlubmVySFRNTD1iP2suVEVYVF9PUEVOOmsuVEVYVF9DTE9TRUR9fSxsb2FkOntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gYS5sb2FkfX0sdXNlTG9jYWxTdG9yYWdlOntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gZX0sc2V0OmZ1bmN0aW9uKGEpe3UmJlxuKChlPWEpP2cuYmluZCh3aW5kb3csXCJ1bmxvYWRcIixiKTpnLnVuYmluZCh3aW5kb3csXCJ1bmxvYWRcIixiKSxsb2NhbFN0b3JhZ2Uuc2V0SXRlbShkb2N1bWVudC5sb2NhdGlvbi5ocmVmK1wiLmlzTG9jYWxcIixhKSl9fX0pO2lmKGkuaXNVbmRlZmluZWQoYS5wYXJlbnQpKXthLmNsb3NlZD1mYWxzZTtnLmFkZENsYXNzKHRoaXMuZG9tRWxlbWVudCxrLkNMQVNTX01BSU4pO2cubWFrZVNlbGVjdGFibGUodGhpcy5kb21FbGVtZW50LGZhbHNlKTtpZih1JiZlKXtkLnVzZUxvY2FsU3RvcmFnZT10cnVlO3ZhciBmPWxvY2FsU3RvcmFnZS5nZXRJdGVtKGRvY3VtZW50LmxvY2F0aW9uLmhyZWYrXCIuZ3VpXCIpO2lmKGYpYS5sb2FkPUpTT04ucGFyc2UoZil9dGhpcy5fX2Nsb3NlQnV0dG9uPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7dGhpcy5fX2Nsb3NlQnV0dG9uLmlubmVySFRNTD1rLlRFWFRfQ0xPU0VEO2cuYWRkQ2xhc3ModGhpcy5fX2Nsb3NlQnV0dG9uLGsuQ0xBU1NfQ0xPU0VfQlVUVE9OKTtcbnRoaXMuZG9tRWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLl9fY2xvc2VCdXR0b24pO2cuYmluZCh0aGlzLl9fY2xvc2VCdXR0b24sXCJjbGlja1wiLGZ1bmN0aW9uKCl7ZC5jbG9zZWQ9IWQuY2xvc2VkfSl9ZWxzZXtpZihhLmNsb3NlZD09PXZvaWQgMClhLmNsb3NlZD10cnVlO3ZhciBtPWRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGEubmFtZSk7Zy5hZGRDbGFzcyhtLFwiY29udHJvbGxlci1uYW1lXCIpO2Y9cyhkLG0pO2cuYWRkQ2xhc3ModGhpcy5fX3VsLGsuQ0xBU1NfQ0xPU0VEKTtnLmFkZENsYXNzKGYsXCJ0aXRsZVwiKTtnLmJpbmQoZixcImNsaWNrXCIsZnVuY3Rpb24oYSl7YS5wcmV2ZW50RGVmYXVsdCgpO2QuY2xvc2VkPSFkLmNsb3NlZDtyZXR1cm4gZmFsc2V9KTtpZighYS5jbG9zZWQpdGhpcy5jbG9zZWQ9ZmFsc2V9YS5hdXRvUGxhY2UmJihpLmlzVW5kZWZpbmVkKGEucGFyZW50KSYmKEYmJih2PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksZy5hZGRDbGFzcyh2LFwiZGdcIiksZy5hZGRDbGFzcyh2LFxuay5DTEFTU19BVVRPX1BMQUNFX0NPTlRBSU5FUiksZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh2KSxGPWZhbHNlKSx2LmFwcGVuZENoaWxkKHRoaXMuZG9tRWxlbWVudCksZy5hZGRDbGFzcyh0aGlzLmRvbUVsZW1lbnQsay5DTEFTU19BVVRPX1BMQUNFKSksdGhpcy5wYXJlbnR8fEQoZCxhLndpZHRoKSk7Zy5iaW5kKHdpbmRvdyxcInJlc2l6ZVwiLGZ1bmN0aW9uKCl7ZC5vblJlc2l6ZSgpfSk7Zy5iaW5kKHRoaXMuX191bCxcIndlYmtpdFRyYW5zaXRpb25FbmRcIixmdW5jdGlvbigpe2Qub25SZXNpemUoKX0pO2cuYmluZCh0aGlzLl9fdWwsXCJ0cmFuc2l0aW9uZW5kXCIsZnVuY3Rpb24oKXtkLm9uUmVzaXplKCl9KTtnLmJpbmQodGhpcy5fX3VsLFwib1RyYW5zaXRpb25FbmRcIixmdW5jdGlvbigpe2Qub25SZXNpemUoKX0pO3RoaXMub25SZXNpemUoKTthLnJlc2l6YWJsZSYmSih0aGlzKTtkLmdldFJvb3QoKTthLnBhcmVudHx8YygpfTtrLnRvZ2dsZUhpZGU9ZnVuY3Rpb24oKXtBPSFBO2kuZWFjaChHLFxuZnVuY3Rpb24oYSl7YS5kb21FbGVtZW50LnN0eWxlLnpJbmRleD1BPy05OTk6OTk5O2EuZG9tRWxlbWVudC5zdHlsZS5vcGFjaXR5PUE/MDoxfSl9O2suQ0xBU1NfQVVUT19QTEFDRT1cImFcIjtrLkNMQVNTX0FVVE9fUExBQ0VfQ09OVEFJTkVSPVwiYWNcIjtrLkNMQVNTX01BSU49XCJtYWluXCI7ay5DTEFTU19DT05UUk9MTEVSX1JPVz1cImNyXCI7ay5DTEFTU19UT09fVEFMTD1cInRhbGxlci10aGFuLXdpbmRvd1wiO2suQ0xBU1NfQ0xPU0VEPVwiY2xvc2VkXCI7ay5DTEFTU19DTE9TRV9CVVRUT049XCJjbG9zZS1idXR0b25cIjtrLkNMQVNTX0RSQUc9XCJkcmFnXCI7ay5ERUZBVUxUX1dJRFRIPTI0NTtrLlRFWFRfQ0xPU0VEPVwiQ2xvc2UgQ29udHJvbHNcIjtrLlRFWFRfT1BFTj1cIk9wZW4gQ29udHJvbHNcIjtnLmJpbmQod2luZG93LFwia2V5ZG93blwiLGZ1bmN0aW9uKGEpe2RvY3VtZW50LmFjdGl2ZUVsZW1lbnQudHlwZSE9PVwidGV4dFwiJiYoYS53aGljaD09PTcyfHxhLmtleUNvZGU9PTcyKSYmay50b2dnbGVIaWRlKCl9LFxuZmFsc2UpO2kuZXh0ZW5kKGsucHJvdG90eXBlLHthZGQ6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gcSh0aGlzLGEsYix7ZmFjdG9yeUFyZ3M6QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLDIpfSl9LGFkZENvbG9yOmZ1bmN0aW9uKGEsYil7cmV0dXJuIHEodGhpcyxhLGIse2NvbG9yOnRydWV9KX0scmVtb3ZlOmZ1bmN0aW9uKGEpe3RoaXMuX191bC5yZW1vdmVDaGlsZChhLl9fbGkpO3RoaXMuX19jb250cm9sbGVycy5zbGljZSh0aGlzLl9fY29udHJvbGxlcnMuaW5kZXhPZihhKSwxKTt2YXIgYj10aGlzO2kuZGVmZXIoZnVuY3Rpb24oKXtiLm9uUmVzaXplKCl9KX0sZGVzdHJveTpmdW5jdGlvbigpe3RoaXMuYXV0b1BsYWNlJiZ2LnJlbW92ZUNoaWxkKHRoaXMuZG9tRWxlbWVudCl9LGFkZEZvbGRlcjpmdW5jdGlvbihhKXtpZih0aGlzLl9fZm9sZGVyc1thXSE9PXZvaWQgMCl0aHJvdyBFcnJvcignWW91IGFscmVhZHkgaGF2ZSBhIGZvbGRlciBpbiB0aGlzIEdVSSBieSB0aGUgbmFtZSBcIicrXG5hKydcIicpO3ZhciBiPXtuYW1lOmEscGFyZW50OnRoaXN9O2IuYXV0b1BsYWNlPXRoaXMuYXV0b1BsYWNlO2lmKHRoaXMubG9hZCYmdGhpcy5sb2FkLmZvbGRlcnMmJnRoaXMubG9hZC5mb2xkZXJzW2FdKWIuY2xvc2VkPXRoaXMubG9hZC5mb2xkZXJzW2FdLmNsb3NlZCxiLmxvYWQ9dGhpcy5sb2FkLmZvbGRlcnNbYV07Yj1uZXcgayhiKTt0aGlzLl9fZm9sZGVyc1thXT1iO2E9cyh0aGlzLGIuZG9tRWxlbWVudCk7Zy5hZGRDbGFzcyhhLFwiZm9sZGVyXCIpO3JldHVybiBifSxvcGVuOmZ1bmN0aW9uKCl7dGhpcy5jbG9zZWQ9ZmFsc2V9LGNsb3NlOmZ1bmN0aW9uKCl7dGhpcy5jbG9zZWQ9dHJ1ZX0sb25SZXNpemU6ZnVuY3Rpb24oKXt2YXIgYT10aGlzLmdldFJvb3QoKTtpZihhLnNjcm9sbGFibGUpe3ZhciBiPWcuZ2V0T2Zmc2V0KGEuX191bCkudG9wLGM9MDtpLmVhY2goYS5fX3VsLmNoaWxkTm9kZXMsZnVuY3Rpb24oYil7YS5hdXRvUGxhY2UmJmI9PT1hLl9fc2F2ZV9yb3d8fChjKz1cbmcuZ2V0SGVpZ2h0KGIpKX0pO3dpbmRvdy5pbm5lckhlaWdodC1iLTIwPGM/KGcuYWRkQ2xhc3MoYS5kb21FbGVtZW50LGsuQ0xBU1NfVE9PX1RBTEwpLGEuX191bC5zdHlsZS5oZWlnaHQ9d2luZG93LmlubmVySGVpZ2h0LWItMjArXCJweFwiKTooZy5yZW1vdmVDbGFzcyhhLmRvbUVsZW1lbnQsay5DTEFTU19UT09fVEFMTCksYS5fX3VsLnN0eWxlLmhlaWdodD1cImF1dG9cIil9YS5fX3Jlc2l6ZV9oYW5kbGUmJmkuZGVmZXIoZnVuY3Rpb24oKXthLl9fcmVzaXplX2hhbmRsZS5zdHlsZS5oZWlnaHQ9YS5fX3VsLm9mZnNldEhlaWdodCtcInB4XCJ9KTtpZihhLl9fY2xvc2VCdXR0b24pYS5fX2Nsb3NlQnV0dG9uLnN0eWxlLndpZHRoPWEud2lkdGgrXCJweFwifSxyZW1lbWJlcjpmdW5jdGlvbigpe2lmKGkuaXNVbmRlZmluZWQoeCkpeD1uZXcgeSx4LmRvbUVsZW1lbnQuaW5uZXJIVE1MPWE7aWYodGhpcy5wYXJlbnQpdGhyb3cgRXJyb3IoXCJZb3UgY2FuIG9ubHkgY2FsbCByZW1lbWJlciBvbiBhIHRvcCBsZXZlbCBHVUkuXCIpO1xudmFyIGI9dGhpcztpLmVhY2goQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSxmdW5jdGlvbihhKXtiLl9fcmVtZW1iZXJlZE9iamVjdHMubGVuZ3RoPT0wJiZJKGIpO2IuX19yZW1lbWJlcmVkT2JqZWN0cy5pbmRleE9mKGEpPT0tMSYmYi5fX3JlbWVtYmVyZWRPYmplY3RzLnB1c2goYSl9KTt0aGlzLmF1dG9QbGFjZSYmRCh0aGlzLHRoaXMud2lkdGgpfSxnZXRSb290OmZ1bmN0aW9uKCl7Zm9yKHZhciBhPXRoaXM7YS5wYXJlbnQ7KWE9YS5wYXJlbnQ7cmV0dXJuIGF9LGdldFNhdmVPYmplY3Q6ZnVuY3Rpb24oKXt2YXIgYT10aGlzLmxvYWQ7YS5jbG9zZWQ9dGhpcy5jbG9zZWQ7aWYodGhpcy5fX3JlbWVtYmVyZWRPYmplY3RzLmxlbmd0aD4wKXthLnByZXNldD10aGlzLnByZXNldDtpZighYS5yZW1lbWJlcmVkKWEucmVtZW1iZXJlZD17fTthLnJlbWVtYmVyZWRbdGhpcy5wcmVzZXRdPXoodGhpcyl9YS5mb2xkZXJzPXt9O2kuZWFjaCh0aGlzLl9fZm9sZGVycyxmdW5jdGlvbihiLFxuYyl7YS5mb2xkZXJzW2NdPWIuZ2V0U2F2ZU9iamVjdCgpfSk7cmV0dXJuIGF9LHNhdmU6ZnVuY3Rpb24oKXtpZighdGhpcy5sb2FkLnJlbWVtYmVyZWQpdGhpcy5sb2FkLnJlbWVtYmVyZWQ9e307dGhpcy5sb2FkLnJlbWVtYmVyZWRbdGhpcy5wcmVzZXRdPXoodGhpcyk7Qih0aGlzLGZhbHNlKX0sc2F2ZUFzOmZ1bmN0aW9uKGEpe2lmKCF0aGlzLmxvYWQucmVtZW1iZXJlZCl0aGlzLmxvYWQucmVtZW1iZXJlZD17fSx0aGlzLmxvYWQucmVtZW1iZXJlZFt3XT16KHRoaXMsdHJ1ZSk7dGhpcy5sb2FkLnJlbWVtYmVyZWRbYV09eih0aGlzKTt0aGlzLnByZXNldD1hO0ModGhpcyxhLHRydWUpfSxyZXZlcnQ6ZnVuY3Rpb24oYSl7aS5lYWNoKHRoaXMuX19jb250cm9sbGVycyxmdW5jdGlvbihiKXt0aGlzLmdldFJvb3QoKS5sb2FkLnJlbWVtYmVyZWQ/dChhfHx0aGlzLmdldFJvb3QoKSxiKTpiLnNldFZhbHVlKGIuaW5pdGlhbFZhbHVlKX0sdGhpcyk7aS5lYWNoKHRoaXMuX19mb2xkZXJzLFxuZnVuY3Rpb24oYSl7YS5yZXZlcnQoYSl9KTthfHxCKHRoaXMuZ2V0Um9vdCgpLGZhbHNlKX0sbGlzdGVuOmZ1bmN0aW9uKGEpe3ZhciBiPXRoaXMuX19saXN0ZW5pbmcubGVuZ3RoPT0wO3RoaXMuX19saXN0ZW5pbmcucHVzaChhKTtiJiZFKHRoaXMuX19saXN0ZW5pbmcpfX0pO3JldHVybiBrfShkYXQudXRpbHMuY3NzLCc8ZGl2IGlkPVwiZGctc2F2ZVwiIGNsYXNzPVwiZGcgZGlhbG9ndWVcIj5cXG5cXG4gIEhlcmVcXCdzIHRoZSBuZXcgbG9hZCBwYXJhbWV0ZXIgZm9yIHlvdXIgPGNvZGU+R1VJPC9jb2RlPlxcJ3MgY29uc3RydWN0b3I6XFxuXFxuICA8dGV4dGFyZWEgaWQ9XCJkZy1uZXctY29uc3RydWN0b3JcIj48L3RleHRhcmVhPlxcblxcbiAgPGRpdiBpZD1cImRnLXNhdmUtbG9jYWxseVwiPlxcblxcbiAgICA8aW5wdXQgaWQ9XCJkZy1sb2NhbC1zdG9yYWdlXCIgdHlwZT1cImNoZWNrYm94XCIvPiBBdXRvbWF0aWNhbGx5IHNhdmVcXG4gICAgdmFsdWVzIHRvIDxjb2RlPmxvY2FsU3RvcmFnZTwvY29kZT4gb24gZXhpdC5cXG5cXG4gICAgPGRpdiBpZD1cImRnLWxvY2FsLWV4cGxhaW5cIj5UaGUgdmFsdWVzIHNhdmVkIHRvIDxjb2RlPmxvY2FsU3RvcmFnZTwvY29kZT4gd2lsbFxcbiAgICAgIG92ZXJyaWRlIHRob3NlIHBhc3NlZCB0byA8Y29kZT5kYXQuR1VJPC9jb2RlPlxcJ3MgY29uc3RydWN0b3IuIFRoaXMgbWFrZXMgaXRcXG4gICAgICBlYXNpZXIgdG8gd29yayBpbmNyZW1lbnRhbGx5LCBidXQgPGNvZGU+bG9jYWxTdG9yYWdlPC9jb2RlPiBpcyBmcmFnaWxlLFxcbiAgICAgIGFuZCB5b3VyIGZyaWVuZHMgbWF5IG5vdCBzZWUgdGhlIHNhbWUgdmFsdWVzIHlvdSBkby5cXG4gICAgICBcXG4gICAgPC9kaXY+XFxuICAgIFxcbiAgPC9kaXY+XFxuXFxuPC9kaXY+JyxcblwiLmRnIHVse2xpc3Qtc3R5bGU6bm9uZTttYXJnaW46MDtwYWRkaW5nOjA7d2lkdGg6MTAwJTtjbGVhcjpib3RofS5kZy5hY3twb3NpdGlvbjpmaXhlZDt0b3A6MDtsZWZ0OjA7cmlnaHQ6MDtoZWlnaHQ6MDt6LWluZGV4OjB9LmRnOm5vdCguYWMpIC5tYWlue292ZXJmbG93OmhpZGRlbn0uZGcubWFpbnstd2Via2l0LXRyYW5zaXRpb246b3BhY2l0eSAwLjFzIGxpbmVhcjstby10cmFuc2l0aW9uOm9wYWNpdHkgMC4xcyBsaW5lYXI7LW1vei10cmFuc2l0aW9uOm9wYWNpdHkgMC4xcyBsaW5lYXI7dHJhbnNpdGlvbjpvcGFjaXR5IDAuMXMgbGluZWFyfS5kZy5tYWluLnRhbGxlci10aGFuLXdpbmRvd3tvdmVyZmxvdy15OmF1dG99LmRnLm1haW4udGFsbGVyLXRoYW4td2luZG93IC5jbG9zZS1idXR0b257b3BhY2l0eToxO21hcmdpbi10b3A6LTFweDtib3JkZXItdG9wOjFweCBzb2xpZCAjMmMyYzJjfS5kZy5tYWluIHVsLmNsb3NlZCAuY2xvc2UtYnV0dG9ue29wYWNpdHk6MSAhaW1wb3J0YW50fS5kZy5tYWluOmhvdmVyIC5jbG9zZS1idXR0b24sLmRnLm1haW4gLmNsb3NlLWJ1dHRvbi5kcmFne29wYWNpdHk6MX0uZGcubWFpbiAuY2xvc2UtYnV0dG9uey13ZWJraXQtdHJhbnNpdGlvbjpvcGFjaXR5IDAuMXMgbGluZWFyOy1vLXRyYW5zaXRpb246b3BhY2l0eSAwLjFzIGxpbmVhcjstbW96LXRyYW5zaXRpb246b3BhY2l0eSAwLjFzIGxpbmVhcjt0cmFuc2l0aW9uOm9wYWNpdHkgMC4xcyBsaW5lYXI7Ym9yZGVyOjA7cG9zaXRpb246YWJzb2x1dGU7bGluZS1oZWlnaHQ6MTlweDtoZWlnaHQ6MjBweDtjdXJzb3I6cG9pbnRlcjt0ZXh0LWFsaWduOmNlbnRlcjtiYWNrZ3JvdW5kLWNvbG9yOiMwMDB9LmRnLm1haW4gLmNsb3NlLWJ1dHRvbjpob3ZlcntiYWNrZ3JvdW5kLWNvbG9yOiMxMTF9LmRnLmF7ZmxvYXQ6cmlnaHQ7bWFyZ2luLXJpZ2h0OjE1cHg7b3ZlcmZsb3cteDpoaWRkZW59LmRnLmEuaGFzLXNhdmUgdWx7bWFyZ2luLXRvcDoyN3B4fS5kZy5hLmhhcy1zYXZlIHVsLmNsb3NlZHttYXJnaW4tdG9wOjB9LmRnLmEgLnNhdmUtcm93e3Bvc2l0aW9uOmZpeGVkO3RvcDowO3otaW5kZXg6MTAwMn0uZGcgbGl7LXdlYmtpdC10cmFuc2l0aW9uOmhlaWdodCAwLjFzIGVhc2Utb3V0Oy1vLXRyYW5zaXRpb246aGVpZ2h0IDAuMXMgZWFzZS1vdXQ7LW1vei10cmFuc2l0aW9uOmhlaWdodCAwLjFzIGVhc2Utb3V0O3RyYW5zaXRpb246aGVpZ2h0IDAuMXMgZWFzZS1vdXR9LmRnIGxpOm5vdCguZm9sZGVyKXtjdXJzb3I6YXV0bztoZWlnaHQ6MjdweDtsaW5lLWhlaWdodDoyN3B4O292ZXJmbG93OmhpZGRlbjtwYWRkaW5nOjAgNHB4IDAgNXB4fS5kZyBsaS5mb2xkZXJ7cGFkZGluZzowO2JvcmRlci1sZWZ0OjRweCBzb2xpZCByZ2JhKDAsMCwwLDApfS5kZyBsaS50aXRsZXtjdXJzb3I6cG9pbnRlcjttYXJnaW4tbGVmdDotNHB4fS5kZyAuY2xvc2VkIGxpOm5vdCgudGl0bGUpLC5kZyAuY2xvc2VkIHVsIGxpLC5kZyAuY2xvc2VkIHVsIGxpID4gKntoZWlnaHQ6MDtvdmVyZmxvdzpoaWRkZW47Ym9yZGVyOjB9LmRnIC5jcntjbGVhcjpib3RoO3BhZGRpbmctbGVmdDozcHg7aGVpZ2h0OjI3cHh9LmRnIC5wcm9wZXJ0eS1uYW1le2N1cnNvcjpkZWZhdWx0O2Zsb2F0OmxlZnQ7Y2xlYXI6bGVmdDt3aWR0aDo0MCU7b3ZlcmZsb3c6aGlkZGVuO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXN9LmRnIC5je2Zsb2F0OmxlZnQ7d2lkdGg6NjAlfS5kZyAuYyBpbnB1dFt0eXBlPXRleHRde2JvcmRlcjowO21hcmdpbi10b3A6NHB4O3BhZGRpbmc6M3B4O3dpZHRoOjEwMCU7ZmxvYXQ6cmlnaHR9LmRnIC5oYXMtc2xpZGVyIGlucHV0W3R5cGU9dGV4dF17d2lkdGg6MzAlO21hcmdpbi1sZWZ0OjB9LmRnIC5zbGlkZXJ7ZmxvYXQ6bGVmdDt3aWR0aDo2NiU7bWFyZ2luLWxlZnQ6LTVweDttYXJnaW4tcmlnaHQ6MDtoZWlnaHQ6MTlweDttYXJnaW4tdG9wOjRweH0uZGcgLnNsaWRlci1mZ3toZWlnaHQ6MTAwJX0uZGcgLmMgaW5wdXRbdHlwZT1jaGVja2JveF17bWFyZ2luLXRvcDo5cHh9LmRnIC5jIHNlbGVjdHttYXJnaW4tdG9wOjVweH0uZGcgLmNyLmZ1bmN0aW9uLC5kZyAuY3IuZnVuY3Rpb24gLnByb3BlcnR5LW5hbWUsLmRnIC5jci5mdW5jdGlvbiAqLC5kZyAuY3IuYm9vbGVhbiwuZGcgLmNyLmJvb2xlYW4gKntjdXJzb3I6cG9pbnRlcn0uZGcgLnNlbGVjdG9ye2Rpc3BsYXk6bm9uZTtwb3NpdGlvbjphYnNvbHV0ZTttYXJnaW4tbGVmdDotOXB4O21hcmdpbi10b3A6MjNweDt6LWluZGV4OjEwfS5kZyAuYzpob3ZlciAuc2VsZWN0b3IsLmRnIC5zZWxlY3Rvci5kcmFne2Rpc3BsYXk6YmxvY2t9LmRnIGxpLnNhdmUtcm93e3BhZGRpbmc6MH0uZGcgbGkuc2F2ZS1yb3cgLmJ1dHRvbntkaXNwbGF5OmlubGluZS1ibG9jaztwYWRkaW5nOjBweCA2cHh9LmRnLmRpYWxvZ3Vle2JhY2tncm91bmQtY29sb3I6IzIyMjt3aWR0aDo0NjBweDtwYWRkaW5nOjE1cHg7Zm9udC1zaXplOjEzcHg7bGluZS1oZWlnaHQ6MTVweH0jZGctbmV3LWNvbnN0cnVjdG9ye3BhZGRpbmc6MTBweDtjb2xvcjojMjIyO2ZvbnQtZmFtaWx5Ok1vbmFjbywgbW9ub3NwYWNlO2ZvbnQtc2l6ZToxMHB4O2JvcmRlcjowO3Jlc2l6ZTpub25lO2JveC1zaGFkb3c6aW5zZXQgMXB4IDFweCAxcHggIzg4ODt3b3JkLXdyYXA6YnJlYWstd29yZDttYXJnaW46MTJweCAwO2Rpc3BsYXk6YmxvY2s7d2lkdGg6NDQwcHg7b3ZlcmZsb3cteTpzY3JvbGw7aGVpZ2h0OjEwMHB4O3Bvc2l0aW9uOnJlbGF0aXZlfSNkZy1sb2NhbC1leHBsYWlue2Rpc3BsYXk6bm9uZTtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxN3B4O2JvcmRlci1yYWRpdXM6M3B4O2JhY2tncm91bmQtY29sb3I6IzMzMztwYWRkaW5nOjhweDttYXJnaW4tdG9wOjEwcHh9I2RnLWxvY2FsLWV4cGxhaW4gY29kZXtmb250LXNpemU6MTBweH0jZGF0LWd1aS1zYXZlLWxvY2FsbHl7ZGlzcGxheTpub25lfS5kZ3tjb2xvcjojZWVlO2ZvbnQ6MTFweCAnTHVjaWRhIEdyYW5kZScsIHNhbnMtc2VyaWY7dGV4dC1zaGFkb3c6MCAtMXB4IDAgIzExMX0uZGcubWFpbjo6LXdlYmtpdC1zY3JvbGxiYXJ7d2lkdGg6NXB4O2JhY2tncm91bmQ6IzFhMWExYX0uZGcubWFpbjo6LXdlYmtpdC1zY3JvbGxiYXItY29ybmVye2hlaWdodDowO2Rpc3BsYXk6bm9uZX0uZGcubWFpbjo6LXdlYmtpdC1zY3JvbGxiYXItdGh1bWJ7Ym9yZGVyLXJhZGl1czo1cHg7YmFja2dyb3VuZDojNjc2NzY3fS5kZyBsaTpub3QoLmZvbGRlcil7YmFja2dyb3VuZDojMWExYTFhO2JvcmRlci1ib3R0b206MXB4IHNvbGlkICMyYzJjMmN9LmRnIGxpLnNhdmUtcm93e2xpbmUtaGVpZ2h0OjI1cHg7YmFja2dyb3VuZDojZGFkNWNiO2JvcmRlcjowfS5kZyBsaS5zYXZlLXJvdyBzZWxlY3R7bWFyZ2luLWxlZnQ6NXB4O3dpZHRoOjEwOHB4fS5kZyBsaS5zYXZlLXJvdyAuYnV0dG9ue21hcmdpbi1sZWZ0OjVweDttYXJnaW4tdG9wOjFweDtib3JkZXItcmFkaXVzOjJweDtmb250LXNpemU6OXB4O2xpbmUtaGVpZ2h0OjdweDtwYWRkaW5nOjRweCA0cHggNXB4IDRweDtiYWNrZ3JvdW5kOiNjNWJkYWQ7Y29sb3I6I2ZmZjt0ZXh0LXNoYWRvdzowIDFweCAwICNiMGE1OGY7Ym94LXNoYWRvdzowIC0xcHggMCAjYjBhNThmO2N1cnNvcjpwb2ludGVyfS5kZyBsaS5zYXZlLXJvdyAuYnV0dG9uLmdlYXJze2JhY2tncm91bmQ6I2M1YmRhZCB1cmwoZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFBc0FBQUFOQ0FZQUFBQi85WlE3QUFBQUdYUkZXSFJUYjJaMGQyRnlaUUJCWkc5aVpTQkpiV0ZuWlZKbFlXUjVjY2xsUEFBQUFRSkpSRUZVZU5waVlLQVUvUC8vUHdHSUMvQXBDQUJpQlNBVytJOEFDbEFjZ0t4UTRUOWhvTUFFVXJ4eDJRU0dONitlZ0RYKy92V1Q0ZTdOODJBTVlvUEF4L2V2d1dvWW9TWWJBQ1gyczdLeEN4emNzZXpEaDNldkZvREVCWVRFRXF5Y2dnV0F6QTlBdVVTUVFnZVlQYTlmUHY2L1lXbS9BY3g1SVBiN3R5L2Z3K1FaYmx3Njd2RHM4UjBZSHlRaGdPYngreUFKa0JxbUc1ZFBQRGgxYVBPR1IvZXVnVzBHNHZsSW9USWZ5RmNBK1Fla2hoSEpoUGRReGJpQUlndU1CVFFaclBENzEwOE02cm9XWURGUWlJQUF2NkFvdy8xYkZ3WGdpcytmMkxVQXlud29JYU5jejhYTngzRGw3TUVKVURHUXB4OWd0UThZQ3VlQitEMjZPRUNBQVFEYWR0N2U0NkQ0MlFBQUFBQkpSVTVFcmtKZ2dnPT0pIDJweCAxcHggbm8tcmVwZWF0O2hlaWdodDo3cHg7d2lkdGg6OHB4fS5kZyBsaS5zYXZlLXJvdyAuYnV0dG9uOmhvdmVye2JhY2tncm91bmQtY29sb3I6I2JhYjE5ZTtib3gtc2hhZG93OjAgLTFweCAwICNiMGE1OGZ9LmRnIGxpLmZvbGRlcntib3JkZXItYm90dG9tOjB9LmRnIGxpLnRpdGxle3BhZGRpbmctbGVmdDoxNnB4O2JhY2tncm91bmQ6IzAwMCB1cmwoZGF0YTppbWFnZS9naWY7YmFzZTY0LFIwbEdPRGxoQlFBRkFKRUFBUC8vLy9QejgvLy8vLy8vL3lINUJBRUFBQUlBTEFBQUFBQUZBQVVBQUFJSWxJK2hLZ0Z4b0NnQU93PT0pIDZweCAxMHB4IG5vLXJlcGVhdDtjdXJzb3I6cG9pbnRlcjtib3JkZXItYm90dG9tOjFweCBzb2xpZCByZ2JhKDI1NSwyNTUsMjU1LDAuMil9LmRnIC5jbG9zZWQgbGkudGl0bGV7YmFja2dyb3VuZC1pbWFnZTp1cmwoZGF0YTppbWFnZS9naWY7YmFzZTY0LFIwbEdPRGxoQlFBRkFKRUFBUC8vLy9QejgvLy8vLy8vL3lINUJBRUFBQUlBTEFBQUFBQUZBQVVBQUFJSWxHSVdxTUNiV0FFQU93PT0pfS5kZyAuY3IuYm9vbGVhbntib3JkZXItbGVmdDozcHggc29saWQgIzgwNjc4N30uZGcgLmNyLmZ1bmN0aW9ue2JvcmRlci1sZWZ0OjNweCBzb2xpZCAjZTYxZDVmfS5kZyAuY3IubnVtYmVye2JvcmRlci1sZWZ0OjNweCBzb2xpZCAjMmZhMWQ2fS5kZyAuY3IubnVtYmVyIGlucHV0W3R5cGU9dGV4dF17Y29sb3I6IzJmYTFkNn0uZGcgLmNyLnN0cmluZ3tib3JkZXItbGVmdDozcHggc29saWQgIzFlZDM2Zn0uZGcgLmNyLnN0cmluZyBpbnB1dFt0eXBlPXRleHRde2NvbG9yOiMxZWQzNmZ9LmRnIC5jci5mdW5jdGlvbjpob3ZlciwuZGcgLmNyLmJvb2xlYW46aG92ZXJ7YmFja2dyb3VuZDojMTExfS5kZyAuYyBpbnB1dFt0eXBlPXRleHRde2JhY2tncm91bmQ6IzMwMzAzMDtvdXRsaW5lOm5vbmV9LmRnIC5jIGlucHV0W3R5cGU9dGV4dF06aG92ZXJ7YmFja2dyb3VuZDojM2MzYzNjfS5kZyAuYyBpbnB1dFt0eXBlPXRleHRdOmZvY3Vze2JhY2tncm91bmQ6IzQ5NDk0OTtjb2xvcjojZmZmfS5kZyAuYyAuc2xpZGVye2JhY2tncm91bmQ6IzMwMzAzMDtjdXJzb3I6ZXctcmVzaXplfS5kZyAuYyAuc2xpZGVyLWZne2JhY2tncm91bmQ6IzJmYTFkNn0uZGcgLmMgLnNsaWRlcjpob3ZlcntiYWNrZ3JvdW5kOiMzYzNjM2N9LmRnIC5jIC5zbGlkZXI6aG92ZXIgLnNsaWRlci1mZ3tiYWNrZ3JvdW5kOiM0NGFiZGF9XFxuXCIsXG5kYXQuY29udHJvbGxlcnMuZmFjdG9yeT1mdW5jdGlvbihlLGEsYyxkLGYsYixuKXtyZXR1cm4gZnVuY3Rpb24oaCxqLG0sbCl7dmFyIG89aFtqXTtpZihuLmlzQXJyYXkobSl8fG4uaXNPYmplY3QobSkpcmV0dXJuIG5ldyBlKGgsaixtKTtpZihuLmlzTnVtYmVyKG8pKXJldHVybiBuLmlzTnVtYmVyKG0pJiZuLmlzTnVtYmVyKGwpP25ldyBjKGgsaixtLGwpOm5ldyBhKGgsaix7bWluOm0sbWF4Omx9KTtpZihuLmlzU3RyaW5nKG8pKXJldHVybiBuZXcgZChoLGopO2lmKG4uaXNGdW5jdGlvbihvKSlyZXR1cm4gbmV3IGYoaCxqLFwiXCIpO2lmKG4uaXNCb29sZWFuKG8pKXJldHVybiBuZXcgYihoLGopfX0oZGF0LmNvbnRyb2xsZXJzLk9wdGlvbkNvbnRyb2xsZXIsZGF0LmNvbnRyb2xsZXJzLk51bWJlckNvbnRyb2xsZXJCb3gsZGF0LmNvbnRyb2xsZXJzLk51bWJlckNvbnRyb2xsZXJTbGlkZXIsZGF0LmNvbnRyb2xsZXJzLlN0cmluZ0NvbnRyb2xsZXI9ZnVuY3Rpb24oZSxhLGMpe3ZhciBkPVxuZnVuY3Rpb24oYyxiKXtmdW5jdGlvbiBlKCl7aC5zZXRWYWx1ZShoLl9faW5wdXQudmFsdWUpfWQuc3VwZXJjbGFzcy5jYWxsKHRoaXMsYyxiKTt2YXIgaD10aGlzO3RoaXMuX19pbnB1dD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7dGhpcy5fX2lucHV0LnNldEF0dHJpYnV0ZShcInR5cGVcIixcInRleHRcIik7YS5iaW5kKHRoaXMuX19pbnB1dCxcImtleXVwXCIsZSk7YS5iaW5kKHRoaXMuX19pbnB1dCxcImNoYW5nZVwiLGUpO2EuYmluZCh0aGlzLl9faW5wdXQsXCJibHVyXCIsZnVuY3Rpb24oKXtoLl9fb25GaW5pc2hDaGFuZ2UmJmguX19vbkZpbmlzaENoYW5nZS5jYWxsKGgsaC5nZXRWYWx1ZSgpKX0pO2EuYmluZCh0aGlzLl9faW5wdXQsXCJrZXlkb3duXCIsZnVuY3Rpb24oYSl7YS5rZXlDb2RlPT09MTMmJnRoaXMuYmx1cigpfSk7dGhpcy51cGRhdGVEaXNwbGF5KCk7dGhpcy5kb21FbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX19pbnB1dCl9O2Quc3VwZXJjbGFzcz1lO2MuZXh0ZW5kKGQucHJvdG90eXBlLFxuZS5wcm90b3R5cGUse3VwZGF0ZURpc3BsYXk6ZnVuY3Rpb24oKXtpZighYS5pc0FjdGl2ZSh0aGlzLl9faW5wdXQpKXRoaXMuX19pbnB1dC52YWx1ZT10aGlzLmdldFZhbHVlKCk7cmV0dXJuIGQuc3VwZXJjbGFzcy5wcm90b3R5cGUudXBkYXRlRGlzcGxheS5jYWxsKHRoaXMpfX0pO3JldHVybiBkfShkYXQuY29udHJvbGxlcnMuQ29udHJvbGxlcixkYXQuZG9tLmRvbSxkYXQudXRpbHMuY29tbW9uKSxkYXQuY29udHJvbGxlcnMuRnVuY3Rpb25Db250cm9sbGVyLGRhdC5jb250cm9sbGVycy5Cb29sZWFuQ29udHJvbGxlcixkYXQudXRpbHMuY29tbW9uKSxkYXQuY29udHJvbGxlcnMuQ29udHJvbGxlcixkYXQuY29udHJvbGxlcnMuQm9vbGVhbkNvbnRyb2xsZXIsZGF0LmNvbnRyb2xsZXJzLkZ1bmN0aW9uQ29udHJvbGxlcixkYXQuY29udHJvbGxlcnMuTnVtYmVyQ29udHJvbGxlckJveCxkYXQuY29udHJvbGxlcnMuTnVtYmVyQ29udHJvbGxlclNsaWRlcixkYXQuY29udHJvbGxlcnMuT3B0aW9uQ29udHJvbGxlcixcbmRhdC5jb250cm9sbGVycy5Db2xvckNvbnRyb2xsZXI9ZnVuY3Rpb24oZSxhLGMsZCxmKXtmdW5jdGlvbiBiKGEsYixjLGQpe2Euc3R5bGUuYmFja2dyb3VuZD1cIlwiO2YuZWFjaChqLGZ1bmN0aW9uKGUpe2Euc3R5bGUuY3NzVGV4dCs9XCJiYWNrZ3JvdW5kOiBcIitlK1wibGluZWFyLWdyYWRpZW50KFwiK2IrXCIsIFwiK2MrXCIgMCUsIFwiK2QrXCIgMTAwJSk7IFwifSl9ZnVuY3Rpb24gbihhKXthLnN0eWxlLmJhY2tncm91bmQ9XCJcIjthLnN0eWxlLmNzc1RleHQrPVwiYmFja2dyb3VuZDogLW1vei1saW5lYXItZ3JhZGllbnQodG9wLCAgI2ZmMDAwMCAwJSwgI2ZmMDBmZiAxNyUsICMwMDAwZmYgMzQlLCAjMDBmZmZmIDUwJSwgIzAwZmYwMCA2NyUsICNmZmZmMDAgODQlLCAjZmYwMDAwIDEwMCUpO1wiO2Euc3R5bGUuY3NzVGV4dCs9XCJiYWNrZ3JvdW5kOiAtd2Via2l0LWxpbmVhci1ncmFkaWVudCh0b3AsICAjZmYwMDAwIDAlLCNmZjAwZmYgMTclLCMwMDAwZmYgMzQlLCMwMGZmZmYgNTAlLCMwMGZmMDAgNjclLCNmZmZmMDAgODQlLCNmZjAwMDAgMTAwJSk7XCI7XG5hLnN0eWxlLmNzc1RleHQrPVwiYmFja2dyb3VuZDogLW8tbGluZWFyLWdyYWRpZW50KHRvcCwgICNmZjAwMDAgMCUsI2ZmMDBmZiAxNyUsIzAwMDBmZiAzNCUsIzAwZmZmZiA1MCUsIzAwZmYwMCA2NyUsI2ZmZmYwMCA4NCUsI2ZmMDAwMCAxMDAlKTtcIjthLnN0eWxlLmNzc1RleHQrPVwiYmFja2dyb3VuZDogLW1zLWxpbmVhci1ncmFkaWVudCh0b3AsICAjZmYwMDAwIDAlLCNmZjAwZmYgMTclLCMwMDAwZmYgMzQlLCMwMGZmZmYgNTAlLCMwMGZmMDAgNjclLCNmZmZmMDAgODQlLCNmZjAwMDAgMTAwJSk7XCI7YS5zdHlsZS5jc3NUZXh0Kz1cImJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCh0b3AsICAjZmYwMDAwIDAlLCNmZjAwZmYgMTclLCMwMDAwZmYgMzQlLCMwMGZmZmYgNTAlLCMwMGZmMDAgNjclLCNmZmZmMDAgODQlLCNmZjAwMDAgMTAwJSk7XCJ9dmFyIGg9ZnVuY3Rpb24oZSxsKXtmdW5jdGlvbiBvKGIpe3EoYik7YS5iaW5kKHdpbmRvdyxcIm1vdXNlbW92ZVwiLHEpO2EuYmluZCh3aW5kb3csXG5cIm1vdXNldXBcIixqKX1mdW5jdGlvbiBqKCl7YS51bmJpbmQod2luZG93LFwibW91c2Vtb3ZlXCIscSk7YS51bmJpbmQod2luZG93LFwibW91c2V1cFwiLGopfWZ1bmN0aW9uIGcoKXt2YXIgYT1kKHRoaXMudmFsdWUpO2EhPT1mYWxzZT8ocC5fX2NvbG9yLl9fc3RhdGU9YSxwLnNldFZhbHVlKHAuX19jb2xvci50b09yaWdpbmFsKCkpKTp0aGlzLnZhbHVlPXAuX19jb2xvci50b1N0cmluZygpfWZ1bmN0aW9uIGkoKXthLnVuYmluZCh3aW5kb3csXCJtb3VzZW1vdmVcIixzKTthLnVuYmluZCh3aW5kb3csXCJtb3VzZXVwXCIsaSl9ZnVuY3Rpb24gcShiKXtiLnByZXZlbnREZWZhdWx0KCk7dmFyIGM9YS5nZXRXaWR0aChwLl9fc2F0dXJhdGlvbl9maWVsZCksZD1hLmdldE9mZnNldChwLl9fc2F0dXJhdGlvbl9maWVsZCksZT0oYi5jbGllbnRYLWQubGVmdCtkb2N1bWVudC5ib2R5LnNjcm9sbExlZnQpL2MsYj0xLShiLmNsaWVudFktZC50b3ArZG9jdW1lbnQuYm9keS5zY3JvbGxUb3ApL2M7Yj4xP2I9XG4xOmI8MCYmKGI9MCk7ZT4xP2U9MTplPDAmJihlPTApO3AuX19jb2xvci52PWI7cC5fX2NvbG9yLnM9ZTtwLnNldFZhbHVlKHAuX19jb2xvci50b09yaWdpbmFsKCkpO3JldHVybiBmYWxzZX1mdW5jdGlvbiBzKGIpe2IucHJldmVudERlZmF1bHQoKTt2YXIgYz1hLmdldEhlaWdodChwLl9faHVlX2ZpZWxkKSxkPWEuZ2V0T2Zmc2V0KHAuX19odWVfZmllbGQpLGI9MS0oYi5jbGllbnRZLWQudG9wK2RvY3VtZW50LmJvZHkuc2Nyb2xsVG9wKS9jO2I+MT9iPTE6YjwwJiYoYj0wKTtwLl9fY29sb3IuaD1iKjM2MDtwLnNldFZhbHVlKHAuX19jb2xvci50b09yaWdpbmFsKCkpO3JldHVybiBmYWxzZX1oLnN1cGVyY2xhc3MuY2FsbCh0aGlzLGUsbCk7dGhpcy5fX2NvbG9yPW5ldyBjKHRoaXMuZ2V0VmFsdWUoKSk7dGhpcy5fX3RlbXA9bmV3IGMoMCk7dmFyIHA9dGhpczt0aGlzLmRvbUVsZW1lbnQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTthLm1ha2VTZWxlY3RhYmxlKHRoaXMuZG9tRWxlbWVudCxcbmZhbHNlKTt0aGlzLl9fc2VsZWN0b3I9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTt0aGlzLl9fc2VsZWN0b3IuY2xhc3NOYW1lPVwic2VsZWN0b3JcIjt0aGlzLl9fc2F0dXJhdGlvbl9maWVsZD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO3RoaXMuX19zYXR1cmF0aW9uX2ZpZWxkLmNsYXNzTmFtZT1cInNhdHVyYXRpb24tZmllbGRcIjt0aGlzLl9fZmllbGRfa25vYj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO3RoaXMuX19maWVsZF9rbm9iLmNsYXNzTmFtZT1cImZpZWxkLWtub2JcIjt0aGlzLl9fZmllbGRfa25vYl9ib3JkZXI9XCIycHggc29saWQgXCI7dGhpcy5fX2h1ZV9rbm9iPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7dGhpcy5fX2h1ZV9rbm9iLmNsYXNzTmFtZT1cImh1ZS1rbm9iXCI7dGhpcy5fX2h1ZV9maWVsZD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO3RoaXMuX19odWVfZmllbGQuY2xhc3NOYW1lPVwiaHVlLWZpZWxkXCI7dGhpcy5fX2lucHV0PVxuZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO3RoaXMuX19pbnB1dC50eXBlPVwidGV4dFwiO3RoaXMuX19pbnB1dF90ZXh0U2hhZG93PVwiMCAxcHggMXB4IFwiO2EuYmluZCh0aGlzLl9faW5wdXQsXCJrZXlkb3duXCIsZnVuY3Rpb24oYSl7YS5rZXlDb2RlPT09MTMmJmcuY2FsbCh0aGlzKX0pO2EuYmluZCh0aGlzLl9faW5wdXQsXCJibHVyXCIsZyk7YS5iaW5kKHRoaXMuX19zZWxlY3RvcixcIm1vdXNlZG93blwiLGZ1bmN0aW9uKCl7YS5hZGRDbGFzcyh0aGlzLFwiZHJhZ1wiKS5iaW5kKHdpbmRvdyxcIm1vdXNldXBcIixmdW5jdGlvbigpe2EucmVtb3ZlQ2xhc3MocC5fX3NlbGVjdG9yLFwiZHJhZ1wiKX0pfSk7dmFyIHQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtmLmV4dGVuZCh0aGlzLl9fc2VsZWN0b3Iuc3R5bGUse3dpZHRoOlwiMTIycHhcIixoZWlnaHQ6XCIxMDJweFwiLHBhZGRpbmc6XCIzcHhcIixiYWNrZ3JvdW5kQ29sb3I6XCIjMjIyXCIsYm94U2hhZG93OlwiMHB4IDFweCAzcHggcmdiYSgwLDAsMCwwLjMpXCJ9KTtcbmYuZXh0ZW5kKHRoaXMuX19maWVsZF9rbm9iLnN0eWxlLHtwb3NpdGlvbjpcImFic29sdXRlXCIsd2lkdGg6XCIxMnB4XCIsaGVpZ2h0OlwiMTJweFwiLGJvcmRlcjp0aGlzLl9fZmllbGRfa25vYl9ib3JkZXIrKHRoaXMuX19jb2xvci52PDAuNT9cIiNmZmZcIjpcIiMwMDBcIiksYm94U2hhZG93OlwiMHB4IDFweCAzcHggcmdiYSgwLDAsMCwwLjUpXCIsYm9yZGVyUmFkaXVzOlwiMTJweFwiLHpJbmRleDoxfSk7Zi5leHRlbmQodGhpcy5fX2h1ZV9rbm9iLnN0eWxlLHtwb3NpdGlvbjpcImFic29sdXRlXCIsd2lkdGg6XCIxNXB4XCIsaGVpZ2h0OlwiMnB4XCIsYm9yZGVyUmlnaHQ6XCI0cHggc29saWQgI2ZmZlwiLHpJbmRleDoxfSk7Zi5leHRlbmQodGhpcy5fX3NhdHVyYXRpb25fZmllbGQuc3R5bGUse3dpZHRoOlwiMTAwcHhcIixoZWlnaHQ6XCIxMDBweFwiLGJvcmRlcjpcIjFweCBzb2xpZCAjNTU1XCIsbWFyZ2luUmlnaHQ6XCIzcHhcIixkaXNwbGF5OlwiaW5saW5lLWJsb2NrXCIsY3Vyc29yOlwicG9pbnRlclwifSk7Zi5leHRlbmQodC5zdHlsZSxcbnt3aWR0aDpcIjEwMCVcIixoZWlnaHQ6XCIxMDAlXCIsYmFja2dyb3VuZDpcIm5vbmVcIn0pO2IodCxcInRvcFwiLFwicmdiYSgwLDAsMCwwKVwiLFwiIzAwMFwiKTtmLmV4dGVuZCh0aGlzLl9faHVlX2ZpZWxkLnN0eWxlLHt3aWR0aDpcIjE1cHhcIixoZWlnaHQ6XCIxMDBweFwiLGRpc3BsYXk6XCJpbmxpbmUtYmxvY2tcIixib3JkZXI6XCIxcHggc29saWQgIzU1NVwiLGN1cnNvcjpcIm5zLXJlc2l6ZVwifSk7bih0aGlzLl9faHVlX2ZpZWxkKTtmLmV4dGVuZCh0aGlzLl9faW5wdXQuc3R5bGUse291dGxpbmU6XCJub25lXCIsdGV4dEFsaWduOlwiY2VudGVyXCIsY29sb3I6XCIjZmZmXCIsYm9yZGVyOjAsZm9udFdlaWdodDpcImJvbGRcIix0ZXh0U2hhZG93OnRoaXMuX19pbnB1dF90ZXh0U2hhZG93K1wicmdiYSgwLDAsMCwwLjcpXCJ9KTthLmJpbmQodGhpcy5fX3NhdHVyYXRpb25fZmllbGQsXCJtb3VzZWRvd25cIixvKTthLmJpbmQodGhpcy5fX2ZpZWxkX2tub2IsXCJtb3VzZWRvd25cIixvKTthLmJpbmQodGhpcy5fX2h1ZV9maWVsZCxcIm1vdXNlZG93blwiLFxuZnVuY3Rpb24oYil7cyhiKTthLmJpbmQod2luZG93LFwibW91c2Vtb3ZlXCIscyk7YS5iaW5kKHdpbmRvdyxcIm1vdXNldXBcIixpKX0pO3RoaXMuX19zYXR1cmF0aW9uX2ZpZWxkLmFwcGVuZENoaWxkKHQpO3RoaXMuX19zZWxlY3Rvci5hcHBlbmRDaGlsZCh0aGlzLl9fZmllbGRfa25vYik7dGhpcy5fX3NlbGVjdG9yLmFwcGVuZENoaWxkKHRoaXMuX19zYXR1cmF0aW9uX2ZpZWxkKTt0aGlzLl9fc2VsZWN0b3IuYXBwZW5kQ2hpbGQodGhpcy5fX2h1ZV9maWVsZCk7dGhpcy5fX2h1ZV9maWVsZC5hcHBlbmRDaGlsZCh0aGlzLl9faHVlX2tub2IpO3RoaXMuZG9tRWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLl9faW5wdXQpO3RoaXMuZG9tRWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLl9fc2VsZWN0b3IpO3RoaXMudXBkYXRlRGlzcGxheSgpfTtoLnN1cGVyY2xhc3M9ZTtmLmV4dGVuZChoLnByb3RvdHlwZSxlLnByb3RvdHlwZSx7dXBkYXRlRGlzcGxheTpmdW5jdGlvbigpe3ZhciBhPWQodGhpcy5nZXRWYWx1ZSgpKTtcbmlmKGEhPT1mYWxzZSl7dmFyIGU9ZmFsc2U7Zi5lYWNoKGMuQ09NUE9ORU5UUyxmdW5jdGlvbihiKXtpZighZi5pc1VuZGVmaW5lZChhW2JdKSYmIWYuaXNVbmRlZmluZWQodGhpcy5fX2NvbG9yLl9fc3RhdGVbYl0pJiZhW2JdIT09dGhpcy5fX2NvbG9yLl9fc3RhdGVbYl0pcmV0dXJuIGU9dHJ1ZSx7fX0sdGhpcyk7ZSYmZi5leHRlbmQodGhpcy5fX2NvbG9yLl9fc3RhdGUsYSl9Zi5leHRlbmQodGhpcy5fX3RlbXAuX19zdGF0ZSx0aGlzLl9fY29sb3IuX19zdGF0ZSk7dGhpcy5fX3RlbXAuYT0xO3ZhciBoPXRoaXMuX19jb2xvci52PDAuNXx8dGhpcy5fX2NvbG9yLnM+MC41PzI1NTowLGo9MjU1LWg7Zi5leHRlbmQodGhpcy5fX2ZpZWxkX2tub2Iuc3R5bGUse21hcmdpbkxlZnQ6MTAwKnRoaXMuX19jb2xvci5zLTcrXCJweFwiLG1hcmdpblRvcDoxMDAqKDEtdGhpcy5fX2NvbG9yLnYpLTcrXCJweFwiLGJhY2tncm91bmRDb2xvcjp0aGlzLl9fdGVtcC50b1N0cmluZygpLGJvcmRlcjp0aGlzLl9fZmllbGRfa25vYl9ib3JkZXIrXG5cInJnYihcIitoK1wiLFwiK2grXCIsXCIraCtcIilcIn0pO3RoaXMuX19odWVfa25vYi5zdHlsZS5tYXJnaW5Ub3A9KDEtdGhpcy5fX2NvbG9yLmgvMzYwKSoxMDArXCJweFwiO3RoaXMuX190ZW1wLnM9MTt0aGlzLl9fdGVtcC52PTE7Yih0aGlzLl9fc2F0dXJhdGlvbl9maWVsZCxcImxlZnRcIixcIiNmZmZcIix0aGlzLl9fdGVtcC50b1N0cmluZygpKTtmLmV4dGVuZCh0aGlzLl9faW5wdXQuc3R5bGUse2JhY2tncm91bmRDb2xvcjp0aGlzLl9faW5wdXQudmFsdWU9dGhpcy5fX2NvbG9yLnRvU3RyaW5nKCksY29sb3I6XCJyZ2IoXCIraCtcIixcIitoK1wiLFwiK2grXCIpXCIsdGV4dFNoYWRvdzp0aGlzLl9faW5wdXRfdGV4dFNoYWRvdytcInJnYmEoXCIraitcIixcIitqK1wiLFwiK2orXCIsLjcpXCJ9KX19KTt2YXIgaj1bXCItbW96LVwiLFwiLW8tXCIsXCItd2Via2l0LVwiLFwiLW1zLVwiLFwiXCJdO3JldHVybiBofShkYXQuY29udHJvbGxlcnMuQ29udHJvbGxlcixkYXQuZG9tLmRvbSxkYXQuY29sb3IuQ29sb3I9ZnVuY3Rpb24oZSxhLGMsZCl7ZnVuY3Rpb24gZihhLFxuYixjKXtPYmplY3QuZGVmaW5lUHJvcGVydHkoYSxiLHtnZXQ6ZnVuY3Rpb24oKXtpZih0aGlzLl9fc3RhdGUuc3BhY2U9PT1cIlJHQlwiKXJldHVybiB0aGlzLl9fc3RhdGVbYl07bih0aGlzLGIsYyk7cmV0dXJuIHRoaXMuX19zdGF0ZVtiXX0sc2V0OmZ1bmN0aW9uKGEpe2lmKHRoaXMuX19zdGF0ZS5zcGFjZSE9PVwiUkdCXCIpbih0aGlzLGIsYyksdGhpcy5fX3N0YXRlLnNwYWNlPVwiUkdCXCI7dGhpcy5fX3N0YXRlW2JdPWF9fSl9ZnVuY3Rpb24gYihhLGIpe09iamVjdC5kZWZpbmVQcm9wZXJ0eShhLGIse2dldDpmdW5jdGlvbigpe2lmKHRoaXMuX19zdGF0ZS5zcGFjZT09PVwiSFNWXCIpcmV0dXJuIHRoaXMuX19zdGF0ZVtiXTtoKHRoaXMpO3JldHVybiB0aGlzLl9fc3RhdGVbYl19LHNldDpmdW5jdGlvbihhKXtpZih0aGlzLl9fc3RhdGUuc3BhY2UhPT1cIkhTVlwiKWgodGhpcyksdGhpcy5fX3N0YXRlLnNwYWNlPVwiSFNWXCI7dGhpcy5fX3N0YXRlW2JdPWF9fSl9ZnVuY3Rpb24gbihiLGMsZSl7aWYoYi5fX3N0YXRlLnNwYWNlPT09XG5cIkhFWFwiKWIuX19zdGF0ZVtjXT1hLmNvbXBvbmVudF9mcm9tX2hleChiLl9fc3RhdGUuaGV4LGUpO2Vsc2UgaWYoYi5fX3N0YXRlLnNwYWNlPT09XCJIU1ZcIilkLmV4dGVuZChiLl9fc3RhdGUsYS5oc3ZfdG9fcmdiKGIuX19zdGF0ZS5oLGIuX19zdGF0ZS5zLGIuX19zdGF0ZS52KSk7ZWxzZSB0aHJvd1wiQ29ycnVwdGVkIGNvbG9yIHN0YXRlXCI7fWZ1bmN0aW9uIGgoYil7dmFyIGM9YS5yZ2JfdG9faHN2KGIucixiLmcsYi5iKTtkLmV4dGVuZChiLl9fc3RhdGUse3M6Yy5zLHY6Yy52fSk7aWYoZC5pc05hTihjLmgpKXtpZihkLmlzVW5kZWZpbmVkKGIuX19zdGF0ZS5oKSliLl9fc3RhdGUuaD0wfWVsc2UgYi5fX3N0YXRlLmg9Yy5ofXZhciBqPWZ1bmN0aW9uKCl7dGhpcy5fX3N0YXRlPWUuYXBwbHkodGhpcyxhcmd1bWVudHMpO2lmKHRoaXMuX19zdGF0ZT09PWZhbHNlKXRocm93XCJGYWlsZWQgdG8gaW50ZXJwcmV0IGNvbG9yIGFyZ3VtZW50c1wiO3RoaXMuX19zdGF0ZS5hPXRoaXMuX19zdGF0ZS5hfHxcbjF9O2ouQ09NUE9ORU5UUz1cInIsZyxiLGgscyx2LGhleCxhXCIuc3BsaXQoXCIsXCIpO2QuZXh0ZW5kKGoucHJvdG90eXBlLHt0b1N0cmluZzpmdW5jdGlvbigpe3JldHVybiBjKHRoaXMpfSx0b09yaWdpbmFsOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX19zdGF0ZS5jb252ZXJzaW9uLndyaXRlKHRoaXMpfX0pO2Yoai5wcm90b3R5cGUsXCJyXCIsMik7ZihqLnByb3RvdHlwZSxcImdcIiwxKTtmKGoucHJvdG90eXBlLFwiYlwiLDApO2Ioai5wcm90b3R5cGUsXCJoXCIpO2Ioai5wcm90b3R5cGUsXCJzXCIpO2Ioai5wcm90b3R5cGUsXCJ2XCIpO09iamVjdC5kZWZpbmVQcm9wZXJ0eShqLnByb3RvdHlwZSxcImFcIix7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX19zdGF0ZS5hfSxzZXQ6ZnVuY3Rpb24oYSl7dGhpcy5fX3N0YXRlLmE9YX19KTtPYmplY3QuZGVmaW5lUHJvcGVydHkoai5wcm90b3R5cGUsXCJoZXhcIix7Z2V0OmZ1bmN0aW9uKCl7aWYoIXRoaXMuX19zdGF0ZS5zcGFjZSE9PVwiSEVYXCIpdGhpcy5fX3N0YXRlLmhleD1cbmEucmdiX3RvX2hleCh0aGlzLnIsdGhpcy5nLHRoaXMuYik7cmV0dXJuIHRoaXMuX19zdGF0ZS5oZXh9LHNldDpmdW5jdGlvbihhKXt0aGlzLl9fc3RhdGUuc3BhY2U9XCJIRVhcIjt0aGlzLl9fc3RhdGUuaGV4PWF9fSk7cmV0dXJuIGp9KGRhdC5jb2xvci5pbnRlcnByZXQsZGF0LmNvbG9yLm1hdGg9ZnVuY3Rpb24oKXt2YXIgZTtyZXR1cm57aHN2X3RvX3JnYjpmdW5jdGlvbihhLGMsZCl7dmFyIGU9YS82MC1NYXRoLmZsb29yKGEvNjApLGI9ZCooMS1jKSxuPWQqKDEtZSpjKSxjPWQqKDEtKDEtZSkqYyksYT1bW2QsYyxiXSxbbixkLGJdLFtiLGQsY10sW2IsbixkXSxbYyxiLGRdLFtkLGIsbl1dW01hdGguZmxvb3IoYS82MCklNl07cmV0dXJue3I6YVswXSoyNTUsZzphWzFdKjI1NSxiOmFbMl0qMjU1fX0scmdiX3RvX2hzdjpmdW5jdGlvbihhLGMsZCl7dmFyIGU9TWF0aC5taW4oYSxjLGQpLGI9TWF0aC5tYXgoYSxjLGQpLGU9Yi1lO2lmKGI9PTApcmV0dXJue2g6TmFOLHM6MCx2OjB9O1xuYT1hPT1iPyhjLWQpL2U6Yz09Yj8yKyhkLWEpL2U6NCsoYS1jKS9lO2EvPTY7YTwwJiYoYSs9MSk7cmV0dXJue2g6YSozNjAsczplL2IsdjpiLzI1NX19LHJnYl90b19oZXg6ZnVuY3Rpb24oYSxjLGQpe2E9dGhpcy5oZXhfd2l0aF9jb21wb25lbnQoMCwyLGEpO2E9dGhpcy5oZXhfd2l0aF9jb21wb25lbnQoYSwxLGMpO3JldHVybiBhPXRoaXMuaGV4X3dpdGhfY29tcG9uZW50KGEsMCxkKX0sY29tcG9uZW50X2Zyb21faGV4OmZ1bmN0aW9uKGEsYyl7cmV0dXJuIGE+PmMqOCYyNTV9LGhleF93aXRoX2NvbXBvbmVudDpmdW5jdGlvbihhLGMsZCl7cmV0dXJuIGQ8PChlPWMqOCl8YSZ+KDI1NTw8ZSl9fX0oKSxkYXQuY29sb3IudG9TdHJpbmcsZGF0LnV0aWxzLmNvbW1vbiksZGF0LmNvbG9yLmludGVycHJldCxkYXQudXRpbHMuY29tbW9uKSxkYXQudXRpbHMucmVxdWVzdEFuaW1hdGlvbkZyYW1lPWZ1bmN0aW9uKCl7cmV0dXJuIHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fFxud2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZXx8d2luZG93Lm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZXx8ZnVuY3Rpb24oZSl7d2luZG93LnNldFRpbWVvdXQoZSwxRTMvNjApfX0oKSxkYXQuZG9tLkNlbnRlcmVkRGl2PWZ1bmN0aW9uKGUsYSl7dmFyIGM9ZnVuY3Rpb24oKXt0aGlzLmJhY2tncm91bmRFbGVtZW50PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7YS5leHRlbmQodGhpcy5iYWNrZ3JvdW5kRWxlbWVudC5zdHlsZSx7YmFja2dyb3VuZENvbG9yOlwicmdiYSgwLDAsMCwwLjgpXCIsdG9wOjAsbGVmdDowLGRpc3BsYXk6XCJub25lXCIsekluZGV4OlwiMTAwMFwiLG9wYWNpdHk6MCxXZWJraXRUcmFuc2l0aW9uOlwib3BhY2l0eSAwLjJzIGxpbmVhclwifSk7ZS5tYWtlRnVsbHNjcmVlbih0aGlzLmJhY2tncm91bmRFbGVtZW50KTt0aGlzLmJhY2tncm91bmRFbGVtZW50LnN0eWxlLnBvc2l0aW9uPVwiZml4ZWRcIjt0aGlzLmRvbUVsZW1lbnQ9XG5kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO2EuZXh0ZW5kKHRoaXMuZG9tRWxlbWVudC5zdHlsZSx7cG9zaXRpb246XCJmaXhlZFwiLGRpc3BsYXk6XCJub25lXCIsekluZGV4OlwiMTAwMVwiLG9wYWNpdHk6MCxXZWJraXRUcmFuc2l0aW9uOlwiLXdlYmtpdC10cmFuc2Zvcm0gMC4ycyBlYXNlLW91dCwgb3BhY2l0eSAwLjJzIGxpbmVhclwifSk7ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmJhY2tncm91bmRFbGVtZW50KTtkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuZG9tRWxlbWVudCk7dmFyIGM9dGhpcztlLmJpbmQodGhpcy5iYWNrZ3JvdW5kRWxlbWVudCxcImNsaWNrXCIsZnVuY3Rpb24oKXtjLmhpZGUoKX0pfTtjLnByb3RvdHlwZS5zaG93PWZ1bmN0aW9uKCl7dmFyIGM9dGhpczt0aGlzLmJhY2tncm91bmRFbGVtZW50LnN0eWxlLmRpc3BsYXk9XCJibG9ja1wiO3RoaXMuZG9tRWxlbWVudC5zdHlsZS5kaXNwbGF5PVwiYmxvY2tcIjt0aGlzLmRvbUVsZW1lbnQuc3R5bGUub3BhY2l0eT1cbjA7dGhpcy5kb21FbGVtZW50LnN0eWxlLndlYmtpdFRyYW5zZm9ybT1cInNjYWxlKDEuMSlcIjt0aGlzLmxheW91dCgpO2EuZGVmZXIoZnVuY3Rpb24oKXtjLmJhY2tncm91bmRFbGVtZW50LnN0eWxlLm9wYWNpdHk9MTtjLmRvbUVsZW1lbnQuc3R5bGUub3BhY2l0eT0xO2MuZG9tRWxlbWVudC5zdHlsZS53ZWJraXRUcmFuc2Zvcm09XCJzY2FsZSgxKVwifSl9O2MucHJvdG90eXBlLmhpZGU9ZnVuY3Rpb24oKXt2YXIgYT10aGlzLGM9ZnVuY3Rpb24oKXthLmRvbUVsZW1lbnQuc3R5bGUuZGlzcGxheT1cIm5vbmVcIjthLmJhY2tncm91bmRFbGVtZW50LnN0eWxlLmRpc3BsYXk9XCJub25lXCI7ZS51bmJpbmQoYS5kb21FbGVtZW50LFwid2Via2l0VHJhbnNpdGlvbkVuZFwiLGMpO2UudW5iaW5kKGEuZG9tRWxlbWVudCxcInRyYW5zaXRpb25lbmRcIixjKTtlLnVuYmluZChhLmRvbUVsZW1lbnQsXCJvVHJhbnNpdGlvbkVuZFwiLGMpfTtlLmJpbmQodGhpcy5kb21FbGVtZW50LFwid2Via2l0VHJhbnNpdGlvbkVuZFwiLFxuYyk7ZS5iaW5kKHRoaXMuZG9tRWxlbWVudCxcInRyYW5zaXRpb25lbmRcIixjKTtlLmJpbmQodGhpcy5kb21FbGVtZW50LFwib1RyYW5zaXRpb25FbmRcIixjKTt0aGlzLmJhY2tncm91bmRFbGVtZW50LnN0eWxlLm9wYWNpdHk9MDt0aGlzLmRvbUVsZW1lbnQuc3R5bGUub3BhY2l0eT0wO3RoaXMuZG9tRWxlbWVudC5zdHlsZS53ZWJraXRUcmFuc2Zvcm09XCJzY2FsZSgxLjEpXCJ9O2MucHJvdG90eXBlLmxheW91dD1mdW5jdGlvbigpe3RoaXMuZG9tRWxlbWVudC5zdHlsZS5sZWZ0PXdpbmRvdy5pbm5lcldpZHRoLzItZS5nZXRXaWR0aCh0aGlzLmRvbUVsZW1lbnQpLzIrXCJweFwiO3RoaXMuZG9tRWxlbWVudC5zdHlsZS50b3A9d2luZG93LmlubmVySGVpZ2h0LzItZS5nZXRIZWlnaHQodGhpcy5kb21FbGVtZW50KS8yK1wicHhcIn07cmV0dXJuIGN9KGRhdC5kb20uZG9tLGRhdC51dGlscy5jb21tb24pLGRhdC5kb20uZG9tLGRhdC51dGlscy5jb21tb24pO1xuOyBicm93c2VyaWZ5X3NoaW1fX2RlZmluZV9fbW9kdWxlX19leHBvcnRfXyh0eXBlb2YgZGF0ICE9IFwidW5kZWZpbmVkXCIgPyBkYXQgOiB3aW5kb3cuZGF0KTtcblxufSkuY2FsbChnbG9iYWwsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgZnVuY3Rpb24gZGVmaW5lRXhwb3J0KGV4KSB7IG1vZHVsZS5leHBvcnRzID0gZXg7IH0pO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbjtfX2Jyb3dzZXJpZnlfc2hpbV9yZXF1aXJlX189cmVxdWlyZTsoZnVuY3Rpb24gYnJvd3NlcmlmeVNoaW0obW9kdWxlLCBleHBvcnRzLCByZXF1aXJlLCBkZWZpbmUsIGJyb3dzZXJpZnlfc2hpbV9fZGVmaW5lX19tb2R1bGVfX2V4cG9ydF9fKSB7XG4vLyBzdGF0cy5qcyAtIGh0dHA6Ly9naXRodWIuY29tL21yZG9vYi9zdGF0cy5qc1xudmFyIFN0YXRzPWZ1bmN0aW9uKCl7dmFyIGw9RGF0ZS5ub3coKSxtPWwsZz0wLG49SW5maW5pdHksbz0wLGg9MCxwPUluZmluaXR5LHE9MCxyPTAscz0wLGY9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtmLmlkPVwic3RhdHNcIjtmLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIixmdW5jdGlvbihiKXtiLnByZXZlbnREZWZhdWx0KCk7dCgrK3MlMil9LCExKTtmLnN0eWxlLmNzc1RleHQ9XCJ3aWR0aDo4MHB4O29wYWNpdHk6MC45O2N1cnNvcjpwb2ludGVyXCI7dmFyIGE9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTthLmlkPVwiZnBzXCI7YS5zdHlsZS5jc3NUZXh0PVwicGFkZGluZzowIDAgM3B4IDNweDt0ZXh0LWFsaWduOmxlZnQ7YmFja2dyb3VuZC1jb2xvcjojMDAyXCI7Zi5hcHBlbmRDaGlsZChhKTt2YXIgaT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO2kuaWQ9XCJmcHNUZXh0XCI7aS5zdHlsZS5jc3NUZXh0PVwiY29sb3I6IzBmZjtmb250LWZhbWlseTpIZWx2ZXRpY2EsQXJpYWwsc2Fucy1zZXJpZjtmb250LXNpemU6OXB4O2ZvbnQtd2VpZ2h0OmJvbGQ7bGluZS1oZWlnaHQ6MTVweFwiO1xuaS5pbm5lckhUTUw9XCJGUFNcIjthLmFwcGVuZENoaWxkKGkpO3ZhciBjPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7Yy5pZD1cImZwc0dyYXBoXCI7Yy5zdHlsZS5jc3NUZXh0PVwicG9zaXRpb246cmVsYXRpdmU7d2lkdGg6NzRweDtoZWlnaHQ6MzBweDtiYWNrZ3JvdW5kLWNvbG9yOiMwZmZcIjtmb3IoYS5hcHBlbmRDaGlsZChjKTs3ND5jLmNoaWxkcmVuLmxlbmd0aDspe3ZhciBqPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO2ouc3R5bGUuY3NzVGV4dD1cIndpZHRoOjFweDtoZWlnaHQ6MzBweDtmbG9hdDpsZWZ0O2JhY2tncm91bmQtY29sb3I6IzExM1wiO2MuYXBwZW5kQ2hpbGQoail9dmFyIGQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtkLmlkPVwibXNcIjtkLnN0eWxlLmNzc1RleHQ9XCJwYWRkaW5nOjAgMCAzcHggM3B4O3RleHQtYWxpZ246bGVmdDtiYWNrZ3JvdW5kLWNvbG9yOiMwMjA7ZGlzcGxheTpub25lXCI7Zi5hcHBlbmRDaGlsZChkKTt2YXIgaz1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuay5pZD1cIm1zVGV4dFwiO2suc3R5bGUuY3NzVGV4dD1cImNvbG9yOiMwZjA7Zm9udC1mYW1pbHk6SGVsdmV0aWNhLEFyaWFsLHNhbnMtc2VyaWY7Zm9udC1zaXplOjlweDtmb250LXdlaWdodDpib2xkO2xpbmUtaGVpZ2h0OjE1cHhcIjtrLmlubmVySFRNTD1cIk1TXCI7ZC5hcHBlbmRDaGlsZChrKTt2YXIgZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO2UuaWQ9XCJtc0dyYXBoXCI7ZS5zdHlsZS5jc3NUZXh0PVwicG9zaXRpb246cmVsYXRpdmU7d2lkdGg6NzRweDtoZWlnaHQ6MzBweDtiYWNrZ3JvdW5kLWNvbG9yOiMwZjBcIjtmb3IoZC5hcHBlbmRDaGlsZChlKTs3ND5lLmNoaWxkcmVuLmxlbmd0aDspaj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKSxqLnN0eWxlLmNzc1RleHQ9XCJ3aWR0aDoxcHg7aGVpZ2h0OjMwcHg7ZmxvYXQ6bGVmdDtiYWNrZ3JvdW5kLWNvbG9yOiMxMzFcIixlLmFwcGVuZENoaWxkKGopO3ZhciB0PWZ1bmN0aW9uKGIpe3M9Yjtzd2l0Y2gocyl7Y2FzZSAwOmEuc3R5bGUuZGlzcGxheT1cblwiYmxvY2tcIjtkLnN0eWxlLmRpc3BsYXk9XCJub25lXCI7YnJlYWs7Y2FzZSAxOmEuc3R5bGUuZGlzcGxheT1cIm5vbmVcIixkLnN0eWxlLmRpc3BsYXk9XCJibG9ja1wifX07cmV0dXJue1JFVklTSU9OOjExLGRvbUVsZW1lbnQ6ZixzZXRNb2RlOnQsYmVnaW46ZnVuY3Rpb24oKXtsPURhdGUubm93KCl9LGVuZDpmdW5jdGlvbigpe3ZhciBiPURhdGUubm93KCk7Zz1iLWw7bj1NYXRoLm1pbihuLGcpO289TWF0aC5tYXgobyxnKTtrLnRleHRDb250ZW50PWcrXCIgTVMgKFwiK24rXCItXCIrbytcIilcIjt2YXIgYT1NYXRoLm1pbigzMCwzMC0zMCooZy8yMDApKTtlLmFwcGVuZENoaWxkKGUuZmlyc3RDaGlsZCkuc3R5bGUuaGVpZ2h0PWErXCJweFwiO3IrKztiPm0rMUUzJiYoaD1NYXRoLnJvdW5kKDFFMypyLyhiLW0pKSxwPU1hdGgubWluKHAsaCkscT1NYXRoLm1heChxLGgpLGkudGV4dENvbnRlbnQ9aCtcIiBGUFMgKFwiK3ArXCItXCIrcStcIilcIixhPU1hdGgubWluKDMwLDMwLTMwKihoLzEwMCkpLGMuYXBwZW5kQ2hpbGQoYy5maXJzdENoaWxkKS5zdHlsZS5oZWlnaHQ9XG5hK1wicHhcIixtPWIscj0wKTtyZXR1cm4gYn0sdXBkYXRlOmZ1bmN0aW9uKCl7bD10aGlzLmVuZCgpfX19O1xuXG47IGJyb3dzZXJpZnlfc2hpbV9fZGVmaW5lX19tb2R1bGVfX2V4cG9ydF9fKHR5cGVvZiBTdGF0cyAhPSBcInVuZGVmaW5lZFwiID8gU3RhdHMgOiB3aW5kb3cuU3RhdHMpO1xuXG59KS5jYWxsKGdsb2JhbCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBmdW5jdGlvbiBkZWZpbmVFeHBvcnQoZXgpIHsgbW9kdWxlLmV4cG9ydHMgPSBleDsgfSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xudmFyIFRIUkVFID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuVEhSRUUgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlRIUkVFIDogbnVsbCk7XG5cbi8qKlxuICogQG1vZHVsZSAgbW9kZWwvQ29vcmRpbmF0ZXNcbiAqL1xuXG4vKipcbiAqIENvb3JkaW5hdGVzIGhlbHBlciwgaXQgY3JlYXRlcyB0aGUgYXhlcywgZ3JvdW5kIGFuZCBncmlkc1xuICogc2hvd24gaW4gdGhlIHdvcmxkXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWdcbiAqIEBwYXJhbSB7T2JqZWN0fSB0aGVtZVxuICovXG5mdW5jdGlvbiBDb29yZGluYXRlcyhjb25maWcsIHRoZW1lKSB7XG4gIGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcblxuICAvKipcbiAgICogR3JvdXAgd2hlcmUgYWxsIHRoZSBvYmplY3RzIChheGVzLCBncm91bmQsIGdyaWRzKSBhcmUgcHV0XG4gICAqIEB0eXBlIHtUSFJFRS5PYmplY3QzRH1cbiAgICovXG4gIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xuXG4gIC8qKlxuICAgKiBBeGVzIG9iamVjdCwgdGhlIG1lc2ggcmVwcmVzZW50aW5nIHRoZSBheGVzIGlzIHVuZGVyIHRoaXMgb2JqZWN0IFxuICAgKiB1bmRlciBgbWVzaGBcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIHRoaXMuYXhlcyA9IHtcbiAgICBuYW1lOiAnQXhlcycsXG4gICAgbWVzaDogdGhpcy5kcmF3QWxsQXhlcyh7YXhpc0xlbmd0aDoxMDAsYXhpc1JhZGl1czoxLGF4aXNUZXNzOjUwfSksXG4gICAgdmlzaWJsZTogY29uZmlnLmF4ZXMgIT09IHVuZGVmaW5lZCA/IGNvbmZpZy5heGVzIDogdHJ1ZVxuICB9O1xuXG4gIC8qKlxuICAgKiBHcm91bmQgb2JqZWN0LCB0aGUgbWVzaCByZXByZXNlbnRpbmcgdGhlIGF4ZXMgaXMgdW5kZXIgdGhpcyBvYmplY3RcbiAgICogdW5kZXIgYG1lc2hgXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICB0aGlzLmdyb3VuZCA9IHtcbiAgICBuYW1lOiAnR3JvdW5kJyxcbiAgICBtZXNoOiB0aGlzLmRyYXdHcm91bmQoe3NpemU6MTAwMDAwLCBjb2xvcjogdGhlbWUuZ3JvdW5kQ29sb3J9KSxcbiAgICB2aXNpYmxlOiBjb25maWcuZ3JvdW5kICE9PSB1bmRlZmluZWQgPyBjb25maWcuZ3JvdW5kIDogdHJ1ZVxuICB9O1xuICBcbiAgLyoqXG4gICAqIEdyaWRYWiBvYmplY3QsIHRoZSBtZXNoIHJlcHJlc2VudGluZyB0aGUgYXhlcyBpcyB1bmRlciB0aGlzIG9iamVjdFxuICAgKiB1bmRlciBgbWVzaGBcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIHRoaXMuZ3JpZFggPSB7XG4gICAgbmFtZTogJ1haIGdyaWQnLFxuICAgIG1lc2g6IHRoaXMuZHJhd0dyaWQoe3NpemU6MTAwMDAsIHNjYWxlOjAuMDEsIGNvbG9yOiB0aGVtZS5ncmlkQ29sb3J9KSxcbiAgICB2aXNpYmxlOiBjb25maWcuZ3JpZFggIT09IHVuZGVmaW5lZCA/IGNvbmZpZy5ncmlkWCA6IHRydWVcbiAgfTtcblxuICAvKipcbiAgICogR3JpZFlaIG9iamVjdCwgdGhlIG1lc2ggcmVwcmVzZW50aW5nIHRoZSBheGVzIGlzIHVuZGVyIHRoaXMgb2JqZWN0XG4gICAqIHVuZGVyIGBtZXNoYFxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi8gIFxuICB0aGlzLmdyaWRZID0ge1xuICAgIG5hbWU6ICdZWiBncmlkJyxcbiAgICBtZXNoOiB0aGlzLmRyYXdHcmlkKHtzaXplOjEwMDAwLCBzY2FsZTowLjAxLCBvcmllbnRhdGlvbjpcInlcIiwgY29sb3I6IHRoZW1lLmdyaWRDb2xvcn0pLFxuICAgIHZpc2libGU6IGNvbmZpZy5ncmlkWSAhPT0gdW5kZWZpbmVkID8gY29uZmlnLmdyaWRZIDogZmFsc2VcbiAgfTtcbiAgXG4gIC8qKlxuICAgKiBHcmlkWFkgb2JqZWN0LCB0aGUgbWVzaCByZXByZXNlbnRpbmcgdGhlIGF4ZXMgaXMgdW5kZXIgdGhpcyBvYmplY3RcbiAgICogdW5kZXIgYG1lc2hgXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICB0aGlzLmdyaWRaID0ge1xuICAgIG5hbWU6ICdYWSBncmlkJyxcbiAgICBtZXNoOiB0aGlzLmRyYXdHcmlkKHtzaXplOjEwMDAwLCBzY2FsZTowLjAxLCBvcmllbnRhdGlvbjpcInpcIiwgY29sb3I6IHRoZW1lLmdyaWRDb2xvcn0pLFxuICAgIHZpc2libGU6IGNvbmZpZy5ncmlkWiAhPT0gdW5kZWZpbmVkID8gY29uZmlnLmdyaWRaIDogZmFsc2VcbiAgfTtcblxuICBDb29yZGluYXRlcy5wcm90b3R5cGUuaW5pdC5jYWxsKHRoaXMsIGNvbmZpZyk7XG59XG5cbi8qKlxuICogQWRkcyB0aGUgYXhlcywgZ3JvdW5kLCBncmlkIG1lc2hlcyB0byBgdGhpcy5tZXNoYFxuICogQHBhcmFtICB7b2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5Db29yZGluYXRlcy5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gIHZhciBtZSA9IHRoaXM7XG4gIGZvciAodmFyIGtleSBpbiBtZSkge1xuICAgIGlmIChtZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICB2YXIgdiA9IG1lW2tleV07XG4gICAgICBpZiAodi5tZXNoKSB7XG4gICAgICAgIG1lLm1lc2guYWRkKHYubWVzaCk7XG4gICAgICAgIHYubWVzaC52aXNpYmxlID0gdi52aXNpYmxlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBtZTtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIGRhdC5ndWkgZm9sZGVyIHdoaWNoIGhhcyBjb250cm9scyBmb3IgdGhlIFxuICogZ3JvdW5kLCBheGVzIGFuZCBncmlkc1xuICogQHBhcmFtICB7ZGF0Lmd1aX0gZ3VpXG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5Db29yZGluYXRlcy5wcm90b3R5cGUuaW5pdERhdEd1aSA9IGZ1bmN0aW9uIChndWkpIHtcbiAgdmFyIG1lID0gdGhpcyxcbiAgICBmb2xkZXI7XG5cbiAgZm9sZGVyID0gZ3VpLmFkZEZvbGRlcignU2NlbmUgaGVscGVycycpO1xuICBmb3IgKHZhciBrZXkgaW4gbWUpIHtcbiAgICBpZiAobWUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgdmFyIHYgPSBtZVtrZXldO1xuICAgICAgaWYgKHYuaGFzT3duUHJvcGVydHkoJ21lc2gnKSkge1xuICAgICAgICBmb2xkZXIuYWRkKHYsICd2aXNpYmxlJylcbiAgICAgICAgICAubmFtZSh2Lm5hbWUpXG4gICAgICAgICAgLm9uRmluaXNoQ2hhbmdlKChmdW5jdGlvbiAocHJvcGVydHkpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAobmV3VmFsdWUpIHtcbiAgICAgICAgICAgICAgcHJvcGVydHkubWVzaC52aXNpYmxlID0gbmV3VmFsdWU7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKHYpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG1lO1xufTtcblxuLyoqXG4gKiBEcmF3cyBhIGdyaWRcbiAqIEBwYXJhbSAge29iamVjdH0gcGFyYW1zXG4gKiBAcGFyYW0gIHtvYmplY3R9IHBhcmFtcy5zaXplPTEwMFxuICogQHBhcmFtICB7b2JqZWN0fSBwYXJhbXMuc2NhbGU9MC4xXG4gKiBAcGFyYW0gIHtvYmplY3R9IHBhcmFtcy5jb2xvcj0jNTA1MDUwXG4gKiBAcGFyYW0gIHtvYmplY3R9IHBhcmFtcy5vcmllbnRhdGlvbj0wLjFcbiAqIEByZXR1cm4ge1RIUkVFLk1lc2h9XG4gKi9cbkNvb3JkaW5hdGVzLnByb3RvdHlwZS5kcmF3R3JpZCA9IGZ1bmN0aW9uIChwYXJhbXMpIHtcbiAgcGFyYW1zID0gcGFyYW1zIHx8IHt9O1xuICB2YXIgY29sb3IgPSBwYXJhbXMuY29sb3IgIT09IHVuZGVmaW5lZCA/IHBhcmFtcy5jb2xvcjonIzUwNTA1MCc7XG4gIHZhciBvcmllbnRhdGlvbiA9IHBhcmFtcy5vcmllbnRhdGlvbiAhPT0gdW5kZWZpbmVkID8gcGFyYW1zLm9yaWVudGF0aW9uOlwieFwiO1xuICB2YXIgZ3JpZCA9IG5ldyBUSFJFRS5HcmlkSGVscGVyKCA1MDAsIDEwICk7XG4gIGdyaWQuc2V0Q29sb3JzKCAweGE4YThhOCwgY29sb3IgKTtcbiAgaWYgKG9yaWVudGF0aW9uID09PSBcInhcIikge1xuICAgIGdyaWQucm90YXRpb24ueCA9IC0gTWF0aC5QSSAvIDI7XG4gIH0gZWxzZSBpZiAob3JpZW50YXRpb24gPT09IFwieVwiKSB7XG4gICAgZ3JpZC5yb3RhdGlvbi55ID0gLSBNYXRoLlBJIC8gMjtcbiAgfSBlbHNlIGlmIChvcmllbnRhdGlvbiA9PT0gXCJ6XCIpIHtcbiAgICBncmlkLnJvdGF0aW9uLnogPSAtIE1hdGguUEkgLyAyO1xuICB9XG4gIHJldHVybiBncmlkO1xufTtcblxuLyoqXG4gKiBEcmF3cyB0aGUgZ3JvdW5kXG4gKiBAcGFyYW0gIHtvYmplY3R9IHBhcmFtc1xuICogQHBhcmFtICB7b2JqZWN0fSBwYXJhbXMuc2l6ZT0xMDBcbiAqIEBwYXJhbSAge29iamVjdH0gcGFyYW1zLnNjYWxlPTB4MDAwMDAwXG4gKiBAcGFyYW0gIHtvYmplY3R9IHBhcmFtcy5vZmZzZXQ9LTAuMlxuICogQHJldHVybiB7VEhSRUUuTWVzaH1cbiAqL1xuQ29vcmRpbmF0ZXMucHJvdG90eXBlLmRyYXdHcm91bmQgPSBmdW5jdGlvbiAocGFyYW1zKSB7XG4gIHBhcmFtcyA9IHBhcmFtcyB8fCB7fTtcbiAgdmFyIHNpemUgPSBwYXJhbXMuc2l6ZSAhPT0gdW5kZWZpbmVkID8gcGFyYW1zLnNpemU6MTAwO1xuICB2YXIgY29sb3IgPSBwYXJhbXMuY29sb3IgIT09IHVuZGVmaW5lZCA/IHBhcmFtcy5jb2xvcjoweDAwMDAwMDtcbiAgdmFyIG9mZnNldCA9IHBhcmFtcy5vZmZzZXQgIT09IHVuZGVmaW5lZCA/IHBhcmFtcy5vZmZzZXQ6LTAuNTtcblxuICB2YXIgZ3JvdW5kID0gbmV3IFRIUkVFLk1lc2goXG4gICAgbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoc2l6ZSwgc2l6ZSksXG4gICAgbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHtcbiAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxuICAgICAgc2lkZTogVEhSRUUuRG91YmxlU2lkZSxcbiAgICAgIG9wYWNpdHk6IDAuNixcbiAgICAgIGNvbG9yOiBjb2xvclxuICAgIH0pXG4gICk7XG4gIGdyb3VuZC5yb3RhdGlvbi54ID0gLSBNYXRoLlBJIC8gMjtcbiAgZ3JvdW5kLnBvc2l0aW9uLnkgPSBvZmZzZXQ7XG4gIHJldHVybiBncm91bmQ7XG59O1xuXG4vKipcbiAqIERyYXdzIGFuIGF4aXNcbiAqIEBwYXJhbSAge29iamVjdH0gcGFyYW1zXG4gKiBAcGFyYW0gIHtvYmplY3R9IHBhcmFtcy5heGlzUmFkaXVzPTAuMDRcbiAqIEBwYXJhbSAge29iamVjdH0gcGFyYW1zLmF4aXNMZW5ndGg9MTFcbiAqIEBwYXJhbSAge29iamVjdH0gcGFyYW1zLmF4aXNUZXNzPTQ2XG4gKiBAcGFyYW0gIHtvYmplY3R9IHBhcmFtcy5heGlzT3JpZW50YXRpb249eFxuICogQHJldHVybiB7VEhSRUUuTWVzaH1cbiAqL1xuQ29vcmRpbmF0ZXMucHJvdG90eXBlLmRyYXdBeGVzID0gZnVuY3Rpb24gKHBhcmFtcykge1xuICAvLyB4ID0gcmVkLCB5ID0gZ3JlZW4sIHogPSBibHVlICAoUkdCID0geHl6KVxuICBwYXJhbXMgPSBwYXJhbXMgfHwge307XG4gIHZhciBheGlzUmFkaXVzID0gcGFyYW1zLmF4aXNSYWRpdXMgIT09IHVuZGVmaW5lZCA/IHBhcmFtcy5heGlzUmFkaXVzOjAuMDQ7XG4gIHZhciBheGlzTGVuZ3RoID0gcGFyYW1zLmF4aXNMZW5ndGggIT09IHVuZGVmaW5lZCA/IHBhcmFtcy5heGlzTGVuZ3RoOjExO1xuICB2YXIgYXhpc1Rlc3MgPSBwYXJhbXMuYXhpc1Rlc3MgIT09IHVuZGVmaW5lZCA/IHBhcmFtcy5heGlzVGVzczo0ODtcbiAgdmFyIGF4aXNPcmllbnRhdGlvbiA9IHBhcmFtcy5heGlzT3JpZW50YXRpb24gIT09IHVuZGVmaW5lZCA/IHBhcmFtcy5heGlzT3JpZW50YXRpb246XCJ4XCI7XG5cbiAgdmFyIHdyYXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcbiAgdmFyIGF4aXNNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKHsgY29sb3I6IDB4MDAwMDAwLCBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlIH0pO1xuICB2YXIgYXhpcyA9IG5ldyBUSFJFRS5NZXNoKFxuICAgIG5ldyBUSFJFRS5DeWxpbmRlckdlb21ldHJ5KGF4aXNSYWRpdXMsIGF4aXNSYWRpdXMsIGF4aXNMZW5ndGgsIGF4aXNUZXNzLCAxLCB0cnVlKSwgXG4gICAgYXhpc01hdGVyaWFsXG4gICk7XG4gIGlmIChheGlzT3JpZW50YXRpb24gPT09IFwieFwiKSB7XG4gICAgYXhpcy5yb3RhdGlvbi56ID0gLSBNYXRoLlBJIC8gMjtcbiAgICBheGlzLnBvc2l0aW9uLnggPSBheGlzTGVuZ3RoLzItMTtcbiAgfSBlbHNlIGlmIChheGlzT3JpZW50YXRpb24gPT09IFwieVwiKSB7XG4gICAgYXhpcy5wb3NpdGlvbi55ID0gYXhpc0xlbmd0aC8yLTE7XG4gIH1cbiAgXG4gIHdyYXAuYWRkKCBheGlzICk7XG4gIFxuICB2YXIgYXJyb3cgPSBuZXcgVEhSRUUuTWVzaChcbiAgICBuZXcgVEhSRUUuQ3lsaW5kZXJHZW9tZXRyeSgwLCA0KmF4aXNSYWRpdXMsIDgqYXhpc1JhZGl1cywgYXhpc1Rlc3MsIDEsIHRydWUpLCBcbiAgICBheGlzTWF0ZXJpYWxcbiAgKTtcbiAgaWYgKGF4aXNPcmllbnRhdGlvbiA9PT0gXCJ4XCIpIHtcbiAgICBhcnJvdy5yb3RhdGlvbi56ID0gLSBNYXRoLlBJIC8gMjtcbiAgICBhcnJvdy5wb3NpdGlvbi54ID0gYXhpc0xlbmd0aCAtIDEgKyBheGlzUmFkaXVzKjQvMjtcbiAgfSBlbHNlIGlmIChheGlzT3JpZW50YXRpb24gPT09IFwieVwiKSB7XG4gICAgYXJyb3cucG9zaXRpb24ueSA9IGF4aXNMZW5ndGggLSAxICsgYXhpc1JhZGl1cyo0LzI7XG4gIH1cblxuICB3cmFwLmFkZCggYXJyb3cgKTtcbiAgcmV0dXJuIHdyYXA7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gT2JqZWN0M0Qgd2hpY2ggY29udGFpbnMgYWxsIGF4ZXNcbiAqIEBwYXJhbSAge09iamVjdH0gcGFyYW1zXG4gKiBAcGFyYW0gIHtvYmplY3R9IHBhcmFtcy5heGlzUmFkaXVzPTAuMDQgIGN5bGluZGVyIHJhZGl1c1xuICogQHBhcmFtICB7b2JqZWN0fSBwYXJhbXMuYXhpc0xlbmd0aD0xMSAgICBjeWxpbmRlciBsZW5ndGhcbiAqIEBwYXJhbSAge29iamVjdH0gcGFyYW1zLmF4aXNUZXNzPTQ2ICAgICAgY3lsaW5kZXIgdGVzc2VsYXRpb25cbiAqIEByZXR1cm4ge1RIUkVFLk9iamVjdDNEfVxuICovXG5Db29yZGluYXRlcy5wcm90b3R5cGUuZHJhd0FsbEF4ZXMgPSBmdW5jdGlvbiAocGFyYW1zKSB7XG4gIHBhcmFtcyA9IHBhcmFtcyB8fCB7fTtcbiAgdmFyIGF4aXNSYWRpdXMgPSBwYXJhbXMuYXhpc1JhZGl1cyAhPT0gdW5kZWZpbmVkID8gcGFyYW1zLmF4aXNSYWRpdXM6MC4wNDtcbiAgdmFyIGF4aXNMZW5ndGggPSBwYXJhbXMuYXhpc0xlbmd0aCAhPT0gdW5kZWZpbmVkID8gcGFyYW1zLmF4aXNMZW5ndGg6MTA7XG4gIHZhciBheGlzVGVzcyA9IHBhcmFtcy5heGlzVGVzcyAhPT0gdW5kZWZpbmVkID8gcGFyYW1zLmF4aXNUZXNzOjI0O1xuXG4gIHZhciB3cmFwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XG5cbiAgdmFyIGF4aXNYTWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCh7IGNvbG9yOiAweEZGMDAwMCB9KTtcbiAgdmFyIGF4aXNZTWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCh7IGNvbG9yOiAweDAwRkYwMCB9KTtcbiAgdmFyIGF4aXNaTWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCh7IGNvbG9yOiAweDAwMDBGRiB9KTtcbiAgYXhpc1hNYXRlcmlhbC5zaWRlID0gVEhSRUUuRG91YmxlU2lkZTtcbiAgYXhpc1lNYXRlcmlhbC5zaWRlID0gVEhSRUUuRG91YmxlU2lkZTtcbiAgYXhpc1pNYXRlcmlhbC5zaWRlID0gVEhSRUUuRG91YmxlU2lkZTtcbiAgdmFyIGF4aXNYID0gbmV3IFRIUkVFLk1lc2goXG4gICAgbmV3IFRIUkVFLkN5bGluZGVyR2VvbWV0cnkoYXhpc1JhZGl1cywgYXhpc1JhZGl1cywgYXhpc0xlbmd0aCwgYXhpc1Rlc3MsIDEsIHRydWUpLCBcbiAgICBheGlzWE1hdGVyaWFsXG4gICk7XG4gIHZhciBheGlzWSA9IG5ldyBUSFJFRS5NZXNoKFxuICAgIG5ldyBUSFJFRS5DeWxpbmRlckdlb21ldHJ5KGF4aXNSYWRpdXMsIGF4aXNSYWRpdXMsIGF4aXNMZW5ndGgsIGF4aXNUZXNzLCAxLCB0cnVlKSwgXG4gICAgYXhpc1lNYXRlcmlhbFxuICApO1xuICB2YXIgYXhpc1ogPSBuZXcgVEhSRUUuTWVzaChcbiAgICBuZXcgVEhSRUUuQ3lsaW5kZXJHZW9tZXRyeShheGlzUmFkaXVzLCBheGlzUmFkaXVzLCBheGlzTGVuZ3RoLCBheGlzVGVzcywgMSwgdHJ1ZSksIFxuICAgIGF4aXNaTWF0ZXJpYWxcbiAgKTtcbiAgYXhpc1gucm90YXRpb24ueiA9IC0gTWF0aC5QSSAvIDI7XG4gIGF4aXNYLnBvc2l0aW9uLnggPSBheGlzTGVuZ3RoLzItMTtcblxuICBheGlzWS5wb3NpdGlvbi55ID0gYXhpc0xlbmd0aC8yLTE7XG4gIFxuICBheGlzWi5yb3RhdGlvbi55ID0gLSBNYXRoLlBJIC8gMjtcbiAgYXhpc1oucm90YXRpb24ueiA9IC0gTWF0aC5QSSAvIDI7XG4gIGF4aXNaLnBvc2l0aW9uLnogPSBheGlzTGVuZ3RoLzItMTtcblxuICB3cmFwLmFkZCggYXhpc1ggKTtcbiAgd3JhcC5hZGQoIGF4aXNZICk7XG4gIHdyYXAuYWRkKCBheGlzWiApO1xuXG4gIHZhciBhcnJvd1ggPSBuZXcgVEhSRUUuTWVzaChcbiAgICBuZXcgVEhSRUUuQ3lsaW5kZXJHZW9tZXRyeSgwLCA0KmF4aXNSYWRpdXMsIDQqYXhpc1JhZGl1cywgYXhpc1Rlc3MsIDEsIHRydWUpLCBcbiAgICBheGlzWE1hdGVyaWFsXG4gICk7XG4gIHZhciBhcnJvd1kgPSBuZXcgVEhSRUUuTWVzaChcbiAgICBuZXcgVEhSRUUuQ3lsaW5kZXJHZW9tZXRyeSgwLCA0KmF4aXNSYWRpdXMsIDQqYXhpc1JhZGl1cywgYXhpc1Rlc3MsIDEsIHRydWUpLCBcbiAgICBheGlzWU1hdGVyaWFsXG4gICk7XG4gIHZhciBhcnJvd1ogPSBuZXcgVEhSRUUuTWVzaChcbiAgICBuZXcgVEhSRUUuQ3lsaW5kZXJHZW9tZXRyeSgwLCA0KmF4aXNSYWRpdXMsIDQqYXhpc1JhZGl1cywgYXhpc1Rlc3MsIDEsIHRydWUpLCBcbiAgICBheGlzWk1hdGVyaWFsXG4gICk7XG4gIGFycm93WC5yb3RhdGlvbi56ID0gLSBNYXRoLlBJIC8gMjtcbiAgYXJyb3dYLnBvc2l0aW9uLnggPSBheGlzTGVuZ3RoIC0gMSArIGF4aXNSYWRpdXMqNC8yO1xuXG4gIGFycm93WS5wb3NpdGlvbi55ID0gYXhpc0xlbmd0aCAtIDEgKyBheGlzUmFkaXVzKjQvMjtcblxuICBhcnJvd1oucm90YXRpb24ueiA9IC0gTWF0aC5QSSAvIDI7XG4gIGFycm93Wi5yb3RhdGlvbi55ID0gLSBNYXRoLlBJIC8gMjtcbiAgYXJyb3daLnBvc2l0aW9uLnogPSBheGlzTGVuZ3RoIC0gMSArIGF4aXNSYWRpdXMqNC8yO1xuXG4gIHdyYXAuYWRkKCBhcnJvd1ggKTtcbiAgd3JhcC5hZGQoIGFycm93WSApO1xuICB3cmFwLmFkZCggYXJyb3daICk7XG4gIHJldHVybiB3cmFwO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb29yZGluYXRlcztcbn0pLmNhbGwodGhpcyx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiLyoqXG4gKiBAbW9kdWxlICB0aGVtZXMvZGFya1xuICovXG5cbi8qKlxuICogRGFyayB0aGVtZVxuICogQHR5cGUge09iamVjdH1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGNsZWFyQ29sb3I6IDB4M2YzZjNmLFxuXHRmb2dDb2xvcjogMHgzZjNmM2YsXG4gIGdyb3VuZENvbG9yOiAweDMzMzMzMyxcbiAgZ3JpZENvbG9yOiAweDU1NTU1NVxufTsiLCIvKipcbiAqIEBtb2R1bGUgIHRoZW1lcy9kYXJrXG4gKi9cblxuLyoqXG4gKiBEYXJrIHRoZW1lXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0Y2xlYXJDb2xvcjogMHhhYWFhYWEsXG5cdGZvZ0NvbG9yOiAweGFhYWFhYSxcblx0Z3JvdW5kQ29sb3I6IDB4YWFhYWFhXG59OyIsIi8qKlxuICogQG1vZHVsZSB0aGVtZXMvbGlnaHRcbiAqL1xuXG4vKipcbiAqIExpZ2h0IHRoZW1lXG4gKiBAbmFtZSBMaWdodFRoZW1lXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0Y2xlYXJDb2xvcjogMHhmMmZjZmYsXG4gIGZvZ0NvbG9yOiAweGYyZmNmZixcblx0Z3JvdW5kQ29sb3I6IDB4ZWVlZWVlXG59OyJdfQ==
(5)
});
