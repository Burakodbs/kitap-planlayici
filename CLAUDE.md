# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "Kitap Okuma Planlayıcısı" (Book Reading Planner), a Progressive Web App built with React and TypeScript for tracking reading goals and managing book collections. The application focuses on reading session tracking, goal management, and statistics visualization with offline capabilities.

## Development Commands

### Core Development Scripts
- `npm start` - Start development server (port 3000)
- `npm run build` - Build production bundle
- `npm test` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run type-check` - TypeScript type checking without compilation
- `npm run lint` - ESLint code analysis
- `npm run lint:fix` - Auto-fix ESLint issues

### Specialized Commands
- `npm run start:mobile` - Start with mobile-accessible host (0.0.0.0)
- `npm run analyze` - Bundle size analysis
- `npm run serve` - Build and serve production locally

## Architecture & Structure

### State Management Pattern
The application uses a custom hooks pattern with local storage persistence:
- **useBooks**: Manages book collection, reading sessions, and book lifecycle
- **useGoals**: Handles reading goals (monthly/weekly targets)
- **usePWA**: Progressive Web App installation and capabilities
- **useNotifications**: Browser notification permissions and scheduling

### Data Flow
1. Custom hooks manage state and side effects
2. Data persists automatically to localStorage via storageService
3. Components receive data and actions through hook interfaces
4. All storage operations include error handling and fallbacks

### Component Architecture
- **Layout Components**: Header, Navigation, MobileMenu for consistent UI structure
- **Page Components**: Dashboard, BookList, Statistics, GoalsPage for main views
- **Form Components**: BookForm, SessionForm for data entry
- **UI Components**: Modal, Toast, LoadingSpinner, ErrorBoundary for interactions

### TypeScript Configuration
- Uses path mapping with `@/` prefix for cleaner imports
- Strict mode enabled with comprehensive type checking
- Module resolution configured for modern React patterns

### PWA Features
- Service worker registration in public/sw.js
- Installable app capabilities with manifest.json
- Offline functionality through localStorage persistence
- Push notification support with permission management

## Key Technical Patterns

### Error Handling
- Global ErrorBoundary wraps entire application
- Individual hooks manage their own error states
- Storage operations include comprehensive error handling
- Toast notifications for user-facing errors

### Data Persistence
- Centralized StorageService class handles all localStorage operations
- Automatic save/load cycles in custom hooks
- Export/import functionality for data portability
- Graceful degradation when localStorage unavailable

### Mobile-First Design
- Responsive navigation with mobile menu toggle
- Touch-friendly interface components
- Progressive enhancement for larger screens