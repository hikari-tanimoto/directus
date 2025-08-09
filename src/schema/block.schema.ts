import { z } from "zod";

// ブロック見出しのスキーマ
export const BlockHeadingSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform(String),
    title: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
  })
  .passthrough(); // 未知のフィールドも許可

// ブロックコンテンツのスキーマ
export const BlockContentSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform(String),
    content: z.string().nullable().optional(),
  })
  .passthrough(); // 未知のフィールドも許可

// ブロックアイテムのスキーマ
export const BlockItemSchema = z
  .object({
    block_heading: z
      .union([z.array(BlockHeadingSchema), z.null(), z.undefined()])
      .optional(),
    block_content: z
      .union([z.array(BlockContentSchema), z.null(), z.undefined()])
      .optional(),
  })
  .passthrough(); // 未知のフィールドも許可

// ブロック全体のスキーマ
export const BlockSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform(String),
    item: BlockItemSchema.nullable().optional(),
  })
  .passthrough(); // 未知のフィールドも許可

// 型定義をエクスポート
export type BlockHeading = z.infer<typeof BlockHeadingSchema>;
export type BlockContent = z.infer<typeof BlockContentSchema>;
export type BlockItem = z.infer<typeof BlockItemSchema>;
export type Block = z.infer<typeof BlockSchema>;
