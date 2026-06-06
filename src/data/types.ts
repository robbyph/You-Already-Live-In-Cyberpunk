export type FeedPost = {
  id: string;
  imageUrl: string;
  description: string;
  link?: string;
  tags: readonly string[];
  date: string;
  title?: string;
};
