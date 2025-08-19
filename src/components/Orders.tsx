import React, { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import type { OrderStatus } from '../types';
import '../styles/orders.css';

const Orders: React.FC = () => {
  const { orders, updateOrderStatus, deleteOrder } = useAdmin();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    const matchesSearch = 
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  const handleDeleteOrder = (orderId: string, customerName: string) => {
    if (window.confirm(`Are you sure you want to delete the order for ${customerName}?`)) {
      deleteOrder(orderId);
      if (expandedOrderId === orderId) {
        setExpandedOrderId(null);
      }
    }
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Pending': return '#f59e0b';
      case 'Shipped': return '#3b82f6';
      case 'Completed': return '#10b981';
      default: return '#6b7280';
    }
  };
  
  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="orders">
      <div className="page-header">
        <h1>Order Management</h1>
        <p>Track and manage customer orders</p>
      </div>

      <div className="orders-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search orders by ID, customer name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'All')}
            className="status-filter"
          >
            <option value="All">All Orders</option>
            <option value="Pending">Pending</option>
            <option value="Shipped">Shipped</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="orders-stats">
        <div className="stat-item">
          <span className="stat-label">Total Orders:</span>
          <span className="stat-value">{orders.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Pending:</span>
          <span className="stat-value">{orders.filter(o => o.status === 'Pending').length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Shipped:</span>
          <span className="stat-value">{orders.filter(o => o.status === 'Shipped').length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Completed:</span>
          <span className="stat-value">{orders.filter(o => o.status === 'Completed').length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Shipping:</span>
          <span className="stat-value">${orders.reduce((sum, order) => sum + (order.shippingFee || 0), 0).toFixed(2)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Weight:</span>
          <span className="stat-value">{orders.reduce((sum, order) => sum + (order.totalWeight || 0), 0)}kg</span>
        </div>
      </div>

      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <p>No orders found matching your criteria.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order._id} className="order-card">
              {/* Short View - Always Visible */}
              <div 
                className="order-summary" 
                onClick={() => toggleOrderExpand(order._id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="order-header">
                  <div className="order-info">
                    <span className="order-id">#{order._id.slice(-8)}</span>
                    <span className="order-date">{formatDate(order.createdAt)}</span>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="expand-icon">
                    {expandedOrderId === order._id ? '▼' : '▶'}
                  </div>
                </div>
                
                <div className="order-summary-content">
                  <div className="customer-summary">
                    <strong>{order.customerInfo.name}</strong>
                    <span className="customer-email">{order.customerInfo.email}</span>
                  </div>
                  
                  <div className="products-summary">
                    <span className="product-count">{order.products.length} item(s)</span>
                    <span className="first-product">
                      {order.products[0]?.productName}
                      {order.products.length > 1 && ` +${order.products.length - 1} more`}
                    </span>
                  </div>
                  
                  <div className="shipping-summary">
                    <span className="shipping-country">🌍 {order.shippingCountry}</span>
                    <span className="shipping-weight">⚖️ {order.totalWeight}kg</span>
                  </div>
                  
                  <div className="total-summary">
                    <strong>${(order.total + (order.shippingFee || 0)).toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              {/* Detailed View - Expandable */}
              {expandedOrderId === order._id && (
                <div className="order-details">
                  <div className="order-details-content">
                    {/* Left Side - Shipping & Pricing + Delete Button */}
                    <div className="left-column">
                      <div className="details-section">
                        <h4>Shipping & Pricing</h4>
                        <div className="details-grid">
                          <div className="detail-item">
                            <span className="detail-label">Shipping Country:</span>
                            <span className="detail-value">🌍 {order.shippingCountry}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Total Weight:</span>
                            <span className="detail-value">⚖️ {order.totalWeight}kg</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Subtotal:</span>
                            <span className="detail-value">${order.total.toFixed(2)}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Shipping Fee:</span>
                            <span className="detail-value">${(order.shippingFee || 0).toFixed(2)}</span>
                          </div>
                          <div className="detail-item total-row">
                            <span className="detail-label"><strong>Total Amount:</strong></span>
                            <span className="detail-value"><strong>${(order.total + (order.shippingFee || 0)).toFixed(2)}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <div className="delete-section">
                        <button 
                          className="delete-button"
                          onClick={() => handleDeleteOrder(order._id, order.customerInfo.name)}
                        >
                          Delete Order
                        </button>
                      </div>
                    </div>

                    {/* Right Side - Order Info + Customer Info + Products */}
                    <div className="right-column">
                      <div className="details-section">
                        <h4>Order Information</h4>
                        <div className="details-grid">
                          <div className="detail-item">
                            <span className="detail-label">Full Order ID:</span>
                            <span className="detail-value">{order._id}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Created:</span>
                            <span className="detail-value">{formatDate(order.createdAt)}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Last Updated:</span>
                            <span className="detail-value">{formatDate(order.updatedAt)}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Status:</span>
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order._id, e.target.value as OrderStatus)}
                              className="status-select-inline"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="details-section">
                        <h4>Customer Information</h4>
                        <div className="details-grid">
                          <div className="detail-item">
                            <span className="detail-label">Name:</span>
                            <span className="detail-value">{order.customerInfo.name}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Email:</span>
                            <span className="detail-value">{order.customerInfo.email}</span>
                          </div>
                          {order.customerInfo.phone && (
                            <div className="detail-item">
                              <span className="detail-label">Phone:</span>
                              <span className="detail-value">{order.customerInfo.phone}</span>
                            </div>
                          )}
                          <div className="detail-item full-width">
                            <span className="detail-label">Address:</span>
                            <span className="detail-value">{order.customerInfo.address}</span>
                          </div>
                        </div>
                      </div>

                      <div className="details-section">
                        <h4>Products</h4>
                        <div className="products-detail-scrollable">
                          {order.products.map((item, index) => (
                            <div key={index} className="product-detail-item">
                              <div className="product-main-info">
                                <span className="product-name">{item.productName}</span>
                                <span className="product-id">ID: {(item.productId as any)?._id || item.productId}</span>
                              </div>
                              <div className="product-options">
                                <span className="product-color">Color: {item.selectedColor}</span>
                                <span className="product-size">Size: {item.selectedSize}</span>
                                <span className="product-quantity">Qty: {item.quantity}</span>
                              </div>
                              <div className="product-price">
                                <span className="unit-price">${item.price.toFixed(2)} each</span>
                                <span className="total-price">${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
