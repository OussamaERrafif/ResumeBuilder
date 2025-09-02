# Contributing to ApexResume

Thank you for your interest in contributing to ApexResume! We welcome contributions from the community and are grateful for your support.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/OussamaERrafif/ResumeBuilder.git
   cd ResumeBuilder
   ```
3. **Install dependencies**:
   ```bash
   pnpm install
   ```
4. **Set up environment variables**:
   - Copy `.env.example` to `.env.local`
   - Fill in the required environment variables
5. **Run the development server**:
   ```bash
   pnpm dev
   ```

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Git

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## 📝 How to Contribute

### Reporting Bugs
1. Check existing issues to avoid duplicates
2. Create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details

### Suggesting Features
1. Check existing issues for similar requests
2. Create a new issue with:
   - Clear description of the feature
   - Use case and benefits
   - Possible implementation approach

### Making Changes

#### 1. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

#### 2. Make Your Changes
- Follow existing code style and conventions
- Write clear, descriptive commit messages
- Add tests if applicable
- Update documentation if needed

#### 3. Test Your Changes
```bash
# Run linting
pnpm lint

# Run type checking
pnpm type-check

# Build the project
pnpm build
```

#### 4. Submit a Pull Request
1. Push your branch to your fork
2. Create a pull request with:
   - Clear title and description
   - Reference any related issues
   - Screenshots/videos for UI changes

## 📋 Code Style Guidelines

### General
- Use TypeScript for all new code
- Follow existing naming conventions
- Write clear, self-documenting code
- Add comments for complex logic

### Component Structure
```tsx
"use client" // Only if needed

import { ... } from "react"
import { ... } from "next/..."
import { ... } from "third-party-libs"
import { ... } from "@/components/..."
import { ... } from "@/lib/..."

// Component code here
export default function ComponentName() {
  // Component logic
}
```

### File Naming
- Components: `PascalCase.tsx`
- Pages: `kebab-case.tsx` or `page.tsx`
- Utils/Hooks: `camelCase.ts`
- Constants: `UPPER_SNAKE_CASE`

## 🧪 Testing

- Write tests for new features and bug fixes
- Ensure all existing tests pass
- Test across different browsers and devices
- Test with different user roles and permissions

## 📚 Documentation

When making changes, please update:
- README.md (if setup instructions change)
- Code comments for complex functions
- JSDoc comments for public APIs
- This CONTRIBUTING.md (if contribution process changes)

## 🎯 Areas We Need Help With

- **New Resume Templates**: Create additional professional templates
- **AI Features**: Improve AI-powered content suggestions
- **Accessibility**: Enhance a11y compliance
- **Internationalization**: Add support for multiple languages
- **Performance**: Optimize loading times and bundle size
- **Testing**: Add comprehensive test coverage
- **Documentation**: Improve user guides and API documentation

## 🔍 Code Review Process

1. All changes require review from maintainers
2. Reviews focus on:
   - Code quality and style
   - Performance implications
   - Security considerations
   - User experience impact
3. Address feedback promptly and respectfully
4. Maintainers will merge approved PRs

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Discord**: [Join our community](link-to-discord) (if available)

## 🎉 Recognition

Contributors will be:
- Added to our README contributors section
- Mentioned in release notes for significant contributions
- Given credit in the application (where appropriate)

## 📄 License

By contributing to ApexResume, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to ApexResume! 🙏

Every contribution, no matter how small, helps make ApexResume better for everyone.
