import { TextEncoder } from "util";
global.TextEncoder = TextEncoder;
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { BrowserRouter } from "react-router-dom";
import Login from "../Login/Login";
import { signIn } from "../../redux/slices/authSlice";
import "@testing-library/jest-dom";

const mockDispatch = jest.fn();
jest.mock("../../redux/store.tsx", () => ({
  ...jest.requireActual("../../redux/store.tsx"),
  useAppDispatch: () => mockDispatch,
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../redux/slices/authSlice", () => ({
  signIn: jest.fn(),
}));

describe("Login Component", () => {
  const renderLogin = (initialState = {}) => {
    const store = configureStore({
      reducer: {
        auth: (state = initialState) => state,
      },
      preloadedState: { auth: initialState },
    });

    return render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders Login form correctly", () => {
    renderLogin({ user: null, status: "idle", error: null });
    expect(screen.getByText("PostPulse")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Sign In/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account?/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Sign Up/i })
    ).toBeInTheDocument();
  });

  test("updates form data on input change", () => {
    renderLogin({ user: null, status: "idle", error: null });
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  test("submits the form with correct data", async () => {
    renderLogin({ user: null, status: "idle", error: null });
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole("button", { name: /Sign In/i });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  test("displays error from Redux state", () => {
    renderLogin({ user: null, status: "failed", error: "Invalid credentials" });
    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });

  test("navigates to dashboard when user is authenticated", async () => {
    renderLogin({
      user: { uid: "123", email: "test@example.com" },
      status: "succeeded",
      error: null,
    });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  test("navigates to signup page when signup link is clicked", () => {
    renderLogin({ user: null, status: "idle", error: null });
    fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/signup");
  });
});
