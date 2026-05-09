import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Package, Truck, AlertCircle, CheckCircle, ArrowRight, FileUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ClientDashboard = () => {
  const [packages, setPackages] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/packages/my', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setPackages(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPackages();
  }, []);

  const counts = {
    ready: packages.filter(p => p.status === 'Ready to Send' || p.status === 'Needs Review').length,
    approved: packages.filter(p => p.status === 'Invoice Approved').length,
  };

  const steps = [
    { name: 'Receive', icon: <Package size={16} />, desc: 'Warehouse logs package' },
    { name: 'Invoice', icon: <FileUp size={16} />, desc: 'You upload the bill' },
    { name: 'Review', icon: <AlertCircle size={16} />, desc: 'Staff checks details' },
    { name: 'Request', icon: <Truck size={16} />, desc: 'You ask to ship' },
    { name: 'Aruba', icon: <CheckCircle size={16} />, desc: 'Package arrives!' },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Hello, {user.name.split(' ')[0]}!</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Welcome to your Ship2Aruba suite: <strong>{user.suiteNumber}</strong></p>
      </div>

      {/* Actionable Steps for Client */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
        <motion.div 
          whileHover={{ y: -5 }}
          onClick={() => navigate('/client/packages')}
          className="glass-card" 
          style={{ borderLeft: '6px solid var(--warning)', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: 'var(--warning)' }}>
              <FileUp size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Invoices Needed</h3>
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: '800' }}>{counts.ready}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Click to upload bills for these packages.</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          onClick={() => navigate('/client/packages')}
          className="glass-card" 
          style={{ borderLeft: '6px solid var(--success)', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: 'var(--success)' }}>
              <Truck size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Ready to Ship</h3>
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: '800' }}>{counts.approved}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>These are approved! Click to send to Aruba.</p>
        </motion.div>
      </div>

      {/* Workflow Map - Non-Technical Guidance */}
      <div className="glass-card" style={{ marginBottom: '3rem', padding: '2rem' }}>
        <h3 style={{ marginBottom: '2rem', textAlign: 'center' }}>How it works?</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
          {/* Connector Line */}
          <div style={{ position: 'absolute', top: '20px', left: '10%', right: '10%', height: '2px', background: 'var(--border)', zIndex: 0 }}></div>
          
          {steps.map((step, i) => (
            <div key={step.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', zIndex: 1, width: '15%' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                {step.icon}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '700' }}>{step.name}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '1.5rem' }}>Your US Shipping Address</h3>
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px dashed var(--border)' }}>
          <p><strong>{user.name}</strong></p>
          <p>8350 NW 68th St</p>
          <p>Suite <strong>{user.suiteNumber}</strong></p>
          <p>Miami, FL 33166</p>
          <p>United States</p>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
