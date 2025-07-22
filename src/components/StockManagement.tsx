import React, { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';

const StockManagement: React.FC = () => {
  const { products, updateProductStock } = useAdmin();
  const [editingStock, setEditingStock] = useState<{ [key: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'lowStock'>('name');

  const LOW_STOCK_THRESHOLD = 5;

  const filteredAndSortedProducts = products
    .filter(product =>
      product.name.en.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'stock':
          return a.stock - b.stock;
        case 'lowStock':
          return (a.stock < LOW_STOCK_THRESHOLD ? 0 : 1) - (b.stock < LOW_STOCK_THRESHOLD ? 0 : 1);
        case 'name':
        default:
          return a.name.en.localeCompare(b.name.en);
      }
    });

  const lowStockProducts = products.filter(product => product.stock < LOW_STOCK_THRESHOLD);

  const handleStockEdit = (productId: string, currentStock: number) => {
    setEditingStock(prev => ({
      ...prev,
      [productId]: currentStock.toString()
    }));
  };
  const handleStockSave = (productId: string) => {
    const newStock = parseInt(editingStock[productId]);
    if (!isNaN(newStock) && newStock >= 0) {
      updateProductStock(productId, newStock);
    }
    setEditingStock(prev => {
      const newState = { ...prev };
      delete newState[productId];
      return newState;
    });
  };

  const handleStockCancel = (productId: string) => {
    setEditingStock(prev => {
      const newState = { ...prev };
      delete newState[productId];
      return newState;
    });
  };

  const handleStockChange = (productId: string, value: string) => {
    setEditingStock(prev => ({
      ...prev,
      [productId]: value
    }));
  };  const quickUpdate = (productId: string, change: number) => {
    const product = products.find(p => p._id === productId);
    if (product) {
      const newStock = Math.max(0, product.stock + change);
      updateProductStock(productId, newStock);
    }
  };

  return (
    <div className="stock-management">
      <div className="page-header">
        <h1>Stock Management</h1>
        <p>Monitor and update product inventory levels</p>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="alert alert-warning">
          <h3>⚠️ Low Stock Alert</h3>
          <p>{lowStockProducts.length} product(s) are running low on stock (less than {LOW_STOCK_THRESHOLD} units):</p>          
          <div className="low-stock-list">
            {lowStockProducts.map(product => (
              <span key={product._id} className="low-stock-item">
                {product.name.en} ({product.stock} left)
              </span>
            ))}
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
            <h3>{products.length}</h3>
            <p>Total Products</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>{lowStockProducts.length}</h3>
            <p>Low Stock Items</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{products.reduce((sum, product) => sum + product.stock, 0)}</h3>
            <p>Total Units</p>
          </div>
        </div>
      </div>

      <div className="stock-table">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Current Stock</th>
              <th>Status</th>
              <th>Quick Actions</th>              
              <th>Update Stock</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedProducts.map((product) => (
              <tr key={product._id} className={product.stock < LOW_STOCK_THRESHOLD ? 'low-stock-row' : ''}>
                <td className="product-info">
                  <div className="product-name">{product.name.en}</div>
                  <div className="product-price">${product.price.toFixed(2)}</div>
                </td>
                <td className="stock-level">
                  <span className={`stock-number ${product.stock < LOW_STOCK_THRESHOLD ? 'low' : ''}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="stock-status">
                  {product.stock < LOW_STOCK_THRESHOLD ? (
                    <span className="status-badge low-stock">Low Stock</span>
                  ) : product.stock < 10 ? (
                    <span className="status-badge medium-stock">Medium</span>
                  ) : (
                    <span className="status-badge in-stock">In Stock</span>
                  )}
                </td>                
                <td className="quick-actions">
                  <button
                    onClick={() => quickUpdate(product._id, -1)}
                    className="quick-button decrease"
                    disabled={product.stock === 0}
                    title="Decrease by 1"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => quickUpdate(product._id, 1)}
                    className="quick-button increase"
                    title="Increase by 1"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => quickUpdate(product._id, 10)}
                    className="quick-button increase"
                    title="Increase by 10"
                  >
                    +10
                  </button>
                </td>                
                <td className="stock-update">
                  {editingStock[product._id] !== undefined ? (
                    <div className="edit-stock">
                      <input
                        type="number"
                        value={editingStock[product._id]}
                        onChange={(e) => handleStockChange(product._id, e.target.value)}
                        min="0"
                        className="stock-input"
                      />
                      <button
                        onClick={() => handleStockSave(product._id)}
                        className="save-button"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => handleStockCancel(product._id)}
                        className="cancel-button"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStockEdit(product._id, product.stock)}
                      className="edit-button"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedProducts.length === 0 && (
        <div className="no-products">
          <p>No products found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default StockManagement;
