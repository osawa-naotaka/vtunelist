import { LinearIndex, StaticSeekError, createIndex, indexToObject } from "staticseek";

type Song = {
  readonly title: string;          // 楽曲名
  readonly artist: string;         // アーティスト名
  readonly genre: string[];        // ジャンル配列
  readonly note?: string;          // メモ（任意）
};

export default async function createSearchIndex(): Promise<string> {
    const songs: Song[] = [
        { title: "Song A", artist: "Artist 1", genre: ["Pop"], note: "Popular song" },
        { title: "Song B", artist: "Artist 2", genre: ["Rock"], note: "Classic rock" },
        { title: "Song C", artist: "Artist 1", genre: ["Pop", "Dance"], note: "Dance hit" },
        { title: "Song D", artist: "Artist 3", genre: ["Jazz"], note: "Smooth jazz" },
        { title: "Song E", artist: "Artist 2", genre: ["Rock", "Alternative"], note: "Alternative rock" },
    ]

    const index = createIndex(LinearIndex, songs, {
        key_fields: ["title", "artist", "genre", "note"],
    });
    if (index instanceof StaticSeekError) throw index;
    return JSON.stringify(indexToObject(index));
}
