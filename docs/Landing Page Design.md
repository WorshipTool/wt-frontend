# Landing Page Design

## Design Direction

The landing page follows a **Cyberpunk Neon** aesthetic — dark, dramatic, and highly animated:

- **Dark theme**: Deep blacks (#0a0a0f) with blue-tinted dark greys
- **Neon accents**: Cyan (#00e5ff), Magenta (#ff00e5), Purple (#7b2fff), Green (#39ff14)
- **Glitch effects**: Hero title uses CSS clip-path glitch animation with chromatic aberration
- **Neon glow**: Text shadows and box shadows create neon light effects
- **Perspective grid**: Animated 3D grid background flowing toward the viewer
- **Scanline overlay**: CRT-style scanlines for retro-futuristic atmosphere
- **Particle effects**: Floating neon particles drifting across the background

## Typography

- **Display font**: Orbitron (Google Fonts) — futuristic, geometric, angular
- **Body font**: JetBrains Mono (Google Fonts) — monospace, tech feel
- **Headings**: Uppercase with wide letter-spacing (0.06-0.12em)

## Component Architecture

### Hero Section (HomeDesktop.tsx)
- GlitchText component for the main title with neon-pulse and glitch-skew animations
- Staggered entrance animations with blur-to-sharp effect (filter: blur transition)
- CyberOrbs: 4 neon-colored floating orbs (cyan, purple, magenta, green)
- Floating particle system (6 particles with drift animation)

### Background (Background.tsx)
- Multi-layered dark background:
  - GridLayer: Flat grid with CSS mask gradient
  - PerspectiveGrid: 3D flowing grid with perspective transform
  - ScanlineOverlay: Repeating horizontal lines (CRT effect)
  - VignetteOverlay: Radial gradient darkening at edges

### Search Input (MainSearchInput.tsx)
- Dark glass-morphism container with neon cyan border
- Scanner line animation sweeping across the input (::before pseudo-element)
- Animated gradient border (border-dance animation) when on hero
- Focus state with multi-layered neon glow shadow

### Feature Cards (LandingFeaturesSection.tsx)
- 3D perspective hover effect (rotateX, rotateY via Framer Motion)
- Each card has a unique accent color (cyan, purple, magenta)
- Top-line neon accent on hover (::after pseudo-element)
- Background gradient overlay on hover (::before pseudo-element)
- Decorative neon line separator under section title

### About Teaser (LandingAboutTeaser.tsx)
- Corner bracket decorations (cyan top-left, magenta bottom-right)
- Top/bottom gradient border lines (::before, ::after)
- Background glow orb with pulse animation
- Sheep illustration with hue-rotate filter for neon style

### Toolbar (Toolbar.tsx)
- Dark glass-morphism with backdrop blur
- Neon cyan bottom border line when not transparent
- Dual-layer glow shadow (cyan + purple)

### Footer (Footer.tsx)
- Dark theme matching the overall aesthetic
- Neon cyan top border
- Links with hover glow effect (textShadow)
- Heart icon in magenta with drop-shadow glow

### Floating Add Button (FloatingAddButton.tsx)
- Triple-gradient background (cyan → purple → magenta)
- Neon glow shadow with hover intensification
- Scale-up hover effect

## CSS Animations Catalog

| Animation | Duration | Description |
|-----------|----------|-------------|
| glitch-1, glitch-2 | 2.5-3s | Clip-path based text glitch |
| glitch-skew | 4s | Subtle skew distortion |
| neon-pulse | 3s | Pulsing neon text glow |
| neon-flicker | continuous | Random opacity flicker |
| neon-border-pulse | continuous | Pulsing border glow |
| border-dance | 4s | Gradient position animation |
| scanner-line | 3s | Sweeping highlight line |
| grid-flow | 4s | Perspective grid scrolling |
| landing-float-slow/medium | 15-25s | Floating orb movement |
| landing-pulse-glow | 4-5s | Orb opacity pulsing |
| particle-drift | 8-18s | Particle upward float |
| wave-warp | 12s | Morphing border-radius |
| card-float | continuous | Subtle 3D card movement |
| cursor-blink | continuous | Typing cursor blink |
| pulse-ring | continuous | Expanding ring effect |
| hex-rotate | continuous | 360° rotation |

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| --neon-cyan | #00e5ff | Primary accent, links, borders |
| --neon-magenta | #ff00e5 | Secondary accent, CTA |
| --neon-purple | #7b2fff | Gradients, depth |
| --neon-green | #39ff14 | Success, glitch layer |
| --neon-gold | #ffd700 | Highlights |
| --neon-pink | #ff2d7b | Emphasis |
| --bg-deep | #0a0a0f | Main background |
| --bg-surface | #0e0e1a | Elevated surfaces |
| --bg-card | rgba(14,14,26,0.85) | Card backgrounds |
| --bg-glass | rgba(20,20,40,0.6) | Glass-morphism panels |
