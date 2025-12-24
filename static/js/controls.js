import { ArcballControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/ArcballControls.js";

export function setupControls(camera, renderer, scene) {
  const controls = new ArcballControls(camera, renderer.domElement, scene);

  controls.rotateSpeed = /Mobi|Android/i.test(navigator.userAgent) ? 2.5 : 1.6;
  controls.zoomSpeed = 2.0;
  controls.panSpeed = 1.2;

  controls.enableRotate = true;
  controls.enableZoom = true;
  controls.enablePan = true;
  controls.enableAnimations = false;

  controls.minZoom = 0.5;
  controls.maxZoom = 5;

  controls.saveState();
  return controls;
}
