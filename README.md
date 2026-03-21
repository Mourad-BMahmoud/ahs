# Layoff.ai -- Agent Hiring Standard (AHS)

**Turn any job posting into a production-ready AI agent.**

AHS is an open standard for defining AI agents the way you'd hire a person -- role, responsibilities, red lines, skills, and operating rules. Feed it a job posting, fill out the brief, and get a complete agent workspace ready to deploy on [OpenClaw](https://openclaw.com).

No prompt engineering. No guesswork. Just fill the form like you're onboarding your next hire.

---

## How it works

```
Job posting  -->  AHS Form  -->  Agent Workspace
   (input)        (you fill)       (ready to deploy)
```

1. **Paste a job posting** -- the LLM extracts what it can
2. **Fill the gaps** -- you know your business, the form guides you through what matters
3. **Export** -- one command generates a full agent workspace with skills, identity, and guardrails

---

## Get started

```bash
git clone https://github.com/layoff-ai/ahs.git
cd ahs
npm install
```

Set up your LLM provider:

```bash
cp .env.example .env
```

Edit `.env` with your API key:

```
AHS_PROVIDER=anthropic       # or: openai, openrouter
AHS_API_KEY=sk-...           # your API key
```

Then run:

```bash
node bin/ahs.js form
```

Opens the web form at `localhost:3456`. Fill it out, upload reference docs, export your agent.

---

## CLI commands

| Command | What it does |
|---------|-------------|
| `node bin/ahs.js init` | Scaffold a blank `.env` and `ahs.json` |
| `node bin/ahs.js form` | Open the web form (recommended) |
| `node bin/ahs.js fill posting.pdf` | Pre-fill from a job posting (.txt, .md, .pdf, .docx) |
| `node bin/ahs.js convert ahs.json` | Generate the agent workspace |

### CLI-only flow (no web form)

```bash
node bin/ahs.js init                    # create blank ahs.json
node bin/ahs.js fill job-posting.txt    # LLM extracts what it can
# edit ahs.json to fill the rest
node bin/ahs.js convert ahs.json       # generate workspace
```

---

## What you get

The `convert` command outputs a complete agent workspace:

```
lead-qualifier/
├── SOUL.md              # Personality, values, hard limits
├── IDENTITY.md          # Name, role title, avatar
├── AGENTS.md            # Operating manual, boot sequence
├── USER.md              # Who the agent works for
├── TOOLS.md             # Environment notes (populated at install)
├── HEARTBEAT.md         # Periodic check-in items
├── MEMORY.md            # Long-term memory seed
├── BOOTSTRAP.md         # First-run handshake
├── SETUP.md             # Install data (tools, schedule, channel)
├── INSTALL.md           # Universal install guide
└── skills/
    ├── inbound-lead-qualification/
    │   ├── SKILL.md     # Step-by-step process, quality bar, failure modes
    │   └── references/  # Your uploaded SOPs, templates, rubrics
    └── weekly-reporting/
        ├── SKILL.md
        └── references/
```

Every file is production-ready. No placeholders, no TODOs. Deploy it on OpenClaw and your agent starts working.

---

## The AHS standard

Six sections. Everything an AI agent needs to know to do its job.

| # | Section | What you define |
|---|---------|----------------|
| 1 | **Role Definition** | Job title, mission, responsibilities, hard boundaries |
| 2 | **Employer Profile** | Your name, company, industry, tools, working hours, communication channel |
| 3 | **Critical Failures** | Dealbreakers, acceptable mistakes, horror stories, confidentiality rules |
| 4 | **Core Skills** | 2-6 business processes with steps, triggers, quality bars, and failure modes |
| 5 | **Operating Model** | Tone, autonomy level, daily schedule, escalation triggers, reporting cadence |
| 6 | **Domain Knowledge** | Compliance rules, frameworks, reference docs, anything else |

Section 3 is the most important. Specific failures and real horror stories create the strongest guardrails.

---

## LLM providers

Works with any of these. Set `AHS_PROVIDER` in your `.env`:

| Provider | Default model | Notes |
|----------|--------------|-------|
| `anthropic` | claude-sonnet-4-20250514 | Best results |
| `openai` | gpt-4o | Solid alternative |
| `openrouter` | anthropic/claude-sonnet-4 | Use any model via OpenRouter |

---

## Project structure

```
├── bin/ahs.js                # CLI entry point
├── commands/
│   ├── init.js               # Scaffolds blank project
│   ├── fill.js               # Job posting -> pre-filled AHS
│   ├── form.js               # Web form server
│   └── convert.js            # AHS -> agent workspace
├── ui/
│   ├── index.html            # The form
│   ├── style.css             # shadcn-style B&W theme
│   └── app.js                # Form logic, auto-save, file upload
├── llm.js                    # Anthropic / OpenAI / OpenRouter client
├── extract.js                # PDF, DOCX, TXT text extraction
├── parser.js                 # Extracts workspace files from LLM response
├── template.js               # Blank AHS JSON structure
├── AHS_SPEC_v2.md            # Full field specification (reference)
├── CONVERTER_PROMPT_v2.md    # System prompt: AHS -> workspace
├── FILLER_PROMPT.md          # System prompt: posting -> AHS
└── INSTALL_v3.md             # Install guide (ships with workspace)
```

---

## Requirements

- Node.js 18+
- An API key from Anthropic, OpenAI, or OpenRouter

---

## Contributing

AHS is an open standard. The spec (`AHS_SPEC_v2.md`), the prompts, and the CLI are all MIT-licensed. If you build a better form, a different runtime adapter, or a converter for a different agent platform -- that's the point.

---

## License

MIT -- built by [Layoff.ai](https://layoff.ai)
