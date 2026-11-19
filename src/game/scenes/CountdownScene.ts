import * as Phaser from 'phaser';
import { audioManager } from '@/lib/audioManager';
import { eventBus } from '@/game/EventBus';

export class CountdownScene extends Phaser.Scene {
  private countdownText!: Phaser.GameObjects.Text;
  private statusIndicatorText!: Phaser.GameObjects.Text;
  private bottleSprite!: Phaser.GameObjects.Image;
  private currentStep: number = 3;
  private stepTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super('CountdownScene');
  }

  create() {
    this.time.removeAllEvents();
    this.tweens.killAll();

    const { width, height } = this.scale;

    // 1. Light grey / pale blue background (Matches wireframe #EAF0F4)
    this.add.rectangle(0, 0, width, height, 0xebf1f5).setOrigin(0, 0);

    // 2. Coca-Cola Branding at the Top
    this.createHeaderBranding(width);

    // 3. Centered Bottle Silhouette (Scaled nicely for 9:16 Portrait)
    this.bottleSprite = this.add.image(width / 2, height / 2, 'bottle_glass');
    this.bottleSprite.setScale(1.15);
    this.bottleSprite.setAlpha(0.9);

    // 4. Large Countdown Number Text centered over bottle
    this.countdownText = this.add.text(width / 2, height / 2 - 20, '3', {
      fontFamily: "'Bebas Neue', 'Impact', sans-serif",
      fontSize: '240px',
      color: '#F40000',
      stroke: '#FFFFFF',
      strokeThickness: 16,
      align: 'center',
    }).setOrigin(0.5);

    // 5. READY / SET indicator text in bottom area
    this.statusIndicatorText = this.add.text(width / 2, height / 2 + 520, '', {
      fontFamily: "'Bebas Neue', 'Impact', sans-serif",
      fontSize: '72px',
      color: '#1E252B',
      stroke: '#FFFFFF',
      strokeThickness: 8,
    }).setOrigin(0.5);

    // Reset countdown sequence
    this.currentStep = 3;
    this.runCountdownSequence();
  }

  private createHeaderBranding(width: number) {
    // Red brand bar & typography
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

  private runCountdownSequence() {
    this.showStep(3);

    // Step 2 after 1 second
    this.time.delayedCall(1000, () => {
      this.showStep(2);
    });

    // Step 1 after 2 seconds
    this.time.delayedCall(2000, () => {
      this.showStep(1);
    });

    // Step GO! after 3 seconds
    this.time.delayedCall(3000, () => {
      this.showGo();
    });

    // Transition to ShakeScene after 3.8 seconds
    this.time.delayedCall(3800, () => {
      eventBus.emit('COUNTDOWN_COMPLETE');
      this.scene.start('ShakeScene');
    });
  }

  private showStep(num: number) {
    this.currentStep = num;
    this.countdownText.setText(num.toString());
    this.countdownText.setScale(0.4);
    this.countdownText.setAlpha(0);

    // Audio cue
    audioManager.playCountdownBeep(num);

    // Pop scale tween
    this.tweens.add({
      targets: this.countdownText,
      scale: 1.1,
      alpha: 1,
      duration: 250,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: this.countdownText,
          scale: 1.0,
          duration: 700,
          ease: 'Sine.easeInOut',
        });
      },
    });

    // Indicator text (READY on 2, SET on 1)
    if (num === 2) {
      this.statusIndicatorText.setText('READY');
      this.animateIndicator();
    } else if (num === 1) {
      this.statusIndicatorText.setText('SET');
      this.animateIndicator();
    } else {
      this.statusIndicatorText.setText('');
    }
  }

  private showGo() {
    this.statusIndicatorText.setText('');
    this.countdownText.setText('GO!');
    this.countdownText.setColor('#F40000');
    this.countdownText.setScale(0.4);
    this.countdownText.setAlpha(0);

    audioManager.playCountdownGo();

    // Energetic punch animation
    this.tweens.add({
      targets: this.countdownText,
      scale: 1.35,
      alpha: 1,
      duration: 200,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: this.countdownText,
          scale: 1.1,
          alpha: 0.9,
          duration: 550,
        });
      },
    });

    // Subtle punch on the bottle
    this.tweens.add({
      targets: this.bottleSprite,
      scaleY: 1.05,
      scaleX: 0.96,
      duration: 100,
      yoyo: true,
      repeat: 2,
    });
  }

  private animateIndicator() {
    this.statusIndicatorText.setScale(0.8);
    this.statusIndicatorText.setAlpha(0);
    this.tweens.add({
      targets: this.statusIndicatorText,
      scale: 1.0,
      alpha: 1,
      duration: 200,
      ease: 'Cubic.easeOut',
    });
  }
}

