# Form Components Documentation

This document provides usage guidelines for the form components implemented in this project.

## Overview

The following form components are available:
- **Checkbox**: Multi-select input component
- **Radio**: Single-select input component
- **FileUpload**: File upload with validation and preview
- **Textarea**: Multi-line text input (previously implemented)

All components follow consistent patterns and integrate with the validation utilities in `src/utils/validation.ts`.

## Checkbox Component

### Basic Usage

```tsx
import { Checkbox } from '@/components/common';

<Checkbox
  id="terms"
  label="Accept terms and conditions"
  onChange={(e) => setAccepted(e.target.checked)}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Label text displayed next to the checkbox |
| `error` | `string` | - | Error message to display below the checkbox |
| `helperText` | `string` | - | Helper text displayed below the label |
| `required` | `boolean` | `false` | Shows required indicator (*) |
| `className` | `string` | `''` | Additional CSS classes |

All standard HTML input attributes are supported via spread props.

### Examples

**With error:**
```tsx
<Checkbox
  id="agree"
  label="I agree"
  error="You must agree to continue"
/>
```

**Required field:**
```tsx
<Checkbox
  id="confirm"
  label="Confirm action"
  required
/>
```

**With helper text:**
```tsx
<Checkbox
  id="newsletter"
  label="Subscribe to newsletter"
  helperText="Receive weekly updates about new products"
/>
```

## Radio Component

### Basic Usage

```tsx
import { Radio } from '@/components/common';

<Radio
  id="option1"
  name="payment"
  value="card"
  label="Credit Card"
  checked={selected === 'card'}
  onChange={(e) => setSelected(e.target.value)}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Label text displayed next to the radio button |
| `error` | `string` | - | Error message to display below the radio |
| `helperText` | `string` | - | Helper text displayed below the label |
| `required` | `boolean` | `false` | Shows required indicator (*) |
| `className` | `string` | `''` | Additional CSS classes |

All standard HTML input attributes are supported via spread props.

### Examples

**Radio group:**
```tsx
const [payment, setPayment] = useState('');

<div>
  <Radio
    id="card"
    name="payment"
    value="card"
    label="Credit/Debit Card"
    checked={payment === 'card'}
    onChange={(e) => setPayment(e.target.value)}
  />
  <Radio
    id="bank"
    name="payment"
    value="bank"
    label="Bank Transfer"
    checked={payment === 'bank'}
    onChange={(e) => setPayment(e.target.value)}
  />
</div>
```

**With helper text:**
```tsx
<Radio
  id="express"
  name="shipping"
  value="express"
  label="Express Shipping"
  helperText="Delivery in 1-2 business days"
/>
```

**With error:**
```tsx
<Radio
  id="required"
  name="required"
  value="yes"
  label="Required option"
  error="Please select an option"
/>
```

## FileUpload Component

### Basic Usage

```tsx
import { FileUpload } from '@/components/common';

<FileUpload
  id="product-image"
  label="Product Image"
  onChange={(file, error) => {
    if (error) {
      console.error(error);
    } else {
      console.log('Selected file:', file);
    }
  }}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Label text displayed above the upload area |
| `error` | `string` | - | Error message to display below the upload area |
| `helperText` | `string` | - | Helper text displayed below the error/label |
| `maxSizeMB` | `number` | `5` | Maximum file size in megabytes |
| `acceptedTypes` | `string[]` | `['image/jpeg', 'image/jpg', 'image/png', 'image/webp']` | Allowed file MIME types |
| `showPreview` | `boolean` | `true` | Whether to show image preview after upload |
| `required` | `boolean` | `false` | Shows required indicator (*) |
| `onChange` | `(file: File \| null, error?: string) => void` | - | Callback when file is selected or cleared |
| `className` | `string` | `''` | Additional CSS classes for the upload area |

All standard HTML input attributes (except `type` and `onChange`) are supported via spread props.

### Features

- **Automatic validation**: File size and type are validated automatically
- **Visual feedback**: Displays file name and size after selection
- **Image preview**: Shows thumbnail preview for image files
- **Clear functionality**: Button to remove selected file
- **Error handling**: Displays validation errors inline
- **Drag and drop ready**: UI prepared for drag-and-drop (implementation can be added)

### Examples

**Basic image upload:**
```tsx
const [file, setFile] = useState<File | null>(null);

<FileUpload
  id="image"
  label="Upload Image"
  onChange={(file, error) => {
    if (!error && file) {
      setFile(file);
    }
  }}
/>
```

**Custom size limit:**
```tsx
<FileUpload
  id="logo"
  label="Company Logo"
  maxSizeMB={2}
  helperText="Maximum file size: 2MB"
/>
```

**Specific file types:**
```tsx
<FileUpload
  id="png-only"
  label="PNG Images Only"
  acceptedTypes={['image/png']}
  helperText="Only PNG format is accepted"
/>
```

**Without preview:**
```tsx
<FileUpload
  id="document"
  label="Upload Document"
  showPreview={false}
/>
```

**Required upload with validation:**
```tsx
const [uploadError, setUploadError] = useState('');

<FileUpload
  id="required-file"
  label="Required File"
  required
  error={uploadError}
  onChange={(file, error) => {
    if (error) {
      setUploadError(error);
    } else {
      setUploadError('');
    }
  }}
/>
```

**Complete form integration:**
```tsx
const [formData, setFormData] = useState({
  image: null as File | null,
  imageError: ''
});

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  
  if (!formData.image) {
    setFormData(prev => ({ ...prev, imageError: 'Image is required' }));
    return;
  }
  
  // Upload file to Supabase or process it
  const formDataToSend = new FormData();
  formDataToSend.append('image', formData.image);
  
  // ... submit logic
};

<form onSubmit={handleSubmit}>
  <FileUpload
    id="product-image"
    label="Product Image"
    required
    error={formData.imageError}
    onChange={(file, error) => {
      setFormData({
        image: file,
        imageError: error || ''
      });
    }}
  />
  <button type="submit" className="btn btn-primary">
    Submit
  </button>
</form>
```

## Validation Integration

All form components integrate seamlessly with the validation utilities in `src/utils/validation.ts`:

```tsx
import { validateRequired, validateImageFile } from '@/utils/validation';

// Checkbox validation
const checkboxError = validateRequired(checkboxValue, 'Terms acceptance');

// File validation
const handleFileUpload = (file: File | null) => {
  if (file) {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error);
    }
  }
};
```

## Accessibility Features

All components are built with accessibility in mind:

- ✅ Proper ARIA labels and roles
- ✅ Keyboard navigation support
- ✅ Focus states with visible indicators
- ✅ Screen reader friendly
- ✅ Semantic HTML structure
- ✅ Error announcements
- ✅ Required field indicators

## Styling

Components use Tailwind CSS and custom utility classes defined in `src/styles/index.css`:

- Consistent focus states with ring utilities
- Error states with red color scheme
- Smooth transitions
- Responsive design
- Dark mode compatible color schemes

## Browser Compatibility

All components are compatible with modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Complete Example

See `src/pages/demo/FormComponentsDemo.tsx` for a comprehensive demonstration of all form components with various configurations and use cases.

## Common Patterns

### Form with validation

```tsx
const [formState, setFormState] = useState({
  agreeToTerms: false,
  shippingMethod: '',
  productImage: null as File | null,
  errors: {
    terms: '',
    shipping: '',
    image: ''
  }
});

const validateForm = () => {
  const errors = {
    terms: !formState.agreeToTerms ? 'You must agree to terms' : '',
    shipping: !formState.shippingMethod ? 'Please select shipping method' : '',
    image: !formState.productImage ? 'Product image is required' : ''
  };
  
  setFormState(prev => ({ ...prev, errors }));
  return !Object.values(errors).some(error => error);
};

const handleSubmit = (e: FormEvent) => {
  e.preventDefault();
  if (validateForm()) {
    // Submit form
  }
};
```

## Tips

1. **Always provide labels**: Improves accessibility and UX
2. **Use helper text**: Guide users on what to input
3. **Validate on blur**: Provide immediate feedback
4. **Clear error states**: Reset errors when user corrects input
5. **Group related radios**: Use the same `name` attribute
6. **Handle file cleanup**: Clear file references when component unmounts
7. **Test with keyboard**: Ensure all interactions work without mouse

## Related Components

- **Input**: Single-line text input (`Input.tsx`)
- **Select**: Dropdown selection (`Select.tsx`)
- **Textarea**: Multi-line text input (`Textarea.tsx`)
- **Button**: Form submission (`Button.tsx`)

## Support

For issues or questions about these components, refer to:
- Design document: `.kiro/specs/mexcon-autos-platform/design.md`
- Requirements: `.kiro/specs/mexcon-autos-platform/requirements.md`
- Validation utilities: `src/utils/validation.ts`
