/**
 * API endpoint to fetch available models from AI providers
 * Returns real, current models from OpenAI, Anthropic, and Gemini APIs
 */

import type { APIRoute } from 'astro';

export const prerender = false;

interface ModelInfo {
  value: string;
  label: string;
  // OpenRouter per-model metadata (used to build the model-specific settings UI)
  supportedParameters?: string[];
  defaultParameters?: Record<string, any>;
  contextLength?: number;
}

/**
 * Fetch OpenAI models - all models from API
 */
async function fetchOpenAIModels(apiKey: string): Promise<ModelInfo[]> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    if (!response.ok) return [];

    const data = await response.json();

    return (data.data || [])
      .map((m: any) => ({ value: m.id, label: m.id }))
      .sort((a: ModelInfo, b: ModelInfo) => a.label.localeCompare(b.label));
  } catch (e) {
    console.error('Error fetching OpenAI models:', e);
    return [];
  }
}

/**
 * Fetch Anthropic models - all models from API
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

    return (data.data || []).map((m: any) => ({
      value: m.id,
      label: m.display_name || m.id,
    }));
  } catch (e) {
    console.error('Error fetching Anthropic models:', e);
    return [];
  }
}

/**
 * Fetch Gemini models - all models from API
 */
async function fetchGeminiModels(apiKey: string): Promise<ModelInfo[]> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!response.ok) return [];

    const data = await response.json();

    return (data.models || []).map((m: any) => {
      const modelId = m.name.replace('models/', '');
      return { value: modelId, label: m.displayName || modelId };
    });
  } catch (e) {
    console.error('Error fetching Gemini models:', e);
    return [];
  }
}

/**
 * Fetch Z.AI models - all models from API
 */
async function fetchZaiModels(apiKey: string): Promise<ModelInfo[]> {
  try {
    const response = await fetch('https://api.z.ai/api/paas/v4/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    if (!response.ok) return [];

    const data = await response.json();

    return (data.data || []).map((m: any) => ({
      value: m.id,
      label: m.id,
    }));
  } catch (e) {
    console.error('Error fetching Z.AI models:', e);
    return [];
  }
}

/**
 * Fetch OpenRouter models - all models from API, no filtering
 */
async function fetchOpenRouterModels(apiKey: string): Promise<ModelInfo[]> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    if (!response.ok) return [];

    const data = await response.json();

    return (data.data || []).map((m: any) => ({
      value: m.id,
      label: m.name || m.id,
      // OpenRouter exposes which params a model supports and their defaults —
      // used to render only relevant controls, pre-filled with the model's defaults.
      supportedParameters: Array.isArray(m.supported_parameters) ? m.supported_parameters : [],
      defaultParameters: m.default_parameters || {},
      contextLength: m.context_length,
    }));
  } catch (e) {
    console.error('Error fetching OpenRouter models:', e);
    return [];
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { provider, apiKey } = await request.json();

    // free doesn't need server-side model fetching - uses client-side only
    if (provider === 'free') {
      return new Response(
        JSON.stringify({ error: 'free uses client-side models' }),
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
