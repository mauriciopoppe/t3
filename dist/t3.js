!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.t3=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/*
License gpl-3.0 http://www.gnu.org/licenses/gpl-3.0-standalone.html
*/
/*jslint
    evil: true,
    node: true
*/
'use strict';
/**
 * Clones non native JavaScript functions, or references native functions.
 * @author <a href="mailto:matthewkastor@gmail.com">Matthew Kastor</a>
 * @param {Function} func The function to clone.
 * @returns {Function} Returns a clone of the non native function, or a
 *  reference to the native function.
 */
function cloneFunction(func) {
    var out, str;
    try {
        str = func.toString();
        if (/\[native code\]/.test(str)) {
            out = func;
        } else {
            out = eval('(function(){return ' + str + '}());');
        }
    } catch (e) {
        throw new Error(e.message + '\r\n\r\n' + str);
    }
    return out;
}
module.exports = cloneFunction;
},{}],2:[function(_dereq_,module,exports){
/**
 * Executes a function on each of an objects own enumerable properties. The
 *  callback function will receive three arguments: the value of the current
 *  property, the name of the property, and the object being processed. This is
 *  roughly equivalent to the signature for callbacks to
 *  Array.prototype.forEach.
 * @param {Object} obj The object to act on.
 * @param {Function} callback The function to execute.
 * @returns {Object} Returns the given object.
 */
function objectForeach(obj, callback) {
    "use strict";
    Object.keys(obj).forEach(function (prop) {
        callback(obj[prop], prop, obj);
    });
    return obj;
};
module.exports = objectForeach;
},{}],3:[function(_dereq_,module,exports){
/*
License gpl-3.0 http://www.gnu.org/licenses/gpl-3.0-standalone.html
*/
/*jslint
    white: true,
    vars: true,
    node: true
*/
function ObjectMergeOptions(opts) {
    'use strict';
    opts = opts || {};
    this.depth = opts.depth || false;
    // circular ref check is true unless explicitly set to false
    // ignore the jslint warning here, it's pointless.
    this.throwOnCircularRef = 'throwOnCircularRef' in opts && opts.throwOnCircularRef === false ? false : true;
}
/*jslint unparam:true*/
/**
 * Creates a new options object suitable for use with objectMerge.
 * @memberOf objectMerge
 * @param {Object} [opts] An object specifying the options.
 * @param {Object} [opts.depth = false] Specifies the depth to traverse objects
 *  during merging. If this is set to false then there will be no depth limit.
 * @param {Object} [opts.throwOnCircularRef = true] Set to false to suppress
 *  errors on circular references.
 * @returns {ObjectMergeOptions} Returns an instance of ObjectMergeOptions
 *  to be used with objectMerge.
 * @example
 *  var opts = objectMerge.createOptions({
 *      depth : 2,
 *      throwOnCircularRef : false
 *  });
 *  var obj1 = {
 *      a1 : {
 *          a2 : {
 *              a3 : {}
 *          }
 *      }
 *  };
 *  var obj2 = {
 *      a1 : {
 *          a2 : {
 *              a3 : 'will not be in output'
 *          },
 *          a22 : {}
 *      }
 *  };
 *  objectMerge(opts, obj1, obj2);
 */
function createOptions(opts) {
    'use strict';
    var argz = Array.prototype.slice.call(arguments, 0);
    argz.unshift(null);
    var F = ObjectMergeOptions.bind.apply(ObjectMergeOptions, argz);
    return new F();
}
/*jslint unparam:false*/
/**
 * Merges JavaScript objects recursively without altering the objects merged.
 * @namespace Merges JavaScript objects recursively without altering the objects merged.
 * @author <a href="mailto:matthewkastor@gmail.com">Matthew Kastor</a>
 * @param {ObjectMergeOptions} [opts] An options object created by 
 *  objectMerge.createOptions. Options must be specified as the first argument
 *  and must be an object created with createOptions or else the object will
 *  not be recognized as an options object and will be merged instead.
 * @param {Object} shadows [[shadows]...] One or more objects to merge. Each
 *  argument given will be treated as an object to merge. Each object
 *  overwrites the previous objects descendant properties if the property name
 *  matches. If objects properties are objects they will be merged recursively
 *  as well.
 * @returns {Object} Returns a single merged object composed from clones of the
 *  input objects.
 * @example
 *  var objectMerge = require('object-merge');
 *  var x = {
 *      a : 'a',
 *      b : 'b',
 *      c : {
 *          d : 'd',
 *          e : 'e',
 *          f : {
 *              g : 'g'
 *          }
 *      }
 *  };
 *  var y = {
 *      a : '`a',
 *      b : '`b',
 *      c : {
 *          d : '`d'
 *      }
 *  };
 *  var z = {
 *      a : {
 *          b : '``b'
 *      },
 *      fun : function foo () {
 *          return 'foo';
 *      },
 *      aps : Array.prototype.slice
 *  };
 *  var out = objectMerge(x, y, z);
 *  // out.a will be {
 *  //         b : '``b'
 *  //     }
 *  // out.b will be '`b'
 *  // out.c will be {
 *  //         d : '`d',
 *  //         e : 'e',
 *  //         f : {
 *  //             g : 'g'
 *  //         }
 *  //     }
 *  // out.fun will be a clone of z.fun
 *  // out.aps will be equal to z.aps
 */
function objectMerge(shadows) {
    'use strict';
    var objectForeach = _dereq_('object-foreach');
    var cloneFunction = _dereq_('clone-function');
    // this is the queue of visited objects / properties.
    var visited = [];
    // various merge options
    var options = {};
    // gets the sequential trailing objects from array.
    function getShadowObjects(shadows) {
        var out = shadows.reduce(function (collector, shadow) {
                if (shadow instanceof Object) {
                    collector.push(shadow);
                } else {
                    collector = [];
                }
                return collector;
            }, []);
        return out;
    }
    // gets either a new object of the proper type or the last primitive value
    function getOutputObject(shadows) {
        var out;
        var lastShadow = shadows[shadows.length - 1];
        if (lastShadow instanceof Array) {
            out = [];
        } else if (lastShadow instanceof Function) {
            try {
                out = cloneFunction(lastShadow);
            } catch (e) {
                throw new Error(e.message);
            }
        } else if (lastShadow instanceof Object) {
            out = {};
        } else {
            // lastShadow is a primitive value;
            out = lastShadow;
        }
        return out;
    }
    // checks for circular references
    function circularReferenceCheck(shadows) {
        // if any of the current objects to process exist in the queue
        // then throw an error.
        shadows.forEach(function (item) {
            if (item instanceof Object && visited.indexOf(item) > -1) {
                throw new Error('Circular reference error');
            }
        });
        // if none of the current objects were in the queue
        // then add references to the queue.
        visited = visited.concat(shadows);
    }
    function objectMergeRecursor(shadows, currentDepth) {
        if (options.depth !== false) {
            currentDepth = currentDepth ? currentDepth + 1 : 1;
        } else {
            currentDepth = 0;
        }
        if (options.throwOnCircularRef === true) {
            circularReferenceCheck(shadows);
        }
        var out = getOutputObject(shadows);
        /*jslint unparam: true */
        function shadowHandler(val, prop, shadow) {
            if (out[prop]) {
                out[prop] = objectMergeRecursor([
                    out[prop],
                    shadow[prop]
                ], currentDepth);
            } else {
                out[prop] = objectMergeRecursor([shadow[prop]], currentDepth);
            }
        }
        /*jslint unparam:false */
        function shadowMerger(shadow) {
            objectForeach(shadow, shadowHandler);
        }
        // short circuits case where output would be a primitive value
        // anyway.
        if (out instanceof Object && currentDepth <= options.depth) {
            // only merges trailing objects since primitives would wipe out
            // previous objects, as in merging {a:'a'}, 'a', and {b:'b'}
            // would result in {b:'b'} so the first two arguments
            // can be ignored completely.
            var relevantShadows = getShadowObjects(shadows);
            relevantShadows.forEach(shadowMerger);
        }
        return out;
    }
    // determines whether an options object was passed in and
    // uses it if present
    // ignore the jslint warning here too.
    if (arguments[0] instanceof ObjectMergeOptions) {
        options = arguments[0];
        shadows = Array.prototype.slice.call(arguments, 1);
    } else {
        options = createOptions();
        shadows = Array.prototype.slice.call(arguments, 0);
    }
    return objectMergeRecursor(shadows);
}
objectMerge.createOptions = createOptions;
module.exports = objectMerge;
},{"clone-function":1,"object-foreach":2}],4:[function(_dereq_,module,exports){
(function (global){
'use strict';

var objectMerge = _dereq_('object-merge');
var assert = function (condition, message) {
  if (!condition) {
    throw message || 'assertion failed';
  }
};

var emptyFn = function () {};
var Coordinates = _dereq_('../model/Coordinates');
var Keyboard = _dereq_('./Keyboard');
var LoopManager = _dereq_('./LoopManager');
var Stats = _dereq_('T3.Stats');
var dat = _dereq_('T3.dat');
var THREE = (typeof window !== "undefined" ? window.THREE : typeof global !== "undefined" ? global.THREE : null);
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
  config = objectMerge({
    selector: null,
    width: window.innerWidth,
    height: window.innerHeight,
    renderImmediately: true,
    injectCache: false,
    fullScreen: false,
    theme: 'dark',
    ambientConfig: {},
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
  camera.cameraControls.maxPolarAngle = Math.PI / 2 * 0.99;
  camera.cameraControls.target.set(100, 100, 100);
  // camera.cameraControls.target.set(0, 0, 0);
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

  objectMerge(gui.domElement.style, {
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
  objectMerge(stats.domElement.style, {
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
      new Coordinates(config.ambientConfig, this.theme)
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
},{"../":7,"../lib/THREEx/":11,"../model/Coordinates":14,"./Keyboard":5,"./LoopManager":6,"T3.Stats":13,"T3.dat":12,"object-merge":3}],5:[function(_dereq_,module,exports){
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
},{}],6:[function(_dereq_,module,exports){
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
},{"./Application":4}],7:[function(_dereq_,module,exports){
_dereq_('./lib/OrbitControls');

/**
 * t3
 * @namespace
 * @type {Object}
 */
var Application = _dereq_('./controller/Application');
var t3 = {
  model: {
    Coordinates: _dereq_('./model/Coordinates'),
  },
  themes: {
    dark: _dereq_('./themes/dark'),
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
},{"./controller/Application":4,"./controller/Keyboard":5,"./controller/LoopManager":6,"./lib/OrbitControls":8,"./model/Coordinates":14,"./themes/dark":15,"./themes/light":16}],8:[function(_dereq_,module,exports){
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

},{}],9:[function(_dereq_,module,exports){
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
},{}],10:[function(_dereq_,module,exports){
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
},{}],11:[function(_dereq_,module,exports){
/**
 * @name THREEx
 * three.js extensions
 * @type {Object}
 */
module.exports = {
  WindowResize: _dereq_('./WindowResize'),
  FullScreen: _dereq_('./FullScreen')
};
},{"./FullScreen":9,"./WindowResize":10}],12:[function(_dereq_,module,exports){
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
},{}],13:[function(_dereq_,module,exports){
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
},{}],14:[function(_dereq_,module,exports){
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
  },

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
    mesh: this.drawGrid({size:10000,scale:0.01}),
    visible: config.gridX !== undefined ? config.gridX : true
  };

  /**
   * GridYZ object, the mesh representing the axes is under this object
   * under `mesh`
   * @type {Object}
   */  
  this.gridY = {
    name: 'YZ grid',
    mesh: this.drawGrid({size:10000,scale:0.01, orientation:"y"}),
    visible: config.gridY !== undefined ? config.gridY : false
  };
  
  /**
   * GridXY object, the mesh representing the axes is under this object
   * under `mesh`
   * @type {Object}
   */
  this.gridZ = {
    name: 'XY grid',
    mesh: this.drawGrid({size:10000,scale:0.01, orientation:"z"}),
    visible: config.gridZ !== undefined ? config.gridZ : false
  };

  Coordinates.prototype.init.call(this, config);
};

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
          .onFinishChange(function (newValue) {
            v.mesh.visible = newValue;
          });
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
  var size = params.size !== undefined ? params.size:100;
  var scale = params.scale !== undefined ? params.scale:0.1;
  var color = params.color !== undefined ? params.color:'#505050';
  var orientation = params.orientation !== undefined ? params.orientation:"x";
  var grid = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size, size * scale, size * scale),
    new THREE.MeshBasicMaterial({
      color: color,
      wireframe: true
    })
  );
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
  var offset = params.offset !== undefined ? params.offset:-0.2;

  var ground = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshBasicMaterial({
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
  var axisLength = params.axisLength !== undefined ? params.axisLength:11;
  var axisTess = params.axisTess !== undefined ? params.axisTess:48;

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
},{}],15:[function(_dereq_,module,exports){
/**
 * @module  themes/dark
 */

/**
 * Dark theme
 * @type {Object}
 */
module.exports = {
	clearColor: 0x595959,
	fogColor: 0x595959,
  groundColor: 0x393939
};
},{}],16:[function(_dereq_,module,exports){
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
},{}]},{},[7])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tYXVyaWNpby9Eb2N1bWVudHMvd2ViL21hdXJpenp6aW8ubWUvVDMvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9tYXVyaWNpby9Eb2N1bWVudHMvd2ViL21hdXJpenp6aW8ubWUvVDMvbm9kZV9tb2R1bGVzL29iamVjdC1tZXJnZS9ub2RlX21vZHVsZXMvY2xvbmUtZnVuY3Rpb24vc3JjL2Nsb25lLWZ1bmN0aW9uLmpzIiwiL1VzZXJzL21hdXJpY2lvL0RvY3VtZW50cy93ZWIvbWF1cml6enppby5tZS9UMy9ub2RlX21vZHVsZXMvb2JqZWN0LW1lcmdlL25vZGVfbW9kdWxlcy9vYmplY3QtZm9yZWFjaC9zcmMvb2JqZWN0LWZvcmVhY2guanMiLCIvVXNlcnMvbWF1cmljaW8vRG9jdW1lbnRzL3dlYi9tYXVyaXp6emlvLm1lL1QzL25vZGVfbW9kdWxlcy9vYmplY3QtbWVyZ2Uvc3JjL29iamVjdC1tZXJnZS5qcyIsIi9Vc2Vycy9tYXVyaWNpby9Eb2N1bWVudHMvd2ViL21hdXJpenp6aW8ubWUvVDMvc3JjL2NvbnRyb2xsZXIvQXBwbGljYXRpb24uanMiLCIvVXNlcnMvbWF1cmljaW8vRG9jdW1lbnRzL3dlYi9tYXVyaXp6emlvLm1lL1QzL3NyYy9jb250cm9sbGVyL0tleWJvYXJkLmpzIiwiL1VzZXJzL21hdXJpY2lvL0RvY3VtZW50cy93ZWIvbWF1cml6enppby5tZS9UMy9zcmMvY29udHJvbGxlci9Mb29wTWFuYWdlci5qcyIsIi9Vc2Vycy9tYXVyaWNpby9Eb2N1bWVudHMvd2ViL21hdXJpenp6aW8ubWUvVDMvc3JjL2luZGV4LmpzIiwiL1VzZXJzL21hdXJpY2lvL0RvY3VtZW50cy93ZWIvbWF1cml6enppby5tZS9UMy9zcmMvbGliL09yYml0Q29udHJvbHMuanMiLCIvVXNlcnMvbWF1cmljaW8vRG9jdW1lbnRzL3dlYi9tYXVyaXp6emlvLm1lL1QzL3NyYy9saWIvVEhSRUV4L0Z1bGxTY3JlZW4uanMiLCIvVXNlcnMvbWF1cmljaW8vRG9jdW1lbnRzL3dlYi9tYXVyaXp6emlvLm1lL1QzL3NyYy9saWIvVEhSRUV4L1dpbmRvd1Jlc2l6ZS5qcyIsIi9Vc2Vycy9tYXVyaWNpby9Eb2N1bWVudHMvd2ViL21hdXJpenp6aW8ubWUvVDMvc3JjL2xpYi9USFJFRXgvaW5kZXguanMiLCIvVXNlcnMvbWF1cmljaW8vRG9jdW1lbnRzL3dlYi9tYXVyaXp6emlvLm1lL1QzL3NyYy9saWIvZGF0Lmd1aS5taW4uanMiLCIvVXNlcnMvbWF1cmljaW8vRG9jdW1lbnRzL3dlYi9tYXVyaXp6emlvLm1lL1QzL3NyYy9saWIvc3RhdHMubWluLmpzIiwiL1VzZXJzL21hdXJpY2lvL0RvY3VtZW50cy93ZWIvbWF1cml6enppby5tZS9UMy9zcmMvbW9kZWwvQ29vcmRpbmF0ZXMuanMiLCIvVXNlcnMvbWF1cmljaW8vRG9jdW1lbnRzL3dlYi9tYXVyaXp6emlvLm1lL1QzL3NyYy90aGVtZXMvZGFyay5qcyIsIi9Vc2Vycy9tYXVyaWNpby9Eb2N1bWVudHMvd2ViL21hdXJpenp6aW8ubWUvVDMvc3JjL3RoZW1lcy9saWdodC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcm9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxyXG5MaWNlbnNlIGdwbC0zLjAgaHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2dwbC0zLjAtc3RhbmRhbG9uZS5odG1sXHJcbiovXHJcbi8qanNsaW50XHJcbiAgICBldmlsOiB0cnVlLFxyXG4gICAgbm9kZTogdHJ1ZVxyXG4qL1xyXG4ndXNlIHN0cmljdCc7XHJcbi8qKlxyXG4gKiBDbG9uZXMgbm9uIG5hdGl2ZSBKYXZhU2NyaXB0IGZ1bmN0aW9ucywgb3IgcmVmZXJlbmNlcyBuYXRpdmUgZnVuY3Rpb25zLlxyXG4gKiBAYXV0aG9yIDxhIGhyZWY9XCJtYWlsdG86bWF0dGhld2thc3RvckBnbWFpbC5jb21cIj5NYXR0aGV3IEthc3RvcjwvYT5cclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY2xvbmUuXHJcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyBhIGNsb25lIG9mIHRoZSBub24gbmF0aXZlIGZ1bmN0aW9uLCBvciBhXHJcbiAqICByZWZlcmVuY2UgdG8gdGhlIG5hdGl2ZSBmdW5jdGlvbi5cclxuICovXHJcbmZ1bmN0aW9uIGNsb25lRnVuY3Rpb24oZnVuYykge1xyXG4gICAgdmFyIG91dCwgc3RyO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBzdHIgPSBmdW5jLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgaWYgKC9cXFtuYXRpdmUgY29kZVxcXS8udGVzdChzdHIpKSB7XHJcbiAgICAgICAgICAgIG91dCA9IGZ1bmM7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgb3V0ID0gZXZhbCgnKGZ1bmN0aW9uKCl7cmV0dXJuICcgKyBzdHIgKyAnfSgpKTsnKTtcclxuICAgICAgICB9XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGUubWVzc2FnZSArICdcXHJcXG5cXHJcXG4nICsgc3RyKTtcclxuICAgIH1cclxuICAgIHJldHVybiBvdXQ7XHJcbn1cclxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZUZ1bmN0aW9uOyIsIi8qKlxyXG4gKiBFeGVjdXRlcyBhIGZ1bmN0aW9uIG9uIGVhY2ggb2YgYW4gb2JqZWN0cyBvd24gZW51bWVyYWJsZSBwcm9wZXJ0aWVzLiBUaGVcclxuICogIGNhbGxiYWNrIGZ1bmN0aW9uIHdpbGwgcmVjZWl2ZSB0aHJlZSBhcmd1bWVudHM6IHRoZSB2YWx1ZSBvZiB0aGUgY3VycmVudFxyXG4gKiAgcHJvcGVydHksIHRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSwgYW5kIHRoZSBvYmplY3QgYmVpbmcgcHJvY2Vzc2VkLiBUaGlzIGlzXHJcbiAqICByb3VnaGx5IGVxdWl2YWxlbnQgdG8gdGhlIHNpZ25hdHVyZSBmb3IgY2FsbGJhY2tzIHRvXHJcbiAqICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5cclxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIGFjdCBvbi5cclxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRvIGV4ZWN1dGUuXHJcbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGdpdmVuIG9iamVjdC5cclxuICovXHJcbmZ1bmN0aW9uIG9iamVjdEZvcmVhY2gob2JqLCBjYWxsYmFjaykge1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2goZnVuY3Rpb24gKHByb3ApIHtcclxuICAgICAgICBjYWxsYmFjayhvYmpbcHJvcF0sIHByb3AsIG9iaik7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBvYmo7XHJcbn07XHJcbm1vZHVsZS5leHBvcnRzID0gb2JqZWN0Rm9yZWFjaDsiLCIvKlxyXG5MaWNlbnNlIGdwbC0zLjAgaHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2dwbC0zLjAtc3RhbmRhbG9uZS5odG1sXHJcbiovXHJcbi8qanNsaW50XHJcbiAgICB3aGl0ZTogdHJ1ZSxcclxuICAgIHZhcnM6IHRydWUsXHJcbiAgICBub2RlOiB0cnVlXHJcbiovXHJcbmZ1bmN0aW9uIE9iamVjdE1lcmdlT3B0aW9ucyhvcHRzKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICBvcHRzID0gb3B0cyB8fCB7fTtcclxuICAgIHRoaXMuZGVwdGggPSBvcHRzLmRlcHRoIHx8IGZhbHNlO1xyXG4gICAgLy8gY2lyY3VsYXIgcmVmIGNoZWNrIGlzIHRydWUgdW5sZXNzIGV4cGxpY2l0bHkgc2V0IHRvIGZhbHNlXHJcbiAgICAvLyBpZ25vcmUgdGhlIGpzbGludCB3YXJuaW5nIGhlcmUsIGl0J3MgcG9pbnRsZXNzLlxyXG4gICAgdGhpcy50aHJvd09uQ2lyY3VsYXJSZWYgPSAndGhyb3dPbkNpcmN1bGFyUmVmJyBpbiBvcHRzICYmIG9wdHMudGhyb3dPbkNpcmN1bGFyUmVmID09PSBmYWxzZSA/IGZhbHNlIDogdHJ1ZTtcclxufVxyXG4vKmpzbGludCB1bnBhcmFtOnRydWUqL1xyXG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyBvcHRpb25zIG9iamVjdCBzdWl0YWJsZSBmb3IgdXNlIHdpdGggb2JqZWN0TWVyZ2UuXHJcbiAqIEBtZW1iZXJPZiBvYmplY3RNZXJnZVxyXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdHNdIEFuIG9iamVjdCBzcGVjaWZ5aW5nIHRoZSBvcHRpb25zLlxyXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdHMuZGVwdGggPSBmYWxzZV0gU3BlY2lmaWVzIHRoZSBkZXB0aCB0byB0cmF2ZXJzZSBvYmplY3RzXHJcbiAqICBkdXJpbmcgbWVyZ2luZy4gSWYgdGhpcyBpcyBzZXQgdG8gZmFsc2UgdGhlbiB0aGVyZSB3aWxsIGJlIG5vIGRlcHRoIGxpbWl0LlxyXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdHMudGhyb3dPbkNpcmN1bGFyUmVmID0gdHJ1ZV0gU2V0IHRvIGZhbHNlIHRvIHN1cHByZXNzXHJcbiAqICBlcnJvcnMgb24gY2lyY3VsYXIgcmVmZXJlbmNlcy5cclxuICogQHJldHVybnMge09iamVjdE1lcmdlT3B0aW9uc30gUmV0dXJucyBhbiBpbnN0YW5jZSBvZiBPYmplY3RNZXJnZU9wdGlvbnNcclxuICogIHRvIGJlIHVzZWQgd2l0aCBvYmplY3RNZXJnZS5cclxuICogQGV4YW1wbGVcclxuICogIHZhciBvcHRzID0gb2JqZWN0TWVyZ2UuY3JlYXRlT3B0aW9ucyh7XHJcbiAqICAgICAgZGVwdGggOiAyLFxyXG4gKiAgICAgIHRocm93T25DaXJjdWxhclJlZiA6IGZhbHNlXHJcbiAqICB9KTtcclxuICogIHZhciBvYmoxID0ge1xyXG4gKiAgICAgIGExIDoge1xyXG4gKiAgICAgICAgICBhMiA6IHtcclxuICogICAgICAgICAgICAgIGEzIDoge31cclxuICogICAgICAgICAgfVxyXG4gKiAgICAgIH1cclxuICogIH07XHJcbiAqICB2YXIgb2JqMiA9IHtcclxuICogICAgICBhMSA6IHtcclxuICogICAgICAgICAgYTIgOiB7XHJcbiAqICAgICAgICAgICAgICBhMyA6ICd3aWxsIG5vdCBiZSBpbiBvdXRwdXQnXHJcbiAqICAgICAgICAgIH0sXHJcbiAqICAgICAgICAgIGEyMiA6IHt9XHJcbiAqICAgICAgfVxyXG4gKiAgfTtcclxuICogIG9iamVjdE1lcmdlKG9wdHMsIG9iajEsIG9iajIpO1xyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlT3B0aW9ucyhvcHRzKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICB2YXIgYXJneiA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCk7XHJcbiAgICBhcmd6LnVuc2hpZnQobnVsbCk7XHJcbiAgICB2YXIgRiA9IE9iamVjdE1lcmdlT3B0aW9ucy5iaW5kLmFwcGx5KE9iamVjdE1lcmdlT3B0aW9ucywgYXJneik7XHJcbiAgICByZXR1cm4gbmV3IEYoKTtcclxufVxyXG4vKmpzbGludCB1bnBhcmFtOmZhbHNlKi9cclxuLyoqXHJcbiAqIE1lcmdlcyBKYXZhU2NyaXB0IG9iamVjdHMgcmVjdXJzaXZlbHkgd2l0aG91dCBhbHRlcmluZyB0aGUgb2JqZWN0cyBtZXJnZWQuXHJcbiAqIEBuYW1lc3BhY2UgTWVyZ2VzIEphdmFTY3JpcHQgb2JqZWN0cyByZWN1cnNpdmVseSB3aXRob3V0IGFsdGVyaW5nIHRoZSBvYmplY3RzIG1lcmdlZC5cclxuICogQGF1dGhvciA8YSBocmVmPVwibWFpbHRvOm1hdHRoZXdrYXN0b3JAZ21haWwuY29tXCI+TWF0dGhldyBLYXN0b3I8L2E+XHJcbiAqIEBwYXJhbSB7T2JqZWN0TWVyZ2VPcHRpb25zfSBbb3B0c10gQW4gb3B0aW9ucyBvYmplY3QgY3JlYXRlZCBieSBcclxuICogIG9iamVjdE1lcmdlLmNyZWF0ZU9wdGlvbnMuIE9wdGlvbnMgbXVzdCBiZSBzcGVjaWZpZWQgYXMgdGhlIGZpcnN0IGFyZ3VtZW50XHJcbiAqICBhbmQgbXVzdCBiZSBhbiBvYmplY3QgY3JlYXRlZCB3aXRoIGNyZWF0ZU9wdGlvbnMgb3IgZWxzZSB0aGUgb2JqZWN0IHdpbGxcclxuICogIG5vdCBiZSByZWNvZ25pemVkIGFzIGFuIG9wdGlvbnMgb2JqZWN0IGFuZCB3aWxsIGJlIG1lcmdlZCBpbnN0ZWFkLlxyXG4gKiBAcGFyYW0ge09iamVjdH0gc2hhZG93cyBbW3NoYWRvd3NdLi4uXSBPbmUgb3IgbW9yZSBvYmplY3RzIHRvIG1lcmdlLiBFYWNoXHJcbiAqICBhcmd1bWVudCBnaXZlbiB3aWxsIGJlIHRyZWF0ZWQgYXMgYW4gb2JqZWN0IHRvIG1lcmdlLiBFYWNoIG9iamVjdFxyXG4gKiAgb3ZlcndyaXRlcyB0aGUgcHJldmlvdXMgb2JqZWN0cyBkZXNjZW5kYW50IHByb3BlcnRpZXMgaWYgdGhlIHByb3BlcnR5IG5hbWVcclxuICogIG1hdGNoZXMuIElmIG9iamVjdHMgcHJvcGVydGllcyBhcmUgb2JqZWN0cyB0aGV5IHdpbGwgYmUgbWVyZ2VkIHJlY3Vyc2l2ZWx5XHJcbiAqICBhcyB3ZWxsLlxyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGEgc2luZ2xlIG1lcmdlZCBvYmplY3QgY29tcG9zZWQgZnJvbSBjbG9uZXMgb2YgdGhlXHJcbiAqICBpbnB1dCBvYmplY3RzLlxyXG4gKiBAZXhhbXBsZVxyXG4gKiAgdmFyIG9iamVjdE1lcmdlID0gcmVxdWlyZSgnb2JqZWN0LW1lcmdlJyk7XHJcbiAqICB2YXIgeCA9IHtcclxuICogICAgICBhIDogJ2EnLFxyXG4gKiAgICAgIGIgOiAnYicsXHJcbiAqICAgICAgYyA6IHtcclxuICogICAgICAgICAgZCA6ICdkJyxcclxuICogICAgICAgICAgZSA6ICdlJyxcclxuICogICAgICAgICAgZiA6IHtcclxuICogICAgICAgICAgICAgIGcgOiAnZydcclxuICogICAgICAgICAgfVxyXG4gKiAgICAgIH1cclxuICogIH07XHJcbiAqICB2YXIgeSA9IHtcclxuICogICAgICBhIDogJ2BhJyxcclxuICogICAgICBiIDogJ2BiJyxcclxuICogICAgICBjIDoge1xyXG4gKiAgICAgICAgICBkIDogJ2BkJ1xyXG4gKiAgICAgIH1cclxuICogIH07XHJcbiAqICB2YXIgeiA9IHtcclxuICogICAgICBhIDoge1xyXG4gKiAgICAgICAgICBiIDogJ2BgYidcclxuICogICAgICB9LFxyXG4gKiAgICAgIGZ1biA6IGZ1bmN0aW9uIGZvbyAoKSB7XHJcbiAqICAgICAgICAgIHJldHVybiAnZm9vJztcclxuICogICAgICB9LFxyXG4gKiAgICAgIGFwcyA6IEFycmF5LnByb3RvdHlwZS5zbGljZVxyXG4gKiAgfTtcclxuICogIHZhciBvdXQgPSBvYmplY3RNZXJnZSh4LCB5LCB6KTtcclxuICogIC8vIG91dC5hIHdpbGwgYmUge1xyXG4gKiAgLy8gICAgICAgICBiIDogJ2BgYidcclxuICogIC8vICAgICB9XHJcbiAqICAvLyBvdXQuYiB3aWxsIGJlICdgYidcclxuICogIC8vIG91dC5jIHdpbGwgYmUge1xyXG4gKiAgLy8gICAgICAgICBkIDogJ2BkJyxcclxuICogIC8vICAgICAgICAgZSA6ICdlJyxcclxuICogIC8vICAgICAgICAgZiA6IHtcclxuICogIC8vICAgICAgICAgICAgIGcgOiAnZydcclxuICogIC8vICAgICAgICAgfVxyXG4gKiAgLy8gICAgIH1cclxuICogIC8vIG91dC5mdW4gd2lsbCBiZSBhIGNsb25lIG9mIHouZnVuXHJcbiAqICAvLyBvdXQuYXBzIHdpbGwgYmUgZXF1YWwgdG8gei5hcHNcclxuICovXHJcbmZ1bmN0aW9uIG9iamVjdE1lcmdlKHNoYWRvd3MpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIHZhciBvYmplY3RGb3JlYWNoID0gcmVxdWlyZSgnb2JqZWN0LWZvcmVhY2gnKTtcclxuICAgIHZhciBjbG9uZUZ1bmN0aW9uID0gcmVxdWlyZSgnY2xvbmUtZnVuY3Rpb24nKTtcclxuICAgIC8vIHRoaXMgaXMgdGhlIHF1ZXVlIG9mIHZpc2l0ZWQgb2JqZWN0cyAvIHByb3BlcnRpZXMuXHJcbiAgICB2YXIgdmlzaXRlZCA9IFtdO1xyXG4gICAgLy8gdmFyaW91cyBtZXJnZSBvcHRpb25zXHJcbiAgICB2YXIgb3B0aW9ucyA9IHt9O1xyXG4gICAgLy8gZ2V0cyB0aGUgc2VxdWVudGlhbCB0cmFpbGluZyBvYmplY3RzIGZyb20gYXJyYXkuXHJcbiAgICBmdW5jdGlvbiBnZXRTaGFkb3dPYmplY3RzKHNoYWRvd3MpIHtcclxuICAgICAgICB2YXIgb3V0ID0gc2hhZG93cy5yZWR1Y2UoZnVuY3Rpb24gKGNvbGxlY3Rvciwgc2hhZG93KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2hhZG93IGluc3RhbmNlb2YgT2JqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29sbGVjdG9yLnB1c2goc2hhZG93KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29sbGVjdG9yID0gW107XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY29sbGVjdG9yO1xyXG4gICAgICAgICAgICB9LCBbXSk7XHJcbiAgICAgICAgcmV0dXJuIG91dDtcclxuICAgIH1cclxuICAgIC8vIGdldHMgZWl0aGVyIGEgbmV3IG9iamVjdCBvZiB0aGUgcHJvcGVyIHR5cGUgb3IgdGhlIGxhc3QgcHJpbWl0aXZlIHZhbHVlXHJcbiAgICBmdW5jdGlvbiBnZXRPdXRwdXRPYmplY3Qoc2hhZG93cykge1xyXG4gICAgICAgIHZhciBvdXQ7XHJcbiAgICAgICAgdmFyIGxhc3RTaGFkb3cgPSBzaGFkb3dzW3NoYWRvd3MubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgaWYgKGxhc3RTaGFkb3cgaW5zdGFuY2VvZiBBcnJheSkge1xyXG4gICAgICAgICAgICBvdXQgPSBbXTtcclxuICAgICAgICB9IGVsc2UgaWYgKGxhc3RTaGFkb3cgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgb3V0ID0gY2xvbmVGdW5jdGlvbihsYXN0U2hhZG93KTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGUubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKGxhc3RTaGFkb3cgaW5zdGFuY2VvZiBPYmplY3QpIHtcclxuICAgICAgICAgICAgb3V0ID0ge307XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gbGFzdFNoYWRvdyBpcyBhIHByaW1pdGl2ZSB2YWx1ZTtcclxuICAgICAgICAgICAgb3V0ID0gbGFzdFNoYWRvdztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG91dDtcclxuICAgIH1cclxuICAgIC8vIGNoZWNrcyBmb3IgY2lyY3VsYXIgcmVmZXJlbmNlc1xyXG4gICAgZnVuY3Rpb24gY2lyY3VsYXJSZWZlcmVuY2VDaGVjayhzaGFkb3dzKSB7XHJcbiAgICAgICAgLy8gaWYgYW55IG9mIHRoZSBjdXJyZW50IG9iamVjdHMgdG8gcHJvY2VzcyBleGlzdCBpbiB0aGUgcXVldWVcclxuICAgICAgICAvLyB0aGVuIHRocm93IGFuIGVycm9yLlxyXG4gICAgICAgIHNoYWRvd3MuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICBpZiAoaXRlbSBpbnN0YW5jZW9mIE9iamVjdCAmJiB2aXNpdGVkLmluZGV4T2YoaXRlbSkgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDaXJjdWxhciByZWZlcmVuY2UgZXJyb3InKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIGlmIG5vbmUgb2YgdGhlIGN1cnJlbnQgb2JqZWN0cyB3ZXJlIGluIHRoZSBxdWV1ZVxyXG4gICAgICAgIC8vIHRoZW4gYWRkIHJlZmVyZW5jZXMgdG8gdGhlIHF1ZXVlLlxyXG4gICAgICAgIHZpc2l0ZWQgPSB2aXNpdGVkLmNvbmNhdChzaGFkb3dzKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIG9iamVjdE1lcmdlUmVjdXJzb3Ioc2hhZG93cywgY3VycmVudERlcHRoKSB7XHJcbiAgICAgICAgaWYgKG9wdGlvbnMuZGVwdGggIT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnREZXB0aCA9IGN1cnJlbnREZXB0aCA/IGN1cnJlbnREZXB0aCArIDEgOiAxO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnREZXB0aCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvcHRpb25zLnRocm93T25DaXJjdWxhclJlZiA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBjaXJjdWxhclJlZmVyZW5jZUNoZWNrKHNoYWRvd3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgb3V0ID0gZ2V0T3V0cHV0T2JqZWN0KHNoYWRvd3MpO1xyXG4gICAgICAgIC8qanNsaW50IHVucGFyYW06IHRydWUgKi9cclxuICAgICAgICBmdW5jdGlvbiBzaGFkb3dIYW5kbGVyKHZhbCwgcHJvcCwgc2hhZG93KSB7XHJcbiAgICAgICAgICAgIGlmIChvdXRbcHJvcF0pIHtcclxuICAgICAgICAgICAgICAgIG91dFtwcm9wXSA9IG9iamVjdE1lcmdlUmVjdXJzb3IoW1xyXG4gICAgICAgICAgICAgICAgICAgIG91dFtwcm9wXSxcclxuICAgICAgICAgICAgICAgICAgICBzaGFkb3dbcHJvcF1cclxuICAgICAgICAgICAgICAgIF0sIGN1cnJlbnREZXB0aCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBvdXRbcHJvcF0gPSBvYmplY3RNZXJnZVJlY3Vyc29yKFtzaGFkb3dbcHJvcF1dLCBjdXJyZW50RGVwdGgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qanNsaW50IHVucGFyYW06ZmFsc2UgKi9cclxuICAgICAgICBmdW5jdGlvbiBzaGFkb3dNZXJnZXIoc2hhZG93KSB7XHJcbiAgICAgICAgICAgIG9iamVjdEZvcmVhY2goc2hhZG93LCBzaGFkb3dIYW5kbGVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gc2hvcnQgY2lyY3VpdHMgY2FzZSB3aGVyZSBvdXRwdXQgd291bGQgYmUgYSBwcmltaXRpdmUgdmFsdWVcclxuICAgICAgICAvLyBhbnl3YXkuXHJcbiAgICAgICAgaWYgKG91dCBpbnN0YW5jZW9mIE9iamVjdCAmJiBjdXJyZW50RGVwdGggPD0gb3B0aW9ucy5kZXB0aCkge1xyXG4gICAgICAgICAgICAvLyBvbmx5IG1lcmdlcyB0cmFpbGluZyBvYmplY3RzIHNpbmNlIHByaW1pdGl2ZXMgd291bGQgd2lwZSBvdXRcclxuICAgICAgICAgICAgLy8gcHJldmlvdXMgb2JqZWN0cywgYXMgaW4gbWVyZ2luZyB7YTonYSd9LCAnYScsIGFuZCB7YjonYid9XHJcbiAgICAgICAgICAgIC8vIHdvdWxkIHJlc3VsdCBpbiB7YjonYid9IHNvIHRoZSBmaXJzdCB0d28gYXJndW1lbnRzXHJcbiAgICAgICAgICAgIC8vIGNhbiBiZSBpZ25vcmVkIGNvbXBsZXRlbHkuXHJcbiAgICAgICAgICAgIHZhciByZWxldmFudFNoYWRvd3MgPSBnZXRTaGFkb3dPYmplY3RzKHNoYWRvd3MpO1xyXG4gICAgICAgICAgICByZWxldmFudFNoYWRvd3MuZm9yRWFjaChzaGFkb3dNZXJnZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb3V0O1xyXG4gICAgfVxyXG4gICAgLy8gZGV0ZXJtaW5lcyB3aGV0aGVyIGFuIG9wdGlvbnMgb2JqZWN0IHdhcyBwYXNzZWQgaW4gYW5kXHJcbiAgICAvLyB1c2VzIGl0IGlmIHByZXNlbnRcclxuICAgIC8vIGlnbm9yZSB0aGUganNsaW50IHdhcm5pbmcgaGVyZSB0b28uXHJcbiAgICBpZiAoYXJndW1lbnRzWzBdIGluc3RhbmNlb2YgT2JqZWN0TWVyZ2VPcHRpb25zKSB7XHJcbiAgICAgICAgb3B0aW9ucyA9IGFyZ3VtZW50c1swXTtcclxuICAgICAgICBzaGFkb3dzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgb3B0aW9ucyA9IGNyZWF0ZU9wdGlvbnMoKTtcclxuICAgICAgICBzaGFkb3dzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcclxuICAgIH1cclxuICAgIHJldHVybiBvYmplY3RNZXJnZVJlY3Vyc29yKHNoYWRvd3MpO1xyXG59XHJcbm9iamVjdE1lcmdlLmNyZWF0ZU9wdGlvbnMgPSBjcmVhdGVPcHRpb25zO1xyXG5tb2R1bGUuZXhwb3J0cyA9IG9iamVjdE1lcmdlOyIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIG9iamVjdE1lcmdlID0gcmVxdWlyZSgnb2JqZWN0LW1lcmdlJyk7XG52YXIgYXNzZXJ0ID0gZnVuY3Rpb24gKGNvbmRpdGlvbiwgbWVzc2FnZSkge1xuICBpZiAoIWNvbmRpdGlvbikge1xuICAgIHRocm93IG1lc3NhZ2UgfHwgJ2Fzc2VydGlvbiBmYWlsZWQnO1xuICB9XG59O1xuXG52YXIgZW1wdHlGbiA9IGZ1bmN0aW9uICgpIHt9O1xudmFyIENvb3JkaW5hdGVzID0gcmVxdWlyZSgnLi4vbW9kZWwvQ29vcmRpbmF0ZXMnKTtcbnZhciBLZXlib2FyZCA9IHJlcXVpcmUoJy4vS2V5Ym9hcmQnKTtcbnZhciBMb29wTWFuYWdlciA9IHJlcXVpcmUoJy4vTG9vcE1hbmFnZXInKTtcbnZhciBTdGF0cyA9IHJlcXVpcmUoJ1QzLlN0YXRzJyk7XG52YXIgZGF0ID0gcmVxdWlyZSgnVDMuZGF0Jyk7XG52YXIgVEhSRUUgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5USFJFRSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuVEhSRUUgOiBudWxsKTtcbnZhciBUSFJFRXggPSByZXF1aXJlKCcuLi9saWIvVEhSRUV4LycpO1xuLyoqXG4gKiBAbW9kdWxlIGNvbnRyb2xsZXIvQXBwbGljYXRpb25cbiAqL1xuXG4vKipcbiAqIEVhY2ggaW5zdGFuY2UgY29udHJvbHMgb25lIGVsZW1lbnQgb2YgdGhlIERPTSwgYmVzaWRlcyBjcmVhdGluZ1xuICogdGhlIGNhbnZhcyBmb3IgdGhlIHRocmVlLmpzIGFwcCBpdCBjcmVhdGVzIGEgZGF0Lmd1aSBpbnN0YW5jZVxuICogKHRvIGNvbnRyb2wgb2JqZWN0cyBvZiB0aGUgYXBwIHdpdGggYSBndWkpIGFuZCBhIFN0YXRzIGluc3RhbmNlXG4gKiAodG8gdmlldyB0aGUgY3VycmVudCBmcmFtZXJhdGUpXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIEFuIG9iamVjdCBjb250YWluaW5nIHRoZSBmb2xsb3dpbmc6XG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvbmZpZy5pZD1udWxsXSBUaGUgaWQgb2YgdGhlIERPTSBlbGVtZW50IHRvIGluamVjdCB0aGUgZWxlbWVudHMgdG9cbiAqIEBwYXJhbSB7bnVtYmVyfSBbY29uZmlnLndpZHRoPXdpbmRvdy5pbm5lcldpZHRoXVxuICogVGhlIHdpZHRoIG9mIHRoZSBjYW52YXNcbiAqIEBwYXJhbSB7bnVtYmVyfSBbY29uZmlnLmhlaWdodD13aW5kb3cuaW5uZXJIZWlnaHRdXG4gKiBUaGUgaGVpZ2h0IG9mIHRoZSBjYW52YXNcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NvbmZpZy5yZW5kZXJJbW1lZGlhdGVseT10cnVlXVxuICogRmFsc2UgdG8gZGlzYWJsZSB0aGUgZ2FtZSBsb29wIHdoZW4gdGhlIGFwcGxpY2F0aW9uIHN0YXJ0cywgaWZcbiAqIHlvdSB3YW50IHRvIHJlc3VtZSB0aGUgbG9vcCBjYWxsIGBhcHBsaWNhdGlvbi5sb29wTWFuYWdlci5zdGFydCgpYFxuICogQHBhcmFtIHtib29sZWFufSBbY29uZmlnLmluamVjdENhY2hlPWZhbHNlXVxuICogVHJ1ZSB0byBhZGQgYSB3cmFwcGVyIG92ZXIgYFRIUkVFLk9iamVjdDNELnByb3RvdHlwZS5hZGRgIGFuZFxuICogYFRIUkVFLk9iamVjdDNELnByb3RvdHlwZS5yZW1vdmVgIHNvIHRoYXQgaXQgY2F0Y2hlcyB0aGUgbGFzdCBlbGVtZW50XG4gKiBhbmQgcGVyZm9ybSBhZGRpdGlvbmFsIG9wZXJhdGlvbnMgb3ZlciBpdCwgd2l0aCB0aGlzIG1lY2hhbmlzbVxuICogd2UgYWxsb3cgdGhlIGFwcGxpY2F0aW9uIHRvIGhhdmUgYW4gaW50ZXJuYWwgY2FjaGUgb2YgdGhlIGVsZW1lbnRzIG9mXG4gKiB0aGUgYXBwbGljYXRpb25cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NvbmZpZy5mdWxsU2NyZWVuPWZhbHNlXVxuICogVHJ1ZSB0byBtYWtlIHRoaXMgYXBwIGZ1bGxzY3JlZW4gYWRkaW5nIGFkZGl0aW9uYWwgc3VwcG9ydCBmb3JcbiAqIHdpbmRvdyByZXNpemUgZXZlbnRzXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvbmZpZy50aGVtZT0nZGFyayddXG4gKiBUaGVtZSB1c2VkIGluIHRoZSBkZWZhdWx0IHNjZW5lLCBpdCBjYW4gYmUgYGxpZ2h0YCBvciBgZGFya2BcbiAqIEBwYXJhbSB7b2JqZWN0fSBbY29uZmlnLmFtYmllbnRDb25maWc9e31dXG4gKiBBZGRpdGlvbmFsIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBhbWJpZW50LCBzZWUgdGhlIGNsYXNzIHtAbGlua1xuICogQ29vcmRpbmF0ZXN9XG4gKiBAcGFyYW0ge29iamVjdH0gW2NvbmZpZy5kZWZhdWx0U2NlbmVDb25maWc9e31dIEFkZGl0aW9uYWwgY29uZmlnXG4gKiBmb3IgdGhlIGRlZmF1bHQgc2NlbmUgY3JlYXRlZCBmb3IgdGhpcyB3b3JsZFxuICovXG5mdW5jdGlvbiBBcHBsaWNhdGlvbihjb25maWcpIHtcbiAgY29uZmlnID0gb2JqZWN0TWVyZ2Uoe1xuICAgIHNlbGVjdG9yOiBudWxsLFxuICAgIHdpZHRoOiB3aW5kb3cuaW5uZXJXaWR0aCxcbiAgICBoZWlnaHQ6IHdpbmRvdy5pbm5lckhlaWdodCxcbiAgICByZW5kZXJJbW1lZGlhdGVseTogdHJ1ZSxcbiAgICBpbmplY3RDYWNoZTogZmFsc2UsXG4gICAgZnVsbFNjcmVlbjogZmFsc2UsXG4gICAgdGhlbWU6ICdkYXJrJyxcbiAgICBhbWJpZW50Q29uZmlnOiB7fSxcbiAgICBkZWZhdWx0U2NlbmVDb25maWc6IHtcbiAgICAgIGZvZzogdHJ1ZVxuICAgIH1cbiAgfSwgY29uZmlnKTtcblxuICB0aGlzLmluaXRpYWxDb25maWcgPSBjb25maWc7XG5cbiAgLyoqXG4gICAqIFNjZW5lcyBpbiB0aGlzIHdvcmxkLCBlYWNoIHNjZW5lIHNob3VsZCBiZSBtYXBwZWQgd2l0aFxuICAgKiBhIHVuaXF1ZSBpZFxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgdGhpcy5zY2VuZXMgPSB7fTtcblxuICAvKipcbiAgICogVGhlIGFjdGl2ZSBzY2VuZSBvZiB0aGlzIHdvcmxkXG4gICAqIEB0eXBlIHtUSFJFRS5TY2VuZX1cbiAgICovXG4gIHRoaXMuYWN0aXZlU2NlbmUgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBSZWZlcmVuY2UgdG8gdGhlIGNhbWVyYXMgdXNlZCBpbiB0aGlzIHdvcmxkXG4gICAqIEB0eXBlIHtBcnJheX1cbiAgICovXG4gIHRoaXMuY2FtZXJhcyA9IHt9O1xuXG4gIC8qKlxuICAgKiBUaGUgd29ybGQgY2FuIGhhdmUgbWFueSBjYW1lcmFzLCBzbyB0aGUgdGhpcyBpcyBhIHJlZmVyZW5jZSB0b1xuICAgKiB0aGUgYWN0aXZlIGNhbWVyYSB0aGF0J3MgYmVpbmcgdXNlZCByaWdodCBub3dcbiAgICogQHR5cGUge1QzLm1vZGVsLkNhbWVyYX1cbiAgICovXG4gIHRoaXMuYWN0aXZlQ2FtZXJhID0gbnVsbDtcblxuICAvKipcbiAgICogVEhSRUUgUmVuZGVyZXJcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIHRoaXMucmVuZGVyZXIgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBLZXlib2FyZCBtYW5hZ2VyXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICB0aGlzLmtleWJvYXJkID0gbnVsbDtcblxuICAvKipcbiAgICogRGF0IGd1aSBtYW5hZ2VyXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICB0aGlzLmRhdGd1aSA9IG51bGw7XG5cbiAgLyoqXG4gICAqIFJlZmVyZW5jZSB0byB0aGUgU3RhdHMgaW5zdGFuY2UgKG5lZWRlZCB0byBjYWxsIHVwZGF0ZVxuICAgKiBvbiB0aGUgbWV0aG9kIHtAbGluayBtb2R1bGU6Y29udHJvbGxlci9BcHBsaWNhdGlvbiN1cGRhdGV9KVxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgdGhpcy5zdGF0cyA9IG51bGw7XG5cbiAgLyoqXG4gICAqIFJlZmVyZW5jZSB0byB0aGUgbG9jYWwgbG9vcCBtYW5hZ2VyXG4gICAqIEB0eXBlIHtMb29wTWFuYWdlcn1cbiAgICovXG4gIHRoaXMubG9vcE1hbmFnZXIgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBDb2xvcnMgZm9yIHRoZSBkZWZhdWx0IHNjZW5lXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICB0aGlzLnRoZW1lID0gbnVsbDtcblxuICAvKipcbiAgICogQXBwbGljYXRpb24gY2FjaGVcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIHRoaXMuX190M2NhY2hlX18gPSB7fTtcblxuICBBcHBsaWNhdGlvbi5wcm90b3R5cGUuaW5pdEFwcGxpY2F0aW9uLmNhbGwodGhpcyk7XG59XG5cbi8qKlxuICogR2V0dGVyIGZvciB0aGUgaW5pdGlhbCBjb25maWdcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuQXBwbGljYXRpb24ucHJvdG90eXBlLmdldENvbmZpZyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuaW5pdGlhbENvbmZpZztcbn07XG5cbi8qKlxuICogQm9vdHN0cmFwIHRoZSBhcHBsaWNhdGlvbiB3aXRoIHRoZSBmb2xsb3dpbmcgc3RlcHM6XG4gKlxuICogLSBFbmFibGluZyBjYWNoZSBpbmplY3Rpb25cbiAqIC0gU2V0IHRoZSB0aGVtZVxuICogLSBDcmVhdGUgdGhlIHJlbmRlcmVyLCBkZWZhdWx0IHNjZW5lLCBkZWZhdWx0IGNhbWVyYSwgc29tZSByYW5kb20gbGlnaHRzXG4gKiAtIEluaXRpYWxpemVzIGRhdC5ndWksIFN0YXRzLCBhIG1hc2sgd2hlbiB0aGUgYXBwbGljYXRpb24gaXMgcGFpc2VkXG4gKiAtIEluaXRpYWxpemVzIGZ1bGxTY3JlZW4gZXZlbnRzLCBrZXlib2FyZCBhbmQgc29tZSBoZWxwZXIgb2JqZWN0c1xuICogLSBDYWxscyB0aGUgZ2FtZSBsb29wXG4gKlxuICovXG5BcHBsaWNhdGlvbi5wcm90b3R5cGUuaW5pdEFwcGxpY2F0aW9uID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbWUgPSB0aGlzLFxuICAgIGNvbmZpZyA9IG1lLmdldENvbmZpZygpO1xuXG4gIG1lLmluamVjdENhY2hlKGNvbmZpZy5pbmplY3RDYWNoZSk7XG5cbiAgLy8gdGhlbWVcbiAgbWUuc2V0VGhlbWUoY29uZmlnLnRoZW1lKTtcblxuICAvLyBkZWZhdWx0c1xuICBtZS5jcmVhdGVEZWZhdWx0UmVuZGVyZXIoKTtcbiAgbWUuY3JlYXRlRGVmYXVsdFNjZW5lKCk7XG4gIG1lLmNyZWF0ZURlZmF1bHRDYW1lcmEoKTtcbiAgbWUuY3JlYXRlRGVmYXVsdExpZ2h0cygpO1xuXG4gIC8vIHV0aWxzXG4gIG1lLmluaXREYXRHdWkoKTtcbiAgbWUuaW5pdFN0YXRzKCk7XG4gIG1lLmluaXRNYXNrKClcbiAgICAubWFza1Zpc2libGUoIWNvbmZpZy5yZW5kZXJJbW1lZGlhdGVseSk7XG4gIG1lLmluaXRGdWxsU2NyZWVuKCk7XG4gIG1lLmluaXRLZXlib2FyZCgpO1xuICBtZS5pbml0Q29vcmRpbmF0ZXMoKTtcblxuICAvLyBnYW1lIGxvb3BcbiAgbWUuZ2FtZUxvb3AoKTtcbn07XG5cbi8qKlxuICogU2V0cyB0aGUgYWN0aXZlIHNjZW5lIChpdCBtdXN0IGJlIGEgcmVnaXN0ZXJlZCBzY2VuZSByZWdpc3RlcmVkXG4gKiB3aXRoIHtAbGluayAjYWRkU2NlbmV9KVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUgc3RyaW5nIHdoaWNoIHdhcyB1c2VkIHRvIHJlZ2lzdGVyIHRoZSBzY2VuZVxuICogQHJldHVybiB7dGhpc31cbiAqL1xuQXBwbGljYXRpb24ucHJvdG90eXBlLnNldEFjdGl2ZVNjZW5lID0gZnVuY3Rpb24gKGtleSkge1xuICB0aGlzLmFjdGl2ZVNjZW5lID0gdGhpcy5zY2VuZXNba2V5XTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZHMgYSBzY2VuZSB0byB0aGUgc2NlbmUgcG9vbFxuICogQHBhcmFtIHtUSFJFRS5TY2VuZX0gc2NlbmVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5hZGRTY2VuZSA9IGZ1bmN0aW9uIChzY2VuZSwga2V5KSB7XG4gIGNvbnNvbGUuYXNzZXJ0KHNjZW5lIGluc3RhbmNlb2YgVEhSRUUuU2NlbmUpO1xuICB0aGlzLnNjZW5lc1trZXldID0gc2NlbmU7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgc2NlbmUgY2FsbGVkICdkZWZhdWx0JyBhbmQgc2V0cyBpdCBhcyB0aGUgYWN0aXZlIG9uZVxuICogQHJldHVybiB7dGhpc31cbiAqL1xuQXBwbGljYXRpb24ucHJvdG90eXBlLmNyZWF0ZURlZmF1bHRTY2VuZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG1lID0gdGhpcyxcbiAgICBjb25maWcgPSBtZS5nZXRDb25maWcoKSxcbiAgICBkZWZhdWx0U2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcbiAgaWYgKGNvbmZpZy5kZWZhdWx0U2NlbmVDb25maWcuZm9nKSB7XG4gICAgZGVmYXVsdFNjZW5lLmZvZyA9IG5ldyBUSFJFRS5Gb2cobWUudGhlbWUuZm9nQ29sb3IsIDIwMDAsIDQwMDApO1xuICB9XG4gIG1lXG4gICAgLmFkZFNjZW5lKGRlZmF1bHRTY2VuZSwgJ2RlZmF1bHQnKVxuICAgIC5zZXRBY3RpdmVTY2VuZSgnZGVmYXVsdCcpO1xuICByZXR1cm4gbWU7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgdGhlIGRlZmF1bHQgVEhSRUUuV2ViR0xSZW5kZXJlciB1c2VkIGluIHRoZSB3b3JsZFxuICogQHJldHVybiB7dGhpc31cbiAqL1xuQXBwbGljYXRpb24ucHJvdG90eXBlLmNyZWF0ZURlZmF1bHRSZW5kZXJlciA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG1lID0gdGhpcyxcbiAgICBjb25maWcgPSBtZS5nZXRDb25maWcoKTtcbiAgdmFyIHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoe1xuLy8gICAgICBhbnRpYWxpYXM6IHRydWVcbiAgfSk7XG4gIHJlbmRlcmVyLnNldENsZWFyQ29sb3IobWUudGhlbWUuY2xlYXJDb2xvciwgMSk7XG4gIHJlbmRlcmVyLnNldFNpemUoY29uZmlnLndpZHRoLCBjb25maWcuaGVpZ2h0KTtcbiAgZG9jdW1lbnRcbiAgICAucXVlcnlTZWxlY3Rvcihjb25maWcuc2VsZWN0b3IpXG4gICAgLmFwcGVuZENoaWxkKHJlbmRlcmVyLmRvbUVsZW1lbnQpO1xuICBtZS5yZW5kZXJlciA9IHJlbmRlcmVyO1xuICByZXR1cm4gbWU7XG59O1xuXG5BcHBsaWNhdGlvbi5wcm90b3R5cGUuc2V0QWN0aXZlQ2FtZXJhID0gZnVuY3Rpb24gKGtleSkge1xuICB0aGlzLmFjdGl2ZUNhbWVyYSA9IHRoaXMuY2FtZXJhc1trZXldO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5hZGRDYW1lcmEgPSBmdW5jdGlvbiAoY2FtZXJhLCBrZXkpIHtcbiAgY29uc29sZS5hc3NlcnQoY2FtZXJhIGluc3RhbmNlb2YgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEgfHxcbiAgICBjYW1lcmEgaW5zdGFuY2VvZiBUSFJFRS5PcnRob2dyYXBoaWNDYW1lcmEpO1xuICB0aGlzLmNhbWVyYXNba2V5XSA9IGNhbWVyYTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENyZWF0ZSB0aGUgZGVmYXVsdCBjYW1lcmEgdXNlZCBpbiB0aGlzIHdvcmxkIHdoaWNoIGlzXG4gKiBhIGBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYWAsIGl0IGFsc28gYWRkcyBvcmJpdCBjb250cm9sc1xuICogYnkgY2FsbGluZyB7QGxpbmsgI2NyZWF0ZUNhbWVyYUNvbnRyb2xzfVxuICovXG5BcHBsaWNhdGlvbi5wcm90b3R5cGUuY3JlYXRlRGVmYXVsdENhbWVyYSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG1lID0gdGhpcyxcbiAgICBjb25maWcgPSBtZS5nZXRDb25maWcoKSxcbiAgICB3aWR0aCA9IGNvbmZpZy53aWR0aCxcbiAgICBoZWlnaHQgPSBjb25maWcuaGVpZ2h0LFxuICAgIGRlZmF1bHRzID0ge1xuICAgICAgZm92OiAzOCxcbiAgICAgIHJhdGlvOiB3aWR0aCAvIGhlaWdodCxcbiAgICAgIG5lYXI6IDEsXG4gICAgICBmYXI6IDEwMDAwXG4gICAgfSxcbiAgICBkZWZhdWx0Q2FtZXJhO1xuXG4gIGRlZmF1bHRDYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoXG4gICAgZGVmYXVsdHMuZm92LFxuICAgIGRlZmF1bHRzLnJhdGlvLFxuICAgIGRlZmF1bHRzLm5lYXIsXG4gICAgZGVmYXVsdHMuZmFyXG4gICk7XG4gIGRlZmF1bHRDYW1lcmEucG9zaXRpb24uc2V0KDUwMCwgMzAwLCA1MDApO1xuXG4gIC8vIHRyYW5zcGFyZW50bHkgc3VwcG9ydCB3aW5kb3cgcmVzaXplXG4gIGlmIChjb25maWcuZnVsbFNjcmVlbikge1xuICAgIFRIUkVFeC5XaW5kb3dSZXNpemUuYmluZChtZS5yZW5kZXJlciwgZGVmYXVsdENhbWVyYSk7XG4gIH1cblxuICBtZVxuICAgIC5jcmVhdGVDYW1lcmFDb250cm9scyhkZWZhdWx0Q2FtZXJhKVxuICAgIC5hZGRDYW1lcmEoZGVmYXVsdENhbWVyYSwgJ2RlZmF1bHQnKVxuICAgIC5zZXRBY3RpdmVDYW1lcmEoJ2RlZmF1bHQnKTtcblxuICByZXR1cm4gbWU7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgT3JiaXRDb250cm9scyBvdmVyIHRoZSBgY2FtZXJhYCBwYXNzZWQgYXMgcGFyYW1cbiAqIEBwYXJhbSAge1RIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhfFRIUkVFLk9ydG9ncmFwaGljQ2FtZXJhfSBjYW1lcmFcbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5jcmVhdGVDYW1lcmFDb250cm9scyA9IGZ1bmN0aW9uIChjYW1lcmEpIHtcbiAgdmFyIG1lID0gdGhpcztcbiAgY2FtZXJhLmNhbWVyYUNvbnRyb2xzID0gbmV3IFRIUkVFLk9yYml0Q29udHJvbHMoXG4gICAgY2FtZXJhLFxuICAgIG1lLnJlbmRlcmVyLmRvbUVsZW1lbnRcbiAgKTtcbiAgLy8gYXZvaWQgcGFubmluZyB0byBzZWUgdGhlIGJvdHRvbSBmYWNlXG4gIGNhbWVyYS5jYW1lcmFDb250cm9scy5tYXhQb2xhckFuZ2xlID0gTWF0aC5QSSAvIDIgKiAwLjk5O1xuICBjYW1lcmEuY2FtZXJhQ29udHJvbHMudGFyZ2V0LnNldCgxMDAsIDEwMCwgMTAwKTtcbiAgLy8gY2FtZXJhLmNhbWVyYUNvbnRyb2xzLnRhcmdldC5zZXQoMCwgMCwgMCk7XG4gIHJldHVybiBtZTtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBzb21lIHJhbmRvbSBsaWdodHMgaW4gdGhlIGRlZmF1bHQgc2NlbmVcbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5jcmVhdGVEZWZhdWx0TGlnaHRzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbGlnaHQsXG4gICAgICBzY2VuZSA9IHRoaXMuc2NlbmVzWydkZWZhdWx0J107XG5cbiAgbGlnaHQgPSBuZXcgVEhSRUUuQW1iaWVudExpZ2h0KDB4MjIyMjIyKTtcbiAgc2NlbmUuYWRkKGxpZ2h0KS5jYWNoZSgnYW1iaWVudC1saWdodC0xJyk7XG5cbiAgbGlnaHQgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCggMHhGRkZGRkYsIDEuMCApO1xuICBsaWdodC5wb3NpdGlvbi5zZXQoIDIwMCwgNDAwLCA1MDAgKTtcbiAgc2NlbmUuYWRkKGxpZ2h0KS5jYWNoZSgnZGlyZWN0aW9uYWwtbGlnaHQtMScpO1xuXG4gIGxpZ2h0ID0gbmV3IFRIUkVFLkRpcmVjdGlvbmFsTGlnaHQoIDB4RkZGRkZGLCAxLjAgKTtcbiAgbGlnaHQucG9zaXRpb24uc2V0KCAtNTAwLCAyNTAsIC0yMDAgKTtcbiAgc2NlbmUuYWRkKGxpZ2h0KS5jYWNoZSgnZGlyZWN0aW9uYWwtbGlnaHQtMicpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXRzIHRoZSB0aGVtZSB0byBiZSB1c2VkIGluIHRoZSBkZWZhdWx0IHNjZW5lXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBFaXRoZXIgdGhlIHN0cmluZyBgZGFya2Agb3IgYGxpZ2h0YFxuICogQHRvZG8gTWFrZSB0aGUgdGhlbWUgc3lzdGVtIGV4dGVuc2libGVcbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5zZXRUaGVtZSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHZhciBtZSA9IHRoaXMsXG4gICAgdGhlbWVzID0gcmVxdWlyZSgnLi4vJykudGhlbWVzO1xuICBhc3NlcnQodGhlbWVzW25hbWVdKTtcbiAgbWUudGhlbWUgPSB0aGVtZXNbbmFtZV07XG4gIHJldHVybiBtZTtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG1hc2sgb24gdG9wIG9mIHRoZSBjYW52YXMgd2hlbiBpdCdzIHBhdXNlZFxuICogQHJldHVybiB7dGhpc31cbiAqL1xuQXBwbGljYXRpb24ucHJvdG90eXBlLmluaXRNYXNrID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbWUgPSB0aGlzLFxuICAgIGNvbmZpZyA9IG1lLmdldENvbmZpZygpLFxuICAgIG1hc2ssXG4gICAgaGlkZGVuO1xuICBtYXNrID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIG1hc2suY2xhc3NOYW1lID0gJ3QzLW1hc2snO1xuICAvLyBtYXNrLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIG1hc2suc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICBtYXNrLnN0eWxlLnRvcCA9ICcwcHgnO1xuICBtYXNrLnN0eWxlLndpZHRoID0gJzEwMCUnO1xuICBtYXNrLnN0eWxlLmhlaWdodCA9ICcxMDAlJztcbiAgbWFzay5zdHlsZS5iYWNrZ3JvdW5kID0gJ3JnYmEoMCwwLDAsMC41KSc7XG5cbiAgZG9jdW1lbnRcbiAgICAucXVlcnlTZWxlY3Rvcihjb25maWcuc2VsZWN0b3IpXG4gICAgLmFwcGVuZENoaWxkKG1hc2spO1xuXG4gIG1lLm1hc2sgPSBtYXNrO1xuICByZXR1cm4gbWU7XG59O1xuXG4vKipcbiAqIFVwZGF0ZXMgdGhlIG1hc2sgdmlzaWJpbGl0eVxuICogQHBhcmFtICB7Ym9vbGVhbn0gdiBUcnVlIHRvIG1ha2UgaXQgdmlzaWJsZVxuICovXG5BcHBsaWNhdGlvbi5wcm90b3R5cGUubWFza1Zpc2libGUgPSBmdW5jdGlvbiAodikge1xuICB2YXIgbWFzayA9IHRoaXMubWFzaztcbiAgbWFzay5zdHlsZS5kaXNwbGF5ID0gdiA/ICdibG9jaycgOiAnbm9uZSc7XG59O1xuXG4vKipcbiAqIEluaXRzIHRoZSBkYXQuZ3VpIGhlbHBlciB3aGljaCBpcyBwbGFjZWQgdW5kZXIgdGhlXG4gKiBET00gZWxlbWVudCBpZGVudGlmaWVkIGJ5IHRoZSBpbml0aWFsIGNvbmZpZ3VyYXRpb24gc2VsZWN0b3JcbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5pbml0RGF0R3VpID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbWUgPSB0aGlzLFxuICAgIGNvbmZpZyA9IG1lLmdldENvbmZpZygpLFxuICAgIGd1aSA9IG5ldyBkYXQuR1VJKHtcbiAgICAgIGF1dG9QbGFjZTogZmFsc2VcbiAgICB9KTtcblxuICBvYmplY3RNZXJnZShndWkuZG9tRWxlbWVudC5zdHlsZSwge1xuICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgIHRvcDogJzBweCcsXG4gICAgcmlnaHQ6ICcwcHgnLFxuICAgIHpJbmRleDogJzEnXG4gIH0pO1xuICBkb2N1bWVudFxuICAgIC5xdWVyeVNlbGVjdG9yKGNvbmZpZy5zZWxlY3RvcilcbiAgICAuYXBwZW5kQ2hpbGQoZ3VpLmRvbUVsZW1lbnQpO1xuICBtZS5kYXRndWkgPSBndWk7XG4gIHJldHVybiBtZTtcbn07XG5cbi8qKlxuICogSW5pdCB0aGUgU3RhdHMgaGVscGVyIHdoaWNoIGlzIHBsYWNlZCB1bmRlciB0aGVcbiAqIERPTSBlbGVtZW50IGlkZW50aWZpZWQgYnkgdGhlIGluaXRpYWwgY29uZmlndXJhdGlvbiBzZWxlY3RvclxuICogQHJldHVybiB7dGhpc31cbiAqL1xuQXBwbGljYXRpb24ucHJvdG90eXBlLmluaXRTdGF0cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG1lID0gdGhpcyxcbiAgICBjb25maWcgPSBtZS5nZXRDb25maWcoKSxcbiAgICBzdGF0cztcbiAgLy8gYWRkIFN0YXRzLmpzIC0gaHR0cHM6Ly9naXRodWIuY29tL21yZG9vYi9zdGF0cy5qc1xuICBzdGF0cyA9IG5ldyBTdGF0cygpO1xuICBvYmplY3RNZXJnZShzdGF0cy5kb21FbGVtZW50LnN0eWxlLCB7XG4gICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgekluZGV4OiAxLFxuICAgIGJvdHRvbTogJzBweCdcbiAgfSk7XG4gIGRvY3VtZW50XG4gICAgLnF1ZXJ5U2VsZWN0b3IoY29uZmlnLnNlbGVjdG9yKVxuICAgIC5hcHBlbmRDaGlsZCggc3RhdHMuZG9tRWxlbWVudCApO1xuICBtZS5zdGF0cyA9IHN0YXRzO1xuICByZXR1cm4gbWU7XG59O1xuXG4vKipcbiAqIEJpbmRzIHRoZSBGIGtleSB0byBtYWtlIGEgd29ybGQgZ28gZnVsbCBzY3JlZW5cbiAqIEB0b2RvIFRoaXMgc2hvdWxkIGJlIHVzZWQgb25seSB3aGVuIHRoZSBjYW52YXMgaXMgYWN0aXZlXG4gKi9cbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5pbml0RnVsbFNjcmVlbiA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGNvbmZpZyA9IHRoaXMuZ2V0Q29uZmlnKCk7XG4gIC8vIGFsbG93ICdmJyB0byBnbyBmdWxsc2NyZWVuIHdoZXJlIHRoaXMgZmVhdHVyZSBpcyBzdXBwb3J0ZWRcbiAgaWYoY29uZmlnLmZ1bGxTY3JlZW4gJiYgVEhSRUV4LkZ1bGxTY3JlZW4uYXZhaWxhYmxlKCkpIHtcbiAgICBUSFJFRXguRnVsbFNjcmVlbi5iaW5kS2V5KCk7XG4gIH1cbn07XG5cbi8qKlxuICogSW5pdGlhbGl6ZXMgdGhlIGNvb3JkaW5hdGUgaGVscGVyIChpdHMgd3JhcHBlZCBpbiBhIG1vZGVsIGluIFQzKVxuICovXG5BcHBsaWNhdGlvbi5wcm90b3R5cGUuaW5pdENvb3JkaW5hdGVzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgY29uZmlnID0gdGhpcy5nZXRDb25maWcoKTtcbiAgdGhpcy5zY2VuZXNbJ2RlZmF1bHQnXVxuICAgIC5hZGQoXG4gICAgICBuZXcgQ29vcmRpbmF0ZXMoY29uZmlnLmFtYmllbnRDb25maWcsIHRoaXMudGhlbWUpXG4gICAgICAgIC5pbml0RGF0R3VpKHRoaXMuZGF0Z3VpKVxuICAgICAgICAubWVzaFxuICAgICk7XG59O1xuXG4vKipcbiAqIEluaXRpcyB0aGUga2V5Ym9hcmQgaGVscGVyXG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5BcHBsaWNhdGlvbi5wcm90b3R5cGUuaW5pdEtleWJvYXJkID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmtleWJvYXJkID0gbmV3IEtleWJvYXJkKCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJbml0aWFsaXplcyB0aGUgZ2FtZSBsb29wIGJ5IGNyZWF0aW5nIGFuIGluc3RhbmNlIG9mIHtAbGluayBMb29wTWFuYWdlcn1cbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5nYW1lTG9vcCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGNvbmZpZyA9IHRoaXMuZ2V0Q29uZmlnKCk7XG4gIHRoaXMubG9vcE1hbmFnZXIgPSBuZXcgTG9vcE1hbmFnZXIodGhpcywgY29uZmlnLnJlbmRlckltbWVkaWF0ZWx5KVxuICAgIC5pbml0RGF0R3VpKHRoaXMuZGF0Z3VpKVxuICAgIC5hbmltYXRlKCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBVcGRhdGUgcGhhc2UsIHRoZSB3b3JsZCB1cGRhdGVzIGJ5IGRlZmF1bHQ6XG4gKlxuICogLSBUaGUgc3RhdHMgaGVscGVyXG4gKiAtIFRoZSBjYW1lcmEgY29udHJvbHMgaWYgdGhlIGFjdGl2ZSBjYW1lcmEgaGFzIG9uZVxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBkZWx0YSBUaGUgbnVtYmVyIG9mIHNlY29uZHMgZWxhcHNlZFxuICovXG5BcHBsaWNhdGlvbi5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKGRlbHRhKSB7XG4gIHZhciBtZSA9IHRoaXM7XG5cbiAgLy8gc3RhdHMgaGVscGVyXG4gIG1lLnN0YXRzLnVwZGF0ZSgpO1xuXG4gIC8vIGNhbWVyYSB1cGRhdGVcbiAgaWYgKG1lLmFjdGl2ZUNhbWVyYS5jYW1lcmFDb250cm9scykge1xuICAgIG1lLmFjdGl2ZUNhbWVyYS5jYW1lcmFDb250cm9scy51cGRhdGUoZGVsdGEpO1xuICB9XG59O1xuXG4vKipcbiAqIFJlbmRlciBwaGFzZSwgY2FsbHMgYHRoaXMucmVuZGVyZXJgIHdpdGggYHRoaXMuYWN0aXZlU2NlbmVgIGFuZFxuICogYHRoaXMuYWN0aXZlQ2FtZXJhYFxuICovXG5BcHBsaWNhdGlvbi5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbWUgPSB0aGlzO1xuICBtZS5yZW5kZXJlci5yZW5kZXIoXG4gICAgbWUuYWN0aXZlU2NlbmUsXG4gICAgbWUuYWN0aXZlQ2FtZXJhXG4gICk7XG59O1xuXG4vKipcbiAqIFdyYXBzIGBUSFJFRS5PYmplY3QzRC5wcm90b3R5cGUuYWRkYCBhbmQgYFRIUkVFLk9iamVjdDNELnByb3RvdHlwZS5yZW1vdmVgXG4gKiB3aXRoIGZ1bmN0aW9ucyB0aGF0IHNhdmUgdGhlIGxhc3Qgb2JqZWN0IHdoaWNoIGBhZGRgIG9yIGByZW1vdmVgIGhhdmUgYmVlblxuICogY2FsbGVkIHdpdGgsIHRoaXMgYWxsb3dzIHRvIGNhbGwgdGhlIG1ldGhvZCBgY2FjaGVgIHdoaWNoIHdpbGwgY2FjaGVcbiAqIHRoZSBvYmplY3Qgd2l0aCBhbiBpZGVudGlmaWVyIGFsbG93aW5nIGZhc3Qgb2JqZWN0IHJldHJpZXZhbFxuICpcbiAqIEBleGFtcGxlXG4gKlxuICogICB2YXIgaW5zdGFuY2UgPSB0My5BcHBsaWNhdGlvbi5ydW4oe1xuICogICAgIGluamVjdENhY2hlOiB0cnVlLFxuICogICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAqICAgICAgIHZhciBncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xuICogICAgICAgdmFyIGlubmVyR3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcbiAqXG4gKiAgICAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQm94R2VvbWV0cnkoMSwxLDEpO1xuICogICAgICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHtjb2xvcjogMHgwMGZmMDB9KTtcbiAqICAgICAgIHZhciBjdWJlID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcbiAqXG4gKiAgICAgICBpbm5lckdyb3VwXG4gKiAgICAgICAgIC5hZGQoY3ViZSlcbiAqICAgICAgICAgLmNhY2hlKCdteUN1YmUnKTtcbiAqXG4gKiAgICAgICBncm91cFxuICogICAgICAgICAuYWRkKGlubmVyR3JvdXApXG4gKiAgICAgICAgIC5jYWNoZSgnaW5uZXJHcm91cCcpO1xuICpcbiAqICAgICAgIC8vIHJlbW92YWwgZXhhbXBsZVxuICogICAgICAgLy8gZ3JvdXBcbiAqICAgICAgIC8vICAgLnJlbW92ZShpbm5lckdyb3VwKVxuICogICAgICAgLy8gICAuY2FjaGUoKTtcbiAqXG4gKiAgICAgICB0aGlzLmFjdGl2ZVNjZW5lXG4gKiAgICAgICAgIC5hZGQoZ3JvdXApXG4gKiAgICAgICAgIC5jYWNoZSgnZ3JvdXAnKTtcbiAqICAgICB9LFxuICpcbiAqICAgICB1cGRhdGU6IGZ1bmN0aW9uIChkZWx0YSkge1xuICogICAgICAgdmFyIGN1YmUgPSB0aGlzLmdldEZyb21DYWNoZSgnbXlDdWJlJyk7XG4gKiAgICAgICAvLyBwZXJmb3JtIG9wZXJhdGlvbnMgb24gdGhlIGN1YmVcbiAqICAgICB9XG4gKiAgIH0pO1xuICpcbiAqIEBwYXJhbSAge2Jvb2xlYW59IGluamVjdCBUcnVlIHRvIGVuYWJsZSB0aGlzIGJlaGF2aW9yXG4gKi9cbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5pbmplY3RDYWNoZSA9IGZ1bmN0aW9uIChpbmplY3QpIHtcbiAgdmFyIG1lID0gdGhpcyxcbiAgICAgIGxhc3RPYmplY3QsXG4gICAgICBsYXN0TWV0aG9kLFxuICAgICAgYWRkID0gVEhSRUUuT2JqZWN0M0QucHJvdG90eXBlLmFkZCxcbiAgICAgIHJlbW92ZSA9IFRIUkVFLk9iamVjdDNELnByb3RvdHlwZS5yZW1vdmUsXG4gICAgICBjYWNoZSA9IHRoaXMuX190M2NhY2hlX187XG5cbiAgaWYgKGluamVjdCkge1xuICAgIFRIUkVFLk9iamVjdDNELnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgICBsYXN0TWV0aG9kID0gJ2FkZCc7XG4gICAgICBsYXN0T2JqZWN0ID0gb2JqZWN0O1xuICAgICAgcmV0dXJuIGFkZC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICBUSFJFRS5PYmplY3QzRC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgICAgbGFzdE1ldGhvZCA9ICdyZW1vdmUnO1xuICAgICAgbGFzdE9iamVjdCA9IG9iamVjdDtcbiAgICAgIHJldHVybiByZW1vdmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgVEhSRUUuT2JqZWN0M0QucHJvdG90eXBlLmNhY2hlID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgIGFzc2VydChsYXN0T2JqZWN0LCAnVDMuQXBwbGljYXRpb24ucHJvdG90eXBlLmNhY2hlOiB0aGlzIG1ldGhvZCcgK1xuICAgICAgICAnIG5lZWRzIGEgcHJldmlvdXMgY2FsbCB0byBhZGQvcmVtb3ZlJyk7XG4gICAgICBpZiAobGFzdE1ldGhvZCA9PT0gJ2FkZCcpIHtcbiAgICAgICAgbGFzdE9iamVjdC5uYW1lID0gbGFzdE9iamVjdC5uYW1lIHx8IG5hbWU7XG4gICAgICAgIGFzc2VydChsYXN0T2JqZWN0Lm5hbWUpO1xuICAgICAgICBjYWNoZVtsYXN0T2JqZWN0Lm5hbWVdID0gbGFzdE9iamVjdDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFzc2VydChsYXN0T2JqZWN0Lm5hbWUpO1xuICAgICAgICBkZWxldGUgY2FjaGVbbGFzdE9iamVjdC5uYW1lXTtcbiAgICAgIH1cbiAgICAgIGxhc3RPYmplY3QgPSBudWxsO1xuICAgICAgcmV0dXJuIG1lO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgVEhSRUUuT2JqZWN0M0QucHJvdG90eXBlLmNhY2hlID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgfVxufTtcblxuLyoqXG4gKiBHZXRzIGFuIG9iamVjdCBmcm9tIHRoZSBjYWNoZSBpZiBgaW5qZWN0Q2FjaGVgIHdhcyBlbmFibGVkIGFuZFxuICogYW4gb2JqZWN0IHdhcyByZWdpc3RlcmVkIHdpdGgge0BsaW5rICNjYWNoZX1cbiAqIEBwYXJhbSAge3N0cmluZ30gbmFtZVxuICogQHJldHVybiB7VEhSRUUuT2JqZWN0M0R9XG4gKi9cbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5nZXRGcm9tQ2FjaGUgPSBmdW5jdGlvbiAobmFtZSkge1xuICByZXR1cm4gdGhpcy5fX3QzY2FjaGVfX1tuYW1lXTtcbn07XG5cbi8qKlxuICogQHN0YXRpY1xuICogQ3JlYXRlcyBhIHN1YmNsYXNzIG9mIEFwcGxpY2F0aW9uIHdob3NlIGluc3RhbmNlcyBkb24ndCBuZWVkIHRvXG4gKiB3b3JyeSBhYm91dCB0aGUgaW5oZXJpdGFuY2UgcHJvY2Vzc1xuICogQHBhcmFtICB7T2JqZWN0fSBvcHRpb25zIFRoZSBzYW1lIG9iamVjdCBwYXNzZWQgdG8gdGhlIHtAbGluayBBcHBsaWNhdGlvbn1cbiAqIGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucy5pbml0IEluaXRpYWxpemF0aW9uIHBoYXNlLCBmdW5jdGlvbiBjYWxsZWQgaW5cbiAqIHRoZSBjb25zdHJ1Y3RvciBvZiB0aGUgc3ViY2xhc3NcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zLnVwZGF0ZSBVcGRhdGUgcGhhc2UsIGZ1bmN0aW9uIGNhbGxlZCBhcyB0aGVcbiAqIHVwZGF0ZSBmdW5jdGlvbiBvZiB0aGUgc3ViY2xhc3MsIGl0IGFsc28gY2FsbHMgQXBwbGljYXRpb24ncyB1cGRhdGVcbiAqIEByZXR1cm4ge3QzLlF1aWNrTGF1bmNofSBBbiBpbnN0YW5jZSBvZiB0aGUgc3ViY2xhc3MgY3JlYXRlZCBpblxuICogdGhpcyBmdW5jdGlvblxuICovXG5BcHBsaWNhdGlvbi5ydW4gPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICBvcHRpb25zLmluaXQgPSBvcHRpb25zLmluaXQgfHwgZW1wdHlGbjtcbiAgb3B0aW9ucy51cGRhdGUgPSBvcHRpb25zLnVwZGF0ZSB8fCBlbXB0eUZuO1xuICBhc3NlcnQob3B0aW9ucy5zZWxlY3RvciwgJ2NhbnZhcyBzZWxlY3RvciByZXF1aXJlZCcpO1xuXG4gIHZhciBRdWlja0xhdW5jaCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgQXBwbGljYXRpb24uY2FsbCh0aGlzLCBvcHRpb25zKTtcbiAgICBvcHRpb25zLmluaXQuY2FsbCh0aGlzLCBvcHRpb25zKTtcbiAgfTtcbiAgUXVpY2tMYXVuY2gucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShBcHBsaWNhdGlvbi5wcm90b3R5cGUpO1xuXG4gIFF1aWNrTGF1bmNoLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoZGVsdGEpIHtcbiAgICBBcHBsaWNhdGlvbi5wcm90b3R5cGUudXBkYXRlLmNhbGwodGhpcywgZGVsdGEpO1xuICAgIG9wdGlvbnMudXBkYXRlLmNhbGwodGhpcywgZGVsdGEpO1xuICB9O1xuXG4gIHJldHVybiBuZXcgUXVpY2tMYXVuY2gob3B0aW9ucyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcGxpY2F0aW9uO1xufSkuY2FsbCh0aGlzLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIvKipcbiAqIEBtb2R1bGUgIGNvbnRyb2xsZXIvS2V5Ym9hcmRcbiAqL1xuXG4vKipcbiAqIEtleWJvYXJkIGhlbHBlclxuICogQGNsYXNzXG4gKi9cbmZ1bmN0aW9uIEtleWJvYXJkKCkge1xuICAvKipcbiAgICogRWFjaCBpbmRleCBjb3JyZXNwb25kIHRvIHRoZSBhc2NpaSB2YWx1ZSBvZiB0aGVcbiAgICoga2V5IHByZXNzZWRcbiAgICogQHR5cGUge0FycmF5fVxuICAgKi9cbiAgdGhpcy5rZXlzID0gW107XG59O1xuXG4vKipcbiAqIEFkZHMgdGhlIGtleWRvd24gYW5kIGtleXVwIGxpc3RlbmVyc1xuICovXG5LZXlib2FyZC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG1lID0gdGhpcyxcbiAgICBpO1xuICBmb3IgKGkgPSAwOyBpIDwgMjU2OyBpICs9IDEpIHtcbiAgICBtZS5rZXlzW2ldID0gZmFsc2U7XG4gIH1cbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG1lLm9uS2V5RG93bigpLCBmYWxzZSk7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgbWUub25LZXlVcCgpLCBmYWxzZSk7XG59O1xuXG4vKipcbiAqIFNldHMgYGV2ZW50LmtleWNvZGVgIGFzIGEgcHJlc2VlZCBrZXlcbiAqIEByZXR1cm4ge2Z1bmN0aW9ufVxuICovXG5LZXlib2FyZC5wcm90b3R5cGUub25LZXlEb3duID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbWUgPSB0aGlzO1xuICByZXR1cm4gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgbWUua2V5c1tldmVudC5rZXlDb2RlXSA9IHRydWU7XG4gIH07XG59O1xuXG4vKipcbiAqIFNldHMgYGV2ZW50LmtleWNvZGVgIGFzIGFuIHVucHJlc3NlZCBrZXlcbiAqIEByZXR1cm4ge2Z1bmN0aW9ufVxuICovXG5LZXlib2FyZC5wcm90b3R5cGUub25LZXlVcCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG1lID0gdGhpcztcbiAgcmV0dXJuIGZ1bmN0aW9uIChldmVudCkge1xuICAgIG1lLmtleXNbZXZlbnQua2V5Q29kZV0gPSBmYWxzZTtcbiAgfTtcbn07XG5cbi8qKlxuICogR2V0cyB0aGUgcHJlc3NlZCBzdGF0ZSBvZiB0aGUga2V5IGBrZXlgXG4gKiBAcGFyYW0gIHtzdHJpbmd9IGtleVxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuS2V5Ym9hcmQucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuIHRoaXMua2V5c1trZXkuY2hhckNvZGVBdCgwKV07XG59O1xuXG4vKipcbiAqIFNldHMgdGhlIHByZXNzZWQgc3RhdGUgb2YgdGhlIGtleSBga2V5YCB0byBgdmFsdWVgXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge2Jvb2xlYW59IHZhbHVlXG4gKi9cbktleWJvYXJkLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICB0aGlzLmtleXNba2V5LmNoYXJDb2RlQXQoMCldID0gdmFsdWU7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEtleWJvYXJkOyIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbnZhciBUSFJFRSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlRIUkVFIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5USFJFRSA6IG51bGwpO1xudmFyIEFwcGxpY2F0aW9uID0gcmVxdWlyZSgnLi9BcHBsaWNhdGlvbicpO1xuXG4vKipcbiAqIEBtb2R1bGUgIGNvbnRyb2xsZXIvTG9vcE1hbmFnZXJcbiAqL1xuXG4vKipcbiAqIFRoZSBsb29wIG1hbmFnZXJzIGNvbnRyb2xzIHRoZSBjYWxscyBtYWRlIHRvIGByZXF1ZXN0QW5pbWF0aW9uRnJhbWVgXG4gKiBvZiBhbiBBcHBsaWNhdGlvblxuICogQGNsYXNzXG4gKiBAcGFyYW0ge2NvbnRyb2xsZXIvTG9vcE1hbmFnZXJ9IGFwcGxpY2F0aW9uIEFwcGxpY2F0b24gd2hvc2UgZnJhbWUgcmF0ZVxuICogd2lsbCBiZSBjb250cm9sbGVkXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHJlbmRlckltbWVkaWF0ZWx5IFRydWUgdG8gc3RhcnQgdGhlIGNhbGxcbiAqIHRvIHJlcXVlc3QgYW5pbWF0aW9uIGZyYW1lIGltbWVkaWF0ZWx5XG4gKi9cbmZ1bmN0aW9uIExvb3BNYW5hZ2VyKGFwcGxpY2F0aW9uLCByZW5kZXJJbW1lZGlhdGVseSkge1xuICAvKipcbiAgICogUmVmZXJlbmNlIHRvIHRoZSBhcHBsaWNhdGlvblxuICAgKiBAdHlwZSB7Y29udHJvbGxlci9BcHBsaWNhdGlvbn1cbiAgICovXG4gIHRoaXMuYXBwbGljYXRpb24gPSBhcHBsaWNhdGlvbjtcbiAgLyoqXG4gICAqIENsb2NrIGhlbHBlciAoaXRzIGRlbHRhIG1ldGhvZCBpcyB1c2VkIHRvIHVwZGF0ZSB0aGUgY2FtZXJhKVxuICAgKiBAdHlwZSB7VEhSRUUuQ2xvY2soKX1cbiAgICovXG4gIHRoaXMuY2xvY2sgPSBuZXcgVEhSRUUuQ2xvY2soKTtcbiAgLyoqXG4gICAqIFRvZ2dsZSB0byBwYXVzZSB0aGUgYW5pbWF0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKi9cbiAgdGhpcy5wYXVzZSA9ICFyZW5kZXJJbW1lZGlhdGVseTtcbiAgLyoqXG4gICAqIEZyYW1lcyBwZXIgc2Vjb25kXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqL1xuICB0aGlzLmZwcyA9IDYwO1xuXG4gIC8qKlxuICAgKiBkYXQuZ3VpIGZvbGRlciBvYmplY3RzXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICB0aGlzLmd1aUNvbnRyb2xsZXJzID0ge307XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemVzIGEgZm9sZGVyIHRvIGNvbnRyb2wgdGhlIGZyYW1lIHJhdGUgYW5kIHNldHNcbiAqIHRoZSBwYXVzZWQgc3RhdGUgb2YgdGhlIGFwcFxuICogQHBhcmFtICB7ZGF0Lmd1aX0gZ3VpXG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5Mb29wTWFuYWdlci5wcm90b3R5cGUuaW5pdERhdEd1aSA9IGZ1bmN0aW9uIChndWkpIHtcbiAgdmFyIG1lID0gdGhpcyxcbiAgICAgIGZvbGRlciA9IGd1aS5hZGRGb2xkZXIoJ0dhbWUgTG9vcCcpO1xuICBmb2xkZXJcbiAgICAuYWRkKHRoaXMsICdmcHMnLCAxMCwgNjAsIDEpXG4gICAgLm5hbWUoJ0ZyYW1lIHJhdGUnKTtcbiAgXG4gIG1lLmd1aUNvbnRyb2xsZXJzLnBhdXNlID0gZm9sZGVyXG4gICAgLmFkZCh0aGlzLCAncGF1c2UnKVxuICAgIC5uYW1lKCdQYXVzZWQnKVxuICAgIC5vbkZpbmlzaENoYW5nZShmdW5jdGlvbiAocGF1c2VkKSB7XG4gICAgICBpZiAoIXBhdXNlZCkge1xuICAgICAgICBtZS5hbmltYXRlKCk7XG4gICAgICB9XG4gICAgICBtZS5hcHBsaWNhdGlvbi5tYXNrVmlzaWJsZShwYXVzZWQpO1xuICAgIH0pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQW5pbWF0aW9uIGxvb3AgKGNhbGxzIGFwcGxpY2F0aW9uLnVwZGF0ZSBhbmQgYXBwbGljYXRpb24ucmVuZGVyKVxuICogQHJldHVybiB7dGhpc31cbiAqL1xuTG9vcE1hbmFnZXIucHJvdG90eXBlLmFuaW1hdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBtZSA9IHRoaXMsXG4gICAgZWxhcHNlZFRpbWUgPSAwLFxuICAgIGxvb3A7XG5cbiAgbG9vcCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAobWUucGF1c2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgZGVsdGEgPSBtZS5jbG9jay5nZXREZWx0YSgpLFxuICAgICAgZnJhbWVSYXRlSW5TID0gMSAvIG1lLmZwcztcblxuICAgIC8vIGNvbnN0cmFpbnQgZGVsdGEgdG8gYmUgPD0gZnJhbWVSYXRlXG4gICAgLy8gKHRvIGF2b2lkIGZyYW1lcyB3aXRoIGEgYmlnIGRlbHRhIGNhdXNlZCBiZWNhdXNlIG9mIHRoZSBhcHAgc2VudCB0byBzbGVlcClcbiAgICBkZWx0YSA9IE1hdGgubWluKGRlbHRhLCBmcmFtZVJhdGVJblMpO1xuICAgIGVsYXBzZWRUaW1lICs9IGRlbHRhO1xuXG4gICAgaWYgKGVsYXBzZWRUaW1lID49IGZyYW1lUmF0ZUluUykge1xuXG4gICAgICAvLyB1cGRhdGUgdGhlIHdvcmxkIGFuZCByZW5kZXIgaXRzIG9iamVjdHNcbiAgICAgIG1lLmFwcGxpY2F0aW9uLnVwZGF0ZShkZWx0YSk7XG4gICAgICBtZS5hcHBsaWNhdGlvbi5yZW5kZXIoKTtcblxuICAgICAgZWxhcHNlZFRpbWUgLT0gZnJhbWVSYXRlSW5TO1xuICAgIH1cblxuICAgIC8vIGRldGFpbHMgYXQgaHR0cDovL215Lm9wZXJhLmNvbS9lbW9sbGVyL2Jsb2cvMjAxMS8xMi8yMC9yZXF1ZXN0YW5pbWF0aW9uZnJhbWUtZm9yLXNtYXJ0LWVyLWFuaW1hdGluZ1xuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobG9vcCk7XG4gIH07XG5cbiAgbG9vcCgpO1xuXG4gIHJldHVybiBtZTtcbn07XG5cbi8qKlxuICogU3RhcnRzIHRoZSBhbmltYXRpb25cbiAqL1xuTG9vcE1hbmFnZXIucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbWUgPSB0aGlzO1xuICBtZS5ndWlDb250cm9sbGVycy5wYXVzZS5zZXRWYWx1ZShmYWxzZSk7XG59O1xuXG4vKipcbiAqIFN0b3BzIHRoZSBhbmltYXRpb25cbiAqL1xuTG9vcE1hbmFnZXIucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBtZSA9IHRoaXM7XG4gIG1lLmd1aUNvbnRyb2xsZXJzLnBhdXNlLnNldFZhbHVlKHRydWUpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMb29wTWFuYWdlcjtcbn0pLmNhbGwodGhpcyx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwicmVxdWlyZSgnLi9saWIvT3JiaXRDb250cm9scycpO1xuXG4vKipcbiAqIHQzXG4gKiBAbmFtZXNwYWNlXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG52YXIgQXBwbGljYXRpb24gPSByZXF1aXJlKCcuL2NvbnRyb2xsZXIvQXBwbGljYXRpb24nKTtcbnZhciB0MyA9IHtcbiAgbW9kZWw6IHtcbiAgICBDb29yZGluYXRlczogcmVxdWlyZSgnLi9tb2RlbC9Db29yZGluYXRlcycpLFxuICB9LFxuICB0aGVtZXM6IHtcbiAgICBkYXJrOiByZXF1aXJlKCcuL3RoZW1lcy9kYXJrJyksXG4gICAgbGlnaHQ6IHJlcXVpcmUoJy4vdGhlbWVzL2xpZ2h0JylcbiAgfSxcbiAgY29udHJvbGxlcjoge1xuICAgIEFwcGxpY2F0aW9uOiBBcHBsaWNhdGlvbixcbiAgICBLZXlib2FyZDogcmVxdWlyZSgnLi9jb250cm9sbGVyL0tleWJvYXJkJyksXG4gICAgTG9vcE1hbmFnZXI6IHJlcXVpcmUoJy4vY29udHJvbGxlci9Mb29wTWFuYWdlcicpXG4gIH0sXG4gIEFwcGxpY2F0aW9uOiBBcHBsaWNhdGlvbixcblxuICAvLyBhbGlhc1xuICBydW46IEFwcGxpY2F0aW9uLnJ1blxufTtcbm1vZHVsZS5leHBvcnRzID0gdDM7IiwiLyoqXG4gKiBAYXV0aG9yIHFpYW8gLyBodHRwczovL2dpdGh1Yi5jb20vcWlhb1xuICogQGF1dGhvciBtcmRvb2IgLyBodHRwOi8vbXJkb29iLmNvbVxuICogQGF1dGhvciBhbHRlcmVkcSAvIGh0dHA6Ly9hbHRlcmVkcXVhbGlhLmNvbS9cbiAqIEBhdXRob3IgV2VzdExhbmdsZXkgLyBodHRwOi8vZ2l0aHViLmNvbS9XZXN0TGFuZ2xleVxuICogQGF1dGhvciBlcmljaDY2NiAvIGh0dHA6Ly9lcmljaGFpbmVzLmNvbVxuICovXG4vKmdsb2JhbCBUSFJFRSwgY29uc29sZSAqL1xuXG4vLyBUaGlzIHNldCBvZiBjb250cm9scyBwZXJmb3JtcyBvcmJpdGluZywgZG9sbHlpbmcgKHpvb21pbmcpLCBhbmQgcGFubmluZy4gSXQgbWFpbnRhaW5zXG4vLyB0aGUgXCJ1cFwiIGRpcmVjdGlvbiBhcyArWSwgdW5saWtlIHRoZSBUcmFja2JhbGxDb250cm9scy4gVG91Y2ggb24gdGFibGV0IGFuZCBwaG9uZXMgaXNcbi8vIHN1cHBvcnRlZC5cbi8vXG4vLyAgICBPcmJpdCAtIGxlZnQgbW91c2UgLyB0b3VjaDogb25lIGZpbmdlciBtb3ZlXG4vLyAgICBab29tIC0gbWlkZGxlIG1vdXNlLCBvciBtb3VzZXdoZWVsIC8gdG91Y2g6IHR3byBmaW5nZXIgc3ByZWFkIG9yIHNxdWlzaFxuLy8gICAgUGFuIC0gcmlnaHQgbW91c2UsIG9yIGFycm93IGtleXMgLyB0b3VjaDogdGhyZWUgZmludGVyIHN3aXBlXG4vL1xuLy8gVGhpcyBpcyBhIGRyb3AtaW4gcmVwbGFjZW1lbnQgZm9yIChtb3N0KSBUcmFja2JhbGxDb250cm9scyB1c2VkIGluIGV4YW1wbGVzLlxuLy8gVGhhdCBpcywgaW5jbHVkZSB0aGlzIGpzIGZpbGUgYW5kIHdoZXJldmVyIHlvdSBzZWU6XG4vLyAgICBcdGNvbnRyb2xzID0gbmV3IFRIUkVFLlRyYWNrYmFsbENvbnRyb2xzKCBjYW1lcmEgKTtcbi8vICAgICAgY29udHJvbHMudGFyZ2V0LnogPSAxNTA7XG4vLyBTaW1wbGUgc3Vic3RpdHV0ZSBcIk9yYml0Q29udHJvbHNcIiBhbmQgdGhlIGNvbnRyb2wgc2hvdWxkIHdvcmsgYXMtaXMuXG5cblRIUkVFLk9yYml0Q29udHJvbHMgPSBmdW5jdGlvbiAoIG9iamVjdCwgZG9tRWxlbWVudCApIHtcblxuXHR0aGlzLm9iamVjdCA9IG9iamVjdDtcblx0dGhpcy5kb21FbGVtZW50ID0gKCBkb21FbGVtZW50ICE9PSB1bmRlZmluZWQgKSA/IGRvbUVsZW1lbnQgOiBkb2N1bWVudDtcblxuXHQvLyBBUElcblxuXHQvLyBTZXQgdG8gZmFsc2UgdG8gZGlzYWJsZSB0aGlzIGNvbnRyb2xcblx0dGhpcy5lbmFibGVkID0gdHJ1ZTtcblxuXHQvLyBcInRhcmdldFwiIHNldHMgdGhlIGxvY2F0aW9uIG9mIGZvY3VzLCB3aGVyZSB0aGUgY29udHJvbCBvcmJpdHMgYXJvdW5kXG5cdC8vIGFuZCB3aGVyZSBpdCBwYW5zIHdpdGggcmVzcGVjdCB0by5cblx0dGhpcy50YXJnZXQgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuXG5cdC8vIGNlbnRlciBpcyBvbGQsIGRlcHJlY2F0ZWQ7IHVzZSBcInRhcmdldFwiIGluc3RlYWRcblx0dGhpcy5jZW50ZXIgPSB0aGlzLnRhcmdldDtcblxuXHQvLyBUaGlzIG9wdGlvbiBhY3R1YWxseSBlbmFibGVzIGRvbGx5aW5nIGluIGFuZCBvdXQ7IGxlZnQgYXMgXCJ6b29tXCIgZm9yXG5cdC8vIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5XG5cdHRoaXMubm9ab29tID0gZmFsc2U7XG5cdHRoaXMuem9vbVNwZWVkID0gMS4wO1xuXG5cdC8vIExpbWl0cyB0byBob3cgZmFyIHlvdSBjYW4gZG9sbHkgaW4gYW5kIG91dFxuXHR0aGlzLm1pbkRpc3RhbmNlID0gMDtcblx0dGhpcy5tYXhEaXN0YW5jZSA9IEluZmluaXR5O1xuXG5cdC8vIFNldCB0byB0cnVlIHRvIGRpc2FibGUgdGhpcyBjb250cm9sXG5cdHRoaXMubm9Sb3RhdGUgPSBmYWxzZTtcblx0dGhpcy5yb3RhdGVTcGVlZCA9IDEuMDtcblxuXHQvLyBTZXQgdG8gdHJ1ZSB0byBkaXNhYmxlIHRoaXMgY29udHJvbFxuXHR0aGlzLm5vUGFuID0gZmFsc2U7XG5cdHRoaXMua2V5UGFuU3BlZWQgPSA3LjA7XHQvLyBwaXhlbHMgbW92ZWQgcGVyIGFycm93IGtleSBwdXNoXG5cblx0Ly8gU2V0IHRvIHRydWUgdG8gYXV0b21hdGljYWxseSByb3RhdGUgYXJvdW5kIHRoZSB0YXJnZXRcblx0dGhpcy5hdXRvUm90YXRlID0gZmFsc2U7XG5cdHRoaXMuYXV0b1JvdGF0ZVNwZWVkID0gMi4wOyAvLyAzMCBzZWNvbmRzIHBlciByb3VuZCB3aGVuIGZwcyBpcyA2MFxuXG5cdC8vIEhvdyBmYXIgeW91IGNhbiBvcmJpdCB2ZXJ0aWNhbGx5LCB1cHBlciBhbmQgbG93ZXIgbGltaXRzLlxuXHQvLyBSYW5nZSBpcyAwIHRvIE1hdGguUEkgcmFkaWFucy5cblx0dGhpcy5taW5Qb2xhckFuZ2xlID0gMDsgLy8gcmFkaWFuc1xuXHR0aGlzLm1heFBvbGFyQW5nbGUgPSBNYXRoLlBJOyAvLyByYWRpYW5zXG5cblx0Ly8gU2V0IHRvIHRydWUgdG8gZGlzYWJsZSB1c2Ugb2YgdGhlIGtleXNcblx0dGhpcy5ub0tleXMgPSBmYWxzZTtcblxuXHQvLyBUaGUgZm91ciBhcnJvdyBrZXlzXG5cdHRoaXMua2V5cyA9IHsgTEVGVDogMzcsIFVQOiAzOCwgUklHSFQ6IDM5LCBCT1RUT006IDQwIH07XG5cblx0Ly8vLy8vLy8vLy8vXG5cdC8vIGludGVybmFsc1xuXG5cdHZhciBzY29wZSA9IHRoaXM7XG5cblx0dmFyIEVQUyA9IDAuMDAwMDAxO1xuXG5cdHZhciByb3RhdGVTdGFydCA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cdHZhciByb3RhdGVFbmQgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXHR2YXIgcm90YXRlRGVsdGEgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXG5cdHZhciBwYW5TdGFydCA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cdHZhciBwYW5FbmQgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXHR2YXIgcGFuRGVsdGEgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXHR2YXIgcGFuT2Zmc2V0ID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblxuXHR2YXIgb2Zmc2V0ID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblxuXHR2YXIgZG9sbHlTdGFydCA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cdHZhciBkb2xseUVuZCA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cdHZhciBkb2xseURlbHRhID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblxuXHR2YXIgcGhpRGVsdGEgPSAwO1xuXHR2YXIgdGhldGFEZWx0YSA9IDA7XG5cdHZhciBzY2FsZSA9IDE7XG5cdHZhciBwYW4gPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuXG5cdHZhciBsYXN0UG9zaXRpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuXHR2YXIgbGFzdFF1YXRlcm5pb24gPSBuZXcgVEhSRUUuUXVhdGVybmlvbigpO1xuXG5cdHZhciBTVEFURSA9IHsgTk9ORSA6IC0xLCBST1RBVEUgOiAwLCBET0xMWSA6IDEsIFBBTiA6IDIsIFRPVUNIX1JPVEFURSA6IDMsIFRPVUNIX0RPTExZIDogNCwgVE9VQ0hfUEFOIDogNSB9O1xuXG5cdHZhciBzdGF0ZSA9IFNUQVRFLk5PTkU7XG5cblx0Ly8gZm9yIHJlc2V0XG5cblx0dGhpcy50YXJnZXQwID0gdGhpcy50YXJnZXQuY2xvbmUoKTtcblx0dGhpcy5wb3NpdGlvbjAgPSB0aGlzLm9iamVjdC5wb3NpdGlvbi5jbG9uZSgpO1xuXG5cdC8vIHNvIGNhbWVyYS51cCBpcyB0aGUgb3JiaXQgYXhpc1xuXG5cdHZhciBxdWF0ID0gbmV3IFRIUkVFLlF1YXRlcm5pb24oKS5zZXRGcm9tVW5pdFZlY3RvcnMoIG9iamVjdC51cCwgbmV3IFRIUkVFLlZlY3RvcjMoIDAsIDEsIDAgKSApO1xuXHR2YXIgcXVhdEludmVyc2UgPSBxdWF0LmNsb25lKCkuaW52ZXJzZSgpO1xuXG5cdC8vIGV2ZW50c1xuXG5cdHZhciBjaGFuZ2VFdmVudCA9IHsgdHlwZTogJ2NoYW5nZScgfTtcblx0dmFyIHN0YXJ0RXZlbnQgPSB7IHR5cGU6ICdzdGFydCd9O1xuXHR2YXIgZW5kRXZlbnQgPSB7IHR5cGU6ICdlbmQnfTtcblxuXHR0aGlzLnJvdGF0ZUxlZnQgPSBmdW5jdGlvbiAoIGFuZ2xlICkge1xuXG5cdFx0aWYgKCBhbmdsZSA9PT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRhbmdsZSA9IGdldEF1dG9Sb3RhdGlvbkFuZ2xlKCk7XG5cblx0XHR9XG5cblx0XHR0aGV0YURlbHRhIC09IGFuZ2xlO1xuXG5cdH07XG5cblx0dGhpcy5yb3RhdGVVcCA9IGZ1bmN0aW9uICggYW5nbGUgKSB7XG5cblx0XHRpZiAoIGFuZ2xlID09PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdGFuZ2xlID0gZ2V0QXV0b1JvdGF0aW9uQW5nbGUoKTtcblxuXHRcdH1cblxuXHRcdHBoaURlbHRhIC09IGFuZ2xlO1xuXG5cdH07XG5cblx0Ly8gcGFzcyBpbiBkaXN0YW5jZSBpbiB3b3JsZCBzcGFjZSB0byBtb3ZlIGxlZnRcblx0dGhpcy5wYW5MZWZ0ID0gZnVuY3Rpb24gKCBkaXN0YW5jZSApIHtcblxuXHRcdHZhciB0ZSA9IHRoaXMub2JqZWN0Lm1hdHJpeC5lbGVtZW50cztcblxuXHRcdC8vIGdldCBYIGNvbHVtbiBvZiBtYXRyaXhcblx0XHRwYW5PZmZzZXQuc2V0KCB0ZVsgMCBdLCB0ZVsgMSBdLCB0ZVsgMiBdICk7XG5cdFx0cGFuT2Zmc2V0Lm11bHRpcGx5U2NhbGFyKCAtIGRpc3RhbmNlICk7XG5cdFx0XG5cdFx0cGFuLmFkZCggcGFuT2Zmc2V0ICk7XG5cblx0fTtcblxuXHQvLyBwYXNzIGluIGRpc3RhbmNlIGluIHdvcmxkIHNwYWNlIHRvIG1vdmUgdXBcblx0dGhpcy5wYW5VcCA9IGZ1bmN0aW9uICggZGlzdGFuY2UgKSB7XG5cblx0XHR2YXIgdGUgPSB0aGlzLm9iamVjdC5tYXRyaXguZWxlbWVudHM7XG5cblx0XHQvLyBnZXQgWSBjb2x1bW4gb2YgbWF0cml4XG5cdFx0cGFuT2Zmc2V0LnNldCggdGVbIDQgXSwgdGVbIDUgXSwgdGVbIDYgXSApO1xuXHRcdHBhbk9mZnNldC5tdWx0aXBseVNjYWxhciggZGlzdGFuY2UgKTtcblx0XHRcblx0XHRwYW4uYWRkKCBwYW5PZmZzZXQgKTtcblxuXHR9O1xuXHRcblx0Ly8gcGFzcyBpbiB4LHkgb2YgY2hhbmdlIGRlc2lyZWQgaW4gcGl4ZWwgc3BhY2UsXG5cdC8vIHJpZ2h0IGFuZCBkb3duIGFyZSBwb3NpdGl2ZVxuXHR0aGlzLnBhbiA9IGZ1bmN0aW9uICggZGVsdGFYLCBkZWx0YVkgKSB7XG5cblx0XHR2YXIgZWxlbWVudCA9IHNjb3BlLmRvbUVsZW1lbnQgPT09IGRvY3VtZW50ID8gc2NvcGUuZG9tRWxlbWVudC5ib2R5IDogc2NvcGUuZG9tRWxlbWVudDtcblxuXHRcdGlmICggc2NvcGUub2JqZWN0LmZvdiAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHQvLyBwZXJzcGVjdGl2ZVxuXHRcdFx0dmFyIHBvc2l0aW9uID0gc2NvcGUub2JqZWN0LnBvc2l0aW9uO1xuXHRcdFx0dmFyIG9mZnNldCA9IHBvc2l0aW9uLmNsb25lKCkuc3ViKCBzY29wZS50YXJnZXQgKTtcblx0XHRcdHZhciB0YXJnZXREaXN0YW5jZSA9IG9mZnNldC5sZW5ndGgoKTtcblxuXHRcdFx0Ly8gaGFsZiBvZiB0aGUgZm92IGlzIGNlbnRlciB0byB0b3Agb2Ygc2NyZWVuXG5cdFx0XHR0YXJnZXREaXN0YW5jZSAqPSBNYXRoLnRhbiggKCBzY29wZS5vYmplY3QuZm92IC8gMiApICogTWF0aC5QSSAvIDE4MC4wICk7XG5cblx0XHRcdC8vIHdlIGFjdHVhbGx5IGRvbid0IHVzZSBzY3JlZW5XaWR0aCwgc2luY2UgcGVyc3BlY3RpdmUgY2FtZXJhIGlzIGZpeGVkIHRvIHNjcmVlbiBoZWlnaHRcblx0XHRcdHNjb3BlLnBhbkxlZnQoIDIgKiBkZWx0YVggKiB0YXJnZXREaXN0YW5jZSAvIGVsZW1lbnQuY2xpZW50SGVpZ2h0ICk7XG5cdFx0XHRzY29wZS5wYW5VcCggMiAqIGRlbHRhWSAqIHRhcmdldERpc3RhbmNlIC8gZWxlbWVudC5jbGllbnRIZWlnaHQgKTtcblxuXHRcdH0gZWxzZSBpZiAoIHNjb3BlLm9iamVjdC50b3AgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0Ly8gb3J0aG9ncmFwaGljXG5cdFx0XHRzY29wZS5wYW5MZWZ0KCBkZWx0YVggKiAoc2NvcGUub2JqZWN0LnJpZ2h0IC0gc2NvcGUub2JqZWN0LmxlZnQpIC8gZWxlbWVudC5jbGllbnRXaWR0aCApO1xuXHRcdFx0c2NvcGUucGFuVXAoIGRlbHRhWSAqIChzY29wZS5vYmplY3QudG9wIC0gc2NvcGUub2JqZWN0LmJvdHRvbSkgLyBlbGVtZW50LmNsaWVudEhlaWdodCApO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0Ly8gY2FtZXJhIG5laXRoZXIgb3J0aG9ncmFwaGljIG9yIHBlcnNwZWN0aXZlXG5cdFx0XHRjb25zb2xlLndhcm4oICdXQVJOSU5HOiBPcmJpdENvbnRyb2xzLmpzIGVuY291bnRlcmVkIGFuIHVua25vd24gY2FtZXJhIHR5cGUgLSBwYW4gZGlzYWJsZWQuJyApO1xuXG5cdFx0fVxuXG5cdH07XG5cblx0dGhpcy5kb2xseUluID0gZnVuY3Rpb24gKCBkb2xseVNjYWxlICkge1xuXG5cdFx0aWYgKCBkb2xseVNjYWxlID09PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdGRvbGx5U2NhbGUgPSBnZXRab29tU2NhbGUoKTtcblxuXHRcdH1cblxuXHRcdHNjYWxlIC89IGRvbGx5U2NhbGU7XG5cblx0fTtcblxuXHR0aGlzLmRvbGx5T3V0ID0gZnVuY3Rpb24gKCBkb2xseVNjYWxlICkge1xuXG5cdFx0aWYgKCBkb2xseVNjYWxlID09PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdGRvbGx5U2NhbGUgPSBnZXRab29tU2NhbGUoKTtcblxuXHRcdH1cblxuXHRcdHNjYWxlICo9IGRvbGx5U2NhbGU7XG5cblx0fTtcblxuXHR0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdHZhciBwb3NpdGlvbiA9IHRoaXMub2JqZWN0LnBvc2l0aW9uO1xuXG5cdFx0b2Zmc2V0LmNvcHkoIHBvc2l0aW9uICkuc3ViKCB0aGlzLnRhcmdldCApO1xuXG5cdFx0Ly8gcm90YXRlIG9mZnNldCB0byBcInktYXhpcy1pcy11cFwiIHNwYWNlXG5cdFx0b2Zmc2V0LmFwcGx5UXVhdGVybmlvbiggcXVhdCApO1xuXG5cdFx0Ly8gYW5nbGUgZnJvbSB6LWF4aXMgYXJvdW5kIHktYXhpc1xuXG5cdFx0dmFyIHRoZXRhID0gTWF0aC5hdGFuMiggb2Zmc2V0LngsIG9mZnNldC56ICk7XG5cblx0XHQvLyBhbmdsZSBmcm9tIHktYXhpc1xuXG5cdFx0dmFyIHBoaSA9IE1hdGguYXRhbjIoIE1hdGguc3FydCggb2Zmc2V0LnggKiBvZmZzZXQueCArIG9mZnNldC56ICogb2Zmc2V0LnogKSwgb2Zmc2V0LnkgKTtcblxuXHRcdGlmICggdGhpcy5hdXRvUm90YXRlICkge1xuXG5cdFx0XHR0aGlzLnJvdGF0ZUxlZnQoIGdldEF1dG9Sb3RhdGlvbkFuZ2xlKCkgKTtcblxuXHRcdH1cblxuXHRcdHRoZXRhICs9IHRoZXRhRGVsdGE7XG5cdFx0cGhpICs9IHBoaURlbHRhO1xuXG5cdFx0Ly8gcmVzdHJpY3QgcGhpIHRvIGJlIGJldHdlZW4gZGVzaXJlZCBsaW1pdHNcblx0XHRwaGkgPSBNYXRoLm1heCggdGhpcy5taW5Qb2xhckFuZ2xlLCBNYXRoLm1pbiggdGhpcy5tYXhQb2xhckFuZ2xlLCBwaGkgKSApO1xuXG5cdFx0Ly8gcmVzdHJpY3QgcGhpIHRvIGJlIGJldHdlZSBFUFMgYW5kIFBJLUVQU1xuXHRcdHBoaSA9IE1hdGgubWF4KCBFUFMsIE1hdGgubWluKCBNYXRoLlBJIC0gRVBTLCBwaGkgKSApO1xuXG5cdFx0dmFyIHJhZGl1cyA9IG9mZnNldC5sZW5ndGgoKSAqIHNjYWxlO1xuXG5cdFx0Ly8gcmVzdHJpY3QgcmFkaXVzIHRvIGJlIGJldHdlZW4gZGVzaXJlZCBsaW1pdHNcblx0XHRyYWRpdXMgPSBNYXRoLm1heCggdGhpcy5taW5EaXN0YW5jZSwgTWF0aC5taW4oIHRoaXMubWF4RGlzdGFuY2UsIHJhZGl1cyApICk7XG5cdFx0XG5cdFx0Ly8gbW92ZSB0YXJnZXQgdG8gcGFubmVkIGxvY2F0aW9uXG5cdFx0dGhpcy50YXJnZXQuYWRkKCBwYW4gKTtcblxuXHRcdG9mZnNldC54ID0gcmFkaXVzICogTWF0aC5zaW4oIHBoaSApICogTWF0aC5zaW4oIHRoZXRhICk7XG5cdFx0b2Zmc2V0LnkgPSByYWRpdXMgKiBNYXRoLmNvcyggcGhpICk7XG5cdFx0b2Zmc2V0LnogPSByYWRpdXMgKiBNYXRoLnNpbiggcGhpICkgKiBNYXRoLmNvcyggdGhldGEgKTtcblxuXHRcdC8vIHJvdGF0ZSBvZmZzZXQgYmFjayB0byBcImNhbWVyYS11cC12ZWN0b3ItaXMtdXBcIiBzcGFjZVxuXHRcdG9mZnNldC5hcHBseVF1YXRlcm5pb24oIHF1YXRJbnZlcnNlICk7XG5cblx0XHRwb3NpdGlvbi5jb3B5KCB0aGlzLnRhcmdldCApLmFkZCggb2Zmc2V0ICk7XG5cblx0XHR0aGlzLm9iamVjdC5sb29rQXQoIHRoaXMudGFyZ2V0ICk7XG5cblx0XHR0aGV0YURlbHRhID0gMDtcblx0XHRwaGlEZWx0YSA9IDA7XG5cdFx0c2NhbGUgPSAxO1xuXHRcdHBhbi5zZXQoIDAsIDAsIDAgKTtcblxuXHRcdC8vIHVwZGF0ZSBjb25kaXRpb24gaXM6XG5cdFx0Ly8gbWluKGNhbWVyYSBkaXNwbGFjZW1lbnQsIGNhbWVyYSByb3RhdGlvbiBpbiByYWRpYW5zKV4yID4gRVBTXG5cdFx0Ly8gdXNpbmcgc21hbGwtYW5nbGUgYXBwcm94aW1hdGlvbiBjb3MoeC8yKSA9IDEgLSB4XjIgLyA4XG5cblx0XHRpZiAoIGxhc3RQb3NpdGlvbi5kaXN0YW5jZVRvU3F1YXJlZCggdGhpcy5vYmplY3QucG9zaXRpb24gKSA+IEVQU1xuXHRcdCAgICB8fCA4ICogKDEgLSBsYXN0UXVhdGVybmlvbi5kb3QodGhpcy5vYmplY3QucXVhdGVybmlvbikpID4gRVBTICkge1xuXG5cdFx0XHR0aGlzLmRpc3BhdGNoRXZlbnQoIGNoYW5nZUV2ZW50ICk7XG5cblx0XHRcdGxhc3RQb3NpdGlvbi5jb3B5KCB0aGlzLm9iamVjdC5wb3NpdGlvbiApO1xuXHRcdFx0bGFzdFF1YXRlcm5pb24uY29weSAodGhpcy5vYmplY3QucXVhdGVybmlvbiApO1xuXG5cdFx0fVxuXG5cdH07XG5cblxuXHR0aGlzLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuXG5cdFx0c3RhdGUgPSBTVEFURS5OT05FO1xuXG5cdFx0dGhpcy50YXJnZXQuY29weSggdGhpcy50YXJnZXQwICk7XG5cdFx0dGhpcy5vYmplY3QucG9zaXRpb24uY29weSggdGhpcy5wb3NpdGlvbjAgKTtcblxuXHRcdHRoaXMudXBkYXRlKCk7XG5cblx0fTtcblxuXHRmdW5jdGlvbiBnZXRBdXRvUm90YXRpb25BbmdsZSgpIHtcblxuXHRcdHJldHVybiAyICogTWF0aC5QSSAvIDYwIC8gNjAgKiBzY29wZS5hdXRvUm90YXRlU3BlZWQ7XG5cblx0fVxuXG5cdGZ1bmN0aW9uIGdldFpvb21TY2FsZSgpIHtcblxuXHRcdHJldHVybiBNYXRoLnBvdyggMC45NSwgc2NvcGUuem9vbVNwZWVkICk7XG5cblx0fVxuXG5cdGZ1bmN0aW9uIG9uTW91c2VEb3duKCBldmVudCApIHtcblxuXHRcdGlmICggc2NvcGUuZW5hYmxlZCA9PT0gZmFsc2UgKSByZXR1cm47XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdGlmICggZXZlbnQuYnV0dG9uID09PSAwICkge1xuXHRcdFx0aWYgKCBzY29wZS5ub1JvdGF0ZSA9PT0gdHJ1ZSApIHJldHVybjtcblxuXHRcdFx0c3RhdGUgPSBTVEFURS5ST1RBVEU7XG5cblx0XHRcdHJvdGF0ZVN0YXJ0LnNldCggZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSApO1xuXG5cdFx0fSBlbHNlIGlmICggZXZlbnQuYnV0dG9uID09PSAxICkge1xuXHRcdFx0aWYgKCBzY29wZS5ub1pvb20gPT09IHRydWUgKSByZXR1cm47XG5cblx0XHRcdHN0YXRlID0gU1RBVEUuRE9MTFk7XG5cblx0XHRcdGRvbGx5U3RhcnQuc2V0KCBldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZICk7XG5cblx0XHR9IGVsc2UgaWYgKCBldmVudC5idXR0b24gPT09IDIgKSB7XG5cdFx0XHRpZiAoIHNjb3BlLm5vUGFuID09PSB0cnVlICkgcmV0dXJuO1xuXG5cdFx0XHRzdGF0ZSA9IFNUQVRFLlBBTjtcblxuXHRcdFx0cGFuU3RhcnQuc2V0KCBldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZICk7XG5cblx0XHR9XG5cblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUsIGZhbHNlICk7XG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNldXAnLCBvbk1vdXNlVXAsIGZhbHNlICk7XG5cdFx0c2NvcGUuZGlzcGF0Y2hFdmVudCggc3RhcnRFdmVudCApO1xuXG5cdH1cblxuXHRmdW5jdGlvbiBvbk1vdXNlTW92ZSggZXZlbnQgKSB7XG5cblx0XHRpZiAoIHNjb3BlLmVuYWJsZWQgPT09IGZhbHNlICkgcmV0dXJuO1xuXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdHZhciBlbGVtZW50ID0gc2NvcGUuZG9tRWxlbWVudCA9PT0gZG9jdW1lbnQgPyBzY29wZS5kb21FbGVtZW50LmJvZHkgOiBzY29wZS5kb21FbGVtZW50O1xuXG5cdFx0aWYgKCBzdGF0ZSA9PT0gU1RBVEUuUk9UQVRFICkge1xuXG5cdFx0XHRpZiAoIHNjb3BlLm5vUm90YXRlID09PSB0cnVlICkgcmV0dXJuO1xuXG5cdFx0XHRyb3RhdGVFbmQuc2V0KCBldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZICk7XG5cdFx0XHRyb3RhdGVEZWx0YS5zdWJWZWN0b3JzKCByb3RhdGVFbmQsIHJvdGF0ZVN0YXJ0ICk7XG5cblx0XHRcdC8vIHJvdGF0aW5nIGFjcm9zcyB3aG9sZSBzY3JlZW4gZ29lcyAzNjAgZGVncmVlcyBhcm91bmRcblx0XHRcdHNjb3BlLnJvdGF0ZUxlZnQoIDIgKiBNYXRoLlBJICogcm90YXRlRGVsdGEueCAvIGVsZW1lbnQuY2xpZW50V2lkdGggKiBzY29wZS5yb3RhdGVTcGVlZCApO1xuXG5cdFx0XHQvLyByb3RhdGluZyB1cCBhbmQgZG93biBhbG9uZyB3aG9sZSBzY3JlZW4gYXR0ZW1wdHMgdG8gZ28gMzYwLCBidXQgbGltaXRlZCB0byAxODBcblx0XHRcdHNjb3BlLnJvdGF0ZVVwKCAyICogTWF0aC5QSSAqIHJvdGF0ZURlbHRhLnkgLyBlbGVtZW50LmNsaWVudEhlaWdodCAqIHNjb3BlLnJvdGF0ZVNwZWVkICk7XG5cblx0XHRcdHJvdGF0ZVN0YXJ0LmNvcHkoIHJvdGF0ZUVuZCApO1xuXG5cdFx0fSBlbHNlIGlmICggc3RhdGUgPT09IFNUQVRFLkRPTExZICkge1xuXG5cdFx0XHRpZiAoIHNjb3BlLm5vWm9vbSA9PT0gdHJ1ZSApIHJldHVybjtcblxuXHRcdFx0ZG9sbHlFbmQuc2V0KCBldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZICk7XG5cdFx0XHRkb2xseURlbHRhLnN1YlZlY3RvcnMoIGRvbGx5RW5kLCBkb2xseVN0YXJ0ICk7XG5cblx0XHRcdGlmICggZG9sbHlEZWx0YS55ID4gMCApIHtcblxuXHRcdFx0XHRzY29wZS5kb2xseUluKCk7XG5cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0c2NvcGUuZG9sbHlPdXQoKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRkb2xseVN0YXJ0LmNvcHkoIGRvbGx5RW5kICk7XG5cblx0XHR9IGVsc2UgaWYgKCBzdGF0ZSA9PT0gU1RBVEUuUEFOICkge1xuXG5cdFx0XHRpZiAoIHNjb3BlLm5vUGFuID09PSB0cnVlICkgcmV0dXJuO1xuXG5cdFx0XHRwYW5FbmQuc2V0KCBldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZICk7XG5cdFx0XHRwYW5EZWx0YS5zdWJWZWN0b3JzKCBwYW5FbmQsIHBhblN0YXJ0ICk7XG5cdFx0XHRcblx0XHRcdHNjb3BlLnBhbiggcGFuRGVsdGEueCwgcGFuRGVsdGEueSApO1xuXG5cdFx0XHRwYW5TdGFydC5jb3B5KCBwYW5FbmQgKTtcblxuXHRcdH1cblxuXHRcdHNjb3BlLnVwZGF0ZSgpO1xuXG5cdH1cblxuXHRmdW5jdGlvbiBvbk1vdXNlVXAoIC8qIGV2ZW50ICovICkge1xuXG5cdFx0aWYgKCBzY29wZS5lbmFibGVkID09PSBmYWxzZSApIHJldHVybjtcblxuXHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdtb3VzZW1vdmUnLCBvbk1vdXNlTW92ZSwgZmFsc2UgKTtcblx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2V1cCcsIG9uTW91c2VVcCwgZmFsc2UgKTtcblx0XHRzY29wZS5kaXNwYXRjaEV2ZW50KCBlbmRFdmVudCApO1xuXHRcdHN0YXRlID0gU1RBVEUuTk9ORTtcblxuXHR9XG5cblx0ZnVuY3Rpb24gb25Nb3VzZVdoZWVsKCBldmVudCApIHtcblxuXHRcdGlmICggc2NvcGUuZW5hYmxlZCA9PT0gZmFsc2UgfHwgc2NvcGUubm9ab29tID09PSB0cnVlICkgcmV0dXJuO1xuXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdHZhciBkZWx0YSA9IDA7XG5cblx0XHRpZiAoIGV2ZW50LndoZWVsRGVsdGEgIT09IHVuZGVmaW5lZCApIHsgLy8gV2ViS2l0IC8gT3BlcmEgLyBFeHBsb3JlciA5XG5cblx0XHRcdGRlbHRhID0gZXZlbnQud2hlZWxEZWx0YTtcblxuXHRcdH0gZWxzZSBpZiAoIGV2ZW50LmRldGFpbCAhPT0gdW5kZWZpbmVkICkgeyAvLyBGaXJlZm94XG5cblx0XHRcdGRlbHRhID0gLSBldmVudC5kZXRhaWw7XG5cblx0XHR9XG5cblx0XHRpZiAoIGRlbHRhID4gMCApIHtcblxuXHRcdFx0c2NvcGUuZG9sbHlPdXQoKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdHNjb3BlLmRvbGx5SW4oKTtcblxuXHRcdH1cblxuXHRcdHNjb3BlLnVwZGF0ZSgpO1xuXHRcdHNjb3BlLmRpc3BhdGNoRXZlbnQoIHN0YXJ0RXZlbnQgKTtcblx0XHRzY29wZS5kaXNwYXRjaEV2ZW50KCBlbmRFdmVudCApO1xuXG5cdH1cblxuXHRmdW5jdGlvbiBvbktleURvd24oIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBzY29wZS5lbmFibGVkID09PSBmYWxzZSB8fCBzY29wZS5ub0tleXMgPT09IHRydWUgfHwgc2NvcGUubm9QYW4gPT09IHRydWUgKSByZXR1cm47XG5cdFx0XG5cdFx0c3dpdGNoICggZXZlbnQua2V5Q29kZSApIHtcblxuXHRcdFx0Y2FzZSBzY29wZS5rZXlzLlVQOlxuXHRcdFx0XHRzY29wZS5wYW4oIDAsIHNjb3BlLmtleVBhblNwZWVkICk7XG5cdFx0XHRcdHNjb3BlLnVwZGF0ZSgpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSBzY29wZS5rZXlzLkJPVFRPTTpcblx0XHRcdFx0c2NvcGUucGFuKCAwLCAtIHNjb3BlLmtleVBhblNwZWVkICk7XG5cdFx0XHRcdHNjb3BlLnVwZGF0ZSgpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSBzY29wZS5rZXlzLkxFRlQ6XG5cdFx0XHRcdHNjb3BlLnBhbiggc2NvcGUua2V5UGFuU3BlZWQsIDAgKTtcblx0XHRcdFx0c2NvcGUudXBkYXRlKCk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIHNjb3BlLmtleXMuUklHSFQ6XG5cdFx0XHRcdHNjb3BlLnBhbiggLSBzY29wZS5rZXlQYW5TcGVlZCwgMCApO1xuXHRcdFx0XHRzY29wZS51cGRhdGUoKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHR9XG5cblx0fVxuXG5cdGZ1bmN0aW9uIHRvdWNoc3RhcnQoIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBzY29wZS5lbmFibGVkID09PSBmYWxzZSApIHJldHVybjtcblxuXHRcdHN3aXRjaCAoIGV2ZW50LnRvdWNoZXMubGVuZ3RoICkge1xuXG5cdFx0XHRjYXNlIDE6XHQvLyBvbmUtZmluZ2VyZWQgdG91Y2g6IHJvdGF0ZVxuXG5cdFx0XHRcdGlmICggc2NvcGUubm9Sb3RhdGUgPT09IHRydWUgKSByZXR1cm47XG5cblx0XHRcdFx0c3RhdGUgPSBTVEFURS5UT1VDSF9ST1RBVEU7XG5cblx0XHRcdFx0cm90YXRlU3RhcnQuc2V0KCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVgsIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSApO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAyOlx0Ly8gdHdvLWZpbmdlcmVkIHRvdWNoOiBkb2xseVxuXG5cdFx0XHRcdGlmICggc2NvcGUubm9ab29tID09PSB0cnVlICkgcmV0dXJuO1xuXG5cdFx0XHRcdHN0YXRlID0gU1RBVEUuVE9VQ0hfRE9MTFk7XG5cblx0XHRcdFx0dmFyIGR4ID0gZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VYIC0gZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VYO1xuXHRcdFx0XHR2YXIgZHkgPSBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgLSBldmVudC50b3VjaGVzWyAxIF0ucGFnZVk7XG5cdFx0XHRcdHZhciBkaXN0YW5jZSA9IE1hdGguc3FydCggZHggKiBkeCArIGR5ICogZHkgKTtcblx0XHRcdFx0ZG9sbHlTdGFydC5zZXQoIDAsIGRpc3RhbmNlICk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIDM6IC8vIHRocmVlLWZpbmdlcmVkIHRvdWNoOiBwYW5cblxuXHRcdFx0XHRpZiAoIHNjb3BlLm5vUGFuID09PSB0cnVlICkgcmV0dXJuO1xuXG5cdFx0XHRcdHN0YXRlID0gU1RBVEUuVE9VQ0hfUEFOO1xuXG5cdFx0XHRcdHBhblN0YXJ0LnNldCggZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VYLCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGRlZmF1bHQ6XG5cblx0XHRcdFx0c3RhdGUgPSBTVEFURS5OT05FO1xuXG5cdFx0fVxuXG5cdFx0c2NvcGUuZGlzcGF0Y2hFdmVudCggc3RhcnRFdmVudCApO1xuXG5cdH1cblxuXHRmdW5jdGlvbiB0b3VjaG1vdmUoIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBzY29wZS5lbmFibGVkID09PSBmYWxzZSApIHJldHVybjtcblxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHR2YXIgZWxlbWVudCA9IHNjb3BlLmRvbUVsZW1lbnQgPT09IGRvY3VtZW50ID8gc2NvcGUuZG9tRWxlbWVudC5ib2R5IDogc2NvcGUuZG9tRWxlbWVudDtcblxuXHRcdHN3aXRjaCAoIGV2ZW50LnRvdWNoZXMubGVuZ3RoICkge1xuXG5cdFx0XHRjYXNlIDE6IC8vIG9uZS1maW5nZXJlZCB0b3VjaDogcm90YXRlXG5cblx0XHRcdFx0aWYgKCBzY29wZS5ub1JvdGF0ZSA9PT0gdHJ1ZSApIHJldHVybjtcblx0XHRcdFx0aWYgKCBzdGF0ZSAhPT0gU1RBVEUuVE9VQ0hfUk9UQVRFICkgcmV0dXJuO1xuXG5cdFx0XHRcdHJvdGF0ZUVuZC5zZXQoIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCwgZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZICk7XG5cdFx0XHRcdHJvdGF0ZURlbHRhLnN1YlZlY3RvcnMoIHJvdGF0ZUVuZCwgcm90YXRlU3RhcnQgKTtcblxuXHRcdFx0XHQvLyByb3RhdGluZyBhY3Jvc3Mgd2hvbGUgc2NyZWVuIGdvZXMgMzYwIGRlZ3JlZXMgYXJvdW5kXG5cdFx0XHRcdHNjb3BlLnJvdGF0ZUxlZnQoIDIgKiBNYXRoLlBJICogcm90YXRlRGVsdGEueCAvIGVsZW1lbnQuY2xpZW50V2lkdGggKiBzY29wZS5yb3RhdGVTcGVlZCApO1xuXHRcdFx0XHQvLyByb3RhdGluZyB1cCBhbmQgZG93biBhbG9uZyB3aG9sZSBzY3JlZW4gYXR0ZW1wdHMgdG8gZ28gMzYwLCBidXQgbGltaXRlZCB0byAxODBcblx0XHRcdFx0c2NvcGUucm90YXRlVXAoIDIgKiBNYXRoLlBJICogcm90YXRlRGVsdGEueSAvIGVsZW1lbnQuY2xpZW50SGVpZ2h0ICogc2NvcGUucm90YXRlU3BlZWQgKTtcblxuXHRcdFx0XHRyb3RhdGVTdGFydC5jb3B5KCByb3RhdGVFbmQgKTtcblxuXHRcdFx0XHRzY29wZS51cGRhdGUoKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgMjogLy8gdHdvLWZpbmdlcmVkIHRvdWNoOiBkb2xseVxuXG5cdFx0XHRcdGlmICggc2NvcGUubm9ab29tID09PSB0cnVlICkgcmV0dXJuO1xuXHRcdFx0XHRpZiAoIHN0YXRlICE9PSBTVEFURS5UT1VDSF9ET0xMWSApIHJldHVybjtcblxuXHRcdFx0XHR2YXIgZHggPSBldmVudC50b3VjaGVzWyAwIF0ucGFnZVggLSBldmVudC50b3VjaGVzWyAxIF0ucGFnZVg7XG5cdFx0XHRcdHZhciBkeSA9IGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSAtIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWTtcblx0XHRcdFx0dmFyIGRpc3RhbmNlID0gTWF0aC5zcXJ0KCBkeCAqIGR4ICsgZHkgKiBkeSApO1xuXG5cdFx0XHRcdGRvbGx5RW5kLnNldCggMCwgZGlzdGFuY2UgKTtcblx0XHRcdFx0ZG9sbHlEZWx0YS5zdWJWZWN0b3JzKCBkb2xseUVuZCwgZG9sbHlTdGFydCApO1xuXG5cdFx0XHRcdGlmICggZG9sbHlEZWx0YS55ID4gMCApIHtcblxuXHRcdFx0XHRcdHNjb3BlLmRvbGx5T3V0KCk7XG5cblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdHNjb3BlLmRvbGx5SW4oKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZG9sbHlTdGFydC5jb3B5KCBkb2xseUVuZCApO1xuXG5cdFx0XHRcdHNjb3BlLnVwZGF0ZSgpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAzOiAvLyB0aHJlZS1maW5nZXJlZCB0b3VjaDogcGFuXG5cblx0XHRcdFx0aWYgKCBzY29wZS5ub1BhbiA9PT0gdHJ1ZSApIHJldHVybjtcblx0XHRcdFx0aWYgKCBzdGF0ZSAhPT0gU1RBVEUuVE9VQ0hfUEFOICkgcmV0dXJuO1xuXG5cdFx0XHRcdHBhbkVuZC5zZXQoIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCwgZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZICk7XG5cdFx0XHRcdHBhbkRlbHRhLnN1YlZlY3RvcnMoIHBhbkVuZCwgcGFuU3RhcnQgKTtcblx0XHRcdFx0XG5cdFx0XHRcdHNjb3BlLnBhbiggcGFuRGVsdGEueCwgcGFuRGVsdGEueSApO1xuXG5cdFx0XHRcdHBhblN0YXJ0LmNvcHkoIHBhbkVuZCApO1xuXG5cdFx0XHRcdHNjb3BlLnVwZGF0ZSgpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0ZGVmYXVsdDpcblxuXHRcdFx0XHRzdGF0ZSA9IFNUQVRFLk5PTkU7XG5cblx0XHR9XG5cblx0fVxuXG5cdGZ1bmN0aW9uIHRvdWNoZW5kKCAvKiBldmVudCAqLyApIHtcblxuXHRcdGlmICggc2NvcGUuZW5hYmxlZCA9PT0gZmFsc2UgKSByZXR1cm47XG5cblx0XHRzY29wZS5kaXNwYXRjaEV2ZW50KCBlbmRFdmVudCApO1xuXHRcdHN0YXRlID0gU1RBVEUuTk9ORTtcblxuXHR9XG5cblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdjb250ZXh0bWVudScsIGZ1bmN0aW9uICggZXZlbnQgKSB7IGV2ZW50LnByZXZlbnREZWZhdWx0KCk7IH0sIGZhbHNlICk7XG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vkb3duJywgb25Nb3VzZURvd24sIGZhbHNlICk7XG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2V3aGVlbCcsIG9uTW91c2VXaGVlbCwgZmFsc2UgKTtcblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdET01Nb3VzZVNjcm9sbCcsIG9uTW91c2VXaGVlbCwgZmFsc2UgKTsgLy8gZmlyZWZveFxuXG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsIHRvdWNoc3RhcnQsIGZhbHNlICk7XG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hlbmQnLCB0b3VjaGVuZCwgZmFsc2UgKTtcblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaG1vdmUnLCB0b3VjaG1vdmUsIGZhbHNlICk7XG5cblx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywgb25LZXlEb3duLCBmYWxzZSApO1xuXG5cdC8vIGZvcmNlIGFuIHVwZGF0ZSBhdCBzdGFydFxuXHR0aGlzLnVwZGF0ZSgpO1xuXG59O1xuXG5USFJFRS5PcmJpdENvbnRyb2xzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRIUkVFLkV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUgKTtcbiIsIi8qKlxuICogQG1vZHVsZSAgbGliL1RIUkVFeC9GdWxsU2NyZWVuXG4gKi9cblxuLyoqXG4qIFRoaXMgaGVscGVyIG1ha2VzIGl0IGVhc3kgdG8gaGFuZGxlIHRoZSBmdWxsc2NyZWVuIEFQSTpcbiogXG4qIC0gaXQgaGlkZXMgdGhlIHByZWZpeCBmb3IgZWFjaCBicm93c2VyXG4qIC0gaXQgaGlkZXMgdGhlIGxpdHRsZSBkaXNjcmVwZW5jaWVzIG9mIHRoZSB2YXJpb3VzIHZlbmRvciBBUElcbiogLSBhdCB0aGUgdGltZSBvZiB0aGlzIHdyaXRpbmcgKG5vdiAyMDExKSBpdCBpcyBhdmFpbGFibGUgaW4gXG4qIFxuKiAgIFtmaXJlZm94IG5pZ2h0bHldKGh0dHA6Ly9ibG9nLnBlYXJjZS5vcmcubnovMjAxMS8xMS9maXJlZm94cy1odG1sLWZ1bGwtc2NyZWVuLWFwaS1lbmFibGVkLmh0bWwpLFxuKiAgIFt3ZWJraXQgbmlnaHRseV0oaHR0cDovL3BldGVyLnNoLzIwMTEvMDEvamF2YXNjcmlwdC1mdWxsLXNjcmVlbi1hcGktbmF2aWdhdGlvbi10aW1pbmctYW5kLXJlcGVhdGluZy1jc3MtZ3JhZGllbnRzLykgYW5kXG4qICAgW2Nocm9tZSBzdGFibGVdKGh0dHA6Ly91cGRhdGVzLmh0bWw1cm9ja3MuY29tLzIwMTEvMTAvTGV0LVlvdXItQ29udGVudC1Eby10aGUtVGFsa2luZy1GdWxsc2NyZWVuLUFQSSkuXG4qIFxuKiBAbmFtZXNwYWNlXG4qL1xudmFyIGZ1bGxTY3JlZW4gPSB7fTtcblxuLyoqXG4gKiB0ZXN0IGlmIGl0IGlzIHBvc3NpYmxlIHRvIGhhdmUgZnVsbHNjcmVlblxuICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgZnVsbHNjcmVlbiBBUEkgaXMgYXZhaWxhYmxlLCBmYWxzZSBvdGhlcndpc2VcbiAqL1xuZnVsbFNjcmVlbi5hdmFpbGFibGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLl9oYXNXZWJraXRGdWxsU2NyZWVuIHx8IHRoaXMuX2hhc01vekZ1bGxTY3JlZW47XG59O1xuXG4vKipcbiAqIFRlc3QgaWYgZnVsbHNjcmVlbiBpcyBjdXJyZW50bHkgYWN0aXZhdGVkXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiBmdWxsc2NyZWVuIGlzIGN1cnJlbnRseSBhY3RpdmF0ZWQsIGZhbHNlIG90aGVyd2lzZVxuICovXG5mdWxsU2NyZWVuLmFjdGl2YXRlZCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuX2hhc1dlYmtpdEZ1bGxTY3JlZW4pIHtcbiAgICByZXR1cm4gZG9jdW1lbnQud2Via2l0SXNGdWxsU2NyZWVuO1xuICB9IGVsc2UgaWYgKHRoaXMuX2hhc01vekZ1bGxTY3JlZW4pIHtcbiAgICByZXR1cm4gZG9jdW1lbnQubW96RnVsbFNjcmVlbjtcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmFzc2VydChmYWxzZSk7XG4gIH1cbn07XG5cbi8qKlxuICogUmVxdWVzdCBmdWxsc2NyZWVuIG9uIGEgZ2l2ZW4gZWxlbWVudFxuICogQHBhcmFtIHtEb21FbGVtZW50fSBlbGVtZW50IHRvIG1ha2UgZnVsbHNjcmVlbi4gb3B0aW9uYWwuIGRlZmF1bHQgdG8gZG9jdW1lbnQuYm9keVxuICovXG5mdWxsU2NyZWVuLnJlcXVlc3QgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICBlbGVtZW50ID0gZWxlbWVudCB8fCBkb2N1bWVudC5ib2R5O1xuICBpZiAodGhpcy5faGFzV2Via2l0RnVsbFNjcmVlbikge1xuICAgIGVsZW1lbnQud2Via2l0UmVxdWVzdEZ1bGxTY3JlZW4oRWxlbWVudC5BTExPV19LRVlCT0FSRF9JTlBVVCk7XG4gIH0gZWxzZSBpZiAodGhpcy5faGFzTW96RnVsbFNjcmVlbikge1xuICAgIGVsZW1lbnQubW96UmVxdWVzdEZ1bGxTY3JlZW4oKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmFzc2VydChmYWxzZSk7XG4gIH1cbn07XG5cbi8qKlxuICogQ2FuY2VsIGZ1bGxzY3JlZW5cbiAqL1xuZnVsbFNjcmVlbi5jYW5jZWwgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLl9oYXNXZWJraXRGdWxsU2NyZWVuKSB7XG4gICAgZG9jdW1lbnQud2Via2l0Q2FuY2VsRnVsbFNjcmVlbigpO1xuICB9IGVsc2UgaWYgKHRoaXMuX2hhc01vekZ1bGxTY3JlZW4pIHtcbiAgICBkb2N1bWVudC5tb3pDYW5jZWxGdWxsU2NyZWVuKCk7XG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5hc3NlcnQoZmFsc2UpO1xuICB9XG59O1xuXG5cbi8vIGludGVybmFsIGZ1bmN0aW9ucyB0byBrbm93IHdoaWNoIGZ1bGxzY3JlZW4gQVBJIGltcGxlbWVudGF0aW9uIGlzIGF2YWlsYWJsZVxuZnVsbFNjcmVlbi5faGFzV2Via2l0RnVsbFNjcmVlbiA9ICd3ZWJraXRDYW5jZWxGdWxsU2NyZWVuJyBpbiBkb2N1bWVudCA/IHRydWUgOiBmYWxzZTtcbmZ1bGxTY3JlZW4uX2hhc01vekZ1bGxTY3JlZW4gPSAnbW96Q2FuY2VsRnVsbFNjcmVlbicgaW4gZG9jdW1lbnQgPyB0cnVlIDogZmFsc2U7XG5cbi8qKlxuICogQmluZCBhIGtleSB0byByZW5kZXJlciBzY3JlZW5zaG90XG4gKiBAcGFyYW0ge09iamVjdH0gb3B0c1xuICogQHBhcmFtIHtPYmplY3R9IFtvcHRzLmNoYXJjb2RlPWZdXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdHMuZGJsQ2xpY2s9ZmFsc2VdIFRydWUgdG8gbWFrZSBpdCBnb1xuICogZnVsbHNjcmVlbiBvbiBkb3VibGUgY2xpY2tcbiAqL1xuZnVsbFNjcmVlbi5iaW5kS2V5ID0gZnVuY3Rpb24gKG9wdHMpIHtcbiAgb3B0cyA9IG9wdHMgfHwge307XG4gIHZhciBjaGFyQ29kZSA9IG9wdHMuY2hhckNvZGUgfHwgJ2YnLmNoYXJDb2RlQXQoMCk7XG4gIHZhciBkYmxjbGljayA9IG9wdHMuZGJsY2xpY2sgIT09IHVuZGVmaW5lZCA/IG9wdHMuZGJsY2xpY2sgOiBmYWxzZTtcbiAgdmFyIGVsZW1lbnQgPSBvcHRzLmVsZW1lbnQ7XG5cbiAgdmFyIHRvZ2dsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoZnVsbFNjcmVlbi5hY3RpdmF0ZWQoKSkge1xuICAgICAgZnVsbFNjcmVlbi5jYW5jZWwoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZnVsbFNjcmVlbi5yZXF1ZXN0KGVsZW1lbnQpO1xuICAgIH1cbiAgfTtcblxuICAvLyBjYWxsYmFjayB0byBoYW5kbGUga2V5cHJlc3NcbiAgdmFyIF9fYmluZCA9IGZ1bmN0aW9uIChmbiwgbWUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGZuLmFwcGx5KG1lLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH07XG4gIHZhciBvbktleVByZXNzID0gX19iaW5kKGZ1bmN0aW9uIChldmVudCkge1xuICAgIC8vIHJldHVybiBub3cgaWYgdGhlIEtleVByZXNzIGlzbnQgZm9yIHRoZSBwcm9wZXIgY2hhckNvZGVcbiAgICBpZiAoZXZlbnQud2hpY2ggIT09IGNoYXJDb2RlKSB7IHJldHVybjsgfVxuICAgIC8vIHRvZ2dsZSBmdWxsc2NyZWVuXG4gICAgdG9nZ2xlKCk7XG4gIH0sIHRoaXMpO1xuXG4gIC8vIGxpc3RlbiB0byBrZXlwcmVzc1xuICAvLyBOT1RFOiBmb3IgZmlyZWZveCBpdCBzZWVtcyBtYW5kYXRvcnkgdG8gbGlzdGVuIHRvIGRvY3VtZW50IGRpcmVjdGx5XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXByZXNzJywgb25LZXlQcmVzcywgZmFsc2UpO1xuICAvLyBsaXN0ZW4gdG8gZGJsY2xpY2tcbiAgZGJsY2xpY2sgJiYgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZGJsY2xpY2snLCB0b2dnbGUsIGZhbHNlKTtcblxuICByZXR1cm4ge1xuICAgIHVuYmluZDogZnVuY3Rpb24gKCkge1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5cHJlc3MnLCBvbktleVByZXNzLCBmYWxzZSk7XG4gICAgICBkYmxjbGljayAmJiBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdkYmxjbGljaycsIHRvZ2dsZSwgZmFsc2UpO1xuICAgIH1cbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVsbFNjcmVlbjsiLCIvKipcbiAqIEBtb2R1bGUgIGxpYi9USFJFRXgvV2luZG93UmVzaXplXG4gKi9cblxuLyoqXG4gKiBUaGlzIGhlbHBlciBtYWtlcyBpdCBlYXN5IHRvIGhhbmRsZSB3aW5kb3cgcmVzaXplLlxuICogSXQgd2lsbCB1cGRhdGUgcmVuZGVyZXIgYW5kIGNhbWVyYSB3aGVuIHdpbmRvdyBpcyByZXNpemVkLlxuICpcbiAqIEBleGFtcGxlXG4gKiAvLyBTdGFydCB1cGRhdGluZyByZW5kZXJlciBhbmQgY2FtZXJhXG4gKiB2YXIgd2luZG93UmVzaXplID0gV2luZG93UmVzaXplKGFSZW5kZXJlciwgYUNhbWVyYSk7XG4gKiAvL1N0YXJ0IHVwZGF0aW5nIHJlbmRlcmVyIGFuZCBjYW1lcmFcbiAqIHdpbmRvd1Jlc2l6ZS5zdG9wKClcbiAqXG4gKiBAbmFtZXNwYWNlXG4gKiBAcGFyYW0ge09iamVjdH0gcmVuZGVyZXIgdGhlIHJlbmRlcmVyIHRvIHVwZGF0ZVxuICogQHBhcmFtIHtPYmplY3R9IENhbWVyYSB0aGUgY2FtZXJhIHRvIHVwZGF0ZVxuICovXG52YXIgd2luZG93UmVzaXplID0gZnVuY3Rpb24gKHJlbmRlcmVyLCBjYW1lcmEpIHtcblx0dmFyIGNhbGxiYWNrID0gZnVuY3Rpb24oKSB7XG5cdFx0Ly8gbm90aWZ5IHRoZSByZW5kZXJlciBvZiB0aGUgc2l6ZSBjaGFuZ2Vcblx0XHRyZW5kZXJlci5zZXRTaXplKCB3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0ICk7XG5cdFx0Ly8gdXBkYXRlIHRoZSBjYW1lcmFcblx0XHRjYW1lcmEuYXNwZWN0XHQ9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0O1xuXHRcdGNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG5cdH07XG5cdC8vIGJpbmQgdGhlIHJlc2l6ZSBldmVudFxuXHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgY2FsbGJhY2ssIGZhbHNlKTtcblx0Ly8gcmV0dXJuIC5zdG9wKCkgdGhlIGZ1bmN0aW9uIHRvIHN0b3Agd2F0Y2hpbmcgd2luZG93IHJlc2l6ZVxuXHRyZXR1cm4ge1xuXHRcdHN0b3BcdDogZnVuY3Rpb24oKXtcblx0XHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCBjYWxsYmFjayk7XG5cdFx0fVxuXHR9O1xufTtcblxuLyoqXG4gKiBAc3RhdGljXG4gKiBAcGFyYW0gIHtUSFJFRS5XZWJHTFJlbmRlcmVyfSByZW5kZXJlclxuICogQHBhcmFtICB7VEhSRUUuUGVyc3BlY3RpdmVDYW1lcmF9IGNhbWVyYVxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG53aW5kb3dSZXNpemUuYmluZFx0PSBmdW5jdGlvbihyZW5kZXJlciwgY2FtZXJhKXtcblx0cmV0dXJuIHdpbmRvd1Jlc2l6ZShyZW5kZXJlciwgY2FtZXJhKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gd2luZG93UmVzaXplOyIsIi8qKlxuICogQG5hbWUgVEhSRUV4XG4gKiB0aHJlZS5qcyBleHRlbnNpb25zXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgV2luZG93UmVzaXplOiByZXF1aXJlKCcuL1dpbmRvd1Jlc2l6ZScpLFxuICBGdWxsU2NyZWVuOiByZXF1aXJlKCcuL0Z1bGxTY3JlZW4nKVxufTsiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG47X19icm93c2VyaWZ5X3NoaW1fcmVxdWlyZV9fPXJlcXVpcmU7KGZ1bmN0aW9uIGJyb3dzZXJpZnlTaGltKG1vZHVsZSwgZXhwb3J0cywgcmVxdWlyZSwgZGVmaW5lLCBicm93c2VyaWZ5X3NoaW1fX2RlZmluZV9fbW9kdWxlX19leHBvcnRfXykge1xuLyoqXG4gKiBkYXQtZ3VpIEphdmFTY3JpcHQgQ29udHJvbGxlciBMaWJyYXJ5XG4gKiBodHRwOi8vY29kZS5nb29nbGUuY29tL3AvZGF0LWd1aVxuICpcbiAqIENvcHlyaWdodCAyMDExIERhdGEgQXJ0cyBUZWFtLCBHb29nbGUgQ3JlYXRpdmUgTGFiXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICovXG52YXIgZGF0PWRhdHx8e307ZGF0Lmd1aT1kYXQuZ3VpfHx7fTtkYXQudXRpbHM9ZGF0LnV0aWxzfHx7fTtkYXQuY29udHJvbGxlcnM9ZGF0LmNvbnRyb2xsZXJzfHx7fTtkYXQuZG9tPWRhdC5kb218fHt9O2RhdC5jb2xvcj1kYXQuY29sb3J8fHt9O2RhdC51dGlscy5jc3M9ZnVuY3Rpb24oKXtyZXR1cm57bG9hZDpmdW5jdGlvbihlLGEpe3ZhciBhPWF8fGRvY3VtZW50LGM9YS5jcmVhdGVFbGVtZW50KFwibGlua1wiKTtjLnR5cGU9XCJ0ZXh0L2Nzc1wiO2MucmVsPVwic3R5bGVzaGVldFwiO2MuaHJlZj1lO2EuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJoZWFkXCIpWzBdLmFwcGVuZENoaWxkKGMpfSxpbmplY3Q6ZnVuY3Rpb24oZSxhKXt2YXIgYT1hfHxkb2N1bWVudCxjPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtjLnR5cGU9XCJ0ZXh0L2Nzc1wiO2MuaW5uZXJIVE1MPWU7YS5nZXRFbGVtZW50c0J5VGFnTmFtZShcImhlYWRcIilbMF0uYXBwZW5kQ2hpbGQoYyl9fX0oKTtcbmRhdC51dGlscy5jb21tb249ZnVuY3Rpb24oKXt2YXIgZT1BcnJheS5wcm90b3R5cGUuZm9yRWFjaCxhPUFycmF5LnByb3RvdHlwZS5zbGljZTtyZXR1cm57QlJFQUs6e30sZXh0ZW5kOmZ1bmN0aW9uKGMpe3RoaXMuZWFjaChhLmNhbGwoYXJndW1lbnRzLDEpLGZ1bmN0aW9uKGEpe2Zvcih2YXIgZiBpbiBhKXRoaXMuaXNVbmRlZmluZWQoYVtmXSl8fChjW2ZdPWFbZl0pfSx0aGlzKTtyZXR1cm4gY30sZGVmYXVsdHM6ZnVuY3Rpb24oYyl7dGhpcy5lYWNoKGEuY2FsbChhcmd1bWVudHMsMSksZnVuY3Rpb24oYSl7Zm9yKHZhciBmIGluIGEpdGhpcy5pc1VuZGVmaW5lZChjW2ZdKSYmKGNbZl09YVtmXSl9LHRoaXMpO3JldHVybiBjfSxjb21wb3NlOmZ1bmN0aW9uKCl7dmFyIGM9YS5jYWxsKGFyZ3VtZW50cyk7cmV0dXJuIGZ1bmN0aW9uKCl7Zm9yKHZhciBkPWEuY2FsbChhcmd1bWVudHMpLGY9Yy5sZW5ndGgtMTtmPj0wO2YtLSlkPVtjW2ZdLmFwcGx5KHRoaXMsZCldO3JldHVybiBkWzBdfX0sXG5lYWNoOmZ1bmN0aW9uKGEsZCxmKXtpZihlJiZhLmZvckVhY2g9PT1lKWEuZm9yRWFjaChkLGYpO2Vsc2UgaWYoYS5sZW5ndGg9PT1hLmxlbmd0aCswKWZvcih2YXIgYj0wLG49YS5sZW5ndGg7YjxuO2IrKyl7aWYoYiBpbiBhJiZkLmNhbGwoZixhW2JdLGIpPT09dGhpcy5CUkVBSylicmVha31lbHNlIGZvcihiIGluIGEpaWYoZC5jYWxsKGYsYVtiXSxiKT09PXRoaXMuQlJFQUspYnJlYWt9LGRlZmVyOmZ1bmN0aW9uKGEpe3NldFRpbWVvdXQoYSwwKX0sdG9BcnJheTpmdW5jdGlvbihjKXtyZXR1cm4gYy50b0FycmF5P2MudG9BcnJheSgpOmEuY2FsbChjKX0saXNVbmRlZmluZWQ6ZnVuY3Rpb24oYSl7cmV0dXJuIGE9PT12b2lkIDB9LGlzTnVsbDpmdW5jdGlvbihhKXtyZXR1cm4gYT09PW51bGx9LGlzTmFOOmZ1bmN0aW9uKGEpe3JldHVybiBhIT09YX0saXNBcnJheTpBcnJheS5pc0FycmF5fHxmdW5jdGlvbihhKXtyZXR1cm4gYS5jb25zdHJ1Y3Rvcj09PUFycmF5fSxpc09iamVjdDpmdW5jdGlvbihhKXtyZXR1cm4gYT09PVxuT2JqZWN0KGEpfSxpc051bWJlcjpmdW5jdGlvbihhKXtyZXR1cm4gYT09PWErMH0saXNTdHJpbmc6ZnVuY3Rpb24oYSl7cmV0dXJuIGE9PT1hK1wiXCJ9LGlzQm9vbGVhbjpmdW5jdGlvbihhKXtyZXR1cm4gYT09PWZhbHNlfHxhPT09dHJ1ZX0saXNGdW5jdGlvbjpmdW5jdGlvbihhKXtyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGEpPT09XCJbb2JqZWN0IEZ1bmN0aW9uXVwifX19KCk7XG5kYXQuY29udHJvbGxlcnMuQ29udHJvbGxlcj1mdW5jdGlvbihlKXt2YXIgYT1mdW5jdGlvbihhLGQpe3RoaXMuaW5pdGlhbFZhbHVlPWFbZF07dGhpcy5kb21FbGVtZW50PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7dGhpcy5vYmplY3Q9YTt0aGlzLnByb3BlcnR5PWQ7dGhpcy5fX29uRmluaXNoQ2hhbmdlPXRoaXMuX19vbkNoYW5nZT12b2lkIDB9O2UuZXh0ZW5kKGEucHJvdG90eXBlLHtvbkNoYW5nZTpmdW5jdGlvbihhKXt0aGlzLl9fb25DaGFuZ2U9YTtyZXR1cm4gdGhpc30sb25GaW5pc2hDaGFuZ2U6ZnVuY3Rpb24oYSl7dGhpcy5fX29uRmluaXNoQ2hhbmdlPWE7cmV0dXJuIHRoaXN9LHNldFZhbHVlOmZ1bmN0aW9uKGEpe3RoaXMub2JqZWN0W3RoaXMucHJvcGVydHldPWE7dGhpcy5fX29uQ2hhbmdlJiZ0aGlzLl9fb25DaGFuZ2UuY2FsbCh0aGlzLGEpO3RoaXMudXBkYXRlRGlzcGxheSgpO3JldHVybiB0aGlzfSxnZXRWYWx1ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLm9iamVjdFt0aGlzLnByb3BlcnR5XX0sXG51cGRhdGVEaXNwbGF5OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXN9LGlzTW9kaWZpZWQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5pbml0aWFsVmFsdWUhPT10aGlzLmdldFZhbHVlKCl9fSk7cmV0dXJuIGF9KGRhdC51dGlscy5jb21tb24pO1xuZGF0LmRvbS5kb209ZnVuY3Rpb24oZSl7ZnVuY3Rpb24gYShiKXtpZihiPT09XCIwXCJ8fGUuaXNVbmRlZmluZWQoYikpcmV0dXJuIDA7Yj1iLm1hdGNoKGQpO3JldHVybiFlLmlzTnVsbChiKT9wYXJzZUZsb2F0KGJbMV0pOjB9dmFyIGM9e307ZS5lYWNoKHtIVE1MRXZlbnRzOltcImNoYW5nZVwiXSxNb3VzZUV2ZW50czpbXCJjbGlja1wiLFwibW91c2Vtb3ZlXCIsXCJtb3VzZWRvd25cIixcIm1vdXNldXBcIixcIm1vdXNlb3ZlclwiXSxLZXlib2FyZEV2ZW50czpbXCJrZXlkb3duXCJdfSxmdW5jdGlvbihiLGEpe2UuZWFjaChiLGZ1bmN0aW9uKGIpe2NbYl09YX0pfSk7dmFyIGQ9LyhcXGQrKFxcLlxcZCspPylweC8sZj17bWFrZVNlbGVjdGFibGU6ZnVuY3Rpb24oYixhKXtpZighKGI9PT12b2lkIDB8fGIuc3R5bGU9PT12b2lkIDApKWIub25zZWxlY3RzdGFydD1hP2Z1bmN0aW9uKCl7cmV0dXJuIGZhbHNlfTpmdW5jdGlvbigpe30sYi5zdHlsZS5Nb3pVc2VyU2VsZWN0PWE/XCJhdXRvXCI6XCJub25lXCIsYi5zdHlsZS5LaHRtbFVzZXJTZWxlY3Q9XG5hP1wiYXV0b1wiOlwibm9uZVwiLGIudW5zZWxlY3RhYmxlPWE/XCJvblwiOlwib2ZmXCJ9LG1ha2VGdWxsc2NyZWVuOmZ1bmN0aW9uKGIsYSxkKXtlLmlzVW5kZWZpbmVkKGEpJiYoYT10cnVlKTtlLmlzVW5kZWZpbmVkKGQpJiYoZD10cnVlKTtiLnN0eWxlLnBvc2l0aW9uPVwiYWJzb2x1dGVcIjtpZihhKWIuc3R5bGUubGVmdD0wLGIuc3R5bGUucmlnaHQ9MDtpZihkKWIuc3R5bGUudG9wPTAsYi5zdHlsZS5ib3R0b209MH0sZmFrZUV2ZW50OmZ1bmN0aW9uKGIsYSxkLGYpe3ZhciBkPWR8fHt9LG09Y1thXTtpZighbSl0aHJvdyBFcnJvcihcIkV2ZW50IHR5cGUgXCIrYStcIiBub3Qgc3VwcG9ydGVkLlwiKTt2YXIgbD1kb2N1bWVudC5jcmVhdGVFdmVudChtKTtzd2l0Y2gobSl7Y2FzZSBcIk1vdXNlRXZlbnRzXCI6bC5pbml0TW91c2VFdmVudChhLGQuYnViYmxlc3x8ZmFsc2UsZC5jYW5jZWxhYmxlfHx0cnVlLHdpbmRvdyxkLmNsaWNrQ291bnR8fDEsMCwwLGQueHx8ZC5jbGllbnRYfHwwLGQueXx8ZC5jbGllbnRZfHxcbjAsZmFsc2UsZmFsc2UsZmFsc2UsZmFsc2UsMCxudWxsKTticmVhaztjYXNlIFwiS2V5Ym9hcmRFdmVudHNcIjptPWwuaW5pdEtleWJvYXJkRXZlbnR8fGwuaW5pdEtleUV2ZW50O2UuZGVmYXVsdHMoZCx7Y2FuY2VsYWJsZTp0cnVlLGN0cmxLZXk6ZmFsc2UsYWx0S2V5OmZhbHNlLHNoaWZ0S2V5OmZhbHNlLG1ldGFLZXk6ZmFsc2Usa2V5Q29kZTp2b2lkIDAsY2hhckNvZGU6dm9pZCAwfSk7bShhLGQuYnViYmxlc3x8ZmFsc2UsZC5jYW5jZWxhYmxlLHdpbmRvdyxkLmN0cmxLZXksZC5hbHRLZXksZC5zaGlmdEtleSxkLm1ldGFLZXksZC5rZXlDb2RlLGQuY2hhckNvZGUpO2JyZWFrO2RlZmF1bHQ6bC5pbml0RXZlbnQoYSxkLmJ1YmJsZXN8fGZhbHNlLGQuY2FuY2VsYWJsZXx8dHJ1ZSl9ZS5kZWZhdWx0cyhsLGYpO2IuZGlzcGF0Y2hFdmVudChsKX0sYmluZDpmdW5jdGlvbihiLGEsZCxjKXtiLmFkZEV2ZW50TGlzdGVuZXI/Yi5hZGRFdmVudExpc3RlbmVyKGEsZCxjfHxmYWxzZSk6Yi5hdHRhY2hFdmVudCYmXG5iLmF0dGFjaEV2ZW50KFwib25cIithLGQpO3JldHVybiBmfSx1bmJpbmQ6ZnVuY3Rpb24oYixhLGQsYyl7Yi5yZW1vdmVFdmVudExpc3RlbmVyP2IucmVtb3ZlRXZlbnRMaXN0ZW5lcihhLGQsY3x8ZmFsc2UpOmIuZGV0YWNoRXZlbnQmJmIuZGV0YWNoRXZlbnQoXCJvblwiK2EsZCk7cmV0dXJuIGZ9LGFkZENsYXNzOmZ1bmN0aW9uKGIsYSl7aWYoYi5jbGFzc05hbWU9PT12b2lkIDApYi5jbGFzc05hbWU9YTtlbHNlIGlmKGIuY2xhc3NOYW1lIT09YSl7dmFyIGQ9Yi5jbGFzc05hbWUuc3BsaXQoLyArLyk7aWYoZC5pbmRleE9mKGEpPT0tMSlkLnB1c2goYSksYi5jbGFzc05hbWU9ZC5qb2luKFwiIFwiKS5yZXBsYWNlKC9eXFxzKy8sXCJcIikucmVwbGFjZSgvXFxzKyQvLFwiXCIpfXJldHVybiBmfSxyZW1vdmVDbGFzczpmdW5jdGlvbihiLGEpe2lmKGEpe2lmKGIuY2xhc3NOYW1lIT09dm9pZCAwKWlmKGIuY2xhc3NOYW1lPT09YSliLnJlbW92ZUF0dHJpYnV0ZShcImNsYXNzXCIpO2Vsc2V7dmFyIGQ9Yi5jbGFzc05hbWUuc3BsaXQoLyArLyksXG5jPWQuaW5kZXhPZihhKTtpZihjIT0tMSlkLnNwbGljZShjLDEpLGIuY2xhc3NOYW1lPWQuam9pbihcIiBcIil9fWVsc2UgYi5jbGFzc05hbWU9dm9pZCAwO3JldHVybiBmfSxoYXNDbGFzczpmdW5jdGlvbihhLGQpe3JldHVybiBSZWdFeHAoXCIoPzpefFxcXFxzKylcIitkK1wiKD86XFxcXHMrfCQpXCIpLnRlc3QoYS5jbGFzc05hbWUpfHxmYWxzZX0sZ2V0V2lkdGg6ZnVuY3Rpb24oYil7Yj1nZXRDb21wdXRlZFN0eWxlKGIpO3JldHVybiBhKGJbXCJib3JkZXItbGVmdC13aWR0aFwiXSkrYShiW1wiYm9yZGVyLXJpZ2h0LXdpZHRoXCJdKSthKGJbXCJwYWRkaW5nLWxlZnRcIl0pK2EoYltcInBhZGRpbmctcmlnaHRcIl0pK2EoYi53aWR0aCl9LGdldEhlaWdodDpmdW5jdGlvbihiKXtiPWdldENvbXB1dGVkU3R5bGUoYik7cmV0dXJuIGEoYltcImJvcmRlci10b3Atd2lkdGhcIl0pK2EoYltcImJvcmRlci1ib3R0b20td2lkdGhcIl0pK2EoYltcInBhZGRpbmctdG9wXCJdKSthKGJbXCJwYWRkaW5nLWJvdHRvbVwiXSkrYShiLmhlaWdodCl9LFxuZ2V0T2Zmc2V0OmZ1bmN0aW9uKGEpe3ZhciBkPXtsZWZ0OjAsdG9wOjB9O2lmKGEub2Zmc2V0UGFyZW50KXtkbyBkLmxlZnQrPWEub2Zmc2V0TGVmdCxkLnRvcCs9YS5vZmZzZXRUb3A7d2hpbGUoYT1hLm9mZnNldFBhcmVudCl9cmV0dXJuIGR9LGlzQWN0aXZlOmZ1bmN0aW9uKGEpe3JldHVybiBhPT09ZG9jdW1lbnQuYWN0aXZlRWxlbWVudCYmKGEudHlwZXx8YS5ocmVmKX19O3JldHVybiBmfShkYXQudXRpbHMuY29tbW9uKTtcbmRhdC5jb250cm9sbGVycy5PcHRpb25Db250cm9sbGVyPWZ1bmN0aW9uKGUsYSxjKXt2YXIgZD1mdW5jdGlvbihmLGIsZSl7ZC5zdXBlcmNsYXNzLmNhbGwodGhpcyxmLGIpO3ZhciBoPXRoaXM7dGhpcy5fX3NlbGVjdD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2VsZWN0XCIpO2lmKGMuaXNBcnJheShlKSl7dmFyIGo9e307Yy5lYWNoKGUsZnVuY3Rpb24oYSl7althXT1hfSk7ZT1qfWMuZWFjaChlLGZ1bmN0aW9uKGEsYil7dmFyIGQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIm9wdGlvblwiKTtkLmlubmVySFRNTD1iO2Quc2V0QXR0cmlidXRlKFwidmFsdWVcIixhKTtoLl9fc2VsZWN0LmFwcGVuZENoaWxkKGQpfSk7dGhpcy51cGRhdGVEaXNwbGF5KCk7YS5iaW5kKHRoaXMuX19zZWxlY3QsXCJjaGFuZ2VcIixmdW5jdGlvbigpe2guc2V0VmFsdWUodGhpcy5vcHRpb25zW3RoaXMuc2VsZWN0ZWRJbmRleF0udmFsdWUpfSk7dGhpcy5kb21FbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX19zZWxlY3QpfTtcbmQuc3VwZXJjbGFzcz1lO2MuZXh0ZW5kKGQucHJvdG90eXBlLGUucHJvdG90eXBlLHtzZXRWYWx1ZTpmdW5jdGlvbihhKXthPWQuc3VwZXJjbGFzcy5wcm90b3R5cGUuc2V0VmFsdWUuY2FsbCh0aGlzLGEpO3RoaXMuX19vbkZpbmlzaENoYW5nZSYmdGhpcy5fX29uRmluaXNoQ2hhbmdlLmNhbGwodGhpcyx0aGlzLmdldFZhbHVlKCkpO3JldHVybiBhfSx1cGRhdGVEaXNwbGF5OmZ1bmN0aW9uKCl7dGhpcy5fX3NlbGVjdC52YWx1ZT10aGlzLmdldFZhbHVlKCk7cmV0dXJuIGQuc3VwZXJjbGFzcy5wcm90b3R5cGUudXBkYXRlRGlzcGxheS5jYWxsKHRoaXMpfX0pO3JldHVybiBkfShkYXQuY29udHJvbGxlcnMuQ29udHJvbGxlcixkYXQuZG9tLmRvbSxkYXQudXRpbHMuY29tbW9uKTtcbmRhdC5jb250cm9sbGVycy5OdW1iZXJDb250cm9sbGVyPWZ1bmN0aW9uKGUsYSl7dmFyIGM9ZnVuY3Rpb24oZCxmLGIpe2Muc3VwZXJjbGFzcy5jYWxsKHRoaXMsZCxmKTtiPWJ8fHt9O3RoaXMuX19taW49Yi5taW47dGhpcy5fX21heD1iLm1heDt0aGlzLl9fc3RlcD1iLnN0ZXA7ZD10aGlzLl9faW1wbGllZFN0ZXA9YS5pc1VuZGVmaW5lZCh0aGlzLl9fc3RlcCk/dGhpcy5pbml0aWFsVmFsdWU9PTA/MTpNYXRoLnBvdygxMCxNYXRoLmZsb29yKE1hdGgubG9nKHRoaXMuaW5pdGlhbFZhbHVlKS9NYXRoLkxOMTApKS8xMDp0aGlzLl9fc3RlcDtkPWQudG9TdHJpbmcoKTt0aGlzLl9fcHJlY2lzaW9uPWQuaW5kZXhPZihcIi5cIik+LTE/ZC5sZW5ndGgtZC5pbmRleE9mKFwiLlwiKS0xOjB9O2Muc3VwZXJjbGFzcz1lO2EuZXh0ZW5kKGMucHJvdG90eXBlLGUucHJvdG90eXBlLHtzZXRWYWx1ZTpmdW5jdGlvbihhKXtpZih0aGlzLl9fbWluIT09dm9pZCAwJiZhPHRoaXMuX19taW4pYT10aGlzLl9fbWluO1xuZWxzZSBpZih0aGlzLl9fbWF4IT09dm9pZCAwJiZhPnRoaXMuX19tYXgpYT10aGlzLl9fbWF4O3RoaXMuX19zdGVwIT09dm9pZCAwJiZhJXRoaXMuX19zdGVwIT0wJiYoYT1NYXRoLnJvdW5kKGEvdGhpcy5fX3N0ZXApKnRoaXMuX19zdGVwKTtyZXR1cm4gYy5zdXBlcmNsYXNzLnByb3RvdHlwZS5zZXRWYWx1ZS5jYWxsKHRoaXMsYSl9LG1pbjpmdW5jdGlvbihhKXt0aGlzLl9fbWluPWE7cmV0dXJuIHRoaXN9LG1heDpmdW5jdGlvbihhKXt0aGlzLl9fbWF4PWE7cmV0dXJuIHRoaXN9LHN0ZXA6ZnVuY3Rpb24oYSl7dGhpcy5fX3N0ZXA9YTtyZXR1cm4gdGhpc319KTtyZXR1cm4gY30oZGF0LmNvbnRyb2xsZXJzLkNvbnRyb2xsZXIsZGF0LnV0aWxzLmNvbW1vbik7XG5kYXQuY29udHJvbGxlcnMuTnVtYmVyQ29udHJvbGxlckJveD1mdW5jdGlvbihlLGEsYyl7dmFyIGQ9ZnVuY3Rpb24oZixiLGUpe2Z1bmN0aW9uIGgoKXt2YXIgYT1wYXJzZUZsb2F0KGwuX19pbnB1dC52YWx1ZSk7Yy5pc05hTihhKXx8bC5zZXRWYWx1ZShhKX1mdW5jdGlvbiBqKGEpe3ZhciBiPW8tYS5jbGllbnRZO2wuc2V0VmFsdWUobC5nZXRWYWx1ZSgpK2IqbC5fX2ltcGxpZWRTdGVwKTtvPWEuY2xpZW50WX1mdW5jdGlvbiBtKCl7YS51bmJpbmQod2luZG93LFwibW91c2Vtb3ZlXCIsaik7YS51bmJpbmQod2luZG93LFwibW91c2V1cFwiLG0pfXRoaXMuX190cnVuY2F0aW9uU3VzcGVuZGVkPWZhbHNlO2Quc3VwZXJjbGFzcy5jYWxsKHRoaXMsZixiLGUpO3ZhciBsPXRoaXMsbzt0aGlzLl9faW5wdXQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO3RoaXMuX19pbnB1dC5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsXCJ0ZXh0XCIpO2EuYmluZCh0aGlzLl9faW5wdXQsXCJjaGFuZ2VcIixoKTtcbmEuYmluZCh0aGlzLl9faW5wdXQsXCJibHVyXCIsZnVuY3Rpb24oKXtoKCk7bC5fX29uRmluaXNoQ2hhbmdlJiZsLl9fb25GaW5pc2hDaGFuZ2UuY2FsbChsLGwuZ2V0VmFsdWUoKSl9KTthLmJpbmQodGhpcy5fX2lucHV0LFwibW91c2Vkb3duXCIsZnVuY3Rpb24oYil7YS5iaW5kKHdpbmRvdyxcIm1vdXNlbW92ZVwiLGopO2EuYmluZCh3aW5kb3csXCJtb3VzZXVwXCIsbSk7bz1iLmNsaWVudFl9KTthLmJpbmQodGhpcy5fX2lucHV0LFwia2V5ZG93blwiLGZ1bmN0aW9uKGEpe2lmKGEua2V5Q29kZT09PTEzKWwuX190cnVuY2F0aW9uU3VzcGVuZGVkPXRydWUsdGhpcy5ibHVyKCksbC5fX3RydW5jYXRpb25TdXNwZW5kZWQ9ZmFsc2V9KTt0aGlzLnVwZGF0ZURpc3BsYXkoKTt0aGlzLmRvbUVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5fX2lucHV0KX07ZC5zdXBlcmNsYXNzPWU7Yy5leHRlbmQoZC5wcm90b3R5cGUsZS5wcm90b3R5cGUse3VwZGF0ZURpc3BsYXk6ZnVuY3Rpb24oKXt2YXIgYT10aGlzLl9faW5wdXQsXG5iO2lmKHRoaXMuX190cnVuY2F0aW9uU3VzcGVuZGVkKWI9dGhpcy5nZXRWYWx1ZSgpO2Vsc2V7Yj10aGlzLmdldFZhbHVlKCk7dmFyIGM9TWF0aC5wb3coMTAsdGhpcy5fX3ByZWNpc2lvbik7Yj1NYXRoLnJvdW5kKGIqYykvY31hLnZhbHVlPWI7cmV0dXJuIGQuc3VwZXJjbGFzcy5wcm90b3R5cGUudXBkYXRlRGlzcGxheS5jYWxsKHRoaXMpfX0pO3JldHVybiBkfShkYXQuY29udHJvbGxlcnMuTnVtYmVyQ29udHJvbGxlcixkYXQuZG9tLmRvbSxkYXQudXRpbHMuY29tbW9uKTtcbmRhdC5jb250cm9sbGVycy5OdW1iZXJDb250cm9sbGVyU2xpZGVyPWZ1bmN0aW9uKGUsYSxjLGQsZil7dmFyIGI9ZnVuY3Rpb24oZCxjLGYsZSxsKXtmdW5jdGlvbiBvKGIpe2IucHJldmVudERlZmF1bHQoKTt2YXIgZD1hLmdldE9mZnNldChnLl9fYmFja2dyb3VuZCksYz1hLmdldFdpZHRoKGcuX19iYWNrZ3JvdW5kKTtnLnNldFZhbHVlKGcuX19taW4rKGcuX19tYXgtZy5fX21pbikqKChiLmNsaWVudFgtZC5sZWZ0KS8oZC5sZWZ0K2MtZC5sZWZ0KSkpO3JldHVybiBmYWxzZX1mdW5jdGlvbiB5KCl7YS51bmJpbmQod2luZG93LFwibW91c2Vtb3ZlXCIsbyk7YS51bmJpbmQod2luZG93LFwibW91c2V1cFwiLHkpO2cuX19vbkZpbmlzaENoYW5nZSYmZy5fX29uRmluaXNoQ2hhbmdlLmNhbGwoZyxnLmdldFZhbHVlKCkpfWIuc3VwZXJjbGFzcy5jYWxsKHRoaXMsZCxjLHttaW46ZixtYXg6ZSxzdGVwOmx9KTt2YXIgZz10aGlzO3RoaXMuX19iYWNrZ3JvdW5kPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG50aGlzLl9fZm9yZWdyb3VuZD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO2EuYmluZCh0aGlzLl9fYmFja2dyb3VuZCxcIm1vdXNlZG93blwiLGZ1bmN0aW9uKGIpe2EuYmluZCh3aW5kb3csXCJtb3VzZW1vdmVcIixvKTthLmJpbmQod2luZG93LFwibW91c2V1cFwiLHkpO28oYil9KTthLmFkZENsYXNzKHRoaXMuX19iYWNrZ3JvdW5kLFwic2xpZGVyXCIpO2EuYWRkQ2xhc3ModGhpcy5fX2ZvcmVncm91bmQsXCJzbGlkZXItZmdcIik7dGhpcy51cGRhdGVEaXNwbGF5KCk7dGhpcy5fX2JhY2tncm91bmQuYXBwZW5kQ2hpbGQodGhpcy5fX2ZvcmVncm91bmQpO3RoaXMuZG9tRWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLl9fYmFja2dyb3VuZCl9O2Iuc3VwZXJjbGFzcz1lO2IudXNlRGVmYXVsdFN0eWxlcz1mdW5jdGlvbigpe2MuaW5qZWN0KGYpfTtkLmV4dGVuZChiLnByb3RvdHlwZSxlLnByb3RvdHlwZSx7dXBkYXRlRGlzcGxheTpmdW5jdGlvbigpe3RoaXMuX19mb3JlZ3JvdW5kLnN0eWxlLndpZHRoPVxuKHRoaXMuZ2V0VmFsdWUoKS10aGlzLl9fbWluKS8odGhpcy5fX21heC10aGlzLl9fbWluKSoxMDArXCIlXCI7cmV0dXJuIGIuc3VwZXJjbGFzcy5wcm90b3R5cGUudXBkYXRlRGlzcGxheS5jYWxsKHRoaXMpfX0pO3JldHVybiBifShkYXQuY29udHJvbGxlcnMuTnVtYmVyQ29udHJvbGxlcixkYXQuZG9tLmRvbSxkYXQudXRpbHMuY3NzLGRhdC51dGlscy5jb21tb24sXCIuc2xpZGVyIHtcXG4gIGJveC1zaGFkb3c6IGluc2V0IDAgMnB4IDRweCByZ2JhKDAsMCwwLDAuMTUpO1xcbiAgaGVpZ2h0OiAxZW07XFxuICBib3JkZXItcmFkaXVzOiAxZW07XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZWVlO1xcbiAgcGFkZGluZzogMCAwLjVlbTtcXG4gIG92ZXJmbG93OiBoaWRkZW47XFxufVxcblxcbi5zbGlkZXItZmcge1xcbiAgcGFkZGluZzogMXB4IDAgMnB4IDA7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjYWFhO1xcbiAgaGVpZ2h0OiAxZW07XFxuICBtYXJnaW4tbGVmdDogLTAuNWVtO1xcbiAgcGFkZGluZy1yaWdodDogMC41ZW07XFxuICBib3JkZXItcmFkaXVzOiAxZW0gMCAwIDFlbTtcXG59XFxuXFxuLnNsaWRlci1mZzphZnRlciB7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBib3JkZXItcmFkaXVzOiAxZW07XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgYm9yZGVyOiAgMXB4IHNvbGlkICNhYWE7XFxuICBjb250ZW50OiAnJztcXG4gIGZsb2F0OiByaWdodDtcXG4gIG1hcmdpbi1yaWdodDogLTFlbTtcXG4gIG1hcmdpbi10b3A6IC0xcHg7XFxuICBoZWlnaHQ6IDAuOWVtO1xcbiAgd2lkdGg6IDAuOWVtO1xcbn1cIik7XG5kYXQuY29udHJvbGxlcnMuRnVuY3Rpb25Db250cm9sbGVyPWZ1bmN0aW9uKGUsYSxjKXt2YXIgZD1mdW5jdGlvbihjLGIsZSl7ZC5zdXBlcmNsYXNzLmNhbGwodGhpcyxjLGIpO3ZhciBoPXRoaXM7dGhpcy5fX2J1dHRvbj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO3RoaXMuX19idXR0b24uaW5uZXJIVE1MPWU9PT12b2lkIDA/XCJGaXJlXCI6ZTthLmJpbmQodGhpcy5fX2J1dHRvbixcImNsaWNrXCIsZnVuY3Rpb24oYSl7YS5wcmV2ZW50RGVmYXVsdCgpO2guZmlyZSgpO3JldHVybiBmYWxzZX0pO2EuYWRkQ2xhc3ModGhpcy5fX2J1dHRvbixcImJ1dHRvblwiKTt0aGlzLmRvbUVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5fX2J1dHRvbil9O2Quc3VwZXJjbGFzcz1lO2MuZXh0ZW5kKGQucHJvdG90eXBlLGUucHJvdG90eXBlLHtmaXJlOmZ1bmN0aW9uKCl7dGhpcy5fX29uQ2hhbmdlJiZ0aGlzLl9fb25DaGFuZ2UuY2FsbCh0aGlzKTt0aGlzLl9fb25GaW5pc2hDaGFuZ2UmJnRoaXMuX19vbkZpbmlzaENoYW5nZS5jYWxsKHRoaXMsXG50aGlzLmdldFZhbHVlKCkpO3RoaXMuZ2V0VmFsdWUoKS5jYWxsKHRoaXMub2JqZWN0KX19KTtyZXR1cm4gZH0oZGF0LmNvbnRyb2xsZXJzLkNvbnRyb2xsZXIsZGF0LmRvbS5kb20sZGF0LnV0aWxzLmNvbW1vbik7XG5kYXQuY29udHJvbGxlcnMuQm9vbGVhbkNvbnRyb2xsZXI9ZnVuY3Rpb24oZSxhLGMpe3ZhciBkPWZ1bmN0aW9uKGMsYil7ZC5zdXBlcmNsYXNzLmNhbGwodGhpcyxjLGIpO3ZhciBlPXRoaXM7dGhpcy5fX3ByZXY9dGhpcy5nZXRWYWx1ZSgpO3RoaXMuX19jaGVja2JveD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7dGhpcy5fX2NoZWNrYm94LnNldEF0dHJpYnV0ZShcInR5cGVcIixcImNoZWNrYm94XCIpO2EuYmluZCh0aGlzLl9fY2hlY2tib3gsXCJjaGFuZ2VcIixmdW5jdGlvbigpe2Uuc2V0VmFsdWUoIWUuX19wcmV2KX0sZmFsc2UpO3RoaXMuZG9tRWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLl9fY2hlY2tib3gpO3RoaXMudXBkYXRlRGlzcGxheSgpfTtkLnN1cGVyY2xhc3M9ZTtjLmV4dGVuZChkLnByb3RvdHlwZSxlLnByb3RvdHlwZSx7c2V0VmFsdWU6ZnVuY3Rpb24oYSl7YT1kLnN1cGVyY2xhc3MucHJvdG90eXBlLnNldFZhbHVlLmNhbGwodGhpcyxhKTt0aGlzLl9fb25GaW5pc2hDaGFuZ2UmJlxudGhpcy5fX29uRmluaXNoQ2hhbmdlLmNhbGwodGhpcyx0aGlzLmdldFZhbHVlKCkpO3RoaXMuX19wcmV2PXRoaXMuZ2V0VmFsdWUoKTtyZXR1cm4gYX0sdXBkYXRlRGlzcGxheTpmdW5jdGlvbigpe3RoaXMuZ2V0VmFsdWUoKT09PXRydWU/KHRoaXMuX19jaGVja2JveC5zZXRBdHRyaWJ1dGUoXCJjaGVja2VkXCIsXCJjaGVja2VkXCIpLHRoaXMuX19jaGVja2JveC5jaGVja2VkPXRydWUpOnRoaXMuX19jaGVja2JveC5jaGVja2VkPWZhbHNlO3JldHVybiBkLnN1cGVyY2xhc3MucHJvdG90eXBlLnVwZGF0ZURpc3BsYXkuY2FsbCh0aGlzKX19KTtyZXR1cm4gZH0oZGF0LmNvbnRyb2xsZXJzLkNvbnRyb2xsZXIsZGF0LmRvbS5kb20sZGF0LnV0aWxzLmNvbW1vbik7XG5kYXQuY29sb3IudG9TdHJpbmc9ZnVuY3Rpb24oZSl7cmV0dXJuIGZ1bmN0aW9uKGEpe2lmKGEuYT09MXx8ZS5pc1VuZGVmaW5lZChhLmEpKXtmb3IoYT1hLmhleC50b1N0cmluZygxNik7YS5sZW5ndGg8NjspYT1cIjBcIithO3JldHVyblwiI1wiK2F9ZWxzZSByZXR1cm5cInJnYmEoXCIrTWF0aC5yb3VuZChhLnIpK1wiLFwiK01hdGgucm91bmQoYS5nKStcIixcIitNYXRoLnJvdW5kKGEuYikrXCIsXCIrYS5hK1wiKVwifX0oZGF0LnV0aWxzLmNvbW1vbik7XG5kYXQuY29sb3IuaW50ZXJwcmV0PWZ1bmN0aW9uKGUsYSl7dmFyIGMsZCxmPVt7bGl0bXVzOmEuaXNTdHJpbmcsY29udmVyc2lvbnM6e1RIUkVFX0NIQVJfSEVYOntyZWFkOmZ1bmN0aW9uKGEpe2E9YS5tYXRjaCgvXiMoW0EtRjAtOV0pKFtBLUYwLTldKShbQS1GMC05XSkkL2kpO3JldHVybiBhPT09bnVsbD9mYWxzZTp7c3BhY2U6XCJIRVhcIixoZXg6cGFyc2VJbnQoXCIweFwiK2FbMV0udG9TdHJpbmcoKSthWzFdLnRvU3RyaW5nKCkrYVsyXS50b1N0cmluZygpK2FbMl0udG9TdHJpbmcoKSthWzNdLnRvU3RyaW5nKCkrYVszXS50b1N0cmluZygpKX19LHdyaXRlOmV9LFNJWF9DSEFSX0hFWDp7cmVhZDpmdW5jdGlvbihhKXthPWEubWF0Y2goL14jKFtBLUYwLTldezZ9KSQvaSk7cmV0dXJuIGE9PT1udWxsP2ZhbHNlOntzcGFjZTpcIkhFWFwiLGhleDpwYXJzZUludChcIjB4XCIrYVsxXS50b1N0cmluZygpKX19LHdyaXRlOmV9LENTU19SR0I6e3JlYWQ6ZnVuY3Rpb24oYSl7YT1hLm1hdGNoKC9ecmdiXFwoXFxzKiguKylcXHMqLFxccyooLispXFxzKixcXHMqKC4rKVxccypcXCkvKTtcbnJldHVybiBhPT09bnVsbD9mYWxzZTp7c3BhY2U6XCJSR0JcIixyOnBhcnNlRmxvYXQoYVsxXSksZzpwYXJzZUZsb2F0KGFbMl0pLGI6cGFyc2VGbG9hdChhWzNdKX19LHdyaXRlOmV9LENTU19SR0JBOntyZWFkOmZ1bmN0aW9uKGEpe2E9YS5tYXRjaCgvXnJnYmFcXChcXHMqKC4rKVxccyosXFxzKiguKylcXHMqLFxccyooLispXFxzKlxcLFxccyooLispXFxzKlxcKS8pO3JldHVybiBhPT09bnVsbD9mYWxzZTp7c3BhY2U6XCJSR0JcIixyOnBhcnNlRmxvYXQoYVsxXSksZzpwYXJzZUZsb2F0KGFbMl0pLGI6cGFyc2VGbG9hdChhWzNdKSxhOnBhcnNlRmxvYXQoYVs0XSl9fSx3cml0ZTplfX19LHtsaXRtdXM6YS5pc051bWJlcixjb252ZXJzaW9uczp7SEVYOntyZWFkOmZ1bmN0aW9uKGEpe3JldHVybntzcGFjZTpcIkhFWFwiLGhleDphLGNvbnZlcnNpb25OYW1lOlwiSEVYXCJ9fSx3cml0ZTpmdW5jdGlvbihhKXtyZXR1cm4gYS5oZXh9fX19LHtsaXRtdXM6YS5pc0FycmF5LGNvbnZlcnNpb25zOntSR0JfQVJSQVk6e3JlYWQ6ZnVuY3Rpb24oYSl7cmV0dXJuIGEubGVuZ3RoIT1cbjM/ZmFsc2U6e3NwYWNlOlwiUkdCXCIscjphWzBdLGc6YVsxXSxiOmFbMl19fSx3cml0ZTpmdW5jdGlvbihhKXtyZXR1cm5bYS5yLGEuZyxhLmJdfX0sUkdCQV9BUlJBWTp7cmVhZDpmdW5jdGlvbihhKXtyZXR1cm4gYS5sZW5ndGghPTQ/ZmFsc2U6e3NwYWNlOlwiUkdCXCIscjphWzBdLGc6YVsxXSxiOmFbMl0sYTphWzNdfX0sd3JpdGU6ZnVuY3Rpb24oYSl7cmV0dXJuW2EucixhLmcsYS5iLGEuYV19fX19LHtsaXRtdXM6YS5pc09iamVjdCxjb252ZXJzaW9uczp7UkdCQV9PQko6e3JlYWQ6ZnVuY3Rpb24oYil7cmV0dXJuIGEuaXNOdW1iZXIoYi5yKSYmYS5pc051bWJlcihiLmcpJiZhLmlzTnVtYmVyKGIuYikmJmEuaXNOdW1iZXIoYi5hKT97c3BhY2U6XCJSR0JcIixyOmIucixnOmIuZyxiOmIuYixhOmIuYX06ZmFsc2V9LHdyaXRlOmZ1bmN0aW9uKGEpe3JldHVybntyOmEucixnOmEuZyxiOmEuYixhOmEuYX19fSxSR0JfT0JKOntyZWFkOmZ1bmN0aW9uKGIpe3JldHVybiBhLmlzTnVtYmVyKGIucikmJlxuYS5pc051bWJlcihiLmcpJiZhLmlzTnVtYmVyKGIuYik/e3NwYWNlOlwiUkdCXCIscjpiLnIsZzpiLmcsYjpiLmJ9OmZhbHNlfSx3cml0ZTpmdW5jdGlvbihhKXtyZXR1cm57cjphLnIsZzphLmcsYjphLmJ9fX0sSFNWQV9PQko6e3JlYWQ6ZnVuY3Rpb24oYil7cmV0dXJuIGEuaXNOdW1iZXIoYi5oKSYmYS5pc051bWJlcihiLnMpJiZhLmlzTnVtYmVyKGIudikmJmEuaXNOdW1iZXIoYi5hKT97c3BhY2U6XCJIU1ZcIixoOmIuaCxzOmIucyx2OmIudixhOmIuYX06ZmFsc2V9LHdyaXRlOmZ1bmN0aW9uKGEpe3JldHVybntoOmEuaCxzOmEucyx2OmEudixhOmEuYX19fSxIU1ZfT0JKOntyZWFkOmZ1bmN0aW9uKGIpe3JldHVybiBhLmlzTnVtYmVyKGIuaCkmJmEuaXNOdW1iZXIoYi5zKSYmYS5pc051bWJlcihiLnYpP3tzcGFjZTpcIkhTVlwiLGg6Yi5oLHM6Yi5zLHY6Yi52fTpmYWxzZX0sd3JpdGU6ZnVuY3Rpb24oYSl7cmV0dXJue2g6YS5oLHM6YS5zLHY6YS52fX19fX1dO3JldHVybiBmdW5jdGlvbigpe2Q9XG5mYWxzZTt2YXIgYj1hcmd1bWVudHMubGVuZ3RoPjE/YS50b0FycmF5KGFyZ3VtZW50cyk6YXJndW1lbnRzWzBdO2EuZWFjaChmLGZ1bmN0aW9uKGUpe2lmKGUubGl0bXVzKGIpKXJldHVybiBhLmVhY2goZS5jb252ZXJzaW9ucyxmdW5jdGlvbihlLGYpe2M9ZS5yZWFkKGIpO2lmKGQ9PT1mYWxzZSYmYyE9PWZhbHNlKXJldHVybiBkPWMsYy5jb252ZXJzaW9uTmFtZT1mLGMuY29udmVyc2lvbj1lLGEuQlJFQUt9KSxhLkJSRUFLfSk7cmV0dXJuIGR9fShkYXQuY29sb3IudG9TdHJpbmcsZGF0LnV0aWxzLmNvbW1vbik7XG5kYXQuR1VJPWRhdC5ndWkuR1VJPWZ1bmN0aW9uKGUsYSxjLGQsZixiLG4saCxqLG0sbCxvLHksZyxpKXtmdW5jdGlvbiBxKGEsYixyLGMpe2lmKGJbcl09PT12b2lkIDApdGhyb3cgRXJyb3IoXCJPYmplY3QgXCIrYisnIGhhcyBubyBwcm9wZXJ0eSBcIicrcisnXCInKTtjLmNvbG9yP2I9bmV3IGwoYixyKTooYj1bYixyXS5jb25jYXQoYy5mYWN0b3J5QXJncyksYj1kLmFwcGx5KGEsYikpO2lmKGMuYmVmb3JlIGluc3RhbmNlb2YgZiljLmJlZm9yZT1jLmJlZm9yZS5fX2xpO3QoYSxiKTtnLmFkZENsYXNzKGIuZG9tRWxlbWVudCxcImNcIik7cj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtnLmFkZENsYXNzKHIsXCJwcm9wZXJ0eS1uYW1lXCIpO3IuaW5uZXJIVE1MPWIucHJvcGVydHk7dmFyIGU9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtlLmFwcGVuZENoaWxkKHIpO2UuYXBwZW5kQ2hpbGQoYi5kb21FbGVtZW50KTtjPXMoYSxlLGMuYmVmb3JlKTtnLmFkZENsYXNzKGMsay5DTEFTU19DT05UUk9MTEVSX1JPVyk7XG5nLmFkZENsYXNzKGMsdHlwZW9mIGIuZ2V0VmFsdWUoKSk7cChhLGMsYik7YS5fX2NvbnRyb2xsZXJzLnB1c2goYik7cmV0dXJuIGJ9ZnVuY3Rpb24gcyhhLGIsZCl7dmFyIGM9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpO2ImJmMuYXBwZW5kQ2hpbGQoYik7ZD9hLl9fdWwuaW5zZXJ0QmVmb3JlKGMscGFyYW1zLmJlZm9yZSk6YS5fX3VsLmFwcGVuZENoaWxkKGMpO2Eub25SZXNpemUoKTtyZXR1cm4gY31mdW5jdGlvbiBwKGEsZCxjKXtjLl9fbGk9ZDtjLl9fZ3VpPWE7aS5leHRlbmQoYyx7b3B0aW9uczpmdW5jdGlvbihiKXtpZihhcmd1bWVudHMubGVuZ3RoPjEpcmV0dXJuIGMucmVtb3ZlKCkscShhLGMub2JqZWN0LGMucHJvcGVydHkse2JlZm9yZTpjLl9fbGkubmV4dEVsZW1lbnRTaWJsaW5nLGZhY3RvcnlBcmdzOltpLnRvQXJyYXkoYXJndW1lbnRzKV19KTtpZihpLmlzQXJyYXkoYil8fGkuaXNPYmplY3QoYikpcmV0dXJuIGMucmVtb3ZlKCkscShhLGMub2JqZWN0LGMucHJvcGVydHksXG57YmVmb3JlOmMuX19saS5uZXh0RWxlbWVudFNpYmxpbmcsZmFjdG9yeUFyZ3M6W2JdfSl9LG5hbWU6ZnVuY3Rpb24oYSl7Yy5fX2xpLmZpcnN0RWxlbWVudENoaWxkLmZpcnN0RWxlbWVudENoaWxkLmlubmVySFRNTD1hO3JldHVybiBjfSxsaXN0ZW46ZnVuY3Rpb24oKXtjLl9fZ3VpLmxpc3RlbihjKTtyZXR1cm4gY30scmVtb3ZlOmZ1bmN0aW9uKCl7Yy5fX2d1aS5yZW1vdmUoYyk7cmV0dXJuIGN9fSk7aWYoYyBpbnN0YW5jZW9mIGope3ZhciBlPW5ldyBoKGMub2JqZWN0LGMucHJvcGVydHkse21pbjpjLl9fbWluLG1heDpjLl9fbWF4LHN0ZXA6Yy5fX3N0ZXB9KTtpLmVhY2goW1widXBkYXRlRGlzcGxheVwiLFwib25DaGFuZ2VcIixcIm9uRmluaXNoQ2hhbmdlXCJdLGZ1bmN0aW9uKGEpe3ZhciBiPWNbYV0sSD1lW2FdO2NbYV09ZVthXT1mdW5jdGlvbigpe3ZhciBhPUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7Yi5hcHBseShjLGEpO3JldHVybiBILmFwcGx5KGUsYSl9fSk7XG5nLmFkZENsYXNzKGQsXCJoYXMtc2xpZGVyXCIpO2MuZG9tRWxlbWVudC5pbnNlcnRCZWZvcmUoZS5kb21FbGVtZW50LGMuZG9tRWxlbWVudC5maXJzdEVsZW1lbnRDaGlsZCl9ZWxzZSBpZihjIGluc3RhbmNlb2YgaCl7dmFyIGY9ZnVuY3Rpb24oYil7cmV0dXJuIGkuaXNOdW1iZXIoYy5fX21pbikmJmkuaXNOdW1iZXIoYy5fX21heCk/KGMucmVtb3ZlKCkscShhLGMub2JqZWN0LGMucHJvcGVydHkse2JlZm9yZTpjLl9fbGkubmV4dEVsZW1lbnRTaWJsaW5nLGZhY3RvcnlBcmdzOltjLl9fbWluLGMuX19tYXgsYy5fX3N0ZXBdfSkpOmJ9O2MubWluPWkuY29tcG9zZShmLGMubWluKTtjLm1heD1pLmNvbXBvc2UoZixjLm1heCl9ZWxzZSBpZihjIGluc3RhbmNlb2YgYilnLmJpbmQoZCxcImNsaWNrXCIsZnVuY3Rpb24oKXtnLmZha2VFdmVudChjLl9fY2hlY2tib3gsXCJjbGlja1wiKX0pLGcuYmluZChjLl9fY2hlY2tib3gsXCJjbGlja1wiLGZ1bmN0aW9uKGEpe2Euc3RvcFByb3BhZ2F0aW9uKCl9KTtcbmVsc2UgaWYoYyBpbnN0YW5jZW9mIG4pZy5iaW5kKGQsXCJjbGlja1wiLGZ1bmN0aW9uKCl7Zy5mYWtlRXZlbnQoYy5fX2J1dHRvbixcImNsaWNrXCIpfSksZy5iaW5kKGQsXCJtb3VzZW92ZXJcIixmdW5jdGlvbigpe2cuYWRkQ2xhc3MoYy5fX2J1dHRvbixcImhvdmVyXCIpfSksZy5iaW5kKGQsXCJtb3VzZW91dFwiLGZ1bmN0aW9uKCl7Zy5yZW1vdmVDbGFzcyhjLl9fYnV0dG9uLFwiaG92ZXJcIil9KTtlbHNlIGlmKGMgaW5zdGFuY2VvZiBsKWcuYWRkQ2xhc3MoZCxcImNvbG9yXCIpLGMudXBkYXRlRGlzcGxheT1pLmNvbXBvc2UoZnVuY3Rpb24oYSl7ZC5zdHlsZS5ib3JkZXJMZWZ0Q29sb3I9Yy5fX2NvbG9yLnRvU3RyaW5nKCk7cmV0dXJuIGF9LGMudXBkYXRlRGlzcGxheSksYy51cGRhdGVEaXNwbGF5KCk7Yy5zZXRWYWx1ZT1pLmNvbXBvc2UoZnVuY3Rpb24oYil7YS5nZXRSb290KCkuX19wcmVzZXRfc2VsZWN0JiZjLmlzTW9kaWZpZWQoKSYmQihhLmdldFJvb3QoKSx0cnVlKTtyZXR1cm4gYn0sYy5zZXRWYWx1ZSl9XG5mdW5jdGlvbiB0KGEsYil7dmFyIGM9YS5nZXRSb290KCksZD1jLl9fcmVtZW1iZXJlZE9iamVjdHMuaW5kZXhPZihiLm9iamVjdCk7aWYoZCE9LTEpe3ZhciBlPWMuX19yZW1lbWJlcmVkT2JqZWN0SW5kZWNlc1RvQ29udHJvbGxlcnNbZF07ZT09PXZvaWQgMCYmKGU9e30sYy5fX3JlbWVtYmVyZWRPYmplY3RJbmRlY2VzVG9Db250cm9sbGVyc1tkXT1lKTtlW2IucHJvcGVydHldPWI7aWYoYy5sb2FkJiZjLmxvYWQucmVtZW1iZXJlZCl7Yz1jLmxvYWQucmVtZW1iZXJlZDtpZihjW2EucHJlc2V0XSljPWNbYS5wcmVzZXRdO2Vsc2UgaWYoY1t3XSljPWNbd107ZWxzZSByZXR1cm47aWYoY1tkXSYmY1tkXVtiLnByb3BlcnR5XSE9PXZvaWQgMClkPWNbZF1bYi5wcm9wZXJ0eV0sYi5pbml0aWFsVmFsdWU9ZCxiLnNldFZhbHVlKGQpfX19ZnVuY3Rpb24gSShhKXt2YXIgYj1hLl9fc2F2ZV9yb3c9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpO2cuYWRkQ2xhc3MoYS5kb21FbGVtZW50LFxuXCJoYXMtc2F2ZVwiKTthLl9fdWwuaW5zZXJ0QmVmb3JlKGIsYS5fX3VsLmZpcnN0Q2hpbGQpO2cuYWRkQ2xhc3MoYixcInNhdmUtcm93XCIpO3ZhciBjPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO2MuaW5uZXJIVE1MPVwiJm5ic3A7XCI7Zy5hZGRDbGFzcyhjLFwiYnV0dG9uIGdlYXJzXCIpO3ZhciBkPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO2QuaW5uZXJIVE1MPVwiU2F2ZVwiO2cuYWRkQ2xhc3MoZCxcImJ1dHRvblwiKTtnLmFkZENsYXNzKGQsXCJzYXZlXCIpO3ZhciBlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO2UuaW5uZXJIVE1MPVwiTmV3XCI7Zy5hZGRDbGFzcyhlLFwiYnV0dG9uXCIpO2cuYWRkQ2xhc3MoZSxcInNhdmUtYXNcIik7dmFyIGY9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7Zi5pbm5lckhUTUw9XCJSZXZlcnRcIjtnLmFkZENsYXNzKGYsXCJidXR0b25cIik7Zy5hZGRDbGFzcyhmLFwicmV2ZXJ0XCIpO3ZhciBtPWEuX19wcmVzZXRfc2VsZWN0PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzZWxlY3RcIik7XG5hLmxvYWQmJmEubG9hZC5yZW1lbWJlcmVkP2kuZWFjaChhLmxvYWQucmVtZW1iZXJlZCxmdW5jdGlvbihiLGMpe0MoYSxjLGM9PWEucHJlc2V0KX0pOkMoYSx3LGZhbHNlKTtnLmJpbmQobSxcImNoYW5nZVwiLGZ1bmN0aW9uKCl7Zm9yKHZhciBiPTA7YjxhLl9fcHJlc2V0X3NlbGVjdC5sZW5ndGg7YisrKWEuX19wcmVzZXRfc2VsZWN0W2JdLmlubmVySFRNTD1hLl9fcHJlc2V0X3NlbGVjdFtiXS52YWx1ZTthLnByZXNldD10aGlzLnZhbHVlfSk7Yi5hcHBlbmRDaGlsZChtKTtiLmFwcGVuZENoaWxkKGMpO2IuYXBwZW5kQ2hpbGQoZCk7Yi5hcHBlbmRDaGlsZChlKTtiLmFwcGVuZENoaWxkKGYpO2lmKHUpe3ZhciBiPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGctc2F2ZS1sb2NhbGx5XCIpLGw9ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZy1sb2NhbC1leHBsYWluXCIpO2Iuc3R5bGUuZGlzcGxheT1cImJsb2NrXCI7Yj1kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRnLWxvY2FsLXN0b3JhZ2VcIik7XG5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShkb2N1bWVudC5sb2NhdGlvbi5ocmVmK1wiLmlzTG9jYWxcIik9PT1cInRydWVcIiYmYi5zZXRBdHRyaWJ1dGUoXCJjaGVja2VkXCIsXCJjaGVja2VkXCIpO3ZhciBvPWZ1bmN0aW9uKCl7bC5zdHlsZS5kaXNwbGF5PWEudXNlTG9jYWxTdG9yYWdlP1wiYmxvY2tcIjpcIm5vbmVcIn07bygpO2cuYmluZChiLFwiY2hhbmdlXCIsZnVuY3Rpb24oKXthLnVzZUxvY2FsU3RvcmFnZT0hYS51c2VMb2NhbFN0b3JhZ2U7bygpfSl9dmFyIGg9ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZy1uZXctY29uc3RydWN0b3JcIik7Zy5iaW5kKGgsXCJrZXlkb3duXCIsZnVuY3Rpb24oYSl7YS5tZXRhS2V5JiYoYS53aGljaD09PTY3fHxhLmtleUNvZGU9PTY3KSYmeC5oaWRlKCl9KTtnLmJpbmQoYyxcImNsaWNrXCIsZnVuY3Rpb24oKXtoLmlubmVySFRNTD1KU09OLnN0cmluZ2lmeShhLmdldFNhdmVPYmplY3QoKSx2b2lkIDAsMik7eC5zaG93KCk7aC5mb2N1cygpO2guc2VsZWN0KCl9KTtnLmJpbmQoZCxcblwiY2xpY2tcIixmdW5jdGlvbigpe2Euc2F2ZSgpfSk7Zy5iaW5kKGUsXCJjbGlja1wiLGZ1bmN0aW9uKCl7dmFyIGI9cHJvbXB0KFwiRW50ZXIgYSBuZXcgcHJlc2V0IG5hbWUuXCIpO2ImJmEuc2F2ZUFzKGIpfSk7Zy5iaW5kKGYsXCJjbGlja1wiLGZ1bmN0aW9uKCl7YS5yZXZlcnQoKX0pfWZ1bmN0aW9uIEooYSl7ZnVuY3Rpb24gYihmKXtmLnByZXZlbnREZWZhdWx0KCk7ZT1mLmNsaWVudFg7Zy5hZGRDbGFzcyhhLl9fY2xvc2VCdXR0b24say5DTEFTU19EUkFHKTtnLmJpbmQod2luZG93LFwibW91c2Vtb3ZlXCIsYyk7Zy5iaW5kKHdpbmRvdyxcIm1vdXNldXBcIixkKTtyZXR1cm4gZmFsc2V9ZnVuY3Rpb24gYyhiKXtiLnByZXZlbnREZWZhdWx0KCk7YS53aWR0aCs9ZS1iLmNsaWVudFg7YS5vblJlc2l6ZSgpO2U9Yi5jbGllbnRYO3JldHVybiBmYWxzZX1mdW5jdGlvbiBkKCl7Zy5yZW1vdmVDbGFzcyhhLl9fY2xvc2VCdXR0b24say5DTEFTU19EUkFHKTtnLnVuYmluZCh3aW5kb3csXCJtb3VzZW1vdmVcIixcbmMpO2cudW5iaW5kKHdpbmRvdyxcIm1vdXNldXBcIixkKX1hLl9fcmVzaXplX2hhbmRsZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO2kuZXh0ZW5kKGEuX19yZXNpemVfaGFuZGxlLnN0eWxlLHt3aWR0aDpcIjZweFwiLG1hcmdpbkxlZnQ6XCItM3B4XCIsaGVpZ2h0OlwiMjAwcHhcIixjdXJzb3I6XCJldy1yZXNpemVcIixwb3NpdGlvbjpcImFic29sdXRlXCJ9KTt2YXIgZTtnLmJpbmQoYS5fX3Jlc2l6ZV9oYW5kbGUsXCJtb3VzZWRvd25cIixiKTtnLmJpbmQoYS5fX2Nsb3NlQnV0dG9uLFwibW91c2Vkb3duXCIsYik7YS5kb21FbGVtZW50Lmluc2VydEJlZm9yZShhLl9fcmVzaXplX2hhbmRsZSxhLmRvbUVsZW1lbnQuZmlyc3RFbGVtZW50Q2hpbGQpfWZ1bmN0aW9uIEQoYSxiKXthLmRvbUVsZW1lbnQuc3R5bGUud2lkdGg9YitcInB4XCI7aWYoYS5fX3NhdmVfcm93JiZhLmF1dG9QbGFjZSlhLl9fc2F2ZV9yb3cuc3R5bGUud2lkdGg9YitcInB4XCI7aWYoYS5fX2Nsb3NlQnV0dG9uKWEuX19jbG9zZUJ1dHRvbi5zdHlsZS53aWR0aD1cbmIrXCJweFwifWZ1bmN0aW9uIHooYSxiKXt2YXIgYz17fTtpLmVhY2goYS5fX3JlbWVtYmVyZWRPYmplY3RzLGZ1bmN0aW9uKGQsZSl7dmFyIGY9e307aS5lYWNoKGEuX19yZW1lbWJlcmVkT2JqZWN0SW5kZWNlc1RvQ29udHJvbGxlcnNbZV0sZnVuY3Rpb24oYSxjKXtmW2NdPWI/YS5pbml0aWFsVmFsdWU6YS5nZXRWYWx1ZSgpfSk7Y1tlXT1mfSk7cmV0dXJuIGN9ZnVuY3Rpb24gQyhhLGIsYyl7dmFyIGQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIm9wdGlvblwiKTtkLmlubmVySFRNTD1iO2QudmFsdWU9YjthLl9fcHJlc2V0X3NlbGVjdC5hcHBlbmRDaGlsZChkKTtpZihjKWEuX19wcmVzZXRfc2VsZWN0LnNlbGVjdGVkSW5kZXg9YS5fX3ByZXNldF9zZWxlY3QubGVuZ3RoLTF9ZnVuY3Rpb24gQihhLGIpe3ZhciBjPWEuX19wcmVzZXRfc2VsZWN0W2EuX19wcmVzZXRfc2VsZWN0LnNlbGVjdGVkSW5kZXhdO2MuaW5uZXJIVE1MPWI/Yy52YWx1ZStcIipcIjpjLnZhbHVlfWZ1bmN0aW9uIEUoYSl7YS5sZW5ndGghPVxuMCYmbyhmdW5jdGlvbigpe0UoYSl9KTtpLmVhY2goYSxmdW5jdGlvbihhKXthLnVwZGF0ZURpc3BsYXkoKX0pfWUuaW5qZWN0KGMpO3ZhciB3PVwiRGVmYXVsdFwiLHU7dHJ5e3U9XCJsb2NhbFN0b3JhZ2VcImluIHdpbmRvdyYmd2luZG93LmxvY2FsU3RvcmFnZSE9PW51bGx9Y2F0Y2goSyl7dT1mYWxzZX12YXIgeCxGPXRydWUsdixBPWZhbHNlLEc9W10saz1mdW5jdGlvbihhKXtmdW5jdGlvbiBiKCl7bG9jYWxTdG9yYWdlLnNldEl0ZW0oZG9jdW1lbnQubG9jYXRpb24uaHJlZitcIi5ndWlcIixKU09OLnN0cmluZ2lmeShkLmdldFNhdmVPYmplY3QoKSkpfWZ1bmN0aW9uIGMoKXt2YXIgYT1kLmdldFJvb3QoKTthLndpZHRoKz0xO2kuZGVmZXIoZnVuY3Rpb24oKXthLndpZHRoLT0xfSl9dmFyIGQ9dGhpczt0aGlzLmRvbUVsZW1lbnQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTt0aGlzLl9fdWw9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInVsXCIpO3RoaXMuZG9tRWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLl9fdWwpO1xuZy5hZGRDbGFzcyh0aGlzLmRvbUVsZW1lbnQsXCJkZ1wiKTt0aGlzLl9fZm9sZGVycz17fTt0aGlzLl9fY29udHJvbGxlcnM9W107dGhpcy5fX3JlbWVtYmVyZWRPYmplY3RzPVtdO3RoaXMuX19yZW1lbWJlcmVkT2JqZWN0SW5kZWNlc1RvQ29udHJvbGxlcnM9W107dGhpcy5fX2xpc3RlbmluZz1bXTthPWF8fHt9O2E9aS5kZWZhdWx0cyhhLHthdXRvUGxhY2U6dHJ1ZSx3aWR0aDprLkRFRkFVTFRfV0lEVEh9KTthPWkuZGVmYXVsdHMoYSx7cmVzaXphYmxlOmEuYXV0b1BsYWNlLGhpZGVhYmxlOmEuYXV0b1BsYWNlfSk7aWYoaS5pc1VuZGVmaW5lZChhLmxvYWQpKWEubG9hZD17cHJlc2V0Ond9O2Vsc2UgaWYoYS5wcmVzZXQpYS5sb2FkLnByZXNldD1hLnByZXNldDtpLmlzVW5kZWZpbmVkKGEucGFyZW50KSYmYS5oaWRlYWJsZSYmRy5wdXNoKHRoaXMpO2EucmVzaXphYmxlPWkuaXNVbmRlZmluZWQoYS5wYXJlbnQpJiZhLnJlc2l6YWJsZTtpZihhLmF1dG9QbGFjZSYmaS5pc1VuZGVmaW5lZChhLnNjcm9sbGFibGUpKWEuc2Nyb2xsYWJsZT1cbnRydWU7dmFyIGU9dSYmbG9jYWxTdG9yYWdlLmdldEl0ZW0oZG9jdW1lbnQubG9jYXRpb24uaHJlZitcIi5pc0xvY2FsXCIpPT09XCJ0cnVlXCI7T2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcyx7cGFyZW50OntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gYS5wYXJlbnR9fSxzY3JvbGxhYmxlOntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gYS5zY3JvbGxhYmxlfX0sYXV0b1BsYWNlOntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gYS5hdXRvUGxhY2V9fSxwcmVzZXQ6e2dldDpmdW5jdGlvbigpe3JldHVybiBkLnBhcmVudD9kLmdldFJvb3QoKS5wcmVzZXQ6YS5sb2FkLnByZXNldH0sc2V0OmZ1bmN0aW9uKGIpe2QucGFyZW50P2QuZ2V0Um9vdCgpLnByZXNldD1iOmEubG9hZC5wcmVzZXQ9Yjtmb3IoYj0wO2I8dGhpcy5fX3ByZXNldF9zZWxlY3QubGVuZ3RoO2IrKylpZih0aGlzLl9fcHJlc2V0X3NlbGVjdFtiXS52YWx1ZT09dGhpcy5wcmVzZXQpdGhpcy5fX3ByZXNldF9zZWxlY3Quc2VsZWN0ZWRJbmRleD1cbmI7ZC5yZXZlcnQoKX19LHdpZHRoOntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gYS53aWR0aH0sc2V0OmZ1bmN0aW9uKGIpe2Eud2lkdGg9YjtEKGQsYil9fSxuYW1lOntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gYS5uYW1lfSxzZXQ6ZnVuY3Rpb24oYil7YS5uYW1lPWI7aWYobSltLmlubmVySFRNTD1hLm5hbWV9fSxjbG9zZWQ6e2dldDpmdW5jdGlvbigpe3JldHVybiBhLmNsb3NlZH0sc2V0OmZ1bmN0aW9uKGIpe2EuY2xvc2VkPWI7YS5jbG9zZWQ/Zy5hZGRDbGFzcyhkLl9fdWwsay5DTEFTU19DTE9TRUQpOmcucmVtb3ZlQ2xhc3MoZC5fX3VsLGsuQ0xBU1NfQ0xPU0VEKTt0aGlzLm9uUmVzaXplKCk7aWYoZC5fX2Nsb3NlQnV0dG9uKWQuX19jbG9zZUJ1dHRvbi5pbm5lckhUTUw9Yj9rLlRFWFRfT1BFTjprLlRFWFRfQ0xPU0VEfX0sbG9hZDp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIGEubG9hZH19LHVzZUxvY2FsU3RvcmFnZTp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIGV9LHNldDpmdW5jdGlvbihhKXt1JiZcbigoZT1hKT9nLmJpbmQod2luZG93LFwidW5sb2FkXCIsYik6Zy51bmJpbmQod2luZG93LFwidW5sb2FkXCIsYiksbG9jYWxTdG9yYWdlLnNldEl0ZW0oZG9jdW1lbnQubG9jYXRpb24uaHJlZitcIi5pc0xvY2FsXCIsYSkpfX19KTtpZihpLmlzVW5kZWZpbmVkKGEucGFyZW50KSl7YS5jbG9zZWQ9ZmFsc2U7Zy5hZGRDbGFzcyh0aGlzLmRvbUVsZW1lbnQsay5DTEFTU19NQUlOKTtnLm1ha2VTZWxlY3RhYmxlKHRoaXMuZG9tRWxlbWVudCxmYWxzZSk7aWYodSYmZSl7ZC51c2VMb2NhbFN0b3JhZ2U9dHJ1ZTt2YXIgZj1sb2NhbFN0b3JhZ2UuZ2V0SXRlbShkb2N1bWVudC5sb2NhdGlvbi5ocmVmK1wiLmd1aVwiKTtpZihmKWEubG9hZD1KU09OLnBhcnNlKGYpfXRoaXMuX19jbG9zZUJ1dHRvbj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO3RoaXMuX19jbG9zZUJ1dHRvbi5pbm5lckhUTUw9ay5URVhUX0NMT1NFRDtnLmFkZENsYXNzKHRoaXMuX19jbG9zZUJ1dHRvbixrLkNMQVNTX0NMT1NFX0JVVFRPTik7XG50aGlzLmRvbUVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5fX2Nsb3NlQnV0dG9uKTtnLmJpbmQodGhpcy5fX2Nsb3NlQnV0dG9uLFwiY2xpY2tcIixmdW5jdGlvbigpe2QuY2xvc2VkPSFkLmNsb3NlZH0pfWVsc2V7aWYoYS5jbG9zZWQ9PT12b2lkIDApYS5jbG9zZWQ9dHJ1ZTt2YXIgbT1kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShhLm5hbWUpO2cuYWRkQ2xhc3MobSxcImNvbnRyb2xsZXItbmFtZVwiKTtmPXMoZCxtKTtnLmFkZENsYXNzKHRoaXMuX191bCxrLkNMQVNTX0NMT1NFRCk7Zy5hZGRDbGFzcyhmLFwidGl0bGVcIik7Zy5iaW5kKGYsXCJjbGlja1wiLGZ1bmN0aW9uKGEpe2EucHJldmVudERlZmF1bHQoKTtkLmNsb3NlZD0hZC5jbG9zZWQ7cmV0dXJuIGZhbHNlfSk7aWYoIWEuY2xvc2VkKXRoaXMuY2xvc2VkPWZhbHNlfWEuYXV0b1BsYWNlJiYoaS5pc1VuZGVmaW5lZChhLnBhcmVudCkmJihGJiYodj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLGcuYWRkQ2xhc3ModixcImRnXCIpLGcuYWRkQ2xhc3ModixcbmsuQ0xBU1NfQVVUT19QTEFDRV9DT05UQUlORVIpLGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodiksRj1mYWxzZSksdi5hcHBlbmRDaGlsZCh0aGlzLmRvbUVsZW1lbnQpLGcuYWRkQ2xhc3ModGhpcy5kb21FbGVtZW50LGsuQ0xBU1NfQVVUT19QTEFDRSkpLHRoaXMucGFyZW50fHxEKGQsYS53aWR0aCkpO2cuYmluZCh3aW5kb3csXCJyZXNpemVcIixmdW5jdGlvbigpe2Qub25SZXNpemUoKX0pO2cuYmluZCh0aGlzLl9fdWwsXCJ3ZWJraXRUcmFuc2l0aW9uRW5kXCIsZnVuY3Rpb24oKXtkLm9uUmVzaXplKCl9KTtnLmJpbmQodGhpcy5fX3VsLFwidHJhbnNpdGlvbmVuZFwiLGZ1bmN0aW9uKCl7ZC5vblJlc2l6ZSgpfSk7Zy5iaW5kKHRoaXMuX191bCxcIm9UcmFuc2l0aW9uRW5kXCIsZnVuY3Rpb24oKXtkLm9uUmVzaXplKCl9KTt0aGlzLm9uUmVzaXplKCk7YS5yZXNpemFibGUmJkoodGhpcyk7ZC5nZXRSb290KCk7YS5wYXJlbnR8fGMoKX07ay50b2dnbGVIaWRlPWZ1bmN0aW9uKCl7QT0hQTtpLmVhY2goRyxcbmZ1bmN0aW9uKGEpe2EuZG9tRWxlbWVudC5zdHlsZS56SW5kZXg9QT8tOTk5Ojk5OTthLmRvbUVsZW1lbnQuc3R5bGUub3BhY2l0eT1BPzA6MX0pfTtrLkNMQVNTX0FVVE9fUExBQ0U9XCJhXCI7ay5DTEFTU19BVVRPX1BMQUNFX0NPTlRBSU5FUj1cImFjXCI7ay5DTEFTU19NQUlOPVwibWFpblwiO2suQ0xBU1NfQ09OVFJPTExFUl9ST1c9XCJjclwiO2suQ0xBU1NfVE9PX1RBTEw9XCJ0YWxsZXItdGhhbi13aW5kb3dcIjtrLkNMQVNTX0NMT1NFRD1cImNsb3NlZFwiO2suQ0xBU1NfQ0xPU0VfQlVUVE9OPVwiY2xvc2UtYnV0dG9uXCI7ay5DTEFTU19EUkFHPVwiZHJhZ1wiO2suREVGQVVMVF9XSURUSD0yNDU7ay5URVhUX0NMT1NFRD1cIkNsb3NlIENvbnRyb2xzXCI7ay5URVhUX09QRU49XCJPcGVuIENvbnRyb2xzXCI7Zy5iaW5kKHdpbmRvdyxcImtleWRvd25cIixmdW5jdGlvbihhKXtkb2N1bWVudC5hY3RpdmVFbGVtZW50LnR5cGUhPT1cInRleHRcIiYmKGEud2hpY2g9PT03Mnx8YS5rZXlDb2RlPT03MikmJmsudG9nZ2xlSGlkZSgpfSxcbmZhbHNlKTtpLmV4dGVuZChrLnByb3RvdHlwZSx7YWRkOmZ1bmN0aW9uKGEsYil7cmV0dXJuIHEodGhpcyxhLGIse2ZhY3RvcnlBcmdzOkFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywyKX0pfSxhZGRDb2xvcjpmdW5jdGlvbihhLGIpe3JldHVybiBxKHRoaXMsYSxiLHtjb2xvcjp0cnVlfSl9LHJlbW92ZTpmdW5jdGlvbihhKXt0aGlzLl9fdWwucmVtb3ZlQ2hpbGQoYS5fX2xpKTt0aGlzLl9fY29udHJvbGxlcnMuc2xpY2UodGhpcy5fX2NvbnRyb2xsZXJzLmluZGV4T2YoYSksMSk7dmFyIGI9dGhpcztpLmRlZmVyKGZ1bmN0aW9uKCl7Yi5vblJlc2l6ZSgpfSl9LGRlc3Ryb3k6ZnVuY3Rpb24oKXt0aGlzLmF1dG9QbGFjZSYmdi5yZW1vdmVDaGlsZCh0aGlzLmRvbUVsZW1lbnQpfSxhZGRGb2xkZXI6ZnVuY3Rpb24oYSl7aWYodGhpcy5fX2ZvbGRlcnNbYV0hPT12b2lkIDApdGhyb3cgRXJyb3IoJ1lvdSBhbHJlYWR5IGhhdmUgYSBmb2xkZXIgaW4gdGhpcyBHVUkgYnkgdGhlIG5hbWUgXCInK1xuYSsnXCInKTt2YXIgYj17bmFtZTphLHBhcmVudDp0aGlzfTtiLmF1dG9QbGFjZT10aGlzLmF1dG9QbGFjZTtpZih0aGlzLmxvYWQmJnRoaXMubG9hZC5mb2xkZXJzJiZ0aGlzLmxvYWQuZm9sZGVyc1thXSliLmNsb3NlZD10aGlzLmxvYWQuZm9sZGVyc1thXS5jbG9zZWQsYi5sb2FkPXRoaXMubG9hZC5mb2xkZXJzW2FdO2I9bmV3IGsoYik7dGhpcy5fX2ZvbGRlcnNbYV09YjthPXModGhpcyxiLmRvbUVsZW1lbnQpO2cuYWRkQ2xhc3MoYSxcImZvbGRlclwiKTtyZXR1cm4gYn0sb3BlbjpmdW5jdGlvbigpe3RoaXMuY2xvc2VkPWZhbHNlfSxjbG9zZTpmdW5jdGlvbigpe3RoaXMuY2xvc2VkPXRydWV9LG9uUmVzaXplOmZ1bmN0aW9uKCl7dmFyIGE9dGhpcy5nZXRSb290KCk7aWYoYS5zY3JvbGxhYmxlKXt2YXIgYj1nLmdldE9mZnNldChhLl9fdWwpLnRvcCxjPTA7aS5lYWNoKGEuX191bC5jaGlsZE5vZGVzLGZ1bmN0aW9uKGIpe2EuYXV0b1BsYWNlJiZiPT09YS5fX3NhdmVfcm93fHwoYys9XG5nLmdldEhlaWdodChiKSl9KTt3aW5kb3cuaW5uZXJIZWlnaHQtYi0yMDxjPyhnLmFkZENsYXNzKGEuZG9tRWxlbWVudCxrLkNMQVNTX1RPT19UQUxMKSxhLl9fdWwuc3R5bGUuaGVpZ2h0PXdpbmRvdy5pbm5lckhlaWdodC1iLTIwK1wicHhcIik6KGcucmVtb3ZlQ2xhc3MoYS5kb21FbGVtZW50LGsuQ0xBU1NfVE9PX1RBTEwpLGEuX191bC5zdHlsZS5oZWlnaHQ9XCJhdXRvXCIpfWEuX19yZXNpemVfaGFuZGxlJiZpLmRlZmVyKGZ1bmN0aW9uKCl7YS5fX3Jlc2l6ZV9oYW5kbGUuc3R5bGUuaGVpZ2h0PWEuX191bC5vZmZzZXRIZWlnaHQrXCJweFwifSk7aWYoYS5fX2Nsb3NlQnV0dG9uKWEuX19jbG9zZUJ1dHRvbi5zdHlsZS53aWR0aD1hLndpZHRoK1wicHhcIn0scmVtZW1iZXI6ZnVuY3Rpb24oKXtpZihpLmlzVW5kZWZpbmVkKHgpKXg9bmV3IHkseC5kb21FbGVtZW50LmlubmVySFRNTD1hO2lmKHRoaXMucGFyZW50KXRocm93IEVycm9yKFwiWW91IGNhbiBvbmx5IGNhbGwgcmVtZW1iZXIgb24gYSB0b3AgbGV2ZWwgR1VJLlwiKTtcbnZhciBiPXRoaXM7aS5lYWNoKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyksZnVuY3Rpb24oYSl7Yi5fX3JlbWVtYmVyZWRPYmplY3RzLmxlbmd0aD09MCYmSShiKTtiLl9fcmVtZW1iZXJlZE9iamVjdHMuaW5kZXhPZihhKT09LTEmJmIuX19yZW1lbWJlcmVkT2JqZWN0cy5wdXNoKGEpfSk7dGhpcy5hdXRvUGxhY2UmJkQodGhpcyx0aGlzLndpZHRoKX0sZ2V0Um9vdDpmdW5jdGlvbigpe2Zvcih2YXIgYT10aGlzO2EucGFyZW50OylhPWEucGFyZW50O3JldHVybiBhfSxnZXRTYXZlT2JqZWN0OmZ1bmN0aW9uKCl7dmFyIGE9dGhpcy5sb2FkO2EuY2xvc2VkPXRoaXMuY2xvc2VkO2lmKHRoaXMuX19yZW1lbWJlcmVkT2JqZWN0cy5sZW5ndGg+MCl7YS5wcmVzZXQ9dGhpcy5wcmVzZXQ7aWYoIWEucmVtZW1iZXJlZClhLnJlbWVtYmVyZWQ9e307YS5yZW1lbWJlcmVkW3RoaXMucHJlc2V0XT16KHRoaXMpfWEuZm9sZGVycz17fTtpLmVhY2godGhpcy5fX2ZvbGRlcnMsZnVuY3Rpb24oYixcbmMpe2EuZm9sZGVyc1tjXT1iLmdldFNhdmVPYmplY3QoKX0pO3JldHVybiBhfSxzYXZlOmZ1bmN0aW9uKCl7aWYoIXRoaXMubG9hZC5yZW1lbWJlcmVkKXRoaXMubG9hZC5yZW1lbWJlcmVkPXt9O3RoaXMubG9hZC5yZW1lbWJlcmVkW3RoaXMucHJlc2V0XT16KHRoaXMpO0IodGhpcyxmYWxzZSl9LHNhdmVBczpmdW5jdGlvbihhKXtpZighdGhpcy5sb2FkLnJlbWVtYmVyZWQpdGhpcy5sb2FkLnJlbWVtYmVyZWQ9e30sdGhpcy5sb2FkLnJlbWVtYmVyZWRbd109eih0aGlzLHRydWUpO3RoaXMubG9hZC5yZW1lbWJlcmVkW2FdPXoodGhpcyk7dGhpcy5wcmVzZXQ9YTtDKHRoaXMsYSx0cnVlKX0scmV2ZXJ0OmZ1bmN0aW9uKGEpe2kuZWFjaCh0aGlzLl9fY29udHJvbGxlcnMsZnVuY3Rpb24oYil7dGhpcy5nZXRSb290KCkubG9hZC5yZW1lbWJlcmVkP3QoYXx8dGhpcy5nZXRSb290KCksYik6Yi5zZXRWYWx1ZShiLmluaXRpYWxWYWx1ZSl9LHRoaXMpO2kuZWFjaCh0aGlzLl9fZm9sZGVycyxcbmZ1bmN0aW9uKGEpe2EucmV2ZXJ0KGEpfSk7YXx8Qih0aGlzLmdldFJvb3QoKSxmYWxzZSl9LGxpc3RlbjpmdW5jdGlvbihhKXt2YXIgYj10aGlzLl9fbGlzdGVuaW5nLmxlbmd0aD09MDt0aGlzLl9fbGlzdGVuaW5nLnB1c2goYSk7YiYmRSh0aGlzLl9fbGlzdGVuaW5nKX19KTtyZXR1cm4ga30oZGF0LnV0aWxzLmNzcywnPGRpdiBpZD1cImRnLXNhdmVcIiBjbGFzcz1cImRnIGRpYWxvZ3VlXCI+XFxuXFxuICBIZXJlXFwncyB0aGUgbmV3IGxvYWQgcGFyYW1ldGVyIGZvciB5b3VyIDxjb2RlPkdVSTwvY29kZT5cXCdzIGNvbnN0cnVjdG9yOlxcblxcbiAgPHRleHRhcmVhIGlkPVwiZGctbmV3LWNvbnN0cnVjdG9yXCI+PC90ZXh0YXJlYT5cXG5cXG4gIDxkaXYgaWQ9XCJkZy1zYXZlLWxvY2FsbHlcIj5cXG5cXG4gICAgPGlucHV0IGlkPVwiZGctbG9jYWwtc3RvcmFnZVwiIHR5cGU9XCJjaGVja2JveFwiLz4gQXV0b21hdGljYWxseSBzYXZlXFxuICAgIHZhbHVlcyB0byA8Y29kZT5sb2NhbFN0b3JhZ2U8L2NvZGU+IG9uIGV4aXQuXFxuXFxuICAgIDxkaXYgaWQ9XCJkZy1sb2NhbC1leHBsYWluXCI+VGhlIHZhbHVlcyBzYXZlZCB0byA8Y29kZT5sb2NhbFN0b3JhZ2U8L2NvZGU+IHdpbGxcXG4gICAgICBvdmVycmlkZSB0aG9zZSBwYXNzZWQgdG8gPGNvZGU+ZGF0LkdVSTwvY29kZT5cXCdzIGNvbnN0cnVjdG9yLiBUaGlzIG1ha2VzIGl0XFxuICAgICAgZWFzaWVyIHRvIHdvcmsgaW5jcmVtZW50YWxseSwgYnV0IDxjb2RlPmxvY2FsU3RvcmFnZTwvY29kZT4gaXMgZnJhZ2lsZSxcXG4gICAgICBhbmQgeW91ciBmcmllbmRzIG1heSBub3Qgc2VlIHRoZSBzYW1lIHZhbHVlcyB5b3UgZG8uXFxuICAgICAgXFxuICAgIDwvZGl2PlxcbiAgICBcXG4gIDwvZGl2PlxcblxcbjwvZGl2PicsXG5cIi5kZyB1bHtsaXN0LXN0eWxlOm5vbmU7bWFyZ2luOjA7cGFkZGluZzowO3dpZHRoOjEwMCU7Y2xlYXI6Ym90aH0uZGcuYWN7cG9zaXRpb246Zml4ZWQ7dG9wOjA7bGVmdDowO3JpZ2h0OjA7aGVpZ2h0OjA7ei1pbmRleDowfS5kZzpub3QoLmFjKSAubWFpbntvdmVyZmxvdzpoaWRkZW59LmRnLm1haW57LXdlYmtpdC10cmFuc2l0aW9uOm9wYWNpdHkgMC4xcyBsaW5lYXI7LW8tdHJhbnNpdGlvbjpvcGFjaXR5IDAuMXMgbGluZWFyOy1tb3otdHJhbnNpdGlvbjpvcGFjaXR5IDAuMXMgbGluZWFyO3RyYW5zaXRpb246b3BhY2l0eSAwLjFzIGxpbmVhcn0uZGcubWFpbi50YWxsZXItdGhhbi13aW5kb3d7b3ZlcmZsb3cteTphdXRvfS5kZy5tYWluLnRhbGxlci10aGFuLXdpbmRvdyAuY2xvc2UtYnV0dG9ue29wYWNpdHk6MTttYXJnaW4tdG9wOi0xcHg7Ym9yZGVyLXRvcDoxcHggc29saWQgIzJjMmMyY30uZGcubWFpbiB1bC5jbG9zZWQgLmNsb3NlLWJ1dHRvbntvcGFjaXR5OjEgIWltcG9ydGFudH0uZGcubWFpbjpob3ZlciAuY2xvc2UtYnV0dG9uLC5kZy5tYWluIC5jbG9zZS1idXR0b24uZHJhZ3tvcGFjaXR5OjF9LmRnLm1haW4gLmNsb3NlLWJ1dHRvbnstd2Via2l0LXRyYW5zaXRpb246b3BhY2l0eSAwLjFzIGxpbmVhcjstby10cmFuc2l0aW9uOm9wYWNpdHkgMC4xcyBsaW5lYXI7LW1vei10cmFuc2l0aW9uOm9wYWNpdHkgMC4xcyBsaW5lYXI7dHJhbnNpdGlvbjpvcGFjaXR5IDAuMXMgbGluZWFyO2JvcmRlcjowO3Bvc2l0aW9uOmFic29sdXRlO2xpbmUtaGVpZ2h0OjE5cHg7aGVpZ2h0OjIwcHg7Y3Vyc29yOnBvaW50ZXI7dGV4dC1hbGlnbjpjZW50ZXI7YmFja2dyb3VuZC1jb2xvcjojMDAwfS5kZy5tYWluIC5jbG9zZS1idXR0b246aG92ZXJ7YmFja2dyb3VuZC1jb2xvcjojMTExfS5kZy5he2Zsb2F0OnJpZ2h0O21hcmdpbi1yaWdodDoxNXB4O292ZXJmbG93LXg6aGlkZGVufS5kZy5hLmhhcy1zYXZlIHVse21hcmdpbi10b3A6MjdweH0uZGcuYS5oYXMtc2F2ZSB1bC5jbG9zZWR7bWFyZ2luLXRvcDowfS5kZy5hIC5zYXZlLXJvd3twb3NpdGlvbjpmaXhlZDt0b3A6MDt6LWluZGV4OjEwMDJ9LmRnIGxpey13ZWJraXQtdHJhbnNpdGlvbjpoZWlnaHQgMC4xcyBlYXNlLW91dDstby10cmFuc2l0aW9uOmhlaWdodCAwLjFzIGVhc2Utb3V0Oy1tb3otdHJhbnNpdGlvbjpoZWlnaHQgMC4xcyBlYXNlLW91dDt0cmFuc2l0aW9uOmhlaWdodCAwLjFzIGVhc2Utb3V0fS5kZyBsaTpub3QoLmZvbGRlcil7Y3Vyc29yOmF1dG87aGVpZ2h0OjI3cHg7bGluZS1oZWlnaHQ6MjdweDtvdmVyZmxvdzpoaWRkZW47cGFkZGluZzowIDRweCAwIDVweH0uZGcgbGkuZm9sZGVye3BhZGRpbmc6MDtib3JkZXItbGVmdDo0cHggc29saWQgcmdiYSgwLDAsMCwwKX0uZGcgbGkudGl0bGV7Y3Vyc29yOnBvaW50ZXI7bWFyZ2luLWxlZnQ6LTRweH0uZGcgLmNsb3NlZCBsaTpub3QoLnRpdGxlKSwuZGcgLmNsb3NlZCB1bCBsaSwuZGcgLmNsb3NlZCB1bCBsaSA+ICp7aGVpZ2h0OjA7b3ZlcmZsb3c6aGlkZGVuO2JvcmRlcjowfS5kZyAuY3J7Y2xlYXI6Ym90aDtwYWRkaW5nLWxlZnQ6M3B4O2hlaWdodDoyN3B4fS5kZyAucHJvcGVydHktbmFtZXtjdXJzb3I6ZGVmYXVsdDtmbG9hdDpsZWZ0O2NsZWFyOmxlZnQ7d2lkdGg6NDAlO292ZXJmbG93OmhpZGRlbjt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzfS5kZyAuY3tmbG9hdDpsZWZ0O3dpZHRoOjYwJX0uZGcgLmMgaW5wdXRbdHlwZT10ZXh0XXtib3JkZXI6MDttYXJnaW4tdG9wOjRweDtwYWRkaW5nOjNweDt3aWR0aDoxMDAlO2Zsb2F0OnJpZ2h0fS5kZyAuaGFzLXNsaWRlciBpbnB1dFt0eXBlPXRleHRde3dpZHRoOjMwJTttYXJnaW4tbGVmdDowfS5kZyAuc2xpZGVye2Zsb2F0OmxlZnQ7d2lkdGg6NjYlO21hcmdpbi1sZWZ0Oi01cHg7bWFyZ2luLXJpZ2h0OjA7aGVpZ2h0OjE5cHg7bWFyZ2luLXRvcDo0cHh9LmRnIC5zbGlkZXItZmd7aGVpZ2h0OjEwMCV9LmRnIC5jIGlucHV0W3R5cGU9Y2hlY2tib3hde21hcmdpbi10b3A6OXB4fS5kZyAuYyBzZWxlY3R7bWFyZ2luLXRvcDo1cHh9LmRnIC5jci5mdW5jdGlvbiwuZGcgLmNyLmZ1bmN0aW9uIC5wcm9wZXJ0eS1uYW1lLC5kZyAuY3IuZnVuY3Rpb24gKiwuZGcgLmNyLmJvb2xlYW4sLmRnIC5jci5ib29sZWFuICp7Y3Vyc29yOnBvaW50ZXJ9LmRnIC5zZWxlY3RvcntkaXNwbGF5Om5vbmU7cG9zaXRpb246YWJzb2x1dGU7bWFyZ2luLWxlZnQ6LTlweDttYXJnaW4tdG9wOjIzcHg7ei1pbmRleDoxMH0uZGcgLmM6aG92ZXIgLnNlbGVjdG9yLC5kZyAuc2VsZWN0b3IuZHJhZ3tkaXNwbGF5OmJsb2NrfS5kZyBsaS5zYXZlLXJvd3twYWRkaW5nOjB9LmRnIGxpLnNhdmUtcm93IC5idXR0b257ZGlzcGxheTppbmxpbmUtYmxvY2s7cGFkZGluZzowcHggNnB4fS5kZy5kaWFsb2d1ZXtiYWNrZ3JvdW5kLWNvbG9yOiMyMjI7d2lkdGg6NDYwcHg7cGFkZGluZzoxNXB4O2ZvbnQtc2l6ZToxM3B4O2xpbmUtaGVpZ2h0OjE1cHh9I2RnLW5ldy1jb25zdHJ1Y3RvcntwYWRkaW5nOjEwcHg7Y29sb3I6IzIyMjtmb250LWZhbWlseTpNb25hY28sIG1vbm9zcGFjZTtmb250LXNpemU6MTBweDtib3JkZXI6MDtyZXNpemU6bm9uZTtib3gtc2hhZG93Omluc2V0IDFweCAxcHggMXB4ICM4ODg7d29yZC13cmFwOmJyZWFrLXdvcmQ7bWFyZ2luOjEycHggMDtkaXNwbGF5OmJsb2NrO3dpZHRoOjQ0MHB4O292ZXJmbG93LXk6c2Nyb2xsO2hlaWdodDoxMDBweDtwb3NpdGlvbjpyZWxhdGl2ZX0jZGctbG9jYWwtZXhwbGFpbntkaXNwbGF5Om5vbmU7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTdweDtib3JkZXItcmFkaXVzOjNweDtiYWNrZ3JvdW5kLWNvbG9yOiMzMzM7cGFkZGluZzo4cHg7bWFyZ2luLXRvcDoxMHB4fSNkZy1sb2NhbC1leHBsYWluIGNvZGV7Zm9udC1zaXplOjEwcHh9I2RhdC1ndWktc2F2ZS1sb2NhbGx5e2Rpc3BsYXk6bm9uZX0uZGd7Y29sb3I6I2VlZTtmb250OjExcHggJ0x1Y2lkYSBHcmFuZGUnLCBzYW5zLXNlcmlmO3RleHQtc2hhZG93OjAgLTFweCAwICMxMTF9LmRnLm1haW46Oi13ZWJraXQtc2Nyb2xsYmFye3dpZHRoOjVweDtiYWNrZ3JvdW5kOiMxYTFhMWF9LmRnLm1haW46Oi13ZWJraXQtc2Nyb2xsYmFyLWNvcm5lcntoZWlnaHQ6MDtkaXNwbGF5Om5vbmV9LmRnLm1haW46Oi13ZWJraXQtc2Nyb2xsYmFyLXRodW1ie2JvcmRlci1yYWRpdXM6NXB4O2JhY2tncm91bmQ6IzY3Njc2N30uZGcgbGk6bm90KC5mb2xkZXIpe2JhY2tncm91bmQ6IzFhMWExYTtib3JkZXItYm90dG9tOjFweCBzb2xpZCAjMmMyYzJjfS5kZyBsaS5zYXZlLXJvd3tsaW5lLWhlaWdodDoyNXB4O2JhY2tncm91bmQ6I2RhZDVjYjtib3JkZXI6MH0uZGcgbGkuc2F2ZS1yb3cgc2VsZWN0e21hcmdpbi1sZWZ0OjVweDt3aWR0aDoxMDhweH0uZGcgbGkuc2F2ZS1yb3cgLmJ1dHRvbnttYXJnaW4tbGVmdDo1cHg7bWFyZ2luLXRvcDoxcHg7Ym9yZGVyLXJhZGl1czoycHg7Zm9udC1zaXplOjlweDtsaW5lLWhlaWdodDo3cHg7cGFkZGluZzo0cHggNHB4IDVweCA0cHg7YmFja2dyb3VuZDojYzViZGFkO2NvbG9yOiNmZmY7dGV4dC1zaGFkb3c6MCAxcHggMCAjYjBhNThmO2JveC1zaGFkb3c6MCAtMXB4IDAgI2IwYTU4ZjtjdXJzb3I6cG9pbnRlcn0uZGcgbGkuc2F2ZS1yb3cgLmJ1dHRvbi5nZWFyc3tiYWNrZ3JvdW5kOiNjNWJkYWQgdXJsKGRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQXNBQUFBTkNBWUFBQUIvOVpRN0FBQUFHWFJGV0hSVGIyWjBkMkZ5WlFCQlpHOWlaU0JKYldGblpWSmxZV1I1Y2NsbFBBQUFBUUpKUkVGVWVOcGlZS0FVL1AvL1B3R0lDL0FwQ0FCaUJTQVcrSThBQ2xBY2dLeFE0VDlob01BRVVyeHgyUVNHTjYrZWdEWCsvdldUNGU3TjgyQU1Zb1BBeC9ldndXb1lvU1liQUNYMnM3S3hDeHpjc2V6RGgzZXZGb0RFQllURUVxeWNnZ1dBekE5QXVVU1FRZ2VZUGE5ZlB2Ni9ZV20vQWN4NUlQYjd0eS9mdytRWmJsdzY3dkRzOFIwWUh5UWhnT2J4K3lBSmtCcW1HNWRQUERoMWFQT0dSL2V1Z1cwRzR2bElvVElmeUZjQStRZWtoaEhKaFBkUXhiaUFJZ3VNQlRRWnJQRDcxMDhNNnJvV1lERlFpSUFBdjZBb3cvMWJGd1hnaXMrZjJMVUF5bndvSWFOY3o4WE54M0RsN01FSlVER1FweDlndFE4WUN1ZUIrRDI2T0VDQUFRRGFkdDdlNDZENDJRQUFBQUJKUlU1RXJrSmdnZz09KSAycHggMXB4IG5vLXJlcGVhdDtoZWlnaHQ6N3B4O3dpZHRoOjhweH0uZGcgbGkuc2F2ZS1yb3cgLmJ1dHRvbjpob3ZlcntiYWNrZ3JvdW5kLWNvbG9yOiNiYWIxOWU7Ym94LXNoYWRvdzowIC0xcHggMCAjYjBhNThmfS5kZyBsaS5mb2xkZXJ7Ym9yZGVyLWJvdHRvbTowfS5kZyBsaS50aXRsZXtwYWRkaW5nLWxlZnQ6MTZweDtiYWNrZ3JvdW5kOiMwMDAgdXJsKGRhdGE6aW1hZ2UvZ2lmO2Jhc2U2NCxSMGxHT0RsaEJRQUZBSkVBQVAvLy8vUHo4Ly8vLy8vLy95SDVCQUVBQUFJQUxBQUFBQUFGQUFVQUFBSUlsSStoS2dGeG9DZ0FPdz09KSA2cHggMTBweCBuby1yZXBlYXQ7Y3Vyc29yOnBvaW50ZXI7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgcmdiYSgyNTUsMjU1LDI1NSwwLjIpfS5kZyAuY2xvc2VkIGxpLnRpdGxle2JhY2tncm91bmQtaW1hZ2U6dXJsKGRhdGE6aW1hZ2UvZ2lmO2Jhc2U2NCxSMGxHT0RsaEJRQUZBSkVBQVAvLy8vUHo4Ly8vLy8vLy95SDVCQUVBQUFJQUxBQUFBQUFGQUFVQUFBSUlsR0lXcU1DYldBRUFPdz09KX0uZGcgLmNyLmJvb2xlYW57Ym9yZGVyLWxlZnQ6M3B4IHNvbGlkICM4MDY3ODd9LmRnIC5jci5mdW5jdGlvbntib3JkZXItbGVmdDozcHggc29saWQgI2U2MWQ1Zn0uZGcgLmNyLm51bWJlcntib3JkZXItbGVmdDozcHggc29saWQgIzJmYTFkNn0uZGcgLmNyLm51bWJlciBpbnB1dFt0eXBlPXRleHRde2NvbG9yOiMyZmExZDZ9LmRnIC5jci5zdHJpbmd7Ym9yZGVyLWxlZnQ6M3B4IHNvbGlkICMxZWQzNmZ9LmRnIC5jci5zdHJpbmcgaW5wdXRbdHlwZT10ZXh0XXtjb2xvcjojMWVkMzZmfS5kZyAuY3IuZnVuY3Rpb246aG92ZXIsLmRnIC5jci5ib29sZWFuOmhvdmVye2JhY2tncm91bmQ6IzExMX0uZGcgLmMgaW5wdXRbdHlwZT10ZXh0XXtiYWNrZ3JvdW5kOiMzMDMwMzA7b3V0bGluZTpub25lfS5kZyAuYyBpbnB1dFt0eXBlPXRleHRdOmhvdmVye2JhY2tncm91bmQ6IzNjM2MzY30uZGcgLmMgaW5wdXRbdHlwZT10ZXh0XTpmb2N1c3tiYWNrZ3JvdW5kOiM0OTQ5NDk7Y29sb3I6I2ZmZn0uZGcgLmMgLnNsaWRlcntiYWNrZ3JvdW5kOiMzMDMwMzA7Y3Vyc29yOmV3LXJlc2l6ZX0uZGcgLmMgLnNsaWRlci1mZ3tiYWNrZ3JvdW5kOiMyZmExZDZ9LmRnIC5jIC5zbGlkZXI6aG92ZXJ7YmFja2dyb3VuZDojM2MzYzNjfS5kZyAuYyAuc2xpZGVyOmhvdmVyIC5zbGlkZXItZmd7YmFja2dyb3VuZDojNDRhYmRhfVxcblwiLFxuZGF0LmNvbnRyb2xsZXJzLmZhY3Rvcnk9ZnVuY3Rpb24oZSxhLGMsZCxmLGIsbil7cmV0dXJuIGZ1bmN0aW9uKGgsaixtLGwpe3ZhciBvPWhbal07aWYobi5pc0FycmF5KG0pfHxuLmlzT2JqZWN0KG0pKXJldHVybiBuZXcgZShoLGosbSk7aWYobi5pc051bWJlcihvKSlyZXR1cm4gbi5pc051bWJlcihtKSYmbi5pc051bWJlcihsKT9uZXcgYyhoLGosbSxsKTpuZXcgYShoLGose21pbjptLG1heDpsfSk7aWYobi5pc1N0cmluZyhvKSlyZXR1cm4gbmV3IGQoaCxqKTtpZihuLmlzRnVuY3Rpb24obykpcmV0dXJuIG5ldyBmKGgsaixcIlwiKTtpZihuLmlzQm9vbGVhbihvKSlyZXR1cm4gbmV3IGIoaCxqKX19KGRhdC5jb250cm9sbGVycy5PcHRpb25Db250cm9sbGVyLGRhdC5jb250cm9sbGVycy5OdW1iZXJDb250cm9sbGVyQm94LGRhdC5jb250cm9sbGVycy5OdW1iZXJDb250cm9sbGVyU2xpZGVyLGRhdC5jb250cm9sbGVycy5TdHJpbmdDb250cm9sbGVyPWZ1bmN0aW9uKGUsYSxjKXt2YXIgZD1cbmZ1bmN0aW9uKGMsYil7ZnVuY3Rpb24gZSgpe2guc2V0VmFsdWUoaC5fX2lucHV0LnZhbHVlKX1kLnN1cGVyY2xhc3MuY2FsbCh0aGlzLGMsYik7dmFyIGg9dGhpczt0aGlzLl9faW5wdXQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO3RoaXMuX19pbnB1dC5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsXCJ0ZXh0XCIpO2EuYmluZCh0aGlzLl9faW5wdXQsXCJrZXl1cFwiLGUpO2EuYmluZCh0aGlzLl9faW5wdXQsXCJjaGFuZ2VcIixlKTthLmJpbmQodGhpcy5fX2lucHV0LFwiYmx1clwiLGZ1bmN0aW9uKCl7aC5fX29uRmluaXNoQ2hhbmdlJiZoLl9fb25GaW5pc2hDaGFuZ2UuY2FsbChoLGguZ2V0VmFsdWUoKSl9KTthLmJpbmQodGhpcy5fX2lucHV0LFwia2V5ZG93blwiLGZ1bmN0aW9uKGEpe2Eua2V5Q29kZT09PTEzJiZ0aGlzLmJsdXIoKX0pO3RoaXMudXBkYXRlRGlzcGxheSgpO3RoaXMuZG9tRWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLl9faW5wdXQpfTtkLnN1cGVyY2xhc3M9ZTtjLmV4dGVuZChkLnByb3RvdHlwZSxcbmUucHJvdG90eXBlLHt1cGRhdGVEaXNwbGF5OmZ1bmN0aW9uKCl7aWYoIWEuaXNBY3RpdmUodGhpcy5fX2lucHV0KSl0aGlzLl9faW5wdXQudmFsdWU9dGhpcy5nZXRWYWx1ZSgpO3JldHVybiBkLnN1cGVyY2xhc3MucHJvdG90eXBlLnVwZGF0ZURpc3BsYXkuY2FsbCh0aGlzKX19KTtyZXR1cm4gZH0oZGF0LmNvbnRyb2xsZXJzLkNvbnRyb2xsZXIsZGF0LmRvbS5kb20sZGF0LnV0aWxzLmNvbW1vbiksZGF0LmNvbnRyb2xsZXJzLkZ1bmN0aW9uQ29udHJvbGxlcixkYXQuY29udHJvbGxlcnMuQm9vbGVhbkNvbnRyb2xsZXIsZGF0LnV0aWxzLmNvbW1vbiksZGF0LmNvbnRyb2xsZXJzLkNvbnRyb2xsZXIsZGF0LmNvbnRyb2xsZXJzLkJvb2xlYW5Db250cm9sbGVyLGRhdC5jb250cm9sbGVycy5GdW5jdGlvbkNvbnRyb2xsZXIsZGF0LmNvbnRyb2xsZXJzLk51bWJlckNvbnRyb2xsZXJCb3gsZGF0LmNvbnRyb2xsZXJzLk51bWJlckNvbnRyb2xsZXJTbGlkZXIsZGF0LmNvbnRyb2xsZXJzLk9wdGlvbkNvbnRyb2xsZXIsXG5kYXQuY29udHJvbGxlcnMuQ29sb3JDb250cm9sbGVyPWZ1bmN0aW9uKGUsYSxjLGQsZil7ZnVuY3Rpb24gYihhLGIsYyxkKXthLnN0eWxlLmJhY2tncm91bmQ9XCJcIjtmLmVhY2goaixmdW5jdGlvbihlKXthLnN0eWxlLmNzc1RleHQrPVwiYmFja2dyb3VuZDogXCIrZStcImxpbmVhci1ncmFkaWVudChcIitiK1wiLCBcIitjK1wiIDAlLCBcIitkK1wiIDEwMCUpOyBcIn0pfWZ1bmN0aW9uIG4oYSl7YS5zdHlsZS5iYWNrZ3JvdW5kPVwiXCI7YS5zdHlsZS5jc3NUZXh0Kz1cImJhY2tncm91bmQ6IC1tb3otbGluZWFyLWdyYWRpZW50KHRvcCwgICNmZjAwMDAgMCUsICNmZjAwZmYgMTclLCAjMDAwMGZmIDM0JSwgIzAwZmZmZiA1MCUsICMwMGZmMDAgNjclLCAjZmZmZjAwIDg0JSwgI2ZmMDAwMCAxMDAlKTtcIjthLnN0eWxlLmNzc1RleHQrPVwiYmFja2dyb3VuZDogLXdlYmtpdC1saW5lYXItZ3JhZGllbnQodG9wLCAgI2ZmMDAwMCAwJSwjZmYwMGZmIDE3JSwjMDAwMGZmIDM0JSwjMDBmZmZmIDUwJSwjMDBmZjAwIDY3JSwjZmZmZjAwIDg0JSwjZmYwMDAwIDEwMCUpO1wiO1xuYS5zdHlsZS5jc3NUZXh0Kz1cImJhY2tncm91bmQ6IC1vLWxpbmVhci1ncmFkaWVudCh0b3AsICAjZmYwMDAwIDAlLCNmZjAwZmYgMTclLCMwMDAwZmYgMzQlLCMwMGZmZmYgNTAlLCMwMGZmMDAgNjclLCNmZmZmMDAgODQlLCNmZjAwMDAgMTAwJSk7XCI7YS5zdHlsZS5jc3NUZXh0Kz1cImJhY2tncm91bmQ6IC1tcy1saW5lYXItZ3JhZGllbnQodG9wLCAgI2ZmMDAwMCAwJSwjZmYwMGZmIDE3JSwjMDAwMGZmIDM0JSwjMDBmZmZmIDUwJSwjMDBmZjAwIDY3JSwjZmZmZjAwIDg0JSwjZmYwMDAwIDEwMCUpO1wiO2Euc3R5bGUuY3NzVGV4dCs9XCJiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQodG9wLCAgI2ZmMDAwMCAwJSwjZmYwMGZmIDE3JSwjMDAwMGZmIDM0JSwjMDBmZmZmIDUwJSwjMDBmZjAwIDY3JSwjZmZmZjAwIDg0JSwjZmYwMDAwIDEwMCUpO1wifXZhciBoPWZ1bmN0aW9uKGUsbCl7ZnVuY3Rpb24gbyhiKXtxKGIpO2EuYmluZCh3aW5kb3csXCJtb3VzZW1vdmVcIixxKTthLmJpbmQod2luZG93LFxuXCJtb3VzZXVwXCIsail9ZnVuY3Rpb24gaigpe2EudW5iaW5kKHdpbmRvdyxcIm1vdXNlbW92ZVwiLHEpO2EudW5iaW5kKHdpbmRvdyxcIm1vdXNldXBcIixqKX1mdW5jdGlvbiBnKCl7dmFyIGE9ZCh0aGlzLnZhbHVlKTthIT09ZmFsc2U/KHAuX19jb2xvci5fX3N0YXRlPWEscC5zZXRWYWx1ZShwLl9fY29sb3IudG9PcmlnaW5hbCgpKSk6dGhpcy52YWx1ZT1wLl9fY29sb3IudG9TdHJpbmcoKX1mdW5jdGlvbiBpKCl7YS51bmJpbmQod2luZG93LFwibW91c2Vtb3ZlXCIscyk7YS51bmJpbmQod2luZG93LFwibW91c2V1cFwiLGkpfWZ1bmN0aW9uIHEoYil7Yi5wcmV2ZW50RGVmYXVsdCgpO3ZhciBjPWEuZ2V0V2lkdGgocC5fX3NhdHVyYXRpb25fZmllbGQpLGQ9YS5nZXRPZmZzZXQocC5fX3NhdHVyYXRpb25fZmllbGQpLGU9KGIuY2xpZW50WC1kLmxlZnQrZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0KS9jLGI9MS0oYi5jbGllbnRZLWQudG9wK2RvY3VtZW50LmJvZHkuc2Nyb2xsVG9wKS9jO2I+MT9iPVxuMTpiPDAmJihiPTApO2U+MT9lPTE6ZTwwJiYoZT0wKTtwLl9fY29sb3Iudj1iO3AuX19jb2xvci5zPWU7cC5zZXRWYWx1ZShwLl9fY29sb3IudG9PcmlnaW5hbCgpKTtyZXR1cm4gZmFsc2V9ZnVuY3Rpb24gcyhiKXtiLnByZXZlbnREZWZhdWx0KCk7dmFyIGM9YS5nZXRIZWlnaHQocC5fX2h1ZV9maWVsZCksZD1hLmdldE9mZnNldChwLl9faHVlX2ZpZWxkKSxiPTEtKGIuY2xpZW50WS1kLnRvcCtkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCkvYztiPjE/Yj0xOmI8MCYmKGI9MCk7cC5fX2NvbG9yLmg9YiozNjA7cC5zZXRWYWx1ZShwLl9fY29sb3IudG9PcmlnaW5hbCgpKTtyZXR1cm4gZmFsc2V9aC5zdXBlcmNsYXNzLmNhbGwodGhpcyxlLGwpO3RoaXMuX19jb2xvcj1uZXcgYyh0aGlzLmdldFZhbHVlKCkpO3RoaXMuX190ZW1wPW5ldyBjKDApO3ZhciBwPXRoaXM7dGhpcy5kb21FbGVtZW50PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7YS5tYWtlU2VsZWN0YWJsZSh0aGlzLmRvbUVsZW1lbnQsXG5mYWxzZSk7dGhpcy5fX3NlbGVjdG9yPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7dGhpcy5fX3NlbGVjdG9yLmNsYXNzTmFtZT1cInNlbGVjdG9yXCI7dGhpcy5fX3NhdHVyYXRpb25fZmllbGQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTt0aGlzLl9fc2F0dXJhdGlvbl9maWVsZC5jbGFzc05hbWU9XCJzYXR1cmF0aW9uLWZpZWxkXCI7dGhpcy5fX2ZpZWxkX2tub2I9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTt0aGlzLl9fZmllbGRfa25vYi5jbGFzc05hbWU9XCJmaWVsZC1rbm9iXCI7dGhpcy5fX2ZpZWxkX2tub2JfYm9yZGVyPVwiMnB4IHNvbGlkIFwiO3RoaXMuX19odWVfa25vYj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO3RoaXMuX19odWVfa25vYi5jbGFzc05hbWU9XCJodWUta25vYlwiO3RoaXMuX19odWVfZmllbGQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTt0aGlzLl9faHVlX2ZpZWxkLmNsYXNzTmFtZT1cImh1ZS1maWVsZFwiO3RoaXMuX19pbnB1dD1cbmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTt0aGlzLl9faW5wdXQudHlwZT1cInRleHRcIjt0aGlzLl9faW5wdXRfdGV4dFNoYWRvdz1cIjAgMXB4IDFweCBcIjthLmJpbmQodGhpcy5fX2lucHV0LFwia2V5ZG93blwiLGZ1bmN0aW9uKGEpe2Eua2V5Q29kZT09PTEzJiZnLmNhbGwodGhpcyl9KTthLmJpbmQodGhpcy5fX2lucHV0LFwiYmx1clwiLGcpO2EuYmluZCh0aGlzLl9fc2VsZWN0b3IsXCJtb3VzZWRvd25cIixmdW5jdGlvbigpe2EuYWRkQ2xhc3ModGhpcyxcImRyYWdcIikuYmluZCh3aW5kb3csXCJtb3VzZXVwXCIsZnVuY3Rpb24oKXthLnJlbW92ZUNsYXNzKHAuX19zZWxlY3RvcixcImRyYWdcIil9KX0pO3ZhciB0PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7Zi5leHRlbmQodGhpcy5fX3NlbGVjdG9yLnN0eWxlLHt3aWR0aDpcIjEyMnB4XCIsaGVpZ2h0OlwiMTAycHhcIixwYWRkaW5nOlwiM3B4XCIsYmFja2dyb3VuZENvbG9yOlwiIzIyMlwiLGJveFNoYWRvdzpcIjBweCAxcHggM3B4IHJnYmEoMCwwLDAsMC4zKVwifSk7XG5mLmV4dGVuZCh0aGlzLl9fZmllbGRfa25vYi5zdHlsZSx7cG9zaXRpb246XCJhYnNvbHV0ZVwiLHdpZHRoOlwiMTJweFwiLGhlaWdodDpcIjEycHhcIixib3JkZXI6dGhpcy5fX2ZpZWxkX2tub2JfYm9yZGVyKyh0aGlzLl9fY29sb3IudjwwLjU/XCIjZmZmXCI6XCIjMDAwXCIpLGJveFNoYWRvdzpcIjBweCAxcHggM3B4IHJnYmEoMCwwLDAsMC41KVwiLGJvcmRlclJhZGl1czpcIjEycHhcIix6SW5kZXg6MX0pO2YuZXh0ZW5kKHRoaXMuX19odWVfa25vYi5zdHlsZSx7cG9zaXRpb246XCJhYnNvbHV0ZVwiLHdpZHRoOlwiMTVweFwiLGhlaWdodDpcIjJweFwiLGJvcmRlclJpZ2h0OlwiNHB4IHNvbGlkICNmZmZcIix6SW5kZXg6MX0pO2YuZXh0ZW5kKHRoaXMuX19zYXR1cmF0aW9uX2ZpZWxkLnN0eWxlLHt3aWR0aDpcIjEwMHB4XCIsaGVpZ2h0OlwiMTAwcHhcIixib3JkZXI6XCIxcHggc29saWQgIzU1NVwiLG1hcmdpblJpZ2h0OlwiM3B4XCIsZGlzcGxheTpcImlubGluZS1ibG9ja1wiLGN1cnNvcjpcInBvaW50ZXJcIn0pO2YuZXh0ZW5kKHQuc3R5bGUsXG57d2lkdGg6XCIxMDAlXCIsaGVpZ2h0OlwiMTAwJVwiLGJhY2tncm91bmQ6XCJub25lXCJ9KTtiKHQsXCJ0b3BcIixcInJnYmEoMCwwLDAsMClcIixcIiMwMDBcIik7Zi5leHRlbmQodGhpcy5fX2h1ZV9maWVsZC5zdHlsZSx7d2lkdGg6XCIxNXB4XCIsaGVpZ2h0OlwiMTAwcHhcIixkaXNwbGF5OlwiaW5saW5lLWJsb2NrXCIsYm9yZGVyOlwiMXB4IHNvbGlkICM1NTVcIixjdXJzb3I6XCJucy1yZXNpemVcIn0pO24odGhpcy5fX2h1ZV9maWVsZCk7Zi5leHRlbmQodGhpcy5fX2lucHV0LnN0eWxlLHtvdXRsaW5lOlwibm9uZVwiLHRleHRBbGlnbjpcImNlbnRlclwiLGNvbG9yOlwiI2ZmZlwiLGJvcmRlcjowLGZvbnRXZWlnaHQ6XCJib2xkXCIsdGV4dFNoYWRvdzp0aGlzLl9faW5wdXRfdGV4dFNoYWRvdytcInJnYmEoMCwwLDAsMC43KVwifSk7YS5iaW5kKHRoaXMuX19zYXR1cmF0aW9uX2ZpZWxkLFwibW91c2Vkb3duXCIsbyk7YS5iaW5kKHRoaXMuX19maWVsZF9rbm9iLFwibW91c2Vkb3duXCIsbyk7YS5iaW5kKHRoaXMuX19odWVfZmllbGQsXCJtb3VzZWRvd25cIixcbmZ1bmN0aW9uKGIpe3MoYik7YS5iaW5kKHdpbmRvdyxcIm1vdXNlbW92ZVwiLHMpO2EuYmluZCh3aW5kb3csXCJtb3VzZXVwXCIsaSl9KTt0aGlzLl9fc2F0dXJhdGlvbl9maWVsZC5hcHBlbmRDaGlsZCh0KTt0aGlzLl9fc2VsZWN0b3IuYXBwZW5kQ2hpbGQodGhpcy5fX2ZpZWxkX2tub2IpO3RoaXMuX19zZWxlY3Rvci5hcHBlbmRDaGlsZCh0aGlzLl9fc2F0dXJhdGlvbl9maWVsZCk7dGhpcy5fX3NlbGVjdG9yLmFwcGVuZENoaWxkKHRoaXMuX19odWVfZmllbGQpO3RoaXMuX19odWVfZmllbGQuYXBwZW5kQ2hpbGQodGhpcy5fX2h1ZV9rbm9iKTt0aGlzLmRvbUVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5fX2lucHV0KTt0aGlzLmRvbUVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5fX3NlbGVjdG9yKTt0aGlzLnVwZGF0ZURpc3BsYXkoKX07aC5zdXBlcmNsYXNzPWU7Zi5leHRlbmQoaC5wcm90b3R5cGUsZS5wcm90b3R5cGUse3VwZGF0ZURpc3BsYXk6ZnVuY3Rpb24oKXt2YXIgYT1kKHRoaXMuZ2V0VmFsdWUoKSk7XG5pZihhIT09ZmFsc2Upe3ZhciBlPWZhbHNlO2YuZWFjaChjLkNPTVBPTkVOVFMsZnVuY3Rpb24oYil7aWYoIWYuaXNVbmRlZmluZWQoYVtiXSkmJiFmLmlzVW5kZWZpbmVkKHRoaXMuX19jb2xvci5fX3N0YXRlW2JdKSYmYVtiXSE9PXRoaXMuX19jb2xvci5fX3N0YXRlW2JdKXJldHVybiBlPXRydWUse319LHRoaXMpO2UmJmYuZXh0ZW5kKHRoaXMuX19jb2xvci5fX3N0YXRlLGEpfWYuZXh0ZW5kKHRoaXMuX190ZW1wLl9fc3RhdGUsdGhpcy5fX2NvbG9yLl9fc3RhdGUpO3RoaXMuX190ZW1wLmE9MTt2YXIgaD10aGlzLl9fY29sb3IudjwwLjV8fHRoaXMuX19jb2xvci5zPjAuNT8yNTU6MCxqPTI1NS1oO2YuZXh0ZW5kKHRoaXMuX19maWVsZF9rbm9iLnN0eWxlLHttYXJnaW5MZWZ0OjEwMCp0aGlzLl9fY29sb3Iucy03K1wicHhcIixtYXJnaW5Ub3A6MTAwKigxLXRoaXMuX19jb2xvci52KS03K1wicHhcIixiYWNrZ3JvdW5kQ29sb3I6dGhpcy5fX3RlbXAudG9TdHJpbmcoKSxib3JkZXI6dGhpcy5fX2ZpZWxkX2tub2JfYm9yZGVyK1xuXCJyZ2IoXCIraCtcIixcIitoK1wiLFwiK2grXCIpXCJ9KTt0aGlzLl9faHVlX2tub2Iuc3R5bGUubWFyZ2luVG9wPSgxLXRoaXMuX19jb2xvci5oLzM2MCkqMTAwK1wicHhcIjt0aGlzLl9fdGVtcC5zPTE7dGhpcy5fX3RlbXAudj0xO2IodGhpcy5fX3NhdHVyYXRpb25fZmllbGQsXCJsZWZ0XCIsXCIjZmZmXCIsdGhpcy5fX3RlbXAudG9TdHJpbmcoKSk7Zi5leHRlbmQodGhpcy5fX2lucHV0LnN0eWxlLHtiYWNrZ3JvdW5kQ29sb3I6dGhpcy5fX2lucHV0LnZhbHVlPXRoaXMuX19jb2xvci50b1N0cmluZygpLGNvbG9yOlwicmdiKFwiK2grXCIsXCIraCtcIixcIitoK1wiKVwiLHRleHRTaGFkb3c6dGhpcy5fX2lucHV0X3RleHRTaGFkb3crXCJyZ2JhKFwiK2orXCIsXCIraitcIixcIitqK1wiLC43KVwifSl9fSk7dmFyIGo9W1wiLW1vei1cIixcIi1vLVwiLFwiLXdlYmtpdC1cIixcIi1tcy1cIixcIlwiXTtyZXR1cm4gaH0oZGF0LmNvbnRyb2xsZXJzLkNvbnRyb2xsZXIsZGF0LmRvbS5kb20sZGF0LmNvbG9yLkNvbG9yPWZ1bmN0aW9uKGUsYSxjLGQpe2Z1bmN0aW9uIGYoYSxcbmIsYyl7T2JqZWN0LmRlZmluZVByb3BlcnR5KGEsYix7Z2V0OmZ1bmN0aW9uKCl7aWYodGhpcy5fX3N0YXRlLnNwYWNlPT09XCJSR0JcIilyZXR1cm4gdGhpcy5fX3N0YXRlW2JdO24odGhpcyxiLGMpO3JldHVybiB0aGlzLl9fc3RhdGVbYl19LHNldDpmdW5jdGlvbihhKXtpZih0aGlzLl9fc3RhdGUuc3BhY2UhPT1cIlJHQlwiKW4odGhpcyxiLGMpLHRoaXMuX19zdGF0ZS5zcGFjZT1cIlJHQlwiO3RoaXMuX19zdGF0ZVtiXT1hfX0pfWZ1bmN0aW9uIGIoYSxiKXtPYmplY3QuZGVmaW5lUHJvcGVydHkoYSxiLHtnZXQ6ZnVuY3Rpb24oKXtpZih0aGlzLl9fc3RhdGUuc3BhY2U9PT1cIkhTVlwiKXJldHVybiB0aGlzLl9fc3RhdGVbYl07aCh0aGlzKTtyZXR1cm4gdGhpcy5fX3N0YXRlW2JdfSxzZXQ6ZnVuY3Rpb24oYSl7aWYodGhpcy5fX3N0YXRlLnNwYWNlIT09XCJIU1ZcIiloKHRoaXMpLHRoaXMuX19zdGF0ZS5zcGFjZT1cIkhTVlwiO3RoaXMuX19zdGF0ZVtiXT1hfX0pfWZ1bmN0aW9uIG4oYixjLGUpe2lmKGIuX19zdGF0ZS5zcGFjZT09PVxuXCJIRVhcIiliLl9fc3RhdGVbY109YS5jb21wb25lbnRfZnJvbV9oZXgoYi5fX3N0YXRlLmhleCxlKTtlbHNlIGlmKGIuX19zdGF0ZS5zcGFjZT09PVwiSFNWXCIpZC5leHRlbmQoYi5fX3N0YXRlLGEuaHN2X3RvX3JnYihiLl9fc3RhdGUuaCxiLl9fc3RhdGUucyxiLl9fc3RhdGUudikpO2Vsc2UgdGhyb3dcIkNvcnJ1cHRlZCBjb2xvciBzdGF0ZVwiO31mdW5jdGlvbiBoKGIpe3ZhciBjPWEucmdiX3RvX2hzdihiLnIsYi5nLGIuYik7ZC5leHRlbmQoYi5fX3N0YXRlLHtzOmMucyx2OmMudn0pO2lmKGQuaXNOYU4oYy5oKSl7aWYoZC5pc1VuZGVmaW5lZChiLl9fc3RhdGUuaCkpYi5fX3N0YXRlLmg9MH1lbHNlIGIuX19zdGF0ZS5oPWMuaH12YXIgaj1mdW5jdGlvbigpe3RoaXMuX19zdGF0ZT1lLmFwcGx5KHRoaXMsYXJndW1lbnRzKTtpZih0aGlzLl9fc3RhdGU9PT1mYWxzZSl0aHJvd1wiRmFpbGVkIHRvIGludGVycHJldCBjb2xvciBhcmd1bWVudHNcIjt0aGlzLl9fc3RhdGUuYT10aGlzLl9fc3RhdGUuYXx8XG4xfTtqLkNPTVBPTkVOVFM9XCJyLGcsYixoLHMsdixoZXgsYVwiLnNwbGl0KFwiLFwiKTtkLmV4dGVuZChqLnByb3RvdHlwZSx7dG9TdHJpbmc6ZnVuY3Rpb24oKXtyZXR1cm4gYyh0aGlzKX0sdG9PcmlnaW5hbDpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9fc3RhdGUuY29udmVyc2lvbi53cml0ZSh0aGlzKX19KTtmKGoucHJvdG90eXBlLFwiclwiLDIpO2Yoai5wcm90b3R5cGUsXCJnXCIsMSk7ZihqLnByb3RvdHlwZSxcImJcIiwwKTtiKGoucHJvdG90eXBlLFwiaFwiKTtiKGoucHJvdG90eXBlLFwic1wiKTtiKGoucHJvdG90eXBlLFwidlwiKTtPYmplY3QuZGVmaW5lUHJvcGVydHkoai5wcm90b3R5cGUsXCJhXCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9fc3RhdGUuYX0sc2V0OmZ1bmN0aW9uKGEpe3RoaXMuX19zdGF0ZS5hPWF9fSk7T2JqZWN0LmRlZmluZVByb3BlcnR5KGoucHJvdG90eXBlLFwiaGV4XCIse2dldDpmdW5jdGlvbigpe2lmKCF0aGlzLl9fc3RhdGUuc3BhY2UhPT1cIkhFWFwiKXRoaXMuX19zdGF0ZS5oZXg9XG5hLnJnYl90b19oZXgodGhpcy5yLHRoaXMuZyx0aGlzLmIpO3JldHVybiB0aGlzLl9fc3RhdGUuaGV4fSxzZXQ6ZnVuY3Rpb24oYSl7dGhpcy5fX3N0YXRlLnNwYWNlPVwiSEVYXCI7dGhpcy5fX3N0YXRlLmhleD1hfX0pO3JldHVybiBqfShkYXQuY29sb3IuaW50ZXJwcmV0LGRhdC5jb2xvci5tYXRoPWZ1bmN0aW9uKCl7dmFyIGU7cmV0dXJue2hzdl90b19yZ2I6ZnVuY3Rpb24oYSxjLGQpe3ZhciBlPWEvNjAtTWF0aC5mbG9vcihhLzYwKSxiPWQqKDEtYyksbj1kKigxLWUqYyksYz1kKigxLSgxLWUpKmMpLGE9W1tkLGMsYl0sW24sZCxiXSxbYixkLGNdLFtiLG4sZF0sW2MsYixkXSxbZCxiLG5dXVtNYXRoLmZsb29yKGEvNjApJTZdO3JldHVybntyOmFbMF0qMjU1LGc6YVsxXSoyNTUsYjphWzJdKjI1NX19LHJnYl90b19oc3Y6ZnVuY3Rpb24oYSxjLGQpe3ZhciBlPU1hdGgubWluKGEsYyxkKSxiPU1hdGgubWF4KGEsYyxkKSxlPWItZTtpZihiPT0wKXJldHVybntoOk5hTixzOjAsdjowfTtcbmE9YT09Yj8oYy1kKS9lOmM9PWI/MisoZC1hKS9lOjQrKGEtYykvZTthLz02O2E8MCYmKGErPTEpO3JldHVybntoOmEqMzYwLHM6ZS9iLHY6Yi8yNTV9fSxyZ2JfdG9faGV4OmZ1bmN0aW9uKGEsYyxkKXthPXRoaXMuaGV4X3dpdGhfY29tcG9uZW50KDAsMixhKTthPXRoaXMuaGV4X3dpdGhfY29tcG9uZW50KGEsMSxjKTtyZXR1cm4gYT10aGlzLmhleF93aXRoX2NvbXBvbmVudChhLDAsZCl9LGNvbXBvbmVudF9mcm9tX2hleDpmdW5jdGlvbihhLGMpe3JldHVybiBhPj5jKjgmMjU1fSxoZXhfd2l0aF9jb21wb25lbnQ6ZnVuY3Rpb24oYSxjLGQpe3JldHVybiBkPDwoZT1jKjgpfGEmfigyNTU8PGUpfX19KCksZGF0LmNvbG9yLnRvU3RyaW5nLGRhdC51dGlscy5jb21tb24pLGRhdC5jb2xvci5pbnRlcnByZXQsZGF0LnV0aWxzLmNvbW1vbiksZGF0LnV0aWxzLnJlcXVlc3RBbmltYXRpb25GcmFtZT1mdW5jdGlvbigpe3JldHVybiB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lfHxcbndpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fHdpbmRvdy5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lfHx3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fGZ1bmN0aW9uKGUpe3dpbmRvdy5zZXRUaW1lb3V0KGUsMUUzLzYwKX19KCksZGF0LmRvbS5DZW50ZXJlZERpdj1mdW5jdGlvbihlLGEpe3ZhciBjPWZ1bmN0aW9uKCl7dGhpcy5iYWNrZ3JvdW5kRWxlbWVudD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO2EuZXh0ZW5kKHRoaXMuYmFja2dyb3VuZEVsZW1lbnQuc3R5bGUse2JhY2tncm91bmRDb2xvcjpcInJnYmEoMCwwLDAsMC44KVwiLHRvcDowLGxlZnQ6MCxkaXNwbGF5Olwibm9uZVwiLHpJbmRleDpcIjEwMDBcIixvcGFjaXR5OjAsV2Via2l0VHJhbnNpdGlvbjpcIm9wYWNpdHkgMC4ycyBsaW5lYXJcIn0pO2UubWFrZUZ1bGxzY3JlZW4odGhpcy5iYWNrZ3JvdW5kRWxlbWVudCk7dGhpcy5iYWNrZ3JvdW5kRWxlbWVudC5zdHlsZS5wb3NpdGlvbj1cImZpeGVkXCI7dGhpcy5kb21FbGVtZW50PVxuZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTthLmV4dGVuZCh0aGlzLmRvbUVsZW1lbnQuc3R5bGUse3Bvc2l0aW9uOlwiZml4ZWRcIixkaXNwbGF5Olwibm9uZVwiLHpJbmRleDpcIjEwMDFcIixvcGFjaXR5OjAsV2Via2l0VHJhbnNpdGlvbjpcIi13ZWJraXQtdHJhbnNmb3JtIDAuMnMgZWFzZS1vdXQsIG9wYWNpdHkgMC4ycyBsaW5lYXJcIn0pO2RvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5iYWNrZ3JvdW5kRWxlbWVudCk7ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmRvbUVsZW1lbnQpO3ZhciBjPXRoaXM7ZS5iaW5kKHRoaXMuYmFja2dyb3VuZEVsZW1lbnQsXCJjbGlja1wiLGZ1bmN0aW9uKCl7Yy5oaWRlKCl9KX07Yy5wcm90b3R5cGUuc2hvdz1mdW5jdGlvbigpe3ZhciBjPXRoaXM7dGhpcy5iYWNrZ3JvdW5kRWxlbWVudC5zdHlsZS5kaXNwbGF5PVwiYmxvY2tcIjt0aGlzLmRvbUVsZW1lbnQuc3R5bGUuZGlzcGxheT1cImJsb2NrXCI7dGhpcy5kb21FbGVtZW50LnN0eWxlLm9wYWNpdHk9XG4wO3RoaXMuZG9tRWxlbWVudC5zdHlsZS53ZWJraXRUcmFuc2Zvcm09XCJzY2FsZSgxLjEpXCI7dGhpcy5sYXlvdXQoKTthLmRlZmVyKGZ1bmN0aW9uKCl7Yy5iYWNrZ3JvdW5kRWxlbWVudC5zdHlsZS5vcGFjaXR5PTE7Yy5kb21FbGVtZW50LnN0eWxlLm9wYWNpdHk9MTtjLmRvbUVsZW1lbnQuc3R5bGUud2Via2l0VHJhbnNmb3JtPVwic2NhbGUoMSlcIn0pfTtjLnByb3RvdHlwZS5oaWRlPWZ1bmN0aW9uKCl7dmFyIGE9dGhpcyxjPWZ1bmN0aW9uKCl7YS5kb21FbGVtZW50LnN0eWxlLmRpc3BsYXk9XCJub25lXCI7YS5iYWNrZ3JvdW5kRWxlbWVudC5zdHlsZS5kaXNwbGF5PVwibm9uZVwiO2UudW5iaW5kKGEuZG9tRWxlbWVudCxcIndlYmtpdFRyYW5zaXRpb25FbmRcIixjKTtlLnVuYmluZChhLmRvbUVsZW1lbnQsXCJ0cmFuc2l0aW9uZW5kXCIsYyk7ZS51bmJpbmQoYS5kb21FbGVtZW50LFwib1RyYW5zaXRpb25FbmRcIixjKX07ZS5iaW5kKHRoaXMuZG9tRWxlbWVudCxcIndlYmtpdFRyYW5zaXRpb25FbmRcIixcbmMpO2UuYmluZCh0aGlzLmRvbUVsZW1lbnQsXCJ0cmFuc2l0aW9uZW5kXCIsYyk7ZS5iaW5kKHRoaXMuZG9tRWxlbWVudCxcIm9UcmFuc2l0aW9uRW5kXCIsYyk7dGhpcy5iYWNrZ3JvdW5kRWxlbWVudC5zdHlsZS5vcGFjaXR5PTA7dGhpcy5kb21FbGVtZW50LnN0eWxlLm9wYWNpdHk9MDt0aGlzLmRvbUVsZW1lbnQuc3R5bGUud2Via2l0VHJhbnNmb3JtPVwic2NhbGUoMS4xKVwifTtjLnByb3RvdHlwZS5sYXlvdXQ9ZnVuY3Rpb24oKXt0aGlzLmRvbUVsZW1lbnQuc3R5bGUubGVmdD13aW5kb3cuaW5uZXJXaWR0aC8yLWUuZ2V0V2lkdGgodGhpcy5kb21FbGVtZW50KS8yK1wicHhcIjt0aGlzLmRvbUVsZW1lbnQuc3R5bGUudG9wPXdpbmRvdy5pbm5lckhlaWdodC8yLWUuZ2V0SGVpZ2h0KHRoaXMuZG9tRWxlbWVudCkvMitcInB4XCJ9O3JldHVybiBjfShkYXQuZG9tLmRvbSxkYXQudXRpbHMuY29tbW9uKSxkYXQuZG9tLmRvbSxkYXQudXRpbHMuY29tbW9uKTtcbjsgYnJvd3NlcmlmeV9zaGltX19kZWZpbmVfX21vZHVsZV9fZXhwb3J0X18odHlwZW9mIGRhdCAhPSBcInVuZGVmaW5lZFwiID8gZGF0IDogd2luZG93LmRhdCk7XG5cbn0pLmNhbGwoZ2xvYmFsLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGZ1bmN0aW9uIGRlZmluZUV4cG9ydChleCkgeyBtb2R1bGUuZXhwb3J0cyA9IGV4OyB9KTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG47X19icm93c2VyaWZ5X3NoaW1fcmVxdWlyZV9fPXJlcXVpcmU7KGZ1bmN0aW9uIGJyb3dzZXJpZnlTaGltKG1vZHVsZSwgZXhwb3J0cywgcmVxdWlyZSwgZGVmaW5lLCBicm93c2VyaWZ5X3NoaW1fX2RlZmluZV9fbW9kdWxlX19leHBvcnRfXykge1xuLy8gc3RhdHMuanMgLSBodHRwOi8vZ2l0aHViLmNvbS9tcmRvb2Ivc3RhdHMuanNcbnZhciBTdGF0cz1mdW5jdGlvbigpe3ZhciBsPURhdGUubm93KCksbT1sLGc9MCxuPUluZmluaXR5LG89MCxoPTAscD1JbmZpbml0eSxxPTAscj0wLHM9MCxmPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7Zi5pZD1cInN0YXRzXCI7Zi5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsZnVuY3Rpb24oYil7Yi5wcmV2ZW50RGVmYXVsdCgpO3QoKytzJTIpfSwhMSk7Zi5zdHlsZS5jc3NUZXh0PVwid2lkdGg6ODBweDtvcGFjaXR5OjAuOTtjdXJzb3I6cG9pbnRlclwiO3ZhciBhPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7YS5pZD1cImZwc1wiO2Euc3R5bGUuY3NzVGV4dD1cInBhZGRpbmc6MCAwIDNweCAzcHg7dGV4dC1hbGlnbjpsZWZ0O2JhY2tncm91bmQtY29sb3I6IzAwMlwiO2YuYXBwZW5kQ2hpbGQoYSk7dmFyIGk9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtpLmlkPVwiZnBzVGV4dFwiO2kuc3R5bGUuY3NzVGV4dD1cImNvbG9yOiMwZmY7Zm9udC1mYW1pbHk6SGVsdmV0aWNhLEFyaWFsLHNhbnMtc2VyaWY7Zm9udC1zaXplOjlweDtmb250LXdlaWdodDpib2xkO2xpbmUtaGVpZ2h0OjE1cHhcIjtcbmkuaW5uZXJIVE1MPVwiRlBTXCI7YS5hcHBlbmRDaGlsZChpKTt2YXIgYz1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO2MuaWQ9XCJmcHNHcmFwaFwiO2Muc3R5bGUuY3NzVGV4dD1cInBvc2l0aW9uOnJlbGF0aXZlO3dpZHRoOjc0cHg7aGVpZ2h0OjMwcHg7YmFja2dyb3VuZC1jb2xvcjojMGZmXCI7Zm9yKGEuYXBwZW5kQ2hpbGQoYyk7NzQ+Yy5jaGlsZHJlbi5sZW5ndGg7KXt2YXIgaj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtqLnN0eWxlLmNzc1RleHQ9XCJ3aWR0aDoxcHg7aGVpZ2h0OjMwcHg7ZmxvYXQ6bGVmdDtiYWNrZ3JvdW5kLWNvbG9yOiMxMTNcIjtjLmFwcGVuZENoaWxkKGopfXZhciBkPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7ZC5pZD1cIm1zXCI7ZC5zdHlsZS5jc3NUZXh0PVwicGFkZGluZzowIDAgM3B4IDNweDt0ZXh0LWFsaWduOmxlZnQ7YmFja2dyb3VuZC1jb2xvcjojMDIwO2Rpc3BsYXk6bm9uZVwiO2YuYXBwZW5kQ2hpbGQoZCk7dmFyIGs9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbmsuaWQ9XCJtc1RleHRcIjtrLnN0eWxlLmNzc1RleHQ9XCJjb2xvcjojMGYwO2ZvbnQtZmFtaWx5OkhlbHZldGljYSxBcmlhbCxzYW5zLXNlcmlmO2ZvbnQtc2l6ZTo5cHg7Zm9udC13ZWlnaHQ6Ym9sZDtsaW5lLWhlaWdodDoxNXB4XCI7ay5pbm5lckhUTUw9XCJNU1wiO2QuYXBwZW5kQ2hpbGQoayk7dmFyIGU9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtlLmlkPVwibXNHcmFwaFwiO2Uuc3R5bGUuY3NzVGV4dD1cInBvc2l0aW9uOnJlbGF0aXZlO3dpZHRoOjc0cHg7aGVpZ2h0OjMwcHg7YmFja2dyb3VuZC1jb2xvcjojMGYwXCI7Zm9yKGQuYXBwZW5kQ2hpbGQoZSk7NzQ+ZS5jaGlsZHJlbi5sZW5ndGg7KWo9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIiksai5zdHlsZS5jc3NUZXh0PVwid2lkdGg6MXB4O2hlaWdodDozMHB4O2Zsb2F0OmxlZnQ7YmFja2dyb3VuZC1jb2xvcjojMTMxXCIsZS5hcHBlbmRDaGlsZChqKTt2YXIgdD1mdW5jdGlvbihiKXtzPWI7c3dpdGNoKHMpe2Nhc2UgMDphLnN0eWxlLmRpc3BsYXk9XG5cImJsb2NrXCI7ZC5zdHlsZS5kaXNwbGF5PVwibm9uZVwiO2JyZWFrO2Nhc2UgMTphLnN0eWxlLmRpc3BsYXk9XCJub25lXCIsZC5zdHlsZS5kaXNwbGF5PVwiYmxvY2tcIn19O3JldHVybntSRVZJU0lPTjoxMSxkb21FbGVtZW50OmYsc2V0TW9kZTp0LGJlZ2luOmZ1bmN0aW9uKCl7bD1EYXRlLm5vdygpfSxlbmQ6ZnVuY3Rpb24oKXt2YXIgYj1EYXRlLm5vdygpO2c9Yi1sO249TWF0aC5taW4obixnKTtvPU1hdGgubWF4KG8sZyk7ay50ZXh0Q29udGVudD1nK1wiIE1TIChcIituK1wiLVwiK28rXCIpXCI7dmFyIGE9TWF0aC5taW4oMzAsMzAtMzAqKGcvMjAwKSk7ZS5hcHBlbmRDaGlsZChlLmZpcnN0Q2hpbGQpLnN0eWxlLmhlaWdodD1hK1wicHhcIjtyKys7Yj5tKzFFMyYmKGg9TWF0aC5yb3VuZCgxRTMqci8oYi1tKSkscD1NYXRoLm1pbihwLGgpLHE9TWF0aC5tYXgocSxoKSxpLnRleHRDb250ZW50PWgrXCIgRlBTIChcIitwK1wiLVwiK3ErXCIpXCIsYT1NYXRoLm1pbigzMCwzMC0zMCooaC8xMDApKSxjLmFwcGVuZENoaWxkKGMuZmlyc3RDaGlsZCkuc3R5bGUuaGVpZ2h0PVxuYStcInB4XCIsbT1iLHI9MCk7cmV0dXJuIGJ9LHVwZGF0ZTpmdW5jdGlvbigpe2w9dGhpcy5lbmQoKX19fTtcblxuOyBicm93c2VyaWZ5X3NoaW1fX2RlZmluZV9fbW9kdWxlX19leHBvcnRfXyh0eXBlb2YgU3RhdHMgIT0gXCJ1bmRlZmluZWRcIiA/IFN0YXRzIDogd2luZG93LlN0YXRzKTtcblxufSkuY2FsbChnbG9iYWwsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgZnVuY3Rpb24gZGVmaW5lRXhwb3J0KGV4KSB7IG1vZHVsZS5leHBvcnRzID0gZXg7IH0pO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbnZhciBUSFJFRSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlRIUkVFIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5USFJFRSA6IG51bGwpO1xuXG4vKipcbiAqIEBtb2R1bGUgIG1vZGVsL0Nvb3JkaW5hdGVzXG4gKi9cblxuLyoqXG4gKiBDb29yZGluYXRlcyBoZWxwZXIsIGl0IGNyZWF0ZXMgdGhlIGF4ZXMsIGdyb3VuZCBhbmQgZ3JpZHNcbiAqIHNob3duIGluIHRoZSB3b3JsZFxuICogQGNsYXNzXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnXG4gKiBAcGFyYW0ge09iamVjdH0gdGhlbWVcbiAqL1xuZnVuY3Rpb24gQ29vcmRpbmF0ZXMoY29uZmlnLCB0aGVtZSkge1xuICBjb25maWcgPSBjb25maWcgfHwge307XG5cbiAgLyoqXG4gICAqIEdyb3VwIHdoZXJlIGFsbCB0aGUgb2JqZWN0cyAoYXhlcywgZ3JvdW5kLCBncmlkcykgYXJlIHB1dFxuICAgKiBAdHlwZSB7VEhSRUUuT2JqZWN0M0R9XG4gICAqL1xuICB0aGlzLm1lc2ggPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcblxuICAvKipcbiAgICogQXhlcyBvYmplY3QsIHRoZSBtZXNoIHJlcHJlc2VudGluZyB0aGUgYXhlcyBpcyB1bmRlciB0aGlzIG9iamVjdCBcbiAgICogdW5kZXIgYG1lc2hgXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICB0aGlzLmF4ZXMgPSB7XG4gICAgbmFtZTogJ0F4ZXMnLFxuICAgIG1lc2g6IHRoaXMuZHJhd0FsbEF4ZXMoe2F4aXNMZW5ndGg6MTAwLGF4aXNSYWRpdXM6MSxheGlzVGVzczo1MH0pLFxuICAgIHZpc2libGU6IGNvbmZpZy5heGVzICE9PSB1bmRlZmluZWQgPyBjb25maWcuYXhlcyA6IHRydWVcbiAgfSxcblxuICAvKipcbiAgICogR3JvdW5kIG9iamVjdCwgdGhlIG1lc2ggcmVwcmVzZW50aW5nIHRoZSBheGVzIGlzIHVuZGVyIHRoaXMgb2JqZWN0XG4gICAqIHVuZGVyIGBtZXNoYFxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgdGhpcy5ncm91bmQgPSB7XG4gICAgbmFtZTogJ0dyb3VuZCcsXG4gICAgbWVzaDogdGhpcy5kcmF3R3JvdW5kKHtzaXplOjEwMDAwMCwgY29sb3I6IHRoZW1lLmdyb3VuZENvbG9yfSksXG4gICAgdmlzaWJsZTogY29uZmlnLmdyb3VuZCAhPT0gdW5kZWZpbmVkID8gY29uZmlnLmdyb3VuZCA6IHRydWVcbiAgfTtcbiAgXG4gIC8qKlxuICAgKiBHcmlkWFogb2JqZWN0LCB0aGUgbWVzaCByZXByZXNlbnRpbmcgdGhlIGF4ZXMgaXMgdW5kZXIgdGhpcyBvYmplY3RcbiAgICogdW5kZXIgYG1lc2hgXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICB0aGlzLmdyaWRYID0ge1xuICAgIG5hbWU6ICdYWiBncmlkJyxcbiAgICBtZXNoOiB0aGlzLmRyYXdHcmlkKHtzaXplOjEwMDAwLHNjYWxlOjAuMDF9KSxcbiAgICB2aXNpYmxlOiBjb25maWcuZ3JpZFggIT09IHVuZGVmaW5lZCA/IGNvbmZpZy5ncmlkWCA6IHRydWVcbiAgfTtcblxuICAvKipcbiAgICogR3JpZFlaIG9iamVjdCwgdGhlIG1lc2ggcmVwcmVzZW50aW5nIHRoZSBheGVzIGlzIHVuZGVyIHRoaXMgb2JqZWN0XG4gICAqIHVuZGVyIGBtZXNoYFxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi8gIFxuICB0aGlzLmdyaWRZID0ge1xuICAgIG5hbWU6ICdZWiBncmlkJyxcbiAgICBtZXNoOiB0aGlzLmRyYXdHcmlkKHtzaXplOjEwMDAwLHNjYWxlOjAuMDEsIG9yaWVudGF0aW9uOlwieVwifSksXG4gICAgdmlzaWJsZTogY29uZmlnLmdyaWRZICE9PSB1bmRlZmluZWQgPyBjb25maWcuZ3JpZFkgOiBmYWxzZVxuICB9O1xuICBcbiAgLyoqXG4gICAqIEdyaWRYWSBvYmplY3QsIHRoZSBtZXNoIHJlcHJlc2VudGluZyB0aGUgYXhlcyBpcyB1bmRlciB0aGlzIG9iamVjdFxuICAgKiB1bmRlciBgbWVzaGBcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIHRoaXMuZ3JpZFogPSB7XG4gICAgbmFtZTogJ1hZIGdyaWQnLFxuICAgIG1lc2g6IHRoaXMuZHJhd0dyaWQoe3NpemU6MTAwMDAsc2NhbGU6MC4wMSwgb3JpZW50YXRpb246XCJ6XCJ9KSxcbiAgICB2aXNpYmxlOiBjb25maWcuZ3JpZFogIT09IHVuZGVmaW5lZCA/IGNvbmZpZy5ncmlkWiA6IGZhbHNlXG4gIH07XG5cbiAgQ29vcmRpbmF0ZXMucHJvdG90eXBlLmluaXQuY2FsbCh0aGlzLCBjb25maWcpO1xufTtcblxuLyoqXG4gKiBBZGRzIHRoZSBheGVzLCBncm91bmQsIGdyaWQgbWVzaGVzIHRvIGB0aGlzLm1lc2hgXG4gKiBAcGFyYW0gIHtvYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cbkNvb3JkaW5hdGVzLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgdmFyIG1lID0gdGhpcztcbiAgZm9yICh2YXIga2V5IGluIG1lKSB7XG4gICAgaWYgKG1lLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIHZhciB2ID0gbWVba2V5XTtcbiAgICAgIGlmICh2Lm1lc2gpIHtcbiAgICAgICAgbWUubWVzaC5hZGQodi5tZXNoKTtcbiAgICAgICAgdi5tZXNoLnZpc2libGUgPSB2LnZpc2libGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG1lO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgZGF0Lmd1aSBmb2xkZXIgd2hpY2ggaGFzIGNvbnRyb2xzIGZvciB0aGUgXG4gKiBncm91bmQsIGF4ZXMgYW5kIGdyaWRzXG4gKiBAcGFyYW0gIHtkYXQuZ3VpfSBndWlcbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cbkNvb3JkaW5hdGVzLnByb3RvdHlwZS5pbml0RGF0R3VpID0gZnVuY3Rpb24gKGd1aSkge1xuICB2YXIgbWUgPSB0aGlzLFxuICAgIGZvbGRlcjtcblxuICBmb2xkZXIgPSBndWkuYWRkRm9sZGVyKCdTY2VuZSBoZWxwZXJzJyk7XG4gIGZvciAodmFyIGtleSBpbiBtZSkge1xuICAgIGlmIChtZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICB2YXIgdiA9IG1lW2tleV07XG4gICAgICBpZiAodi5oYXNPd25Qcm9wZXJ0eSgnbWVzaCcpKSB7XG4gICAgICAgIGZvbGRlci5hZGQodiwgJ3Zpc2libGUnKVxuICAgICAgICAgIC5uYW1lKHYubmFtZSlcbiAgICAgICAgICAub25GaW5pc2hDaGFuZ2UoZnVuY3Rpb24gKG5ld1ZhbHVlKSB7XG4gICAgICAgICAgICB2Lm1lc2gudmlzaWJsZSA9IG5ld1ZhbHVlO1xuICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gbWU7XG59O1xuXG4vKipcbiAqIERyYXdzIGEgZ3JpZFxuICogQHBhcmFtICB7b2JqZWN0fSBwYXJhbXNcbiAqIEBwYXJhbSAge29iamVjdH0gcGFyYW1zLnNpemU9MTAwXG4gKiBAcGFyYW0gIHtvYmplY3R9IHBhcmFtcy5zY2FsZT0wLjFcbiAqIEBwYXJhbSAge29iamVjdH0gcGFyYW1zLmNvbG9yPSM1MDUwNTBcbiAqIEBwYXJhbSAge29iamVjdH0gcGFyYW1zLm9yaWVudGF0aW9uPTAuMVxuICogQHJldHVybiB7VEhSRUUuTWVzaH1cbiAqL1xuQ29vcmRpbmF0ZXMucHJvdG90eXBlLmRyYXdHcmlkID0gZnVuY3Rpb24gKHBhcmFtcykge1xuICBwYXJhbXMgPSBwYXJhbXMgfHwge307XG4gIHZhciBzaXplID0gcGFyYW1zLnNpemUgIT09IHVuZGVmaW5lZCA/IHBhcmFtcy5zaXplOjEwMDtcbiAgdmFyIHNjYWxlID0gcGFyYW1zLnNjYWxlICE9PSB1bmRlZmluZWQgPyBwYXJhbXMuc2NhbGU6MC4xO1xuICB2YXIgY29sb3IgPSBwYXJhbXMuY29sb3IgIT09IHVuZGVmaW5lZCA/IHBhcmFtcy5jb2xvcjonIzUwNTA1MCc7XG4gIHZhciBvcmllbnRhdGlvbiA9IHBhcmFtcy5vcmllbnRhdGlvbiAhPT0gdW5kZWZpbmVkID8gcGFyYW1zLm9yaWVudGF0aW9uOlwieFwiO1xuICB2YXIgZ3JpZCA9IG5ldyBUSFJFRS5NZXNoKFxuICAgIG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHNpemUsIHNpemUsIHNpemUgKiBzY2FsZSwgc2l6ZSAqIHNjYWxlKSxcbiAgICBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe1xuICAgICAgY29sb3I6IGNvbG9yLFxuICAgICAgd2lyZWZyYW1lOiB0cnVlXG4gICAgfSlcbiAgKTtcbiAgaWYgKG9yaWVudGF0aW9uID09PSBcInhcIikge1xuICAgIGdyaWQucm90YXRpb24ueCA9IC0gTWF0aC5QSSAvIDI7XG4gIH0gZWxzZSBpZiAob3JpZW50YXRpb24gPT09IFwieVwiKSB7XG4gICAgZ3JpZC5yb3RhdGlvbi55ID0gLSBNYXRoLlBJIC8gMjtcbiAgfSBlbHNlIGlmIChvcmllbnRhdGlvbiA9PT0gXCJ6XCIpIHtcbiAgICBncmlkLnJvdGF0aW9uLnogPSAtIE1hdGguUEkgLyAyO1xuICB9XG4gIHJldHVybiBncmlkO1xufTtcblxuLyoqXG4gKiBEcmF3cyB0aGUgZ3JvdW5kXG4gKiBAcGFyYW0gIHtvYmplY3R9IHBhcmFtc1xuICogQHBhcmFtICB7b2JqZWN0fSBwYXJhbXMuc2l6ZT0xMDBcbiAqIEBwYXJhbSAge29iamVjdH0gcGFyYW1zLnNjYWxlPTB4MDAwMDAwXG4gKiBAcGFyYW0gIHtvYmplY3R9IHBhcmFtcy5vZmZzZXQ9LTAuMlxuICogQHJldHVybiB7VEhSRUUuTWVzaH1cbiAqL1xuQ29vcmRpbmF0ZXMucHJvdG90eXBlLmRyYXdHcm91bmQgPSBmdW5jdGlvbiAocGFyYW1zKSB7XG4gIHBhcmFtcyA9IHBhcmFtcyB8fCB7fTtcbiAgdmFyIHNpemUgPSBwYXJhbXMuc2l6ZSAhPT0gdW5kZWZpbmVkID8gcGFyYW1zLnNpemU6MTAwO1xuICB2YXIgY29sb3IgPSBwYXJhbXMuY29sb3IgIT09IHVuZGVmaW5lZCA/IHBhcmFtcy5jb2xvcjoweDAwMDAwMDtcbiAgdmFyIG9mZnNldCA9IHBhcmFtcy5vZmZzZXQgIT09IHVuZGVmaW5lZCA/IHBhcmFtcy5vZmZzZXQ6LTAuMjtcblxuICB2YXIgZ3JvdW5kID0gbmV3IFRIUkVFLk1lc2goXG4gICAgbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoc2l6ZSwgc2l6ZSksXG4gICAgbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHtcbiAgICAgIGNvbG9yOiBjb2xvclxuICAgIH0pXG4gICk7XG4gIGdyb3VuZC5yb3RhdGlvbi54ID0gLSBNYXRoLlBJIC8gMjtcbiAgZ3JvdW5kLnBvc2l0aW9uLnkgPSBvZmZzZXQ7XG4gIHJldHVybiBncm91bmQ7XG59O1xuXG4vKipcbiAqIERyYXdzIGFuIGF4aXNcbiAqIEBwYXJhbSAge29iamVjdH0gcGFyYW1zXG4gKiBAcGFyYW0gIHtvYmplY3R9IHBhcmFtcy5heGlzUmFkaXVzPTAuMDRcbiAqIEBwYXJhbSAge29iamVjdH0gcGFyYW1zLmF4aXNMZW5ndGg9MTFcbiAqIEBwYXJhbSAge29iamVjdH0gcGFyYW1zLmF4aXNUZXNzPTQ2XG4gKiBAcGFyYW0gIHtvYmplY3R9IHBhcmFtcy5heGlzT3JpZW50YXRpb249eFxuICogQHJldHVybiB7VEhSRUUuTWVzaH1cbiAqL1xuQ29vcmRpbmF0ZXMucHJvdG90eXBlLmRyYXdBeGVzID0gZnVuY3Rpb24gKHBhcmFtcykge1xuICAvLyB4ID0gcmVkLCB5ID0gZ3JlZW4sIHogPSBibHVlICAoUkdCID0geHl6KVxuICBwYXJhbXMgPSBwYXJhbXMgfHwge307XG4gIHZhciBheGlzUmFkaXVzID0gcGFyYW1zLmF4aXNSYWRpdXMgIT09IHVuZGVmaW5lZCA/IHBhcmFtcy5heGlzUmFkaXVzOjAuMDQ7XG4gIHZhciBheGlzTGVuZ3RoID0gcGFyYW1zLmF4aXNMZW5ndGggIT09IHVuZGVmaW5lZCA/IHBhcmFtcy5heGlzTGVuZ3RoOjExO1xuICB2YXIgYXhpc1Rlc3MgPSBwYXJhbXMuYXhpc1Rlc3MgIT09IHVuZGVmaW5lZCA/IHBhcmFtcy5heGlzVGVzczo0ODtcbiAgdmFyIGF4aXNPcmllbnRhdGlvbiA9IHBhcmFtcy5heGlzT3JpZW50YXRpb24gIT09IHVuZGVmaW5lZCA/IHBhcmFtcy5heGlzT3JpZW50YXRpb246XCJ4XCI7XG5cbiAgdmFyIHdyYXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcbiAgdmFyIGF4aXNNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKHsgY29sb3I6IDB4MDAwMDAwLCBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlIH0pO1xuICB2YXIgYXhpcyA9IG5ldyBUSFJFRS5NZXNoKFxuICAgIG5ldyBUSFJFRS5DeWxpbmRlckdlb21ldHJ5KGF4aXNSYWRpdXMsIGF4aXNSYWRpdXMsIGF4aXNMZW5ndGgsIGF4aXNUZXNzLCAxLCB0cnVlKSwgXG4gICAgYXhpc01hdGVyaWFsXG4gICk7XG4gIGlmIChheGlzT3JpZW50YXRpb24gPT09IFwieFwiKSB7XG4gICAgYXhpcy5yb3RhdGlvbi56ID0gLSBNYXRoLlBJIC8gMjtcbiAgICBheGlzLnBvc2l0aW9uLnggPSBheGlzTGVuZ3RoLzItMTtcbiAgfSBlbHNlIGlmIChheGlzT3JpZW50YXRpb24gPT09IFwieVwiKSB7XG4gICAgYXhpcy5wb3NpdGlvbi55ID0gYXhpc0xlbmd0aC8yLTE7XG4gIH1cbiAgXG4gIHdyYXAuYWRkKCBheGlzICk7XG4gIFxuICB2YXIgYXJyb3cgPSBuZXcgVEhSRUUuTWVzaChcbiAgICBuZXcgVEhSRUUuQ3lsaW5kZXJHZW9tZXRyeSgwLCA0KmF4aXNSYWRpdXMsIDgqYXhpc1JhZGl1cywgYXhpc1Rlc3MsIDEsIHRydWUpLCBcbiAgICBheGlzTWF0ZXJpYWxcbiAgKTtcbiAgaWYgKGF4aXNPcmllbnRhdGlvbiA9PT0gXCJ4XCIpIHtcbiAgICBhcnJvdy5yb3RhdGlvbi56ID0gLSBNYXRoLlBJIC8gMjtcbiAgICBhcnJvdy5wb3NpdGlvbi54ID0gYXhpc0xlbmd0aCAtIDEgKyBheGlzUmFkaXVzKjQvMjtcbiAgfSBlbHNlIGlmIChheGlzT3JpZW50YXRpb24gPT09IFwieVwiKSB7XG4gICAgYXJyb3cucG9zaXRpb24ueSA9IGF4aXNMZW5ndGggLSAxICsgYXhpc1JhZGl1cyo0LzI7XG4gIH1cblxuICB3cmFwLmFkZCggYXJyb3cgKTtcbiAgcmV0dXJuIHdyYXA7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gT2JqZWN0M0Qgd2hpY2ggY29udGFpbnMgYWxsIGF4ZXNcbiAqIEBwYXJhbSAge09iamVjdH0gcGFyYW1zXG4gKiBAcGFyYW0gIHtvYmplY3R9IHBhcmFtcy5heGlzUmFkaXVzPTAuMDQgIGN5bGluZGVyIHJhZGl1c1xuICogQHBhcmFtICB7b2JqZWN0fSBwYXJhbXMuYXhpc0xlbmd0aD0xMSAgICBjeWxpbmRlciBsZW5ndGhcbiAqIEBwYXJhbSAge29iamVjdH0gcGFyYW1zLmF4aXNUZXNzPTQ2ICAgICAgY3lsaW5kZXIgdGVzc2VsYXRpb25cbiAqIEByZXR1cm4ge1RIUkVFLk9iamVjdDNEfVxuICovXG5Db29yZGluYXRlcy5wcm90b3R5cGUuZHJhd0FsbEF4ZXMgPSBmdW5jdGlvbiAocGFyYW1zKSB7XG4gIHBhcmFtcyA9IHBhcmFtcyB8fCB7fTtcbiAgdmFyIGF4aXNSYWRpdXMgPSBwYXJhbXMuYXhpc1JhZGl1cyAhPT0gdW5kZWZpbmVkID8gcGFyYW1zLmF4aXNSYWRpdXM6MC4wNDtcbiAgdmFyIGF4aXNMZW5ndGggPSBwYXJhbXMuYXhpc0xlbmd0aCAhPT0gdW5kZWZpbmVkID8gcGFyYW1zLmF4aXNMZW5ndGg6MTE7XG4gIHZhciBheGlzVGVzcyA9IHBhcmFtcy5heGlzVGVzcyAhPT0gdW5kZWZpbmVkID8gcGFyYW1zLmF4aXNUZXNzOjQ4O1xuXG4gIHZhciB3cmFwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XG5cbiAgdmFyIGF4aXNYTWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCh7IGNvbG9yOiAweEZGMDAwMCB9KTtcbiAgdmFyIGF4aXNZTWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCh7IGNvbG9yOiAweDAwRkYwMCB9KTtcbiAgdmFyIGF4aXNaTWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCh7IGNvbG9yOiAweDAwMDBGRiB9KTtcbiAgYXhpc1hNYXRlcmlhbC5zaWRlID0gVEhSRUUuRG91YmxlU2lkZTtcbiAgYXhpc1lNYXRlcmlhbC5zaWRlID0gVEhSRUUuRG91YmxlU2lkZTtcbiAgYXhpc1pNYXRlcmlhbC5zaWRlID0gVEhSRUUuRG91YmxlU2lkZTtcbiAgdmFyIGF4aXNYID0gbmV3IFRIUkVFLk1lc2goXG4gICAgbmV3IFRIUkVFLkN5bGluZGVyR2VvbWV0cnkoYXhpc1JhZGl1cywgYXhpc1JhZGl1cywgYXhpc0xlbmd0aCwgYXhpc1Rlc3MsIDEsIHRydWUpLCBcbiAgICBheGlzWE1hdGVyaWFsXG4gICk7XG4gIHZhciBheGlzWSA9IG5ldyBUSFJFRS5NZXNoKFxuICAgIG5ldyBUSFJFRS5DeWxpbmRlckdlb21ldHJ5KGF4aXNSYWRpdXMsIGF4aXNSYWRpdXMsIGF4aXNMZW5ndGgsIGF4aXNUZXNzLCAxLCB0cnVlKSwgXG4gICAgYXhpc1lNYXRlcmlhbFxuICApO1xuICB2YXIgYXhpc1ogPSBuZXcgVEhSRUUuTWVzaChcbiAgICBuZXcgVEhSRUUuQ3lsaW5kZXJHZW9tZXRyeShheGlzUmFkaXVzLCBheGlzUmFkaXVzLCBheGlzTGVuZ3RoLCBheGlzVGVzcywgMSwgdHJ1ZSksIFxuICAgIGF4aXNaTWF0ZXJpYWxcbiAgKTtcbiAgYXhpc1gucm90YXRpb24ueiA9IC0gTWF0aC5QSSAvIDI7XG4gIGF4aXNYLnBvc2l0aW9uLnggPSBheGlzTGVuZ3RoLzItMTtcblxuICBheGlzWS5wb3NpdGlvbi55ID0gYXhpc0xlbmd0aC8yLTE7XG4gIFxuICBheGlzWi5yb3RhdGlvbi55ID0gLSBNYXRoLlBJIC8gMjtcbiAgYXhpc1oucm90YXRpb24ueiA9IC0gTWF0aC5QSSAvIDI7XG4gIGF4aXNaLnBvc2l0aW9uLnogPSBheGlzTGVuZ3RoLzItMTtcblxuICB3cmFwLmFkZCggYXhpc1ggKTtcbiAgd3JhcC5hZGQoIGF4aXNZICk7XG4gIHdyYXAuYWRkKCBheGlzWiApO1xuXG4gIHZhciBhcnJvd1ggPSBuZXcgVEhSRUUuTWVzaChcbiAgICBuZXcgVEhSRUUuQ3lsaW5kZXJHZW9tZXRyeSgwLCA0KmF4aXNSYWRpdXMsIDQqYXhpc1JhZGl1cywgYXhpc1Rlc3MsIDEsIHRydWUpLCBcbiAgICBheGlzWE1hdGVyaWFsXG4gICk7XG4gIHZhciBhcnJvd1kgPSBuZXcgVEhSRUUuTWVzaChcbiAgICBuZXcgVEhSRUUuQ3lsaW5kZXJHZW9tZXRyeSgwLCA0KmF4aXNSYWRpdXMsIDQqYXhpc1JhZGl1cywgYXhpc1Rlc3MsIDEsIHRydWUpLCBcbiAgICBheGlzWU1hdGVyaWFsXG4gICk7XG4gIHZhciBhcnJvd1ogPSBuZXcgVEhSRUUuTWVzaChcbiAgICBuZXcgVEhSRUUuQ3lsaW5kZXJHZW9tZXRyeSgwLCA0KmF4aXNSYWRpdXMsIDQqYXhpc1JhZGl1cywgYXhpc1Rlc3MsIDEsIHRydWUpLCBcbiAgICBheGlzWk1hdGVyaWFsXG4gICk7XG4gIGFycm93WC5yb3RhdGlvbi56ID0gLSBNYXRoLlBJIC8gMjtcbiAgYXJyb3dYLnBvc2l0aW9uLnggPSBheGlzTGVuZ3RoIC0gMSArIGF4aXNSYWRpdXMqNC8yO1xuXG4gIGFycm93WS5wb3NpdGlvbi55ID0gYXhpc0xlbmd0aCAtIDEgKyBheGlzUmFkaXVzKjQvMjtcblxuICBhcnJvd1oucm90YXRpb24ueiA9IC0gTWF0aC5QSSAvIDI7XG4gIGFycm93Wi5yb3RhdGlvbi55ID0gLSBNYXRoLlBJIC8gMjtcbiAgYXJyb3daLnBvc2l0aW9uLnogPSBheGlzTGVuZ3RoIC0gMSArIGF4aXNSYWRpdXMqNC8yO1xuXG4gIHdyYXAuYWRkKCBhcnJvd1ggKTtcbiAgd3JhcC5hZGQoIGFycm93WSApO1xuICB3cmFwLmFkZCggYXJyb3daICk7XG4gIHJldHVybiB3cmFwO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb29yZGluYXRlcztcbn0pLmNhbGwodGhpcyx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiLyoqXG4gKiBAbW9kdWxlICB0aGVtZXMvZGFya1xuICovXG5cbi8qKlxuICogRGFyayB0aGVtZVxuICogQHR5cGUge09iamVjdH1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGNsZWFyQ29sb3I6IDB4NTk1OTU5LFxuXHRmb2dDb2xvcjogMHg1OTU5NTksXG4gIGdyb3VuZENvbG9yOiAweDM5MzkzOVxufTsiLCIvKipcbiAqIEBtb2R1bGUgdGhlbWVzL2xpZ2h0XG4gKi9cblxuLyoqXG4gKiBMaWdodCB0aGVtZVxuICogQG5hbWUgTGlnaHRUaGVtZVxuICogQHR5cGUge09iamVjdH1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGNsZWFyQ29sb3I6IDB4ZjJmY2ZmLFxuICBmb2dDb2xvcjogMHhmMmZjZmYsXG5cdGdyb3VuZENvbG9yOiAweGVlZWVlZVxufTsiXX0=
(7)
});
