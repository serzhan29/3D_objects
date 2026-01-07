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
      // убедимся что геометрия имеет вычисленный boundingBox
      obj.geometry.computeBoundingBox();
      // boundingBox в локальных координатах геометрии — union работает корректно если меши без трансформации,
      // для сложных иерархий может потребоваться применять world matrix (но это отдельная тема)
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
      target: controls.target ? controls.target.clone() : new THREE.Vector3(0, 0, 0),
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
/* При смене вида — меняем позицию, target и обновляем проекцию.
   НЕ трогаем camera.zoom здесь: он должен сохраняться */
window.viewFront = () => {
  camera.position.set(0, 0, modelSize * 1.8);
  controls.target.set(0, 0, 0);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  // синхронизируем контролы один раз
  controls.update();
};

window.viewTop = () => {
  camera.position.set(0, modelSize * 1.8, 0);
  controls.target.set(0, 0, 0);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  controls.update();
};

window.viewSide = () => {
  camera.position.set(modelSize * 1.8, 0, 0);
  controls.target.set(0, 0, 0);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  controls.update();
};

/* ================= FIT TO VIEW ================= */
/* fitToView теперь учитывает текущий camera.zoom — чтобы не затирать зум пользователя */
function fitToView() {
  const size = (modelSize * 0.8) / camera.zoom;
  const aspect = window.innerWidth / window.innerHeight;

  camera.left = -size * aspect;
  camera.right = size * aspect;
  camera.top = size;
  camera.bottom = -size;

  camera.position.set(0, 0, size * 1.8);
  controls.target.set(0, 0, 0);
  camera.lookAt(0, 0, 0);

  camera.updateProjectionMatrix();

  // вызов controls.update() один раз — чтобы Arcball / другие контролы синхронизировались с новым target/position
  controls.update();
  controls.saveState(); // ← обновляем эталон
}

document.getElementById("fitBtn")?.addEventListener("click", fitToView);

/* ================= RESIZE ================= */
/* при изменении размера окна пересчитываем фруструм с учётом текущего zoom */
function onWindowResize() {
  const aspect = window.innerWidth / window.innerHeight;
  // размер на основе modelSize и текущего zoom, чтобы вид сохранялся
  const size = (modelSize * 0.8) / camera.zoom;

  camera.left = -size * aspect;
  camera.right = size * aspect;
  camera.top = size;
  camera.bottom = -size;

  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onWindowResize, { passive: true });

/* ================= LOOP ================= */
/* ВНИМАНИЕ: controls.update() убран из цикла — ArcballControls мы вызываем вручную при изменениях */
(function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
})();

/* ================= RESTORE VIEW ================= */
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
