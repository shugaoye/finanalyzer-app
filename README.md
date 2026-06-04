# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
VITE_API_BASE_URL=https://your-backend.example.com
VITE_APP_TITLE=Finanalyzer
```

- `VITE_API_BASE_URL` - Backend API base URL. Set to empty string for local development with Vite proxy, or specify a remote backend URL.
- `VITE_APP_TITLE` - Application title displayed in the browser.

## Dashboard API Service

The `src/services/dashboardApi.ts` service handles all dashboard-related API calls with automatic authentication:

### Features

- **Connection-based Authentication**: Automatically retrieves authentication headers from `connectionService` based on the configured `VITE_API_BASE_URL`
- **URL Encoding**: Properly encodes widget IDs that may contain slashes
- **Query Parameter Support**: Supports authentication via query parameters in addition to headers

### Usage

```typescript
import { getDashboards, deleteWidget } from './services/dashboardApi';

// Get all dashboards (authentication handled automatically)
const dashboards = await getDashboards();

// Delete a widget (widget ID is URL-encoded automatically)
await deleteWidget(dashboardId, 'equity/screener-123');
```

### Authentication Flow

1. The service reads `VITE_API_BASE_URL` from environment variables
2. It matches the URL against configured connections in `connectionService`
3. Authentication headers/query params are extracted from the matching connection
4. All API requests include the authentication automatically

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
