---
name: responsive-design-audit
description: Audits and ensures full responsiveness across different device viewports (mobile, tablet, desktop). Focuses on layout stability, typography scaling, and component adaptation.
---

# Responsive Design Audit Skill

Use this skill to verify and implement a fully responsive user interface that adapts seamlessly to any screen size.

## Audit Checklist

### 1. Viewport & Containers
- [ ] **No Horizontal Scroll**: Ensure `overflow-x-hidden` on main wrappers or fix elements that bleed out.
- [ ] **Adaptive Padding**: Use progressive padding (e.g., `p-4 sm:p-8 lg:p-12`).
- [ ] **Max Widths**: Use `max-w-screen-xl` or similar to prevent layout stretching on large monitors.
- [ ] **Full Width on Mobile**: Elements should occupy 100% width on small screens unless explicitly designed otherwise.

### 2. Grid & Flexbox
- [ ] **Column Stacking**: Ensure grids collapse correctly (e.g., `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`).
- [ ] **Alignment**: Check that items centered on desktop remain centered or align sensibly on mobile.
- [ ] **Wrapping**: Ensure flex items (especially legends or tags) use `flex-wrap`.

### 3. Typography & Sizing
- [ ] **Fluid Type**: Use responsive text sizes (e.g., `text-xl md:text-3xl`).
- [ ] **Icon Scaling**: Scale icons appropriately for touch targets (minimum 44x44px for buttons).
- [ ] **Truncation**: Use `truncate` or `line-clamp` for text that might overflow in narrow containers.

### 4. Media & Charts (D3.js/SVG)
- [ ] **ViewBox Scaling**: Ensure SVG charts use `viewBox` and `preserveAspectRatio="xMidYMid meet"`.
- [ ] **Responsive Margins**: Adjust D3 margins for mobile to prevent labels from being cut off.
- [ ] **Touch Interaction**: Ensure tooltips work with tap events and don't block other content.

## Verification Workflow

### Step 1: Emulate Devices
Use the `emulate` tool to test specific common viewports:
- **iPhone 13/14**: `390x844x3,mobile,touch`
- **iPad Pro**: `1024x1366x2,tablet,touch`
- **Desktop**: `1920x1080x1`

### Step 2: Visual Inspection
1. Open the page using `navigate_page`.
2. Take screenshots at each breakpoint using `take_screenshot`.
3. Check for:
   - Overlapping elements.
   - Text that is too small to read.
   - Images that are distorted.
   - Navigation menus that are inaccessible.

### Step 3: Interaction Check
- Verify that the mobile menu (Sheet/Hamburger) opens and closes correctly.
- Check that hover effects don't trigger accidentally or get "stuck" on touch devices.

## Implementation Patterns

### Responsive Sidebar
```tsx
// Hide fixed sidebar on mobile, show on md+
<aside className="hidden md:block fixed ...">...</aside>

// Use a Sheet for mobile navigation
<header className="md:hidden fixed top-0 ...">
  <Sheet>
    <SheetTrigger>...</SheetTrigger>
    <SheetContent side="left">...</SheetContent>
  </Sheet>
</header>
```

### Responsive D3 Margins
```tsx
const [isMobile, setIsMobile] = useState(false);
useEffect(() => {
  const check = () => setIsMobile(window.innerWidth < 768);
  check();
  window.addEventListener('resize', check);
  return () => window.removeEventListener('resize', check);
}, []);

const margin = {
  left: isMobile ? 60 : 120,
  top: 20, right: 20, bottom: 40
};
```

## When to use
- When the user reports "not responsive" or "looks bad on mobile".
- Before finalizing a UI feature.
- To ensure cross-browser and cross-device compatibility.
