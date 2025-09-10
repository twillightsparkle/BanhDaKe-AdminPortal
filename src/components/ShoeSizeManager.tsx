import React, { useState, useEffect } from 'react';
import { sizeService } from '../services/api';
import type { SizeOption } from '../types';

const ShoeSizeManager: React.FC = () => {
  const [sizes, setSizes] = useState<SizeOption[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    EU: '',
    US: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSizes();
  }, []);

  const fetchSizes = async () => {
    try {
      setLoading(true);
      const data = await sizeService.getAllSizes();
      setSizes(data.sort((a, b) => a.EU - b.EU));
    } catch (err) {
      setError('Failed to fetch sizes');
      console.error('Error fetching sizes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.EU.trim() || !formData.US.trim()) {
      setError('Both EU and US sizes are required');
      return;
    }

    try {
      setError(null);
      const sizeData = {
        EU: parseFloat(formData.EU),
        US: parseFloat(formData.US)
      };
      
      if (editingId) {
        await sizeService.updateSize(editingId, sizeData);
      } else {
        await sizeService.createSize(sizeData);
      }
      
      setFormData({ EU: '', US: '' });
      setIsAddingNew(false);
      setEditingId(null);
      await fetchSizes();
    } catch (err) {
      setError(editingId ? 'Failed to update size' : 'Failed to create size');
      console.error('Error saving size:', err);
    }
  };

  const handleEdit = (size: SizeOption) => {
    setEditingId(size._id);
    setFormData({ EU: size.EU.toString(), US: size.US.toString() });
    setIsAddingNew(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this size?')) {
      return;
    }

    try {
      await sizeService.deleteSize(id);
      await fetchSizes();
    } catch (err) {
      setError('Failed to delete size');
      console.error('Error deleting size:', err);
    }
  };

  const handleCancel = () => {
    setFormData({ EU: '', US: '' });
    setIsAddingNew(false);
    setEditingId(null);
    setError(null);
  };

  return (
    <div className="shoe-size-manager">
      <div className="page-header">
        <h2>Shoe Size Management</h2>
        <p>Manage EU and US shoe size conversions</p>
      </div>

      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div className="actions-bar">
        <button
          onClick={() => setIsAddingNew(true)}
          disabled={isAddingNew || loading}
          className="btn btn-primary"
        >
          Add New Size
        </button>
      </div>

      {isAddingNew && (
        <div className="add-size-form" style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
          <h3>{editingId ? 'Edit Size' : 'Add New Size'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="eu-size">EU Size:</label>
              <input
                type="number"
                step="0.5"
                id="eu-size"
                value={formData.EU}
                onChange={(e) => setFormData({ ...formData, EU: e.target.value })}
                placeholder="e.g., 42"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="us-size">US Size:</label>
              <input
                type="number"
                step="0.5"
                id="us-size"
                value={formData.US}
                onChange={(e) => setFormData({ ...formData, US: e.target.value })}
                placeholder="e.g., 9"
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update' : 'Add'} Size
              </button>
              <button type="button" onClick={handleCancel} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div>Loading sizes...</div>
      ) : (
        <div className="sizes-table">
          <table>
            <thead>
              <tr>
                <th>EU Size</th>
                <th>US Size</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map((size) => (
                <tr key={size._id}>
                  <td>{size.EU}</td>
                  <td>{size.US}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(size)}
                      disabled={isAddingNew}
                      className="btn btn-sm btn-secondary"
                      style={{ marginRight: '0.5rem' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(size._id)}
                      disabled={isAddingNew}
                      className="btn btn-sm btn-danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {sizes.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '2rem' }}>
                    No sizes found. Add your first size conversion.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .shoe-size-manager {
          padding: 1rem;
        }

        .page-header h2 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }

        .page-header p {
          margin: 0 0 2rem 0;
          color: #666;
        }

        .actions-bar {
          margin-bottom: 2rem;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .btn-primary {
          background-color: #007bff;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #0056b3;
        }

        .btn-secondary {
          background-color: #6c757d;
          color: white;
          margin-left: 0.5rem;
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: #545b62;
        }

        .btn-danger {
          background-color: #dc3545;
          color: white;
        }

        .btn-danger:hover:not(:disabled) {
          background-color: #c82333;
        }

        .btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 12px;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.25rem;
          font-weight: 500;
        }

        .form-group input {
          width: 100%;
          max-width: 200px;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .form-actions {
          margin-top: 1rem;
        }

        .sizes-table table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
        }

        .sizes-table th,
        .sizes-table td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }

        .sizes-table th {
          background-color: #f8f9fa;
          font-weight: 600;
        }

        .sizes-table tr:hover {
          background-color: #f8f9fa;
        }

        .error-message {
          padding: 0.75rem;
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default ShoeSizeManager;
