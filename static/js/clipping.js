  /* ================= Разрезы ================= */
import * as THREE from "three";

export function createClippingPlanes() {
  return {
    x: new THREE.Plane(new THREE.Vector3(-1, 0, 0), 9999),
    y: new THREE.Plane(new THREE.Vector3(0, -1, 0), 9999),
    z: new THREE.Plane(new THREE.Vector3(0, 0, -1), 9999),
  };
}

export function applyClipping(model, planes) {
  model.traverse((obj) => {
    if (obj.isMesh) {
      const mats = Array.isArray(obj.material)
        ? obj.material
        : [obj.material];

      mats.forEach((mat) => {
        mat.clippingPlanes = [planes.x, planes.y, planes.z];
        mat.clipIntersection = false;
      });
    }
  });
}
