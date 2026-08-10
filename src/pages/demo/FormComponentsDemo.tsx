import { useState } from 'react';
import { Checkbox, Radio, FileUpload, Card } from '../../components/common';

export const FormComponentsDemo = () => {
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [radioValue, setRadioValue] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>('');

  const handleFileChange = (selectedFile: File | null, error?: string) => {
    setFile(selectedFile);
    setFileError(error || '');
  };

  return (
    <div className="min-h-screen bg-stone-100 py-8 px-4">
      <div className="container-custom max-w-4xl">
        <h1 className="text-3xl font-bold text-stone-900 mb-8">Form Components Demo</h1>

        <div className="space-y-8">
          {/* Checkbox Demo */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-stone-900 mb-4">Checkbox Component</h2>
            <div className="space-y-4">
              <Checkbox
                id="checkbox1"
                label="Accept terms and conditions"
                checked={checkboxValue}
                onChange={(e) => setCheckboxValue(e.target.checked)}
              />
              
              <Checkbox
                id="checkbox2"
                label="Subscribe to newsletter"
                helperText="Get weekly updates about new products"
              />
              
              <Checkbox
                id="checkbox3"
                label="Required checkbox"
                required
              />
              
              <Checkbox
                id="checkbox4"
                label="Checkbox with error"
                error="This field is required"
              />
              
              <div className="mt-4 p-3 bg-stone-100 rounded">
                <p className="text-sm text-stone-600">
                  Current value: <strong>{checkboxValue ? 'Checked' : 'Unchecked'}</strong>
                </p>
              </div>
            </div>
          </Card>

          {/* Radio Demo */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-stone-900 mb-4">Radio Component</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-stone-700 mb-2">Select a payment method:</p>
                <Radio
                  id="radio1"
                  name="payment"
                  value="card"
                  label="Credit/Debit Card"
                  checked={radioValue === 'card'}
                  onChange={(e) => setRadioValue(e.target.value)}
                  helperText="Pay securely with your card"
                />
                <Radio
                  id="radio2"
                  name="payment"
                  value="bank"
                  label="Bank Transfer"
                  checked={radioValue === 'bank'}
                  onChange={(e) => setRadioValue(e.target.value)}
                  helperText="Direct bank transfer"
                />
                <Radio
                  id="radio3"
                  name="payment"
                  value="cash"
                  label="Cash on Delivery"
                  checked={radioValue === 'cash'}
                  onChange={(e) => setRadioValue(e.target.value)}
                />
              </div>
              
              <div className="space-y-2 pt-4 border-t border-stone-200">
                <p className="text-sm font-medium text-stone-700 mb-2">Required selection:</p>
                <Radio
                  id="radio4"
                  name="required"
                  value="required"
                  label="Required radio option"
                  required
                />
              </div>
              
              <Radio
                id="radio5"
                name="error"
                value="error"
                label="Radio with error"
                error="Please select an option"
              />
              
              <div className="mt-4 p-3 bg-stone-100 rounded">
                <p className="text-sm text-stone-600">
                  Selected value: <strong>{radioValue || 'None'}</strong>
                </p>
              </div>
            </div>
          </Card>

          {/* FileUpload Demo */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-stone-900 mb-4">FileUpload Component</h2>
            <div className="space-y-6">
              <FileUpload
                id="file1"
                label="Upload Product Image"
                onChange={handleFileChange}
                helperText="Upload a high-quality image of the product"
              />
              
              <FileUpload
                id="file2"
                label="Required File Upload"
                required
              />
              
              <FileUpload
                id="file3"
                label="File Upload with Error"
                error="Please upload a valid image file"
              />
              
              <FileUpload
                id="file4"
                label="Custom Size Limit (1MB)"
                maxSizeMB={1}
                showPreview={true}
                helperText="Maximum file size: 1MB"
              />
              
              <FileUpload
                id="file5"
                label="PNG Only"
                acceptedTypes={['image/png']}
                helperText="Only PNG images are accepted"
              />
              
              <FileUpload
                id="file6"
                label="No Preview"
                showPreview={false}
                helperText="File upload without image preview"
              />
              
              <div className="mt-4 p-3 bg-stone-100 rounded">
                <p className="text-sm text-stone-600">
                  Selected file: <strong>{file ? file.name : 'None'}</strong>
                  {file && (
                    <>
                      <br />
                      Size: <strong>{(file.size / 1024).toFixed(2)} KB</strong>
                      <br />
                      Type: <strong>{file.type}</strong>
                    </>
                  )}
                  {fileError && (
                    <>
                      <br />
                      Error: <strong className="text-red-600">{fileError}</strong>
                    </>
                  )}
                </p>
              </div>
            </div>
          </Card>

          {/* Integration Example */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-stone-900 mb-4">Complete Form Example</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <FileUpload
                id="product-image"
                label="Product Image"
                required
                helperText="Upload an image of the spare part"
              />
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-stone-700">Product Condition *</p>
                <Radio
                  id="new"
                  name="condition"
                  value="new"
                  label="Brand New"
                  required
                />
                <Radio
                  id="used"
                  name="condition"
                  value="used"
                  label="Used"
                />
                <Radio
                  id="refurbished"
                  name="condition"
                  value="refurbished"
                  label="Refurbished"
                />
              </div>
              
              <div className="space-y-2">
                <Checkbox
                  id="warranty"
                  label="Includes warranty"
                />
                <Checkbox
                  id="installation"
                  label="Installation service available"
                />
                <Checkbox
                  id="terms-form"
                  label="I agree to the terms and conditions"
                  required
                />
              </div>
              
              <button type="submit" className="btn btn-primary">
                Submit Form
              </button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
