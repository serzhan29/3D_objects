import * as THREE from "three";
import { createViewer } from "./viewer.js";
import { setupLighting } from "./lighting.js";
import { setupControls } from "./controls.js";
import { loadModel } from "./modelLoader.js";
import { createClippingPlanes, applyClipping } from "./clipping.js";

const MODEL_URL = window.MODEL_URL;
const container = document.getElementById("viewer");

const { scene, camera, renderer } = createViewer(container);
setupLighting(scene);
const controls = setupControls(camera, renderer, scene);

const clipPlanes = createClippingPlanes();
const CLIP_OFF = 1e6;

let modelSize = 1;
let modelBox = null;
const partsMap = new Map();

function computeLocalBoundingBox(model) {
  const box = new THREE.Box3();
  model.traverse(obj => {
    if (obj.isMesh) {
      obj.geometry.computeBoundingBox();
      box.union(obj.geometry.boundingBox);
    }
  });
  return box;
}

if (MODEL_URL) {
  loadModel(MODEL_URL, scene).then(({ model, size }) => {
    modelSize = size;

    model.traverse(obj => {
      if (obj.isMesh) partsMap.set(obj.name, obj);
    });

    buildPartsUI();

    modelBox = computeLocalBoundingBox(model);
    applyClipping(model, clipPlanes);
    resetCut();
    fitToView();
  });
}

/* ===== PARTS UI ===== */
function buildPartsUI() {
  const list = document.getElementById("partsList");
  list.innerHTML = "";

  [...partsMap.keys()].sort().forEach(name => {
    const row = document.createElement("div");
    row.className = "part-row";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = true;

    const label = document.createElement("label");
    label.textContent = name;

    const toggle = () => {
      checkbox.checked = !checkbox.checked;
      partsMap.get(name).visible = checkbox.checked;
      row.classList.toggle("off", !checkbox.checked);
    };

    checkbox.onchange = () => {
      partsMap.get(name).visible = checkbox.checked;
      row.classList.toggle("off", !checkbox.checked);
    };

    row.onclick = e => {
      if (e.target !== checkbox) toggle();
    };

    row.appendChild(checkbox);
    row.appendChild(label);
    list.appendChild(row);
  });
}

window.showAllParts = () => {
  partsMap.forEach(m => m.visible = true);
  document.querySelectorAll("#partsList input").forEach(cb => cb.checked = true);
  document.querySelectorAll(".part-row").forEach(r => r.classList.remove("off"));
};

/* ===== MODAL ===== */
window.openParts = () => {
  document.getElementById("partsModal").style.display = "flex";
};
window.closeParts = () => {
  document.getElementById("partsModal").style.display = "none";
};

/* ===== CUT ===== */
function cutByAxis(axis, percent) {
  if (!modelBox) return;
  const size = modelBox.max[axis] - modelBox.min[axis];
  clipPlanes[axis].constant = (percent / 100) * (size / 2);
}

window.cutX = v => cutByAxis("x", v);
window.cutY = v => cutByAxis("y", v);
window.cutZ = v => cutByAxis("z", v);

window.resetCut = () => {
  clipPlanes.x.constant = CLIP_OFF;
  clipPlanes.y.constant = CLIP_OFF;
  clipPlanes.z.constant = CLIP_OFF;
};

/* ===== VIEWS ===== */
window.viewFront = () => { camera.position.set(0,0,modelSize*1.8); controls.update(); };
window.viewTop   = () => { camera.position.set(0,modelSize*1.8,0); controls.update(); };
window.viewSide  = () => { camera.position.set(modelSize*1.8,0,0); controls.update(); };

function fitToView() {
  const size = modelSize * 0.8;
  const aspect = window.innerWidth / window.innerHeight;

  camera.left = -size * aspect;
  camera.right = size * aspect;
  camera.top = size;
  camera.bottom = -size;
  camera.position.set(0, 0, size * 1.8);
  camera.updateProjectionMatrix();
  controls.target.set(0,0,0);
  controls.update();
}

document.getElementById("fitBtn")?.addEventListener("click", fitToView);

(function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
})();
