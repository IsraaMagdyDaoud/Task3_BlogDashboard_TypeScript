import styles from "./UserInfo.module.css";
import { UserProfile } from "../../types";

interface UserInfoProps {
  user: UserProfile | null;
}

/**
 * UserInfo component - Displays a user's profile information including
 * name, email, and join date. Shows a loading message if the user data is not available.
 *
 * @component
 * @param {UserInfoProps} props - Component props
 * @returns {JSX.Element} Rendered user info or loading message
 */
export default function UserInfo({ user }: UserInfoProps) {
  if (!user) {
    return <div className={styles.loading}>Loading user information...</div>;
  }

  return (
    <>
      <div className={styles.userInfoContainer}>
        <div className={styles.userDetails}>
          <h2 className={styles.userName}>{user.name}</h2>
          <p className={styles.userEmail}>Email: {user.email}</p>
          <p className={styles.joinDate}>Member since: {user.joinDate}</p>
        </div>
      </div>
    </>
  );
}
