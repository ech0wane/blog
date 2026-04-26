export const SITE = {
  website: "https://blog.ech0wane.ir",
  author: "Amir Rabiee",
  ogImage: "og.png",
  lightAndDarkMode: true,
  postPerIndex: 5,
  postPerPage: 5,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true, // show back button in post detail
  lang: "fa",
  timezone: "UTC", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
  twitterHandle: "@ech0wane", // Optional: your Twitter handle
} as const;
