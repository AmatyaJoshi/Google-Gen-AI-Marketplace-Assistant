import { AnimatedBackground } from "../components/AnimatedBackground";
import { HeroSection } from "../components/HeroSection";

export default function Home() {
  return (
  <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-black overflow-hidden">
  {/* Animated Background: tuned for landing visuals, balanced perf */}
  <AnimatedBackground density={120} speedFactor={0.9} performance="balanced" maxFps={45} shootingStarsPerMinute={14} />
      
      {/* Main Content */}
      <div className="relative z-30 h-screen overflow-hidden">
        {/* Hero Section */}
        <HeroSection />
      </div>
    </div>
  );
}
