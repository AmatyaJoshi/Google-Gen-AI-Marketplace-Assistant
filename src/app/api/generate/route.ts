import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// Function to convert file to generative part
type InlineDataPart = { inlineData: { data: string; mimeType: string } };
type TextPart = { text: string };
async function fileToGenerativePart(file: File): Promise<InlineDataPart> {
  const arrayBuffer = await file.arrayBuffer();
  const base64EncodedData = Buffer.from(arrayBuffer).toString("base64");
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
}

// Marketing prompt template
const createMarketingPrompt = (
  {
    productName,
    description,
    productCategory,
    targetAudience,
    priceRange,
    marketingFocus,
    businessStage,
    language = "en",
    audiencePersona,
    storyNotes,
    // extra context
    city,
    materials,
    technique,
    colorPalette,
    dimensions,
    capacity,
    fulfillmentOptions,
    deliveryRadiusKm,
    turnaroundTimeDays,
    customizable,
    sustainability,
    preferredChannels,
    listingGoal,
    stockStatus,
  }: {
    productName?: string;
    description?: string | null;
    productCategory?: string;
    targetAudience?: string;
    priceRange?: string;
    marketingFocus?: string;
    businessStage?: string;
    language?: string;
    audiencePersona?: string;
    storyNotes?: string;
    // extra context
    city?: string;
    materials?: string;
    technique?: string;
    colorPalette?: string;
    dimensions?: string;
    capacity?: string;
    fulfillmentOptions?: string;
    deliveryRadiusKm?: string;
    turnaroundTimeDays?: string;
    customizable?: string;
    sustainability?: string;
    preferredChannels?: string;
    listingGoal?: string;
    stockStatus?: string;
  }
) => `
You are an expert marketing strategist and SEO specialist. Analyze the provided product image and create a comprehensive marketing strategy for this artisan product.

Product Details:
- Name: ${productName || '(infer from image)'}
- Description: ${description || 'Please analyze the image to determine product features and materials'}
- Category: ${productCategory || '(infer from image)'}
- Target Audience: ${targetAudience || '(infer from image)'}
- Price Range: ${priceRange || '(choose sensible bracket)'}
- Marketing Focus: ${marketingFocus || '(choose best fit)'}
- Business Stage: ${businessStage || '(assume small business)'}
- Output Language: ${language}
- Audience Persona Hint: ${audiencePersona || 'none'}
- Maker Story Notes: ${storyNotes || 'none'}
 - City/Region: ${city || 'unspecified'}
 - Materials: ${materials || 'infer from image'}
 - Technique: ${technique || 'infer from image'}
 - Color Palette: ${colorPalette || 'infer from image'}
 - Dimensions/Capacity: ${dimensions || capacity || 'infer/estimate from image'}
 - Fulfillment: ${fulfillmentOptions || 'unspecified'}
 - Delivery Radius (km): ${deliveryRadiusKm || 'unspecified'}
 - Turnaround Time (days): ${turnaroundTimeDays || 'unspecified'}
 - Customizable: ${customizable || 'unspecified'}
 - Sustainability: ${sustainability || 'unspecified'}
 - Preferred Channels: ${preferredChannels || 'unspecified'}
 - Listing Goal: ${listingGoal || 'unspecified'}
 - Stock Status: ${stockStatus || 'unspecified'}

Based on the image and product information, provide a detailed marketing analysis tailored to the specific category, marketing focus, and business stage. Format as JSON:

{
  "productAnalysis": {
    "visualDescription": "Detailed description of what you see in the image",
    "materialAnalysis": "Analysis of materials, craftsmanship, and quality indicators",
    "uniqueSellingPoints": ["List of 3-5 unique selling points"],
    "marketPositioning": "How this product should be positioned in the market"
  },
  "marketingStrategy": {
    "brandStory": "A compelling brand story for this product",
    "keyMessages": ["3-5 key marketing messages"],
    "valueProposition": "Clear value proposition statement",
    "competitiveAdvantage": "What makes this product stand out"
  },
  "seoStrategy": {
    "primaryKeywords": ["5-7 primary SEO keywords"],
    "longTailKeywords": ["7-10 long-tail keyword phrases"],
    "metaTitle": "SEO-optimized meta title (under 60 characters)",
    "metaDescription": "SEO-optimized meta description (under 160 characters)",
    "altText": "Image alt text for SEO"
  },
  "contentMarketing": {
    "productTitle": "Catchy product title for listings",
    "shortDescription": "Brief product description (2-3 sentences)",
    "detailedDescription": "Comprehensive product description for e-commerce",
    "socialMediaCaptions": {
      "instagram": "Instagram-optimized caption with hashtags",
      "facebook": "Facebook post caption",
      "pinterest": "Pinterest description"
    }
  },
  "structuredOutput": {
    "productTitle": "Catchy, SEO-friendly product name",
    "productDescription": "Single compelling paragraph for listing",
    "socialPost": "Ready-to-use IG/FB caption",
    "hashtags": ["10-20 mixed popular + niche hashtags"],
    "language": "${language}"
  },
  "pricingStrategy": {
    "recommendedPrice": "Based on analysis, suggest optimal pricing",
    "pricingRationale": "Explanation for the pricing recommendation",
    "marketComparison": "How this compares to similar products"
  },
  "marketingChannels": {
    "primary": ["3-4 best marketing channels for this product"],
    "secondary": ["2-3 additional channels to consider"],
    "reasoning": "Why these channels are recommended"
  },
  "localGoToMarket": {
    "citySpecificIdeas": ["2-4 local event/market ideas in the city/region"],
    "offlinePromotions": ["3-5 ideas suited for local artisans"],
    "fulfillmentNotes": "Actionable guidance based on fulfillment, delivery radius, and turnaround time"
  },
  "photoTip": "One-sentence photography tip to improve the product photo composition or lighting"
}

Ensure all content is professional, engaging, and tailored specifically to the product shown in the image. Focus on highlighting the artisan craftsmanship and unique qualities visible in the image. If language is not 'en', translate all outputs. Adapt tone and hashtags to suit the provided audience persona if any. Weave 'maker story notes' into descriptions when appropriate.

Return ONLY the JSON object above and nothing else (no commentary, no code fences, no markdown). Strictly valid JSON.
`;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
  const productName = (formData.get("productName") as string) || undefined;
  const productDescription = (formData.get("productDescription") as string) || undefined;
  const productCategory = (formData.get("productCategory") as string) || undefined;
  const targetAudience = (formData.get("targetAudience") as string) || undefined;
  const priceRange = (formData.get("priceRange") as string) || undefined;
  const marketingFocus = (formData.get("marketingFocus") as string) || undefined;
  const businessStage = (formData.get("businessStage") as string) || undefined;
  const language = (formData.get("language") as string) || "en";
  const audiencePersona = (formData.get("audiencePersona") as string) || undefined;
  const storyNotes = (formData.get("storyNotes") as string) || undefined;
  // New optional marketplace fields
  const city = (formData.get("city") as string) || undefined;
  const materials = (formData.get("materials") as string) || undefined;
  const technique = (formData.get("technique") as string) || undefined;
  const colorPalette = (formData.get("colorPalette") as string) || undefined;
  const dimensions = (formData.get("dimensions") as string) || undefined;
  const capacity = (formData.get("capacity") as string) || undefined;
  const fulfillmentOptions = (formData.get("fulfillmentOptions") as string) || undefined;
  const deliveryRadiusKm = (formData.get("deliveryRadiusKm") as string) || undefined;
  const turnaroundTimeDays = (formData.get("turnaroundTimeDays") as string) || undefined;
  const customizable = (formData.get("customizable") as string) || undefined;
  const sustainability = (formData.get("sustainability") as string) || undefined;
  const preferredChannels = (formData.get("preferredChannels") as string) || undefined;
  const listingGoal = (formData.get("listingGoal") as string) || undefined;
  const stockStatus = (formData.get("stockStatus") as string) || undefined;
    const image = formData.get("image") as File;

    if (!image) {
      return new Response("Product image is required.", { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    const imagePart = await fileToGenerativePart(image);
    const prompt = createMarketingPrompt({
      productName,
      description: productDescription ?? null,
      productCategory,
      targetAudience,
      priceRange,
      marketingFocus,
      businessStage,
      language,
      audiencePersona,
      storyNotes,
      // extra context
      city,
      materials,
      technique,
      colorPalette,
      dimensions,
      capacity,
      fulfillmentOptions,
      deliveryRadiusKm,
      turnaroundTimeDays,
      customizable,
      sustainability,
      preferredChannels,
      listingGoal,
      stockStatus,
    });

    const result = await model.generateContentStream({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt } as TextPart,
            imagePart,
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
          }
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        } catch (error) {
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Error in marketing generation:", error);
    if (error instanceof Error && "message" in error) {
      if (error.message.includes("API key not valid")) {
        return new Response("Invalid Google API Key.", { status: 401 });
      }
    }
    return new Response(
      "An unexpected error occurred. Please check the server logs.",
      { status: 500 }
    );
  }
}
