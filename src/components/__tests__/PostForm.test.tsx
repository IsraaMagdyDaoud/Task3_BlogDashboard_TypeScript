import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PostForm from "../PostForm/PostForm";
import { Post } from "../../types/index";
import "@testing-library/jest-dom";

describe("PostForm", () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  test("renders the form with empty fields by default", () => {
    render(<PostForm onSubmit={mockOnSubmit} />);
    expect(screen.getByLabelText(/title/i)).toHaveValue("");
    expect(screen.getByLabelText(/content/i)).toHaveValue("");
    expect(screen.getByLabelText(/publish immediately/i)).not.toBeChecked();
    expect(screen.getByRole("button")).toHaveTextContent("Create Post");
  });

  test("renders form with initial data when provided", () => {
    const initialData: Partial<Post> = {
      id: "123",
      title: "Test Title",
      status: "published",
      content: "Test Content",
    };

    render(<PostForm onSubmit={mockOnSubmit} initialData={initialData} />);

    expect(screen.getByLabelText(/title/i)).toHaveValue("Test Title");
    expect(screen.getByLabelText(/content/i)).toHaveValue("Test Content");
    expect(screen.getByLabelText(/publish immediately/i)).toBeChecked();
    expect(screen.getByRole("button")).toHaveTextContent("Update Post");
  });

  test("updates form values when inputs change", async () => {
    render(<PostForm onSubmit={mockOnSubmit} />);

    const titleInput = screen.getByLabelText(/title/i);
    const contentInput = screen.getByLabelText(/content/i);
    const publishCheckbox = screen.getByLabelText(/publish immediately/i);

    await userEvent.type(titleInput, "New Title");
    expect(titleInput).toHaveValue("New Title");

    await userEvent.type(contentInput, "New Content");
    expect(contentInput).toHaveValue("New Content");

    await userEvent.click(publishCheckbox);
    expect(publishCheckbox).toBeChecked();
  });

  test("shows validation errors when form is submitted with empty fields", async () => {
    render(<PostForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole("button", { name: /create post/i });
    await userEvent.click(submitButton);

    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    expect(screen.getByText(/content is required/i)).toBeInTheDocument();

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test("calls onSubmit with correct data when form is valid", async () => {
    render(<PostForm onSubmit={mockOnSubmit} />);

    await userEvent.type(screen.getByLabelText(/title/i), "Test Title");
    await userEvent.type(screen.getByLabelText(/content/i), "Test Content");
    await userEvent.click(screen.getByLabelText(/publish immediately/i));

    await userEvent.click(screen.getByRole("button", { name: /create post/i }));

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: "Test Title",
      content: "Test Content",
      publish: true,
      authorId: "",
    });
  });

  test("clears validation errors when user corrects the input", async () => {
    render(<PostForm onSubmit={mockOnSubmit} />);

    await userEvent.click(screen.getByRole("button", { name: /create post/i }));

    expect(screen.getByText(/title is required/i)).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/title/i), "New Title");

    expect(screen.queryByText(/title is required/i)).not.toBeInTheDocument();

    expect(screen.getByText(/content is required/i)).toBeInTheDocument();
  });
});
