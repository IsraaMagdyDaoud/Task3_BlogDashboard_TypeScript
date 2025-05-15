import { useEffect, useState } from "react";
import { fetchPosts, deletePost } from "../../redux/thunks/postThunks";
import { PostCard, Pagination } from "../../components/index";
import styles from "./Posts.module.css";
import { useAppDispatch, useAppSelector } from "../../redux/store";

export default function Posts() {
  const dispatch = useAppDispatch();
  const { posts, status, error } = useAppSelector((state) => state.posts);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [postsPerPage] = useState<number>(6);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchPosts());
    }
  }, [status, dispatch]);

  const handleDeletePost = (postId: string): void => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      dispatch(deletePost(postId));
    }
  };

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

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
