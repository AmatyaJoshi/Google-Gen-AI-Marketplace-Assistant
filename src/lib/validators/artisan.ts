import { z } from 'zod';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const ArtisanFormSchema = z.object({
  // Optional text inputs – model can infer from image
  productName: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z
      .string()
      .min(2, { message: "Product name must be at least 2 characters long." })
      .max(100, { message: "Product name must be less than 100 characters." })
  ).optional(),

  productDescription: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string()
  ).optional(),

  productCategory: z
    .preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
      z.enum([
        "jewelry",
        "pottery",
        "textiles",
        "woodwork",
        "metalwork",
        "glasswork",
        "leather",
        "paper",
        "home-decor",
        "art",
        "other",
      ])
    )
    .optional(),

  targetAudience: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z
      .string()
      .min(3, { message: "Target audience must be at least 3 characters long." })
      .max(200, { message: "Target audience must be less than 200 characters." })
  ).optional(),

  priceRange: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string()
  ).optional(),

  marketingFocus: z
    .preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
      z.enum([
        "social-media",
        "e-commerce",
        "local-market",
        "premium-luxury",
        "eco-friendly",
        "custom-orders",
        "gift-market",
        "wholesale",
      ])
    )
    .optional(),

  businessStage: z
    .preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
      z.enum(["just-starting", "established-hobby", "small-business", "growing-business"])
    )
    .optional(),

  // Wow features – optional
  language: z
    .preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
      z.enum(["en", "hi", "es", "fr"]).default("en")
    )
    .optional(),

  audiencePersona: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string()
  ).optional(),

  storyNotes: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string()
  ).optional(),

  // Additional marketplace context for local artisans (all optional)
  city: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string()
  ).optional(),

  materials: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string()
  ).optional(),

  technique: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string()
  ).optional(),

  colorPalette: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string()
  ).optional(),

  dimensions: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string()
  ).optional(),

  capacity: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string()
  ).optional(),

  fulfillmentOptions: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.enum([
      "pickup",
      "local-delivery",
      "shipping",
      "pickup-delivery",
      "delivery-shipping",
      "all",
    ])
  ).optional(),

  deliveryRadiusKm: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string()
  ).optional(),

  turnaroundTimeDays: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string()
  ).optional(),

  customizable: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.enum(["yes", "no"])
  ).optional(),

  sustainability: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.enum(["recycled", "organic", "low-waste", "none"])
  ).optional(),

  preferredChannels: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string()
  ).optional(),

  listingGoal: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.enum(["sales", "leads", "awareness"])
  ).optional(),

  stockStatus: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.enum(["ready-to-ship", "made-to-order", "limited-stock"])
  ).optional(),

  image: z
    .any()
    .refine((files) => files?.length === 1, "Product image is required.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 10MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
});

export type ArtisanFormValues = z.output<typeof ArtisanFormSchema>;
