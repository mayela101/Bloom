# Bloom 

Bloom is a private, AI-assisted journaling companion designed to reduce blank-page anxiety and help users reflect on emotional patterns over time. 

It combines guided prompts, lightweight AI analysis, and visual progress metaphors to make journaling a consistent and supportive daily habit.

## Demo & Deliverables

- Demo Video: [https://youtu.be/Pbt56MTIQxw]
- Live Prototype: [https://bloom-flame.vercel.app/]
- Design Documentation: [https://docs.google.com/document/d/1XldGKrPTC3QhpYwHZy3bAoyYz75OjhHKM84eluL2Too/edit?usp=sharing]

## Core Features

- Guided journaling with optional mood tagging  
- Context-aware AI-generated prompts  
- Weekly emotional insights dashboard  
- Progress visualization using a butterfly growth metaphor  
- Local fallback analysis when AI services are unavailable  

## Tech Stack

**Frontend**
- React + TypeScript (Vite / Next.js)
- CSS Modules
- Recharts, Framer Motion

**Backend & Database**
- Supabase (PostgreSQL, Auth, RLS)

**AI**
- Claude (Anthropic API)
- Local heuristic fallback analysis

**Deployment**
- Vercel

## AI Usage

Bloom uses AI in two distinct ways:

**1. Product Functionality**
- Generates empathetic journaling prompts
- Summarizes emotional trends over time
- Clearly labels AI-generated insights and provides user control

**2. AI-Assisted Development**
- Used AI tools to iterate on prompt phrasing and UX copy
- Prototyped UI components and animations from hand-drawn sketches
- Accelerated development through scaffolding and edge-case checks

AI was used as a productivity multiplier, while all architectural decisions and system design remained human-led.

## Responsible AI & Privacy

- All journal entries are private by default
- Row-Level Security enforces per-user data isolation
- No user data is used for model training
- Bloom does not provide medical or diagnostic advice

## Design Documentation

For detailed design decisions, AI architecture, UX rationale, and tradeoffs, see:

📘 `DOCUMENTATION.md`
Early design sketches and iteration notes are included to illustrate the design process.

## Running Locally

npm install
npm run dev

Note: This project was developed for demonstration purposes and may require environment setup to run locally.
Live Site is found above.

## Project Context

Bloom was built as part of a time-boxed interview hackathon. Feature scope and design decisions were intentionally constrained to prioritize core user value, privacy, and reliability.


