'use client';

import { useEffect, useState } from 'react';
import { useCompass } from '@/hooks/useCompass';

export default function Home() {
  const {
    nearestRetailer,
    retailers,
    activeIndex,
    goNext,
    goPrev,
    loading,
    error,
    distance,
    heading,
    relativeHeading,
    enabled,
    setEnabled,
  } = useCompass();
  const [showPulse, setShowPulse] = useState(false);
  const [hasShownPulse, setHasShownPulse] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (!nearestRetailer) return;
    const address = `${nearestRetailer.address}, ${nearestRetailer.city}, ${nearestRetailer.state} ${nearestRetailer.zipCode}`;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  useEffect(() => {
    if (nearestRetailer && !hasShownPulse) {
      setShowPulse(true);
      const timer = window.setTimeout(() => {
        setShowPulse(false);
        setHasShownPulse(true);
      }, 1000);
      return () => window.clearTimeout(timer);
    }
  }, [nearestRetailer?.name, hasShownPulse]); // re-trigger on actual retailer change

  const requestPermissions = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setEnabled(true);
        }
      } catch (err) {
        console.error('Permission request failed:', err);
      }
      return;
    }

    setEnabled(true);
  };

  return (
    <main className="hud-container">
      <div className="mountain-background" />

      <section className="app-shell" aria-label="Nearest Busch Apple compass">
        <header className="title-header">
          <h1 className="main-title">Bapple Compass</h1>
          <p className="main-subtitle">
            Points you to your heart&apos;s deepest desire
            <br />
            (nearest bapple retailer)
          </p>
        </header>

        <button
          className={`compass-container ${enabled && !nearestRetailer ? 'is-loading' : ''}`}
          type="button"
          onClick={!enabled ? requestPermissions : undefined}
          disabled={enabled}
          aria-label={
            enabled
              ? 'Compass active'
              : 'Enable motion and location access to start the compass'
          }
        >
          {showPulse && <div className="compass-loading-overlay" />}

          {enabled && !nearestRetailer && !error && (
            <div className="gray-pulses">
              <div className="gray-pulse-ring" />
              <div className="gray-pulse-ring" />
              <div className="gray-pulse-ring" />
            </div>
          )}

          {(!enabled || !nearestRetailer || error) && (
            <div className="state-overlay">
              {error ? "No Bapple Here" : (!enabled ? "Tap to Begin" : "Loading...")}
            </div>
          )}

          <div
            className="compass-dial"
            style={{ transform: `rotate(${-heading}deg)` }}
          >
            <svg width="100%" height="100%" viewBox="0 0 340 340" aria-hidden="true">
              <text
                x="170"
                y="32"
                textAnchor="middle"
                fontSize="24"
                fontWeight="900"
                fill="#111111"
              >
                N
              </text>
              <text
                x="305"
                y="178"
                textAnchor="middle"
                fontSize="20"
                fontWeight="900"
                fill="#111111"
                opacity="0.2"
              >
                E
              </text>
              <text
                x="170"
                y="318"
                textAnchor="middle"
                fontSize="20"
                fontWeight="900"
                fill="#111111"
                opacity="0.2"
              >
                S
              </text>
              <text
                x="35"
                y="178"
                textAnchor="middle"
                fontSize="20"
                fontWeight="900"
                fill="#111111"
                opacity="0.2"
              >
                W
              </text>

              <g className={`reveal-item-svg ${hasShownPulse ? 'is-visible' : ''}`} style={{ transitionDelay: '0s' }}>
                {[...Array(60)].map((_, i) => (
                  <line
                    key={i}
                    x1="170"
                    y1="10"
                    x2="170"
                    y2="18"
                    stroke="#111111"
                    strokeOpacity={i % 15 === 0 ? '0.3' : '0.1'}
                    strokeWidth={i % 15 === 0 ? '2' : '1'}
                    transform={`rotate(${i * 6}, 170, 170)`}
                  />
                ))}
              </g>
            </svg>
          </div>

          <div
            className="compass-needle"
            style={{ transform: `rotate(${hasShownPulse ? (relativeHeading ?? 0) : 0}deg)` }}
          >
            <svg width="100%" height="100%" viewBox="0 0 340 340" aria-hidden="true">
              <path
                d="M170,20 L185,150 L170,140 L155,150 Z"
                fill="var(--apple-red)"
                style={{
                  filter: 'drop-shadow(0 4px 10px rgba(255, 59, 48, 0.4))',
                }}
              />
            </svg>
          </div>
        </button>

        <div className="distance-panel" aria-live="polite">
          <div className="distance-hud">
            {distance && enabled ? (
              <div className={`reveal-item ${hasShownPulse ? 'is-visible' : ''}`} style={{ transitionDelay: '0.15s' }}>
                {(distance * 0.000621371).toFixed(1)}
                <span className="distance-unit">mi</span>
              </div>
            ) : (
              <span className="distance-placeholder">---</span>
            )}
          </div>
          <p className="status-copy">
            {error
              ? error
              : enabled && !nearestRetailer
                ? 'Scanning your region for Busch Apple.'
                : showPulse 
                  ? 'Found target...'
                  : enabled
                    ? ''
                    : 'Tap the compass to begin.'}
          </p>
        </div>

        <div className="store-info">
          {nearestRetailer && enabled && (
            <article
              className={`location-card ${hasShownPulse ? 'is-visible' : ''}`}
              style={{ transitionDelay: '0.3s' }}
            >
              <p className="card-label">Closest retailer</p>
              <button
                aria-label="Copy address"
                className="copy-button card-copy-button"
                type="button"
                onClick={copyAddress}
                title="Copy Address"
              >
                {copied ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                )}
              </button>
              <div className="store-name">{nearestRetailer.name}</div>
              <div className="store-address">
                {nearestRetailer.address}, {nearestRetailer.city},{' '}
                {nearestRetailer.state} {nearestRetailer.zipCode}
              </div>

              {retailers.length > 1 && (
                <div className="retailer-nav">
                  <button
                    id="retailer-prev-btn"
                    className="retailer-nav-btn"
                    type="button"
                    onClick={goPrev}
                    disabled={activeIndex === 0}
                    aria-label="Previous retailer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <span className="retailer-nav-count">
                    {activeIndex + 1} <span className="retailer-nav-sep">/</span> {retailers.length}
                  </span>
                  <button
                    id="retailer-next-btn"
                    className="retailer-nav-btn"
                    type="button"
                    onClick={goNext}
                    disabled={activeIndex === retailers.length - 1}
                    aria-label="Next retailer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              )}
            </article>
          )}
        </div>

        <footer className="app-footer">
          BAPPLE COMPASS v1.0 | ANTHONY MARTINI
        </footer>
      </section>
    </main>
  );
}
