import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Get canvas container
const canvasContainer = document.getElementById('canvas-root');

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x25215E); // 0x808080

let _width = canvasContainer.clientWidth;
let _height = canvasContainer.clientHeight;

// Add background color control
const bgColorPicker = document.getElementById('bg-color');
bgColorPicker.addEventListener('input', (e) => {
    scene.background.set(e.target.value);
});

// Camera setup
const camera = new THREE.PerspectiveCamera(75, _width / _height, 0.1, 1000);
camera.position.z = 5;

// Renderer setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(_width, _height);
canvasContainer.appendChild(renderer.domElement);
//document.body.appendChild(renderer.domElement);

// Controls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lights
// Enhanced lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Lighting controls
const ambientIntensitySlider = document.getElementById('ambient-intensity');
const directionalIntensitySlider = document.getElementById('directional-intensity');
const lightColorPicker = document.getElementById('light-color');

ambientIntensitySlider.addEventListener('input', (e) => {
    ambientLight.intensity = parseFloat(e.target.value);
});

directionalIntensitySlider.addEventListener('input', (e) => {
    directionalLight.intensity = parseFloat(e.target.value);
});

lightColorPicker.addEventListener('input', (e) => {
    const color = new THREE.Color(e.target.value);
    ambientLight.color.set(color);
    directionalLight.color.set(color);
});

// GLB loader
const loader = new GLTFLoader();
let currentModel = null;

document.getElementById('file-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        
        // Remove current model if exists
        if (currentModel) {
            scene.remove(currentModel);
        }

        // Load new model
        loader.load(url, function(gltf) {
            currentModel = gltf.scene;
            scene.add(currentModel);

            // Center and scale model
            const box = new THREE.Box3().setFromObject(currentModel);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 3 / maxDim;
            currentModel.scale.setScalar(scale);
            
            currentModel.position.sub(center.multiplyScalar(scale));
            
            // Reset camera
            camera.position.set(0, 0, 5);
            controls.reset();
        });
    }
});

// Handle window resize
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    _width = canvasContainer.clientWidth;
    _height = canvasContainer.clientHeight;
    camera.aspect = _width / _height;
    camera.updateProjectionMatrix();
    renderer.setSize(_width, _height);
}

// Light position controls
const lightXSlider = document.getElementById('light-x');
const lightYSlider = document.getElementById('light-y');
const lightZSlider = document.getElementById('light-z');

function updateLightPosition() {
    directionalLight.position.set(
        parseFloat(lightXSlider.value),
        parseFloat(lightYSlider.value),
        parseFloat(lightZSlider.value)
    );
}

lightXSlider.addEventListener('input', updateLightPosition);
lightYSlider.addEventListener('input', updateLightPosition);
lightZSlider.addEventListener('input', updateLightPosition);

// Add light helper to visualize light direction
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1);
scene.add(directionalLightHelper);

// Update animation loop to include helper update
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    directionalLightHelper.update(); // Update light helper
    renderer.render(scene, camera);
}
animate();