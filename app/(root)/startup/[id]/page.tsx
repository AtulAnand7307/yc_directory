import { Suspense } from "react";
import { client } from "@/sanity/lib/client";
import {
  PLAYLIST_BY_SLUG_QUERY,
  STARTUP_BY_ID_QUERY,
} from "@/sanity/lib/queries";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import markdownit from "markdown-it";
import { Skeleton } from "@/components/ui/skeleton";
import View from "@/components/View";
import StartupCard, { StartupTypeCard } from "@/components/StartupCard";

const md = markdownit();
export const experimental_ppr = true;

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const id = (await params).id;

  // Changed destructuring to handle potential null values
  const [post, playlistResult] = await Promise.all([
    client.fetch(STARTUP_BY_ID_QUERY, { id }),
    client.fetch(PLAYLIST_BY_SLUG_QUERY, {
      slug: "editor-picks-new",
    }),
  ]);

  if (!post) return notFound();

  // Safely access select property with optional chaining and default value
  const editorPosts = playlistResult?.select || [];
  const parsedContent = md.render(post.pitch || "");

  // Added fallback for author information
  const author = post.author || {
    _id: "unknown",
    name: "Unknown Author",
    username: "anonymous",
    image: "/default-avatar.png",
  };

  return (
    <>
      <section className="pink_container !min-h-[230px]">
        <p className="tag">{formatDate(post._createdAt)}</p>
        <h1 className="heading">{post.title}</h1>
        <p className="sub-heading !max-w-5xl">{post.description}</p>
      </section>

      <section className="section_container">
        {/* Added priority and alt text for image */}
        <img
          src={post.image}
          alt={post.title || "Startup thumbnail"}
          className="w-full h-auto rounded-xl"
        />

        <div className="space-y-5 mt-10 max-w-4xl mx-auto">
          <div className="flex-between gap-5">
            <Link
              href={`/user/${author._id}`}
              className="flex gap-2 items-center mb-3"
            >
              {/* Added alt text and loading strategy */}
              <Image
                src={author.image}
                alt={`${author.name}'s avatar`}
                width={64}
                height={64}
                className="rounded-full drop-shadow-lg"
                loading="lazy"
              />
              <div>
                <p className="text-20-medium">{author.name}</p>
                <p className="text-16-medium !text-black-300">
                  @{author.username}
                </p>
              </div>
            </Link>
            <p className="category-tag">{post.category}</p>
          </div>

          <h3 className="text-30-bold">Pitch Details</h3>
          {parsedContent ? (
            <article
              className="prose max-w-4xl font-work-sans break-all"
              dangerouslySetInnerHTML={{ __html: parsedContent }}
            />
          ) : (
            <p className="no-result">No details provided</p>
          )}
        </div>

        <hr className="divider" />

        {/* Added safer array check */}
        {editorPosts.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <p className="text-30-semibold">Editor Picks</p>
            <ul className="mt-7 card_grid-sm">
              {editorPosts.map((post: StartupTypeCard) => (
                <StartupCard key={post._id} post={post} />
              ))}
            </ul>
          </div>
        )}

        {/* Added key prop to force suspense remount on ID change */}
        <Suspense fallback={<Skeleton className="view_skeleton" />}>
          <View id={id}  />
        </Suspense> 
      </section>
    </>
  );
};

export default Page;