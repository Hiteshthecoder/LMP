import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: ["/", "/products/", "/categories/", "/about", "/help"],
            disallow: [
                "/api/",
                "/login",
                "/register",
                "/balance",
                "/messages",
                "/purchase",
                "/purchases",
                "/work",
                "/*?q=",
                "/*?cursor=",
                "/*?location=",
                "/*?minPrice=",
                "/*?maxPrice=",
            ],
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
