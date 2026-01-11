import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import styles from './Layout.module.css';

export function Layout() {
  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        <Outlet />
      </main>
      <Navbar />
    </div>
  );
}