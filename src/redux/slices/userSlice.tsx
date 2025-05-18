import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserState, UserStats } from "../../types";

/**
 * The initial state for the user slice.
 * @type {UserState}
 * @property {object | null} currentUser - The currently logged-in user info or null if no user is logged in.
 * @property {UserStats} userStats - Statistics related to the user posts.
 * @property {"idle" | "loading" | "succeeded" | "failed"} status - Status of user-related operations.
 * @property {string | null} error - Error message if any user operation fails.
 */
const initialState: UserState = {
  currentUser: null,
  userStats: {
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
  },
  status: "idle",
  error: null,
};

/**
 * Redux slice to handle user state including current user info
 * and user statistics.
 */
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    /**
     * Sets the current user data.
     * @param {UserState} state - Current state of the user slice.
     * @param {PayloadAction<any>} action - Action containing user data payload.
     */
    setUser: (state, action: PayloadAction<any>) => {
      state.currentUser = action.payload;
    },
    /**
     * Updates the user statistics such as total posts,
     * published posts, and draft posts.
     * @param {UserState} state - Current state of the user slice.
     * @param {PayloadAction<UserStats>} action - Action containing user stats payload.
     */
    updateUserStats: (state, action: PayloadAction<UserStats>) => {
      state.userStats = action.payload;
    },
  },
});

export const { setUser, updateUserStats } = userSlice.actions;
export default userSlice.reducer;
