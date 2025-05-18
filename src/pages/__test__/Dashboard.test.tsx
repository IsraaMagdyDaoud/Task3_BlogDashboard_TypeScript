import { render, screen } from "@testing-library/react";

import Dashboard from "../Dashboard/Dashboard";
import { fetchPosts } from "../../redux/thunks/postThunks";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { updateUserStats } from "../../redux/slices/userSlice";

jest.mock("../../redux/store", () => ({
  useAppDispatch: jest.fn().mockReturnValue(jest.fn()),
  useAppSelector: jest.fn(),
}));

jest.mock("../../redux/thunks/postThunks", () => ({
  fetchPosts: jest.fn(),
}));

jest.mock("../../components/UserInfo/UserInfo.tsx", () => ({
  __esModule: true,
  default: ({ user }: { user: any }) => (
    <div data-testid="user-info">{user?.name}</div>
  ),
}));

describe("Dashboard Component", () => {
  const mockUseAppSelector = useAppSelector as jest.Mock;
  const mockUseAppDispatch = useAppDispatch as jest.Mock;
  const mockDispatch = jest.fn();
  const mockFetchPosts = fetchPosts as jest.MockedFunction<typeof fetchPosts>;

  const mockUser = {
    uid: "user1",
    name: "Test User",
    email: "test@example.com",
    createdAt: "2023-01-01T00:00:00.000Z",
  };

  const mockPosts = [
    {
      id: "post1",
      title: "Published Post",
      status: "published",
      authorId: "user1",
      updatedAt: { seconds: 1672531200, nanoseconds: 0 },
    },
    {
      id: "post2",
      title: "Draft Post",
      status: "draft",
      authorId: "user1",
      updatedAt: { seconds: 1672617600, nanoseconds: 0 },
    },
  ];

  const mockUserStats = {
    totalPosts: 2,
    publishedPosts: 1,
    draftPosts: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppDispatch.mockReturnValue(mockDispatch);
    mockUseAppSelector.mockImplementation((selector) => {
      const state = {
        auth: { user: mockUser, status: "idle" as const, error: null },
        posts: { posts: mockPosts, status: "idle" as const, error: null },
        user: {
          userStats: mockUserStats,
          currentUser: mockUser,
          status: "idle" as const,
          error: null,
        },
      };
      return selector(state);
    });
  });

  it("renders the dashboard with user information and stats", () => {
    render(<Dashboard />);
    expect(screen.getByText("Dashboard")).toBeTruthy();
    expect(screen.getByText("Profile info")).toBeTruthy();
    expect(screen.getByTestId("user-info")).toBeTruthy();
    expect(screen.getByText("Your Blog")).toBeTruthy();
    expect(screen.getByText("Total Posts")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
    const elementClass = screen.getByTestId("published-stst").innerHTML;
    expect(elementClass).toContain("Published");
    expect(elementClass).toContain("1");
    expect(screen.getByText("Drafts")).toBeTruthy();
    const elementDraft = screen.getByTestId("published-stst").innerHTML;
    expect(elementDraft).toContain("1");
    expect(screen.getByText("Recent Activity")).toBeTruthy();
    expect(screen.getByText("Published Post")).toBeTruthy();
    expect(screen.getByText("Draft Post")).toBeTruthy();
  });

  it("fetches posts when user is logged in", () => {
    render(<Dashboard />);
    expect(mockFetchPosts).toHaveBeenCalledWith("user1");
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("displays no recent activity when posts array is empty", () => {
    mockUseAppSelector.mockImplementation((selector) => {
      const state = {
        auth: { user: mockUser },
        posts: { posts: [] },
        user: {
          userStats: { totalPosts: 0, publishedPosts: 0, draftPosts: 0 },
        },
      };
      return selector(state);
    });
    render(<Dashboard />);
    expect(screen.getByText("No recent activity")).toBeTruthy();
  });

  it("calls dispatch with updateUserStats action", () => {
    render(<Dashboard />);
    expect(mockDispatch).toHaveBeenCalled();
    const dispatchCalls = mockDispatch.mock.calls;
    const updateStatsCall = dispatchCalls.find(
      (call) => call[0] && call[0].type === updateUserStats.type
    );
    const expectedStats = {
      totalPosts: 2,
      publishedPosts: 1,
      draftPosts: 1,
    };
    expect(updateStatsCall).toBeDefined();
    if (updateStatsCall) {
      expect(updateStatsCall[0].payload).toEqual(expectedStats);
    }
  });

  it("handles user without a name by using email prefix", () => {
    mockUseAppSelector.mockImplementation((selector) => {
      const userWithoutName = {
        uid: "user1",
        email: "test@example.com",
        createdAt: "2023-01-01T00:00:00.000Z",
      };
      const state = {
        auth: { user: userWithoutName },
        posts: { posts: mockPosts },
        user: { userStats: mockUserStats },
      };
      return selector(state);
    });
    render(<Dashboard />);
    expect(screen.getByTestId("user-info").innerHTML).toContain("test");
  });
});
