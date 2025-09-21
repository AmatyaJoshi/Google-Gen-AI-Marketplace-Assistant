"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { ArtisanFormSchema, type ArtisanFormValues } from "@/lib/validators/artisan";
import { cn } from "@/lib/utils";
import { MarketingResults } from "./MarketingResults";

export function ArtisanForm() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [marketingContent, setMarketingContent] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<z.input<typeof ArtisanFormSchema>, any, ArtisanFormValues>({
    resolver: zodResolver<z.input<typeof ArtisanFormSchema>, any, ArtisanFormValues>(ArtisanFormSchema),
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            AI Artisan Assistant
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Upload your product image and provide basic details. Our AI will analyze the image and generate comprehensive marketing strategies, SEO optimization, and content recommendations automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form Section */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Information</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Product Name (optional) */}
              <div>
                <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name (optional)
                </label>
                <input
                  {...register("productName")}
                  type="text"
                  id="productName"
                  className={cn(
                    "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    errors.productName ? "border-red-300" : "border-gray-300"
                  )}
                  placeholder="Enter your product name"
                />
                {errors.productName && (
                  <p className="mt-1 text-sm text-red-600">{errors.productName.message}</p>
                )}
              </div>

              {/* Product Category (optional) */}
              <div>
                <label htmlFor="productCategory" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Category (optional)
                </label>
                <select
                  {...register("productCategory")}
                  id="productCategory"
                  className={cn(
                    "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    errors.productCategory ? "border-red-300" : "border-gray-300"
                  )}
                >
                  <option value="">Select a category</option>
                  <option value="jewelry">Jewelry</option>
                  <option value="pottery">Pottery & Ceramics</option>
                  <option value="textiles">Textiles & Fabric</option>
                  <option value="woodwork">Woodwork</option>
                  <option value="metalwork">Metalwork</option>
                  <option value="glasswork">Glasswork</option>
                  <option value="leather">Leather Goods</option>
                  <option value="paper">Paper & Cards</option>
                  <option value="home-decor">Home Decor</option>
                  <option value="art">Art & Paintings</option>
                  <option value="other">Other</option>
                </select>
                {errors.productCategory && (
                  <p className="mt-1 text-sm text-red-600">{errors.productCategory.message}</p>
                )}
              </div>

              {/* Product Description */}
              <div>
                <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Description <span className="text-gray-500">(Optional - AI will analyze from image)</span>
                </label>
                <textarea
                  {...register("productDescription")}
                  id="productDescription"
                  rows={4}
                  className={cn(
                    "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    errors.productDescription ? "border-red-300" : "border-gray-300"
                  )}
                  placeholder="Describe your product, its features, materials, craftsmanship, etc."
                />
                {errors.productDescription && (
                  <p className="mt-1 text-sm text-red-600">{errors.productDescription.message}</p>
                )}
              </div>

              {/* Target Audience (optional) */}
              <div>
                <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience (optional)
                </label>
                <input
                  {...register("targetAudience")}
                  type="text"
                  id="targetAudience"
                  className={cn(
                    "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    errors.targetAudience ? "border-red-300" : "border-gray-300"
                  )}
                  placeholder="e.g., young professionals, art collectors, home decorators"
                />
                {errors.targetAudience && (
                  <p className="mt-1 text-sm text-red-600">{errors.targetAudience.message}</p>
                )}
              </div>

              {/* Price Range (optional) */}
              <div>
                <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (optional)
                </label>
                <select
                  {...register("priceRange")}
                  id="priceRange"
                  className={cn(
                    "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    errors.priceRange ? "border-red-300" : "border-gray-300"
                  )}
                >
                  <option value="">Select a price range</option>
                  <option value="under-25">Under $25</option>
                  <option value="25-50">$25 - $50</option>
                  <option value="50-100">$50 - $100</option>
                  <option value="100-250">$100 - $250</option>
                  <option value="250-500">$250 - $500</option>
                  <option value="500-1000">$500 - $1,000</option>
                  <option value="over-1000">Over $1,000</option>
                </select>
                {errors.priceRange && (
                  <p className="mt-1 text-sm text-red-600">{errors.priceRange.message}</p>
                )}
              </div>

              {/* Marketing Focus (optional) */}
              <div>
                <label htmlFor="marketingFocus" className="block text-sm font-medium text-gray-700 mb-2">
                  Marketing Focus (optional)
                </label>
                <select
                  {...register("marketingFocus")}
                  id="marketingFocus"
                  className={cn(
                    "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    errors.marketingFocus ? "border-red-300" : "border-gray-300"
                  )}
                >
                  <option value="">Select marketing focus</option>
                  <option value="social-media">Social Media</option>
                  <option value="e-commerce">E-commerce</option>
                  <option value="local-market">Local Market</option>
                  <option value="premium-luxury">Premium/Luxury</option>
                  <option value="eco-friendly">Eco-Friendly</option>
                  <option value="custom-orders">Custom Orders</option>
                  <option value="gift-market">Gift Market</option>
                  <option value="wholesale">Wholesale</option>
                </select>
                {errors.marketingFocus && (
                  <p className="mt-1 text-sm text-red-600">{errors.marketingFocus.message}</p>
                )}
              </div>

              {/* Business Stage (optional) */}
              <div>
                <label htmlFor="businessStage" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Stage (optional)
                </label>
                <select
                  {...register("businessStage")}
                  id="businessStage"
                  className={cn(
                    "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    errors.businessStage ? "border-red-300" : "border-gray-300"
                  )}
                >
                  <option value="">Select business stage</option>
                  <option value="just-starting">Just Starting</option>
                  <option value="established-hobby">Established Hobby</option>
                  <option value="small-business">Small Business</option>
                  <option value="growing-business">Growing Business</option>
                </select>
                {errors.businessStage && (
                  <p className="mt-1 text-sm text-red-600">{errors.businessStage.message}</p>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image *
                </label>
                <input
                  {...register("image")}
                  type="file"
                  id="image"
                  accept="image/*"
                  className={cn(
                    "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    errors.image ? "border-red-300" : "border-gray-300"
                  )}
                />
                {errors.image && (
                  <p className="mt-1 text-sm text-red-600">{errors.image.message?.toString()}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Upload a clear image of your product (max 10MB). Supported formats: JPEG, PNG, WebP
                </p>
              </div>

              {/* Image Preview */}
              {previewUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview
                  </label>
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Product preview"
                      className="w-full h-48 object-cover rounded-md border"
                    />
                  </div>
                </div>
              )}

              {/* Wow Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    {...register("language")}
                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Audience Persona (optional)</label>
                  <input
                    {...register("audiencePersona")}
                    type="text"
                    placeholder="e.g., Eco-conscious millennials"
                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Story Notes (optional)</label>
                  <input
                    {...register("storyNotes")}
                    type="text"
                    placeholder="Few bullets of your inspiration"
                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    isGenerating
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  )}
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    "Generate Marketing Analysis"
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-1">
            {(marketingContent || isGenerating) && (
              <MarketingResults 
                content={marketingContent} 
                isLoading={isGenerating} 
              />
            )}
            
            {!marketingContent && !isGenerating && (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ready to Analyze Your Product
                </h3>
                <p className="text-gray-600">
                  Fill out the form and upload your product image. Our AI will analyze the image to understand your product and generate comprehensive marketing insights, SEO recommendations, and content strategies tailored for your artisan business.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}