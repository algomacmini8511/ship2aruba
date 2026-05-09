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
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const AdminExtreme = () => {
  const [packages, setPackages] = useState([]);
  const [clients, setClients] = useState([]);
  const [showIntake, setShowIntake] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  
  const user = JSON.parse(localStorage.getItem('user'));

  const [formData, setFormData] = useState({
    trackingNumber: '',
    dimensions: { width: '', height: '', length: '' },
    weight: '',
    contents: '',
    client: ''
  });

  const fetchData = async () => {
    try {
      const [pkgRes, clientRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/packages`, { headers: { Authorization: `Bearer ${user.token}` } }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/clients`, { headers: { Authorization: `Bearer ${user.token}` } })
      ]);
      setPackages(pkgRes.data);
      setClients(clientRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Fast refresh
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (pkgId, status, note = '') => {
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
    } catch (err) { toast.error('Error performing action'); }
  };

  const handleIntake = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/packages`, formData, { headers: { Authorization: `Bearer ${user.token}` } });
      toast.success('Package saved successfully!');
      setShowIntake(false);
      fetchData();
      setFormData({ trackingNumber: '', dimensions: { width: '', height: '', length: '' }, weight: '', contents: '', client: '' });
    } catch (err) { toast.error('Error saving package'); }
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

      {/* GIANT ACTION BUTTONS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
        
        {/* ACTION 1: ADD NEW */}
        <button 
          onClick={() => setShowIntake(true)}
          style={{ width: '100%', padding: '2rem', borderRadius: '1.5rem', background: 'var(--primary)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', cursor: 'pointer', boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)' }}
        >
          <Plus size={32} strokeWidth={3} />
          <span style={{ fontSize: '1.5rem', fontWeight: '800' }}>RECEIVE NEW BOX</span>
        </button>

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
                      <span style={{ fontSize: '0.65rem', background: 'var(--danger)', color: 'white', padding: '0.15rem 0.5rem', borderRadius: '0.25rem', fontWeight: '900' }}>ISSUE FLAG</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{pkg.trackingNumber}</div>
                </div>
                <button className="btn btn-primary" style={{ background: pkg.status === 'Needs Review' ? 'var(--danger)' : 'var(--warning)', color: pkg.status === 'Needs Review' ? 'white' : 'black', padding: '0.5rem 1rem' }} onClick={() => setSelectedPackage(pkg)}>
                  {pkg.status === 'Needs Review' ? 'FIX ISSUE' : 'CHECK BILL'}
                </button>
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
                <button className="btn btn-primary" style={{ background: 'var(--success)', padding: '0.5rem 1rem' }} onClick={() => handleAction(pkg._id, 'Shipped')}>
                  SHIP NOW
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* INTAKE MODAL - SUPER CLEAN */}
      <AnimatePresence>
        {showIntake && (
          <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass" style={{ width: '500px', padding: '2.5rem' }}>
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>New Box Detail</h2>
              <form onSubmit={handleIntake} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <select required value={formData.client} onChange={(e) => setFormData({...formData, client: e.target.value})} style={{ padding: '1rem', fontSize: '1.1rem' }}>
                  <option value="">Select Client Name...</option>
                  {clients.map(c => <option key={c._id} value={c._id}>{c.name} ({c.suiteNumber})</option>)}
                </select>
                <input placeholder="Tracking Number" required value={formData.trackingNumber} onChange={(e) => setFormData({...formData, trackingNumber: e.target.value})} style={{ padding: '1rem', fontSize: '1.1rem' }} />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <input placeholder="W" type="number" value={formData.dimensions.width} onChange={(e) => setFormData({...formData, dimensions: {...formData.dimensions, width: e.target.value}})} style={{ padding: '0.75rem' }} />
                  <input placeholder="H" type="number" value={formData.dimensions.height} onChange={(e) => setFormData({...formData, dimensions: {...formData.dimensions, height: e.target.value}})} style={{ padding: '0.75rem' }} />
                  <input placeholder="L" type="number" value={formData.dimensions.length} onChange={(e) => setFormData({...formData, dimensions: {...formData.dimensions, length: e.target.value}})} style={{ padding: '0.75rem' }} />
                </div>
                <input placeholder="Weight (lbs)" type="number" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} style={{ padding: '1rem' }} />
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-outline" style={{ flex: 1, padding: '1rem' }} onClick={() => setShowIntake(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '1rem', background: 'var(--primary)', fontWeight: '800' }}>SAVE BOX</button>
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
                  <AlertCircle size={16} style={{ marginBottom: '0.25rem' }} />
                  <strong>Current Issue:</strong> {selectedPackage.invoice?.adminNotes || 'Bill rejected by staff.'}
                </div>
              )}

              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>CLIENT</p>
                <p style={{ fontSize: '1.2rem', fontWeight: '700' }}>{selectedPackage.client?.name}</p>
                <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>BILL FILE</p>
                <a href={`${import.meta.env.VITE_BACKEND_URL}${selectedPackage.invoice?.filePath}`} target="_blank" className="btn btn-primary" style={{ display: 'inline-flex', gap: '0.5rem', marginTop: '0.5rem', background: '#fff', color: '#000' }}>
                  <Eye size={18} /> OPEN BILL PHOTO
                </a>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-primary" style={{ flex: 1, background: 'var(--success)', padding: '1rem' }} onClick={() => handleAction(selectedPackage._id, 'Invoice Approved')}>
                   APPROVE OK
                </button>
                <button className="btn btn-primary" style={{ flex: 1, background: 'var(--danger)', padding: '1rem' }} onClick={() => handleAction(selectedPackage._id, 'Needs Review', 'Incorrect Bill')}>
                   REJECT
                </button>
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
