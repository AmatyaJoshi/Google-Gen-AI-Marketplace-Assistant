"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type AnimatedBackgroundProps = {
  density?: number; // approximate number of stars across all layers
  enableTwinkle?: boolean;
  enableShootingStars?: boolean;
  speedFactor?: number; // overall speed multiplier
  performance?: "high" | "balanced" | "low"; // quality preset
  maxFps?: number; // cap animation framerate
  pauseWhenHidden?: boolean; // pause when tab hidden
  disableDecor?: boolean; // hide floating shapes & orbs
  shootingStarsPerMinute?: number; // desired spawn rate (frame-rate independent)
  maxShootingStars?: number; // cap concurrent shooting stars
};

export function AnimatedBackground({
  density = 160,
  enableTwinkle = true,
  enableShootingStars = true,
  speedFactor = 1,
  performance = "balanced",
  maxFps,
  pauseWhenHidden = true,
  disableDecor = false,
  shootingStarsPerMinute,
  maxShootingStars,
}: AnimatedBackgroundProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isClient, setIsClient] = useState(false);
  const [animationPositions, setAnimationPositions] = useState<Array<{
    initialX: number;
    initialY: number;
    animateX: number;
    animateY: number;
  }>>([]);
  const [orbPositions, setOrbPositions] = useState<Array<{
    animateX: number;
    animateY: number;
  }>>([]);

  // Resolve effective settings based on performance preset and reduced motion
  const perfPreset = performance;
  const isLow = perfPreset === "low";
  const isBalanced = perfPreset === "balanced";
  const isHigh = perfPreset === "high";
  const effectiveDensity = Math.max(
    20,
    Math.floor(
      density * (prefersReducedMotion ? 0.4 : isLow ? 0.5 : isBalanced ? 0.8 : 1)
    )
  );
  const twinkleEnabled = !prefersReducedMotion && enableTwinkle;
  // Allow shooting stars even on low preset (just spawn less often)
  const shootingEnabled = !prefersReducedMotion && enableShootingStars;
  const fpsCap = Math.min(Math.max(maxFps ?? (isHigh ? 60 : isBalanced ? 45 : 30), 10), 60);
  const decorEnabled = !disableDecor && !prefersReducedMotion && !isLow;
  const starsPerMinute = shootingStarsPerMinute ?? (isHigh ? 12 : isBalanced ? 8 : 6);
  const starsPerSec = Math.max(0, starsPerMinute / 60);
  const maxShooter = Math.max(1, maxShootingStars ?? (isHigh ? 6 : isBalanced ? 4 : 3));

  useEffect(() => {
    setIsClient(true);
    
    // Generate positions for floating shapes
    const shapes = Array.from({ length: decorEnabled ? 3 : 0 }, () => ({
      initialX: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
      initialY: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
      animateX: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
      animateY: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
    }));
    setAnimationPositions(shapes);

    // Generate positions for gradient orbs
    const orbs = Array.from({ length: decorEnabled ? 2 : 0 }, () => ({
      animateX: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
      animateY: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
    }));
    setOrbPositions(orbs);
  }, [decorEnabled]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === 'undefined') return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setCanvasSize = () => {
      const cssW = window.innerWidth;
      const cssH = window.innerHeight;
      const dprCap = isHigh ? 1.5 : isBalanced ? 1.25 : 1;
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset any prior scale
      ctx.scale(dpr, dpr); // draw in CSS pixels
      return { cssW, cssH };
    };

    const { cssW, cssH } = setCanvasSize();

    type Star = {
      x: number;
      y: number;
      size: number; // current render size
      baseSize: number; // base size for twinkle modulation
      speedX: number;
      speedY: number;
      twinkleSpeed: number;
      twinklePhase: number;
      layer: number; // 0=bg,1=mid,2=fg
    };

    type ShootingStar = {
      x: number;
      y: number;
      vx: number; // px per ms
      vy: number; // px per ms
      life: number; // remaining life 0..1
      age: number; // 0..1 ramp up for fade-in
      maxLife: number;
      length: number;
    };

    const stars: Star[] = [];
    const shootingStars: ShootingStar[] = [];

    // Layer distribution: more in background, fewer foreground
  const total = Math.max(40, Math.floor(effectiveDensity));
    const counts = [Math.floor(total * 0.5), Math.floor(total * 0.35), total - Math.floor(total * 0.5) - Math.floor(total * 0.35)];

    const makeStar = (layer: number): Star => {
      // Layer depth controls speed and size
  const layerSpeed = [0.02, 0.05, 0.09][layer] * speedFactor * (isLow ? 0.8 : 1);
      const sizeRange = [
        [0.4, 1.1], // bg small
        [0.6, 1.6], // mid
        [0.8, 2.2], // fg
      ][layer];
      const baseSize = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);
      return {
  x: Math.random() * cssW,
  y: Math.random() * cssH,
        size: baseSize,
        baseSize,
        speedX: (Math.random() - 0.5) * layerSpeed,
        speedY: (Math.random() - 0.5) * layerSpeed,
        twinkleSpeed: 0.5 + Math.random() * 1.2,
        twinklePhase: Math.random() * Math.PI * 2,
        layer,
      };
    };

    for (let l = 0; l < 3; l++) {
      for (let i = 0; i < counts[l]; i++) {
        stars.push(makeStar(l));
      }
    }

    let raf = 0;
    let lastTime = 0;
    let rafActive = true;
    let spawnCarry = 0; // fractional spawns accumulator
    const animate = (t: number) => {
      if (!rafActive) return;
      const delta = t - lastTime;
      const minFrameTime = 1000 / fpsCap;
      if (delta < minFrameTime) {
        raf = requestAnimationFrame(animate);
        return;
      }
      lastTime = t;
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw stars with glow
  ctx.save();
  ctx.globalCompositeOperation = isLow ? "source-over" : "lighter";

      for (let l = 0; l < 3; l++) {
  const glow = (isHigh ? [2, 4, 6] : isBalanced ? [2, 3, 4] : [1, 1, 2])[l];
        const color = "255,255,255"; // white glow
        for (let i = 0; i < stars.length; i++) {
          const s = stars[i];
          if (s.layer !== l) continue;

          // Update position
          s.x += s.speedX;
          s.y += s.speedY;

          // Wrap around
          if (s.x > cssW) s.x = 0;
          if (s.x < 0) s.x = cssW;
          if (s.y > cssH) s.y = 0;
          if (s.y < 0) s.y = cssH;

          // Twinkle effect
          const twinkle = twinkleEnabled ? (0.6 + 0.4 * Math.sin(s.twinklePhase + t * 0.001 * s.twinkleSpeed)) : 1;
          const size = s.baseSize * twinkle;

          ctx.beginPath();
          ctx.shadowBlur = glow;
          ctx.shadowColor = `rgba(120, 130, 255, ${0.6})`;
          ctx.fillStyle = `rgba(${color}, ${0.85})`;
          ctx.arc(s.x, s.y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();

      // Shooting stars - time based spawn independent of FPS
      if (shootingEnabled && starsPerSec > 0) {
        const expected = (starsPerSec * delta) / 1000 + spawnCarry;
        let spawns = Math.floor(expected);
        spawnCarry = expected - spawns;
        while (spawns > 0 && shootingStars.length < maxShooter) {
          // Choose a direction to cover the whole page:
          // 0: NW->SE, 1: NE->SW, 2: W->E slight down, 3: E->W slight down
          const dir = Math.floor(Math.random() * 4);
          let startX = 0, startY = 0, angle = 0;
          if (dir === 0) {
            // NW -> SE
            startX = -40 - Math.random() * 80;
            startY = -40 - Math.random() * 80;
            angle = (20 + Math.random() * 35) * Math.PI / 180; // 20°..55°
          } else if (dir === 1) {
            // NE -> SW
            startX = cssW + 40 + Math.random() * 80;
            startY = -40 - Math.random() * 80;
            angle = Math.PI - (20 + Math.random() * 35) * Math.PI / 180; // 125°..160°
          } else if (dir === 2) {
            // W -> E with slight downward angle
            startX = -40 - Math.random() * 80;
            startY = Math.random() * (cssH * 0.9);
            angle = (5 + Math.random() * 15) * Math.PI / 180; // 5°..20°
          } else {
            // E -> W with slight downward angle
            startX = cssW + 40 + Math.random() * 80;
            startY = Math.random() * (cssH * 0.9);
            angle = Math.PI - (5 + Math.random() * 15) * Math.PI / 180; // 160°..175°
          }

          // Speed in px/sec then convert to px/ms
          // Slower, more professional pace
          const speedPxPerSec = (420 + Math.random() * 220) * speedFactor * (isLow ? 0.85 : 1);
          const speed = speedPxPerSec / 1000;
          const vx = Math.cos(angle) * speed;
          const vy = Math.sin(angle) * speed;
          shootingStars.push({
            x: startX,
            y: startY,
            vx,
            vy,
            life: 1,
            age: 0,
            maxLife: 1,
            length: (isLow ? 110 : 140) + Math.random() * (isHigh ? 90 : 60),
          });
          spawns--;
        }
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.x += s.vx * delta; // time-based movement (px/ms * ms)
        s.y += s.vy * delta;
        // Fade-in for first ~150ms; fade-out via life decay
  // Ease-in for start and slightly longer life for calmer feel
  s.age = Math.min(1, s.age + delta / 220);
  s.life -= (delta / 1700) * (isLow ? 0.9 : 1) * speedFactor; // ~1.7s default lifetime

        // Trail
        const angle = Math.atan2(s.vy, s.vx);
        const tailX = s.x - Math.cos(angle) * s.length;
        const tailY = s.y - Math.sin(angle) * s.length;

        // Additive blending for trail
  const prevComp: GlobalCompositeOperation = ctx.globalCompositeOperation;
        ctx.globalCompositeOperation = "lighter";
        const headAlpha = Math.max(0, Math.min(1, 0.9 * s.life * s.age));
  const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
  grad.addColorStop(0, `rgba(255,255,255, ${headAlpha})`);
  grad.addColorStop(0.3, `rgba(170,185,255, ${0.5 * headAlpha})`);
  grad.addColorStop(1, `rgba(120,130,255, 0)`);

  // Rounded, slightly tapered trail
  ctx.strokeStyle = grad;
  ctx.lineCap = "round";
  ctx.lineWidth = (isLow ? 1.2 : 2) * (0.9 + 0.3 * headAlpha);
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Bright head flare
  ctx.shadowBlur = isHigh ? 7 : isBalanced ? 6 : 4;
  ctx.shadowColor = `rgba(190,200,255, ${headAlpha})`;
  ctx.fillStyle = `rgba(255,255,255, ${headAlpha})`;
        ctx.beginPath();
  ctx.arc(s.x, s.y, isHigh ? 1.6 : isBalanced ? 1.4 : 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalCompositeOperation = prevComp;

        if (s.life <= 0 || s.x > cssW + 120 || s.x < -120 || s.y > cssH + 120 || s.y < -120) {
          shootingStars.splice(i, 1);
        }
      }

      raf = requestAnimationFrame(animate);
    };

    const start = () => {
      rafActive = true;
      raf = requestAnimationFrame(animate);
    };
    start();

    const handleResize = () => {
      if (typeof window === 'undefined') return;
      setCanvasSize();
    };

    const onVisibility = () => {
      if (!pauseWhenHidden) return;
      const hidden = document.visibilityState === "hidden";
      if (hidden) {
        rafActive = false;
        cancelAnimationFrame(raf);
      } else {
        if (!rafActive) {
          lastTime = 0;
          start();
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener("resize", handleResize);
      document.addEventListener("visibilitychange", onVisibility);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener("resize", handleResize);
        document.removeEventListener("visibilitychange", onVisibility);
      }
      cancelAnimationFrame(raf);
    };
  }, [effectiveDensity, shootingEnabled, twinkleEnabled, speedFactor, perfPreset, fpsCap, pauseWhenHidden, isLow, isBalanced, isHigh, starsPerSec, maxShooter]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ background: "transparent" }}
      />
      
      {/* Floating geometric shapes */}
      {isClient && decorEnabled && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-10">
          {animationPositions.map((position, i) => (
            <motion.div
              key={i}
              className="absolute w-24 h-24 border border-indigo-500/10 rounded-full"
              initial={{ 
                x: position.initialX,
                y: position.initialY,
                scale: 0,
                rotate: 0 
              }}
              animate={{
                x: position.animateX,
                y: position.animateY,
                scale: [0, 1, 0],
                rotate: 360,
              }}
            transition={{
              duration: 25 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
              delay: i * 3,
            }}
          />
        ))}
        
        {/* Gradient orbs */}
        {orbPositions.map((position, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute w-48 h-48 rounded-full opacity-5"
            style={{
              background: `radial-gradient(circle, ${
                i % 2 === 0 ? "rgb(99, 102, 241)" : "rgb(139, 92, 246)"
              } 0%, transparent 70%)`,
            }}
            initial={{ 
              x: -100,
              y: -100,
            }}
            animate={{
              x: position.animateX,
              y: position.animateY,
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: i * 5,
            }}
          />
        ))}
        </div>
      )}
    </>
  );
}