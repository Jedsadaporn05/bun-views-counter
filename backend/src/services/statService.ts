import { PageView } from "../models/PageView";

export const getPageViews = async (slug: string) => {
  const page = await PageView.findOne({ slug });
  return page?.count || 0;
};
