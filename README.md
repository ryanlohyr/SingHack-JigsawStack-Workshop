# JigsawStack Demo Notebook via Interfaze

This repository contains a comprehensive Jupyter notebook demonstrating the powerful capabilities of JigsawStack accessed through **Interfaze** - a unified OpenAI-compatible interface.

## 📚 What's Inside

The notebook `jigsaw_stack_demo.ipynb` showcases:

1. **Vision (vOCR)** 👁️
   - Extract structured data from images (receipts, invoices, forms)
   - AI-powered text recognition and data extraction

2. **Web Scraping** 🌐
   - Scrape websites using natural language prompts
   - No CSS selectors needed
   - Examples: Hacker News, Amazon product pages

3. **Document Extraction (PDF)** 📄
   - Process document images and extract structured data
   - Perfect for business documents and forms

4. **Web Search** 🔍
   - AI-powered search with intelligent overviews
   - Synthesized information from multiple sources

5. **Reasoning & Code Execution** 🧠
   - Build multi-step workflows
   - Combine multiple AI capabilities for complex tasks

## 🔌 What is Interfaze?

**Interfaze** provides a unified, OpenAI-compatible API to access JigsawStack and other AI services. Use the familiar OpenAI SDK pattern to access powerful specialized AI capabilities!

### Benefits:
- 🎯 Single API key for multiple AI services
- 🔄 OpenAI SDK compatibility - easy migration
- 🌐 Consistent interface across different providers
- 💰 Simplified billing and management

## 🚀 Getting Started

### Prerequisites

1. Install the OpenAI Python SDK:
```bash
pip install openai
```

2. Get your Interfaze API key from [interfaze.ai](https://interfaze.ai)

3. Set your API key as an environment variable:
```bash
export INTERFAZE_API_KEY="your-api-key"
```

### Running the Notebook

1. Start Jupyter:
```bash
jupyter notebook
```

2. Open `jigsaw_stack_demo.ipynb`

3. Run the cells sequentially to see each demo in action!

## 💡 Code Example

```python
from openai import OpenAI

# Initialize Interfaze client
interfaze = OpenAI(
    base_url="https://api.interfaze.ai/v1",
    api_key="your-api-key"
)

# Use JigsawStack's AI scraping
response = interfaze.chat.completions.create(
    model="jigsawstack/ai-scrape",
    messages=[{
        "role": "user",
        "content": "Scrape prices from https://example.com"
    }]
)
```

## 📖 Resources

- [Interfaze Website](https://interfaze.ai)
- [JigsawStack Documentation](https://docs.jigsawstack.com)
- [OpenAI Python SDK](https://github.com/openai/openai-python)

## 🎯 Key Features

- ✅ OpenAI-compatible API interface
- ✅ No complex CSS selectors needed for web scraping
- ✅ AI-powered data extraction from images and documents
- ✅ Intelligent search with synthesized overviews
- ✅ Composable workflows - chain different AI capabilities
- ✅ Structured output ready for downstream processing

## 🔥 Use Cases

- **Data Extraction**: Extract structured data from receipts, invoices, forms
- **Web Intelligence**: Monitor competitors, gather market data
- **Document Processing**: Automate document digitization
- **Research & Analysis**: AI-powered research with synthesized insights
- **Automation**: Build end-to-end AI workflows

## 🛠️ Available Models

Through Interfaze, you can access:

- `jigsawstack/vocr` - Visual OCR for document extraction
- `jigsawstack/ai-scrape` - AI-powered web scraping
- `jigsawstack/web-search` - Intelligent web search
- `gpt-4o-mini` - OpenAI reasoning models
- And many more AI services!

---

**Happy building with Interfaze & JigsawStack! 🧩**
