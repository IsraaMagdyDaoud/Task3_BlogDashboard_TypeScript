import { configureStore } from "@reduxjs/toolkit";
import authReducer, {
  signIn,
  signUp,
  signOut,
  checkAuthState,
  setUser,
  clearUser,
} from "../authSlice";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { setDoc, getDoc } from "firebase/firestore";
import { User } from "../../../types";

jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  getAuth: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
}));

jest.mock("../../../firebase/firebase", () => ({
  auth: {},
  db: {},
}));

describe("Auth Slice", () => {
  const createMockStore = (preloadedState = {}) => {
    return configureStore({
      reducer: { auth: authReducer },
      preloadedState,
    });
  };

  let mockLocalStorage: Record<string, string> = {};
  beforeEach(() => {
    mockLocalStorage = {};
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn((key) => mockLocalStorage[key] || null),
        setItem: jest.fn((key, value) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: jest.fn((key) => {
          delete mockLocalStorage[key];
        }),
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("reducers", () => {
    test("should handle initial state", () => {
      const store = createMockStore();
      expect(store.getState().auth).toEqual({
        user: null,
        status: "idle",
        error: null,
      });
    });

    test("should handle checkAuthState", () => {
      const user: User = {
        uid: "123",
        email: "test@example.com",
        createdAt: "2023-01-01",
      };
      mockLocalStorage["user"] = JSON.stringify(user);

      const store = createMockStore();
      store.dispatch(checkAuthState());

      expect(store.getState().auth.user).toEqual(user);
    });

    test("should handle setUser", () => {
      const user: User = {
        uid: "123",
        email: "test@example.com",
        createdAt: "2023-01-01",
      };

      const store = createMockStore();
      store.dispatch(setUser(user));

      expect(store.getState().auth).toEqual({
        user,
        status: "succeeded",
        error: null,
      });
    });

    test("should handle clearUser", () => {
      const initialState = {
        auth: {
          user: {
            uid: "123",
            email: "test@example.com",
            createdAt: "2023-01-01",
          },
          status: "succeeded",
          error: null,
        },
      };

      const store = createMockStore(initialState);
      store.dispatch(clearUser());

      expect(store.getState().auth).toEqual({
        user: null,
        status: "idle",
        error: null,
      });
    });
  });

  describe("async thunks", () => {
    describe("signIn", () => {
      test("should sign in successfully", async () => {
        const mockFirebaseUser = {
          uid: "123",
          email: "test@example.com",
          metadata: {
            creationTime: "2023-01-01",
          },
        };

        const mockUserDoc = {
          exists: () => true,
          data: () => ({ name: "Test User" }),
        };

        (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
          user: mockFirebaseUser,
        });

        (getDoc as jest.Mock).mockResolvedValue(mockUserDoc);

        const store = createMockStore();

        await store.dispatch(
          signIn({
            email: "test@example.com",
            password: "password123",
          })
        );

        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          "test@example.com",
          "password123"
        );

        expect(store.getState().auth).toEqual({
          user: {
            uid: "123",
            email: "test@example.com",
            name: "Test User",
            createdAt: "2023-01-01",
          },
          status: "succeeded",
          error: null,
        });

        expect(window.localStorage.setItem).toHaveBeenCalled();
      });

      test("should handle sign in failure", async () => {
        const errorMessage = "Invalid email or password";
        (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(
          new Error(errorMessage)
        );

        const store = createMockStore();

        await store.dispatch(
          signIn({
            email: "test@example.com",
            password: "wrong-password",
          })
        );

        expect(store.getState().auth).toEqual({
          user: null,
          status: "failed",
          error: errorMessage,
        });
      });
    });

    describe("signUp", () => {
      test("should sign up successfully", async () => {
        const mockFirebaseUser = {
          uid: "123",
          email: "newuser@example.com",
          metadata: {
            creationTime: "2023-01-01",
          },
        };

        (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({
          user: mockFirebaseUser,
        });

        (setDoc as jest.Mock).mockResolvedValue(undefined);

        const store = createMockStore();

        await store.dispatch(
          signUp({
            email: "newuser@example.com",
            password: "password123",
            confirmPassword: "password123",
            name: "New User",
          })
        );

        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          "newuser@example.com",
          "password123"
        );

        expect(setDoc).toHaveBeenCalled();

        expect(store.getState().auth.status).toBe("succeeded");
        expect(store.getState().auth.user).toHaveProperty("uid", "123");
        expect(store.getState().auth.user).toHaveProperty(
          "email",
          "newuser@example.com"
        );
        expect(store.getState().auth.user).toHaveProperty("name", "New User");

        expect(window.localStorage.setItem).toHaveBeenCalled();
      });

      test("should reject if passwords do not match", async () => {
        const store = createMockStore();

        await store.dispatch(
          signUp({
            email: "test@example.com",
            password: "password123",
            confirmPassword: "different-password",
            name: "Test User",
          })
        );

        expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
        expect(store.getState().auth).toEqual({
          user: null,
          status: "failed",
          error: "Passwords do not match",
        });
      });

      test("should handle sign up failure", async () => {
        const errorMessage = "Email already in use";
        (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue(
          new Error(errorMessage)
        );

        const store = createMockStore();

        await store.dispatch(
          signUp({
            email: "existing@example.com",
            password: "password123",
            confirmPassword: "password123",
          })
        );

        expect(store.getState().auth).toEqual({
          user: null,
          status: "failed",
          error: errorMessage,
        });
      });
    });

    describe("signOut", () => {
      test("should sign out successfully", async () => {
        (firebaseSignOut as jest.Mock).mockResolvedValue(undefined);

        const initialState = {
          auth: {
            user: {
              uid: "123",
              email: "test@example.com",
              createdAt: "2023-01-01",
            },
            status: "succeeded",
            error: null,
          },
        };

        const store = createMockStore(initialState);

        await store.dispatch(signOut());

        expect(firebaseSignOut).toHaveBeenCalled();
        expect(window.localStorage.removeItem).toHaveBeenCalledWith("user");

        expect(store.getState().auth).toEqual({
          user: null,
          status: "idle",
          error: null,
        });
      });

      test("should handle sign out failure", async () => {
        const errorMessage = "Network error";
        (firebaseSignOut as jest.Mock).mockRejectedValue(
          new Error(errorMessage)
        );

        const initialState = {
          auth: {
            user: {
              uid: "123",
              email: "test@example.com",
              createdAt: "2023-01-01",
            },
            status: "succeeded",
            error: null,
          },
        };

        const store = createMockStore(initialState);

        await store.dispatch(signOut());

        expect(store.getState().auth).toEqual({
          user: {
            uid: "123",
            email: "test@example.com",
            createdAt: "2023-01-01",
          },
          status: "failed",
          error: errorMessage,
        });
      });
    });
  });
});
