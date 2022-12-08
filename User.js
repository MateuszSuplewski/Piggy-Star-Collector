import { Group, Vector3, Quaternion } from "./libs/three128/three.module.js";
import { GLTFLoader } from "./libs/three128/GLTFLoader.js";
import { DRACOLoader } from "./libs/three128/DRACOLoader.js";
import { SFX } from "./libs/SFX.js";

class User {
  constructor(game, pos, heading) {
    this.root = new Group();
    this.root.position.copy(pos);
    this.root.rotation.set(0, heading, 0, "XYZ");
    this.startInfo = { pos: pos.clone(), heading };
    this.game = game;
    this.camera = game.camera;
    game.scene.add(this.root);
    this.load();
    this.tmpVec = new Vector3();
    this.tmpQuat = new Quaternion();
    this.speed = 0;
    this.ready = false;
  }

  reset() {
    this.position = this.startInfo.pos;
    this.root.rotation.set(0, this.startInfo.heading, 0, "XYZ");
    this.root.userData.dead = false;
    this.health = 100;
    this.dead = false;
    this.speed = 0;
  }

  set position(pos) {
    this.root.position.copy(pos);
  }

  get position() {
    return this.root.position;
  }

  load() {
    const loader = new GLTFLoader().setPath(`${this.game.assetsPath}Load/`);
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("./libs/three128/draco/");
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      "pig2.glb",
      (gltf) => {
        this.root.add(gltf.scene);
        this.object = gltf.scene;
        this.object.frustumCulled = false;

        const scale = 1.2;
        this.object.scale.set(scale, scale, scale);

        this.object.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.frustumCulled = false;
          }
        });

        this.ready = true;
        this.game.startRendering();
      },

      (xhr) => {
      },

      (err) => {
        console.error(err);
      }
    );
  }

  initSounds() {
    const assetsPath = `${this.game.assetsPath}Load/sfx/`;
    this.sfx = new SFX(this.game.camera, assetsPath, this.game.listener);
    this.sfx.load("pig_groan", false, 0.8, this.object);
  }

  set action(name) {
    name = name.toLowerCase();
    if (this.actionName == name) return;
    if (name == "shot") {
      this.health -= 25;
      if (this.health > 0) {
        name = "hit";
        this.game.active = false;
        setTimeout(() => (this.game.active = true), 2000);
      } else {
        this.dead = true;
        this.root.userData.dead = true;
        this.game.gameover();
      }

      this.game.ui.health = Math.max(0, Math.min(this.health / 100, 1));
      if (this.sfx) this.sfx.play("pig_groan");
    }
  }

  update(dt) {}
}

export { User };
