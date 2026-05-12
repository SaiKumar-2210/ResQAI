# ResQAI

ResQAI is a production-quality MVP. It is positioned as an emergency decision support system, not a generic chatbot.

The technical core is Gemma-powered multimodal image analysis with structured JSON responses:

- disaster image triage for floods, fires, blocked roads, unsafe structures, and visible hazards
- confidence scoring and danger level classification
- safety guardrails with emergency escalation language
- multilingual guidance in English, Telugu, and Hindi
- streaming chat responses over SSE
- preparedness checklist generation
- offline-first PWA simulation with cached emergency tips
- demo mode with generated flood/fire sample images

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- shadcn-style UI primitives
- Gemma through the Gemini API REST endpoint

## Project Structure

```txt
app/
  api/ai/image-analysis/route.ts   Gemma multimodal image analysis
  api/ai/chat/route.ts             streaming emergency guidance
  api/ai/checklist/route.ts        structured checklist generation
components/
  dashboard/                       main decision support dashboard
  image-analysis/                  image upload and structured result UI
  chat/                            streaming emergency guidance UI
  checklist/                       family kit generator
  demo/                            guided demo scenarios
lib/
  ai/gemmaService.ts               central AI service layer
  ai/gemmaClient.ts                Gemini/Gemma REST client
  ai/streaming.ts                  SSE streaming helpers
  ai/safety.ts                     disclaimer, confidence, escalation layer
  ai/prompts/                      modular prompt templates
  ai/schemas/                      structured JSON schemas
  monitoring/                      logger and analytics hooks
public/
  sw.js                            offline cache service worker
  manifest.json                    PWA metadata
```

## Environment

Create `.env.local`:

```bash
GEMMA_API_KEY=your_google_ai_studio_api_key
GEMMA_MODEL=gemma-4-26b-a4b-it
GEMMA_API_BASE_URL=https://generativelanguage.googleapis.com/v1beta
GEMMA_REQUEST_TIMEOUT_MS=25000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

The API implementation follows Google AI REST patterns for multimodal `inline_data`, streaming `streamGenerateContent`, and structured JSON output.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000/dashboard`.

## Demo Flows

1. Flood image triage  
   Open Dashboard → Gemma Multimodal Image Triage → Demo Flood → receive danger level, confidence, evacuation flag, hazards, and actions.

2. Telugu earthquake guidance  
   Open Dashboard → Emergency Decision Support → Telugu Earthquake Demo.

3. Family emergency checklist  
   Choose a scenario and family size → Generate Kit.

## Deployment

Deploy to Vercel:

1. Push the repository to GitHub.
2. Import it in Vercel.
3. Add the environment variables listed above.
4. Deploy.

For production PWA testing, use the deployed HTTPS URL. Service workers are registered only in production builds.

## Safety Notes

ResQAI is emergency decision support. It does not replace emergency responders, doctors, engineers, or official authorities. The safety layer injects escalation wording and clamps confidence so the UI avoids false certainty.
