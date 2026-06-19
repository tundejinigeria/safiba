import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/live/"],
      },
    ],
    sitemap: "https://safiba.com/sitemap.xml",
    host: "https://safiba.com",
  };
}
