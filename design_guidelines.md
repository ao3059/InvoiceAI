# InvoiceAI Design Guidelines

## Design Approach
**Hybrid Strategy**: Marketing pages inspired by modern B2B SaaS leaders (Linear's precision + Stripe's clarity), while dashboard follows a productivity-focused design system combining Tailwind's utility patterns with shadcn/ui components.

## Typography
- **Primary Font**: Inter (Google Fonts) - clean, professional, excellent readability
- **Hierarchy**:
  - Hero Headlines: text-5xl md:text-6xl lg:text-7xl, font-bold, tracking-tight
  - Section Headers: text-3xl md:text-4xl, font-semibold
  - Subsections: text-xl md:text-2xl, font-medium
  - Body: text-base md:text-lg, leading-relaxed
  - Labels/Captions: text-sm, font-medium, uppercase tracking-wide
  - Dashboard Headers: text-2xl font-semibold
  - Card Titles: text-lg font-semibold
  - Table/List Items: text-sm

## Layout System
**Spacing Units**: Use Tailwind spacing primitives: 2, 4, 6, 8, 12, 16, 20, 24, 32
- Component padding: p-4 to p-8
- Section spacing: py-16 md:py-24 lg:py-32
- Card spacing: p-6
- Form elements: space-y-4 to space-y-6
- Dashboard containers: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8

## Component Library

### Marketing Pages
**Hero Section**:
- Full-width container with large hero image showing invoice generation in action
- Headline + subheadline + dual CTAs (primary "Start Free Trial", secondary "See Demo")
- Trust indicators below CTAs: "No credit card required • 14-day free trial"
- Background: Subtle gradient overlay on hero image with blurred button backgrounds

**Feature Showcase** (3-column grid):
- Icon (Heroicons) + title + description cards
- Features: "AI-Powered Generation", "Professional PDFs", "Multi-tenant Ready", "Activity Tracking", "Stripe Billing", "Email Delivery"
- Cards with subtle shadow, rounded-lg borders

**How It Works** (horizontal timeline):
- 4 steps in asymmetric layout: "Describe Work → AI Generates → Preview & Edit → Send & Track"
- Numbered badges, connecting lines, screenshots of each step

**Pricing** (comparison table):
- 3 tiers side-by-side
- Most popular tier highlighted with distinct border treatment
- Feature comparison checkmarks

**Social Proof**:
- 2-column testimonial cards with user avatar, company, quote
- Metrics bar: "10,000+ Invoices Generated • $2M+ Processed • 500+ Businesses"

**Footer**: 
- 4-column grid: Product links, Resources, Company, Legal
- Newsletter signup with inline form
- Social icons, payment badges for trust

### Dashboard Application
**Navigation**:
- Sidebar layout (fixed left, 240px width)
- Logo at top, navigation items with icons (Heroicons)
- User profile dropdown at bottom
- Active state: subtle background highlight

**Invoice List** (/dashboard/invoices):
- Filter bar at top: Status dropdown, date range picker, search input
- Table with columns: Invoice #, Client, Date, Amount, Status, Actions
- Status badges: pill-shaped with distinct visual states
- Action buttons: icon-only with tooltips

**Invoice Detail** (/dashboard/invoices/[id]):
- 2-column layout: Invoice preview (left 60%) + Actions sidebar (right 40%)
- Preview shows formatted invoice with company branding
- Action buttons stacked vertically: "Download PDF", "Send Email", "Mark as Sent/Paid"
- Activity timeline below showing invoice lifecycle events

**Invoice Creation** (/dashboard/invoices/new):
- Split view: Input form (left) + Live preview (right) on desktop
- Stacked on mobile
- Large textarea for natural language description
- Optional fields in expandable section: Client details, due date
- "Generate Invoice" primary button, prominent and centered

**Company Settings** (/dashboard/settings/company):
- Single column form, max-w-2xl
- Logo upload zone with drag-and-drop + click to browse
- Form sections with clear labels: Company Info, Address, Tax Details
- Save button sticky at bottom on scroll

**Admin Dashboard** (/admin/users):
- Statistics cards in 4-column grid: Total Tenants, Active Subscriptions, Total Invoices, Revenue
- Data table with sorting, filters
- Usage bars showing invoice count vs plan limits (green/amber/red)
- Export CSV button in header

**Admin Activity** (/admin/activity):
- Real-time feed in card format
- Filters sidebar (collapsible): Action type, tenant, date range
- Each activity entry: timestamp, tenant badge, user, action description, entity link
- Infinite scroll loading

### Core UI Components
**Buttons**:
- Primary: Solid fill, rounded-md, px-6 py-3, font-medium, shadow-sm
- Secondary: Outline with border, same sizing
- Destructive: Red variant for dangerous actions
- Icon buttons: Square, p-2, icon centered

**Cards**:
- White background, rounded-lg, shadow-sm border
- Padding: p-6
- Hover state: subtle shadow elevation increase

**Forms**:
- Labels: text-sm font-medium, mb-2
- Inputs: border rounded-md, px-4 py-2, focus:ring-2
- Error states: red border + error text below
- Help text: text-sm text-muted below inputs

**Tables**:
- Striped rows for readability
- Header: sticky, font-medium, text-sm uppercase
- Hover state on rows
- Mobile: Cards with stacked data

**Modals**:
- Centered overlay with backdrop blur
- Max width constraints (max-w-lg to max-w-2xl)
- Close button (X) in top right
- Action buttons at bottom right

**Toasts/Notifications**:
- Fixed bottom-right positioning
- Success/error/info variants with icons
- Auto-dismiss after 5s, manual close option

## Images

**Hero Image**: Full-width background image showing a clean, modern invoice being generated on a laptop/tablet screen. Professional office setting with soft focus. Overlay with gradient (dark at bottom to light at top) to ensure text readability. Buttons have backdrop-blur-sm backgrounds.

**Feature Screenshots**: Product screenshots showing actual invoice PDFs, the AI generation interface, and the dashboard. Use subtle device mockups (browser chrome or minimal frame).

**How It Works Steps**: UI screenshots of each step in the invoice creation flow - cropped to show relevant interface sections.

**Testimonial Avatars**: Professional headshots in circular crops, 48px diameter.

**Admin Dashboard**: Chart/graph placeholder images showing analytics data, usage trends.

## Animations
Minimal animations only for feedback:
- Button hover: subtle scale transform (1.02)
- Card hover: shadow transition
- Page transitions: simple fade
- Loading states: spinner or skeleton screens
- Toast slide-in from bottom-right

No scroll-triggered animations or complex interactions.