import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FileUp,
  Clock,
  CheckCircle,
  Truck,
  Plus,
  Package as PackageIcon,
  AlertCircle,
  X,
  ChevronRight,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ClientPackages = () => {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));

  const fetchData = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/packages/my', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPackages(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // More responsive 5s refresh
    return () => clearInterval(interval);
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('invoice', file);

    setUploading(true);
    try {
      await axios.put(`http://localhost:5000/api/packages/${selectedPackage._id}/invoice`, formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setSelectedPackage(null); // Close modal first
      toast.success('Invoice uploaded successfully!');
      await fetchData();
    } catch (err) {
      toast.error('Upload failed. Please use PDF or Image.');
    } finally {
      setUploading(false);
    }
  };

  const handleShipRequest = async (pkgId) => {
    try {
      await axios.post('http://localhost:5000/api/ship-requests', {
        packageIds: [pkgId],
        notes: 'Requested from board'
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      toast.success('Ship request sent successfully!');
      fetchData();
    } catch (err) {
      toast.error('Error sending ship request');
    }
  };

  const columns = [
    { title: 'Needs Action', status: ['Ready to Send', 'Needs Review'], color: '#f59e0b', icon: <FileUp size={18} />, guide: 'Upload bill here' },
    { title: 'In Review', status: ['Pending Invoice Review'], color: '#6366f1', icon: <Clock size={18} />, guide: 'Staff is checking' },
    { title: 'Ready to Ship', status: ['Invoice Approved'], color: '#10b981', icon: <CheckCircle size={18} />, guide: 'Click to Send to Aruba' },
    { title: 'On the Way', status: ['Ship Requested', 'Shipped', 'Delivered'], color: '#94a3b8', icon: <Truck size={18} />, guide: 'Package is moving' }
  ];

  return (
    <div className="kanban-page" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>My Package Board</h1>
        <p style={{ color: 'var(--text-muted)' }}>Follow your packages from US warehouse to Aruba.</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flex: 1, overflowX: 'auto', paddingBottom: '1rem' }}>
        {columns.map((col) => (
          <div key={col.title} style={{
            minWidth: '280px',
            width: '280px',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '1rem',
            border: '1px solid var(--border)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '1.25rem 1rem',
              background: 'var(--surface)',
              borderBottom: '1px solid var(--border)',
              position: 'sticky',
              top: 0,
              zIndex: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <div style={{ color: col.color }}>{col.icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>{col.title}</h3>
                <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '1rem', color: 'var(--text-muted)' }}>
                  {packages.filter(p => col.status.includes(p.status)).length}
                </span>
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '2.2rem' }}>{col.guide}</p>
            </div>

            <div style={{
              flex: 1,
              padding: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              overflowY: 'auto',
              maxHeight: 'calc(100vh - 250px)'
            }}>
              {packages.filter(p => col.status.includes(p.status)).map((pkg) => (
                <motion.div
                  layoutId={pkg._id}
                  key={pkg._id}
                  className="glass-card"
                  style={{ padding: '1rem', borderLeft: `4px solid ${col.color}`, position: 'relative' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{pkg.trackingNumber}</span>
                      {pkg.status === 'Needs Review' && <AlertCircle size={14} color="var(--danger)" />}
                    </div>
                    <Eye size={14} color="var(--text-muted)" style={{ opacity: 0.6, cursor: 'pointer' }} onClick={() => setSelectedPackage(pkg)} />
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{pkg.contents}</p>

                  {/* Action Buttons based on status */}
                  {(pkg.status === 'Ready to Send' || pkg.status === 'Needs Review') && (
                    <button className="btn btn-primary" style={{ width: '100%', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: pkg.status === 'Needs Review' ? 'var(--danger)' : 'var(--primary)' }} onClick={() => setSelectedPackage(pkg)}>
                      {pkg.status === 'Needs Review' ? 'Fix Invoice' : 'Upload Invoice'} <ChevronRight size={16} />
                    </button>
                  )}

                  {pkg.status === 'Invoice Approved' && (
                    <button className="btn btn-primary" style={{ width: '100%', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'var(--success)' }} onClick={() => handleShipRequest(pkg._id)}>
                      Request Shipping <ChevronRight size={16} />
                    </button>
                  )}

                  {col.title === 'On the Way' && (
                    <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                      {pkg.status === 'Ship Requested' ? 'Request Sent...' : 'In Transit'}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Simple Upload Modal */}
      <AnimatePresence>
        {selectedPackage && (
          <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass" style={{ width: '400px', padding: '2rem', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Upload Bill / Invoice</h2>
                <button onClick={() => setSelectedPackage(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--primary)' }}>
                  <FileUp size={30} />
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Select the invoice for: <br /><strong>{selectedPackage.trackingNumber}</strong></p>
              </div>

              {selectedPackage.status === 'Needs Review' && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.8rem' }}>
                  <strong>Admin Note:</strong> {selectedPackage.invoice?.adminNotes}
                </div>
              )}

              <input
                type="file"
                id="file-upload"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                accept=".pdf,image/*"
                disabled={uploading}
              />

              <label htmlFor="file-upload" className="btn btn-primary" style={{ display: 'block', cursor: 'pointer', background: uploading ? 'var(--text-muted)' : 'var(--primary)', padding: '1rem', opacity: uploading ? 0.7 : 1 }}>
                {uploading ? 'Processing & Uploading...' : 'Choose File & Upload'}
              </label>
              
              {!uploading && (
                <button className="btn-outline" style={{ border: 'none', marginTop: '1rem' }} onClick={() => setSelectedPackage(null)}>
                  Cancel
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientPackages;
