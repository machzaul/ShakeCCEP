'use client';

import React from 'react';

interface IdleScreenProps {
  active: boolean;
  ctaRef: React.RefObject<HTMLDivElement | null>;
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

export const IdleScreen: React.FC<IdleScreenProps> = ({ active, ctaRef }) => {
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

        {/* Shake Button */}
        <div className="tile t1">
          <img src="/totem-assets/asset_43_88bfa2e9.png" alt="Shake" />
          <em>Shake</em>
        </div>

        {/* How to play guide panel matching coke-it-up-totem (3).html */}
        <div className="howto">
          <small>How to play</small>
          <ol>
            <li>
              <b>1</b>
              <span>
                <strong>Shake</strong> the bottle for 10 seconds to fill your cola fuel
              </span>
            </li>
            <li>
              <b>2</b>
              <span>
                <strong>Fly</strong> your hero as far as you can, up to the planets
              </span>
            </li>
            <li>
              <b>3</b>
              <span>
                <strong>Scan the QR</strong> in the Sales Rally microsite to get your points
              </span>
            </li>
          </ol>
        </div>
      </div>

      <div className="cta" id="cta" ref={ctaRef}>
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 2h6v3l1.6 2.4c.9 1.4 1.4 3 1.4 4.6V20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-8c0-1.6.5-3.2 1.4-4.6L9 5z" />
        </svg>
        SHAKE THE BOTTLE TO START
      </div>
    </section>
  );
};
