import * as THREE from "three";
import { createViewer } from "./viewer.js";
import { setupLighting } from "./lighting.js";
import { setupControls } from "./controls.js";
import { loadModel } from "./modelLoader.js";
import { createClippingPlanes, applyClipping } from "./clipping.js";

/* ================= DATA ================= */
const MODEL_URL = window.MODEL_URL;
const container = document.getElementById("viewer");
let initialViewState = null;

/* ================= VIEWER ================= */
const { scene, camera, renderer } = createViewer(container);
setupLighting(scene);

const controls = setupControls(camera, renderer, scene);

/* ================= CLIPPING ================= */
const clipPlanes = createClippingPlanes();
const CLIP_OFF = 1e6;

/* ================= MODEL ================= */
let modelSize = 1;
let modelBox = null;

/* ===== корректный bounding box (ЛОКАЛЬНЫЙ) ===== */
function computeLocalBoundingBox(model) {
  const box = new THREE.Box3();

  model.traverse((obj) => {
    if (obj.isMesh) {
      obj.geometry.computeBoundingBox();
      box.union(obj.geometry.boundingBox);
    }
  });

  return box;
}

/* ================= LOAD MODEL ================= */
if (MODEL_URL) {
  loadModel(MODEL_URL, scene).then(({ model, size }) => {
    modelSize = size;

    modelBox = computeLocalBoundingBox(model);
    applyClipping(model, clipPlanes);
    resetCut();

    fitToView();

    // 🔥 СНИМОК НАЧАЛЬНОГО СОСТОЯНИЯ
    initialViewState = {
      cameraPosition: camera.position.clone(),
      cameraZoom: camera.zoom,
      cameraLeft: camera.left,
      cameraRight: camera.right,
      cameraTop: camera.top,
      cameraBottom: camera.bottom,
      target: controls.target.clone(),
    };
  });
}


/* ================= CUT LOGIC (PERCENT → MODEL SIZE) ================= */
function cutByAxis(axis, percent) {
  if (!modelBox) return;

  const size = modelBox.max[axis] - modelBox.min[axis];
  const half = size / 2;
  const p = Number(percent) / 100;

  clipPlanes[axis].constant = p * half;
}

window.cutX = (v) => cutByAxis("x", v);
window.cutY = (v) => cutByAxis("y", v);
window.cutZ = (v) => cutByAxis("z", v);

window.resetCut = () => {
  clipPlanes.x.constant = CLIP_OFF;
  clipPlanes.y.constant = CLIP_OFF;
  clipPlanes.z.constant = CLIP_OFF;
};

/* ================= INTERACTION ================= */
window.setRotateSpeed = (v) => {
  controls.rotateSpeed = Number(v);
};

/* ================= VIEWS ================= */
window.viewFront = () => {
  camera.position.set(0, 0, modelSize * 1.8);
  camera.lookAt(0, 0, 0);
  controls.update();
};

window.viewTop = () => {
  camera.position.set(0, modelSize * 1.8, 0);
  camera.lookAt(0, 0, 0);
  controls.update();
};

window.viewSide = () => {
  camera.position.set(modelSize * 1.8, 0, 0);
  camera.lookAt(0, 0, 0);
  controls.update();
};

/* ================= FIT TO VIEW ================= */
function fitToView() {
  const size = modelSize * 0.8;
  const aspect = window.innerWidth / window.innerHeight;

  camera.left = -size * aspect;
  camera.right = size * aspect;
  camera.top = size;
  camera.bottom = -size;

  camera.position.set(0, 0, size * 1.8);
  camera.lookAt(0, 0, 0);

  camera.updateProjectionMatrix();

  controls.target.set(0, 0, 0);
  controls.update();
  controls.saveState(); // ← обновляем эталон
}


document.getElementById("fitBtn")?.addEventListener("click", fitToView);

/* ================= LOOP ================= */
(function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
})();


window.restoreInitialView = () => {
  if (!initialViewState) return;

  camera.position.copy(initialViewState.cameraPosition);
  camera.zoom = initialViewState.cameraZoom;

  camera.left = initialViewState.cameraLeft;
  camera.right = initialViewState.cameraRight;
  camera.top = initialViewState.cameraTop;
  camera.bottom = initialViewState.cameraBottom;

  camera.updateProjectionMatrix();

  controls.target.copy(initialViewState.target);
  controls.update();
};
