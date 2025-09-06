# VR Doctor App - Style Guide

## Overview
This style guide ensures consistent visual design and user experience across the VR Doctor application. All components should follow these established patterns.

## Color System

### Brand Colors
```css
/* Primary Brand Colors - Use these consistently */
--brand-dark-green: #0e4336     /* Main navigation, primary buttons */
--brand-accent-green: #0ea06c   /* Highlights, indicators, success states */
--brand-light-green: #f5fbf8    /* Light backgrounds, inactive states */
--brand-border-green: #d7ebe3   /* Borders, dividers */
--brand-text-green: #2c4a43     /* Text on light backgrounds */
```

### Semantic Colors
```css
/* Success States */
--success: #16a34a
--success-light: #dcfce7

/* Error States */
--error: #ef4444
--error-light: #fee2e2

/* Warning States */
--warning: #f59e0b
--warning-light: #fef3c7

/* Info States */
--info: #3b82f6
--info-light: #dbeafe
```

### Usage Guidelines
- **Primary Actions**: Use `bg-brand-dark-green` with white text
- **Secondary Actions**: Use `bg-brand-light-green` with `text-brand-text-green`
- **Accent Elements**: Use `bg-brand-accent-green` for highlights
- **Form Errors**: Use `border-error` and `text-error`
- **Success Messages**: Use `text-success` or `bg-success`

## Typography

### Font Family
```css
/* Primary Font - Zen Kaku Gothic Antique */
font-zen          /* Regular weight */
font-zen-light    /* Light weight */
font-zen-medium   /* Medium weight */
font-zen-bold     /* Bold weight */
```

### Text Sizes
```css
text-xs      /* 12px - Captions, labels */
text-sm      /* 14px - Body text, descriptions */
text-base    /* 16px - Default body text */
text-lg      /* 18px - Subheadings */
text-xl      /* 20px - Card titles */
text-2xl     /* 24px - Page titles */
text-3xl     /* 30px - Main headings */
```

### Common Text Patterns
```tsx
// Page Headers
<Text className="font-zen-bold text-2xl text-brand-text-green">

// Section Headers  
<Text className="font-zen-medium text-lg text-gray-700">

// Body Text
<Text className="font-zen text-sm text-gray-600">

// Error Messages
<Text className="font-zen text-xs text-error">

// Success Messages
<Text className="font-zen text-sm text-success">
```

## Spacing System

### Consistent Spacing Scale
```css
/* Use these spacing values consistently */
gap-1    /* 4px */
gap-2    /* 8px */
gap-3    /* 12px */
gap-4    /* 16px */
gap-6    /* 24px */
gap-8    /* 32px */

/* Padding/Margin follows same scale */
p-2, m-2    /* 8px */
p-3, m-3    /* 12px */
p-4, m-4    /* 16px */
p-6, m-6    /* 24px */
```

### Component Spacing
- **Cards**: `p-4` or `p-6` for internal padding
- **Forms**: `gap-3` between form fields
- **Buttons**: `px-6 py-3` for standard buttons
- **Lists**: `gap-2` between list items

## Component Patterns

### Buttons
```tsx
// Primary Button
<Pressable className="bg-brand-dark-green rounded-xl px-6 py-3 shadow-custom">
  <Text className="font-zen-medium text-white text-center">Action</Text>
</Pressable>

// Secondary Button
<Pressable className="bg-brand-light-green border border-brand-border-green rounded-xl px-6 py-3">
  <Text className="font-zen-medium text-brand-text-green text-center">Action</Text>
</Pressable>
```

### Cards
```tsx
// Standard Card
<View className="bg-white rounded-xl border border-gray-200 p-4 shadow-custom">
  {/* Card content */}
</View>

// Large Card
<View className="bg-white rounded-xl border border-gray-200 p-6 shadow-custom-lg">
  {/* Card content */}
</View>
```

### Form Inputs
```tsx
// Standard Input
<TextInput
  className="font-zen border border-gray-300 rounded-lg p-3 text-sm focus:border-brand-accent-green"
  placeholderTextColor="#94a3b8"
/>

// Error Input
<TextInput
  className="font-zen border border-error rounded-lg p-3 text-sm"
  placeholderTextColor="#94a3b8"
/>

// Input Label
<Text className="font-zen-medium text-sm text-gray-700 mb-2">Label</Text>

// Error Message
<Text className="font-zen text-xs text-error mt-1">Error message</Text>
```

### Navigation Tabs
```tsx
// Active Tab
<Pressable className="bg-brand-dark-green border-brand-dark-green rounded-full px-4 py-2">
  <Text className="font-zen-bold text-white text-sm">Tab</Text>
</Pressable>

// Inactive Tab
<Pressable className="bg-brand-light-green border-brand-border-green rounded-full px-4 py-2">
  <Text className="font-zen-medium text-brand-text-green text-sm">Tab</Text>
</Pressable>
```

## Layout Patterns

### Screen Structure
```tsx
// Standard Screen Layout
<View className="flex-1 bg-white">
  {/* Header */}
  <View className="px-4 py-3 border-b border-gray-200">
    <Text className="font-zen-bold text-2xl text-brand-text-green">Title</Text>
  </View>
  
  {/* Content */}
  <ScrollView className="flex-1 px-4">
    {/* Page content */}
  </ScrollView>
</View>
```

### Form Layout
```tsx
// Form Container
<View className="bg-white rounded-xl p-6 gap-4">
  {/* Form fields with gap-3 between them */}
  <View className="gap-3">
    {/* Input group */}
    <View>
      <Text className="font-zen-medium text-sm text-gray-700 mb-2">Label</Text>
      <TextInput className="..." />
    </View>
  </View>
  
  {/* Action buttons */}
  <View className="flex-row gap-3 mt-6">
    <Pressable className="...">Secondary</Pressable>
    <Pressable className="...">Primary</Pressable>
  </View>
</View>
```

## Accessibility Guidelines

### Required Accessibility Props
```tsx
// Buttons
<Pressable
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel="Descriptive label"
  accessibilityHint="What happens when pressed"
>

// Tabs
<Pressable
  accessible={true}
  accessibilityRole="tab"
  accessibilityState={{ selected: isActive }}
  accessibilityLabel="Tab name"
>

// Text Inputs
<TextInput
  accessible={true}
  accessibilityRole="text"
  accessibilityLabel="Input purpose"
  accessibilityHint="Expected input format"
/>
```

## Animation & Shadows

### Standard Shadows
```css
shadow-custom     /* Standard component shadow */
shadow-custom-lg  /* Elevated component shadow */
```

### Border Radius
```css
rounded-lg     /* 8px - Small components */
rounded-xl     /* 12px - Cards, buttons */
rounded-2xl    /* 16px - Large cards */
rounded-3xl    /* 24px - Bottom navigation */
rounded-full   /* Pills, indicators */
```

## Do's and Don'ts

### ✅ Do's
- Use the brand color system consistently
- Apply proper accessibility labels
- Use the spacing scale (gap-2, gap-3, gap-4, etc.)
- Follow the font hierarchy (zen-bold for headers, zen-medium for buttons)
- Use semantic colors for states (error, success, warning)

### ❌ Don'ts
- Don't use hardcoded hex colors (use the brand system)
- Don't mix font weights inconsistently
- Don't use arbitrary spacing values
- Don't forget accessibility props on interactive elements
- Don't use inline styles when Tailwind classes exist

## Component Examples

### Dashboard Card
```tsx
<View className="bg-white rounded-xl border border-gray-200 p-6 shadow-custom">
  <View className="flex-row items-center gap-3 mb-4">
    <View className="w-12 h-12 bg-brand-light-green rounded-xl items-center justify-center">
      <Icon size={24} color="#2c4a43" />
    </View>
    <View className="flex-1">
      <Text className="font-zen-bold text-lg text-gray-900">Title</Text>
      <Text className="font-zen text-sm text-gray-500">Subtitle</Text>
    </View>
  </View>
  {/* Card content */}
</View>
```

### Form Section
```tsx
<View className="bg-white rounded-xl p-6 gap-4">
  <Text className="font-zen-bold text-xl text-brand-text-green mb-2">Section Title</Text>
  
  <View className="gap-3">
    <View>
      <Text className="font-zen-medium text-sm text-gray-700 mb-2">Field Label</Text>
      <TextInput
        className="font-zen border border-gray-300 rounded-lg p-3 text-sm focus:border-brand-accent-green"
        placeholderTextColor="#94a3b8"
        placeholder="Enter value..."
      />
    </View>
  </View>
</View>
```

## Implementation Notes

1. **Import the design system**: `import { DESIGN_SYSTEM, COMMON_STYLES } from '../styles/designSystem';`
2. **Use Tailwind config**: All brand colors are available as Tailwind classes
3. **Consistent naming**: Follow the established naming conventions
4. **Component library**: Build reusable components following these patterns
5. **Testing**: Test with accessibility tools and screen readers

---

*This style guide should be referenced for all new components and when refactoring existing ones.*
