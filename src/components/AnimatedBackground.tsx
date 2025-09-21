"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  useEffect(() => {
    setIsClient(true);
    
    // Generate positions for floating shapes
    const shapes = Array.from({ length: 3 }, () => ({
      initialX: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
      initialY: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
      animateX: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
      animateY: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
    }));
    setAnimationPositions(shapes);

    // Generate positions for gradient orbs
    const orbs = Array.from({ length: 2 }, () => ({
      animateX: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
      animateY: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
    }));
    setOrbPositions(orbs);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === 'undefined') return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
    }> = [];

    // Create particles
    for (let i = 0; i < 20; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.3 + 0.1,
      });
    }

    function animate() {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around screen
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.y > canvas.height) particle.y = 0;
        if (particle.y < 0) particle.y = canvas.height;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${particle.opacity})`;
        ctx.fill();

        // Draw connections
        particles.forEach((otherParticle, otherIndex) => {
          if (index !== otherIndex) {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) {
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              ctx.strokeStyle = `rgba(99, 102, 241, ${0.05 * (1 - distance / 120)})`;
              ctx.stroke();
            }
          }
        });
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      if (typeof window === 'undefined') return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    if (typeof window !== 'undefined') {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ background: "transparent" }}
      />
      
      {/* Floating geometric shapes */}
      {isClient && (
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