import { configureStore } from "@reduxjs/toolkit";
import userReducer, { setUser, updateUserStats } from "../userSlice";
import { UserStats } from "../../../types";

describe("User Slice", () => {
  const createMockStore = (preloadedState = {}) => {
    return configureStore({
      reducer: { user: userReducer },
      preloadedState,
    });
  };

  test("should handle initial state", () => {
    const store = createMockStore();
    expect(store.getState().user).toEqual({
      currentUser: null,
      userStats: {
        totalPosts: 0,
        publishedPosts: 0,
        draftPosts: 0,
      },
      status: "idle",
      error: null,
    });
  });

  test("should handle setUser", () => {
    const mockUser = {
      uid: "123",
      email: "test@example.com",
      name: "Test User",
    };

    const store = createMockStore();
    store.dispatch(setUser(mockUser));

    expect(store.getState().user.currentUser).toEqual(mockUser);
  });

  test("should handle updateUserStats", () => {
    const mockStats: UserStats = {
      totalPosts: 10,
      publishedPosts: 7,
      draftPosts: 3,
    };

    const store = createMockStore();
    store.dispatch(updateUserStats(mockStats));

    expect(store.getState().user.userStats).toEqual(mockStats);
  });

  test("should keep other state properties unchanged when updating user", () => {
    const initialState = {
      user: {
        currentUser: null,
        userStats: {
          totalPosts: 5,
          publishedPosts: 2,
          draftPosts: 3,
        },
        status: "idle",
        error: null,
      },
    };

    const mockUser = {
      uid: "123",
      email: "test@example.com",
      name: "Test User",
    };

    const store = createMockStore(initialState);
    store.dispatch(setUser(mockUser));

    expect(store.getState().user).toEqual({
      currentUser: mockUser,
      userStats: {
        totalPosts: 5,
        publishedPosts: 2,
        draftPosts: 3,
      },
      status: "idle",
      error: null,
    });
  });

  test("should keep other state properties unchanged when updating stats", () => {
    const mockUser = {
      uid: "123",
      email: "test@example.com",
      name: "Test User",
    };

    const initialState = {
      user: {
        currentUser: mockUser,
        userStats: {
          totalPosts: 0,
          publishedPosts: 0,
          draftPosts: 0,
        },
        status: "idle",
        error: null,
      },
    };

    const mockStats: UserStats = {
      totalPosts: 10,
      publishedPosts: 7,
      draftPosts: 3,
    };

    const store = createMockStore(initialState);
    store.dispatch(updateUserStats(mockStats));

    expect(store.getState().user).toEqual({
      currentUser: mockUser,
      userStats: mockStats,
      status: "idle",
      error: null,
    });
  });
});
