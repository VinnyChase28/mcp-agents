import type { PerplexityResponse } from "./schemas.js";

// Helper function to call Perplexity API
export async function callPerplexityAPI(
  apiKey: string,
  query: string,
  options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    search_domain_filter?: string[];
    search_recency_filter?: string;
    return_images?: boolean;
    return_related_questions?: boolean;
  },
): Promise<PerplexityResponse> {
  const url = "https://api.perplexity.ai/chat/completions";

  const payload = {
    model: options.model || "sonar-pro",
    messages: [
      {
        role: "system",
        content:
          "Be precise and concise. Provide accurate, up-to-date information with relevant sources.",
      },
      {
        role: "user",
        content: query,
      },
    ],
    temperature: options.temperature || 0.2,
    max_tokens: options.max_tokens || 1000,
    top_p: 1,
    stream: false,
    presence_penalty: 0,
    frequency_penalty: 1,
    ...(options.search_domain_filter && {
      search_domain_filter: options.search_domain_filter,
    }),
    ...(options.search_recency_filter && {
      search_recency_filter: options.search_recency_filter,
    }),
    ...(options.return_images !== undefined && {
      return_images: options.return_images,
    }),
    ...(options.return_related_questions !== undefined && {
      return_related_questions: options.return_related_questions,
    }),
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Perplexity API error (${response.status}): ${errorText}`);
  }

  return (await response.json()) as PerplexityResponse;
} 