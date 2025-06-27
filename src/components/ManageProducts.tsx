import React, { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import type { Product } from '../types';

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Product>) => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: product.name,
    price: product.price.toString(),
    shortDescription: product.shortDescription,
    detailDescription: product.detailDescription,
    image: product.image,
    images: product.images?.join('\n') || product.image || '', // Show all images, one per line
    stock: product.stock.toString(),
    inStock: product.inStock,
    sizes: product.sizes.join(', '),
    specifications: Object.entries(product.specifications).map(([key, value]) => `${key}: ${value}`).join('\n')
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse sizes and specifications
    const sizesArray = formData.sizes.split(',').map(size => size.trim()).filter(size => size);
    const specificationsObj: Record<string, string> = {};
    formData.specifications.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        specificationsObj[key.trim()] = valueParts.join(':').trim();
      }
    });

    // Parse images array from textarea (one URL per line)
    const imagesArray = formData.images
      .split('\n')
      .map(url => url.trim())
      .filter(url => url);

    // Use first image as main image, fallback to existing main image
    const mainImage = imagesArray.length > 0 ? imagesArray[0] : formData.image;

    onSave(product._id, {
      name: formData.name,
      price: parseFloat(formData.price),
      shortDescription: formData.shortDescription,
      detailDescription: formData.detailDescription,
      image: mainImage,
      images: imagesArray.length > 0 ? imagesArray : [formData.image],
      stock: parseInt(formData.stock),
      inStock: formData.inStock,
      sizes: sizesArray,
      specifications: specificationsObj
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
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-name">Product Name</label>
              <input
                type="text"
                id="edit-name"
                name="name"
                value={formData.name}
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
          </div>          <div className="form-group">
            <label htmlFor="edit-shortDescription">Short Description</label>
            <input
              type="text"
              id="edit-shortDescription"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              required
            />
          </div>          <div className="form-group">
            <label htmlFor="edit-detailDescription">Detail Description</label>
            <textarea
              id="edit-detailDescription"
              name="detailDescription"
              value={formData.detailDescription}
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
            <label htmlFor="edit-specifications">Specifications (one per line: key: value)</label>
            <textarea
              id="edit-specifications"
              name="specifications"
              value={formData.specifications}
              onChange={handleChange}
              rows={4}
              placeholder="Chất liệu upper: Canvas&#10;Chất liệu đế: Rubber&#10;Kiểu dáng: Low-top"
            />
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
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.shortDescription.toLowerCase().includes(searchTerm.toLowerCase())
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
                <img src={product.image} alt={product.name} />
              ) : (
                <div className="no-image">No Image</div>
              )}
            </div>

            <div className="product-content">
              <h3>{product.name}</h3>
              <p className="product-description">{product.shortDescription}</p>
              <div className="product-details">
                <span className="product-price">{product.price.toLocaleString('vi-VN')} VNĐ</span>
                <span className={`product-stock ${product.stock < 5 ? 'low-stock' : ''}`}>
                  Stock: {product.stock}
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
                onClick={() => handleDelete(product._id, product.name)}
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
