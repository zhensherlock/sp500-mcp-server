# FeaturesSection Elicitation & Sampling Feature Cards

## Overview
Add two new feature cards to FeaturesSection.tsx to showcase MCP elicitation and sampling capabilities.

## Features

### 1. Elicitation Feature Card
- **Icon**: MessageCircleQuestion (lucide-react)
- **Title**: "Elicitation"
- **Description**: "Prompt users for required information before executing complex operations."

### 2. Sampling Feature Card
- **Icon**: Brain (lucide-react)
- **Title**: "Sampling"
- **Description**: "Summarize and analyze data with AI-powered sampling capabilities."

## Implementation

### Changes to FeaturesSection.tsx
- Import `MessageCircleQuestion` and `Brain` icons from lucide-react
- Add two new feature objects to the `features` array

### Styling
- Maintain existing card styling: `feature-card animate-on-scroll p-6 bg-card border border-border rounded-xl`
- Icon styling: `w-12 h-12 flex items-center justify-center bg-accent rounded-lg mb-4 text-primary`

## Dependencies
- No new dependencies required (icons available in lucide-react)