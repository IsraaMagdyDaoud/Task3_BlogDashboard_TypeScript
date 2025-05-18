/**
 * @fileoverview Posts page display posts  and allow deletion and edit
 */
import { useEffect, useState } from "react";
import { fetchPosts, deletePost } from "../../redux/thunks/postThunks";
import { PostCard, Pagination } from "../../components/index";
import styles from "./Posts.module.css";
import { useAppDispatch, useAppSelector } from "../../redux/store";

/**
 * Posts component - Displays a paginated list of posts and allows deletion.
 *
 * @component
 * @returns {JSX.Element}
 */
export default function Posts() {
  const dispatch = useAppDispatch();

  /** Extracts posts data, status, and error state from the Redux store */
  const { posts, status, error } = useAppSelector((state) => state.posts);

  /** Current page number for pagination */
  const [currentPage, setCurrentPage] = useState<number>(1);

  /** Number of posts displayed per page */
  const [postsPerPage] = useState<number>(6);

  /**
   * useEffect hook to fetch posts from the server if status is "idle"
   * @effect
   */
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchPosts());
    }
  }, [status, dispatch]);

  /**
   * Deletes a post after user confirmation
   * @param {string} postId - The ID of the post to delete
   */
  const handleDeletePost = (postId: string): void => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      dispatch(deletePost(postId));
    }
  };

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  /**
   * Handles page change event for pagination
   * @param {number} pageNumber - The page number to switch to
   */
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (status === "loading") {
    return <div className={styles.loading}>Loading posts...</div>;
  }

  if (status === "failed") {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <div className={styles.postsContainer}>
      <h1 className={styles.pageTitle}>All Posts</h1>

      {posts.length === 0 ? (
        <p className={styles.noPosts}>No posts found. Create a new post!</p>
      ) : (
        <>
          <div className={styles.postsGrid}>
            {currentPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={() => handleDeletePost(post.id)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
