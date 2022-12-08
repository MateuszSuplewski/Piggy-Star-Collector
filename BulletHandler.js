import {Mesh, CylinderGeometry, MeshBasicMaterial, Vector3, Quaternion } from "./libs/three128/three.module.js";
import { sphereIntersectsCylinder } from "./libs/Collisions.js";

class BulletHandler {
  constructor(game) {
    this.game = game;
    this.scene = game.scene;
    const geometry = new CylinderGeometry(0.01, 0.01, 0.08);
    geometry.rotateX(Math.PI / 2);
    geometry.rotateY(Math.PI / 2);
    const material = new MeshBasicMaterial({ color: 0xff0000 });
    this.bullet = new Mesh(geometry, material);
    this.bullets = [];
    this.npcs = this.game.npcHandler.npcs;
    this.user = this.game.user;
    this.forward = new Vector3(0, 0, -1);
    this.xAxis = new Vector3(1, 0, 0);
    this.tmpVec3 = new Vector3();
    this.tmpQuat = new Quaternion();
  }

  createBullet(pos, quat, user = false) {
    const bullet = this.bullet.clone();
    bullet.position.copy(pos);
    bullet.quaternion.copy(quat);
    bullet.userData.targetType = user ? 1 : 2;
    bullet.userData.distance = 0;
    this.scene.add(bullet);
    this.bullets.push(bullet);
  }

  update(dt) {
    this.bullets.forEach((bullet) => {
      let hit = false;
      let target;
      const bulletStart = bullet.position.clone();
      const dist = dt * 15;
      bullet.translateX(dist);
      const bulletEnd = bullet.position.clone();
      bullet.position.copy(bulletStart);
      const iterations = 1;
      const bulletPos = this.tmpVec3;
      for (let i = 1; i <= iterations; i++) {
        bulletPos.lerpVectors(bulletStart, bulletEnd, i / iterations);
        if (bullet.userData.targetType == 1) {
          const playerPos = this.user.position.clone();
          playerPos.y += 1.2;
          hit = sphereIntersectsCylinder(
            bulletPos.x,
            bulletPos.y,
            bulletPos.z,
            0.01,
            playerPos.x,
            playerPos.y,
            playerPos.z,
            2.4,
            0.4
          );
          if (hit) target = this.user;
        }
        if (hit) break;
      }

      if (hit) {
        target.action = "shot";
        bullet.userData.remove = true;
      } else {
        bullet.translateX(dist);
        bullet.rotateX(dt * 0.3);
        bullet.userData.distance += dist;
        bullet.userData.remove = bullet.userData.distance > 50;
      }
    });

    let found = false;
    do {
      let remove;
      found = this.bullets.some((bullet) => {
        if (bullet.userData.remove) {
          remove = bullet;
          return true;
        }
      });
      if (found) {
        const index = this.bullets.indexOf(remove);
        if (index !== -1) this.bullets.splice(index, 1);
        this.scene.remove(remove);
      }
    } while (found);
  }
}

export { BulletHandler };
