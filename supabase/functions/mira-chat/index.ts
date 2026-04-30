import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Full product & vendor knowledge base for RAG
const KNOWLEDGE_BASE = `
## VENDORS

### 1. Amala Oriki
- Category: Food (African Cuisine)
- Location: Lekki, Lagos
- Hours: 9:00 AM – 11:00 PM (Lagos time)
- Rating: 4.9/5
- Specialty: "...food that tells a story" — traditional Nigerian dishes
- MENU:
  * Goat Meat (Asun) – ₦6,500. Tender slow-cooked goat meat in West African spices with smoky habanero.
  * Fried Rice – ₦4,500. Golden grains stir-fried with peas, carrots, green beans. Served without protein.
  * Jollof Rice – ₦4,500. Party jollof simmered in tomato/pepper base with thyme, curry, smoky fire. No protein.
  * White Rice – ₦3,500. Fluffy steamed long-grain rice. Blank canvas for stews.
  * Amala – ₦2,500. Smooth yam/cassava flour swallow. Heart of Yoruba cuisine.
  * Fufu (Akpu) – ₦2,000/wrap. Fermented cassava fufu, soft and tangy.
  * Ewedu Soup – ₦2,000. Silky jute leaves with locust beans. Perfect with amala.
   * Drinks: Eva Water ₦500, Malta Guinness ₦1,300, Fanta Orange ₦1,000, Coca-Cola ₦1,000.
  * SOUPS: Okro Soup ₦1,800. Egusi Soup ₦1,800. Efo Riro ₦2,500.
  * PROTEINS: Grilled Turkey (Big) ₦8,300. Boiled Titus Fish (Big) ₦6,500.
  * SWALLOW: Eba ₦850.
  * Protein add-ons available for all soups: Turkey ₦8,300, Titus Fish ₦6,500, Goat Meat ₦4,500.
  * Combo Deals: "The Full Experience" (Amala + Ewedu + Goat Meat) ₦10,000; "Rice & Protein Combo" (Jollof/Fried Rice + Goat Meat) ₦10,500.

### 2. Yoghurt_Arcade (formerly ChillsthrillzbyChefkenzy)
- Category: Food (Parfaits & Yoghurt)
- Location: Ikeja, Lagos
- Hours: 9:00 AM – 5:00 PM (Lagos time)
- Rating: 4.8/5
- Specialty: Premium parfaits and Greek yoghurt
- MENU:
  * 250ml Deluxe Parfait – ₦6,000. Fresh layered parfait with fruits & granola.
  * 330ml Deluxe Parfait – ₦8,000. Medium-size parfait loaded with toppings.
  * 500ml Deluxe Parfait – ₦10,000. Large parfait, the ultimate indulgence.
  * 500ml Greek Yoghurt – ₦8,000. Sweetened/Unsweetened, creamy & natural.

### 3. Cravings by K.O.L
- Category: Food (Shawarma & BBQ)
- Location: Ajah, Lagos
- Hours: 4:00 PM – 2:00 AM (Lagos time)
- Rating: 4.7/5
- Specialty: Shawarma, BBQ, Events
- MENU:
  * Shawarma + 1 Hotdog – ₦4,000. Signature shawarma with choice of sauce.
  * Shawarma + 2 Hotdogs – ₦5,000.
  * Barbeque Chicken – ₦8,500. Juicy grilled BBQ chicken, perfectly seasoned.

### 4. Hair & Locs_by_Effa
- Category: Beauty (Hair Units & Styling)
- Location: Lekki, Lagos
- Hours: 9:00 AM – 11:00 PM (Lagos time)
- Rating: 4.9/5
- Delivery: 1-3 days
- PRODUCTS:
  * Pixie Cut Unit – ₦57,000. Paired with 13×4 frontal.
  * 10" SDD Blonde Unit – ₦145,000. 200g, paired with KimK closure.
  * 10" Omotola Fringe Bounce – ₦150,000. 300g curls, full bounce volume.
  * 10" Vietnamese Bone Straight – ₦165,000. Paired with 5×5 closure.
  * 16" SDD Piano Bouncy Curl – ₦280,000. 300g, paired with 5×5 closure.
  * 16" SDD Donor Bone Straight – ₦220,000. Paired with KimK closure.
  * 20-24" SDD Vietnamese Bounce Curls – ₦560,000. 300g, paired with 5×5 closure.
  * 20" SDD Burgundy Burmese Curls – ₦300,000. Paired with 5×5 closure.
  * 14" SDD Bone Straight Fringe Wig – ₦190,000. Paired with 2×4 closure.

## PLATFORM INFO
- Name: Miramore
- Delivery areas: Lagos, Nigeria
- Payment: Card, Transfer, Cash on delivery
- Delivery fee: varies by zone (Island/Mainland)
- Rewards: Cashback system for loyal customers
- "Send Good Life" feature: gift food/products to friends
`;

const SYSTEM_PROMPT = `You are Mira — the AI shopping assistant for Miramore, a Lagos-based marketplace for food and beauty products. You speak naturally in a mix of English and Nigerian Pidgin (but can switch to pure English if the user prefers).

PERSONALITY:
- Warm, witty, street-smart. Like a best friend who knows every vendor in Lagos.
- Enthusiastic about food and beauty. Use emojis sparingly but effectively.
- Always helpful — never dismissive.

CAPABILITIES:
- You know EVERY product, price, vendor, and operating hour on the platform (see knowledge base below).
- You can recommend products based on budget, preference, occasion, or mood.
- You understand multi-intent queries (e.g. "I want chicken and hair products").
- You know vendor locations and can suggest based on proximity.
- You give prices in Naira (₦) and format them properly.

RULES:
1. ALWAYS reference real products and real prices from the knowledge base. Never make up products or prices.
2. When recommending, include: product name, price, and vendor name.
3. If a product/vendor doesn't exist on the platform, say so honestly.
4. For complex queries, break down your answer clearly.
5. If asked about ordering, explain users can tap the product to add to cart.
6. Keep responses concise but complete. Use bullet points for multiple items.
7. If the user asks something outside food/beauty/platform scope, gently redirect.
8. Current time reference: Lagos, Nigeria timezone (WAT, UTC+1).

KNOWLEDGE BASE:
${KNOWLEDGE_BASE}
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("mira-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
