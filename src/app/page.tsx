import { AnimatedBackground } from "../components/AnimatedBackground";
import { HeroSection } from "../components/HeroSection";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Main Content */}
      <div className="relative z-30 h-screen overflow-hidden">
        {/* Hero Section */}
        <HeroSection />
      </div>
    </div>
  );
}
