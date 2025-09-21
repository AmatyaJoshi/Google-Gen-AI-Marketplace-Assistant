import { AnimatedBackground } from "@/components/AnimatedBackground";
import { ModernArtisanForm } from "@/components/ModernArtisanForm";

export const metadata = {
  title: "Artisan Atlas | Tool",
  description: "Upload a product image and generate marketing insights, SEO, and content automatically.",
};

export default function ToolPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-black overflow-hidden">
  <AnimatedBackground density={80} speedFactor={0.8} performance="low" maxFps={30} disableDecor shootingStarsPerMinute={18} maxShootingStars={4} />
      <div className="relative z-30">
        <ModernArtisanForm />
      </div>
    </div>
  );
}
