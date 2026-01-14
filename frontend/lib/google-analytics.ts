import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { cache } from "react";

const propertyId = process.env.GA_PROPERTY_ID;

const client = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GA_CLIENT_EMAIL,
    private_key: process.env.GA_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});

export const getPageViews = cache(async (path: string) => {
  if (!propertyId) return 0;

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
});
