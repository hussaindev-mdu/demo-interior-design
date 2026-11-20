/**
 * Single source of truth for studio details.
 * Used by the nav, footer, contact section, WhatsApp button, metadata and
 * LocalBusiness JSON-LD.
 *
 * TODO before launch: replace every placeholder value below with the studio's
 * real details (name, city, address, phone, WhatsApp number, email, socials).
 */
export const siteConfig = {
  /** [STUDIO NAME] */
  name: "Atelier Strata",
  legalName: "Atelier Strata Interiors",
  tagline: "Every layer, considered.",
  description:
    "Atelier Strata is a luxury interior design studio in Bengaluru creating residential interiors, modular kitchens, false ceilings, lighting and custom joinery — designed end to end and delivered turnkey.",

  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.example.com").replace(/\/$/, ""),

  /** [CITY] */
  city: "Bengaluru",
  address: {
    street: "12, Placeholder Road, Indiranagar",
    locality: "Bengaluru",
    region: "Karnataka",
    postalCode: "560038",
    country: "IN",
  },
  /** Optional — used in JSON-LD only. */
  geo: { latitude: 12.9719, longitude: 77.6412 },
  openingHours: "Mo-Sa 10:00-19:00",

  /** Display format and tel: format */
  phone: "+91 98765 43210",
  phoneHref: "tel:+919876543210",

  /** [91XXXXXXXXXX] — country code + number, digits only */
  whatsappNumber: "919876543210",
  whatsappMessage: "Hi, I'd like to discuss an interior design project.",

  email: "hello@example.com",

  social: {
    instagram: "https://www.instagram.com/",
  },
} as const;

export const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
  siteConfig.whatsappMessage,
)}`;

export const fullAddress = [
  siteConfig.address.street,
  `${siteConfig.address.locality} ${siteConfig.address.postalCode}`,
].join(", ");

export const navLinks = [
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/process", label: "Process" },
  { href: "/contact", label: "Contact" },
] as const;
