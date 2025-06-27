import React, { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';

const AddProduct: React.FC = () => {
  const { addProduct } = useAdmin();  const [formData, setFormData] = useState({
    name: '',
    price: '',
    shortDescription: '',
    detailDescription: '',
    image: '',
    images: '', // Add images field for multiple URLs
    stock: '',
    inStock: true,
    sizes: '',
    specifications: ''
  });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {      // Parse sizes and specifications
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

      // Use first image as main image, fallback to single image field
      const mainImage = imagesArray.length > 0 ? imagesArray[0] : formData.image;

      addProduct({
        name: formData.name,
        price: parseFloat(formData.price),
        shortDescription: formData.shortDescription,
        detailDescription: formData.detailDescription,
        image: mainImage,
        images: imagesArray.length > 0 ? imagesArray : (formData.image ? [formData.image] : []),
        stock: parseInt(formData.stock),
        inStock: formData.inStock,
        sizes: sizesArray,
        specifications: specificationsObj
      });

      setSuccess(true);      setFormData({
        name: '',
        price: '',
        shortDescription: '',
        detailDescription: '',
        image: '',
        images: '',
        stock: '',
        inStock: true,
        sizes: '',
        specifications: ''
      });

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
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Product Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter product name"
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
        </div>        <div className="form-group">
          <label htmlFor="shortDescription">Short Description *</label>
          <input
            type="text"
            id="shortDescription"
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleChange}
            required
            placeholder="Brief description for product listings"
            maxLength={100}
          />
        </div>        <div className="form-group">
          <label htmlFor="detailDescription">Detail Description *</label>
          <textarea
            id="detailDescription"
            name="detailDescription"
            value={formData.detailDescription}
            onChange={handleChange}
            required
            placeholder="Detailed product description"
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
          <label htmlFor="specifications">Specifications</label>
          <textarea
            id="specifications"
            name="specifications"
            value={formData.specifications}
            onChange={handleChange}
            placeholder="Chất liệu upper: Canvas và suede&#10;Chất liệu đế: Vulcanized rubber&#10;Công nghệ: Waffle outsole"
            rows={4}
          />
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
