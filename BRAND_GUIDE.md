# AlpineCrypto Capital Brand Guide

## Brand Identity

AlpineCrypto Capital is an institutional-grade digital asset investment platform with a Swiss financial aesthetic. The brand emphasizes trust, professionalism, and strategic excellence.

## Logo

### Wordmark
The primary logo is a wordmark featuring "AlpineCrypto Capital" with "Crypto" highlighted in Swiss Red (#D32027).

**Variants:**
- **Default**: Navy text with red accent
- **White**: White text with red accent (for dark backgrounds)
- **Black**: Charcoal text with red accent (for light backgrounds)

### Usage
- Minimum size: 120px width
- Maintain clear space equal to the height of the "A" in Alpine
- Never distort or rotate the logo
- Always maintain the red accent on "Crypto"

## Color Palette

### Primary Colors

#### Corporate Navy
- **Hex**: `#0C1F3A`
- **Usage**: Primary headings, navigation, key UI elements
- **Tailwind**: `text-navy`, `bg-navy`, `border-navy`

#### Charcoal Gray
- **Hex**: `#2A2A2A`
- **Usage**: Body text, secondary content
- **Tailwind**: `text-charcoal`, `bg-charcoal`

#### Swiss Red
- **Hex**: `#D32027`
- **Usage**: Primary accent, CTAs, hover states, interactive elements
- **Tailwind**: `text-red`, `bg-red`, `hover:bg-red-600`

#### Off-White
- **Hex**: `#F9F9F9`
- **Usage**: Background sections, subtle contrast
- **Tailwind**: `bg-offwhite`

#### Pure White
- **Hex**: `#FFFFFF`
- **Usage**: Primary background, card backgrounds
- **Tailwind**: `bg-white`

### Color Scale
Each color includes a full scale (50-900) for gradients and variations:
- `navy-50` through `navy-900`
- `charcoal-50` through `charcoal-900`
- `red-50` through `red-900`

## Typography

### Font Families

#### Headings: Playfair Display (Serif)
- **Usage**: All headings (H1-H6)
- **Weights**: 400 (Regular), 600 (Semibold), 700 (Bold)
- **CSS Variable**: `var(--font-playfair)`
- **Tailwind**: `font-serif`

#### Body: Inter (Sans-serif)
- **Usage**: Body text, UI elements, navigation
- **CSS Variable**: `var(--font-inter)`
- **Tailwind**: `font-sans`

### Type Scale

#### Display Sizes
- **Display 1**: 4rem (64px) - Hero headlines
- **Display 2**: 3rem (48px) - Section headers

#### Heading Sizes
- **H1**: 2.5rem (40px) - Page titles
- **H2**: 2rem (32px) - Section titles
- **H3**: 1.75rem (28px) - Subsection titles
- **H4**: 1.5rem (24px) - Card titles
- **H5**: 1.25rem (20px) - Small headings
- **H6**: 1.125rem (18px) - Smallest headings

#### Body
- **Base**: 1rem (16px) - Standard body text
- **Large**: 1.125rem (18px) - Emphasized text
- **Small**: 0.875rem (14px) - Captions, metadata

### Typography Classes
```css
.text-display-1  /* 4rem, bold */
.text-display-2  /* 3rem, bold */
.text-h1         /* 2.5rem, semibold */
.text-h2         /* 2rem, semibold */
/* etc. */
```

## UI Components

### Buttons

#### Primary Button
- Background: Swiss Red (#D32027)
- Text: White
- Hover: Darker red with shadow
- Usage: Primary CTAs, important actions

#### Secondary Button
- Background: Transparent
- Border: Navy (2px)
- Text: Navy
- Hover: Navy background, white text
- Usage: Secondary actions

#### Ghost Button
- Background: Transparent
- Text: Navy
- Hover: Red text, off-white background
- Usage: Tertiary actions, subtle interactions

### Cards
- Background: White
- Border: Light gray (#E5E7EB)
- Shadow: Subtle on hover
- Padding: 1.5rem (24px)
- Border radius: 0.5rem (8px)

### Navigation Links
- Default: Charcoal text
- Hover: Navy text with red underline animation
- Active: Navy text, semibold
- Underline: Red, animated from 0 to full width

## Spacing System

### Section Padding
- Standard: `py-20 px-4` (80px vertical, 16px horizontal)
- Custom class: `section-padding`

### Container
- Max width: 1280px (7xl)
- Custom class: `container-custom`

## Interactive States

### Hover
- All interactive elements use 300ms transitions
- Buttons: Scale to 98% on active
- Links: Red underline animation
- Cards: Subtle shadow increase

### Focus
- Visible focus states for accessibility
- Red outline on interactive elements

## SEO & Copy Tone

### Institutional Language
- "Professional Digital Asset Governance"
- "Trusted, Swiss-aligned portfolio advisory"
- "Institutional-grade investment platform"

### Regional Variations
- **EU**: Emphasize regulatory compliance, transparency
- **GCC**: Emphasize trust, strategic partnerships, long-term value

### Key Messaging
- Risk-aware, never promise returns
- Professional and strategic
- Transparent reporting
- Institutional focus

## RTL Support

### Arabic (RTL)
- Automatic direction switching
- Mirrored layouts
- Proper text alignment
- Maintained visual hierarchy

## Implementation

### Tailwind Config
All brand colors and typography are configured in `tailwind.config.ts`:
- Color tokens: `navy`, `charcoal`, `red`, `offwhite`
- Font families: `serif` (Playfair), `sans` (Inter)
- Custom font sizes: `display-1`, `display-2`, `h1-h6`

### CSS Variables
- `--font-playfair`: Playfair Display font family
- `--font-inter`: Inter font family

### Component Library
Reusable components in `components/ui/`:
- `Button` - All button variants
- `Card` - Card containers
- `Logo` - Brand logo component

## Usage Examples

### Hero Section
```tsx
<h1 className="text-display-1 text-navy font-serif">
  Professional Digital Asset Governance
</h1>
<Button variant="primary" href="/signup">
  Get Started
</Button>
```

### Navigation
```tsx
<Link href="/about" className="nav-link">
  About
</Link>
```

### Card
```tsx
<Card>
  <h3 className="text-h3 text-navy">Title</h3>
  <p className="text-charcoal">Content</p>
</Card>
```

## Accessibility

- Minimum contrast ratios: WCAG AA compliant
- Focus states on all interactive elements
- Semantic HTML structure
- ARIA labels where appropriate

## File Structure

```
components/
  brand/
    Logo.tsx          # Logo component
    LogoWordmark.tsx # SVG wordmark variant
  ui/
    Button.tsx       # Button component
    Card.tsx         # Card component
public/
  logo.svg          # Default logo
  logo-white.svg     # White variant
  logo-black.svg     # Black variant
```
