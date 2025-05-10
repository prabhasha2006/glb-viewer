import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x808080);

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Renderer setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

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
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Update animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();