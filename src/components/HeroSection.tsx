"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Sparkles, Brain, Zap, Target } from "lucide-react";

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const router = useRouter();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 10,
      },
    },
  };

  // Note: floatingAnimation removed to reduce unused variables and lint warnings

  // Removed scroll indicator per request

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Main content */}
      <motion.div
        className="relative z-20 text-center max-w-6xl mx-auto px-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Removed floating decorative icons per request */}

        {/* Badge removed per request */}

        {/* Main title */}
        <motion.h1 variants={itemVariants} className="mb-8">
          <div className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
            <motion.span 
              className="block text-white"
            >
              Artisan Atlas
            </motion.span>
          </div>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          variants={itemVariants}
          className="text-xl sm:text-2xl text-white/70 mb-12 max-w-4xl mx-auto leading-relaxed"
        >
          Transform your artisan products into market-ready brands with{" "}
          <span className="text-blue-400 font-semibold">AI-powered analysis</span>,{" "}
          <span className="text-purple-400 font-semibold">strategic insights</span>, and{" "}
          <span className="text-pink-400 font-semibold">automated marketing</span> solutions.
        </motion.p>

        {/* Feature highlights */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          {[
            { icon: Brain, label: "AI Analysis", color: "from-blue-500 to-cyan-500" },
            { icon: Target, label: "SEO Strategy", color: "from-purple-500 to-pink-500" },
            { icon: Sparkles, label: "Content Gen", color: "from-green-500 to-emerald-500" },
            { icon: Zap, label: "Instant Results", color: "from-orange-500 to-red-500" },
          ].map((feature) => (
            <motion.div
              key={feature.label}
              className="group cursor-pointer"
              whileHover={prefersReducedMotion ? undefined : { scale: 1.05, y: -5 }}
              transition={prefersReducedMotion ? undefined : { type: "spring", stiffness: 300 }}
            >
              <div className="relative">
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300`}></div>
                <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
                  <feature.icon className="w-8 h-8 mx-auto mb-3 text-white/80 group-hover:scale-110 transition-transform duration-300" />
                  <p className="text-white/70 text-sm font-medium">{feature.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div variants={itemVariants}>
          <motion.button
            className="group relative px-8 py-4 text-lg font-semibold text-white overflow-hidden rounded-full"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/tool')}
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
            
            {/* Button content */}
            <div className="relative flex items-center space-x-2">
              <span>Start Creating Magic</span>
              <motion.div
                animate={prefersReducedMotion ? undefined : { x: [0, 5, 0] }}
                transition={prefersReducedMotion ? undefined : { duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
            </div>
          </motion.button>
        </motion.div>

        {/* Scroll indicator removed */}
      </motion.div>
    </div>
  );
}