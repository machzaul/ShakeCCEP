import * as Phaser from 'phaser';
import { GAME_CONFIG, calculateFlightDistance } from '@/config/gameConfig';
import { audioManager } from '@/lib/audioManager';
import { eventBus } from '@/game/EventBus';

interface FlightData {
  totalScore: number;
  totalShakes: number;
  energy: number;
  flightDistance?: number;
}

export class FlightScene extends Phaser.Scene {
  private totalScore: number = 0;
  private totalShakes: number = 0;
  private energy: number = 0;
  private targetFlightDistance: number = 0;
  private currentFlightDistance: number = 0;

  // Visual game objects
  private hero!: Phaser.GameObjects.Image;
  private jetFlameEmitterLeft!: Phaser.GameObjects.Particles.ParticleEmitter;
  private jetFlameEmitterRight!: Phaser.GameObjects.Particles.ParticleEmitter;
  private smokeEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  // Parallax background layers
  private skyGradient!: Phaser.GameObjects.Graphics;
  private skylineTile!: Phaser.GameObjects.TileSprite;
  private clouds: Phaser.GameObjects.Image[] = [];
  private moon!: Phaser.GameObjects.Image;
  private starfield!: Phaser.GameObjects.Particles.ParticleEmitter;

  // Flight flight state
  private isFlying: boolean = false;
  private flightProgress: number = 0; // 0 to 1
  private flightDuration: number = 7000; // 7 seconds cinematic flight sequence
  private flightStartTime: number = 0;

  constructor() {
    super('FlightScene');
  }

  init(data: FlightData) {
    this.totalScore = data.totalScore || 0;
    this.totalShakes = data.totalShakes || 0;
    this.energy = data.energy || 0;

    // Direct score-driven flight distance: higher score = superhero launches further into the sky!
    this.targetFlightDistance =
      data.flightDistance || calculateFlightDistance(this.totalScore, this.totalShakes);
    this.currentFlightDistance = 0;

    // Cinematic scaling: flight sequence lasts between 6.5s and 8.5s depending on distance achieved
    const distanceNorm = Phaser.Math.Clamp(this.targetFlightDistance / 15000, 0, 1);
    this.flightDuration = Math.round(Phaser.Math.Linear(6500, 8500, distanceNorm));
  }

  create() {
    this.time.removeAllEvents();
    this.tweens.killAll();

    const { width, height } = this.scale;

    // 1. Dynamic Atmosphere Gradient Background (City Night -> Upper Stratosphere)
    this.skyGradient = this.add.graphics();
    this.drawSkyGradient(0);

    // 2. Starfield in high altitude
    this.starfield = this.add.particles(0, 0, 'particle_star', {
      x: { min: 0, max: width },
      y: { min: -100, max: height },
      speedY: { min: 40, max: 180 },
      speedX: { min: -10, max: 10 },
      scale: { min: 0.3, max: 0.9 },
      alpha: { min: 0.3, max: 1 },
      lifespan: 2500,
      frequency: 60,
      emitting: false,
    });

    // 3. Moon (descends into view as hero flies into stratosphere)
    this.moon = this.add.image(width / 2, -300, 'moon');
    this.moon.setScale(0.85);

    // 4. Parallax City Skyline (ground level)
    this.skylineTile = this.add.tileSprite(width / 2, height - 450, width, 900, 'city_skyline');
    this.skylineTile.setOrigin(0.5, 0.5);

    // 5. Parallax Clouds across portrait height
    this.clouds = [];
    for (let i = 0; i < 8; i++) {
      const cx = Phaser.Math.Between(100, width - 100);
      const cy = height - 100 - i * 260;
      const c = this.add.image(cx, cy, 'cloud');
      c.setScale(Phaser.Math.FloatBetween(0.9, 1.5));
      c.setAlpha(0.65);
      this.clouds.push(c);
    }

    // 6. Superhero Character with Coca-Cola Jetpack
    // Initially positioned at lower-middle screen preparing for launch
    this.hero = this.add.image(width / 2, height - 280, 'hero_jetpack');
    this.hero.setScale(1.25);

    // 7. Jet Thruster Particle Exhausts
    this.jetFlameEmitterLeft = this.add.particles(0, 0, 'particle_flame', {
      speedY: { min: 250, max: 550 },
      speedX: { min: -25, max: 10 },
      scale: { start: 1.0, end: 0.1 },
      alpha: { start: 1, end: 0 },
      lifespan: 350,
      frequency: 20,
      emitting: false,
    });

    this.jetFlameEmitterRight = this.add.particles(0, 0, 'particle_flame', {
      speedY: { min: 250, max: 550 },
      speedX: { min: -10, max: 25 },
      scale: { start: 1.0, end: 0.1 },
      alpha: { start: 1, end: 0 },
      lifespan: 350,
      frequency: 20,
      emitting: false,
    });

    this.smokeEmitter = this.add.particles(0, 0, 'particle_bubble', {
      speedY: { min: 100, max: 300 },
      speedX: { min: -40, max: 40 },
      scale: { start: 0.6, end: 1.6 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 600,
      frequency: 45,
      emitting: false,
    });

    // 8. Trigger Launch Sequence
    this.runLaunchSequence(width, height);
  }

  private drawSkyGradient(progress: number) {
    const { width, height } = this.scale;
    this.skyGradient.clear();

    // From dusk navy-blue to deep space black as progress -> 1
    const t = Phaser.Math.Clamp(progress, 0, 1);
    const r1 = Math.round(Phaser.Math.Linear(15, 5, t));
    const g1 = Math.round(Phaser.Math.Linear(25, 5, t));
    const b1 = Math.round(Phaser.Math.Linear(45, 10, t));

    const r2 = Math.round(Phaser.Math.Linear(50, 8, t));
    const g2 = Math.round(Phaser.Math.Linear(80, 12, t));
    const b2 = Math.round(Phaser.Math.Linear(110, 20, t));

    const topColor = (r1 << 16) | (g1 << 8) | b1;
    const bottomColor = (r2 << 16) | (g2 << 8) | b2;

    this.skyGradient.fillGradientStyle(topColor, topColor, bottomColor, bottomColor, 1);
    this.skyGradient.fillRect(0, 0, width, height);
  }

  private runLaunchSequence(width: number, height: number) {
    // Audio: Jetpack launch blast
    audioManager.playJetpackLaunch();

    // Small crouch & anticipation
    this.tweens.add({
      targets: this.hero,
      y: height - 250,
      scaleY: 1.1,
      scaleX: 1.35,
      duration: 350,
      ease: 'Quad.easeInOut',
      onComplete: () => {
        // Ignite thrusters
        this.jetFlameEmitterLeft.emitting = true;
        this.jetFlameEmitterRight.emitting = true;
        this.smokeEmitter.emitting = true;

        audioManager.startFlightLoop();

        // Blast upward into center flight position in portrait
        const targetHoverY = height * 0.45;

        this.tweens.add({
          targets: this.hero,
          y: targetHoverY,
          scaleX: 1.25,
          scaleY: 1.25,
          duration: 1200,
          ease: 'Back.easeOut',
          onComplete: () => {
            // Begin continuous flight phase
            this.isFlying = true;
            this.flightStartTime = this.time.now;

            // Subtle hovering bobbing
            this.tweens.add({
              targets: this.hero,
              y: targetHoverY - 35,
              duration: 900,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut',
            });
          },
        });
      },
    });
  }

  update(time: number, delta: number) {
    const { width, height } = this.scale;

    // Attach jet thruster emitters to hero jetpack nozzles
    if (this.hero) {
      const hx = this.hero.x;
      const hy = this.hero.y;
      this.jetFlameEmitterLeft.setPosition(hx - 45, hy + 50);
      this.jetFlameEmitterRight.setPosition(hx + 45, hy + 50);
      this.smokeEmitter.setPosition(hx, hy + 65);
    }

    if (!this.isFlying) return;

    // Calculate flight progression over flightDuration (e.g. 7s)
    const elapsed = time - this.flightStartTime;
    this.flightProgress = Phaser.Math.Clamp(elapsed / this.flightDuration, 0, 1);

    // Dynamic easing: fast acceleration, steady cruise, smooth high-altitude deceleration
    const easedProgress = Phaser.Math.Easing.Cubic.Out(this.flightProgress);

    // Update flight distance (meters)
    this.currentFlightDistance = Math.round(easedProgress * this.targetFlightDistance);

    // Emit HUD update to React overlay
    eventBus.emit('FLIGHT_UPDATE', {
      currentDistance: this.currentFlightDistance,
      targetDistance: this.targetFlightDistance,
      progress: this.flightProgress,
      totalScore: this.totalScore,
    });

    // Update sky atmosphere gradient
    this.drawSkyGradient(this.flightProgress);

    // Parallax scrolling speed reduces smoothly as hero reaches peak
    const currentSpeed = (1 - easedProgress * 0.7) * (delta * 0.8);

    // 1. City skyline moves downward and vanishes
    this.skylineTile.y += currentSpeed * 1.2;

    // 2. Clouds move downward
    this.clouds.forEach((c) => {
      c.y += currentSpeed * 1.8;
      if (c.y > height + 200 && this.flightProgress < 0.7) {
        c.y = -150;
        c.x = Phaser.Math.Between(100, width - 100);
      }
    });

    // 3. Stars appear in upper stratosphere
    if (this.flightProgress > 0.45 && !this.starfield.emitting) {
      this.starfield.emitting = true;
    }

    // 4. Moon descends into view at apex
    if (this.flightProgress > 0.5) {
      const moonTargetY = height * 0.2;
      const moonT = (this.flightProgress - 0.5) / 0.5;
      this.moon.y = Phaser.Math.Linear(-350, moonTargetY, Phaser.Math.Easing.Cubic.Out(moonT));
    }

    // Check flight completion
    if (this.flightProgress >= 1.0) {
      this.finishFlight();
    }
  }

  private finishFlight() {
    this.isFlying = false;

    // Softly fade thrusters
    this.jetFlameEmitterLeft.emitting = false;
    this.jetFlameEmitterRight.emitting = false;
    this.smokeEmitter.emitting = false;
    audioManager.stopFlightLoop();

    // Hero celebratory victory pose
    this.tweens.add({
      targets: this.hero,
      y: this.hero.y - 30,
      scale: 1.25,
      duration: 600,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Delay 1s then transition to Result
        this.time.delayedCall(1000, () => {
          eventBus.emit('FLIGHT_COMPLETE', {
            totalScore: this.totalScore,
            totalShakes: this.totalShakes,
            flightDistance: this.targetFlightDistance,
          });
        });
      },
    });
  }

  shutdown() {
    audioManager.stopFlightLoop();
  }
}

