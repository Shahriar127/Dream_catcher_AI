import OpenAI from 'openai';

let cachedClient = null;
let cachedClientSignature = '';

function getProviderConfig() {
  if (process.env.GROQ_API_KEY) {
    return {
      provider: 'groq',
      apiKey: process.env.GROQ_API_KEY,
      baseURL: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
    };
  }

  if (process.env.OPENAI_API_KEY) {
    return {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
    };
  }

  throw new Error('Server misconfigured: set GROQ_API_KEY or OPENAI_API_KEY');
}

function getClient(apiKey, baseURL) {
  const signature = `${apiKey}:${baseURL || ''}`;

  if (!cachedClient || cachedClientSignature !== signature) {
    cachedClient = new OpenAI({
      apiKey,
      ...(baseURL ? { baseURL } : {})
    });
    cachedClientSignature = signature;
  }

  return cachedClient;
}

// Call OpenAI API for dream interpretation
export async function getDreamInterpretation(dreamText) {
  const config = getProviderConfig();
  const aiClient = getClient(config.apiKey, config.baseURL);

  try {
    const message = await aiClient.chat.completions.create({
      model: config.model,
      max_tokens: 512,
      messages: [
        {
          role: 'system',
          content: 'You are a thoughtful dream interpreter. Be insightful but gentle, and consider common dream symbolism. Keep your interpretation to 2-3 paragraphs.'
        },
        {
          role: 'user',
          content: `Dream: ${dreamText}`
        }
      ]
    });
    return message.choices[0].message.content.trim();
  } catch (error) {
    console.error(`${config.provider} API error:`, error);
    throw new Error(`API error: ${error.message}`);
  }
}
