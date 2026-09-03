import * as THREE from 'three';
import { HouseBuilder, InteractiveMesh } from './HouseBuilder';
import { soundManager } from '../audio/SoundSynthesizer';
import { GameState, GraphicSettings, TouchInputState, MemoryFragment } from '../types';
import { getMemoryFragment } from '../data/memoryFragments';

export class GameEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private houseBuilder: HouseBuilder;

  // Flashlight & Lighting
  public flashlight: THREE.SpotLight | null = null;
  public flashlightTarget: THREE.Object3D;
  private ambientLight: THREE.AmbientLight;
  private lightningLight: THREE.DirectionalLight;
  private dustParticles: THREE.Points | null = null;

  // Player state
  private playerPos: THREE.Vector3 = new THREE.Vector3(0, 1.35, 0); // 1.35m = 9yo child perspective
  private playerVelocity: THREE.Vector3 = new THREE.Vector3();
  private yaw: number = 0;
  private pitch: number = 0;
  private isGrounded: boolean = true;
  private headBobTimer: number = 0;
  private isMoving: boolean = false;
  private moveSpeed: number = 2.4;

  // Desktop input state
  private keys: { [key: string]: boolean } = {};
  public isPointerLocked: boolean = false;

  // Mobile touch input state
  public touchInput: TouchInputState = {
    moveX: 0,
    moveY: 0,
    lookDeltaX: 0,
    lookDeltaY: 0,
    interactPressed: false,
    flashlightTogglePressed: false,
    sprintPressed: false,
  };

  // Raycaster for interactions
  private raycaster: THREE.Raycaster;
  public hoveredObject: InteractiveMesh | null = null;

  // Game callbacks
  public onStateChange: (state: Partial<GameState>) => void;
  public onInspectObject: (data: {
    title: string;
    description: string;
    noteText?: string;
    subtext?: string;
    isMedicalRecord?: boolean;
  }) => void;
  public onInspectMemoryFragment?: (fragment: MemoryFragment) => void;

  // Internal state tracking
  private gameState: GameState;
  private settings: GraphicSettings;
  private animationFrameId: number | null = null;
  private lastTime: number = performance.now();
  private nextLightningTime: number = 6.0;

  constructor(
    container: HTMLElement,
    gameState: GameState,
    settings: GraphicSettings,
    onStateChange: (state: Partial<GameState>) => void,
    onInspectObject: (data: {
      title: string;
      description: string;
      noteText?: string;
      subtext?: string;
      isMedicalRecord?: boolean;
    }) => void,
    onInspectMemoryFragment?: (fragment: MemoryFragment) => void
  ) {
    this.container = container;
    this.gameState = gameState;
    this.settings = settings;
    this.onStateChange = onStateChange;
    this.onInspectObject = onInspectObject;
    this.onInspectMemoryFragment = onInspectMemoryFragment;

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x05070c);
    this.scene.fog = new THREE.FogExp2(0x07090f, 0.075);

    // 2. Camera setup (child height: 1.35m)
    const aspect = container.clientWidth / container.clientHeight || 16 / 9;
    this.camera = new THREE.PerspectiveCamera(settings.fov || 72, aspect, 0.1, 40);
    this.camera.position.copy(this.playerPos);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: settings.quality !== 'low',
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, settings.quality === 'high' ? 1.5 : 1.0));
    this.renderer.shadowMap.enabled = settings.shadows;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);

    // 4. Lighting setup
    this.ambientLight = new THREE.AmbientLight(0x182030, 0.35); // Dim eerie moonlight
    this.scene.add(this.ambientLight);

    // Distant storm lightning
    this.lightningLight = new THREE.DirectionalLight(0x93c5fd, 0.0);
    this.lightningLight.position.set(0, 10, -10);
    this.scene.add(this.lightningLight);

    // Flashlight
    this.flashlightTarget = new THREE.Object3D();
    this.scene.add(this.flashlightTarget);

    this.flashlight = new THREE.SpotLight(0xfff3d6, 0, 18, Math.PI / 6, 0.45, 1.2);
    this.flashlight.castShadow = settings.shadows;
    this.flashlight.shadow.mapSize.width = 512;
    this.flashlight.shadow.mapSize.height = 512;
    this.flashlight.target = this.flashlightTarget;
    this.scene.add(this.flashlight);

    // 5. Dust Motes System
    this.setupDustParticles();

    // 6. Build 3D House
    this.houseBuilder = new HouseBuilder(this.scene);
    this.houseBuilder.buildHouse();

    // 7. Raycaster
    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = 3.6; // Generous 3.6m interaction range for effortless pickup and inspection

    // 8. Event listeners
    this.setupDesktopControls();
    window.addEventListener('resize', this.onWindowResize);

    // Start render loop
    this.animate();
  }

  private setupDustParticles() {
    const particleCount = 180;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 16;
      positions[i + 1] = Math.random() * 3.0;
      positions[i + 2] = (Math.random() - 0.5) * 16 + 6;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.035,
      transparent: true,
      opacity: 0.35,
    });

    this.dustParticles = new THREE.Points(geometry, material);
    this.scene.add(this.dustParticles);
  }

  private setupDesktopControls() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      // Flashlight toggle
      if (e.code === 'KeyF') {
        this.toggleFlashlight();
      }

      // Interact
      if (e.code === 'KeyE') {
        this.interactWithTarget();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    this.renderer.domElement.addEventListener('click', () => {
      if (!this.isPointerLocked && !this.isTouchDevice()) {
        this.renderer.domElement.requestPointerLock?.();
      } else if (this.isPointerLocked) {
        this.interactWithTarget();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === this.renderer.domElement;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isPointerLocked) return;
      const sensitivity = 0.0022 * (this.settings.sensitivity || 1.0);
      this.yaw -= e.movementX * sensitivity;
      this.pitch -= e.movementY * sensitivity;
      this.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.pitch));
    });
  }

  private isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  public toggleFlashlight() {
    if (!this.gameState.hasFlashlight) return;

    const nextState = !this.gameState.flashlightOn;
    this.onStateChange({ flashlightOn: nextState });
    soundManager.playFlashlightClick(nextState);

    if (this.flashlight) {
      this.flashlight.intensity = nextState ? 2.8 : 0;
    }
  }

  public interactWithTarget() {
    if (!this.hoveredObject) return;

    const data = this.hoveredObject.userData.interactiveData;
    if (!data) return;

    // Handle Memory Fragment Collection
    if (data.id.startsWith('fragment_')) {
      const fragment = getMemoryFragment(data.id);
      if (fragment) {
        soundManager.playFragmentChime();
        soundManager.playMemoryFragmentAudio(fragment.audioType);

        const parentGroup = this.hoveredObject.userData?.parentGroup as THREE.Group | undefined;
        if (parentGroup) {
          this.scene.remove(parentGroup);
          this.houseBuilder.memoryFragmentObjects = this.houseBuilder.memoryFragmentObjects.filter(
            (g) => g !== parentGroup
          );
        }
        this.scene.remove(this.hoveredObject);
        this.houseBuilder.interactiveObjects = this.houseBuilder.interactiveObjects.filter(
          (obj) => obj !== this.hoveredObject
        );
        this.hoveredObject = null;

        const prev = this.gameState.collectedFragments || [];
        const updatedFragments = prev.includes(fragment.id) ? prev : [...prev, fragment.id];
        const newSanity = Math.min(100, (this.gameState.sanity || 80) + 12);

        this.gameState.collectedFragments = updatedFragments;
        this.gameState.activeMemoryFragment = fragment;
        this.gameState.sanity = newSanity;

        this.onStateChange({
          collectedFragments: updatedFragments,
          activeMemoryFragment: fragment,
          sanity: newSanity,
        });

        if (this.onInspectMemoryFragment) {
          this.onInspectMemoryFragment(fragment);
        }
        return;
      }
    }

    // Handle pickup of flashlight
    if (data.id === 'flashlight') {
      soundManager.playItemPickup();
      const parentGroup = this.hoveredObject.userData?.parentGroup as THREE.Group | undefined;
      if (parentGroup) {
        this.scene.remove(parentGroup);
      }
      this.scene.remove(this.hoveredObject);
      this.houseBuilder.interactiveObjects = this.houseBuilder.interactiveObjects.filter(
        (obj) => obj !== this.hoveredObject
      );
      this.hoveredObject = null;

      this.gameState.hasFlashlight = true;
      this.gameState.flashlightOn = true;

      this.onStateChange({
        hasFlashlight: true,
        flashlightOn: true,
        currentObjective: "Check on Mom and Dad down the hallway.",
      });

      if (this.flashlight) {
        this.flashlight.intensity = 2.8;
      }
      return;
    }

    // Handle pickup of Barnaby Bear
    if (data.id === 'barnaby_bear') {
      soundManager.playItemPickup();
      soundManager.playLullabyMelody();
      const parentGroup = this.hoveredObject.userData?.parentGroup as THREE.Group | undefined;
      if (parentGroup) {
        this.scene.remove(parentGroup);
      }
      this.scene.remove(this.hoveredObject);
      this.houseBuilder.interactiveObjects = this.houseBuilder.interactiveObjects.filter(
        (obj) => obj !== this.hoveredObject
      );
      this.hoveredObject = null;

      const newSanity = Math.max(10, this.gameState.sanity - 25);
      const newHallucination = Math.min(1.0, this.gameState.hallucinationLevel + 0.3);
      soundManager.setHallucinationIntensity(newHallucination);
      this.houseBuilder.updatePsychologicalState(newHallucination);

      const updatedInventory = [
        ...this.gameState.inventory,
        {
          id: 'barnaby',
          name: 'Barnaby Bear',
          description: 'My best friend since preschool. He whispers quiet nursery songs.',
          iconName: 'Teddy',
        },
      ];

      this.gameState.foundBear = true;
      this.gameState.sanity = newSanity;
      this.gameState.hallucinationLevel = newHallucination;
      this.gameState.inventory = updatedInventory;

      this.onStateChange({
        foundBear: true,
        sanity: newSanity,
        hallucinationLevel: newHallucination,
        inventory: updatedInventory,
        currentObjective: this.gameState.foundKey
          ? 'Find the key to the basement door in the hallway.'
          : 'Check the kitchen for the door key.',
      });

      this.onInspectObject({
        title: 'Barnaby the Bear',
        description: 'You hug Barnaby tightly. A soft, distant music box plays in your head.',
        subtext: '"Barnaby says: The house isn\'t real, Leo. Listen to the beeping..."',
      });
      return;
    }

    // Handle pickup of Brass Key
    if (data.id === 'brass_key') {
      soundManager.playItemPickup();
      const parentGroup = this.hoveredObject.userData?.parentGroup as THREE.Group | undefined;
      if (parentGroup) {
        this.scene.remove(parentGroup);
      }
      this.scene.remove(this.hoveredObject);
      this.houseBuilder.interactiveObjects = this.houseBuilder.interactiveObjects.filter(
        (obj) => obj !== this.hoveredObject
      );
      this.hoveredObject = null;

      const newHallucination = Math.min(1.0, this.gameState.hallucinationLevel + 0.25);
      soundManager.setHallucinationIntensity(newHallucination);
      this.houseBuilder.updatePsychologicalState(newHallucination);

      const updatedInventory = [
        ...this.gameState.inventory,
        {
          id: 'brass_key',
          name: 'Brass Door Key',
          description: 'A heavy brass key. It unlocks the door at the end of the hallway.',
          iconName: 'Key',
        },
      ];

      this.gameState.foundKey = true;
      this.gameState.hallucinationLevel = newHallucination;
      this.gameState.inventory = updatedInventory;

      this.onStateChange({
        foundKey: true,
        hallucinationLevel: newHallucination,
        inventory: updatedInventory,
        currentObjective: 'Unlock the basement door at the end of the hallway.',
      });

      this.onInspectObject({
        title: 'Vintage Brass Key',
        description: 'Cold to the touch. A label reads "BASEMENT".',
        subtext: 'You feel a strong pull toward the heavy wooden door at the end of the hallway.',
      });
      return;
    }

    // Handle inspection of Crayon Drawing
    if (data.id === 'crayon_drawing') {
      this.onInspectObject({
        title: 'Family Drawing (1998)',
        description: data.content || '',
        noteText: 'OUR HAPPY HOME - Mommy, Daddy, and Leo.\nScribbled underneath: "(he is watching from the dark)"',
        subtext: 'Looking at this drawing makes your head ache with muffled hospital monitor beeps.',
      });
      return;
    }

    // Handle TV switch
    if (data.id === 'crt_tv') {
      soundManager.playDoorCreak();
      this.onInspectObject({
        title: 'Vintage CRT Television',
        description: 'The cathode-ray tube screen displays strange clinical telemetry and hospital patient data.',
        subtext: '"...Patient: Vance, Leo. EEG shows violent REM spikes. Increase tranquilizer dosage..."',
      });
      return;
    }

    // Handle Refrigerator
    if (data.id === 'fridge') {
      this.onInspectObject({
        title: 'Kitchen Refrigerator',
        description: data.content || '',
        subtext: 'The magnetic letters shift before your eyes: W - A - K - E   U - P',
      });
      return;
    }

    // Handle Master Bedroom Door
    if (data.id === 'master_bedroom_door') {
      soundManager.playDoorCreak();
      this.onInspectObject({
        title: "Parents' Bedroom Door",
        description: data.content || '',
        subtext: 'From beyond the crack: "...the fever isn\'t breaking, doctor. He thinks he\'s walking through our old house..."',
      });
      return;
    }

    // Handle Basement Door (The Act 3 Transition!)
    if (data.id === 'basement_door') {
      const hasKey = this.gameState.foundKey || this.gameState.inventory.some((i) => i.id === 'brass_key');
      if (!hasKey) {
        soundManager.playDoorCreak();
        this.onInspectObject({
          title: 'Locked Door',
          description: 'The door is bolted shut with an antique brass lock.',
          subtext: 'You need to find the Brass Key in the kitchen to unlock it.',
        });
      } else {
        // Unlock and initiate Act 3: "The Dissolution"!
        soundManager.playDoorCreak();
        this.houseBuilder.revealHospitalCorridor();

        const maxHallucination = 0.95;
        soundManager.setHallucinationIntensity(maxHallucination);
        this.houseBuilder.updatePsychologicalState(maxHallucination);

        this.gameState.unlockedBasement = true;
        this.gameState.currentAct = 'act3_awakening';
        this.gameState.hallucinationLevel = maxHallucination;

        this.onStateChange({
          unlockedBasement: true,
          currentAct: 'act3_awakening',
          hallucinationLevel: maxHallucination,
          currentObjective: 'Follow the impossible corridor to the end.',
        });

        this.onInspectObject({
          title: 'The Reality Unfolds',
          description: 'The heavy wooden door swings open... but there are no basement stairs.',
          subtext: 'Beyond the door is a sterile, fluorescent-lit hospital corridor. The wallpaper is peeling away.',
        });
      }
      return;
    }

    // Handle Medical Record (The Climax / Game Ending!)
    if (data.id === 'medical_record') {
      soundManager.playAwakeningResolution();
      this.onStateChange({
        isAwakened: true,
        currentAct: 'epilogue',
        currentObjective: 'Awaken.',
      });

      this.onInspectObject({
        title: 'St. Jude Pediatric Neurology - Patient Chart',
        description: 'PATIENT: LEO VANCE (AGE 9)',
        noteText: 'Diagnosis: Acute Schizoaffective Dream-Fugue State.\n\n"The patient has been in a medically-induced coma following persistent auditory and visual hallucinations. In his recurring dream, he traverses the nostalgic memories of his former childhood home on Elmridge, trying to make sense of the voices and shadows.\n\nVital signs stabilizing. Awakening protocol initiated."',
        subtext: 'You open your eyes. The storm outside fades. The fluorescent lights grow warm. You are safe in bed, and your parents are holding your hand.',
        isMedicalRecord: true,
      });
      return;
    }

    // Default inspection
    this.onInspectObject({
      title: data.name,
      description: data.content || '',
    });
  }

  private onWindowResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public updateSettings(settings: GraphicSettings) {
    this.settings = settings;
    this.renderer.shadowMap.enabled = settings.shadows;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, settings.quality === 'high' ? 1.5 : 1.0));
    this.camera.fov = settings.fov || 72;
    this.camera.updateProjectionMatrix();
    soundManager.setVolume(settings.soundVolume ?? 0.8);
  }

  // --- MAIN SIMULATION & RENDER LOOP ---

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const currentTime = performance.now();
    const delta = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    // 1. Process Input & Player Movement
    this.updateMovement(delta);

    // 2. Update Flashlight & Head Bobbing
    this.updateFlashlightAndCamera(delta);

    // 3. Update Pendulum & Objects
    if (this.houseBuilder.clockPendulum) {
      this.houseBuilder.clockPendulum.rotation.z = Math.sin(currentTime * 0.003) * 0.25;
    }

    // 3b. Floating and rotating subtle aura animation for memory fragments
    if (this.houseBuilder.memoryFragmentObjects.length > 0) {
      for (const fGroup of this.houseBuilder.memoryFragmentObjects) {
        fGroup.rotation.y += delta * 0.75;
        const seed = fGroup.userData.seed || 0;
        const baseY = fGroup.userData.baseY || 0;
        fGroup.position.y = baseY + Math.sin(currentTime * 0.0028 + seed) * 0.022;
      }
    }

    // 4. Update Dust Particles
    if (this.dustParticles) {
      const positions = this.dustParticles.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= delta * 0.08;
        if (positions[i] < 0) positions[i] = 3.2;
      }
      this.dustParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 5. Thunderstorm Lightning Logic
    this.nextLightningTime -= delta;
    if (this.nextLightningTime <= 0) {
      this.triggerLightningFlash();
      this.nextLightningTime = 12.0 + Math.random() * 18.0;
    }

    // 6. Interactive Object Raycasting
    this.updateRaycasting();

    // 7. Render
    this.renderer.render(this.scene, this.camera);
  };

  private updateMovement(delta: number) {
    // Process Mobile Touch Look Rotation
    if (this.touchInput.lookDeltaX !== 0 || this.touchInput.lookDeltaY !== 0) {
      const touchSens = 0.0032 * (this.settings.sensitivity || 1.0);
      this.yaw -= this.touchInput.lookDeltaX * touchSens;
      this.pitch -= this.touchInput.lookDeltaY * touchSens;
      this.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.pitch));

      // Reset touch deltas after applying
      this.touchInput.lookDeltaX = 0;
      this.touchInput.lookDeltaY = 0;
    }

    // Compute Movement Direction
    let forward = 0;
    let strafe = 0;

    // Desktop WASD
    if (this.keys['KeyW'] || this.keys['ArrowUp']) forward += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) forward -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) strafe += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) strafe -= 1;

    // Mobile Joystick
    if (this.touchInput.moveY !== 0) forward -= this.touchInput.moveY; // Up is negative Y in standard touch
    if (this.touchInput.moveX !== 0) strafe += this.touchInput.moveX;

    const isRunning = this.keys['ShiftLeft'] || this.touchInput.sprintPressed;
    const speed = (isRunning ? this.moveSpeed * 1.5 : this.moveSpeed);

    // Vector in world space
    const dir = new THREE.Vector3(strafe, 0, -forward);
    if (dir.lengthSq() > 0.01) {
      dir.normalize();
      dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
      this.playerVelocity.x = dir.x * speed;
      this.playerVelocity.z = dir.z * speed;
      this.isMoving = true;
    } else {
      this.playerVelocity.x *= 0.8;
      this.playerVelocity.z *= 0.8;
      this.isMoving = this.playerVelocity.lengthSq() > 0.05;
    }

    // Collision Detection & Wall-sliding algorithm
    const currentX = this.playerPos.x;
    const currentZ = this.playerPos.z;
    const moveX = this.playerVelocity.x * delta;
    const moveZ = this.playerVelocity.z * delta;
    const playerRadius = 0.22; // Agile child avatar radius (~0.44m / 17.5 in width for smooth doorway clearance)

    // Try full movement first
    if (!this.checkCollision(currentX + moveX, currentZ + moveZ, playerRadius)) {
      this.playerPos.x += moveX;
      this.playerPos.z += moveZ;
    } else {
      // Wall slide: test each axis independently from current position to prevent snagging on corners
      const canMoveX = !this.checkCollision(currentX + moveX, currentZ, playerRadius);
      const canMoveZ = !this.checkCollision(currentX, currentZ + moveZ, playerRadius);

      if (canMoveX) {
        this.playerPos.x += moveX;
      }
      if (canMoveZ) {
        this.playerPos.z += moveZ;
      }
    }

    // Footstep audio triggered by head bob
    if (this.isMoving) {
      const bobFreq = isRunning ? 14 : 9;
      const prevPhase = Math.sin(this.headBobTimer);
      this.headBobTimer += delta * bobFreq;
      const newPhase = Math.sin(this.headBobTimer);

      if (prevPhase > 0 && newPhase <= 0) {
        soundManager.playFootstep();
      }
    }
  }

  private checkCollision(x: number, z: number, r: number): boolean {
    for (const box of this.houseBuilder.colliders) {
      if (
        x + r > box.minX &&
        x - r < box.maxX &&
        z + r > box.minZ &&
        z - r < box.maxZ
      ) {
        return true;
      }
    }
    return false;
  }

  private updateFlashlightAndCamera(delta: number) {
    // Head bobbing calculation
    let bobY = 0;
    let bobX = 0;
    if (this.isMoving) {
      bobY = Math.sin(this.headBobTimer) * 0.045;
      bobX = Math.cos(this.headBobTimer * 0.5) * 0.025;
    }

    // Position camera at player pos + head bob
    this.camera.position.set(
      this.playerPos.x + bobX,
      this.playerPos.y + bobY,
      this.playerPos.z
    );

    // Apply rotation
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;

    // Flashlight follows camera with subtle lag and sway
    if (this.flashlight) {
      this.flashlight.position.copy(this.camera.position);

      const lookTarget = new THREE.Vector3(0, 0, -1);
      lookTarget.applyQuaternion(this.camera.quaternion);
      lookTarget.add(this.camera.position);

      this.flashlightTarget.position.copy(lookTarget);
    }
  }

  private triggerLightningFlash() {
    soundManager.playThunder();

    let flashes = 0;
    const interval = setInterval(() => {
      if (!this.lightningLight) return;
      this.lightningLight.intensity = Math.random() * 3.5 + 1.0;
      flashes++;
      if (flashes > 4) {
        clearInterval(interval);
        this.lightningLight.intensity = 0;
      }
    }, 60);
  }

  private updateRaycasting() {
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    const intersects = this.raycaster.intersectObjects(
      this.houseBuilder.interactiveObjects,
      false
    );

    if (intersects.length > 0) {
      const hit = intersects[0].object as InteractiveMesh;
      this.hoveredObject = hit;
    } else {
      this.hoveredObject = null;
    }
  }

  public dispose() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onWindowResize);
    this.houseBuilder.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
