import React, { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import type { OrderStatus } from '../types';

const Orders: React.FC = () => {
  const { orders, updateOrderStatus } = useAdmin();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
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
      </div>

      <div className="orders-table">
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <p>No orders found matching your criteria.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Products</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>            
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td className="order-id">#{order._id}</td>
                  <td className="customer-info">
                    <div className="customer-name">{order.customerInfo.name}</div>
                    <div className="customer-email">{order.customerInfo.email}</div>
                    {order.customerInfo.phone && (
                      <div className="customer-phone">{order.customerInfo.phone}</div>
                    )}
                  </td>
                  <td className="products-list">
                    {order.products.map((item, index) => (
                      <div key={index} className="product-item">
                        <span className="product-name">{item.productName}</span>
                        <span className="product-quantity">x{item.quantity}</span>
                      </div>
                    ))}
                  </td>
                  <td className="order-total">{order.total.toLocaleString('vi-VN')} VNĐ</td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="order-date">{formatDate(order.createdAt)}</td>
                  <td className="order-actions">                    
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value as OrderStatus)}
                      className="status-select"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Orders;
