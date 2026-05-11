import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Plus,
  FileSearch,
  Truck,
  LogOut,
  Package as PackageIcon,
  Check,
  X,
  Eye,
  AlertCircle,
  Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Button from '../components/Button';

const AdminExtreme = () => {
  const [packages, setPackages] = useState([]);
  const [clients, setClients] = useState([]);
  const [showIntake, setShowIntake] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));

  const [formData, setFormData] = useState({
    trackingNumber: '',
    dimensions: { width: '', height: '', length: '' },
    weight: '',
    contents: '',
    client: ''
  });

  const fetchData = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const [pkgRes, clientRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/packages`, { headers: { Authorization: `Bearer ${user.token}` } }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/clients`, { headers: { Authorization: `Bearer ${user.token}` } })
      ]);
      setPackages(pkgRes.data);
      setClients(clientRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 10000); // Fast refresh
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let objectUrl = null;
    if (selectedPackage?.invoice?.filePath && selectedPackage.invoice.filePath.toLowerCase().endsWith('.pdf')) {
      const fetchPdf = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}${selectedPackage.invoice.filePath}`, {
            responseType: 'blob',
            headers: { Authorization: `Bearer ${user.token}` }
          });
          objectUrl = URL.createObjectURL(response.data);
          setPreviewUrl(objectUrl);
        } catch (err) {
          console.error("Error fetching PDF blob:", err);
          setPreviewUrl(`${import.meta.env.VITE_BACKEND_URL}${selectedPackage.invoice.filePath}`);
        }
      };
      fetchPdf();
    } else {
      setPreviewUrl(null);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [selectedPackage]);

  const renderMediaPreview = (filePath) => {
    if (!filePath) return null;
    const isPDF = filePath.toLowerCase().endsWith('.pdf');
    const url = isPDF && previewUrl ? previewUrl : `${import.meta.env.VITE_BACKEND_URL}${filePath}`;

    return (
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invoice Preview</p>
          <a href={`${import.meta.env.VITE_BACKEND_URL}${filePath}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Eye size={12} /> Full View
          </a>
        </div>
        <div style={{
          borderRadius: '1rem',
          overflow: 'hidden',
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid var(--border)',
          height: '350px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
        }}>
          {isPDF ? (
            previewUrl ? (
              <iframe
                src={`${previewUrl}#view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
                title="Invoice Preview"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <Loader size={16} className="animate-spin" /> Loading PDF...
              </div>
            )
          ) : (
            <img
              src={url}
              alt="Invoice Preview"
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          )}
        </div>
      </div>
    );
  };

  const handleAction = async (pkgId, status, note = '') => {
    setActionLoadingId(pkgId);
    setIsReviewing(true);
    try {
      if (status === 'Shipped') {
        await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/packages/${pkgId}/status`, { status }, { headers: { Authorization: `Bearer ${user.token}` } });
      } else {
        await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/packages/${pkgId}/review`, { status, adminNotes: note }, { headers: { Authorization: `Bearer ${user.token}` } });
      }
      toast.success('Action successful');
      setSelectedPackage(null);
      setReviewNote('');
      fetchData();
    } catch (err) {
      toast.error('Error performing action');
    } finally {
      setActionLoadingId(null);
      setIsReviewing(false);
    }
  };

  const handleIntake = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/packages`, formData, { headers: { Authorization: `Bearer ${user.token}` } });
      toast.success('Package saved successfully!');
      setShowIntake(false);
      fetchData();
      setFormData({ trackingNumber: '', dimensions: { width: '', height: '', length: '' }, weight: '', contents: '', client: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving package');
    } finally {
      setIsSaving(false);
    }
  };

  // Group by simplified actions
  const needsReview = packages.filter(p => p.status === 'Pending Invoice Review' || p.status === 'Needs Review');
  const needsShipping = packages.filter(p => p.status === 'Ship Requested');

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0c', color: 'white', padding: '1.5rem' }}>
      {/* Super Simple Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--primary)' }}>SHIP2ARUBA <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: '400', opacity: 0.5 }}>ADMIN</span></h1>
        <button className="btn-outline" onClick={() => { localStorage.removeItem('user'); window.location.reload(); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--primary)' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
            <Loader size={48} />
          </motion.div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>

          {/* ACTION 1: ADD NEW */}
          <Button
            onClick={() => setShowIntake(true)}
            style={{ width: '100%', padding: '2rem', borderRadius: '1.5rem', background: 'var(--primary)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', cursor: 'pointer', boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)' }}
          >
            <Plus size={32} strokeWidth={3} />
            <span style={{ fontSize: '1.5rem', fontWeight: '800' }}>RECEIVE NEW BOX</span>
          </Button>

          {/* ACTION 2: REVIEW INVOICES */}
          <div className="glass-card" style={{ padding: '1.5rem', border: needsReview.length > 0 ? '2px solid var(--warning)' : '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: needsReview.length > 0 ? 'var(--warning)' : '#fff' }}>
              <FileSearch size={20} /> {needsReview.length > 0 ? `${needsReview.length} Bills to Check` : 'No bills to check right now'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {needsReview.map(pkg => (
                <div
                  key={pkg._id}
                  className="glass"
                  style={{
                    padding: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderLeft: pkg.status === 'Needs Review' ? '6px solid var(--danger)' : '6px solid var(--warning)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ fontWeight: '700' }}>{pkg.client?.name}</div>
                      {pkg.status === 'Needs Review' && (
                        <div className="tooltip-container">
                          <span style={{ fontSize: '0.65rem', background: 'var(--danger)', color: 'white', padding: '0.15rem 0.5rem', borderRadius: '0.25rem', fontWeight: '900' }}>
                            ISSUE FLAG
                          </span>
                          <div className="tooltip-content">
                            <span className="tooltip-header">Flag Reason</span>
                            <span style={{ color: '#fff', display: 'block', marginTop: '0.25rem' }}>
                              {pkg.invoice?.adminNotes || 'Bill rejected by staff'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{pkg.trackingNumber}</div>
                  </div>
                  <Button
                    loading={actionLoadingId === pkg._id}
                    style={{ background: pkg.status === 'Needs Review' ? 'var(--danger)' : 'var(--warning)', color: pkg.status === 'Needs Review' ? 'white' : 'black', padding: '0.5rem 1rem' }}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    {pkg.status === 'Needs Review' ? 'FIX ISSUE' : 'CHECK BILL'}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* ACTION 3: SHIP TO ARUBA */}
          <div className="glass-card" style={{ padding: '1.5rem', border: needsShipping.length > 0 ? '2px solid var(--success)' : '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: needsShipping.length > 0 ? 'var(--success)' : '#fff' }}>
              <Truck size={20} /> {needsShipping.length > 0 ? `${needsShipping.length} Ready to Ship!` : 'Nothing to ship yet'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {needsShipping.map(pkg => (
                <div key={pkg._id} className="glass" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '700' }}>{pkg.client?.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Suite {pkg.client?.suiteNumber}</div>
                  </div>
                  <Button
                    loading={actionLoadingId === pkg._id}
                    style={{ background: 'var(--success)', padding: '0.5rem 1rem' }}
                    onClick={() => handleAction(pkg._id, 'Shipped')}
                  >
                    SHIP NOW
                  </Button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* INTAKE MODAL - SUPER CLEAN */}
      <AnimatePresence>
        {showIntake && (
          <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass" style={{ width: '500px', padding: '2.5rem' }}>
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>New Box Detail</h2>
              <form onSubmit={handleIntake} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <select required value={formData.client} onChange={(e) => setFormData({ ...formData, client: e.target.value })} style={{ padding: '1rem', fontSize: '1.1rem' }}>
                  <option value="">Select Client Name...</option>
                  {clients.map(c => <option key={c._id} value={c._id}>{c.name} ({c.suiteNumber})</option>)}
                </select>
                <input placeholder="Tracking Number" required value={formData.trackingNumber} onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })} style={{ padding: '1rem', fontSize: '1.1rem' }} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <input placeholder="W" type="number" value={formData.dimensions.width} onChange={(e) => setFormData({ ...formData, dimensions: { ...formData.dimensions, width: e.target.value } })} style={{ padding: '0.75rem' }} />
                  <input placeholder="H" type="number" value={formData.dimensions.height} onChange={(e) => setFormData({ ...formData, dimensions: { ...formData.dimensions, height: e.target.value } })} style={{ padding: '0.75rem' }} />
                  <input placeholder="L" type="number" value={formData.dimensions.length} onChange={(e) => setFormData({ ...formData, dimensions: { ...formData.dimensions, length: e.target.value } })} style={{ padding: '0.75rem' }} />
                </div>
                <input placeholder="Weight (lbs)" type="number" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} style={{ padding: '1rem' }} />

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <Button type="button" variant="outline" style={{ flex: 1, padding: '1rem' }} onClick={() => {
                    setShowIntake(false);
                    setFormData({ trackingNumber: '', dimensions: { width: '', height: '', length: '' }, weight: '', contents: '', client: '' });
                  }}>Cancel</Button>
                  <Button type="submit" loading={isSaving} style={{ flex: 1, padding: '1rem', background: 'var(--primary)', fontWeight: '800' }}>SAVE BOX</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* REVIEW MODAL - SUPER CLEAN */}
        {selectedPackage && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ width: '500px', padding: '2.5rem' }}>
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Check Bill Details</h2>

              {selectedPackage.status === 'Needs Review' && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                  <div className="tooltip-container">
                    <AlertCircle size={16} style={{ marginBottom: '0.25rem' }} />
                    <div className="tooltip-content">
                      <span className="tooltip-header">Issue Detail</span>
                      <span style={{ color: '#fff', display: 'block', marginTop: '0.25rem' }}>
                        {selectedPackage.invoice?.adminNotes || 'Bill rejected by staff.'}
                      </span>
                    </div>
                  </div>
                  <strong>Current Issue:</strong> {selectedPackage.invoice?.adminNotes || 'Bill rejected by staff.'}
                </div>
              )}

              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Client</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: '700' }}>{selectedPackage.client?.name}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Tracking</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: '700' }}>{selectedPackage.trackingNumber}</p>
                  </div>
                </div>
              </div>

              {selectedPackage.invoice?.filePath && renderMediaPreview(selectedPackage.invoice.filePath)}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button loading={isReviewing} style={{ flex: 1, background: 'var(--success)', padding: '1rem' }} onClick={() => handleAction(selectedPackage._id, 'Invoice Approved')}>
                  APPROVE OK
                </Button>
                <Button loading={isReviewing} style={{ flex: 1, background: 'var(--danger)', padding: '1rem' }} onClick={() => handleAction(selectedPackage._id, 'Needs Review', 'Incorrect Bill')}>
                  REJECT
                </Button>
              </div>
              <button className="btn-outline" style={{ width: '100%', marginTop: '1rem', border: 'none' }} onClick={() => setSelectedPackage(null)}>Close</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminExtreme;
