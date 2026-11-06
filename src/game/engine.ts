import { sound } from './audio';
import { BOSS_ROSTER, CHARACTERS, generateLevel } from './levels';
import { GameRenderer } from './renderer';
import {
  ActiveBoss,
  Block,
  CharacterId,
  Coin,
  Enemy,
  FloatingText,
  GameSaveData,
  GameState,
  LevelData,
  LightningHazard,
  Particle,
  Projectile,
  Shockwave,
  SupplyPack,
  Upgrades,
} from './types';

const STORAGE_KEY = 'super_piura_bros_v1';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderer: GameRenderer;

  // Estados del juego
  public state: GameState = 'TITLE';
  public currentLevel: number = 1;
  public maxUnlockedLevel: number = 1;
  public coins: number = 0;
  public score: number = 0;
  public lives: number = 3;
  public selectedChar: CharacterId = 'killa';
  public upgrades: Upgrades = {
    waterCannon: 1,
    boots: 1,
    raincoat: 1,
    backpack: 1,
    maxLives: 1,
  };

  // Nivel y entidades
  public levelData: LevelData | null = null;
  public activeBoss: ActiveBoss | null = null;
  public projectiles: Projectile[] = [];
  public shockwaves: Shockwave[] = [];
  public lightningHazards: LightningHazard[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];

  // Jugador
  public player = {
    x: 60,
    y: 380,
    w: 28,
    h: 42,
    vx: 0,
    vy: 0,
    ground: false,
    crouch: false,
    facing: 1 as 1 | -1,
    invuln: 0,
    sprinting: false,
    firing: 0,
    canDoubleJump: false,
    coyoteTimer: 0,
    jumpBuffer: 0,
  };

  // Cámara
  public cameraX: number = 0;
  public screenShake: number = 0;
  public hitStop: number = 0;
  public frame: number = 0;

  // Controles
  public keys = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    sprint: false,
    shoot: false,
  };

  // Callback de sincronización con React
  public onStateChange?: (state: GameState) => void;
  public onHudUpdate?: () => void;
  public onRadioAlert?: (msg: string) => void;

  private animFrameId: number | null = null;
  private lastTime: number = 0;
  private running: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Cannot get 2D context');
    this.ctx = context;
    this.renderer = new GameRenderer(this.ctx, canvas.width, canvas.height);

    this.loadProgress();
  }

  public getPlayerPowerLevel(): number {
    return (
      this.upgrades.waterCannon +
      this.upgrades.boots +
      this.upgrades.raincoat +
      (this.upgrades.maxLives - 1)
    );
  }

  public loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data: GameSaveData = JSON.parse(raw);
        this.currentLevel = data.level || 1;
        this.maxUnlockedLevel = data.maxUnlockedLevel || 1;
        this.coins = data.coins || 0;
        this.score = data.score || 0;
        this.selectedChar = data.selectedChar || 'killa';
        this.upgrades = {
          waterCannon: data.upgrades?.waterCannon || 1,
          boots: data.upgrades?.boots || 1,
          raincoat: data.upgrades?.raincoat || 1,
          backpack: data.upgrades?.backpack || 1,
          maxLives: data.upgrades?.maxLives || 1,
        };
        sound.enabled = data.soundEnabled !== false;
      }
    } catch {
      // Ignorar
    }
  }

  public saveProgress() {
    const data: GameSaveData = {
      level: this.currentLevel,
      maxUnlockedLevel: this.maxUnlockedLevel,
      coins: this.coins,
      score: this.score,
      selectedChar: this.selectedChar,
      upgrades: this.upgrades,
      soundEnabled: sound.enabled,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignorar
    }
  }

  public startLevel(lvl: number = this.currentLevel) {
    this.currentLevel = lvl;
    this.levelData = generateLevel(lvl);

    const charDef = CHARACTERS[this.selectedChar] || CHARACTERS.killa;
    this.lives = charDef.baseLives + (this.upgrades.maxLives - 1);

    this.player.x = 60;
    this.player.y = 380;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.ground = false;
    this.player.crouch = false;
    this.player.invuln = 60;
    this.player.canDoubleJump = this.upgrades.boots >= 3;

    this.cameraX = 0;
    this.projectiles = [];
    this.shockwaves = [];
    this.lightningHazards = [];
    this.particles = [];
    this.floatingTexts = [];
    this.screenShake = 0;

    if (this.levelData.isBossLevel && this.levelData.bossDef) {
      this.activeBoss = {
        def: this.levelData.bossDef,
        x: this.levelData.totalLength - 380,
        y: 280,
        w: 80,
        h: 70,
        hp: this.levelData.bossDef.maxHp,
        maxHp: this.levelData.bossDef.maxHp,
        phase: 1,
        vx: -1.5,
        vy: 0,
        state: 'idle',
        stateTimer: 60,
        attackTimer: 120,
        hitFlash: 0,
        defeatedAnim: 0,
        facing: -1,
      };

      const power = this.getPlayerPowerLevel();
      if (power < this.levelData.bossDef.requiredPowerLevel) {
        this.addFloatingText(
          '¡ALERTA! EQUIPO INSUFICIENTE PARA ESTE JEFE',
          this.player.x + 80,
          160,
          '#ef4444'
        );
        this.onRadioAlert?.(
          `¡Atención Brigadista! El ${this.levelData.bossDef.name} tiene armadura pesada. Necesitas Nivel de Poder ${this.levelData.bossDef.requiredPowerLevel} para derrotarlo. ¡Mejora tu equipo en el Taller!`
        );
      } else {
        this.onRadioAlert?.(
          `¡Tu brigadista está preparado (Poder Nv.${power})! Usa tu Motobomba [X] y esquiva sus ataques para vencerlo.`
        );
      }
    } else {
      this.activeBoss = null;
      if (this.currentLevel === 3) {
        this.addFloatingText('⚠️ ¡ALERTA! DIFICULTAD EXTREMA ACTIVADA ⚠️', 240, 150, '#ef4444');
        this.onRadioAlert?.('¡ALERTA ROJA! Desde este nivel los huaicos desatan monstruos que disparan lodo tóxico y nubes con rayos eléctricos. ¡Corre, salta y esquiva con máxima destreza!');
      } else if (this.currentLevel > 3 && this.currentLevel % 3 === 0) {
        this.addFloatingText(`⚡ PELIGRO EXTREMO: NIVEL ${this.currentLevel} ⚡`, 240, 150, '#f59e0b');
      }
    }

    this.state = 'PLAYING';
    this.onStateChange?.(this.state);
    this.onHudUpdate?.();
    this.saveProgress();
  }

  public setCharacter(id: CharacterId) {
    this.selectedChar = id;
    this.saveProgress();
    this.onHudUpdate?.();
  }

  public purchaseUpgrade(type: keyof Upgrades, cost: number): boolean {
    if (this.coins < cost) return false;
    if (this.upgrades[type] >= 5) return false;

    this.coins -= cost;
    this.upgrades[type] += 1;

    if (type === 'maxLives') {
      this.lives += 1;
    }

    sound.playUpgrade();
    this.saveProgress();
    this.onHudUpdate?.();
    return true;
  }

  public startLoop() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    const step = (now: number) => {
      const dt = Math.min((now - this.lastTime) / 1000, 0.05);
      this.lastTime = now;

      if (this.hitStop > 0) {
        this.hitStop--;
      } else {
        this.update(dt);
      }
      this.render();

      this.animFrameId = requestAnimationFrame(step);
    };
    this.animFrameId = requestAnimationFrame(step);
  }

  public stopLoop() {
    this.running = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  // --- Actualización de Simulación ---
  private update(dt: number) {
    if (this.state !== 'PLAYING' || !this.levelData) return;
    this.frame++;

    const charDef = CHARACTERS[this.selectedChar] || CHARACTERS.killa;
    const p = this.player;

    // Reducir temporizadores
    if (p.invuln > 0) p.invuln--;
    if (p.firing > 0) p.firing--;
    if (this.screenShake > 0) this.screenShake *= 0.9;
    if (p.coyoteTimer > 0) p.coyoteTimer -= dt;
    if (p.jumpBuffer > 0) p.jumpBuffer -= dt;

    // Control de Agachado / Esquivar
    p.crouch = this.keys.down && p.ground;

    // Velocidad horizontal
    const sprintBonus = (this.keys.sprint || p.sprinting) ? 1.6 : 1.0;
    const bootsSpeed = 1.0 + (this.upgrades.boots - 1) * 0.12;
    const maxSpeed = p.crouch ? 1.5 : charDef.baseSpeed * sprintBonus * bootsSpeed;
    const accel = p.ground ? 0.8 : 0.45;
    const friction = p.ground ? 0.78 : 0.94;

    if (!p.crouch) {
      if (this.keys.left) {
        p.vx -= accel;
        p.facing = -1;
      } else if (this.keys.right) {
        p.vx += accel;
        p.facing = 1;
      } else {
        p.vx *= friction;
      }
    } else {
      p.vx *= 0.88; // Deslizarse suavemente al agacharse
    }

    // Ráfagas de viento en mundos de tormenta/costa
    const weather = this.levelData.zone.weather;
    if ((weather === 'wind' || weather === 'storm') && !p.ground) {
      const windForce = weather === 'wind' ? -0.26 : -0.15;
      p.vx += windForce;
    }

    // Actualizar plataformas móviles oscilantes
    this.levelData.blocks.forEach((b: Block) => {
      if (b.moving) {
        const oldX = b.x;
        b.x = (b.startX ?? b.x) + Math.sin(this.frame * 0.032 * (b.moveSpeed || 1)) * (b.moveRange || 50);
        const deltaX = b.x - oldX;
        // Si el jugador está sobre esta plataforma, se desplaza junto a ella
        if (p.ground && p.x + p.w > b.x && p.x < b.x + b.w && Math.abs(p.y + p.h - b.y) <= 5) {
          p.x += deltaX;
        }
      }
    });

    p.vx = Math.max(-maxSpeed, Math.min(maxSpeed, p.vx));
    p.x += p.vx;

    // Bloqueo de límites de nivel
    p.x = Math.max(10, Math.min(this.levelData.totalLength - p.w - 10, p.x));

    // Colisión Horizontal con Bloques
    this.levelData.blocks.forEach((b: Block) => {
      if (b.type === 'barrier' || b.type === 'pipe' || b.type === 'brick' || b.type === 'question') {
        if (this.checkOverlap(p, b)) {
          if (p.vx > 0) {
            p.x = b.x - p.w;
            p.vx = 0;
          } else if (p.vx < 0) {
            p.x = b.x + b.w;
            p.vx = 0;
          }
        }
      }
    });

    // Gravedad
    const gravity = 0.58;
    p.vy = Math.min(13, p.vy + gravity);
    p.y += p.vy;

    const wasGround = p.ground;
    p.ground = false;

    // Colisión Vertical con Bloques
    this.levelData.blocks.forEach((b: Block) => {
      if (this.checkOverlap(p, b)) {
        // Aterrizar encima del bloque
        if (p.vy > 0 && p.y + p.h - p.vy <= b.y + 12) {
          p.y = b.y - p.h;
          p.vy = 0;
          p.ground = true;
          p.canDoubleJump = this.upgrades.boots >= 3;
        }
        // Golpear bloque desde abajo con la cabeza estilo Mario Bros
        else if (p.vy < 0 && p.y - p.vy >= b.y + b.h - 14) {
          p.y = b.y + b.h;
          p.vy = 1; // rebote hacia abajo

          if (b.type === 'question' && !b.empty) {
            b.empty = true;
            b.bounceY = 10;
            sound.playCoin();
            this.coins += 10;
            this.score += 200;
            this.addFloatingText('+10 🪙', b.x + 16, b.y - 12, '#facc15');
            this.createBurst(b.x + 16, b.y - 8, '#fef08a', 8);

            if (b.content === 'powerup') {
              this.lives = Math.min(6, this.lives + 1);
              this.addFloatingText('❤️ +1 VIDA', b.x + 16, b.y - 28, '#ef4444');
            }
            this.onHudUpdate?.();
          } else if (b.type === 'brick') {
            b.bounceY = 6;
            sound.playBlockBump();
            this.createBurst(b.x + 16, b.y + 16, '#b45309', 5);
          }
        }
      }
    });

    // Iniciar coyote time cuando se cae de una plataforma
    if (wasGround && !p.ground) {
      p.coyoteTimer = 0.1;
    }

    // Salto
    const bootsJump = charDef.baseJump + (this.upgrades.boots - 1) * 0.7;
    if (p.jumpBuffer > 0) {
      if (p.ground || p.coyoteTimer > 0) {
        p.vy = -bootsJump;
        p.ground = false;
        p.coyoteTimer = 0;
        p.jumpBuffer = 0;
        sound.playJump(false);
        this.createBurst(p.x + p.w / 2, p.y + p.h, '#e2e8f0', 4);
      } else if (p.canDoubleJump) {
        p.vy = -bootsJump * 0.92;
        p.canDoubleJump = false;
        p.jumpBuffer = 0;
        sound.playJump(true);
        this.addFloatingText('¡DOBLE SALTO!', p.x + p.w / 2, p.y - 10, '#38bdf8');
        this.createBurst(p.x + p.w / 2, p.y + p.h, '#38bdf8', 8);
      }
    }

    // Caída al vacío (río / zanja desbordada)
    if (p.y > 540) {
      this.hurtPlayer('¡Caíste en la corriente de agua turbia!');
      p.x = Math.max(40, p.x - 140);
      p.y = 380;
      p.vy = 0;
    }

    // Recoger monedas
    const magnetRadius = (this.selectedChar === 'tupac' ? 140 : 35) + this.upgrades.backpack * 25;
    this.levelData.coins.forEach((c: Coin) => {
      if (!c.taken) {
        const dist = Math.hypot(p.x + p.w / 2 - (c.x + c.w / 2), p.y + p.h / 2 - (c.y + c.h / 2));
        if (dist < magnetRadius) {
          // Atracción magnética
          c.x += (p.x + p.w / 2 - c.x) * 0.18;
          c.y += (p.y + p.h / 2 - c.y) * 0.18;
        }
        if (this.checkOverlap(p, c)) {
          c.taken = true;
          this.coins += 5;
          this.score += 50;
          sound.playCoin();
          this.addFloatingText('+5', c.x, c.y - 5, '#eab308');
          this.createBurst(c.x, c.y, '#facc15', 5);
          this.onHudUpdate?.();
        }
      }
    });

    // Recoger paquetes de ayuda
    this.levelData.supplies.forEach((s: SupplyPack) => {
      if (!s.taken && this.checkOverlap(p, s)) {
        s.taken = true;
        this.coins += 25;
        this.score += 500;
        sound.playCoin();
        this.addFloatingText('¡PAQUETE DE AYUDA! +25 🪙', s.x, s.y - 20, '#22c55e');
        this.createBurst(s.x + 15, s.y + 15, '#38bdf8', 12);
        this.onHudUpdate?.();
      }
    });

    // Interacción con Enemigos (Pisotón estilo Goomba / Daño)
    this.levelData.enemies.forEach((e: Enemy) => {
      if (e.dead) {
        if (e.squashAnim > 0) e.squashAnim--;
        return;
      }

      // Barriquito de Lodo
      if (e.type === 'mud_blob') {
        e.x += e.vx;
        // IA Extrema: El lodo salta si el jugador está cerca (Mundo 4+)
        if (e.canJump) {
          const distToPlayer = Math.abs(p.x - e.x);
          if (distToPlayer < 140 && e.vy === 0 && Math.sin(this.frame * 0.06 + e.animTimer) > 0.82) {
            e.vy = -7.6;
            this.createBurst(e.x + 16, e.y + e.h, '#78350f', 5);
          }
        }
        if (e.vy !== 0) {
          e.vy += 0.48;
          e.y += e.vy;
          if (e.y >= 430) {
            e.y = 430;
            e.vy = 0;
          }
        }

        if (Math.abs(e.x - e.startX) > e.range) {
          e.vx = -e.vx;
          e.facing = e.vx > 0 ? 1 : -1;
        }
      } else if (e.type === 'mosquito') {
        e.x += e.vx;
        // IA Extrema: Zancudo con fijación de objetivo (swoop hacia la altura del jugador)
        if (e.isAggro && Math.abs(p.x - e.x) < 250) {
          e.y += Math.sign((p.y - 10) - e.y) * 1.6;
        } else {
          e.y += Math.sin(this.frame * 0.08 + e.animTimer) * 1.8;
        }

        if (Math.abs(e.x - e.startX) > e.range) {
          e.vx = -e.vx;
          e.facing = e.vx > 0 ? 1 : -1;
        }
      } else if (e.type === 'rolling_boulder') {
        e.x += e.vx;
        if (e.x < -100 || e.x > this.levelData!.totalLength + 100) {
          e.x = e.startX;
        }
      } else if (e.type === 'mud_spitter') {
        // Monstruo de fango que se orienta hacia el jugador y dispara proyectiles de lodo
        const dx = (p.x + p.w / 2) - (e.x + e.w / 2);
        e.facing = dx > 0 ? 1 : -1;

        if (e.shootCooldown === undefined) {
          e.shootCooldown = 60 + Math.floor(Math.random() * 40);
        }
        e.shootCooldown--;

        // Si el jugador está dentro de rango (480px) y el cooldown termina: ¡ataca!
        if (Math.abs(dx) < 480 && e.shootCooldown <= 0) {
          e.shootCooldown = Math.max(45, 95 - this.currentLevel * 1.5);
          const shootSpeed = 4.2 + Math.min(2.5, this.currentLevel * 0.08);
          this.projectiles.push({
            id: Math.random(),
            x: e.facing > 0 ? e.x + e.w : e.x - 10,
            y: e.y + 4,
            w: 12,
            h: 12,
            vx: e.facing * shootSpeed,
            vy: -1.3,
            life: 130,
            fromPlayer: false,
            damage: 1,
            piercing: false,
          });
          sound.playBlockBump();
          this.createBurst(e.x + (e.facing > 0 ? e.w : 0), e.y + 8, '#78350f', 5);
        }
      } else if (e.type === 'storm_cloud') {
        // Nube de tormenta flotante: sobrevuela y deja caer rayos fulminantes
        e.x += e.vx;
        e.y += Math.sin(this.frame * 0.08 + e.animTimer) * 1.3;

        if (Math.abs(e.x - e.startX) > e.range) {
          e.vx = -e.vx;
          e.facing = e.vx > 0 ? 1 : -1;
        }

        if (e.shootCooldown === undefined) {
          e.shootCooldown = 50 + Math.floor(Math.random() * 40);
        }
        e.shootCooldown--;

        const playerBelow = Math.abs((p.x + p.w / 2) - (e.x + e.w / 2)) < 95 && p.y > e.y;
        if (playerBelow && e.shootCooldown <= 0) {
          e.shootCooldown = Math.max(40, 80 - this.currentLevel * 1.5);
          this.projectiles.push({
            id: Math.random(),
            x: e.x + e.w / 2 - 5,
            y: e.y + e.h,
            w: 10,
            h: 16,
            vx: 0,
            vy: 5.5 + Math.min(2.0, this.currentLevel * 0.06),
            life: 75,
            fromPlayer: false,
            damage: 1,
            piercing: false,
          });
          sound.playBossRoar();
          this.createBurst(e.x + e.w / 2, e.y + e.h, '#facc15', 7);
        }
      }

      // Colisión Jugador vs Enemigo
      if (this.checkOverlap(p, e)) {
        // PISOTÓN MARIO BROS (caer sobre el enemigo desde arriba)
        if (p.vy > 0 && p.y + p.h - p.vy <= e.y + 14 && e.type !== 'rolling_boulder') {
          if (e.hp && e.hp > 1) {
            // Enemigo acorazado: requiere 2 impactos
            e.hp--;
            p.vy = -bootsJump * 0.8;
            sound.playBlockBump();
            this.addFloatingText('¡CORAZA AGRIETADA!', e.x + 16, e.y - 12, '#facc15');
            this.createBurst(e.x + 16, e.y + 14, '#78350f', 8);
          } else {
            e.dead = true;
            e.squashAnim = 16;
            p.vy = -bootsJump * 0.85; // Rebote hacia arriba
            sound.playStomp();
            this.score += 300;
            this.addFloatingText('¡PISADO! +300', e.x + 16, e.y - 12, '#4ade80');
            this.createBurst(e.x + 16, e.y + 14, '#78350f', 10);
          }
          this.hitStop = 2; // Hitstop de 30ms para sensación de peso
          this.onHudUpdate?.();
        } else {
          // Daño al jugador
          this.hurtPlayer('¡Cuidado con los peligros del desborde!');
        }
      }
    });

    // Actualizar Proyectiles de Motobomba y Ataques Enemigos
    this.projectiles.forEach((proj) => {
      proj.x += proj.vx;
      proj.y += proj.vy;
      proj.life--;

      if (proj.fromPlayer) {
        // Colisión proyectil con enemigos
        this.levelData!.enemies.forEach((e: Enemy) => {
          if (!e.dead && this.checkOverlap(proj, e)) {
            if (e.hp && e.hp > 1) {
              e.hp--;
              proj.life = 0;
              sound.playBlockBump();
              this.addFloatingText('¡CORAZA ROTA!', e.x, e.y - 10, '#facc15');
            } else {
              e.dead = true;
              e.squashAnim = 12;
              proj.life = 0;
              sound.playStomp();
              this.score += 250;
              this.addFloatingText('¡DISUELTO!', e.x, e.y - 10, '#38bdf8');
              this.createBurst(e.x + 16, e.y + 14, '#38bdf8', 8);
            }
          }
        });

        // Colisión proyectil con Jefe
        if (this.activeBoss && this.activeBoss.state !== 'defeated' && this.checkOverlap(proj, this.activeBoss)) {
          proj.life = 0;
          this.damageBoss(proj.damage);
        }
      } else {
        // Ataque de enemigo / jefe hacia el jugador
        if (this.checkOverlap(proj, p)) {
          proj.life = 0;
          this.hurtPlayer('¡Impacto de ataque enemigo!');
        }
      }
    });
    this.projectiles = this.projectiles.filter((proj) => proj.life > 0);

    // Actualizar Ondas de Choque de Jefes
    this.shockwaves.forEach((sw) => {
      sw.x += sw.vx;
      sw.life--;
      // Si el jugador está en el suelo y choca con la onda
      if (this.checkOverlap(p, sw) && p.y + p.h >= sw.y - 4) {
        this.hurtPlayer('¡Onda de choque del aluvión! ¡Debes saltar!');
        sw.life = 0;
      }
    });
    this.shockwaves = this.shockwaves.filter((sw) => sw.life > 0);

    // Actualizar Rayos de Tormenta
    this.lightningHazards.forEach((lh) => {
      if (lh.telegraphTimer > 0) {
        lh.telegraphTimer--;
        if (lh.telegraphTimer <= 0) {
          lh.strikeTimer = 14;
          sound.playBossRoar();
          this.screenShake = 7;
        }
      } else if (lh.strikeTimer > 0) {
        lh.strikeTimer--;
        // Si el jugador está dentro de la columna del rayo fulminante
        if (Math.abs((p.x + p.w / 2) - lh.x) < 22) {
          this.hurtPlayer('¡Descarga eléctrica de la tormenta!');
        }
      }
    });
    this.lightningHazards = this.lightningHazards.filter((lh) => lh.telegraphTimer > 0 || lh.strikeTimer > 0);

    // En mundos de tormenta (Mundos 2, 6, 9, 10), generar rayos ambientales periódicos
    if ((this.levelData.zone.weather === 'storm' || this.levelData.isBossLevel) && this.frame % 170 === 0 && Math.random() > 0.45) {
      const strikeX = p.x + (Math.random() * 320 - 100);
      this.lightningHazards.push({
        id: Math.random(),
        x: strikeX,
        y: 0,
        telegraphTimer: 42,
        strikeTimer: 0,
        active: true,
      });
    }

    // Lógica del Gran Jefe (Si es nivel de jefe)
    if (this.activeBoss) {
      this.updateBoss(dt);
    }

    // Comprobar llegada al Refugio Comunitario / Meta
    if (!this.levelData.isBossLevel) {
      if (p.x >= this.levelData.shelterX - 30) {
        this.completeLevel();
      }
    } else if (this.activeBoss && this.activeBoss.state === 'defeated') {
      if (p.x >= this.levelData.shelterX - 30) {
        this.completeLevel();
      }
    }

    // Actualizar partículas y textos flotantes
    this.particles.forEach((pt) => {
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
    });
    this.particles = this.particles.filter((pt) => pt.life > 0);

    this.floatingTexts.forEach((ft) => {
      ft.y += ft.vy;
      ft.alpha -= 0.02;
    });
    this.floatingTexts = this.floatingTexts.filter((ft) => ft.alpha > 0);

    // Bouncing blocks settling
    this.levelData.blocks.forEach((b: Block) => {
      if (b.bounceY && b.bounceY > 0) {
        b.bounceY -= 1.5;
        if (b.bounceY < 0) b.bounceY = 0;
      }
    });

    // Centrado suave de cámara
    const targetCamX = p.x - this.canvas.width * 0.38;
    this.cameraX += (targetCamX - this.cameraX) * 0.12;
    this.cameraX = Math.max(0, Math.min(this.levelData.totalLength - this.canvas.width, this.cameraX));
  }

  // --- Lógica de Combate contra el Gran Jefe (Dificultad Extrema) ---
  private updateBoss(dt: number) {
    const boss = this.activeBoss;
    if (!boss || boss.state === 'defeated') return;

    boss.stateTimer--;
    boss.attackTimer--;
    if (boss.hitFlash > 0) boss.hitFlash--;

    const p = this.player;
    const hpRatio = boss.hp / boss.maxHp;

    // Fases extremas según porcentaje de vida
    if (hpRatio <= 0.3) {
      boss.phase = 3; // Frenesí Extremo
    } else if (hpRatio <= 0.65) {
      boss.phase = 2; // Enfurecido
    } else {
      boss.phase = 1;
    }

    const attackCooldown = boss.phase === 3 ? 75 : boss.phase === 2 ? 115 : 160;

    // Estados de ataque del jefe
    if (boss.state === 'idle') {
      const bossSpeed = (boss.phase === 3 ? 2.8 : boss.phase === 2 ? 2.1 : 1.4);
      boss.vx = boss.x > p.x ? -bossSpeed : bossSpeed;
      boss.x += boss.vx;
      boss.facing = boss.vx > 0 ? 1 : -1;

      if (boss.attackTimer <= 0) {
        if (Math.random() > 0.45) {
          boss.state = 'charging';
          boss.stateTimer = boss.phase === 3 ? 60 : 85;
          sound.playBossRoar();
          this.addFloatingText('¡EMBESTIDA VELOZ!', boss.x, boss.y - 30, '#ef4444');
        } else {
          boss.state = 'summoning';
          boss.stateTimer = boss.phase === 3 ? 80 : 100;
          sound.playBossRoar();
          this.addFloatingText('¡DESCARGA DE RAYOS Y HUAICO!', boss.x, boss.y - 30, '#facc15');

          // En fases 2 y 3: invocar relámpago apuntando hacia la posición del jugador
          if (boss.phase >= 2) {
            this.lightningHazards.push({
              id: Math.random(),
              x: p.x,
              y: 0,
              telegraphTimer: 38,
              strikeTimer: 0,
              active: true,
            });
          }
        }
        boss.attackTimer = attackCooldown;
      }
    } else if (boss.state === 'charging') {
      // Carga a alta velocidad
      const chargeSpeed = boss.phase === 3 ? 6.5 : boss.phase === 2 ? 5.4 : 4.6;
      boss.x += boss.facing * chargeSpeed;

      if (boss.x < 100 || boss.x > this.levelData!.totalLength - 180 || boss.stateTimer <= 0) {
        boss.state = 'vulnerable';
        boss.stateTimer = boss.phase === 3 ? 55 : 75;
        this.screenShake = 9;
        sound.playBossHit();
        this.addFloatingText('¡ATURDIDO! ¡ATACA AHORA!', boss.x, boss.y - 25, '#38bdf8');

        // AL ESTRELLARSE: Genera Ondas de Choque en el suelo que el jugador DEBE saltar
        if (boss.phase >= 2) {
          this.shockwaves.push({
            id: Math.random(),
            x: boss.x,
            y: 446,
            w: 24,
            h: 16,
            vx: -4.8,
            life: 80,
            damage: 1,
          });
          this.shockwaves.push({
            id: Math.random(),
            x: boss.x + boss.w,
            y: 446,
            w: 24,
            h: 16,
            vx: 4.8,
            life: 80,
            damage: 1,
          });
        }
      }
    } else if (boss.state === 'summoning') {
      const fireInterval = boss.phase === 3 ? 16 : 24;
      if (boss.stateTimer % fireInterval === 0) {
        this.projectiles.push({
          id: Math.random(),
          x: boss.x + (Math.random() * 60 - 30),
          y: boss.y + 35,
          w: 16,
          h: 16,
          vx: (p.x - boss.x) * 0.024,
          vy: 3.8,
          damage: 1,
          piercing: false,
          life: 95,
          fromPlayer: false,
        });
        sound.playBlockBump();
      }
      if (boss.stateTimer <= 0) {
        boss.state = 'idle';
      }
    } else if (boss.state === 'vulnerable') {
      if (boss.stateTimer <= 0) {
        boss.state = 'idle';
      }
    }

    // Colisión física Jefe vs Jugador
    if (this.checkOverlap(p, boss)) {
      if (boss.state === 'vulnerable' && p.vy > 0 && p.y + p.h - p.vy <= boss.y + 20) {
        p.vy = -12;
        this.damageBoss(3);
      } else {
        this.hurtPlayer('¡Golpe brutal del jefe de tempestad!');
      }
    }
  }

  // Daño al jefe y verificación de mejoras requeridas
  public damageBoss(baseDamage: number) {
    const boss = this.activeBoss;
    if (!boss || boss.state === 'defeated') return;

    const powerLevel = this.getPlayerPowerLevel();
    const cannonLevel = this.upgrades.waterCannon;
    const requiredPower = boss.def.requiredPowerLevel;
    const requiredArmorRating = boss.def.armorRating;

    // MECÁNICA CLAVE: Solo se puede ganar si mejoras a tu personaje
    if (cannonLevel < requiredArmorRating || powerLevel < requiredPower) {
      // Ataque rebotado por la armadura de tormenta
      boss.hitFlash = 4;
      sound.playBlockBump();
      this.addFloatingText('¡ARMADURA MUY DURA! MEJORA TU MOTOBOMBA', boss.x + boss.w / 2, boss.y - 20, '#f59e0b');
      this.screenShake = 3;

      // El jugador solo hace daño mínimo de 1 punto por esfuerzo heroico
      boss.hp -= 1;
    } else {
      // Daño completo gracias a las mejoras de la brigada
      const effectiveDamage = baseDamage + (cannonLevel - requiredArmorRating);
      boss.hp -= effectiveDamage;
      boss.hitFlash = 8;
      this.screenShake = 7;
      sound.playBossHit();
      this.addFloatingText(`¡IMPACTO CRÍTICO! -${effectiveDamage} HP`, boss.x + boss.w / 2, boss.y - 20, '#22c55e');
      this.createBurst(boss.x + boss.w / 2, boss.y + boss.h / 2, '#38bdf8', 14);
    }

    this.onHudUpdate?.();

    if (boss.hp <= 0) {
      boss.hp = 0;
      boss.state = 'defeated';
      sound.playVictory();
      this.score += 2500;
      this.coins += 100;
      this.addFloatingText('¡JEFE DE TEMPESTAD DERROTADO!', boss.x, boss.y - 40, '#facc15');
      this.createBurst(boss.x + boss.w / 2, boss.y + boss.h / 2, '#facc15', 30);
      this.onRadioAlert?.(
        `¡LO LOGRASTE! Gracias a las mejoras de tu brigadista, has neutralizado al ${boss.def.name}. ¡Dirígete al refugio seguro!`
      );
      this.saveProgress();
    }
  }

  // Disparar motobomba
  public shootWater() {
    if (this.state !== 'PLAYING') return;
    const p = this.player;
    if (p.firing > 0) return;

    p.firing = 15 - Math.min(10, this.upgrades.backpack * 2);
    sound.playWaterShoot();

    const cannonLevel = this.upgrades.waterCannon;
    const damage = cannonLevel;
    const charDef = CHARACTERS[this.selectedChar];
    const speed = (8.5 + cannonLevel * 1.2) * (charDef.id === 'inti' ? 1.35 : 1.0);

    this.projectiles.push({
      id: Math.random(),
      x: p.x + (p.facing > 0 ? p.w : -12),
      y: p.y + p.h * 0.45,
      w: 14 + cannonLevel * 2,
      h: 14 + cannonLevel * 2,
      vx: p.facing * speed,
      vy: 0,
      damage,
      piercing: cannonLevel >= 4,
      life: 55,
      fromPlayer: true,
    });

    this.createBurst(p.x + (p.facing > 0 ? p.w : 0), p.y + p.h * 0.45, '#bae6fd', 4);
  }

  public jump() {
    this.player.jumpBuffer = 0.12;
  }

  public hurtPlayer(reason: string) {
    const p = this.player;
    if (p.invuln > 0) return;

    // Escudo impermeable del chubasquero
    if (this.upgrades.raincoat >= 4 && Math.random() > 0.45) {
      p.invuln = 90;
      sound.playBlockBump();
      this.addFloatingText('¡ESCUDO IMPERMEABLE ACTIVO!', p.x, p.y - 20, '#38bdf8');
      return;
    }

    this.lives--;
    p.invuln = 110;
    this.screenShake = 8;
    sound.playHurt();
    this.addFloatingText('-1 ❤️', p.x + 10, p.y - 15, '#ef4444');
    this.onHudUpdate?.();

    if (this.lives <= 0) {
      this.state = 'GAME_OVER';
      sound.playGameOver();
      this.onStateChange?.(this.state);
    }
  }

  public completeLevel() {
    this.state = 'VICTORY';
    sound.playVictory();
    const reward = 30 + this.currentLevel * 5;
    this.coins += reward;
    this.score += 1000;

    if (this.currentLevel >= this.maxUnlockedLevel && this.maxUnlockedLevel < 100) {
      this.maxUnlockedLevel = this.currentLevel + 1;
    }

    this.saveProgress();
    this.onStateChange?.(this.state);
    this.onHudUpdate?.();
  }

  public advanceNextLevel() {
    if (this.currentLevel < 100) {
      this.startLevel(this.currentLevel + 1);
    } else {
      this.startLevel(1);
    }
  }

  // --- Renderizado Canvas ---
  private render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (!this.levelData) return;

    ctx.save();
    // Screen shake
    if (this.screenShake > 0.5) {
      const sx = (Math.random() - 0.5) * this.screenShake;
      const sy = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(sx, sy);
    }

    // Fondo Parallax
    this.renderer.renderBackground(
      this.cameraX,
      this.levelData.zone,
      this.frame,
      this.levelData.isBossLevel,
      this.activeBoss?.state === 'defeated'
    );

    // Trasladar al mundo con cámara
    ctx.save();
    ctx.translate(-Math.round(this.cameraX), 0);

    // Meta y asta de bandera
    this.renderer.renderShelterAndFlag(this.levelData.shelterX, 460, this.frame);

    // Bloques
    this.levelData.blocks.forEach((b: Block) => this.renderer.renderBlock(b, this.frame));

    // Monedas
    this.levelData.coins.forEach((c: Coin) => this.renderer.renderCoin(c, this.frame));

    // Paquetes
    this.levelData.supplies.forEach((s: SupplyPack) => this.renderer.renderSupplyPack(s, this.frame));

    // Enemigos
    this.levelData.enemies.forEach((e: Enemy) => this.renderer.renderEnemy(e, this.frame));

    // Ondas de choque de jefe
    this.renderer.renderShockwaves(this.shockwaves);

    // Peligros de rayos y descargas
    this.renderer.renderLightningHazards(this.lightningHazards);

    // Proyectiles
    this.renderer.renderProjectiles(this.projectiles);

    // Gran Jefe
    if (this.activeBoss) {
      this.renderer.renderBoss(this.activeBoss, this.getPlayerPowerLevel(), this.frame);
    }

    // Jugador
    this.renderer.renderPlayer(
      this.player,
      this.selectedChar,
      this.upgrades,
      this.frame
    );

    // Partículas
    this.renderer.renderParticles(this.particles);

    // Textos flotantes
    this.renderer.renderFloatingTexts(this.floatingTexts);

    ctx.restore();
    ctx.restore();
  }

  private checkOverlap(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }): boolean {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  private createBurst(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6 - 2,
        color,
        size: 3 + Math.random() * 3,
        life: 20 + Math.floor(Math.random() * 15),
        maxLife: 35,
      });
    }
  }

  public addFloatingText(text: string, x: number, y: number, color: string = '#ffffff') {
    this.floatingTexts.push({
      id: Math.random(),
      text,
      x,
      y,
      vy: -1.2,
      alpha: 1.0,
      color,
    });
  }
}
