import React, { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import '../styles/specifications.css';

interface FormData {
  nameEn: string;
  nameVi: string;
  shortDescriptionEn: string;
  shortDescriptionVi: string;
  detailDescriptionEn: string;
  detailDescriptionVi: string;
  image: string;
  images: string;
  inStock: boolean;
  weight: string;
}

interface FormSpecification {
  keyEn: string;
  keyVi: string;
  valueEn: string;
  valueVi: string;
}

interface FormVariation {
  colorEn: string;
  colorVi: string;
  image: string;
  sizeOptions: FormSizeOption[];
}

interface FormSizeOption {
  size: string;
  price: string;
  stock: string;
}

const AddProduct: React.FC = () => {
  const { addProduct } = useAdmin();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'vi'>('en');

  const [formData, setFormData] = useState<FormData>({
    nameEn: '',
    nameVi: '',
    shortDescriptionEn: '',
    shortDescriptionVi: '',
    detailDescriptionEn: '',
    detailDescriptionVi: '',
    image: '',
    images: '',
    inStock: true,
    weight: ''
  });

  const [specifications, setSpecifications] = useState<FormSpecification[]>([
    { keyEn: '', keyVi: '', valueEn: '', valueVi: '' }
  ]);

  const [variations, setVariations] = useState<FormVariation[]>([
    { colorEn: '', colorVi: '', image: '', sizeOptions: [{ size: '', price: '', stock: '' }] }
  ]);

  const [collapsedVariations, setCollapsedVariations] = useState<boolean[]>([false]);

  const createLocalizedString = (en: string, vi: string) => ({ en, vi });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : false;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSpecificationChange = (index: number, field: keyof FormSpecification, value: string) => {
    setSpecifications(prev => 
      prev.map((spec, i) => i === index ? { ...spec, [field]: value } : spec)
    );
  };

  const addSpecification = () => {
    setSpecifications(prev => [...prev, { keyEn: '', keyVi: '', valueEn: '', valueVi: '' }]);
  };

  const removeSpecification = (index: number) => {
    if (specifications.length > 1) {
      setSpecifications(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleVariationChange = (variationIndex: number, field: keyof Omit<FormVariation, 'sizeOptions'>, value: string) => {
    setVariations(prev => 
      prev.map((variation, i) => 
        i === variationIndex ? { ...variation, [field]: value } : variation
      )
    );
  };

  const handleSizeOptionChange = (variationIndex: number, sizeIndex: number, field: keyof FormSizeOption, value: string) => {
    setVariations(prev => 
      prev.map((variation, i) => 
        i === variationIndex 
          ? {
              ...variation,
              sizeOptions: variation.sizeOptions.map((sizeOption, j) => 
                j === sizeIndex ? { ...sizeOption, [field]: value } : sizeOption
              )
            }
          : variation
      )
    );
  };

  const addVariation = () => {
    setVariations(prev => [...prev, { colorEn: '', colorVi: '', image: '', sizeOptions: [{ size: '', price: '', stock: '' }] }]);
    setCollapsedVariations(prev => [...prev, false]);
  };

  const removeVariation = (index: number) => {
    if (variations.length > 1) {
      setVariations(prev => prev.filter((_, i) => i !== index));
      setCollapsedVariations(prev => prev.filter((_, i) => i !== index));
    }
  };

  const addSizeOption = (variationIndex: number) => {
    setVariations(prev => 
      prev.map((variation, i) => 
        i === variationIndex 
          ? { ...variation, sizeOptions: [...variation.sizeOptions, { size: '', price: '', stock: '' }] }
          : variation
      )
    );
  };

  const removeSizeOption = (variationIndex: number, sizeIndex: number) => {
    setVariations(prev => 
      prev.map((variation, i) => 
        i === variationIndex 
          ? { ...variation, sizeOptions: variation.sizeOptions.filter((_, j) => j !== sizeIndex) }
          : variation
      )
    );
  };

  const toggleVariationCollapse = (index: number) => {
    setCollapsedVariations(prev => 
      prev.map((collapsed, i) => i === index ? !collapsed : collapsed)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Convert specifications to the required format
      const specificationsArray = specifications
        .filter(spec => spec.keyEn.trim() || spec.keyVi.trim()) // Only include specifications with at least one key
        .map(spec => ({
          key: createLocalizedString(spec.keyEn || spec.keyVi, spec.keyVi || spec.keyEn),
          value: createLocalizedString(spec.valueEn || spec.valueVi, spec.valueVi || spec.valueEn)
        }));

      // Parse images array from textarea (one URL per line)
      const imagesArray = formData.images
        .split('\n')
        .map(url => url.trim())
        .filter(url => url);

      // Use first image as main image, fallback to single image field
      const mainImage = imagesArray.length > 0 ? imagesArray[0] : formData.image;

      // Convert variations to the required format
      const variationPayload = variations
        .filter(v => (v.colorEn || v.colorVi) && v.sizeOptions.some((so: FormSizeOption) => so.size.trim() !== ''))
        .map(v => ({
          color: createLocalizedString(v.colorEn || v.colorVi, v.colorVi || v.colorEn),
          image: v.image,
          sizeOptions: v.sizeOptions
            .filter((so: FormSizeOption) => so.size.trim() !== '')
            .map((so: FormSizeOption) => ({
              size: parseFloat(so.size) || 0,
              price: parseFloat(so.price) || 0,
              stock: parseInt(so.stock) || 0,
            }))
        }));

      await addProduct({
        name: createLocalizedString(formData.nameEn, formData.nameVi),
        shortDescription: formData.shortDescriptionEn.trim() || formData.shortDescriptionVi.trim() 
          ? createLocalizedString(formData.shortDescriptionEn, formData.shortDescriptionVi)
          : undefined,
        detailDescription: createLocalizedString(formData.detailDescriptionEn, formData.detailDescriptionVi),
        image: mainImage,
        images: imagesArray.length > 0 ? imagesArray : (formData.image ? [formData.image] : []),
        inStock: formData.inStock,
        specifications: specificationsArray,
        weight: parseFloat(formData.weight) || 0, // Convert to kg
        variations: variationPayload,
      });

      setSuccess(true);
      setFormData({
        nameEn: '',
        nameVi: '',
        shortDescriptionEn: '',
        shortDescriptionVi: '',
        detailDescriptionEn: '',
        detailDescriptionVi: '',
        image: '',
        images: '',
        inStock: true,
        weight: ''
      });
      
      // Reset variations and specifications
      setVariations([{ colorEn: '', colorVi: '', image: '', sizeOptions: [{ size: '', price: '', stock: '' }] }]);
      setCollapsedVariations([false]);
      setSpecifications([{ keyEn: '', keyVi: '', valueEn: '', valueVi: '' }]);

      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error adding product:', error);
      if (error.response && error.response.data) {
        // Handle validation errors from backend
        if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          const errorMessages = error.response.data.errors.map((err: any) => err.msg || err.message).join(', ');
          setError(`Validation errors: ${errorMessages}`);
        } else if (error.response.data.error) {
          setError(error.response.data.error);
        } else {
          setError('Failed to add product. Please check your input and try again.');
        }
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Failed to add product. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-product">
      <div className="page-header">
        <h1>Add New Product</h1>
        <p>Create a new product for your store</p>
      </div>

      {success && (
        <div className="success-message">
          ✅ Product added successfully!
        </div>
      )}

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="product-form">
        <div className="language-tabs">
          <button 
            type="button" 
            className={`tab-btn ${currentLanguage === 'en' ? 'active' : ''}`}
            onClick={() => setCurrentLanguage('en')}
          >
            English
          </button>
          <button 
            type="button" 
            className={`tab-btn ${currentLanguage === 'vi' ? 'active' : ''}`}
            onClick={() => setCurrentLanguage('vi')}
          >
            Vietnamese
          </button>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor={`name${currentLanguage === 'en' ? 'En' : 'Vi'}`}>
              Product Name ({currentLanguage === 'en' ? 'English' : 'Vietnamese'}) *
            </label>
            <input
              type="text"
              id={`name${currentLanguage === 'en' ? 'En' : 'Vi'}`}
              name={`name${currentLanguage === 'en' ? 'En' : 'Vi'}`}
              value={currentLanguage === 'en' ? formData.nameEn : formData.nameVi}
              onChange={handleChange}
              required
              placeholder={`Product name in ${currentLanguage === 'en' ? 'English' : 'Vietnamese'}`}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor={`shortDescription${currentLanguage === 'en' ? 'En' : 'Vi'}`}>
            Short Description ({currentLanguage === 'en' ? 'English' : 'Vietnamese'})
          </label>
          <input
            type="text"
            id={`shortDescription${currentLanguage === 'en' ? 'En' : 'Vi'}`}
            name={`shortDescription${currentLanguage === 'en' ? 'En' : 'Vi'}`}
            value={currentLanguage === 'en' ? formData.shortDescriptionEn : formData.shortDescriptionVi}
            onChange={handleChange}
            placeholder={`Brief description in ${currentLanguage === 'en' ? 'English' : 'Vietnamese'}`}
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label htmlFor={`detailDescription${currentLanguage === 'en' ? 'En' : 'Vi'}`}>
            Detail Description ({currentLanguage === 'en' ? 'English' : 'Vietnamese'}) *
          </label>
          <textarea
            id={`detailDescription${currentLanguage === 'en' ? 'En' : 'Vi'}`}
            name={`detailDescription${currentLanguage === 'en' ? 'En' : 'Vi'}`}
            value={currentLanguage === 'en' ? formData.detailDescriptionEn : formData.detailDescriptionVi}
            onChange={handleChange}
            required
            placeholder={`Detailed product description in ${currentLanguage === 'en' ? 'English' : 'Vietnamese'}`}
            rows={4}
          />
        </div>

        <div className="form-group">
            <label htmlFor="images">Product Images (one URL per line, Thumbnail first line) *</label>
            <textarea
            id="images"
            name="images"
            value={formData.images}
            onChange={handleChange}
            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;https://example.com/image3.jpg"
            rows={4}
            required
            />
          <small className="form-help">Enter each image URL on a new line. The first image will be used as the main product image.</small>
        </div>

        {/* Variations Section */}
        <div className="form-group">
          <label>Product Variations *</label>
          {variations.map((variation, index) => (
            <div key={index} className="variation-item">
              <div className="variation-header">
                <button
                  type="button"
                  className="collapse-btn"
                  onClick={() => toggleVariationCollapse(index)}
                >
                  {collapsedVariations[index] ? '▶' : '▼'}
                </button>
                <h4>
                  {variation.colorEn || variation.colorVi 
                    ? `${variation.colorEn || variation.colorVi} Variation` 
                    : `Variation ${index + 1}`
                  }
                </h4>
                {variation.image && (
                  <img
                    src={variation.image}
                    alt="Variation preview"
                    className="variation-image-preview"
                  />
                )}
                {variations.length > 1 && (
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeVariation(index)}
                  >
                    Remove
                  </button>
                )}
              </div>

              {!collapsedVariations[index] && (
                <div className="variation-content">
                  <div className="color-inputs">
                    <input
                      type="text"
                      placeholder="Color (English)"
                      value={variation.colorEn}
                      onChange={(e) => handleVariationChange(index, 'colorEn', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Color (Vietnamese)"
                      value={variation.colorVi}
                      onChange={(e) => handleVariationChange(index, 'colorVi', e.target.value)}
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Image URL"
                    value={variation.image}
                    onChange={(e) => handleVariationChange(index, 'image', e.target.value)}
                  />

                  <div className="size-options">
                    <label>Size Options *</label>
                    {variation.sizeOptions.map((sizeOption, sizeIndex) => (
                      <div key={sizeIndex} className="size-option">
                        <input
                          type="number"
                          placeholder="Size"
                          value={sizeOption.size}
                          onChange={(e) => handleSizeOptionChange(index, sizeIndex, 'size', e.target.value)}
                          onWheel={(e) => e.currentTarget.blur()}
                        />
                        <input
                          type="number"
                          placeholder="Price"
                          step="0.01"
                          value={sizeOption.price}
                          onChange={(e) => handleSizeOptionChange(index, sizeIndex, 'price', e.target.value)}
                          onWheel={(e) => e.currentTarget.blur()}
                        />
                        <input
                          type="number"
                          placeholder="Stock"
                          value={sizeOption.stock}
                          onChange={(e) => handleSizeOptionChange(index, sizeIndex, 'stock', e.target.value)}
                          onWheel={(e) => e.currentTarget.blur()}
                        />
                        {variation.sizeOptions.length > 1 && (
                          <button
                            type="button"
                            className="remove-size-btn"
                            onClick={() => removeSizeOption(index, sizeIndex)}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="add-size-btn"
                      onClick={() => addSizeOption(index)}
                    >
                      Add Size Option
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          <button
            type="button"
            className="add-variation-btn"
            onClick={addVariation}
          >
            Add Variation
          </button>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="weight">Weight (grams) *</label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              onWheel={(e) => e.currentTarget.blur()}
              required
              min="0"
              placeholder="0"
            />
            <small className="form-help">Product weight in grams (used for shipping calculations)</small>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="inStock"
                checked={formData.inStock}
                onChange={handleChange}
              />
              In Stock
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Specifications</label>
          <div className="specifications-container">
            {specifications.map((spec, index) => (
              <div key={index} className="specification-item">
                <div className="specification-header">
                  <span>Specification {index + 1}</span>
                  <div className="specification-actions">
                    {specifications.length > 1 && (
                      <button 
                        type="button" 
                        className="remove-spec-btn"
                        onClick={() => removeSpecification(index)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="specification-fields">
                  <div className="spec-row">
                    <div className="spec-field">
                      <label>Key (English)</label>
                      <input
                        type="text"
                        value={spec.keyEn}
                        onChange={(e) => handleSpecificationChange(index, 'keyEn', e.target.value)}
                        placeholder="e.g., Material"
                      />
                    </div>
                    <div className="spec-field">
                      <label>Key (Vietnamese)</label>
                      <input
                        type="text"
                        value={spec.keyVi}
                        onChange={(e) => handleSpecificationChange(index, 'keyVi', e.target.value)}
                        placeholder="e.g., Chất liệu"
                      />
                    </div>
                  </div>
                  
                  <div className="spec-row">
                    <div className="spec-field">
                      <label>Value (English)</label>
                      <input
                        type="text"
                        value={spec.valueEn}
                        onChange={(e) => handleSpecificationChange(index, 'valueEn', e.target.value)}
                        placeholder="e.g., Canvas and suede"
                      />
                    </div>
                    <div className="spec-field">
                      <label>Value (Vietnamese)</label>
                      <input
                        type="text"
                        value={spec.valueVi}
                        onChange={(e) => handleSpecificationChange(index, 'valueVi', e.target.value)}
                        placeholder="e.g., Canvas và da lộn"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <button 
              type="button" 
              className="add-spec-btn"
              onClick={addSpecification}
            >
              + Add Specification
            </button>
          </div>
        </div>

        {formData.image && (
          <div className="image-preview">
            <label>Image Preview:</label>
            <img src={formData.image} alt="Product preview" />
          </div>
        )}

        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding Product...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
