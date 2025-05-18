import React, { ChangeEvent, FormEvent, useState } from "react";
import styles from "./PostForm.module.css";
import { PostData, FormError, PostFormProps } from "../../types";

interface FormData extends PostData {
  publish: boolean;
}

/**
 * PostForm component - Renders a form for creating or editing a blog post.
 *
 * @component
 * @param {PostFormProps} props - Component props
 * @param {Function} props.onSubmit - Callback to handle form submission
 * @param {PostData} [props.initialData] - Optional initial data for editing a post
 * @returns {JSX.Element} Rendered form element
 */
export default function PostForm({
  onSubmit,
  initialData = {},
}: PostFormProps) {
  const [formData, setFormData] = useState<FormData>({
    title: initialData.title || "",
    content: initialData.content || "",
    publish: initialData.status === "published",
    authorId: "",
  });

  const [errors, setErrors] = useState<FormError>({});

  /**
   * Handle form input changes and update local state.
   *
   * @param {ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The change event
   */
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (errors[name as keyof FormError]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  /**
   * Validate the form fields.
   *
   * @returns {boolean} Whether the form is valid
   */
  const validateForm = (): boolean => {
    const newErrors: FormError = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission.
   *
   * @param {FormEvent<HTMLFormElement>} e - The form submit event
   */
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label htmlFor="title" className={styles.label}>
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
          placeholder="Enter post title"
        />
        {errors.title && <p className={styles.errorText}>{errors.title}</p>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="content" className={styles.label}>
          Content
        </label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          className={`${styles.textarea} ${
            errors.content ? styles.inputError : ""
          }`}
          placeholder="Write your post content here..."
          rows={10}
        />
        {errors.content && <p className={styles.errorText}>{errors.content}</p>}
      </div>

      <div className={styles.formGroup}>
        <div className={styles.checkboxGroup}>
          <input
            type="checkbox"
            id="publish"
            name="publish"
            checked={formData.publish}
            onChange={handleChange}
            className={styles.checkbox}
          />
          <label htmlFor="publish" className={styles.checkboxLabel}>
            Publish immediately
          </label>
        </div>
      </div>

      <div className={styles.buttonGroup}>
        <button type="submit" className={styles.submitButton}>
          {initialData.id ? "Update Post" : "Create Post"}
        </button>
      </div>
    </form>
  );
}
