import React, { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import type { Product } from '../types';
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
  const [formData, setFormData] = useState({
    nameEn: product.name.en,
    nameVi: product.name.vi,
    price: product.price.toString(),
    shortDescriptionEn: product.shortDescription.en,
    shortDescriptionVi: product.shortDescription.vi,
    detailDescriptionEn: product.detailDescription.en,
    detailDescriptionVi: product.detailDescription.vi,
    image: product.image,
    images: product.images?.join('\n') || product.image || '', // Show all images, one per line
    stock: product.stock.toString(),
    inStock: product.inStock,
    sizes: product.sizes.join(', '),
    weight: (product.weight || 0).toString() // Add weight field
  });

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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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

    // Use first image as main image, fallback to existing main image
    const mainImage = imagesArray.length > 0 ? imagesArray[0] : formData.image;

    onSave(product._id, {
      name: createLocalizedString(formData.nameEn, formData.nameVi),
      price: parseFloat(formData.price),
      shortDescription: createLocalizedString(formData.shortDescriptionEn, formData.shortDescriptionVi),
      detailDescription: createLocalizedString(formData.detailDescriptionEn, formData.detailDescriptionVi),
      image: mainImage,
      images: imagesArray.length > 0 ? imagesArray : [formData.image],
      stock: parseInt(formData.stock),
      inStock: formData.inStock,
      sizes: sizesArray,
      specifications: specificationsArray,
      weight: parseInt(formData.weight) || 0 // Add weight to the save data
    });
    onClose();
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

            <div className="form-group">
              <label htmlFor="edit-price">Price ($)</label>
              <input
                type="number"
                id="edit-price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
            </div>
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
              required
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
              <label htmlFor="edit-stock">Stock</label>
              <input
                type="number"
                id="edit-stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-weight">Weight (grams)</label>
              <input
                type="number"
                id="edit-weight"
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
              <label htmlFor="edit-sizes">Sizes (comma separated)</label>
              <input
                type="text"
                id="edit-sizes"
                name="sizes"
                value={formData.sizes}
                onChange={handleChange}
                placeholder="38, 39, 40, 41, 42"
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

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="save-button">
              Save Changes
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

  const filteredProducts = products.filter(product =>
    getLocalizedString(product.name, 'en').toLowerCase().includes(searchTerm.toLowerCase()) ||
    getLocalizedString(product.name, 'vi').toLowerCase().includes(searchTerm.toLowerCase()) ||
    getLocalizedString(product.shortDescription, 'en').toLowerCase().includes(searchTerm.toLowerCase()) ||
    getLocalizedString(product.shortDescription, 'vi').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
  };

  const handleSave = (id: string, updates: Partial<Product>) => {
    updateProduct(id, updates);
  };

  const handleDelete = (id: string, productName: string) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      deleteProduct(id);
    }
  };

  return (
    <div className="manage-products">
      <div className="page-header">
        <h1>Manage Products</h1>
        <p>View, edit, and delete your products</p>
      </div>

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
              <p className="product-description">{getLocalizedString(product.shortDescription)}</p>
              <div className="product-details">
                <span className="product-price">{product.price.toLocaleString('vi-VN')} VNĐ</span>
                <span className={`product-stock ${product.stock < 5 ? 'low-stock' : ''}`}>
                  Stock: {product.stock}
                </span>
                <span className="product-weight">
                  Weight: {product.weight || 0}g
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
