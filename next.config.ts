import type { NextConfig } from "next";

const supabaseHostname = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : undefined;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  /**
   * The public offer lives at /ommaviy_ofertasi.
   *
   * It was published at /oferta first, and that path is in the sitemap, in the
   * footer of every page already crawled, and in whatever links have been sent
   * to candidates. A permanent redirect keeps all of those working and leaves
   * one canonical URL — serving the same contract at two paths would split the
   * page against itself in search results.
   */
  async redirects() {
    return [{ source: "/oferta", destination: "/ommaviy_ofertasi", permanent: true }];
  },
  images: {
    remotePatterns: [
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
      {
        protocol: "https" as const,
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
