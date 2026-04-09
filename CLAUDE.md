# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This is the **Laputan Info Hub design package** — a collection of static HTML mockups and specification documents for the news.36techsolutions.com project. It is a design artifact, not a deployed application.

## Contents

- `design/` — Five standalone HTML mockups (no build step needed; open directly in browser)
  - `01_homepage.html` — Main page with AI Tech module, GitHub cards, news feed, ticker rail
  - `02_finance.html` — Market dashboard, global indices, financial news
  - `03_admin_dashboard.html` — Analytics, traffic charts, donation log
  - `04_donate_modal.html` — WeChat/Alipay QR + PayPal/BMC donation views
  - `05_logo_brand.html` — Logo variants, color system, typography
- `docs/Laputan_InfoHub_Design_Dev_Spec_v1.0.docx` — Full 9-chapter design & development spec

## Design System

| Token | Value |
|-------|-------|
| Base background | `#0A0A14` (deep navy void) |
| Surface cards | Glass morphism — `rgba(255,255,255,0.72)` + `backdrop-filter: blur(20px)` |
| Up color | `#1aff8c` |
| Down color | `#ff4d6a` |
| Font | `-apple-system, 'SF Pro Text', Helvetica Neue, Arial` (400/600 weights only) |
| Mono font | `'SF Mono', Menlo, 'Courier New'` (ticker, prices) |

Logo: "LAPUTAN" as seven colored glass letter tiles (rainbow cluster).

## Planned Implementation Stack (Phase 1)

- **Frontend:** Next.js 14 + Tailwind CSS + next-intl
- **Data sources:** GitHub REST API, yfinance, RSS feeds
- **Cache:** Vercel KV (Redis)
- **Analytics:** GA4 + custom `/admin` dashboard
- **Deploy:** Vercel (free tier)
- **URL:** news.36techsolutions.com

## Viewing Mockups

Open any `.html` file directly in a browser — files cross-link to each other. Dark mode follows OS setting.
