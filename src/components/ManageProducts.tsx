import React, { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import type { Product, ProductVariation } from '../types';
import { getLocalizedString, createLocalizedString } from '../types';

interface SpecificationItem {
  keyEn: string;
  keyVi: string;
  valueEn: string;
  valueVi: string;
}

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Product>) => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, onClose, onSave }) => {
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'vi'>('en');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nameEn: product.name.en,
    nameVi: product.name.vi,
    shortDescriptionEn: product.shortDescription?.en || '',
    shortDescriptionVi: product.shortDescription?.vi || '',
    detailDescriptionEn: product.detailDescription.en,
    detailDescriptionVi: product.detailDescription.vi,
    image: product.image,
    images: product.images?.join('\n') || product.image || '', // Show all images, one per line
    inStock: product.inStock,
    weight: (product.weight || 0).toString()
  });

  // Form-specific types (string values for input controls)
  interface FormSizeOption {
    size: string;
    price: string;
    stock: string;
  }

  interface FormVariation {
    colorEn: string;
    colorVi: string;
    image: string;
    sizeOptions: FormSizeOption[];
  }

  const [variations, setVariations] = useState<FormVariation[]>(
    (product.variations && product.variations.length > 0)
      ? product.variations.map(v => ({
          colorEn: v.color.en,
          colorVi: v.color.vi,
          image: v.image || '',
          sizeOptions: v.sizeOptions.map(so => ({
            size: so.size.toString(),
            price: so.price.toString(),
            stock: so.stock.toString()
          }))
        }))
      : [{ colorEn: '', colorVi: '', image: '', sizeOptions: [{ size: '', price: '', stock: '' }] }]
  );

  // Track which variations are collapsed
  const [collapsedVariations, setCollapsedVariations] = useState<boolean[]>(
    new Array(variations.length).fill(true)
  );

  // Initialize specifications from product data
  const [specifications, setSpecifications] = useState<SpecificationItem[]>(() => {
    if (product.specifications && product.specifications.length > 0) {
      return product.specifications.map(spec => ({
        keyEn: spec.key.en,
        keyVi: spec.key.vi,
        valueEn: spec.value.en,
        valueVi: spec.value.vi
      }));
    }
    return [{ keyEn: '', keyVi: '', valueEn: '', valueVi: '' }];
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setModalError(null); // Clear any existing errors when user makes changes
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleVariationChange = (index: number, field: keyof FormVariation, value: string) => {
    setModalError(null); // Clear any existing errors when user makes changes
    setVariations(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSizeOptionChange = (variationIndex: number, sizeIndex: number, field: keyof FormSizeOption, value: string) => {
    setModalError(null); // Clear any existing errors when user makes changes
    setVariations(prev => {
      const copy = [...prev];
      const sizeOptions = [...copy[variationIndex].sizeOptions];
      sizeOptions[sizeIndex] = { ...sizeOptions[sizeIndex], [field]: value };
      copy[variationIndex] = { ...copy[variationIndex], sizeOptions };
      return copy;
    });
  };

  const addSizeOption = (variationIndex: number) => {
    setVariations(prev => {
      const copy = [...prev];
      copy[variationIndex] = {
        ...copy[variationIndex],
        sizeOptions: [...copy[variationIndex].sizeOptions, { size: '', price: '', stock: '' }]
      };
      return copy;
    });
  };

  const removeSizeOption = (variationIndex: number, sizeIndex: number) => {
    setVariations(prev => {
      const copy = [...prev];
      if (copy[variationIndex].sizeOptions.length > 1) {
        copy[variationIndex] = {
          ...copy[variationIndex],
          sizeOptions: copy[variationIndex].sizeOptions.filter((_: FormSizeOption, i: number) => i !== sizeIndex)
        };
      }
      return copy;
    });
  };

  const addVariation = () => {
    setVariations(prev => [...prev, { colorEn: '', colorVi: '', image: '', sizeOptions: [{ size: '', price: '', stock: '' }] }]);
    setCollapsedVariations(prev => [...prev, false]); // New variations start expanded
  };

  const removeVariation = (index: number) => {
    if (variations.length > 1) {
      setVariations(prev => prev.filter((_, i) => i !== index));
      setCollapsedVariations(prev => prev.filter((_, i) => i !== index));
    }
  };

  const toggleVariationCollapse = (index: number) => {
    setCollapsedVariations(prev => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  const handleSpecificationChange = (index: number, field: keyof SpecificationItem, value: string) => {
    setModalError(null); // Clear any existing errors when user makes changes
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
    setModalError(null);
    
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

      // Use first image as main image, fallback to existing main image
      const mainImage = imagesArray.length > 0 ? imagesArray[0] : formData.image;

      const variationPayload: ProductVariation[] = variations
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

      const updates: Partial<Product> = {
        name: createLocalizedString(formData.nameEn, formData.nameVi),
        shortDescription: createLocalizedString(formData.shortDescriptionEn, formData.shortDescriptionVi),
        detailDescription: createLocalizedString(formData.detailDescriptionEn, formData.detailDescriptionVi),//optional
        image: mainImage,
        images: imagesArray.length > 0 ? imagesArray : [formData.image],
        inStock: formData.inStock,
        specifications: specificationsArray,
        weight: parseFloat(formData.weight) || 0,
        variations: variationPayload,
      };

      await onSave(product._id, updates);
      onClose();
    } catch (error: any) {
      console.error('Error updating product:', error);
      if (error.response && error.response.data) {
        // Handle validation errors from backend
        if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          const errorMessages = error.response.data.errors.map((err: any) => err.msg || err.message).join(', ');
          setModalError(`Validation errors: ${errorMessages}`);
        } else if (error.response.data.error) {
          setModalError(error.response.data.error);
        } else {
          setModalError('Failed to update product. Please check your input and try again.');
        }
      } else if (error.message) {
        setModalError(error.message);
      } else {
        setModalError('Failed to update product. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Product</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

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

          {modalError && (
            <div className="error-message">
              ❌ {modalError}
            </div>
          )}
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor={`edit-name-${currentLanguage}`}>
                Product Name ({currentLanguage === 'en' ? 'English' : 'Vietnamese'})
              </label>
              <input
                type="text"
                id={`edit-name-${currentLanguage}`}
                name={`name${currentLanguage === 'en' ? 'En' : 'Vi'}`}
                value={currentLanguage === 'en' ? formData.nameEn : formData.nameVi}
                onChange={handleChange}
                required
              />
            </div>

            {/* Price moved to variations */}
          </div>

          <div className="form-group">
            <label htmlFor={`edit-shortDescription-${currentLanguage}`}>
              Short Description ({currentLanguage === 'en' ? 'English' : 'Vietnamese'})
            </label>
            <input
              type="text"
              id={`edit-shortDescription-${currentLanguage}`}
              name={`shortDescription${currentLanguage === 'en' ? 'En' : 'Vi'}`}
              value={currentLanguage === 'en' ? formData.shortDescriptionEn : formData.shortDescriptionVi}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor={`edit-detailDescription-${currentLanguage}`}>
              Detail Description ({currentLanguage === 'en' ? 'English' : 'Vietnamese'})
            </label>
            <textarea
              id={`edit-detailDescription-${currentLanguage}`}
              name={`detailDescription${currentLanguage === 'en' ? 'En' : 'Vi'}`}
              value={currentLanguage === 'en' ? formData.detailDescriptionEn : formData.detailDescriptionVi}
              onChange={handleChange}
              required
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-images">Product Images (one URL per line)</label>
            <textarea
              id="edit-images"
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
              <label htmlFor="edit-weight">Weight (Kilograms)</label>
              <input
                type="number"
                id="edit-weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                onWheel={(e) => e.currentTarget.blur()}
                required
                min="0"
                placeholder="0"
                step="any"
              />
              <small className="form-help">Product weight in Kilograms (used for shipping calculations)</small>
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

          {/* Variations Editor */}
          <div className="form-group">
            <label>Variations (Color x Size)</label>
            <div className="specifications-container">
              {variations.map((v, index) => (
                <div key={index} className="specification-item">
                  <div className="specification-header" onClick={() => toggleVariationCollapse(index)} style={{ cursor: 'pointer' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {collapsedVariations[index] ? '▶' : '▼'} 
                      {(v.colorEn || v.colorVi) ? (
                        <span>{v.colorEn || v.colorVi}</span>
                      ) : (
                        <span>Variation {index + 1}</span>
                      )}
                      {collapsedVariations[index] && v.image && (
                        <img 
                          src={v.image} 
                          alt="Variation thumbnail" 
                          style={{ 
                            width: '24px', 
                            height: '24px', 
                            objectFit: 'cover', 
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      )}
                    </span>
                    <div className="specification-actions" onClick={(e) => e.stopPropagation()}>
                      {variations.length > 1 && (
                        <button type="button" className="remove-spec-btn" onClick={() => removeVariation(index)}>✕</button>
                      )}
                    </div>
                  </div>
                  
                  {!collapsedVariations[index] && (
                    <div className="specification-fields">
                      {/* Color and Image - Main elements */}
                      <div className="spec-row">
                        <div className="spec-field">
                          <label>Color (English)</label>
                          <input type="text" value={v.colorEn} onChange={(e) => handleVariationChange(index, 'colorEn', e.target.value)} />
                        </div>
                        <div className="spec-field">
                          <label>Color (Vietnamese)</label>
                          <input type="text" value={v.colorVi} onChange={(e) => handleVariationChange(index, 'colorVi', e.target.value)} />
                        </div>
                      </div>
                      <div className="spec-row">
                        <div className="spec-field">
                          <label>Image URL</label>
                          <input type="text" value={v.image} onChange={(e) => handleVariationChange(index, 'image', e.target.value)} placeholder="https://..." />
                          {v.image && (
                            <div className="image-preview">
                              <img 
                                src={v.image} 
                                alt="Variation preview" 
                                style={{ 
                                  width: '60px', 
                                  height: '60px', 
                                  objectFit: 'cover', 
                                  borderRadius: '4px', 
                                  marginTop: '8px',
                                  border: '1px solid #ddd'
                                }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                                onLoad={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'block';
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Size Options - Sub-group */}
                      <div className="size-options-section">
                        <label>Size Options</label>
                        {v.sizeOptions.map((so: FormSizeOption, sizeIndex: number) => (
                          <div key={sizeIndex} className="size-option-item">
                            <div className="spec-row">
                              <div className="spec-field">
                                <label>Size</label>
                                <input 
                                  type="number" 
                                  value={so.size} 
                                  onChange={(e) => handleSizeOptionChange(index, sizeIndex, 'size', e.target.value)} 
                                  onWheel={(e) => e.currentTarget.blur()}
                                  placeholder="e.g., 38" 
                                />
                              </div>
                              <div className="spec-field">
                                <label>Price</label>
                                <input 
                                  type="number" 
                                  min="0" 
                                  step="0.01" 
                                  value={so.price} 
                                  onChange={(e) => handleSizeOptionChange(index, sizeIndex, 'price', e.target.value)} 
                                  onWheel={(e) => e.currentTarget.blur()}
                                />
                              </div>
                              <div className="spec-field">
                                <label>Stock</label>
                                <input 
                                  type="number" 
                                  min="0" 
                                  value={so.stock} 
                                  onChange={(e) => handleSizeOptionChange(index, sizeIndex, 'stock', e.target.value)} 
                                  onWheel={(e) => e.currentTarget.blur()}
                                />
                              </div>
                              <div className="spec-field">
                                {v.sizeOptions.length > 1 && (
                                  <button 
                                    type="button" 
                                    className="remove-spec-btn" 
                                    onClick={() => removeSizeOption(index, sizeIndex)}
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        <button 
                          type="button" 
                          className="add-spec-btn" 
                          onClick={() => addSizeOption(index)}
                        >
                          + Add Size Option
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button type="button" className="add-spec-btn" onClick={addVariation}>+ Add Variation</button>
            </div>
          </div>

          <div className="form-row">
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

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="save-button" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ManageProducts: React.FC = () => {
  const { products, updateProduct, deleteProduct } = useAdmin();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const filteredProducts = products.filter(product =>
  getLocalizedString(product.name, 'en').toLowerCase().includes(searchTerm.toLowerCase()) ||
  getLocalizedString(product.name, 'vi').toLowerCase().includes(searchTerm.toLowerCase()) ||
  (product.shortDescription ? getLocalizedString(product.shortDescription, 'en') : '').toLowerCase().includes(searchTerm.toLowerCase()) ||
  (product.shortDescription ? getLocalizedString(product.shortDescription, 'vi') : '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
  };

  const handleSave = async (id: string, updates: Partial<Product>) => {
    try {
      setError(null);
      await updateProduct(id, updates);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error updating product:', error);
      if (error.response && error.response.data) {
        // Handle validation errors from backend
        if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          const errorMessages = error.response.data.errors.map((err: any) => err.msg || err.message).join(', ');
          setError(`Validation errors: ${errorMessages}`);
        } else if (error.response.data.error) {
          setError(error.response.data.error);
        } else {
          setError('Failed to update product. Please check your input and try again.');
        }
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Failed to update product. Please try again.');
      }
    }
  };

  const handleDelete = async (id: string, productName: string) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      try {
        setError(null);
        await deleteProduct(id);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (error: any) {
        console.error('Error deleting product:', error);
        if (error.response && error.response.data) {
          // Handle validation errors from backend
          if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
            const errorMessages = error.response.data.errors.map((err: any) => err.msg || err.message).join(', ');
            setError(`Validation errors: ${errorMessages}`);
          } else if (error.response.data.error) {
            setError(error.response.data.error);
          } else {
            setError('Failed to delete product. Please try again.');
          }
        } else if (error.message) {
          setError(error.message);
        } else {
          setError('Failed to delete product. Please try again.');
        }
      }
    }
  };

  return (
    <div className="manage-products">
      <div className="page-header">
        <h1>Manage Products</h1>
        <p>View, edit, and delete your products</p>
      </div>

      {success && (
        <div className="success-message">
          ✅ Operation completed successfully!
        </div>
      )}

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      <div className="products-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="products-count">
          {filteredProducts.length} of {products.length} products
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div key={product._id} className="product-card">            <div className="product-image">
              {product.image ? (
                <img src={product.image} alt={getLocalizedString(product.name)} />
              ) : (
                <div className="no-image">No Image</div>
              )}
            </div>

            <div className="product-content">
              <h3>{getLocalizedString(product.name)}</h3>
              <p className="product-description">{product.shortDescription ? getLocalizedString(product.shortDescription) : ''}</p>
              <div className="product-details">
                {(() => {
                  const allPrices = (product.variations || []).flatMap(v => 
                    (v.sizeOptions || []).map(so => so.price)
                  ).filter(p => typeof p === 'number');
                  const min = allPrices.length ? Math.min(...allPrices) : 0;
                  const max = allPrices.length ? Math.max(...allPrices) : 0;
                  const priceText = min === max ? `${min.toLocaleString('vi-VN')} VNĐ` : `${min.toLocaleString('vi-VN')} - ${max.toLocaleString('vi-VN')} VNĐ`;
                  const totalStock = (product.variations || []).reduce((sum, v) => 
                    sum + (v.sizeOptions || []).reduce((sizeSum, so) => sizeSum + (so.stock || 0), 0), 0
                  );
                  return (
                    <>
                      <span className="product-price">{priceText}</span>
                      <span className={`product-stock ${totalStock < 5 ? 'low-stock' : ''}`}>Stock: {totalStock}</span>
                    </>
                  );
                })()}
                <span className="product-weight">
                  Weight: {product.weight || 0}kg
                </span>
              </div>
              <div className="product-status">
                <span className={`status-badge ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>

            <div className="product-actions">
              <button 
                onClick={() => handleEdit(product)}
                className="edit-button"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(product._id, getLocalizedString(product.name))}
                className="delete-button"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="no-products">
          <p>No products found matching your search.</p>
        </div>
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ManageProducts;
