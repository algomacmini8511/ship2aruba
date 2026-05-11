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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px' }}>
          {requests.map((req) => (
            <motion.div
              key={req._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card"
              style={{ padding: '2rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '1rem', color: 'var(--primary)', height: 'fit-content' }}>
                    <Truck size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.25rem' }}>Ship Request</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{req.client?.name}</span>
                      <span>•</span>
                      <span>Suite {req.client?.suiteNumber}</span>
                      <span>•</span>
                      <span>{new Date(req.dateSubmitted).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <span className={`badge ${req.status === 'Shipped' ? 'badge-approved' : 'badge-shipped'}`}>
                    {req.status}
                  </span>
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '800', marginBottom: '1rem', letterSpacing: '0.05em' }}>
                  Included Packages ({req.packages.length})
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem' }}>
                  {req.packages.map(pkg => (
                    <div key={pkg._id} style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ padding: '0.4rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                        <Package size={14} color="var(--primary)" />
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pkg.trackingNumber}</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{pkg.weight} lbs • {pkg.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {req.status === 'Ship Requested' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 2rem', fontWeight: '700' }}
                    onClick={() => handleProcess(req._id)}
                  >
                    <CheckCircle size={18} /> Mark as Processed & Shipped
                  </button>
                </div>
              )}
            </motion.div>
          ))}

          {requests.length === 0 && (
            <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: '1.5rem', border: '1px dashed var(--border)' }}>
              <Truck size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>No ship requests found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminShipRequests;
