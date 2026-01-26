import { Link, Outlet, useLocation } from 'react-router-dom';
import './Layout.css';

const Layout = () => {
    const location = useLocation();
    const menuItems = [
        { path: '/', label: 'Dashboard', icon: '📊' },
        { path: '/companies', label: 'Companies', icon: '🏢' },
        { path: '/departments', label: 'Departments', icon: '👥' },
        { path: '/employees', label: 'Employees', icon: '👨‍💼' },
        { path: '/assets', label: 'IT Assets', icon: '💻' },
        { path: '/sims', label: 'SIM Management', icon: '📱' },
        { path: '/calendar', label: 'Calendar', icon: '📅' },
    ];

    return (
        <div className="app-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>Asset Manager</h2>
                </div>
                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <span className="icon">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
