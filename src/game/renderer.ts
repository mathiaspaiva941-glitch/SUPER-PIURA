import { CHARACTERS } from './levels';
import {
  ActiveBoss,
  Block,
  CharacterId,
  Coin,
  Enemy,
  FloatingText,
  LightningHazard,
  Particle,
  Projectile,
  Shockwave,
  SupplyPack,
  WorldZone,
} from './types';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  public bgImage: HTMLImageElement;
  public bgLoaded: boolean = false;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;

    this.bgImage = new Image();
    this.bgImage.src = '/assets/aistudio/image_32265f24.png';
    this.bgImage.onload = () => {
      this.bgLoaded = true;
    };
  }

  public setDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  // --- Background with Parallax ---
  public renderBackground(
    cameraX: number,
    zone: WorldZone,
    frame: number,
    isBoss: boolean,
    bossDefeated: boolean
  ) {
    const ctx = this.ctx;
    const W = this.width;
    const H = this.height;

    // Si la imagen de fondo de Piura Inundada está cargada, la renderizamos en parallax
    if (this.bgLoaded && this.bgImage.naturalWidth > 0) {
      const imgRatio = this.bgImage.naturalWidth / this.bgImage.naturalHeight;
      const bgW = H * imgRatio;
      const parallaxSpeed = 0.32;
      const shift = ((cameraX * parallaxSpeed) % bgW + bgW) % bgW;
      const startX = -shift;

      // Dibujar imagen repetida horizontalmente para scroll infinito
      ctx.drawImage(this.bgImage, startX, 0, bgW, H);
      if (startX + bgW < W) {
        ctx.drawImage(this.bgImage, startX + bgW, 0, bgW, H);
      }
      if (startX > 0) {
        ctx.drawImage(this.bgImage, startX - bgW, 0, bgW, H);
      }
      if (startX + bgW * 2 < W) {
        ctx.drawImage(this.bgImage, startX + bgW * 2, 0, bgW, H);
      }

      // Capa de atmósfera según la zona o jefe
      if (isBoss && !bossDefeated) {
        const stormGrad = ctx.createLinearGradient(0, 0, 0, H);
        stormGrad.addColorStop(0, 'rgba(15, 23, 42, 0.75)');
        stormGrad.addColorStop(0.5, 'rgba(49, 46, 129, 0.45)');
        stormGrad.addColorStop(1, 'rgba(30, 27, 75, 0.55)');
        ctx.fillStyle = stormGrad;
        ctx.fillRect(0, 0, W, H);
      } else {
        // Tinte suave ambiental para armonizar con el nivel
        ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
        ctx.fillRect(0, 0, W, H);
      }
    } else {
      // Fallback vectorial si la imagen aún no ha terminado de cargar
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      if (isBoss && !bossDefeated) {
        skyGrad.addColorStop(0, '#0f172a');
        skyGrad.addColorStop(0.6, '#1e1b4b');
        skyGrad.addColorStop(1, '#312e81');
      } else {
        skyGrad.addColorStop(0, zone.skyTop);
        skyGrad.addColorStop(0.7, zone.skyBottom);
        skyGrad.addColorStop(1, '#e2e8f0');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      // Sol o Luna de Tormenta
      if (!isBoss) {
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(W - 140, 75, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fffbeb';
        ctx.beginPath();
        ctx.arc(W - 142, 73, 23, 0, Math.PI * 2);
        ctx.fill();
      }

      // Nubes lejanas en parallax
      ctx.fillStyle = isBoss ? 'rgba(51, 65, 85, 0.75)' : 'rgba(255, 255, 255, 0.65)';
      for (let i = 0; i < 6; i++) {
        const cx = (((i * 260 - cameraX * 0.12) % (W + 200)) + W + 200) % (W + 200) - 100;
        const cy = 40 + (i % 3) * 25;
        this.drawPuffyCloud(cx, cy, 1.1 + (i % 2) * 0.3);
      }

      // Cerros / Dunas de la costa peruana (Capa 1 lejana, 0.2x parallax)
      ctx.fillStyle = zone.hillColor;
      ctx.beginPath();
      ctx.moveTo(0, 380);
      for (let x = 0; x <= W; x += 60) {
        const hillY = 270 + Math.sin((x + cameraX * 0.18) * 0.007) * 45;
        ctx.lineTo(x, hillY);
      }
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.fill();

      // Siluetas de algarrobos y palmeras del norte (Capa 2 intermedia, 0.4x parallax)
      const treeBaseY = 390;
      for (let t = 0; t < 8; t++) {
        const tx = (((t * 220 - cameraX * 0.35) % (W + 250)) + W + 250) % (W + 250) - 80;
        this.drawAlgarroboTree(tx, treeBaseY - 50);
      }

      // Casas coloniales norteñas con techos de tejas y arcos
      for (let h = 0; h < 5; h++) {
        const hx = (((h * 340 - cameraX * 0.45) % (W + 350)) + W + 350) % (W + 350) - 120;
        this.drawPiuraColonialHouse(hx, 360);
      }
    }

    // Efecto de lluvia / tormenta
    if (zone.weather === 'rain' || zone.weather === 'storm' || zone.weather === 'flood' || isBoss) {
      ctx.save();
      ctx.strokeStyle = isBoss ? 'rgba(224, 242, 254, 0.6)' : 'rgba(186, 230, 253, 0.45)';
      ctx.lineWidth = 1.5;
      const dropCount = isBoss ? 75 : 45;
      for (let d = 0; d < dropCount; d++) {
        const dx = (d * 37 + (frame * 14)) % W;
        const dy = (d * 53 + (frame * 18)) % H;
        ctx.beginPath();
        ctx.moveTo(dx, dy);
        ctx.lineTo(dx - 5, dy + 18);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  private drawPuffyCloud(x: number, y: number, s: number) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(x, y + 10 * s, 18 * s, 0, Math.PI * 2);
    ctx.arc(x + 20 * s, y, 22 * s, 0, Math.PI * 2);
    ctx.arc(x + 46 * s, y + 6 * s, 19 * s, 0, Math.PI * 2);
    ctx.arc(x + 64 * s, y + 12 * s, 15 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawAlgarroboTree(x: number, y: number) {
    const ctx = this.ctx;
    // Tronco retorcido de algarrobo
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 80);
    ctx.quadraticCurveTo(x + 18, y + 40, x + 24, y + 25);
    ctx.lineTo(x + 29, y + 27);
    ctx.quadraticCurveTo(x + 22, y + 45, x + 18, y + 80);
    ctx.fill();

    // Copa de ramas extendidas
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.ellipse(x + 25, y + 20, 36, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#166534';
    ctx.beginPath();
    ctx.ellipse(x + 35, y + 23, 22, 14, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawPiuraColonialHouse(x: number, y: number) {
    const ctx = this.ctx;
    // Pared de adobe
    ctx.fillStyle = '#d4b996';
    ctx.fillRect(x, y, 90, 75);
    // Techo de tejas rojas tradicional
    ctx.fillStyle = '#9a3412';
    ctx.beginPath();
    ctx.moveTo(x - 8, y);
    ctx.lineTo(x + 45, y - 22);
    ctx.lineTo(x + 98, y);
    ctx.closePath();
    ctx.fill();
    // Arco colonial y puerta
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 32, y + 32, 26, 43);
    ctx.beginPath();
    ctx.arc(x + 45, y + 32, 13, Math.PI, 0);
    ctx.fill();
    // Ventana con reja
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x + 10, y + 22, 14, 16);
    ctx.fillRect(x + 66, y + 22, 14, 16);
  }

  // --- Bloques Mario Bros ---
  public renderBlock(b: Block, frame: number) {
    const ctx = this.ctx;
    const bounceOffset = b.bounceY || 0;
    const y = b.y - bounceOffset;

    if (b.type === 'ground') {
      // Suelo con césped arriba y tierra estilo Mario Bros
      ctx.fillStyle = b.color || '#78350f';
      ctx.fillRect(b.x, y, b.w, b.h);

      // Franja de hierba/borde superior
      ctx.fillStyle = b.topColor || '#65a30d';
      ctx.fillRect(b.x, y, b.w, 14);

      // Borde brillante superior
      ctx.fillStyle = '#a3e635';
      ctx.fillRect(b.x, y, b.w, 3);

      // Textura de ladrillo de tierra
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      for (let tx = 0; tx < b.w; tx += 32) {
        ctx.fillRect(b.x + tx, y + 14, 1, b.h - 14);
        ctx.fillRect(b.x + tx + 16, y + 32, 1, b.h - 32);
      }
      ctx.fillRect(b.x, y + 32, b.w, 1);
      ctx.fillRect(b.x, y + 54, b.w, 1);
    } else if (b.type === 'brick') {
      // Bloque de ladrillo tradicional de Mario Bros
      ctx.fillStyle = '#b45309';
      ctx.fillRect(b.x, y, b.w, b.h);

      // Bordes 3D retro
      ctx.fillStyle = '#f59e0b'; // Luz superior e izquierda
      ctx.fillRect(b.x, y, b.w, 3);
      ctx.fillRect(b.x, y, 3, b.h);
      ctx.fillStyle = '#78350f'; // Sombra inferior y derecha
      ctx.fillRect(b.x, y + b.h - 3, b.w, 3);
      ctx.fillRect(b.x + b.w - 3, y, 3, b.h);

      // Grietas de ladrillo
      ctx.fillStyle = '#451a03';
      ctx.fillRect(b.x + 3, y + 15, b.w - 6, 2);
      ctx.fillRect(b.x + 15, y + 3, 2, 12);
      ctx.fillRect(b.x + 8, y + 17, 2, 12);
      ctx.fillRect(b.x + 22, y + 17, 2, 12);
    } else if (b.type === 'question') {
      // Bloque de interrogación `[?]` de Mario
      if (b.empty) {
        // Bloque gastado marrón / metal
        ctx.fillStyle = '#78716c';
        ctx.fillRect(b.x, y, b.w, b.h);
        ctx.fillStyle = '#a8a29e';
        ctx.fillRect(b.x, y, b.w, 2);
        ctx.fillRect(b.x, y, 2, b.h);
        ctx.fillStyle = '#44403c';
        ctx.fillRect(b.x, y + b.h - 2, b.w, 2);
        ctx.fillRect(b.x + b.w - 2, y, 2, b.h);
        // Remaches
        ctx.fillStyle = '#292524';
        ctx.fillRect(b.x + 4, y + 4, 3, 3);
        ctx.fillRect(b.x + b.w - 7, y + 4, 3, 3);
        ctx.fillRect(b.x + 4, y + b.h - 7, 3, 3);
        ctx.fillRect(b.x + b.w - 7, y + b.h - 7, 3, 3);
      } else {
        // Bloque brillante dorado con signo `?`
        const pulse = Math.sin(frame * 0.1) * 15;
        ctx.fillStyle = '#eab308';
        ctx.fillRect(b.x, y, b.w, b.h);

        // Bisel brillante
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(b.x, y, b.w, 3);
        ctx.fillRect(b.x, y, 3, b.h);
        ctx.fillStyle = '#a16207';
        ctx.fillRect(b.x, y + b.h - 3, b.w, 3);
        ctx.fillRect(b.x + b.w - 3, y, 2, b.h);

        // Remaches esquinas
        ctx.fillStyle = '#713f12';
        ctx.fillRect(b.x + 3, y + 3, 2, 2);
        ctx.fillRect(b.x + b.w - 5, y + 3, 2, 2);
        ctx.fillRect(b.x + 3, y + b.h - 5, 2, 2);
        ctx.fillRect(b.x + b.w - 5, y + b.h - 5, 2, 2);

        // Símbolo `?` pixelado
        ctx.fillStyle = '#713f12';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', b.x + b.w / 2 + 1, y + b.h / 2 + 1);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('?', b.x + b.w / 2, y + b.h / 2);
      }
    } else if (b.type === 'pipe') {
      // Tubería de evacuación pluvial (Mario Warp Pipe)
      const pipeGreen = '#16a34a';
      const pipeLight = '#4ade80';
      const pipeDark = '#14532d';

      // Cuerpo de la tubería
      ctx.fillStyle = pipeGreen;
      ctx.fillRect(b.x + 3, y + 16, b.w - 6, b.h - 16);

      // Brillo del tubo
      ctx.fillStyle = pipeLight;
      ctx.fillRect(b.x + 7, y + 16, 6, b.h - 16);
      ctx.fillStyle = pipeDark;
      ctx.fillRect(b.x + b.w - 9, y + 16, 5, b.h - 16);

      // Borde / Boca de la tubería (arriba)
      ctx.fillStyle = pipeGreen;
      ctx.fillRect(b.x, y, b.w, 18);
      ctx.fillStyle = pipeLight;
      ctx.fillRect(b.x, y, b.w, 3);
      ctx.fillRect(b.x + 4, y, 7, 18);
      ctx.fillStyle = pipeDark;
      ctx.fillRect(b.x, y + 15, b.w, 3);
      ctx.fillRect(b.x + b.w - 6, y, 6, 18);
      // Rejilla de evacuación pluvial
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(b.x + 12, y + 5, b.w - 24, 8);
    } else if (b.type === 'platform') {
      // Plataforma flotante de emergencia
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(b.x, y, b.w, b.h);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(b.x, y, b.w, 3);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(b.x, y + b.h - 3, b.w, 3);
      // Rayas de advertencia industrial
      ctx.fillStyle = '#78350f';
      for (let s = 0; s < b.w; s += 16) {
        ctx.fillRect(b.x + s, y + 3, 6, b.h - 6);
      }
    }
  }

  // --- Monedas y Coleccionables ---
  public renderCoin(c: Coin, frame: number) {
    if (c.taken) return;
    const ctx = this.ctx;
    const anim = Math.sin((frame + c.animFrame) * 0.15);
    const scaleX = Math.abs(anim);

    ctx.save();
    ctx.translate(c.x + c.w / 2, c.y + c.h / 2);
    ctx.scale(Math.max(0.2, scaleX), 1);

    // Moneda de Sol de Oro
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#a16207';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Centro brillante
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // --- Paquetes de Ayuda Humanitaria ---
  public renderSupplyPack(p: SupplyPack, frame: number) {
    if (p.taken) return;
    const ctx = this.ctx;
    const bob = Math.sin(frame * 0.1) * 3;
    const y = p.y + bob;

    // Caja de ayuda con Cruz Roja / Azul
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(p.x, y, p.w, p.h);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.strokeRect(p.x, y, p.w, p.h);

    // Cruz de emergencia
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(p.x + 11, y + 5, 8, 20);
    ctx.fillRect(p.x + 5, y + 11, 20, 8);

    // Aura de suministro
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(p.x - 3, y - 3, p.w + 6, p.h + 6);
  }

  // --- Enemigos ---
  public renderEnemy(e: Enemy, frame: number) {
    if (e.dead && e.squashAnim <= 0) return;
    const ctx = this.ctx;

    if (e.type === 'mud_blob') {
      // Barriquito de Lodo (Goomba del Norte)
      const squashScaleY = e.dead ? Math.max(0.15, e.squashAnim / 15) : 1;
      const squashScaleX = e.dead ? 1.35 : 1;

      ctx.save();
      ctx.translate(e.x + e.w / 2, e.y + e.h);
      ctx.scale(squashScaleX, squashScaleY);

      // Cuerpo de lodo marrón redondeado
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.ellipse(0, -14, 15, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pies que caminan (si está vivo)
      if (!e.dead) {
        const step = Math.sin(frame * 0.25 + e.animTimer) * 4;
        ctx.fillStyle = '#451a03';
        ctx.fillRect(-14 + step, -5, 10, 5);
        ctx.fillRect(4 - step, -5, 10, 5);

        // Ojos de Goomba que miran al jugador
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-8, -19, 5, 8);
        ctx.fillRect(3, -19, 5, 8);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-7, -17, 3, 5);
        ctx.fillRect(4, -17, 3, 5);

        // Cejas amenazantes
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.moveTo(-11, -21);
        ctx.lineTo(-2, -18);
        ctx.lineTo(2, -18);
        ctx.lineTo(11, -21);
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        // Ojos de X cuando está aplastado
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-8, -16);
        ctx.lineTo(-4, -12);
        ctx.moveTo(-4, -16);
        ctx.lineTo(-8, -12);
        ctx.moveTo(4, -16);
        ctx.lineTo(8, -12);
        ctx.moveTo(8, -16);
        ctx.lineTo(4, -12);
        ctx.stroke();
      }

      ctx.restore();
    } else if (e.type === 'mosquito') {
      // Zancudo de la fiebre (Koopa Paratroopa alado)
      if (e.dead) return;
      const wingFlap = Math.sin(frame * 0.6 + e.animTimer) * 12;

      ctx.save();
      ctx.translate(e.x + e.w / 2, e.y + e.h / 2);

      // Alas translúcidas batiendo
      ctx.fillStyle = 'rgba(224, 242, 254, 0.75)';
      ctx.beginPath();
      ctx.ellipse(-6, -10 + wingFlap * 0.3, 10, 5, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(6, -10 - wingFlap * 0.3, 10, 5, 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Cuerpo estilizado de insecto
      ctx.fillStyle = '#581c87';
      ctx.beginPath();
      ctx.ellipse(0, 0, 7, 10, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Ojos brillantes morados/rojos
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-3, -7, 3, 3);
      ctx.fillRect(1, -7, 3, 3);

      // Trompa/Aguijón
      ctx.strokeStyle = '#3b0764';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(e.facing * 10, 2);
      ctx.stroke();

      ctx.restore();
    } else if (e.type === 'rolling_boulder') {
      // Piedra de Huaico rodante
      if (e.dead) return;
      const rot = frame * 0.12;

      ctx.save();
      ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
      ctx.rotate(rot);

      ctx.fillStyle = '#57534e';
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#292524';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Grietas en la roca rodante
      ctx.strokeStyle = '#78716c';
      ctx.beginPath();
      ctx.moveTo(-6, -6);
      ctx.lineTo(2, 0);
      ctx.lineTo(7, 5);
      ctx.stroke();

      ctx.restore();
    } else if (e.type === 'mud_spitter') {
      // Escupidor de Lodo (Monstruo de fango que dispara proyectiles de huaico)
      if (e.dead && e.squashAnim <= 0) return;
      ctx.save();
      ctx.translate(e.x + e.w / 2, e.y + e.h);

      const squash = e.dead ? Math.max(0.2, e.squashAnim / 16) : 1;
      ctx.scale(e.dead ? 1.3 : 1, squash);

      const puff = Math.sin(frame * 0.25) * 2;
      // Cuerpo de fango viscoso
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.ellipse(0, -15 + puff, 16, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Vientre ponzoñoso
      ctx.fillStyle = '#854d0e';
      ctx.beginPath();
      ctx.ellipse(0, -11 + puff, 11, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hocico disparador
      ctx.fillStyle = '#713f12';
      ctx.beginPath();
      ctx.ellipse(e.facing * 11, -17 + puff, 7, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      // Garganta oscura
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(e.facing * 13, -17 + puff, 4, 0, Math.PI * 2);
      ctx.fill();

      // Ojos saltones amenazantes
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(-5, -25 + puff, 5, 0, Math.PI * 2);
      ctx.arc(4, -25 + puff, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-6 + e.facing, -26 + puff, 3, 3);
      ctx.fillRect(3 + e.facing, -26 + puff, 3, 3);

      // Patas de barro en la base
      ctx.fillStyle = '#292524';
      ctx.fillRect(-15, -4, 9, 4);
      ctx.fillRect(6, -4, 9, 4);

      ctx.restore();
    } else if (e.type === 'storm_cloud') {
      // Nube de Tormenta Eléctrica (Monstruo volador que ataca con rayos directos hacia abajo)
      if (e.dead) return;
      ctx.save();
      ctx.translate(e.x + e.w / 2, e.y + e.h / 2);

      const bob = Math.sin(frame * 0.15 + e.animTimer) * 4;

      // Nube oscura amenazante
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(-10, -4 + bob, 12, 0, Math.PI * 2);
      ctx.arc(8, -6 + bob, 14, 0, Math.PI * 2);
      ctx.arc(-2, -12 + bob, 11, 0, Math.PI * 2);
      ctx.arc(14, -1 + bob, 10, 0, Math.PI * 2);
      ctx.arc(-15, 1 + bob, 9, 0, Math.PI * 2);
      ctx.fill();

      // Borde electrizado cambiante
      ctx.strokeStyle = frame % 6 < 3 ? '#facc15' : '#a855f7';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Ojos eléctricos rasgados
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-6, -5 + bob, 4, 3);
      ctx.fillRect(4, -5 + bob, 4, 3);

      // Chispas eléctricas colgantes
      if (frame % 8 < 5) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-2, 10 + bob);
        ctx.lineTo(3, 16 + bob);
        ctx.lineTo(-1, 21 + bob);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  // --- Jugador (Mario Bros Style Brigadista) ---
  public renderPlayer(
    p: {
      x: number;
      y: number;
      w: number;
      h: number;
      vx: number;
      vy: number;
      ground: boolean;
      crouch: boolean;
      facing: 1 | -1;
      invuln: number;
      sprinting: boolean;
      firing: number;
    },
    charId: CharacterId,
    upgrades: { boots: number; waterCannon: number; raincoat: number },
    frame: number
  ) {
    if (p.invuln > 0 && Math.floor(frame / 4) % 2 === 0) {
      return; // Efecto de parpadeo de invulnerabilidad
    }

    const charDef = CHARACTERS[charId] || CHARACTERS.killa;
    const ctx = this.ctx;
    const x = p.x;
    const y = p.y;
    const moving = Math.abs(p.vx) > 0.4;
    const runFrame = moving ? Math.sin(frame * (p.sprinting ? 0.45 : 0.28)) : 0;

    ctx.save();
    ctx.translate(x + p.w / 2, y + p.h);
    ctx.scale(p.facing, 1);

    // Trail de velocidad si está corriendo con botas mejoradas
    if (p.sprinting && upgrades.boots >= 2) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.fillRect(-18, -35, 12, 30);
    }

    if (p.crouch) {
      // Pose de Agachado / Esquivar (Mario Crouch)
      // Botas
      ctx.fillStyle = '#451a03';
      ctx.fillRect(-10, -8, 20, 8);

      // Traje doblado
      ctx.fillStyle = upgrades.raincoat >= 3 ? '#eab308' : charDef.color;
      ctx.fillRect(-9, -20, 18, 13);

      // Cabeza y gorra agachada
      ctx.fillStyle = charDef.skinColor;
      ctx.fillRect(-7, -26, 14, 8);
      ctx.fillStyle = charDef.capColor;
      ctx.fillRect(-9, -30, 19, 5);
      ctx.fillRect(-2, -31, 13, 3);
    } else if (!p.ground) {
      // Pose de Salto Clásico de Mario Bros (un brazo arriba, piernas flexionadas)
      // Piernas en salto
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-8, -14, 7, 10);
      ctx.fillRect(1, -12, 7, 7);

      // Botas de salto
      ctx.fillStyle = upgrades.boots >= 3 ? '#0284c7' : '#451a03';
      ctx.fillRect(-10, -6, 9, 6);
      ctx.fillRect(1, -7, 9, 6);

      // Torso / Overol de Brigada
      ctx.fillStyle = upgrades.raincoat >= 3 ? '#eab308' : charDef.color;
      ctx.fillRect(-8, -28, 16, 15);

      // Chaleco reflectante de rescate
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-6, -26, 12, 4);

      // Brazo levantado al saltar (puño hacia arriba golpeando bloques!)
      ctx.fillStyle = charDef.skinColor;
      ctx.fillRect(4, -38, 7, 12);
      ctx.fillStyle = '#f8fafc'; // Guante blanco clásico
      ctx.fillRect(4, -42, 8, 6);

      // Cabeza
      ctx.fillStyle = charDef.skinColor;
      ctx.fillRect(-6, -37, 12, 10);

      // Ojo mirando al frente/arriba
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(1, -34, 3, 3);

      // Gorra de brigadista con visera hacia adelante
      ctx.fillStyle = charDef.capColor;
      ctx.fillRect(-8, -42, 16, 6);
      ctx.fillRect(-1, -43, 12, 3); // visera
    } else {
      // Pose de Caminar / Correr estilo Mario
      const legL = runFrame * 5;
      const legR = -runFrame * 5;

      // Piernas
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-7 + legL, -14, 6, 10);
      ctx.fillRect(1 + legR, -14, 6, 10);

      // Botas
      ctx.fillStyle = upgrades.boots >= 3 ? '#0284c7' : '#451a03';
      ctx.fillRect(-9 + legL, -5, 9, 5);
      ctx.fillRect(0 + legR, -5, 9, 5);

      // Torso / Chaleco
      ctx.fillStyle = upgrades.raincoat >= 3 ? '#eab308' : charDef.color;
      ctx.fillRect(-8, -28, 16, 15);

      // Cinta reflectante
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-7, -25, 14, 3);
      ctx.fillRect(-7, -19, 14, 3);

      // Brazos que oscilan
      ctx.fillStyle = charDef.skinColor;
      ctx.fillRect(-9 - legR * 0.6, -26, 5, 10);
      ctx.fillRect(5 + legL * 0.6, -26, 5, 10);

      // Cabeza
      ctx.fillStyle = charDef.skinColor;
      ctx.fillRect(-6, -37, 12, 10);

      // Ojo y mejilla
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(1, -34, 3, 3);

      // Gorra de Brigada
      ctx.fillStyle = charDef.capColor;
      ctx.fillRect(-8, -42, 16, 6);
      ctx.fillRect(-1, -43, 12, 3); // visera
    }

    // Motobomba de agua portada en mano/hombro
    if (upgrades.waterCannon > 0) {
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(4, -25, 11, 6);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(12, -26, 5, 8); // boquilla
    }

    // Escudo impermeable activo si el chubasquero está muy mejorado
    if (upgrades.raincoat >= 2) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -20, 24, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  // --- Gran Jefe de Tempestad (Cada 10 Niveles) ---
  public renderBoss(
    boss: ActiveBoss,
    playerPowerLevel: number,
    frame: number
  ) {
    const ctx = this.ctx;
    const def = boss.def;
    const x = boss.x;
    const y = boss.y;
    const isWeak = playerPowerLevel >= def.requiredPowerLevel;

    ctx.save();
    ctx.translate(x + boss.w / 2, y + boss.h / 2);

    // Animación de respiración/flotación de la tormenta
    const hover = Math.sin(frame * 0.08) * 8;
    ctx.translate(0, hover);

    // Aura de advertencia de ataque si está cargando
    if (boss.state === 'charging' || boss.state === 'summoning') {
      const pulse = Math.sin(frame * 0.3) * 12;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 70 + pulse, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Escudo de blindaje pesado si el jugador no ha mejorado su personaje
    if (!isWeak) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, 65, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Cuerpo principal del Jefe (Monstruo de Tormenta / Huaico)
    if (boss.hitFlash > 0) {
      ctx.fillStyle = '#ffffff'; // Flash blanco de impacto
    } else {
      ctx.fillStyle = def.color;
    }

    // Forma masiva de nube/roca de aluvión
    ctx.beginPath();
    ctx.arc(0, 5, 42, 0, Math.PI * 2);
    ctx.arc(-30, -10, 30, 0, Math.PI * 2);
    ctx.arc(30, -10, 30, 0, Math.PI * 2);
    ctx.arc(0, -28, 28, 0, Math.PI * 2);
    ctx.fill();

    // Detalles oscuros de lodo y viento
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.arc(-15, 12, 18, 0, Math.PI * 2);
    ctx.arc(18, 8, 16, 0, Math.PI * 2);
    ctx.fill();

    // Ojos imponentes de la tormenta
    ctx.fillStyle = def.eyeColor;
    const eyeAnim = Math.sin(frame * 0.1) * 2;
    ctx.fillRect(-22, -18, 12, 10 + eyeAnim);
    ctx.fillRect(10, -18, 12, 10 + eyeAnim);

    // Pupilas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-18, -15, 5, 5);
    ctx.fillRect(14, -15, 5, 5);

    // Boca amenazante de remolino
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.ellipse(0, 10, 18, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Relámpagos si es jefe de tormenta
    if (def.world === 2 || def.world === 6 || def.world === 9 || def.world === 10) {
      if (Math.random() > 0.7) {
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-35, 15);
        ctx.lineTo(-45, 35);
        ctx.lineTo(-38, 42);
        ctx.lineTo(-50, 65);
        ctx.stroke();
      }
    }

    // Barra de vida encima del jefe
    const hpPercent = Math.max(0, boss.hp / boss.maxHp);
    const barW = 100;
    const barH = 10;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-barW / 2, -65, barW, barH);
    ctx.fillStyle = hpPercent > 0.5 ? '#22c55e' : hpPercent > 0.25 ? '#eab308' : '#ef4444';
    ctx.fillRect(-barW / 2 + 1, -64, (barW - 2) * hpPercent, barH - 2);

    // Indicador táctico si está blindado
    if (!isWeak) {
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('🛡️ BLINDADO: MEJORA REQUERIDA', 0, -72);
    } else {
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`⚡ VULNERABLE · NV.${playerPowerLevel}`, 0, -72);
    }

    ctx.restore();
  }

  // --- Meta / Refugio Comunitario & Asta de Bandera (Mario Flagpole) ---
  public renderShelterAndFlag(shelterX: number, groundY: number, frame: number) {
    const ctx = this.ctx;

    // Asta de bandera estilo Mario Bros
    const poleX = shelterX - 80;
    const poleH = 200;
    const poleTopY = groundY - poleH;

    // Base del asta
    ctx.fillStyle = '#64748b';
    ctx.fillRect(poleX - 6, groundY - 14, 18, 14);

    // Mástil verde/dorado
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(poleX, poleTopY, 6, poleH);
    ctx.fillStyle = '#86efac';
    ctx.fillRect(poleX + 1, poleTopY, 2, poleH);

    // Bola dorada superior
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(poleX + 3, poleTopY - 4, 7, 0, Math.PI * 2);
    ctx.fill();

    // Bandera Peruana ondeando (Rojo - Blanco - Rojo)
    const wave = Math.sin(frame * 0.15) * 4;
    ctx.fillStyle = '#dc2626'; // Rojo
    ctx.fillRect(poleX + 6, poleTopY + 10 + wave, 12, 24);
    ctx.fillStyle = '#ffffff'; // Blanco
    ctx.fillRect(poleX + 18, poleTopY + 10 + wave, 12, 24);
    ctx.fillStyle = '#dc2626'; // Rojo
    ctx.fillRect(poleX + 30, poleTopY + 10 + wave, 12, 24);

    // Refugio de Rescate Comunitario estilo Mario Castle
    const sW = 120;
    const sH = 110;
    const sY = groundY - sH;

    // Muro de ladrillos de adobe
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(shelterX, sY, sW, sH);

    // Techo de tejas peruanas
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.moveTo(shelterX - 8, sY);
    ctx.lineTo(shelterX + sW / 2, sY - 26);
    ctx.lineTo(shelterX + sW + 8, sY);
    ctx.closePath();
    ctx.fill();

    // Letrero de Refugio
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(shelterX + 14, sY + 8, sW - 28, 16);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('REFUGIO SEGURO', shelterX + sW / 2, sY + 20);

    // Puerta de madera abierta
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(shelterX + 44, groundY - 55, 32, 55);
    ctx.beginPath();
    ctx.arc(shelterX + 60, groundY - 55, 16, Math.PI, 0);
    ctx.fill();
  }

  // --- Proyectiles de Motobomba y Ataques Enemigos ---
  public renderProjectiles(projectiles: Projectile[]) {
    const ctx = this.ctx;
    projectiles.forEach((p) => {
      if (p.fromPlayer) {
        // Chorro de agua a presión
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(p.x + p.w / 2, p.y + p.h / 2, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e0f2fe';
        ctx.beginPath();
        ctx.arc(p.x + p.w / 2 - 2, p.y + p.h / 2 - 2, p.w / 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.vy > 3 && Math.abs(p.vx) < 1) {
        // Chispa / Rayo fulminante caído de Nube de Tormenta
        ctx.save();
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(p.x + p.w / 2, p.y);
        ctx.lineTo(p.x + p.w / 2 + 3, p.y + p.h * 0.5);
        ctx.lineTo(p.x + p.w / 2 - 2, p.y + p.h);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Resplandor eléctrico
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.beginPath();
        ctx.arc(p.x + p.w / 2, p.y + p.h / 2, p.w, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        // Bola de fango arrojada por Escupidor de Lodo o Roca de Jefe
        ctx.save();
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(p.x + p.w / 2, p.y + p.h / 2, p.w / 2, 0, Math.PI * 2);
        ctx.fill();

        // Centro caliente y tóxico
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(p.x + p.w / 2, p.y + p.h / 2, p.w / 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Gotas de fango volantes
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(p.x + p.w / 2 - (p.vx > 0 ? 6 : -6), p.y + p.h / 2 + 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });
  }

  public renderParticles(particles: Particle[]) {
    const ctx = this.ctx;
    particles.forEach((p) => {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    ctx.globalAlpha = 1;
  }

  public renderFloatingTexts(texts: FloatingText[]) {
    const ctx = this.ctx;
    texts.forEach((t) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, t.alpha);
      ctx.fillStyle = t.color;
      ctx.font = t.font || 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    });
  }

  // --- Ondas de Choque (Shockwaves de Jefes) ---
  public renderShockwaves(shockwaves: Shockwave[]) {
    const ctx = this.ctx;
    shockwaves.forEach((sw) => {
      ctx.save();
      // Ola de lodo y energía rápida
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(sw.x, sw.y, sw.w, sw.h);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(sw.x, sw.y - 4, sw.w, 4);
      // Destello frontal
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sw.vx > 0 ? sw.x + sw.w - 3 : sw.x, sw.y - 3, 3, sw.h + 3);
      ctx.restore();
    });
  }

  // --- Peligros de Rayos (Lightning Hazards) ---
  public renderLightningHazards(hazards: LightningHazard[]) {
    const ctx = this.ctx;
    hazards.forEach((h) => {
      if (h.telegraphTimer > 0) {
        // Columna de advertencia roja parpadeante en el suelo
        const alpha = (Math.sin(h.telegraphTimer * 0.4) + 1) * 0.25 + 0.15;
        ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
        ctx.fillRect(h.x - 18, 0, 36, 540);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(h.x - 18, 480, 36, 60);
      } else if (h.strikeTimer > 0) {
        // Rayo fulminante activo que daña al jugador
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(h.x - 8, 0, 16, 540);
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(h.x, 0);
        ctx.lineTo(h.x - 10, 150);
        ctx.lineTo(h.x + 10, 310);
        ctx.lineTo(h.x, 500);
        ctx.stroke();
      }
    });
  }
}
