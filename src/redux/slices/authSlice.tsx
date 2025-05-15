import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { AuthState, User, SignInCredentials } from "../../types";

interface SignUpData extends SignInCredentials {
  name?: string;
  confirmPassword: string;
}
const setUserInLocalStorage = (user: User): void => {
  localStorage.setItem("user", JSON.stringify(user));
};

const removeUserFromLocalStorage = (): void => {
  localStorage.removeItem("user");
};

const getUserFromLocalStorage = (): User | null => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};
/////////////////////////////////////////////////////////////////////
export const signIn = createAsyncThunk<
  User,
  SignInCredentials,
  { rejectValue: string }
>("auth/signIn", async (credentials, { rejectWithValue }) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );

    const userDocRef = doc(db, "users", userCredential.user.uid);
    const userDoc = await getDoc(userDocRef);

    const userData: User = {
      uid: userCredential.user.uid,
      email: userCredential.user.email || "",
      ...(userDoc.exists()
        ? userDoc.data()
        : { name: userCredential.user.email?.split("@")[0] }),
      createdAt:
        userCredential.user.metadata.creationTime || new Date().toISOString(),
    };

    setUserInLocalStorage(userData);
    return userData;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to sign in");
  }
});

export const signUp = createAsyncThunk<
  User,
  SignUpData,
  { rejectValue: string }
>("auth/signUp", async (userData, { rejectWithValue }) => {
  try {
    if (userData.password !== userData.confirmPassword) {
      return rejectWithValue("Passwords do not match");
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );

    const userProfile = {
      name: userData.name || userData.email.split("@")[0],
      email: userData.email,
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, "users", userCredential.user.uid), userProfile);

    const fullUserData: User = {
      uid: userCredential.user.uid,
      ...userProfile,
    };

    setUserInLocalStorage(fullUserData);
    return fullUserData;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to sign up");
  }
});

export const signOut = createAsyncThunk<null, void, { rejectValue: string }>(
  "auth/signOut",
  async (_, { rejectWithValue }) => {
    try {
      await firebaseSignOut(auth);

      removeUserFromLocalStorage();
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to sign out");
    }
  }
);
///////////////////////////////////////////////////////////////////////
const handlePending = (state: AuthState) => {
  state.status = "loading";
  state.error = null;
};
const handleRejected = (state: AuthState, action: PayloadAction<any>): void => {
  state.status = "failed";
  state.error = action.payload || "Something went wrong";
};

const initialState: AuthState = {
  user: getUserFromLocalStorage(),
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    checkAuthState: (state) => {
      state.user = getUserFromLocalStorage();
    },

    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.status = "succeeded";
      state.error = null;
    },

    clearUser: (state) => {
      state.user = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(signIn.pending, handlePending)
      .addCase(signIn.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(signIn.rejected, handleRejected)

      .addCase(signUp.pending, handlePending)
      .addCase(signUp.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(signUp.rejected, handleRejected)

      .addCase(signOut.pending, handlePending)
      .addCase(signOut.fulfilled, (state) => {
        state.status = "idle";
        state.user = null;
      })
      .addCase(signOut.rejected, handleRejected);
  },
});

export const { checkAuthState, setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
