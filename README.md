# SingHack

A collection of examples demonstrating core concepts of the Interfaze AI API, including vision, web scraping, code execution, document extraction, reasoning, and precontext capabilities.

## Setup

1. Create a `.env` file based on the example:
   ```bash
   cp .env.example .env
   ```
   Then fill in your API keys in the `.env` file.

2. Install dependencies:
   ```bash
   npm install
   ```

## Running Core Concepts

To run any of the core concept examples:

```bash
npx tsx core_concepts/<fileName>
```

For example:
```bash
npx tsx core_concepts/vision.ts
npx tsx core_concepts/web.ts
npx tsx core_concepts/codeExecution.ts
npx tsx core_concepts/documentExtraction.ts
npx tsx core_concepts/reasoning.ts
npx tsx core_concepts/precontext.ts
```

## Running the agent

```bash
npx tsx agent/agent.ts
```


