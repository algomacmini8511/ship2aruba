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

const Layout = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  const adminMenu = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { name: 'Work Board', icon: <Package size={20} />, path: '/admin/packages' },
    { name: 'Ship Requests', icon: <Truck size={20} />, path: '/admin/ship-requests' },
    { name: 'Clients', icon: <Users size={20} />, path: '/admin/clients' },
  ];

  const clientMenu = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/client' },
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
            onClick={handleLogout}
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
        <div className="main-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
