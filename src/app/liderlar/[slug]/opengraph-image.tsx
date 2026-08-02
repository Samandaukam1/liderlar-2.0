import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/admin";
import { toShortBioItems } from "@/lib/candidates/text";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Liderlar.uz profili";

const GRADIENTS = [
  ["#087EA4", "#00C7E8"],
  ["#F39AC7", "#FFB58A"],
  ["#A998F5", "#63C8F2"],
  ["#74DDC1", "#D4EB69"],
  ["#FF8585", "#F39AC7"],
];

function pickGradient(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash << 5) - hash + seed.charCodeAt(i);
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const admin = createAdminClient();
  const { data: candidate } = await admin
    .from("candidates")
    .select("full_name, short_bio, description_items, avatar_url, region:regions(name)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  const name = candidate?.full_name ?? "Liderlar.uz";
  const regionField = candidate?.region as { name: string } | { name: string }[] | null | undefined;
  const region = Array.isArray(regionField) ? regionField[0]?.name : regionField?.name;
  // Same badge limits as the profile page, so a legacy paragraph short_bio
  // cannot spill across the social card.
  const description = toShortBioItems(
    candidate?.description_items?.length ? candidate.description_items : candidate?.short_bio
  ).join(" · ");
  const [from, to] = pickGradient(slug);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "64px",
          backgroundImage: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 140, color: "rgba(255,255,255,0.35)", lineHeight: 1 }}>&ldquo;</div>
        <div style={{ display: "flex", fontSize: 72, fontWeight: 700, color: "white", lineHeight: 1.05 }}>{name}</div>
        {description && (
          <div style={{ display: "flex", fontSize: 32, color: "rgba(255,255,255,0.85)", marginTop: 16 }}>
            {description}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 24 }}>
          {region && (
            <div style={{ display: "flex", fontSize: 26, color: "rgba(255,255,255,0.7)" }}>{region}</div>
          )}
          <div
            style={{
              display: "flex",
              fontSize: 24,
              fontWeight: 700,
              color: "#071A33",
              background: "white",
              borderRadius: 999,
              padding: "8px 24px",
            }}
          >
            Liderlar.uz
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
