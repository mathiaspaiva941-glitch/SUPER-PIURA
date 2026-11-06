export type GameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'VICTORY' | 'GAME_OVER';

export type CharacterId = 'killa' | 'inti' | 'sami' | 'tupac';

export interface CharacterDef {
  id: CharacterId;
  name: string;
  role: string;
  desc: string;
  color: string;
  accent: string;
  capColor: string;
  skinColor: string;
  hairColor: string;
  baseJump: number;
  baseSpeed: number;
  baseLives: number;
  specialTrait: string;
}

export interface Upgrades {
  waterCannon: number; // Motobomba: Niveles 1-5 (aumenta daño y penetra armadura de jefes)
  boots: number;       // Botas: Niveles 1-5 (aumenta salto, velocidad y desbloquea doble salto en nivel 3+)
  raincoat: number;    // Chubasquero: Niveles 1-5 (armadura y reducción de daño contra jefes)
  backpack: number;    // Mochila/Imán: Niveles 1-5 (mayor cadencia y radio de imán)
  maxLives: number;    // Corazones: Niveles 1-5 (más vidas por nivel)
}

export interface GameSaveData {
  level: number;
  maxUnlockedLevel: number;
  coins: number;
  score: number;
  selectedChar: CharacterId;
  upgrades: Upgrades;
  soundEnabled: boolean;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type BlockType = 'ground' | 'brick' | 'question' | 'pipe' | 'platform' | 'barrier';

export interface Block extends Rect {
  type: BlockType;
  color?: string;
  topColor?: string;
  hit?: boolean;
  empty?: boolean;
  bounceY?: number;
  content?: 'coin' | 'powerup' | 'none';
  pipeTop?: boolean;
  moving?: boolean;
  moveRange?: number;
  moveSpeed?: number;
  startX?: number;
  startY?: number;
  isHazard?: boolean;
}

export interface Coin extends Rect {
  taken: boolean;
  value: number;
  animFrame: number;
  sparkle?: number;
}

export interface SupplyPack extends Rect {
  taken: boolean;
}

export type EnemyType = 'mud_blob' | 'mosquito' | 'rolling_boulder' | 'mud_spitter' | 'storm_cloud';

export interface Enemy extends Rect {
  id: number;
  type: EnemyType;
  vx: number;
  vy: number;
  startX: number;
  range: number;
  dead: boolean;
  squashAnim: number;
  facing: 1 | -1;
  animTimer: number;
  isAggro?: boolean;
  canJump?: boolean;
  hp?: number;
  shootCooldown?: number;
}

export interface LightningHazard {
  id: number;
  x: number;
  y: number;
  telegraphTimer: number; // Cuenta regresiva de advertencia roja
  strikeTimer: number;    // Duración activa del rayo
  active: boolean;
}

export interface Shockwave extends Rect {
  id: number;
  vx: number;
  life: number;
  damage: number;
}

export interface Projectile extends Rect {
  id: number;
  vx: number;
  vy: number;
  damage: number;
  piercing: boolean;
  life: number;
  fromPlayer: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  shape?: 'square' | 'circle' | 'spark';
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  vy: number;
  alpha: number;
  color: string;
  font?: string;
}

export interface BossDef {
  world: number;
  name: string;
  title: string;
  maxHp: number;
  armorRating: number; // Requiere nivel de Motobomba igual o mayor para hacer daño completo
  requiredPowerLevel: number; // Nivel de preparación del jugador para ganar
  color: string;
  eyeColor: string;
  description: string;
  tacticalAdvice: string;
}

export interface ActiveBoss extends Rect {
  def: BossDef;
  hp: number;
  maxHp: number;
  phase: number;
  vx: number;
  vy: number;
  state: 'idle' | 'charging' | 'summoning' | 'vulnerable' | 'defeated';
  stateTimer: number;
  attackTimer: number;
  hitFlash: number;
  defeatedAnim: number;
  facing: 1 | -1;
}

export interface WorldZone {
  world: number;
  name: string;
  region: string;
  skyTop: string;
  skyBottom: string;
  hillColor: string;
  groundColor: string;
  grassColor: string;
  weather: 'rain' | 'storm' | 'flood' | 'drizzle' | 'wind';
}

export interface LevelData {
  world: number;
  subLevel: number;
  totalLength: number;
  zone: WorldZone;
  isBossLevel: boolean;
  bossDef: BossDef | null;
  blocks: Block[];
  coins: Coin[];
  supplies: SupplyPack[];
  enemies: Enemy[];
  shelterX: number;
}
