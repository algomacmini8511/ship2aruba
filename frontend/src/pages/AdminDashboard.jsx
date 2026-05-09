import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Package, Users, FileText, AlertCircle, TrendingUp, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentPackages, setRecentPackages] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, pkgRes] = await Promise.all([
          axios.get('http://localhost:5000/api/clients/stats', { headers: { Authorization: `Bearer ${user.token}` } }),
          axios.get('http://localhost:5000/api/packages', { headers: { Authorization: `Bearer ${user.token}` } })
        ]);
        setStats(statsRes.data);
        setRecentPackages(pkgRes.data.slice(0, 5)); // Get last 5 packages
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  if (!stats) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading dashboard...</div>;

  const statCards = [
    { name: 'Total Packages', value: stats.totalPackages, icon: <Package size={24} />, color: 'var(--primary)' },
    { name: 'Pending Review', value: stats.pendingInvoices, icon: <FileText size={24} />, color: 'var(--warning)' },
    { name: 'Ship Requests', value: stats.statusCounts.find(s => s._id === 'Ship Requested')?.count || 0, icon: <AlertCircle size={24} />, color: 'var(--accent)' },
    { name: 'Total Clients', value: stats.totalClients, icon: <Users size={24} />, color: 'var(--secondary)' },
  ];

  const getStatusBadge = (status) => {
    const classMap = {
      'Ready to Send': 'badge-ready',
      'Pending Invoice Review': 'badge-pending',
      'Invoice Approved': 'badge-approved',
      'Needs Review': 'badge-danger',
      'Ship Requested': 'badge-shipped',
      'Shipped': 'badge-shipped',
      'Delivered': 'badge-delivered'
    };
    return <span className={`badge ${classMap[status] || ''}`} style={{ fontSize: '0.7rem' }}>{status}</span>;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-fade-in">
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Overview of recent activities and statistics.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/admin/packages')}>
          Open Work Board <ChevronRight size={18} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {statCards.map((stat, i) => (
          <motion.div 
            key={stat.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card"
            style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}
          >
            <div style={{ background: `${stat.color}15`, padding: '0.75rem', borderRadius: '0.75rem', color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>{stat.name}</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity List */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={18} color="var(--primary)" /> Recent Packages
        </h3>
        <div className="table-container" style={{ margin: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Package</th>
                <th>Client</th>
                <th>Contents</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentPackages.map((pkg) => (
                <tr key={pkg._id}>
                  <td>
                    <div style={{ fontWeight: '700' }}>{pkg.trackingNumber}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(pkg.dateReceived).toLocaleDateString()}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '500' }}>{pkg.client?.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>{pkg.client?.suiteNumber}</div>
                  </td>
                  <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.875rem' }}>
                    {pkg.contents}
                  </td>
                  <td>{getStatusBadge(pkg.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {recentPackages.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No recent activity.</div>}
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button className="btn btn-outline" style={{ fontSize: '0.8rem' }} onClick={() => navigate('/admin/packages')}>View All Packages</button>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
