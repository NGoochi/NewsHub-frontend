# 🚀 NewsHub Frontend

A comprehensive web application for journalists, researchers, and media analysts to search, import, and analyze news articles using AI-powered insights.

## ✨ Features

### 📰 Multi-Method Article Import
- **NewsAPI Integration:** Advanced boolean query builder with source filtering
- **PDF Upload:** Drag & drop PDF files with automatic text extraction
- **Manual Entry:** Direct article creation with form validation
- **Real-time Progress:** Session-based import tracking with progress indicators

### 🔍 Advanced Article Management
- **Sophisticated Filtering:** Filter by categories, sentiment, stakeholders, outlets, authors
- **Multi-Column Sorting:** Sort by date, title, outlet, or quote count
- **Bulk Operations:** Select and delete multiple articles at once
- **Real-time Search:** Full-text search across titles, authors, and content

### 🤖 AI-Powered Analysis
- **Optimized Batch Processing:** 3-article batches for optimal performance
- **Progress Tracking:** Three-layer progress display (batch, overall, elapsed time)
- **Real-time Notifications:** Auto-dismissing status updates
- **Error Recovery:** Comprehensive retry logic and fallback mechanisms

### 📊 Stakeholder Quote Extraction
- **Automatic Extraction:** AI-powered identification of stakeholder quotes
- **Organized Display:** Quotes grouped by stakeholder with affiliations
- **Cross-Referencing:** Link quotes back to source articles

## 🛠️ Tech Stack

- **Framework:** Next.js 15.5.4 with App Router
- **Language:** TypeScript
- **Styling:** TailwindCSS 4
- **UI Components:** Shadcn/UI
- **State Management:** TanStack Query (React Query)
- **Forms:** React Hook Form with Zod validation
- **Icons:** Lucide React
- **Notifications:** Sonner
- **Build Tool:** Turbopack

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/NGoochi/NewsHub-frontend.git
   cd NewsHub-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:9090](http://localhost:9090)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── project/[id]/      # Dynamic project pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── dashboard/         # Dashboard components
│   ├── layout/           # Layout components
│   ├── project/          # Project-specific components
│   └── ui/               # Reusable UI components
├── lib/                  # Utilities and API clients
│   ├── api/              # API client functions
│   └── hooks/            # Custom React hooks
└── types/                # TypeScript type definitions
```

## 🎯 Core Components

### Import System
- **`ImportModalNew`:** Multi-tab import interface
- **`BooleanQueryBuilder`:** Advanced search query construction
- **`SourceSelector`:** Dynamic source filtering
- **`PDFUploader`:** File upload with progress tracking
- **`ManualArticleEntry`:** Form-based article creation

### Article Management
- **`ArticleFilters`:** Advanced filtering and sorting
- **`ArticlesTable`:** Bulk operations and expandable rows
- **`AnalysisQueue`:** Real-time batch processing

### Analysis
- **`AnalysisQueue`:** Optimized batch processing with progress tracking
- **`ProjectSidebar`:** Analysis controls and status display

## 🔌 API Integration

The frontend integrates with a comprehensive REST API supporting:

- **Project Management:** CRUD operations for projects
- **Article Import:** Session-based import workflows
- **Analysis Processing:** Batch-based AI analysis
- **Quote Extraction:** Stakeholder identification and quote extraction
- **Category Management:** Dynamic category definitions

See [`NewsHub-docs/docs/frontend-starter.md`](./NewsHub-docs/docs/frontend-starter.md) for complete API documentation.

## 📚 Documentation

Comprehensive documentation is available in the `NewsHub-docs` submodule:

- **[Frontend Starter Guide](./NewsHub-docs/docs/frontend-starter.md)** - Complete development guide
- **[Advanced Features](./NewsHub-docs/docs/frontend-features.md)** - Detailed feature documentation
- **[UI Specifications](./NewsHub-docs/docs/UI/)** - Page layouts and component specs
- **[Style Guidelines](./NewsHub-docs/docs/style-guidelines.md)** - Design system and conventions

## 🚀 Development

### Available Scripts

```bash
npm run dev          # Start development server (port 9090)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Key Development Features

- **Hot Reload:** Instant updates with Turbopack
- **Type Safety:** Full TypeScript coverage
- **Component Library:** Reusable UI components
- **API Client:** Centralized API management
- **Error Handling:** Comprehensive error boundaries
- **Performance:** Optimized rendering and caching

## 🎨 Design System

- **Theme:** Dark mode with slate color palette
- **Typography:** Clean, readable fonts optimized for content
- **Components:** Consistent design patterns with Shadcn/UI
- **Responsive:** Mobile-first responsive design
- **Accessibility:** WCAG 2.1 AA compliant

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080  # Backend API URL
```

### Backend Connection

The frontend connects to a Node.js/Express backend API. Ensure the backend is running on the configured port (default: 8080).

## 📊 Performance

- **Load Time:** < 2 seconds for initial page load
- **Filter Response:** < 100ms for filter operations
- **Batch Processing:** 3-article batches complete in < 30 seconds
- **Memory Usage:** Efficient memory management for large datasets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Shadcn/UI](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Styling with [TailwindCSS](https://tailwindcss.com/)

---

**NewsHub Frontend** - Professional news analysis made simple.