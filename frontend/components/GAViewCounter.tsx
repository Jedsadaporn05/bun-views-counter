import { getPageViews } from "@/lib/google-analytics";

export default async function GAViewCounter({ slug }: { slug: string }) {
  const views = await getPageViews(slug);

  return <span>google analytics {views.toLocaleString()} views</span>;
}
