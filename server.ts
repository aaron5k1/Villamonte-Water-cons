import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface UserContext {
  currentMl?: number;
  goalMl?: number;
  unit?: string;
  streak?: number;
}

// System instructions by role
const SYSTEM_INSTRUCTIONS = {
  coach: (ctx?: UserContext) =>
    `You are the Water cons Hydration & Wellness Coach. Your mission is to help the user maintain healthy daily hydration habits, hit their daily goals, and feel energized. Be encouraging, warm, science-informed, and practical. Current user state: ${
      ctx ? `${ctx.currentMl || 0} ${ctx.unit || 'ml'} consumed out of ${ctx.goalMl || 2500} ${ctx.unit || 'ml'} goal (${ctx.streak || 1} day streak).` : 'No log data provided.'
    } Provide actionable suggestions, timing tips, and beverage insights.`,

  quick: (ctx?: UserContext) =>
    `You are the Water cons Quick Sip Assistant. Provide lightning-fast, crisp, and direct answers about water intake, hydration quick-facts, and beverage comparisons. Keep responses concise, direct, and under 3-4 sentences whenever possible.`,

  specialist: (ctx?: UserContext) =>
    `You are the Water cons Clinical & Sports Hydration Specialist. You specialize in deep fluid and electrolyte physiology, sweat rate estimation, exercise hyperthermia prevention, sodium-potassium-magnesium balance, and performance hydration science. Provide thorough, scientifically grounded explanations with physiological reasoning. Include brief disclaimers when discussing medical conditions.`,
};

// Multi-turn Gemini chat API endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, roleId = 'coach', userContext } = req.body as {
      messages: ChatMessage[];
      roleId: 'coach' | 'quick' | 'specialist';
      userContext?: UserContext;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Gemini API key is not configured in environment secrets.',
      });
    }

    // Model selection per requirements:
    // - gemini-3.1-pro-preview for particularly complex tasks
    // - gemini-3.5-flash for general tasks
    // - gemini-3.1-flash-lite for tasks that should happen fast
    let selectedModel = 'gemini-3.5-flash';
    if (roleId === 'specialist') {
      selectedModel = 'gemini-3.1-pro-preview';
    } else if (roleId === 'quick') {
      selectedModel = 'gemini-3.1-flash-lite';
    }

    const systemInstruction = SYSTEM_INSTRUCTIONS[roleId]
      ? SYSTEM_INSTRUCTIONS[roleId](userContext)
      : SYSTEM_INSTRUCTIONS.coach(userContext);

    // Format conversation history for Gemini API
    const contents = messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || 'I could not generate a response. Please try again.';

    return res.json({
      reply,
      modelUsed: selectedModel,
      roleId,
    });
  } catch (error: any) {
    console.error('Error generating chat response:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate response from Gemini.',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Water cons full-stack server running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
