import * as THREE from "three";

export function setupLighting(scene) {
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  const key = new THREE.DirectionalLight(0xffffff, 0.8);
  key.position.set(10, 10, 10);
  scene.add(key);

  const back = new THREE.DirectionalLight(0xffffff, 0.4);
  back.position.set(-10, -10, -10);
  scene.add(back);
}
