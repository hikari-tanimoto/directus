import { createDirectus, rest, readItems, authentication } from "@directus/sdk";
import { z } from "zod";
import { BlogPostSchema } from "../schema";

// 型をre-exportして外部から使用可能にする
export type { BlogPost } from "../schema";

const directus = createDirectus(
  process.env.DIRECTUS_URL || "http://localhost:8055"
)
  .with(authentication())
  .with(rest());

// 認証状態を管理
let isAuthenticated = false;
let authPromise: Promise<void> | null = null;

// 認証を行う関数
const authenticate = async (): Promise<void> => {
  if (isAuthenticated) return;

  if (authPromise) {
    await authPromise;
    return;
  }

  authPromise = (async () => {
    try {
      const email = process.env.DIRECTUS_EMAIL || "admin@example.com";
      const password = process.env.DIRECTUS_PASSWORD || ")#$)";

      await directus.login(email, password);
      isAuthenticated = true;
      console.log("Directus認証成功");
    } catch (error) {
      console.error("Directus認証エラー:", error);
      isAuthenticated = false;
      throw error;
    } finally {
      authPromise = null;
    }
  })();

  await authPromise;
};

export const getBlogPosts = async () => {
  try {
    // 認証を確保
    await authenticate();

    // 記事を取得
    const posts = await directus.request(
      readItems("Pages", {
        fields: [
          "id",
          "title",
          "slug",
          "tag",
          "created_at",
          "category",
          "blocks.*",
          "blocks.item.*",
        ],
        sort: ["-created_at"],
      })
    );

    console.log("取得した生データ:", JSON.stringify(posts, null, 2));

    // データが空の場合の処理
    if (!posts || !Array.isArray(posts)) {
      console.log("データが空または配列ではありません");
      return [];
    }

    // zodスキーマで検証（個別にパースしてエラーを特定）
    const validatedPosts = [];
    for (let i = 0; i < posts.length; i++) {
      try {
        const validatedPost = BlogPostSchema.parse(posts[i]);
        validatedPosts.push(validatedPost);
      } catch (parseError) {
        console.error(`記事 ${i} のパースエラー:`, parseError);
        console.error(`問題のあるデータ:`, JSON.stringify(posts[i], null, 2));
        // エラーがあっても他の記事は処理を続ける
      }
    }

    console.log("検証済みデータ:", validatedPosts);
    return validatedPosts;
  } catch (error) {
    // 認証エラーの場合は認証状態をリセット
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 401
    ) {
      isAuthenticated = false;
    }

    if (error instanceof z.ZodError) {
      console.error("データ検証エラー:");
      console.error("エラー詳細:", JSON.stringify(error.errors, null, 2));
      console.error("失敗したデータ:", JSON.stringify(error.issues, null, 2));
    } else {
      console.error("記事の取得エラー:", error);
    }
    return [];
  }
};

export const getBlogPost = async (slug: string) => {
  let post: unknown; // post変数を事前に宣言
  try {
    // 認証を確保
    await authenticate();

    // 記事を取得
    post = await directus.request(
      readItems("Pages", {
        fields: ["*", "blocks.*", "blocks.item.*", "members.*"],
        filter: {
          slug: { _eq: slug },
          category: { _in: ["hoge"] },
        },
      })
    );

    console.log("取得した単一記事の生データ:", JSON.stringify(post, null, 2));

    if (!post || (Array.isArray(post) && post.length === 0)) {
      return null;
    }

    // zodスキーマで検証
    const validatedPost = BlogPostSchema.parse(
      Array.isArray(post) ? post[0] : post
    );
    console.log("検証済み単一記事:", validatedPost);
    return validatedPost;
  } catch (error) {
    // 認証エラーの場合は認証状態をリセット
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 401
    ) {
      isAuthenticated = false;
    }

    if (error instanceof z.ZodError) {
      console.error("データ検証エラー:");
      console.error("エラー詳細:", JSON.stringify(error.errors, null, 2));
      console.error(
        "失敗したデータの一部:",
        JSON.stringify(Array.isArray(post) ? post[0] : post, null, 2)
      );
    } else {
      console.error("記事の取得エラー:", error);
    }
    return null;
  }
};
