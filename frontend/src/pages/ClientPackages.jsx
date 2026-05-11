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
  Eye,
  Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Button from '../components/Button';

const ClientPackages = () => {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showIntake, setShowIntake] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadError, setUploadError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const user = JSON.parse(localStorage.getItem('user'));

  const fetchData = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/packages/my`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPackages(data);
    } catch (err) {
      console.error(err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 5000); // More responsive 5s refresh
    return () => clearInterval(interval);
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError(''); // Clear previous errors
    const validExtensions = ['jpeg', 'jpg', 'png', 'pdf'];
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      setUploadError('Invalid file! Only JPEG, JPG, PNG, and PDF are allowed.');
      e.target.value = ''; // Reset file input
      return;
    }

    const formData = new FormData();
    formData.append('invoice', file);

    setUploading(true);
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/packages/${selectedPackage._id}/invoice`, formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setSelectedPackage(null); // Close modal first
      setUploadError(''); // Clear error on success
      toast.success('Invoice uploaded successfully!');
      await fetchData();
    } catch (err) {
      toast.error('Upload failed. Please use PDF or Image.');
    } finally {
      setUploading(false);
    }
  };

  const handleShipRequest = async () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one package');
      return;
    }

    setActionLoadingId('bulk');
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ship-requests`, {
        packageIds: selectedIds,
        notes: 'Requested from board'
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      toast.success('Ship request sent successfully!');
      setSelectedIds([]); // Clear selection
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sending ship request');
    } finally {
      setActionLoadingId(null);
    }
  };

  const columns = [
    { title: 'Needs Action', status: ['Ready to Send', 'Needs Review'], color: '#f59e0b', icon: <FileUp size={18} />, guide: 'Upload bill here' },
    { title: 'In Review', status: ['Pending Invoice Review'], color: '#6366f1', icon: <Clock size={18} />, guide: 'Staff is checking' },
    { title: 'Ready to Ship', status: ['Invoice Approved'], color: '#10b981', icon: <CheckCircle size={18} />, guide: 'Click to Send to Aruba' },
    { title: 'On the Way', status: ['Ship Requested', 'Shipped', 'Ready for Pickup', 'Delivered'], color: '#94a3b8', icon: <Truck size={18} />, guide: 'Package is moving' }
  ];

  return (
    <div className="kanban-page" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>My Package Board</h1>
        <p style={{ color: 'var(--text-muted)' }}>Follow your packages from US warehouse to Aruba.</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, color: 'var(--primary)' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
            <Loader size={48} />
          </motion.div>
        </div>
      ) : (
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
                maxHeight: 'calc(100vh - 250px)',
                overflowY: 'auto'
              }}>
                {(() => {
                  const colPackages = packages.filter(p => col.status.includes(p.status));

                  if (col.title === 'On the Way') {
                    const groups = {};
                    colPackages.forEach(p => {
                      const shipId = p.shipRequest?._id || (typeof p.shipRequest === 'string' ? p.shipRequest : null);
                      const key = shipId || (['Ship Requested', 'Shipped', 'Delivered'].includes(p.status) ? `fallback_${p.client?._id}_${new Date(p.updatedAt).toISOString().substring(0, 16)}` : p._id);

                      if (!groups[key]) groups[key] = [];
                      groups[key].push(p);
                    });

                    return Object.values(groups).map((group) => {
                      const pkg = group[0];
                      const isGroup = group.length > 1;

                      return (
                        <motion.div
                          layoutId={pkg._id}
                          key={pkg._id}
                          className="glass-card"
                          style={{
                            padding: '1rem',
                            borderLeft: `4px solid ${col.color}`,
                            position: 'relative'
                          }}
                          onClick={() => {
                            if (isGroup) {
                              setSelectedGroup(group);
                            } else {
                              // If it's single, we might not have a detail modal for clients yet, 
                              // but let's just use the group one with 1 item
                              setSelectedGroup([pkg]);
                            }
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                                {isGroup ? `${group.length} Packages Bundled` : pkg.trackingNumber}
                              </span>
                            </div>
                            <Truck size={14} color="var(--text-muted)" style={{ opacity: 0.6 }} />
                          </div>

                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            {isGroup ? (
                              <div style={{ fontSize: '0.75rem' }}>
                                {group.map(p => p.trackingNumber).join(', ')}
                              </div>
                            ) : (
                              pkg.contents
                            )}
                          </div>

                          <div style={{
                            textAlign: 'center',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: pkg.status === 'Delivered' ? 'var(--success)' : (pkg.status === 'Ready for Pickup' ? '#f59e0b' : 'var(--text-muted)'),
                            background: 'rgba(255,255,255,0.03)',
                            padding: '0.5rem',
                            borderRadius: '0.5rem'
                          }}>
                            {(() => {
                              if (pkg.status === 'Ship Requested') return 'Request Sent...';
                              if (pkg.status === 'Shipped') return 'In Transit';
                              if (pkg.status === 'Ready for Pickup') return 'Arrived - Ready for Pickup';
                              if (pkg.status === 'Delivered') return 'Delivered Successfully';
                              return pkg.status;
                            })()}
                          </div>
                        </motion.div>
                      );
                    });
                  }

                  return colPackages.map((pkg) => (
                    <motion.div
                      layoutId={pkg._id}
                      key={pkg._id}
                      className="glass-card"
                      style={{
                        padding: '1rem',
                        borderLeft: `4px solid ${col.color}`,
                        position: 'relative',
                        border: selectedIds.includes(pkg._id) ? '1px solid var(--primary)' : '1px solid var(--border)',
                        background: selectedIds.includes(pkg._id) ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255, 255, 255, 0.02)'
                      }}
                    >
                      {pkg.status === 'Invoice Approved' && (
                        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', zIndex: 10 }}>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(pkg._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIds([...selectedIds, pkg._id]);
                              } else {
                                setSelectedIds(selectedIds.filter(id => id !== pkg._id));
                              }
                            }}
                            style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                          />
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{pkg.trackingNumber}</span>
                          {pkg.status === 'Needs Review' && (
                            <div className="tooltip-container">
                              <AlertCircle size={14} color="var(--danger)" />
                              <div className="tooltip-content">
                                <span className="tooltip-header">Note from Admin</span>
                                <span style={{ color: '#fff', display: 'block', marginTop: '0.25rem' }}>
                                  {pkg.invoice?.adminNotes || 'Bill rejected by staff.'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        {col.title === 'Needs Action' && <Eye size={14} color="var(--text-muted)" style={{ opacity: 0.6, cursor: 'pointer' }} onClick={() => setSelectedPackage(pkg)} />}
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{pkg.contents}</p>

                      {/* Action Buttons based on status */}
                      {(pkg.status === 'Ready to Send' || pkg.status === 'Needs Review') && (
                        <button className="btn btn-primary" style={{ width: '100%', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: pkg.status === 'Needs Review' ? 'var(--danger)' : 'var(--primary)' }} onClick={() => setSelectedPackage(pkg)}>
                          {pkg.status === 'Needs Review' ? 'Fix Invoice' : 'Upload Invoice'} <ChevronRight size={16} />
                        </button>
                      )}

                      {pkg.status === 'Invoice Approved' && (
                        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--success)' }}>
                          <CheckCircle size={14} /> Ready for Shipping
                        </div>
                      )}
                    </motion.div>
                  ))
                })()}

                {col.title === 'Ready to Ship' && packages.filter(p => p.status === 'Invoice Approved').length > 0 && (
                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <Button
                      loading={actionLoadingId === 'bulk'}
                      disabled={selectedIds.length === 0}
                      style={{ width: '100%', background: 'var(--success)', fontWeight: '700' }}
                      onClick={handleShipRequest}
                    >
                      {selectedIds.length > 0 ? `Ship ${selectedIds.length} Packages` : 'Select Packages to Ship'}
                    </Button>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
                      Select packages above to bundle them into one request.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Simple Upload Modal */}
      <AnimatePresence>
        {selectedPackage && (
          <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass" style={{ width: '400px', padding: '2rem', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Upload Bill / Invoice</h2>
                <button onClick={() => { setSelectedPackage(null); setUploadError(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
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

              {uploadError && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.8rem' }}>
                  <AlertCircle size={16} style={{ display: 'inline', marginBottom: '-3px', marginRight: '5px' }} />
                  <strong>Error:</strong> {uploadError}
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

              <Button
                loading={uploading}
                style={{ width: '100%', marginTop: '1rem' }}
                onClick={() => document.getElementById('file-upload').click()}
              >
                {uploading ? 'Processing & Uploading...' : 'Choose File & Upload'}
              </Button>

              {!uploading && (
                <Button variant="outline" style={{ border: 'none', marginTop: '1rem', width: '100%' }} onClick={() => { setSelectedPackage(null); setUploadError(''); }}>
                  Cancel
                </Button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Group Detail Modal */}
      <AnimatePresence>
        {selectedGroup && (
          <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass" style={{ width: '600px', padding: '2rem', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Shipment Details</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Bundled Group ({selectedGroup.length} Packages)</p>
                </div>
                <button className="btn-icon" onClick={() => setSelectedGroup(null)}><X size={20} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {selectedGroup.map((pkg, idx) => (
                  <div key={pkg._id} className="glass-card" style={{ padding: '1rem', borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '700' }}>#{idx + 1}: {pkg.trackingNumber}</span>
                      <span className={`badge ${pkg.status === 'Shipped' ? 'badge-approved' : 'badge-shipped'}`}>{pkg.status}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <p>Weight: {pkg.weight} lbs</p>
                      <p>Contents: {pkg.contents}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={() => setSelectedGroup(null)}>Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientPackages;
