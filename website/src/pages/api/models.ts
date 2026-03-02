/**
 * API endpoint to fetch available models from AI providers
 * Returns real, current models from OpenAI, Anthropic, and Gemini APIs
 */

import type { APIRoute } from 'astro';

export const prerender = false;

interface ModelInfo {
  value: string;
  label: string;
}

/**
 * Fetch OpenAI models
 */
async function fetchOpenAIModels(apiKey: string): Promise<ModelInfo[]> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    if (!response.ok) return [];

    const data = await response.json();
    const models: ModelInfo[] = [];

    // Filter ONLY chat-capable models with full tool support
    const validModels = (data.data || [])
      .filter((m: any) => {
        const id = m.id.toLowerCase();

        // Exclude non-chat models
        if (id.includes('embed') || id.includes('whisper') || id.includes('tts') ||
            id.includes('dall-e') || id.includes('audio') || id.includes('moderation') ||
            id.includes('realtime') || id.includes('transcribe') || id.includes('search')) {
          return false;
        }

        // EXCLUDE o-series (o1, o3, o4) - they don't support tools!
        if (id.match(/^o[134](-|$)/)) return false;

        // Include only chat-compatible models with tool support
        // GPT-5.x chat models
        if (id.includes('gpt-5') && id.includes('chat')) return true;
        // GPT-5.1 chat models
        if (id.includes('gpt-5.1') && id.includes('chat')) return true;
        // GPT-5 mini/nano (usually chat)
        if (id.match(/gpt-5[.-]?(mini|nano)/)) return true;
        // GPT-4o and variants
        if (id.startsWith('gpt-4o')) return true;
        // GPT-4 turbo
        if (id.includes('gpt-4-turbo')) return true;

        return false;
      })
      .sort((a: any, b: any) => {
        // Prioritize newer models
        const priority = (id: string) => {
          if (id.includes('gpt-5.1') && id.includes('chat')) return 1;
          if (id.includes('gpt-5') && id.includes('chat')) return 2;
          if (id.includes('gpt-5.1-mini') || id.includes('gpt-5-mini')) return 3;
          if (id.startsWith('gpt-4o') && !id.includes('mini')) return 4;
          if (id.includes('gpt-4o-mini')) return 5;
          if (id.includes('gpt-4-turbo')) return 6;
          return 10;
        };
        return priority(a.id) - priority(b.id);
      });

    for (const m of validModels.slice(0, 10)) {
      let label = m.id;
      // Add descriptions
      if (m.id.includes('chat')) label = `${m.id} (чат)`;
      else if (m.id.includes('mini')) label = `${m.id} (быстрый)`;
      else if (m.id.includes('nano')) label = `${m.id} (легкий)`;

      models.push({ value: m.id, label });
    }

    return models.length > 0 ? models : [{ value: 'gpt-4o', label: 'gpt-4o' }];
  } catch (e) {
    console.error('Error fetching OpenAI models:', e);
    return [{ value: 'gpt-4o', label: 'gpt-4o' }];
  }
}

/**
 * Fetch Anthropic models
 */
async function fetchAnthropicModels(apiKey: string): Promise<ModelInfo[]> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
    });

    if (!response.ok) return [];

    const data = await response.json();
    const models: ModelInfo[] = [];

    // Sort by capability (opus > sonnet > haiku)
    const validModels = (data.data || [])
      .filter((m: any) => m.id.startsWith('claude-'))
      .sort((a: any, b: any) => {
        const priority = (id: string) => {
          if (id.includes('opus')) return 1;
          if (id.includes('sonnet')) return 2;
          if (id.includes('haiku')) return 3;
          return 10;
        };
        // Also sort by version (higher first)
        const versionScore = (id: string) => {
          const match = id.match(/(\d+)-(\d+)/);
          if (match) return parseInt(match[1]) * 10 + parseInt(match[2]);
          return 0;
        };
        const pA = priority(a.id), pB = priority(b.id);
        if (pA !== pB) return pA - pB;
        return versionScore(b.id) - versionScore(a.id);
      });

    for (const m of validModels.slice(0, 6)) {
      let label = m.display_name || m.id;
      if (m.id.includes('opus')) label += ' (топ)';
      else if (m.id.includes('haiku')) label += ' (быстрый)';

      models.push({ value: m.id, label });
    }

    return models.length > 0 ? models : [{ value: 'claude-sonnet-4-5-20250929', label: 'Claude Sonnet 4.5' }];
  } catch (e) {
    console.error('Error fetching Anthropic models:', e);
    return [{ value: 'claude-sonnet-4-5-20250929', label: 'Claude Sonnet 4.5' }];
  }
}

/**
 * Fetch Gemini models
 */
async function fetchGeminiModels(apiKey: string): Promise<ModelInfo[]> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!response.ok) return [];

    const data = await response.json();
    const models: ModelInfo[] = [];

    // Filter generateContent-capable models
    const validModels = (data.models || [])
      .filter((m: any) => {
        const methods = m.supportedGenerationMethods || [];
        return methods.includes('generateContent') && m.name.includes('gemini');
      })
      .sort((a: any, b: any) => {
        const priority = (name: string) => {
          if (name.includes('gemini-3')) return 1;
          if (name.includes('gemini-2.5-pro')) return 2;
          if (name.includes('gemini-2.5-flash')) return 3;
          if (name.includes('gemini-2.0')) return 4;
          if (name.includes('gemini-1.5-pro')) return 5;
          if (name.includes('gemini-1.5-flash')) return 6;
          return 10;
        };
        return priority(a.name) - priority(b.name);
      });

    for (const m of validModels.slice(0, 8)) {
      // Extract model ID from "models/gemini-xxx" format
      const modelId = m.name.replace('models/', '');
      let label = m.displayName || modelId;

      if (modelId.includes('pro')) label += ' (мощный)';
      else if (modelId.includes('flash-lite')) label += ' (легкий)';
      else if (modelId.includes('flash')) label += ' (быстрый)';

      models.push({ value: modelId, label });
    }

    return models.length > 0 ? models : [{ value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' }];
  } catch (e) {
    console.error('Error fetching Gemini models:', e);
    return [{ value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' }];
  }
}

/**
 * Fetch Z.AI models (OpenAI-compatible API)
 */
async function fetchZaiModels(apiKey: string): Promise<ModelInfo[]> {
  try {
    const response = await fetch('https://api.z.ai/api/paas/v4/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    if (!response.ok) return [];

    const data = await response.json();
    const models: ModelInfo[] = [];

    // Filter chat-capable GLM models
    const validModels = (data.data || [])
      .filter((m: any) => {
        const id = m.id.toLowerCase();
        // Include GLM text models, exclude vision/image/video/audio
        if (id.includes('glm-') && !id.includes('v') && !id.includes('image') &&
            !id.includes('video') && !id.includes('cog') && !id.includes('asr')) {
          return true;
        }
        return false;
      })
      .sort((a: any, b: any) => {
        const priority = (id: string) => {
          if (id.includes('glm-5')) return 1;
          if (id.includes('glm-4.7') && !id.includes('flash')) return 2;
          if (id.includes('glm-4.7-flash') && !id.includes('flashx')) return 3;
          if (id.includes('glm-4.7-flashx')) return 4;
          if (id.includes('glm-4.6')) return 5;
          if (id.includes('glm-4.5') && !id.includes('flash') && !id.includes('air')) return 6;
          if (id.includes('glm-4.5-flash')) return 7;
          if (id.includes('glm-4.5-air')) return 8;
          return 10;
        };
        return priority(a.id) - priority(b.id);
      });

    for (const m of validModels.slice(0, 10)) {
      let label = m.id;
      if (m.id.includes('glm-5')) label += ' (топ)';
      else if (m.id.includes('flash')) label += ' (быстрый)';
      else if (m.id.includes('air')) label += ' (легкий)';
      models.push({ value: m.id, label });
    }

    return models.length > 0 ? models : [
      { value: 'glm-4.7', label: 'glm-4.7' },
      { value: 'glm-4.7-flash', label: 'glm-4.7-flash (быстрый)' },
    ];
  } catch (e) {
    console.error('Error fetching Z.AI models:', e);
    return [
      { value: 'glm-4.7', label: 'glm-4.7' },
      { value: 'glm-4.7-flash', label: 'glm-4.7-flash (быстрый)' },
    ];
  }
}

/**
 * Fetch OpenRouter models
 */
async function fetchOpenRouterModels(apiKey: string): Promise<ModelInfo[]> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    if (!response.ok) return [];

    const data = await response.json();
    const models: ModelInfo[] = [];

    // Filter and sort models - prioritize popular chat models
    const validModels = (data.data || [])
      .filter((m: any) => {
        const id = m.id.toLowerCase();
        // Exclude image/audio/embedding models
        if (id.includes('image') || id.includes('vision-only') ||
            id.includes('embed') || id.includes('whisper') ||
            id.includes('tts') || id.includes('dall-e')) {
          return false;
        }
        // Include popular providers
        if (id.includes('anthropic/') || id.includes('openai/') ||
            id.includes('google/') || id.includes('meta-llama/') ||
            id.includes('mistralai/') || id.includes('deepseek/') ||
            id.includes('z-ai/') || id.includes('qwen/')) {
          return true;
        }
        return false;
      })
      .sort((a: any, b: any) => {
        // Sort by pricing (free first), then by context length
        const priority = (id: string) => {
          if (id.includes('anthropic/claude')) return 1;
          if (id.includes('openai/gpt-4o')) return 2;
          if (id.includes('openai/gpt-5')) return 2;
          if (id.includes('google/gemini')) return 3;
          if (id.includes('deepseek/')) return 4;
          if (id.includes('z-ai/glm')) return 5;
          if (id.includes('meta-llama/')) return 6;
          if (id.includes('mistralai/')) return 7;
          if (id.includes('qwen/')) return 8;
          return 10;
        };
        return priority(a.id) - priority(b.id);
      });

    for (const m of validModels.slice(0, 20)) {
      const label = m.name || m.id;
      models.push({ value: m.id, label });
    }

    return models.length > 0 ? models : [
      { value: 'anthropic/claude-sonnet-4', label: 'Claude Sonnet 4' },
      { value: 'openai/gpt-4o', label: 'GPT-4o' },
      { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    ];
  } catch (e) {
    console.error('Error fetching OpenRouter models:', e);
    return [
      { value: 'anthropic/claude-sonnet-4', label: 'Claude Sonnet 4' },
      { value: 'openai/gpt-4o', label: 'GPT-4o' },
      { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    ];
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { provider, apiKey } = await request.json();

    // gpt4free doesn't need server-side model fetching - uses client-side only
    if (provider === 'gpt4free') {
      return new Response(
        JSON.stringify({ error: 'gpt4free uses client-side models' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let models: ModelInfo[] = [];

    switch (provider) {
      case 'openai':
        models = await fetchOpenAIModels(apiKey);
        break;
      case 'anthropic':
        models = await fetchAnthropicModels(apiKey);
        break;
      case 'gemini':
        models = await fetchGeminiModels(apiKey);
        break;
      case 'zai':
        models = await fetchZaiModels(apiKey);
        break;
      case 'openrouter':
        models = await fetchOpenRouterModels(apiKey);
        break;
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown provider' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify({ models }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Models API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch models' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
