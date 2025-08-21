# Tabby - Social IOU Tracker

## Project Overview
Tabby is a one-night MVP social IOU tracker for small friend groups. Built with Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, and Supabase.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL + Realtime + Auth via cookies)
- **AI**: Claude API for playful reminder generation
- **PWA**: Service worker + manifest for installability
- **Deploy**: Vercel

## Key Features
1. Create/join group tabs with invite codes
2. Add IOUs with even or custom splits
3. Smart balance calculations showing who owes whom
4. One-tap settlement marking
5. AI-powered playful reminders ("roasts")
6. Realtime updates via Supabase
7. No login required (cookie-based auth)

## Database Schema
- `tabs`: Group tabs with invite codes
- `participants`: Tab members with access tokens
- `ious`: Expenses paid by participants
- `iou_splits`: How IOUs are split
- `settlements`: Payment records
- `net_balances`: View calculating who owes whom

## API Routes
- `POST /api/tabs` - Create new tab
- `POST /api/tabs/[code]/join` - Join tab with name
- `POST /api/tabs/[code]/iou` - Add IOU with splits
- `POST /api/tabs/[code]/settle` - Record settlement
- `GET /api/tabs/[code]/balances` - Get optimized edges
- `POST /api/ai/roast` - Generate playful reminder

## Components
- `CreateTabForm` - Start new tabs
- `JoinTabForm` - Join with name only
- `AddIouDialog` - Add expenses
- `BalancesList` - Display who owes whom
- `SettleDialog` - Mark payments
- `RoastButton` - AI reminders

## Pages
- `/` - Landing with create form
- `/t/[code]` - Tab room with realtime updates

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
ANTHROPIC_API_KEY=your_claude_key
```

## Setup Instructions
1. Create Supabase project
2. Run SQL from `supabase-schema.sql`
3. Add environment variables
4. `npm install && npm run dev`
5. Deploy to Vercel

## Implementation Notes
- Cookie auth using `tab_access_token`
- Greedy algorithm for balance optimization
- Realtime subscriptions on IOUs and settlements
- TypeScript strict mode with proper types
- PWA-ready with offline shell caching
- Fixed Git permissions issue by reinitializing repository

## Recent Updates (2025-08-22)
- Completed full MVP implementation
- Fixed TypeScript errors for production build
- Fixed SQL schema view error
- Resolved Git permissions issue
- Successfully deployed to Vercel