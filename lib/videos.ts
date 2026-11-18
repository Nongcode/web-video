import data from "@/data/videos.json";

export type Video = { id: string; title: string; size: number; mtime: number };
export type Comment = { id: string; author: string; text: string; time: number; createdAt: string };

export const videos: Video[] = data;
export const videoUrl = (id: string) => `/videos/${id}.mp4`;
