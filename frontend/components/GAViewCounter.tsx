import { getPageViews } from "@/lib/google-analytics";

export default async function GAViewCounter({ slug }: { slug: string }) {
  const views = await getPageViews(slug);

  if (views === 0) return null;

  return <span>google analytics {views.toLocaleString()} views</span>;
}
