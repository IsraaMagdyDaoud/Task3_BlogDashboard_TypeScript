/**
 * @fileoverview NewPost page that handles creation of new blog posts
 * Integrates eith PostForm component and dispatchs post creation actiond
 */
import { useNavigate } from "react-router-dom";
import { createPost } from "../../redux/thunks/postThunks";
import PostForm from "../../components/PostForm/PostForm";
import styles from "./NewPost.module.css";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { PostData } from "types";

/**
 * NewPost page for creating new blog post
 * Provides a form UI and handles post submission to the backend
 * @returns {JSX.Element}
 */
export default function NewPost() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  /**
   * @type {Object|null} current user
   * @property {string} uid - UserID
   * @property {string} email - UserEmail
   * @property {string} [name] - User display name

   */
  const { user } = useAppSelector((state) => state.auth);

  /**
   * Handles form submission form creating a new post
   * Adds author information to post data and dispatches create action
   *
   * @async
   * @param {postData}postData
   * @returns {Promise<void>}
   */
  const handleSubmit = async (postData: PostData) => {
    try {
      if (!user) return;
      const completePostData = {
        ...postData,
        authorId: user.uid,
        authorName: user.name || user.email.split("@")[0],
        authorEmail: user.email,
        status: postData.publish ? "published" : "draft",
      };

      await dispatch(createPost(completePostData)).unwrap();
      navigate("/posts");
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

  return (
    <div className={styles.newPostContainer}>
      <h1 className={styles.pageTitle}>Create New Post</h1>
      <PostForm onSubmit={handleSubmit} />
    </div>
  );
}
