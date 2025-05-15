import { configureStore } from "@reduxjs/toolkit";
import postReducer from "./slices/postSlice";
import userReducer from "./slices/userSlice";
import authReducer from "./slices/authSlice";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import type { RootState } from "types";

export const store = configureStore({
  reducer: {
    posts: postReducer,
    user: userReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "posts/createPost/fulfilled",
          "posts/updatePost/fulfilled",
          "posts/fetchPost/fulfilled",
        ],
        ignorePaths: ["posts.posts.createdAt", "posts.posts.updatedAt"],
      },
    }),
});
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
