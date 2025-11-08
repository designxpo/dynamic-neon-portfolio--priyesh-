# MagicBento Component Usage Guide

## Overview
The `MagicBento` component adds interactive effects to any card/element:
- ✨ Particle stars on hover
- 🎨 Border glow effect
- 🔄 3D tilt on mouse move
- 🧲 Magnetic pull effect
- 💧 Click ripple animation
- 🌟 Spotlight effect (global)

## Installation
Already installed! GSAP dependency added.

## Basic Usage

### Wrap any card content:
```tsx
import MagicBento from '@/components/MagicBento';

<MagicBento>
  <div className="your-card-content">
    <h3>Your Title</h3>
    <p>Your description</p>
  </div>
</MagicBento>
```

### Full Configuration Example:
```tsx
<MagicBento 
  textAutoHide={true}
  enableStars={true}
  enableSpotlight={true}
  enableBorderGlow={true}
  enableTilt={true}
  enableMagnetism={true}
  clickEffect={true}
  spotlightRadius={300}
  particleCount={12}
  glowColor="132, 0, 255"  // RGB format
  className="custom-class"
  style={{ backgroundColor: '#060010' }}
>
  {/* Your card content */}
</MagicBento>
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | required | Card content to wrap |
| `textAutoHide` | boolean | `true` | Auto-hide overflow text with ellipsis |
| `enableStars` | boolean | `true` | Show particle stars on hover |
| `enableSpotlight` | boolean | `true` | Enable spotlight effect |
| `enableBorderGlow` | boolean | `true` | Glowing border on hover |
| `enableTilt` | boolean | `true` | 3D tilt effect on mouse move |
| `enableMagnetism` | boolean | `true` | Magnetic pull toward cursor |
| `clickEffect` | boolean | `true` | Ripple animation on click |
| `spotlightRadius` | number | `300` | Spotlight size in pixels |
| `particleCount` | number | `12` | Number of particle stars |
| `glowColor` | string | `"132, 0, 255"` | RGB color for effects |
| `className` | string | `""` | Additional CSS classes |
| `style` | CSSProperties | `{}` | Inline styles |

## Examples

### 1. Education Card (Minimal Effects)
```tsx
<MagicBento
  enableStars={false}
  enableTilt={false}
  enableMagnetism={false}
>
  <div className="education-card">
    <h3>B.Tech in Computer Science</h3>
    <p>Galgotias University</p>
    <span>2020 - 2024</span>
  </div>
</MagicBento>
```

### 2. Project Card (Full Effects)
```tsx
<MagicBento
  enableStars={true}
  enableBorderGlow={true}
  enableTilt={true}
  enableMagnetism={true}
  clickEffect={true}
  particleCount={15}
  glowColor="0, 255, 157"  // Green glow
>
  <div className="project-card">
    <img src="project.png" alt="Project" />
    <h3>Awesome Project</h3>
    <p>Description here</p>
  </div>
</MagicBento>
```

### 3. Service Card (Medium Effects)
```tsx
<MagicBento
  enableStars={true}
  enableBorderGlow={true}
  enableTilt={false}
  enableMagnetism={false}
  clickEffect={true}
  particleCount={8}
>
  <div className="service-card">
    <Icon />
    <h3>UI/UX Design</h3>
    <p>Beautiful interfaces</p>
  </div>
</MagicBento>
```

### 4. Testimonial Card (Subtle)
```tsx
<MagicBento
  enableStars={false}
  enableBorderGlow={true}
  enableTilt={false}
  clickEffect={false}
  spotlightRadius={200}
>
  <div className="testimonial-card">
    <p>"Amazing work!"</p>
    <span>- John Doe</span>
  </div>
</MagicBento>
```

## Where to Use

### Recommended Sections:
- ✅ **Services** - Full effects
- ✅ **Projects/Recent Works** - Full effects with custom colors
- ✅ **Skills** - Minimal (border glow only)
- ✅ **Education** - Subtle (border glow + click)
- ✅ **Experience** - Medium effects
- ✅ **Testimonials** - Subtle effects
- ✅ **Blog cards** - Medium effects

### Not Recommended:
- ❌ Hero section (too distracting)
- ❌ Header/Navigation
- ❌ Footer
- ❌ Contact forms (interferes with UX)

## Performance Tips

1. **Disable on mobile** - Effects are automatically lighter on mobile
2. **Reduce particle count** for many cards: `particleCount={6}`
3. **Disable stars** for better performance: `enableStars={false}`
4. **Use selectively** - Not every card needs all effects

## Custom Colors

### Brand Purple (Default)
```tsx
glowColor="132, 0, 255"  // Your brand purple
```

### Green Accent
```tsx
glowColor="0, 255, 157"
```

### Blue
```tsx
glowColor="0, 157, 255"
```

### Red/Pink
```tsx
glowColor="255, 0, 157"
```

## Integration Steps

1. Import the component:
```tsx
import MagicBento from '@/components/MagicBento';
```

2. Wrap your existing card:
```tsx
// Before
<div className="card">...</div>

// After
<MagicBento>
  <div className="card">...</div>
</MagicBento>
```

3. Adjust props based on card type (see examples above)

4. Test and adjust `particleCount` and `glowColor` as needed

## Troubleshooting

**Effects not showing?**
- Check that GSAP is installed: `npm install gsap`
- Verify CSS file is imported in component
- Check browser console for errors

**Performance issues?**
- Reduce `particleCount`
- Disable `enableStars`
- Use fewer effects on mobile

**Styling conflicts?**
- MagicBento adds minimal styles
- Your card styles should work normally
- Use `className` and `style` props for customization

**Z-index issues?**
- Effects use z-index 100-200
- Adjust if conflicts with modals/dropdowns

## Next Steps

1. Start with Services section (most visual impact)
2. Add to Projects/Recent Works
3. Gradually add to other sections
4. A/B test user engagement

All changes committed and pushed to Dev branch! 🚀
