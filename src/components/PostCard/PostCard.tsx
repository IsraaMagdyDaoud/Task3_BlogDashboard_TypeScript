import styles from "./PostCard.module.css";
import { useNavigate } from "react-router-dom";
import { PostCardProps } from "types";

/**
 * PostCard component - Displays a summary of a blog post with edit and delete options.
 *
 * @component
 * @param {PostCardProps} props - Component props
 * @param {Object} props.post - Post data including title, content, status, etc.
 * @param {Function} props.onDelete - Function to handle post deletion
 * @returns {JSX.Element} Rendered post card
 */
export default function PostCard({ post, onDelete }: PostCardProps) {
  const navigate = useNavigate();

  /**
   * Formats a Firestore timestamp into a readable date string.
   *
   * @param {Object} timestamp - Firestore timestamp object
   * @param {number} timestamp.seconds - Seconds since epoch
   * @param {number} [timestamp.nanoseconds] - Optional nanoseconds
   * @returns {string} Formatted date or "N/A" if timestamp is missing
   */
  const formatDate = (
    timestamp: { seconds: number; nanoseconds?: number } | undefined
  ): string => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString();
  };

  /**
   * Truncates the post content to a specified maximum length.
   *
   * @param {string} content - Post content
   * @param {number} [maxLength=150] - Maximum length before truncation
   * @returns {string} Truncated content with ellipsis if needed
   */
  const truncateContent = (
    content: string,
    maxLength: number = 150
  ): string => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + "...";
  };

  return (
    <div className={styles.postCard}>
      <div className={styles.status}>
        <span
          className={
            post.status === "published" ? styles.published : styles.draft
          }
        >
          {post.status}
        </span>
      </div>

      <h2 className={styles.title}>{post.title}</h2>
      <p className={styles.content}>{truncateContent(post.content)}</p>

      <div className={styles.meta}>
        <span>By {post.authorName}</span>
        <span>•</span>
        <span>{formatDate(post.createdAt)}</span>
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.button} ${styles.editAndDeleteButton}`}
          onClick={() => navigate(`/edit-post/${post.id}`)}
        >
          Edit
        </button>
        <button
          className={`${styles.button} ${styles.editAndDeleteButton}`}
          onClick={onDelete}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
