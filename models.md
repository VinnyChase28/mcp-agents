# Model Reference: Gemini, Anthropic, and OpenAI (June 2025)

## Gemini (Google)

| Model Name            | Model ID for Code              | Use Cases                                           | Input Cost (per 1M tokens) | Output Cost (per 1M tokens) | Context Window |
| --------------------- | ------------------------------ | --------------------------------------------------- | -------------------------- | --------------------------- | -------------- |
| Gemini 2.5 Ultra      | `gemini-2.5-ultra-latest`      | Most powerful, research, advanced reasoning, coding | $2.50                      | $20.00                      | 1M tokens      |
| Gemini 2.5 Pro        | `gemini-2.5-pro-latest`        | Complex tasks, coding, analysis, general chat       | $1.25                      | $10.00                      | 1M tokens      |
| Gemini 2.5 Flash      | `gemini-2.5-flash-latest`      | Fast, real-time, high-throughput, chat, search      | $0.30                      | $2.50                       | 1M tokens      |
| Gemini 2.5 Flash Lite | `gemini-2.5-flash-lite-latest` | Lightweight, cost-sensitive, simple chat or search  | $0.10                      | $0.40                       | 1M tokens      |

---

## Anthropic (Claude)

| Model Name      | Model ID for Code        | Use Cases                                        | Input Cost (per 1M tokens) | Output Cost (per 1M tokens) | Context Window |
| --------------- | ------------------------ | ------------------------------------------------ | -------------------------- | --------------------------- | -------------- |
| Claude 4 Opus   | `claude-4-opus-202505`   | Most powerful, deep reasoning, long context      | $8.00                      | $40.00                      | 1M tokens      |
| Claude 4 Sonnet | `claude-4-sonnet-202505` | Balanced, fast, strong reasoning                 | $2.00                      | $10.00                      | 1M tokens      |
| Claude 4 Haiku  | `claude-4-haiku-202505`  | Fastest, lowest cost, simple chat, summarization | $0.15                      | $0.75                       | 1M tokens      |

---

## OpenAI (GPT)

| Model Name             | Model ID for Code | Use Cases                                   | Input Cost (per 1M tokens) | Output Cost (per 1M tokens) | Context Window |
| ---------------------- | ----------------- | ------------------------------------------- | -------------------------- | --------------------------- | -------------- |
| GPT-4.5o               | `gpt-4.5o`        | Most advanced, multimodal, coding, chat     | $4.00                      | $12.00                      | 256k tokens    |
| GPT-4.5 Turbo          | `gpt-4.5-turbo`   | Fast, high context, general tasks           | $8.00                      | $24.00                      | 256k tokens    |
| GPT-4.5 Flash          | `gpt-4.5-flash`   | Fastest, cost-effective, simple chat/search | $1.00                      | $3.00                       | 256k tokens    |
| GPT-3.5 Turbo (legacy) | `gpt-3.5-turbo`   | Legacy, basic chat, cost-sensitive          | $0.40                      | $1.20                       | 16k tokens     |

---

## Notes

- **Model IDs**: Use the "Model ID for Code" column in your API calls (`-latest` or versioned).
- **Costs**: All prices are per 1M tokens (June 2025, USD, rounded, check official docs for latest).
- **Context Window**: Maximum tokens per request (input + output).
- **Use Cases**:
  - **Ultra/Opus/4.5o**: Best for complex, high-value tasks.
  - **Flash/Haiku/Flash**: Best for fast, cost-sensitive, or high-throughput needs.

---

**References:**

- [Google Gemini Pricing](https://ai.google.dev/pricing)
- [Anthropic Claude Pricing](https://docs.anthropic.com/claude/docs/models-overview)
- [OpenAI Pricing](https://openai.com/api/pricing/)
