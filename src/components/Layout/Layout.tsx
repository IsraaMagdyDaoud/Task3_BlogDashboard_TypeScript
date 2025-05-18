import { Outlet } from "react-router-dom";
import { Navigation } from "../index";
import styles from "./Layout.module.css";

/**
 * Layout component - Wraps the app's pages with a consistent layout structure,
 * including a navigation bar and a dynamic content area.
 *
 * @component
 * @returns {JSX.Element} A page layout with navigation and routed content
 */
export default function Layout() {
  return (
    <div className={styles.layout}>
      <Navigation />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
