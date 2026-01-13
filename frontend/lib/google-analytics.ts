import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { unstable_cache } from "next/cache";

const propertyId = process.env.GA_PROPERTY_ID;

const client = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GA_CLIENT_EMAIL,
    private_key: process.env.GA_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});

export const getPageViews = unstable_cache(
  async (path: string) => {
    try {
      const [response] = await client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: "2020-01-01", endDate: "today" }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        dimensionFilter: {
          filter: {
            fieldName: "pagePath",
            stringFilter: { value: path },
          },
        },
      });

      const views = response.rows?.[0]?.metricValues?.[0]?.value || "0";
      return parseInt(views);
    } catch (error) {
      console.error("GA Fetch Error:", error);
      return 0;
    }
  },
  ["google-analytics-views"], // cache key
  { revalidate: 3600, tags: ["views"] } // cache 1 hour
);
