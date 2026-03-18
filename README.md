# ClothingCtrl

A modern multi-brand fashion e-commerce platform based in Nairobi, Kenya.

## 🌟 Features

### Customer-Facing
- **Shop** - Browse products by category (Clothes, Shoes, Accessories)
- **New Arrivals** - Latest additions to the store
- **Limited Drops** - Exclusive limited edition releases with countdown timers
- **Community** - User-generated content and style inspiration
- **Multi-currency Support** - Prices in KES, USD, EUR, GBP, and more
- **Shopping Cart** - Full cart functionality with variant selection
- **Wishlist** - Save favorite items for later
- **Newsletter** - Subscribe for updates and exclusive offers
- **Style Assistant** - Interactive styling recommendations

### Admin Dashboard
- **Dashboard** - Overview of sales, orders, customers, and key metrics
- **Products** - Full inventory management (CRUD operations)
- **Orders** - Process and track customer orders
- **Customers** - View registered customers and loyalty tiers
- **Subscribers** - Manage newsletter subscribers
- **Community** - Approve/reject user-submitted photos
- **Social Handles** - Manage social media links
- **Analytics** - Sales performance and trends

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Database**: Prisma ORM with SQLite
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📦 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- npm, yarn, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/clothingctrl.git
cd clothingctrl

# Install dependencies
bun install

# Set up the database
bun run db:push

# Start development server
bun run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./db/custom.db"
```

## 📁 Project Structure

```
clothingctrl/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/              # Admin dashboard pages
│   │   ├── api/                # API routes
│   │   ├── shop/               # Shop page
│   │   ├── new-arrivals/       # New arrivals page
│   │   ├── drops/              # Limited drops page
│   │   └── community/          # Community page
│   ├── components/
│   │   ├── admin/              # Admin-specific components
│   │   ├── layout/             # Layout components (Navbar, Footer, Hero)
│   │   ├── sections/           # Page sections
│   │   ├── products/           # Product-related components
│   │   ├── cart/               # Cart components
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/                    # Utilities and store
│   └── hooks/                  # Custom React hooks
├── prisma/
│   └── schema.prisma           # Database schema
├── public/                     # Static assets
└── db/                         # SQLite database
```

## 🎨 Design

- **Color Scheme**: Dark theme with amber/gold accents
- **Typography**: Modern, clean fonts
- **Responsive**: Mobile-first design
- **Animations**: Smooth transitions and interactions

## 📍 Location

**ClothingCtrl Store**  
Cargen House, Harambee Avenue, Room 310  
Nairobi CBD, Kenya

## 📱 Social Media

- Instagram: [@clothingctrl](https://instagram.com/clothingctrl)
- TikTok: [@clothingctrl](https://tiktok.com/@clothingctrl)
- Twitter: [@clothingctrl](https://twitter.com/clothingctrl)

## 📄 License

This project is proprietary. All rights reserved.

---

Made with ❤️ in Nairobi, Kenya
