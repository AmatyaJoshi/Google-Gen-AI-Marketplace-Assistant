"use client";
/* eslint-disable */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Search,
  Target,
  TrendingUp,
  PenTool,
  DollarSign,
  Megaphone,
  Sparkles,
  Eye,
  ChevronRight,
  Copy,
  Check,
  ChevronLeft,
  Bolt
} from "lucide-react";

interface MarketingData {
  productAnalysis?: {
    visualDescription: string;
    materialAnalysis: string;
    uniqueSellingPoints: string[];
    marketPositioning: string;
  };
  marketingStrategy?: {
    brandStory: string;
    keyMessages: string[];
    valueProposition: string;
    competitiveAdvantage: string;
  };
  seoStrategy?: {
    primaryKeywords: string[];
    longTailKeywords: string[];
    metaTitle: string;
    metaDescription: string;
    altText: string;
  };
  contentMarketing?: {
    productTitle: string;
    shortDescription: string;
    detailedDescription: string;
    socialMediaCaptions: {
      instagram: string;
      facebook: string;
      pinterest: string;
    };
  };
  structuredOutput?: {
    productTitle: string;
    productDescription: string;
    socialPost: string;
    hashtags: string[];
    language?: string;
  };
  pricingStrategy?: {
    recommendedPrice: string;
    pricingRationale: string;
    marketComparison: string;
  };
  marketingChannels?: {
    primary: string[];
    secondary: string[];
    reasoning: string;
  };
  photoTip?: string;
}

interface MarketingResultsProps {
  content: string;
  isLoading: boolean;
}

export function MarketingResults({ content, isLoading }: MarketingResultsProps) {
  const [activeTab, setActiveTab] = useState("analysis");
  const [copiedText, setCopiedText] = useState("");
  const tabListRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  let marketingData: MarketingData = {};
  let assembledText = "";

  // Parse streamed content -> JSON object
  const sanitizeJson = (s: string) =>
    s
      // remove markdown fences if present
      .replace(/```json\n?/gi, "")
      .replace(/```\n?/g, "")
      // normalize smart quotes
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      // remove trailing commas before } or ]
      .replace(/,\s*([}\]])/g, "$1");
  if (content && !isLoading) {
    try {
      const lines = content.split("\n");
      let full = "";
      for (const line of lines) {
        if (line.startsWith("data: ") && !line.includes("[DONE]")) {
          try {
            const obj = JSON.parse(line.slice(6));
            if (obj.content) {
              full += obj.content;
              assembledText += obj.content;
            }
          } catch {
            // ignore malformed chunk
          }
        }
      }
      const match = full.match(/\{[\s\S]*\}/);
      if (match) {
        const candidate = sanitizeJson(match[0]);
        try {
          marketingData = JSON.parse(candidate);
        } catch {
          // try broader sanitize on entire assembled text
          try {
            marketingData = JSON.parse(sanitizeJson(full));
          } catch {
            // keep fallback
          }
        }
      }
    } catch {
      // keep empty object and show raw later
      // console.warn("Could not parse marketing JSON");
    }
  }

  const tabs = [
    { id: "analysis", label: "Analysis", icon: Search },
    { id: "strategy", label: "Strategy", icon: Target },
    { id: "seo", label: "SEO", icon: TrendingUp },
    { id: "content", label: "Content", icon: PenTool },
    { id: "kit", label: "Quick Copy", icon: Bolt },
    { id: "pricing", label: "Pricing", icon: DollarSign },
    { id: "channels", label: "Channels", icon: Megaphone },
  ] as const;

  const activeIndex = tabs.findIndex((t) => t.id === activeTab);
  const goPrev = () => setActiveTab(tabs[(activeIndex - 1 + tabs.length) % tabs.length].id);
  const goNext = () => setActiveTab(tabs[(activeIndex + 1) % tabs.length].id);

  // Copy to clipboard helper
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(""), 2000);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const CopyButton = ({ text }: { text: string }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => copyToClipboard(text)}
      className="p-2 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition-colors duration-200"
    >
      {copiedText === text ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
    </motion.button>
  );

  // Keep active tab visible in scroller
  useEffect(() => {
    const el = tabListRef.current?.querySelector<HTMLButtonElement>(`button[data-tab="${activeTab}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeTab]);

  const checkScroll = () => {
    const scroller = tabListRef.current;
    if (!scroller) return;
    const { scrollLeft, scrollWidth, clientWidth } = scroller;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const handleResize = () => checkScroll();
    window.addEventListener("resize", handleResize);
    const scroller = tabListRef.current;
    scroller?.addEventListener("scroll", checkScroll);
    return () => {
      window.removeEventListener("resize", handleResize);
      scroller?.removeEventListener("scroll", checkScroll);
    };
  }, []);

  const scrollByAmount = (dx: number) => {
    const scroller = tabListRef.current;
    if (!scroller) return;
    try {
      // Use numeric signature to avoid logical property lint issues
      // @ts-ignore - Element#scrollBy numeric overload
      scroller.scrollBy(dx, 0);
    } catch {
      scroller.scrollLeft += dx;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-3xl" />
        <div className="relative border border-white/10 rounded-3xl p-8 shadow-xl">
          <motion.div className="flex flex-col items-center justify-center space-y-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
              <Sparkles className="w-12 h-12 text-blue-400" />
            </motion.div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white/90 mb-2">AI is analyzing your product...</h3>
              <p className="text-white/60">Creating comprehensive marketing strategies and insights</p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!content) return null;

  // If JSON parse failed, show cleaned raw
  if (!marketingData.productAnalysis) {
    // Prefer the text assembled from SSE chunks; fallback to a minimally cleaned version
    const clean = (assembledText || content)
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-3xl" />
        <div className="relative border border-white/10 rounded-3xl p-8 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-indigo-400" />
            Marketing Analysis Results
          </h3>
          <div className="text-gray-300 bg-black/10 rounded-2xl p-6 space-y-4">
            <div className="text-sm text-yellow-400 mb-4">⚠️ Processing results... The data is being analyzed and will be formatted shortly.</div>
            <details>
              <summary className="text-white font-medium hover:text-indigo-400 cursor-pointer">View Raw Analysis Data</summary>
              <div className="mt-4 text-sm whitespace-pre-wrap opacity-75 max-h-96 overflow-y-auto">{clean || content}</div>
            </details>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div className="relative" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl" />
      <div className="relative border border-white/10 rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <motion.div className="flex items-center space-x-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Marketing Intelligence</h3>
              <p className="text-gray-400 text-sm">AI-generated insights for your product</p>
            </div>
          </motion.div>
        </div>

        {/* Tabs container */}
        <div className="relative bg-gradient-to-r from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <div className="px-6 py-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Marketing Insights</h3>
            </div>

            {/* Mobile select */}
            <div className="sm:hidden mb-2">
              <label htmlFor="section-select" className="sr-only">Select section</label>
              <div className="relative">
                <select
                  id="section-select"
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                  className="w-full appearance-none bg-white/5 text-white/90 border border-white/10 rounded-xl px-4 py-2.5 pr-10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                >
                  {tabs.map((t) => (
                    <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                      {t.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/60">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
              {/* Mobile prev/next */}
              <div className="mt-3 flex items-center justify-end gap-2">
                <button type="button" onClick={goPrev} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 text-xs">Prev</button>
                <button type="button" onClick={goNext} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 text-xs">Next</button>
              </div>
            </div>

            {/* Desktop tabs with scroll + fades + arrows */}
            <div className="relative hidden sm:block" role="tablist" aria-label="Marketing sections">
              <div className={cn("pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-[#0b1020]/70 to-transparent rounded-l-xl transition-opacity", canScrollLeft ? "opacity-100" : "opacity-0")} />
              <div className={cn("pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-[#0b1020]/70 to-transparent rounded-r-xl transition-opacity", canScrollRight ? "opacity-100" : "opacity-0")} />

              {canScrollLeft && (
                <button type="button" onClick={() => scrollByAmount(-240)} aria-label="Scroll tabs left" className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 grid place-items-center text-white/80 hover:text-white">
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              {canScrollRight && (
                <button type="button" onClick={() => scrollByAmount(240)} aria-label="Scroll tabs right" className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 grid place-items-center text-white/80 hover:text-white">
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              <div ref={tabListRef} onScroll={checkScroll} className="mx-8 flex space-x-3 overflow-x-auto scroll-smooth pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] focus:outline-none">
                {tabs.map((tab, index) => (
                  <motion.button
                    key={tab.id}
                    data-tab={tab.id}
                    id={`tab-${tab.id}`}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`panel-${tab.id}`}
                    tabIndex={activeTab === tab.id ? 0 : -1}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "group relative flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-300 backdrop-blur-sm border flex-shrink-0 focus-visible:ring-2 focus-visible:ring-indigo-500/40",
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-indigo-500/30 to-purple-600/30 border-indigo-400/50 text-white shadow-lg"
                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20 hover:text-white"
                    )}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <tab.icon className={cn("w-4 h-4 transition-colors duration-300", activeTab === tab.id ? "text-indigo-300" : "text-gray-400 group-hover:text-white")} />
                    <span>{tab.label}</span>
                    {activeTab === tab.id && (
                      <motion.div className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full" layoutId="activeTabIndicator" transition={{ type: "spring", duration: 0.4 }} />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              {activeTab === "analysis" && marketingData.productAnalysis && (
                <div id="panel-analysis" role="tabpanel" aria-labelledby="tab-analysis" className="space-y-6">
                  <div className="text-center mb-8">
                    <h4 className="text-2xl font-bold text-white mb-2">📊 Product Analysis</h4>
                    <p className="text-gray-400">AI-powered insights about your product based on image analysis</p>
                    {marketingData.photoTip && <p className="mt-2 text-sm text-white/70">📸 Photo Tip: {marketingData.photoTip}</p>}
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {[
                      { title: "🔍 What We See", subtitle: "Visual Description", content: marketingData.productAnalysis.visualDescription, gradient: "from-blue-500/10 to-cyan-500/10" },
                      { title: "🧱 Materials & Quality", subtitle: "What it's made of and craftsmanship level", content: marketingData.productAnalysis.materialAnalysis, gradient: "from-purple-500/10 to-pink-500/10" },
                      { title: "🎯 Market Position", subtitle: "Where your product fits in the marketplace", content: marketingData.productAnalysis.marketPositioning, gradient: "from-green-500/10 to-emerald-500/10" },
                    ].map((item, i) => (
                      <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={cn("relative bg-gradient-to-br backdrop-blur-sm border border-white/10 rounded-2xl p-6", item.gradient)}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h5 className="font-semibold text-lg text-white">{item.title}</h5>
                            {item.subtitle && <p className="text-sm text-gray-400 mt-1">{item.subtitle}</p>}
                          </div>
                          <CopyButton text={item.content} />
                        </div>
                        <p className="text-gray-300 leading-relaxed">{item.content}</p>
                      </motion.div>
                    ))}

                    {marketingData.productAnalysis.uniqueSellingPoints?.length ? (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h5 className="font-semibold text-lg text-white">✨ What Makes You Special</h5>
                            <p className="text-sm text-gray-400 mt-1">Key advantages that set your product apart</p>
                          </div>
                          <CopyButton text={marketingData.productAnalysis.uniqueSellingPoints.join(", ")} />
                        </div>
                        <div className="space-y-3">
                          {marketingData.productAnalysis.uniqueSellingPoints.map((point, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-start space-x-3 bg-white/5 rounded-lg p-3">
                              <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <ChevronRight className="w-3 h-3 text-orange-400" />
                              </div>
                              <span className="text-gray-300 leading-relaxed">{point}</span>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    ) : null}
                  </div>
                </div>
              )}

              {activeTab === "strategy" && marketingData.marketingStrategy && (
                <div id="panel-strategy" role="tabpanel" aria-labelledby="tab-strategy" className="space-y-6">
                  <div className="text-center mb-8">
                    <h4 className="text-2xl font-bold text-white mb-2">🎯 Marketing Strategy</h4>
                    <p className="text-gray-400">Clear brand story and positioning to connect with your audience</p>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h5 className="font-semibold text-lg text-white">Brand Story</h5>
                        <CopyButton text={marketingData.marketingStrategy.brandStory} />
                      </div>
                      <p className="text-gray-300 leading-relaxed">{marketingData.marketingStrategy.brandStory || "—"}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h5 className="font-semibold text-lg text-white">Key Messages</h5>
                        <CopyButton text={(marketingData.marketingStrategy.keyMessages || []).join(", ")} />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(marketingData.marketingStrategy.keyMessages || []).map((m, i) => (
                          <span key={i} className="px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-200 text-sm border border-indigo-500/20">{m}</span>
                        ))}
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h5 className="font-semibold text-lg text-white">Value Proposition</h5>
                          <CopyButton text={marketingData.marketingStrategy.valueProposition} />
                        </div>
                        <p className="text-gray-300 leading-relaxed">{marketingData.marketingStrategy.valueProposition || "—"}</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h5 className="font-semibold text-lg text-white">Competitive Advantage</h5>
                          <CopyButton text={marketingData.marketingStrategy.competitiveAdvantage} />
                        </div>
                        <p className="text-gray-300 leading-relaxed">{marketingData.marketingStrategy.competitiveAdvantage || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "seo" && marketingData.seoStrategy && (
                <div id="panel-seo" role="tabpanel" aria-labelledby="tab-seo" className="space-y-6">
                  <div className="text-center mb-8">
                    <h4 className="text-2xl font-bold text-white mb-2">📈 SEO Strategy</h4>
                    <p className="text-gray-400">Keywords and metadata to help customers find you</p>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h5 className="font-semibold text-lg text-white">Primary Keywords</h5>
                        <CopyButton text={(marketingData.seoStrategy.primaryKeywords || []).join(", ")} />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(marketingData.seoStrategy.primaryKeywords || []).map((k, i) => (
                          <span key={i} className="px-3 py-1 rounded-full bg-green-500/15 text-green-200 text-sm border border-green-500/20">{k}</span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h5 className="font-semibold text-lg text-white">Long-tail Keywords</h5>
                        <CopyButton text={(marketingData.seoStrategy.longTailKeywords || []).join(", ")} />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(marketingData.seoStrategy.longTailKeywords || []).map((k, i) => (
                          <span key={i} className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-200 text-sm border border-emerald-500/20">{k}</span>
                        ))}
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h5 className="font-semibold text-lg text-white">Meta Title</h5>
                          <CopyButton text={marketingData.seoStrategy.metaTitle} />
                        </div>
                        <p className="text-gray-300 leading-relaxed">{marketingData.seoStrategy.metaTitle || "—"}</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h5 className="font-semibold text-lg text-white">Meta Description</h5>
                          <CopyButton text={marketingData.seoStrategy.metaDescription} />
                        </div>
                        <p className="text-gray-300 leading-relaxed">{marketingData.seoStrategy.metaDescription || "—"}</p>
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h5 className="font-semibold text-lg text-white">Alt Text</h5>
                        <CopyButton text={marketingData.seoStrategy.altText} />
                      </div>
                      <p className="text-gray-300 leading-relaxed">{marketingData.seoStrategy.altText || "—"}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "content" && marketingData.contentMarketing && (
                <div id="panel-content" role="tabpanel" aria-labelledby="tab-content" className="space-y-6">
                  <div className="text-center mb-8">
                    <h4 className="text-2xl font-bold text-white mb-2">✍️ Content Marketing</h4>
                    <p className="text-gray-400">Copy you can use directly on your store and social media</p>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h5 className="font-semibold text-lg text-white">Product Title</h5>
                          <CopyButton text={marketingData.contentMarketing.productTitle} />
                        </div>
                        <p className="text-gray-300 leading-relaxed">{marketingData.contentMarketing.productTitle || "—"}</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h5 className="font-semibold text-lg text-white">Short Description</h5>
                          <CopyButton text={marketingData.contentMarketing.shortDescription} />
                        </div>
                        <p className="text-gray-300 leading-relaxed">{marketingData.contentMarketing.shortDescription || "—"}</p>
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h5 className="font-semibold text-lg text-white">Detailed Description</h5>
                        <CopyButton text={marketingData.contentMarketing.detailedDescription} />
                      </div>
                      <p className="text-gray-300 leading-relaxed">{marketingData.contentMarketing.detailedDescription || "—"}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h5 className="font-semibold text-lg text-white">Social Media Captions</h5>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2"><span className="text-white/80 font-medium">Instagram</span><CopyButton text={marketingData.contentMarketing.socialMediaCaptions.instagram} /></div>
                          <p className="text-gray-300 text-sm">{marketingData.contentMarketing.socialMediaCaptions.instagram || "—"}</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2"><span className="text-white/80 font-medium">Facebook</span><CopyButton text={marketingData.contentMarketing.socialMediaCaptions.facebook} /></div>
                          <p className="text-gray-300 text-sm">{marketingData.contentMarketing.socialMediaCaptions.facebook || "—"}</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2"><span className="text-white/80 font-medium">Pinterest</span><CopyButton text={marketingData.contentMarketing.socialMediaCaptions.pinterest} /></div>
                          <p className="text-gray-300 text-sm">{marketingData.contentMarketing.socialMediaCaptions.pinterest || "—"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "kit" && marketingData.structuredOutput && (
                <div id="panel-kit" role="tabpanel" aria-labelledby="tab-kit" className="space-y-6">
                  <div className="text-center mb-8">
                    <h4 className="text-2xl font-bold text-white mb-2">⚡ Quick Copy Kit</h4>
                    <p className="text-gray-400">Copy-ready content for listings and social posts</p>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    {[
                      { title: "Product Title", text: marketingData.structuredOutput.productTitle },
                      { title: "Product Description", text: marketingData.structuredOutput.productDescription },
                      { title: "Social Media Post", text: marketingData.structuredOutput.socialPost },
                      { title: "Hashtags", text: (marketingData.structuredOutput.hashtags || []).join(" ") },
                    ].map((card) => (
                      <div key={card.title} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h5 className="font-semibold text-lg text-white">{card.title}</h5>
                          <CopyButton text={card.text} />
                        </div>
                        <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{card.text || "—"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "pricing" && marketingData.pricingStrategy && (
                <div id="panel-pricing" role="tabpanel" aria-labelledby="tab-pricing" className="space-y-6">
                  <div className="text-center mb-8">
                    <h4 className="text-2xl font-bold text-white mb-2">💲 Pricing Strategy</h4>
                    <p className="text-gray-400">Smart pricing guidance with clear reasoning and comparison</p>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                      <div className="text-white/70 mb-2">Recommended Price</div>
                      <div className="text-3xl font-extrabold text-white">{marketingData.pricingStrategy.recommendedPrice || "—"}</div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h5 className="font-semibold text-lg text-white">Pricing Rationale</h5>
                          <CopyButton text={marketingData.pricingStrategy.pricingRationale} />
                        </div>
                        <p className="text-gray-300 leading-relaxed">{marketingData.pricingStrategy.pricingRationale || "—"}</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h5 className="font-semibold text-lg text-white">Market Comparison</h5>
                          <CopyButton text={marketingData.pricingStrategy.marketComparison} />
                        </div>
                        <p className="text-gray-300 leading-relaxed">{marketingData.pricingStrategy.marketComparison || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "channels" && marketingData.marketingChannels && (
                <div id="panel-channels" role="tabpanel" aria-labelledby="tab-channels" className="space-y-6">
                  <div className="text-center mb-8">
                    <h4 className="text-2xl font-bold text-white mb-2">📣 Marketing Channels</h4>
                    <p className="text-gray-400">Where to reach your audience effectively</p>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h5 className="font-semibold text-lg text-white mb-3">Primary Channels</h5>
                        <div className="flex flex-wrap gap-2">
                          {(marketingData.marketingChannels.primary || []).map((c, i) => (
                            <span key={i} className="px-3 py-1 rounded-full bg-purple-500/15 text-purple-200 text-sm border border-purple-500/20">{c}</span>
                          ))}
                        </div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h5 className="font-semibold text-lg text-white mb-3">Secondary Channels</h5>
                        <div className="flex flex-wrap gap-2">
                          {(marketingData.marketingChannels.secondary || []).map((c, i) => (
                            <span key={i} className="px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-200 text-sm border border-indigo-500/20">{c}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h5 className="font-semibold text-lg text-white">Why These Channels</h5>
                        <CopyButton text={marketingData.marketingChannels.reasoning} />
                      </div>
                      <p className="text-gray-300 leading-relaxed">{marketingData.marketingChannels.reasoning || "—"}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
