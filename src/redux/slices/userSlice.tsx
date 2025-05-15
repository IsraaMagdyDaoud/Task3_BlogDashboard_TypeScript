import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserState, UserStats } from "../../types";

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

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any>) => {
      state.currentUser = action.payload;
    },
    updateUserStats: (state, action: PayloadAction<UserStats>) => {
      state.userStats = action.payload;
    },
  },
});

export const { setUser, updateUserStats } = userSlice.actions;
export default userSlice.reducer;
