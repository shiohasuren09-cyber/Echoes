import * as THREE from 'three';
import { textureGenerator } from './TextureGenerator';
import { InteractiveObjectData } from '../types';

export interface CollisionBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  id?: string;
}

export type InteractiveMesh = THREE.Mesh;

export interface FlickeringLight {
  light: THREE.PointLight | THREE.SpotLight;
  baseIntensity: number;
  type: 'fluorescent' | 'incandescent' | 'tv' | 'spark';
  timer: number;
  nextFlicker: number;
}

export class HouseBuilder {
  public scene: THREE.Scene;
  public colliders: CollisionBox[] = [];
  public interactiveObjects: InteractiveMesh[] = [];
  public dynamicLights: THREE.Light[] = [];
  public flickeringLights: FlickeringLight[] = [];
  public ceilingFan: THREE.Group | null = null;
  public bathroomMirrorMesh: THREE.Mesh | null = null;
  public crtMesh: THREE.Mesh | null = null;
  public portraitMesh: THREE.Mesh | null = null;
  public clockPendulum: THREE.Mesh | null = null;
  public hospitalCorridorGroup: THREE.Group | null = null;
  public bedroomDoor: THREE.Group | null = null;
  public basementDoor: THREE.Group | null = null;
  public memoryFragmentObjects: THREE.Group[] = [];

  // Shared reusable geometries and materials for optimal memory
  private sharedWallMaterial: THREE.MeshStandardMaterial;
  private sharedFloorMaterial: THREE.MeshStandardMaterial;
  private sharedCeilingMaterial: THREE.MeshStandardMaterial;
  private sharedWoodMaterial: THREE.MeshStandardMaterial;
  private sharedMetalMaterial: THREE.MeshStandardMaterial;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    const wallpaperTex = textureGenerator.getVintageWallpaperTexture();
    const woodFloorTex = textureGenerator.getWoodFloorTexture();

    this.sharedWallMaterial = new THREE.MeshStandardMaterial({
      map: wallpaperTex,
      roughness: 0.85,
      metalness: 0.05,
    });

    this.sharedFloorMaterial = new THREE.MeshStandardMaterial({
      map: woodFloorTex,
      roughness: 0.4,
      metalness: 0.1,
    });

    this.sharedCeilingMaterial = new THREE.MeshStandardMaterial({
      color: 0x222225,
      roughness: 0.95,
      metalness: 0.0,
    });

    this.sharedWoodMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d2314,
      roughness: 0.6,
      metalness: 0.1,
    });

    this.sharedMetalMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.8,
      roughness: 0.25,
    });
  }

  public registerFlickeringLight(
    light: THREE.PointLight | THREE.SpotLight,
    type: 'fluorescent' | 'incandescent' | 'tv' | 'spark' = 'incandescent'
  ) {
    this.dynamicLights.push(light);
    this.flickeringLights.push({
      light,
      baseIntensity: light.intensity,
      type,
      timer: 0,
      nextFlicker: 0.8 + Math.random() * 2.5,
    });
  }

  public buildHouse(): void {
    // 1. Build Rooms
    this.buildBedroom();
    this.buildBathroom();
    this.buildMasterBedroom();
    this.buildHallway();
    this.buildLivingRoom();
    this.buildKitchen();
    this.buildUtilityPantry();
    this.buildStudy();
    this.buildHospitalRoom(); // hidden initially in Act 1 & 2
    this.buildMemoryFragments(); // Collectible psychological memory breadcrumbs
  }

  // --- ROOM BUILDERS ---

  private addWall(
    x: number,
    z: number,
    width: number,
    depth: number,
    height: number = 3.2,
    customMat?: THREE.Material,
    addCollider: boolean = true,
    colliderId?: string
  ) {
    const geo = new THREE.BoxGeometry(width, height, depth);
    const mesh = new THREE.Mesh(geo, customMat || this.sharedWallMaterial);
    mesh.position.set(x, height / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    // Register collider with exact physical bounds (no ghost padding that restricts doorways)
    if (addCollider) {
      this.colliders.push({
        id: colliderId,
        minX: x - width / 2,
        maxX: x + width / 2,
        minZ: z - depth / 2,
        maxZ: z + depth / 2,
      });
    }

    return mesh;
  }

  private addFloor(
    x: number,
    z: number,
    width: number,
    depth: number,
    customMat?: THREE.Material
  ) {
    const geo = new THREE.PlaneGeometry(width, depth);
    const mesh = new THREE.Mesh(geo, customMat || this.sharedFloorMaterial);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, 0, z);
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    // Ceiling
    const ceilingGeo = new THREE.PlaneGeometry(width, depth);
    const ceiling = new THREE.Mesh(ceilingGeo, this.sharedCeilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(x, 3.2, z);
    this.scene.add(ceiling);
  }

  private buildBedroom() {
    // Bedroom centered at (0, 0), size: 6m x 6m (from -3 to +3)
    this.addFloor(0, 0, 6, 6);

    // North wall (with window)
    this.addWall(-1.8, -3, 2.4, 0.2);
    this.addWall(1.8, -3, 2.4, 0.2);
    // Window frame in middle
    const windowFrame = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.4, 0.15),
      new THREE.MeshStandardMaterial({ color: 0x1a1a20, roughness: 0.5 })
    );
    windowFrame.position.set(0, 1.8, -2.95);
    this.scene.add(windowFrame);

    // Window glass with thunderstorm rain glow
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(1.0, 1.2),
      new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        transparent: true,
        opacity: 0.5,
        roughness: 0.1,
      })
    );
    glass.position.set(0, 1.8, -2.92);
    this.scene.add(glass);

    // South wall with doorway to hallway (Door at x: 0, width: 1.2m)
    this.addWall(-2.0, 3, 2.0, 0.2);
    this.addWall(2.0, 3, 2.0, 0.2);

    // West wall
    this.addWall(-3, 0, 0.2, 6);
    // East wall
    this.addWall(3, 0, 0.2, 6);

    // BED
    this.createChildBed(-1.8, -1.8);

    // DESK WITH FLASHLIGHT
    this.createDesk(1.8, -2.4);

    // WARDROBE
    this.createWardrobe(-2.4, 1.5);

    // CRAYON DRAWING ON WALL
    this.createCrayonDrawingWallItem(2.88, 1.8, -0.5);

    // Bedroom rug
    const rugGeo = new THREE.PlaneGeometry(2.4, 3.0);
    const rug = new THREE.Mesh(rugGeo, new THREE.MeshStandardMaterial({
      map: textureGenerator.getRugTexture(),
      roughness: 0.9,
    }));
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0.2, 0.01, -0.2);
    rug.receiveShadow = true;
    this.scene.add(rug);
  }

  private createChildBed(x: number, z: number) {
    const bedGroup = new THREE.Group();
    bedGroup.position.set(x, 0, z);

    // Bedframe
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.4, 2.2),
      this.sharedWoodMaterial
    );
    frame.position.y = 0.2;
    frame.castShadow = true;
    bedGroup.add(frame);

    // Headboard
    const headboard = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.1, 0.1),
      this.sharedWoodMaterial
    );
    headboard.position.set(0, 0.65, -1.05);
    headboard.castShadow = true;
    bedGroup.add(headboard);

    // Mattress & nostalgic blanket
    const mattress = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.35, 2.05),
      new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.9 })
    );
    mattress.position.set(0, 0.45, 0.05);
    bedGroup.add(mattress);

    // Fluffy Pillow
    const pillow = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.15, 0.4),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.95 })
    );
    pillow.position.set(0, 0.68, -0.75);
    bedGroup.add(pillow);

    // Beside table with glowing digital clock
    const nightstand = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.65, 0.6),
      this.sharedWoodMaterial
    );
    nightstand.position.set(1.1, 0.32, -0.8);
    bedGroup.add(nightstand);

    // 03:17 AM digital clock
    const clockBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.12, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x111827 })
    );
    clockBody.position.set(1.1, 0.71, -0.8);

    // Glowing red LED face
    const ledCanvas = document.createElement('canvas');
    ledCanvas.width = 128;
    ledCanvas.height = 64;
    const lctx = ledCanvas.getContext('2d')!;
    lctx.fillStyle = '#000';
    lctx.fillRect(0, 0, 128, 64);
    lctx.fillStyle = '#ef4444';
    lctx.font = 'bold 36px monospace';
    lctx.fillText('03:17', 10, 44);
    const ledTex = new THREE.CanvasTexture(ledCanvas);

    const clockFace = new THREE.Mesh(
      new THREE.PlaneGeometry(0.22, 0.1),
      new THREE.MeshBasicMaterial({ map: ledTex })
    );
    clockFace.position.set(1.1, 0.71, -0.735);
    bedGroup.add(clockBody);
    bedGroup.add(clockFace);

    this.scene.add(bedGroup);

    // Tight collision for bed frame and nightstand separately (leaves center of bedroom free)
    this.colliders.push({
      minX: x - 0.7,
      maxX: x + 0.7,
      minZ: z - 1.1,
      maxZ: z + 1.1,
    });
    this.colliders.push({
      minX: x + 0.8,
      maxX: x + 1.4,
      minZ: z - 1.1,
      maxZ: z - 0.5,
    });
  }

  private createDesk(x: number, z: number) {
    const desk = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.75, 0.9),
      this.sharedWoodMaterial
    );
    desk.position.set(x, 0.375, z);
    desk.castShadow = true;
    this.scene.add(desk);

    // The Flashlight! (Crucial first item to collect)
    const flashlight = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.05, 0.28, 12),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7, roughness: 0.3 })
    ) as InteractiveMesh;
    flashlight.rotation.x = Math.PI / 2;
    flashlight.rotation.z = 0.4;
    flashlight.position.set(x - 0.2, 0.8, z);
    flashlight.userData = {
      interactiveData: {
        id: 'flashlight',
        name: 'Flashlight',
        prompt: 'Press [E] or Tap to Pick up Flashlight',
        type: 'pickup',
        content: 'A heavy metal flashlight. Perfect for dark hallways.',
      },
    };
    this.scene.add(flashlight);
    this.interactiveObjects.push(flashlight);

    // Note on desk: "Doctor's appointment reminder"
    const noteMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.22, 0.28),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.9 })
    ) as InteractiveMesh;
    noteMesh.rotation.x = -Math.PI / 2;
    noteMesh.position.set(x + 0.3, 0.76, z);
    noteMesh.userData = {
      interactiveData: {
        id: 'note_desk',
        name: 'Appointment Note',
        prompt: 'Press [E] or Tap to Read Note',
        type: 'inspect',
        content: '"Leo, remember: take your evening blue pill with water. Dr. Harmon said the shadows will stop if you rest. Love, Mom."',
      },
    };
    this.scene.add(noteMesh);
    this.interactiveObjects.push(noteMesh);

    // Exact desk collider bounds
    this.colliders.push({
      minX: x - 0.8,
      maxX: x + 0.8,
      minZ: z - 0.45,
      maxZ: z + 0.45,
    });
  }

  private createWardrobe(x: number, z: number) {
    const wardrobe = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 2.2, 1.4),
      this.sharedWoodMaterial
    );
    wardrobe.position.set(x, 1.1, z);
    wardrobe.castShadow = true;
    this.scene.add(wardrobe);

    // Exact wardrobe collider bounds
    this.colliders.push({
      minX: x - 0.45,
      maxX: x + 0.45,
      minZ: z - 0.7,
      maxZ: z + 0.7,
    });
  }

  private createCrayonDrawingWallItem(x: number, y: number, z: number) {
    const tex = textureGenerator.getCrayonDrawingTexture();
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.75, 0.75),
      this.sharedWoodMaterial
    );
    frame.position.set(x, y, z);

    const canvas = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 0.7),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 })
    ) as InteractiveMesh;
    canvas.rotation.y = -Math.PI / 2;
    canvas.position.set(x - 0.025, y, z);
    canvas.userData = {
      interactiveData: {
        id: 'crayon_drawing',
        name: 'Family Drawing',
        prompt: 'Press [E] or Tap to Inspect Drawing',
        type: 'inspect',
        content: 'A crayon drawing titled "Our Happy Home - 1998". In the corner, someone scribbled: "(he is watching from the dark)". There are three figures... and a shadowy fourth one.',
      },
    };

    this.scene.add(frame);
    this.scene.add(canvas);
    this.interactiveObjects.push(canvas);
  }

  private createSteamRadiator(x: number, y: number, z: number, rotY: number = 0) {
    const radiatorGroup = new THREE.Group();
    radiatorGroup.position.set(x, y, z);
    radiatorGroup.rotation.y = rotY;

    const radMat = new THREE.MeshStandardMaterial({
      color: 0x3f3f46,
      metalness: 0.75,
      roughness: 0.35,
    });

    // 8 vertical cast iron column sections
    for (let i = -4; i < 4; i++) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, 0.22), radMat);
      fin.position.set(i * 0.08, 0.35, 0);
      radiatorGroup.add(fin);
    }

    // Top and bottom connecting steam manifold pipes
    const manifoldGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.7, 12);
    const mTop = new THREE.Mesh(manifoldGeo, this.sharedMetalMaterial);
    mTop.rotation.z = Math.PI / 2;
    mTop.position.set(0, 0.65, 0);
    radiatorGroup.add(mTop);

    const mBot = new THREE.Mesh(manifoldGeo, this.sharedMetalMaterial);
    mBot.rotation.z = Math.PI / 2;
    mBot.position.set(0, 0.06, 0);
    radiatorGroup.add(mBot);

    // Steam release valve with knob
    const valve = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.08), this.sharedMetalMaterial);
    valve.position.set(0.32, 0.65, 0);
    radiatorGroup.add(valve);

    // Interactive hitbox
    const hitBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.8, 0.3),
      new THREE.MeshBasicMaterial({ visible: false })
    ) as InteractiveMesh;
    hitBox.position.set(0, 0.4, 0);
    hitBox.userData = {
      interactiveData: {
        id: 'steam_radiator',
        name: 'Cast Iron Steam Radiator',
        prompt: 'Press [E] or Tap to Warm Hands',
        type: 'inspect',
        content: 'The cast iron fins radiate scalding heat. The pipes click and hiss rhythmically with escaping steam, like rhythmic mechanical breathing.',
      },
    };
    radiatorGroup.add(hitBox);
    this.interactiveObjects.push(hitBox);

    this.scene.add(radiatorGroup);

    const cosR = Math.abs(Math.cos(rotY));
    const sinR = Math.abs(Math.sin(rotY));
    const hw = 0.38 * cosR + 0.15 * sinR;
    const hd = 0.38 * sinR + 0.15 * cosR;

    this.colliders.push({
      minX: x - hw,
      maxX: x + hw,
      minZ: z - hd,
      maxZ: z + hd,
    });
  }

  private buildBathroom() {
    // Bathroom located west of hallway at z: 3 to 7 (x: -1.2 to -4.5)
    const tileMat = new THREE.MeshStandardMaterial({
      map: textureGenerator.getBathroomTileTexture(),
      roughness: 0.3,
      metalness: 0.05,
    });
    this.addFloor(-2.85, 5.0, 3.3, 4.0, tileMat);

    const plasterMat = new THREE.MeshStandardMaterial({
      map: textureGenerator.getPeelingPlasterTexture(),
      roughness: 0.88,
      metalness: 0.02,
    });

    // North wall (connecting to bedroom south wall at z: 3.0)
    this.addWall(-2.85, 3.0, 3.3, 0.2, 3.2, plasterMat);
    // West wall
    this.addWall(-4.5, 5.0, 0.2, 4.0, 3.2, plasterMat);
    // South wall (connecting to kitchen north wall at z: 7.0)
    this.addWall(-2.85, 7.0, 3.3, 0.2, 3.2, plasterMat);

    // 1. Victorian Clawfoot Bathtub against north wall
    this.createClawfootTub(-2.8, 3.55);

    // 2. Porcelain Pedestal Sink against west wall
    this.createPedestalSink(-4.15, 5.0);

    // 3. Mirrored Medicine Cabinet on west wall above sink
    const mirrorTex = textureGenerator.getFoggedMirrorTexture(false);
    const mirrorMat = new THREE.MeshStandardMaterial({
      map: mirrorTex,
      roughness: 0.15,
      metalness: 0.85,
    });
    const mirror = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.95), mirrorMat) as InteractiveMesh;
    mirror.position.set(-4.38, 1.6, 5.0);
    mirror.rotation.y = Math.PI / 2;
    mirror.userData = {
      interactiveData: {
        id: 'bathroom_mirror',
        name: 'Fogged Medicine Cabinet',
        prompt: 'Press [E] or Tap to Wipe Mirror',
        type: 'inspect',
        content: 'Condensation streaks the cold glass. As you wipe the steam away, you see yourself... but you are wearing a hospital patient gown, and an IV drip stand is reflected behind you.',
      },
    };
    this.scene.add(mirror);
    this.interactiveObjects.push(mirror);
    this.bathroomMirrorMesh = mirror;

    // 4. Vintage High-Tank Pull-Chain Toilet
    this.createVintageToilet(-4.0, 6.3);

    // 5. Steam Radiator along south wall
    this.createSteamRadiator(-2.2, 0, 6.82, 0);

    // 6. Flickering Fluorescent Bathroom Light
    const bathLight = new THREE.PointLight(0xa5f3fc, 0.75, 6.0);
    bathLight.position.set(-2.85, 2.9, 5.0);
    this.scene.add(bathLight);
    this.registerFlickeringLight(bathLight, 'fluorescent');
  }

  private createClawfootTub(x: number, z: number) {
    const tubGroup = new THREE.Group();
    tubGroup.position.set(x, 0, z);

    const porcelainMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });

    // Tub outer bowl
    const tub = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.55, 0.75), porcelainMat);
    tub.position.y = 0.35;
    tubGroup.add(tub);

    // Tub interior hollow (dark water/empty porcelain)
    const hollow = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.45, 0.58),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 })
    );
    hollow.position.y = 0.42;
    tubGroup.add(hollow);

    // Rolled enamel rim
    const rimGeo = new THREE.TorusGeometry(0.72, 0.035, 8, 24);
    const rim = new THREE.Mesh(rimGeo, porcelainMat);
    rim.rotation.x = Math.PI / 2;
    rim.scale.set(1.0, 0.48, 1.0);
    rim.position.y = 0.63;
    tubGroup.add(rim);

    // 4 Brass claw feet
    const footMat = this.sharedMetalMaterial;
    const footGeo = new THREE.CylinderGeometry(0.04, 0.02, 0.12, 8);
    const footPos = [
      [-0.65, 0.06, -0.3],
      [0.65, 0.06, -0.3],
      [-0.65, 0.06, 0.3],
      [0.65, 0.06, 0.3],
    ];
    for (const [fx, fy, fz] of footPos) {
      const foot = new THREE.Mesh(footGeo, footMat);
      foot.position.set(fx, fy, fz);
      tubGroup.add(foot);
    }

    // Brass faucets
    const faucet = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 10), footMat);
    faucet.position.set(-0.7, 0.72, 0);
    tubGroup.add(faucet);

    this.scene.add(tubGroup);

    this.colliders.push({
      minX: x - 0.85,
      maxX: x + 0.85,
      minZ: z - 0.42,
      maxZ: z + 0.42,
    });
  }

  private createPedestalSink(x: number, z: number) {
    const sinkGroup = new THREE.Group();
    sinkGroup.position.set(x, 0, z);

    const porcelainMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });

    // Fluted pedestal column
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.72, 16), porcelainMat);
    col.position.y = 0.36;
    sinkGroup.add(col);

    // Rectangular basin
    const basin = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.18, 0.55), porcelainMat);
    basin.position.y = 0.81;
    sinkGroup.add(basin);

    // Gooseneck brass faucet
    const faucet = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.18, 10), this.sharedMetalMaterial);
    faucet.position.set(0, 0.98, -0.15);
    sinkGroup.add(faucet);

    // Interactive faucet handle
    const hitBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.9, 0.6),
      new THREE.MeshBasicMaterial({ visible: false })
    ) as InteractiveMesh;
    hitBox.position.y = 0.6;
    hitBox.userData = {
      interactiveData: {
        id: 'sink_faucet',
        name: 'Pedestal Sink',
        prompt: 'Press [E] or Tap to Inspect Faucet',
        type: 'inspect',
        content: 'Drip... drip... drip. The rusty faucet leaks rhythmically into the porcelain basin. Each droplet sounds like the slow beep of a hospital cardiac telemetry monitor.',
      },
    };
    sinkGroup.add(hitBox);
    this.interactiveObjects.push(hitBox);

    this.scene.add(sinkGroup);

    this.colliders.push({
      minX: x - 0.35,
      maxX: x + 0.35,
      minZ: z - 0.3,
      maxZ: z + 0.3,
    });
  }

  private createVintageToilet(x: number, z: number) {
    const toiletGroup = new THREE.Group();
    toiletGroup.position.set(x, 0, z);

    const porcelainMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });

    // Bowl
    const bowl = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.42, 0.55), porcelainMat);
    bowl.position.y = 0.21;
    toiletGroup.add(bowl);

    // Wooden toilet seat
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.04, 0.52), this.sharedWoodMaterial);
    seat.position.y = 0.44;
    toiletGroup.add(seat);

    // High wall-mounted wooden tank
    const tank = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.26), this.sharedWoodMaterial);
    tank.position.set(0, 2.3, -0.12);
    toiletGroup.add(tank);

    // Flush pipe from tank to bowl
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.8, 10), this.sharedMetalMaterial);
    pipe.position.set(0, 1.35, -0.12);
    toiletGroup.add(pipe);

    // Brass pull chain with white ceramic teardrop handle
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.8, 6), this.sharedMetalMaterial);
    chain.position.set(0.2, 1.8, -0.1);
    toiletGroup.add(chain);

    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.01, 0.08), porcelainMat);
    handle.position.set(0.2, 1.36, -0.1);
    toiletGroup.add(handle);

    this.scene.add(toiletGroup);

    this.colliders.push({
      minX: x - 0.28,
      maxX: x + 0.28,
      minZ: z - 0.28,
      maxZ: z + 0.28,
    });
  }

  private buildMasterBedroom() {
    // Master Bedroom located east of hallway at z: 3 to 7 (x: 1.2 to 5.2)
    const masterWallMat = new THREE.MeshStandardMaterial({
      map: textureGenerator.getFloralWallpaperTexture(),
      roughness: 0.85,
      metalness: 0.05,
    });

    this.addFloor(3.2, 5.0, 4.0, 4.0);

    // North wall (connecting to bedroom south wall at z: 3.0)
    this.addWall(3.2, 3.0, 4.0, 0.2, 3.2, masterWallMat);
    // East wall (with window to storm)
    this.addWall(5.2, 5.0, 0.2, 4.0, 3.2, masterWallMat);
    // South wall (connecting to living room north wall at z: 7.0)
    this.addWall(3.2, 7.0, 4.0, 0.2, 3.2, masterWallMat);

    // Persian area rug
    const rugGeo = new THREE.PlaneGeometry(2.8, 3.0);
    const rug = new THREE.Mesh(
      rugGeo,
      new THREE.MeshStandardMaterial({
        map: textureGenerator.getRugTexture(),
        roughness: 0.88,
      })
    );
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(3.4, 0.015, 5.0);
    this.scene.add(rug);

    // 1. Parents' Carved Oak Double Bed
    this.createMasterBed(4.0, 5.0);

    // 2. Left Nightstand with Bedside Lamp
    this.createNightstandWithLamp(4.7, 3.6);

    // 3. Right Nightstand with Rotary Telephone
    this.createNightstandWithRotaryPhone(4.7, 6.4);

    // 4. Victorian Wardrobe Armoire
    this.createMasterWardrobe(2.2, 6.7);

    // 5. Dressing Vanity Table
    this.createVanityTable(2.2, 3.35);

    // 6. Vintage Suitcase
    this.createVintageSuitcase(1.8, 4.2);

    // 7. Steam Radiator under east window
    this.createSteamRadiator(5.05, 0, 5.0, Math.PI / 2);
  }

  private createMasterBed(x: number, z: number) {
    const bedGroup = new THREE.Group();
    bedGroup.position.set(x, 0, z);

    // Headboard against east wall
    const headboard = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.4, 1.9), this.sharedWoodMaterial);
    headboard.position.set(1.0, 0.7, 0);
    bedGroup.add(headboard);

    // Footboard
    const footboard = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 1.9), this.sharedWoodMaterial);
    footboard.position.set(-1.0, 0.4, 0);
    bedGroup.add(footboard);

    // Wooden mattress frame
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.35, 1.8), this.sharedWoodMaterial);
    frame.position.y = 0.25;
    bedGroup.add(frame);

    // Quilted duvet / mattress
    const duvet = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.3, 1.7),
      new THREE.MeshStandardMaterial({ color: 0x3b1c1c, roughness: 0.95 }) // Dark burgundy velvet
    );
    duvet.position.set(-0.05, 0.52, 0);
    bedGroup.add(duvet);

    // Two pillows
    const pillowGeo = new THREE.BoxGeometry(0.35, 0.12, 0.65);
    const pillowMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.9 });
    const p1 = new THREE.Mesh(pillowGeo, pillowMat);
    p1.position.set(0.65, 0.7, -0.45);
    const p2 = new THREE.Mesh(pillowGeo, pillowMat);
    p2.position.set(0.65, 0.7, 0.45);
    bedGroup.add(p1);
    bedGroup.add(p2);

    this.scene.add(bedGroup);

    this.colliders.push({
      minX: x - 1.05,
      maxX: x + 1.05,
      minZ: z - 0.95,
      maxZ: z + 0.95,
    });
  }

  private createNightstandWithLamp(x: number, z: number) {
    const nsGroup = new THREE.Group();
    nsGroup.position.set(x, 0, z);

    // Table
    const table = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.68, 0.5), this.sharedWoodMaterial);
    table.position.y = 0.34;
    nsGroup.add(table);

    // Brass lamp base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.04, 12), this.sharedMetalMaterial);
    base.position.set(0, 0.7, 0);
    nsGroup.add(base);

    // Fabric lampshade
    const shade = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.18, 0.24, 16),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.8, transparent: true, opacity: 0.9 })
    );
    shade.position.set(0, 0.88, 0);
    nsGroup.add(shade);

    // Warm bedside lamp light
    const lampLight = new THREE.PointLight(0xfef08a, 0.6, 3.5);
    lampLight.position.set(0, 0.88, 0);
    nsGroup.add(lampLight);
    this.registerFlickeringLight(lampLight, 'incandescent');

    this.scene.add(nsGroup);

    this.colliders.push({
      minX: x - 0.28,
      maxX: x + 0.28,
      minZ: z - 0.28,
      maxZ: z + 0.28,
    });
  }

  private createNightstandWithRotaryPhone(x: number, z: number) {
    const nsGroup = new THREE.Group();
    nsGroup.position.set(x, 0, z);

    // Table
    const table = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.68, 0.5), this.sharedWoodMaterial);
    table.position.y = 0.34;
    nsGroup.add(table);

    // Bakelite telephone base
    const phoneBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.1, 0.22),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.3, metalness: 0.2 })
    );
    phoneBase.position.set(0, 0.73, 0);
    nsGroup.add(phoneBase);

    // Rotary dial ring
    const dial = new THREE.Mesh(
      new THREE.CircleGeometry(0.055, 16),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 })
    );
    dial.rotation.x = -Math.PI / 3;
    dial.position.set(0, 0.79, 0.05);
    nsGroup.add(dial);

    // Telephone handset receiver
    const handset = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.05, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.3 })
    );
    handset.position.set(0, 0.82, -0.04);
    nsGroup.add(handset);

    // Interactive hitbox
    const hitBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.4, 0.45),
      new THREE.MeshBasicMaterial({ visible: false })
    ) as InteractiveMesh;
    hitBox.position.set(0, 0.8, 0);
    hitBox.userData = {
      interactiveData: {
        id: 'rotary_phone',
        name: 'Rotary Telephone',
        prompt: 'Press [E] or Tap to Pick Up Handset',
        type: 'switch',
        content: 'The bakelite handset is ice cold. When you lift it to your ear, a shrill dial tone cuts through. A hospital operator whispers: "Connecting ICU Room 412... vital signs dropping... please hold."',
      },
    };
    nsGroup.add(hitBox);
    this.interactiveObjects.push(hitBox);

    this.scene.add(nsGroup);

    this.colliders.push({
      minX: x - 0.28,
      maxX: x + 0.28,
      minZ: z - 0.28,
      maxZ: z + 0.28,
    });
  }

  private createMasterWardrobe(x: number, z: number) {
    const wGroup = new THREE.Group();
    wGroup.position.set(x, 0, z);

    // Armoire main body
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.3, 0.55), this.sharedWoodMaterial);
    body.position.y = 1.15;
    wGroup.add(body);

    // Brass pull handles
    const h1 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.1), this.sharedMetalMaterial);
    h1.position.set(-0.06, 1.2, 0.29);
    const h2 = h1.clone();
    h2.position.x = 0.06;
    wGroup.add(h1);
    wGroup.add(h2);

    this.scene.add(wGroup);

    this.colliders.push({
      minX: x - 0.62,
      maxX: x + 0.62,
      minZ: z - 0.3,
      maxZ: z + 0.3,
    });
  }

  private createVanityTable(x: number, z: number) {
    const vGroup = new THREE.Group();
    vGroup.position.set(x, 0, z);

    // Table top
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.78, 0.5), this.sharedWoodMaterial);
    table.position.y = 0.39;
    vGroup.add(table);

    // Oval mirror frame
    const mirror = new THREE.Mesh(
      new THREE.CircleGeometry(0.32, 24),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.15, metalness: 0.85 })
    );
    mirror.position.set(0, 1.15, -0.22);
    vGroup.add(mirror);

    this.scene.add(vGroup);

    this.colliders.push({
      minX: x - 0.58,
      maxX: x + 0.58,
      minZ: z - 0.28,
      maxZ: z + 0.28,
    });
  }

  private createVintageSuitcase(x: number, z: number) {
    const caseGroup = new THREE.Group();
    caseGroup.position.set(x, 0, z);

    const leatherMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });
    const luggage = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.22, 0.42), leatherMat);
    luggage.position.y = 0.11;
    caseGroup.add(luggage);

    // Brass latches
    const latchGeo = new THREE.BoxGeometry(0.04, 0.06, 0.02);
    const l1 = new THREE.Mesh(latchGeo, this.sharedMetalMaterial);
    l1.position.set(-0.18, 0.11, 0.215);
    const l2 = l1.clone();
    l2.position.x = 0.18;
    caseGroup.add(l1);
    caseGroup.add(l2);

    this.scene.add(caseGroup);

    this.colliders.push({
      minX: x - 0.35,
      maxX: x + 0.35,
      minZ: z - 0.25,
      maxZ: z + 0.25,
    });
  }

  private buildHallway() {
    // Hallway extends south from Bedroom: z: 3 to 15, width 2.4m (-1.2 to +1.2)
    this.addFloor(0, 9, 2.4, 12);

    // West wall of Hallway (connecting to Bathroom and Kitchen)
    // 1. Segment north of bathroom door (z: 3.0 to 5.7)
    this.addWall(-1.2, 4.35, 0.2, 2.7);

    // Bathroom door at z: 6.2 (width 1.0, z: 5.7 to 6.7) - swung inward into bathroom, leaves doorway open!
    this.createBathroomDoor(-1.2, 6.2);
    const bathLintel = this.addWall(-1.2, 6.2, 0.2, 1.0, 0.8, undefined, false);
    bathLintel.position.y = 2.8;

    // 2. Solid wall segment between bathroom door and kitchen open archway (z: 6.7 to 8.8)
    this.addWall(-1.2, 7.75, 0.2, 2.1);

    // Framed Family Portrait securely mounted on this solid west wall!
    this.createFamilyPortrait(-1.08, 1.8, 7.7);

    // 3. KITCHEN OPEN ARCHWAY (z: 8.8 to 12.8 -> 4.0m wide grand opening!)
    const kitchenArch = this.addWall(-1.2, 10.8, 0.2, 4.0, 0.6, undefined, false);
    kitchenArch.position.y = 2.9;

    // 4. Solid wall segment south of kitchen opening meeting the south wall (z: 12.8 to 15.0)
    this.addWall(-1.2, 13.9, 0.2, 2.2);

    // Grandfather Clock resting against this solid west wall
    this.createGrandfatherClock(-0.9, 13.8);

    // East wall of Hallway (connecting to Master Bedroom and Living Room)
    // 1. Segment north of Master Bedroom door (z: 3.0 to 4.7)
    this.addWall(1.2, 3.85, 0.2, 1.7);

    // Master Bedroom Door at z: 5.2 (width 1.0, z: 4.7 to 5.7) - swung inward into bedroom, leaves doorway open!
    this.createMasterBedroomDoor(1.2, 5.2);
    const masterLintel = this.addWall(1.2, 5.2, 0.2, 1.0, 0.8, undefined, false);
    masterLintel.position.y = 2.8;

    // 2. Wall segment between Master Bedroom door and master bedroom south wall (z: 5.7 to 7.0)
    this.addWall(1.2, 6.35, 0.2, 1.3);

    // 3. Wall segment between master bedroom and living room archway (z: 7.0 to 8.8)
    this.addWall(1.2, 7.9, 0.2, 1.8);

    // Wooden hallway console table against this solid east wall
    this.createHallwayTable(0.9, 7.8);

    // Hallway Steam Radiator along east wall at z: 13.8
    this.createSteamRadiator(0.95, 0, 13.8, Math.PI);

    // 4. LIVING ROOM OPEN ARCHWAY (z: 8.8 to 12.8 -> 4.0m wide grand opening!)
    const livingArch = this.addWall(1.2, 10.8, 0.2, 4.0, 0.6, undefined, false);
    livingArch.position.y = 2.9;

    // 5. Solid wall segment south of living room opening meeting south wall (z: 12.8 to 15.0)
    this.addWall(1.2, 13.9, 0.2, 2.2);

    // Hallway runner carpet
    const runnerGeo = new THREE.PlaneGeometry(1.2, 11);
    const runner = new THREE.Mesh(
      runnerGeo,
      new THREE.MeshStandardMaterial({
        map: textureGenerator.getRugTexture(),
        roughness: 0.85,
      })
    );
    runner.rotation.x = -Math.PI / 2;
    runner.position.set(0, 0.015, 9);
    this.scene.add(runner);

    // South wall of Hallway at z: 15 (enclosing basement door completely)
    this.addWall(-0.9, 15, 0.6, 0.2);
    this.addWall(0.9, 15, 0.6, 0.2);
    const basementLintel = this.addWall(0, 15, 1.2, 0.2, 0.8, undefined, false);
    basementLintel.position.y = 2.8;

    // Basement / End-of-hallway mystery door (leads to Act 3 Awakening)
    this.createBasementDoor(0, 15);

    // Overhead hallway ceiling pendant lights
    const hallLight1 = new THREE.PointLight(0xfef08a, 0.55, 6.0);
    hallLight1.position.set(0, 2.8, 5.5);
    this.scene.add(hallLight1);
    this.registerFlickeringLight(hallLight1, 'incandescent');

    const hallLight2 = new THREE.PointLight(0xfef08a, 0.55, 6.0);
    hallLight2.position.set(0, 2.8, 11.5);
    this.scene.add(hallLight2);
    this.registerFlickeringLight(hallLight2, 'incandescent');
  }

  private createBathroomDoor(x: number, z: number) {
    // Door swung open inward into the bathroom at an angle against the south wall
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 2.4, 0.95),
      this.sharedWoodMaterial
    ) as InteractiveMesh;
    door.position.set(x - 0.35, 1.2, z + 0.35);
    door.rotation.y = -Math.PI / 3;
    door.userData = {
      interactiveData: {
        id: 'bathroom_door',
        name: 'Bathroom Door',
        prompt: 'Press [E] or Tap to Inspect Bathroom',
        type: 'door',
        content: 'The door stands slightly ajar. The scent of damp porcelain and medicinal rubbing alcohol drifts from within.',
      },
    };
    this.scene.add(door);
    this.interactiveObjects.push(door);

    // Only collider on the door slab itself inside the room, NOT blocking the doorway!
    this.colliders.push({
      minX: x - 0.6,
      maxX: x - 0.1,
      minZ: z + 0.15,
      maxZ: z + 0.55,
    });
  }

  private createMasterBedroomDoor(x: number, z: number) {
    // Door swung open inward into the master bedroom at an angle against the north wall
    const doorGroup = new THREE.Group();
    doorGroup.position.set(x + 0.35, 1.2, z - 0.35);
    doorGroup.rotation.y = Math.PI / 3;

    const doorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 2.4, 0.95),
      this.sharedWoodMaterial
    ) as InteractiveMesh;
    doorMesh.userData = {
      interactiveData: {
        id: 'master_bedroom_door',
        name: "Parents' Bedroom",
        prompt: "Press [E] or Tap to Inspect Parents' Room",
        type: 'inspect',
        content: 'A handwritten note is taped to the door: "Leo, went to check the circuit breaker. Stay in bed." From inside, the rotary phone faintly clicks, as if waiting for a connection.',
      },
    };
    doorGroup.add(doorMesh);

    // Warm amber glow bleeding into the hallway
    const underLight = new THREE.PointLight(0xf59e0b, 1.2, 3.0);
    underLight.position.set(0, -1.1, 0);
    doorGroup.add(underLight);

    this.scene.add(doorGroup);
    this.interactiveObjects.push(doorMesh);

    // Only collider on the door slab itself inside the bedroom, NOT blocking the doorway!
    this.colliders.push({
      minX: x + 0.1,
      maxX: x + 0.6,
      minZ: z - 0.55,
      maxZ: z - 0.15,
    });
  }

  private createGrandfatherClock(x: number, z: number) {
    const clockGroup = new THREE.Group();
    clockGroup.position.set(x, 0, z);

    // Tall cabinet
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 2.6, 0.4),
      this.sharedWoodMaterial
    );
    body.position.y = 1.3;
    body.castShadow = true;
    clockGroup.add(body);

    // Brass clock face
    const face = new THREE.Mesh(
      new THREE.CircleGeometry(0.16, 24),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, metalness: 0.8, roughness: 0.2 })
    );
    face.position.set(0.26, 2.1, 0);
    face.rotation.y = Math.PI / 2;
    clockGroup.add(face);

    // Pendulum (animated in render loop)
    const pendulum = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.8),
      this.sharedMetalMaterial
    );
    pendulum.position.set(0.15, 1.2, 0);
    this.clockPendulum = pendulum;
    clockGroup.add(pendulum);

    const interactiveClock = body as unknown as InteractiveMesh;
    interactiveClock.userData = {
      interactiveData: {
        id: 'clock',
        name: 'Grandfather Clock',
        prompt: 'Press [E] or Tap to Inspect Clock',
        type: 'inspect',
        content: 'The hands on the clock face are spinning counter-clockwise rapidly. The ticking sound feels like a heartbeat.',
      },
    };
    this.interactiveObjects.push(interactiveClock);

    this.scene.add(clockGroup);
    this.colliders.push({
      minX: x - 0.25,
      maxX: x + 0.25,
      minZ: z - 0.2,
      maxZ: z + 0.2,
    });
  }

  private createFamilyPortrait(x: number, y: number, z: number) {
    const normalTex = textureGenerator.getFramedFamilyPortraitTexture(false);
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.8, 0.6),
      this.sharedWoodMaterial
    );
    frame.position.set(x, y, z);

    const canvas = new THREE.Mesh(
      new THREE.PlaneGeometry(0.55, 0.75),
      new THREE.MeshStandardMaterial({ map: normalTex, roughness: 0.6 })
    ) as InteractiveMesh;
    canvas.rotation.y = Math.PI / 2;
    canvas.position.set(x + 0.025, y, z);
    canvas.userData = {
      interactiveData: {
        id: 'family_portrait',
        name: 'Family Portrait',
        prompt: 'Press [E] or Tap to View Portrait',
        type: 'inspect',
        content: 'A portrait of Mom, Dad, and Leo. Their smiles look gentle, but when you look away, you feel like their eyes track you down the hallway.',
      },
    };

    this.portraitMesh = canvas;
    this.scene.add(frame);
    this.scene.add(canvas);
    this.interactiveObjects.push(canvas);
  }

  private createBasementDoor(x: number, z: number) {
    // Door opening is from x = -0.6 to x = 0.6 at z = 15.
    // Hinge pivot group placed at the left jamb: (x - 0.6, 0, z)
    const doorGroup = new THREE.Group();
    doorGroup.position.set(x - 0.6, 0, z);

    const door = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 2.4, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 })
    ) as InteractiveMesh;
    // Relative to left hinge: center is at +0.6
    door.position.set(0.6, 1.2, 0);
    door.userData = {
      interactiveData: {
        id: 'basement_door',
        name: 'Basement Door',
        prompt: 'Press [E] or Tap to Inspect / Unlock Door',
        type: 'door',
        content: 'A heavy iron lock seals the door. It requires a Brass Key. Beneath the wooden seam, a faint, cold hospital-white light shines through.',
      },
    };
    doorGroup.add(door);

    // Antique metal latch handle
    const knob = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.08, 12),
      this.sharedMetalMaterial
    );
    knob.rotation.x = Math.PI / 2;
    knob.position.set(1.05, 1.1, 0.06);
    doorGroup.add(knob);

    this.basementDoor = doorGroup;
    this.scene.add(doorGroup);
    this.interactiveObjects.push(door);

    this.colliders.push({
      id: 'basement_door',
      minX: x - 0.6,
      maxX: x + 0.6,
      minZ: z - 0.1,
      maxZ: z + 0.1,
    });
  }

  private buildLivingRoom() {
    // Living Room east of hallway: x: 1.2 to 9.2, z: 7 to 15 (8m x 8m)
    this.addFloor(5.2, 11, 8, 8);

    // North wall
    this.addWall(5.2, 7, 8, 0.2);
    // South wall (fireplace centered here)
    this.addWall(5.2, 15, 8, 0.2);

    // East wall: with 3.0m wide grand open archway leading into the Study at z: 10.5 to 13.5
    this.addWall(9.2, 8.75, 0.2, 3.5);
    const studyLintel = this.addWall(9.2, 12.0, 0.2, 3.0, 0.6, undefined, false);
    studyLintel.position.y = 2.9;
    this.addWall(9.2, 14.25, 0.2, 1.5);

    // Large Living room rug
    const rug = new THREE.Mesh(
      new THREE.PlaneGeometry(4.5, 4.5),
      new THREE.MeshStandardMaterial({
        map: textureGenerator.getRugTexture(),
        roughness: 0.9,
      })
    );
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(5.2, 0.015, 11);
    this.scene.add(rug);

    // 1. GRAND BRICK FIREPLACE & MANTELPIECE
    this.createBrickFireplace(5.2, 14.75);

    // 2. CEILING FAN IN CENTER OF ROOM
    this.createCeilingFan(5.2, 3.0, 11.0);

    // 3. RETRO CRT TELEVISION CONSOLE
    this.createCRTTelevision(8.2, 8.8);

    // 4. COMFY VINTAGE SOFA
    this.createSofa(4.0, 11.0);

    // 5. COFFEE TABLE WITH ITEMS
    this.createCoffeeTable(5.5, 11.0);

    // 6. BOOKSHELF
    this.createBookshelf(5.2, 7.4);

    // 7. BARNABY THE TEDDY BEAR (Crucial Nostalgic Token)
    this.createBarnabyBear(3.8, 0.7, 10.5);

    // 8. Overhead Living Room Lamp
    const livingLight = new THREE.PointLight(0xfde68a, 0.65, 6.0);
    livingLight.position.set(5.2, 2.7, 11.0);
    this.scene.add(livingLight);
    this.registerFlickeringLight(livingLight, 'incandescent');
  }

  private createBrickFireplace(x: number, z: number) {
    const fpGroup = new THREE.Group();
    fpGroup.position.set(x, 0, z);

    const brickMat = new THREE.MeshStandardMaterial({
      map: textureGenerator.getBrickFireplaceTexture(),
      roughness: 0.9,
    });

    // Fireplace brick surround (width 2.6m, height 1.8m, depth 0.6m)
    const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.6, 0.6), brickMat);
    leftPillar.position.set(-0.95, 0.8, 0);
    fpGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.6, 0.6), brickMat);
    rightPillar.position.set(0.95, 0.8, 0);
    fpGroup.add(rightPillar);

    const topLintel = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.5, 0.6), brickMat);
    topLintel.position.set(0, 1.45, 0);
    fpGroup.add(topLintel);

    // Carved oak mantelpiece shelf
    const mantel = new THREE.Mesh(new THREE.BoxGeometry(2.65, 0.1, 0.7), this.sharedWoodMaterial);
    mantel.position.set(0, 1.72, 0.05);
    fpGroup.add(mantel);

    // Hearth base on floor
    const hearth = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 0.8), brickMat);
    hearth.position.set(0, 0.03, -0.15);
    fpGroup.add(hearth);

    // Firebox recess (dark soot)
    const firebox = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 1.1, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 0.98 })
    );
    firebox.position.set(0, 0.6, 0.08);
    fpGroup.add(firebox);

    // Birch logs
    const log1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 10), this.sharedWoodMaterial);
    log1.rotation.z = Math.PI / 2;
    log1.position.set(0, 0.12, 0.05);
    fpGroup.add(log1);

    // Glowing dying embers pointlight
    const emberLight = new THREE.PointLight(0xf97316, 0.55, 3.0);
    emberLight.position.set(0, 0.25, 0);
    fpGroup.add(emberLight);
    this.registerFlickeringLight(emberLight, 'candle');

    // Carriage clock on mantel
    const mClock = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.22, 0.12), this.sharedMetalMaterial);
    mClock.position.set(0, 1.88, 0);
    fpGroup.add(mClock);

    // Brass candlesticks on mantel
    const c1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.04, 0.25), this.sharedMetalMaterial);
    c1.position.set(-0.8, 1.88, 0);
    const c2 = c1.clone();
    c2.position.x = 0.8;
    fpGroup.add(c1);
    fpGroup.add(c2);

    this.scene.add(fpGroup);

    this.colliders.push({
      minX: x - 1.3,
      maxX: x + 1.3,
      minZ: z - 0.45,
      maxZ: z + 0.35,
    });
  }

  private createCeilingFan(x: number, y: number, z: number) {
    const fanGroup = new THREE.Group();
    fanGroup.position.set(x, y, z);

    // Ceiling mount rod
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 10), this.sharedMetalMaterial);
    rod.position.y = 0.15;
    fanGroup.add(rod);

    // Motor housing
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.12, 16), this.sharedMetalMaterial);
    fanGroup.add(motor);

    // Rotor with 4 mahogany blades
    const rotor = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.015, 0.65), this.sharedWoodMaterial);
      blade.position.set(Math.cos(angle) * 0.4, 0, Math.sin(angle) * 0.4);
      blade.rotation.y = angle;
      blade.rotation.x = 0.1;
      rotor.add(blade);
    }
    fanGroup.add(rotor);
    this.ceilingFan = rotor;

    this.scene.add(fanGroup);
  }

  private createCRTTelevision(x: number, z: number) {
    const tvGroup = new THREE.Group();
    tvGroup.position.set(x, 0, z);

    // Wood cabinet
    const cabinet = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 1.1, 1.2),
      this.sharedWoodMaterial
    );
    cabinet.position.y = 0.55;
    tvGroup.add(cabinet);

    // Curved glass screen
    const screenTex = textureGenerator.getCRTScreenTexture('static');
    const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 0.5),
      screenMat
    ) as InteractiveMesh;
    screen.rotation.y = -Math.PI / 2;
    screen.position.set(-0.41, 0.72, 0);
    screen.userData = {
      interactiveData: {
        id: 'crt_tv',
        name: 'Vintage Television',
        prompt: 'Press [E] or Tap to Inspect Television',
        type: 'switch',
        content: 'A glowing CRT screen buzzing with static. You can faintly hear an emergency hospital intercom announcement through the speaker hiss.',
      },
    };
    this.crtMesh = screen;
    tvGroup.add(screen);

    // Faint TV glow pointlight
    const tvLight = new THREE.PointLight(0x60a5fa, 0.8, 4.0);
    tvLight.position.set(-0.6, 0.72, 0);
    tvGroup.add(tvLight);
    this.registerFlickeringLight(tvLight, 'tv');

    this.scene.add(tvGroup);
    this.interactiveObjects.push(screen);

    this.colliders.push({
      minX: x - 0.4,
      maxX: x + 0.4,
      minZ: z - 0.6,
      maxZ: z + 0.6,
    });
  }

  private createSofa(x: number, z: number) {
    const sofaGroup = new THREE.Group();
    sofaGroup.position.set(x, 0, z);

    const sofaMat = new THREE.MeshStandardMaterial({ color: 0x273b2b, roughness: 0.95 }); // 90s vintage plaid green
    // Seat base
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 2.4), sofaMat);
    base.position.y = 0.225;
    sofaGroup.add(base);

    // Backrest
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 2.4), sofaMat);
    back.position.set(-0.45, 0.7, 0);
    sofaGroup.add(back);

    this.scene.add(sofaGroup);
    this.colliders.push({
      minX: x - 0.6,
      maxX: x + 0.6,
      minZ: z - 1.2,
      maxZ: z + 1.2,
    });
  }

  private createCoffeeTable(x: number, z: number) {
    const table = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.4, 0.8),
      this.sharedWoodMaterial
    );
    table.position.set(x, 0.2, z);
    this.scene.add(table);

    // Coffee mug
    const mug = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.05, 0.12),
      new THREE.MeshStandardMaterial({ color: 0xef4444 })
    );
    mug.position.set(x - 0.2, 0.46, z);
    this.scene.add(mug);

    this.colliders.push({
      minX: x - 0.6,
      maxX: x + 0.6,
      minZ: z - 0.4,
      maxZ: z + 0.4,
    });
  }

  private createBookshelf(x: number, z: number) {
    const shelfGroup = new THREE.Group();
    shelfGroup.position.set(x, 0, z);

    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 2.2, 0.4),
      this.sharedWoodMaterial
    );
    shelf.position.y = 1.1;
    shelfGroup.add(shelf);

    // Books with procedural book textures
    const bookMat = new THREE.MeshStandardMaterial({
      map: textureGenerator.getBookshelfTexture(),
      roughness: 0.85,
    });
    const booksFront = new THREE.Mesh(new THREE.PlaneGeometry(1.85, 2.05), bookMat);
    booksFront.position.set(0, 1.1, 0.205);
    shelfGroup.add(booksFront);

    this.scene.add(shelfGroup);

    this.colliders.push({
      minX: x - 1.0,
      maxX: x + 1.0,
      minZ: z - 0.2,
      maxZ: z + 0.2,
    });
  }

  private createBarnabyBear(x: number, y: number, z: number) {
    const bearGroup = new THREE.Group();
    bearGroup.position.set(x, y, z);

    const furMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), furMat);
    head.position.y = 0.18;
    bearGroup.add(head);

    // Ears
    const earL = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), furMat);
    earL.position.set(-0.09, 0.26, 0);
    const earR = earL.clone();
    earR.position.x = 0.09;
    bearGroup.add(earL);
    bearGroup.add(earR);

    // Body
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), furMat) as unknown as InteractiveMesh;
    body.position.y = 0;
    body.userData = {
      interactiveData: {
        id: 'barnaby_bear',
        name: 'Barnaby the Bear',
        prompt: 'Press [E] or Tap to Pick Up Barnaby',
        type: 'pickup',
        content: 'Your favorite childhood teddy bear. He smells faintly of antiseptic and lavender. In your mind, a faint music box melody starts to play.',
      },
    };
    bearGroup.add(body as unknown as THREE.Mesh);

    this.scene.add(bearGroup);
    this.interactiveObjects.push(body);
  }

  private buildStudy() {
    // Study & Library Alcove east of living room: x: 9.2 to 13.6, z: 8.5 to 15.0 (4.4m x 6.5m)
    const studyFloorMat = new THREE.MeshStandardMaterial({
      map: textureGenerator.getWoodFloorTexture(),
      roughness: 0.35,
      metalness: 0.1,
    });
    this.addFloor(11.4, 11.75, 4.4, 6.5, studyFloorMat);

    const studyWallMat = new THREE.MeshStandardMaterial({
      map: textureGenerator.getFloralWallpaperTexture(),
      roughness: 0.85,
      metalness: 0.05,
    });

    // North wall
    this.addWall(11.4, 8.5, 4.4, 0.2, 3.2, studyWallMat);
    // East wall (with storm window)
    this.addWall(13.6, 11.75, 0.2, 6.5, 3.2, studyWallMat);
    // South wall
    this.addWall(11.4, 15.0, 4.4, 0.2, 3.2, studyWallMat);

    // West wall north of open archway
    this.addWall(9.2, 9.5, 0.2, 2.0, 3.2, studyWallMat);
    // West wall south of open archway
    this.addWall(9.2, 14.25, 0.2, 1.5, 3.2, studyWallMat);

    // Oval study rug
    const rugGeo = new THREE.PlaneGeometry(2.4, 3.2);
    const rug = new THREE.Mesh(
      rugGeo,
      new THREE.MeshStandardMaterial({
        map: textureGenerator.getRugTexture(),
        roughness: 0.9,
      })
    );
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(11.4, 0.015, 11.8);
    this.scene.add(rug);

    // 1. Floor-to-Ceiling Mahogany Bookcases along North Wall
    this.createStudyBookcases(11.4, 8.85);

    // 2. Antique Roll-Top Writing Desk & Chair
    this.createRollTopDesk(12.5, 11.2);

    // 3. Vintage Mechanical Typewriter with Patient Chart Note
    this.createTypewriter(12.5, 0.82, 11.2);

    // 4. Antique Gramophone with Flared Brass Horn
    this.createGramophone(12.8, 14.2);

    // 5. Burgundy Leather Wingback Armchair & Floor Lamp
    this.createWingbackArmchair(10.2, 14.0);

    // 6. Storm Window on East Wall
    this.createStudyWindow(13.5, 1.8, 11.5);

    // 7. Steam Radiator under Window
    this.createSteamRadiator(13.3, 0, 11.5, Math.PI / 2);

    // 8. Emerald Banker's Lamp Light on the Desk
    const deskLight = new THREE.PointLight(0xa7f3d0, 0.65, 4.0);
    deskLight.position.set(12.4, 1.25, 11.0);
    this.scene.add(deskLight);
    this.registerFlickeringLight(deskLight, 'incandescent');
  }

  private createStudyBookcases(x: number, z: number) {
    const bkGroup = new THREE.Group();
    bkGroup.position.set(x, 0, z);

    // Tall mahogany bookcases
    const bk = new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.6, 0.45), this.sharedWoodMaterial);
    bk.position.y = 1.3;
    bkGroup.add(bk);

    // Book textures
    const bookMat = new THREE.MeshStandardMaterial({
      map: textureGenerator.getBookshelfTexture(),
      roughness: 0.85,
    });
    const books = new THREE.Mesh(new THREE.PlaneGeometry(2.85, 2.4), bookMat);
    books.position.set(0, 1.3, 0.23);
    bkGroup.add(books);

    this.scene.add(bkGroup);

    this.colliders.push({
      minX: x - 1.55,
      maxX: x + 1.55,
      minZ: z - 0.25,
      maxZ: z + 0.25,
    });
  }

  private createRollTopDesk(x: number, z: number) {
    const deskGroup = new THREE.Group();
    deskGroup.position.set(x, 0, z);

    // Main desktop
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.9), this.sharedWoodMaterial);
    top.position.y = 0.76;
    deskGroup.add(top);

    // Left and right drawer pedestals
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.72, 0.85), this.sharedWoodMaterial);
    p1.position.set(-0.55, 0.36, 0);
    const p2 = p1.clone();
    p2.position.x = 0.55;
    deskGroup.add(p1);
    deskGroup.add(p2);

    // Roll-top curved back hutch with cubbyholes
    const hutch = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 0.3), this.sharedWoodMaterial);
    hutch.position.set(0, 1.02, 0.28);
    deskGroup.add(hutch);

    // Green Banker's Lamp
    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.02, 16), this.sharedMetalMaterial);
    lampBase.position.set(-0.5, 0.81, 0.15);
    deskGroup.add(lampBase);

    const shade = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 0.22, 16, 1, false, 0, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.2, metalness: 0.1 })
    );
    shade.rotation.z = Math.PI / 2;
    shade.position.set(-0.5, 1.08, 0.15);
    deskGroup.add(shade);

    // Wooden desk chair
    const chair = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 0.5), this.sharedWoodMaterial);
    chair.position.set(0, 0.45, -0.6);
    deskGroup.add(chair);

    this.scene.add(deskGroup);

    this.colliders.push({
      minX: x - 0.85,
      maxX: x + 0.85,
      minZ: z - 0.5,
      maxZ: z + 0.5,
    });
  }

  private createTypewriter(x: number, y: number, z: number) {
    const twGroup = new THREE.Group();
    twGroup.position.set(x, y, z);

    // Vintage cast-iron typewriter body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.12, 0.32),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6, metalness: 0.4 })
    );
    body.position.y = 0.06;
    twGroup.add(body);

    // Roller carriage
    const roller = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.36, 12),
      new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.5 })
    );
    roller.rotation.z = Math.PI / 2;
    roller.position.set(0, 0.14, 0.06);
    twGroup.add(roller);

    // Paper sheet sticking out
    const paperMat = new THREE.MeshStandardMaterial({
      map: textureGenerator.getTypewriterPaperTexture(),
      roughness: 0.8,
    });
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.32), paperMat);
    paper.position.set(0, 0.26, 0.04);
    paper.rotation.x = -0.3;
    twGroup.add(paper);

    // Interactive hitbox
    const hit = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.4, 0.45),
      new THREE.MeshBasicMaterial({ visible: false })
    ) as InteractiveMesh;
    hit.position.set(0, 0.2, 0);
    hit.userData = {
      interactiveData: {
        id: 'typewriter',
        name: 'Vintage Typewriter',
        prompt: 'Press [E] or Tap to Read Observation Log',
        type: 'inspect',
        content: 'A yellowed sheet fed into the roller carriage:\n\n"OBSERVATION RECORD #089\nSubject: Leo Vance (9 yrs)\nDate: October 28, 1998\n\nThe subject remains unresponsive in Room 412. He is experiencing a recursive dream of his childhood home. If he locates all 5 anchor memories, the basement door will unlock and allow him to awaken."',
      },
    };
    twGroup.add(hit);
    this.interactiveObjects.push(hit);

    this.scene.add(twGroup);
  }

  private createGramophone(x: number, z: number) {
    const gramGroup = new THREE.Group();
    gramGroup.position.set(x, 0, z);

    // Pedestal stand
    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.85, 0.55), this.sharedWoodMaterial);
    stand.position.y = 0.425;
    gramGroup.add(stand);

    // Wooden turntable cabinet
    const cabinet = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.14, 0.4), this.sharedWoodMaterial);
    cabinet.position.y = 0.92;
    gramGroup.add(cabinet);

    // Black vinyl disc
    const vinyl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 0.01, 24),
      new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.3, metalness: 0.2 })
    );
    vinyl.position.set(0, 1.0, 0);
    gramGroup.add(vinyl);

    // Brass morning glory horn
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.45, 20, 1, true), this.sharedMetalMaterial);
    horn.rotation.x = -Math.PI / 2.8;
    horn.rotation.y = -Math.PI / 4;
    horn.position.set(-0.08, 1.25, -0.05);
    gramGroup.add(horn);

    // Interactive hitbox
    const hit = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 1.4, 0.65),
      new THREE.MeshBasicMaterial({ visible: false })
    ) as InteractiveMesh;
    hit.position.set(0, 0.7, 0);
    hit.userData = {
      interactiveData: {
        id: 'gramophone',
        name: 'Antique Gramophone',
        prompt: 'Press [E] or Tap to Play Vinyl Record',
        type: 'switch',
        content: 'You wind the brass crank and set the needle down. The turntable spins with authentic crackle, playing a warped, melancholic childhood lullaby.',
      },
    };
    gramGroup.add(hit);
    this.interactiveObjects.push(hit);

    this.scene.add(gramGroup);

    this.colliders.push({
      minX: x - 0.32,
      maxX: x + 0.32,
      minZ: z - 0.32,
      maxZ: z + 0.32,
    });
  }

  private createWingbackArmchair(x: number, z: number) {
    const chairGroup = new THREE.Group();
    chairGroup.position.set(x, 0, z);

    const leatherMat = new THREE.MeshStandardMaterial({ color: 0x450a0a, roughness: 0.75 });
    // Cushion seat
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.45, 0.85), leatherMat);
    seat.position.y = 0.225;
    chairGroup.add(seat);

    // Tall wingback
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.9, 0.2), leatherMat);
    back.position.set(0, 0.85, 0.35);
    chairGroup.add(back);

    // Side wings
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.7, 0.35), leatherMat);
    wingL.position.set(-0.35, 0.75, 0.25);
    const wingR = wingL.clone();
    wingR.position.x = 0.35;
    chairGroup.add(wingL);
    chairGroup.add(wingR);

    this.scene.add(chairGroup);

    this.colliders.push({
      minX: x - 0.48,
      maxX: x + 0.48,
      minZ: z - 0.48,
      maxZ: z + 0.48,
    });
  }

  private createStudyWindow(x: number, y: number, z: number) {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.6, 1.4), this.sharedWoodMaterial);
    frame.position.set(x, y, z);
    this.scene.add(frame);

    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 1.4),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, transparent: true, opacity: 0.45, roughness: 0.1 })
    );
    glass.rotation.y = -Math.PI / 2;
    glass.position.set(x - 0.05, y, z);
    this.scene.add(glass);
  }

  private buildKitchen() {
    // Kitchen branches to the left of hallway at z: 9 (x: -1.2 to -9.2, z: 7 to 15)
    const kitchenFloorMat = new THREE.MeshStandardMaterial({
      map: textureGenerator.getKitchenLinoleumTexture(),
      roughness: 0.4,
      metalness: 0.1,
    });
    this.addFloor(-5.2, 11, 8, 8, kitchenFloorMat);

    // North wall
    this.addWall(-5.2, 7, 8, 0.2);
    // South wall
    this.addWall(-5.2, 15, 8, 0.2);

    // West wall: with open 2.0m doorway into Utility Pantry at z: 10.5 to 12.5
    this.addWall(-9.2, 8.75, 0.2, 3.5);
    const pantryLintel = this.addWall(-9.2, 11.5, 0.2, 2.0, 0.8, undefined, false);
    pantryLintel.position.y = 2.8;
    this.addWall(-9.2, 13.75, 0.2, 2.5);

    // 1. REFRIGERATOR WITH MAGNETS
    this.createRefrigerator(-8.4, 8.2);

    // 2. KITCHEN COUNTER WITH TEA TIN & BRASS KEY (Maintains exact key location)
    this.createKitchenCounter(-5.2, 7.6);

    // 3. VINTAGE 4-BURNER GAS STOVE & RANGE HOOD
    this.createGasStove(-2.4, 7.5);

    // 4. DINING TABLE & SPINDLE CHAIRS
    this.createDiningTable(-5.2, 12.0);

    // 5. VINTAGE WALL CALENDAR (October 1998 with circled admission)
    this.createKitchenCalendar(-4.0, 1.8, 7.12);

    // 6. Kitchen Fluorescent Overhead Light
    const kitchenLight = new THREE.PointLight(0xfef9c3, 0.85, 7.0);
    kitchenLight.position.set(-5.2, 2.9, 11.0);
    this.scene.add(kitchenLight);
    this.registerFlickeringLight(kitchenLight, 'fluorescent');
  }

  private createGasStove(x: number, z: number) {
    const stoveGroup = new THREE.Group();
    stoveGroup.position.set(x, 0, z);

    const enamelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35 });

    // Stove body
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.9, 0.75), enamelMat);
    body.position.y = 0.45;
    stoveGroup.add(body);

    // Oven window
    const win = new THREE.Mesh(
      new THREE.PlaneGeometry(0.55, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.2 })
    );
    win.position.set(0, 0.38, 0.38);
    stoveGroup.add(win);

    // 4 cast-iron burners on cooktop
    const burnerMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
    const bGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.02, 12);
    const bPos = [
      [-0.22, 0.91, -0.18],
      [0.22, 0.91, -0.18],
      [-0.22, 0.91, 0.18],
      [0.22, 0.91, 0.18],
    ];
    for (const [bx, by, bz] of bPos) {
      const b = new THREE.Mesh(bGeo, burnerMat);
      b.position.set(bx, by, bz);
      stoveGroup.add(b);
    }

    // Stainless range hood overhead
    const hood = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.25, 0.75), this.sharedMetalMaterial);
    hood.position.set(0, 2.0, 0);
    stoveGroup.add(hood);

    this.scene.add(stoveGroup);

    this.colliders.push({
      minX: x - 0.45,
      maxX: x + 0.45,
      minZ: z - 0.4,
      maxZ: z + 0.4,
    });
  }

  private createKitchenCalendar(x: number, y: number, z: number) {
    const calMat = new THREE.MeshStandardMaterial({
      map: textureGenerator.getCalendarTexture(),
      roughness: 0.9,
    });

    const cal = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.6), calMat) as InteractiveMesh;
    cal.position.set(x, y, z);
    cal.userData = {
      interactiveData: {
        id: 'vintage_calendar',
        name: 'Kitchen Calendar',
        prompt: 'Press [E] or Tap to Read Calendar',
        type: 'inspect',
        content: 'October 1998. October 14 is heavily circled in red ink: "Leo Emergency Admission - Pediatric Neurology at St. Jude Hospital".',
      },
    };

    this.scene.add(cal);
    this.interactiveObjects.push(cal);
  }

  private buildUtilityPantry() {
    // Utility & Laundry Pantry west of kitchen: x: -9.2 to -13.6, z: 8.5 to 15.0 (4.4m x 6.5m)
    const linoleumMat = new THREE.MeshStandardMaterial({
      map: textureGenerator.getKitchenLinoleumTexture(),
      roughness: 0.5,
      metalness: 0.1,
    });
    this.addFloor(-11.4, 11.75, 4.4, 6.5, linoleumMat);

    const plasterMat = new THREE.MeshStandardMaterial({
      map: textureGenerator.getPeelingPlasterTexture(),
      roughness: 0.9,
      metalness: 0.05,
    });

    // North wall
    this.addWall(-11.4, 8.5, 4.4, 0.2, 3.2, plasterMat);
    // West wall
    this.addWall(-13.6, 11.75, 0.2, 6.5, 3.2, plasterMat);
    // South wall
    this.addWall(-11.4, 15.0, 4.4, 0.2, 3.2, plasterMat);

    // East wall north of doorway
    this.addWall(-9.2, 9.5, 0.2, 2.0, 3.2, plasterMat);
    // East wall south of doorway
    this.addWall(-9.2, 13.75, 0.2, 2.5, 3.2, plasterMat);

    // 1. Deep Porcelain Laundry Utility Basin
    this.createLaundrySink(-13.1, 9.8);

    // 2. Vintage Washer & Dryer Units
    this.createWasherDryer(-13.0, 11.4, 12.6);

    // 3. Heavy Wooden Pantry Shelves
    this.createPantryShelves(-11.4, 8.85);

    // 4. Industrial Water Heater / Boiler
    this.createWaterHeaterBoiler(-13.0, 14.2);

    // 5. Circuit Breaker Fuse Box on North Wall
    this.createCircuitBreakerBox(-10.2, 1.7, 8.62);

    // 6. Bare Hanging Bulb with Flickering Spark Light
    const pantryLight = new THREE.PointLight(0xfef08a, 0.7, 5.5);
    pantryLight.position.set(-11.4, 2.6, 11.5);
    this.scene.add(pantryLight);
    this.registerFlickeringLight(pantryLight, 'spark');
  }

  private createLaundrySink(x: number, z: number) {
    const sinkGroup = new THREE.Group();
    sinkGroup.position.set(x, 0, z);

    const tubMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 });

    // Deep tub
    const tub = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.65, 0.7), tubMat);
    tub.position.y = 0.55;
    sinkGroup.add(tub);

    // 4 iron pipe legs
    const legGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.55, 8);
    const legPositions = [
      [-0.35, 0.275, -0.28],
      [0.35, 0.275, -0.28],
      [-0.35, 0.275, 0.28],
      [0.35, 0.275, 0.28],
    ];
    for (const [lx, ly, lz] of legPositions) {
      const leg = new THREE.Mesh(legGeo, this.sharedMetalMaterial);
      leg.position.set(lx, ly, lz);
      sinkGroup.add(leg);
    }

    this.scene.add(sinkGroup);

    this.colliders.push({
      minX: x - 0.45,
      maxX: x + 0.45,
      minZ: z - 0.38,
      maxZ: z + 0.38,
    });
  }

  private createWasherDryer(x: number, z1: number, z2: number) {
    const unitMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35 });

    // Washer
    const washer = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.0, 0.75), unitMat);
    washer.position.set(x, 0.5, z1);
    this.scene.add(washer);

    // Dryer
    const dryer = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.0, 0.75), unitMat);
    dryer.position.set(x, 0.5, z2);
    this.scene.add(dryer);

    this.colliders.push({
      minX: x - 0.4,
      maxX: x + 0.4,
      minZ: z1 - 0.4,
      maxZ: z2 + 0.4,
    });
  }

  private createPantryShelves(x: number, z: number) {
    const shelfGroup = new THREE.Group();
    shelfGroup.position.set(x, 0, z);

    // Heavy wooden shelving unit
    const unit = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 0.45), this.sharedWoodMaterial);
    unit.position.y = 1.1;
    shelfGroup.add(unit);

    this.scene.add(shelfGroup);

    this.colliders.push({
      minX: x - 1.25,
      maxX: x + 1.25,
      minZ: z - 0.25,
      maxZ: z + 0.25,
    });
  }

  private createWaterHeaterBoiler(x: number, z: number) {
    const boilerGroup = new THREE.Group();
    boilerGroup.position.set(x, 0, z);

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x52525b, metalness: 0.7, roughness: 0.4 });

    // Water heater cylinder
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.8, 16), metalMat);
    tank.position.y = 0.9;
    boilerGroup.add(tank);

    // Copper pressure pipes
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8), this.sharedMetalMaterial);
    pipe.position.set(0.25, 2.0, 0);
    boilerGroup.add(pipe);

    // Pilot light peephole glow
    const pilotLight = new THREE.PointLight(0x3b82f6, 0.4, 1.5);
    pilotLight.position.set(0, 0.2, 0.36);
    boilerGroup.add(pilotLight);

    this.scene.add(boilerGroup);

    this.colliders.push({
      minX: x - 0.4,
      maxX: x + 0.4,
      minZ: z - 0.4,
      maxZ: z + 0.4,
    });
  }

  private createCircuitBreakerBox(x: number, y: number, z: number) {
    const panelMat = new THREE.MeshStandardMaterial({
      map: textureGenerator.getFuseBoxTexture(),
      roughness: 0.5,
      metalness: 0.4,
    });

    const box = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.12), this.sharedMetalMaterial);
    box.position.set(x, y, z);

    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.75), panelMat) as InteractiveMesh;
    face.position.set(x, y, z + 0.065);
    face.userData = {
      interactiveData: {
        id: 'fuse_box',
        name: 'Electrical Circuit Breaker',
        prompt: 'Press [E] or Tap to Inspect Breaker Panel',
        type: 'inspect',
        content: 'An industrial electrical breaker panel with sparking fuses. One switch is labelled in faded hospital handwriting: "ST. JUDE ICU 412 - LIFE SUPPORT MONITOR - DO NOT TRIP".',
      },
    };

    this.scene.add(box);
    this.scene.add(face);
    this.interactiveObjects.push(face);
  }

  private createRefrigerator(x: number, z: number) {
    const fridgeGroup = new THREE.Group();
    fridgeGroup.position.set(x, 0, z);

    const fridgeMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.35, metalness: 0.3 });
    const fridge = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 2.0, 0.9),
      fridgeMat
    );
    fridge.position.y = 1.0;
    fridgeGroup.add(fridge);

    // Refrigerator door front interactive mesh
    const doorFace = new THREE.Mesh(
      new THREE.PlaneGeometry(0.85, 1.95),
      new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.4 })
    ) as InteractiveMesh;
    doorFace.rotation.y = Math.PI / 2;
    doorFace.position.set(0.46, 1.0, 0);
    doorFace.userData = {
      interactiveData: {
        id: 'fridge',
        name: 'Refrigerator',
        prompt: 'Press [E] or Tap to Inspect Fridge',
        type: 'inspect',
        content: 'Colorful magnetic letters on the door. They used to spell "HOME SWEET HOME", but right now they are rearranged into: "W A K E   U P   L E O". A prescription bottle of antipsychotics rests on the door shelf.',
      },
    };
    fridgeGroup.add(doorFace);

    this.scene.add(fridgeGroup);
    this.interactiveObjects.push(doorFace);

    this.colliders.push({
      minX: x - 0.45,
      maxX: x + 0.45,
      minZ: z - 0.45,
      maxZ: z + 0.45,
    });
  }

  private createKitchenCounter(x: number, z: number) {
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.9, 0.8),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.5 })
    );
    counter.position.set(x, 0.45, z);
    this.scene.add(counter);

    // Ornate Vintage Brass Key resting on the countertop
    this.createBrassKey(x + 0.6, 0.91, z);

    this.colliders.push({
      minX: x - 1.8,
      maxX: x + 1.8,
      minZ: z - 0.4,
      maxZ: z + 0.4,
    });
  }

  private createBrassKey(x: number, y: number, z: number) {
    const keyGroup = new THREE.Group();
    keyGroup.position.set(x, y, z);

    const keyMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.88,
      roughness: 0.22,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.35,
    });

    // 1. Ornate Bow Ring (Handle)
    const bowGeo = new THREE.TorusGeometry(0.045, 0.012, 10, 20);
    const bow = new THREE.Mesh(bowGeo, keyMat);
    bow.position.set(-0.08, 0.015, 0);
    bow.rotation.x = Math.PI / 2;
    keyGroup.add(bow);

    // 2. Stem / Shaft
    const stemGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.16, 12);
    const stem = new THREE.Mesh(stemGeo, keyMat);
    stem.rotation.z = Math.PI / 2;
    stem.position.set(0, 0.015, 0);
    keyGroup.add(stem);

    // 3. Bit / Notches (Teeth)
    const bitGeo = new THREE.BoxGeometry(0.035, 0.01, 0.045);
    const bit = new THREE.Mesh(bitGeo, keyMat);
    bit.position.set(0.065, 0.015, 0.022);
    keyGroup.add(bit);

    // 4. Subtle warm glow indicator to help spot it in the dark
    const keyLight = new THREE.PointLight(0xfbbf24, 0.55, 1.8);
    keyLight.position.set(0, 0.15, 0);
    keyGroup.add(keyLight);

    // 5. Large Invisible Interaction Hitbox (easy crosshair targeting and touch hit)
    const hitboxGeo = new THREE.BoxGeometry(0.45, 0.3, 0.45);
    const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat) as InteractiveMesh;
    hitbox.position.set(0, 0.05, 0);
    hitbox.userData = {
      interactiveData: {
        id: 'brass_key',
        name: 'Vintage Brass Key',
        prompt: 'Press [E] or Tap to Pick up Brass Key',
        type: 'pickup',
        content: 'An ornate brass key labelled "BASEMENT". The cold metal hums faintly with strange resonance.',
      },
      parentGroup: keyGroup,
    };
    keyGroup.add(hitbox);

    this.scene.add(keyGroup);
    this.interactiveObjects.push(hitbox);
  }

  private createDiningTable(x: number, z: number) {
    const table = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.75, 1.2),
      this.sharedWoodMaterial
    );
    table.position.set(x, 0.375, z);
    this.scene.add(table);

    this.colliders.push({
      minX: x - 0.9,
      maxX: x + 0.9,
      minZ: z - 0.6,
      maxZ: z + 0.6,
    });
  }

  // --- ACT III: SURREAL HOSPITAL ROOM (THE TRUTH REVEAL) ---

  private buildHospitalRoom() {
    // Hidden beyond the basement door at z: 15. Extends to z: 28!
    const hospitalGroup = new THREE.Group();
    hospitalGroup.position.set(0, 0, 15);
    hospitalGroup.visible = false; // Turned visible in Act 3

    const tileTex = textureGenerator.getHospitalTileTexture();
    const sterileWallMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.3,
      metalness: 0.1,
    });

    // Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 12),
      new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.2 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 6);
    hospitalGroup.add(floor);

    // Ceiling with fluorescent panels
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 12),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 3.2, 6);
    hospitalGroup.add(ceiling);

    // Left wall
    const wallL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.2, 12), sterileWallMat);
    wallL.position.set(-2, 1.6, 6);
    hospitalGroup.add(wallL);

    // Right wall
    const wallR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.2, 12), sterileWallMat);
    wallR.position.set(2, 1.6, 6);
    hospitalGroup.add(wallR);

    // End wall with hospital exit door
    const wallEnd = new THREE.Mesh(new THREE.BoxGeometry(4, 3.2, 0.2), sterileWallMat);
    wallEnd.position.set(0, 1.6, 12);
    hospitalGroup.add(wallEnd);

    // Fluorescent overhead lights
    for (let fz = 2; fz <= 10; fz += 4) {
      const flPanel = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.05, 0.6),
        new THREE.MeshBasicMaterial({ color: 0xf8fafc })
      );
      flPanel.position.set(0, 3.18, fz);
      hospitalGroup.add(flPanel);

      const light = new THREE.PointLight(0xe0f2fe, 1.2, 5.0);
      light.position.set(0, 2.9, fz);
      hospitalGroup.add(light);
    }

    // Hospital Bed at end of corridor (z: 10)
    const bed = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.7, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6 })
    );
    bed.position.set(0, 0.35, 10);
    hospitalGroup.add(bed);

    // White hospital sheets
    const sheets = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 0.3, 2.1),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95 })
    );
    sheets.position.set(0, 0.6, 10);
    hospitalGroup.add(sheets);

    // IV Drip Stand
    const ivPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 2.0),
      this.sharedMetalMaterial
    );
    ivPole.position.set(1.0, 1.0, 9.5);
    hospitalGroup.add(ivPole);

    // IV Bag
    const ivBag = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.24, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.7 })
    );
    ivBag.position.set(1.0, 1.9, 9.5);
    hospitalGroup.add(ivBag);

    // CLINICAL MEDICAL CLIPBOARD (THE REVELATION ITEM)
    const clipboardTex = textureGenerator.getMedicalClipboardTexture();
    const clipboard = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.45, 0.02),
      new THREE.MeshStandardMaterial({ map: clipboardTex, roughness: 0.7 })
    ) as InteractiveMesh;
    clipboard.rotation.x = -Math.PI / 4;
    clipboard.position.set(0, 0.85, 9.5);
    clipboard.userData = {
      interactiveData: {
        id: 'medical_record',
        name: 'Clinical Assessment Record',
        prompt: 'Press [E] or Tap to Read Medical Record',
        type: 'inspect',
        content: 'PATIENT: LEO VANCE (AGE 9). DIAGNOSIS: PEDIATRIC SCHIZOPHRENIA / ACUTE HALLUCINATORY REM FUGUE. Physician note: "The patient is deeply immersed in a recurring dream of his childhood house on Elmridge, attempting to solve an impossible memory..."',
      },
    };
    hospitalGroup.add(clipboard);
    this.interactiveObjects.push(clipboard);

    // Hospital corridor colliders
    this.colliders.push({
      minX: -2.2,
      maxX: -1.9,
      minZ: 15,
      maxZ: 27.2,
    });
    this.colliders.push({
      minX: 1.9,
      maxX: 2.2,
      minZ: 15,
      maxZ: 27.2,
    });
    this.colliders.push({
      minX: -2.0,
      maxX: 2.0,
      minZ: 27.0,
      maxZ: 27.5,
    });

    this.hospitalCorridorGroup = hospitalGroup;
    this.scene.add(hospitalGroup);
  }

  public revealHospitalCorridor() {
    if (this.hospitalCorridorGroup) {
      this.hospitalCorridorGroup.visible = true;
    }
    if (this.basementDoor) {
      // Swing open basement door
      this.basementDoor.rotation.y = -Math.PI / 2;
    }
    // Remove the basement door collider cleanly by id or location
    this.colliders = this.colliders.filter(
      (c) => c.id !== 'basement_door' && !(Math.abs(c.minZ - 15) < 0.5 && Math.abs(c.minX - -0.6) < 0.3)
    );
  }

  public updatePsychologicalState(hallucinationLevel: number) {
    // Hallucination level 0 to 1
    if (this.portraitMesh && hallucinationLevel > 0.4) {
      const glitchTex = textureGenerator.getFramedFamilyPortraitTexture(true);
      (this.portraitMesh.material as THREE.MeshStandardMaterial).map = glitchTex;
      (this.portraitMesh.material as THREE.MeshStandardMaterial).needsUpdate = true;
    }

    if (this.crtMesh && hallucinationLevel > 0.6) {
      const emergencyTex = textureGenerator.getCRTScreenTexture('clinical');
      (this.crtMesh.material as THREE.MeshBasicMaterial).map = emergencyTex;
      (this.crtMesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
    }
  }

  public buildMemoryFragments(): void {
    const haloGeo = new THREE.TorusGeometry(0.1, 0.0035, 8, 24);

    // 1. Fragment 1: The Plastic Admission Wristband (Child's Bedroom Desk)
    const wristbandGroup = new THREE.Group();
    wristbandGroup.position.set(1.3, 0.77, -2.4);
    wristbandGroup.userData = {
      id: 'fragment_wristband',
      baseY: 0.77,
      seed: 0.2,
      isFragment: true,
    };

    const bandGeo = new THREE.TorusGeometry(0.065, 0.016, 12, 24, Math.PI * 1.8);
    const bandMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.95,
      emissive: 0x93c5fd,
      emissiveIntensity: 0.35,
    });
    const bandMesh = new THREE.Mesh(bandGeo, bandMat) as InteractiveMesh;
    bandMesh.rotation.x = Math.PI / 2.3;
    bandMesh.rotation.z = -0.4;
    bandMesh.castShadow = true;
    bandMesh.userData = {
      interactiveData: {
        id: 'fragment_wristband',
        name: 'Memory Fragment: Plastic Band',
        prompt: 'Press [E] or Tap to Examine Memory Fragment: Plastic Band',
        type: 'lore',
      },
      parentGroup: wristbandGroup,
    };
    wristbandGroup.add(bandMesh);

    // Ethereal subtle halo aura
    const halo1 = new THREE.Mesh(
      haloGeo,
      new THREE.MeshBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.7 })
    );
    halo1.rotation.x = Math.PI / 2;
    wristbandGroup.add(halo1);

    const light1 = new THREE.PointLight(0x93c5fd, 0.45, 1.6);
    wristbandGroup.add(light1);

    this.scene.add(wristbandGroup);
    this.memoryFragmentObjects.push(wristbandGroup);
    this.interactiveObjects.push(bandMesh);

    // 2. Fragment 2: Dictaphone Cassette (Hallway Wooden Console Table)
    const cassetteGroup = new THREE.Group();
    cassetteGroup.position.set(0.9, 0.79, 7.8);
    cassetteGroup.userData = {
      id: 'fragment_cassette',
      baseY: 0.79,
      seed: 1.4,
      isFragment: true,
    };

    const cBodyGeo = new THREE.BoxGeometry(0.14, 0.02, 0.09);
    const cBodyMat = new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      roughness: 0.4,
      metalness: 0.2,
      emissive: 0xfde047,
      emissiveIntensity: 0.25,
    });
    const cassetteMesh = new THREE.Mesh(cBodyGeo, cBodyMat) as InteractiveMesh;
    cassetteMesh.castShadow = true;
    cassetteMesh.userData = {
      interactiveData: {
        id: 'fragment_cassette',
        name: 'Memory Fragment: Dictaphone Tape',
        prompt: 'Press [E] or Tap to Examine Memory Fragment: Dictaphone Tape',
        type: 'lore',
      },
      parentGroup: cassetteGroup,
    };
    cassetteGroup.add(cassetteMesh);

    const spoolMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const s1 = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.022, 10), spoolMat);
    s1.position.set(-0.035, 0.002, 0);
    const s2 = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.022, 10), spoolMat);
    s2.position.set(0.035, 0.002, 0);
    cassetteGroup.add(s1);
    cassetteGroup.add(s2);

    const halo2 = new THREE.Mesh(
      haloGeo,
      new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.65 })
    );
    halo2.rotation.x = Math.PI / 2;
    cassetteGroup.add(halo2);

    const light2 = new THREE.PointLight(0xfde047, 0.4, 1.5);
    cassetteGroup.add(light2);

    this.scene.add(cassetteGroup);
    this.memoryFragmentObjects.push(cassetteGroup);
    this.interactiveObjects.push(cassetteMesh);

    // 3. Fragment 3: Amber Prescription Vial (Kitchen White Countertop)
    const vialGroup = new THREE.Group();
    vialGroup.position.set(-5.8, 0.94, 7.6);
    vialGroup.userData = {
      id: 'fragment_prescription',
      baseY: 0.94,
      seed: 2.7,
      isFragment: true,
    };

    const bottleGeo = new THREE.CylinderGeometry(0.036, 0.036, 0.12, 14);
    const bottleMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.15,
      metalness: 0.05,
      transparent: true,
      opacity: 0.88,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.35,
    });
    const vialMesh = new THREE.Mesh(bottleGeo, bottleMat) as InteractiveMesh;
    vialMesh.castShadow = true;
    vialMesh.userData = {
      interactiveData: {
        id: 'fragment_prescription',
        name: 'Memory Fragment: Amber Bottle',
        prompt: 'Press [E] or Tap to Examine Memory Fragment: Amber Bottle',
        type: 'lore',
      },
      parentGroup: vialGroup,
    };
    vialGroup.add(vialMesh);

    const capMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.024, 14),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 })
    );
    capMesh.position.y = 0.065;
    vialGroup.add(capMesh);

    const halo3 = new THREE.Mesh(
      haloGeo,
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.65 })
    );
    halo3.rotation.x = Math.PI / 2;
    vialGroup.add(halo3);

    const light3 = new THREE.PointLight(0xf59e0b, 0.45, 1.6);
    vialGroup.add(light3);

    this.scene.add(vialGroup);
    this.memoryFragmentObjects.push(vialGroup);
    this.interactiveObjects.push(vialMesh);

    // 4. Fragment 4: Gauze-Wrapped Toy Soldier (Living Room Coffee Table)
    const soldierGroup = new THREE.Group();
    soldierGroup.position.set(5.7, 0.44, 11.0);
    soldierGroup.userData = {
      id: 'fragment_soldier',
      baseY: 0.44,
      seed: 3.9,
      isFragment: true,
    };

    const sBodyGeo = new THREE.CylinderGeometry(0.028, 0.032, 0.14, 12);
    const sBodyMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      roughness: 0.5,
      emissive: 0xef4444,
      emissiveIntensity: 0.3,
    });
    const soldierMesh = new THREE.Mesh(sBodyGeo, sBodyMat) as InteractiveMesh;
    soldierMesh.castShadow = true;
    soldierMesh.userData = {
      interactiveData: {
        id: 'fragment_soldier',
        name: 'Memory Fragment: Wounded Toy Soldier',
        prompt: 'Press [E] or Tap to Examine Memory Fragment: Wounded Toy Soldier',
        type: 'lore',
      },
      parentGroup: soldierGroup,
    };
    soldierGroup.add(soldierMesh);

    const gauzeMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.034, 0.034, 0.06, 12),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.9 })
    );
    soldierGroup.add(gauzeMesh);

    const hatMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.024, 0.05, 10),
      new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.4 })
    );
    hatMesh.position.y = 0.095;
    soldierGroup.add(hatMesh);

    const halo4 = new THREE.Mesh(
      haloGeo,
      new THREE.MeshBasicMaterial({ color: 0xf87171, transparent: true, opacity: 0.65 })
    );
    halo4.rotation.x = Math.PI / 2;
    soldierGroup.add(halo4);

    const light4 = new THREE.PointLight(0xf87171, 0.45, 1.5);
    soldierGroup.add(light4);

    this.scene.add(soldierGroup);
    this.memoryFragmentObjects.push(soldierGroup);
    this.interactiveObjects.push(soldierMesh);

    // 5. Fragment 5: Glitched Polaroid Photograph (Living Room Bookshelf Shelf)
    const polaroidGroup = new THREE.Group();
    polaroidGroup.position.set(4.8, 1.18, 7.35);
    polaroidGroup.userData = {
      id: 'fragment_polaroid',
      baseY: 1.18,
      seed: 4.8,
      isFragment: true,
    };

    const polBorder = new THREE.Mesh(
      new THREE.BoxGeometry(0.13, 0.16, 0.006),
      new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.6,
        emissive: 0x67e8f9,
        emissiveIntensity: 0.25,
      })
    ) as InteractiveMesh;
    polBorder.castShadow = true;
    polBorder.userData = {
      interactiveData: {
        id: 'fragment_polaroid',
        name: 'Memory Fragment: Distorted Polaroid',
        prompt: 'Press [E] or Tap to Examine Memory Fragment: Distorted Polaroid',
        type: 'lore',
      },
      parentGroup: polaroidGroup,
    };
    polaroidGroup.add(polBorder);

    const photoFace = new THREE.Mesh(
      new THREE.PlaneGeometry(0.105, 0.105),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.3 })
    );
    photoFace.position.set(0, 0.015, 0.004);
    polaroidGroup.add(photoFace);

    const halo5 = new THREE.Mesh(
      haloGeo,
      new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.7 })
    );
    halo5.rotation.x = Math.PI / 2;
    polaroidGroup.add(halo5);

    const light5 = new THREE.PointLight(0x67e8f9, 0.45, 1.6);
    polaroidGroup.add(light5);

    this.scene.add(polaroidGroup);
    this.memoryFragmentObjects.push(polaroidGroup);
    this.interactiveObjects.push(polBorder);
  }

  public dispose() {
    this.colliders = [];
    this.interactiveObjects = [];
    this.memoryFragmentObjects = [];
    this.dynamicLights = [];
    this.sharedWallMaterial.dispose();
    this.sharedFloorMaterial.dispose();
    this.sharedCeilingMaterial.dispose();
    this.sharedWoodMaterial.dispose();
    this.sharedMetalMaterial.dispose();
  }
}
