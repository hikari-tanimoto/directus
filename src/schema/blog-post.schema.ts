import { z } from "zod";
import { BlockSchema } from "./block.schema";

// ブログポストのスキーマ定義
export const BlogPostSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform(String), // IDは文字列または数値
    title: z.string().nullable().optional(),
    slug: z.string().nullable().optional(),
    tag: z
      .union([z.string(), z.array(z.string()), z.null()])
      .nullable()
      .optional(),
    category: z
      .union([z.string(), z.array(z.string()), z.null()])
      .nullable()
      .optional(),
    created_at: z
      .union([
        z.string().transform((val) => new Date(val)),
        z.date(),
        z.null().transform(() => new Date()),
      ])
      .nullable()
      .optional(),
    blocks: z.array(BlockSchema).nullable().optional(),
  })
  .passthrough(); // 未知のフィールドも許可

// ブログポスト配列用のスキーマ
export const BlogPostsSchema = z.array(BlogPostSchema);

// 型定義をエクスポート
export type BlogPost = z.infer<typeof BlogPostSchema>;
export type BlogPosts = z.infer<typeof BlogPostsSchema>;
