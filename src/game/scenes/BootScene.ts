import * as Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Generate procedural vector textures
    this.createBottleTextures();
    this.createHeroTexture();
    this.createCitySkylineTexture();
    this.createCloudTexture();
    this.createMoonTexture();
    this.createParticleTextures();
  }

  create() {
    // Vector textures and assets initialized. Ready for start session.
  }

  /**
   * Generates high-res contour bottle silhouette and inner liquid textures
   */
  private createBottleTextures() {
    // 1. Bottle Outline & Glass Body (Width: 260, Height: 700)
    const bottleCanvas = this.textures.createCanvas('bottle_glass', 300, 750);
    if (!bottleCanvas) return;
    const ctx = bottleCanvas.getContext();
    const w = 300;
    const h = 750;

    // Draw Coca-Cola Contour Bottle Shape
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2, h / 2);

    // Draw Bottle Silhouette Path
    this.traceBottlePath(ctx, 1.0);

    // Glass fill gradient (subtle translucent tint)
    const glassGrad = ctx.createLinearGradient(-100, 0, 100, 0);
    glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    glassGrad.addColorStop(0.2, 'rgba(230, 240, 245, 0.15)');
    glassGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
    glassGrad.addColorStop(0.8, 'rgba(230, 240, 245, 0.15)');
    glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0.4)');
    ctx.fillStyle = glassGrad;
    ctx.fill();

    // Bottle outline border
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#1E252B';
    ctx.stroke();

    // Red Bottle Cap at the top
    ctx.beginPath();
    ctx.fillStyle = '#F40000';
    ctx.roundRect(-24, -345, 48, 30, [6, 6, 2, 2]);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#8B0000';
    ctx.stroke();

    // Vertical ribbed grip grooves on cap
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    for (let x = -18; x <= 18; x += 6) {
      ctx.beginPath();
      ctx.moveTo(x, -343);
      ctx.lineTo(x, -317);
      ctx.stroke();
    }

    // Glass specular highlight reflection along the left edge
    ctx.beginPath();
    ctx.moveTo(-60, -220);
    ctx.quadraticCurveTo(-75, 0, -65, 260);
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.stroke();

    ctx.restore();
    bottleCanvas.refresh();

    // 2. Bottle Liquid Texture (Rich Coca-Cola dark amber/red liquid)
    const liquidCanvas = this.textures.createCanvas('bottle_liquid', 300, 750);
    if (!liquidCanvas) return;
    const lCtx = liquidCanvas.getContext();
    lCtx.clearRect(0, 0, w, h);
    lCtx.save();
    lCtx.translate(w / 2, h / 2);

    this.traceBottlePath(lCtx, 0.94); // slightly inner contour

    const liquidGrad = lCtx.createLinearGradient(-100, 0, 100, 0);
    liquidGrad.addColorStop(0, '#660505');
    liquidGrad.addColorStop(0.3, '#A00D0D');
    liquidGrad.addColorStop(0.5, '#D61A1A');
    liquidGrad.addColorStop(0.7, '#A00D0D');
    liquidGrad.addColorStop(1, '#660505');
    lCtx.fillStyle = liquidGrad;
    lCtx.fill();

    lCtx.restore();
    liquidCanvas.refresh();
  }

  private traceBottlePath(ctx: CanvasRenderingContext2D, scale: number = 1.0) {
    ctx.beginPath();
    // Start at top center below cap
    const s = scale;
    ctx.moveTo(0, -310 * s);

    // Right neck
    ctx.lineTo(20 * s, -310 * s);
    ctx.lineTo(22 * s, -230 * s);

    // Upper curve outward (shoulder)
    ctx.bezierCurveTo(35 * s, -180 * s, 85 * s, -140 * s, 85 * s, -80 * s);

    // Inward waist
    ctx.bezierCurveTo(85 * s, -30 * s, 65 * s, 20 * s, 65 * s, 80 * s);

    // Lower swell outward
    ctx.bezierCurveTo(65 * s, 140 * s, 92 * s, 180 * s, 92 * s, 260 * s);

    // Base bottom curve
    ctx.quadraticCurveTo(92 * s, 320 * s, 70 * s, 325 * s);
    ctx.lineTo(-70 * s, 325 * s);
    ctx.quadraticCurveTo(-92 * s, 320 * s, -92 * s, 260 * s);

    // Left lower swell
    ctx.bezierCurveTo(-92 * s, 180 * s, -65 * s, 140 * s, -65 * s, 80 * s);

    // Left waist inward
    ctx.bezierCurveTo(-65 * s, 20 * s, -85 * s, -30 * s, -85 * s, -80 * s);

    // Left shoulder
    ctx.bezierCurveTo(-85 * s, -140 * s, -35 * s, -180 * s, -22 * s, -230 * s);
    ctx.lineTo(-20 * s, -310 * s);
    ctx.closePath();
  }

  /**
   * Generates the 2D superhero character with Coca-Cola Jetpack
   */
  private createHeroTexture() {
    const canvas = this.textures.createCanvas('hero_jetpack', 240, 320);
    if (!canvas) return;
    const ctx = canvas.getContext();
    const w = 240;
    const h = 320;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2, h / 2);

    // 1. Flowing Red & White Cape (behind hero)
    ctx.beginPath();
    ctx.moveTo(-35, -40);
    ctx.bezierCurveTo(-90, 40, -110, 110, -85, 140);
    ctx.lineTo(-40, 115);
    ctx.lineTo(0, 130);
    ctx.lineTo(40, 115);
    ctx.lineTo(85, 140);
    ctx.bezierCurveTo(110, 110, 90, 40, 35, -40);
    ctx.fillStyle = '#D00000';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    // 2. Coca-Cola Jetpack (Dual metallic tanks mounted on back)
    // Left Tank
    ctx.fillStyle = '#C0C0C0';
    ctx.roundRect(-55, -60, 30, 95, 12);
    ctx.fill();
    ctx.strokeStyle = '#F40000';
    ctx.lineWidth = 5;
    ctx.stroke();
    // Red stripe on left tank
    ctx.fillStyle = '#F40000';
    ctx.fillRect(-53, -30, 26, 35);

    // Right Tank
    ctx.fillStyle = '#C0C0C0';
    ctx.roundRect(25, -60, 30, 95, 12);
    ctx.fill();
    ctx.strokeStyle = '#F40000';
    ctx.lineWidth = 5;
    ctx.stroke();
    // Red stripe on right tank
    ctx.fillStyle = '#F40000';
    ctx.fillRect(27, -30, 26, 35);

    // Jet Thruster Nozzles at tank bases
    ctx.fillStyle = '#333333';
    ctx.beginPath();
    ctx.moveTo(-52, 35);
    ctx.lineTo(-28, 35);
    ctx.lineTo(-22, 52);
    ctx.lineTo(-58, 52);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(28, 35);
    ctx.lineTo(52, 35);
    ctx.lineTo(58, 52);
    ctx.lineTo(22, 52);
    ctx.closePath();
    ctx.fill();

    // 3. Hero Body (Aerodynamic flight pose facing upward / 3/4)
    // Torso / Suit (Coca-Cola red with white athletic side stripes)
    ctx.fillStyle = '#E60000';
    ctx.beginPath();
    ctx.moveTo(-28, -50);
    ctx.lineTo(28, -50);
    ctx.lineTo(20, 25);
    ctx.lineTo(-20, 25);
    ctx.closePath();
    ctx.fill();

    // Hero White Emblem / Chest Wave
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-18, -25);
    ctx.quadraticCurveTo(0, -12, 18, -25);
    ctx.stroke();

    // Belt
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-22, 22, 44, 10);
    ctx.fillStyle = '#FFD700'; // Gold buckle
    ctx.fillRect(-8, 20, 16, 14);

    // Legs in dynamic upward flight alignment
    ctx.fillStyle = '#B30000';
    // Left leg
    ctx.beginPath();
    ctx.moveTo(-18, 32);
    ctx.lineTo(-8, 85);
    ctx.lineTo(-14, 115);
    ctx.lineTo(-24, 115);
    ctx.lineTo(-22, 32);
    ctx.closePath();
    ctx.fill();
    // Right leg
    ctx.beginPath();
    ctx.moveTo(18, 32);
    ctx.lineTo(8, 85);
    ctx.lineTo(14, 115);
    ctx.lineTo(24, 115);
    ctx.lineTo(22, 32);
    ctx.closePath();
    ctx.fill();

    // Boots (White hero boots)
    ctx.fillStyle = '#FFFFFF';
    ctx.roundRect(-26, 105, 14, 25, 4);
    ctx.roundRect(12, 105, 14, 25, 4);
    ctx.fill();

    // 4. Arms (Forward upward fist gesture)
    ctx.fillStyle = '#E60000';
    // Left arm raised
    ctx.beginPath();
    ctx.moveTo(-28, -45);
    ctx.lineTo(-42, -90);
    ctx.lineTo(-30, -96);
    ctx.lineTo(-18, -48);
    ctx.closePath();
    ctx.fill();
    // Left glove (White)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-36, -95, 11, 0, Math.PI * 2);
    ctx.fill();

    // Right arm raised
    ctx.fillStyle = '#E60000';
    ctx.beginPath();
    ctx.moveTo(28, -45);
    ctx.lineTo(42, -90);
    ctx.lineTo(30, -96);
    ctx.lineTo(18, -48);
    ctx.closePath();
    ctx.fill();
    // Right glove (White)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(36, -95, 11, 0, Math.PI * 2);
    ctx.fill();

    // 5. Hero Head & Mask
    ctx.fillStyle = '#FFDFBA'; // Skin
    ctx.beginPath();
    ctx.arc(0, -66, 18, 0, Math.PI * 2);
    ctx.fill();

    // Hero Red Mask / Helmet
    ctx.fillStyle = '#E60000';
    ctx.beginPath();
    ctx.arc(0, -70, 19, Math.PI * 0.8, Math.PI * 2.2);
    ctx.fill();

    // White Hero Goggles / Visor
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(-7, -68, 6, 4, 0, 0, Math.PI * 2);
    ctx.ellipse(7, -68, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    canvas.refresh();
  }

  /**
   * Generates seamless parallax city skyline texture (Portrait width 1080)
   */
  private createCitySkylineTexture() {
    const canvas = this.textures.createCanvas('city_skyline', 1080, 900);
    if (!canvas) return;
    const ctx = canvas.getContext();
    ctx.clearRect(0, 0, 1080, 900);

    // Deep dark cityscape silhouettes
    ctx.fillStyle = '#141824';
    let x = 0;
    while (x < 1080) {
      const bWidth = 80 + Math.random() * 90;
      const bHeight = 400 + Math.random() * 450;
      const bY = 900 - bHeight;

      ctx.fillRect(x, bY, bWidth, bHeight);

      // Windows
      ctx.fillStyle = Math.random() > 0.4 ? '#FFE885' : '#73C2FB';
      for (let wy = bY + 30; wy < 870; wy += 35) {
        for (let wx = x + 15; wx < x + bWidth - 15; wx += 25) {
          if (Math.random() > 0.35) {
            ctx.globalAlpha = 0.6 + Math.random() * 0.4;
            ctx.fillRect(wx, wy, 10, 16);
          }
        }
      }
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = '#141824';
      x += bWidth + 10;
    }

    canvas.refresh();
  }

  /**
   * Generates soft atmospheric clouds
   */
  private createCloudTexture() {
    const canvas = this.textures.createCanvas('cloud', 400, 200);
    if (!canvas) return;
    const ctx = canvas.getContext();
    ctx.clearRect(0, 0, 400, 200);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.arc(140, 110, 55, 0, Math.PI * 2);
    ctx.arc(200, 90, 75, 0, Math.PI * 2);
    ctx.arc(270, 105, 60, 0, Math.PI * 2);
    ctx.arc(320, 130, 45, 0, Math.PI * 2);
    ctx.arc(90, 130, 40, 0, Math.PI * 2);
    ctx.fill();

    canvas.refresh();
  }

  /**
   * Generates large glowing Moon visual
   */
  private createMoonTexture() {
    const canvas = this.textures.createCanvas('moon', 600, 600);
    if (!canvas) return;
    const ctx = canvas.getContext();
    ctx.clearRect(0, 0, 600, 600);

    const rad = 250;
    const cx = 300;
    const cy = 300;

    // Glowing outer halo
    const halo = ctx.createRadialGradient(cx, cy, rad * 0.8, cx, cy, rad * 1.15);
    halo.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    halo.addColorStop(0.5, 'rgba(255, 240, 220, 0.15)');
    halo.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, rad * 1.15, 0, Math.PI * 2);
    ctx.fill();

    // Moon body
    const moonGrad = ctx.createRadialGradient(cx - 50, cy - 50, 40, cx, cy, rad);
    moonGrad.addColorStop(0, '#FFFFFF');
    moonGrad.addColorStop(0.7, '#E8EBF0');
    moonGrad.addColorStop(1, '#CBD2DC');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.fill();

    // Soft subtle craters
    ctx.fillStyle = 'rgba(180, 190, 205, 0.35)';
    const craters = [
      { x: cx - 70, y: cy - 60, r: 35 },
      { x: cx + 80, y: cy - 40, r: 45 },
      { x: cx - 40, y: cy + 90, r: 50 },
      { x: cx + 60, y: cy + 80, r: 28 },
      { x: cx + 110, y: cy + 20, r: 22 },
    ];
    craters.forEach((c) => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
    });

    canvas.refresh();
  }

  /**
   * Generates particle textures (fizz bubbles, jet flame, sparks)
   */
  private createParticleTextures() {
    // 1. Fizz bubble
    const bubbleCanvas = this.textures.createCanvas('particle_bubble', 24, 24);
    if (bubbleCanvas) {
      const bCtx = bubbleCanvas.getContext();
      bCtx.clearRect(0, 0, 24, 24);
      bCtx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      bCtx.beginPath();
      bCtx.arc(12, 12, 10, 0, Math.PI * 2);
      bCtx.fill();
      bCtx.fillStyle = '#FFFFFF';
      bCtx.beginPath();
      bCtx.arc(9, 9, 3, 0, Math.PI * 2);
      bCtx.fill();
      bubbleCanvas.refresh();
    }

    // 2. Jet exhaust flame particle
    const flameCanvas = this.textures.createCanvas('particle_flame', 32, 32);
    if (flameCanvas) {
      const fCtx = flameCanvas.getContext();
      fCtx.clearRect(0, 0, 32, 32);
      const flameGrad = fCtx.createRadialGradient(16, 16, 2, 16, 16, 15);
      flameGrad.addColorStop(0, '#FFFFFF');
      flameGrad.addColorStop(0.3, '#FFF040');
      flameGrad.addColorStop(0.7, '#F40000');
      flameGrad.addColorStop(1, 'rgba(244, 0, 0, 0)');
      fCtx.fillStyle = flameGrad;
      fCtx.beginPath();
      fCtx.arc(16, 16, 15, 0, Math.PI * 2);
      fCtx.fill();
      flameCanvas.refresh();
    }

    // 3. Star particle
    const starCanvas = this.textures.createCanvas('particle_star', 16, 16);
    if (starCanvas) {
      const sCtx = starCanvas.getContext();
      sCtx.clearRect(0, 0, 16, 16);
      sCtx.fillStyle = '#FFFFFF';
      sCtx.beginPath();
      sCtx.arc(8, 8, 4, 0, Math.PI * 2);
      sCtx.fill();
      starCanvas.refresh();
    }
  }
}

