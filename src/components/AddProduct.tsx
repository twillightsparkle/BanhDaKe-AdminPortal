import React, { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { createLocalizedString } from '../types';

interface SpecificationItem {
  keyEn: string;
  keyVi: string;
  valueEn: string;
  valueVi: string;
}

const AddProduct: React.FC = () => {
  const { addProduct } = useAdmin();

  const [formData, setFormData] = useState({
    nameEn: '',
    nameVi: '',
    price: '',
    shortDescriptionEn: '',
    shortDescriptionVi: '',
    detailDescriptionEn: '',
    detailDescriptionVi: '',
    image: '',
    images: '', // Add images field for multiple URLs
    stock: '',
    inStock: true,
    sizes: '',
    weight: '' // in grams
  });

  const [specifications, setSpecifications] = useState<SpecificationItem[]>([
    { keyEn: '', keyVi: '', valueEn: '', valueVi: '' }
  ]);

  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'vi'>('en');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSpecificationChange = (index: number, field: keyof SpecificationItem, value: string) => {
    setSpecifications(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addSpecification = () => {
    setSpecifications(prev => [...prev, { keyEn: '', keyVi: '', valueEn: '', valueVi: '' }]);
  };

  const removeSpecification = (index: number) => {
    if (specifications.length > 1) {
      setSpecifications(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Parse sizes and specifications
      const sizesArray = formData.sizes.split(',').map(size => size.trim()).filter(size => size);
      
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

      addProduct({
        name: createLocalizedString(formData.nameEn, formData.nameVi),
        price: parseFloat(formData.price),
        shortDescription: createLocalizedString(formData.shortDescriptionEn, formData.shortDescriptionVi),
        detailDescription: createLocalizedString(formData.detailDescriptionEn, formData.detailDescriptionVi),
        image: mainImage,
        images: imagesArray.length > 0 ? imagesArray : (formData.image ? [formData.image] : []),
        stock: parseInt(formData.stock),
        inStock: formData.inStock,
        sizes: sizesArray,
        specifications: specificationsArray,
        weight: parseInt(formData.weight) || 0, // Default to 0 if not provided
      });

      setSuccess(true);
      setFormData({
        nameEn: '',
        nameVi: '',
        price: '',
        shortDescriptionEn: '',
        shortDescriptionVi: '',
        detailDescriptionEn: '',
        detailDescriptionVi: '',
        image: '',
        images: '',
        stock: '',
        inStock: true,
        sizes: '',
        weight: ''
      });
      
      // Reset specifications
      setSpecifications([{ keyEn: '', keyVi: '', valueEn: '', valueVi: '' }]);

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error adding product:', error);
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

      <form onSubmit={handleSubmit} className="product-form">
        <div className="language-tabs">
          <button 
            type="button" 
            className={currentLanguage === 'en' ? 'active' : ''}
            onClick={() => setCurrentLanguage('en')}
          >
            English
          </button>
          <button 
            type="button" 
            className={currentLanguage === 'vi' ? 'active' : ''}
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
              placeholder={`Enter product name in ${currentLanguage === 'en' ? 'English' : 'Vietnamese'}`}
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price ($) *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor={`shortDescription${currentLanguage === 'en' ? 'En' : 'Vi'}`}>
            Short Description ({currentLanguage === 'en' ? 'English' : 'Vietnamese'}) *
          </label>
          <input
            type="text"
            id={`shortDescription${currentLanguage === 'en' ? 'En' : 'Vi'}`}
            name={`shortDescription${currentLanguage === 'en' ? 'En' : 'Vi'}`}
            value={currentLanguage === 'en' ? formData.shortDescriptionEn : formData.shortDescriptionVi}
            onChange={handleChange}
            required
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
          <label htmlFor="images">Product Images (one URL per line, Thumbnail first line)</label>
          <textarea
            id="images"
            name="images"
            value={formData.images}
            onChange={handleChange}
            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;https://example.com/image3.jpg"
            rows={4}
          />
          <small className="form-help">Enter each image URL on a new line. The first image will be used as the main product image.</small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="stock">Stock Quantity *</label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              min="0"
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="weight">Weight (grams) *</label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              required
              min="0"
              placeholder="0"
            />
            <small className="form-help">Product weight in grams (used for shipping calculations)</small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="sizes">Available Sizes</label>
            <input
              type="text"
              id="sizes"
              name="sizes"
              value={formData.sizes}
              onChange={handleChange}
              placeholder="38, 39, 40, 41, 42, 43, 44"
            />
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
