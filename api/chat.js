// Mexcon Autos parts assistant — serverless chat endpoint (Vercel function).
//
// Flow: browser sends the conversation -> this function calls an
// OpenAI-compatible model (NVIDIA NIM by default) with tool calling ->
// the model asks for inventory/catalog lookups -> we query Supabase and
// feed results back -> the model writes the final answer.
//
// Secrets live only on the server (AI_API_KEY), never in the browser bundle.

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';
const AI_KEY = process.env.AI_API_KEY || process.env.NVIDIA_API_KEY || '';
const AI_BASE = (process.env.AI_BASE_URL || 'https://integrate.api.nvidia.com/v1').replace(/\/$/, '');
const MODEL = process.env.AI_MODEL || 'nvidia/llama-3.3-nemotron-super-49b-v1';

const COMPANY = {
  name: 'Mexcon Autos',
  tagline: 'Genuine Japanese and Korean auto spare parts, sourced for Nigeria.',
  location: 'Lagos, Nigeria',
  phone: '+234 903 577 7779',
  whatsapp: '+234 903 577 7779',
  email: 'info@mextechautospareparts.com',
  website: 'https://mextechautospareparts.com',
};

// Company knowledge baked into every conversation (mirrors the site's
// FAQs, payment and guarantee pages so the bot can answer both inventory
// and service questions without an extra data source).
const SYSTEM_PROMPT = [
  `You are the Mexcon Autos parts assistant, a friendly expert on the parts ${COMPANY.name} has in stock.`,
  ``,
  `Company facts:`,
  `- ${COMPANY.tagline}`,
  `- Located in ${COMPANY.location}.`,
  `- Phone: ${COMPANY.phone} | WhatsApp: ${COMPANY.whatsapp} | Email: ${COMPANY.email}`,
  `- All parts are 100% genuine, sourced from manufacturers and authorized distributors in Japan and Korea.`,
  `- Nationwide delivery within 24-48 hours (Lagos usually ~24h).`,
  `- Payment methods: bank transfer, card (Visa, Mastercard, Verve) and pay-on-delivery in select cities (Lagos, Abuja, Port Harcourt, Ibadan).`,
  `- 30-day returns for unused, unopened parts that don't fit or are defective.`,
  `- Most parts carry a 3-12 month manufacturer warranty (see the product page).`,
  `- We currently stock only these brands: Lexus, Toyota, Honda, Mitsubishi, Nissan, Acura, Kia, Hyundai.`,
  `- If a part is not in stock we can still source it — a quote request gets a reply within 24 hours.`,
  ``,
  `Inventory rules (MOST IMPORTANT):`,
  `- ALWAYS call search_inventory before claiming we have a part or quoting a price. Never invent parts or prices.`,
  `- If search_inventory returns nothing relevant, say we don't currently list that part, then offer the quote-request form (${COMPANY.website}/quote-request) or WhatsApp ${COMPANY.whatsapp}, and note we can source it within 24 hours.`,
  `- Use list_categories / list_brands when the customer asks what we stock.`,
  `- Give the exact part_number and OEM number when citing a product, and prices in Naira (NGN).`,
  `- Be honest about availability. Prices and stock change; recommend the shop (${COMPANY.website}/shop) or WhatsApp to confirm.`,
  ``,
  `Style: concise, warm, plain language. Short paragraphs or a small bulleted list. Keep answers under ~160 words unless the customer asks for detail. Never mention your model or provider.`,
].join('\n');

// ---------------------------------------------------------------------------
// LLM helper: OpenAI-compatible chat completions (NVIDIA NIM by default)
// ---------------------------------------------------------------------------

async function callLLM(messages, tools) {
  const payload = {
    model: MODEL,
    messages,
    tools: tools.map((t) => ({
      type: 'function',
      function: { name: t.name, description: t.description, parameters: t.parameters },
    })),
    tool_choice: 'auto',
    temperature: 0.3,
    max_tokens: 900,
  };
  const backoffs = [900, 2300];
  let lastErr = null;
  for (let attempt = 0; attempt <= backoffs.length; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, backoffs[attempt - 1] + Math.floor(Math.random() * 400)));
    try {
      const res = await fetch(`${AI_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AI_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let detail = '';
        try {
          detail = JSON.stringify((await res.json()).error || {});
        } catch {
          /* ignore */
        }
        // Retry on 5xx (transient platform blips), not on 4xx.
        if (res.status >= 500) { lastErr = `LLM ${res.status}: ${detail}`; continue; }
        throw new Error(`LLM ${res.status}: ${detail}`);
      }
      const data = await res.json();
      const message = data?.choices?.[0]?.message || {};
      return { message };
    } catch (err) {
      lastErr = err.message;
    }
  }
  throw new Error(lastErr || 'LLM request failed');
}

// ---------------------------------------------------------------------------
// Supabase catalog lookups (public, RLS-readable tables)
// ---------------------------------------------------------------------------

async function catalogQuery(path, extra = '') {
  const url = `${SUPABASE_URL}/rest/v1/${path}${extra}`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
  return res.json();
}

function catalogRows(raw) {
  return raw.map((r) => ({
    id: r.id,
    name: r.name,
    part_number: r.part_number,
    oem_number: r.oem_number,
    price: r.price,
    stock_status: r.stock_status,
    condition_label: r.condition_label,
    warranty_months: r.warranty_months,
    description: r.description,
    compatible_models: r.compatible_models,
    brand: r.brands?.name || null,
    category: r.categories?.name || null,
  }));
}

async function fetchAllProducts() {
  const raw = await catalogQuery(
    'products',
    '?select=id,name,part_number,oem_number,price,stock_status,condition_label,warranty_months,description,compatible_models,brands(name),categories(name)&is_active=eq.true&order=name.asc'
  );
  return catalogRows(raw);
}

async function searchInventory(query) {
  const q = String(query || '').trim().toLowerCase();
  const products = await fetchAllProducts();
  const tokens = q.split(/\s+/).filter(Boolean);

  const score = (p) => {
    const haystacks = [
      p.name || '',
      p.part_number || '',
      p.oem_number || '',
      p.brand || '',
      p.category || '',
      Array.isArray(p.compatible_models) ? p.compatible_models.join(' ') : p.compatible_models || '',
      p.description || '',
    ].map((s) => s.toLowerCase());
    const hay = haystacks.join(' | ');
    if (tokens.some((t) => (p.part_number || '').toLowerCase() === t || (p.oem_number || '').toLowerCase() === t)) return 1000;
    return tokens.reduce((acc, t) => acc + (hay.includes(t) ? 1 : 0), 0);
  };

  const ranked = products
    .map((p) => ({ p, s: score(p) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 6)
    .map((x) => ({
      name: x.p.name,
      part_number: x.p.part_number,
      oem_number: x.p.oem_number,
      price: x.p.price,
      brand: x.p.brand,
      category: x.p.category,
      stock_status: x.p.stock_status,
      condition_label: x.p.condition_label,
      warranty_months: x.p.warranty_months,
      compatible_models: Array.isArray(x.p.compatible_models) ? x.p.compatible_models.slice(0, 6) : x.p.compatible_models,
      description: x.p.description ? x.p.description.slice(0, 160) : null,
    }));
  return { query, count: ranked.length, matches: ranked };
}

async function listCategories() {
  const raw = await catalogQuery('categories', '?select=name,slug,description&is_active=eq.true&order=order_index.asc');
  return { categories: raw };
}

async function listBrands() {
  const raw = await catalogQuery('brands', '?select=name,country&is_active=eq.true&order=order_index.asc');
  return { brands: raw };
}

// ---------------------------------------------------------------------------
// Tool wiring
// ---------------------------------------------------------------------------

const TOOLS = [
  {
    name: 'search_inventory',
    description:
      'Search the Mexcon Autos in-stock catalog by any keyword: part name, part number, OEM number, brand, category or compatible vehicle/model. Returns up to 6 matching products with price and part numbers.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The product or vehicle the customer is asking about, e.g. "Corolla water pump", "16100-29065", "Hyundai" or "Lexus RX350".' },
      },
      required: ['query'],
    },
  },
  {
    name: 'list_categories',
    description: 'List the part categories Mexcon Autos currently stocks (e.g. Water Pumps, Fuel Pumps).',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'list_brands',
    description: 'List the car brands Mexcon Autos currently stocks (Lexus, Toyota, Honda, Mitsubishi, Nissan, Acura, Kia, Hyundai).',
    parameters: { type: 'object', properties: {} },
  },
];

async function executeTool(name, args) {
  switch (name) {
    case 'search_inventory':
      return searchInventory(args?.query);
    case 'list_categories':
      return listCategories();
    case 'list_brands':
      return listBrands();
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// ---------------------------------------------------------------------------
// Request handling
// ---------------------------------------------------------------------------

function sanitizeMessages(raw) {
  const list = Array.isArray(raw) ? raw : [];
  return list
    .filter((m) => m && (m.role === 'user' || m.role === 'model' || m.role === 'assistant') && typeof m.text === 'string')
    .slice(-12)
    .map((m) => ({
      role: m.role === 'model' ? 'assistant' : m.role,
      content: m.text.slice(0, 2000),
    }));
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true, service: 'mexcon-parts-assistant', model: MODEL }));
    return;
  }
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  if (!AI_KEY) {
    res.statusCode = 503;
    res.end(JSON.stringify({ error: 'Assistant is not configured yet.' }));
    return;
  }

  let body = {};
  try {
    body = typeof req.body === 'object' && req.body ? req.body : JSON.parse(req.body || '{}');
  } catch {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Invalid JSON body.' }));
    return;
  }

  const history = sanitizeMessages(body.messages);
  if (!history.length) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'No messages provided.' }));
    return;
  }

  try {
    const messages = [{ role: 'system', content: SYSTEM_PROMPT }, ...history];

    let reply = null;
    for (let round = 0; round < 5 && reply === null; round++) {
      const { message } = await callLLM(messages, TOOLS);
      const calls = Array.isArray(message.tool_calls) ? message.tool_calls : [];

      if (!calls.length) {
        reply = (message.content || '').trim();
        if (!reply) throw new Error('Model returned an empty answer.');
        break;
      }

      messages.push({ role: 'assistant', content: message.content || null, tool_calls: calls });
      for (const call of calls) {
        let args = {};
        try {
          args = JSON.parse(call.function.arguments || '{}');
        } catch {
          /* malformed args (rare) — let the model fix itself */
        }
        const result = await executeTool(call.function.name, args);
        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify(result),
        });
      }
    }

    if (reply === null) {
      reply = 'I could not work that out in time. Please call or WhatsApp us on +234 903 577 7779 and we will help.';
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ reply }));
  } catch (err) {
    console.error('chat error:', err.message);
    const creditIssue = /429|402|quota|credit|rate.?limit|insufficient/i.test(err.message || '');
    res.statusCode = creditIssue ? 429 : 500;
    res.end(
      JSON.stringify({
        error: creditIssue
          ? 'Our AI assistant is temporarily unavailable (usage limit reached). Please message us on WhatsApp (+234 903 577 7779) or use the quote form — we reply within 24 hours.'
          : 'Sorry, something went wrong. Please try again or WhatsApp +234 903 577 7779.',
      })
    );
  }
}