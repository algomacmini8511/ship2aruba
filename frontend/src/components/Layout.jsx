import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Truck,
  Users,
  LogOut,
  ChevronRight,
  Bell,
  Menu,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  const adminMenu = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
    { name: 'Work Board', icon: <Package size={20} />, path: '/admin/packages' },
    { name: 'Ship Requests', icon: <Truck size={20} />, path: '/admin/ship-requests' },
    { name: 'Clients', icon: <Users size={20} />, path: '/admin/clients' },
  ];

  const clientMenu = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/client/dashboard' },
    { name: 'My Packages', icon: <Package size={20} />, path: '/client/packages' },
  ];

  const menu = role === 'admin' ? adminMenu : clientMenu;

  return (
    <div className="app-container">
      {/* Sidebar */}
      {/* Sidebar */}
      <aside style={{
        width: isCollapsed ? '80px' : '280px',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative'
      }}>
        <div style={{
          padding: isCollapsed ? '1.5rem 0' : '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          gap: '0.75rem',
          overflow: 'hidden'
        }}>
          <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '0.75rem', flexShrink: 0 }}>
            <Package size={24} color="white" />
          </div>
          {!isCollapsed && <span style={{ fontSize: '1.25rem', fontWeight: '800', whiteSpace: 'nowrap' }}>Ship2Aruba</span>}
        </div>

        <nav style={{ flex: 1, padding: '0 0.75rem' }}>
          {menu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.name : ''}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '0.75rem',
                padding: '0.875rem',
                borderRadius: '0.75rem',
                marginBottom: '0.5rem',
                transition: 'all 0.2s ease',
                background: location.pathname === item.path ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                color: location.pathname === item.path ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: location.pathname === item.path ? '600' : '500',
                overflow: 'hidden'
              }}
            >
              <div style={{ flexShrink: 0 }}>{item.icon}</div>
              {!isCollapsed && <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{item.name}</span>}
              {!isCollapsed && location.pathname === item.path && <ChevronRight size={16} />}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: '0.75rem',
            marginBottom: '1rem',
            padding: '0.5rem',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              flexShrink: 0
            }}>
              {user?.name?.[0]}
            </div>
            {!isCollapsed && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.role === 'admin' ? 'Staff' : user?.suiteNumber}</div>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            title={isCollapsed ? 'Logout' : ''}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: '0.75rem',
              padding: '0.75rem',
              borderRadius: '0.75rem',
              background: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--danger)',
              fontWeight: '600',
              fontSize: '0.875rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <LogOut size={18} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass" style={{ width: '400px', padding: '2rem', textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <LogOut size={30} />
              </div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Are you sure?</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>You will need to login again to access your account.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  style={{ padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer', fontWeight: '600' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  style={{ padding: '0.75rem', borderRadius: '0.75rem', border: 'none', background: 'var(--danger)', color: 'white', cursor: 'pointer', fontWeight: '600' }}
                >
                  Yes, Logout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <header style={{
          height: '70px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          background: 'var(--background)'
        }}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              color: 'var(--text)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Menu size={20} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button style={{ position: 'relative', background: 'var(--surface)', border: 'none', padding: '0.6rem', borderRadius: '0.5rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <Bell size={20} />
              <span style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', background: 'var(--danger)', borderRadius: '50%', border: '2px solid var(--background)' }}></span>
            </button>
          </div>
        </header>
        <div className="main-content" style={{ overflowY: 'auto', height: 'calc(100vh - 70px)' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
