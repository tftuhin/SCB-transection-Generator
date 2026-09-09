# SCB Transection Generator

A modern, mobile-responsive web application designed for generating bulk bank transfer Excel files compliant with **Standard Chartered Bank (SCB)** specifications, paired with a Supabase-backed beneficiary vendor pool and debit account management.

---

## Features

### 1. Bulk Transfer Generator
- **Dynamic Entry Rows**: Add as many transfer records as needed in a single batch.
- **Searchable Beneficiary Dropdown**: Search and select beneficiaries instantly with automatic account and routing number mapping.
- **Debit Account Dropdown Selector**: Automatically pulls your default funding debit account from the Supabase database.
- **SCB Compliant Excel Export**: Generates and downloads standardized `.xlsx` files ready for SCB corporate banking upload.
- **Reset Safeguard**: One-click form reset with confirmation protection to prevent accidental loss of entered data.

### 2. Vendor Pool Management (`/vendors`)
- **Complete Beneficiary CRUD**: Add, view, edit (via modal), and delete beneficiary records.
- **Real-Time Search**: Filter beneficiaries by receiver name, account number, bank name, or routing number.
- **Dual Display Modes**: 6-column tabular layout for desktop and responsive beneficiary cards for mobile screens.
- **Delete Safeguards**: Modal confirmation dialog before any record deletion.

### 3. Debit Account Management (`/debit-accounts`)
- **Centralized Funding Accounts**: Save and manage your company or personal SCB debit accounts in Supabase.
- **Default Account Selection**: Mark any debit account as default with one click; it automatically becomes pre-selected in the generator.
- **Labeling & Aliasing**: Assign readable names (e.g., *Main Operations Account*, *Payroll BDT*) alongside account numbers.

### 4. Modern, Mobile-First Design
- **Active Tab Highlighting**: Visual indicators on active routes in both desktop sidebar and mobile navigation drawer.
- **Slide-Over Drawer**: Responsive mobile header with slide-over drawer menu.
- **Responsive Layout**: Designed for seamless experience across mobile, tablet, and desktop viewports.
- **Social Previews**: Pre-configured 1200x630 OpenGraph and Twitter card image previews.

---

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React 18, TypeScript)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Spreadsheet Engine**: [XLSX (SheetJS)](https://sheetjs.com/)
- **Date Utilities**: [date-fns](https://date-fns.org/)

---

## Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/tftuhin/SCB-transection-Generator.git
cd SCB-transection-Generator
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key

# Default SCB Debit Account (Optional local fallback)
NEXT_PUBLIC_SCB_DEBIT_ACCOUNT=0000000000000
```

> A template is available in `.env.example`.

### 3. Database Setup

Run the SQL migration in `supabase-schema.sql` inside your Supabase project's **SQL Editor**:

1. Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project and navigate to **SQL Editor**.
3. Paste the contents of [`supabase-schema.sql`](./supabase-schema.sql) and click **Run**.
4. This creates both the `vendors` and `debit_accounts` tables along with Row Level Security (RLS) policies.

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deploying to Vercel

1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com/).
3. In **Project Settings → Environment Variables**, add:

| Variable Name | Required | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | Your Supabase anonymous public API key |
| `NEXT_PUBLIC_SCB_DEBIT_ACCOUNT` | No | Optional fallback debit account number |

4. Click **Deploy**.

---

## Excel Output Format

The generated `.xlsx` file matches Standard Chartered Bank's required batch payment format:

| Column Header | Source / Description |
| :--- | :--- |
| **Customer Reference** | Empty (reserved for bank processing) |
| **Beneficiary Name(120)** | Receiver Name from Vendor Pool |
| **Beneficiary Account Number** | Beneficiary Bank Account Number |
| **Routing Number** | Bank Branch Routing Number |
| **Payment Amount** | Transaction Amount |
| **Reason(140)** | Transfer Reason / Description (max 100 characters) |
| **Date(DD/MM/YYYY)** | Transfer Date formatted as `DD/MM/YYYY` |
| **Debit Account Number(Prefix- 00 BDT)** | Sender Debit Account Number |
| **Beneficiary Email ID(Optional)** | Empty / Optional notification email |

---

## License

This project is licensed under the MIT License.
