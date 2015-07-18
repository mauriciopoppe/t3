'use strict';

var assert = function (condition, message) {
  if (!condition) {
    throw message || 'assertion failed';
  }
};
var emptyFn = function () {};

var THREE = window.THREE;

var extend = require('extend');
var Stats = require('stats-js');
var dat = require('dat-gui');
var shell = require('game-shell');
var Coordinates = require('./model/Coordinates');
var themes = require('./themes/');

/**
 * @module controller/Application
 */

/**
 * Each instance controls one element of the DOM, besides creating
 * the canvas for the three.js app it creates a dat.gui instance
 * (to control objects of the app with a gui) and a Stats instance
 *
 * @class
 * @param {Object} options An object containing the following:
 * @param {string} [options.selector=null] A css selector to the element to inject the demo
 * @param {number} [options.width=window.innerWidth]
 * The width of the canvas
 * @param {number} [options.height=window.innerHeight]
 * The height of the canvas
 * @param {boolean} [options.injectCache=false]
 * True to add a wrapper over `THREE.Object3D.prototype.add` and
 * `THREE.Object3D.prototype.remove` so that it catches the last element
 * and perform additional operations over it, with this mechanism
 * we allow the application to have an internal cache of the elements of
 * the application
 * @param {string} [options.theme='dark']
 * Theme used in the default scene, it can be `light` or `dark`
 * @param {object} [options.helperOptions={}]
 * Additional options for the ambient, see the class {@link
  * Coordinates}
 * @param {object} [options.defaultSceneOptions={}] Additional options
 * for the default scene created for this world
 */
function Application(options) {
  if (!(this instanceof Application)) {
    return new Application(options);
  }

  this.options = extend(true, {
    target: null,
    width: window.innerWidth,
    height: window.innerHeight,
    injectCache: false,
    fullScreen: false,
    theme: 'dark',
    helperOptions: {},
    defaultSceneOptions: {
      fog: true
    },
    init: emptyFn,
    tick: emptyFn,
    render: emptyFn,
    shellOptions: {}
  }, options);

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
   * Dat gui instance
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
   * Reference a game-shell instance
   * @type {LoopManager}
   */
  this.shell = null;

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

  this.gameShell();
}

/**
 * Initializes the game loop by creating an instance of game-shell
 * @return {this}
 */
Application.prototype.gameShell = function () {
  this.shell = shell(extend(this.options.shellOptions, {
    element: this.options.target
  }));

  this.shell.on('init', this.init.bind(this));
  this.shell.on('tick', this.tick.bind(this));
  this.shell.on('render', this.render.bind(this));
  this.shell.on('resize', this.resize.bind(this));

  return this;
};

/**
 * Getter for the initial options
 * @return {Object}
 */
Application.prototype.getOptions = function () {
  return this.options;
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
Application.prototype.init = function () {
  var me = this;
  var options = me.getOptions();

  me.injectCache(options.injectCache);

  // theme
  me.setTheme(options.theme);

  // defaults
  me.createDefaultRenderer();
  me.createDefaultScene();
  me.createDefaultCamera();
  me.createDefaultLights();

  // utils
  me.initDatGui();
  me.initStats();

  // models
  me.initCoordinates();

  me.options.init.call(this);
};

/**
 * Creates the default THREE.WebGLRenderer used in the world
 * @return {this}
 */
Application.prototype.createDefaultRenderer = function () {
  var me = this;
  var options = me.getOptions();
  var renderer = new THREE.WebGLRenderer({
      antialias: true
  });
  renderer.setClearColor(me.theme.clearColor, 1);
  renderer.setSize(options.width, options.height);
  this.shell.element.appendChild(renderer.domElement);
  me.renderer = renderer;
  return me;
};

/**
 * Updates the camera to be used to render the scene
 *
 * @param {string} key
 * @return {this}
 */
Application.prototype.setActiveCamera = function (key) {
  this.activeCamera = this.cameras[key];
  return this;
};

/**
 * Adds a camera to the pool of cameras, it needs to be a THREE.PerspectiveCamera
 * or a THREE.OrthographicCamera
 *
 * @param {string} key
 * @param {THREE.PerspectiveCamera|THREE.OrthographicCamera} camera
 * @returns {Application}
 */
Application.prototype.addCamera = function (key, camera) {
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
    options = me.getOptions(),
    width = options.width,
    height = options.height,
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
  if (options.fullScreen) {
    THREEx.WindowResize.bind(me.renderer, defaultCamera);
  }

  me
    .createCameraControls(defaultCamera)
    .addCamera('default', defaultCamera)
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
Application.prototype.addScene = function (key, scene) {
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
    options = me.getOptions(),
    defaultScene = new THREE.Scene();
  if (options.defaultSceneOptions.fog) {
    defaultScene.fog = new THREE.Fog(me.theme.fogColor, 2000, 4000);
  }
  me
    .addScene('default', defaultScene)
    .setActiveScene('default');
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
 *
 * @return {this}
 */
Application.prototype.setTheme = function (name) {
  var me = this;
  if (themes[name]) {
    me.theme = themes[name];
  } else {
    console.warn('theme not found!');
  }
  return me;
};

/**
 * Inits the dat.gui helper which is placed under the
 * DOM element identified by the initial configuration selector
 * @return {this}
 */
Application.prototype.initDatGui = function () {
  var me = this;
  var gui = new dat.GUI({
    autoPlace: false
  });

  // attach dat.gui dom
  extend(gui.domElement.style, {
    position: 'absolute',
    top: '0px',
    right: '0px',
    zIndex: '1'
  });
  this.shell.element.appendChild(gui.domElement);
  me.datgui = gui;

  // game-shell
  // dat gui controller
  var folder = this.datgui.addFolder('game shell');
  folder.add(this.shell, 'startTime');
  folder.add(this.shell, 'tickCount').listen();
  folder.add(this.shell, 'frameCount').listen();
  folder.add(this.shell, 'frameSkip').listen();
  folder.add(this.shell, 'tickTime').listen();
  folder.add(this.shell, 'paused').listen();
  folder.add(this.shell, 'fullscreen').listen();

  return me;
};

/**
 * Init the Stats helper which is placed under the
 * DOM element identified by the initial configuration selector
 * @return {this}
 */
Application.prototype.initStats = function () {
  var me = this,
    options = me.getOptions(),
    stats;
  // add Stats.js - https://github.com/mrdoob/stats.js
  stats = new Stats();
  extend(stats.domElement.style, {
    position: 'absolute',
    zIndex: 1,
    bottom: '0px'
  });
  this.shell.element.appendChild(stats.domElement);
  me.stats = stats;
  return me;
};

/**
 * Initializes the coordinate helper (its wrapped in a model in T3)
 */
Application.prototype.initCoordinates = function () {
  var options = this.getOptions();
  this.scenes['default']
    .add(
    new Coordinates(options.helperOptions, this.theme)
      .initDatGui(this.datgui)
      .mesh
  );
};

/**
 * tick, the place where the game logic happens, t3 updates the following for you
 *
 * - the stats helper
 * - the camera controls if the active camera has one
 *
 */
Application.prototype.tick = function () {
  var me = this;
  me.options.tick.call(this);
};

/**
 * Render phase, calls `this.renderer` with `this.activeScene` and
 * `this.activeCamera`
 */
Application.prototype.render = function (delta) {
  var me = this;

  // stats helper
  me.stats.update();

  // camera update
  if (me.activeCamera.cameraControls) {
    me.activeCamera.cameraControls.update(delta);
  }

  me.renderer.render(me.activeScene, me.activeCamera);

  // hook
  me.options.render.call(this, delta);
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

Application.prototype.resize = function () {
  // notify the renderer of the size change
  this.renderer.setSize(window.innerWidth, window.innerHeight);
  this.activeCamera.aspect	= window.innerWidth / window.innerHeight;
  this.activeCamera.updateProjectionMatrix();
};

module.exports = Application;