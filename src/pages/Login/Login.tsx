/**
 * @fileoverview Login page that handles user authentication
 * Manages login form state and dispatches login actions
 */
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { signIn } from "../../redux/slices/authSlice";
import styles from "./Login.module.css";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { LoginFormData } from "types";

/**
 * Login component that handles user authentication
 * Provides a form for email and password input and dispatchs login action
 * @returns {JSX.Element}
 */
export default function Login() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const { status, error, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  /**
   * Handles input changes in the login dorm
   * Updates form state with new values
   *
   * @param {ChangeEvent<HTMLInputElement>} e
   * @returns {void}
   *
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  /**
   * Handles form submission for login
   * Prevents default form behavior and dispatches login form
   *
   * @async
   * @param {FormEvent<HTMLFormElement>} e
   * @returns {Promise<void>}
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    dispatch(signIn(formData));
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>PostPulse</h1>
        <h2 className={styles.subtitle}>Login </h2>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Enter your email"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className={styles.loginButton}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className={styles.signupText}>
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/signup")}
            className={styles.signupLink}
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
