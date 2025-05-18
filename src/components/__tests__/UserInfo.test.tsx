import { render, screen } from "@testing-library/react";
import UserInfo from "../UserInfo/UserInfo";
import { UserProfile } from "../../types";

describe("UserInfo Component", () => {
  const mockUser: UserProfile = {
    id: "user123",
    name: "Test User",
    email: "test@example.com",
    joinDate: "1/1/2023",
  };

  test("renders user information correctly", () => {
    render(<UserInfo user={mockUser} />);

    expect(screen.getByText(mockUser.name)).toBeTruthy();
    expect(screen.getByText(`Email: ${mockUser.email}`)).toBeTruthy();
    expect(screen.getByText(`Member since: ${mockUser.joinDate}`)).toBeTruthy();
  });

  test("renders loading state when user is null", () => {
    render(<UserInfo user={null} />);

    expect(screen.getByText("Loading user information...")).toBeTruthy();
  });
});
