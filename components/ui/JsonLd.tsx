import { fullAddress, siteConfig } from "@/lib/site-config";
import { services } from "@/lib/content";

/**
 * LocalBusiness structured data. schema.org has no dedicated "InteriorDesigner"
 * type, so we use LocalBusiness + HomeAndConstructionBusiness and describe the
 * trade via `description` and `knowsAbout` — this validates in Google's Rich
 * Results Test, an invented @type would not.
 */
export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
    "@id": `${siteConfig.url}/#business`,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    description: siteConfig.description,
    slogan: siteConfig.tagline,
    url: siteConfig.url,
    image: `${siteConfig.url}/opengraph-image.jpg`,
    logo: `${siteConfig.url}/icon.svg`,
    telephone: siteConfig.phone.replace(/\s/g, ""),
    email: siteConfig.email,
    priceRange: "₹₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.locality,
      addressRegion: siteConfig.address.region,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.country,
    },
    geo: { "@type": "GeoCoordinates", ...siteConfig.geo },
    openingHours: siteConfig.openingHours,
    areaServed: siteConfig.city,
    knowsAbout: ["Interior design", ...services.map((s) => s.title)],
    sameAs: Object.values(siteConfig.social),
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`,
  };
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here; escape "<" so content can't close the tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
