import { TextEncoder } from "util";
global.TextEncoder = TextEncoder;
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import PostCard from "../PostCard/PostCard";
import { BrowserRouter } from "react-router-dom";
import { Post } from "types";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

describe("PostCard", () => {
  const mockPost: Post = {
    id: "user123",
    title: "Test Post Title",
    content: "Test post content",
    authorName: "user1",
    status: "published",
    createdAt: { seconds: 1620000000 },
  };

  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders post information correctly", () => {
    render(
      <BrowserRouter>
        <PostCard post={mockPost} onDelete={mockOnDelete} />
      </BrowserRouter>
    );

    expect(screen.getByText("Test Post Title")).toBeInTheDocument();

    expect(screen.getByText("Test post content")).toBeInTheDocument();

    expect(screen.getByText(/user1/)).toBeInTheDocument();

    expect(screen.getByText("published")).toBeInTheDocument();

    const dateElements = screen.getAllByText(/\d+\/\d+\/\d+/);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  test("truncates long content", () => {
    const longContentPost = {
      ...mockPost,
      content: "A".repeat(200),
    };

    render(
      <BrowserRouter>
        <PostCard post={longContentPost} onDelete={mockOnDelete} />
      </BrowserRouter>
    );

    expect(screen.getByText(/A+\.\.\./)).toBeInTheDocument();
  });

  test("applies correct class for published status", () => {
    render(
      <BrowserRouter>
        <PostCard post={mockPost} onDelete={mockOnDelete} />
      </BrowserRouter>
    );

    const statusElement = screen.getByText("published");
    expect(statusElement).toHaveClass("published");
  });

  test("applies correct class for draft status", () => {
    const draftPost: Post = {
      ...mockPost,
      status: "draft",
    };

    render(
      <BrowserRouter>
        <PostCard post={draftPost} onDelete={mockOnDelete} />
      </BrowserRouter>
    );

    const statusElement = screen.getByText("draft");
    expect(statusElement).toHaveClass("draft");
  });

  test("calls onDelete when delete button is clicked", () => {
    render(
      <BrowserRouter>
        <PostCard post={mockPost} onDelete={mockOnDelete} />
      </BrowserRouter>
    );

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  test("displays N/A when timestamp is missing", () => {
    const noTimestampPost = {
      ...mockPost,
      createdAt: undefined,
    };

    render(
      <BrowserRouter>
        <PostCard post={noTimestampPost} onDelete={mockOnDelete} />
      </BrowserRouter>
    );

    expect(screen.getByText("N/A")).toBeInTheDocument();
  });
});
