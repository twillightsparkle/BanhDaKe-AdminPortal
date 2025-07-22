import React, { useState, useEffect } from 'react';
import { shippingService } from '../services/api';
import type { ShippingFee } from '../types';

const ShippingManagement: React.FC = () => {
  const [shippingFees, setShippingFees] = useState<ShippingFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFee, setEditingFee] = useState<ShippingFee | null>(null);
  const [formData, setFormData] = useState({
    country: '',
    baseFee: '',
    perKgRate: '',
    isActive: true
  });

  useEffect(() => {
    fetchShippingFees();
  }, []);

  const fetchShippingFees = async () => {
    try {
      setLoading(true);
      const fees = await shippingService.getAllShippingFees();
      setShippingFees(fees);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch shipping fees');
      setShippingFees([]); // Ensure we always have an array
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'number') {
      // Handle number inputs with leading zero removal
      let cleanValue = value;
      
      // If the value is empty, keep it empty
      if (value === '') {
        cleanValue = '';
      }
      // If the value is just "0", keep it as "0"
      else if (value === '0') {
        cleanValue = '0';
      }
      // If the value starts with "0." keep it (for decimals like 0.50)
      else if (value.startsWith('0.')) {
        cleanValue = value;
      }
      // Remove leading zeros from other values
      else if (value.startsWith('0') && value.length > 1 && !value.includes('.')) {
        cleanValue = value.replace(/^0+/, '') || '0';
      }
      // For all other cases, keep the value as is
      else {
        cleanValue = value;
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: cleanValue
      }));
    } else {
      // For text inputs (like country), convert to uppercase
      setFormData(prev => ({
        ...prev,
        [name]: value.toUpperCase()
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFee) {
        await shippingService.updateShippingFee(editingFee._id, {
          country: formData.country,
          baseFee: parseFloat(formData.baseFee) || 0,
          perKgRate: parseFloat(formData.perKgRate) || 0,
        });
      } else {
        await shippingService.createShippingFee({
          country: formData.country,
          baseFee: parseFloat(formData.baseFee) || 0,
          perKgRate: parseFloat(formData.perKgRate) || 0,
          isActive: formData.isActive
        });
      }

      setFormData({ country: '', baseFee: '', perKgRate: '', isActive: true });
      setShowAddForm(false);
      setEditingFee(null);
      await fetchShippingFees();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save shipping fee');
    }
  };

  const handleEdit = (fee: ShippingFee) => {
    setEditingFee(fee);
    setFormData({
      country: fee.country,
      baseFee: fee.baseFee.toString(),
      perKgRate: fee.perKgRate.toString(),
      isActive: fee.isActive
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this shipping fee?')) {
      try {
        await shippingService.deleteShippingFee(id);
        await fetchShippingFees();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete shipping fee');
      }
    }
  };

  const toggleStatus = async (fee: ShippingFee) => {
    try {
      await shippingService.toggleShippingFeeStatus(fee._id);
      await fetchShippingFees();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({ country: '', baseFee: '', perKgRate: '', isActive: true });
    setShowAddForm(false);
    setEditingFee(null);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">Loading shipping fees...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🚚 Shipping Fee Management</h1>
        <p>Manage shipping rates for different countries</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="page-actions">
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          ➕ Add New Shipping Fee
        </button>
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingFee ? 'Edit Shipping Fee' : 'Add New Shipping Fee'}</h2>
              <button className="close-button" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="shipping-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="country">Country Code *</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="e.g., US, VN, CA"
                    required
                    maxLength={3}
                    style={{ textTransform: 'uppercase' }}
                  />
                  <div className="form-help">2-3 letter country code (will be converted to uppercase)</div>
                </div>

                <div className="form-group">
                  <label htmlFor="baseFee">Base Fee ($) *</label>
                  <input
                    type="number"
                    id="baseFee"
                    name="baseFee"
                    value={formData.baseFee}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                  <div className="form-help">Fixed shipping cost for this country</div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="perKgRate">Per KG Rate ($) *</label>
                  <input
                    type="number"
                    id="perKgRate"
                    name="perKgRate"
                    value={formData.perKgRate}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                  <div className="form-help">Additional cost per kilogram</div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    Active
                  </label>
                  <div className="form-help">Only active shipping fees will be available for orders</div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingFee ? 'Update Shipping Fee' : 'Add Shipping Fee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="shipping-fees-grid">
        {!Array.isArray(shippingFees) || shippingFees.length === 0 ? (
          <div className="empty-state">
            <h3>No shipping fees configured</h3>
            <p>Add your first shipping fee to get started</p>
          </div>
        ) : (
          shippingFees.map((fee) => (
            <div key={fee._id} className={`shipping-fee-card ${!fee.isActive ? 'inactive' : ''}`}>
              <div className="fee-header">
                <h3 className="country-code">{fee.country}</h3>
                <div className="fee-status">
                  <span className={`status-badge ${fee.isActive ? 'active' : 'inactive'}`}>
                    {fee.isActive ? '✅ Active' : '❌ Inactive'}
                  </span>
                </div>
              </div>

              <div className="fee-details">
                <div className="fee-item">
                  <span className="fee-label">Base Fee:</span>
                  <span className="fee-value">${fee.baseFee.toFixed(2)}</span>
                </div>
                <div className="fee-item">
                  <span className="fee-label">Per KG Rate:</span>
                  <span className="fee-value">${fee.perKgRate.toFixed(2)}</span>
                </div>
                <div className="fee-calculation">
                  <small>Total = Base Fee + (Weight × Per KG Rate)</small>
                </div>
              </div>

              <div className="fee-actions">
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleEdit(fee)}
                >
                  ✏️ Edit
                </button>
                <button 
                  className={`btn btn-sm ${fee.isActive ? 'btn-warning' : 'btn-success'}`}
                  onClick={() => toggleStatus(fee)}
                >
                  {fee.isActive ? '⏸️ Disable' : '▶️ Enable'}
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(fee._id)}
                >
                  🗑️ Delete
                </button>
              </div>

              <div className="fee-meta">
                <small>
                  Created: {new Date(fee.createdAt).toLocaleDateString()}
                  {fee.updatedAt !== fee.createdAt && (
                    <> • Updated: {new Date(fee.updatedAt).toLocaleDateString()}</>
                  )}
                </small>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ShippingManagement;
