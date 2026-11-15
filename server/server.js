
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
    path: path.resolve(__dirname, "..", ".env")
});

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const projectRoot = path.resolve(__dirname, "..");

app.use(express.static(projectRoot));

// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "VÊLORA AI server is running" });
});

async function startServer() {
    const { GoogleGenAI } = await import("@google/genai");

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("GEMINI_API_KEY is missing from the root .env file.");
        process.exit(1);
    }

    const ai = new GoogleGenAI({ apiKey });

    app.post("/api/chat", async (req, res) => {
        try {
            const message = String(req.body.message || "").trim();
            const feature = String(req.body.feature || "fashion");

            const allowedFeatures = ["fashion", "products", "support"];

            if (!message) {
                return res.status(400).json({
                    reply: "Please enter a message."
                });
            }

            if (!allowedFeatures.includes(feature)) {
                return res.status(400).json({
                    reply: "Please select a valid VÊLORA AI feature."
                });
            }

            const products = Array.isArray(req.body.products)
                ? req.body.products.slice(0, 60)
                : [];

            const safeProducts = products.map(product => ({
                name: String(product.name || "").slice(0, 100),
                category: String(product.category || "").slice(0, 50),
                price: String(product.price || "").slice(0, 30),
                originalPrice: String(product.originalPrice || "").slice(0, 30),
                material: String(product.material || "").slice(0, 50),
                sizes: Array.isArray(product.sizes)
                    ? product.sizes.slice(0, 10).map(size => String(size))
                    : [],
                deliveryDays: String(product.deliveryDays || "").slice(0, 20)
            }));

            let instructions = "";

            if (feature === "fashion") {
                instructions = `
You are VÊLORA's friendly and professional AI Fashion Assistant.
Give helpful fashion advice, outfit combinations, colour suggestions,
styling tips and occasion-based recommendations.
Use simple, friendly language.
Do not invent products or prices.
`;
            }

            if (feature === "products") {
                instructions = `
You are VÊLORA's AI Product Recommendation Assistant.
Recommend products ONLY from the supplied VÊLORA catalogue.
Use actual product names, prices, materials and sizes.
Explain why each product matches the customer's request.
If no suitable product exists, say so honestly.
Never invent products, prices, discounts or availability.
`;
            }

            if (feature === "support") {
                instructions = `
You are VÊLORA's AI Customer Support Assistant.
Help with general shopping, delivery, returns, accounts and website questions.
You do not have access to private customer accounts or live order records.
Never pretend to have checked or changed an order.
Never ask for passwords, OTPs or payment card details.
`;
            }

            const prompt = `
${instructions}

VÊLORA is a fashion store for men, women, kids and maternity.

CUSTOMER MESSAGE:
${message}

CURRENT VÊLORA PRODUCT CATALOGUE:
${JSON.stringify(safeProducts)}

Answer the customer directly.
`;

            const response = await ai.models.generateContent({
                model: "gemini-3.5-flash-lite",
                contents: prompt
            });

            res.json({
                reply: response.text || "I'm sorry, I couldn't prepare a reply."
            });

        } catch (error) {
            console.error("Gemini request error:", error);

            res.status(500).json({
                reply: "Sorry, VÊLORA AI is temporarily unavailable. Please try again."
            });
        }
    });

    app.listen(PORT, () => {
        console.log(`VÊLORA AI server running at http://localhost:${PORT}`);
    });
}

startServer().catch(error => {
    console.error("Could not start VÊLORA AI server:", error);
    process.exit(1);
});
