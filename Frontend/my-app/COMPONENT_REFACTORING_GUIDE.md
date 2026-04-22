# Component Refactoring Guide — Best Practices

## Overview
This guide provides the standards and patterns to follow when refactoring components for a clean, modern UI.

## Spacing Standard (8px Grid)

All spacing should use multiples of 8px:
- `p-2` = 8px
- `p-3` = 12px  
- `p-4` = 16px
- `p-6` = 24px
- `p-8` = 32px
- `gap-4` = 16px (for flexbox/grid)
- `gap-6` = 24px
- `gap-8` = 32px

**Page padding**: `px-4 sm:px-6 lg:px-8`
**Section spacing**: `py-16 lg:py-20`
**Container width**: `max-w-7xl mx-auto`

## Typography Standards

### Headings
```jsx
// Page Title (H1)
<h1 className="heading-1">Page Title</h1>

// Section Title (H2)
<h2 className="heading-2">Section Title</h2>

// Subsection (H3)
<h3 className="heading-3">Subsection</h3>

// Card Title (H4)
<h4 className="heading-4">Card Title</h4>
```

### Body Text
```jsx
// Regular paragraph
<p className="text-body">Regular text</p>

// Small text
<p className="text-body-sm">Small text</p>

// Muted/secondary text
<p className="text-muted">Secondary text</p>
```

## Layout Patterns

### Full-width Container
```jsx
<div className="container-main section-padding">
  {/* Content here */}
</div>
```

### Card Grid
```jsx
<div className="grid grid-cols-auto gap-6">
  {items.map(item => (
    <div key={item.id} className="card-base card-hover p-6">
      {/* Card content */}
    </div>
  ))}
</div>
```

### Two-column Grid
```jsx
<div className="grid grid-cols-auto-2 gap-8">
  <div className="card-base p-6">{/* Left */}</div>
  <div className="card-base p-6">{/* Right */}</div>
</div>
```

### Section with Title
```jsx
<section className="section-padding">
  <div className="container-main">
    <div className="mb-12">
      <h2 className="heading-2 mb-2">Section Title</h2>
      <p className="text-muted">Section description</p>
    </div>
    {/* Content */}
  </div>
</section>
```

## Component Usage

### Button Pattern
```jsx
import { Button } from './ui/Components';

// Primary button
<Button variant="primary" size="md">Save</Button>

// Secondary button
<Button variant="secondary" size="md">Cancel</Button>

// Outlined button
<Button variant="outlined" size="md">Edit</Button>

// Large button (full width)
<Button variant="primary" size="lg" fullWidth>Proceed</Button>
```

### Card Pattern
```jsx
import { Card } from './ui/Components';

<Card variant="elevated">
  <Card.Header>
    <h3 className="heading-4">Card Title</h3>
  </Card.Header>
  <Card.Body>
    {/* Card content */}
  </Card.Body>
  <Card.Footer>
    <Button variant="primary">Action</Button>
  </Card.Footer>
</Card>
```

### Input Pattern
```jsx
import { Input } from './ui/Components';

<Input 
  label="Email"
  type="email"
  placeholder="Enter email"
  error={errors.email}
  helperText="We'll never share your email"
/>
```

### Grid Pattern
```jsx
import { Grid } from './ui/Components';

<Grid cols={3} gap={6}>
  {items.map(item => (
    <Card key={item.id}>...</Card>
  ))}
</Grid>
```

## Color System

### Text Colors
- Primary text: `text-gray-900 dark:text-white`
- Secondary text: `text-gray-600 dark:text-gray-400`
- Muted text: `text-gray-500 dark:text-gray-500`
- Interactive text: `text-green-600 dark:text-green-400`

### Background Colors
- Default bg: `bg-white dark:bg-gray-900`
- Elevated bg: `bg-gray-50 dark:bg-gray-800`
- Overlay bg: `bg-gray-900/50 dark:bg-black/50`

### Accent Colors
- Primary: `bg-green-600 hover:bg-green-700`
- Success: `bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200`
- Warning: `bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200`
- Error: `bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200`
- Info: `bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200`

### Borders
- Standard: `border border-gray-200 dark:border-gray-800`
- Soft: `border border-gray-100 dark:border-gray-900`
- Strong: `border-2 border-gray-300 dark:border-gray-700`

## Responsive Design

### Breakpoints (Tailwind defaults)
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Mobile-First Pattern
```jsx
// Default is mobile
// sm: adds at 640px
// md: adds at 768px
// lg: adds at 1024px

<div className="
  flex flex-col
  md:flex-row
  gap-4
  md:gap-8
  px-4
  md:px-6
  lg:px-8
">
```

### Typography Scaling
```jsx
<h1 className="text-2xl md:text-3xl lg:text-4xl">Title</h1>
<h2 className="text-xl md:text-2xl lg:text-3xl">Subtitle</h2>
<p className="text-sm md:text-base">Body text</p>
```

## Dark Mode Support

All colors should have dark variants:
```jsx
<div className="
  bg-white dark:bg-gray-900
  text-gray-900 dark:text-white
  border-gray-200 dark:border-gray-800
">
```

## Animation Guidelines

### Use Framer Motion for interactive animations
```jsx
import { motion } from 'framer-motion';

<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  className="btn-primary"
>
  Click me
</motion.button>
```

### Timing
- Fast: 150ms (hover effects)
- Normal: 300ms (state changes)
- Slow: 500ms (page transitions)

## Shadow Hierarchy

- `shadow-sm` - Cards, subtle elevation
- `shadow-md` - Elevated cards, modals
- `shadow-lg` - Floating elements, dropdowns
- `shadow-xl` - modals, overlays

## Common Patterns

### Empty State
```jsx
import { EmptyState } from './ui/Components';
import { Inbox } from 'lucide-react';

<EmptyState
  icon={Inbox}
  title="No items found"
  description="Try creating a new item to get started"
  action={<Button onClick={...}>Create Item</Button>}
/>
```

### Loading State
```jsx
import { LoadingState } from './ui/Components';

{isPending ? <LoadingState count={3} /> : <YourContent />}
```

### Modal Dialog
```jsx
import { Modal } from './ui/Components';

<Modal isOpen={isOpen} onClose={onClose} title="Confirm">
  Are you sure? This action cannot be undone.
  <div className="flex gap-3 mt-6 justify-end">
    <Button variant="secondary" onClick={onClose}>Cancel</Button>
    <Button variant="danger" onClick={handleDelete}>Delete</Button>
  </div>
</Modal>
```

## Accessibility Guidelines

1. **Semantic HTML**: Use `<button>`, `<a>`, `<form>` tags
2. **ARIA Labels**: Add `aria-label` for icon-only buttons
3. **Focus States**: All interactive elements must have visible focus
4. **Color Contrast**: Text should have 4.5:1 contrast ratio
5. **Touch Targets**: Buttons should be at least 44px × 44px
6. **Keyboard Navigation**: All features must be keyboard accessible

## Performance Tips

1. Use `memo()` for expensive components
2. Use `useCallback()` for event handlers in lists
3. Lazy load images: `loading="lazy"`
4. Code split pages: `const Component = lazy(() => import(...))`
5. Avoid inline objects in JSX (use useMemo)

## Common Patterns to Avoid

❌ **DON'T** use hardcoded colors (`#4CAF50`)
✅ **DO** use Tailwind classes or design tokens

❌ **DON'T** mix spacing scales (sometimes 16px, sometimes 20px)
✅ **DO** use 8px grid system consistently

❌ **DON'T** create custom components for standard UI
✅ **DO** use reusable components from `ui/Components.jsx`

❌ **DON'T** use custom CSS unless absolutely necessary
✅ **DO** use Tailwind @apply or component library

❌ **DON'T** nest deep component hierarchies
✅ **DO** use composition and modular components

## Checklist for Refactoring

- [ ] Remove all hardcoded colors
- [ ] Update spacing to 8px grid
- [ ] Use Tailwind utility classes
- [ ] Apply proper typography hierarchy
- [ ] Add dark mode support
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Ensure keyboard navigation works
- [ ] Add loading and empty states
- [ ] Review component hierarchy
- [ ] Optimize performance
- [ ] Test accessibility with real users/tools
