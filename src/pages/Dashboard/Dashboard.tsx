import { useEffect } from "react";
import { fetchPosts } from "../../redux/thunks/postThunks";
import { updateUserStats } from "../../redux/slices/userSlice";
import UserInfo from "../../components/UserInfo/UserInfo";
import styles from "./Dashboard.module.css";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { Post, UserProfile, UserStats } from "../../types";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { posts } = useAppSelector((state) => state.posts);
  const { userStats } = useAppSelector((state) => state.user);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchPosts(user.uid));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (posts.length > 0) {
      const publishedPosts = posts.filter(
        (post: Post) => post.status === "published"
      ).length;
      const draftPosts = posts.filter(
        (post: Post) => post.status === "draft"
      ).length;

      const stats: UserStats = {
        totalPosts: posts.length,
        publishedPosts,
        draftPosts,
      };

      dispatch(updateUserStats(stats));
    }
  }, [posts, dispatch]);

  const userProfile: UserProfile | null = user
    ? {
        id: user.uid,
        name: user.name || user.email.split("@")[0],
        email: user.email,

        joinDate: new Date(user.createdAt).toLocaleDateString(),
      }
    : null;

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.pageTitle}>Dashboard</h1>

      <div className={styles.dashboardGrid}>
        <div className={styles.userSection}>
          <h2 className={styles.Info}>Profile info</h2>
          <UserInfo user={userProfile} />
        </div>

        <div className={styles.statsSection}>
          <h2>Your Blog </h2>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3>Total Posts</h3>
              <p className={styles.statValue}>{userStats.totalPosts}</p>
            </div>

            <div className={styles.statCard}>
              <h3>Published</h3>
              <p className={styles.statValue}>{userStats.publishedPosts}</p>
            </div>

            <div className={styles.statCard}>
              <h3>Drafts</h3>
              <p className={styles.statValue}>{userStats.draftPosts}</p>
            </div>
          </div>

          <h3 className={styles.recentTitle}>Recent Activity</h3>
          <div className={styles.recentPosts}>
            {posts.slice(0, 3).map((post) => (
              <div key={post.id} className={styles.recentPost}>
                <h4>{post.title}</h4>
                <p>{post.status === "published" ? "Published" : "Draft"}</p>
                <p className={styles.date}>
                  {post.updatedAt
                    ? new Date(
                        post.updatedAt.seconds * 1000
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            ))}
            {posts.length === 0 && <p>No recent activity</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
