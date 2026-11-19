'use client';

import React from 'react';

interface ShakeScreenProps {
  active: boolean;
  ringRef: React.RefObject<HTMLDivElement | null>;
  ringPRef: React.RefObject<SVGCircleElement | null>;
  tmRef: React.RefObject<HTMLElement | null>;
  hudBarRef: React.RefObject<HTMLElement | null>;
  secLRef: React.RefObject<HTMLSpanElement | null>;
  pcRef: React.RefObject<HTMLElement | null>;
  chImgRef: React.RefObject<HTMLImageElement | null>;
  botRef: React.RefObject<HTMLDivElement | null>;
  btFRef: React.RefObject<HTMLImageElement | null>;
  btZRef: React.RefObject<HTMLImageElement | null>;
  shoutRef: React.RefObject<HTMLDivElement | null>;
  cnRef: React.RefObject<HTMLElement | null>;
}

export const ShakeScreen: React.FC<ShakeScreenProps> = ({
  active,
  ringRef,
  ringPRef,
  tmRef,
  hudBarRef,
  secLRef,
  pcRef,
  chImgRef,
  botRef,
  btFRef,
  btZRef,
  shoutRef,
  cnRef,
}) => {
  return (
    <section className={`scr ${active ? 'on' : ''}`} id="shake">
      <div className="hud2">
        <div className="tmC" id="ring" ref={ringRef}>
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="38" fill="#fff" />
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="7" />
            <circle
              ref={ringPRef}
              id="ringP"
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#FFC93C"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray="282.7"
              strokeDashoffset="0"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <b ref={tmRef} id="tm">
            10
          </b>
        </div>
        <div className="mid">
          <small>COLA FUEL</small>
          <div className="bar">
            <i ref={hudBarRef} id="hudBar" />
          </div>
          <em>
            SHAKE TO FILL · <span ref={secLRef} id="secL">10</span>s LEFT
          </em>
        </div>
        <div className="pcC">
          <b ref={pcRef} id="pc">
            0<span>%</span>
          </b>
        </div>
      </div>

      <div className="chHero">
        <img ref={chImgRef} id="chImg" src="/totem-assets/asset_20_3ba02893.webp" alt="" />
        <img className="chBase" src="/totem-assets/asset_19_8aeeb229.webp" alt="" />
      </div>

      <div className="bot" id="bot" ref={botRef}>
        <img src="/totem-assets/asset_21_126f7a5c.webp" alt="" />
        <img ref={btFRef} id="btF" src="/totem-assets/asset_22_204d611d.webp" alt="" />
        <img
          ref={btZRef}
          id="btZ"
          src="/totem-assets/asset_23_bdfbc30f.webp"
          alt=""
          style={{ opacity: 0 }}
        />
      </div>

      <div className="shout" id="shout" ref={shoutRef}>
        SHAKE!
      </div>
      <div className="count">
        <b ref={cnRef} id="cn">
          3
        </b>
      </div>
    </section>
  );
};
