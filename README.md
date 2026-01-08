# 🚀 Welcome to myJournal

A modern, production-ready journal and task tracking application built with Next.js, TypeScript, and Tailwind CSS.

## ✨ Technology Stack

This scaffold provides a robust foundation built with:

### 🎯 Core Framework

- **⚡ Next.js 15** - The React framework for production with App Router
- **📘 TypeScript 5** - Type-safe JavaScript for better developer experience
- **🎨 Tailwind CSS 4** - Utility-first CSS framework for rapid UI development

### 🧩 UI Components & Styling

- **🧩 shadcn/ui** - High-quality, accessible components built on Radix UI
- **🎯 Lucide React** - Beautiful & consistent icon library
- **🌈 Framer Motion** - Production-ready motion library for React
- **🎨 Next Themes** - Perfect dark mode in 2 lines of code

### 📋 Forms & Validation

- **🎣 React Hook Form** - Performant forms with easy validation
- **✅ Zod** - TypeScript-first schema validation

### 🔄 State Management & Data Fetching

- **🐻 Zustand** - Simple, scalable state management
- **🔄 TanStack Query** - Powerful data synchronization for React
- **🌐 Fetch** - Promise-based HTTP request

### 🗄️ Database & Backend

- **🗄️ Prisma** - Next-generation TypeScript ORM
- **🔐 NextAuth.js** - Complete open-source authentication solution

### 🎨 Advanced UI Features

- **📊 TanStack Table** - Headless UI for building tables and datagrids
- **🖱️ DND Kit** - Modern drag and drop toolkit for React
- **📊 Recharts** - Redefined chart library built with React and D3
- **🖼️ Sharp** - High performance image processing

### 🌍 Internationalization & Utilities

- **🌍 Next Intl** - Internationalization library for Next.js
- **📅 Date-fns** - Modern JavaScript date utility library
- **🪝 ReactUse** - Collection of essential React hooks for modern development

## 🎯 Why myJournal?

- **📝 Personal Journaling** - Track your goals, tasks, and reflections in one place
- **🎨 Beautiful UI** - Complete shadcn/ui component library with advanced interactions
- **🔒 Type Safety** - Full TypeScript configuration with Zod validation
- **📱 Responsive** - Mobile-first design principles with smooth animations
- **🗄️ Database Ready** - Prisma ORM configured for rapid backend development
- **🔐 Auth Included** - NextAuth.js for secure authentication flows
- **📊 Data Visualization** - Charts, tables, and drag-and-drop functionality
- **🌍 i18n Ready** - Multi-language support with Next Intl
- **🚀 Production Ready** - Optimized build and deployment settings
- **🤖 AI-Friendly** - Structured codebase perfect for AI assistance

## 🚀 Quick Start

### For Local Development
```bash
# Install dependencies
bun install

# Create .env file with local database configuration
echo DATABASE_URL="file:./dev.db" > .env

# Initialize the local database
bun run db:push

# Start development server
bun run dev
```

### For Production with Supabase
```bash
# Install dependencies
bun install

# Create .env file with Supabase configuration
# Get your Supabase URL and anon key from your Supabase dashboard
echo DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]" > .env
echo NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co" >> .env
echo NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key" >> .env

# Push schema to Supabase
bun run db:push

# Build for production
bun run build

# Start production server
bun start
```

Open [http://localhost:3002](http://localhost:3002) to see your myJournal application running in development.

> **Note for Windows Users:** The build and start scripts have been updated to be cross-platform compatible. If you encounter any issues with the dev server port, you can change the port in `package.json` (currently set to 3002).

## 🏗️ Windows-Specific Setup

For Windows users, the following changes have been made to ensure compatibility:

- **Build Script**: Updated to use `rimraf` and `mkdirp` for cross-platform directory operations, and `xcopy` for copying files
- **Logging**: Removed `tee` command (Unix-specific) from dev and start scripts
- **Database**: Added `.env` file configuration for SQLite database connection
- **Ports**: Changed default dev port to 3002 to avoid conflicts

Additional dependencies added for Windows compatibility:

- `cross-env` - For cross-platform environment variable management
- `rimraf` - For cross-platform file/directory removal
- `mkdirp` - For cross-platform directory creation


## 🗄️ Database Configuration

### Local Development (SQLite)
For local development, the application uses SQLite which requires no additional setup. The database file is stored locally as `dev.db`.

### Production (Supabase/PostgreSQL)
For production deployment, the application is configured to work with Supabase:

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com) and create an account
   - Create a new project
   - Get your Project URL and anon key from the Project Settings > API

2. **Configure Environment Variables**:
   - Set `DATABASE_URL` to your Supabase PostgreSQL connection string
   - Set `NEXT_PUBLIC_SUPABASE_URL` to your Supabase project URL
   - Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` to your anon key

3. **Push Database Schema**:
   - Run `bun run db:push` to apply your Prisma schema to Supabase

The application uses Prisma ORM which provides database abstraction, so switching between SQLite (local) and PostgreSQL (Supabase) requires only changing the connection string.

## 🎨 Available Features & Components

This scaffold includes a comprehensive set of modern web development tools:

### 🧩 UI Components (shadcn/ui)

- **Layout**: Card, Separator, Aspect Ratio, Resizable Panels
- **Forms**: Input, Textarea, Select, Checkbox, Radio Group, Switch
- **Feedback**: Alert, Toast (Sonner), Progress, Skeleton
- **Navigation**: Breadcrumb, Menubar, Navigation Menu, Pagination
- **Overlay**: Dialog, Sheet, Popover, Tooltip, Hover Card
- **Data Display**: Badge, Avatar, Calendar

### 📊 Advanced Data Features

- **Tables**: Powerful data tables with sorting, filtering, pagination (TanStack Table)
- **Charts**: Beautiful visualizations with Recharts
- **Forms**: Type-safe forms with React Hook Form + Zod validation

### 🎨 Interactive Features

- **Animations**: Smooth micro-interactions with Framer Motion
- **Drag & Drop**: Modern drag-and-drop functionality with DND Kit
- **Theme Switching**: Built-in dark/light mode support

### 🔐 Backend Integration

- **Authentication**: Ready-to-use auth flows with NextAuth.js
- **Database**: Type-safe database operations with Prisma
- **API Client**: HTTP requests with Fetch + TanStack Query
- **State Management**: Simple and scalable with Zustand

### 🌍 Production Features

- **Internationalization**: Multi-language support with Next Intl
- **Image Optimization**: Automatic image processing with Sharp
- **Type Safety**: End-to-end TypeScript with Zod validation
- **Essential Hooks**: 100+ useful React hooks with ReactUse for common patterns

## 🤝 Get Started with myJournal

1. **Clone this repository** to start your personal journaling journey
2. **Track your goals and tasks** with the intuitive interface
3. **Reflect on your progress** with analytics and timeline features
4. **Deploy with confidence** using the production-ready configuration

---

Built with ❤️ by Byamkesh Kaiwartya. 🚀
