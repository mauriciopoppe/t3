define(['t3'], function (t3) {
  return t3({
    target: '#canvas',
    init: function () {
      var scene,
        geometry,
        material;

      // scene setup
      this.addScene('cone', new THREE.Scene());
      this.addScene('sphere', new THREE.Scene());

      // default scene
      scene = this.scenes['default'];
      geometry = new THREE.BoxGeometry(20, 20, 20);
      material = new THREE.MeshNormalMaterial();
      this.cube = new THREE.Mesh(geometry, material);
      this.cube.position.set(100, 100, 100);
      scene.add(this.cube);

      // cone scene
      scene = this.scenes.cone;
      geometry = new THREE.CylinderGeometry(10, 0, 20, 64, 64);
      material = new THREE.MeshNormalMaterial();
      this.cylinder = new THREE.Mesh(geometry, material);
      this.cylinder.position.set(100, 100, 100);
      scene.add(this.cylinder);

      // sphere scene
      scene = this.scenes.sphere;
      geometry = new THREE.SphereGeometry(10, 32, 32);
      material = new THREE.MeshNormalMaterial();
      this.sphere = new THREE.Mesh(geometry, material);
      this.sphere.position.set(100, 100, 100);
      scene.add(this.sphere);
    },
    tick: function () {
      var me = this;
      ['cube', 'cylinder', 'sphere'].forEach(function (v) {
        me[v].rotation.x += 0.01;
        me[v].rotation.y += 0.01;
      });
    }
  });
});