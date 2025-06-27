import React from 'react';
import { useAdmin } from '../contexts/AdminContext';

const Dashboard: React.FC = () => {
  const { user, products, orders } = useAdmin();

  const lowStockProducts = products.filter(product => product.stock < 5);
  const pendingOrders = orders.filter(order => order.status === 'Pending');
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.username}!</h1>
        <p>Here's what's happening with your store today.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>{products.length}</h3>
            <p>Total Products</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{orders.length}</h3>
            <p>Total Orders</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{pendingOrders.length}</h3>
            <p>Pending Orders</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>          <div className="stat-content">
            <h3>{totalRevenue.toLocaleString('vi-VN')} VNĐ</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      <div className="alerts-section">
        {lowStockProducts.length > 0 && (
          <div className="alert alert-warning">
            <h3>⚠️ Low Stock Alert</h3>
            <p>{lowStockProducts.length} product(s) are running low on stock:</p>
            <ul>
              {lowStockProducts.map(product => (
                <li key={product._id}>
                  {product.name} - Only {product.stock} left
                </li>
              ))}
            </ul>
          </div>
        )}

        {pendingOrders.length > 0 && (
          <div className="alert alert-info">
            <h3>📋 Pending Orders</h3>
            <p>You have {pendingOrders.length} order(s) waiting to be processed.</p>
          </div>
        )}
      </div>

      <div className="recent-activity">
        <h2>Recent Orders</h2>        <div className="orders-preview">
          {orders.slice(0, 5).map(order => (
            <div key={order._id} className="order-preview-card">
              <div className="order-info">
                <h4>Order #{order._id}</h4>
                <p>{order.customerInfo.name}</p>
              </div><div className="order-details">
                <span className="order-total">{order.total.toLocaleString('vi-VN')} VNĐ</span>
                <span className={`order-status status-${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
