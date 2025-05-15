import React from "react";
import {
  Navigate,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import {
  Dashboard,
  Login,
  NewPost,
  SignUp,
  Posts,
  EditPost,
} from "./pages/index";
import { Layout, ProtectedRoute } from "./components/index";
import AuthProvider from "./redux/Provider/AuthProvider";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <Layout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          {
            path: "dashboard",
            element: <Dashboard />,
          },
          {
            path: "posts",
            element: <Posts />,
          },
          {
            path: "new-post",
            element: <NewPost />,
          },
          {
            path: "edit-post/:postId",
            element: <EditPost />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);
function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </Provider>
  );
}
export default App;
