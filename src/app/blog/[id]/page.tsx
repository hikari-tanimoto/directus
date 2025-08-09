import { getBlogPost } from "@/lib/directus";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function BlogPost({ params }: { params: { id: string } }) {
  const post = await getBlogPost(params.id);

  // blocksが存在し、配列であることを確認
  if (post && Array.isArray(post.blocks)) {
    post.blocks.forEach((block: any) => {
      // block_headingの場合のみ
      if (block.collection === "block_heading" && block.item) {
        // テキストを表示
        // console.log(block.item);
        // 例: ページに表示する場合
        // <h{block.item.level}>{block.item.text}</h{block.item.level}>
      }

      if (block.collection === "block_content" && block.item) {
        // console.log(block.item);
      }
    });
  }

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/blog"
        className="inline-block mb-8 text-blue-600 hover:text-blue-800"
      >
        ← ブログ一覧に戻る
      </Link>
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <div className="prose prose-lg max-w-none">
        <div>content</div>
      </div>
    </div>
  );
}
