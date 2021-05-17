$(document).ready(function() {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize($('#scene3d').width(), $('#scene3d').height());
    $('#scene3d').append(renderer.domElement);
    // document.body.appendChild(renderer.domElement);

    var geometry = new THREE.SphereGeometry(1, 32, 32);
    var material = new THREE.MeshPhongMaterial();
    var earthmesh = new THREE.Mesh(geometry, material);

    material.map = THREE.ImageUtils.loadTexture('assets/maps/castrovel.jpg');
})