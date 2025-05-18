import postReducer, {
  initialState as postInitialState,
} from "../../slices/postSlice";
import {
  fetchPosts,
  createPost,
  deletePost,
  updatePost,
} from "../../thunks/postThunks";
import { Post } from "../../../types";

const mockPosts: Post[] = [
  {
    id: "post1",
    title: "Test Post 1",
    status: "published",
    authorId: "user1",
    content: "Test content 1",
  },
  {
    id: "post2",
    title: "Test Post 2",
    status: "draft",
    authorId: "user1",
    content: "Test content 2",
  },
];

describe("Post Slice", () => {
  it("should return the initial state", () => {
    const initialState = postReducer(undefined, { type: "unknown" });
    expect(initialState).toEqual({
      posts: [],
      status: "idle",
      error: null,
    });
  });

  it("should handle pending state when fetching posts", () => {
    const action = { type: fetchPosts.pending.type };
    const state = postReducer(postInitialState, action);
    expect(state.status).toEqual("loading");
  });

  it("should handle successful posts fetch", () => {
    const action = {
      type: fetchPosts.fulfilled.type,
      payload: mockPosts,
    };
    const state = postReducer(postInitialState, action);
    expect(state.status).toEqual("succeeded");
    expect(state.posts).toEqual(mockPosts);
    expect(state.error).toBeNull();
  });

  it("should handle failed posts fetch", () => {
    const errorMessage = "Failed to fetch posts";
    const action = {
      type: fetchPosts.rejected.type,
      error: { message: errorMessage },
    };
    const state = postReducer(postInitialState, action);
    expect(state.status).toEqual("failed");
    expect(state.error).toEqual(errorMessage);
  });
  //////////////////////////////////////////////////////////////////////
  it("should add a new post when creation succeeds", () => {
    const initialState = {
      ...postInitialState,
      posts: [...mockPosts],
    };
    const newPost: Post = {
      id: "post3",
      title: "Test Post 3",
      status: "draft",
      authorId: "user1",
      content: "Test content 3",
    };
    const action = {
      type: createPost.fulfilled.type,
      payload: newPost,
    };
    const state = postReducer(initialState, action);
    expect(state.posts.length).toEqual(3);
    expect(state.posts).toContainEqual(newPost);
  });

  it("should update an existing post when update succeeds", () => {
    const initialState = {
      ...postInitialState,
      posts: [...mockPosts],
    };
    const updatedPost: Post = {
      ...mockPosts[0],
      title: "Updated Title",
      content: "Updated content",
    };
    const action = {
      type: updatePost.fulfilled.type,
      payload: updatedPost,
    };
    const state = postReducer(initialState, action);
    expect(state.posts.length).toEqual(2);
    expect(state.posts.find((post) => post.id === "post1")?.title).toEqual(
      "Updated Title"
    );
    expect(state.status).toEqual("succeeded");
  });

  it("should not modify state when updating non-existent post", () => {
    const initialState = {
      ...postInitialState,
      posts: [...mockPosts],
    };
    const nonExistentPost: Post = {
      id: "non-existent-id",
      title: "Non-existent Post",
      status: "published",
      authorId: "user1",
      content: "This post doesn't exist",
    };
    const action = {
      type: updatePost.fulfilled.type,
      payload: nonExistentPost,
    };
    const state = postReducer(initialState, action);
    expect(state.posts.length).toEqual(2);
    expect(state.posts).not.toContainEqual(nonExistentPost);
    expect(state.status).toEqual("succeeded");
  });

  it("should remove a post when deletion succeeds", () => {
    const initialState = {
      ...postInitialState,
      posts: [...mockPosts],
    };
    const action = {
      type: deletePost.fulfilled.type,
      payload: "post1",
    };
    const state = postReducer(initialState, action);
    expect(state.posts.length).toEqual(1);
    expect(state.posts.find((post) => post.id === "post1")).toBeUndefined();
  });
});
