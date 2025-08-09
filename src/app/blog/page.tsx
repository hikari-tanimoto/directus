import { getBlogPosts } from "@/lib/directus";
import Link from "next/link";

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">ブログ記事一覧</h1>
      <div className="grid gap-6">
        {posts.map((post) => (
          <article
            key={post.id}
            className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <Link href={`/blog/${post.id}`}>
              <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
              <p className="text-gray-600">
                {new Date(post.created_at ?? "").toLocaleDateString("ja-JP")}
              </p>
              <p className="mt-2 text-gray-700 line-clamp-2">{post.title}</p>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
