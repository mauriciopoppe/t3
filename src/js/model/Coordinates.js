var _ = require('lodash');
var THREE = require('THREE');
var Coordinates = function (config, theme) {
  config = config || {};

  this.mesh = new THREE.Object3D();

  this.axes = {
    name: 'Axes',
    mesh: this.drawAllAxes({axisLength:100,axisRadius:1,axisTess:50}),
    visible: config.axes !== undefined ? config.axes : true
  },

  this.ground = {
    name: 'Ground',
    mesh: this.drawGround({size:100000, color: theme.groundColor}),
    visible: config.ground !== undefined ? config.ground : true
  };
  
  this.gridX = {
    name: 'XZ grid',
    mesh: this.drawGrid({size:10000,scale:0.01}),
    visible: config.gridX !== undefined ? config.gridX : true
  };

  this.gridY = {
    name: 'YZ grid',
    mesh: this.drawGrid({size:10000,scale:0.01, orientation:"y"}),
    visible: config.gridY !== undefined ? config.gridY : false
  };
  
  this.gridZ = {
    name: 'XY grid',
    mesh: this.drawGrid({size:10000,scale:0.01, orientation:"z"}),
    visible: config.gridZ !== undefined ? config.gridZ : false
  };

  Coordinates.prototype.init.call(this, config);
};

_.merge(Coordinates.prototype, {

  init: function (options) {
    var me = this;
    _.forOwn(me, function (v, k) {
      if (v.mesh) {
        me.mesh.add(v.mesh);
        v.mesh.visible = v.visible;
      }
    });
    return me;
  },

  initDatGui: function (gui) {
    var me = this,
      folder;

    folder = gui.addFolder('Scene helpers');
    _.forOwn(me, function (v, k) {
      if (v.hasOwnProperty('mesh')) {
        folder.add(v, 'visible')
          .name(v.name)
          .onFinishChange(function (newValue) {
            v.mesh.visible = newValue;
          });
      }
    });

    return me;
  },

  drawGrid:function(params) {
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
  },
  drawGround:function(params) {
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
  },
  drawAxes:function(params) {
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
  },
  drawAllAxes:function(params) {
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
  }
});

module.exports = Coordinates;