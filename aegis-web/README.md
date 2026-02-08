# 🌐 Aegis Web

**Next.js 14 Mission Control UI** for the Aegis Risk Oracle.

## Features
- **Parallel Scanning Visualization** - Real-time indicators for Market, Entropy, and Security checks
- **Glassmorphic UI** - Dark theme with Aceternity/Shadcn components
- **DON-Signed Verdicts** - Visual distinction for cryptographically verified results
- **ElizaOS Chat** - Conversational interface to the Aegis agent

## Tech Stack
| Component | Technology |
| :--- | :--- |
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + Shadcn UI + Aceternity UI |
| Animation | Framer Motion |

## Quick Start
```bash
npm install
npm run dev -- -p 3005
```

## Key Files
| File | Purpose |
| :--- | :--- |
| `src/components/Chat.tsx` | Main chat interface with parallel scanning UI |
| `src/components/ui/` | Shadcn + Aceternity UI components |
| `src/app/page.tsx` | App entry point |

## Backend Connection
Connects to ElizaOS agent at `http://localhost:3011/message`
