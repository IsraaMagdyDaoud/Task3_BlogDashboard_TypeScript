import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../redux/store";

export default function ProtectedRoute() {
  const { user, status } = useAppSelector((state) => state.auth);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" />;
}
