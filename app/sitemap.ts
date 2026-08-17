import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://janetravelmap.com";
  const pages = ["", "/about", "/privacy", "/terms", "/contact", "/guides", "/guides/start-travel-map", "/guides/organize-old-trips", "/guides/write-travel-memories", "/guides/read-your-travel-map"];
  return pages.map((path) => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: path.startsWith("/guides") ? "monthly" : "yearly", priority: path === "" ? 1 : path === "/guides" ? 0.8 : 0.6 }));
}
