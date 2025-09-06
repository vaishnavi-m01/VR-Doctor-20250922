# VR Doctor App - Constants System

This document explains how to use the centralized constants system to manage hardcoded values across the VR Doctor app.

## 🏗️ Architecture Overview

The app now uses a centralized constants system with three main components:

1. **`src/constants/appConstants.ts`** - Main constants file
2. **`src/config/environment.ts`** - Environment-specific configuration
3. **`src/utils/formUtils.ts`** - Utility functions for forms and validation

## 📁 File Structure

```
src/
├── constants/
│   └── appConstants.ts          # Main constants file
├── config/
│   └── environment.ts           # Environment configuration
├── utils/
│   └── formUtils.ts            # Utility functions
└── screens/
    ├── auth/
    │   └── Login.tsx           # Updated to use constants
    ├── dashboard/
    │   └── Home.tsx            # Updated to use constants
    ├── assessments/
    │   └── StudyObservation.tsx # Updated to use constants
    └── patients/
        └── components/
            └── PatientDashboardScreen.tsx # Updated to use constants
```

## 🔧 How to Use Constants

### 1. Import Constants

```typescript
import { 
  DEFAULT_PATIENT_INFO, 
  FORM_LABELS, 
  FORM_PLACEHOLDERS,
  SEGMENTED_OPTIONS,
  MESSAGES 
} from '../../constants/appConstants';
```

### 2. Replace Hardcoded Values

**Before (Hardcoded):**
```typescript
const [participantId, setParticipantId] = useState('0012-5389-5824');
const [age, setAge] = useState('54');

<Text>Participant ID: {participantId}</Text>
<Field label="Age" placeholder="Enter age" />
```

**After (Using Constants):**
```typescript
const [participantId, setParticipantId] = useState(DEFAULT_PATIENT_INFO.PARTICIPANT_ID);
const [age, setAge] = useState(DEFAULT_PATIENT_INFO.AGE);

<Text>{FORM_LABELS.PARTICIPANT_ID}: {participantId}</Text>
<Field label={FORM_LABELS.AGE} placeholder={FORM_PLACEHOLDERS.AGE} />
```

### 3. Use Utility Functions

```typescript
import { 
  getValidationMessage, 
  getSuccessMessage, 
  prepareFormSubmission 
} from '../../utils/formUtils';

// Validation
Alert.alert('Error', getValidationMessage('SPECIFY_REASON'));

// Success
Alert.alert('Success', getSuccessMessage('SAVED'));

// Form submission
const data = prepareFormSubmission(formData, patientId);
```

## 📋 Available Constants

### Patient Information
```typescript
DEFAULT_PATIENT_INFO = {
  PARTICIPANT_ID: '0012-5389-5824',
  AGE: '54',
  GENDER: 'Male',
  NAME: 'John Doe',
  ADDRESS: 'Laitkor, Shillong',
  PHONE: '+1 (555) 123-4567',
  EMAIL: 'patient@example.com',
}
```

### Form Labels
```typescript
FORM_LABELS = {
  PARTICIPANT_ID: 'Participant ID',
  AGE: 'Age',
  DATE: 'Date',
  DEVICE_ID: 'Device ID',
  // ... more labels
}
```

### Form Placeholders
```typescript
FORM_PLACEHOLDERS = {
  PARTICIPANT_ID: 'e.g., PT-0234',
  DATE: 'YYYY-MM-DD',
  DEVICE_ID: 'e.g., VR-1029',
  // ... more placeholders
}
```

### Segmented Options
```typescript
SEGMENTED_OPTIONS = {
  YES_NO: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' }
  ],
  GENDER: [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' }
  ],
  // ... more options
}
```

### Messages
```typescript
MESSAGES = {
  VALIDATION: {
    SPECIFY_REASON: 'Please specify the reason for not completing the session',
    DESCRIBE_TECH_ISSUES: 'Please describe the technical issues encountered',
    // ... more validation messages
  },
  SUCCESS: {
    SAVED: 'Study observation saved successfully!',
    FORM_CLEARED: 'Form cleared successfully!',
    // ... more success messages
  },
  ERROR: {
    SAVE_FAILED: 'Failed to save observation. Please try again.',
    // ... more error messages
  }
}
```

## 🚀 Benefits of This System

### 1. **Centralized Management**
- All hardcoded values in one place
- Easy to update and maintain
- Consistent across the entire app

### 2. **Type Safety**
- Full TypeScript support
- Compile-time error checking
- IntelliSense and autocomplete

### 3. **Easy Customization**
- Change values once, update everywhere
- Environment-specific configurations
- Feature flags support

### 4. **Better Maintainability**
- No more searching for hardcoded strings
- Clear separation of concerns
- Easy to add new constants

### 5. **Internationalization Ready**
- Easy to add multiple languages
- Centralized text management
- Consistent terminology

## 🔄 Migration Guide

### Step 1: Identify Hardcoded Values
Look for:
- String literals in JSX
- Hardcoded numbers
- Repeated text
- Placeholder values

### Step 2: Add to Constants
Add new constants to `appConstants.ts`:

```typescript
export const NEW_CONSTANTS = {
  LABEL: 'New Label',
  PLACEHOLDER: 'New placeholder text',
  VALUE: 'Default value',
} as const;
```

### Step 3: Update Components
Replace hardcoded values with constants:

```typescript
// Before
<Text>Hardcoded Text</Text>

// After
<Text>{NEW_CONSTANTS.LABEL}</Text>
```

### Step 4: Test
Ensure the component works exactly the same but now uses constants.

## 🎯 Best Practices

### 1. **Naming Convention**
- Use UPPER_SNAKE_CASE for constants
- Group related constants together
- Use descriptive names

### 2. **Organization**
- Keep constants organized by feature
- Use clear categories (FORM_LABELS, MESSAGES, etc.)
- Add comments for complex constants

### 3. **Type Safety**
- Use `as const` for literal types
- Define proper interfaces when needed
- Avoid `any` types

### 4. **Performance**
- Constants are imported once
- No runtime overhead
- Tree-shaking friendly

## 🐛 Troubleshooting

### Common Issues

1. **Import Errors**
   ```typescript
   // Wrong
   import { NON_EXISTENT_CONSTANT } from '../../constants/appConstants';
   
   // Right
   import { EXISTING_CONSTANT } from '../../constants/appConstants';
   ```

2. **Type Errors**
   ```typescript
   // Wrong - overly strict typing
   const [value, setValue] = useState(CONSTANT_VALUE);
   
   // Right - proper typing
   const [value, setValue] = useState<string>(CONSTANT_VALUE);
   ```

3. **Readonly Array Issues**
   ```typescript
   // Wrong - readonly array
   <Chip items={CONSTANT_ARRAY} />
   
   // Right - spread to create mutable copy
   <Chip items={[...CONSTANT_ARRAY]} />
   ```

### Solutions

1. **Check imports** - Ensure constants exist
2. **Use proper types** - Add explicit type annotations
3. **Spread arrays** - Use `[...CONSTANT_ARRAY]` for mutable copies
4. **Check constants file** - Verify constant names and values

## 📈 Future Enhancements

### Planned Features

1. **Environment Variables**
   - Different values for dev/staging/prod
   - API endpoints configuration
   - Feature flags

2. **Internationalization**
   - Multi-language support
   - Locale-specific constants
   - RTL language support

3. **Dynamic Constants**
   - User preferences
   - Theme customization
   - Dynamic content

4. **Validation Rules**
   - Form validation constants
   - Business rule constants
   - Error message constants

## 🤝 Contributing

When adding new constants:

1. **Follow naming conventions**
2. **Group logically**
3. **Add TypeScript types**
4. **Update this documentation**
5. **Test thoroughly**

## 📞 Support

For questions about the constants system:
- Check this documentation
- Review existing constants
- Follow established patterns
- Ask the development team

---

**Remember**: The goal is to make the app more maintainable and consistent, not to over-engineer. Use constants for values that are truly shared or likely to change, not for every single string in the app.
