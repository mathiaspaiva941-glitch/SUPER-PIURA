import { Block, BossDef, CharacterDef, Coin, Enemy, LevelData, SupplyPack, WorldZone } from './types';

export const CHARACTERS: Record<string, CharacterDef> = {
  killa: {
    id: 'killa',
    name: 'Killa',
    role: 'Brigadista Líder',
    desc: 'Ágil y balanceada. Especialista en evacuación rápida y saltos precisos.',
    color: '#0284c7', // azul brigada
    accent: '#38bdf8',
    capColor: '#eab308', // gorra amarilla brigadista
    skinColor: '#d4976a',
    hairColor: '#261b18',
    baseJump: 12.2,
    baseSpeed: 4.8,
    baseLives: 3,
    specialTrait: 'Salto ágil y aceleración rápida',
  },
  inti: {
    id: 'inti',
    name: 'Inti',
    role: 'Ingeniero Hidráulico',
    desc: 'Potencia de agua aumentada. Sus disparos de motobomba tienen +35% alcance.',
    color: '#ea580c', // naranja obrero
    accent: '#fb923c',
    capColor: '#15803d',
    skinColor: '#c68456',
    hairColor: '#1e1b18',
    baseJump: 11.6,
    baseSpeed: 4.5,
    baseLives: 3,
    specialTrait: 'Mayor potencia de Motobomba',
  },
  sami: {
    id: 'sami',
    name: 'Sami',
    role: 'Médica de Brigada',
    desc: 'Mayor resistencia física. Comienza cada nivel con 4 vidas en vez de 3.',
    color: '#059669', // verde salud
    accent: '#34d399',
    capColor: '#f8fafc',
    skinColor: '#d99f75',
    hairColor: '#2d1f18',
    baseJump: 11.8,
    baseSpeed: 4.6,
    baseLives: 4,
    specialTrait: '+1 Corazón extra de inicio',
  },
  tupac: {
    id: 'tupac',
    name: 'Túpac',
    role: 'Técnico Rescatista',
    desc: 'Equipado con detector magnético para recoger monedas y suministros desde lejos.',
    color: '#7c3aed', // púrpura técnico
    accent: '#a78bfa',
    capColor: '#fbbf24',
    skinColor: '#c07d50',
    hairColor: '#1c1917',
    baseJump: 11.7,
    baseSpeed: 4.7,
    baseLives: 3,
    specialTrait: 'Imán de monedas integrado',
  },
};

export const WORLD_ZONES: WorldZone[] = [
  {
    world: 1,
    name: 'Piura Colonial',
    region: 'Puente Bolognesi y Malecón Eguiguren',
    skyTop: '#38bdf8',
    skyBottom: '#bae6fd',
    hillColor: '#78716c',
    groundColor: '#78350f',
    grassColor: '#65a30d',
    weather: 'drizzle',
  },
  {
    world: 2,
    name: 'Catacaos de Tejas',
    region: 'Calles de Filigrana y Alfarería',
    skyTop: '#60a5fa',
    skyBottom: '#fed7aa',
    hillColor: '#a8a29e',
    groundColor: '#9a3412',
    grassColor: '#84cc16',
    weather: 'rain',
  },
  {
    world: 3,
    name: 'Bajo Piura Inundado',
    region: 'Cura Mori y Pedregal Grande',
    skyTop: '#64748b',
    skyBottom: '#cbd5e1',
    hillColor: '#475569',
    groundColor: '#57534e',
    grassColor: '#4d7c0f',
    weather: 'flood',
  },
  {
    world: 4,
    name: 'Valle del Chira',
    region: 'Sullana y Canales de Regadío',
    skyTop: '#0284c7',
    skyBottom: '#93c5fd',
    hillColor: '#525252',
    groundColor: '#854d0e',
    grassColor: '#16a34a',
    weather: 'rain',
  },
  {
    world: 5,
    name: 'Puerto de Paita',
    region: 'Acantilados y Oleajes Anómalos',
    skyTop: '#1e3a8a',
    skyBottom: '#93c5fd',
    hillColor: '#334155',
    groundColor: '#713f12',
    grassColor: '#65a30d',
    weather: 'wind',
  },
  {
    world: 6,
    name: 'Costa de Talara',
    region: 'Playas y Quebradas Pariñas',
    skyTop: '#0369a1',
    skyBottom: '#bfdbfe',
    hillColor: '#3f3f46',
    groundColor: '#a16207',
    grassColor: '#84cc16',
    weather: 'storm',
  },
  {
    world: 7,
    name: 'Desierto de Sechura',
    region: 'Dunas y la Nueva Laguna La Niña',
    skyTop: '#0ea5e9',
    skyBottom: '#fef08a',
    hillColor: '#ca8a04',
    groundColor: '#d97706',
    grassColor: '#a3e635',
    weather: 'flood',
  },
  {
    world: 8,
    name: 'Bosque Seco de Algarrobos',
    region: 'Tambogrande y Valle de San Lorenzo',
    skyTop: '#047857',
    skyBottom: '#a7f3d0',
    hillColor: '#292524',
    groundColor: '#713f12',
    grassColor: '#15803d',
    weather: 'rain',
  },
  {
    world: 9,
    name: 'Quebradas de Morropón',
    region: 'Chulucanas y Quebrada San Francisco',
    skyTop: '#334155',
    skyBottom: '#94a3b8',
    hillColor: '#1e293b',
    groundColor: '#451a03',
    grassColor: '#3f6212',
    weather: 'storm',
  },
  {
    world: 10,
    name: 'Alta Serranía y Océano',
    region: 'Huancabamba y Ciclón Supremo',
    skyTop: '#0f172a',
    skyBottom: '#475569',
    hillColor: '#020617',
    groundColor: '#3b0764',
    grassColor: '#1e3a8a',
    weather: 'storm',
  },
];

export const BOSS_ROSTER: Record<number, BossDef> = {
  10: {
    world: 1,
    name: 'Monstruo del Huaico',
    title: 'Titán de Lodo y Escombros',
    maxHp: 12,
    armorRating: 1,
    requiredPowerLevel: 2,
    color: '#854d0e',
    eyeColor: '#ef4444',
    description: 'Una masa gigante de barro y piedras acumulada por el desborde del río.',
    tacticalAdvice: 'Mejora tu Motobomba al Nivel 2 en la Tienda para disolver su coraza de lodo rápidamente.',
  },
  20: {
    world: 2,
    name: 'Cúmulo Tempestad',
    title: 'Nube Negra de Alta Densidad',
    maxHp: 16,
    armorRating: 2,
    requiredPowerLevel: 3,
    color: '#334155',
    eyeColor: '#facc15',
    description: 'Nube cumulonimbus con descargas eléctricas y vientos de 70 km/h.',
    tacticalAdvice: 'Necesitas Botas Nivel 2 o 3 para esquivar los rayos y saltar por encima de sus ráfagas.',
  },
  30: {
    world: 3,
    name: 'El Gran Caimán Pluvial',
    title: 'Monstruo de la Crecida Fluvial',
    maxHp: 20,
    armorRating: 2,
    requiredPowerLevel: 4,
    color: '#14532d',
    eyeColor: '#fbbf24',
    description: 'Criatura ancestral que nada en el cauce desbordado del río Piura.',
    tacticalAdvice: 'Mejora tu Chubasquero Blindado para absorber las mordidas y aumentar tus vidas.',
  },
  40: {
    world: 4,
    name: 'Rey Zancudo Dengue',
    title: 'Señor del Estanque Estancado',
    maxHp: 24,
    armorRating: 3,
    requiredPowerLevel: 5,
    color: '#581c87',
    eyeColor: '#a855f7',
    description: 'Insecto gigante alimentado por las aguas estancadas del valle.',
    tacticalAdvice: 'Dispara tu Motobomba a Presión (Nivel 3+) para derribarlo en pleno vuelo.',
  },
  50: {
    world: 5,
    name: 'El Maremoto Marino',
    title: 'Espíritu de las Aguas Cálidas',
    maxHp: 28,
    armorRating: 3,
    requiredPowerLevel: 6,
    color: '#1e3a8a',
    eyeColor: '#38bdf8',
    description: 'Ola gigantesca impulsada por la anomalía térmica del Océano Pacífico.',
    tacticalAdvice: 'El Doble Salto de las Botas Nivel 3 te permitirá saltar por encima de su ola gigante.',
  },
  60: {
    world: 6,
    name: 'Coloso de Aluvión Pariñas',
    title: 'Gólem de Rocas y Brecha',
    maxHp: 32,
    armorRating: 4,
    requiredPowerLevel: 7,
    color: '#713f12',
    eyeColor: '#f97316',
    description: 'Construido a partir de sedimentos y restos arrastrados por la quebrada.',
    tacticalAdvice: 'Tu Motobomba requiere Nivel 4 de Potencia para quebrar su armadura de roca.',
  },
  70: {
    world: 7,
    name: 'Remolino del Desierto',
    title: 'Torbellino de Arena y Lluvia',
    maxHp: 36,
    armorRating: 4,
    requiredPowerLevel: 8,
    color: '#b45309',
    eyeColor: '#fef08a',
    description: 'Vórtice que combina la arena de Sechura con las lluvias torrenciales.',
    tacticalAdvice: 'Adquiere el Chubasquero Nivel 4 para resistir los vendavales que te empujan.',
  },
  80: {
    world: 8,
    name: 'El Tronco Viviente del Huaico',
    title: 'Protector Corrupto del Algarrobal',
    maxHp: 40,
    armorRating: 4,
    requiredPowerLevel: 8,
    color: '#451a03',
    eyeColor: '#ef4444',
    description: 'Árbol centenario arrastrado por la fuerza del aluvión.',
    tacticalAdvice: 'Mantén distancia y ataca con ráfagas continuas de agua a alta presión.',
  },
  90: {
    world: 9,
    name: 'Ciclón Furioso Yaku',
    title: 'La Vaguada Ecuatorial del Milenio',
    maxHp: 46,
    armorRating: 5,
    requiredPowerLevel: 9,
    color: '#0f766e',
    eyeColor: '#2dd4bf',
    description: 'El histórico ciclón que afectó la costa peruana en su máxima furia.',
    tacticalAdvice: 'Necesitas casi todas las mejoras maximizadas para soportar sus tres fases de ataque.',
  },
  100: {
    world: 10,
    name: 'Fenómeno Supremo El Niño Global',
    title: 'La Gran Anomalía Climática',
    maxHp: 55,
    armorRating: 5,
    requiredPowerLevel: 10,
    color: '#701a75',
    eyeColor: '#ec4899',
    description: 'La manifestación climática definitiva. Solo una brigada totalmente preparada puede triunfar.',
    tacticalAdvice: '¡REQUISITO TOTAL! Debes tener Motobomba Nivel 5, Botas Nivel 5 y Chubasquero Nivel 5 para salvar al Perú.',
  },
};

export function generateLevel(levelNumber: number): LevelData {
  const world = Math.min(10, Math.max(1, Math.ceil(levelNumber / 10)));
  const subLevel = ((levelNumber - 1) % 10) + 1;
  const isBossLevel = subLevel === 10;
  const zone = WORLD_ZONES[world - 1];
  const bossDef = isBossLevel ? BOSS_ROSTER[levelNumber] || null : null;

  const blocks: Block[] = [];
  const coins: Coin[] = [];
  const supplies: SupplyPack[] = [];
  const enemies: Enemy[] = [];

  // Longitud y dificultad extrema progresiva
  const totalLength = isBossLevel ? 1500 : 2700 + (world * 130) + (subLevel * 25);
  const groundY = 460;

  if (isBossLevel) {
    // Arena de Jefe de Alta Dificultad
    // Suelo con fosas en los bordes en mundos avanzados
    const bossPlatformW = Math.max(100, 160 - world * 6);
    blocks.push({
      x: 0,
      y: groundY,
      w: totalLength,
      h: 80,
      type: 'ground',
      color: zone.groundColor,
      topColor: zone.grassColor,
    });

    // Muros laterales
    blocks.push({ x: 0, y: 0, w: 40, h: 540, type: 'barrier' });
    blocks.push({ x: totalLength - 40, y: 0, w: 40, h: 540, type: 'barrier' });

    // Plataformas elevadas para esquivar embestidas y ondas de choque
    const platformY1 = 370;
    const platformY2 = 280;
    const platformY3 = 195;

    // Plataformas más estrechas a mayor nivel para exigir salto de precisión
    blocks.push({ x: 160, y: platformY1, w: bossPlatformW, h: 18, type: 'platform' });
    blocks.push({
      x: 400,
      y: platformY2,
      w: bossPlatformW + 15,
      h: 18,
      type: 'platform',
      moving: world >= 4,
      moveRange: 60,
      moveSpeed: 1.2,
      startX: 400,
      startY: platformY2,
    });
    blocks.push({ x: 670, y: platformY1, w: bossPlatformW, h: 18, type: 'platform' });
    blocks.push({
      x: 930,
      y: platformY2,
      w: bossPlatformW + 15,
      h: 18,
      type: 'platform',
      moving: world >= 6,
      moveRange: 70,
      moveSpeed: 1.4,
      startX: 930,
      startY: platformY2,
    });
    blocks.push({ x: 1190, y: platformY1, w: bossPlatformW - 10, h: 18, type: 'platform' });

    // Bloques `[?]` de emergencia para recargar
    blocks.push({ x: 200, y: platformY1 - 90, w: 32, h: 32, type: 'question', content: 'powerup' });
    blocks.push({ x: 470, y: platformY2 - 90, w: 32, h: 32, type: 'question', content: 'powerup' });
    blocks.push({ x: 730, y: platformY1 - 90, w: 32, h: 32, type: 'question', content: 'powerup' });
    blocks.push({ x: 1000, y: platformY2 - 90, w: 32, h: 32, type: 'question', content: 'powerup' });

    // Monedas de emergencia
    for (let c = 0; c < 14; c++) {
      coins.push({
        x: 180 + c * 85,
        y: c % 2 === 0 ? platformY1 - 30 : platformY2 - 30,
        w: 20,
        h: 20,
        taken: false,
        value: 10,
        animFrame: c * 2,
      });
    }

    return {
      world,
      subLevel,
      totalLength,
      zone,
      isBossLevel: true,
      bossDef,
      blocks,
      coins,
      supplies,
      enemies,
      shelterX: totalLength - 120,
    };
  }

  // --- Nivel regular estilo Super Mario Bros Extremo ---
  // A partir del Nivel 3 la dificultad sube a nivel extremo: zanjas profundas, huaicos y plataformas veloces
  let curX = 0;
  const isExtreme = levelNumber >= 3;
  const gapWidth = isExtreme
    ? Math.min(195, 105 + world * 8 + Math.floor(subLevel * 2))
    : 75;
  const minSegmentW = isExtreme
    ? Math.max(75, 180 - world * 11)
    : 260;

  while (curX < totalLength - 340) {
    const segmentWidth = minSegmentW + Math.floor(Math.random() * (isExtreme ? 90 : 130));
    blocks.push({
      x: curX,
      y: groundY,
      w: segmentWidth,
      h: 80,
      type: 'ground',
      color: zone.groundColor,
      topColor: zone.grassColor,
    });

    curX += segmentWidth;

    // Fosos de agua y huaicos entre plataformas
    if (curX < totalLength - 480) {
      // Si la zanja es muy ancha (>= 110px), colocamos plataformas móviles o rocas de paso
      if (gapWidth >= 110) {
        const gapMidX = curX + gapWidth / 2;
        const platW = Math.max(42, 80 - world * 4);

        if (isExtreme && Math.random() > 0.25) {
          // Plataforma móvil oscilante sobre el abismo de agua con velocidad aumentada
          blocks.push({
            x: gapMidX - platW / 2,
            y: groundY - 65,
            w: platW,
            h: 16,
            type: 'platform',
            moving: true,
            moveRange: 45 + world * 5,
            moveSpeed: 1.2 + world * 0.18,
            startX: gapMidX - platW / 2,
            startY: groundY - 65,
          });
        } else {
          // Peldaño fijo estrecho de emergencia
          blocks.push({
            x: gapMidX - platW / 2,
            y: groundY - 60,
            w: platW,
            h: 16,
            type: 'platform',
          });
        }
      }

      curX += gapWidth;
    }
  }

  // Plataforma final sólida del refugio
  blocks.push({
    x: totalLength - 400,
    y: groundY,
    w: 400,
    h: 80,
    type: 'ground',
    color: zone.groundColor,
    topColor: zone.grassColor,
  });

  // Tuberías de drenaje pluvial que bloquean o sirven de apoyo
  const pipeCount = 3 + Math.floor(world * 0.6);
  for (let p = 0; p < pipeCount; p++) {
    const pipeX = 420 + p * 390 + ((levelNumber * 33) % 90);
    const pipeH = 45 + (p % 3) * 24 + (world * 3);
    blocks.push({
      x: pipeX,
      y: groundY - pipeH,
      w: 48,
      h: pipeH,
      type: 'pipe',
      pipeTop: true,
    });

    if (p % 2 === 0) {
      coins.push({
        x: pipeX + 14,
        y: groundY - pipeH - 32,
        w: 20,
        h: 20,
        taken: false,
        value: 10,
        animFrame: p,
      });
    }
  }

  // Filas de bloques `[?]` y ladrillos al estilo Mario
  const blockClusterCount = 5 + world;
  for (let b = 0; b < blockClusterCount; b++) {
    const startBX = 280 + b * 360 + (b % 2) * 40;
    const blockY = groundY - 110 - (b % 3) * 45;
    const clusterSize = 3 + (b % 3);

    for (let i = 0; i < clusterSize; i++) {
      const bx = startBX + i * 36;
      const isQuestion = i === 1 || (clusterSize > 3 && i === 3);

      blocks.push({
        x: bx,
        y: blockY,
        w: 32,
        h: 32,
        type: isQuestion ? 'question' : 'brick',
        content: isQuestion ? (Math.random() > 0.4 ? 'coin' : 'powerup') : 'none',
      });

      if (!isQuestion && Math.random() > 0.35) {
        coins.push({
          x: bx + 6,
          y: blockY - 32,
          w: 20,
          h: 20,
          taken: false,
          value: 10,
          animFrame: i,
        });
      }
    }
  }

  // Plataformas flotantes adicionales
  for (let pl = 0; pl < 5 + world; pl++) {
    const px = 320 + pl * 320 + (pl % 4) * 25;
    const py = groundY - 80 - (pl % 3) * 40;
    const platW = Math.max(50, 95 - world * 4);
    blocks.push({
      x: px,
      y: py,
      w: platW,
      h: 16,
      type: 'platform',
      moving: world >= 4 && pl % 2 === 0,
      moveRange: 50,
      moveSpeed: 1.1 + (world * 0.1),
      startX: px,
      startY: py,
    });
  }

  // 3 Paquetes de ayuda humanitaria
  const packPositions = [
    Math.floor(totalLength * 0.25),
    Math.floor(totalLength * 0.55),
    Math.floor(totalLength * 0.82),
  ];
  packPositions.forEach((px) => {
    supplies.push({
      x: px,
      y: groundY - 45,
      w: 30,
      h: 30,
      taken: false,
    });
  });

  // Monedas
  const coinTotal = 25 + world * 3;
  for (let c = 0; c < coinTotal; c++) {
    const cx = 150 + c * 80 + (c % 5) * 12;
    const cy = groundY - 30 - ((c % 4) === 0 ? 90 : 0);
    coins.push({
      x: cx,
      y: cy,
      w: 20,
      h: 20,
      taken: false,
      value: 10,
      animFrame: c * 2,
    });
  }

  // Generación de Enemigos con Dificultad Extrema Progresiva
  let enemyId = 1;
  // A partir de Nivel 3: DIFICULTAD RECONTRA EXTREMA con monstruos que atacan a distancia y en picada
  const enemyCount = isExtreme
    ? Math.min(36, 14 + Math.floor(world * 2.8) + subLevel * 2)
    : 6; // Niveles 1 y 2 introductorios

  for (let e = 0; e < enemyCount; e++) {
    const ex = 320 + e * 160 + ((e * 47) % 70);

    if (!isExtreme) {
      // Niveles 1 y 2: Barriquito y mosquito básico para aprender los controles
      if (e % 2 === 0) {
        enemies.push({
          id: enemyId++,
          type: 'mud_blob',
          x: ex,
          y: groundY - 30,
          w: 32,
          h: 28,
          vx: -1.1,
          vy: 0,
          startX: ex,
          range: 110,
          dead: false,
          squashAnim: 0,
          facing: -1,
          animTimer: e * 5,
        });
      } else {
        enemies.push({
          id: enemyId++,
          type: 'mosquito',
          x: ex,
          y: groundY - 100,
          w: 30,
          h: 24,
          vx: -1.3,
          vy: 0,
          startX: ex,
          range: 130,
          dead: false,
          squashAnim: 0,
          facing: -1,
          animTimer: e * 8,
          isAggro: false,
        });
      }
      continue;
    }

    // --- A PARTIR DEL NIVEL 3: VARIEDAD DE MONSTRUOS AGRESIVOS QUE ATACAN ---
    const roll = Math.random();

    if (roll < 0.25) {
      // 1. ESCUPIDOR DE LODO (Dispara bolas de huaico tóxico al jugador)
      enemies.push({
        id: enemyId++,
        type: 'mud_spitter',
        x: ex,
        y: groundY - 30,
        w: 32,
        h: 28,
        vx: 0,
        vy: 0,
        startX: ex,
        range: 0,
        dead: false,
        squashAnim: 0,
        facing: -1,
        animTimer: e * 4,
        shootCooldown: 40 + (e % 3) * 30,
        hp: world >= 4 ? 2 : 1,
      });
    } else if (roll < 0.46) {
      // 2. NUBE DE TORMENTA ELÉCTRICA (Patrulla en el cielo y fulmina con rayos verticales)
      enemies.push({
        id: enemyId++,
        type: 'storm_cloud',
        x: ex,
        y: groundY - 145 - ((e % 3) * 24),
        w: 34,
        h: 24,
        vx: (e % 2 === 0 ? 1 : -1) * (1.5 + world * 0.16),
        vy: 0,
        startX: ex,
        range: 140 + world * 18,
        dead: false,
        squashAnim: 0,
        facing: -1,
        animTimer: e * 6,
        shootCooldown: 45 + (e % 4) * 25,
      });
    } else if (roll < 0.68) {
      // 3. ZANCUDO FEROZ (Picada directa de alta velocidad hacia el jugador)
      enemies.push({
        id: enemyId++,
        type: 'mosquito',
        x: ex,
        y: groundY - 105 - ((e % 3) * 30),
        w: 30,
        h: 24,
        vx: -1.9 - (world * 0.22),
        vy: 0,
        startX: ex,
        range: 180 + world * 16,
        dead: false,
        squashAnim: 0,
        facing: -1,
        animTimer: e * 7,
        isAggro: true,
      });
    } else if (roll < 0.84) {
      // 4. BARRIQUITO DE LODO ACORAZADO Y SALTARÍN
      enemies.push({
        id: enemyId++,
        type: 'mud_blob',
        x: ex,
        y: groundY - 30,
        w: 32,
        h: 28,
        vx: -1.4 - (world * 0.25),
        vy: 0,
        startX: ex,
        range: 130 + world * 12,
        dead: false,
        squashAnim: 0,
        facing: -1,
        animTimer: e * 5,
        canJump: true,
        hp: world >= 2 ? 2 : 1,
      });
    } else {
      // 5. PIEDRA DE HUAICO RODANTE ULTRARRÁPIDA
      enemies.push({
        id: enemyId++,
        type: 'rolling_boulder',
        x: ex + 40,
        y: groundY - 26,
        w: 28,
        h: 26,
        vx: -3.0 - (world * 0.35),
        vy: 0,
        startX: ex + 40,
        range: 280 + world * 20,
        dead: false,
        squashAnim: 0,
        facing: -1,
        animTimer: 0,
      });

      // Si el mundo es >= 4, generar doble roca en tándem para esquive ajustado
      if (world >= 4 && Math.random() > 0.4) {
        enemies.push({
          id: enemyId++,
          type: 'rolling_boulder',
          x: ex + 105,
          y: groundY - 26,
          w: 28,
          h: 26,
          vx: -3.0 - (world * 0.35),
          vy: 0,
          startX: ex + 105,
          range: 280 + world * 20,
          dead: false,
          squashAnim: 0,
          facing: -1,
          animTimer: 0,
        });
      }
    }
  }

  return {
    world,
    subLevel,
    totalLength,
    zone,
    isBossLevel: false,
    bossDef: null,
    blocks,
    coins,
    supplies,
    enemies,
    shelterX: totalLength - 160,
  };
}
