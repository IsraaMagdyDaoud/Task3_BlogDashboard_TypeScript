import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { signIn } from "../../redux/slices/authSlice";
import styles from "./Login.module.css";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { LoginFormData } from "types";

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

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

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
