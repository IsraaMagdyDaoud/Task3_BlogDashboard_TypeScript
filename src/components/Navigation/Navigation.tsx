import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "../../redux/slices/authSlice";
import styles from "./Navigation.module.css";
import logo from "../../assets/logo.jpg";
import { useAppSelector, useAppDispatch } from "../../redux/store";

export default function Navigation() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSignOut = async (): Promise<void> => {
    try {
      await dispatch(signOut()).unwrap();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className={styles.navigation}>
      <div className={styles.fullLogo}>
        <img src={logo} alt="logo image" className={styles.logo} />
        <div className={styles.logoName}>PostPulse</div>
      </div>

      <ul className={styles.navLinks}>
        <li>
          <NavLink
            to="/posts"
            className={({ isActive }) =>
              isActive ? styles.activeLink : styles.link
            }
          >
            Posts
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/new-post"
            className={({ isActive }) =>
              isActive ? styles.activeLink : styles.link
            }
          >
            New Post
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? styles.activeLink : styles.link
            }
          >
            Dashboard
          </NavLink>
        </li>
      </ul>

      <div className={styles.userSection}>
        {user && (
          <>
            <span className={styles.userEmail}>{user.email}</span>
            <button onClick={handleSignOut} className={styles.signOutButton}>
              Sign Out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
