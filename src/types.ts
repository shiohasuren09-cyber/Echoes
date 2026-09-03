export type GameAct = 'act1_midnight' | 'act2_fracture' | 'act3_awakening' | 'epilogue';

export interface MemoryFragment {
  id: string;
  number: number;
  title: string;
  artifactName: string;
  locationHint: string;
  narrative: string;
  subtext: string;
  audioType: 'telemetry_ventilator' | 'cassette_recording' | 'pill_whisper' | 'warped_lullaby' | 'polaroid_shutter';
  audioTitle: string;
  imageDataUri: string;
  dateTag: string;
  iconType: 'wristband' | 'cassette' | 'prescription' | 'soldier' | 'polaroid';
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  iconName: string;
}

export interface InteractiveObjectData {
  id: string;
  name: string;
  prompt: string;
  type: 'pickup' | 'door' | 'inspect' | 'switch' | 'lore';
  collected?: boolean;
  unlocked?: boolean;
  content?: string;
  targetAct?: GameAct;
}

export interface GameState {
  currentAct: GameAct;
  hasFlashlight: boolean;
  flashlightOn: boolean;
  battery: number; // 0 - 100
  sanity: number; // 100 (normal) to 0 (deep hallucination)
  inventory: InventoryItem[];
  collectedFragments: string[];
  activeMemoryFragment: MemoryFragment | null;
  isMemoryCodexOpen: boolean;
  currentObjective: string;
  activeInspectItem: {
    title: string;
    description: string;
    noteText?: string;
    subtext?: string;
    isMedicalRecord?: boolean;
  } | null;
  hallucinationLevel: number; // 0 to 1
  isPaused: boolean;
  isGameOver: boolean;
  isAwakened: boolean;
  foundBear: boolean;
  foundKey: boolean;
  foundDrawing: boolean;
  unlockedBasement: boolean;
  masterBedroomExamined: boolean;
  fridgeExamined: boolean;
  tvExamined: boolean;
  doctorVoicesTriggered: boolean;
}

export interface TouchInputState {
  moveX: number; // -1 to 1
  moveY: number; // -1 to 1
  lookDeltaX: number;
  lookDeltaY: number;
  interactPressed: boolean;
  flashlightTogglePressed: boolean;
  sprintPressed: boolean;
}

export interface GraphicSettings {
  quality: 'low' | 'medium' | 'high';
  shadows: boolean;
  sensitivity: number;
  soundVolume: number;
  musicVolume: number;
  fov: number;
}
