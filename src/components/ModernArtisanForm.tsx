"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArtisanFormSchema, type ArtisanFormValues } from "@/lib/validators/artisan";
import type { z } from "zod";
import { cn } from "@/lib/utils";
import { MarketingResults } from "./MarketingResults";

export function ModernArtisanForm() {
  const prefersReducedMotion = useReducedMotion();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [marketingContent, setMarketingContent] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<z.input<typeof ArtisanFormSchema>, unknown, ArtisanFormValues>({
    resolver: zodResolver<z.input<typeof ArtisanFormSchema>, unknown, ArtisanFormValues>(ArtisanFormSchema),
  });

  const imageFile = watch("image");

  // Handle image preview
  useEffect(() => {
    if (imageFile && imageFile[0]) {
      const file = imageFile[0];
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [imageFile]);

  const onSubmit = async (data: ArtisanFormValues) => {
    setIsGenerating(true);
    setMarketingContent("");

    try {
      const formData = new FormData();
  if (data.productName) formData.append("productName", data.productName);
      if (data.productDescription) {
        formData.append("productDescription", data.productDescription);
      }
  if (data.productCategory) formData.append("productCategory", data.productCategory);
  if (data.targetAudience) formData.append("targetAudience", data.targetAudience);
  if (data.priceRange) formData.append("priceRange", data.priceRange);
  if (data.marketingFocus) formData.append("marketingFocus", data.marketingFocus);
  if (data.businessStage) formData.append("businessStage", data.businessStage);
  if (data.language) formData.append("language", data.language);
  if (data.audiencePersona) formData.append("audiencePersona", data.audiencePersona);
  if (data.storyNotes) formData.append("storyNotes", data.storyNotes);
  // New optional fields
  if (data.city) formData.append("city", data.city);
  if (data.materials) formData.append("materials", data.materials);
  if (data.technique) formData.append("technique", data.technique);
  if (data.colorPalette) formData.append("colorPalette", data.colorPalette);
  if (data.dimensions) formData.append("dimensions", data.dimensions);
  if (data.capacity) formData.append("capacity", data.capacity);
  if (data.fulfillmentOptions) formData.append("fulfillmentOptions", data.fulfillmentOptions);
  if (data.deliveryRadiusKm) formData.append("deliveryRadiusKm", data.deliveryRadiusKm);
  if (data.turnaroundTimeDays) formData.append("turnaroundTimeDays", data.turnaroundTimeDays);
  if (data.customizable) formData.append("customizable", data.customizable);
  if (data.sustainability) formData.append("sustainability", data.sustainability);
  if (data.preferredChannels) formData.append("preferredChannels", data.preferredChannels);
  if (data.listingGoal) formData.append("listingGoal", data.listingGoal);
  if (data.stockStatus) formData.append("stockStatus", data.stockStatus);
      if (data.image && data.image[0]) {
        formData.append("image", data.image[0]);
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      let accumulatedContent = "";
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        accumulatedContent += chunk;
        setMarketingContent(accumulatedContent);
      }
    } catch (error) {
      console.error("Error generating marketing content:", error);
      setMarketingContent("Sorry, there was an error generating the marketing content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    reset();
    setMarketingContent("");
    setPreviewUrl(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setValue("image", e.dataTransfer.files as FileList);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div id="artisan-form" className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 relative">
      <motion.div
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {/* Header row with Back button (left) and a centered, refined title */}
        <motion.div variants={itemVariants} className="mb-10 grid grid-cols-3 items-center">
          <div className="justify-self-start">
              <button
                type="button"
                onClick={handleBack}
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 hover:text-white hover:bg-white/20 backdrop-blur-md shadow-md shadow-black/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                aria-label="Go back"
              >
                <i className="pi pi-arrow-left text-white/80 text-sm transition-transform duration-200 group-hover:-translate-x-0.5" aria-hidden="true" />
                <span>Back</span>
              </button>
            </div>
          <div className="justify-self-center text-center relative">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-wide md:tracking-wider">
              <span className="text-white">Upload</span>
              <span className="mx-2 text-white">&</span>
              <span className="text-white">Analyze</span>
            </h2>
            <div className="pointer-events-none absolute left-0 right-0 -bottom-3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
          <div className="justify-self-end" aria-hidden="true" />
          </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Enhanced Form Section */}
          <motion.div variants={itemVariants}>
            <div className="relative">
              {/* Glassmorphism container */}
              <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-3xl"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-3xl"></div>
              <div className="relative border border-white/10 rounded-3xl p-8 shadow-xl">
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  {/* Enhanced Image Upload only */}
                  <motion.div variants={itemVariants}>
                    <label className="block text-white font-medium mb-3">
                      Product Image *
                    </label>
                    <div
                      className={cn(
                        "relative border-2 border-dashed rounded-3xl p-8 transition-all duration-300 cursor-pointer group",
                        dragActive ? "border-blue-400/80 bg-blue-500/20" : "border-white/30 hover:border-white/50",
                        errors.image ? "border-red-400/50" : ""
                      )}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      <input
                        {...register("image")}
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        className="hidden"
                      />
                      
                      {previewUrl ? (
                        <div className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={previewUrl}
                            alt="Product preview"
                            className="w-full h-64 object-cover rounded-2xl"
                          />
                          <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <p className="text-white font-medium">Click to change image</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <motion.div
                            animate={prefersReducedMotion ? undefined : { y: [0, -10, 0] }}
                            transition={prefersReducedMotion ? undefined : { duration: 2, repeat: Infinity }}
                            className="mx-auto mb-4"
                          >
                            <i className="pi pi-upload text-white/60 text-[3.5rem] mx-auto" aria-hidden="true" />
                          </motion.div>
                          <p className="text-white/80 text-lg font-medium mb-2">
                            Drop your image here or click to browse
                          </p>
                          <p className="text-white/50 text-sm">
                            Support for JPEG, PNG, WebP (max 10MB)
                          </p>
                        </div>
                      )}
                    </div>
                    <AnimatePresence>
                      {errors.image && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-2 text-red-400 text-sm"
                        >
                          {errors.image.message?.toString()}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Drawer Toggle */}
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setShowFilters(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 transition"
                    >
                      <i className="pi pi-sliders-h text-white/80 text-sm" aria-hidden="true" />
                      Filters (optional)
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <motion.div variants={itemVariants} className="flex space-x-4">
                    <motion.button
                      type="submit"
                      disabled={isGenerating}
                      className="group relative flex-1 py-4 px-6 rounded-2xl overflow-hidden font-semibold text-white transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Animated background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Button content */}
                      <div className="relative flex items-center justify-center space-x-2">
                        {isGenerating ? (
                          <>
                            <i className="pi pi-spinner pi-spin text-[20px]" aria-hidden="true" />
                            <span>Generating Magic...</span>
                          </>
                        ) : (
                          <>
                            <i className="pi pi-magic text-[18px]" aria-hidden="true" />
                            <span>Generate Marketing Analysis</span>
                          </>
                        )}
                      </div>
                    </motion.button>
                    
                    <motion.button
                      type="button"
                      onClick={handleReset}
                      className="px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white font-medium hover:bg-white/20 transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Reset
                    </motion.button>
                  </motion.div>
                </form>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Results Section */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {(marketingContent || isGenerating) ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                >
                  <MarketingResults 
                    content={marketingContent} 
                    isLoading={isGenerating} 
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl rounded-3xl"></div>
                  <div className="relative border border-white/20 rounded-3xl p-8 text-center shadow-2xl">
                    <motion.div
                      animate={prefersReducedMotion ? undefined : { 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0] 
                      }}
                      transition={prefersReducedMotion ? undefined : { 
                        duration: 4, 
                        repeat: Infinity,
                        ease: "easeInOut" 
                      }}
                      className="text-white/30 mb-6"
                    >
                      <i className="pi pi-image text-[6rem] mx-auto" aria-hidden="true" />
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-white/90 mb-4">
                      Ready to Transform Your Product
                    </h3>
                    <p className="text-white/60 text-lg leading-relaxed">
                      Simply upload your product image and provide basic details. Our AI will analyze the image to understand your product and generate comprehensive marketing strategies, SEO optimization, and content recommendations automatically.
                    </p>
                    
                    <div className="mt-8 grid grid-cols-3 gap-4">
                      {[
                        { iconClass: "pi pi-search", label: "Image Analysis" },
                        { iconClass: "pi pi-chart-line", label: "SEO Optimization" },
                        { iconClass: "pi pi-sparkles", label: "Content Creation" },
                      ].map((feature, index) => (
                        <motion.div
                          key={feature.label}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.2 }}
                          className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                        >
                          <i className={`${feature.iconClass} text-white/70 text-xl mb-2`} />
                          <div className="text-white/70 text-xs font-medium">{feature.label}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>

      {/* Filters Drawer */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setShowFilters(false)}
            />
            {/* Panel */}
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 h-screen w-full max-w-md bg-[#0b1020] border-l border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="p-4 sticky top-0 bg-[#0b1020]/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/80">
                  <i className="pi pi-sliders-h text-white/80 text-sm" aria-hidden="true" />
                  <span className="font-semibold">Filters (optional)</span>
                </div>
                <button onClick={() => setShowFilters(false)} className="text-white/60 hover:text-white">
                  <i className="pi pi-times text-white text-base" aria-hidden="true" />
                </button>
              </div>
              <div className="p-4 space-y-3 h-[calc(100vh-64px)] overflow-y-auto scroll-smooth [color-scheme:dark]
                [&::-webkit-scrollbar]:w-2 
                [&::-webkit-scrollbar-track]:bg-[#0b1020] 
                [&::-webkit-scrollbar-thumb]:bg-white/10 
                [&::-webkit-scrollbar-thumb]:rounded-full 
                hover:[&::-webkit-scrollbar-thumb]:bg-white/20 ">
                {/* We reuse RHF register so values persist and submit with main form */}
                <div>
                  <label className="block text-white text-sm font-medium mb-1">Product Name</label>
                  <input {...register("productName")} type="text" placeholder="e.g., Handcrafted Ceramic Vase" className={cn("w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40", errors.productName && "border-red-400/50")}/>
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-1">Product Category</label>
                  <select {...register("productCategory")} className={cn("w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 appearance-none", errors.productCategory && "border-red-400/50") }>
                    <option value="" className="bg-gray-900">Select category</option>
                    <option value="jewelry" className="bg-gray-900">Jewelry</option>
                    <option value="pottery" className="bg-gray-900">Pottery & Ceramics</option>
                    <option value="textiles" className="bg-gray-900">Textiles & Fabric</option>
                    <option value="woodwork" className="bg-gray-900">Woodwork</option>
                    <option value="metalwork" className="bg-gray-900">Metalwork</option>
                    <option value="glasswork" className="bg-gray-900">Glasswork</option>
                    <option value="leather" className="bg-gray-900">Leather Goods</option>
                    <option value="paper" className="bg-gray-900">Paper & Cards</option>
                    <option value="home-decor" className="bg-gray-900">Home Decor</option>
                    <option value="art" className="bg-gray-900">Art & Paintings</option>
                    <option value="other" className="bg-gray-900">Other</option>
                  </select>
                </div>
                {/* New: Local context */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white text-sm font-medium mb-1">City / Region</label>
                    <input {...register("city")} type="text" placeholder="e.g., Jaipur" className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40"/>
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-1">Preferred Channels</label>
                    <input {...register("preferredChannels")} type="text" placeholder="e.g., Instagram, Etsy, WhatsApp" className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40"/>
                  </div>
                </div>
                {/* New: Craft details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white text-sm font-medium mb-1">Materials</label>
                    <input {...register("materials")} type="text" placeholder="e.g., Terracotta, Natural dyes" className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40"/>
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-1">Technique</label>
                    <input {...register("technique")} type="text" placeholder="e.g., Handloom, Hand-carved" className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40"/>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white text-sm font-medium mb-1">Color Palette</label>
                    <input {...register("colorPalette")} type="text" placeholder="e.g., Indigo, Earth tones" className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40"/>
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-1">Dimensions / Capacity</label>
                    <input {...register("dimensions")} type="text" placeholder="e.g., 12x8 cm or 500ml" className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40"/>
                  </div>
                </div>
                {/* New: Logistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white text-sm font-medium mb-1">Fulfillment</label>
                    <select {...register("fulfillmentOptions")} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 appearance-none">
                      <option value="" className="bg-[#0b1020] text-white">Select option</option>
                      <option value="pickup" className="bg-[#0b1020] text-white">Pickup</option>
                      <option value="local-delivery" className="bg-[#0b1020] text-white">Local Delivery</option>
                      <option value="shipping" className="bg-[#0b1020] text-white">Shipping</option>
                      <option value="pickup-delivery" className="bg-[#0b1020] text-white">Pickup + Delivery</option>
                      <option value="delivery-shipping" className="bg-[#0b1020] text-white">Delivery + Shipping</option>
                      <option value="all" className="bg-[#0b1020] text-white">All</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-1">Delivery Radius (km)</label>
                    <input {...register("deliveryRadiusKm")} type="text" placeholder="e.g., 10" className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40"/>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white text-sm font-medium mb-1">Turnaround Time (days)</label>
                    <input {...register("turnaroundTimeDays")} type="text" placeholder="e.g., 3-5" className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40"/>
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-1">Customizable</label>
                    <select {...register("customizable")} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 appearance-none">
                      <option value="" className="bg-[#0b1020] text-white">Select</option>
                      <option value="yes" className="bg-[#0b1020] text-white">Yes</option>
                      <option value="no" className="bg-[#0b1020] text-white">No</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white text-sm font-medium mb-1">Sustainability</label>
                    <select {...register("sustainability")} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 appearance-none">
                      <option value="" className="bg-[#0b1020] text-white">Select</option>
                      <option value="recycled" className="bg-[#0b1020] text-white">Recycled</option>
                      <option value="organic" className="bg-[#0b1020] text-white">Organic</option>
                      <option value="low-waste" className="bg-[#0b1020] text-white">Low-waste</option>
                      <option value="none" className="bg-[#0b1020] text-white">None</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-1">Listing Goal</label>
                    <select {...register("listingGoal")} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 appearance-none">
                      <option value="" className="bg-[#0b1020] text-white">Select</option>
                      <option value="sales" className="bg-[#0b1020] text-white">Sales</option>
                      <option value="leads" className="bg-[#0b1020] text-white">Leads</option>
                      <option value="awareness" className="bg-[#0b1020] text-white">Awareness</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-1">Stock Status</label>
                  <select {...register("stockStatus")} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 appearance-none">
                    <option value="" className="bg-[#0b1020] text-white">Select</option>
                    <option value="ready-to-ship" className="bg-[#0b1020] text-white">Ready to ship</option>
                    <option value="made-to-order" className="bg-[#0b1020] text-white">Made to order</option>
                    <option value="limited-stock" className="bg-[#0b1020] text-white">Limited stock</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white text-sm font-medium mb-1">Target Audience</label>
                    <input {...register("targetAudience")} type="text" placeholder="Young professionals" className={cn("w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40", errors.targetAudience && "border-red-400/50")}/>
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-1">Price Range</label>
                    <select {...register("priceRange")} className={cn("w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 appearance-none", errors.priceRange && "border-red-400/50") }>
                      <option value="" className="bg-gray-900">Select price range</option>
                      <option value="under-25" className="bg-gray-900">Under $25</option>
                      <option value="25-50" className="bg-gray-900">$25 - $50</option>
                      <option value="50-100" className="bg-gray-900">$50 - $100</option>
                      <option value="100-250" className="bg-gray-900">$100 - $250</option>
                      <option value="250-500" className="bg-gray-900">$250 - $500</option>
                      <option value="500-1000" className="bg-gray-900">$500 - $1,000</option>
                      <option value="over-1000" className="bg-gray-900">Over $1,000</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white text-sm font-medium mb-1">Marketing Focus</label>
                    <select {...register("marketingFocus")} className={cn("w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 appearance-none", errors.marketingFocus && "border-red-400/50") }>
                      <option value="" className="bg-gray-900">Select focus</option>
                      <option value="social-media" className="bg-gray-900">Social Media</option>
                      <option value="e-commerce" className="bg-gray-900">E-commerce</option>
                      <option value="local-market" className="bg-gray-900">Local Market</option>
                      <option value="premium-luxury" className="bg-gray-900">Premium/Luxury</option>
                      <option value="eco-friendly" className="bg-gray-900">Eco-Friendly</option>
                      <option value="custom-orders" className="bg-gray-900">Custom Orders</option>
                      <option value="gift-market" className="bg-gray-900">Gift Market</option>
                      <option value="wholesale" className="bg-gray-900">Wholesale</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-1">Business Stage</label>
                    <select {...register("businessStage")} className={cn("w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 appearance-none", errors.businessStage && "border-red-400/50") }>
                      <option value="" className="bg-gray-900">Select stage</option>
                      <option value="just-starting" className="bg-gray-900">Just Starting</option>
                      <option value="established-hobby" className="bg-gray-900">Established Hobby</option>
                      <option value="small-business" className="bg-gray-900">Small Business</option>
                      <option value="growing-business" className="bg-gray-900">Growing Business</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white text-sm font-medium mb-1">Language</label>
                    <select {...register("language")} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 appearance-none">
                      <option value="en" className="bg-gray-900">English</option>
                      <option value="hi" className="bg-gray-900">Hindi</option>
                      <option value="es" className="bg-gray-900">Spanish</option>
                      <option value="fr" className="bg-gray-900">French</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-1">Audience Persona</label>
                    <input {...register("audiencePersona")} type="text" placeholder="Eco-conscious millennials" className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40"/>
                  </div>
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-1">Story Notes</label>
                  <textarea {...register("storyNotes")} rows={2} placeholder="Few bullets of your inspiration" className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowFilters(false)} className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 font-medium">Confirm</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}