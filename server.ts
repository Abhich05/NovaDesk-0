import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client setup
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// In-memory support tickets store
const ticketsStore: Array<{
  id: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  summary: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved';
  category: string;
  createdAt: string;
  chatExcerpt?: string;
}> = [
  {
    id: 'TICK-9081',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.j@example.com',
    subject: 'Carrier marked package as delivered but not found',
    summary: 'Customer checked porch and mailroom, carrier tracking says delivered 2 hours ago.',
    priority: 'high',
    status: 'in_progress',
    category: 'Orders & Shipping',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    chatExcerpt: 'User: Carrier shows delivered but nothing is here.\nBot: Advised checking neighbors and opened expedited trace ticket.',
  },
  {
    id: 'TICK-9045',
    customerName: 'Marcus Vance',
    customerEmail: 'm.vance@company.org',
    subject: 'Request wholesale tax exemption invoice',
    summary: 'Bulk order inquiry with 501(c)(3) certificate request.',
    priority: 'medium',
    status: 'open',
    category: 'Billing & Account',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    chatExcerpt: 'User: How do I submit my tax exemption form for our order?\nBot: Offered to open ticket for billing department.',
  },
];

// Helper fallback matcher if API key is not present or API call fails
function localFaqMatch(message: string, faqs: Array<{ id: string; question: string; answer: string; category: string; keywords?: string[] }>, companyName: string) {
  const query = message.toLowerCase();
  
  // Scoring
  const scored = faqs.map((faq) => {
    let score = 0;
    const qLower = faq.question.toLowerCase();
    const aLower = faq.answer.toLowerCase();
    
    // Check keywords
    if (faq.keywords) {
      for (const kw of faq.keywords) {
        if (query.includes(kw.toLowerCase())) score += 3;
      }
    }
    
    // Direct phrase or word matches
    const words = query.split(/\s+/).filter(w => w.length > 3);
    for (const w of words) {
      if (qLower.includes(w)) score += 2;
      if (aLower.includes(w)) score += 1;
    }
    
    return { faq, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  const needsHuman = query.includes('human') || query.includes('agent') || query.includes('representative') || query.includes('person') || query.includes('lawyer') || query.includes('sue');

  if (best && best.score >= 2) {
    return {
      reply: `${best.faq.answer}\n\n*Referenced official policy: ${best.faq.question}*`,
      matchedFaqIds: [best.faq.id],
      suggestEscalation: needsHuman,
      suggestedFollowUps: [
        'How can I get a replacement?',
        'What is your refund timeframe?',
        'Can I talk to a customer service agent?'
      ]
    };
  }

  return {
    reply: `Thank you for contacting ${companyName} customer support! I could not find an exact match in our published FAQ directory for your inquiry. \n\nWould you like me to connect you with a live specialist or create a priority support ticket for our care team?`,
    matchedFaqIds: [],
    suggestEscalation: true,
    suggestedFollowUps: [
      'Speak to a human representative',
      'Track my current order',
      'What is your return policy?'
    ]
  };
}

// POST /api/chat - Main FAQ Bot Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], contextFaqs = [], companyProfile = {}, tone = 'friendly' } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message text is required' });
      return;
    }

    const companyName = companyProfile.name || 'NovaDesk Customer Support';
    const industry = companyProfile.industry || 'Customer Care';
    const supportEmail = companyProfile.supportEmail || 'support@example.com';
    const supportHours = companyProfile.supportHours || 'Mon-Fri 9am-6pm';

    // If Gemini client is unavailable, use high quality local FAQ matcher
    if (!ai) {
      const fallbackResult = localFaqMatch(message, contextFaqs, companyName);
      res.json(fallbackResult);
      return;
    }

    // Prepare system instructions with the FAQ Knowledge Base
    const faqCatalogText = (contextFaqs as Array<{ id: string; question: string; answer: string; category: string }>)
      .map(
        (f) =>
          `[FAQ ID: ${f.id}] [Category: ${f.category}]\nQuestion: ${f.question}\nAnswer: ${f.answer}\n`
      )
      .join('\n---\n');

    const systemInstruction = `You are the official Customer Support FAQ AI Assistant for "${companyName}" (${industry}).
Support Email: ${supportEmail}
Support Hours: ${supportHours}
Communication Tone: ${tone} (e.g. friendly, empathetic, concise, and helpful).

OFFICIAL COMPANY FAQ KNOWLEDGE BASE:
${faqCatalogText}

YOUR GUIDELINES:
1. Answer customer questions accurately, directly, and politely based on the FAQ Knowledge Base.
2. If the user's question maps directly or partially to one or more FAQs, provide an organized answer (use clean formatting with bullet points if listing steps).
3. If an answer requires account verification, payment changes, warehouse package intercept, or if the user asks for a human agent or is frustrated, politely summarize the policy and offer to create a support ticket / connect to an agent.
4. Always list the matching FAQ IDs from the provided knowledge base in matchedFaqIds.
5. Provide 2-3 short, relevant suggested follow-up questions in suggestedFollowUps that the customer might want to ask next.
6. Set suggestEscalation to true if the question cannot be resolved via FAQs or explicitly requests a human representative.

Return your response strictly in the JSON format requested.`;

    // Format conversation history
    const conversationPrompt = history
      .slice(-6)
      .map((m: { role: string; content: string }) => `${m.role === 'user' ? 'Customer' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const prompt = `${conversationPrompt ? `${conversationPrompt}\n` : ''}Customer: ${message}\nAssistant:`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: 'The helpful response text formatted for customer chat.',
            },
            matchedFaqIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'IDs of the FAQ items that were used or referenced.',
            },
            suggestEscalation: {
              type: Type.BOOLEAN,
              description: 'Whether to show the customer an option to escalate to human agent or create a ticket.',
            },
            suggestedFollowUps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2 to 3 natural follow up questions the customer might click.',
            },
          },
          required: ['reply', 'matchedFaqIds', 'suggestEscalation', 'suggestedFollowUps'],
        },
      },
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);

    res.json({
      reply: parsed.reply || "I'm here to help! Could you please clarify your question?",
      matchedFaqIds: Array.isArray(parsed.matchedFaqIds) ? parsed.matchedFaqIds : [],
      suggestEscalation: Boolean(parsed.suggestEscalation),
      suggestedFollowUps: Array.isArray(parsed.suggestedFollowUps) ? parsed.suggestedFollowUps : [],
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    // Graceful fallback to local FAQ matcher so user is never stranded
    const { message = '', contextFaqs = [], companyProfile = {} } = req.body || {};
    const fallback = localFaqMatch(message, contextFaqs, companyProfile.name || 'Customer Support');
    res.json(fallback);
  }
});

// GET /api/tickets - List support tickets
app.get('/api/tickets', (_req: Request, res: Response) => {
  res.json({ tickets: ticketsStore });
});

// POST /api/tickets - Create a new support ticket
app.post('/api/tickets', (req: Request, res: Response) => {
  const { customerName, customerEmail, subject, summary, priority = 'medium', category = 'General', chatExcerpt = '' } = req.body;

  if (!customerEmail || !subject) {
    res.status(400).json({ error: 'Customer email and subject are required.' });
    return;
  }

  const newTicket = {
    id: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: customerName || 'Valued Customer',
    customerEmail,
    subject,
    summary: summary || subject,
    priority: priority as 'low' | 'medium' | 'high' | 'urgent',
    status: 'open' as const,
    category,
    createdAt: new Date().toISOString(),
    chatExcerpt,
  };

  ticketsStore.unshift(newTicket);
  res.status(201).json({ ticket: newTicket, message: 'Ticket created successfully' });
});

// Mount Vite or serve static assets
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`NovaDesk Customer FAQ Server running on port ${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
