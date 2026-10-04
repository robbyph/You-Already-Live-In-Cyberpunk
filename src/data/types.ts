export type FeedPost = {
  id: string;
  imageUrl: string;
  imageWidth?: number;
  imageHeight?: number;
  thumbnail?: { src: string; srcSet: string };
  description: string;
};
