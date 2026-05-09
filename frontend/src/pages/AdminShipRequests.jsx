import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Truck, Package, Eye, CheckCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const AdminShipRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/ship-requests`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setRequests(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleProcess = async (id) => {
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/ship-requests/${id}/process`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success('Shipment processed successfully!');
      fetchRequests();
    } catch (err) {
      toast.error('Error processing request');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Ship Requests</h1>
        <p style={{ color: 'var(--text-muted)' }}>Process pending shipments to Aruba.</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '5rem', color: 'var(--primary)' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
            <Loader size={48} />
          </motion.div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {requests.map((req) => (
            <motion.div
              key={req._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '0.75rem', color: 'var(--primary)' }}>
                    <Truck size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.125rem' }}>Request from {req.client?.name}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Submitted on {new Date(req.dateSubmitted).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <span className={`badge ${req.status === 'Shipped' ? 'badge-approved' : 'badge-shipped'}`}>
                    {req.status}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '0.75rem' }}>Included Packages</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                  {req.packages.map(pkg => (
                    <div key={pkg._id} style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Package size={14} color="var(--text-muted)" />
                      <span style={{ fontSize: '0.875rem' }}>{pkg.trackingNumber}</span>
                    </div>
                  ))}
                </div>
              </div>

              {req.status === 'Ship Requested' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleProcess(req._id)}
                  >
                    <CheckCircle size={18} /> Mark as Shipped
                  </button>
                </div>
              )}
            </motion.div>
          ))}

          {requests.length === 0 && (
            <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
              No ship requests found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminShipRequests;
