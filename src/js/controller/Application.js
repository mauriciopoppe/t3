var _ = require('lodash');
var assert = function (condition, message) {
  if (!condition) {
    throw message || 'assertion failed';
  }
};
var hashkey = require('../utils/hashkey');
var Coordinates = require('../model/Coordinates');
var Keyboard = require('./Keyboard');
var LoopManager = require('./LoopManager');
var Stats = require('T3.Stats');
var dat = require('T3.dat');
var THREE = require('THREE');
var THREEx = require('../lib/THREEx/');
var themes = {
  dark: require('../themes/dark'),
  light: require('../themes/light')
};

var Application = function (config) {
  config = _.merge({
    id: null,
    renderer: null,
    width: window.innerWidth,
    height: window.innerHeight,
    renderImmediately: true,
    injectCache: false,
    fullScreen: false,
    theme: 'dark',
    cameraConfig: {},
    ambientConfig: {},
    defaultSceneConfig: {
      fog: true
    }
  }, config);

  this.initialConfig = config;

  /**
   * Array of scenes in this world
   */
  this.scenes = {};

  /**
   * Active scene
   */
  this.activeScene = null;

  /**
   * [cameras description]
   * @type {Array}
   */
  this.cameras = {},

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
   * @type {Keyboard}
   */
  this.keyboard = null;

  /**
   * Dat gui manager
   * @type {dat}
   */
  this.datgui = null;

  /**
   * Initializes the stats panel
   * @type {Stats}
   */
  this.stats = null;

  /**
   * Reference to its local loop manager
   * @type {[type]}
   */
  this.loopManager = null;
  
  /**
   * Colors for this theme
   * @type {[type]}
   */
  this.theme = null;

  /**
   * Application cache
   * @type {Object}
   */
  this.__t3cache__ = {};

  Application.prototype.initApplication.call(this);
};

Application.prototype = {
  constructor: Application,

  getConfig: function () {
    return this.initialConfig;
  },

  initApplication: function () {
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
  },

  setActiveScene: function (key) {
    this.activeScene = this.scenes[key];
    return this;
  },

  addScene: function (scene, key) {
    console.assert(scene instanceof THREE.Scene);
    this.scenes[key] = scene;
    return this;
  },

  createDefaultScene: function () {
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
  },

  createDefaultRenderer: function () {
    var me = this,
      config = me.getConfig();
    var renderer = new THREE.WebGLRenderer({
//      antialias: true
    });
    renderer.setClearColor(me.theme.clearColor, 1 );
    renderer.setSize(config.width, config.height);
    document
      .getElementById(config.id)
      .appendChild(renderer.domElement);
    me.renderer = renderer;
    return me;
  },

  setTheme: function (name) {
    var me = this;
    assert(themes[name]);
    me.theme = themes[name];
    return me;
  },

  initMask: function () {
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
      .getElementById(config.id)
      .appendChild(mask);

    me.mask = mask;
    return me;
  },

  maskVisible: function (v) {
    var mask = this.mask;
    mask.style.display = v ? 'block' : 'none';
  },

  initDatGui: function () {
    var me = this,
      config = me.getConfig(),
      gui = new dat.GUI({
        autoPlace: false
      });
    gui.domElement.style.position  = 'absolute';
    gui.domElement.style.top  = '0px';
    gui.domElement.style.right = '0px';    
    document
      .getElementById(config.id)
      .appendChild(gui.domElement);
    me.datgui = gui;
    return me;
  },

  initStats: function () {
    var me = this,
      config = me.getConfig(),
      stats;
    // add Stats.js - https://github.com/mrdoob/stats.js
    stats = new Stats();
    stats.domElement.style.position  = 'absolute';
    stats.domElement.style.bottom  = '0px';
    document
      .getElementById(config.id)
      .appendChild( stats.domElement );
    me.stats = stats;
    return me;
  },
 
  initFullScreen: function () {
    var config = this.getConfig();
    // allow 'f' to go fullscreen where this feature is supported
    if(config.fullScreen && THREEx.FullScreen.available()) {
      THREEx.FullScreen.bindKey();
    }
  },

  setActiveCamera: function (key) {
    this.activeCamera = this.cameras[key];
    return this;
  },

  addCamera: function (camera, key) {
    console.assert(camera instanceof THREE.PerspectiveCamera || 
      camera instanceof THREE.OrthographicCamera);
    this.cameras[key] = camera;
    return this;
  },

  /**
   * Initializes the cameras used in the world
   */
  createDefaultCamera: function () {
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
  },

  createCameraControls: function (camera) {
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
  },

  createDefaultLights: function () {
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
  },

  /**
   * Initializes the coordinate helper (its wrapped in a model in T3)
   */
  initCoordinates: function () {
    var config = this.getConfig();
    this.scenes['default']
      .add(
        new Coordinates(config.ambientConfig, this.theme)
          .initDatGui(this.datgui)
          .mesh
      );
  },

  initKeyboard: function () {
    this.keyboard = new Keyboard();
  },
  
  gameLoop: function () {
    var config = this.getConfig();
    this.loopManager = new LoopManager(this, config.renderImmediately)
      .initDatGui(this.datgui)
      .animate();
  },

  /**
   * The world is responsible of updating its children
   * @param delta
   */
  update: function (delta) {
    var me = this;

    // stats helper
    me.stats.update();

    // camera update
    if (me.activeCamera.cameraControls) {
      me.activeCamera.cameraControls.update(delta);
    }
  },

  render: function () {
    var me = this;
    me.renderer.render(
      me.activeScene,
      me.activeCamera
    );
  },

  injectCache: function (inject) {
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
  },

  getFromCache: function (name) {
    return this.__t3cache__[name];
  }
};

Application.run = function (options) {
  _.merge({
    init: function () {},
    update: function () {},
  }, options)
  assert(options.id, 'canvas id required');

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