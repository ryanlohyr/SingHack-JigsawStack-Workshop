# RegTech Compliance Agent - Python Version

This is a Python implementation of the RegTech Compliance Agent that uses agentic loops to autonomously analyze regulatory documents, transactions, and compliance data.

## Features

- 🤖 Autonomous agentic loop for compliance tasks
- 📄 Document extraction from PDFs
- 💳 Transaction analysis with vision
- 🧮 Risk scoring with code execution
- 🌐 Real-time regulatory updates
- 🚨 Automatic escalation for critical issues
- 📊 Comprehensive compliance reporting

## Setup

This project uses `uv` for package management.

### 1. Install uv

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### 2. Install dependencies

```bash
uv sync
```

### 3. Configure environment

Copy `.env.example` to `.env` and add your API keys:

```bash
cp .env.example .env
```

Edit `.env` with your actual API keys:
```
INTERFAZE_API_KEY=your_interfaze_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

## Usage

Run the agent:

```bash
# Using uv (recommended)
uv run python agent.py

# Or activate the virtual environment and run directly
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
python agent.py
```

## Project Structure

```
python_version/
├── agent.py           # Main agentic loop
├── methods.py         # Decision making and action executors
├── utils.py           # State management utilities
├── models.py          # API client configuration
├── pyproject.toml     # Project dependencies
├── .env.example       # Environment variables template
└── README.md          # This file
```

## How It Works

1. **Initialize State**: Creates tasks for document processing, transaction analysis, risk assessment, and regulatory updates
2. **Agentic Loop**: Agent autonomously decides which task to execute next based on priority and risk
3. **Execute Actions**: Processes documents, analyzes transactions, calculates risk scores, fetches updates
4. **Monitor Issues**: Continuously checks for critical issues and escalates if necessary
5. **Generate Report**: Creates comprehensive compliance report for executives

## Dependencies

- `openai>=1.54.0` - OpenAI/Interfaze API client
- `python-dotenv>=1.0.0` - Environment variable management
- `pydantic>=2.9.0` - Data validation and structured outputs

## License

ISC

