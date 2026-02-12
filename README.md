# Depot

A React component library.

## Installation

```bash
npm install depot
# or
pnpm add depot
# or
yarn add depot
```

## Usage

```tsx
import { Button } from "depot";

function App() {
  return (
    <Button variant="primary" size="md">
      Click me
    </Button>
  );
}
```

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Watch mode for development
npm run dev

# Type check
npm run typecheck
```

## Project Structure

```
src/
├── components/       # Reusable components
│   └── Button/
│       ├── Button.tsx
│       └── index.ts
└── index.tsx         # Main entry point
```
