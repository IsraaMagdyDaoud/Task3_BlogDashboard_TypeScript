import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchPosts,
  createPost,
  deletePost,
  updatePost,
} from "../thunks/postThunks";
import type { PostsState, Post } from "types";

const initialState: PostsState = {
  posts: [],
  status: "idle",
  error: null,
};

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(fetchPosts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPosts.fulfilled, (state, action: PayloadAction<Post[]>) => {
        state.status = "succeeded";
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "failed to fetch posts";
      })

      .addCase(createPost.fulfilled, (state, action: PayloadAction<Post>) => {
        state.posts.push(action.payload);
      })

      .addCase(updatePost.fulfilled, (state, action: PayloadAction<Post>) => {
        const updatedPostIndex = state.posts.findIndex(
          (post) => post.id === action.payload.id
        );
        if (updatedPostIndex !== -1) {
          state.posts[updatedPostIndex] = action.payload;
        }
        state.status = "succeeded";
      })

      .addCase(deletePost.fulfilled, (state, action: PayloadAction<string>) => {
        state.posts = state.posts.filter((post) => post.id !== action.payload);
      });
  },
});

export default postSlice.reducer;
