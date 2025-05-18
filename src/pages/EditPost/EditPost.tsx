/**
 * *@fileoverview EditPost page that allows users to edit existing blog posts
 * Uses PostForm component to handle form UI and submission
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { updatePost } from "../../redux/thunks/postThunks";
import PostForm from "../../components/PostForm/PostForm";
import styles from "./EditPost.module.css";
import { Post, RouteParams, PostData } from "../../types";
import { useAppDispatch, useAppSelector } from "../../redux/store";

/**
 * EditPost component that handles editing of existing blog posts
 * Retrieves post data, allows editing, and dispatches update actions
 *
 * @returns {JSX.Element} The EditPost component UI
 */
export default function EditPost() {
  /**@type {string|undefined} */
  const { postId } = useParams<RouteParams>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  /**
   * @type {Object} Posts state from redux store
   * @type {Post[]} posts Array of all posts
   * @property {string} status loading status of posts operations
   */
  const { posts, status } = useAppSelector((state) => state.posts);

  /**@type {Post|null} The current post being edited */
  const [post, setPost] = useState<Post | null>(null);

  /**
   * Effect hook to calculate and update user pstatistics based in posts
   * Counts total,published, and draft posts
   *
   * @effect
   * @dependency {string|undifined} postId The post ID from URL parameters
   * @dependency {Post[]} posts The user's blog posts
   * @dependency {Function} dispatch Redux dispatch function
   */

  useEffect(() => {
    if (!postId) {
      navigate("/posts");
      return;
    }

    const currentPost = posts.find((p) => p.id === postId);
    if (currentPost) {
      setPost(currentPost);
    } else {
      navigate("/posts");
    }
  }, [postId, posts, navigate]);

  /**
   * Handles form submission for updating a post
   * Dispatches the updatePost action and navigates back to posts page on success
   *
   * @async
   * @param formData Form data containing update post information
   * @returns {Promise<void>}
   */
  const handleSubmit = async (formData: PostData) => {
    try {
      if (!post || !postId) return;
      const postData = {
        title: formData.title,
        content: formData.content,
        publish: formData.publish,
        authorId: post.authorId,
        authorName: post.authorName,
      };
      await dispatch(updatePost({ postId, postData })).unwrap();
      navigate("/posts");
    } catch (error) {
      console.error("Failed to update post:", error);
    }
  };
  if (!post) {
    return <div>Loading post.....</div>;
  }

  /**
   * @type {Object} Initial data for the post form
   * @property {string } id - PostID
   * @property {string } title - PostTitle
   * @property {string } content - PostContent
   * @property {string } status - PostStatus
   */
  const initialData = {
    id: post.id,
    title: post.title,
    content: post.content,
    status: post.status,
  };
  return (
    <div className={styles.EditPostContainer}>
      <h1 className={styles.pageTitle}>Edit Post</h1>
      <PostForm onSubmit={handleSubmit} initialData={initialData} />
    </div>
  );
}
