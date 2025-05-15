import { Outlet } from "react-router-dom";
import { Navigation } from "../index";
import styles from "./Layout.module.css";

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
