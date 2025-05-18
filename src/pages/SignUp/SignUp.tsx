import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { signUp } from "../../redux/slices/authSlice";
import styles from "./SignUp.module.css";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { SignUpFormData } from "types";

/**
 * SignUp component - Handles user registration including form validation,
 * error handling, and user redirection upon success.
 *
 * @returns {JSX.Element}
 */
export default function SignUp() {
  /**
   * Stores the form input values
   */
  const [formData, setFormData] = useState<SignUpFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [validationError, setValidationError] = useState<string>("");
  const { status, error, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  /**
   * Redirect user to dashboard if already logged in
   */
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  /**
   * Handles input field changes and updates formData state
   * @param {ChangeEvent<HTMLInputElement>} e - The change event from input
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  /**
   * Validates the form input fields
   * @returns {boolean} True if the form is valid, false otherwise
   */
  const validateForm = (): boolean => {
    if (!formData.email.endsWith(".com")) {
      setValidationError("Email not valid must end with .com ");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords do not match");
      return false;
    }

    if (formData.password.length < 6) {
      setValidationError("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  /**
   * Handles form submission and dispatches the signUp action
   * @param {FormEvent<HTMLFormElement>} e - Form submission event
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setValidationError("");

    if (!validateForm()) {
      return;
    }

    dispatch(signUp(formData));
  };

  return (
    <div className={styles.signupContainer}>
      <div className={styles.signupCard}>
        <h1 className={styles.title}>PostPulse</h1>
        <h2 className={styles.subtitle}>Create an Account</h2>

        {(validationError || error) && (
          <div className={styles.errorMessage}>{validationError || error}</div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Enter your name"
            />
          </div>

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
              placeholder="Create a password"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            className={styles.signupButton}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className={styles.loginText}>
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className={styles.loginLink}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
