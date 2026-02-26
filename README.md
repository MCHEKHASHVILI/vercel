# Career Intel Proxy

A tiny Vercel serverless proxy that forwards requests from the Career Intel artifact to the Anthropic API.

## Deploy to Vercel

1. Import this repo at vercel.com/new
2. Add environment variable: `ANTHROPIC_API_KEY` = your Anthropic API key
3. Deploy — copy the URL into the artifact's ⚙ Setup dialog

## How it works

```
Claude.ai artifact → this proxy → Anthropic API
```

The proxy adds your API key server-side, so it never appears in the artifact code.
