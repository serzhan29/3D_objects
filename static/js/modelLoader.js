  /* ================= загрузка модели + материалы + контуры ================= */
import * as THREE from "three";
import { GLTFLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

export async function loadModel(url, scene) {
  return new Promise((resolve) => {
    new GLTFLoader().load(url, (gltf) => {
      const model = gltf.scene;

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3()).length();

      model.position.sub(center);

      model.traverse((obj) => {
        if (!obj.isMesh) return;

        obj.castShadow = false;
        obj.receiveShadow = false;

        const materials = Array.isArray(obj.material)
          ? obj.material
          : [obj.material];

        materials.forEach((mat) => {
          mat.metalness = 0.1;
          mat.roughness = 0.4;
          mat.envMapIntensity = 0.5;
          mat.needsUpdate = true;
        });

        if (!obj.userData.edges) {
          const edges = new THREE.EdgesGeometry(obj.geometry, 30);
          const line = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: 0x000000 })
          );
          obj.add(line);
          obj.userData.edges = line;
        }
      });

      scene.add(model);
      resolve({ model, size });
    });
  });
}
