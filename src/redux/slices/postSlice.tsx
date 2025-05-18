import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchPosts,
  createPost,
  deletePost,
  updatePost,
} from "../thunks/postThunks";
import type { PostsState, Post } from "types";

/**
 * The initial state for the posts slice.
 * @type {PostsState}
 * @property {Post[]} posts - Array of post objects.
 * @property {"idle" | "loading" | "succeeded" | "failed"} status - Current status of the posts fetching/updating process.
 * @property {string | null} error - Error message if any operation fails.
 */
export const initialState: PostsState = {
  posts: [],
  status: "idle",
  error: null,
};

/**
 * Redux slice for handling posts state including fetching,
 * creating, updating, and deleting posts.
 */
const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      /**
       * Handles the pending state when fetching posts.
       * Sets the status to "loading".
       */
      .addCase(fetchPosts.pending, (state) => {
        state.status = "loading";
      })
      /**
       * Handles the fulfilled state when posts are successfully fetched.
       * Sets the status to "succeeded" and updates posts array.
       * @param {PayloadAction<Post[]>} action - The fetched posts.
       */
      .addCase(fetchPosts.fulfilled, (state, action: PayloadAction<Post[]>) => {
        state.status = "succeeded";
        state.posts = action.payload;
      })
      /**
       * Handles the rejected state when fetching posts fails.
       * Sets the status to "failed" and saves the error message.
       * @param {any} action - Action containing error info.
       */
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "failed to fetch posts";
      })

      /**
       * Handles the fulfilled state when a post is successfully created.
       * Adds the new post to the posts array.
       * @param {PayloadAction<Post>} action - The created post.
       */
      .addCase(createPost.fulfilled, (state, action: PayloadAction<Post>) => {
        state.posts.push(action.payload);
      })

      /**
       * Handles the fulfilled state when a post is successfully updated.
       * Finds the post by ID and replaces it with the updated post.
       * Sets the status to "succeeded".
       * @param {PayloadAction<Post>} action - The updated post.
       */
      .addCase(updatePost.fulfilled, (state, action: PayloadAction<Post>) => {
        const updatedPostIndex = state.posts.findIndex(
          (post) => post.id === action.payload.id
        );
        if (updatedPostIndex !== -1) {
          state.posts[updatedPostIndex] = action.payload;
        }
        state.status = "succeeded";
      })

      /**
       * Handles the fulfilled state when a post is successfully deleted.
       * Removes the post from the posts array by filtering out the deleted post ID.
       * @param {PayloadAction<string>} action - The ID of the deleted post.
       */
      .addCase(deletePost.fulfilled, (state, action: PayloadAction<string>) => {
        state.posts = state.posts.filter((post) => post.id !== action.payload);
      });
  },
});

export default postSlice.reducer;
