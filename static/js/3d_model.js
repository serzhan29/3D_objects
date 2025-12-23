import * as THREE from "three";
import { GLTFLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";
import { ArcballControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/ArcballControls.js";

const MODEL_URL = window.MODEL_URL;

/* SCENE */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf2f2f2);

/* CAMERA */
const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.001, 100000);
camera.position.set(0, 0, 10);

/* RENDERER */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("viewer").appendChild(renderer.domElement);

/* LIGHT */
scene.add(new THREE.AmbientLight(0xffffff, 0.9));
const dir = new THREE.DirectionalLight(0xffffff, 1);
dir.position.set(5, 5, 5);
scene.add(dir);

/* CONTROLS */
const controls = new ArcballControls(camera, renderer.domElement, scene);
controls.enableAnimations = false;

let modelSize = null;

if (MODEL_URL) {
  new GLTFLoader().load(MODEL_URL, (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    modelSize = box.getSize(new THREE.Vector3()).length();

    model.position.sub(center);
    scene.add(model);
    fitToView();
  });
}

function fitToView() {
  if (!modelSize) return;
  const size = modelSize * 1.2;
  const aspect = window.innerWidth / window.innerHeight;

  camera.left = -size * aspect;
  camera.right = size * aspect;
  camera.top = size;
  camera.bottom = -size;

  camera.position.set(0, 0, size);
  camera.updateProjectionMatrix();
  controls.update();
}

document.getElementById("fitBtn").onclick = fitToView;

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  fitToView();
});

(function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
})();
