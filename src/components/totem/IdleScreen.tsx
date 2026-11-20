'use client';

import React from 'react';

interface IdleScreenProps {
  active: boolean;
  ctaRef: React.RefObject<HTMLDivElement | null>;
  isAudioMuted?: boolean;
  onToggleAudio?: () => void;
}

const BUBBLES: Array<[number, number, number]> = [
  [90, 520, 44],
  [960, 600, 30],
  [150, 860, 26],
  [900, 1180, 40],
  [60, 1150, 22],
  [700, 330, 24],
  [300, 640, 18],
];

export const IdleScreen: React.FC<IdleScreenProps> = ({
  active,
  ctaRef,
  isAudioMuted = false,
  onToggleAudio,
}) => {
  return (
    <section className={`scr ${active ? 'on' : ''}`} id="idle">
      <div className="lp">
        <div className="plat">
          <i className="r1" />
          <i className="r2" />
          <i className="r3" />
        </div>
        {BUBBLES.map((q, i) => (
          <i
            key={i}
            className="bub"
            style={{
              left: `${q[0]}px`,
              top: `${q[1]}px`,
              width: `${q[2]}px`,
              height: `${q[2]}px`,
              animationDelay: `${-i * 0.6}s`,
            }}
          />
        ))}
        <img className="hero" src="/totem-assets/asset_19_8aeeb229.webp" alt="" />
        <div className="ttl">
          <b>Coke It Up!</b>
        </div>

        {/* Guided Actions Area: Single SHAKE button + HOW TO PLAY container */}
        <div className="idle-guide-area">
          <div className="shake-card">
            <div className="shake-card-btn">
              <img src="/totem-assets/asset_43_88bfa2e9.png" alt="Shake" />
            </div>
            <span className="shake-card-lbl">SHAKE</span>
          </div>

          <div className="how-to-play">
            <div className="htp-title">HOW TO PLAY</div>
            <div className="htp-step">
              <div className="htp-num">1</div>
              <div className="htp-text">
                <strong>Shake</strong> the bottle for 10 seconds to fill your cola fuel
              </div>
            </div>
            <div className="htp-step">
              <div className="htp-num">2</div>
              <div className="htp-text">
                <strong>Fly</strong> your hero as far as you can, up to the planets
              </div>
            </div>
            <div className="htp-step">
              <div className="htp-num">3</div>
              <div className="htp-text">
                <strong className="gold">Scan the QR</strong> in the Sales Rally microsite to get your points
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="idle-bottom-bar">
        <div className="cta" id="cta" ref={ctaRef}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 2h6v3l1.6 2.4c.9 1.4 1.4 3 1.4 4.6V20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-8c0-1.6.5-3.2 1.4-4.6L9 5z" />
          </svg>
          SHAKE THE BOTTLE TO START
        </div>

        <button
          type="button"
          className="audio-btn"
          onClick={(e) => {
            e.stopPropagation();
            onToggleAudio?.();
          }}
          aria-label="Toggle Sound"
        >
          {isAudioMuted ? (
            <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          )}
        </button>
      </div>
    </section>
  );
};
