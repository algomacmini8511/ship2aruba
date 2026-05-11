import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
  Plus,
  Search,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Truck,
  Package as PackageIcon,
  ChevronRight,
  AlertCircle,
  X,
  Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Button from '../components/Button';

const AdminPackages = () => {
  const [packages, setPackages] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIntake, setShowIntake] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [filterClientId, setFilterClientId] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');

  // Loading states for actions
  const [isSaving, setIsSaving] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [formData, setFormData] = useState({
    trackingNumber: '',
    dimensions: { width: '', height: '', length: '' },
    weight: '',
    contents: '',
    client: ''
  });

  const dropdownRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user'));

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    const interval = setInterval(() => fetchData(false), 5000); // More responsive 5s refresh
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

  const handleIntake = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/packages`, formData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
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

  const handleReview = async (status) => {
    setIsReviewing(true);
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/packages/${selectedPackage._id}/review`, {
        status, adminNotes: reviewNote
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      toast.success(`Package ${status}`);
      setSelectedPackage(null);
      setReviewNote('');
      fetchData();
    } catch (err) {
      toast.error('Error reviewing package');
    } finally {
      setIsReviewing(false);
    }
  };

  const columns = [
    { title: 'New Packages', status: ['Ready to Send'], color: '#6366f1', icon: <PackageIcon size={18} />, guide: 'Log incoming boxes here' },
    { title: 'Needs Review', status: ['Pending Invoice Review', 'Needs Review'], color: '#f59e0b', icon: <FileText size={18} />, guide: 'Check bills uploaded by clients' },
    { title: 'Approved', status: ['Invoice Approved'], color: '#10b981', icon: <CheckCircle size={18} />, guide: 'Waiting for ship request' },
    { title: 'Requested', status: ['Ship Requested'], color: '#8b5cf6', icon: <Truck size={18} />, guide: 'Ready to be sent to Aruba' },
    { title: 'Shipped', status: ['Shipped'], color: '#94a3b8', icon: <Truck size={18} />, guide: 'Sent to Aruba' },
    { title: 'Ready for Pickup / Delivered', status: ['Ready for Pickup', 'Delivered'], color: '#10b981', icon: <CheckCircle size={18} />, guide: 'Final stages' }
  ];

  const filteredPackages = filterClientId
    ? packages.filter(p => p.client?._id === filterClientId)
    : packages;

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(filterSearch.toLowerCase()) ||
    c.suiteNumber.toLowerCase().includes(filterSearch.toLowerCase())
  );

  return (
    <div className="kanban-page" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Package Board</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Track and move packages through the workflow.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* Custom Searchable Dropdown */}
          <div ref={dropdownRef} style={{ position: 'relative', width: '250px' }}>
            <div
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="glass"
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: isFilterOpen ? '1px solid var(--primary)' : '1px solid var(--border)',
                background: 'rgba(255,255,255,0.03)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Search size={14} color="var(--text-muted)" />
                <span style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
                  {filterClientId ? clients.find(c => c._id === filterClientId)?.name : 'All Clients'}
                </span>
              </div>
              <ChevronRight size={14} style={{ transform: isFilterOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: '0.3s' }} />
            </div>

            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="glass"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.5rem)',
                    left: 0,
                    right: 0,
                    zIndex: 100,
                    borderRadius: '1rem',
                    overflow: 'hidden',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    padding: '0.5rem'
                  }}
                >
                  <input
                    autoFocus
                    placeholder="Search client..."
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.05)',
                      border: 'none',
                      padding: '0.6rem',
                      fontSize: '0.8rem',
                      borderRadius: '0.5rem',
                      marginBottom: '0.5rem',
                      outline: 'none'
                    }}
                  />
                  <div className="custom-scroll" style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '2px' }}>
                    <div
                      onClick={() => { setFilterClientId(''); setIsFilterOpen(false); setFilterSearch(''); }}
                      style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '0.5rem', background: !filterClientId ? 'rgba(99, 102, 241, 0.1)' : 'transparent', marginBottom: '2px' }}
                      className="hover-bg"
                    >
                      All Clients
                    </div>
                    {filteredClients.map(c => (
                      <div
                        key={c._id}
                        onClick={() => { setFilterClientId(c._id); setIsFilterOpen(false); setFilterSearch(''); }}
                        style={{
                          padding: '0.6rem 1rem',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          borderRadius: '0.5rem',
                          background: filterClientId === c._id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                          display: 'flex',
                          flexDirection: 'column',
                          marginBottom: '2px'
                        }}
                        className="hover-bg"
                      >
                        <span style={{ fontWeight: '600' }}>{c.name}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Suite: {c.suiteNumber}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button variant="primary" onClick={() => setShowIntake(true)}>
            <Plus size={18} /> Add New Package
          </Button>
        </div>
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
              minWidth: '300px',
              width: '300px',
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '1rem',
              border: '1px solid var(--border)',
              overflow: 'hidden' // Removed to prevent tooltip clipping
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
                    {filteredPackages.filter(p => col.status.includes(p.status)).length}
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
                  const colPackages = filteredPackages.filter(p => col.status.includes(p.status));

                  if (['Requested', 'Shipped', 'Ready for Pickup / Delivered'].includes(col.title)) {
                    // Group by shipRequest for these columns
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
                          style={{ padding: '1rem', cursor: 'pointer', borderLeft: `4px solid ${col.color}` }}
                          onClick={() => {
                            if (col.title === 'Approved') return; // Disable modal for Approved column
                            if (isGroup) {
                              setSelectedGroup(group);
                            } else {
                              setSelectedPackage(pkg);
                            }
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                                {isGroup ? `${group.length} Packages Bundled` : pkg.trackingNumber}
                              </span>
                            </div>
                            {pkg.status === 'Delivered' ? <CheckCircle size={14} color="var(--success)" style={{ opacity: 0.8 }} /> : (pkg.status === 'Ready for Pickup' ? <PackageIcon size={14} color="#f59e0b" /> : <Truck size={14} color={col.color} style={{ opacity: 0.6 }} />)}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                            <div style={{ fontWeight: '600', color: 'var(--text)' }}>{pkg.client?.name}</div>
                            {isGroup ? (
                              <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                {group.map(p => p.trackingNumber).join(', ')}
                              </div>
                            ) : (
                              <div>{pkg.client?.suiteNumber}</div>
                            )}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {isGroup ? `${group.reduce((acc, p) => acc + (p.weight || 0), 0).toFixed(1)} lbs total` : `${pkg.weight} lbs`}
                            </span>
                          </div>

                          {col.title === 'Requested' && (
                            <Button
                              loading={actionLoadingId === pkg._id}
                              style={{ width: '100%', fontSize: '0.85rem', marginTop: '1rem', background: 'var(--accent)' }}
                              onClick={async (e) => {
                                e.stopPropagation();
                                setActionLoadingId(pkg._id);
                                try {
                                  const idsToShip = group.map(p => p._id);
                                  await Promise.all(idsToShip.map(id =>
                                    axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/packages/${id}/status`, {
                                      status: 'Shipped'
                                    }, { headers: { Authorization: `Bearer ${user.token}` } })
                                  ));
                                  toast.success(`${isGroup ? 'Shipment' : 'Package'} marked as Shipped!`);
                                  fetchData();
                                } catch (err) {
                                  toast.error('Error shipping packages');
                                } finally {
                                  setActionLoadingId(null);
                                }
                              }}
                            >
                              Ship {isGroup ? 'All' : 'Now'} <ChevronRight size={16} />
                            </Button>
                          )}

                          {col.title === 'Shipped' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
                              <Button
                                loading={actionLoadingId === `pickup-${pkg._id}`}
                                style={{ fontSize: '0.75rem', background: '#f59e0b', padding: '0.5rem' }}
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  setActionLoadingId(`pickup-${pkg._id}`);
                                  try {
                                    const ids = group.map(p => p._id);
                                    await Promise.all(ids.map(id =>
                                      axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/packages/${id}/status`, {
                                        status: 'Ready for Pickup'
                                      }, { headers: { Authorization: `Bearer ${user.token}` } })
                                    ));
                                    toast.success('Marked as Ready for Pickup');
                                    fetchData();
                                  } catch (err) { toast.error('Error updating status'); } finally { setActionLoadingId(null); }
                                }}
                              >
                                Ready Pickup
                              </Button>
                              <Button
                                loading={actionLoadingId === `delivered-${pkg._id}`}
                                style={{ fontSize: '0.75rem', background: '#10b981', padding: '0.5rem' }}
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  setActionLoadingId(`delivered-${pkg._id}`);
                                  try {
                                    const ids = group.map(p => p._id);
                                    await Promise.all(ids.map(id =>
                                      axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/packages/${id}/status`, {
                                        status: 'Delivered'
                                      }, { headers: { Authorization: `Bearer ${user.token}` } })
                                    ));
                                    toast.success('Marked as Delivered');
                                    fetchData();
                                  } catch (err) { toast.error('Error updating status'); } finally { setActionLoadingId(null); }
                                }}
                              >
                                Delivered
                              </Button>
                            </div>
                          )}

                          {col.title === 'Ready for Pickup / Delivered' && pkg.status === 'Ready for Pickup' && (
                            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#f59e0b', fontSize: '0.8rem', fontWeight: '700', padding: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '0.5rem' }}>
                              <PackageIcon size={16} /> Ready for Pickup
                            </div>
                          )}

                          {col.title === 'Ready for Pickup / Delivered' && pkg.status === 'Delivered' && (
                            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.8rem', fontWeight: '700', padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem' }}>
                              <CheckCircle size={16} /> Fully Delivered
                            </div>
                          )}
                        </motion.div>
                      );
                    });
                  }

                  return colPackages.map((pkg) => (
                    <motion.div
                      layoutId={pkg._id}
                      key={pkg._id}
                      className="glass-card"
                      style={{ padding: '1rem', cursor: col.title === 'Approved' ? 'default' : 'pointer', borderLeft: `4px solid ${col.color}` }}
                      onClick={() => {
                        if (col.title === 'Approved') return;
                        setSelectedPackage(pkg);
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{pkg.trackingNumber}</span>
                          {pkg.status === 'Needs Review' && (
                            <div className="tooltip-container">
                              <AlertCircle size={14} color="var(--danger)" />
                              <div className="tooltip-content">
                                <span className="tooltip-header">Admin Review Note</span>
                                <span style={{ color: '#fff', display: 'block', marginTop: '0.25rem' }}>
                                  {pkg.invoice?.adminNotes || 'Invoice needs correction.'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        {col.title === 'New Packages' && <Eye size={14} color="var(--text-muted)" style={{ opacity: 0.6 }} />}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                        <div style={{ fontWeight: '600', color: 'var(--text)' }}>{pkg.client?.name}</div>
                        <div>{pkg.client?.suiteNumber}</div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{pkg.weight} lbs</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          {pkg.status === 'Pending Invoice Review' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)', boxShadow: '0 0 8px var(--warning)' }}></div>}
                        </div>
                      </div>

                      {pkg.status === 'Pending Invoice Review' && (
                        <button className="btn btn-primary" style={{ width: '100%', fontSize: '0.85rem', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'var(--warning)', color: '#000' }}>
                          Review Invoice <ChevronRight size={16} />
                        </button>
                      )}

                      {pkg.status === 'Ship Requested' && (
                        <Button
                          loading={actionLoadingId === pkg._id}
                          style={{ width: '100%', fontSize: '0.85rem', marginTop: '1rem', background: 'var(--accent)' }}
                          onClick={async (e) => {
                            e.stopPropagation(); // Don't open modal
                            setActionLoadingId(pkg._id);
                            try {
                              await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/packages/${pkg._id}/status`, {
                                status: 'Shipped'
                              }, { headers: { Authorization: `Bearer ${user.token}` } });
                              toast.success(`Package ${pkg.trackingNumber} Shipped!`);
                              fetchData();
                            } catch (err) {
                              toast.error('Error shipping package');
                            } finally {
                              setActionLoadingId(null);
                            }
                          }}
                        >
                          Ship Now <ChevronRight size={16} />
                        </Button>
                      )}
                    </motion.div>
                  ))
                })()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals same as before but styled for simplicity */}
      <AnimatePresence>
        {showIntake && (
          <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass" style={{ width: '500px', padding: '2.5rem', maxWidth: '95vw' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>New Package Entry</h2>
              <form onSubmit={handleIntake} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Select Client</label>
                  <select required value={formData.client} onChange={(e) => setFormData({ ...formData, client: e.target.value })} style={{ width: '100%' }}>
                    <option value="">Choose Client...</option>
                    {clients.map(c => <option key={c._id} value={c._id}>{c.name} ({c.suiteNumber})</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Tracking Number</label>
                  <input placeholder="Enter Tracking #" required value={formData.trackingNumber} onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Width</label>
                    <input style={{ width: '100%' }} placeholder="W" type="number" value={formData.dimensions.width} onChange={(e) => setFormData({ ...formData, dimensions: { ...formData.dimensions, width: e.target.value } })} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Height</label>
                    <input style={{ width: '100%' }} placeholder="H" type="number" value={formData.dimensions.height} onChange={(e) => setFormData({ ...formData, dimensions: { ...formData.dimensions, height: e.target.value } })} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Length</label>
                    <input style={{ width: '100%' }} placeholder="L" type="number" value={formData.dimensions.length} onChange={(e) => setFormData({ ...formData, dimensions: { ...formData.dimensions, length: e.target.value } })} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Weight (lbs)</label>
                  <input placeholder="0.0" type="number" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Contents Description</label>
                  <textarea placeholder="What is inside?" rows="2" value={formData.contents} onChange={(e) => setFormData({ ...formData, contents: e.target.value })}></textarea>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <Button type="button" variant="outline" style={{ flex: 1 }} onClick={() => {
                    setShowIntake(false);
                    setFormData({ trackingNumber: '', dimensions: { width: '', height: '', length: '' }, weight: '', contents: '', client: '' });
                  }}>Cancel</Button>
                  <Button type="submit" loading={isSaving} style={{ flex: 1 }}>Save Package</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {selectedPackage && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ width: '550px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem' }}>Package Details</h2>
                <button onClick={() => setSelectedPackage(null)} className="btn-outline" style={{ padding: '0.25rem', borderRadius: '50%' }}><XCircle size={20} /></button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tracking</p>
                    <p style={{ fontWeight: '700' }}>{selectedPackage.trackingNumber}</p>
                  </div>
                  <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Client</p>
                    <p style={{ fontWeight: '700' }}>{selectedPackage.client?.name}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>{selectedPackage.client?.suiteNumber}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</p>
                    <p style={{ fontWeight: '700', color: 'var(--primary)' }}>{selectedPackage.status}</p>
                  </div>
                  <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Invoice</p>
                    {selectedPackage.invoice?.filePath ?
                      <a href={`${import.meta.env.VITE_BACKEND_URL}${selectedPackage.invoice.filePath}`} target="_blank" className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', marginTop: '0.4rem' }}>View Invoice</a>
                      : <p style={{ fontSize: '0.8rem' }}>Not Uploaded</p>
                    }
                  </div>
                </div>
              </div>

              {selectedPackage.invoice?.filePath && renderMediaPreview(selectedPackage.invoice.filePath)}

              {selectedPackage.status === 'Pending Invoice Review' && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                  <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Review Action</h4>
                  <textarea placeholder="Reason for rejection (if any)..." style={{ width: '100%', marginBottom: '1rem' }} value={reviewNote} onChange={(e) => setReviewNote(e.target.value)}></textarea>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button loading={isReviewing} style={{ flex: 1, background: 'var(--success)' }} onClick={() => handleReview('Invoice Approved')}>Approve Invoice</Button>
                    <Button loading={isReviewing} style={{ flex: 1, background: 'var(--danger)' }} onClick={() => handleReview('Needs Review')}>Flag Issue</Button>
                  </div>
                </div>
              )}

              {selectedPackage.status === 'Ship Requested' && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                  <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Final Step</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>This package is ready to go to Aruba. Click below to finish.</p>
                  <Button loading={isReviewing} style={{ width: '100%', background: 'var(--accent)' }} onClick={async () => {
                    setIsReviewing(true);
                    try {
                      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/packages/${selectedPackage._id}/status`, {
                        status: 'Shipped'
                      }, { headers: { Authorization: `Bearer ${user.token}` } });
                      toast.success('Package marked as Shipped!');
                      setSelectedPackage(null);
                      fetchData();
                    } catch (err) {
                      toast.error('Error updating status');
                    } finally {
                      setIsReviewing(false);
                    }
                  }}>Mark as Shipped & Notify Client</Button>
                </div>
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
                      <span className="badge badge-approved">{pkg.status}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <p>Weight: {pkg.weight} lbs</p>
                      <p>Contents: {pkg.contents}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={() => setSelectedGroup(null)}>Close</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPackages;
