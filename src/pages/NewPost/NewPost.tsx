import { useNavigate } from "react-router-dom";
import { createPost } from "../../redux/thunks/postThunks";
import PostForm from "../../components/PostForm/PostForm";
import styles from "./NewPost.module.css";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { PostData } from "types";

export default function NewPost() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

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
