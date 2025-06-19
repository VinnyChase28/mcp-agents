#!/usr/bin/env node

interface PerplexityResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface SearchOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  search_domain_filter?: string[];
  return_images?: boolean;
  return_related_questions?: boolean;
  search_recency_filter?: string;
}

class PerplexityMCPServer {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env["PERPLEXITY_API_KEY"] || "";
    if (!this.apiKey) {
      console.error("PERPLEXITY_API_KEY environment variable is required");
      process.exit(1);
    }
  }

  async search(args: {
    query: string;
    model?: string;
    search_domain_filter?: string[];
    search_recency_filter?: string;
    return_images?: boolean;
    return_related_questions?: boolean;
    max_tokens?: number;
    temperature?: number;
  }) {
    const {
      query,
      model = "sonar-pro",
      search_domain_filter,
      search_recency_filter,
      return_images = false,
      return_related_questions = false,
      max_tokens = 1000,
      temperature = 0.2,
    } = args;

    const options: SearchOptions = {
      model,
      temperature,
      max_tokens,
      return_images,
      return_related_questions,
    };

    if (search_domain_filter) {
      options.search_domain_filter = search_domain_filter;
    }

    if (search_recency_filter) {
      options.search_recency_filter = search_recency_filter;
    }

    const result = await this.callPerplexityAPI(query, options);

    return {
      query,
      model,
      response: result.choices[0]?.message?.content || "No response received",
      usage: result.usage,
      metadata: {
        search_domain_filter,
        search_recency_filter,
        return_images,
        return_related_questions,
      },
    };
  }

  async academicSearch(args: {
    query: string;
    max_tokens?: number;
    return_related_questions?: boolean;
  }) {
    const { query, max_tokens = 1500, return_related_questions = true } = args;

    // Use sonar-pro with academic-focused system prompt
    const options: SearchOptions = {
      model: "sonar-pro",
      temperature: 0.1, // Lower temperature for more factual responses
      max_tokens,
      return_related_questions,
    };

    const academicQuery = `Please provide a comprehensive academic overview of: ${query}. Include peer-reviewed sources, key research findings, and scholarly perspectives.`;

    const result = await this.callPerplexityAPI(academicQuery, options);

    return {
      query,
      academic_query: academicQuery,
      model: "sonar-pro",
      response: result.choices[0]?.message?.content || "No response received",
      usage: result.usage,
      metadata: {
        search_type: "academic",
        return_related_questions,
      },
    };
  }

  private async callPerplexityAPI(
    query: string,
    options: SearchOptions,
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
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Perplexity API error (${response.status}): ${errorText}`,
      );
    }

    const result = (await response.json()) as PerplexityResponse;
    return result;
  }
}

// For simulation/testing purposes - export the server
export const perplexityServer = new PerplexityMCPServer();

// If run directly, just log that it's available
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("Perplexity MCP server initialized");
}
