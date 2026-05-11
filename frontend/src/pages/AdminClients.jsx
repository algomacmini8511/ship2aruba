import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Mail, Hash, Package, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/Button';

const AdminClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/clients`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setClients(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Clients</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your client database and their suites.</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '5rem', color: 'var(--primary)' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
            <Loader size={48} />
          </motion.div>
        </div>
      ) : (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {clients.map((client) => (
          <motion.div
            key={client._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '1rem', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1.25rem' }}>
                {client.name[0]}
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem' }}>{client.name}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: '600' }}>{client.suiteNumber}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <Mail size={16} /> {client.email}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <Package size={16} /> {client.packageCount} Packages
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <Button variant="outline" style={{ width: '100%', fontSize: '0.875rem' }}>View Profile</Button>
            </div>
          </motion.div>
        ))}
      </div>
      )}
    </div>
  );
};

export default AdminClients;
