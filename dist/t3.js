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
  options = objectMerge({
    init: function () {},
    update: function () {},
  }, options);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tYXVyaWNpby9Eb2N1bWVudHMvd2ViL21hdXJpenp6aW8ubWUvVDMvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9tYXVyaWNpby9Eb2N1bWVudHMvd2ViL21hdXJpenp6aW8ubWUvVDMvbm9kZV9tb2R1bGVzL29iamVjdC1tZXJnZS9ub2RlX21vZHVsZXMvY2xvbmUtZnVuY3Rpb24vc3JjL2Nsb25lLWZ1bmN0aW9uLmpzIiwiL1VzZXJzL21hdXJpY2lvL0RvY3VtZW50cy93ZWIvbWF1cml6enppby5tZS9UMy9ub2RlX21vZHVsZXMvb2JqZWN0LW1lcmdlL25vZGVfbW9kdWxlcy9vYmplY3QtZm9yZWFjaC9zcmMvb2JqZWN0LWZvcmVhY2guanMiLCIvVXNlcnMvbWF1cmljaW8vRG9jdW1lbnRzL3dlYi9tYXVyaXp6emlvLm1lL1QzL25vZGVfbW9kdWxlcy9vYmplY3QtbWVyZ2Uvc3JjL29iamVjdC1tZXJnZS5qcyIsIi9Vc2Vycy9tYXVyaWNpby9Eb2N1bWVudHMvd2ViL21hdXJpenp6aW8ubWUvVDMvc3JjL2NvbnRyb2xsZXIvQXBwbGljYXRpb24uanMiLCIvVXNlcnMvbWF1cmljaW8vRG9jdW1lbnRzL3dlYi9tYXVyaXp6emlvLm1lL1QzL3NyYy9jb250cm9sbGVyL0tleWJvYXJkLmpzIiwiL1VzZXJzL21hdXJpY2lvL0RvY3VtZW50cy93ZWIvbWF1cml6enppby5tZS9UMy9zcmMvY29udHJvbGxlci9Mb29wTWFuYWdlci5qcyIsIi9Vc2Vycy9tYXVyaWNpby9Eb2N1bWVudHMvd2ViL21hdXJpenp6aW8ubWUvVDMvc3JjL2luZGV4LmpzIiwiL1VzZXJzL21hdXJpY2lvL0RvY3VtZW50cy93ZWIvbWF1cml6enppby5tZS9UMy9zcmMvbGliL09yYml0Q29udHJvbHMuanMiLCIvVXNlcnMvbWF1cmljaW8vRG9jdW1lbnRzL3dlYi9tYXVyaXp6emlvLm1lL1QzL3NyYy9saWIvVEhSRUV4L0Z1bGxTY3JlZW4uanMiLCIvVXNlcnMvbWF1cmljaW8vRG9jdW1lbnRzL3dlYi9tYXVyaXp6emlvLm1lL1QzL3NyYy9saWIvVEhSRUV4L1dpbmRvd1Jlc2l6ZS5qcyIsIi9Vc2Vycy9tYXVyaWNpby9Eb2N1bWVudHMvd2ViL21hdXJpenp6aW8ubWUvVDMvc3JjL2xpYi9USFJFRXgvaW5kZXguanMiLCIvVXNlcnMvbWF1cmljaW8vRG9jdW1lbnRzL3dlYi9tYXVyaXp6emlvLm1lL1QzL3NyYy9saWIvZGF0Lmd1aS5taW4uanMiLCIvVXNlcnMvbWF1cmljaW8vRG9jdW1lbnRzL3dlYi9tYXVyaXp6emlvLm1lL1QzL3NyYy9saWIvc3RhdHMubWluLmpzIiwiL1VzZXJzL21hdXJpY2lvL0RvY3VtZW50cy93ZWIvbWF1cml6enppby5tZS9UMy9zcmMvbW9kZWwvQ29vcmRpbmF0ZXMuanMiLCIvVXNlcnMvbWF1cmljaW8vRG9jdW1lbnRzL3dlYi9tYXVyaXp6emlvLm1lL1QzL3NyYy90aGVtZXMvZGFyay5qcyIsIi9Vc2Vycy9tYXVyaWNpby9Eb2N1bWVudHMvd2ViL21hdXJpenp6aW8ubWUvVDMvc3JjL3RoZW1lcy9saWdodC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0b0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdm9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qXHJcbkxpY2Vuc2UgZ3BsLTMuMCBodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvZ3BsLTMuMC1zdGFuZGFsb25lLmh0bWxcclxuKi9cclxuLypqc2xpbnRcclxuICAgIGV2aWw6IHRydWUsXHJcbiAgICBub2RlOiB0cnVlXHJcbiovXHJcbid1c2Ugc3RyaWN0JztcclxuLyoqXHJcbiAqIENsb25lcyBub24gbmF0aXZlIEphdmFTY3JpcHQgZnVuY3Rpb25zLCBvciByZWZlcmVuY2VzIG5hdGl2ZSBmdW5jdGlvbnMuXHJcbiAqIEBhdXRob3IgPGEgaHJlZj1cIm1haWx0bzptYXR0aGV3a2FzdG9yQGdtYWlsLmNvbVwiPk1hdHRoZXcgS2FzdG9yPC9hPlxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBjbG9uZS5cclxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIGEgY2xvbmUgb2YgdGhlIG5vbiBuYXRpdmUgZnVuY3Rpb24sIG9yIGFcclxuICogIHJlZmVyZW5jZSB0byB0aGUgbmF0aXZlIGZ1bmN0aW9uLlxyXG4gKi9cclxuZnVuY3Rpb24gY2xvbmVGdW5jdGlvbihmdW5jKSB7XHJcbiAgICB2YXIgb3V0LCBzdHI7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHN0ciA9IGZ1bmMudG9TdHJpbmcoKTtcclxuICAgICAgICBpZiAoL1xcW25hdGl2ZSBjb2RlXFxdLy50ZXN0KHN0cikpIHtcclxuICAgICAgICAgICAgb3V0ID0gZnVuYztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBvdXQgPSBldmFsKCcoZnVuY3Rpb24oKXtyZXR1cm4gJyArIHN0ciArICd9KCkpOycpO1xyXG4gICAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZS5tZXNzYWdlICsgJ1xcclxcblxcclxcbicgKyBzdHIpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG91dDtcclxufVxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsb25lRnVuY3Rpb247IiwiLyoqXHJcbiAqIEV4ZWN1dGVzIGEgZnVuY3Rpb24gb24gZWFjaCBvZiBhbiBvYmplY3RzIG93biBlbnVtZXJhYmxlIHByb3BlcnRpZXMuIFRoZVxyXG4gKiAgY2FsbGJhY2sgZnVuY3Rpb24gd2lsbCByZWNlaXZlIHRocmVlIGFyZ3VtZW50czogdGhlIHZhbHVlIG9mIHRoZSBjdXJyZW50XHJcbiAqICBwcm9wZXJ0eSwgdGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5LCBhbmQgdGhlIG9iamVjdCBiZWluZyBwcm9jZXNzZWQuIFRoaXMgaXNcclxuICogIHJvdWdobHkgZXF1aXZhbGVudCB0byB0aGUgc2lnbmF0dXJlIGZvciBjYWxsYmFja3MgdG9cclxuICogIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLlxyXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3QgdG8gYWN0IG9uLlxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdG8gZXhlY3V0ZS5cclxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgZ2l2ZW4gb2JqZWN0LlxyXG4gKi9cclxuZnVuY3Rpb24gb2JqZWN0Rm9yZWFjaChvYmosIGNhbGxiYWNrKSB7XHJcbiAgICBcInVzZSBzdHJpY3RcIjtcclxuICAgIE9iamVjdC5rZXlzKG9iaikuZm9yRWFjaChmdW5jdGlvbiAocHJvcCkge1xyXG4gICAgICAgIGNhbGxiYWNrKG9ialtwcm9wXSwgcHJvcCwgb2JqKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG9iajtcclxufTtcclxubW9kdWxlLmV4cG9ydHMgPSBvYmplY3RGb3JlYWNoOyIsIi8qXHJcbkxpY2Vuc2UgZ3BsLTMuMCBodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvZ3BsLTMuMC1zdGFuZGFsb25lLmh0bWxcclxuKi9cclxuLypqc2xpbnRcclxuICAgIHdoaXRlOiB0cnVlLFxyXG4gICAgdmFyczogdHJ1ZSxcclxuICAgIG5vZGU6IHRydWVcclxuKi9cclxuZnVuY3Rpb24gT2JqZWN0TWVyZ2VPcHRpb25zKG9wdHMpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIG9wdHMgPSBvcHRzIHx8IHt9O1xyXG4gICAgdGhpcy5kZXB0aCA9IG9wdHMuZGVwdGggfHwgZmFsc2U7XHJcbiAgICAvLyBjaXJjdWxhciByZWYgY2hlY2sgaXMgdHJ1ZSB1bmxlc3MgZXhwbGljaXRseSBzZXQgdG8gZmFsc2VcclxuICAgIC8vIGlnbm9yZSB0aGUganNsaW50IHdhcm5pbmcgaGVyZSwgaXQncyBwb2ludGxlc3MuXHJcbiAgICB0aGlzLnRocm93T25DaXJjdWxhclJlZiA9ICd0aHJvd09uQ2lyY3VsYXJSZWYnIGluIG9wdHMgJiYgb3B0cy50aHJvd09uQ2lyY3VsYXJSZWYgPT09IGZhbHNlID8gZmFsc2UgOiB0cnVlO1xyXG59XHJcbi8qanNsaW50IHVucGFyYW06dHJ1ZSovXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3IG9wdGlvbnMgb2JqZWN0IHN1aXRhYmxlIGZvciB1c2Ugd2l0aCBvYmplY3RNZXJnZS5cclxuICogQG1lbWJlck9mIG9iamVjdE1lcmdlXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0c10gQW4gb2JqZWN0IHNwZWNpZnlpbmcgdGhlIG9wdGlvbnMuXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0cy5kZXB0aCA9IGZhbHNlXSBTcGVjaWZpZXMgdGhlIGRlcHRoIHRvIHRyYXZlcnNlIG9iamVjdHNcclxuICogIGR1cmluZyBtZXJnaW5nLiBJZiB0aGlzIGlzIHNldCB0byBmYWxzZSB0aGVuIHRoZXJlIHdpbGwgYmUgbm8gZGVwdGggbGltaXQuXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0cy50aHJvd09uQ2lyY3VsYXJSZWYgPSB0cnVlXSBTZXQgdG8gZmFsc2UgdG8gc3VwcHJlc3NcclxuICogIGVycm9ycyBvbiBjaXJjdWxhciByZWZlcmVuY2VzLlxyXG4gKiBAcmV0dXJucyB7T2JqZWN0TWVyZ2VPcHRpb25zfSBSZXR1cm5zIGFuIGluc3RhbmNlIG9mIE9iamVjdE1lcmdlT3B0aW9uc1xyXG4gKiAgdG8gYmUgdXNlZCB3aXRoIG9iamVjdE1lcmdlLlxyXG4gKiBAZXhhbXBsZVxyXG4gKiAgdmFyIG9wdHMgPSBvYmplY3RNZXJnZS5jcmVhdGVPcHRpb25zKHtcclxuICogICAgICBkZXB0aCA6IDIsXHJcbiAqICAgICAgdGhyb3dPbkNpcmN1bGFyUmVmIDogZmFsc2VcclxuICogIH0pO1xyXG4gKiAgdmFyIG9iajEgPSB7XHJcbiAqICAgICAgYTEgOiB7XHJcbiAqICAgICAgICAgIGEyIDoge1xyXG4gKiAgICAgICAgICAgICAgYTMgOiB7fVxyXG4gKiAgICAgICAgICB9XHJcbiAqICAgICAgfVxyXG4gKiAgfTtcclxuICogIHZhciBvYmoyID0ge1xyXG4gKiAgICAgIGExIDoge1xyXG4gKiAgICAgICAgICBhMiA6IHtcclxuICogICAgICAgICAgICAgIGEzIDogJ3dpbGwgbm90IGJlIGluIG91dHB1dCdcclxuICogICAgICAgICAgfSxcclxuICogICAgICAgICAgYTIyIDoge31cclxuICogICAgICB9XHJcbiAqICB9O1xyXG4gKiAgb2JqZWN0TWVyZ2Uob3B0cywgb2JqMSwgb2JqMik7XHJcbiAqL1xyXG5mdW5jdGlvbiBjcmVhdGVPcHRpb25zKG9wdHMpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIHZhciBhcmd6ID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcclxuICAgIGFyZ3oudW5zaGlmdChudWxsKTtcclxuICAgIHZhciBGID0gT2JqZWN0TWVyZ2VPcHRpb25zLmJpbmQuYXBwbHkoT2JqZWN0TWVyZ2VPcHRpb25zLCBhcmd6KTtcclxuICAgIHJldHVybiBuZXcgRigpO1xyXG59XHJcbi8qanNsaW50IHVucGFyYW06ZmFsc2UqL1xyXG4vKipcclxuICogTWVyZ2VzIEphdmFTY3JpcHQgb2JqZWN0cyByZWN1cnNpdmVseSB3aXRob3V0IGFsdGVyaW5nIHRoZSBvYmplY3RzIG1lcmdlZC5cclxuICogQG5hbWVzcGFjZSBNZXJnZXMgSmF2YVNjcmlwdCBvYmplY3RzIHJlY3Vyc2l2ZWx5IHdpdGhvdXQgYWx0ZXJpbmcgdGhlIG9iamVjdHMgbWVyZ2VkLlxyXG4gKiBAYXV0aG9yIDxhIGhyZWY9XCJtYWlsdG86bWF0dGhld2thc3RvckBnbWFpbC5jb21cIj5NYXR0aGV3IEthc3RvcjwvYT5cclxuICogQHBhcmFtIHtPYmplY3RNZXJnZU9wdGlvbnN9IFtvcHRzXSBBbiBvcHRpb25zIG9iamVjdCBjcmVhdGVkIGJ5IFxyXG4gKiAgb2JqZWN0TWVyZ2UuY3JlYXRlT3B0aW9ucy4gT3B0aW9ucyBtdXN0IGJlIHNwZWNpZmllZCBhcyB0aGUgZmlyc3QgYXJndW1lbnRcclxuICogIGFuZCBtdXN0IGJlIGFuIG9iamVjdCBjcmVhdGVkIHdpdGggY3JlYXRlT3B0aW9ucyBvciBlbHNlIHRoZSBvYmplY3Qgd2lsbFxyXG4gKiAgbm90IGJlIHJlY29nbml6ZWQgYXMgYW4gb3B0aW9ucyBvYmplY3QgYW5kIHdpbGwgYmUgbWVyZ2VkIGluc3RlYWQuXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBzaGFkb3dzIFtbc2hhZG93c10uLi5dIE9uZSBvciBtb3JlIG9iamVjdHMgdG8gbWVyZ2UuIEVhY2hcclxuICogIGFyZ3VtZW50IGdpdmVuIHdpbGwgYmUgdHJlYXRlZCBhcyBhbiBvYmplY3QgdG8gbWVyZ2UuIEVhY2ggb2JqZWN0XHJcbiAqICBvdmVyd3JpdGVzIHRoZSBwcmV2aW91cyBvYmplY3RzIGRlc2NlbmRhbnQgcHJvcGVydGllcyBpZiB0aGUgcHJvcGVydHkgbmFtZVxyXG4gKiAgbWF0Y2hlcy4gSWYgb2JqZWN0cyBwcm9wZXJ0aWVzIGFyZSBvYmplY3RzIHRoZXkgd2lsbCBiZSBtZXJnZWQgcmVjdXJzaXZlbHlcclxuICogIGFzIHdlbGwuXHJcbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYSBzaW5nbGUgbWVyZ2VkIG9iamVjdCBjb21wb3NlZCBmcm9tIGNsb25lcyBvZiB0aGVcclxuICogIGlucHV0IG9iamVjdHMuXHJcbiAqIEBleGFtcGxlXHJcbiAqICB2YXIgb2JqZWN0TWVyZ2UgPSByZXF1aXJlKCdvYmplY3QtbWVyZ2UnKTtcclxuICogIHZhciB4ID0ge1xyXG4gKiAgICAgIGEgOiAnYScsXHJcbiAqICAgICAgYiA6ICdiJyxcclxuICogICAgICBjIDoge1xyXG4gKiAgICAgICAgICBkIDogJ2QnLFxyXG4gKiAgICAgICAgICBlIDogJ2UnLFxyXG4gKiAgICAgICAgICBmIDoge1xyXG4gKiAgICAgICAgICAgICAgZyA6ICdnJ1xyXG4gKiAgICAgICAgICB9XHJcbiAqICAgICAgfVxyXG4gKiAgfTtcclxuICogIHZhciB5ID0ge1xyXG4gKiAgICAgIGEgOiAnYGEnLFxyXG4gKiAgICAgIGIgOiAnYGInLFxyXG4gKiAgICAgIGMgOiB7XHJcbiAqICAgICAgICAgIGQgOiAnYGQnXHJcbiAqICAgICAgfVxyXG4gKiAgfTtcclxuICogIHZhciB6ID0ge1xyXG4gKiAgICAgIGEgOiB7XHJcbiAqICAgICAgICAgIGIgOiAnYGBiJ1xyXG4gKiAgICAgIH0sXHJcbiAqICAgICAgZnVuIDogZnVuY3Rpb24gZm9vICgpIHtcclxuICogICAgICAgICAgcmV0dXJuICdmb28nO1xyXG4gKiAgICAgIH0sXHJcbiAqICAgICAgYXBzIDogQXJyYXkucHJvdG90eXBlLnNsaWNlXHJcbiAqICB9O1xyXG4gKiAgdmFyIG91dCA9IG9iamVjdE1lcmdlKHgsIHksIHopO1xyXG4gKiAgLy8gb3V0LmEgd2lsbCBiZSB7XHJcbiAqICAvLyAgICAgICAgIGIgOiAnYGBiJ1xyXG4gKiAgLy8gICAgIH1cclxuICogIC8vIG91dC5iIHdpbGwgYmUgJ2BiJ1xyXG4gKiAgLy8gb3V0LmMgd2lsbCBiZSB7XHJcbiAqICAvLyAgICAgICAgIGQgOiAnYGQnLFxyXG4gKiAgLy8gICAgICAgICBlIDogJ2UnLFxyXG4gKiAgLy8gICAgICAgICBmIDoge1xyXG4gKiAgLy8gICAgICAgICAgICAgZyA6ICdnJ1xyXG4gKiAgLy8gICAgICAgICB9XHJcbiAqICAvLyAgICAgfVxyXG4gKiAgLy8gb3V0LmZ1biB3aWxsIGJlIGEgY2xvbmUgb2Ygei5mdW5cclxuICogIC8vIG91dC5hcHMgd2lsbCBiZSBlcXVhbCB0byB6LmFwc1xyXG4gKi9cclxuZnVuY3Rpb24gb2JqZWN0TWVyZ2Uoc2hhZG93cykge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgdmFyIG9iamVjdEZvcmVhY2ggPSByZXF1aXJlKCdvYmplY3QtZm9yZWFjaCcpO1xyXG4gICAgdmFyIGNsb25lRnVuY3Rpb24gPSByZXF1aXJlKCdjbG9uZS1mdW5jdGlvbicpO1xyXG4gICAgLy8gdGhpcyBpcyB0aGUgcXVldWUgb2YgdmlzaXRlZCBvYmplY3RzIC8gcHJvcGVydGllcy5cclxuICAgIHZhciB2aXNpdGVkID0gW107XHJcbiAgICAvLyB2YXJpb3VzIG1lcmdlIG9wdGlvbnNcclxuICAgIHZhciBvcHRpb25zID0ge307XHJcbiAgICAvLyBnZXRzIHRoZSBzZXF1ZW50aWFsIHRyYWlsaW5nIG9iamVjdHMgZnJvbSBhcnJheS5cclxuICAgIGZ1bmN0aW9uIGdldFNoYWRvd09iamVjdHMoc2hhZG93cykge1xyXG4gICAgICAgIHZhciBvdXQgPSBzaGFkb3dzLnJlZHVjZShmdW5jdGlvbiAoY29sbGVjdG9yLCBzaGFkb3cpIHtcclxuICAgICAgICAgICAgICAgIGlmIChzaGFkb3cgaW5zdGFuY2VvZiBPYmplY3QpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb2xsZWN0b3IucHVzaChzaGFkb3cpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb2xsZWN0b3IgPSBbXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBjb2xsZWN0b3I7XHJcbiAgICAgICAgICAgIH0sIFtdKTtcclxuICAgICAgICByZXR1cm4gb3V0O1xyXG4gICAgfVxyXG4gICAgLy8gZ2V0cyBlaXRoZXIgYSBuZXcgb2JqZWN0IG9mIHRoZSBwcm9wZXIgdHlwZSBvciB0aGUgbGFzdCBwcmltaXRpdmUgdmFsdWVcclxuICAgIGZ1bmN0aW9uIGdldE91dHB1dE9iamVjdChzaGFkb3dzKSB7XHJcbiAgICAgICAgdmFyIG91dDtcclxuICAgICAgICB2YXIgbGFzdFNoYWRvdyA9IHNoYWRvd3Nbc2hhZG93cy5sZW5ndGggLSAxXTtcclxuICAgICAgICBpZiAobGFzdFNoYWRvdyBpbnN0YW5jZW9mIEFycmF5KSB7XHJcbiAgICAgICAgICAgIG91dCA9IFtdO1xyXG4gICAgICAgIH0gZWxzZSBpZiAobGFzdFNoYWRvdyBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBvdXQgPSBjbG9uZUZ1bmN0aW9uKGxhc3RTaGFkb3cpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZS5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAobGFzdFNoYWRvdyBpbnN0YW5jZW9mIE9iamVjdCkge1xyXG4gICAgICAgICAgICBvdXQgPSB7fTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBsYXN0U2hhZG93IGlzIGEgcHJpbWl0aXZlIHZhbHVlO1xyXG4gICAgICAgICAgICBvdXQgPSBsYXN0U2hhZG93O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb3V0O1xyXG4gICAgfVxyXG4gICAgLy8gY2hlY2tzIGZvciBjaXJjdWxhciByZWZlcmVuY2VzXHJcbiAgICBmdW5jdGlvbiBjaXJjdWxhclJlZmVyZW5jZUNoZWNrKHNoYWRvd3MpIHtcclxuICAgICAgICAvLyBpZiBhbnkgb2YgdGhlIGN1cnJlbnQgb2JqZWN0cyB0byBwcm9jZXNzIGV4aXN0IGluIHRoZSBxdWV1ZVxyXG4gICAgICAgIC8vIHRoZW4gdGhyb3cgYW4gZXJyb3IuXHJcbiAgICAgICAgc2hhZG93cy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICAgIGlmIChpdGVtIGluc3RhbmNlb2YgT2JqZWN0ICYmIHZpc2l0ZWQuaW5kZXhPZihpdGVtKSA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NpcmN1bGFyIHJlZmVyZW5jZSBlcnJvcicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gaWYgbm9uZSBvZiB0aGUgY3VycmVudCBvYmplY3RzIHdlcmUgaW4gdGhlIHF1ZXVlXHJcbiAgICAgICAgLy8gdGhlbiBhZGQgcmVmZXJlbmNlcyB0byB0aGUgcXVldWUuXHJcbiAgICAgICAgdmlzaXRlZCA9IHZpc2l0ZWQuY29uY2F0KHNoYWRvd3MpO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gb2JqZWN0TWVyZ2VSZWN1cnNvcihzaGFkb3dzLCBjdXJyZW50RGVwdGgpIHtcclxuICAgICAgICBpZiAob3B0aW9ucy5kZXB0aCAhPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgY3VycmVudERlcHRoID0gY3VycmVudERlcHRoID8gY3VycmVudERlcHRoICsgMSA6IDE7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY3VycmVudERlcHRoID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9wdGlvbnMudGhyb3dPbkNpcmN1bGFyUmVmID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIGNpcmN1bGFyUmVmZXJlbmNlQ2hlY2soc2hhZG93cyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBvdXQgPSBnZXRPdXRwdXRPYmplY3Qoc2hhZG93cyk7XHJcbiAgICAgICAgLypqc2xpbnQgdW5wYXJhbTogdHJ1ZSAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIHNoYWRvd0hhbmRsZXIodmFsLCBwcm9wLCBzaGFkb3cpIHtcclxuICAgICAgICAgICAgaWYgKG91dFtwcm9wXSkge1xyXG4gICAgICAgICAgICAgICAgb3V0W3Byb3BdID0gb2JqZWN0TWVyZ2VSZWN1cnNvcihbXHJcbiAgICAgICAgICAgICAgICAgICAgb3V0W3Byb3BdLFxyXG4gICAgICAgICAgICAgICAgICAgIHNoYWRvd1twcm9wXVxyXG4gICAgICAgICAgICAgICAgXSwgY3VycmVudERlcHRoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG91dFtwcm9wXSA9IG9iamVjdE1lcmdlUmVjdXJzb3IoW3NoYWRvd1twcm9wXV0sIGN1cnJlbnREZXB0aCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLypqc2xpbnQgdW5wYXJhbTpmYWxzZSAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIHNoYWRvd01lcmdlcihzaGFkb3cpIHtcclxuICAgICAgICAgICAgb2JqZWN0Rm9yZWFjaChzaGFkb3csIHNoYWRvd0hhbmRsZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBzaG9ydCBjaXJjdWl0cyBjYXNlIHdoZXJlIG91dHB1dCB3b3VsZCBiZSBhIHByaW1pdGl2ZSB2YWx1ZVxyXG4gICAgICAgIC8vIGFueXdheS5cclxuICAgICAgICBpZiAob3V0IGluc3RhbmNlb2YgT2JqZWN0ICYmIGN1cnJlbnREZXB0aCA8PSBvcHRpb25zLmRlcHRoKSB7XHJcbiAgICAgICAgICAgIC8vIG9ubHkgbWVyZ2VzIHRyYWlsaW5nIG9iamVjdHMgc2luY2UgcHJpbWl0aXZlcyB3b3VsZCB3aXBlIG91dFxyXG4gICAgICAgICAgICAvLyBwcmV2aW91cyBvYmplY3RzLCBhcyBpbiBtZXJnaW5nIHthOidhJ30sICdhJywgYW5kIHtiOidiJ31cclxuICAgICAgICAgICAgLy8gd291bGQgcmVzdWx0IGluIHtiOidiJ30gc28gdGhlIGZpcnN0IHR3byBhcmd1bWVudHNcclxuICAgICAgICAgICAgLy8gY2FuIGJlIGlnbm9yZWQgY29tcGxldGVseS5cclxuICAgICAgICAgICAgdmFyIHJlbGV2YW50U2hhZG93cyA9IGdldFNoYWRvd09iamVjdHMoc2hhZG93cyk7XHJcbiAgICAgICAgICAgIHJlbGV2YW50U2hhZG93cy5mb3JFYWNoKHNoYWRvd01lcmdlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvdXQ7XHJcbiAgICB9XHJcbiAgICAvLyBkZXRlcm1pbmVzIHdoZXRoZXIgYW4gb3B0aW9ucyBvYmplY3Qgd2FzIHBhc3NlZCBpbiBhbmRcclxuICAgIC8vIHVzZXMgaXQgaWYgcHJlc2VudFxyXG4gICAgLy8gaWdub3JlIHRoZSBqc2xpbnQgd2FybmluZyBoZXJlIHRvby5cclxuICAgIGlmIChhcmd1bWVudHNbMF0gaW5zdGFuY2VvZiBPYmplY3RNZXJnZU9wdGlvbnMpIHtcclxuICAgICAgICBvcHRpb25zID0gYXJndW1lbnRzWzBdO1xyXG4gICAgICAgIHNoYWRvd3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBvcHRpb25zID0gY3JlYXRlT3B0aW9ucygpO1xyXG4gICAgICAgIHNoYWRvd3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG9iamVjdE1lcmdlUmVjdXJzb3Ioc2hhZG93cyk7XHJcbn1cclxub2JqZWN0TWVyZ2UuY3JlYXRlT3B0aW9ucyA9IGNyZWF0ZU9wdGlvbnM7XHJcbm1vZHVsZS5leHBvcnRzID0gb2JqZWN0TWVyZ2U7IiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgb2JqZWN0TWVyZ2UgPSByZXF1aXJlKCdvYmplY3QtbWVyZ2UnKTtcbnZhciBhc3NlcnQgPSBmdW5jdGlvbiAoY29uZGl0aW9uLCBtZXNzYWdlKSB7XG4gIGlmICghY29uZGl0aW9uKSB7XG4gICAgdGhyb3cgbWVzc2FnZSB8fCAnYXNzZXJ0aW9uIGZhaWxlZCc7XG4gIH1cbn07XG5cbnZhciBDb29yZGluYXRlcyA9IHJlcXVpcmUoJy4uL21vZGVsL0Nvb3JkaW5hdGVzJyk7XG52YXIgS2V5Ym9hcmQgPSByZXF1aXJlKCcuL0tleWJvYXJkJyk7XG52YXIgTG9vcE1hbmFnZXIgPSByZXF1aXJlKCcuL0xvb3BNYW5hZ2VyJyk7XG52YXIgU3RhdHMgPSByZXF1aXJlKCdUMy5TdGF0cycpO1xudmFyIGRhdCA9IHJlcXVpcmUoJ1QzLmRhdCcpO1xudmFyIFRIUkVFID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuVEhSRUUgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlRIUkVFIDogbnVsbCk7XG52YXIgVEhSRUV4ID0gcmVxdWlyZSgnLi4vbGliL1RIUkVFeC8nKTtcbi8qKlxuICogQG1vZHVsZSBjb250cm9sbGVyL0FwcGxpY2F0aW9uXG4gKi9cblxuLyoqXG4gKiBFYWNoIGluc3RhbmNlIGNvbnRyb2xzIG9uZSBlbGVtZW50IG9mIHRoZSBET00sIGJlc2lkZXMgY3JlYXRpbmdcbiAqIHRoZSBjYW52YXMgZm9yIHRoZSB0aHJlZS5qcyBhcHAgaXQgY3JlYXRlcyBhIGRhdC5ndWkgaW5zdGFuY2VcbiAqICh0byBjb250cm9sIG9iamVjdHMgb2YgdGhlIGFwcCB3aXRoIGEgZ3VpKSBhbmQgYSBTdGF0cyBpbnN0YW5jZVxuICogKHRvIHZpZXcgdGhlIGN1cnJlbnQgZnJhbWVyYXRlKVxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgZm9sbG93aW5nOlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb25maWcuaWQ9bnVsbF0gVGhlIGlkIG9mIHRoZSBET00gZWxlbWVudCB0byBpbmplY3QgdGhlIGVsZW1lbnRzIHRvXG4gKiBAcGFyYW0ge251bWJlcn0gW2NvbmZpZy53aWR0aD13aW5kb3cuaW5uZXJXaWR0aF1cbiAqIFRoZSB3aWR0aCBvZiB0aGUgY2FudmFzXG4gKiBAcGFyYW0ge251bWJlcn0gW2NvbmZpZy5oZWlnaHQ9d2luZG93LmlubmVySGVpZ2h0XVxuICogVGhlIGhlaWdodCBvZiB0aGUgY2FudmFzXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtjb25maWcucmVuZGVySW1tZWRpYXRlbHk9dHJ1ZV1cbiAqIEZhbHNlIHRvIGRpc2FibGUgdGhlIGdhbWUgbG9vcCB3aGVuIHRoZSBhcHBsaWNhdGlvbiBzdGFydHMsIGlmXG4gKiB5b3Ugd2FudCB0byByZXN1bWUgdGhlIGxvb3AgY2FsbCBgYXBwbGljYXRpb24ubG9vcE1hbmFnZXIuc3RhcnQoKWBcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NvbmZpZy5pbmplY3RDYWNoZT1mYWxzZV1cbiAqIFRydWUgdG8gYWRkIGEgd3JhcHBlciBvdmVyIGBUSFJFRS5PYmplY3QzRC5wcm90b3R5cGUuYWRkYCBhbmRcbiAqIGBUSFJFRS5PYmplY3QzRC5wcm90b3R5cGUucmVtb3ZlYCBzbyB0aGF0IGl0IGNhdGNoZXMgdGhlIGxhc3QgZWxlbWVudFxuICogYW5kIHBlcmZvcm0gYWRkaXRpb25hbCBvcGVyYXRpb25zIG92ZXIgaXQsIHdpdGggdGhpcyBtZWNoYW5pc21cbiAqIHdlIGFsbG93IHRoZSBhcHBsaWNhdGlvbiB0byBoYXZlIGFuIGludGVybmFsIGNhY2hlIG9mIHRoZSBlbGVtZW50cyBvZlxuICogdGhlIGFwcGxpY2F0aW9uXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtjb25maWcuZnVsbFNjcmVlbj1mYWxzZV1cbiAqIFRydWUgdG8gbWFrZSB0aGlzIGFwcCBmdWxsc2NyZWVuIGFkZGluZyBhZGRpdGlvbmFsIHN1cHBvcnQgZm9yXG4gKiB3aW5kb3cgcmVzaXplIGV2ZW50c1xuICogQHBhcmFtIHtzdHJpbmd9IFtjb25maWcudGhlbWU9J2RhcmsnXVxuICogVGhlbWUgdXNlZCBpbiB0aGUgZGVmYXVsdCBzY2VuZSwgaXQgY2FuIGJlIGBsaWdodGAgb3IgYGRhcmtgXG4gKiBAcGFyYW0ge29iamVjdH0gW2NvbmZpZy5hbWJpZW50Q29uZmlnPXt9XVxuICogQWRkaXRpb25hbCBjb25maWd1cmF0aW9uIGZvciB0aGUgYW1iaWVudCwgc2VlIHRoZSBjbGFzcyB7QGxpbmtcbiAqIENvb3JkaW5hdGVzfVxuICogQHBhcmFtIHtvYmplY3R9IFtjb25maWcuZGVmYXVsdFNjZW5lQ29uZmlnPXt9XSBBZGRpdGlvbmFsIGNvbmZpZ1xuICogZm9yIHRoZSBkZWZhdWx0IHNjZW5lIGNyZWF0ZWQgZm9yIHRoaXMgd29ybGRcbiAqL1xuZnVuY3Rpb24gQXBwbGljYXRpb24oY29uZmlnKSB7XG4gIGNvbmZpZyA9IG9iamVjdE1lcmdlKHtcbiAgICBzZWxlY3RvcjogbnVsbCxcbiAgICB3aWR0aDogd2luZG93LmlubmVyV2lkdGgsXG4gICAgaGVpZ2h0OiB3aW5kb3cuaW5uZXJIZWlnaHQsXG4gICAgcmVuZGVySW1tZWRpYXRlbHk6IHRydWUsXG4gICAgaW5qZWN0Q2FjaGU6IGZhbHNlLFxuICAgIGZ1bGxTY3JlZW46IGZhbHNlLFxuICAgIHRoZW1lOiAnZGFyaycsXG4gICAgYW1iaWVudENvbmZpZzoge30sXG4gICAgZGVmYXVsdFNjZW5lQ29uZmlnOiB7XG4gICAgICBmb2c6IHRydWVcbiAgICB9XG4gIH0sIGNvbmZpZyk7XG5cbiAgdGhpcy5pbml0aWFsQ29uZmlnID0gY29uZmlnO1xuXG4gIC8qKlxuICAgKiBTY2VuZXMgaW4gdGhpcyB3b3JsZCwgZWFjaCBzY2VuZSBzaG91bGQgYmUgbWFwcGVkIHdpdGhcbiAgICogYSB1bmlxdWUgaWRcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIHRoaXMuc2NlbmVzID0ge307XG5cbiAgLyoqXG4gICAqIFRoZSBhY3RpdmUgc2NlbmUgb2YgdGhpcyB3b3JsZFxuICAgKiBAdHlwZSB7VEhSRUUuU2NlbmV9XG4gICAqL1xuICB0aGlzLmFjdGl2ZVNjZW5lID0gbnVsbDtcblxuICAvKipcbiAgICogUmVmZXJlbmNlIHRvIHRoZSBjYW1lcmFzIHVzZWQgaW4gdGhpcyB3b3JsZFxuICAgKiBAdHlwZSB7QXJyYXl9XG4gICAqL1xuICB0aGlzLmNhbWVyYXMgPSB7fTtcblxuICAvKipcbiAgICogVGhlIHdvcmxkIGNhbiBoYXZlIG1hbnkgY2FtZXJhcywgc28gdGhlIHRoaXMgaXMgYSByZWZlcmVuY2UgdG9cbiAgICogdGhlIGFjdGl2ZSBjYW1lcmEgdGhhdCdzIGJlaW5nIHVzZWQgcmlnaHQgbm93XG4gICAqIEB0eXBlIHtUMy5tb2RlbC5DYW1lcmF9XG4gICAqL1xuICB0aGlzLmFjdGl2ZUNhbWVyYSA9IG51bGw7XG5cbiAgLyoqXG4gICAqIFRIUkVFIFJlbmRlcmVyXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICB0aGlzLnJlbmRlcmVyID0gbnVsbDtcblxuICAvKipcbiAgICogS2V5Ym9hcmQgbWFuYWdlclxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgdGhpcy5rZXlib2FyZCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIERhdCBndWkgbWFuYWdlclxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgdGhpcy5kYXRndWkgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBSZWZlcmVuY2UgdG8gdGhlIFN0YXRzIGluc3RhbmNlIChuZWVkZWQgdG8gY2FsbCB1cGRhdGVcbiAgICogb24gdGhlIG1ldGhvZCB7QGxpbmsgbW9kdWxlOmNvbnRyb2xsZXIvQXBwbGljYXRpb24jdXBkYXRlfSlcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIHRoaXMuc3RhdHMgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBSZWZlcmVuY2UgdG8gdGhlIGxvY2FsIGxvb3AgbWFuYWdlclxuICAgKiBAdHlwZSB7TG9vcE1hbmFnZXJ9XG4gICAqL1xuICB0aGlzLmxvb3BNYW5hZ2VyID0gbnVsbDtcblxuICAvKipcbiAgICogQ29sb3JzIGZvciB0aGUgZGVmYXVsdCBzY2VuZVxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgdGhpcy50aGVtZSA9IG51bGw7XG5cbiAgLyoqXG4gICAqIEFwcGxpY2F0aW9uIGNhY2hlXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICB0aGlzLl9fdDNjYWNoZV9fID0ge307XG5cbiAgQXBwbGljYXRpb24ucHJvdG90eXBlLmluaXRBcHBsaWNhdGlvbi5jYWxsKHRoaXMpO1xufVxuXG4vKipcbiAqIEdldHRlciBmb3IgdGhlIGluaXRpYWwgY29uZmlnXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5nZXRDb25maWcgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmluaXRpYWxDb25maWc7XG59O1xuXG4vKipcbiAqIEJvb3RzdHJhcCB0aGUgYXBwbGljYXRpb24gd2l0aCB0aGUgZm9sbG93aW5nIHN0ZXBzOlxuICpcbiAqIC0gRW5hYmxpbmcgY2FjaGUgaW5qZWN0aW9uXG4gKiAtIFNldCB0aGUgdGhlbWVcbiAqIC0gQ3JlYXRlIHRoZSByZW5kZXJlciwgZGVmYXVsdCBzY2VuZSwgZGVmYXVsdCBjYW1lcmEsIHNvbWUgcmFuZG9tIGxpZ2h0c1xuICogLSBJbml0aWFsaXplcyBkYXQuZ3VpLCBTdGF0cywgYSBtYXNrIHdoZW4gdGhlIGFwcGxpY2F0aW9uIGlzIHBhaXNlZFxuICogLSBJbml0aWFsaXplcyBmdWxsU2NyZWVuIGV2ZW50cywga2V5Ym9hcmQgYW5kIHNvbWUgaGVscGVyIG9iamVjdHNcbiAqIC0gQ2FsbHMgdGhlIGdhbWUgbG9vcFxuICpcbiAqL1xuQXBwbGljYXRpb24ucHJvdG90eXBlLmluaXRBcHBsaWNhdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG1lID0gdGhpcyxcbiAgICBjb25maWcgPSBtZS5nZXRDb25maWcoKTtcblxuICBtZS5pbmplY3RDYWNoZShjb25maWcuaW5qZWN0Q2FjaGUpO1xuXG4gIC8vIHRoZW1lXG4gIG1lLnNldFRoZW1lKGNvbmZpZy50aGVtZSk7XG5cbiAgLy8gZGVmYXVsdHNcbiAgbWUuY3JlYXRlRGVmYXVsdFJlbmRlcmVyKCk7XG4gIG1lLmNyZWF0ZURlZmF1bHRTY2VuZSgpO1xuICBtZS5jcmVhdGVEZWZhdWx0Q2FtZXJhKCk7XG4gIG1lLmNyZWF0ZURlZmF1bHRMaWdodHMoKTtcblxuICAvLyB1dGlsc1xuICBtZS5pbml0RGF0R3VpKCk7XG4gIG1lLmluaXRTdGF0cygpO1xuICBtZS5pbml0TWFzaygpXG4gICAgLm1hc2tWaXNpYmxlKCFjb25maWcucmVuZGVySW1tZWRpYXRlbHkpO1xuICBtZS5pbml0RnVsbFNjcmVlbigpO1xuICBtZS5pbml0S2V5Ym9hcmQoKTtcbiAgbWUuaW5pdENvb3JkaW5hdGVzKCk7XG5cbiAgLy8gZ2FtZSBsb29wXG4gIG1lLmdhbWVMb29wKCk7XG59O1xuXG4vKipcbiAqIFNldHMgdGhlIGFjdGl2ZSBzY2VuZSAoaXQgbXVzdCBiZSBhIHJlZ2lzdGVyZWQgc2NlbmUgcmVnaXN0ZXJlZFxuICogd2l0aCB7QGxpbmsgI2FkZFNjZW5lfSlcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIHN0cmluZyB3aGljaCB3YXMgdXNlZCB0byByZWdpc3RlciB0aGUgc2NlbmVcbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5zZXRBY3RpdmVTY2VuZSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgdGhpcy5hY3RpdmVTY2VuZSA9IHRoaXMuc2NlbmVzW2tleV07XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGRzIGEgc2NlbmUgdG8gdGhlIHNjZW5lIHBvb2xcbiAqIEBwYXJhbSB7VEhSRUUuU2NlbmV9IHNjZW5lXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5BcHBsaWNhdGlvbi5wcm90b3R5cGUuYWRkU2NlbmUgPSBmdW5jdGlvbiAoc2NlbmUsIGtleSkge1xuICBjb25zb2xlLmFzc2VydChzY2VuZSBpbnN0YW5jZW9mIFRIUkVFLlNjZW5lKTtcbiAgdGhpcy5zY2VuZXNba2V5XSA9IHNjZW5lO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIHNjZW5lIGNhbGxlZCAnZGVmYXVsdCcgYW5kIHNldHMgaXQgYXMgdGhlIGFjdGl2ZSBvbmVcbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5jcmVhdGVEZWZhdWx0U2NlbmUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBtZSA9IHRoaXMsXG4gICAgY29uZmlnID0gbWUuZ2V0Q29uZmlnKCksXG4gICAgZGVmYXVsdFNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG4gIGlmIChjb25maWcuZGVmYXVsdFNjZW5lQ29uZmlnLmZvZykge1xuICAgIGRlZmF1bHRTY2VuZS5mb2cgPSBuZXcgVEhSRUUuRm9nKG1lLnRoZW1lLmZvZ0NvbG9yLCAyMDAwLCA0MDAwKTtcbiAgfVxuICBtZVxuICAgIC5hZGRTY2VuZShkZWZhdWx0U2NlbmUsICdkZWZhdWx0JylcbiAgICAuc2V0QWN0aXZlU2NlbmUoJ2RlZmF1bHQnKTtcbiAgcmV0dXJuIG1lO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIHRoZSBkZWZhdWx0IFRIUkVFLldlYkdMUmVuZGVyZXIgdXNlZCBpbiB0aGUgd29ybGRcbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5jcmVhdGVEZWZhdWx0UmVuZGVyZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBtZSA9IHRoaXMsXG4gICAgY29uZmlnID0gbWUuZ2V0Q29uZmlnKCk7XG4gIHZhciByZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHtcbi8vICAgICAgYW50aWFsaWFzOiB0cnVlXG4gIH0pO1xuICByZW5kZXJlci5zZXRDbGVhckNvbG9yKG1lLnRoZW1lLmNsZWFyQ29sb3IsIDEpO1xuICByZW5kZXJlci5zZXRTaXplKGNvbmZpZy53aWR0aCwgY29uZmlnLmhlaWdodCk7XG4gIGRvY3VtZW50XG4gICAgLnF1ZXJ5U2VsZWN0b3IoY29uZmlnLnNlbGVjdG9yKVxuICAgIC5hcHBlbmRDaGlsZChyZW5kZXJlci5kb21FbGVtZW50KTtcbiAgbWUucmVuZGVyZXIgPSByZW5kZXJlcjtcbiAgcmV0dXJuIG1lO1xufTtcblxuQXBwbGljYXRpb24ucHJvdG90eXBlLnNldEFjdGl2ZUNhbWVyYSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgdGhpcy5hY3RpdmVDYW1lcmEgPSB0aGlzLmNhbWVyYXNba2V5XTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5BcHBsaWNhdGlvbi5wcm90b3R5cGUuYWRkQ2FtZXJhID0gZnVuY3Rpb24gKGNhbWVyYSwga2V5KSB7XG4gIGNvbnNvbGUuYXNzZXJ0KGNhbWVyYSBpbnN0YW5jZW9mIFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhIHx8XG4gICAgY2FtZXJhIGluc3RhbmNlb2YgVEhSRUUuT3J0aG9ncmFwaGljQ2FtZXJhKTtcbiAgdGhpcy5jYW1lcmFzW2tleV0gPSBjYW1lcmE7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBDcmVhdGUgdGhlIGRlZmF1bHQgY2FtZXJhIHVzZWQgaW4gdGhpcyB3b3JsZCB3aGljaCBpc1xuICogYSBgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmFgLCBpdCBhbHNvIGFkZHMgb3JiaXQgY29udHJvbHNcbiAqIGJ5IGNhbGxpbmcge0BsaW5rICNjcmVhdGVDYW1lcmFDb250cm9sc31cbiAqL1xuQXBwbGljYXRpb24ucHJvdG90eXBlLmNyZWF0ZURlZmF1bHRDYW1lcmEgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBtZSA9IHRoaXMsXG4gICAgY29uZmlnID0gbWUuZ2V0Q29uZmlnKCksXG4gICAgd2lkdGggPSBjb25maWcud2lkdGgsXG4gICAgaGVpZ2h0ID0gY29uZmlnLmhlaWdodCxcbiAgICBkZWZhdWx0cyA9IHtcbiAgICAgIGZvdjogMzgsXG4gICAgICByYXRpbzogd2lkdGggLyBoZWlnaHQsXG4gICAgICBuZWFyOiAxLFxuICAgICAgZmFyOiAxMDAwMFxuICAgIH0sXG4gICAgZGVmYXVsdENhbWVyYTtcblxuICBkZWZhdWx0Q2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKFxuICAgIGRlZmF1bHRzLmZvdixcbiAgICBkZWZhdWx0cy5yYXRpbyxcbiAgICBkZWZhdWx0cy5uZWFyLFxuICAgIGRlZmF1bHRzLmZhclxuICApO1xuICBkZWZhdWx0Q2FtZXJhLnBvc2l0aW9uLnNldCg1MDAsIDMwMCwgNTAwKTtcblxuICAvLyB0cmFuc3BhcmVudGx5IHN1cHBvcnQgd2luZG93IHJlc2l6ZVxuICBpZiAoY29uZmlnLmZ1bGxTY3JlZW4pIHtcbiAgICBUSFJFRXguV2luZG93UmVzaXplLmJpbmQobWUucmVuZGVyZXIsIGRlZmF1bHRDYW1lcmEpO1xuICB9XG5cbiAgbWVcbiAgICAuY3JlYXRlQ2FtZXJhQ29udHJvbHMoZGVmYXVsdENhbWVyYSlcbiAgICAuYWRkQ2FtZXJhKGRlZmF1bHRDYW1lcmEsICdkZWZhdWx0JylcbiAgICAuc2V0QWN0aXZlQ2FtZXJhKCdkZWZhdWx0Jyk7XG5cbiAgcmV0dXJuIG1lO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIE9yYml0Q29udHJvbHMgb3ZlciB0aGUgYGNhbWVyYWAgcGFzc2VkIGFzIHBhcmFtXG4gKiBAcGFyYW0gIHtUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYXxUSFJFRS5PcnRvZ3JhcGhpY0NhbWVyYX0gY2FtZXJhXG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5BcHBsaWNhdGlvbi5wcm90b3R5cGUuY3JlYXRlQ2FtZXJhQ29udHJvbHMgPSBmdW5jdGlvbiAoY2FtZXJhKSB7XG4gIHZhciBtZSA9IHRoaXM7XG4gIGNhbWVyYS5jYW1lcmFDb250cm9scyA9IG5ldyBUSFJFRS5PcmJpdENvbnRyb2xzKFxuICAgIGNhbWVyYSxcbiAgICBtZS5yZW5kZXJlci5kb21FbGVtZW50XG4gICk7XG4gIC8vIGF2b2lkIHBhbm5pbmcgdG8gc2VlIHRoZSBib3R0b20gZmFjZVxuICBjYW1lcmEuY2FtZXJhQ29udHJvbHMubWF4UG9sYXJBbmdsZSA9IE1hdGguUEkgLyAyICogMC45OTtcbiAgY2FtZXJhLmNhbWVyYUNvbnRyb2xzLnRhcmdldC5zZXQoMTAwLCAxMDAsIDEwMCk7XG4gIC8vIGNhbWVyYS5jYW1lcmFDb250cm9scy50YXJnZXQuc2V0KDAsIDAsIDApO1xuICByZXR1cm4gbWU7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgc29tZSByYW5kb20gbGlnaHRzIGluIHRoZSBkZWZhdWx0IHNjZW5lXG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5BcHBsaWNhdGlvbi5wcm90b3R5cGUuY3JlYXRlRGVmYXVsdExpZ2h0cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGxpZ2h0LFxuICAgICAgc2NlbmUgPSB0aGlzLnNjZW5lc1snZGVmYXVsdCddO1xuXG4gIGxpZ2h0ID0gbmV3IFRIUkVFLkFtYmllbnRMaWdodCgweDIyMjIyMik7XG4gIHNjZW5lLmFkZChsaWdodCkuY2FjaGUoJ2FtYmllbnQtbGlnaHQtMScpO1xuXG4gIGxpZ2h0ID0gbmV3IFRIUkVFLkRpcmVjdGlvbmFsTGlnaHQoIDB4RkZGRkZGLCAxLjAgKTtcbiAgbGlnaHQucG9zaXRpb24uc2V0KCAyMDAsIDQwMCwgNTAwICk7XG4gIHNjZW5lLmFkZChsaWdodCkuY2FjaGUoJ2RpcmVjdGlvbmFsLWxpZ2h0LTEnKTtcblxuICBsaWdodCA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KCAweEZGRkZGRiwgMS4wICk7XG4gIGxpZ2h0LnBvc2l0aW9uLnNldCggLTUwMCwgMjUwLCAtMjAwICk7XG4gIHNjZW5lLmFkZChsaWdodCkuY2FjaGUoJ2RpcmVjdGlvbmFsLWxpZ2h0LTInKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0cyB0aGUgdGhlbWUgdG8gYmUgdXNlZCBpbiB0aGUgZGVmYXVsdCBzY2VuZVxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgRWl0aGVyIHRoZSBzdHJpbmcgYGRhcmtgIG9yIGBsaWdodGBcbiAqIEB0b2RvIE1ha2UgdGhlIHRoZW1lIHN5c3RlbSBleHRlbnNpYmxlXG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5BcHBsaWNhdGlvbi5wcm90b3R5cGUuc2V0VGhlbWUgPSBmdW5jdGlvbiAobmFtZSkge1xuICB2YXIgbWUgPSB0aGlzLFxuICAgIHRoZW1lcyA9IHJlcXVpcmUoJy4uLycpLnRoZW1lcztcbiAgYXNzZXJ0KHRoZW1lc1tuYW1lXSk7XG4gIG1lLnRoZW1lID0gdGhlbWVzW25hbWVdO1xuICByZXR1cm4gbWU7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBtYXNrIG9uIHRvcCBvZiB0aGUgY2FudmFzIHdoZW4gaXQncyBwYXVzZWRcbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5pbml0TWFzayA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG1lID0gdGhpcyxcbiAgICBjb25maWcgPSBtZS5nZXRDb25maWcoKSxcbiAgICBtYXNrLFxuICAgIGhpZGRlbjtcbiAgbWFzayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBtYXNrLmNsYXNzTmFtZSA9ICd0My1tYXNrJztcbiAgLy8gbWFzay5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICBtYXNrLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgbWFzay5zdHlsZS50b3AgPSAnMHB4JztcbiAgbWFzay5zdHlsZS53aWR0aCA9ICcxMDAlJztcbiAgbWFzay5zdHlsZS5oZWlnaHQgPSAnMTAwJSc7XG4gIG1hc2suc3R5bGUuYmFja2dyb3VuZCA9ICdyZ2JhKDAsMCwwLDAuNSknO1xuXG4gIGRvY3VtZW50XG4gICAgLnF1ZXJ5U2VsZWN0b3IoY29uZmlnLnNlbGVjdG9yKVxuICAgIC5hcHBlbmRDaGlsZChtYXNrKTtcblxuICBtZS5tYXNrID0gbWFzaztcbiAgcmV0dXJuIG1lO1xufTtcblxuLyoqXG4gKiBVcGRhdGVzIHRoZSBtYXNrIHZpc2liaWxpdHlcbiAqIEBwYXJhbSAge2Jvb2xlYW59IHYgVHJ1ZSB0byBtYWtlIGl0IHZpc2libGVcbiAqL1xuQXBwbGljYXRpb24ucHJvdG90eXBlLm1hc2tWaXNpYmxlID0gZnVuY3Rpb24gKHYpIHtcbiAgdmFyIG1hc2sgPSB0aGlzLm1hc2s7XG4gIG1hc2suc3R5bGUuZGlzcGxheSA9IHYgPyAnYmxvY2snIDogJ25vbmUnO1xufTtcblxuLyoqXG4gKiBJbml0cyB0aGUgZGF0Lmd1aSBoZWxwZXIgd2hpY2ggaXMgcGxhY2VkIHVuZGVyIHRoZVxuICogRE9NIGVsZW1lbnQgaWRlbnRpZmllZCBieSB0aGUgaW5pdGlhbCBjb25maWd1cmF0aW9uIHNlbGVjdG9yXG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5BcHBsaWNhdGlvbi5wcm90b3R5cGUuaW5pdERhdEd1aSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG1lID0gdGhpcyxcbiAgICBjb25maWcgPSBtZS5nZXRDb25maWcoKSxcbiAgICBndWkgPSBuZXcgZGF0LkdVSSh7XG4gICAgICBhdXRvUGxhY2U6IGZhbHNlXG4gICAgfSk7XG5cbiAgb2JqZWN0TWVyZ2UoZ3VpLmRvbUVsZW1lbnQuc3R5bGUsIHtcbiAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICB0b3A6ICcwcHgnLFxuICAgIHJpZ2h0OiAnMHB4JyxcbiAgICB6SW5kZXg6ICcxJ1xuICB9KTtcbiAgZG9jdW1lbnRcbiAgICAucXVlcnlTZWxlY3Rvcihjb25maWcuc2VsZWN0b3IpXG4gICAgLmFwcGVuZENoaWxkKGd1aS5kb21FbGVtZW50KTtcbiAgbWUuZGF0Z3VpID0gZ3VpO1xuICByZXR1cm4gbWU7XG59O1xuXG4vKipcbiAqIEluaXQgdGhlIFN0YXRzIGhlbHBlciB3aGljaCBpcyBwbGFjZWQgdW5kZXIgdGhlXG4gKiBET00gZWxlbWVudCBpZGVudGlmaWVkIGJ5IHRoZSBpbml0aWFsIGNvbmZpZ3VyYXRpb24gc2VsZWN0b3JcbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5pbml0U3RhdHMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBtZSA9IHRoaXMsXG4gICAgY29uZmlnID0gbWUuZ2V0Q29uZmlnKCksXG4gICAgc3RhdHM7XG4gIC8vIGFkZCBTdGF0cy5qcyAtIGh0dHBzOi8vZ2l0aHViLmNvbS9tcmRvb2Ivc3RhdHMuanNcbiAgc3RhdHMgPSBuZXcgU3RhdHMoKTtcbiAgb2JqZWN0TWVyZ2Uoc3RhdHMuZG9tRWxlbWVudC5zdHlsZSwge1xuICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgIHpJbmRleDogMSxcbiAgICBib3R0b206ICcwcHgnXG4gIH0pO1xuICBkb2N1bWVudFxuICAgIC5xdWVyeVNlbGVjdG9yKGNvbmZpZy5zZWxlY3RvcilcbiAgICAuYXBwZW5kQ2hpbGQoIHN0YXRzLmRvbUVsZW1lbnQgKTtcbiAgbWUuc3RhdHMgPSBzdGF0cztcbiAgcmV0dXJuIG1lO1xufTtcblxuLyoqXG4gKiBCaW5kcyB0aGUgRiBrZXkgdG8gbWFrZSBhIHdvcmxkIGdvIGZ1bGwgc2NyZWVuXG4gKiBAdG9kbyBUaGlzIHNob3VsZCBiZSB1c2VkIG9ubHkgd2hlbiB0aGUgY2FudmFzIGlzIGFjdGl2ZVxuICovXG5BcHBsaWNhdGlvbi5wcm90b3R5cGUuaW5pdEZ1bGxTY3JlZW4gPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjb25maWcgPSB0aGlzLmdldENvbmZpZygpO1xuICAvLyBhbGxvdyAnZicgdG8gZ28gZnVsbHNjcmVlbiB3aGVyZSB0aGlzIGZlYXR1cmUgaXMgc3VwcG9ydGVkXG4gIGlmKGNvbmZpZy5mdWxsU2NyZWVuICYmIFRIUkVFeC5GdWxsU2NyZWVuLmF2YWlsYWJsZSgpKSB7XG4gICAgVEhSRUV4LkZ1bGxTY3JlZW4uYmluZEtleSgpO1xuICB9XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemVzIHRoZSBjb29yZGluYXRlIGhlbHBlciAoaXRzIHdyYXBwZWQgaW4gYSBtb2RlbCBpbiBUMylcbiAqL1xuQXBwbGljYXRpb24ucHJvdG90eXBlLmluaXRDb29yZGluYXRlcyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGNvbmZpZyA9IHRoaXMuZ2V0Q29uZmlnKCk7XG4gIHRoaXMuc2NlbmVzWydkZWZhdWx0J11cbiAgICAuYWRkKFxuICAgICAgbmV3IENvb3JkaW5hdGVzKGNvbmZpZy5hbWJpZW50Q29uZmlnLCB0aGlzLnRoZW1lKVxuICAgICAgICAuaW5pdERhdEd1aSh0aGlzLmRhdGd1aSlcbiAgICAgICAgLm1lc2hcbiAgICApO1xufTtcblxuLyoqXG4gKiBJbml0aXMgdGhlIGtleWJvYXJkIGhlbHBlclxuICogQHJldHVybiB7dGhpc31cbiAqL1xuQXBwbGljYXRpb24ucHJvdG90eXBlLmluaXRLZXlib2FyZCA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5rZXlib2FyZCA9IG5ldyBLZXlib2FyZCgpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW5pdGlhbGl6ZXMgdGhlIGdhbWUgbG9vcCBieSBjcmVhdGluZyBhbiBpbnN0YW5jZSBvZiB7QGxpbmsgTG9vcE1hbmFnZXJ9XG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5BcHBsaWNhdGlvbi5wcm90b3R5cGUuZ2FtZUxvb3AgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjb25maWcgPSB0aGlzLmdldENvbmZpZygpO1xuICB0aGlzLmxvb3BNYW5hZ2VyID0gbmV3IExvb3BNYW5hZ2VyKHRoaXMsIGNvbmZpZy5yZW5kZXJJbW1lZGlhdGVseSlcbiAgICAuaW5pdERhdEd1aSh0aGlzLmRhdGd1aSlcbiAgICAuYW5pbWF0ZSgpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogVXBkYXRlIHBoYXNlLCB0aGUgd29ybGQgdXBkYXRlcyBieSBkZWZhdWx0OlxuICpcbiAqIC0gVGhlIHN0YXRzIGhlbHBlclxuICogLSBUaGUgY2FtZXJhIGNvbnRyb2xzIGlmIHRoZSBhY3RpdmUgY2FtZXJhIGhhcyBvbmVcbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gZGVsdGEgVGhlIG51bWJlciBvZiBzZWNvbmRzIGVsYXBzZWRcbiAqL1xuQXBwbGljYXRpb24ucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChkZWx0YSkge1xuICB2YXIgbWUgPSB0aGlzO1xuXG4gIC8vIHN0YXRzIGhlbHBlclxuICBtZS5zdGF0cy51cGRhdGUoKTtcblxuICAvLyBjYW1lcmEgdXBkYXRlXG4gIGlmIChtZS5hY3RpdmVDYW1lcmEuY2FtZXJhQ29udHJvbHMpIHtcbiAgICBtZS5hY3RpdmVDYW1lcmEuY2FtZXJhQ29udHJvbHMudXBkYXRlKGRlbHRhKTtcbiAgfVxufTtcblxuLyoqXG4gKiBSZW5kZXIgcGhhc2UsIGNhbGxzIGB0aGlzLnJlbmRlcmVyYCB3aXRoIGB0aGlzLmFjdGl2ZVNjZW5lYCBhbmRcbiAqIGB0aGlzLmFjdGl2ZUNhbWVyYWBcbiAqL1xuQXBwbGljYXRpb24ucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG1lID0gdGhpcztcbiAgbWUucmVuZGVyZXIucmVuZGVyKFxuICAgIG1lLmFjdGl2ZVNjZW5lLFxuICAgIG1lLmFjdGl2ZUNhbWVyYVxuICApO1xufTtcblxuLyoqXG4gKiBXcmFwcyBgVEhSRUUuT2JqZWN0M0QucHJvdG90eXBlLmFkZGAgYW5kIGBUSFJFRS5PYmplY3QzRC5wcm90b3R5cGUucmVtb3ZlYFxuICogd2l0aCBmdW5jdGlvbnMgdGhhdCBzYXZlIHRoZSBsYXN0IG9iamVjdCB3aGljaCBgYWRkYCBvciBgcmVtb3ZlYCBoYXZlIGJlZW5cbiAqIGNhbGxlZCB3aXRoLCB0aGlzIGFsbG93cyB0byBjYWxsIHRoZSBtZXRob2QgYGNhY2hlYCB3aGljaCB3aWxsIGNhY2hlXG4gKiB0aGUgb2JqZWN0IHdpdGggYW4gaWRlbnRpZmllciBhbGxvd2luZyBmYXN0IG9iamVjdCByZXRyaWV2YWxcbiAqXG4gKiBAZXhhbXBsZVxuICpcbiAqICAgdmFyIGluc3RhbmNlID0gdDMuQXBwbGljYXRpb24ucnVuKHtcbiAqICAgICBpbmplY3RDYWNoZTogdHJ1ZSxcbiAqICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gKiAgICAgICB2YXIgZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcbiAqICAgICAgIHZhciBpbm5lckdyb3VwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XG4gKlxuICogICAgICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5KDEsMSwxKTtcbiAqICAgICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7Y29sb3I6IDB4MDBmZjAwfSk7XG4gKiAgICAgICB2YXIgY3ViZSA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XG4gKlxuICogICAgICAgaW5uZXJHcm91cFxuICogICAgICAgICAuYWRkKGN1YmUpXG4gKiAgICAgICAgIC5jYWNoZSgnbXlDdWJlJyk7XG4gKlxuICogICAgICAgZ3JvdXBcbiAqICAgICAgICAgLmFkZChpbm5lckdyb3VwKVxuICogICAgICAgICAuY2FjaGUoJ2lubmVyR3JvdXAnKTtcbiAqXG4gKiAgICAgICAvLyByZW1vdmFsIGV4YW1wbGVcbiAqICAgICAgIC8vIGdyb3VwXG4gKiAgICAgICAvLyAgIC5yZW1vdmUoaW5uZXJHcm91cClcbiAqICAgICAgIC8vICAgLmNhY2hlKCk7XG4gKlxuICogICAgICAgdGhpcy5hY3RpdmVTY2VuZVxuICogICAgICAgICAuYWRkKGdyb3VwKVxuICogICAgICAgICAuY2FjaGUoJ2dyb3VwJyk7XG4gKiAgICAgfSxcbiAqXG4gKiAgICAgdXBkYXRlOiBmdW5jdGlvbiAoZGVsdGEpIHtcbiAqICAgICAgIHZhciBjdWJlID0gdGhpcy5nZXRGcm9tQ2FjaGUoJ215Q3ViZScpO1xuICogICAgICAgLy8gcGVyZm9ybSBvcGVyYXRpb25zIG9uIHRoZSBjdWJlXG4gKiAgICAgfVxuICogICB9KTtcbiAqXG4gKiBAcGFyYW0gIHtib29sZWFufSBpbmplY3QgVHJ1ZSB0byBlbmFibGUgdGhpcyBiZWhhdmlvclxuICovXG5BcHBsaWNhdGlvbi5wcm90b3R5cGUuaW5qZWN0Q2FjaGUgPSBmdW5jdGlvbiAoaW5qZWN0KSB7XG4gIHZhciBtZSA9IHRoaXMsXG4gICAgICBsYXN0T2JqZWN0LFxuICAgICAgbGFzdE1ldGhvZCxcbiAgICAgIGFkZCA9IFRIUkVFLk9iamVjdDNELnByb3RvdHlwZS5hZGQsXG4gICAgICByZW1vdmUgPSBUSFJFRS5PYmplY3QzRC5wcm90b3R5cGUucmVtb3ZlLFxuICAgICAgY2FjaGUgPSB0aGlzLl9fdDNjYWNoZV9fO1xuXG4gIGlmIChpbmplY3QpIHtcbiAgICBUSFJFRS5PYmplY3QzRC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgICAgbGFzdE1ldGhvZCA9ICdhZGQnO1xuICAgICAgbGFzdE9iamVjdCA9IG9iamVjdDtcbiAgICAgIHJldHVybiBhZGQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgVEhSRUUuT2JqZWN0M0QucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICAgIGxhc3RNZXRob2QgPSAncmVtb3ZlJztcbiAgICAgIGxhc3RPYmplY3QgPSBvYmplY3Q7XG4gICAgICByZXR1cm4gcmVtb3ZlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIFRIUkVFLk9iamVjdDNELnByb3RvdHlwZS5jYWNoZSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICBhc3NlcnQobGFzdE9iamVjdCwgJ1QzLkFwcGxpY2F0aW9uLnByb3RvdHlwZS5jYWNoZTogdGhpcyBtZXRob2QnICtcbiAgICAgICAgJyBuZWVkcyBhIHByZXZpb3VzIGNhbGwgdG8gYWRkL3JlbW92ZScpO1xuICAgICAgaWYgKGxhc3RNZXRob2QgPT09ICdhZGQnKSB7XG4gICAgICAgIGxhc3RPYmplY3QubmFtZSA9IGxhc3RPYmplY3QubmFtZSB8fCBuYW1lO1xuICAgICAgICBhc3NlcnQobGFzdE9iamVjdC5uYW1lKTtcbiAgICAgICAgY2FjaGVbbGFzdE9iamVjdC5uYW1lXSA9IGxhc3RPYmplY3Q7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhc3NlcnQobGFzdE9iamVjdC5uYW1lKTtcbiAgICAgICAgZGVsZXRlIGNhY2hlW2xhc3RPYmplY3QubmFtZV07XG4gICAgICB9XG4gICAgICBsYXN0T2JqZWN0ID0gbnVsbDtcbiAgICAgIHJldHVybiBtZTtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIFRIUkVFLk9iamVjdDNELnByb3RvdHlwZS5jYWNoZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gIH1cbn07XG5cbi8qKlxuICogR2V0cyBhbiBvYmplY3QgZnJvbSB0aGUgY2FjaGUgaWYgYGluamVjdENhY2hlYCB3YXMgZW5hYmxlZCBhbmRcbiAqIGFuIG9iamVjdCB3YXMgcmVnaXN0ZXJlZCB3aXRoIHtAbGluayAjY2FjaGV9XG4gKiBAcGFyYW0gIHtzdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge1RIUkVFLk9iamVjdDNEfVxuICovXG5BcHBsaWNhdGlvbi5wcm90b3R5cGUuZ2V0RnJvbUNhY2hlID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIHRoaXMuX190M2NhY2hlX19bbmFtZV07XG59O1xuXG4vKipcbiAqIEBzdGF0aWNcbiAqIENyZWF0ZXMgYSBzdWJjbGFzcyBvZiBBcHBsaWNhdGlvbiB3aG9zZSBpbnN0YW5jZXMgZG9uJ3QgbmVlZCB0b1xuICogd29ycnkgYWJvdXQgdGhlIGluaGVyaXRhbmNlIHByb2Nlc3NcbiAqIEBwYXJhbSAge09iamVjdH0gb3B0aW9ucyBUaGUgc2FtZSBvYmplY3QgcGFzc2VkIHRvIHRoZSB7QGxpbmsgQXBwbGljYXRpb259XG4gKiBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMuaW5pdCBJbml0aWFsaXphdGlvbiBwaGFzZSwgZnVuY3Rpb24gY2FsbGVkIGluXG4gKiB0aGUgY29uc3RydWN0b3Igb2YgdGhlIHN1YmNsYXNzXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucy51cGRhdGUgVXBkYXRlIHBoYXNlLCBmdW5jdGlvbiBjYWxsZWQgYXMgdGhlXG4gKiB1cGRhdGUgZnVuY3Rpb24gb2YgdGhlIHN1YmNsYXNzLCBpdCBhbHNvIGNhbGxzIEFwcGxpY2F0aW9uJ3MgdXBkYXRlXG4gKiBAcmV0dXJuIHt0My5RdWlja0xhdW5jaH0gQW4gaW5zdGFuY2Ugb2YgdGhlIHN1YmNsYXNzIGNyZWF0ZWQgaW5cbiAqIHRoaXMgZnVuY3Rpb25cbiAqL1xuQXBwbGljYXRpb24ucnVuID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9iamVjdE1lcmdlKHtcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7fSxcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHt9LFxuICB9LCBvcHRpb25zKTtcbiAgYXNzZXJ0KG9wdGlvbnMuc2VsZWN0b3IsICdjYW52YXMgc2VsZWN0b3IgcmVxdWlyZWQnKTtcblxuICB2YXIgUXVpY2tMYXVuY2ggPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIEFwcGxpY2F0aW9uLmNhbGwodGhpcywgb3B0aW9ucyk7XG4gICAgb3B0aW9ucy5pbml0LmNhbGwodGhpcywgb3B0aW9ucyk7XG4gIH07XG4gIFF1aWNrTGF1bmNoLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQXBwbGljYXRpb24ucHJvdG90eXBlKTtcblxuICBRdWlja0xhdW5jaC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKGRlbHRhKSB7XG4gICAgQXBwbGljYXRpb24ucHJvdG90eXBlLnVwZGF0ZS5jYWxsKHRoaXMsIGRlbHRhKTtcbiAgICBvcHRpb25zLnVwZGF0ZS5jYWxsKHRoaXMsIGRlbHRhKTtcbiAgfTtcblxuICByZXR1cm4gbmV3IFF1aWNrTGF1bmNoKG9wdGlvbnMpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBBcHBsaWNhdGlvbjtcbn0pLmNhbGwodGhpcyx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiLyoqXG4gKiBAbW9kdWxlICBjb250cm9sbGVyL0tleWJvYXJkXG4gKi9cblxuLyoqXG4gKiBLZXlib2FyZCBoZWxwZXJcbiAqIEBjbGFzc1xuICovXG5mdW5jdGlvbiBLZXlib2FyZCgpIHtcbiAgLyoqXG4gICAqIEVhY2ggaW5kZXggY29ycmVzcG9uZCB0byB0aGUgYXNjaWkgdmFsdWUgb2YgdGhlXG4gICAqIGtleSBwcmVzc2VkXG4gICAqIEB0eXBlIHtBcnJheX1cbiAgICovXG4gIHRoaXMua2V5cyA9IFtdO1xufTtcblxuLyoqXG4gKiBBZGRzIHRoZSBrZXlkb3duIGFuZCBrZXl1cCBsaXN0ZW5lcnNcbiAqL1xuS2V5Ym9hcmQucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBtZSA9IHRoaXMsXG4gICAgaTtcbiAgZm9yIChpID0gMDsgaSA8IDI1NjsgaSArPSAxKSB7XG4gICAgbWUua2V5c1tpXSA9IGZhbHNlO1xuICB9XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBtZS5vbktleURvd24oKSwgZmFsc2UpO1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIG1lLm9uS2V5VXAoKSwgZmFsc2UpO1xufTtcblxuLyoqXG4gKiBTZXRzIGBldmVudC5rZXljb2RlYCBhcyBhIHByZXNlZWQga2V5XG4gKiBAcmV0dXJuIHtmdW5jdGlvbn1cbiAqL1xuS2V5Ym9hcmQucHJvdG90eXBlLm9uS2V5RG93biA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG1lID0gdGhpcztcbiAgcmV0dXJuIGZ1bmN0aW9uIChldmVudCkge1xuICAgIG1lLmtleXNbZXZlbnQua2V5Q29kZV0gPSB0cnVlO1xuICB9O1xufTtcblxuLyoqXG4gKiBTZXRzIGBldmVudC5rZXljb2RlYCBhcyBhbiB1bnByZXNzZWQga2V5XG4gKiBAcmV0dXJuIHtmdW5jdGlvbn1cbiAqL1xuS2V5Ym9hcmQucHJvdG90eXBlLm9uS2V5VXAgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBtZSA9IHRoaXM7XG4gIHJldHVybiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBtZS5rZXlzW2V2ZW50LmtleUNvZGVdID0gZmFsc2U7XG4gIH07XG59O1xuXG4vKipcbiAqIEdldHMgdGhlIHByZXNzZWQgc3RhdGUgb2YgdGhlIGtleSBga2V5YFxuICogQHBhcmFtICB7c3RyaW5nfSBrZXlcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbktleWJvYXJkLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoa2V5KSB7XG4gIHJldHVybiB0aGlzLmtleXNba2V5LmNoYXJDb2RlQXQoMCldO1xufTtcblxuLyoqXG4gKiBTZXRzIHRoZSBwcmVzc2VkIHN0YXRlIG9mIHRoZSBrZXkgYGtleWAgdG8gYHZhbHVlYFxuICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICogQHBhcmFtIHtib29sZWFufSB2YWx1ZVxuICovXG5LZXlib2FyZC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgdGhpcy5rZXlzW2tleS5jaGFyQ29kZUF0KDApXSA9IHZhbHVlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBLZXlib2FyZDsiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG52YXIgVEhSRUUgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5USFJFRSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuVEhSRUUgOiBudWxsKTtcbnZhciBBcHBsaWNhdGlvbiA9IHJlcXVpcmUoJy4vQXBwbGljYXRpb24nKTtcblxuLyoqXG4gKiBAbW9kdWxlICBjb250cm9sbGVyL0xvb3BNYW5hZ2VyXG4gKi9cblxuLyoqXG4gKiBUaGUgbG9vcCBtYW5hZ2VycyBjb250cm9scyB0aGUgY2FsbHMgbWFkZSB0byBgcmVxdWVzdEFuaW1hdGlvbkZyYW1lYFxuICogb2YgYW4gQXBwbGljYXRpb25cbiAqIEBjbGFzc1xuICogQHBhcmFtIHtjb250cm9sbGVyL0xvb3BNYW5hZ2VyfSBhcHBsaWNhdGlvbiBBcHBsaWNhdG9uIHdob3NlIGZyYW1lIHJhdGVcbiAqIHdpbGwgYmUgY29udHJvbGxlZFxuICogQHBhcmFtIHtib29sZWFufSByZW5kZXJJbW1lZGlhdGVseSBUcnVlIHRvIHN0YXJ0IHRoZSBjYWxsXG4gKiB0byByZXF1ZXN0IGFuaW1hdGlvbiBmcmFtZSBpbW1lZGlhdGVseVxuICovXG5mdW5jdGlvbiBMb29wTWFuYWdlcihhcHBsaWNhdGlvbiwgcmVuZGVySW1tZWRpYXRlbHkpIHtcbiAgLyoqXG4gICAqIFJlZmVyZW5jZSB0byB0aGUgYXBwbGljYXRpb25cbiAgICogQHR5cGUge2NvbnRyb2xsZXIvQXBwbGljYXRpb259XG4gICAqL1xuICB0aGlzLmFwcGxpY2F0aW9uID0gYXBwbGljYXRpb247XG4gIC8qKlxuICAgKiBDbG9jayBoZWxwZXIgKGl0cyBkZWx0YSBtZXRob2QgaXMgdXNlZCB0byB1cGRhdGUgdGhlIGNhbWVyYSlcbiAgICogQHR5cGUge1RIUkVFLkNsb2NrKCl9XG4gICAqL1xuICB0aGlzLmNsb2NrID0gbmV3IFRIUkVFLkNsb2NrKCk7XG4gIC8qKlxuICAgKiBUb2dnbGUgdG8gcGF1c2UgdGhlIGFuaW1hdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICovXG4gIHRoaXMucGF1c2UgPSAhcmVuZGVySW1tZWRpYXRlbHk7XG4gIC8qKlxuICAgKiBGcmFtZXMgcGVyIHNlY29uZFxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKi9cbiAgdGhpcy5mcHMgPSA2MDtcblxuICAvKipcbiAgICogZGF0Lmd1aSBmb2xkZXIgb2JqZWN0c1xuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgdGhpcy5ndWlDb250cm9sbGVycyA9IHt9O1xufTtcblxuLyoqXG4gKiBJbml0aWFsaXplcyBhIGZvbGRlciB0byBjb250cm9sIHRoZSBmcmFtZSByYXRlIGFuZCBzZXRzXG4gKiB0aGUgcGF1c2VkIHN0YXRlIG9mIHRoZSBhcHBcbiAqIEBwYXJhbSAge2RhdC5ndWl9IGd1aVxuICogQHJldHVybiB7dGhpc31cbiAqL1xuTG9vcE1hbmFnZXIucHJvdG90eXBlLmluaXREYXRHdWkgPSBmdW5jdGlvbiAoZ3VpKSB7XG4gIHZhciBtZSA9IHRoaXMsXG4gICAgICBmb2xkZXIgPSBndWkuYWRkRm9sZGVyKCdHYW1lIExvb3AnKTtcbiAgZm9sZGVyXG4gICAgLmFkZCh0aGlzLCAnZnBzJywgMTAsIDYwLCAxKVxuICAgIC5uYW1lKCdGcmFtZSByYXRlJyk7XG4gIFxuICBtZS5ndWlDb250cm9sbGVycy5wYXVzZSA9IGZvbGRlclxuICAgIC5hZGQodGhpcywgJ3BhdXNlJylcbiAgICAubmFtZSgnUGF1c2VkJylcbiAgICAub25GaW5pc2hDaGFuZ2UoZnVuY3Rpb24gKHBhdXNlZCkge1xuICAgICAgaWYgKCFwYXVzZWQpIHtcbiAgICAgICAgbWUuYW5pbWF0ZSgpO1xuICAgICAgfVxuICAgICAgbWUuYXBwbGljYXRpb24ubWFza1Zpc2libGUocGF1c2VkKTtcbiAgICB9KTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFuaW1hdGlvbiBsb29wIChjYWxscyBhcHBsaWNhdGlvbi51cGRhdGUgYW5kIGFwcGxpY2F0aW9uLnJlbmRlcilcbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cbkxvb3BNYW5hZ2VyLnByb3RvdHlwZS5hbmltYXRlID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbWUgPSB0aGlzLFxuICAgIGVsYXBzZWRUaW1lID0gMCxcbiAgICBsb29wO1xuXG4gIGxvb3AgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKG1lLnBhdXNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGRlbHRhID0gbWUuY2xvY2suZ2V0RGVsdGEoKSxcbiAgICAgIGZyYW1lUmF0ZUluUyA9IDEgLyBtZS5mcHM7XG5cbiAgICAvLyBjb25zdHJhaW50IGRlbHRhIHRvIGJlIDw9IGZyYW1lUmF0ZVxuICAgIC8vICh0byBhdm9pZCBmcmFtZXMgd2l0aCBhIGJpZyBkZWx0YSBjYXVzZWQgYmVjYXVzZSBvZiB0aGUgYXBwIHNlbnQgdG8gc2xlZXApXG4gICAgZGVsdGEgPSBNYXRoLm1pbihkZWx0YSwgZnJhbWVSYXRlSW5TKTtcbiAgICBlbGFwc2VkVGltZSArPSBkZWx0YTtcblxuICAgIGlmIChlbGFwc2VkVGltZSA+PSBmcmFtZVJhdGVJblMpIHtcblxuICAgICAgLy8gdXBkYXRlIHRoZSB3b3JsZCBhbmQgcmVuZGVyIGl0cyBvYmplY3RzXG4gICAgICBtZS5hcHBsaWNhdGlvbi51cGRhdGUoZGVsdGEpO1xuICAgICAgbWUuYXBwbGljYXRpb24ucmVuZGVyKCk7XG5cbiAgICAgIGVsYXBzZWRUaW1lIC09IGZyYW1lUmF0ZUluUztcbiAgICB9XG5cbiAgICAvLyBkZXRhaWxzIGF0IGh0dHA6Ly9teS5vcGVyYS5jb20vZW1vbGxlci9ibG9nLzIwMTEvMTIvMjAvcmVxdWVzdGFuaW1hdGlvbmZyYW1lLWZvci1zbWFydC1lci1hbmltYXRpbmdcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGxvb3ApO1xuICB9O1xuXG4gIGxvb3AoKTtcblxuICByZXR1cm4gbWU7XG59O1xuXG4vKipcbiAqIFN0YXJ0cyB0aGUgYW5pbWF0aW9uXG4gKi9cbkxvb3BNYW5hZ2VyLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG1lID0gdGhpcztcbiAgbWUuZ3VpQ29udHJvbGxlcnMucGF1c2Uuc2V0VmFsdWUoZmFsc2UpO1xufTtcblxuLyoqXG4gKiBTdG9wcyB0aGUgYW5pbWF0aW9uXG4gKi9cbkxvb3BNYW5hZ2VyLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbWUgPSB0aGlzO1xuICBtZS5ndWlDb250cm9sbGVycy5wYXVzZS5zZXRWYWx1ZSh0cnVlKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTG9vcE1hbmFnZXI7XG59KS5jYWxsKHRoaXMsdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsInJlcXVpcmUoJy4vbGliL09yYml0Q29udHJvbHMnKTtcblxuLyoqXG4gKiB0M1xuICogQG5hbWVzcGFjZVxuICogQHR5cGUge09iamVjdH1cbiAqL1xudmFyIEFwcGxpY2F0aW9uID0gcmVxdWlyZSgnLi9jb250cm9sbGVyL0FwcGxpY2F0aW9uJyk7XG52YXIgdDMgPSB7XG4gIG1vZGVsOiB7XG4gICAgQ29vcmRpbmF0ZXM6IHJlcXVpcmUoJy4vbW9kZWwvQ29vcmRpbmF0ZXMnKSxcbiAgfSxcbiAgdGhlbWVzOiB7XG4gICAgZGFyazogcmVxdWlyZSgnLi90aGVtZXMvZGFyaycpLFxuICAgIGxpZ2h0OiByZXF1aXJlKCcuL3RoZW1lcy9saWdodCcpXG4gIH0sXG4gIGNvbnRyb2xsZXI6IHtcbiAgICBBcHBsaWNhdGlvbjogQXBwbGljYXRpb24sXG4gICAgS2V5Ym9hcmQ6IHJlcXVpcmUoJy4vY29udHJvbGxlci9LZXlib2FyZCcpLFxuICAgIExvb3BNYW5hZ2VyOiByZXF1aXJlKCcuL2NvbnRyb2xsZXIvTG9vcE1hbmFnZXInKVxuICB9LFxuICBBcHBsaWNhdGlvbjogQXBwbGljYXRpb24sXG5cbiAgLy8gYWxpYXNcbiAgcnVuOiBBcHBsaWNhdGlvbi5ydW5cbn07XG5tb2R1bGUuZXhwb3J0cyA9IHQzOyIsIi8qKlxuICogQGF1dGhvciBxaWFvIC8gaHR0cHM6Ly9naXRodWIuY29tL3FpYW9cbiAqIEBhdXRob3IgbXJkb29iIC8gaHR0cDovL21yZG9vYi5jb21cbiAqIEBhdXRob3IgYWx0ZXJlZHEgLyBodHRwOi8vYWx0ZXJlZHF1YWxpYS5jb20vXG4gKiBAYXV0aG9yIFdlc3RMYW5nbGV5IC8gaHR0cDovL2dpdGh1Yi5jb20vV2VzdExhbmdsZXlcbiAqIEBhdXRob3IgZXJpY2g2NjYgLyBodHRwOi8vZXJpY2hhaW5lcy5jb21cbiAqL1xuLypnbG9iYWwgVEhSRUUsIGNvbnNvbGUgKi9cblxuLy8gVGhpcyBzZXQgb2YgY29udHJvbHMgcGVyZm9ybXMgb3JiaXRpbmcsIGRvbGx5aW5nICh6b29taW5nKSwgYW5kIHBhbm5pbmcuIEl0IG1haW50YWluc1xuLy8gdGhlIFwidXBcIiBkaXJlY3Rpb24gYXMgK1ksIHVubGlrZSB0aGUgVHJhY2tiYWxsQ29udHJvbHMuIFRvdWNoIG9uIHRhYmxldCBhbmQgcGhvbmVzIGlzXG4vLyBzdXBwb3J0ZWQuXG4vL1xuLy8gICAgT3JiaXQgLSBsZWZ0IG1vdXNlIC8gdG91Y2g6IG9uZSBmaW5nZXIgbW92ZVxuLy8gICAgWm9vbSAtIG1pZGRsZSBtb3VzZSwgb3IgbW91c2V3aGVlbCAvIHRvdWNoOiB0d28gZmluZ2VyIHNwcmVhZCBvciBzcXVpc2hcbi8vICAgIFBhbiAtIHJpZ2h0IG1vdXNlLCBvciBhcnJvdyBrZXlzIC8gdG91Y2g6IHRocmVlIGZpbnRlciBzd2lwZVxuLy9cbi8vIFRoaXMgaXMgYSBkcm9wLWluIHJlcGxhY2VtZW50IGZvciAobW9zdCkgVHJhY2tiYWxsQ29udHJvbHMgdXNlZCBpbiBleGFtcGxlcy5cbi8vIFRoYXQgaXMsIGluY2x1ZGUgdGhpcyBqcyBmaWxlIGFuZCB3aGVyZXZlciB5b3Ugc2VlOlxuLy8gICAgXHRjb250cm9scyA9IG5ldyBUSFJFRS5UcmFja2JhbGxDb250cm9scyggY2FtZXJhICk7XG4vLyAgICAgIGNvbnRyb2xzLnRhcmdldC56ID0gMTUwO1xuLy8gU2ltcGxlIHN1YnN0aXR1dGUgXCJPcmJpdENvbnRyb2xzXCIgYW5kIHRoZSBjb250cm9sIHNob3VsZCB3b3JrIGFzLWlzLlxuXG5USFJFRS5PcmJpdENvbnRyb2xzID0gZnVuY3Rpb24gKCBvYmplY3QsIGRvbUVsZW1lbnQgKSB7XG5cblx0dGhpcy5vYmplY3QgPSBvYmplY3Q7XG5cdHRoaXMuZG9tRWxlbWVudCA9ICggZG9tRWxlbWVudCAhPT0gdW5kZWZpbmVkICkgPyBkb21FbGVtZW50IDogZG9jdW1lbnQ7XG5cblx0Ly8gQVBJXG5cblx0Ly8gU2V0IHRvIGZhbHNlIHRvIGRpc2FibGUgdGhpcyBjb250cm9sXG5cdHRoaXMuZW5hYmxlZCA9IHRydWU7XG5cblx0Ly8gXCJ0YXJnZXRcIiBzZXRzIHRoZSBsb2NhdGlvbiBvZiBmb2N1cywgd2hlcmUgdGhlIGNvbnRyb2wgb3JiaXRzIGFyb3VuZFxuXHQvLyBhbmQgd2hlcmUgaXQgcGFucyB3aXRoIHJlc3BlY3QgdG8uXG5cdHRoaXMudGFyZ2V0ID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblxuXHQvLyBjZW50ZXIgaXMgb2xkLCBkZXByZWNhdGVkOyB1c2UgXCJ0YXJnZXRcIiBpbnN0ZWFkXG5cdHRoaXMuY2VudGVyID0gdGhpcy50YXJnZXQ7XG5cblx0Ly8gVGhpcyBvcHRpb24gYWN0dWFsbHkgZW5hYmxlcyBkb2xseWluZyBpbiBhbmQgb3V0OyBsZWZ0IGFzIFwiem9vbVwiIGZvclxuXHQvLyBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eVxuXHR0aGlzLm5vWm9vbSA9IGZhbHNlO1xuXHR0aGlzLnpvb21TcGVlZCA9IDEuMDtcblxuXHQvLyBMaW1pdHMgdG8gaG93IGZhciB5b3UgY2FuIGRvbGx5IGluIGFuZCBvdXRcblx0dGhpcy5taW5EaXN0YW5jZSA9IDA7XG5cdHRoaXMubWF4RGlzdGFuY2UgPSBJbmZpbml0eTtcblxuXHQvLyBTZXQgdG8gdHJ1ZSB0byBkaXNhYmxlIHRoaXMgY29udHJvbFxuXHR0aGlzLm5vUm90YXRlID0gZmFsc2U7XG5cdHRoaXMucm90YXRlU3BlZWQgPSAxLjA7XG5cblx0Ly8gU2V0IHRvIHRydWUgdG8gZGlzYWJsZSB0aGlzIGNvbnRyb2xcblx0dGhpcy5ub1BhbiA9IGZhbHNlO1xuXHR0aGlzLmtleVBhblNwZWVkID0gNy4wO1x0Ly8gcGl4ZWxzIG1vdmVkIHBlciBhcnJvdyBrZXkgcHVzaFxuXG5cdC8vIFNldCB0byB0cnVlIHRvIGF1dG9tYXRpY2FsbHkgcm90YXRlIGFyb3VuZCB0aGUgdGFyZ2V0XG5cdHRoaXMuYXV0b1JvdGF0ZSA9IGZhbHNlO1xuXHR0aGlzLmF1dG9Sb3RhdGVTcGVlZCA9IDIuMDsgLy8gMzAgc2Vjb25kcyBwZXIgcm91bmQgd2hlbiBmcHMgaXMgNjBcblxuXHQvLyBIb3cgZmFyIHlvdSBjYW4gb3JiaXQgdmVydGljYWxseSwgdXBwZXIgYW5kIGxvd2VyIGxpbWl0cy5cblx0Ly8gUmFuZ2UgaXMgMCB0byBNYXRoLlBJIHJhZGlhbnMuXG5cdHRoaXMubWluUG9sYXJBbmdsZSA9IDA7IC8vIHJhZGlhbnNcblx0dGhpcy5tYXhQb2xhckFuZ2xlID0gTWF0aC5QSTsgLy8gcmFkaWFuc1xuXG5cdC8vIFNldCB0byB0cnVlIHRvIGRpc2FibGUgdXNlIG9mIHRoZSBrZXlzXG5cdHRoaXMubm9LZXlzID0gZmFsc2U7XG5cblx0Ly8gVGhlIGZvdXIgYXJyb3cga2V5c1xuXHR0aGlzLmtleXMgPSB7IExFRlQ6IDM3LCBVUDogMzgsIFJJR0hUOiAzOSwgQk9UVE9NOiA0MCB9O1xuXG5cdC8vLy8vLy8vLy8vL1xuXHQvLyBpbnRlcm5hbHNcblxuXHR2YXIgc2NvcGUgPSB0aGlzO1xuXG5cdHZhciBFUFMgPSAwLjAwMDAwMTtcblxuXHR2YXIgcm90YXRlU3RhcnQgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXHR2YXIgcm90YXRlRW5kID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblx0dmFyIHJvdGF0ZURlbHRhID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblxuXHR2YXIgcGFuU3RhcnQgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXHR2YXIgcGFuRW5kID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblx0dmFyIHBhbkRlbHRhID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblx0dmFyIHBhbk9mZnNldCA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cblx0dmFyIG9mZnNldCA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cblx0dmFyIGRvbGx5U3RhcnQgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXHR2YXIgZG9sbHlFbmQgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXHR2YXIgZG9sbHlEZWx0YSA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cblx0dmFyIHBoaURlbHRhID0gMDtcblx0dmFyIHRoZXRhRGVsdGEgPSAwO1xuXHR2YXIgc2NhbGUgPSAxO1xuXHR2YXIgcGFuID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblxuXHR2YXIgbGFzdFBvc2l0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblx0dmFyIGxhc3RRdWF0ZXJuaW9uID0gbmV3IFRIUkVFLlF1YXRlcm5pb24oKTtcblxuXHR2YXIgU1RBVEUgPSB7IE5PTkUgOiAtMSwgUk9UQVRFIDogMCwgRE9MTFkgOiAxLCBQQU4gOiAyLCBUT1VDSF9ST1RBVEUgOiAzLCBUT1VDSF9ET0xMWSA6IDQsIFRPVUNIX1BBTiA6IDUgfTtcblxuXHR2YXIgc3RhdGUgPSBTVEFURS5OT05FO1xuXG5cdC8vIGZvciByZXNldFxuXG5cdHRoaXMudGFyZ2V0MCA9IHRoaXMudGFyZ2V0LmNsb25lKCk7XG5cdHRoaXMucG9zaXRpb24wID0gdGhpcy5vYmplY3QucG9zaXRpb24uY2xvbmUoKTtcblxuXHQvLyBzbyBjYW1lcmEudXAgaXMgdGhlIG9yYml0IGF4aXNcblxuXHR2YXIgcXVhdCA9IG5ldyBUSFJFRS5RdWF0ZXJuaW9uKCkuc2V0RnJvbVVuaXRWZWN0b3JzKCBvYmplY3QudXAsIG5ldyBUSFJFRS5WZWN0b3IzKCAwLCAxLCAwICkgKTtcblx0dmFyIHF1YXRJbnZlcnNlID0gcXVhdC5jbG9uZSgpLmludmVyc2UoKTtcblxuXHQvLyBldmVudHNcblxuXHR2YXIgY2hhbmdlRXZlbnQgPSB7IHR5cGU6ICdjaGFuZ2UnIH07XG5cdHZhciBzdGFydEV2ZW50ID0geyB0eXBlOiAnc3RhcnQnfTtcblx0dmFyIGVuZEV2ZW50ID0geyB0eXBlOiAnZW5kJ307XG5cblx0dGhpcy5yb3RhdGVMZWZ0ID0gZnVuY3Rpb24gKCBhbmdsZSApIHtcblxuXHRcdGlmICggYW5nbGUgPT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0YW5nbGUgPSBnZXRBdXRvUm90YXRpb25BbmdsZSgpO1xuXG5cdFx0fVxuXG5cdFx0dGhldGFEZWx0YSAtPSBhbmdsZTtcblxuXHR9O1xuXG5cdHRoaXMucm90YXRlVXAgPSBmdW5jdGlvbiAoIGFuZ2xlICkge1xuXG5cdFx0aWYgKCBhbmdsZSA9PT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRhbmdsZSA9IGdldEF1dG9Sb3RhdGlvbkFuZ2xlKCk7XG5cblx0XHR9XG5cblx0XHRwaGlEZWx0YSAtPSBhbmdsZTtcblxuXHR9O1xuXG5cdC8vIHBhc3MgaW4gZGlzdGFuY2UgaW4gd29ybGQgc3BhY2UgdG8gbW92ZSBsZWZ0XG5cdHRoaXMucGFuTGVmdCA9IGZ1bmN0aW9uICggZGlzdGFuY2UgKSB7XG5cblx0XHR2YXIgdGUgPSB0aGlzLm9iamVjdC5tYXRyaXguZWxlbWVudHM7XG5cblx0XHQvLyBnZXQgWCBjb2x1bW4gb2YgbWF0cml4XG5cdFx0cGFuT2Zmc2V0LnNldCggdGVbIDAgXSwgdGVbIDEgXSwgdGVbIDIgXSApO1xuXHRcdHBhbk9mZnNldC5tdWx0aXBseVNjYWxhciggLSBkaXN0YW5jZSApO1xuXHRcdFxuXHRcdHBhbi5hZGQoIHBhbk9mZnNldCApO1xuXG5cdH07XG5cblx0Ly8gcGFzcyBpbiBkaXN0YW5jZSBpbiB3b3JsZCBzcGFjZSB0byBtb3ZlIHVwXG5cdHRoaXMucGFuVXAgPSBmdW5jdGlvbiAoIGRpc3RhbmNlICkge1xuXG5cdFx0dmFyIHRlID0gdGhpcy5vYmplY3QubWF0cml4LmVsZW1lbnRzO1xuXG5cdFx0Ly8gZ2V0IFkgY29sdW1uIG9mIG1hdHJpeFxuXHRcdHBhbk9mZnNldC5zZXQoIHRlWyA0IF0sIHRlWyA1IF0sIHRlWyA2IF0gKTtcblx0XHRwYW5PZmZzZXQubXVsdGlwbHlTY2FsYXIoIGRpc3RhbmNlICk7XG5cdFx0XG5cdFx0cGFuLmFkZCggcGFuT2Zmc2V0ICk7XG5cblx0fTtcblx0XG5cdC8vIHBhc3MgaW4geCx5IG9mIGNoYW5nZSBkZXNpcmVkIGluIHBpeGVsIHNwYWNlLFxuXHQvLyByaWdodCBhbmQgZG93biBhcmUgcG9zaXRpdmVcblx0dGhpcy5wYW4gPSBmdW5jdGlvbiAoIGRlbHRhWCwgZGVsdGFZICkge1xuXG5cdFx0dmFyIGVsZW1lbnQgPSBzY29wZS5kb21FbGVtZW50ID09PSBkb2N1bWVudCA/IHNjb3BlLmRvbUVsZW1lbnQuYm9keSA6IHNjb3BlLmRvbUVsZW1lbnQ7XG5cblx0XHRpZiAoIHNjb3BlLm9iamVjdC5mb3YgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0Ly8gcGVyc3BlY3RpdmVcblx0XHRcdHZhciBwb3NpdGlvbiA9IHNjb3BlLm9iamVjdC5wb3NpdGlvbjtcblx0XHRcdHZhciBvZmZzZXQgPSBwb3NpdGlvbi5jbG9uZSgpLnN1Yiggc2NvcGUudGFyZ2V0ICk7XG5cdFx0XHR2YXIgdGFyZ2V0RGlzdGFuY2UgPSBvZmZzZXQubGVuZ3RoKCk7XG5cblx0XHRcdC8vIGhhbGYgb2YgdGhlIGZvdiBpcyBjZW50ZXIgdG8gdG9wIG9mIHNjcmVlblxuXHRcdFx0dGFyZ2V0RGlzdGFuY2UgKj0gTWF0aC50YW4oICggc2NvcGUub2JqZWN0LmZvdiAvIDIgKSAqIE1hdGguUEkgLyAxODAuMCApO1xuXG5cdFx0XHQvLyB3ZSBhY3R1YWxseSBkb24ndCB1c2Ugc2NyZWVuV2lkdGgsIHNpbmNlIHBlcnNwZWN0aXZlIGNhbWVyYSBpcyBmaXhlZCB0byBzY3JlZW4gaGVpZ2h0XG5cdFx0XHRzY29wZS5wYW5MZWZ0KCAyICogZGVsdGFYICogdGFyZ2V0RGlzdGFuY2UgLyBlbGVtZW50LmNsaWVudEhlaWdodCApO1xuXHRcdFx0c2NvcGUucGFuVXAoIDIgKiBkZWx0YVkgKiB0YXJnZXREaXN0YW5jZSAvIGVsZW1lbnQuY2xpZW50SGVpZ2h0ICk7XG5cblx0XHR9IGVsc2UgaWYgKCBzY29wZS5vYmplY3QudG9wICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdC8vIG9ydGhvZ3JhcGhpY1xuXHRcdFx0c2NvcGUucGFuTGVmdCggZGVsdGFYICogKHNjb3BlLm9iamVjdC5yaWdodCAtIHNjb3BlLm9iamVjdC5sZWZ0KSAvIGVsZW1lbnQuY2xpZW50V2lkdGggKTtcblx0XHRcdHNjb3BlLnBhblVwKCBkZWx0YVkgKiAoc2NvcGUub2JqZWN0LnRvcCAtIHNjb3BlLm9iamVjdC5ib3R0b20pIC8gZWxlbWVudC5jbGllbnRIZWlnaHQgKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdC8vIGNhbWVyYSBuZWl0aGVyIG9ydGhvZ3JhcGhpYyBvciBwZXJzcGVjdGl2ZVxuXHRcdFx0Y29uc29sZS53YXJuKCAnV0FSTklORzogT3JiaXRDb250cm9scy5qcyBlbmNvdW50ZXJlZCBhbiB1bmtub3duIGNhbWVyYSB0eXBlIC0gcGFuIGRpc2FibGVkLicgKTtcblxuXHRcdH1cblxuXHR9O1xuXG5cdHRoaXMuZG9sbHlJbiA9IGZ1bmN0aW9uICggZG9sbHlTY2FsZSApIHtcblxuXHRcdGlmICggZG9sbHlTY2FsZSA9PT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRkb2xseVNjYWxlID0gZ2V0Wm9vbVNjYWxlKCk7XG5cblx0XHR9XG5cblx0XHRzY2FsZSAvPSBkb2xseVNjYWxlO1xuXG5cdH07XG5cblx0dGhpcy5kb2xseU91dCA9IGZ1bmN0aW9uICggZG9sbHlTY2FsZSApIHtcblxuXHRcdGlmICggZG9sbHlTY2FsZSA9PT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRkb2xseVNjYWxlID0gZ2V0Wm9vbVNjYWxlKCk7XG5cblx0XHR9XG5cblx0XHRzY2FsZSAqPSBkb2xseVNjYWxlO1xuXG5cdH07XG5cblx0dGhpcy51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHR2YXIgcG9zaXRpb24gPSB0aGlzLm9iamVjdC5wb3NpdGlvbjtcblxuXHRcdG9mZnNldC5jb3B5KCBwb3NpdGlvbiApLnN1YiggdGhpcy50YXJnZXQgKTtcblxuXHRcdC8vIHJvdGF0ZSBvZmZzZXQgdG8gXCJ5LWF4aXMtaXMtdXBcIiBzcGFjZVxuXHRcdG9mZnNldC5hcHBseVF1YXRlcm5pb24oIHF1YXQgKTtcblxuXHRcdC8vIGFuZ2xlIGZyb20gei1heGlzIGFyb3VuZCB5LWF4aXNcblxuXHRcdHZhciB0aGV0YSA9IE1hdGguYXRhbjIoIG9mZnNldC54LCBvZmZzZXQueiApO1xuXG5cdFx0Ly8gYW5nbGUgZnJvbSB5LWF4aXNcblxuXHRcdHZhciBwaGkgPSBNYXRoLmF0YW4yKCBNYXRoLnNxcnQoIG9mZnNldC54ICogb2Zmc2V0LnggKyBvZmZzZXQueiAqIG9mZnNldC56ICksIG9mZnNldC55ICk7XG5cblx0XHRpZiAoIHRoaXMuYXV0b1JvdGF0ZSApIHtcblxuXHRcdFx0dGhpcy5yb3RhdGVMZWZ0KCBnZXRBdXRvUm90YXRpb25BbmdsZSgpICk7XG5cblx0XHR9XG5cblx0XHR0aGV0YSArPSB0aGV0YURlbHRhO1xuXHRcdHBoaSArPSBwaGlEZWx0YTtcblxuXHRcdC8vIHJlc3RyaWN0IHBoaSB0byBiZSBiZXR3ZWVuIGRlc2lyZWQgbGltaXRzXG5cdFx0cGhpID0gTWF0aC5tYXgoIHRoaXMubWluUG9sYXJBbmdsZSwgTWF0aC5taW4oIHRoaXMubWF4UG9sYXJBbmdsZSwgcGhpICkgKTtcblxuXHRcdC8vIHJlc3RyaWN0IHBoaSB0byBiZSBiZXR3ZWUgRVBTIGFuZCBQSS1FUFNcblx0XHRwaGkgPSBNYXRoLm1heCggRVBTLCBNYXRoLm1pbiggTWF0aC5QSSAtIEVQUywgcGhpICkgKTtcblxuXHRcdHZhciByYWRpdXMgPSBvZmZzZXQubGVuZ3RoKCkgKiBzY2FsZTtcblxuXHRcdC8vIHJlc3RyaWN0IHJhZGl1cyB0byBiZSBiZXR3ZWVuIGRlc2lyZWQgbGltaXRzXG5cdFx0cmFkaXVzID0gTWF0aC5tYXgoIHRoaXMubWluRGlzdGFuY2UsIE1hdGgubWluKCB0aGlzLm1heERpc3RhbmNlLCByYWRpdXMgKSApO1xuXHRcdFxuXHRcdC8vIG1vdmUgdGFyZ2V0IHRvIHBhbm5lZCBsb2NhdGlvblxuXHRcdHRoaXMudGFyZ2V0LmFkZCggcGFuICk7XG5cblx0XHRvZmZzZXQueCA9IHJhZGl1cyAqIE1hdGguc2luKCBwaGkgKSAqIE1hdGguc2luKCB0aGV0YSApO1xuXHRcdG9mZnNldC55ID0gcmFkaXVzICogTWF0aC5jb3MoIHBoaSApO1xuXHRcdG9mZnNldC56ID0gcmFkaXVzICogTWF0aC5zaW4oIHBoaSApICogTWF0aC5jb3MoIHRoZXRhICk7XG5cblx0XHQvLyByb3RhdGUgb2Zmc2V0IGJhY2sgdG8gXCJjYW1lcmEtdXAtdmVjdG9yLWlzLXVwXCIgc3BhY2Vcblx0XHRvZmZzZXQuYXBwbHlRdWF0ZXJuaW9uKCBxdWF0SW52ZXJzZSApO1xuXG5cdFx0cG9zaXRpb24uY29weSggdGhpcy50YXJnZXQgKS5hZGQoIG9mZnNldCApO1xuXG5cdFx0dGhpcy5vYmplY3QubG9va0F0KCB0aGlzLnRhcmdldCApO1xuXG5cdFx0dGhldGFEZWx0YSA9IDA7XG5cdFx0cGhpRGVsdGEgPSAwO1xuXHRcdHNjYWxlID0gMTtcblx0XHRwYW4uc2V0KCAwLCAwLCAwICk7XG5cblx0XHQvLyB1cGRhdGUgY29uZGl0aW9uIGlzOlxuXHRcdC8vIG1pbihjYW1lcmEgZGlzcGxhY2VtZW50LCBjYW1lcmEgcm90YXRpb24gaW4gcmFkaWFucyleMiA+IEVQU1xuXHRcdC8vIHVzaW5nIHNtYWxsLWFuZ2xlIGFwcHJveGltYXRpb24gY29zKHgvMikgPSAxIC0geF4yIC8gOFxuXG5cdFx0aWYgKCBsYXN0UG9zaXRpb24uZGlzdGFuY2VUb1NxdWFyZWQoIHRoaXMub2JqZWN0LnBvc2l0aW9uICkgPiBFUFNcblx0XHQgICAgfHwgOCAqICgxIC0gbGFzdFF1YXRlcm5pb24uZG90KHRoaXMub2JqZWN0LnF1YXRlcm5pb24pKSA+IEVQUyApIHtcblxuXHRcdFx0dGhpcy5kaXNwYXRjaEV2ZW50KCBjaGFuZ2VFdmVudCApO1xuXG5cdFx0XHRsYXN0UG9zaXRpb24uY29weSggdGhpcy5vYmplY3QucG9zaXRpb24gKTtcblx0XHRcdGxhc3RRdWF0ZXJuaW9uLmNvcHkgKHRoaXMub2JqZWN0LnF1YXRlcm5pb24gKTtcblxuXHRcdH1cblxuXHR9O1xuXG5cblx0dGhpcy5yZXNldCA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdHN0YXRlID0gU1RBVEUuTk9ORTtcblxuXHRcdHRoaXMudGFyZ2V0LmNvcHkoIHRoaXMudGFyZ2V0MCApO1xuXHRcdHRoaXMub2JqZWN0LnBvc2l0aW9uLmNvcHkoIHRoaXMucG9zaXRpb24wICk7XG5cblx0XHR0aGlzLnVwZGF0ZSgpO1xuXG5cdH07XG5cblx0ZnVuY3Rpb24gZ2V0QXV0b1JvdGF0aW9uQW5nbGUoKSB7XG5cblx0XHRyZXR1cm4gMiAqIE1hdGguUEkgLyA2MCAvIDYwICogc2NvcGUuYXV0b1JvdGF0ZVNwZWVkO1xuXG5cdH1cblxuXHRmdW5jdGlvbiBnZXRab29tU2NhbGUoKSB7XG5cblx0XHRyZXR1cm4gTWF0aC5wb3coIDAuOTUsIHNjb3BlLnpvb21TcGVlZCApO1xuXG5cdH1cblxuXHRmdW5jdGlvbiBvbk1vdXNlRG93biggZXZlbnQgKSB7XG5cblx0XHRpZiAoIHNjb3BlLmVuYWJsZWQgPT09IGZhbHNlICkgcmV0dXJuO1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRpZiAoIGV2ZW50LmJ1dHRvbiA9PT0gMCApIHtcblx0XHRcdGlmICggc2NvcGUubm9Sb3RhdGUgPT09IHRydWUgKSByZXR1cm47XG5cblx0XHRcdHN0YXRlID0gU1RBVEUuUk9UQVRFO1xuXG5cdFx0XHRyb3RhdGVTdGFydC5zZXQoIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkgKTtcblxuXHRcdH0gZWxzZSBpZiAoIGV2ZW50LmJ1dHRvbiA9PT0gMSApIHtcblx0XHRcdGlmICggc2NvcGUubm9ab29tID09PSB0cnVlICkgcmV0dXJuO1xuXG5cdFx0XHRzdGF0ZSA9IFNUQVRFLkRPTExZO1xuXG5cdFx0XHRkb2xseVN0YXJ0LnNldCggZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSApO1xuXG5cdFx0fSBlbHNlIGlmICggZXZlbnQuYnV0dG9uID09PSAyICkge1xuXHRcdFx0aWYgKCBzY29wZS5ub1BhbiA9PT0gdHJ1ZSApIHJldHVybjtcblxuXHRcdFx0c3RhdGUgPSBTVEFURS5QQU47XG5cblx0XHRcdHBhblN0YXJ0LnNldCggZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSApO1xuXG5cdFx0fVxuXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlbW92ZScsIG9uTW91c2VNb3ZlLCBmYWxzZSApO1xuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZXVwJywgb25Nb3VzZVVwLCBmYWxzZSApO1xuXHRcdHNjb3BlLmRpc3BhdGNoRXZlbnQoIHN0YXJ0RXZlbnQgKTtcblxuXHR9XG5cblx0ZnVuY3Rpb24gb25Nb3VzZU1vdmUoIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBzY29wZS5lbmFibGVkID09PSBmYWxzZSApIHJldHVybjtcblxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHR2YXIgZWxlbWVudCA9IHNjb3BlLmRvbUVsZW1lbnQgPT09IGRvY3VtZW50ID8gc2NvcGUuZG9tRWxlbWVudC5ib2R5IDogc2NvcGUuZG9tRWxlbWVudDtcblxuXHRcdGlmICggc3RhdGUgPT09IFNUQVRFLlJPVEFURSApIHtcblxuXHRcdFx0aWYgKCBzY29wZS5ub1JvdGF0ZSA9PT0gdHJ1ZSApIHJldHVybjtcblxuXHRcdFx0cm90YXRlRW5kLnNldCggZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSApO1xuXHRcdFx0cm90YXRlRGVsdGEuc3ViVmVjdG9ycyggcm90YXRlRW5kLCByb3RhdGVTdGFydCApO1xuXG5cdFx0XHQvLyByb3RhdGluZyBhY3Jvc3Mgd2hvbGUgc2NyZWVuIGdvZXMgMzYwIGRlZ3JlZXMgYXJvdW5kXG5cdFx0XHRzY29wZS5yb3RhdGVMZWZ0KCAyICogTWF0aC5QSSAqIHJvdGF0ZURlbHRhLnggLyBlbGVtZW50LmNsaWVudFdpZHRoICogc2NvcGUucm90YXRlU3BlZWQgKTtcblxuXHRcdFx0Ly8gcm90YXRpbmcgdXAgYW5kIGRvd24gYWxvbmcgd2hvbGUgc2NyZWVuIGF0dGVtcHRzIHRvIGdvIDM2MCwgYnV0IGxpbWl0ZWQgdG8gMTgwXG5cdFx0XHRzY29wZS5yb3RhdGVVcCggMiAqIE1hdGguUEkgKiByb3RhdGVEZWx0YS55IC8gZWxlbWVudC5jbGllbnRIZWlnaHQgKiBzY29wZS5yb3RhdGVTcGVlZCApO1xuXG5cdFx0XHRyb3RhdGVTdGFydC5jb3B5KCByb3RhdGVFbmQgKTtcblxuXHRcdH0gZWxzZSBpZiAoIHN0YXRlID09PSBTVEFURS5ET0xMWSApIHtcblxuXHRcdFx0aWYgKCBzY29wZS5ub1pvb20gPT09IHRydWUgKSByZXR1cm47XG5cblx0XHRcdGRvbGx5RW5kLnNldCggZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSApO1xuXHRcdFx0ZG9sbHlEZWx0YS5zdWJWZWN0b3JzKCBkb2xseUVuZCwgZG9sbHlTdGFydCApO1xuXG5cdFx0XHRpZiAoIGRvbGx5RGVsdGEueSA+IDAgKSB7XG5cblx0XHRcdFx0c2NvcGUuZG9sbHlJbigpO1xuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdHNjb3BlLmRvbGx5T3V0KCk7XG5cblx0XHRcdH1cblxuXHRcdFx0ZG9sbHlTdGFydC5jb3B5KCBkb2xseUVuZCApO1xuXG5cdFx0fSBlbHNlIGlmICggc3RhdGUgPT09IFNUQVRFLlBBTiApIHtcblxuXHRcdFx0aWYgKCBzY29wZS5ub1BhbiA9PT0gdHJ1ZSApIHJldHVybjtcblxuXHRcdFx0cGFuRW5kLnNldCggZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSApO1xuXHRcdFx0cGFuRGVsdGEuc3ViVmVjdG9ycyggcGFuRW5kLCBwYW5TdGFydCApO1xuXHRcdFx0XG5cdFx0XHRzY29wZS5wYW4oIHBhbkRlbHRhLngsIHBhbkRlbHRhLnkgKTtcblxuXHRcdFx0cGFuU3RhcnQuY29weSggcGFuRW5kICk7XG5cblx0XHR9XG5cblx0XHRzY29wZS51cGRhdGUoKTtcblxuXHR9XG5cblx0ZnVuY3Rpb24gb25Nb3VzZVVwKCAvKiBldmVudCAqLyApIHtcblxuXHRcdGlmICggc2NvcGUuZW5hYmxlZCA9PT0gZmFsc2UgKSByZXR1cm47XG5cblx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUsIGZhbHNlICk7XG5cdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNldXAnLCBvbk1vdXNlVXAsIGZhbHNlICk7XG5cdFx0c2NvcGUuZGlzcGF0Y2hFdmVudCggZW5kRXZlbnQgKTtcblx0XHRzdGF0ZSA9IFNUQVRFLk5PTkU7XG5cblx0fVxuXG5cdGZ1bmN0aW9uIG9uTW91c2VXaGVlbCggZXZlbnQgKSB7XG5cblx0XHRpZiAoIHNjb3BlLmVuYWJsZWQgPT09IGZhbHNlIHx8IHNjb3BlLm5vWm9vbSA9PT0gdHJ1ZSApIHJldHVybjtcblxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHR2YXIgZGVsdGEgPSAwO1xuXG5cdFx0aWYgKCBldmVudC53aGVlbERlbHRhICE9PSB1bmRlZmluZWQgKSB7IC8vIFdlYktpdCAvIE9wZXJhIC8gRXhwbG9yZXIgOVxuXG5cdFx0XHRkZWx0YSA9IGV2ZW50LndoZWVsRGVsdGE7XG5cblx0XHR9IGVsc2UgaWYgKCBldmVudC5kZXRhaWwgIT09IHVuZGVmaW5lZCApIHsgLy8gRmlyZWZveFxuXG5cdFx0XHRkZWx0YSA9IC0gZXZlbnQuZGV0YWlsO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCBkZWx0YSA+IDAgKSB7XG5cblx0XHRcdHNjb3BlLmRvbGx5T3V0KCk7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRzY29wZS5kb2xseUluKCk7XG5cblx0XHR9XG5cblx0XHRzY29wZS51cGRhdGUoKTtcblx0XHRzY29wZS5kaXNwYXRjaEV2ZW50KCBzdGFydEV2ZW50ICk7XG5cdFx0c2NvcGUuZGlzcGF0Y2hFdmVudCggZW5kRXZlbnQgKTtcblxuXHR9XG5cblx0ZnVuY3Rpb24gb25LZXlEb3duKCBldmVudCApIHtcblxuXHRcdGlmICggc2NvcGUuZW5hYmxlZCA9PT0gZmFsc2UgfHwgc2NvcGUubm9LZXlzID09PSB0cnVlIHx8IHNjb3BlLm5vUGFuID09PSB0cnVlICkgcmV0dXJuO1xuXHRcdFxuXHRcdHN3aXRjaCAoIGV2ZW50LmtleUNvZGUgKSB7XG5cblx0XHRcdGNhc2Ugc2NvcGUua2V5cy5VUDpcblx0XHRcdFx0c2NvcGUucGFuKCAwLCBzY29wZS5rZXlQYW5TcGVlZCApO1xuXHRcdFx0XHRzY29wZS51cGRhdGUoKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2Ugc2NvcGUua2V5cy5CT1RUT006XG5cdFx0XHRcdHNjb3BlLnBhbiggMCwgLSBzY29wZS5rZXlQYW5TcGVlZCApO1xuXHRcdFx0XHRzY29wZS51cGRhdGUoKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2Ugc2NvcGUua2V5cy5MRUZUOlxuXHRcdFx0XHRzY29wZS5wYW4oIHNjb3BlLmtleVBhblNwZWVkLCAwICk7XG5cdFx0XHRcdHNjb3BlLnVwZGF0ZSgpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSBzY29wZS5rZXlzLlJJR0hUOlxuXHRcdFx0XHRzY29wZS5wYW4oIC0gc2NvcGUua2V5UGFuU3BlZWQsIDAgKTtcblx0XHRcdFx0c2NvcGUudXBkYXRlKCk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0fVxuXG5cdH1cblxuXHRmdW5jdGlvbiB0b3VjaHN0YXJ0KCBldmVudCApIHtcblxuXHRcdGlmICggc2NvcGUuZW5hYmxlZCA9PT0gZmFsc2UgKSByZXR1cm47XG5cblx0XHRzd2l0Y2ggKCBldmVudC50b3VjaGVzLmxlbmd0aCApIHtcblxuXHRcdFx0Y2FzZSAxOlx0Ly8gb25lLWZpbmdlcmVkIHRvdWNoOiByb3RhdGVcblxuXHRcdFx0XHRpZiAoIHNjb3BlLm5vUm90YXRlID09PSB0cnVlICkgcmV0dXJuO1xuXG5cdFx0XHRcdHN0YXRlID0gU1RBVEUuVE9VQ0hfUk9UQVRFO1xuXG5cdFx0XHRcdHJvdGF0ZVN0YXJ0LnNldCggZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VYLCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgMjpcdC8vIHR3by1maW5nZXJlZCB0b3VjaDogZG9sbHlcblxuXHRcdFx0XHRpZiAoIHNjb3BlLm5vWm9vbSA9PT0gdHJ1ZSApIHJldHVybjtcblxuXHRcdFx0XHRzdGF0ZSA9IFNUQVRFLlRPVUNIX0RPTExZO1xuXG5cdFx0XHRcdHZhciBkeCA9IGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCAtIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWDtcblx0XHRcdFx0dmFyIGR5ID0gZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZIC0gZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VZO1xuXHRcdFx0XHR2YXIgZGlzdGFuY2UgPSBNYXRoLnNxcnQoIGR4ICogZHggKyBkeSAqIGR5ICk7XG5cdFx0XHRcdGRvbGx5U3RhcnQuc2V0KCAwLCBkaXN0YW5jZSApO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAzOiAvLyB0aHJlZS1maW5nZXJlZCB0b3VjaDogcGFuXG5cblx0XHRcdFx0aWYgKCBzY29wZS5ub1BhbiA9PT0gdHJ1ZSApIHJldHVybjtcblxuXHRcdFx0XHRzdGF0ZSA9IFNUQVRFLlRPVUNIX1BBTjtcblxuXHRcdFx0XHRwYW5TdGFydC5zZXQoIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCwgZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZICk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OlxuXG5cdFx0XHRcdHN0YXRlID0gU1RBVEUuTk9ORTtcblxuXHRcdH1cblxuXHRcdHNjb3BlLmRpc3BhdGNoRXZlbnQoIHN0YXJ0RXZlbnQgKTtcblxuXHR9XG5cblx0ZnVuY3Rpb24gdG91Y2htb3ZlKCBldmVudCApIHtcblxuXHRcdGlmICggc2NvcGUuZW5hYmxlZCA9PT0gZmFsc2UgKSByZXR1cm47XG5cblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0dmFyIGVsZW1lbnQgPSBzY29wZS5kb21FbGVtZW50ID09PSBkb2N1bWVudCA/IHNjb3BlLmRvbUVsZW1lbnQuYm9keSA6IHNjb3BlLmRvbUVsZW1lbnQ7XG5cblx0XHRzd2l0Y2ggKCBldmVudC50b3VjaGVzLmxlbmd0aCApIHtcblxuXHRcdFx0Y2FzZSAxOiAvLyBvbmUtZmluZ2VyZWQgdG91Y2g6IHJvdGF0ZVxuXG5cdFx0XHRcdGlmICggc2NvcGUubm9Sb3RhdGUgPT09IHRydWUgKSByZXR1cm47XG5cdFx0XHRcdGlmICggc3RhdGUgIT09IFNUQVRFLlRPVUNIX1JPVEFURSApIHJldHVybjtcblxuXHRcdFx0XHRyb3RhdGVFbmQuc2V0KCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVgsIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSApO1xuXHRcdFx0XHRyb3RhdGVEZWx0YS5zdWJWZWN0b3JzKCByb3RhdGVFbmQsIHJvdGF0ZVN0YXJ0ICk7XG5cblx0XHRcdFx0Ly8gcm90YXRpbmcgYWNyb3NzIHdob2xlIHNjcmVlbiBnb2VzIDM2MCBkZWdyZWVzIGFyb3VuZFxuXHRcdFx0XHRzY29wZS5yb3RhdGVMZWZ0KCAyICogTWF0aC5QSSAqIHJvdGF0ZURlbHRhLnggLyBlbGVtZW50LmNsaWVudFdpZHRoICogc2NvcGUucm90YXRlU3BlZWQgKTtcblx0XHRcdFx0Ly8gcm90YXRpbmcgdXAgYW5kIGRvd24gYWxvbmcgd2hvbGUgc2NyZWVuIGF0dGVtcHRzIHRvIGdvIDM2MCwgYnV0IGxpbWl0ZWQgdG8gMTgwXG5cdFx0XHRcdHNjb3BlLnJvdGF0ZVVwKCAyICogTWF0aC5QSSAqIHJvdGF0ZURlbHRhLnkgLyBlbGVtZW50LmNsaWVudEhlaWdodCAqIHNjb3BlLnJvdGF0ZVNwZWVkICk7XG5cblx0XHRcdFx0cm90YXRlU3RhcnQuY29weSggcm90YXRlRW5kICk7XG5cblx0XHRcdFx0c2NvcGUudXBkYXRlKCk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIDI6IC8vIHR3by1maW5nZXJlZCB0b3VjaDogZG9sbHlcblxuXHRcdFx0XHRpZiAoIHNjb3BlLm5vWm9vbSA9PT0gdHJ1ZSApIHJldHVybjtcblx0XHRcdFx0aWYgKCBzdGF0ZSAhPT0gU1RBVEUuVE9VQ0hfRE9MTFkgKSByZXR1cm47XG5cblx0XHRcdFx0dmFyIGR4ID0gZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VYIC0gZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VYO1xuXHRcdFx0XHR2YXIgZHkgPSBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgLSBldmVudC50b3VjaGVzWyAxIF0ucGFnZVk7XG5cdFx0XHRcdHZhciBkaXN0YW5jZSA9IE1hdGguc3FydCggZHggKiBkeCArIGR5ICogZHkgKTtcblxuXHRcdFx0XHRkb2xseUVuZC5zZXQoIDAsIGRpc3RhbmNlICk7XG5cdFx0XHRcdGRvbGx5RGVsdGEuc3ViVmVjdG9ycyggZG9sbHlFbmQsIGRvbGx5U3RhcnQgKTtcblxuXHRcdFx0XHRpZiAoIGRvbGx5RGVsdGEueSA+IDAgKSB7XG5cblx0XHRcdFx0XHRzY29wZS5kb2xseU91dCgpO1xuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRzY29wZS5kb2xseUluKCk7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGRvbGx5U3RhcnQuY29weSggZG9sbHlFbmQgKTtcblxuXHRcdFx0XHRzY29wZS51cGRhdGUoKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgMzogLy8gdGhyZWUtZmluZ2VyZWQgdG91Y2g6IHBhblxuXG5cdFx0XHRcdGlmICggc2NvcGUubm9QYW4gPT09IHRydWUgKSByZXR1cm47XG5cdFx0XHRcdGlmICggc3RhdGUgIT09IFNUQVRFLlRPVUNIX1BBTiApIHJldHVybjtcblxuXHRcdFx0XHRwYW5FbmQuc2V0KCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVgsIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSApO1xuXHRcdFx0XHRwYW5EZWx0YS5zdWJWZWN0b3JzKCBwYW5FbmQsIHBhblN0YXJ0ICk7XG5cdFx0XHRcdFxuXHRcdFx0XHRzY29wZS5wYW4oIHBhbkRlbHRhLngsIHBhbkRlbHRhLnkgKTtcblxuXHRcdFx0XHRwYW5TdGFydC5jb3B5KCBwYW5FbmQgKTtcblxuXHRcdFx0XHRzY29wZS51cGRhdGUoKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGRlZmF1bHQ6XG5cblx0XHRcdFx0c3RhdGUgPSBTVEFURS5OT05FO1xuXG5cdFx0fVxuXG5cdH1cblxuXHRmdW5jdGlvbiB0b3VjaGVuZCggLyogZXZlbnQgKi8gKSB7XG5cblx0XHRpZiAoIHNjb3BlLmVuYWJsZWQgPT09IGZhbHNlICkgcmV0dXJuO1xuXG5cdFx0c2NvcGUuZGlzcGF0Y2hFdmVudCggZW5kRXZlbnQgKTtcblx0XHRzdGF0ZSA9IFNUQVRFLk5PTkU7XG5cblx0fVxuXG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnY29udGV4dG1lbnUnLCBmdW5jdGlvbiAoIGV2ZW50ICkgeyBldmVudC5wcmV2ZW50RGVmYXVsdCgpOyB9LCBmYWxzZSApO1xuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlZG93bicsIG9uTW91c2VEb3duLCBmYWxzZSApO1xuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNld2hlZWwnLCBvbk1vdXNlV2hlZWwsIGZhbHNlICk7XG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnRE9NTW91c2VTY3JvbGwnLCBvbk1vdXNlV2hlZWwsIGZhbHNlICk7IC8vIGZpcmVmb3hcblxuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCB0b3VjaHN0YXJ0LCBmYWxzZSApO1xuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoZW5kJywgdG91Y2hlbmQsIGZhbHNlICk7XG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAndG91Y2htb3ZlJywgdG91Y2htb3ZlLCBmYWxzZSApO1xuXG5cdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIG9uS2V5RG93biwgZmFsc2UgKTtcblxuXHQvLyBmb3JjZSBhbiB1cGRhdGUgYXQgc3RhcnRcblx0dGhpcy51cGRhdGUoKTtcblxufTtcblxuVEhSRUUuT3JiaXRDb250cm9scy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUSFJFRS5FdmVudERpc3BhdGNoZXIucHJvdG90eXBlICk7XG4iLCIvKipcbiAqIEBtb2R1bGUgIGxpYi9USFJFRXgvRnVsbFNjcmVlblxuICovXG5cbi8qKlxuKiBUaGlzIGhlbHBlciBtYWtlcyBpdCBlYXN5IHRvIGhhbmRsZSB0aGUgZnVsbHNjcmVlbiBBUEk6XG4qIFxuKiAtIGl0IGhpZGVzIHRoZSBwcmVmaXggZm9yIGVhY2ggYnJvd3NlclxuKiAtIGl0IGhpZGVzIHRoZSBsaXR0bGUgZGlzY3JlcGVuY2llcyBvZiB0aGUgdmFyaW91cyB2ZW5kb3IgQVBJXG4qIC0gYXQgdGhlIHRpbWUgb2YgdGhpcyB3cml0aW5nIChub3YgMjAxMSkgaXQgaXMgYXZhaWxhYmxlIGluIFxuKiBcbiogICBbZmlyZWZveCBuaWdodGx5XShodHRwOi8vYmxvZy5wZWFyY2Uub3JnLm56LzIwMTEvMTEvZmlyZWZveHMtaHRtbC1mdWxsLXNjcmVlbi1hcGktZW5hYmxlZC5odG1sKSxcbiogICBbd2Via2l0IG5pZ2h0bHldKGh0dHA6Ly9wZXRlci5zaC8yMDExLzAxL2phdmFzY3JpcHQtZnVsbC1zY3JlZW4tYXBpLW5hdmlnYXRpb24tdGltaW5nLWFuZC1yZXBlYXRpbmctY3NzLWdyYWRpZW50cy8pIGFuZFxuKiAgIFtjaHJvbWUgc3RhYmxlXShodHRwOi8vdXBkYXRlcy5odG1sNXJvY2tzLmNvbS8yMDExLzEwL0xldC1Zb3VyLUNvbnRlbnQtRG8tdGhlLVRhbGtpbmctRnVsbHNjcmVlbi1BUEkpLlxuKiBcbiogQG5hbWVzcGFjZVxuKi9cbnZhciBmdWxsU2NyZWVuID0ge307XG5cbi8qKlxuICogdGVzdCBpZiBpdCBpcyBwb3NzaWJsZSB0byBoYXZlIGZ1bGxzY3JlZW5cbiAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIGZ1bGxzY3JlZW4gQVBJIGlzIGF2YWlsYWJsZSwgZmFsc2Ugb3RoZXJ3aXNlXG4gKi9cbmZ1bGxTY3JlZW4uYXZhaWxhYmxlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5faGFzV2Via2l0RnVsbFNjcmVlbiB8fCB0aGlzLl9oYXNNb3pGdWxsU2NyZWVuO1xufTtcblxuLyoqXG4gKiBUZXN0IGlmIGZ1bGxzY3JlZW4gaXMgY3VycmVudGx5IGFjdGl2YXRlZFxuICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgZnVsbHNjcmVlbiBpcyBjdXJyZW50bHkgYWN0aXZhdGVkLCBmYWxzZSBvdGhlcndpc2VcbiAqL1xuZnVsbFNjcmVlbi5hY3RpdmF0ZWQgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLl9oYXNXZWJraXRGdWxsU2NyZWVuKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LndlYmtpdElzRnVsbFNjcmVlbjtcbiAgfSBlbHNlIGlmICh0aGlzLl9oYXNNb3pGdWxsU2NyZWVuKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50Lm1vekZ1bGxTY3JlZW47XG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5hc3NlcnQoZmFsc2UpO1xuICB9XG59O1xuXG4vKipcbiAqIFJlcXVlc3QgZnVsbHNjcmVlbiBvbiBhIGdpdmVuIGVsZW1lbnRcbiAqIEBwYXJhbSB7RG9tRWxlbWVudH0gZWxlbWVudCB0byBtYWtlIGZ1bGxzY3JlZW4uIG9wdGlvbmFsLiBkZWZhdWx0IHRvIGRvY3VtZW50LmJvZHlcbiAqL1xuZnVsbFNjcmVlbi5yZXF1ZXN0ID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgZWxlbWVudCA9IGVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keTtcbiAgaWYgKHRoaXMuX2hhc1dlYmtpdEZ1bGxTY3JlZW4pIHtcbiAgICBlbGVtZW50LndlYmtpdFJlcXVlc3RGdWxsU2NyZWVuKEVsZW1lbnQuQUxMT1dfS0VZQk9BUkRfSU5QVVQpO1xuICB9IGVsc2UgaWYgKHRoaXMuX2hhc01vekZ1bGxTY3JlZW4pIHtcbiAgICBlbGVtZW50Lm1velJlcXVlc3RGdWxsU2NyZWVuKCk7XG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5hc3NlcnQoZmFsc2UpO1xuICB9XG59O1xuXG4vKipcbiAqIENhbmNlbCBmdWxsc2NyZWVuXG4gKi9cbmZ1bGxTY3JlZW4uY2FuY2VsID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5faGFzV2Via2l0RnVsbFNjcmVlbikge1xuICAgIGRvY3VtZW50LndlYmtpdENhbmNlbEZ1bGxTY3JlZW4oKTtcbiAgfSBlbHNlIGlmICh0aGlzLl9oYXNNb3pGdWxsU2NyZWVuKSB7XG4gICAgZG9jdW1lbnQubW96Q2FuY2VsRnVsbFNjcmVlbigpO1xuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUuYXNzZXJ0KGZhbHNlKTtcbiAgfVxufTtcblxuXG4vLyBpbnRlcm5hbCBmdW5jdGlvbnMgdG8ga25vdyB3aGljaCBmdWxsc2NyZWVuIEFQSSBpbXBsZW1lbnRhdGlvbiBpcyBhdmFpbGFibGVcbmZ1bGxTY3JlZW4uX2hhc1dlYmtpdEZ1bGxTY3JlZW4gPSAnd2Via2l0Q2FuY2VsRnVsbFNjcmVlbicgaW4gZG9jdW1lbnQgPyB0cnVlIDogZmFsc2U7XG5mdWxsU2NyZWVuLl9oYXNNb3pGdWxsU2NyZWVuID0gJ21vekNhbmNlbEZ1bGxTY3JlZW4nIGluIGRvY3VtZW50ID8gdHJ1ZSA6IGZhbHNlO1xuXG4vKipcbiAqIEJpbmQgYSBrZXkgdG8gcmVuZGVyZXIgc2NyZWVuc2hvdFxuICogQHBhcmFtIHtPYmplY3R9IG9wdHNcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0cy5jaGFyY29kZT1mXVxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRzLmRibENsaWNrPWZhbHNlXSBUcnVlIHRvIG1ha2UgaXQgZ29cbiAqIGZ1bGxzY3JlZW4gb24gZG91YmxlIGNsaWNrXG4gKi9cbmZ1bGxTY3JlZW4uYmluZEtleSA9IGZ1bmN0aW9uIChvcHRzKSB7XG4gIG9wdHMgPSBvcHRzIHx8IHt9O1xuICB2YXIgY2hhckNvZGUgPSBvcHRzLmNoYXJDb2RlIHx8ICdmJy5jaGFyQ29kZUF0KDApO1xuICB2YXIgZGJsY2xpY2sgPSBvcHRzLmRibGNsaWNrICE9PSB1bmRlZmluZWQgPyBvcHRzLmRibGNsaWNrIDogZmFsc2U7XG4gIHZhciBlbGVtZW50ID0gb3B0cy5lbGVtZW50O1xuXG4gIHZhciB0b2dnbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKGZ1bGxTY3JlZW4uYWN0aXZhdGVkKCkpIHtcbiAgICAgIGZ1bGxTY3JlZW4uY2FuY2VsKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZ1bGxTY3JlZW4ucmVxdWVzdChlbGVtZW50KTtcbiAgICB9XG4gIH07XG5cbiAgLy8gY2FsbGJhY2sgdG8gaGFuZGxlIGtleXByZXNzXG4gIHZhciBfX2JpbmQgPSBmdW5jdGlvbiAoZm4sIG1lKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9O1xuICB2YXIgb25LZXlQcmVzcyA9IF9fYmluZChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAvLyByZXR1cm4gbm93IGlmIHRoZSBLZXlQcmVzcyBpc250IGZvciB0aGUgcHJvcGVyIGNoYXJDb2RlXG4gICAgaWYgKGV2ZW50LndoaWNoICE9PSBjaGFyQ29kZSkgeyByZXR1cm47IH1cbiAgICAvLyB0b2dnbGUgZnVsbHNjcmVlblxuICAgIHRvZ2dsZSgpO1xuICB9LCB0aGlzKTtcblxuICAvLyBsaXN0ZW4gdG8ga2V5cHJlc3NcbiAgLy8gTk9URTogZm9yIGZpcmVmb3ggaXQgc2VlbXMgbWFuZGF0b3J5IHRvIGxpc3RlbiB0byBkb2N1bWVudCBkaXJlY3RseVxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlwcmVzcycsIG9uS2V5UHJlc3MsIGZhbHNlKTtcbiAgLy8gbGlzdGVuIHRvIGRibGNsaWNrXG4gIGRibGNsaWNrICYmIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RibGNsaWNrJywgdG9nZ2xlLCBmYWxzZSk7XG5cbiAgcmV0dXJuIHtcbiAgICB1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleXByZXNzJywgb25LZXlQcmVzcywgZmFsc2UpO1xuICAgICAgZGJsY2xpY2sgJiYgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZGJsY2xpY2snLCB0b2dnbGUsIGZhbHNlKTtcbiAgICB9XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bGxTY3JlZW47IiwiLyoqXG4gKiBAbW9kdWxlICBsaWIvVEhSRUV4L1dpbmRvd1Jlc2l6ZVxuICovXG5cbi8qKlxuICogVGhpcyBoZWxwZXIgbWFrZXMgaXQgZWFzeSB0byBoYW5kbGUgd2luZG93IHJlc2l6ZS5cbiAqIEl0IHdpbGwgdXBkYXRlIHJlbmRlcmVyIGFuZCBjYW1lcmEgd2hlbiB3aW5kb3cgaXMgcmVzaXplZC5cbiAqXG4gKiBAZXhhbXBsZVxuICogLy8gU3RhcnQgdXBkYXRpbmcgcmVuZGVyZXIgYW5kIGNhbWVyYVxuICogdmFyIHdpbmRvd1Jlc2l6ZSA9IFdpbmRvd1Jlc2l6ZShhUmVuZGVyZXIsIGFDYW1lcmEpO1xuICogLy9TdGFydCB1cGRhdGluZyByZW5kZXJlciBhbmQgY2FtZXJhXG4gKiB3aW5kb3dSZXNpemUuc3RvcCgpXG4gKlxuICogQG5hbWVzcGFjZVxuICogQHBhcmFtIHtPYmplY3R9IHJlbmRlcmVyIHRoZSByZW5kZXJlciB0byB1cGRhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBDYW1lcmEgdGhlIGNhbWVyYSB0byB1cGRhdGVcbiAqL1xudmFyIHdpbmRvd1Jlc2l6ZSA9IGZ1bmN0aW9uIChyZW5kZXJlciwgY2FtZXJhKSB7XG5cdHZhciBjYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xuXHRcdC8vIG5vdGlmeSB0aGUgcmVuZGVyZXIgb2YgdGhlIHNpemUgY2hhbmdlXG5cdFx0cmVuZGVyZXIuc2V0U2l6ZSggd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCApO1xuXHRcdC8vIHVwZGF0ZSB0aGUgY2FtZXJhXG5cdFx0Y2FtZXJhLmFzcGVjdFx0PSB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodDtcblx0XHRjYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuXHR9O1xuXHQvLyBiaW5kIHRoZSByZXNpemUgZXZlbnRcblx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGNhbGxiYWNrLCBmYWxzZSk7XG5cdC8vIHJldHVybiAuc3RvcCgpIHRoZSBmdW5jdGlvbiB0byBzdG9wIHdhdGNoaW5nIHdpbmRvdyByZXNpemVcblx0cmV0dXJuIHtcblx0XHRzdG9wXHQ6IGZ1bmN0aW9uKCl7XG5cdFx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgY2FsbGJhY2spO1xuXHRcdH1cblx0fTtcbn07XG5cbi8qKlxuICogQHN0YXRpY1xuICogQHBhcmFtICB7VEhSRUUuV2ViR0xSZW5kZXJlcn0gcmVuZGVyZXJcbiAqIEBwYXJhbSAge1RIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhfSBjYW1lcmFcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xud2luZG93UmVzaXplLmJpbmRcdD0gZnVuY3Rpb24ocmVuZGVyZXIsIGNhbWVyYSl7XG5cdHJldHVybiB3aW5kb3dSZXNpemUocmVuZGVyZXIsIGNhbWVyYSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHdpbmRvd1Jlc2l6ZTsiLCIvKipcbiAqIEBuYW1lIFRIUkVFeFxuICogdGhyZWUuanMgZXh0ZW5zaW9uc1xuICogQHR5cGUge09iamVjdH1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFdpbmRvd1Jlc2l6ZTogcmVxdWlyZSgnLi9XaW5kb3dSZXNpemUnKSxcbiAgRnVsbFNjcmVlbjogcmVxdWlyZSgnLi9GdWxsU2NyZWVuJylcbn07IiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuO19fYnJvd3NlcmlmeV9zaGltX3JlcXVpcmVfXz1yZXF1aXJlOyhmdW5jdGlvbiBicm93c2VyaWZ5U2hpbShtb2R1bGUsIGV4cG9ydHMsIHJlcXVpcmUsIGRlZmluZSwgYnJvd3NlcmlmeV9zaGltX19kZWZpbmVfX21vZHVsZV9fZXhwb3J0X18pIHtcbi8qKlxuICogZGF0LWd1aSBKYXZhU2NyaXB0IENvbnRyb2xsZXIgTGlicmFyeVxuICogaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL2RhdC1ndWlcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMSBEYXRhIEFydHMgVGVhbSwgR29vZ2xlIENyZWF0aXZlIExhYlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqL1xudmFyIGRhdD1kYXR8fHt9O2RhdC5ndWk9ZGF0Lmd1aXx8e307ZGF0LnV0aWxzPWRhdC51dGlsc3x8e307ZGF0LmNvbnRyb2xsZXJzPWRhdC5jb250cm9sbGVyc3x8e307ZGF0LmRvbT1kYXQuZG9tfHx7fTtkYXQuY29sb3I9ZGF0LmNvbG9yfHx7fTtkYXQudXRpbHMuY3NzPWZ1bmN0aW9uKCl7cmV0dXJue2xvYWQ6ZnVuY3Rpb24oZSxhKXt2YXIgYT1hfHxkb2N1bWVudCxjPWEuY3JlYXRlRWxlbWVudChcImxpbmtcIik7Yy50eXBlPVwidGV4dC9jc3NcIjtjLnJlbD1cInN0eWxlc2hlZXRcIjtjLmhyZWY9ZTthLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaGVhZFwiKVswXS5hcHBlbmRDaGlsZChjKX0saW5qZWN0OmZ1bmN0aW9uKGUsYSl7dmFyIGE9YXx8ZG9jdW1lbnQsYz1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7Yy50eXBlPVwidGV4dC9jc3NcIjtjLmlubmVySFRNTD1lO2EuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJoZWFkXCIpWzBdLmFwcGVuZENoaWxkKGMpfX19KCk7XG5kYXQudXRpbHMuY29tbW9uPWZ1bmN0aW9uKCl7dmFyIGU9QXJyYXkucHJvdG90eXBlLmZvckVhY2gsYT1BcnJheS5wcm90b3R5cGUuc2xpY2U7cmV0dXJue0JSRUFLOnt9LGV4dGVuZDpmdW5jdGlvbihjKXt0aGlzLmVhY2goYS5jYWxsKGFyZ3VtZW50cywxKSxmdW5jdGlvbihhKXtmb3IodmFyIGYgaW4gYSl0aGlzLmlzVW5kZWZpbmVkKGFbZl0pfHwoY1tmXT1hW2ZdKX0sdGhpcyk7cmV0dXJuIGN9LGRlZmF1bHRzOmZ1bmN0aW9uKGMpe3RoaXMuZWFjaChhLmNhbGwoYXJndW1lbnRzLDEpLGZ1bmN0aW9uKGEpe2Zvcih2YXIgZiBpbiBhKXRoaXMuaXNVbmRlZmluZWQoY1tmXSkmJihjW2ZdPWFbZl0pfSx0aGlzKTtyZXR1cm4gY30sY29tcG9zZTpmdW5jdGlvbigpe3ZhciBjPWEuY2FsbChhcmd1bWVudHMpO3JldHVybiBmdW5jdGlvbigpe2Zvcih2YXIgZD1hLmNhbGwoYXJndW1lbnRzKSxmPWMubGVuZ3RoLTE7Zj49MDtmLS0pZD1bY1tmXS5hcHBseSh0aGlzLGQpXTtyZXR1cm4gZFswXX19LFxuZWFjaDpmdW5jdGlvbihhLGQsZil7aWYoZSYmYS5mb3JFYWNoPT09ZSlhLmZvckVhY2goZCxmKTtlbHNlIGlmKGEubGVuZ3RoPT09YS5sZW5ndGgrMClmb3IodmFyIGI9MCxuPWEubGVuZ3RoO2I8bjtiKyspe2lmKGIgaW4gYSYmZC5jYWxsKGYsYVtiXSxiKT09PXRoaXMuQlJFQUspYnJlYWt9ZWxzZSBmb3IoYiBpbiBhKWlmKGQuY2FsbChmLGFbYl0sYik9PT10aGlzLkJSRUFLKWJyZWFrfSxkZWZlcjpmdW5jdGlvbihhKXtzZXRUaW1lb3V0KGEsMCl9LHRvQXJyYXk6ZnVuY3Rpb24oYyl7cmV0dXJuIGMudG9BcnJheT9jLnRvQXJyYXkoKTphLmNhbGwoYyl9LGlzVW5kZWZpbmVkOmZ1bmN0aW9uKGEpe3JldHVybiBhPT09dm9pZCAwfSxpc051bGw6ZnVuY3Rpb24oYSl7cmV0dXJuIGE9PT1udWxsfSxpc05hTjpmdW5jdGlvbihhKXtyZXR1cm4gYSE9PWF9LGlzQXJyYXk6QXJyYXkuaXNBcnJheXx8ZnVuY3Rpb24oYSl7cmV0dXJuIGEuY29uc3RydWN0b3I9PT1BcnJheX0saXNPYmplY3Q6ZnVuY3Rpb24oYSl7cmV0dXJuIGE9PT1cbk9iamVjdChhKX0saXNOdW1iZXI6ZnVuY3Rpb24oYSl7cmV0dXJuIGE9PT1hKzB9LGlzU3RyaW5nOmZ1bmN0aW9uKGEpe3JldHVybiBhPT09YStcIlwifSxpc0Jvb2xlYW46ZnVuY3Rpb24oYSl7cmV0dXJuIGE9PT1mYWxzZXx8YT09PXRydWV9LGlzRnVuY3Rpb246ZnVuY3Rpb24oYSl7cmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhKT09PVwiW29iamVjdCBGdW5jdGlvbl1cIn19fSgpO1xuZGF0LmNvbnRyb2xsZXJzLkNvbnRyb2xsZXI9ZnVuY3Rpb24oZSl7dmFyIGE9ZnVuY3Rpb24oYSxkKXt0aGlzLmluaXRpYWxWYWx1ZT1hW2RdO3RoaXMuZG9tRWxlbWVudD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO3RoaXMub2JqZWN0PWE7dGhpcy5wcm9wZXJ0eT1kO3RoaXMuX19vbkZpbmlzaENoYW5nZT10aGlzLl9fb25DaGFuZ2U9dm9pZCAwfTtlLmV4dGVuZChhLnByb3RvdHlwZSx7b25DaGFuZ2U6ZnVuY3Rpb24oYSl7dGhpcy5fX29uQ2hhbmdlPWE7cmV0dXJuIHRoaXN9LG9uRmluaXNoQ2hhbmdlOmZ1bmN0aW9uKGEpe3RoaXMuX19vbkZpbmlzaENoYW5nZT1hO3JldHVybiB0aGlzfSxzZXRWYWx1ZTpmdW5jdGlvbihhKXt0aGlzLm9iamVjdFt0aGlzLnByb3BlcnR5XT1hO3RoaXMuX19vbkNoYW5nZSYmdGhpcy5fX29uQ2hhbmdlLmNhbGwodGhpcyxhKTt0aGlzLnVwZGF0ZURpc3BsYXkoKTtyZXR1cm4gdGhpc30sZ2V0VmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5vYmplY3RbdGhpcy5wcm9wZXJ0eV19LFxudXBkYXRlRGlzcGxheTpmdW5jdGlvbigpe3JldHVybiB0aGlzfSxpc01vZGlmaWVkOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuaW5pdGlhbFZhbHVlIT09dGhpcy5nZXRWYWx1ZSgpfX0pO3JldHVybiBhfShkYXQudXRpbHMuY29tbW9uKTtcbmRhdC5kb20uZG9tPWZ1bmN0aW9uKGUpe2Z1bmN0aW9uIGEoYil7aWYoYj09PVwiMFwifHxlLmlzVW5kZWZpbmVkKGIpKXJldHVybiAwO2I9Yi5tYXRjaChkKTtyZXR1cm4hZS5pc051bGwoYik/cGFyc2VGbG9hdChiWzFdKTowfXZhciBjPXt9O2UuZWFjaCh7SFRNTEV2ZW50czpbXCJjaGFuZ2VcIl0sTW91c2VFdmVudHM6W1wiY2xpY2tcIixcIm1vdXNlbW92ZVwiLFwibW91c2Vkb3duXCIsXCJtb3VzZXVwXCIsXCJtb3VzZW92ZXJcIl0sS2V5Ym9hcmRFdmVudHM6W1wia2V5ZG93blwiXX0sZnVuY3Rpb24oYixhKXtlLmVhY2goYixmdW5jdGlvbihiKXtjW2JdPWF9KX0pO3ZhciBkPS8oXFxkKyhcXC5cXGQrKT8pcHgvLGY9e21ha2VTZWxlY3RhYmxlOmZ1bmN0aW9uKGIsYSl7aWYoIShiPT09dm9pZCAwfHxiLnN0eWxlPT09dm9pZCAwKSliLm9uc2VsZWN0c3RhcnQ9YT9mdW5jdGlvbigpe3JldHVybiBmYWxzZX06ZnVuY3Rpb24oKXt9LGIuc3R5bGUuTW96VXNlclNlbGVjdD1hP1wiYXV0b1wiOlwibm9uZVwiLGIuc3R5bGUuS2h0bWxVc2VyU2VsZWN0PVxuYT9cImF1dG9cIjpcIm5vbmVcIixiLnVuc2VsZWN0YWJsZT1hP1wib25cIjpcIm9mZlwifSxtYWtlRnVsbHNjcmVlbjpmdW5jdGlvbihiLGEsZCl7ZS5pc1VuZGVmaW5lZChhKSYmKGE9dHJ1ZSk7ZS5pc1VuZGVmaW5lZChkKSYmKGQ9dHJ1ZSk7Yi5zdHlsZS5wb3NpdGlvbj1cImFic29sdXRlXCI7aWYoYSliLnN0eWxlLmxlZnQ9MCxiLnN0eWxlLnJpZ2h0PTA7aWYoZCliLnN0eWxlLnRvcD0wLGIuc3R5bGUuYm90dG9tPTB9LGZha2VFdmVudDpmdW5jdGlvbihiLGEsZCxmKXt2YXIgZD1kfHx7fSxtPWNbYV07aWYoIW0pdGhyb3cgRXJyb3IoXCJFdmVudCB0eXBlIFwiK2ErXCIgbm90IHN1cHBvcnRlZC5cIik7dmFyIGw9ZG9jdW1lbnQuY3JlYXRlRXZlbnQobSk7c3dpdGNoKG0pe2Nhc2UgXCJNb3VzZUV2ZW50c1wiOmwuaW5pdE1vdXNlRXZlbnQoYSxkLmJ1YmJsZXN8fGZhbHNlLGQuY2FuY2VsYWJsZXx8dHJ1ZSx3aW5kb3csZC5jbGlja0NvdW50fHwxLDAsMCxkLnh8fGQuY2xpZW50WHx8MCxkLnl8fGQuY2xpZW50WXx8XG4wLGZhbHNlLGZhbHNlLGZhbHNlLGZhbHNlLDAsbnVsbCk7YnJlYWs7Y2FzZSBcIktleWJvYXJkRXZlbnRzXCI6bT1sLmluaXRLZXlib2FyZEV2ZW50fHxsLmluaXRLZXlFdmVudDtlLmRlZmF1bHRzKGQse2NhbmNlbGFibGU6dHJ1ZSxjdHJsS2V5OmZhbHNlLGFsdEtleTpmYWxzZSxzaGlmdEtleTpmYWxzZSxtZXRhS2V5OmZhbHNlLGtleUNvZGU6dm9pZCAwLGNoYXJDb2RlOnZvaWQgMH0pO20oYSxkLmJ1YmJsZXN8fGZhbHNlLGQuY2FuY2VsYWJsZSx3aW5kb3csZC5jdHJsS2V5LGQuYWx0S2V5LGQuc2hpZnRLZXksZC5tZXRhS2V5LGQua2V5Q29kZSxkLmNoYXJDb2RlKTticmVhaztkZWZhdWx0OmwuaW5pdEV2ZW50KGEsZC5idWJibGVzfHxmYWxzZSxkLmNhbmNlbGFibGV8fHRydWUpfWUuZGVmYXVsdHMobCxmKTtiLmRpc3BhdGNoRXZlbnQobCl9LGJpbmQ6ZnVuY3Rpb24oYixhLGQsYyl7Yi5hZGRFdmVudExpc3RlbmVyP2IuYWRkRXZlbnRMaXN0ZW5lcihhLGQsY3x8ZmFsc2UpOmIuYXR0YWNoRXZlbnQmJlxuYi5hdHRhY2hFdmVudChcIm9uXCIrYSxkKTtyZXR1cm4gZn0sdW5iaW5kOmZ1bmN0aW9uKGIsYSxkLGMpe2IucmVtb3ZlRXZlbnRMaXN0ZW5lcj9iLnJlbW92ZUV2ZW50TGlzdGVuZXIoYSxkLGN8fGZhbHNlKTpiLmRldGFjaEV2ZW50JiZiLmRldGFjaEV2ZW50KFwib25cIithLGQpO3JldHVybiBmfSxhZGRDbGFzczpmdW5jdGlvbihiLGEpe2lmKGIuY2xhc3NOYW1lPT09dm9pZCAwKWIuY2xhc3NOYW1lPWE7ZWxzZSBpZihiLmNsYXNzTmFtZSE9PWEpe3ZhciBkPWIuY2xhc3NOYW1lLnNwbGl0KC8gKy8pO2lmKGQuaW5kZXhPZihhKT09LTEpZC5wdXNoKGEpLGIuY2xhc3NOYW1lPWQuam9pbihcIiBcIikucmVwbGFjZSgvXlxccysvLFwiXCIpLnJlcGxhY2UoL1xccyskLyxcIlwiKX1yZXR1cm4gZn0scmVtb3ZlQ2xhc3M6ZnVuY3Rpb24oYixhKXtpZihhKXtpZihiLmNsYXNzTmFtZSE9PXZvaWQgMClpZihiLmNsYXNzTmFtZT09PWEpYi5yZW1vdmVBdHRyaWJ1dGUoXCJjbGFzc1wiKTtlbHNle3ZhciBkPWIuY2xhc3NOYW1lLnNwbGl0KC8gKy8pLFxuYz1kLmluZGV4T2YoYSk7aWYoYyE9LTEpZC5zcGxpY2UoYywxKSxiLmNsYXNzTmFtZT1kLmpvaW4oXCIgXCIpfX1lbHNlIGIuY2xhc3NOYW1lPXZvaWQgMDtyZXR1cm4gZn0saGFzQ2xhc3M6ZnVuY3Rpb24oYSxkKXtyZXR1cm4gUmVnRXhwKFwiKD86XnxcXFxccyspXCIrZCtcIig/OlxcXFxzK3wkKVwiKS50ZXN0KGEuY2xhc3NOYW1lKXx8ZmFsc2V9LGdldFdpZHRoOmZ1bmN0aW9uKGIpe2I9Z2V0Q29tcHV0ZWRTdHlsZShiKTtyZXR1cm4gYShiW1wiYm9yZGVyLWxlZnQtd2lkdGhcIl0pK2EoYltcImJvcmRlci1yaWdodC13aWR0aFwiXSkrYShiW1wicGFkZGluZy1sZWZ0XCJdKSthKGJbXCJwYWRkaW5nLXJpZ2h0XCJdKSthKGIud2lkdGgpfSxnZXRIZWlnaHQ6ZnVuY3Rpb24oYil7Yj1nZXRDb21wdXRlZFN0eWxlKGIpO3JldHVybiBhKGJbXCJib3JkZXItdG9wLXdpZHRoXCJdKSthKGJbXCJib3JkZXItYm90dG9tLXdpZHRoXCJdKSthKGJbXCJwYWRkaW5nLXRvcFwiXSkrYShiW1wicGFkZGluZy1ib3R0b21cIl0pK2EoYi5oZWlnaHQpfSxcbmdldE9mZnNldDpmdW5jdGlvbihhKXt2YXIgZD17bGVmdDowLHRvcDowfTtpZihhLm9mZnNldFBhcmVudCl7ZG8gZC5sZWZ0Kz1hLm9mZnNldExlZnQsZC50b3ArPWEub2Zmc2V0VG9wO3doaWxlKGE9YS5vZmZzZXRQYXJlbnQpfXJldHVybiBkfSxpc0FjdGl2ZTpmdW5jdGlvbihhKXtyZXR1cm4gYT09PWRvY3VtZW50LmFjdGl2ZUVsZW1lbnQmJihhLnR5cGV8fGEuaHJlZil9fTtyZXR1cm4gZn0oZGF0LnV0aWxzLmNvbW1vbik7XG5kYXQuY29udHJvbGxlcnMuT3B0aW9uQ29udHJvbGxlcj1mdW5jdGlvbihlLGEsYyl7dmFyIGQ9ZnVuY3Rpb24oZixiLGUpe2Quc3VwZXJjbGFzcy5jYWxsKHRoaXMsZixiKTt2YXIgaD10aGlzO3RoaXMuX19zZWxlY3Q9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNlbGVjdFwiKTtpZihjLmlzQXJyYXkoZSkpe3ZhciBqPXt9O2MuZWFjaChlLGZ1bmN0aW9uKGEpe2pbYV09YX0pO2U9an1jLmVhY2goZSxmdW5jdGlvbihhLGIpe3ZhciBkPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJvcHRpb25cIik7ZC5pbm5lckhUTUw9YjtkLnNldEF0dHJpYnV0ZShcInZhbHVlXCIsYSk7aC5fX3NlbGVjdC5hcHBlbmRDaGlsZChkKX0pO3RoaXMudXBkYXRlRGlzcGxheSgpO2EuYmluZCh0aGlzLl9fc2VsZWN0LFwiY2hhbmdlXCIsZnVuY3Rpb24oKXtoLnNldFZhbHVlKHRoaXMub3B0aW9uc1t0aGlzLnNlbGVjdGVkSW5kZXhdLnZhbHVlKX0pO3RoaXMuZG9tRWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLl9fc2VsZWN0KX07XG5kLnN1cGVyY2xhc3M9ZTtjLmV4dGVuZChkLnByb3RvdHlwZSxlLnByb3RvdHlwZSx7c2V0VmFsdWU6ZnVuY3Rpb24oYSl7YT1kLnN1cGVyY2xhc3MucHJvdG90eXBlLnNldFZhbHVlLmNhbGwodGhpcyxhKTt0aGlzLl9fb25GaW5pc2hDaGFuZ2UmJnRoaXMuX19vbkZpbmlzaENoYW5nZS5jYWxsKHRoaXMsdGhpcy5nZXRWYWx1ZSgpKTtyZXR1cm4gYX0sdXBkYXRlRGlzcGxheTpmdW5jdGlvbigpe3RoaXMuX19zZWxlY3QudmFsdWU9dGhpcy5nZXRWYWx1ZSgpO3JldHVybiBkLnN1cGVyY2xhc3MucHJvdG90eXBlLnVwZGF0ZURpc3BsYXkuY2FsbCh0aGlzKX19KTtyZXR1cm4gZH0oZGF0LmNvbnRyb2xsZXJzLkNvbnRyb2xsZXIsZGF0LmRvbS5kb20sZGF0LnV0aWxzLmNvbW1vbik7XG5kYXQuY29udHJvbGxlcnMuTnVtYmVyQ29udHJvbGxlcj1mdW5jdGlvbihlLGEpe3ZhciBjPWZ1bmN0aW9uKGQsZixiKXtjLnN1cGVyY2xhc3MuY2FsbCh0aGlzLGQsZik7Yj1ifHx7fTt0aGlzLl9fbWluPWIubWluO3RoaXMuX19tYXg9Yi5tYXg7dGhpcy5fX3N0ZXA9Yi5zdGVwO2Q9dGhpcy5fX2ltcGxpZWRTdGVwPWEuaXNVbmRlZmluZWQodGhpcy5fX3N0ZXApP3RoaXMuaW5pdGlhbFZhbHVlPT0wPzE6TWF0aC5wb3coMTAsTWF0aC5mbG9vcihNYXRoLmxvZyh0aGlzLmluaXRpYWxWYWx1ZSkvTWF0aC5MTjEwKSkvMTA6dGhpcy5fX3N0ZXA7ZD1kLnRvU3RyaW5nKCk7dGhpcy5fX3ByZWNpc2lvbj1kLmluZGV4T2YoXCIuXCIpPi0xP2QubGVuZ3RoLWQuaW5kZXhPZihcIi5cIiktMTowfTtjLnN1cGVyY2xhc3M9ZTthLmV4dGVuZChjLnByb3RvdHlwZSxlLnByb3RvdHlwZSx7c2V0VmFsdWU6ZnVuY3Rpb24oYSl7aWYodGhpcy5fX21pbiE9PXZvaWQgMCYmYTx0aGlzLl9fbWluKWE9dGhpcy5fX21pbjtcbmVsc2UgaWYodGhpcy5fX21heCE9PXZvaWQgMCYmYT50aGlzLl9fbWF4KWE9dGhpcy5fX21heDt0aGlzLl9fc3RlcCE9PXZvaWQgMCYmYSV0aGlzLl9fc3RlcCE9MCYmKGE9TWF0aC5yb3VuZChhL3RoaXMuX19zdGVwKSp0aGlzLl9fc3RlcCk7cmV0dXJuIGMuc3VwZXJjbGFzcy5wcm90b3R5cGUuc2V0VmFsdWUuY2FsbCh0aGlzLGEpfSxtaW46ZnVuY3Rpb24oYSl7dGhpcy5fX21pbj1hO3JldHVybiB0aGlzfSxtYXg6ZnVuY3Rpb24oYSl7dGhpcy5fX21heD1hO3JldHVybiB0aGlzfSxzdGVwOmZ1bmN0aW9uKGEpe3RoaXMuX19zdGVwPWE7cmV0dXJuIHRoaXN9fSk7cmV0dXJuIGN9KGRhdC5jb250cm9sbGVycy5Db250cm9sbGVyLGRhdC51dGlscy5jb21tb24pO1xuZGF0LmNvbnRyb2xsZXJzLk51bWJlckNvbnRyb2xsZXJCb3g9ZnVuY3Rpb24oZSxhLGMpe3ZhciBkPWZ1bmN0aW9uKGYsYixlKXtmdW5jdGlvbiBoKCl7dmFyIGE9cGFyc2VGbG9hdChsLl9faW5wdXQudmFsdWUpO2MuaXNOYU4oYSl8fGwuc2V0VmFsdWUoYSl9ZnVuY3Rpb24gaihhKXt2YXIgYj1vLWEuY2xpZW50WTtsLnNldFZhbHVlKGwuZ2V0VmFsdWUoKStiKmwuX19pbXBsaWVkU3RlcCk7bz1hLmNsaWVudFl9ZnVuY3Rpb24gbSgpe2EudW5iaW5kKHdpbmRvdyxcIm1vdXNlbW92ZVwiLGopO2EudW5iaW5kKHdpbmRvdyxcIm1vdXNldXBcIixtKX10aGlzLl9fdHJ1bmNhdGlvblN1c3BlbmRlZD1mYWxzZTtkLnN1cGVyY2xhc3MuY2FsbCh0aGlzLGYsYixlKTt2YXIgbD10aGlzLG87dGhpcy5fX2lucHV0PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTt0aGlzLl9faW5wdXQuc2V0QXR0cmlidXRlKFwidHlwZVwiLFwidGV4dFwiKTthLmJpbmQodGhpcy5fX2lucHV0LFwiY2hhbmdlXCIsaCk7XG5hLmJpbmQodGhpcy5fX2lucHV0LFwiYmx1clwiLGZ1bmN0aW9uKCl7aCgpO2wuX19vbkZpbmlzaENoYW5nZSYmbC5fX29uRmluaXNoQ2hhbmdlLmNhbGwobCxsLmdldFZhbHVlKCkpfSk7YS5iaW5kKHRoaXMuX19pbnB1dCxcIm1vdXNlZG93blwiLGZ1bmN0aW9uKGIpe2EuYmluZCh3aW5kb3csXCJtb3VzZW1vdmVcIixqKTthLmJpbmQod2luZG93LFwibW91c2V1cFwiLG0pO289Yi5jbGllbnRZfSk7YS5iaW5kKHRoaXMuX19pbnB1dCxcImtleWRvd25cIixmdW5jdGlvbihhKXtpZihhLmtleUNvZGU9PT0xMylsLl9fdHJ1bmNhdGlvblN1c3BlbmRlZD10cnVlLHRoaXMuYmx1cigpLGwuX190cnVuY2F0aW9uU3VzcGVuZGVkPWZhbHNlfSk7dGhpcy51cGRhdGVEaXNwbGF5KCk7dGhpcy5kb21FbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX19pbnB1dCl9O2Quc3VwZXJjbGFzcz1lO2MuZXh0ZW5kKGQucHJvdG90eXBlLGUucHJvdG90eXBlLHt1cGRhdGVEaXNwbGF5OmZ1bmN0aW9uKCl7dmFyIGE9dGhpcy5fX2lucHV0LFxuYjtpZih0aGlzLl9fdHJ1bmNhdGlvblN1c3BlbmRlZCliPXRoaXMuZ2V0VmFsdWUoKTtlbHNle2I9dGhpcy5nZXRWYWx1ZSgpO3ZhciBjPU1hdGgucG93KDEwLHRoaXMuX19wcmVjaXNpb24pO2I9TWF0aC5yb3VuZChiKmMpL2N9YS52YWx1ZT1iO3JldHVybiBkLnN1cGVyY2xhc3MucHJvdG90eXBlLnVwZGF0ZURpc3BsYXkuY2FsbCh0aGlzKX19KTtyZXR1cm4gZH0oZGF0LmNvbnRyb2xsZXJzLk51bWJlckNvbnRyb2xsZXIsZGF0LmRvbS5kb20sZGF0LnV0aWxzLmNvbW1vbik7XG5kYXQuY29udHJvbGxlcnMuTnVtYmVyQ29udHJvbGxlclNsaWRlcj1mdW5jdGlvbihlLGEsYyxkLGYpe3ZhciBiPWZ1bmN0aW9uKGQsYyxmLGUsbCl7ZnVuY3Rpb24gbyhiKXtiLnByZXZlbnREZWZhdWx0KCk7dmFyIGQ9YS5nZXRPZmZzZXQoZy5fX2JhY2tncm91bmQpLGM9YS5nZXRXaWR0aChnLl9fYmFja2dyb3VuZCk7Zy5zZXRWYWx1ZShnLl9fbWluKyhnLl9fbWF4LWcuX19taW4pKigoYi5jbGllbnRYLWQubGVmdCkvKGQubGVmdCtjLWQubGVmdCkpKTtyZXR1cm4gZmFsc2V9ZnVuY3Rpb24geSgpe2EudW5iaW5kKHdpbmRvdyxcIm1vdXNlbW92ZVwiLG8pO2EudW5iaW5kKHdpbmRvdyxcIm1vdXNldXBcIix5KTtnLl9fb25GaW5pc2hDaGFuZ2UmJmcuX19vbkZpbmlzaENoYW5nZS5jYWxsKGcsZy5nZXRWYWx1ZSgpKX1iLnN1cGVyY2xhc3MuY2FsbCh0aGlzLGQsYyx7bWluOmYsbWF4OmUsc3RlcDpsfSk7dmFyIGc9dGhpczt0aGlzLl9fYmFja2dyb3VuZD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xudGhpcy5fX2ZvcmVncm91bmQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTthLmJpbmQodGhpcy5fX2JhY2tncm91bmQsXCJtb3VzZWRvd25cIixmdW5jdGlvbihiKXthLmJpbmQod2luZG93LFwibW91c2Vtb3ZlXCIsbyk7YS5iaW5kKHdpbmRvdyxcIm1vdXNldXBcIix5KTtvKGIpfSk7YS5hZGRDbGFzcyh0aGlzLl9fYmFja2dyb3VuZCxcInNsaWRlclwiKTthLmFkZENsYXNzKHRoaXMuX19mb3JlZ3JvdW5kLFwic2xpZGVyLWZnXCIpO3RoaXMudXBkYXRlRGlzcGxheSgpO3RoaXMuX19iYWNrZ3JvdW5kLmFwcGVuZENoaWxkKHRoaXMuX19mb3JlZ3JvdW5kKTt0aGlzLmRvbUVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5fX2JhY2tncm91bmQpfTtiLnN1cGVyY2xhc3M9ZTtiLnVzZURlZmF1bHRTdHlsZXM9ZnVuY3Rpb24oKXtjLmluamVjdChmKX07ZC5leHRlbmQoYi5wcm90b3R5cGUsZS5wcm90b3R5cGUse3VwZGF0ZURpc3BsYXk6ZnVuY3Rpb24oKXt0aGlzLl9fZm9yZWdyb3VuZC5zdHlsZS53aWR0aD1cbih0aGlzLmdldFZhbHVlKCktdGhpcy5fX21pbikvKHRoaXMuX19tYXgtdGhpcy5fX21pbikqMTAwK1wiJVwiO3JldHVybiBiLnN1cGVyY2xhc3MucHJvdG90eXBlLnVwZGF0ZURpc3BsYXkuY2FsbCh0aGlzKX19KTtyZXR1cm4gYn0oZGF0LmNvbnRyb2xsZXJzLk51bWJlckNvbnRyb2xsZXIsZGF0LmRvbS5kb20sZGF0LnV0aWxzLmNzcyxkYXQudXRpbHMuY29tbW9uLFwiLnNsaWRlciB7XFxuICBib3gtc2hhZG93OiBpbnNldCAwIDJweCA0cHggcmdiYSgwLDAsMCwwLjE1KTtcXG4gIGhlaWdodDogMWVtO1xcbiAgYm9yZGVyLXJhZGl1czogMWVtO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2VlZTtcXG4gIHBhZGRpbmc6IDAgMC41ZW07XFxuICBvdmVyZmxvdzogaGlkZGVuO1xcbn1cXG5cXG4uc2xpZGVyLWZnIHtcXG4gIHBhZGRpbmc6IDFweCAwIDJweCAwO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2FhYTtcXG4gIGhlaWdodDogMWVtO1xcbiAgbWFyZ2luLWxlZnQ6IC0wLjVlbTtcXG4gIHBhZGRpbmctcmlnaHQ6IDAuNWVtO1xcbiAgYm9yZGVyLXJhZGl1czogMWVtIDAgMCAxZW07XFxufVxcblxcbi5zbGlkZXItZmc6YWZ0ZXIge1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgYm9yZGVyLXJhZGl1czogMWVtO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gIGJvcmRlcjogIDFweCBzb2xpZCAjYWFhO1xcbiAgY29udGVudDogJyc7XFxuICBmbG9hdDogcmlnaHQ7XFxuICBtYXJnaW4tcmlnaHQ6IC0xZW07XFxuICBtYXJnaW4tdG9wOiAtMXB4O1xcbiAgaGVpZ2h0OiAwLjllbTtcXG4gIHdpZHRoOiAwLjllbTtcXG59XCIpO1xuZGF0LmNvbnRyb2xsZXJzLkZ1bmN0aW9uQ29udHJvbGxlcj1mdW5jdGlvbihlLGEsYyl7dmFyIGQ9ZnVuY3Rpb24oYyxiLGUpe2Quc3VwZXJjbGFzcy5jYWxsKHRoaXMsYyxiKTt2YXIgaD10aGlzO3RoaXMuX19idXR0b249ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTt0aGlzLl9fYnV0dG9uLmlubmVySFRNTD1lPT09dm9pZCAwP1wiRmlyZVwiOmU7YS5iaW5kKHRoaXMuX19idXR0b24sXCJjbGlja1wiLGZ1bmN0aW9uKGEpe2EucHJldmVudERlZmF1bHQoKTtoLmZpcmUoKTtyZXR1cm4gZmFsc2V9KTthLmFkZENsYXNzKHRoaXMuX19idXR0b24sXCJidXR0b25cIik7dGhpcy5kb21FbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX19idXR0b24pfTtkLnN1cGVyY2xhc3M9ZTtjLmV4dGVuZChkLnByb3RvdHlwZSxlLnByb3RvdHlwZSx7ZmlyZTpmdW5jdGlvbigpe3RoaXMuX19vbkNoYW5nZSYmdGhpcy5fX29uQ2hhbmdlLmNhbGwodGhpcyk7dGhpcy5fX29uRmluaXNoQ2hhbmdlJiZ0aGlzLl9fb25GaW5pc2hDaGFuZ2UuY2FsbCh0aGlzLFxudGhpcy5nZXRWYWx1ZSgpKTt0aGlzLmdldFZhbHVlKCkuY2FsbCh0aGlzLm9iamVjdCl9fSk7cmV0dXJuIGR9KGRhdC5jb250cm9sbGVycy5Db250cm9sbGVyLGRhdC5kb20uZG9tLGRhdC51dGlscy5jb21tb24pO1xuZGF0LmNvbnRyb2xsZXJzLkJvb2xlYW5Db250cm9sbGVyPWZ1bmN0aW9uKGUsYSxjKXt2YXIgZD1mdW5jdGlvbihjLGIpe2Quc3VwZXJjbGFzcy5jYWxsKHRoaXMsYyxiKTt2YXIgZT10aGlzO3RoaXMuX19wcmV2PXRoaXMuZ2V0VmFsdWUoKTt0aGlzLl9fY2hlY2tib3g9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO3RoaXMuX19jaGVja2JveC5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsXCJjaGVja2JveFwiKTthLmJpbmQodGhpcy5fX2NoZWNrYm94LFwiY2hhbmdlXCIsZnVuY3Rpb24oKXtlLnNldFZhbHVlKCFlLl9fcHJldil9LGZhbHNlKTt0aGlzLmRvbUVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5fX2NoZWNrYm94KTt0aGlzLnVwZGF0ZURpc3BsYXkoKX07ZC5zdXBlcmNsYXNzPWU7Yy5leHRlbmQoZC5wcm90b3R5cGUsZS5wcm90b3R5cGUse3NldFZhbHVlOmZ1bmN0aW9uKGEpe2E9ZC5zdXBlcmNsYXNzLnByb3RvdHlwZS5zZXRWYWx1ZS5jYWxsKHRoaXMsYSk7dGhpcy5fX29uRmluaXNoQ2hhbmdlJiZcbnRoaXMuX19vbkZpbmlzaENoYW5nZS5jYWxsKHRoaXMsdGhpcy5nZXRWYWx1ZSgpKTt0aGlzLl9fcHJldj10aGlzLmdldFZhbHVlKCk7cmV0dXJuIGF9LHVwZGF0ZURpc3BsYXk6ZnVuY3Rpb24oKXt0aGlzLmdldFZhbHVlKCk9PT10cnVlPyh0aGlzLl9fY2hlY2tib3guc2V0QXR0cmlidXRlKFwiY2hlY2tlZFwiLFwiY2hlY2tlZFwiKSx0aGlzLl9fY2hlY2tib3guY2hlY2tlZD10cnVlKTp0aGlzLl9fY2hlY2tib3guY2hlY2tlZD1mYWxzZTtyZXR1cm4gZC5zdXBlcmNsYXNzLnByb3RvdHlwZS51cGRhdGVEaXNwbGF5LmNhbGwodGhpcyl9fSk7cmV0dXJuIGR9KGRhdC5jb250cm9sbGVycy5Db250cm9sbGVyLGRhdC5kb20uZG9tLGRhdC51dGlscy5jb21tb24pO1xuZGF0LmNvbG9yLnRvU3RyaW5nPWZ1bmN0aW9uKGUpe3JldHVybiBmdW5jdGlvbihhKXtpZihhLmE9PTF8fGUuaXNVbmRlZmluZWQoYS5hKSl7Zm9yKGE9YS5oZXgudG9TdHJpbmcoMTYpO2EubGVuZ3RoPDY7KWE9XCIwXCIrYTtyZXR1cm5cIiNcIithfWVsc2UgcmV0dXJuXCJyZ2JhKFwiK01hdGgucm91bmQoYS5yKStcIixcIitNYXRoLnJvdW5kKGEuZykrXCIsXCIrTWF0aC5yb3VuZChhLmIpK1wiLFwiK2EuYStcIilcIn19KGRhdC51dGlscy5jb21tb24pO1xuZGF0LmNvbG9yLmludGVycHJldD1mdW5jdGlvbihlLGEpe3ZhciBjLGQsZj1be2xpdG11czphLmlzU3RyaW5nLGNvbnZlcnNpb25zOntUSFJFRV9DSEFSX0hFWDp7cmVhZDpmdW5jdGlvbihhKXthPWEubWF0Y2goL14jKFtBLUYwLTldKShbQS1GMC05XSkoW0EtRjAtOV0pJC9pKTtyZXR1cm4gYT09PW51bGw/ZmFsc2U6e3NwYWNlOlwiSEVYXCIsaGV4OnBhcnNlSW50KFwiMHhcIithWzFdLnRvU3RyaW5nKCkrYVsxXS50b1N0cmluZygpK2FbMl0udG9TdHJpbmcoKSthWzJdLnRvU3RyaW5nKCkrYVszXS50b1N0cmluZygpK2FbM10udG9TdHJpbmcoKSl9fSx3cml0ZTplfSxTSVhfQ0hBUl9IRVg6e3JlYWQ6ZnVuY3Rpb24oYSl7YT1hLm1hdGNoKC9eIyhbQS1GMC05XXs2fSkkL2kpO3JldHVybiBhPT09bnVsbD9mYWxzZTp7c3BhY2U6XCJIRVhcIixoZXg6cGFyc2VJbnQoXCIweFwiK2FbMV0udG9TdHJpbmcoKSl9fSx3cml0ZTplfSxDU1NfUkdCOntyZWFkOmZ1bmN0aW9uKGEpe2E9YS5tYXRjaCgvXnJnYlxcKFxccyooLispXFxzKixcXHMqKC4rKVxccyosXFxzKiguKylcXHMqXFwpLyk7XG5yZXR1cm4gYT09PW51bGw/ZmFsc2U6e3NwYWNlOlwiUkdCXCIscjpwYXJzZUZsb2F0KGFbMV0pLGc6cGFyc2VGbG9hdChhWzJdKSxiOnBhcnNlRmxvYXQoYVszXSl9fSx3cml0ZTplfSxDU1NfUkdCQTp7cmVhZDpmdW5jdGlvbihhKXthPWEubWF0Y2goL15yZ2JhXFwoXFxzKiguKylcXHMqLFxccyooLispXFxzKixcXHMqKC4rKVxccypcXCxcXHMqKC4rKVxccypcXCkvKTtyZXR1cm4gYT09PW51bGw/ZmFsc2U6e3NwYWNlOlwiUkdCXCIscjpwYXJzZUZsb2F0KGFbMV0pLGc6cGFyc2VGbG9hdChhWzJdKSxiOnBhcnNlRmxvYXQoYVszXSksYTpwYXJzZUZsb2F0KGFbNF0pfX0sd3JpdGU6ZX19fSx7bGl0bXVzOmEuaXNOdW1iZXIsY29udmVyc2lvbnM6e0hFWDp7cmVhZDpmdW5jdGlvbihhKXtyZXR1cm57c3BhY2U6XCJIRVhcIixoZXg6YSxjb252ZXJzaW9uTmFtZTpcIkhFWFwifX0sd3JpdGU6ZnVuY3Rpb24oYSl7cmV0dXJuIGEuaGV4fX19fSx7bGl0bXVzOmEuaXNBcnJheSxjb252ZXJzaW9uczp7UkdCX0FSUkFZOntyZWFkOmZ1bmN0aW9uKGEpe3JldHVybiBhLmxlbmd0aCE9XG4zP2ZhbHNlOntzcGFjZTpcIlJHQlwiLHI6YVswXSxnOmFbMV0sYjphWzJdfX0sd3JpdGU6ZnVuY3Rpb24oYSl7cmV0dXJuW2EucixhLmcsYS5iXX19LFJHQkFfQVJSQVk6e3JlYWQ6ZnVuY3Rpb24oYSl7cmV0dXJuIGEubGVuZ3RoIT00P2ZhbHNlOntzcGFjZTpcIlJHQlwiLHI6YVswXSxnOmFbMV0sYjphWzJdLGE6YVszXX19LHdyaXRlOmZ1bmN0aW9uKGEpe3JldHVyblthLnIsYS5nLGEuYixhLmFdfX19fSx7bGl0bXVzOmEuaXNPYmplY3QsY29udmVyc2lvbnM6e1JHQkFfT0JKOntyZWFkOmZ1bmN0aW9uKGIpe3JldHVybiBhLmlzTnVtYmVyKGIucikmJmEuaXNOdW1iZXIoYi5nKSYmYS5pc051bWJlcihiLmIpJiZhLmlzTnVtYmVyKGIuYSk/e3NwYWNlOlwiUkdCXCIscjpiLnIsZzpiLmcsYjpiLmIsYTpiLmF9OmZhbHNlfSx3cml0ZTpmdW5jdGlvbihhKXtyZXR1cm57cjphLnIsZzphLmcsYjphLmIsYTphLmF9fX0sUkdCX09CSjp7cmVhZDpmdW5jdGlvbihiKXtyZXR1cm4gYS5pc051bWJlcihiLnIpJiZcbmEuaXNOdW1iZXIoYi5nKSYmYS5pc051bWJlcihiLmIpP3tzcGFjZTpcIlJHQlwiLHI6Yi5yLGc6Yi5nLGI6Yi5ifTpmYWxzZX0sd3JpdGU6ZnVuY3Rpb24oYSl7cmV0dXJue3I6YS5yLGc6YS5nLGI6YS5ifX19LEhTVkFfT0JKOntyZWFkOmZ1bmN0aW9uKGIpe3JldHVybiBhLmlzTnVtYmVyKGIuaCkmJmEuaXNOdW1iZXIoYi5zKSYmYS5pc051bWJlcihiLnYpJiZhLmlzTnVtYmVyKGIuYSk/e3NwYWNlOlwiSFNWXCIsaDpiLmgsczpiLnMsdjpiLnYsYTpiLmF9OmZhbHNlfSx3cml0ZTpmdW5jdGlvbihhKXtyZXR1cm57aDphLmgsczphLnMsdjphLnYsYTphLmF9fX0sSFNWX09CSjp7cmVhZDpmdW5jdGlvbihiKXtyZXR1cm4gYS5pc051bWJlcihiLmgpJiZhLmlzTnVtYmVyKGIucykmJmEuaXNOdW1iZXIoYi52KT97c3BhY2U6XCJIU1ZcIixoOmIuaCxzOmIucyx2OmIudn06ZmFsc2V9LHdyaXRlOmZ1bmN0aW9uKGEpe3JldHVybntoOmEuaCxzOmEucyx2OmEudn19fX19XTtyZXR1cm4gZnVuY3Rpb24oKXtkPVxuZmFsc2U7dmFyIGI9YXJndW1lbnRzLmxlbmd0aD4xP2EudG9BcnJheShhcmd1bWVudHMpOmFyZ3VtZW50c1swXTthLmVhY2goZixmdW5jdGlvbihlKXtpZihlLmxpdG11cyhiKSlyZXR1cm4gYS5lYWNoKGUuY29udmVyc2lvbnMsZnVuY3Rpb24oZSxmKXtjPWUucmVhZChiKTtpZihkPT09ZmFsc2UmJmMhPT1mYWxzZSlyZXR1cm4gZD1jLGMuY29udmVyc2lvbk5hbWU9ZixjLmNvbnZlcnNpb249ZSxhLkJSRUFLfSksYS5CUkVBS30pO3JldHVybiBkfX0oZGF0LmNvbG9yLnRvU3RyaW5nLGRhdC51dGlscy5jb21tb24pO1xuZGF0LkdVST1kYXQuZ3VpLkdVST1mdW5jdGlvbihlLGEsYyxkLGYsYixuLGgsaixtLGwsbyx5LGcsaSl7ZnVuY3Rpb24gcShhLGIscixjKXtpZihiW3JdPT09dm9pZCAwKXRocm93IEVycm9yKFwiT2JqZWN0IFwiK2IrJyBoYXMgbm8gcHJvcGVydHkgXCInK3IrJ1wiJyk7Yy5jb2xvcj9iPW5ldyBsKGIscik6KGI9W2Iscl0uY29uY2F0KGMuZmFjdG9yeUFyZ3MpLGI9ZC5hcHBseShhLGIpKTtpZihjLmJlZm9yZSBpbnN0YW5jZW9mIGYpYy5iZWZvcmU9Yy5iZWZvcmUuX19saTt0KGEsYik7Zy5hZGRDbGFzcyhiLmRvbUVsZW1lbnQsXCJjXCIpO3I9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7Zy5hZGRDbGFzcyhyLFwicHJvcGVydHktbmFtZVwiKTtyLmlubmVySFRNTD1iLnByb3BlcnR5O3ZhciBlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7ZS5hcHBlbmRDaGlsZChyKTtlLmFwcGVuZENoaWxkKGIuZG9tRWxlbWVudCk7Yz1zKGEsZSxjLmJlZm9yZSk7Zy5hZGRDbGFzcyhjLGsuQ0xBU1NfQ09OVFJPTExFUl9ST1cpO1xuZy5hZGRDbGFzcyhjLHR5cGVvZiBiLmdldFZhbHVlKCkpO3AoYSxjLGIpO2EuX19jb250cm9sbGVycy5wdXNoKGIpO3JldHVybiBifWZ1bmN0aW9uIHMoYSxiLGQpe3ZhciBjPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKTtiJiZjLmFwcGVuZENoaWxkKGIpO2Q/YS5fX3VsLmluc2VydEJlZm9yZShjLHBhcmFtcy5iZWZvcmUpOmEuX191bC5hcHBlbmRDaGlsZChjKTthLm9uUmVzaXplKCk7cmV0dXJuIGN9ZnVuY3Rpb24gcChhLGQsYyl7Yy5fX2xpPWQ7Yy5fX2d1aT1hO2kuZXh0ZW5kKGMse29wdGlvbnM6ZnVuY3Rpb24oYil7aWYoYXJndW1lbnRzLmxlbmd0aD4xKXJldHVybiBjLnJlbW92ZSgpLHEoYSxjLm9iamVjdCxjLnByb3BlcnR5LHtiZWZvcmU6Yy5fX2xpLm5leHRFbGVtZW50U2libGluZyxmYWN0b3J5QXJnczpbaS50b0FycmF5KGFyZ3VtZW50cyldfSk7aWYoaS5pc0FycmF5KGIpfHxpLmlzT2JqZWN0KGIpKXJldHVybiBjLnJlbW92ZSgpLHEoYSxjLm9iamVjdCxjLnByb3BlcnR5LFxue2JlZm9yZTpjLl9fbGkubmV4dEVsZW1lbnRTaWJsaW5nLGZhY3RvcnlBcmdzOltiXX0pfSxuYW1lOmZ1bmN0aW9uKGEpe2MuX19saS5maXJzdEVsZW1lbnRDaGlsZC5maXJzdEVsZW1lbnRDaGlsZC5pbm5lckhUTUw9YTtyZXR1cm4gY30sbGlzdGVuOmZ1bmN0aW9uKCl7Yy5fX2d1aS5saXN0ZW4oYyk7cmV0dXJuIGN9LHJlbW92ZTpmdW5jdGlvbigpe2MuX19ndWkucmVtb3ZlKGMpO3JldHVybiBjfX0pO2lmKGMgaW5zdGFuY2VvZiBqKXt2YXIgZT1uZXcgaChjLm9iamVjdCxjLnByb3BlcnR5LHttaW46Yy5fX21pbixtYXg6Yy5fX21heCxzdGVwOmMuX19zdGVwfSk7aS5lYWNoKFtcInVwZGF0ZURpc3BsYXlcIixcIm9uQ2hhbmdlXCIsXCJvbkZpbmlzaENoYW5nZVwiXSxmdW5jdGlvbihhKXt2YXIgYj1jW2FdLEg9ZVthXTtjW2FdPWVbYV09ZnVuY3Rpb24oKXt2YXIgYT1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO2IuYXBwbHkoYyxhKTtyZXR1cm4gSC5hcHBseShlLGEpfX0pO1xuZy5hZGRDbGFzcyhkLFwiaGFzLXNsaWRlclwiKTtjLmRvbUVsZW1lbnQuaW5zZXJ0QmVmb3JlKGUuZG9tRWxlbWVudCxjLmRvbUVsZW1lbnQuZmlyc3RFbGVtZW50Q2hpbGQpfWVsc2UgaWYoYyBpbnN0YW5jZW9mIGgpe3ZhciBmPWZ1bmN0aW9uKGIpe3JldHVybiBpLmlzTnVtYmVyKGMuX19taW4pJiZpLmlzTnVtYmVyKGMuX19tYXgpPyhjLnJlbW92ZSgpLHEoYSxjLm9iamVjdCxjLnByb3BlcnR5LHtiZWZvcmU6Yy5fX2xpLm5leHRFbGVtZW50U2libGluZyxmYWN0b3J5QXJnczpbYy5fX21pbixjLl9fbWF4LGMuX19zdGVwXX0pKTpifTtjLm1pbj1pLmNvbXBvc2UoZixjLm1pbik7Yy5tYXg9aS5jb21wb3NlKGYsYy5tYXgpfWVsc2UgaWYoYyBpbnN0YW5jZW9mIGIpZy5iaW5kKGQsXCJjbGlja1wiLGZ1bmN0aW9uKCl7Zy5mYWtlRXZlbnQoYy5fX2NoZWNrYm94LFwiY2xpY2tcIil9KSxnLmJpbmQoYy5fX2NoZWNrYm94LFwiY2xpY2tcIixmdW5jdGlvbihhKXthLnN0b3BQcm9wYWdhdGlvbigpfSk7XG5lbHNlIGlmKGMgaW5zdGFuY2VvZiBuKWcuYmluZChkLFwiY2xpY2tcIixmdW5jdGlvbigpe2cuZmFrZUV2ZW50KGMuX19idXR0b24sXCJjbGlja1wiKX0pLGcuYmluZChkLFwibW91c2VvdmVyXCIsZnVuY3Rpb24oKXtnLmFkZENsYXNzKGMuX19idXR0b24sXCJob3ZlclwiKX0pLGcuYmluZChkLFwibW91c2VvdXRcIixmdW5jdGlvbigpe2cucmVtb3ZlQ2xhc3MoYy5fX2J1dHRvbixcImhvdmVyXCIpfSk7ZWxzZSBpZihjIGluc3RhbmNlb2YgbClnLmFkZENsYXNzKGQsXCJjb2xvclwiKSxjLnVwZGF0ZURpc3BsYXk9aS5jb21wb3NlKGZ1bmN0aW9uKGEpe2Quc3R5bGUuYm9yZGVyTGVmdENvbG9yPWMuX19jb2xvci50b1N0cmluZygpO3JldHVybiBhfSxjLnVwZGF0ZURpc3BsYXkpLGMudXBkYXRlRGlzcGxheSgpO2Muc2V0VmFsdWU9aS5jb21wb3NlKGZ1bmN0aW9uKGIpe2EuZ2V0Um9vdCgpLl9fcHJlc2V0X3NlbGVjdCYmYy5pc01vZGlmaWVkKCkmJkIoYS5nZXRSb290KCksdHJ1ZSk7cmV0dXJuIGJ9LGMuc2V0VmFsdWUpfVxuZnVuY3Rpb24gdChhLGIpe3ZhciBjPWEuZ2V0Um9vdCgpLGQ9Yy5fX3JlbWVtYmVyZWRPYmplY3RzLmluZGV4T2YoYi5vYmplY3QpO2lmKGQhPS0xKXt2YXIgZT1jLl9fcmVtZW1iZXJlZE9iamVjdEluZGVjZXNUb0NvbnRyb2xsZXJzW2RdO2U9PT12b2lkIDAmJihlPXt9LGMuX19yZW1lbWJlcmVkT2JqZWN0SW5kZWNlc1RvQ29udHJvbGxlcnNbZF09ZSk7ZVtiLnByb3BlcnR5XT1iO2lmKGMubG9hZCYmYy5sb2FkLnJlbWVtYmVyZWQpe2M9Yy5sb2FkLnJlbWVtYmVyZWQ7aWYoY1thLnByZXNldF0pYz1jW2EucHJlc2V0XTtlbHNlIGlmKGNbd10pYz1jW3ddO2Vsc2UgcmV0dXJuO2lmKGNbZF0mJmNbZF1bYi5wcm9wZXJ0eV0hPT12b2lkIDApZD1jW2RdW2IucHJvcGVydHldLGIuaW5pdGlhbFZhbHVlPWQsYi5zZXRWYWx1ZShkKX19fWZ1bmN0aW9uIEkoYSl7dmFyIGI9YS5fX3NhdmVfcm93PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKTtnLmFkZENsYXNzKGEuZG9tRWxlbWVudCxcblwiaGFzLXNhdmVcIik7YS5fX3VsLmluc2VydEJlZm9yZShiLGEuX191bC5maXJzdENoaWxkKTtnLmFkZENsYXNzKGIsXCJzYXZlLXJvd1wiKTt2YXIgYz1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtjLmlubmVySFRNTD1cIiZuYnNwO1wiO2cuYWRkQ2xhc3MoYyxcImJ1dHRvbiBnZWFyc1wiKTt2YXIgZD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtkLmlubmVySFRNTD1cIlNhdmVcIjtnLmFkZENsYXNzKGQsXCJidXR0b25cIik7Zy5hZGRDbGFzcyhkLFwic2F2ZVwiKTt2YXIgZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtlLmlubmVySFRNTD1cIk5ld1wiO2cuYWRkQ2xhc3MoZSxcImJ1dHRvblwiKTtnLmFkZENsYXNzKGUsXCJzYXZlLWFzXCIpO3ZhciBmPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO2YuaW5uZXJIVE1MPVwiUmV2ZXJ0XCI7Zy5hZGRDbGFzcyhmLFwiYnV0dG9uXCIpO2cuYWRkQ2xhc3MoZixcInJldmVydFwiKTt2YXIgbT1hLl9fcHJlc2V0X3NlbGVjdD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2VsZWN0XCIpO1xuYS5sb2FkJiZhLmxvYWQucmVtZW1iZXJlZD9pLmVhY2goYS5sb2FkLnJlbWVtYmVyZWQsZnVuY3Rpb24oYixjKXtDKGEsYyxjPT1hLnByZXNldCl9KTpDKGEsdyxmYWxzZSk7Zy5iaW5kKG0sXCJjaGFuZ2VcIixmdW5jdGlvbigpe2Zvcih2YXIgYj0wO2I8YS5fX3ByZXNldF9zZWxlY3QubGVuZ3RoO2IrKylhLl9fcHJlc2V0X3NlbGVjdFtiXS5pbm5lckhUTUw9YS5fX3ByZXNldF9zZWxlY3RbYl0udmFsdWU7YS5wcmVzZXQ9dGhpcy52YWx1ZX0pO2IuYXBwZW5kQ2hpbGQobSk7Yi5hcHBlbmRDaGlsZChjKTtiLmFwcGVuZENoaWxkKGQpO2IuYXBwZW5kQ2hpbGQoZSk7Yi5hcHBlbmRDaGlsZChmKTtpZih1KXt2YXIgYj1kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRnLXNhdmUtbG9jYWxseVwiKSxsPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGctbG9jYWwtZXhwbGFpblwiKTtiLnN0eWxlLmRpc3BsYXk9XCJibG9ja1wiO2I9ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZy1sb2NhbC1zdG9yYWdlXCIpO1xubG9jYWxTdG9yYWdlLmdldEl0ZW0oZG9jdW1lbnQubG9jYXRpb24uaHJlZitcIi5pc0xvY2FsXCIpPT09XCJ0cnVlXCImJmIuc2V0QXR0cmlidXRlKFwiY2hlY2tlZFwiLFwiY2hlY2tlZFwiKTt2YXIgbz1mdW5jdGlvbigpe2wuc3R5bGUuZGlzcGxheT1hLnVzZUxvY2FsU3RvcmFnZT9cImJsb2NrXCI6XCJub25lXCJ9O28oKTtnLmJpbmQoYixcImNoYW5nZVwiLGZ1bmN0aW9uKCl7YS51c2VMb2NhbFN0b3JhZ2U9IWEudXNlTG9jYWxTdG9yYWdlO28oKX0pfXZhciBoPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGctbmV3LWNvbnN0cnVjdG9yXCIpO2cuYmluZChoLFwia2V5ZG93blwiLGZ1bmN0aW9uKGEpe2EubWV0YUtleSYmKGEud2hpY2g9PT02N3x8YS5rZXlDb2RlPT02NykmJnguaGlkZSgpfSk7Zy5iaW5kKGMsXCJjbGlja1wiLGZ1bmN0aW9uKCl7aC5pbm5lckhUTUw9SlNPTi5zdHJpbmdpZnkoYS5nZXRTYXZlT2JqZWN0KCksdm9pZCAwLDIpO3guc2hvdygpO2guZm9jdXMoKTtoLnNlbGVjdCgpfSk7Zy5iaW5kKGQsXG5cImNsaWNrXCIsZnVuY3Rpb24oKXthLnNhdmUoKX0pO2cuYmluZChlLFwiY2xpY2tcIixmdW5jdGlvbigpe3ZhciBiPXByb21wdChcIkVudGVyIGEgbmV3IHByZXNldCBuYW1lLlwiKTtiJiZhLnNhdmVBcyhiKX0pO2cuYmluZChmLFwiY2xpY2tcIixmdW5jdGlvbigpe2EucmV2ZXJ0KCl9KX1mdW5jdGlvbiBKKGEpe2Z1bmN0aW9uIGIoZil7Zi5wcmV2ZW50RGVmYXVsdCgpO2U9Zi5jbGllbnRYO2cuYWRkQ2xhc3MoYS5fX2Nsb3NlQnV0dG9uLGsuQ0xBU1NfRFJBRyk7Zy5iaW5kKHdpbmRvdyxcIm1vdXNlbW92ZVwiLGMpO2cuYmluZCh3aW5kb3csXCJtb3VzZXVwXCIsZCk7cmV0dXJuIGZhbHNlfWZ1bmN0aW9uIGMoYil7Yi5wcmV2ZW50RGVmYXVsdCgpO2Eud2lkdGgrPWUtYi5jbGllbnRYO2Eub25SZXNpemUoKTtlPWIuY2xpZW50WDtyZXR1cm4gZmFsc2V9ZnVuY3Rpb24gZCgpe2cucmVtb3ZlQ2xhc3MoYS5fX2Nsb3NlQnV0dG9uLGsuQ0xBU1NfRFJBRyk7Zy51bmJpbmQod2luZG93LFwibW91c2Vtb3ZlXCIsXG5jKTtnLnVuYmluZCh3aW5kb3csXCJtb3VzZXVwXCIsZCl9YS5fX3Jlc2l6ZV9oYW5kbGU9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtpLmV4dGVuZChhLl9fcmVzaXplX2hhbmRsZS5zdHlsZSx7d2lkdGg6XCI2cHhcIixtYXJnaW5MZWZ0OlwiLTNweFwiLGhlaWdodDpcIjIwMHB4XCIsY3Vyc29yOlwiZXctcmVzaXplXCIscG9zaXRpb246XCJhYnNvbHV0ZVwifSk7dmFyIGU7Zy5iaW5kKGEuX19yZXNpemVfaGFuZGxlLFwibW91c2Vkb3duXCIsYik7Zy5iaW5kKGEuX19jbG9zZUJ1dHRvbixcIm1vdXNlZG93blwiLGIpO2EuZG9tRWxlbWVudC5pbnNlcnRCZWZvcmUoYS5fX3Jlc2l6ZV9oYW5kbGUsYS5kb21FbGVtZW50LmZpcnN0RWxlbWVudENoaWxkKX1mdW5jdGlvbiBEKGEsYil7YS5kb21FbGVtZW50LnN0eWxlLndpZHRoPWIrXCJweFwiO2lmKGEuX19zYXZlX3JvdyYmYS5hdXRvUGxhY2UpYS5fX3NhdmVfcm93LnN0eWxlLndpZHRoPWIrXCJweFwiO2lmKGEuX19jbG9zZUJ1dHRvbilhLl9fY2xvc2VCdXR0b24uc3R5bGUud2lkdGg9XG5iK1wicHhcIn1mdW5jdGlvbiB6KGEsYil7dmFyIGM9e307aS5lYWNoKGEuX19yZW1lbWJlcmVkT2JqZWN0cyxmdW5jdGlvbihkLGUpe3ZhciBmPXt9O2kuZWFjaChhLl9fcmVtZW1iZXJlZE9iamVjdEluZGVjZXNUb0NvbnRyb2xsZXJzW2VdLGZ1bmN0aW9uKGEsYyl7ZltjXT1iP2EuaW5pdGlhbFZhbHVlOmEuZ2V0VmFsdWUoKX0pO2NbZV09Zn0pO3JldHVybiBjfWZ1bmN0aW9uIEMoYSxiLGMpe3ZhciBkPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJvcHRpb25cIik7ZC5pbm5lckhUTUw9YjtkLnZhbHVlPWI7YS5fX3ByZXNldF9zZWxlY3QuYXBwZW5kQ2hpbGQoZCk7aWYoYylhLl9fcHJlc2V0X3NlbGVjdC5zZWxlY3RlZEluZGV4PWEuX19wcmVzZXRfc2VsZWN0Lmxlbmd0aC0xfWZ1bmN0aW9uIEIoYSxiKXt2YXIgYz1hLl9fcHJlc2V0X3NlbGVjdFthLl9fcHJlc2V0X3NlbGVjdC5zZWxlY3RlZEluZGV4XTtjLmlubmVySFRNTD1iP2MudmFsdWUrXCIqXCI6Yy52YWx1ZX1mdW5jdGlvbiBFKGEpe2EubGVuZ3RoIT1cbjAmJm8oZnVuY3Rpb24oKXtFKGEpfSk7aS5lYWNoKGEsZnVuY3Rpb24oYSl7YS51cGRhdGVEaXNwbGF5KCl9KX1lLmluamVjdChjKTt2YXIgdz1cIkRlZmF1bHRcIix1O3RyeXt1PVwibG9jYWxTdG9yYWdlXCJpbiB3aW5kb3cmJndpbmRvdy5sb2NhbFN0b3JhZ2UhPT1udWxsfWNhdGNoKEspe3U9ZmFsc2V9dmFyIHgsRj10cnVlLHYsQT1mYWxzZSxHPVtdLGs9ZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYigpe2xvY2FsU3RvcmFnZS5zZXRJdGVtKGRvY3VtZW50LmxvY2F0aW9uLmhyZWYrXCIuZ3VpXCIsSlNPTi5zdHJpbmdpZnkoZC5nZXRTYXZlT2JqZWN0KCkpKX1mdW5jdGlvbiBjKCl7dmFyIGE9ZC5nZXRSb290KCk7YS53aWR0aCs9MTtpLmRlZmVyKGZ1bmN0aW9uKCl7YS53aWR0aC09MX0pfXZhciBkPXRoaXM7dGhpcy5kb21FbGVtZW50PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7dGhpcy5fX3VsPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ1bFwiKTt0aGlzLmRvbUVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5fX3VsKTtcbmcuYWRkQ2xhc3ModGhpcy5kb21FbGVtZW50LFwiZGdcIik7dGhpcy5fX2ZvbGRlcnM9e307dGhpcy5fX2NvbnRyb2xsZXJzPVtdO3RoaXMuX19yZW1lbWJlcmVkT2JqZWN0cz1bXTt0aGlzLl9fcmVtZW1iZXJlZE9iamVjdEluZGVjZXNUb0NvbnRyb2xsZXJzPVtdO3RoaXMuX19saXN0ZW5pbmc9W107YT1hfHx7fTthPWkuZGVmYXVsdHMoYSx7YXV0b1BsYWNlOnRydWUsd2lkdGg6ay5ERUZBVUxUX1dJRFRIfSk7YT1pLmRlZmF1bHRzKGEse3Jlc2l6YWJsZTphLmF1dG9QbGFjZSxoaWRlYWJsZTphLmF1dG9QbGFjZX0pO2lmKGkuaXNVbmRlZmluZWQoYS5sb2FkKSlhLmxvYWQ9e3ByZXNldDp3fTtlbHNlIGlmKGEucHJlc2V0KWEubG9hZC5wcmVzZXQ9YS5wcmVzZXQ7aS5pc1VuZGVmaW5lZChhLnBhcmVudCkmJmEuaGlkZWFibGUmJkcucHVzaCh0aGlzKTthLnJlc2l6YWJsZT1pLmlzVW5kZWZpbmVkKGEucGFyZW50KSYmYS5yZXNpemFibGU7aWYoYS5hdXRvUGxhY2UmJmkuaXNVbmRlZmluZWQoYS5zY3JvbGxhYmxlKSlhLnNjcm9sbGFibGU9XG50cnVlO3ZhciBlPXUmJmxvY2FsU3RvcmFnZS5nZXRJdGVtKGRvY3VtZW50LmxvY2F0aW9uLmhyZWYrXCIuaXNMb2NhbFwiKT09PVwidHJ1ZVwiO09iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMse3BhcmVudDp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIGEucGFyZW50fX0sc2Nyb2xsYWJsZTp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIGEuc2Nyb2xsYWJsZX19LGF1dG9QbGFjZTp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIGEuYXV0b1BsYWNlfX0scHJlc2V0OntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gZC5wYXJlbnQ/ZC5nZXRSb290KCkucHJlc2V0OmEubG9hZC5wcmVzZXR9LHNldDpmdW5jdGlvbihiKXtkLnBhcmVudD9kLmdldFJvb3QoKS5wcmVzZXQ9YjphLmxvYWQucHJlc2V0PWI7Zm9yKGI9MDtiPHRoaXMuX19wcmVzZXRfc2VsZWN0Lmxlbmd0aDtiKyspaWYodGhpcy5fX3ByZXNldF9zZWxlY3RbYl0udmFsdWU9PXRoaXMucHJlc2V0KXRoaXMuX19wcmVzZXRfc2VsZWN0LnNlbGVjdGVkSW5kZXg9XG5iO2QucmV2ZXJ0KCl9fSx3aWR0aDp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIGEud2lkdGh9LHNldDpmdW5jdGlvbihiKXthLndpZHRoPWI7RChkLGIpfX0sbmFtZTp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIGEubmFtZX0sc2V0OmZ1bmN0aW9uKGIpe2EubmFtZT1iO2lmKG0pbS5pbm5lckhUTUw9YS5uYW1lfX0sY2xvc2VkOntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gYS5jbG9zZWR9LHNldDpmdW5jdGlvbihiKXthLmNsb3NlZD1iO2EuY2xvc2VkP2cuYWRkQ2xhc3MoZC5fX3VsLGsuQ0xBU1NfQ0xPU0VEKTpnLnJlbW92ZUNsYXNzKGQuX191bCxrLkNMQVNTX0NMT1NFRCk7dGhpcy5vblJlc2l6ZSgpO2lmKGQuX19jbG9zZUJ1dHRvbilkLl9fY2xvc2VCdXR0b24uaW5uZXJIVE1MPWI/ay5URVhUX09QRU46ay5URVhUX0NMT1NFRH19LGxvYWQ6e2dldDpmdW5jdGlvbigpe3JldHVybiBhLmxvYWR9fSx1c2VMb2NhbFN0b3JhZ2U6e2dldDpmdW5jdGlvbigpe3JldHVybiBlfSxzZXQ6ZnVuY3Rpb24oYSl7dSYmXG4oKGU9YSk/Zy5iaW5kKHdpbmRvdyxcInVubG9hZFwiLGIpOmcudW5iaW5kKHdpbmRvdyxcInVubG9hZFwiLGIpLGxvY2FsU3RvcmFnZS5zZXRJdGVtKGRvY3VtZW50LmxvY2F0aW9uLmhyZWYrXCIuaXNMb2NhbFwiLGEpKX19fSk7aWYoaS5pc1VuZGVmaW5lZChhLnBhcmVudCkpe2EuY2xvc2VkPWZhbHNlO2cuYWRkQ2xhc3ModGhpcy5kb21FbGVtZW50LGsuQ0xBU1NfTUFJTik7Zy5tYWtlU2VsZWN0YWJsZSh0aGlzLmRvbUVsZW1lbnQsZmFsc2UpO2lmKHUmJmUpe2QudXNlTG9jYWxTdG9yYWdlPXRydWU7dmFyIGY9bG9jYWxTdG9yYWdlLmdldEl0ZW0oZG9jdW1lbnQubG9jYXRpb24uaHJlZitcIi5ndWlcIik7aWYoZilhLmxvYWQ9SlNPTi5wYXJzZShmKX10aGlzLl9fY2xvc2VCdXR0b249ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTt0aGlzLl9fY2xvc2VCdXR0b24uaW5uZXJIVE1MPWsuVEVYVF9DTE9TRUQ7Zy5hZGRDbGFzcyh0aGlzLl9fY2xvc2VCdXR0b24say5DTEFTU19DTE9TRV9CVVRUT04pO1xudGhpcy5kb21FbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX19jbG9zZUJ1dHRvbik7Zy5iaW5kKHRoaXMuX19jbG9zZUJ1dHRvbixcImNsaWNrXCIsZnVuY3Rpb24oKXtkLmNsb3NlZD0hZC5jbG9zZWR9KX1lbHNle2lmKGEuY2xvc2VkPT09dm9pZCAwKWEuY2xvc2VkPXRydWU7dmFyIG09ZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYS5uYW1lKTtnLmFkZENsYXNzKG0sXCJjb250cm9sbGVyLW5hbWVcIik7Zj1zKGQsbSk7Zy5hZGRDbGFzcyh0aGlzLl9fdWwsay5DTEFTU19DTE9TRUQpO2cuYWRkQ2xhc3MoZixcInRpdGxlXCIpO2cuYmluZChmLFwiY2xpY2tcIixmdW5jdGlvbihhKXthLnByZXZlbnREZWZhdWx0KCk7ZC5jbG9zZWQ9IWQuY2xvc2VkO3JldHVybiBmYWxzZX0pO2lmKCFhLmNsb3NlZCl0aGlzLmNsb3NlZD1mYWxzZX1hLmF1dG9QbGFjZSYmKGkuaXNVbmRlZmluZWQoYS5wYXJlbnQpJiYoRiYmKHY9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSxnLmFkZENsYXNzKHYsXCJkZ1wiKSxnLmFkZENsYXNzKHYsXG5rLkNMQVNTX0FVVE9fUExBQ0VfQ09OVEFJTkVSKSxkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHYpLEY9ZmFsc2UpLHYuYXBwZW5kQ2hpbGQodGhpcy5kb21FbGVtZW50KSxnLmFkZENsYXNzKHRoaXMuZG9tRWxlbWVudCxrLkNMQVNTX0FVVE9fUExBQ0UpKSx0aGlzLnBhcmVudHx8RChkLGEud2lkdGgpKTtnLmJpbmQod2luZG93LFwicmVzaXplXCIsZnVuY3Rpb24oKXtkLm9uUmVzaXplKCl9KTtnLmJpbmQodGhpcy5fX3VsLFwid2Via2l0VHJhbnNpdGlvbkVuZFwiLGZ1bmN0aW9uKCl7ZC5vblJlc2l6ZSgpfSk7Zy5iaW5kKHRoaXMuX191bCxcInRyYW5zaXRpb25lbmRcIixmdW5jdGlvbigpe2Qub25SZXNpemUoKX0pO2cuYmluZCh0aGlzLl9fdWwsXCJvVHJhbnNpdGlvbkVuZFwiLGZ1bmN0aW9uKCl7ZC5vblJlc2l6ZSgpfSk7dGhpcy5vblJlc2l6ZSgpO2EucmVzaXphYmxlJiZKKHRoaXMpO2QuZ2V0Um9vdCgpO2EucGFyZW50fHxjKCl9O2sudG9nZ2xlSGlkZT1mdW5jdGlvbigpe0E9IUE7aS5lYWNoKEcsXG5mdW5jdGlvbihhKXthLmRvbUVsZW1lbnQuc3R5bGUuekluZGV4PUE/LTk5OTo5OTk7YS5kb21FbGVtZW50LnN0eWxlLm9wYWNpdHk9QT8wOjF9KX07ay5DTEFTU19BVVRPX1BMQUNFPVwiYVwiO2suQ0xBU1NfQVVUT19QTEFDRV9DT05UQUlORVI9XCJhY1wiO2suQ0xBU1NfTUFJTj1cIm1haW5cIjtrLkNMQVNTX0NPTlRST0xMRVJfUk9XPVwiY3JcIjtrLkNMQVNTX1RPT19UQUxMPVwidGFsbGVyLXRoYW4td2luZG93XCI7ay5DTEFTU19DTE9TRUQ9XCJjbG9zZWRcIjtrLkNMQVNTX0NMT1NFX0JVVFRPTj1cImNsb3NlLWJ1dHRvblwiO2suQ0xBU1NfRFJBRz1cImRyYWdcIjtrLkRFRkFVTFRfV0lEVEg9MjQ1O2suVEVYVF9DTE9TRUQ9XCJDbG9zZSBDb250cm9sc1wiO2suVEVYVF9PUEVOPVwiT3BlbiBDb250cm9sc1wiO2cuYmluZCh3aW5kb3csXCJrZXlkb3duXCIsZnVuY3Rpb24oYSl7ZG9jdW1lbnQuYWN0aXZlRWxlbWVudC50eXBlIT09XCJ0ZXh0XCImJihhLndoaWNoPT09NzJ8fGEua2V5Q29kZT09NzIpJiZrLnRvZ2dsZUhpZGUoKX0sXG5mYWxzZSk7aS5leHRlbmQoay5wcm90b3R5cGUse2FkZDpmdW5jdGlvbihhLGIpe3JldHVybiBxKHRoaXMsYSxiLHtmYWN0b3J5QXJnczpBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsMil9KX0sYWRkQ29sb3I6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gcSh0aGlzLGEsYix7Y29sb3I6dHJ1ZX0pfSxyZW1vdmU6ZnVuY3Rpb24oYSl7dGhpcy5fX3VsLnJlbW92ZUNoaWxkKGEuX19saSk7dGhpcy5fX2NvbnRyb2xsZXJzLnNsaWNlKHRoaXMuX19jb250cm9sbGVycy5pbmRleE9mKGEpLDEpO3ZhciBiPXRoaXM7aS5kZWZlcihmdW5jdGlvbigpe2Iub25SZXNpemUoKX0pfSxkZXN0cm95OmZ1bmN0aW9uKCl7dGhpcy5hdXRvUGxhY2UmJnYucmVtb3ZlQ2hpbGQodGhpcy5kb21FbGVtZW50KX0sYWRkRm9sZGVyOmZ1bmN0aW9uKGEpe2lmKHRoaXMuX19mb2xkZXJzW2FdIT09dm9pZCAwKXRocm93IEVycm9yKCdZb3UgYWxyZWFkeSBoYXZlIGEgZm9sZGVyIGluIHRoaXMgR1VJIGJ5IHRoZSBuYW1lIFwiJytcbmErJ1wiJyk7dmFyIGI9e25hbWU6YSxwYXJlbnQ6dGhpc307Yi5hdXRvUGxhY2U9dGhpcy5hdXRvUGxhY2U7aWYodGhpcy5sb2FkJiZ0aGlzLmxvYWQuZm9sZGVycyYmdGhpcy5sb2FkLmZvbGRlcnNbYV0pYi5jbG9zZWQ9dGhpcy5sb2FkLmZvbGRlcnNbYV0uY2xvc2VkLGIubG9hZD10aGlzLmxvYWQuZm9sZGVyc1thXTtiPW5ldyBrKGIpO3RoaXMuX19mb2xkZXJzW2FdPWI7YT1zKHRoaXMsYi5kb21FbGVtZW50KTtnLmFkZENsYXNzKGEsXCJmb2xkZXJcIik7cmV0dXJuIGJ9LG9wZW46ZnVuY3Rpb24oKXt0aGlzLmNsb3NlZD1mYWxzZX0sY2xvc2U6ZnVuY3Rpb24oKXt0aGlzLmNsb3NlZD10cnVlfSxvblJlc2l6ZTpmdW5jdGlvbigpe3ZhciBhPXRoaXMuZ2V0Um9vdCgpO2lmKGEuc2Nyb2xsYWJsZSl7dmFyIGI9Zy5nZXRPZmZzZXQoYS5fX3VsKS50b3AsYz0wO2kuZWFjaChhLl9fdWwuY2hpbGROb2RlcyxmdW5jdGlvbihiKXthLmF1dG9QbGFjZSYmYj09PWEuX19zYXZlX3Jvd3x8KGMrPVxuZy5nZXRIZWlnaHQoYikpfSk7d2luZG93LmlubmVySGVpZ2h0LWItMjA8Yz8oZy5hZGRDbGFzcyhhLmRvbUVsZW1lbnQsay5DTEFTU19UT09fVEFMTCksYS5fX3VsLnN0eWxlLmhlaWdodD13aW5kb3cuaW5uZXJIZWlnaHQtYi0yMCtcInB4XCIpOihnLnJlbW92ZUNsYXNzKGEuZG9tRWxlbWVudCxrLkNMQVNTX1RPT19UQUxMKSxhLl9fdWwuc3R5bGUuaGVpZ2h0PVwiYXV0b1wiKX1hLl9fcmVzaXplX2hhbmRsZSYmaS5kZWZlcihmdW5jdGlvbigpe2EuX19yZXNpemVfaGFuZGxlLnN0eWxlLmhlaWdodD1hLl9fdWwub2Zmc2V0SGVpZ2h0K1wicHhcIn0pO2lmKGEuX19jbG9zZUJ1dHRvbilhLl9fY2xvc2VCdXR0b24uc3R5bGUud2lkdGg9YS53aWR0aCtcInB4XCJ9LHJlbWVtYmVyOmZ1bmN0aW9uKCl7aWYoaS5pc1VuZGVmaW5lZCh4KSl4PW5ldyB5LHguZG9tRWxlbWVudC5pbm5lckhUTUw9YTtpZih0aGlzLnBhcmVudCl0aHJvdyBFcnJvcihcIllvdSBjYW4gb25seSBjYWxsIHJlbWVtYmVyIG9uIGEgdG9wIGxldmVsIEdVSS5cIik7XG52YXIgYj10aGlzO2kuZWFjaChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpLGZ1bmN0aW9uKGEpe2IuX19yZW1lbWJlcmVkT2JqZWN0cy5sZW5ndGg9PTAmJkkoYik7Yi5fX3JlbWVtYmVyZWRPYmplY3RzLmluZGV4T2YoYSk9PS0xJiZiLl9fcmVtZW1iZXJlZE9iamVjdHMucHVzaChhKX0pO3RoaXMuYXV0b1BsYWNlJiZEKHRoaXMsdGhpcy53aWR0aCl9LGdldFJvb3Q6ZnVuY3Rpb24oKXtmb3IodmFyIGE9dGhpczthLnBhcmVudDspYT1hLnBhcmVudDtyZXR1cm4gYX0sZ2V0U2F2ZU9iamVjdDpmdW5jdGlvbigpe3ZhciBhPXRoaXMubG9hZDthLmNsb3NlZD10aGlzLmNsb3NlZDtpZih0aGlzLl9fcmVtZW1iZXJlZE9iamVjdHMubGVuZ3RoPjApe2EucHJlc2V0PXRoaXMucHJlc2V0O2lmKCFhLnJlbWVtYmVyZWQpYS5yZW1lbWJlcmVkPXt9O2EucmVtZW1iZXJlZFt0aGlzLnByZXNldF09eih0aGlzKX1hLmZvbGRlcnM9e307aS5lYWNoKHRoaXMuX19mb2xkZXJzLGZ1bmN0aW9uKGIsXG5jKXthLmZvbGRlcnNbY109Yi5nZXRTYXZlT2JqZWN0KCl9KTtyZXR1cm4gYX0sc2F2ZTpmdW5jdGlvbigpe2lmKCF0aGlzLmxvYWQucmVtZW1iZXJlZCl0aGlzLmxvYWQucmVtZW1iZXJlZD17fTt0aGlzLmxvYWQucmVtZW1iZXJlZFt0aGlzLnByZXNldF09eih0aGlzKTtCKHRoaXMsZmFsc2UpfSxzYXZlQXM6ZnVuY3Rpb24oYSl7aWYoIXRoaXMubG9hZC5yZW1lbWJlcmVkKXRoaXMubG9hZC5yZW1lbWJlcmVkPXt9LHRoaXMubG9hZC5yZW1lbWJlcmVkW3ddPXoodGhpcyx0cnVlKTt0aGlzLmxvYWQucmVtZW1iZXJlZFthXT16KHRoaXMpO3RoaXMucHJlc2V0PWE7Qyh0aGlzLGEsdHJ1ZSl9LHJldmVydDpmdW5jdGlvbihhKXtpLmVhY2godGhpcy5fX2NvbnRyb2xsZXJzLGZ1bmN0aW9uKGIpe3RoaXMuZ2V0Um9vdCgpLmxvYWQucmVtZW1iZXJlZD90KGF8fHRoaXMuZ2V0Um9vdCgpLGIpOmIuc2V0VmFsdWUoYi5pbml0aWFsVmFsdWUpfSx0aGlzKTtpLmVhY2godGhpcy5fX2ZvbGRlcnMsXG5mdW5jdGlvbihhKXthLnJldmVydChhKX0pO2F8fEIodGhpcy5nZXRSb290KCksZmFsc2UpfSxsaXN0ZW46ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcy5fX2xpc3RlbmluZy5sZW5ndGg9PTA7dGhpcy5fX2xpc3RlbmluZy5wdXNoKGEpO2ImJkUodGhpcy5fX2xpc3RlbmluZyl9fSk7cmV0dXJuIGt9KGRhdC51dGlscy5jc3MsJzxkaXYgaWQ9XCJkZy1zYXZlXCIgY2xhc3M9XCJkZyBkaWFsb2d1ZVwiPlxcblxcbiAgSGVyZVxcJ3MgdGhlIG5ldyBsb2FkIHBhcmFtZXRlciBmb3IgeW91ciA8Y29kZT5HVUk8L2NvZGU+XFwncyBjb25zdHJ1Y3RvcjpcXG5cXG4gIDx0ZXh0YXJlYSBpZD1cImRnLW5ldy1jb25zdHJ1Y3RvclwiPjwvdGV4dGFyZWE+XFxuXFxuICA8ZGl2IGlkPVwiZGctc2F2ZS1sb2NhbGx5XCI+XFxuXFxuICAgIDxpbnB1dCBpZD1cImRnLWxvY2FsLXN0b3JhZ2VcIiB0eXBlPVwiY2hlY2tib3hcIi8+IEF1dG9tYXRpY2FsbHkgc2F2ZVxcbiAgICB2YWx1ZXMgdG8gPGNvZGU+bG9jYWxTdG9yYWdlPC9jb2RlPiBvbiBleGl0LlxcblxcbiAgICA8ZGl2IGlkPVwiZGctbG9jYWwtZXhwbGFpblwiPlRoZSB2YWx1ZXMgc2F2ZWQgdG8gPGNvZGU+bG9jYWxTdG9yYWdlPC9jb2RlPiB3aWxsXFxuICAgICAgb3ZlcnJpZGUgdGhvc2UgcGFzc2VkIHRvIDxjb2RlPmRhdC5HVUk8L2NvZGU+XFwncyBjb25zdHJ1Y3Rvci4gVGhpcyBtYWtlcyBpdFxcbiAgICAgIGVhc2llciB0byB3b3JrIGluY3JlbWVudGFsbHksIGJ1dCA8Y29kZT5sb2NhbFN0b3JhZ2U8L2NvZGU+IGlzIGZyYWdpbGUsXFxuICAgICAgYW5kIHlvdXIgZnJpZW5kcyBtYXkgbm90IHNlZSB0aGUgc2FtZSB2YWx1ZXMgeW91IGRvLlxcbiAgICAgIFxcbiAgICA8L2Rpdj5cXG4gICAgXFxuICA8L2Rpdj5cXG5cXG48L2Rpdj4nLFxuXCIuZGcgdWx7bGlzdC1zdHlsZTpub25lO21hcmdpbjowO3BhZGRpbmc6MDt3aWR0aDoxMDAlO2NsZWFyOmJvdGh9LmRnLmFje3Bvc2l0aW9uOmZpeGVkO3RvcDowO2xlZnQ6MDtyaWdodDowO2hlaWdodDowO3otaW5kZXg6MH0uZGc6bm90KC5hYykgLm1haW57b3ZlcmZsb3c6aGlkZGVufS5kZy5tYWluey13ZWJraXQtdHJhbnNpdGlvbjpvcGFjaXR5IDAuMXMgbGluZWFyOy1vLXRyYW5zaXRpb246b3BhY2l0eSAwLjFzIGxpbmVhcjstbW96LXRyYW5zaXRpb246b3BhY2l0eSAwLjFzIGxpbmVhcjt0cmFuc2l0aW9uOm9wYWNpdHkgMC4xcyBsaW5lYXJ9LmRnLm1haW4udGFsbGVyLXRoYW4td2luZG93e292ZXJmbG93LXk6YXV0b30uZGcubWFpbi50YWxsZXItdGhhbi13aW5kb3cgLmNsb3NlLWJ1dHRvbntvcGFjaXR5OjE7bWFyZ2luLXRvcDotMXB4O2JvcmRlci10b3A6MXB4IHNvbGlkICMyYzJjMmN9LmRnLm1haW4gdWwuY2xvc2VkIC5jbG9zZS1idXR0b257b3BhY2l0eToxICFpbXBvcnRhbnR9LmRnLm1haW46aG92ZXIgLmNsb3NlLWJ1dHRvbiwuZGcubWFpbiAuY2xvc2UtYnV0dG9uLmRyYWd7b3BhY2l0eToxfS5kZy5tYWluIC5jbG9zZS1idXR0b257LXdlYmtpdC10cmFuc2l0aW9uOm9wYWNpdHkgMC4xcyBsaW5lYXI7LW8tdHJhbnNpdGlvbjpvcGFjaXR5IDAuMXMgbGluZWFyOy1tb3otdHJhbnNpdGlvbjpvcGFjaXR5IDAuMXMgbGluZWFyO3RyYW5zaXRpb246b3BhY2l0eSAwLjFzIGxpbmVhcjtib3JkZXI6MDtwb3NpdGlvbjphYnNvbHV0ZTtsaW5lLWhlaWdodDoxOXB4O2hlaWdodDoyMHB4O2N1cnNvcjpwb2ludGVyO3RleHQtYWxpZ246Y2VudGVyO2JhY2tncm91bmQtY29sb3I6IzAwMH0uZGcubWFpbiAuY2xvc2UtYnV0dG9uOmhvdmVye2JhY2tncm91bmQtY29sb3I6IzExMX0uZGcuYXtmbG9hdDpyaWdodDttYXJnaW4tcmlnaHQ6MTVweDtvdmVyZmxvdy14OmhpZGRlbn0uZGcuYS5oYXMtc2F2ZSB1bHttYXJnaW4tdG9wOjI3cHh9LmRnLmEuaGFzLXNhdmUgdWwuY2xvc2Vke21hcmdpbi10b3A6MH0uZGcuYSAuc2F2ZS1yb3d7cG9zaXRpb246Zml4ZWQ7dG9wOjA7ei1pbmRleDoxMDAyfS5kZyBsaXstd2Via2l0LXRyYW5zaXRpb246aGVpZ2h0IDAuMXMgZWFzZS1vdXQ7LW8tdHJhbnNpdGlvbjpoZWlnaHQgMC4xcyBlYXNlLW91dDstbW96LXRyYW5zaXRpb246aGVpZ2h0IDAuMXMgZWFzZS1vdXQ7dHJhbnNpdGlvbjpoZWlnaHQgMC4xcyBlYXNlLW91dH0uZGcgbGk6bm90KC5mb2xkZXIpe2N1cnNvcjphdXRvO2hlaWdodDoyN3B4O2xpbmUtaGVpZ2h0OjI3cHg7b3ZlcmZsb3c6aGlkZGVuO3BhZGRpbmc6MCA0cHggMCA1cHh9LmRnIGxpLmZvbGRlcntwYWRkaW5nOjA7Ym9yZGVyLWxlZnQ6NHB4IHNvbGlkIHJnYmEoMCwwLDAsMCl9LmRnIGxpLnRpdGxle2N1cnNvcjpwb2ludGVyO21hcmdpbi1sZWZ0Oi00cHh9LmRnIC5jbG9zZWQgbGk6bm90KC50aXRsZSksLmRnIC5jbG9zZWQgdWwgbGksLmRnIC5jbG9zZWQgdWwgbGkgPiAqe2hlaWdodDowO292ZXJmbG93OmhpZGRlbjtib3JkZXI6MH0uZGcgLmNye2NsZWFyOmJvdGg7cGFkZGluZy1sZWZ0OjNweDtoZWlnaHQ6MjdweH0uZGcgLnByb3BlcnR5LW5hbWV7Y3Vyc29yOmRlZmF1bHQ7ZmxvYXQ6bGVmdDtjbGVhcjpsZWZ0O3dpZHRoOjQwJTtvdmVyZmxvdzpoaWRkZW47dGV4dC1vdmVyZmxvdzplbGxpcHNpc30uZGcgLmN7ZmxvYXQ6bGVmdDt3aWR0aDo2MCV9LmRnIC5jIGlucHV0W3R5cGU9dGV4dF17Ym9yZGVyOjA7bWFyZ2luLXRvcDo0cHg7cGFkZGluZzozcHg7d2lkdGg6MTAwJTtmbG9hdDpyaWdodH0uZGcgLmhhcy1zbGlkZXIgaW5wdXRbdHlwZT10ZXh0XXt3aWR0aDozMCU7bWFyZ2luLWxlZnQ6MH0uZGcgLnNsaWRlcntmbG9hdDpsZWZ0O3dpZHRoOjY2JTttYXJnaW4tbGVmdDotNXB4O21hcmdpbi1yaWdodDowO2hlaWdodDoxOXB4O21hcmdpbi10b3A6NHB4fS5kZyAuc2xpZGVyLWZne2hlaWdodDoxMDAlfS5kZyAuYyBpbnB1dFt0eXBlPWNoZWNrYm94XXttYXJnaW4tdG9wOjlweH0uZGcgLmMgc2VsZWN0e21hcmdpbi10b3A6NXB4fS5kZyAuY3IuZnVuY3Rpb24sLmRnIC5jci5mdW5jdGlvbiAucHJvcGVydHktbmFtZSwuZGcgLmNyLmZ1bmN0aW9uICosLmRnIC5jci5ib29sZWFuLC5kZyAuY3IuYm9vbGVhbiAqe2N1cnNvcjpwb2ludGVyfS5kZyAuc2VsZWN0b3J7ZGlzcGxheTpub25lO3Bvc2l0aW9uOmFic29sdXRlO21hcmdpbi1sZWZ0Oi05cHg7bWFyZ2luLXRvcDoyM3B4O3otaW5kZXg6MTB9LmRnIC5jOmhvdmVyIC5zZWxlY3RvciwuZGcgLnNlbGVjdG9yLmRyYWd7ZGlzcGxheTpibG9ja30uZGcgbGkuc2F2ZS1yb3d7cGFkZGluZzowfS5kZyBsaS5zYXZlLXJvdyAuYnV0dG9ue2Rpc3BsYXk6aW5saW5lLWJsb2NrO3BhZGRpbmc6MHB4IDZweH0uZGcuZGlhbG9ndWV7YmFja2dyb3VuZC1jb2xvcjojMjIyO3dpZHRoOjQ2MHB4O3BhZGRpbmc6MTVweDtmb250LXNpemU6MTNweDtsaW5lLWhlaWdodDoxNXB4fSNkZy1uZXctY29uc3RydWN0b3J7cGFkZGluZzoxMHB4O2NvbG9yOiMyMjI7Zm9udC1mYW1pbHk6TW9uYWNvLCBtb25vc3BhY2U7Zm9udC1zaXplOjEwcHg7Ym9yZGVyOjA7cmVzaXplOm5vbmU7Ym94LXNoYWRvdzppbnNldCAxcHggMXB4IDFweCAjODg4O3dvcmQtd3JhcDpicmVhay13b3JkO21hcmdpbjoxMnB4IDA7ZGlzcGxheTpibG9jazt3aWR0aDo0NDBweDtvdmVyZmxvdy15OnNjcm9sbDtoZWlnaHQ6MTAwcHg7cG9zaXRpb246cmVsYXRpdmV9I2RnLWxvY2FsLWV4cGxhaW57ZGlzcGxheTpub25lO2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE3cHg7Ym9yZGVyLXJhZGl1czozcHg7YmFja2dyb3VuZC1jb2xvcjojMzMzO3BhZGRpbmc6OHB4O21hcmdpbi10b3A6MTBweH0jZGctbG9jYWwtZXhwbGFpbiBjb2Rle2ZvbnQtc2l6ZToxMHB4fSNkYXQtZ3VpLXNhdmUtbG9jYWxseXtkaXNwbGF5Om5vbmV9LmRne2NvbG9yOiNlZWU7Zm9udDoxMXB4ICdMdWNpZGEgR3JhbmRlJywgc2Fucy1zZXJpZjt0ZXh0LXNoYWRvdzowIC0xcHggMCAjMTExfS5kZy5tYWluOjotd2Via2l0LXNjcm9sbGJhcnt3aWR0aDo1cHg7YmFja2dyb3VuZDojMWExYTFhfS5kZy5tYWluOjotd2Via2l0LXNjcm9sbGJhci1jb3JuZXJ7aGVpZ2h0OjA7ZGlzcGxheTpub25lfS5kZy5tYWluOjotd2Via2l0LXNjcm9sbGJhci10aHVtYntib3JkZXItcmFkaXVzOjVweDtiYWNrZ3JvdW5kOiM2NzY3Njd9LmRnIGxpOm5vdCguZm9sZGVyKXtiYWNrZ3JvdW5kOiMxYTFhMWE7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgIzJjMmMyY30uZGcgbGkuc2F2ZS1yb3d7bGluZS1oZWlnaHQ6MjVweDtiYWNrZ3JvdW5kOiNkYWQ1Y2I7Ym9yZGVyOjB9LmRnIGxpLnNhdmUtcm93IHNlbGVjdHttYXJnaW4tbGVmdDo1cHg7d2lkdGg6MTA4cHh9LmRnIGxpLnNhdmUtcm93IC5idXR0b257bWFyZ2luLWxlZnQ6NXB4O21hcmdpbi10b3A6MXB4O2JvcmRlci1yYWRpdXM6MnB4O2ZvbnQtc2l6ZTo5cHg7bGluZS1oZWlnaHQ6N3B4O3BhZGRpbmc6NHB4IDRweCA1cHggNHB4O2JhY2tncm91bmQ6I2M1YmRhZDtjb2xvcjojZmZmO3RleHQtc2hhZG93OjAgMXB4IDAgI2IwYTU4Zjtib3gtc2hhZG93OjAgLTFweCAwICNiMGE1OGY7Y3Vyc29yOnBvaW50ZXJ9LmRnIGxpLnNhdmUtcm93IC5idXR0b24uZ2VhcnN7YmFja2dyb3VuZDojYzViZGFkIHVybChkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUFzQUFBQU5DQVlBQUFCLzlaUTdBQUFBR1hSRldIUlRiMlowZDJGeVpRQkJaRzlpWlNCSmJXRm5aVkpsWVdSNWNjbGxQQUFBQVFKSlJFRlVlTnBpWUtBVS9QLy9Qd0dJQy9BcENBQmlCU0FXK0k4QUNsQWNnS3hRNFQ5aG9NQUVVcnh4MlFTR042K2VnRFgrL3ZXVDRlN044MkFNWW9QQXgvZXZ3V29Zb1NZYkFDWDJzN0t4Q3h6Y3NlekRoM2V2Rm9ERUJZVEVFcXljZ2dXQXpBOUF1VVNRUWdlWVBhOWZQdjYvWVdtL0FjeDVJUGI3dHkvZncrUVpibHc2N3ZEczhSMFlIeVFoZ09ieCt5QUprQnFtRzVkUFBEaDFhUE9HUi9ldWdXMEc0dmxJb1RJZnlGY0ErUWVraGhISmhQZFF4YmlBSWd1TUJUUVpyUEQ3MTA4TTZyb1dZREZRaUlBQXY2QW93LzFiRndYZ2lzK2YyTFVBeW53b0lhTmN6OFhOeDNEbDdNRUpVREdRcHg5Z3RROFlDdWVCK0QyNk9FQ0FBUURhZHQ3ZTQ2RDQyUUFBQUFCSlJVNUVya0pnZ2c9PSkgMnB4IDFweCBuby1yZXBlYXQ7aGVpZ2h0OjdweDt3aWR0aDo4cHh9LmRnIGxpLnNhdmUtcm93IC5idXR0b246aG92ZXJ7YmFja2dyb3VuZC1jb2xvcjojYmFiMTllO2JveC1zaGFkb3c6MCAtMXB4IDAgI2IwYTU4Zn0uZGcgbGkuZm9sZGVye2JvcmRlci1ib3R0b206MH0uZGcgbGkudGl0bGV7cGFkZGluZy1sZWZ0OjE2cHg7YmFja2dyb3VuZDojMDAwIHVybChkYXRhOmltYWdlL2dpZjtiYXNlNjQsUjBsR09EbGhCUUFGQUpFQUFQLy8vL1B6OC8vLy8vLy8veUg1QkFFQUFBSUFMQUFBQUFBRkFBVUFBQUlJbEkraEtnRnhvQ2dBT3c9PSkgNnB4IDEwcHggbm8tcmVwZWF0O2N1cnNvcjpwb2ludGVyO2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHJnYmEoMjU1LDI1NSwyNTUsMC4yKX0uZGcgLmNsb3NlZCBsaS50aXRsZXtiYWNrZ3JvdW5kLWltYWdlOnVybChkYXRhOmltYWdlL2dpZjtiYXNlNjQsUjBsR09EbGhCUUFGQUpFQUFQLy8vL1B6OC8vLy8vLy8veUg1QkFFQUFBSUFMQUFBQUFBRkFBVUFBQUlJbEdJV3FNQ2JXQUVBT3c9PSl9LmRnIC5jci5ib29sZWFue2JvcmRlci1sZWZ0OjNweCBzb2xpZCAjODA2Nzg3fS5kZyAuY3IuZnVuY3Rpb257Ym9yZGVyLWxlZnQ6M3B4IHNvbGlkICNlNjFkNWZ9LmRnIC5jci5udW1iZXJ7Ym9yZGVyLWxlZnQ6M3B4IHNvbGlkICMyZmExZDZ9LmRnIC5jci5udW1iZXIgaW5wdXRbdHlwZT10ZXh0XXtjb2xvcjojMmZhMWQ2fS5kZyAuY3Iuc3RyaW5ne2JvcmRlci1sZWZ0OjNweCBzb2xpZCAjMWVkMzZmfS5kZyAuY3Iuc3RyaW5nIGlucHV0W3R5cGU9dGV4dF17Y29sb3I6IzFlZDM2Zn0uZGcgLmNyLmZ1bmN0aW9uOmhvdmVyLC5kZyAuY3IuYm9vbGVhbjpob3ZlcntiYWNrZ3JvdW5kOiMxMTF9LmRnIC5jIGlucHV0W3R5cGU9dGV4dF17YmFja2dyb3VuZDojMzAzMDMwO291dGxpbmU6bm9uZX0uZGcgLmMgaW5wdXRbdHlwZT10ZXh0XTpob3ZlcntiYWNrZ3JvdW5kOiMzYzNjM2N9LmRnIC5jIGlucHV0W3R5cGU9dGV4dF06Zm9jdXN7YmFja2dyb3VuZDojNDk0OTQ5O2NvbG9yOiNmZmZ9LmRnIC5jIC5zbGlkZXJ7YmFja2dyb3VuZDojMzAzMDMwO2N1cnNvcjpldy1yZXNpemV9LmRnIC5jIC5zbGlkZXItZmd7YmFja2dyb3VuZDojMmZhMWQ2fS5kZyAuYyAuc2xpZGVyOmhvdmVye2JhY2tncm91bmQ6IzNjM2MzY30uZGcgLmMgLnNsaWRlcjpob3ZlciAuc2xpZGVyLWZne2JhY2tncm91bmQ6IzQ0YWJkYX1cXG5cIixcbmRhdC5jb250cm9sbGVycy5mYWN0b3J5PWZ1bmN0aW9uKGUsYSxjLGQsZixiLG4pe3JldHVybiBmdW5jdGlvbihoLGosbSxsKXt2YXIgbz1oW2pdO2lmKG4uaXNBcnJheShtKXx8bi5pc09iamVjdChtKSlyZXR1cm4gbmV3IGUoaCxqLG0pO2lmKG4uaXNOdW1iZXIobykpcmV0dXJuIG4uaXNOdW1iZXIobSkmJm4uaXNOdW1iZXIobCk/bmV3IGMoaCxqLG0sbCk6bmV3IGEoaCxqLHttaW46bSxtYXg6bH0pO2lmKG4uaXNTdHJpbmcobykpcmV0dXJuIG5ldyBkKGgsaik7aWYobi5pc0Z1bmN0aW9uKG8pKXJldHVybiBuZXcgZihoLGosXCJcIik7aWYobi5pc0Jvb2xlYW4obykpcmV0dXJuIG5ldyBiKGgsail9fShkYXQuY29udHJvbGxlcnMuT3B0aW9uQ29udHJvbGxlcixkYXQuY29udHJvbGxlcnMuTnVtYmVyQ29udHJvbGxlckJveCxkYXQuY29udHJvbGxlcnMuTnVtYmVyQ29udHJvbGxlclNsaWRlcixkYXQuY29udHJvbGxlcnMuU3RyaW5nQ29udHJvbGxlcj1mdW5jdGlvbihlLGEsYyl7dmFyIGQ9XG5mdW5jdGlvbihjLGIpe2Z1bmN0aW9uIGUoKXtoLnNldFZhbHVlKGguX19pbnB1dC52YWx1ZSl9ZC5zdXBlcmNsYXNzLmNhbGwodGhpcyxjLGIpO3ZhciBoPXRoaXM7dGhpcy5fX2lucHV0PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTt0aGlzLl9faW5wdXQuc2V0QXR0cmlidXRlKFwidHlwZVwiLFwidGV4dFwiKTthLmJpbmQodGhpcy5fX2lucHV0LFwia2V5dXBcIixlKTthLmJpbmQodGhpcy5fX2lucHV0LFwiY2hhbmdlXCIsZSk7YS5iaW5kKHRoaXMuX19pbnB1dCxcImJsdXJcIixmdW5jdGlvbigpe2guX19vbkZpbmlzaENoYW5nZSYmaC5fX29uRmluaXNoQ2hhbmdlLmNhbGwoaCxoLmdldFZhbHVlKCkpfSk7YS5iaW5kKHRoaXMuX19pbnB1dCxcImtleWRvd25cIixmdW5jdGlvbihhKXthLmtleUNvZGU9PT0xMyYmdGhpcy5ibHVyKCl9KTt0aGlzLnVwZGF0ZURpc3BsYXkoKTt0aGlzLmRvbUVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5fX2lucHV0KX07ZC5zdXBlcmNsYXNzPWU7Yy5leHRlbmQoZC5wcm90b3R5cGUsXG5lLnByb3RvdHlwZSx7dXBkYXRlRGlzcGxheTpmdW5jdGlvbigpe2lmKCFhLmlzQWN0aXZlKHRoaXMuX19pbnB1dCkpdGhpcy5fX2lucHV0LnZhbHVlPXRoaXMuZ2V0VmFsdWUoKTtyZXR1cm4gZC5zdXBlcmNsYXNzLnByb3RvdHlwZS51cGRhdGVEaXNwbGF5LmNhbGwodGhpcyl9fSk7cmV0dXJuIGR9KGRhdC5jb250cm9sbGVycy5Db250cm9sbGVyLGRhdC5kb20uZG9tLGRhdC51dGlscy5jb21tb24pLGRhdC5jb250cm9sbGVycy5GdW5jdGlvbkNvbnRyb2xsZXIsZGF0LmNvbnRyb2xsZXJzLkJvb2xlYW5Db250cm9sbGVyLGRhdC51dGlscy5jb21tb24pLGRhdC5jb250cm9sbGVycy5Db250cm9sbGVyLGRhdC5jb250cm9sbGVycy5Cb29sZWFuQ29udHJvbGxlcixkYXQuY29udHJvbGxlcnMuRnVuY3Rpb25Db250cm9sbGVyLGRhdC5jb250cm9sbGVycy5OdW1iZXJDb250cm9sbGVyQm94LGRhdC5jb250cm9sbGVycy5OdW1iZXJDb250cm9sbGVyU2xpZGVyLGRhdC5jb250cm9sbGVycy5PcHRpb25Db250cm9sbGVyLFxuZGF0LmNvbnRyb2xsZXJzLkNvbG9yQ29udHJvbGxlcj1mdW5jdGlvbihlLGEsYyxkLGYpe2Z1bmN0aW9uIGIoYSxiLGMsZCl7YS5zdHlsZS5iYWNrZ3JvdW5kPVwiXCI7Zi5lYWNoKGosZnVuY3Rpb24oZSl7YS5zdHlsZS5jc3NUZXh0Kz1cImJhY2tncm91bmQ6IFwiK2UrXCJsaW5lYXItZ3JhZGllbnQoXCIrYitcIiwgXCIrYytcIiAwJSwgXCIrZCtcIiAxMDAlKTsgXCJ9KX1mdW5jdGlvbiBuKGEpe2Euc3R5bGUuYmFja2dyb3VuZD1cIlwiO2Euc3R5bGUuY3NzVGV4dCs9XCJiYWNrZ3JvdW5kOiAtbW96LWxpbmVhci1ncmFkaWVudCh0b3AsICAjZmYwMDAwIDAlLCAjZmYwMGZmIDE3JSwgIzAwMDBmZiAzNCUsICMwMGZmZmYgNTAlLCAjMDBmZjAwIDY3JSwgI2ZmZmYwMCA4NCUsICNmZjAwMDAgMTAwJSk7XCI7YS5zdHlsZS5jc3NUZXh0Kz1cImJhY2tncm91bmQ6IC13ZWJraXQtbGluZWFyLWdyYWRpZW50KHRvcCwgICNmZjAwMDAgMCUsI2ZmMDBmZiAxNyUsIzAwMDBmZiAzNCUsIzAwZmZmZiA1MCUsIzAwZmYwMCA2NyUsI2ZmZmYwMCA4NCUsI2ZmMDAwMCAxMDAlKTtcIjtcbmEuc3R5bGUuY3NzVGV4dCs9XCJiYWNrZ3JvdW5kOiAtby1saW5lYXItZ3JhZGllbnQodG9wLCAgI2ZmMDAwMCAwJSwjZmYwMGZmIDE3JSwjMDAwMGZmIDM0JSwjMDBmZmZmIDUwJSwjMDBmZjAwIDY3JSwjZmZmZjAwIDg0JSwjZmYwMDAwIDEwMCUpO1wiO2Euc3R5bGUuY3NzVGV4dCs9XCJiYWNrZ3JvdW5kOiAtbXMtbGluZWFyLWdyYWRpZW50KHRvcCwgICNmZjAwMDAgMCUsI2ZmMDBmZiAxNyUsIzAwMDBmZiAzNCUsIzAwZmZmZiA1MCUsIzAwZmYwMCA2NyUsI2ZmZmYwMCA4NCUsI2ZmMDAwMCAxMDAlKTtcIjthLnN0eWxlLmNzc1RleHQrPVwiYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KHRvcCwgICNmZjAwMDAgMCUsI2ZmMDBmZiAxNyUsIzAwMDBmZiAzNCUsIzAwZmZmZiA1MCUsIzAwZmYwMCA2NyUsI2ZmZmYwMCA4NCUsI2ZmMDAwMCAxMDAlKTtcIn12YXIgaD1mdW5jdGlvbihlLGwpe2Z1bmN0aW9uIG8oYil7cShiKTthLmJpbmQod2luZG93LFwibW91c2Vtb3ZlXCIscSk7YS5iaW5kKHdpbmRvdyxcblwibW91c2V1cFwiLGopfWZ1bmN0aW9uIGooKXthLnVuYmluZCh3aW5kb3csXCJtb3VzZW1vdmVcIixxKTthLnVuYmluZCh3aW5kb3csXCJtb3VzZXVwXCIsail9ZnVuY3Rpb24gZygpe3ZhciBhPWQodGhpcy52YWx1ZSk7YSE9PWZhbHNlPyhwLl9fY29sb3IuX19zdGF0ZT1hLHAuc2V0VmFsdWUocC5fX2NvbG9yLnRvT3JpZ2luYWwoKSkpOnRoaXMudmFsdWU9cC5fX2NvbG9yLnRvU3RyaW5nKCl9ZnVuY3Rpb24gaSgpe2EudW5iaW5kKHdpbmRvdyxcIm1vdXNlbW92ZVwiLHMpO2EudW5iaW5kKHdpbmRvdyxcIm1vdXNldXBcIixpKX1mdW5jdGlvbiBxKGIpe2IucHJldmVudERlZmF1bHQoKTt2YXIgYz1hLmdldFdpZHRoKHAuX19zYXR1cmF0aW9uX2ZpZWxkKSxkPWEuZ2V0T2Zmc2V0KHAuX19zYXR1cmF0aW9uX2ZpZWxkKSxlPShiLmNsaWVudFgtZC5sZWZ0K2RvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdCkvYyxiPTEtKGIuY2xpZW50WS1kLnRvcCtkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCkvYztiPjE/Yj1cbjE6YjwwJiYoYj0wKTtlPjE/ZT0xOmU8MCYmKGU9MCk7cC5fX2NvbG9yLnY9YjtwLl9fY29sb3Iucz1lO3Auc2V0VmFsdWUocC5fX2NvbG9yLnRvT3JpZ2luYWwoKSk7cmV0dXJuIGZhbHNlfWZ1bmN0aW9uIHMoYil7Yi5wcmV2ZW50RGVmYXVsdCgpO3ZhciBjPWEuZ2V0SGVpZ2h0KHAuX19odWVfZmllbGQpLGQ9YS5nZXRPZmZzZXQocC5fX2h1ZV9maWVsZCksYj0xLShiLmNsaWVudFktZC50b3ArZG9jdW1lbnQuYm9keS5zY3JvbGxUb3ApL2M7Yj4xP2I9MTpiPDAmJihiPTApO3AuX19jb2xvci5oPWIqMzYwO3Auc2V0VmFsdWUocC5fX2NvbG9yLnRvT3JpZ2luYWwoKSk7cmV0dXJuIGZhbHNlfWguc3VwZXJjbGFzcy5jYWxsKHRoaXMsZSxsKTt0aGlzLl9fY29sb3I9bmV3IGModGhpcy5nZXRWYWx1ZSgpKTt0aGlzLl9fdGVtcD1uZXcgYygwKTt2YXIgcD10aGlzO3RoaXMuZG9tRWxlbWVudD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO2EubWFrZVNlbGVjdGFibGUodGhpcy5kb21FbGVtZW50LFxuZmFsc2UpO3RoaXMuX19zZWxlY3Rvcj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO3RoaXMuX19zZWxlY3Rvci5jbGFzc05hbWU9XCJzZWxlY3RvclwiO3RoaXMuX19zYXR1cmF0aW9uX2ZpZWxkPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7dGhpcy5fX3NhdHVyYXRpb25fZmllbGQuY2xhc3NOYW1lPVwic2F0dXJhdGlvbi1maWVsZFwiO3RoaXMuX19maWVsZF9rbm9iPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7dGhpcy5fX2ZpZWxkX2tub2IuY2xhc3NOYW1lPVwiZmllbGQta25vYlwiO3RoaXMuX19maWVsZF9rbm9iX2JvcmRlcj1cIjJweCBzb2xpZCBcIjt0aGlzLl9faHVlX2tub2I9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTt0aGlzLl9faHVlX2tub2IuY2xhc3NOYW1lPVwiaHVlLWtub2JcIjt0aGlzLl9faHVlX2ZpZWxkPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7dGhpcy5fX2h1ZV9maWVsZC5jbGFzc05hbWU9XCJodWUtZmllbGRcIjt0aGlzLl9faW5wdXQ9XG5kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7dGhpcy5fX2lucHV0LnR5cGU9XCJ0ZXh0XCI7dGhpcy5fX2lucHV0X3RleHRTaGFkb3c9XCIwIDFweCAxcHggXCI7YS5iaW5kKHRoaXMuX19pbnB1dCxcImtleWRvd25cIixmdW5jdGlvbihhKXthLmtleUNvZGU9PT0xMyYmZy5jYWxsKHRoaXMpfSk7YS5iaW5kKHRoaXMuX19pbnB1dCxcImJsdXJcIixnKTthLmJpbmQodGhpcy5fX3NlbGVjdG9yLFwibW91c2Vkb3duXCIsZnVuY3Rpb24oKXthLmFkZENsYXNzKHRoaXMsXCJkcmFnXCIpLmJpbmQod2luZG93LFwibW91c2V1cFwiLGZ1bmN0aW9uKCl7YS5yZW1vdmVDbGFzcyhwLl9fc2VsZWN0b3IsXCJkcmFnXCIpfSl9KTt2YXIgdD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO2YuZXh0ZW5kKHRoaXMuX19zZWxlY3Rvci5zdHlsZSx7d2lkdGg6XCIxMjJweFwiLGhlaWdodDpcIjEwMnB4XCIscGFkZGluZzpcIjNweFwiLGJhY2tncm91bmRDb2xvcjpcIiMyMjJcIixib3hTaGFkb3c6XCIwcHggMXB4IDNweCByZ2JhKDAsMCwwLDAuMylcIn0pO1xuZi5leHRlbmQodGhpcy5fX2ZpZWxkX2tub2Iuc3R5bGUse3Bvc2l0aW9uOlwiYWJzb2x1dGVcIix3aWR0aDpcIjEycHhcIixoZWlnaHQ6XCIxMnB4XCIsYm9yZGVyOnRoaXMuX19maWVsZF9rbm9iX2JvcmRlcisodGhpcy5fX2NvbG9yLnY8MC41P1wiI2ZmZlwiOlwiIzAwMFwiKSxib3hTaGFkb3c6XCIwcHggMXB4IDNweCByZ2JhKDAsMCwwLDAuNSlcIixib3JkZXJSYWRpdXM6XCIxMnB4XCIsekluZGV4OjF9KTtmLmV4dGVuZCh0aGlzLl9faHVlX2tub2Iuc3R5bGUse3Bvc2l0aW9uOlwiYWJzb2x1dGVcIix3aWR0aDpcIjE1cHhcIixoZWlnaHQ6XCIycHhcIixib3JkZXJSaWdodDpcIjRweCBzb2xpZCAjZmZmXCIsekluZGV4OjF9KTtmLmV4dGVuZCh0aGlzLl9fc2F0dXJhdGlvbl9maWVsZC5zdHlsZSx7d2lkdGg6XCIxMDBweFwiLGhlaWdodDpcIjEwMHB4XCIsYm9yZGVyOlwiMXB4IHNvbGlkICM1NTVcIixtYXJnaW5SaWdodDpcIjNweFwiLGRpc3BsYXk6XCJpbmxpbmUtYmxvY2tcIixjdXJzb3I6XCJwb2ludGVyXCJ9KTtmLmV4dGVuZCh0LnN0eWxlLFxue3dpZHRoOlwiMTAwJVwiLGhlaWdodDpcIjEwMCVcIixiYWNrZ3JvdW5kOlwibm9uZVwifSk7Yih0LFwidG9wXCIsXCJyZ2JhKDAsMCwwLDApXCIsXCIjMDAwXCIpO2YuZXh0ZW5kKHRoaXMuX19odWVfZmllbGQuc3R5bGUse3dpZHRoOlwiMTVweFwiLGhlaWdodDpcIjEwMHB4XCIsZGlzcGxheTpcImlubGluZS1ibG9ja1wiLGJvcmRlcjpcIjFweCBzb2xpZCAjNTU1XCIsY3Vyc29yOlwibnMtcmVzaXplXCJ9KTtuKHRoaXMuX19odWVfZmllbGQpO2YuZXh0ZW5kKHRoaXMuX19pbnB1dC5zdHlsZSx7b3V0bGluZTpcIm5vbmVcIix0ZXh0QWxpZ246XCJjZW50ZXJcIixjb2xvcjpcIiNmZmZcIixib3JkZXI6MCxmb250V2VpZ2h0OlwiYm9sZFwiLHRleHRTaGFkb3c6dGhpcy5fX2lucHV0X3RleHRTaGFkb3crXCJyZ2JhKDAsMCwwLDAuNylcIn0pO2EuYmluZCh0aGlzLl9fc2F0dXJhdGlvbl9maWVsZCxcIm1vdXNlZG93blwiLG8pO2EuYmluZCh0aGlzLl9fZmllbGRfa25vYixcIm1vdXNlZG93blwiLG8pO2EuYmluZCh0aGlzLl9faHVlX2ZpZWxkLFwibW91c2Vkb3duXCIsXG5mdW5jdGlvbihiKXtzKGIpO2EuYmluZCh3aW5kb3csXCJtb3VzZW1vdmVcIixzKTthLmJpbmQod2luZG93LFwibW91c2V1cFwiLGkpfSk7dGhpcy5fX3NhdHVyYXRpb25fZmllbGQuYXBwZW5kQ2hpbGQodCk7dGhpcy5fX3NlbGVjdG9yLmFwcGVuZENoaWxkKHRoaXMuX19maWVsZF9rbm9iKTt0aGlzLl9fc2VsZWN0b3IuYXBwZW5kQ2hpbGQodGhpcy5fX3NhdHVyYXRpb25fZmllbGQpO3RoaXMuX19zZWxlY3Rvci5hcHBlbmRDaGlsZCh0aGlzLl9faHVlX2ZpZWxkKTt0aGlzLl9faHVlX2ZpZWxkLmFwcGVuZENoaWxkKHRoaXMuX19odWVfa25vYik7dGhpcy5kb21FbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX19pbnB1dCk7dGhpcy5kb21FbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX19zZWxlY3Rvcik7dGhpcy51cGRhdGVEaXNwbGF5KCl9O2guc3VwZXJjbGFzcz1lO2YuZXh0ZW5kKGgucHJvdG90eXBlLGUucHJvdG90eXBlLHt1cGRhdGVEaXNwbGF5OmZ1bmN0aW9uKCl7dmFyIGE9ZCh0aGlzLmdldFZhbHVlKCkpO1xuaWYoYSE9PWZhbHNlKXt2YXIgZT1mYWxzZTtmLmVhY2goYy5DT01QT05FTlRTLGZ1bmN0aW9uKGIpe2lmKCFmLmlzVW5kZWZpbmVkKGFbYl0pJiYhZi5pc1VuZGVmaW5lZCh0aGlzLl9fY29sb3IuX19zdGF0ZVtiXSkmJmFbYl0hPT10aGlzLl9fY29sb3IuX19zdGF0ZVtiXSlyZXR1cm4gZT10cnVlLHt9fSx0aGlzKTtlJiZmLmV4dGVuZCh0aGlzLl9fY29sb3IuX19zdGF0ZSxhKX1mLmV4dGVuZCh0aGlzLl9fdGVtcC5fX3N0YXRlLHRoaXMuX19jb2xvci5fX3N0YXRlKTt0aGlzLl9fdGVtcC5hPTE7dmFyIGg9dGhpcy5fX2NvbG9yLnY8MC41fHx0aGlzLl9fY29sb3Iucz4wLjU/MjU1OjAsaj0yNTUtaDtmLmV4dGVuZCh0aGlzLl9fZmllbGRfa25vYi5zdHlsZSx7bWFyZ2luTGVmdDoxMDAqdGhpcy5fX2NvbG9yLnMtNytcInB4XCIsbWFyZ2luVG9wOjEwMCooMS10aGlzLl9fY29sb3IudiktNytcInB4XCIsYmFja2dyb3VuZENvbG9yOnRoaXMuX190ZW1wLnRvU3RyaW5nKCksYm9yZGVyOnRoaXMuX19maWVsZF9rbm9iX2JvcmRlcitcblwicmdiKFwiK2grXCIsXCIraCtcIixcIitoK1wiKVwifSk7dGhpcy5fX2h1ZV9rbm9iLnN0eWxlLm1hcmdpblRvcD0oMS10aGlzLl9fY29sb3IuaC8zNjApKjEwMCtcInB4XCI7dGhpcy5fX3RlbXAucz0xO3RoaXMuX190ZW1wLnY9MTtiKHRoaXMuX19zYXR1cmF0aW9uX2ZpZWxkLFwibGVmdFwiLFwiI2ZmZlwiLHRoaXMuX190ZW1wLnRvU3RyaW5nKCkpO2YuZXh0ZW5kKHRoaXMuX19pbnB1dC5zdHlsZSx7YmFja2dyb3VuZENvbG9yOnRoaXMuX19pbnB1dC52YWx1ZT10aGlzLl9fY29sb3IudG9TdHJpbmcoKSxjb2xvcjpcInJnYihcIitoK1wiLFwiK2grXCIsXCIraCtcIilcIix0ZXh0U2hhZG93OnRoaXMuX19pbnB1dF90ZXh0U2hhZG93K1wicmdiYShcIitqK1wiLFwiK2orXCIsXCIraitcIiwuNylcIn0pfX0pO3ZhciBqPVtcIi1tb3otXCIsXCItby1cIixcIi13ZWJraXQtXCIsXCItbXMtXCIsXCJcIl07cmV0dXJuIGh9KGRhdC5jb250cm9sbGVycy5Db250cm9sbGVyLGRhdC5kb20uZG9tLGRhdC5jb2xvci5Db2xvcj1mdW5jdGlvbihlLGEsYyxkKXtmdW5jdGlvbiBmKGEsXG5iLGMpe09iamVjdC5kZWZpbmVQcm9wZXJ0eShhLGIse2dldDpmdW5jdGlvbigpe2lmKHRoaXMuX19zdGF0ZS5zcGFjZT09PVwiUkdCXCIpcmV0dXJuIHRoaXMuX19zdGF0ZVtiXTtuKHRoaXMsYixjKTtyZXR1cm4gdGhpcy5fX3N0YXRlW2JdfSxzZXQ6ZnVuY3Rpb24oYSl7aWYodGhpcy5fX3N0YXRlLnNwYWNlIT09XCJSR0JcIiluKHRoaXMsYixjKSx0aGlzLl9fc3RhdGUuc3BhY2U9XCJSR0JcIjt0aGlzLl9fc3RhdGVbYl09YX19KX1mdW5jdGlvbiBiKGEsYil7T2JqZWN0LmRlZmluZVByb3BlcnR5KGEsYix7Z2V0OmZ1bmN0aW9uKCl7aWYodGhpcy5fX3N0YXRlLnNwYWNlPT09XCJIU1ZcIilyZXR1cm4gdGhpcy5fX3N0YXRlW2JdO2godGhpcyk7cmV0dXJuIHRoaXMuX19zdGF0ZVtiXX0sc2V0OmZ1bmN0aW9uKGEpe2lmKHRoaXMuX19zdGF0ZS5zcGFjZSE9PVwiSFNWXCIpaCh0aGlzKSx0aGlzLl9fc3RhdGUuc3BhY2U9XCJIU1ZcIjt0aGlzLl9fc3RhdGVbYl09YX19KX1mdW5jdGlvbiBuKGIsYyxlKXtpZihiLl9fc3RhdGUuc3BhY2U9PT1cblwiSEVYXCIpYi5fX3N0YXRlW2NdPWEuY29tcG9uZW50X2Zyb21faGV4KGIuX19zdGF0ZS5oZXgsZSk7ZWxzZSBpZihiLl9fc3RhdGUuc3BhY2U9PT1cIkhTVlwiKWQuZXh0ZW5kKGIuX19zdGF0ZSxhLmhzdl90b19yZ2IoYi5fX3N0YXRlLmgsYi5fX3N0YXRlLnMsYi5fX3N0YXRlLnYpKTtlbHNlIHRocm93XCJDb3JydXB0ZWQgY29sb3Igc3RhdGVcIjt9ZnVuY3Rpb24gaChiKXt2YXIgYz1hLnJnYl90b19oc3YoYi5yLGIuZyxiLmIpO2QuZXh0ZW5kKGIuX19zdGF0ZSx7czpjLnMsdjpjLnZ9KTtpZihkLmlzTmFOKGMuaCkpe2lmKGQuaXNVbmRlZmluZWQoYi5fX3N0YXRlLmgpKWIuX19zdGF0ZS5oPTB9ZWxzZSBiLl9fc3RhdGUuaD1jLmh9dmFyIGo9ZnVuY3Rpb24oKXt0aGlzLl9fc3RhdGU9ZS5hcHBseSh0aGlzLGFyZ3VtZW50cyk7aWYodGhpcy5fX3N0YXRlPT09ZmFsc2UpdGhyb3dcIkZhaWxlZCB0byBpbnRlcnByZXQgY29sb3IgYXJndW1lbnRzXCI7dGhpcy5fX3N0YXRlLmE9dGhpcy5fX3N0YXRlLmF8fFxuMX07ai5DT01QT05FTlRTPVwicixnLGIsaCxzLHYsaGV4LGFcIi5zcGxpdChcIixcIik7ZC5leHRlbmQoai5wcm90b3R5cGUse3RvU3RyaW5nOmZ1bmN0aW9uKCl7cmV0dXJuIGModGhpcyl9LHRvT3JpZ2luYWw6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fX3N0YXRlLmNvbnZlcnNpb24ud3JpdGUodGhpcyl9fSk7ZihqLnByb3RvdHlwZSxcInJcIiwyKTtmKGoucHJvdG90eXBlLFwiZ1wiLDEpO2Yoai5wcm90b3R5cGUsXCJiXCIsMCk7YihqLnByb3RvdHlwZSxcImhcIik7YihqLnByb3RvdHlwZSxcInNcIik7YihqLnByb3RvdHlwZSxcInZcIik7T2JqZWN0LmRlZmluZVByb3BlcnR5KGoucHJvdG90eXBlLFwiYVwiLHtnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fX3N0YXRlLmF9LHNldDpmdW5jdGlvbihhKXt0aGlzLl9fc3RhdGUuYT1hfX0pO09iamVjdC5kZWZpbmVQcm9wZXJ0eShqLnByb3RvdHlwZSxcImhleFwiLHtnZXQ6ZnVuY3Rpb24oKXtpZighdGhpcy5fX3N0YXRlLnNwYWNlIT09XCJIRVhcIil0aGlzLl9fc3RhdGUuaGV4PVxuYS5yZ2JfdG9faGV4KHRoaXMucix0aGlzLmcsdGhpcy5iKTtyZXR1cm4gdGhpcy5fX3N0YXRlLmhleH0sc2V0OmZ1bmN0aW9uKGEpe3RoaXMuX19zdGF0ZS5zcGFjZT1cIkhFWFwiO3RoaXMuX19zdGF0ZS5oZXg9YX19KTtyZXR1cm4gan0oZGF0LmNvbG9yLmludGVycHJldCxkYXQuY29sb3IubWF0aD1mdW5jdGlvbigpe3ZhciBlO3JldHVybntoc3ZfdG9fcmdiOmZ1bmN0aW9uKGEsYyxkKXt2YXIgZT1hLzYwLU1hdGguZmxvb3IoYS82MCksYj1kKigxLWMpLG49ZCooMS1lKmMpLGM9ZCooMS0oMS1lKSpjKSxhPVtbZCxjLGJdLFtuLGQsYl0sW2IsZCxjXSxbYixuLGRdLFtjLGIsZF0sW2QsYixuXV1bTWF0aC5mbG9vcihhLzYwKSU2XTtyZXR1cm57cjphWzBdKjI1NSxnOmFbMV0qMjU1LGI6YVsyXSoyNTV9fSxyZ2JfdG9faHN2OmZ1bmN0aW9uKGEsYyxkKXt2YXIgZT1NYXRoLm1pbihhLGMsZCksYj1NYXRoLm1heChhLGMsZCksZT1iLWU7aWYoYj09MClyZXR1cm57aDpOYU4sczowLHY6MH07XG5hPWE9PWI/KGMtZCkvZTpjPT1iPzIrKGQtYSkvZTo0KyhhLWMpL2U7YS89NjthPDAmJihhKz0xKTtyZXR1cm57aDphKjM2MCxzOmUvYix2OmIvMjU1fX0scmdiX3RvX2hleDpmdW5jdGlvbihhLGMsZCl7YT10aGlzLmhleF93aXRoX2NvbXBvbmVudCgwLDIsYSk7YT10aGlzLmhleF93aXRoX2NvbXBvbmVudChhLDEsYyk7cmV0dXJuIGE9dGhpcy5oZXhfd2l0aF9jb21wb25lbnQoYSwwLGQpfSxjb21wb25lbnRfZnJvbV9oZXg6ZnVuY3Rpb24oYSxjKXtyZXR1cm4gYT4+Yyo4JjI1NX0saGV4X3dpdGhfY29tcG9uZW50OmZ1bmN0aW9uKGEsYyxkKXtyZXR1cm4gZDw8KGU9Yyo4KXxhJn4oMjU1PDxlKX19fSgpLGRhdC5jb2xvci50b1N0cmluZyxkYXQudXRpbHMuY29tbW9uKSxkYXQuY29sb3IuaW50ZXJwcmV0LGRhdC51dGlscy5jb21tb24pLGRhdC51dGlscy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU9ZnVuY3Rpb24oKXtyZXR1cm4gd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZXx8XG53aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lfHx3aW5kb3cub1JlcXVlc3RBbmltYXRpb25GcmFtZXx8d2luZG93Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lfHxmdW5jdGlvbihlKXt3aW5kb3cuc2V0VGltZW91dChlLDFFMy82MCl9fSgpLGRhdC5kb20uQ2VudGVyZWREaXY9ZnVuY3Rpb24oZSxhKXt2YXIgYz1mdW5jdGlvbigpe3RoaXMuYmFja2dyb3VuZEVsZW1lbnQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTthLmV4dGVuZCh0aGlzLmJhY2tncm91bmRFbGVtZW50LnN0eWxlLHtiYWNrZ3JvdW5kQ29sb3I6XCJyZ2JhKDAsMCwwLDAuOClcIix0b3A6MCxsZWZ0OjAsZGlzcGxheTpcIm5vbmVcIix6SW5kZXg6XCIxMDAwXCIsb3BhY2l0eTowLFdlYmtpdFRyYW5zaXRpb246XCJvcGFjaXR5IDAuMnMgbGluZWFyXCJ9KTtlLm1ha2VGdWxsc2NyZWVuKHRoaXMuYmFja2dyb3VuZEVsZW1lbnQpO3RoaXMuYmFja2dyb3VuZEVsZW1lbnQuc3R5bGUucG9zaXRpb249XCJmaXhlZFwiO3RoaXMuZG9tRWxlbWVudD1cbmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7YS5leHRlbmQodGhpcy5kb21FbGVtZW50LnN0eWxlLHtwb3NpdGlvbjpcImZpeGVkXCIsZGlzcGxheTpcIm5vbmVcIix6SW5kZXg6XCIxMDAxXCIsb3BhY2l0eTowLFdlYmtpdFRyYW5zaXRpb246XCItd2Via2l0LXRyYW5zZm9ybSAwLjJzIGVhc2Utb3V0LCBvcGFjaXR5IDAuMnMgbGluZWFyXCJ9KTtkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuYmFja2dyb3VuZEVsZW1lbnQpO2RvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5kb21FbGVtZW50KTt2YXIgYz10aGlzO2UuYmluZCh0aGlzLmJhY2tncm91bmRFbGVtZW50LFwiY2xpY2tcIixmdW5jdGlvbigpe2MuaGlkZSgpfSl9O2MucHJvdG90eXBlLnNob3c9ZnVuY3Rpb24oKXt2YXIgYz10aGlzO3RoaXMuYmFja2dyb3VuZEVsZW1lbnQuc3R5bGUuZGlzcGxheT1cImJsb2NrXCI7dGhpcy5kb21FbGVtZW50LnN0eWxlLmRpc3BsYXk9XCJibG9ja1wiO3RoaXMuZG9tRWxlbWVudC5zdHlsZS5vcGFjaXR5PVxuMDt0aGlzLmRvbUVsZW1lbnQuc3R5bGUud2Via2l0VHJhbnNmb3JtPVwic2NhbGUoMS4xKVwiO3RoaXMubGF5b3V0KCk7YS5kZWZlcihmdW5jdGlvbigpe2MuYmFja2dyb3VuZEVsZW1lbnQuc3R5bGUub3BhY2l0eT0xO2MuZG9tRWxlbWVudC5zdHlsZS5vcGFjaXR5PTE7Yy5kb21FbGVtZW50LnN0eWxlLndlYmtpdFRyYW5zZm9ybT1cInNjYWxlKDEpXCJ9KX07Yy5wcm90b3R5cGUuaGlkZT1mdW5jdGlvbigpe3ZhciBhPXRoaXMsYz1mdW5jdGlvbigpe2EuZG9tRWxlbWVudC5zdHlsZS5kaXNwbGF5PVwibm9uZVwiO2EuYmFja2dyb3VuZEVsZW1lbnQuc3R5bGUuZGlzcGxheT1cIm5vbmVcIjtlLnVuYmluZChhLmRvbUVsZW1lbnQsXCJ3ZWJraXRUcmFuc2l0aW9uRW5kXCIsYyk7ZS51bmJpbmQoYS5kb21FbGVtZW50LFwidHJhbnNpdGlvbmVuZFwiLGMpO2UudW5iaW5kKGEuZG9tRWxlbWVudCxcIm9UcmFuc2l0aW9uRW5kXCIsYyl9O2UuYmluZCh0aGlzLmRvbUVsZW1lbnQsXCJ3ZWJraXRUcmFuc2l0aW9uRW5kXCIsXG5jKTtlLmJpbmQodGhpcy5kb21FbGVtZW50LFwidHJhbnNpdGlvbmVuZFwiLGMpO2UuYmluZCh0aGlzLmRvbUVsZW1lbnQsXCJvVHJhbnNpdGlvbkVuZFwiLGMpO3RoaXMuYmFja2dyb3VuZEVsZW1lbnQuc3R5bGUub3BhY2l0eT0wO3RoaXMuZG9tRWxlbWVudC5zdHlsZS5vcGFjaXR5PTA7dGhpcy5kb21FbGVtZW50LnN0eWxlLndlYmtpdFRyYW5zZm9ybT1cInNjYWxlKDEuMSlcIn07Yy5wcm90b3R5cGUubGF5b3V0PWZ1bmN0aW9uKCl7dGhpcy5kb21FbGVtZW50LnN0eWxlLmxlZnQ9d2luZG93LmlubmVyV2lkdGgvMi1lLmdldFdpZHRoKHRoaXMuZG9tRWxlbWVudCkvMitcInB4XCI7dGhpcy5kb21FbGVtZW50LnN0eWxlLnRvcD13aW5kb3cuaW5uZXJIZWlnaHQvMi1lLmdldEhlaWdodCh0aGlzLmRvbUVsZW1lbnQpLzIrXCJweFwifTtyZXR1cm4gY30oZGF0LmRvbS5kb20sZGF0LnV0aWxzLmNvbW1vbiksZGF0LmRvbS5kb20sZGF0LnV0aWxzLmNvbW1vbik7XG47IGJyb3dzZXJpZnlfc2hpbV9fZGVmaW5lX19tb2R1bGVfX2V4cG9ydF9fKHR5cGVvZiBkYXQgIT0gXCJ1bmRlZmluZWRcIiA/IGRhdCA6IHdpbmRvdy5kYXQpO1xuXG59KS5jYWxsKGdsb2JhbCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBmdW5jdGlvbiBkZWZpbmVFeHBvcnQoZXgpIHsgbW9kdWxlLmV4cG9ydHMgPSBleDsgfSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuO19fYnJvd3NlcmlmeV9zaGltX3JlcXVpcmVfXz1yZXF1aXJlOyhmdW5jdGlvbiBicm93c2VyaWZ5U2hpbShtb2R1bGUsIGV4cG9ydHMsIHJlcXVpcmUsIGRlZmluZSwgYnJvd3NlcmlmeV9zaGltX19kZWZpbmVfX21vZHVsZV9fZXhwb3J0X18pIHtcbi8vIHN0YXRzLmpzIC0gaHR0cDovL2dpdGh1Yi5jb20vbXJkb29iL3N0YXRzLmpzXG52YXIgU3RhdHM9ZnVuY3Rpb24oKXt2YXIgbD1EYXRlLm5vdygpLG09bCxnPTAsbj1JbmZpbml0eSxvPTAsaD0wLHA9SW5maW5pdHkscT0wLHI9MCxzPTAsZj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO2YuaWQ9XCJzdGF0c1wiO2YuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLGZ1bmN0aW9uKGIpe2IucHJldmVudERlZmF1bHQoKTt0KCsrcyUyKX0sITEpO2Yuc3R5bGUuY3NzVGV4dD1cIndpZHRoOjgwcHg7b3BhY2l0eTowLjk7Y3Vyc29yOnBvaW50ZXJcIjt2YXIgYT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO2EuaWQ9XCJmcHNcIjthLnN0eWxlLmNzc1RleHQ9XCJwYWRkaW5nOjAgMCAzcHggM3B4O3RleHQtYWxpZ246bGVmdDtiYWNrZ3JvdW5kLWNvbG9yOiMwMDJcIjtmLmFwcGVuZENoaWxkKGEpO3ZhciBpPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7aS5pZD1cImZwc1RleHRcIjtpLnN0eWxlLmNzc1RleHQ9XCJjb2xvcjojMGZmO2ZvbnQtZmFtaWx5OkhlbHZldGljYSxBcmlhbCxzYW5zLXNlcmlmO2ZvbnQtc2l6ZTo5cHg7Zm9udC13ZWlnaHQ6Ym9sZDtsaW5lLWhlaWdodDoxNXB4XCI7XG5pLmlubmVySFRNTD1cIkZQU1wiO2EuYXBwZW5kQ2hpbGQoaSk7dmFyIGM9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtjLmlkPVwiZnBzR3JhcGhcIjtjLnN0eWxlLmNzc1RleHQ9XCJwb3NpdGlvbjpyZWxhdGl2ZTt3aWR0aDo3NHB4O2hlaWdodDozMHB4O2JhY2tncm91bmQtY29sb3I6IzBmZlwiO2ZvcihhLmFwcGVuZENoaWxkKGMpOzc0PmMuY2hpbGRyZW4ubGVuZ3RoOyl7dmFyIGo9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7ai5zdHlsZS5jc3NUZXh0PVwid2lkdGg6MXB4O2hlaWdodDozMHB4O2Zsb2F0OmxlZnQ7YmFja2dyb3VuZC1jb2xvcjojMTEzXCI7Yy5hcHBlbmRDaGlsZChqKX12YXIgZD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO2QuaWQ9XCJtc1wiO2Quc3R5bGUuY3NzVGV4dD1cInBhZGRpbmc6MCAwIDNweCAzcHg7dGV4dC1hbGlnbjpsZWZ0O2JhY2tncm91bmQtY29sb3I6IzAyMDtkaXNwbGF5Om5vbmVcIjtmLmFwcGVuZENoaWxkKGQpO3ZhciBrPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG5rLmlkPVwibXNUZXh0XCI7ay5zdHlsZS5jc3NUZXh0PVwiY29sb3I6IzBmMDtmb250LWZhbWlseTpIZWx2ZXRpY2EsQXJpYWwsc2Fucy1zZXJpZjtmb250LXNpemU6OXB4O2ZvbnQtd2VpZ2h0OmJvbGQ7bGluZS1oZWlnaHQ6MTVweFwiO2suaW5uZXJIVE1MPVwiTVNcIjtkLmFwcGVuZENoaWxkKGspO3ZhciBlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7ZS5pZD1cIm1zR3JhcGhcIjtlLnN0eWxlLmNzc1RleHQ9XCJwb3NpdGlvbjpyZWxhdGl2ZTt3aWR0aDo3NHB4O2hlaWdodDozMHB4O2JhY2tncm91bmQtY29sb3I6IzBmMFwiO2ZvcihkLmFwcGVuZENoaWxkKGUpOzc0PmUuY2hpbGRyZW4ubGVuZ3RoOylqPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpLGouc3R5bGUuY3NzVGV4dD1cIndpZHRoOjFweDtoZWlnaHQ6MzBweDtmbG9hdDpsZWZ0O2JhY2tncm91bmQtY29sb3I6IzEzMVwiLGUuYXBwZW5kQ2hpbGQoaik7dmFyIHQ9ZnVuY3Rpb24oYil7cz1iO3N3aXRjaChzKXtjYXNlIDA6YS5zdHlsZS5kaXNwbGF5PVxuXCJibG9ja1wiO2Quc3R5bGUuZGlzcGxheT1cIm5vbmVcIjticmVhaztjYXNlIDE6YS5zdHlsZS5kaXNwbGF5PVwibm9uZVwiLGQuc3R5bGUuZGlzcGxheT1cImJsb2NrXCJ9fTtyZXR1cm57UkVWSVNJT046MTEsZG9tRWxlbWVudDpmLHNldE1vZGU6dCxiZWdpbjpmdW5jdGlvbigpe2w9RGF0ZS5ub3coKX0sZW5kOmZ1bmN0aW9uKCl7dmFyIGI9RGF0ZS5ub3coKTtnPWItbDtuPU1hdGgubWluKG4sZyk7bz1NYXRoLm1heChvLGcpO2sudGV4dENvbnRlbnQ9ZytcIiBNUyAoXCIrbitcIi1cIitvK1wiKVwiO3ZhciBhPU1hdGgubWluKDMwLDMwLTMwKihnLzIwMCkpO2UuYXBwZW5kQ2hpbGQoZS5maXJzdENoaWxkKS5zdHlsZS5oZWlnaHQ9YStcInB4XCI7cisrO2I+bSsxRTMmJihoPU1hdGgucm91bmQoMUUzKnIvKGItbSkpLHA9TWF0aC5taW4ocCxoKSxxPU1hdGgubWF4KHEsaCksaS50ZXh0Q29udGVudD1oK1wiIEZQUyAoXCIrcCtcIi1cIitxK1wiKVwiLGE9TWF0aC5taW4oMzAsMzAtMzAqKGgvMTAwKSksYy5hcHBlbmRDaGlsZChjLmZpcnN0Q2hpbGQpLnN0eWxlLmhlaWdodD1cbmErXCJweFwiLG09YixyPTApO3JldHVybiBifSx1cGRhdGU6ZnVuY3Rpb24oKXtsPXRoaXMuZW5kKCl9fX07XG5cbjsgYnJvd3NlcmlmeV9zaGltX19kZWZpbmVfX21vZHVsZV9fZXhwb3J0X18odHlwZW9mIFN0YXRzICE9IFwidW5kZWZpbmVkXCIgPyBTdGF0cyA6IHdpbmRvdy5TdGF0cyk7XG5cbn0pLmNhbGwoZ2xvYmFsLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGZ1bmN0aW9uIGRlZmluZUV4cG9ydChleCkgeyBtb2R1bGUuZXhwb3J0cyA9IGV4OyB9KTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG52YXIgVEhSRUUgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5USFJFRSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuVEhSRUUgOiBudWxsKTtcblxuLyoqXG4gKiBAbW9kdWxlICBtb2RlbC9Db29yZGluYXRlc1xuICovXG5cbi8qKlxuICogQ29vcmRpbmF0ZXMgaGVscGVyLCBpdCBjcmVhdGVzIHRoZSBheGVzLCBncm91bmQgYW5kIGdyaWRzXG4gKiBzaG93biBpbiB0aGUgd29ybGRcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZ1xuICogQHBhcmFtIHtPYmplY3R9IHRoZW1lXG4gKi9cbmZ1bmN0aW9uIENvb3JkaW5hdGVzKGNvbmZpZywgdGhlbWUpIHtcbiAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xuXG4gIC8qKlxuICAgKiBHcm91cCB3aGVyZSBhbGwgdGhlIG9iamVjdHMgKGF4ZXMsIGdyb3VuZCwgZ3JpZHMpIGFyZSBwdXRcbiAgICogQHR5cGUge1RIUkVFLk9iamVjdDNEfVxuICAgKi9cbiAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XG5cbiAgLyoqXG4gICAqIEF4ZXMgb2JqZWN0LCB0aGUgbWVzaCByZXByZXNlbnRpbmcgdGhlIGF4ZXMgaXMgdW5kZXIgdGhpcyBvYmplY3QgXG4gICAqIHVuZGVyIGBtZXNoYFxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgdGhpcy5heGVzID0ge1xuICAgIG5hbWU6ICdBeGVzJyxcbiAgICBtZXNoOiB0aGlzLmRyYXdBbGxBeGVzKHtheGlzTGVuZ3RoOjEwMCxheGlzUmFkaXVzOjEsYXhpc1Rlc3M6NTB9KSxcbiAgICB2aXNpYmxlOiBjb25maWcuYXhlcyAhPT0gdW5kZWZpbmVkID8gY29uZmlnLmF4ZXMgOiB0cnVlXG4gIH0sXG5cbiAgLyoqXG4gICAqIEdyb3VuZCBvYmplY3QsIHRoZSBtZXNoIHJlcHJlc2VudGluZyB0aGUgYXhlcyBpcyB1bmRlciB0aGlzIG9iamVjdFxuICAgKiB1bmRlciBgbWVzaGBcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIHRoaXMuZ3JvdW5kID0ge1xuICAgIG5hbWU6ICdHcm91bmQnLFxuICAgIG1lc2g6IHRoaXMuZHJhd0dyb3VuZCh7c2l6ZToxMDAwMDAsIGNvbG9yOiB0aGVtZS5ncm91bmRDb2xvcn0pLFxuICAgIHZpc2libGU6IGNvbmZpZy5ncm91bmQgIT09IHVuZGVmaW5lZCA/IGNvbmZpZy5ncm91bmQgOiB0cnVlXG4gIH07XG4gIFxuICAvKipcbiAgICogR3JpZFhaIG9iamVjdCwgdGhlIG1lc2ggcmVwcmVzZW50aW5nIHRoZSBheGVzIGlzIHVuZGVyIHRoaXMgb2JqZWN0XG4gICAqIHVuZGVyIGBtZXNoYFxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgdGhpcy5ncmlkWCA9IHtcbiAgICBuYW1lOiAnWFogZ3JpZCcsXG4gICAgbWVzaDogdGhpcy5kcmF3R3JpZCh7c2l6ZToxMDAwMCxzY2FsZTowLjAxfSksXG4gICAgdmlzaWJsZTogY29uZmlnLmdyaWRYICE9PSB1bmRlZmluZWQgPyBjb25maWcuZ3JpZFggOiB0cnVlXG4gIH07XG5cbiAgLyoqXG4gICAqIEdyaWRZWiBvYmplY3QsIHRoZSBtZXNoIHJlcHJlc2VudGluZyB0aGUgYXhlcyBpcyB1bmRlciB0aGlzIG9iamVjdFxuICAgKiB1bmRlciBgbWVzaGBcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovICBcbiAgdGhpcy5ncmlkWSA9IHtcbiAgICBuYW1lOiAnWVogZ3JpZCcsXG4gICAgbWVzaDogdGhpcy5kcmF3R3JpZCh7c2l6ZToxMDAwMCxzY2FsZTowLjAxLCBvcmllbnRhdGlvbjpcInlcIn0pLFxuICAgIHZpc2libGU6IGNvbmZpZy5ncmlkWSAhPT0gdW5kZWZpbmVkID8gY29uZmlnLmdyaWRZIDogZmFsc2VcbiAgfTtcbiAgXG4gIC8qKlxuICAgKiBHcmlkWFkgb2JqZWN0LCB0aGUgbWVzaCByZXByZXNlbnRpbmcgdGhlIGF4ZXMgaXMgdW5kZXIgdGhpcyBvYmplY3RcbiAgICogdW5kZXIgYG1lc2hgXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICB0aGlzLmdyaWRaID0ge1xuICAgIG5hbWU6ICdYWSBncmlkJyxcbiAgICBtZXNoOiB0aGlzLmRyYXdHcmlkKHtzaXplOjEwMDAwLHNjYWxlOjAuMDEsIG9yaWVudGF0aW9uOlwielwifSksXG4gICAgdmlzaWJsZTogY29uZmlnLmdyaWRaICE9PSB1bmRlZmluZWQgPyBjb25maWcuZ3JpZFogOiBmYWxzZVxuICB9O1xuXG4gIENvb3JkaW5hdGVzLnByb3RvdHlwZS5pbml0LmNhbGwodGhpcywgY29uZmlnKTtcbn07XG5cbi8qKlxuICogQWRkcyB0aGUgYXhlcywgZ3JvdW5kLCBncmlkIG1lc2hlcyB0byBgdGhpcy5tZXNoYFxuICogQHBhcmFtICB7b2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5Db29yZGluYXRlcy5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gIHZhciBtZSA9IHRoaXM7XG4gIGZvciAodmFyIGtleSBpbiBtZSkge1xuICAgIGlmIChtZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICB2YXIgdiA9IG1lW2tleV07XG4gICAgICBpZiAodi5tZXNoKSB7XG4gICAgICAgIG1lLm1lc2guYWRkKHYubWVzaCk7XG4gICAgICAgIHYubWVzaC52aXNpYmxlID0gdi52aXNpYmxlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBtZTtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIGRhdC5ndWkgZm9sZGVyIHdoaWNoIGhhcyBjb250cm9scyBmb3IgdGhlIFxuICogZ3JvdW5kLCBheGVzIGFuZCBncmlkc1xuICogQHBhcmFtICB7ZGF0Lmd1aX0gZ3VpXG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5Db29yZGluYXRlcy5wcm90b3R5cGUuaW5pdERhdEd1aSA9IGZ1bmN0aW9uIChndWkpIHtcbiAgdmFyIG1lID0gdGhpcyxcbiAgICBmb2xkZXI7XG5cbiAgZm9sZGVyID0gZ3VpLmFkZEZvbGRlcignU2NlbmUgaGVscGVycycpO1xuICBmb3IgKHZhciBrZXkgaW4gbWUpIHtcbiAgICBpZiAobWUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgdmFyIHYgPSBtZVtrZXldO1xuICAgICAgaWYgKHYuaGFzT3duUHJvcGVydHkoJ21lc2gnKSkge1xuICAgICAgICBmb2xkZXIuYWRkKHYsICd2aXNpYmxlJylcbiAgICAgICAgICAubmFtZSh2Lm5hbWUpXG4gICAgICAgICAgLm9uRmluaXNoQ2hhbmdlKGZ1bmN0aW9uIChuZXdWYWx1ZSkge1xuICAgICAgICAgICAgdi5tZXNoLnZpc2libGUgPSBuZXdWYWx1ZTtcbiAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG1lO1xufTtcblxuLyoqXG4gKiBEcmF3cyBhIGdyaWRcbiAqIEBwYXJhbSAge29iamVjdH0gcGFyYW1zXG4gKiBAcGFyYW0gIHtvYmplY3R9IHBhcmFtcy5zaXplPTEwMFxuICogQHBhcmFtICB7b2JqZWN0fSBwYXJhbXMuc2NhbGU9MC4xXG4gKiBAcGFyYW0gIHtvYmplY3R9IHBhcmFtcy5jb2xvcj0jNTA1MDUwXG4gKiBAcGFyYW0gIHtvYmplY3R9IHBhcmFtcy5vcmllbnRhdGlvbj0wLjFcbiAqIEByZXR1cm4ge1RIUkVFLk1lc2h9XG4gKi9cbkNvb3JkaW5hdGVzLnByb3RvdHlwZS5kcmF3R3JpZCA9IGZ1bmN0aW9uIChwYXJhbXMpIHtcbiAgcGFyYW1zID0gcGFyYW1zIHx8IHt9O1xuICB2YXIgc2l6ZSA9IHBhcmFtcy5zaXplICE9PSB1bmRlZmluZWQgPyBwYXJhbXMuc2l6ZToxMDA7XG4gIHZhciBzY2FsZSA9IHBhcmFtcy5zY2FsZSAhPT0gdW5kZWZpbmVkID8gcGFyYW1zLnNjYWxlOjAuMTtcbiAgdmFyIGNvbG9yID0gcGFyYW1zLmNvbG9yICE9PSB1bmRlZmluZWQgPyBwYXJhbXMuY29sb3I6JyM1MDUwNTAnO1xuICB2YXIgb3JpZW50YXRpb24gPSBwYXJhbXMub3JpZW50YXRpb24gIT09IHVuZGVmaW5lZCA/IHBhcmFtcy5vcmllbnRhdGlvbjpcInhcIjtcbiAgdmFyIGdyaWQgPSBuZXcgVEhSRUUuTWVzaChcbiAgICBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeShzaXplLCBzaXplLCBzaXplICogc2NhbGUsIHNpemUgKiBzY2FsZSksXG4gICAgbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHtcbiAgICAgIGNvbG9yOiBjb2xvcixcbiAgICAgIHdpcmVmcmFtZTogdHJ1ZVxuICAgIH0pXG4gICk7XG4gIGlmIChvcmllbnRhdGlvbiA9PT0gXCJ4XCIpIHtcbiAgICBncmlkLnJvdGF0aW9uLnggPSAtIE1hdGguUEkgLyAyO1xuICB9IGVsc2UgaWYgKG9yaWVudGF0aW9uID09PSBcInlcIikge1xuICAgIGdyaWQucm90YXRpb24ueSA9IC0gTWF0aC5QSSAvIDI7XG4gIH0gZWxzZSBpZiAob3JpZW50YXRpb24gPT09IFwielwiKSB7XG4gICAgZ3JpZC5yb3RhdGlvbi56ID0gLSBNYXRoLlBJIC8gMjtcbiAgfVxuICByZXR1cm4gZ3JpZDtcbn07XG5cbi8qKlxuICogRHJhd3MgdGhlIGdyb3VuZFxuICogQHBhcmFtICB7b2JqZWN0fSBwYXJhbXNcbiAqIEBwYXJhbSAge29iamVjdH0gcGFyYW1zLnNpemU9MTAwXG4gKiBAcGFyYW0gIHtvYmplY3R9IHBhcmFtcy5zY2FsZT0weDAwMDAwMFxuICogQHBhcmFtICB7b2JqZWN0fSBwYXJhbXMub2Zmc2V0PS0wLjJcbiAqIEByZXR1cm4ge1RIUkVFLk1lc2h9XG4gKi9cbkNvb3JkaW5hdGVzLnByb3RvdHlwZS5kcmF3R3JvdW5kID0gZnVuY3Rpb24gKHBhcmFtcykge1xuICBwYXJhbXMgPSBwYXJhbXMgfHwge307XG4gIHZhciBzaXplID0gcGFyYW1zLnNpemUgIT09IHVuZGVmaW5lZCA/IHBhcmFtcy5zaXplOjEwMDtcbiAgdmFyIGNvbG9yID0gcGFyYW1zLmNvbG9yICE9PSB1bmRlZmluZWQgPyBwYXJhbXMuY29sb3I6MHgwMDAwMDA7XG4gIHZhciBvZmZzZXQgPSBwYXJhbXMub2Zmc2V0ICE9PSB1bmRlZmluZWQgPyBwYXJhbXMub2Zmc2V0Oi0wLjI7XG5cbiAgdmFyIGdyb3VuZCA9IG5ldyBUSFJFRS5NZXNoKFxuICAgIG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHNpemUsIHNpemUpLFxuICAgIG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7XG4gICAgICBjb2xvcjogY29sb3JcbiAgICB9KVxuICApO1xuICBncm91bmQucm90YXRpb24ueCA9IC0gTWF0aC5QSSAvIDI7XG4gIGdyb3VuZC5wb3NpdGlvbi55ID0gb2Zmc2V0O1xuICByZXR1cm4gZ3JvdW5kO1xufTtcblxuLyoqXG4gKiBEcmF3cyBhbiBheGlzXG4gKiBAcGFyYW0gIHtvYmplY3R9IHBhcmFtc1xuICogQHBhcmFtICB7b2JqZWN0fSBwYXJhbXMuYXhpc1JhZGl1cz0wLjA0XG4gKiBAcGFyYW0gIHtvYmplY3R9IHBhcmFtcy5heGlzTGVuZ3RoPTExXG4gKiBAcGFyYW0gIHtvYmplY3R9IHBhcmFtcy5heGlzVGVzcz00NlxuICogQHBhcmFtICB7b2JqZWN0fSBwYXJhbXMuYXhpc09yaWVudGF0aW9uPXhcbiAqIEByZXR1cm4ge1RIUkVFLk1lc2h9XG4gKi9cbkNvb3JkaW5hdGVzLnByb3RvdHlwZS5kcmF3QXhlcyA9IGZ1bmN0aW9uIChwYXJhbXMpIHtcbiAgLy8geCA9IHJlZCwgeSA9IGdyZWVuLCB6ID0gYmx1ZSAgKFJHQiA9IHh5eilcbiAgcGFyYW1zID0gcGFyYW1zIHx8IHt9O1xuICB2YXIgYXhpc1JhZGl1cyA9IHBhcmFtcy5heGlzUmFkaXVzICE9PSB1bmRlZmluZWQgPyBwYXJhbXMuYXhpc1JhZGl1czowLjA0O1xuICB2YXIgYXhpc0xlbmd0aCA9IHBhcmFtcy5heGlzTGVuZ3RoICE9PSB1bmRlZmluZWQgPyBwYXJhbXMuYXhpc0xlbmd0aDoxMTtcbiAgdmFyIGF4aXNUZXNzID0gcGFyYW1zLmF4aXNUZXNzICE9PSB1bmRlZmluZWQgPyBwYXJhbXMuYXhpc1Rlc3M6NDg7XG4gIHZhciBheGlzT3JpZW50YXRpb24gPSBwYXJhbXMuYXhpc09yaWVudGF0aW9uICE9PSB1bmRlZmluZWQgPyBwYXJhbXMuYXhpc09yaWVudGF0aW9uOlwieFwiO1xuXG4gIHZhciB3cmFwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XG4gIHZhciBheGlzTWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCh7IGNvbG9yOiAweDAwMDAwMCwgc2lkZTogVEhSRUUuRG91YmxlU2lkZSB9KTtcbiAgdmFyIGF4aXMgPSBuZXcgVEhSRUUuTWVzaChcbiAgICBuZXcgVEhSRUUuQ3lsaW5kZXJHZW9tZXRyeShheGlzUmFkaXVzLCBheGlzUmFkaXVzLCBheGlzTGVuZ3RoLCBheGlzVGVzcywgMSwgdHJ1ZSksIFxuICAgIGF4aXNNYXRlcmlhbFxuICApO1xuICBpZiAoYXhpc09yaWVudGF0aW9uID09PSBcInhcIikge1xuICAgIGF4aXMucm90YXRpb24ueiA9IC0gTWF0aC5QSSAvIDI7XG4gICAgYXhpcy5wb3NpdGlvbi54ID0gYXhpc0xlbmd0aC8yLTE7XG4gIH0gZWxzZSBpZiAoYXhpc09yaWVudGF0aW9uID09PSBcInlcIikge1xuICAgIGF4aXMucG9zaXRpb24ueSA9IGF4aXNMZW5ndGgvMi0xO1xuICB9XG4gIFxuICB3cmFwLmFkZCggYXhpcyApO1xuICBcbiAgdmFyIGFycm93ID0gbmV3IFRIUkVFLk1lc2goXG4gICAgbmV3IFRIUkVFLkN5bGluZGVyR2VvbWV0cnkoMCwgNCpheGlzUmFkaXVzLCA4KmF4aXNSYWRpdXMsIGF4aXNUZXNzLCAxLCB0cnVlKSwgXG4gICAgYXhpc01hdGVyaWFsXG4gICk7XG4gIGlmIChheGlzT3JpZW50YXRpb24gPT09IFwieFwiKSB7XG4gICAgYXJyb3cucm90YXRpb24ueiA9IC0gTWF0aC5QSSAvIDI7XG4gICAgYXJyb3cucG9zaXRpb24ueCA9IGF4aXNMZW5ndGggLSAxICsgYXhpc1JhZGl1cyo0LzI7XG4gIH0gZWxzZSBpZiAoYXhpc09yaWVudGF0aW9uID09PSBcInlcIikge1xuICAgIGFycm93LnBvc2l0aW9uLnkgPSBheGlzTGVuZ3RoIC0gMSArIGF4aXNSYWRpdXMqNC8yO1xuICB9XG5cbiAgd3JhcC5hZGQoIGFycm93ICk7XG4gIHJldHVybiB3cmFwO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIE9iamVjdDNEIHdoaWNoIGNvbnRhaW5zIGFsbCBheGVzXG4gKiBAcGFyYW0gIHtPYmplY3R9IHBhcmFtc1xuICogQHBhcmFtICB7b2JqZWN0fSBwYXJhbXMuYXhpc1JhZGl1cz0wLjA0ICBjeWxpbmRlciByYWRpdXNcbiAqIEBwYXJhbSAge29iamVjdH0gcGFyYW1zLmF4aXNMZW5ndGg9MTEgICAgY3lsaW5kZXIgbGVuZ3RoXG4gKiBAcGFyYW0gIHtvYmplY3R9IHBhcmFtcy5heGlzVGVzcz00NiAgICAgIGN5bGluZGVyIHRlc3NlbGF0aW9uXG4gKiBAcmV0dXJuIHtUSFJFRS5PYmplY3QzRH1cbiAqL1xuQ29vcmRpbmF0ZXMucHJvdG90eXBlLmRyYXdBbGxBeGVzID0gZnVuY3Rpb24gKHBhcmFtcykge1xuICBwYXJhbXMgPSBwYXJhbXMgfHwge307XG4gIHZhciBheGlzUmFkaXVzID0gcGFyYW1zLmF4aXNSYWRpdXMgIT09IHVuZGVmaW5lZCA/IHBhcmFtcy5heGlzUmFkaXVzOjAuMDQ7XG4gIHZhciBheGlzTGVuZ3RoID0gcGFyYW1zLmF4aXNMZW5ndGggIT09IHVuZGVmaW5lZCA/IHBhcmFtcy5heGlzTGVuZ3RoOjExO1xuICB2YXIgYXhpc1Rlc3MgPSBwYXJhbXMuYXhpc1Rlc3MgIT09IHVuZGVmaW5lZCA/IHBhcmFtcy5heGlzVGVzczo0ODtcblxuICB2YXIgd3JhcCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xuXG4gIHZhciBheGlzWE1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoeyBjb2xvcjogMHhGRjAwMDAgfSk7XG4gIHZhciBheGlzWU1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoeyBjb2xvcjogMHgwMEZGMDAgfSk7XG4gIHZhciBheGlzWk1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoeyBjb2xvcjogMHgwMDAwRkYgfSk7XG4gIGF4aXNYTWF0ZXJpYWwuc2lkZSA9IFRIUkVFLkRvdWJsZVNpZGU7XG4gIGF4aXNZTWF0ZXJpYWwuc2lkZSA9IFRIUkVFLkRvdWJsZVNpZGU7XG4gIGF4aXNaTWF0ZXJpYWwuc2lkZSA9IFRIUkVFLkRvdWJsZVNpZGU7XG4gIHZhciBheGlzWCA9IG5ldyBUSFJFRS5NZXNoKFxuICAgIG5ldyBUSFJFRS5DeWxpbmRlckdlb21ldHJ5KGF4aXNSYWRpdXMsIGF4aXNSYWRpdXMsIGF4aXNMZW5ndGgsIGF4aXNUZXNzLCAxLCB0cnVlKSwgXG4gICAgYXhpc1hNYXRlcmlhbFxuICApO1xuICB2YXIgYXhpc1kgPSBuZXcgVEhSRUUuTWVzaChcbiAgICBuZXcgVEhSRUUuQ3lsaW5kZXJHZW9tZXRyeShheGlzUmFkaXVzLCBheGlzUmFkaXVzLCBheGlzTGVuZ3RoLCBheGlzVGVzcywgMSwgdHJ1ZSksIFxuICAgIGF4aXNZTWF0ZXJpYWxcbiAgKTtcbiAgdmFyIGF4aXNaID0gbmV3IFRIUkVFLk1lc2goXG4gICAgbmV3IFRIUkVFLkN5bGluZGVyR2VvbWV0cnkoYXhpc1JhZGl1cywgYXhpc1JhZGl1cywgYXhpc0xlbmd0aCwgYXhpc1Rlc3MsIDEsIHRydWUpLCBcbiAgICBheGlzWk1hdGVyaWFsXG4gICk7XG4gIGF4aXNYLnJvdGF0aW9uLnogPSAtIE1hdGguUEkgLyAyO1xuICBheGlzWC5wb3NpdGlvbi54ID0gYXhpc0xlbmd0aC8yLTE7XG5cbiAgYXhpc1kucG9zaXRpb24ueSA9IGF4aXNMZW5ndGgvMi0xO1xuICBcbiAgYXhpc1oucm90YXRpb24ueSA9IC0gTWF0aC5QSSAvIDI7XG4gIGF4aXNaLnJvdGF0aW9uLnogPSAtIE1hdGguUEkgLyAyO1xuICBheGlzWi5wb3NpdGlvbi56ID0gYXhpc0xlbmd0aC8yLTE7XG5cbiAgd3JhcC5hZGQoIGF4aXNYICk7XG4gIHdyYXAuYWRkKCBheGlzWSApO1xuICB3cmFwLmFkZCggYXhpc1ogKTtcblxuICB2YXIgYXJyb3dYID0gbmV3IFRIUkVFLk1lc2goXG4gICAgbmV3IFRIUkVFLkN5bGluZGVyR2VvbWV0cnkoMCwgNCpheGlzUmFkaXVzLCA0KmF4aXNSYWRpdXMsIGF4aXNUZXNzLCAxLCB0cnVlKSwgXG4gICAgYXhpc1hNYXRlcmlhbFxuICApO1xuICB2YXIgYXJyb3dZID0gbmV3IFRIUkVFLk1lc2goXG4gICAgbmV3IFRIUkVFLkN5bGluZGVyR2VvbWV0cnkoMCwgNCpheGlzUmFkaXVzLCA0KmF4aXNSYWRpdXMsIGF4aXNUZXNzLCAxLCB0cnVlKSwgXG4gICAgYXhpc1lNYXRlcmlhbFxuICApO1xuICB2YXIgYXJyb3daID0gbmV3IFRIUkVFLk1lc2goXG4gICAgbmV3IFRIUkVFLkN5bGluZGVyR2VvbWV0cnkoMCwgNCpheGlzUmFkaXVzLCA0KmF4aXNSYWRpdXMsIGF4aXNUZXNzLCAxLCB0cnVlKSwgXG4gICAgYXhpc1pNYXRlcmlhbFxuICApO1xuICBhcnJvd1gucm90YXRpb24ueiA9IC0gTWF0aC5QSSAvIDI7XG4gIGFycm93WC5wb3NpdGlvbi54ID0gYXhpc0xlbmd0aCAtIDEgKyBheGlzUmFkaXVzKjQvMjtcblxuICBhcnJvd1kucG9zaXRpb24ueSA9IGF4aXNMZW5ndGggLSAxICsgYXhpc1JhZGl1cyo0LzI7XG5cbiAgYXJyb3daLnJvdGF0aW9uLnogPSAtIE1hdGguUEkgLyAyO1xuICBhcnJvd1oucm90YXRpb24ueSA9IC0gTWF0aC5QSSAvIDI7XG4gIGFycm93Wi5wb3NpdGlvbi56ID0gYXhpc0xlbmd0aCAtIDEgKyBheGlzUmFkaXVzKjQvMjtcblxuICB3cmFwLmFkZCggYXJyb3dYICk7XG4gIHdyYXAuYWRkKCBhcnJvd1kgKTtcbiAgd3JhcC5hZGQoIGFycm93WiApO1xuICByZXR1cm4gd3JhcDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ29vcmRpbmF0ZXM7XG59KS5jYWxsKHRoaXMsdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIi8qKlxuICogQG1vZHVsZSAgdGhlbWVzL2RhcmtcbiAqL1xuXG4vKipcbiAqIERhcmsgdGhlbWVcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRjbGVhckNvbG9yOiAweDU5NTk1OSxcblx0Zm9nQ29sb3I6IDB4NTk1OTU5LFxuICBncm91bmRDb2xvcjogMHgzOTM5Mzlcbn07IiwiLyoqXG4gKiBAbW9kdWxlIHRoZW1lcy9saWdodFxuICovXG5cbi8qKlxuICogTGlnaHQgdGhlbWVcbiAqIEBuYW1lIExpZ2h0VGhlbWVcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRjbGVhckNvbG9yOiAweGYyZmNmZixcbiAgZm9nQ29sb3I6IDB4ZjJmY2ZmLFxuXHRncm91bmRDb2xvcjogMHhlZWVlZWVcbn07Il19
(7)
});
