import { configureStore } from "@reduxjs/toolkit";
import {
  fetchPosts,
  createPost,
  deletePost,
  updatePost,
} from "../../thunks/postThunks";
import postReducer from "../../slices/postSlice";
import { PostData, UpdatedPostParams } from "../../../types";

jest.mock("../../../firebase/firebase", () => ({
  db: {},
}));

jest.mock("firebase/firestore", () => {
  const originalModule = jest.requireActual("firebase/firestore");

  const mockQuerySnapshot = {
    forEach: jest.fn((callback) => {
      callback({
        id: "post1",
        data: () => ({
          title: "Test Post 1",
          status: "published",
          authorId: "user1",
          content: "Test content 1",
        }),
      });
      callback({
        id: "post2",
        data: () => ({
          title: "Test Post 2",
          status: "draft",
          authorId: "user1",
          content: "Test content 2",
        }),
      });
    }),
  };

  return {
    ...originalModule,
    collection: jest.fn(() => "posts-collection"),
    getDocs: jest.fn().mockResolvedValue(mockQuerySnapshot),
    addDoc: jest.fn().mockResolvedValue({ id: "new-post-id" }),
    deleteDoc: jest.fn().mockResolvedValue(undefined),
    updateDoc: jest.fn().mockResolvedValue(undefined),
    doc: jest.fn(() => "post-doc-reference"),
    query: jest.fn((collectionRef, whereClause) => "filtered-query"),
    where: jest.fn(() => "where-clause"),
    serverTimestamp: jest.fn(() => ({
      seconds: 1234567890,
      nanoseconds: 123456789,
    })),
  };
});

const setupStore = () => {
  return configureStore({
    reducer: {
      posts: postReducer,
    },
  });
};

describe("Post Thunks", () => {
  let store: ReturnType<typeof setupStore>;
  beforeEach(() => {
    store = setupStore();
    jest.clearAllMocks();
  });

  it("should fetch posts without userId filter", async () => {
    const { collection, getDocs, query, where } = require("firebase/firestore");
    await store.dispatch(fetchPosts(undefined));
    expect(collection).toHaveBeenCalledWith(expect.anything(), "posts");
    expect(query).not.toHaveBeenCalled();
    expect(getDocs).toHaveBeenCalled();
    const state = store.getState();
    expect(state.posts.posts.length).toBe(2);
    expect(state.posts.status).toBe("succeeded");
  });

  it("should fetch posts with userId filter", async () => {
    const { collection, getDocs, query, where } = require("firebase/firestore");
    const userId = "user1";
    await store.dispatch(fetchPosts(userId));
    expect(collection).toHaveBeenCalledWith(expect.anything(), "posts");
    expect(query).toHaveBeenCalled();
    expect(where).toHaveBeenCalledWith("authorId", "==", userId);
    expect(getDocs).toHaveBeenCalled();
    const state = store.getState();
    expect(state.posts.posts.length).toBe(2);
    expect(state.posts.status).toBe("succeeded");
  });

  it("should create a post and update store", async () => {
    const {
      collection,
      addDoc,
      serverTimestamp,
    } = require("firebase/firestore");
    const postData: PostData = {
      title: "New Test Post",
      content: "New test content",
      authorId: "user1",
      status: "draft",
    };
    await store.dispatch(createPost(postData));
    expect(collection).toHaveBeenCalledWith(expect.anything(), "posts");
    expect(addDoc).toHaveBeenCalledWith(
      "posts-collection",
      expect.objectContaining({
        ...postData,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      })
    );
    expect(serverTimestamp).toHaveBeenCalledTimes(2);
    const state = store.getState();
    expect(state.posts.posts.length).toBe(1);
    expect(state.posts.posts[0].id).toBe("new-post-id");
  });

  it("should delete a post and update store", async () => {
    const { doc, deleteDoc } = require("firebase/firestore");
    const postId = "post-to-delete";
    await store.dispatch(
      createPost({
        title: "Post to delete",
        content: "This post will be deleted",
        authorId: "user1",
      })
    );
    await store.dispatch(deletePost(postId));
    expect(doc).toHaveBeenCalledWith(expect.anything(), "posts", postId);
    expect(deleteDoc).toHaveBeenCalledWith("post-doc-reference");
    const state = store.getState();
    expect(state.posts.posts.some((post) => post.id === postId)).toBe(false);
  });

  it("should update a post and update store", async () => {
    const { doc, updateDoc, serverTimestamp } = require("firebase/firestore");
    await store.dispatch(fetchPosts(undefined));
    const updatedParams: UpdatedPostParams = {
      postId: "post1",
      postData: {
        title: "Updated Title",
        content: "Updated content",
        authorId: "user1",
        publish: true,
      },
    };
    const mockUpdatedPost = {
      id: "post1",
      title: "Updated Title",
      content: "Updated contnet",
      autherId: "user1",
      status: "published",
      createdAt: { seconds: 1234567890, nanoseconds: 123456789 },
      updatedAt: { seconds: 1234567890, nanoseconds: 123456789 },
    };
    const thunkResult = (await store.dispatch(
      updatePost(updatedParams)
    )) as any;
    thunkResult.payload = mockUpdatedPost;
    expect(doc).toHaveBeenCalledWith(expect.anything(), "posts", "post1");
    expect(updateDoc).toHaveBeenCalledWith(
      "post-doc-reference",
      expect.objectContaining({
        title: "Updated Title",
        content: "Updated content",
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
        status: "published",
      })
    );
    expect(serverTimestamp).toHaveBeenCalledTimes(2);
    const state = store.getState();
    const updatedPost = state.posts.posts.find((post) => post.id === "post1");
    expect(updatedPost).toBeDefined();
    expect(updatedPost?.title).toBe("Updated Title");
    expect(updatedPost?.content).toBe("Updated content");
    expect(updatedPost?.status).toBe("published");
  });

  it("should update a post with draft status when publish is false", async () => {
    const { updateDoc } = require("firebase/firestore");
    const updatedParams: UpdatedPostParams = {
      postId: "post1",
      postData: {
        title: "Draft Post",
        content: "Draft content",
        authorId: "user1",
        publish: false,
      },
    };
    await store.dispatch(updatePost(updatedParams));
    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        status: "draft",
      })
    );
  });

  it("should handle errors when fetching posts", async () => {
    const { getDocs } = require("firebase/firestore");
    getDocs.mockRejectedValueOnce(new Error("Fetch error"));
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    try {
      await store.dispatch(fetchPosts(undefined)).unwrap();
      fail("Expected fetchPosts to throw an error");
    } catch (error) {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching posts:",
        expect.any(Error)
      );
      expect(store.getState().posts.status).toBe("failed");
    }
    consoleSpy.mockRestore();
  });

  it("should handle errors when creating a post", async () => {
    const { addDoc } = require("firebase/firestore");
    addDoc.mockRejectedValueOnce(new Error("Creation error"));
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    const postData: PostData = {
      title: "Failed Post",
      content: "This post creation will fail",
      authorId: "user1",
    };
    try {
      await store.dispatch(createPost(postData)).unwrap();
      fail("Expected createPost to throw an error");
    } catch (error) {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error creating post:",
        expect.any(Error)
      );
    }
    consoleSpy.mockRestore();
  });

  it("should handle errors when deleting a post", async () => {
    const { deleteDoc } = require("firebase/firestore");
    deleteDoc.mockRejectedValueOnce(new Error("Deletion error"));
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    try {
      await store.dispatch(deletePost("post-id")).unwrap();
      fail("Expected deletePost to throw an error");
    } catch (error) {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error deleting post:",
        expect.any(Error)
      );
    }
    consoleSpy.mockRestore();
  });

  it("should handle errors when updating a post", async () => {
    const { updateDoc } = require("firebase/firestore");
    updateDoc.mockRejectedValueOnce(new Error("Update error"));
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    const updatedParams: UpdatedPostParams = {
      postId: "post1",
      postData: {
        title: "Failed Update",
        content: "This update will fail",
        authorId: "user1",
      },
    };
    const result = await store.dispatch(updatePost(updatedParams));
    expect(result.type).toBe(updatePost.rejected.type);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error updating post:",
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });
});
