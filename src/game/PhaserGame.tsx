'use client';

import React, { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { CountdownScene } from './scenes/CountdownScene';
import { ShakeScene } from './scenes/ShakeScene';
import { FlightScene } from './scenes/FlightScene';
import { DISPLAY_CONFIG } from '@/config/gameConfig';

interface PhaserGameProps {
  onGameReady?: (game: Phaser.Game) => void;
}

export const PhaserGame: React.FC<PhaserGameProps> = ({ onGameReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const onGameReadyRef = useRef(onGameReady);
  onGameReadyRef.current = onGameReady;

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: DISPLAY_CONFIG.width,
      height: DISPLAY_CONFIG.height,
      parent: containerRef.current,
      backgroundColor: '#EBF1F5',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      render: {
        antialias: true,
        pixelArt: false,
        powerPreference: 'high-performance',
      },
      scene: [BootScene, CountdownScene, ShakeScene, FlightScene],
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    if (onGameReadyRef.current) {
      onGameReadyRef.current(game);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []); // Run once on mount, never recreate on parent re-renders!

  return (
    <div
      ref={containerRef}
      id="phaser-game-container"
      className="w-full h-full flex items-center justify-center overflow-hidden bg-black select-none pointer-events-auto"
    />
  );
};

