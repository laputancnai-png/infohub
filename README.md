# Laputan Info Hub — Design Package

**Version 1.0 · April 2026**
**URL:** news.36techsolutions.com
**Developer:** Laputan YAO · laputancnai@gmail.com · github.com/laputancnai-png

---

## Package Contents

### /design — HTML Mockups (open in any browser)

| File | Description |
|------|-------------|
| `01_homepage.html` | Main homepage — AI Tech module, GitHub cards, news feed, ticker |
| `02_finance.html` | Finance page — market dashboard, global indices, financial news |
| `03_admin_dashboard.html` | /admin analytics page — traffic charts, top content, donation log |
| `04_donate_modal.html` | Donate modal — WeChat/Alipay QR + PayPal/BMC views |
| `05_logo_brand.html` | Logo showcase — all variants, color system, typography |

### /docs — Specification Document

| File | Description |
|------|-------------|
| `Laputan_InfoHub_Design_Dev_Spec_v1.0.docx` | Full design & development specification (9 chapters) |

---

## How to View the Mockups

1. Download the entire package
2. Open any `.html` file in Chrome / Safari / Firefox
3. Files link to each other — navigate between pages naturally
4. Dark mode is supported — try toggling your OS dark/light mode

---

## Design Highlights

- **Glass morphism UI** — frosted card surfaces with backdrop-filter blur
- **Rainbow letter-cluster logo** — L·A·P·U·T·A·N each as a colored glass tile
- **Dark-first color system** — deep navy void (#0A0A14) as the base
- **Live ticker rail** — scrolling market data on a dark strip
- **Minimal typography** — SF Pro / -apple-system, two weights only (400/600)

---

## Development Stack (Phase 1 target)

- **Frontend:** Next.js 14 + Tailwind CSS + next-intl
- **Data:** GitHub REST API + yfinance + RSS feeds
- **Cache:** Vercel KV (Redis)
- **Analytics:** GA4 + custom /admin dashboard
- **Deploy:** Vercel (free tier)

---

*© 2026 Laputan YAO. All rights reserved.*
