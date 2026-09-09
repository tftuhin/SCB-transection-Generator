# SCB Transection Generator

A web application designed for generating bulk bank transfer Excel files compliant with Standard Chartered Bank (SCB) specifications, paired with a Supabase-backed beneficiary vendor pool.

## Features

- **Transfer Generator**:
  - Dynamically add multiple transfer entries.
  - Searchable beneficiary dropdown powered by your Supabase vendor database.
  - Generates and downloads standard SCB bulk transfer Excel files (`.xlsx`).
  - Safe form reset with confirmation protection.
- **Vendor Management**:
  - Store and manage beneficiary bank accounts (Receiver Name, Account Number, Bank Name, Branch Name, Routing Number).
  - Search and filter vendors in real-time.
  - Edit vendor details via a modal dialog.
  - Delete vendors with confirmation safeguard.
- **Responsive Design**:
  - Desktop: Persistent sidebar and full data tables.
  - Mobile: Slide-over navigation drawer, adaptive form grid, and mobile-friendly beneficiary cards.
- **Social Sharing**:
  - Preconfigured 1200x630 OpenGraph and Twitter card preview image.

## Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/tftuhin/SCB-transection-Generator.git
cd SCB-transection-Generator
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file based on `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Database Setup

Run the SQL migration in `supabase-schema.sql` inside your Supabase project's **SQL Editor** to create the `vendors` table and RLS policies.

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Built With

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Database**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Spreadsheet Generation**: [XLSX (SheetJS)](https://sheetjs.com/)

