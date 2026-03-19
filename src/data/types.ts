export type PostSize = "small" | "medium" | "large";

export type PostBase = {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  date: string;
  size: PostSize;
};

export type LinkPost = PostBase & {
  type: "link";
  url: string;
  source: string;
};

export type ImagePost = PostBase & {
  type: "image";
  imageUrl: string;
};

export type TextPost = PostBase & {
  type: "text";
  content: string;
};

export type EmbedPost = PostBase & {
  type: "embed";
  embedUrl: string;
  embedType: "youtube" | "twitter" | "generic";
};

export type FeedPost = LinkPost | ImagePost | TextPost | EmbedPost;
