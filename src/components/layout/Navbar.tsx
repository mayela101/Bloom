import { Link, useLocation } from 'react-router-dom';
import { Home, User, MessageCircle, BookOpen, BarChart3 } from 'lucide-react';
import styles from './Navbar.module.css';

const navItems = [
  { to: '/', icon: Home, label:  'Home' },
  { to:  '/journal', icon:  BookOpen, label: 'Journal' },
  { to: '/dashboard', icon: BarChart3, label:  'Overview' },
  { to: '/chat', icon: MessageCircle, label: 'Flutter' },
  { to: '/profile', icon: User, label:  'Profile' },
];

export function Navbar() {
  const location = useLocation();

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContent}>
        {navItems.map(({ to, icon:  Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`${styles.navLink} ${isActive ?  styles.navLinkActive : ''}`}
            >
              <Icon size={22} />
              <span className={styles. navLabel}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}