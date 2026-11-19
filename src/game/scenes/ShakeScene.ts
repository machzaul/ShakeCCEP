import * as Phaser from 'phaser';
import { GAME_CONFIG, calculateFlightDistance } from '@/config/gameConfig';
import { audioManager } from '@/lib/audioManager';
import { eventBus } from '@/game/EventBus';
import { ShakeEvent } from '@/types/game';

export class ShakeScene extends Phaser.Scene {
  private bottleGlass!: Phaser.GameObjects.Image;
  private bottleLiquid!: Phaser.GameObjects.Image;
  private liquidMaskShape!: Phaser.GameObjects.Graphics;
  private shakeBadgeContainer!: Phaser.GameObjects.Container;
  private motionIndicators: Phaser.GameObjects.Arc[] = [];
  private fizzParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private auraGlow!: Phaser.GameObjects.Graphics;

  // Gameplay state tracking
  private accumulatedEnergy: number = 0;
  private displayedEnergy: number = 0;
  private totalScore: number = 0;
  private totalShakes: number = 0;
  private timeRemaining: number = GAME_CONFIG.gameplayDurationSeconds;
  private isGameplayActive: boolean = false;
  private timerEvent?: Phaser.Time.TimerEvent;

  // Listeners
  private unsubscribeShake?: () => void;

  constructor() {
    super('ShakeScene');
  }

  create() {
    this.time.removeAllEvents();
    this.tweens.killAll();

    const { width, height } = this.scale;

    // Reset session variables
    this.accumulatedEnergy = 0;
    this.displayedEnergy = 0;
    this.totalScore = 0;
    this.totalShakes = 0;
    this.timeRemaining = GAME_CONFIG.gameplayDurationSeconds;
    this.isGameplayActive = true;

    // 1. Background (Wireframe pale blue-grey #EAF0F4)
    this.add.rectangle(0, 0, width, height, 0xebf1f5).setOrigin(0, 0);

    // 2. Header Branding
    this.createHeaderBranding(width);

    const bottleY = height / 2 - 40;

    // 3. Aura glow behind bottle
    this.auraGlow = this.add.graphics();
    this.updateAuraGlow(width / 2, bottleY, 0);

    // 4. Bottle Liquid & Mask (Liquid sits inside contour bottle)
    this.bottleLiquid = this.add.image(width / 2, bottleY, 'bottle_liquid');
    this.bottleLiquid.setScale(1.15);

    // Create mask graphics for liquid fill level
    this.liquidMaskShape = this.make.graphics({});
    const mask = this.liquidMaskShape.createGeometryMask();
    this.bottleLiquid.setMask(mask);
    this.updateLiquidMask(0);

    // 5. Bottle Glass Frame & Specular Overlay
    this.bottleGlass = this.add.image(width / 2, bottleY, 'bottle_glass');
    this.bottleGlass.setScale(1.15);

    // 6. Fizz Carbonation Particles at the liquid top
    this.fizzParticles = this.add.particles(width / 2, bottleY, 'particle_bubble', {
      speed: { min: 20, max: 70 },
      angle: { min: 250, max: 290 },
      scale: { start: 0.6, end: 0.1 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 800,
      frequency: 120,
      emitting: false,
    });

    // 7. Motion Indicators & SHAKE! red badge
    this.createShakeIndicators(width / 2, bottleY);

    // 8. Setup Shake Event Listener via EventBus
    this.unsubscribeShake = eventBus.on('CONTROLLER_SHAKE', (event: ShakeEvent) => {
      this.handleShake(event);
    });

    // 9. Countdown gameplay timer (10s duration)
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      repeat: GAME_CONFIG.gameplayDurationSeconds - 1,
      callback: () => {
        this.timeRemaining--;
        eventBus.emit('GAMEPLAY_TIMER_TICK', {
          timeRemaining: this.timeRemaining,
          energy: this.accumulatedEnergy,
          score: this.totalScore,
          totalShakes: this.totalShakes,
        });

        if (this.timeRemaining <= 0) {
          this.finishGameplay();
        }
      },
    });

    // Notify React that playing state started
    eventBus.emit('GAMEPLAY_STARTED', {
      duration: GAME_CONFIG.gameplayDurationSeconds,
    });
  }

  private createHeaderBranding(width: number) {
    this.add.text(width / 2, 170, 'Coca-Cola', {
      fontFamily: "'Georgia', 'Brush Script MT', 'Times New Roman', serif",
      fontSize: '64px',
      fontStyle: 'italic bold',
      color: '#F40000',
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(width / 2, 225, 'SHAKE SHAKE', {
      fontFamily: "'Bebas Neue', 'Impact', sans-serif",
      fontSize: '28px',
      letterSpacing: 6,
      color: '#2A3036',
      align: 'center',
    }).setOrigin(0.5);
  }

  private createShakeIndicators(bx: number, by: number) {
    // Red "SHAKE!" pill badge positioned next to bottle in portrait
    this.shakeBadgeContainer = this.add.container(bx + 230, by - 120);

    const badgeBg = this.add.graphics();
    badgeBg.fillStyle(0xf40000, 1);
    badgeBg.fillRoundedRect(-80, -32, 160, 64, 32);
    badgeBg.lineStyle(4, 0xffffff, 1);
    badgeBg.strokeRoundedRect(-80, -32, 160, 64, 32);

    const badgeText = this.add.text(0, 0, 'SHAKE!', {
      fontFamily: "'Bebas Neue', 'Impact', sans-serif",
      fontSize: '36px',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    this.shakeBadgeContainer.add([badgeBg, badgeText]);

    // Pulsing shake hint animation
    this.tweens.add({
      targets: this.shakeBadgeContainer,
      scale: 1.08,
      rotation: 0.05,
      yoyo: true,
      repeat: -1,
      duration: 400,
      ease: 'Sine.easeInOut',
    });

    // Circular vibration ripples around bottle
    for (let i = 0; i < 3; i++) {
      const arcLeft = this.add.arc(bx - 140 - i * 20, by, 40 + i * 15, 120, 240, false);
      arcLeft.setStrokeStyle(4, 0xf40000, 0.4 - i * 0.1);
      const arcRight = this.add.arc(bx + 140 + i * 20, by, 40 + i * 15, -60, 60, false);
      arcRight.setStrokeStyle(4, 0xf40000, 0.4 - i * 0.1);
      this.motionIndicators.push(arcLeft, arcRight);
    }
  }

  /**
   * Handle incoming validated physical shake event
   */
  public handleShake(event: ShakeEvent) {
    if (!this.isGameplayActive) return;

    this.totalShakes++;

    // Calculate score: base score + intensity bonus with supercharge multiplier
    const intensity = Math.min(100, Math.max(10, event.intensity));
    const isSupercharged = this.accumulatedEnergy >= 100;
    const multiplier = isSupercharged ? 1.5 : 1.0;
    const bonus = Math.round(intensity * GAME_CONFIG.intensityBonusFactor * multiplier);
    const shakeScore = Math.round((GAME_CONFIG.baseScorePerShake + bonus) * multiplier);
    this.totalScore += shakeScore;

    // Energy fills with each shake
    // 35-40 good shakes can reach 100% capacity
    const energyGain = Math.max(1.8, (intensity / 100) * 3.2);
    this.accumulatedEnergy = Math.min(GAME_CONFIG.maxEnergy, this.accumulatedEnergy + energyGain);

    // Calculate live projected flight distance
    const projectedDistance = calculateFlightDistance(this.totalScore, this.totalShakes);

    // Audio feedback with energy-based pitch
    audioManager.playShakeFeedback(this.accumulatedEnergy);

    // Physical bottle wobble animation
    const tiltDir = this.totalShakes % 2 === 0 ? 1 : -1;
    const wobbleAngle = (intensity / 100) * 0.12 * tiltDir;

    // Floating score popup text (+PTS)
    const { width, height } = this.scale;
    const popupX = width / 2 + Phaser.Math.Between(-70, 70);
    const popupY = height / 2 - Phaser.Math.Between(40, 110);
    const popup = this.add.text(popupX, popupY, `+${shakeScore}`, {
      fontFamily: "'Bebas Neue', 'Impact', sans-serif",
      fontSize: '40px',
      color: '#F40000',
      stroke: '#FFFFFF',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: popup,
      y: popupY - 70,
      alpha: 0,
      scale: 1.25,
      duration: 550,
      ease: 'Cubic.easeOut',
      onComplete: () => popup.destroy(),
    });

    this.tweens.add({
      targets: [this.bottleGlass, this.bottleLiquid],
      rotation: wobbleAngle,
      scaleX: 1.03,
      scaleY: 0.97,
      duration: 60,
      yoyo: true,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.bottleGlass.setRotation(0);
        this.bottleLiquid.setRotation(0);
        this.bottleGlass.setScale(1.0);
        this.bottleLiquid.setScale(1.0);
      },
    });

    // Burst fizz bubbles
    this.fizzParticles.explode(5);

    // Broadcast update to React HUD
    eventBus.emit('GAMEPLAY_SCORE_UPDATE', {
      totalScore: this.totalScore,
      totalShakes: this.totalShakes,
      energy: this.accumulatedEnergy,
      intensity,
      timeRemaining: this.timeRemaining,
      projectedDistance,
    });
  }

  update(time: number, delta: number) {
    if (!this.isGameplayActive && this.displayedEnergy === this.accumulatedEnergy) return;

    // Smooth lerp interpolation for liquid fill level
    const lerpSpeed = 0.08;
    this.displayedEnergy += (this.accumulatedEnergy - this.displayedEnergy) * lerpSpeed;

    this.updateLiquidMask(this.displayedEnergy);

    // Position fizz particles at current liquid surface
    const { width, height } = this.scale;
    const bottleY = height / 2 - 40;
    const bottleH = 680 * 1.15;
    const surfaceY = bottleY + (330 * 1.15) - (this.displayedEnergy / 100) * (bottleH * 0.88);
    this.fizzParticles.setPosition(width / 2, surfaceY);

    if (this.accumulatedEnergy > 10) {
      this.fizzParticles.emitting = true;
    }

    // Dynamic aura glow
    this.updateAuraGlow(width / 2, bottleY, this.displayedEnergy);
  }

  /**
   * Updates the clipping mask for the liquid inside the bottle
   */
  private updateLiquidMask(energyPercent: number) {
    const { width, height } = this.scale;
    const bx = width / 2;
    const by = height / 2 - 40;
    const bottleBottom = by + (345 * 1.15);
    const bottleTop = by - (335 * 1.15);
    const totalFillHeight = bottleBottom - bottleTop;

    const currentLiquidHeight = (energyPercent / 100) * (totalFillHeight * 0.92);
    const liquidTop = bottleBottom - currentLiquidHeight;

    this.liquidMaskShape.clear();
    this.liquidMaskShape.fillStyle(0xffffff, 1);
    // Mask rectangle covering from bottom up to current fill level
    this.liquidMaskShape.fillRect(bx - 180, liquidTop, 360, currentLiquidHeight + 20);
  }

  private updateAuraGlow(bx: number, by: number, energy: number) {
    this.auraGlow.clear();
    if (energy < 15) return;

    const alpha = (energy / 100) * 0.45;
    const radius = 210 + (energy / 100) * 90;
    this.auraGlow.fillStyle(0xf40000, alpha);
    this.auraGlow.fillCircle(bx, by, radius);
  }

  /**
   * Final shake moment complete -> Lock score and initiate hero flight sequence
   */
  private finishGameplay() {
    if (!this.isGameplayActive) return;
    this.isGameplayActive = false;

    if (this.timerEvent) {
      this.timerEvent.remove();
    }
    if (this.unsubscribeShake) {
      this.unsubscribeShake();
    }

    // Flash bottle with golden energy burst
    this.tweens.add({
      targets: [this.bottleGlass, this.bottleLiquid],
      scale: 1.15,
      duration: 350,
      yoyo: true,
      ease: 'Back.easeInOut',
      onComplete: () => {
        const finalFlightDistance = calculateFlightDistance(this.totalScore, this.totalShakes);

        // Transition directly to FlightScene
        eventBus.emit('GAMEPLAY_FINISHED', {
          totalScore: this.totalScore,
          totalShakes: this.totalShakes,
          energy: this.accumulatedEnergy,
          flightDistance: finalFlightDistance,
        });

        this.scene.start('FlightScene', {
          totalScore: this.totalScore,
          totalShakes: this.totalShakes,
          energy: this.accumulatedEnergy,
          flightDistance: finalFlightDistance,
        });
      },
    });
  }

  shutdown() {
    if (this.unsubscribeShake) {
      this.unsubscribeShake();
    }
    if (this.timerEvent) {
      this.timerEvent.remove();
    }
  }
}

