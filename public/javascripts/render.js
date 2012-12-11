Physijs.scripts.worker = '/javascripts/lib/physijs/physijs_worker.js';
Physijs.scripts.ammo = '/javascripts/lib/physijs/ammo.js';

var TILE_SIZE = 16;
var physics = true

var container, stats;
var camera, scene, renderer;
var geometry, group;
var x = 100, y = 200
var mouseX = 0, mouseY = 0;
var windowWidth = 1024;
var windowHeight = 706;
var windowHalfX = windowWidth / 2;
var windowHalfY = windowHeight / 2;
var light;

$(function() {
    init();
    animate();
});

function animate() {

  requestAnimationFrame( animate );

  render();
  stats.update();

}

function render() {
    if(!me) return false

    camera.position.x = me.x - windowHalfX
    camera.position.y = (me.y - windowHalfY) * -1

    // me.container.position.x = me.x;
    // me.container.position.y = me.y*-1

    light.position.x = me.x;
    light.position.y = me.y*-1;

    scene.simulate( undefined, 5 );

    renderer.render( scene, camera );
}

function init() {

      container = document.createElement( 'div' );
      document.body.appendChild( container );

      // create the camera
      // camera = new THREE.PerspectiveCamera( 60, windowWidth / windowHeight, 1, 10000 );
      camera = new THREE.OrthographicCamera( 0, windowWidth ,0, windowHeight*-1, 1, 10000 );
      camera.position.z = 400;

      // create the scene

      scene = new Physijs.Scene();
      scene.setGravity(new THREE.Vector3( 0, 0, -300 ));
      scene.fog = new THREE.Fog( 0xffffff, 1, 10000 );

      // generate and add the map
      mapObject = generateMap()
      scene.add(mapObject);

      // create a light
      light = new THREE.PointLight(0xffffff,1,-10);
      light.position.z = 300;
      scene.add( light );

      // create the renderer
      renderer = new THREE.WebGLRenderer();
      renderer.setSize( windowWidth, windowHeight );
      renderer.sortObjects = false;

      // append the renderer to the page
      $('#viewport').append( renderer.domElement );

      // FPS stats
      stats = new Stats();
      stats.domElement.style.position = 'absolute';
      stats.domElement.style.top = '0px';
      stats.domElement.style.zIndex = 100;
      $('body').append( stats.domElement );

}

function generateMap() {

      // create a container
      var geometry = new THREE.CubeGeometry(0,0,0);
      var material = Physijs.createMaterial(new THREE.MeshLambertMaterial(),.8,.4);
      var mapGroup = new Physijs.BoxMesh(geometry, material,0)

      // add the floor
      var geometry = new THREE.CubeGeometry( map.data[0].length * TILE_SIZE, map.data.length * TILE_SIZE, 16 );
      var texture = THREE.ImageUtils.loadTexture( '/assets/images/rocks.jpg' );
      var material = Physijs.createMaterial(new THREE.MeshLambertMaterial( { map: texture }),.8,.4);
      var floor = physics ? new Physijs.BoxMesh(geometry, material,0) : new THREE.Mesh( geometry, material );
      floor.position.x=map.data[0].length * TILE_SIZE / 2
      floor.position.y=map.data.length * TILE_SIZE / 2 * -1
      floor.position.z = 9;
      mapGroup.add( floor );

      var geometry = new THREE.CubeGeometry( 16, 16, 64 );
      var texture = THREE.ImageUtils.loadTexture( '/assets/images/plywood.jpg' );
      var material = Physijs.createMaterial(new THREE.MeshLambertMaterial( { map: texture }),.8,.4);

      for(var y=0;y<map.data.length;y++) {
          var row = map.data[y].split('');
          for(var x=0;x<map.data[0].length;x++) {

              var tile = map.data[y][x];

              if(tile=='0') {
                    var mesh = physics ? new Physijs.BoxMesh(geometry, material) : new THREE.Mesh( geometry, material );
                    mesh.position.x = x * 16;
                    mesh.position.y = y*-16;
                    mesh.position.z = 10;

                    mesh.matrixAutoUpdate = false;
                    mesh.updateMatrix();

                    mapGroup.add( mesh );
              }
          }
      }

      return mapGroup

}
