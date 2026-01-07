import { ArcballControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/ArcballControls.js";

export function setupControls(camera, renderer, scene) {
  const controls = new ArcballControls(camera, renderer.domElement, scene);

  controls.rotateSpeed = /Mobi|Android/i.test(navigator.userAgent) ? 2.5 : 1.6;
  controls.panSpeed = 1.2;

  controls.enableRotate = true;
  controls.enablePan = true;
  controls.enableZoom = false; // ❗ ОБЯЗАТЕЛЬНО
  controls.enableAnimations = false;

  // начальный зум
  camera.zoom = 1;
  camera.updateProjectionMatrix();

  const dom = renderer.domElement;

  dom.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();

      const zoomFactor = 1 - e.deltaY * 0.001;
      camera.zoom *= zoomFactor;

      camera.zoom = Math.max(0.2, Math.min(5, camera.zoom));
      camera.updateProjectionMatrix();
    },
    { passive: false }
  );

  controls.saveState();
  return controls;
}
