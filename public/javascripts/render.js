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

var cameraX = 10;
var cameraY = 10;
var cameraWidth = 10;
var cameraHeight = 10;

function renderViewport() {

    cameraX = ~~(me.x / 16)
    cameraY = ~~(me.y / 16)

    var obj, i;
    for ( i = mapGroup.children.length - 1; i >= 0 ; i -- ) {
        obj = mapGroup.children[ i ];
        mapGroup.remove(obj);
    }

    // for(var y=0;y<16;y++) {
    //     for(var x=0;x<16;x++) {

    for(var y=0;y<16;y++) {
        for(var x=0;x<16;x++) {

            var tile = map.data[y+cameraY][x+cameraX];

            var geometry = new THREE.CubeGeometry( 16, 16, 64 );
            //texture = THREE.ImageUtils.loadTexture( '/assets/images/plywood.jpg' );
            // texture = tileset.tiles[tile-1]
            texture = new THREE.Texture(spriteFromTileset(tile-1))
            texture.needsUpdate = true

            var material = Physijs.createMaterial(new THREE.MeshLambertMaterial( { map: texture }),.8,.4);

            var mesh = physics ? new Physijs.BoxMesh(geometry, material) : new THREE.Mesh( geometry, material );
            mesh.position.x = x * 16;
            mesh.position.y = y*-16;
            mesh.position.z = 10;

            mesh.matrixAutoUpdate = false;
            mesh.updateMatrix();

            mapGroup.add( mesh );

        }
    }
    mapGroup.needsUpdate = true
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
      //mapObject = generateMap()
      // scene.add(mapObject);

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