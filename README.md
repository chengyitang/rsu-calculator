# RSU Calculator

A multi-company RSU (Restricted Stock Unit) vesting value calculator. Enter your grant details and see your current vested/unvested value based on live stock prices.

**Live demo:** https://rsucalculator.vercel.app

## Features

- Built-in vesting schedules for Amazon, Google, Meta, NVIDIA, Netflix, Microsoft, Apple
- Amazon: auto-calculates shares using the 30-trading-day trailing average price from your onboard date
- Live stock prices via Alpha Vantage (with Yahoo Finance fallback)
- Historical price chart with vest date markers
- Multiple grants per company with expandable timelines
- Stock appreciation/depreciation vs. original grant value
- Private company support (ByteDance, Databricks, etc.) with manual price entry
- Add custom companies with 6 built-in vesting schedule templates
- Data persists in browser localStorage

## Getting Started

### 1. Get a free Alpha Vantage API key

Sign up at https://www.alphavantage.co/support/#api-key (free, 25 requests/day).

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
ALPHA_VANTAGE_API_KEY=your_api_key_here
```

> If the key is missing or rate-limited, the app automatically falls back to Yahoo Finance — the app still works without a key.

### 3. Run the development server

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

```bash
vercel --prod
```

Add the environment variable in Vercel dashboard or via CLI:

```bash
echo "your_api_key" | vercel env add ALPHA_VANTAGE_API_KEY production
```

## Tech Stack

- **Next.js 14+ (App Router)** — framework + server-side API routes
- **TypeScript + Tailwind CSS** — type safety and styling
- **Recharts** — historical price chart
- **Alpha Vantage + Yahoo Finance** — stock price data
- **localStorage** — client-side persistence, no database needed
