import { createAsyncThunk } from "@reduxjs/toolkit";
import { db } from "../../firebase/firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
  serverTimestamp,
  QuerySnapshot,
  DocumentData,
  Query,
} from "firebase/firestore";
import type { Post, PostData, UpdatedPostParams } from "types";

/**
 * Async thunk to fetch posts from Firestore.
 * Optionally filters posts by a specific user ID.
 *
 * @param {string | undefined} userId - The ID of the user whose posts to fetch. If undefined, fetch all posts.
 * @returns {Promise<Post[]>} Array of posts.
 * @throws Throws an error if the Firestore query fails.
 */
export const fetchPosts = createAsyncThunk<Post[], string | undefined>(
  "posts/fetchPosts",
  async (userId) => {
    try {
      const postsRef = collection(db, "posts");
      let q: Query<DocumentData> = postsRef;

      if (userId) {
        q = query(postsRef, where("authorId", "==", userId));
      }

      const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);

      const posts: Post[] = [];

      querySnapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() } as Post);
      });

      return posts;
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw error;
    }
  }
);

/**
 * Async thunk to create a new post in Firestore.
 * Adds timestamps for createdAt and updatedAt using serverTimestamp.
 *
 * @param {PostData} postData - Data for the new post.
 * @returns {Promise<Post>} The created post including Firestore document ID.
 * @throws Throws an error if adding the post to Firestore fails.
 */
export const createPost = createAsyncThunk<Post, PostData>(
  "posts/createPost",
  async (postData) => {
    try {
      const postsRef = collection(db, "posts");
      const newPost = {
        ...postData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(postsRef, newPost);
      return { id: docRef.id, ...newPost } as Post;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  }
);
/**
 * Async thunk to delete a post by its ID.
 *
 * @param {string} postId - The Firestore document ID of the post to delete.
 * @returns {Promise<string>} The deleted post ID.
 * @throws Throws an error if deleting the post from Firestore fails.
 */
export const deletePost = createAsyncThunk<string, string>(
  "posts/deletePost",
  async (postId) => {
    try {
      const postRef = doc(db, "posts", postId);
      await deleteDoc(postRef);
      return postId;
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error;
    }
  }
);

/**
 * Async thunk to update an existing post by its ID.
 * Updates timestamps and post status based on `publish` flag.
 *
 * @param {UpdatedPostParams} params - Object containing postId and postData to update.
 * @param {string} params.postId - The Firestore document ID of the post to update.
 * @param {Partial<PostData>} params.postData - The data fields to update.
 * @returns {Promise<Post>} The updated post including Firestore document ID.
 * @rejectValue {string} Returns error message if update fails.
 */
export const updatePost = createAsyncThunk<
  Post,
  UpdatedPostParams,
  { rejectValue: string }
>("posts/updatePost", async ({ postId, postData }, { rejectWithValue }) => {
  try {
    const postRef = doc(db, "posts", postId);
    const updatedData = {
      ...postData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: postData.publish ? "published" : "draft",
    };
    await updateDoc(postRef, updatedData);
    return { id: postId, ...updatedData } as Post;
  } catch (error) {
    console.log("Error updating post:", error);
    return rejectWithValue((error as Error).message);
  }
});
