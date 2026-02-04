# 🔧 RepairHub

A community-driven platform for sharing DIY repair guides, documenting repair attempts, and connecting with fellow repair enthusiasts.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)

## ✨ Features

### 🛠️ Core Repair Features
- **📝 Repair Posts** – Document your repair attempts with item details, issue descriptions, repair steps, and success status
- **📚 Guides** – Create and browse comprehensive repair guides for various items
- **🖼️ Image Uploads** – Attach images to repair posts via Supabase Storage
- **🏷️ Categories** – Organize repairs by device type (Electronics, Appliances, etc.)
- **⌨️ Rich Text Editor** – Format repair steps with Markdown support

### 🔍 Discovery & Navigation
- **🔎 Advanced Search** – Instant search with autocomplete suggestions for repairs and users
- **📈 Trending Page** – See the most popular repairs from the last 7 days
- **🔃 Infinite Scroll** – Seamlessly browse through repair feeds
- **🧹 Sorting & Filtering** – Sort by Newest, Upvotes, or Activity, and filter by category/outcome

### 👥 Community & Social
- **🔐 Authentication** – Secure email/password authentication with Supabase Auth and Google OAuth support
- **💬 Comments** – Engage in discussions with threaded comments on repair posts
- **👍 Upvoting** – Vote for helpful repairs to surface the best content
- **🔖 Bookmarks** – Save repairs to revisit later
- **👣 User Following** – Follow other users to see their latest repairs and updates
- **🔔 Notifications** – Get notified about upvotes, comments, and new followers
- **👤 User Profiles** – Personalized profiles with avatars, bios, and follower counts
- **🏅 Badges** – Earn recognition with a badge system for active contributors

### 🛡️ Moderation & Admin
- **🚩 Reporting** – Flag inappropriate content or users for review
- **📊 Analytics Dashboard** – View usage stats, growth charts, and category distribution
- **🛡️ Admin Dashboard** – Moderate content, manage users, and configure categories

## 🏗️ Tech Stack

### Frontend
- **Framework:** [Next.js 16](https://nextjs.org/) with App Router
- **UI Library:** [React 19](https://react.dev/)
- **Language:** TypeScript 5
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/) primitives with shadcn/ui
- **Forms:** React Hook Form + Zod validation
- **Data Fetching:** SWR for client-side caching
- **Charts:** Recharts
- **Icons:** Lucide React

### Backend
- **Platform:** [Supabase](https://supabase.com/)
  - PostgreSQL database
  - Authentication (Email/Password + OAuth)
  - Row Level Security (RLS)
  - Realtime subscriptions
  - Storage for images

## 📁 Project Structure

```
repairhub-main/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard (protected)
│   ├── auth/              # Login/Register pages
│   ├── dashboard/         # User dashboard & bookmarks
│   ├── feed/              # Community repair posts feed
│   ├── guides/            # Repair guides
│   ├── profile/           # User profile
│   ├── repairs/           # Repair post details
│   ├── trending/          # Trending repairs page
│   ├── users/             # Public user profiles
│   └── layout.tsx         # Root layout
├── components/
│   ├── custom/            # App-specific components
│   │   ├── analytics-charts.tsx
│   │   ├── follow-button.tsx
│   │   ├── navbar.tsx
│   │   ├── notifications-dropdown.tsx
│   │   ├── repair-card.tsx
│   │   ├── report-dialog.tsx
│   │   └── search-bar.tsx 
│   └── ui/                # Radix/shadcn UI primitives
├── hooks/                 # Custom React hooks
├── lib/
│   ├── api.ts             # Supabase API functions
│   ├── api-context.tsx    # API context provider
│   └── utils.ts           # Utility functions
├── utils/
│   └── supabase/          # Supabase client utilities
├── supabase/
│   └── schema.sql         # Complete database schema
├── public/                # Static assets
└── styles/                # Global styles
```

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** and npm
- A [Supabase](https://supabase.com/) project

### 1. Clone the Repository

```bash
git clone https://github.com/THEJAS-KRISHNA-P-R/repairhub.git
cd repairhub
```

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com/)
2. Open the SQL Editor in your Supabase dashboard.
3. Open `supabase/schema.sql` from this repository.
4. Copy and paste the **entire content** of `schema.sql` into the SQL Editor and run it. this sets up all tables, policies, functions, and triggers.
5. Enable Email/Password authentication in Authentication > Providers
6. (Optional) Configure Google OAuth for social login

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Optional (for Google OAuth):
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Database Schema

The app uses the following main tables:

| Table | Description |
|-------|-------------|
| `profiles` | User profiles (linked to Supabase Auth) |
| `repair_posts` | Repair attempt documentation |
| `guides` | Comprehensive repair guides |
| `comments` | Threaded comments on posts |
| `categories` | Categories for repairs |
| `votes` | Upvotes on repair posts |
| `bookmarks` | User bookmarks |
| `follows` | User follower/following relationships |
| `notifications` | User notifications |
| `reports` | Content moderation reports |
| `badges` | Available achievement badges |
| `user_badges` | Badges earned by users |

All tables have Row Level Security (RLS) enabled for data protection.

## 🛠️ Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## 🔒 Authentication

RepairHub uses Supabase Auth with:
- Email/password authentication
- Google OAuth (optional)
- Automatic profile creation on signup via database trigger
- Session management via middleware

## 📸 Storage

Images are stored in Supabase Storage with:
- Public `repair-images` bucket
- Authenticated upload policy
- Public read access
- Support for multiple image uploads

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ❤️ for the repair community
