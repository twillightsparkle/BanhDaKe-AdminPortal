import React, { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { getLocalizedString } from '../types';

interface VariationStock {
  productId: string;
  variationIndex: number;
  sizeOptionIndex: number;
  stock: number;
  color: string;
  size: number;
  price: number;
  productName: string;
}

const StockManagement: React.FC = () => {
  const { products, updateProduct } = useAdmin();
  const [editingStock, setEditingStock] = useState<{ [key: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'lowStock'>('name');

  const LOW_STOCK_THRESHOLD = 5;

  // Flatten all variations and size options into a manageable list
  const getAllVariationStocks = (): VariationStock[] => {
    const result: VariationStock[] = [];
    
    products.forEach(product => {
      product.variations.forEach((variation, variationIndex) => {
        variation.sizeOptions.forEach((sizeOption, sizeOptionIndex) => {
          result.push({
            productId: product._id,
            variationIndex,
            sizeOptionIndex,
            stock: sizeOption.stock,
            color: getLocalizedString(variation.color),
            size: sizeOption.size,
            price: sizeOption.price,
            productName: getLocalizedString(product.name)
          });
        });
      });
    });
    
    return result;
  };

  const allVariationStocks = getAllVariationStocks();

  const filteredAndSortedStocks = allVariationStocks
    .filter(item =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.color.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'stock':
          return a.stock - b.stock;
        case 'lowStock':
          return (a.stock < LOW_STOCK_THRESHOLD ? 0 : 1) - (b.stock < LOW_STOCK_THRESHOLD ? 0 : 1);
        case 'name':
        default:
          return a.productName.localeCompare(b.productName) || a.color.localeCompare(b.color);
      }
    });

  const lowStockItems = allVariationStocks.filter(item => item.stock < LOW_STOCK_THRESHOLD);
  const totalStock = allVariationStocks.reduce((sum, item) => sum + item.stock, 0);

  const getStockKey = (productId: string, variationIndex: number, sizeOptionIndex: number) => {
    return `${productId}-${variationIndex}-${sizeOptionIndex}`;
  };

  const handleStockEdit = (stockKey: string, currentStock: number) => {
    setEditingStock(prev => ({
      ...prev,
      [stockKey]: currentStock.toString()
    }));
  };

  const handleStockSave = async (stockKey: string, productId: string, variationIndex: number, sizeOptionIndex: number) => {
    const newStock = parseInt(editingStock[stockKey]);
    if (!isNaN(newStock) && newStock >= 0) {
      // Update the specific size option stock
      const product = products.find(p => p._id === productId);
      if (product) {
        const updatedProduct = { ...product };
        updatedProduct.variations = [...product.variations];
        updatedProduct.variations[variationIndex] = { ...product.variations[variationIndex] };
        updatedProduct.variations[variationIndex].sizeOptions = [...product.variations[variationIndex].sizeOptions];
        updatedProduct.variations[variationIndex].sizeOptions[sizeOptionIndex] = {
          ...product.variations[variationIndex].sizeOptions[sizeOptionIndex],
          stock: newStock
        };
        
        await updateProduct(productId, updatedProduct);
      }
    }
    setEditingStock(prev => {
      const newState = { ...prev };
      delete newState[stockKey];
      return newState;
    });
  };

  const handleStockCancel = (stockKey: string) => {
    setEditingStock(prev => {
      const newState = { ...prev };
      delete newState[stockKey];
      return newState;
    });
  };

  const handleStockChange = (stockKey: string, value: string) => {
    setEditingStock(prev => ({
      ...prev,
      [stockKey]: value
    }));
  };

  const quickUpdate = async (productId: string, variationIndex: number, sizeOptionIndex: number, change: number) => {
    const product = products.find(p => p._id === productId);
    if (product) {
      const currentStock = product.variations[variationIndex].sizeOptions[sizeOptionIndex].stock;
      const newStock = Math.max(0, currentStock + change);
      
      const updatedProduct = { ...product };
      updatedProduct.variations = [...product.variations];
      updatedProduct.variations[variationIndex] = { ...product.variations[variationIndex] };
      updatedProduct.variations[variationIndex].sizeOptions = [...product.variations[variationIndex].sizeOptions];
      updatedProduct.variations[variationIndex].sizeOptions[sizeOptionIndex] = {
        ...product.variations[variationIndex].sizeOptions[sizeOptionIndex],
        stock: newStock
      };
      
      await updateProduct(productId, updatedProduct);
    }
  };

  return (
    <div className="stock-management">
      <div className="page-header">
        <h1>Stock Management</h1>
        <p>Monitor and update product inventory levels</p>
      </div>

      {lowStockItems.length > 0 && (
        <div className="alert alert-warning">
          <h3>⚠️ Low Stock Alert</h3>
          <p>{lowStockItems.length} variation(s) are running low on stock (less than {LOW_STOCK_THRESHOLD} units):</p>          
          <div className="low-stock-list">
            {lowStockItems.slice(0, 5).map((item, index) => (
              <span key={index} className="low-stock-item">
                {item.productName} - {item.color} (Size {item.size}): {item.stock} left
              </span>
            ))}
            {lowStockItems.length > 5 && (
              <span className="low-stock-item">... and {lowStockItems.length - 5} more</span>
            )}
          </div>
        </div>
      )}

      <div className="stock-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="sort-controls">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'stock' | 'lowStock')}
            className="sort-select"
          >
            <option value="name">Sort by Name</option>
            <option value="stock">Sort by Stock Level</option>
            <option value="lowStock">Low Stock First</option>
          </select>
        </div>
      </div>

      <div className="stock-stats">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>{allVariationStocks.length}</h3>
            <p>Total Variations</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>{lowStockItems.length}</h3>
            <p>Low Stock Items</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{totalStock}</h3>
            <p>Total Units</p>
          </div>
        </div>
      </div>

      <div className="stock-table">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Variation</th>
              <th>Size</th>
              <th>Price</th>
              <th>Current Stock</th>
              <th>Status</th>
              <th>Quick Actions</th>              
              <th>Update Stock</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedStocks.map((item) => {
              const stockKey = getStockKey(item.productId, item.variationIndex, item.sizeOptionIndex);
              return (
                <tr key={stockKey} className={item.stock < LOW_STOCK_THRESHOLD ? 'low-stock-row' : ''}>
                  <td className="product-info">
                    <div className="product-name">{item.productName}</div>
                  </td>
                  <td className="variation-info">
                    <div className="variation-color">{item.color}</div>
                  </td>
                  <td className="size-info">
                    <div className="size-number">{item.size}</div>
                  </td>
                  <td className="price-info">
                    <div className="price-number">${item.price.toFixed(2)}</div>
                  </td>
                  <td className="stock-level">
                    <span className={`stock-number ${item.stock < LOW_STOCK_THRESHOLD ? 'low' : ''}`}>
                      {item.stock}
                    </span>
                  </td>
                  <td className="stock-status">
                    {item.stock < LOW_STOCK_THRESHOLD ? (
                      <span className="status-badge low-stock">Low Stock</span>
                    ) : item.stock < 10 ? (
                      <span className="status-badge medium-stock">Medium</span>
                    ) : (
                      <span className="status-badge in-stock">In Stock</span>
                    )}
                  </td>                
                  <td className="quick-actions">
                    <button
                      onClick={() => quickUpdate(item.productId, item.variationIndex, item.sizeOptionIndex, -1)}
                      className="quick-button decrease"
                      disabled={item.stock === 0}
                      title="Decrease by 1"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => quickUpdate(item.productId, item.variationIndex, item.sizeOptionIndex, 1)}
                      className="quick-button increase"
                      title="Increase by 1"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => quickUpdate(item.productId, item.variationIndex, item.sizeOptionIndex, 10)}
                      className="quick-button increase"
                      title="Increase by 10"
                    >
                      +10
                    </button>
                  </td>                
                  <td className="stock-update">
                    {editingStock[stockKey] !== undefined ? (
                      <div className="edit-stock">
                        <input
                          type="number"
                          value={editingStock[stockKey]}
                          onChange={(e) => handleStockChange(stockKey, e.target.value)}
                          min="0"
                          className="stock-input"
                        />
                        <button
                          onClick={() => handleStockSave(stockKey, item.productId, item.variationIndex, item.sizeOptionIndex)}
                          className="save-button"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => handleStockCancel(stockKey)}
                          className="cancel-button"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStockEdit(stockKey, item.stock)}
                        className="edit-button"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredAndSortedStocks.length === 0 && (
        <div className="no-products">
          <p>No stock items found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default StockManagement;
