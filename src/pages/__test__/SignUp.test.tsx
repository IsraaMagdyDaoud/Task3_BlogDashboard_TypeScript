import { TextEncoder } from "util";
global.TextEncoder = TextEncoder;
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import SignUp from "../SignUp/SignUp";
import { signUp } from "../../redux/slices/authSlice";
import "@testing-library/jest-dom";
import { useAppDispatch } from "redux/store";

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
  signUp: jest.fn(),
}));

describe("SignUp Component", () => {
  const renderSignUp = (initialState = {}) => {
    const store = configureStore({
      reducer: {
        auth: (state = initialState) => state,
      },
      preloadedState: { auth: initialState },
    });

    return render(
      <Provider store={store}>
        <MemoryRouter>
          <SignUp />
        </MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders SignUp form correctly", () => {
    renderSignUp({ user: null, status: "idle", error: null });
    expect(screen.getByText("Create an Account")).toBeTruthy();
    expect(screen.getByLabelText(/Full Name/i)).toBeTruthy();
    expect(screen.getByLabelText(/Email/i)).toBeTruthy();
    expect(screen.getByLabelText(/^Password$/i)).toBeTruthy();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Sign Up/i })).toBeTruthy();
    expect(screen.getByText(/Already have an account?/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Sign In/i })).toBeTruthy();
  });

  test("validates form input correctly", async () => {
    renderSignUp({ user: null, status: "idle", error: null });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.org" },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "Test User" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /Sign Up/i }));
    expect(
      await screen.findByText(/Email not valid must end with .com/i)
    ).toBeInTheDocument();
    expect(signUp).not.toHaveBeenCalled();
  });

  test("validates password length correctly", async () => {
    renderSignUp({ user: null, status: "idle", error: null });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "12345" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "12345" },
    });
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "Test User" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /Sign Up/i }));
    expect(
      await screen.findByText(/Password must be at least 6 characters/i)
    ).toBeTruthy();
    expect(signUp).not.toHaveBeenCalled();
  });

  test("validates password matching correctly", async () => {
    renderSignUp({ user: null, status: "idle", error: null });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "differentpassword" },
    });
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "Test User" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /Sign Up/i }));
    expect(await screen.findByText(/Passwords do not match/i)).toBeTruthy();
    expect(signUp).not.toHaveBeenCalled();
  });

  test("submits form with valid data", async () => {
    renderSignUp({ user: null, status: "idle", error: null });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "Test User" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /Sign Up/i }));
    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
        name: "Test User",
      });
    });
  });

  test("navigates to dashboard when user is authenticated", async () => {
    renderSignUp({
      user: { uid: "123", email: "test@example.com" },
      status: "succeeded",
      error: null,
    });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });
});
