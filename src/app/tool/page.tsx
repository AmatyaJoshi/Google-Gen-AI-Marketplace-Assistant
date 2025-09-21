import { AnimatedBackground } from "@/components/AnimatedBackground";
import { ModernArtisanForm } from "@/components/ModernArtisanForm";

export const metadata = {
  title: "AI Artisan Tool | Modern Artisan",
  description: "Upload a product image and generate marketing insights, SEO, and content automatically.",
};

export default function ToolPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-30">
        <ModernArtisanForm />
      </div>
    </div>
  );
}
