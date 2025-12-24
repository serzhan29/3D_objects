import * as THREE from "three";

export function createViewer(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf2f2f2);

  const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.001, 100000);
  camera.position.set(0, 0, 10);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.localClippingEnabled = true; // 🔥 ОБЯЗАТЕЛЬНО
  renderer.domElement.style.touchAction = "none";

  container.appendChild(renderer.domElement);

  return { scene, camera, renderer };
}
