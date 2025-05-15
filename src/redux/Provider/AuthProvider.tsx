import { useEffect, ReactNode } from "react";
import { checkAuthState, setUser, clearUser } from "../slices/authSlice";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useAppDispatch } from "../store";

interface AuthProviderProps {
  children: ReactNode;
}
export default function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkAuthState());

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          try {
            const userDocRef = doc(db, "users", firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);

            const userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              ...(userDoc.exists()
                ? userDoc.data()
                : { name: firebaseUser.email?.split("@")[0] }),
              createdAt:
                firebaseUser.metadata.creationTime || new Date().toISOString(),
            };

            localStorage.setItem("user", JSON.stringify(userData));

            dispatch(setUser(userData));
          } catch (error) {
            console.error("Error getting user data:", error);
          }
        } else {
          localStorage.removeItem("user");
          dispatch(clearUser());
        }
      }
    );

    return () => unsubscribe();
  }, [dispatch]);
  return <>{children}</>;
}
