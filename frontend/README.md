# Achievement Tracker

A modern, cross-platform achievement tracker inspired by SteamHunters.com with a sleek Steam-themed design.

## Features

- 🏆 Track achievements across multiple platforms (Steam, Xbox, PlayStation, GOG, Epic Games, Nintendo Switch)
- 🎮 Beautiful, responsive UI with Steam's color palette
- 🔍 Advanced search and filtering capabilities
- 📊 Progress tracking and statistics
- 🌙 Dark and high contrast theme support
- ♿ Full accessibility support with keyboard navigation
- 📱 Mobile-friendly responsive design

## Tech Stack

- **Frontend**: Vue 3 (Composition API) + TypeScript
- **Styling**: Less with scoped styles
- **State Management**: Pinia
- **Routing**: Vue Router with lazy loading
- **Build Tool**: Vite
- **Linting**: ESLint + Prettier

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd achievement-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests (coming soon)

## Project Structure

```
src/
├── assets/           # Static assets
├── components/       # Vue components
├── composables/      # Composition API utilities
├── data/            # Mock data files
├── pages/           # Page components
├── router/          # Vue Router configuration
├── services/        # API services and mappers
├── stores/          # Pinia stores
├── styles/          # Global styles and variables
└── types/           # TypeScript type definitions
```

## Architecture

### Components

The application uses a component-based architecture with:

- **App-level components**: AppHeader, AppFooter, Toast, Modal
- **UI components**: SearchBar, GameCard, TagPills, ProgressRing, etc.
- **Page components**: HomePage, SearchResultsPage, GamePage, etc.

### State Management

Pinia stores manage different aspects of the application:

- `appStore` - Global app state (theme, toasts, modals)
- `userStore` - User authentication and preferences
- `searchStore` - Search filters and results
- `gamesStore` - Game data and caching

### Styling

- **CSS Framework**: Custom Less-based design system
- **Variables**: Centralized color palette and spacing
- **Mixins**: Reusable styling patterns
- **Utilities**: Utility classes for common patterns
- **Themes**: Dark and high contrast theme support

## Accessibility

The application follows WCAG 2.1 AA guidelines:

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- High contrast theme option
- Reduced motion support

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## API Integration

Currently uses mock data for demonstration. The API layer is designed to be easily swapped with real backends:

- SteamHunters.com API
- MetaGamerScore API
- Exophase API
- Platform-specific APIs (Steam, Xbox Live, PSN, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by SteamHunters.com and similar achievement tracking platforms
- Steam color palette and design language
- Vue.js and TypeScript communities
