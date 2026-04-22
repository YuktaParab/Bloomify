# 🚀 QUICK REFERENCE — Bloomify UI/UX System

## 📦 Import Components

```jsx
import { 
  Card, Button, Badge, Input, Section, 
  Grid, Modal, LoadingState, EmptyState 
} from './ui/Components';
```

---

## 🎨 Component Examples

### Card
```jsx
<Card variant="elevated" hover>
  <Card.Header>
    <h3 className="heading-4">Title</h3>
  </Card.Header>
  <Card.Body>Content here</Card.Body>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>
```

### Button
```jsx
<Button variant="primary" size="md">Save</Button>
<Button variant="secondary" size="lg">Cancel</Button>
<Button variant="outlined" fullWidth>Edit</Button>
<Button variant="danger">Delete</Button>
```

### Input
```jsx
<Input 
  label="Email" 
  type="email" 
  placeholder="user@example.com"
  error={error}
  helperText="We'll never share your email"
/>
```

### Grid
```jsx
<Grid cols={3} gap={6}>
  {items.map(item => <Card key={item.id}>...</Card>)}
</Grid>
```

### Section
```jsx
<Section 
  title="Featured Plants"
  subtitle="Discover our collection"
>
  {/* Content */}
</Section>
```

### Badge
```jsx
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Failed</Badge>
```

### Modal
```jsx
<Modal isOpen={isOpen} onClose={onClose} title="Confirm">
  Are you sure?
  <div className="mt-6 flex gap-3 justify-end">
    <Button variant="secondary" onClick={onClose}>Cancel</Button>
    <Button variant="danger" onClick={confirm}>Delete</Button>
  </div>
</Modal>
```

---

## 🎯 Utility Classes Quick Reference

### Layout
- `container-main` - Max width container with padding
- `section-padding` - Full section padding (py-16 lg:py-20)
- `grid grid-cols-auto` - Responsive 1/2/3 col grid
- `grid grid-cols-auto-2` - Responsive 1/2 col grid

### Typography
- `heading-1` - Large page title (4xl/5xl)
- `heading-2` - Section title (3xl/4xl)
- `heading-3` - Subsection (2xl/3xl)
- `heading-4` - Small title (xl/2xl)
- `text-body` - Regular paragraph
- `text-body-sm` - Small paragraph
- `text-muted` - Secondary text

### Buttons
- `btn-primary` - Green action button
- `btn-secondary` - Gray button
- `btn-outlined` - Outlined button
- `btn-ghost` - Text button

### Forms
- `input-base` - Standard input
- `input-sm` - Small input
- `label-base` - Form label
- `input-error` - Error state

### Cards
- `card-base` - Basic card
- `card-elevated` - Elevated card
- `card-hover` - Add hover effect
- `glass-effect` - Glassmorphism effect

### Badges
- `badge-success` - Green badge
- `badge-warning` - Yellow badge
- `badge-error` - Red badge
- `badge-info` - Blue badge

### Utilities
- `flex-center` - Flex center alignment
- `flex-between` - Flex space-between
- `divider` - Horizontal line
- `line-clamp-2` - Limit to 2 lines

---

## 🎨 Color Cheat Sheet

### Text
```
text-gray-900 dark:text-white        → Primary
text-gray-600 dark:text-gray-400     → Secondary
text-gray-500 dark:text-gray-500     → Muted
text-green-600 dark:text-green-400   → Interactive
text-red-600 dark:text-red-400       → Error
```

### Backgrounds
```
bg-white dark:bg-gray-900            → Default
bg-gray-50 dark:bg-gray-800          → Elevated
bg-green-100 dark:bg-green-900/30    → Success bg
bg-red-100 dark:bg-red-900/30        → Error bg
bg-yellow-100 dark:bg-yellow-900/30  → Warning bg
```

### Actions
```
bg-green-600 hover:bg-green-700      → Primary button
bg-gray-200 dark:bg-gray-700         → Secondary bg
border-gray-200 dark:border-gray-800 → Standard border
```

---

## 📱 Responsive Pattern

```jsx
// Mobile-first
<div className="
  px-4 sm:px-6 lg:px-8              /* padding */
  py-8 lg:py-12                      /* spacing */
  flex flex-col md:flex-row          /* direction */
  gap-4 md:gap-6 lg:gap-8            /* gaps */
  grid-cols-1 md:grid-cols-2 lg:grid-cols-3
">
```

**Breakpoints**: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)

---

## 🔄 Complete Page Layout Template

```jsx
import { Section, Grid, Card, Button } from './ui/Components';
import PageContainer from './layout/PageContainer';

export default function PageName() {
  return (
    <PageContainer>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-950 py-20 lg:py-28">
        <div className="container-main">
          <h1 className="heading-1 mb-4">Main Title</h1>
          <p className="text-body mb-8 max-w-2xl">Description here</p>
          <div className="flex gap-4">
            <Button variant="primary">Get Started</Button>
            <Button variant="secondary">Learn More</Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <Section title="Features" subtitle="What we offer">
        <Grid cols={3} gap={6}>
          {features.map(feature => (
            <Card key={feature.id} variant="elevated" hover>
              <Card.Body>
                <h3 className="heading-4 mb-3">{feature.title}</h3>
                <p className="text-body-sm">{feature.description}</p>
              </Card.Body>
            </Card>
          ))}
        </Grid>
      </Section>

      {/* Content Section */}
      <Section title="Content" subtitle="">
        <div className="max-w-3xl mx-auto">
          <p className="text-body mb-6">Content paragraph</p>
          <Button variant="primary">Action</Button>
        </div>
      </Section>
    </PageContainer>
  );
}
```

---

## ✅ Refactoring Checklist

- [ ] Fix all custom CSS variable syntax
- [ ] Use Tailwind classes instead
- [ ] Apply 8px grid spacing
- [ ] Use typography classes
- [ ] Add dark mode variants
- [ ] Test on mobile (375px)
- [ ] Test on tablet (768px)
- [ ] Test on desktop (1024px)
- [ ] Check keyboard navigation
- [ ] Verify focus states (ring-2 ring-green-500)
- [ ] Remove inline styles
- [ ] Use component library
- [ ] No hardcoded colors
- [ ] Consistent with design system

---

## 🎨 Common Replacements

### Custom CSS Variables → Tailwind
```
bg-(--primary)           → bg-green-600
text-(--text)            → text-gray-900 dark:text-white
border-(--border)        → border-gray-200 dark:border-gray-800
text-(--text-secondary)  → text-gray-600 dark:text-gray-400
px-10 sm:px-14 lg:px-20  → px-4 sm:px-6 lg:px-8
```

### Spacing
```
gap-14  → gap-6
gap-16  → gap-6 or gap-8
px-10   → px-4 or px-6
py-24   → py-16 or py-20
```

---

## 🚀 Quick Start

1. **Copy template** - Use the page layout template above
2. **Add components** - Import from `./ui/Components.jsx`
3. **Use sections** - Wrap content in `<Section>` component
4. **Apply classes** - Use utility and component classes
5. **Test responsive** - Verify on 3 breakpoints
6. **Add dark mode** - Include dark: variants

---

## 📚 Full Documentation

- **UI_MODERNIZATION_COMPLETE.md** - Complete overview
- **COMPONENT_REFACTORING_GUIDE.md** - Detailed patterns
- **REFACTORING_ROADMAP.md** - Full roadmap
- **UI_REFACTORING_PLAN.md** - Strategy

---

## 💬 Questions?

Check files in this order:
1. This quick reference
2. COMPONENT_REFACTORING_GUIDE.md
3. UI_MODERNIZATION_COMPLETE.md
4. Component source: `src/components/ui/Components.jsx`

---

**Last Updated**: April 2, 2026 ✨
