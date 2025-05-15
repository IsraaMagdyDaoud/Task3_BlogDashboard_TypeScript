export interface User {
  uid: string;
  name?: string;
  email: string;
  createdAt: string | number | Date;
  [key: string]: any;
}
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  joinDate: string;
}
export interface Post {
  id: string;
  title: string;
  status: "published" | "draft";
  updateAt?: {
    seconds: number;
    nanoseconds: number;
  };
  [key: string]: any;
}

export interface PostData {
  title: string;
  content: string;
  authorId: string;
  status?: string;
  publish?: boolean;
  [key: string]: any;
}

export interface UserStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
}

export interface AuthState {
  user: User | null;
  status: RequestStatus;
  error: string | null;
}
export interface PostsState {
  posts: Post[];
  status: RequestStatus;
  error: string | null;
}
export interface UserState {
  currentUser: any | null;
  userStats: UserStats;
  status: RequestStatus;
  error: string | null;
}
export type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

export interface RootState {
  auth: AuthState;
  posts: PostsState;
  user: UserState;
}
export interface UpdatedPostParams {
  postId: string;
  postData: PostData;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
}

export interface PageItem {
  type: "page" | "ellipsis";
  value?: number;
  id: string;
}
export interface RouteParams {
  postId: string;
  [key: string]: string | undefined;
}

export interface PostCardProps {
  post: Post;
  onDelete: () => void;
}

export interface FormError {
  title?: string;
  content?: string;
}
export interface PostFormProps {
  onSubmit: (data: PostData) => void;
  initialData?: Partial<Post>;
}
export interface SignInCredentials {
  email: string;
  password: string;
}
