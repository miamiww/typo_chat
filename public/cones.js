console.log('working');
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( 100, 100 );
document.body.appendChild(renderer.domElement );

var geometry = new THREE.ConeGeometry( 5, 20, 32 );
var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
var cone = new THREE.Mesh( geometry, material );
scene.add( cone );

function animate() {
	requestAnimationFrame( animate );
    renderer.render( scene, camera );
    console.log('working');

}
animate();