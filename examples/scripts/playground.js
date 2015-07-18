define(['t3'], function (t3) {
  return t3({
    target: '#canvas',
    helperOptions: {
      ground: false,
      gridX: true,
      gridY: true,
      gridZ: true
    },
    init: function () {
      var points = [
        [ -0.8592737372964621, 83.55000647716224, 99.76234347559512 ],
  [ 1.525216130539775, 82.31873814947903, 27.226063096895814 ],
  [ -71.64689642377198, -9.807108994573355, -20.06765645928681 ],
  [ -83.98330193012953, -24.196470947936177, 45.60143379494548 ],
  [ 58.33653616718948, -15.815680427476764, 15.342222386971116 ],
  [ -47.025314485654235, 97.0465809572488, -65.528974076733 ],
  [ 18.024734454229474, -43.655246682465076, -82.13481092825532 ],
  [ -37.32072818093002, 1.8377598840743303, -12.133228313177824 ],
  [ -92.33389408327639, 5.605767108500004, -13.743493286892772 ],
  [ 64.9183395318687, 52.24619274958968, -61.14645302295685 ]
      ];

      // initial faces
      var faces = [ [ 6, 5, 9 ],
  [ 3, 0, 8 ],
  [ 0, 5, 8 ],
  [ 5, 6, 8 ],
  [ 0, 9, 1 ],
  [ 9, 5, 1 ],
  [ 5, 0, 1 ],
  [ 9, 0, 4 ],
  [ 6, 9, 4 ],
  [ 0, 3, 4 ],
  [ 3, 6, 4 ],
  [ 8, 6, 2 ],
  [ 6, 3, 2 ],
  [ 3, 8, 2 ] ];

  //     var faces = [
  //       [ 9, 6, 5 ],
  // [ 3, 0, 8 ],
  // [ 8, 0, 5 ],
  // [ 5, 6, 8 ],
  // [ 0, 9, 1 ],
  // [ 1, 9, 5 ],
  // [ 5, 0, 1 ],
  // [ 4, 9, 0 ],
  // [ 6, 9, 4 ],
  // [ 0, 3, 4 ],
  // [ 4, 8, 6 ],
  // [ 3, 8, 4 ]
  //     ];

      var geometry = new THREE.Geometry();
      var i;
      for (i = 0; i < points.length; i += 1) {
        geometry.vertices.push(new THREE.Vector3().fromArray(points[i]));
      }
      var normal;
      var color = new THREE.Color(0xffaa00);
      for (i = 0; i < faces.length; i += 1) {
        var a = new THREE.Vector3().fromArray(points[faces[i][0]]);
        var b = new THREE.Vector3().fromArray(points[faces[i][1]]);
        var c = new THREE.Vector3().fromArray(points[faces[i][2]]);
        normal = new THREE.Vector3()
          .crossVectors(
            new THREE.Vector3().subVectors(b, a),
            new THREE.Vector3().subVectors(c, a)
          )
          .normalize();
        geometry.faces.push(new THREE.Face3(
          faces[i][0], faces[i][1], faces[i][2],
          normal, color, 0
        ));
      }
      // geometry.computeFaceNormals();
      // polyhedra
      this.activeScene.add(
        new THREE.Mesh(geometry, new THREE.MeshNormalMaterial({
          // shading: THREE.NoShading
          // wireframe: true
        }))
      );

      // points
      var sphereRadius = 1;
      for (i = 0; i < points.length; i += 1) {
        var geometry = new THREE.SphereGeometry(sphereRadius, sphereRadius);
        var material = new THREE.MeshNormalMaterial();
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.fromArray(points[i]);
        this.activeScene.add(mesh);
      }


      // camera fix
      this.cameras['default'].cameraControls
        .target.set(0, 0, 0);
    }
  });
});