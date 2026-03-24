# Landing Page Design

## Design Direction

The landing page follows a **warm, modern, playful yet clean** aesthetic:

- **Warm tones**: Grey palette uses warm undertones for a friendlier feel
- **Glass morphism**: Panels use semi-transparent backgrounds with backdrop blur
- **Soft shadows**: Layered box-shadows create gentle depth
- **Smooth animations**: Staggered entrance animations via Framer Motion
- **Consistent radius**: 16px on cards/panels, 18px on search input

## Component Architecture

### Hero Section (HomeDesktop.tsx)
- Staggered text entrance with heroContainerVariants
- Title uses gradient text for visual depth
- Background shapes with blur and reduced saturation

### Search Input (MainSearchInput.tsx)
- Glass-morphism container with backdrop blur
- Gradient border on hero, clean shadow when scrolled
- Focus state with blue-tinted shadow

### Side Panels
- Consistent glass-morphism across all panels
- Hover: elevation + shadow increase
- Sheep mascot has playful hover rotation

### Animations
- Easing: [0.25, 0.46, 0.45, 0.94] for entrances
- Transitions: cubic-bezier(0.4, 0, 0.2, 1)
- Hero text: 80ms stagger, 400ms duration
- Search input: 500ms, 350ms delay
- Side panel: 500ms slide-in, 400ms delay
