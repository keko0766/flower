import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin", "/ru/cart", "/kk/cart", "/ru/checkout", "/kk/checkout"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
