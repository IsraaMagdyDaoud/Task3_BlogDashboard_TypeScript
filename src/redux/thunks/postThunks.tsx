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
