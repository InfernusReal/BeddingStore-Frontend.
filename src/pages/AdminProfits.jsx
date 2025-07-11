import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '../utils/api';
import './AdminProfits.css';

export default function AdminProfits() {
  const [financeData, setFinanceData] = useState({
    summary: { totalOrders: 0, totalRevenue: '0.00' },
    orders: []
  });
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/profits'));
      setFinanceData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching finance data:', error);
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    setDeleting(orderId);
    try {
      const response = await axios.delete(getApiUrl(`/api/profits/order/${orderId}`));
      
      // Update the state with new data
      setFinanceData(prev => ({
        summary: response.data.updatedSummary,
        orders: prev.orders.filter(order => order.id !== orderId)
      }));

      // Show success message
      alert(`Order deleted successfully! Revenue decreased by PKR ${response.data.deletedAmount}`);
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order. Please try again.');
    }
    setDeleting(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'pending': 'status-pending',
      'confirmed': 'status-confirmed',
      'shipped': 'status-shipped',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled'
    };
    return (
      <span className={`status-badge ${statusClasses[status] || 'status-default'}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="admin-profits-page">
        <div className="profits-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading financial data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-profits-page">
      <div className="profits-container">
        <div className="profits-header">
          <h1 className="profits-title">💰 Financial Dashboard</h1>
          <p className="profits-subtitle">Monitor your store's performance and manage orders</p>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card orders-card">
            <div className="card-icon">📦</div>
            <div className="card-content">
              <h3 className="card-title">Total Orders</h3>
            <div className="card-value">{financeData.summary.totalOrders}</div>
          </div>
        </div>

        <div className="summary-card revenue-card">
          <div className="card-icon">💵</div>
          <div className="card-content">
            <h3 className="card-title">Total Revenue</h3>
            <div className="card-value">PKR {financeData.summary.totalRevenue}</div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="orders-section">
        <div className="section-header">
          <h2 className="section-title">📋 All Orders</h2>
          <p className="section-subtitle">Manage and track all customer orders</p>
        </div>

        <div className="orders-table-container">
          {financeData.orders.length === 0 ? (
            <div className="no-orders">
              <div className="no-orders-icon">📪</div>
              <h3>No Orders Yet</h3>
              <p>Orders will appear here once customers start placing them.</p>
            </div>
          ) : (
            <div className="orders-table-wrapper">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Contact</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {financeData.orders.map((order) => (
                    <tr key={order.id} className="order-row">
                      <td className="order-id">#{order.id}</td>
                      <td className="customer-info">
                        <div className="customer-name">{order.customer_name}</div>
                        <div className="customer-email">{order.customer_email}</div>
                      </td>
                      <td className="order-items">
                        {order.items && order.items.length > 0 ? (
                          <div className="items-list">
                            {order.items.map((item, index) => (
                              <div key={index} className="item-detail">
                                <span className="item-name">{item.product_name}</span>
                                <span className="item-quantity">x{item.quantity}</span>
                                <span className="item-price">PKR {item.item_price}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="no-items">No items</span>
                        )}
                      </td>
                      <td className="contact-info">{order.customer_phone}</td>
                      <td className="order-amount">PKR {parseFloat(order.total_amount).toFixed(2)}</td>
                      <td className="order-status">{getStatusBadge(order.status)}</td>
                      <td className="payment-method">
                        <span className="payment-badge">{order.payment_method}</span>
                      </td>
                      <td className="order-date">{formatDate(order.created_at)}</td>
                      <td className="order-actions">
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteOrder(order.id)}
                          disabled={deleting === order.id}
                        >
                          {deleting === order.id ? '🔄' : '🗑️'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
