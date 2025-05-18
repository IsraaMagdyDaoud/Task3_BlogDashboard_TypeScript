import { render, screen, fireEvent } from "@testing-library/react";
import Pagination from "../Pagination/Pagination";
import "@testing-library/jest-dom";

describe("Pagination", () => {
  const mockOnPageChange = jest.fn();

  beforeEach(() => {
    mockOnPageChange.mockClear();
  });

  test("renders nothing when totalPages is 1", () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={1}
        onPageChange={mockOnPageChange}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  test("renders pagination with correct buttons for small number of pages", () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={3}
        onPageChange={mockOnPageChange}
      />
    );

    // Check page buttons
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();

    // Check navigation buttons
    expect(screen.getByText("Previous")).toBeDisabled();
    expect(screen.getByText("Next")).not.toBeDisabled();
  });

  test("renders pagination with ellipsis for many pages", () => {
    render(
      <Pagination
        currentPage={5}
        totalPages={10}
        onPageChange={mockOnPageChange}
      />
    );

    // Check first and last page buttons
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();

    // Check surrounding page buttons (4, 5, 6)
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();

    // Check ellipsis
    const ellipses = screen.getAllByText("...");
    expect(ellipses).toHaveLength(2);
  });

  test("handles Next button click correctly", () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={3}
        onPageChange={mockOnPageChange}
      />
    );

    fireEvent.click(screen.getByText("Next"));
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  test("handles Previous button click correctly", () => {
    render(
      <Pagination
        currentPage={2}
        totalPages={3}
        onPageChange={mockOnPageChange}
      />
    );

    fireEvent.click(screen.getByText("Previous"));
    expect(mockOnPageChange).toHaveBeenCalledWith(1);
  });

  test("handles page number click correctly", () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={3}
        onPageChange={mockOnPageChange}
      />
    );

    fireEvent.click(screen.getByText("3"));
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });

  test("disables the current page button", () => {
    render(
      <Pagination
        currentPage={2}
        totalPages={3}
        onPageChange={mockOnPageChange}
      />
    );

    // Current page button should be disabled
    const pageButtons = screen.getAllByRole("button");
    const page2Button = pageButtons.find(
      (button) => button.textContent === "2"
    );
    expect(page2Button).toBeDisabled();
  });

  test("disables Next button on last page", () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={3}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByText("Next")).toBeDisabled();
  });

  test("applies active class to current page button", () => {
    render(
      <Pagination
        currentPage={2}
        totalPages={3}
        onPageChange={mockOnPageChange}
      />
    );

    const pageButtons = screen.getAllByRole("button");
    const page2Button = pageButtons.find(
      (button) => button.textContent === "2"
    );
    expect(page2Button).toHaveClass("active");
  });
});
