import { asset } from "./base-path";

/**
 * Editorial content for the sections below the hero.
 * Edit copy here — components only handle layout.
 */

export const services = [
  {
    title: "Residential interiors",
    body: "Apartments, villas and penthouses planned as a whole — layout, finishes, furniture and art held to a single idea.",
    detail: "Space planning · Furniture · Styling",
  },
  {
    title: "Modular kitchens",
    body: "Kitchens engineered around how you cook, with quiet hardware, stone worktops and storage that disappears.",
    detail: "Layouts · Appliances · Stone & lacquer",
  },
  {
    title: "False ceilings & lighting",
    body: "Layered ceilings with cove, task and accent lighting, designed together so every room has a mood for every hour.",
    detail: "Gypsum & wood ceilings · Cove lighting · Controls",
  },
  {
    title: "Wardrobes & joinery",
    body: "Custom walnut, veneer and lacquer joinery, detailed to the millimetre and built by our own workshop partners.",
    detail: "Wardrobes · Wall panelling · Vanities",
  },
  {
    title: "Turnkey execution",
    body: "One team from first sketch to handover — civil, electrical, carpentry and finishing, managed on a fixed schedule.",
    detail: "Project management · Site supervision · Handover",
  },
] as const;

/**
 * PLACEHOLDER projects — images in /public/projects are crops of the hero
 * render. Replace names, locations, areas and images with real projects
 * before launch. Keep `src` paths, or point them at new files.
 */
export const projects = [
  {
    name: "The Walnut Residence",
    location: "Indiranagar, Bengaluru",
    area: 3200,
    src: asset("/projects/project-01.webp"),
    alt: "Living room with marble feature wall, walnut slats and a layered cove-lit ceiling",
  },
  {
    name: "Courtyard Apartment",
    location: "Koramangala, Bengaluru",
    area: 1850,
    src: asset("/projects/project-02.webp"),
    alt: "Brass ring chandelier above a low marble coffee table and linen sofa",
  },
  {
    name: "Stone & Light Villa",
    location: "Whitefield, Bengaluru",
    area: 5400,
    src: asset("/projects/project-03.webp"),
    alt: "Marble media wall framed by backlit walnut shelving",
  },
  {
    name: "Layered Penthouse",
    location: "Sadashivanagar, Bengaluru",
    area: 4100,
    src: asset("/projects/project-04.webp"),
    alt: "Living room under construction with ceiling and wall layers coming together",
  },
  {
    name: "Garden Pavilion",
    location: "Jayanagar, Bengaluru",
    area: 2600,
    src: asset("/projects/project-05.webp"),
    alt: "Sheer curtains and a recessed ceiling with warm cove lighting",
  },
] as const;

export const processSteps = [
  {
    title: "Consultation",
    body: "We meet at your space, listen closely and agree on scope, budget and timeline.",
  },
  {
    title: "Concept & 3D visualization",
    body: "Layouts and photoreal 3D views, so every decision is seen before it is built.",
  },
  {
    title: "Materials selection",
    body: "Stone, wood, metal and fabric chosen together, sample by sample, in our studio.",
  },
  {
    title: "Execution",
    body: "A dedicated site team builds to drawing, with weekly progress you can follow.",
  },
  {
    title: "Handover",
    body: "A finished, styled home — snagged, cleaned and ready to live in.",
  },
] as const;

/** PLACEHOLDER material photography — procedural textures, swap for real macro shots. */
export const materials = [
  { name: "Marble", note: "Statuario & travertine", src: asset("/materials/marble.webp") },
  { name: "Walnut", note: "American black walnut", src: asset("/materials/walnut.webp") },
  { name: "Brass", note: "Brushed & antique", src: asset("/materials/brass.webp") },
  { name: "Fabric", note: "Linen, bouclé & wool", src: asset("/materials/fabric.webp") },
] as const;

/*
 * ⚠️ PLACEHOLDER TESTIMONIALS — NOT REAL CLIENT REVIEWS.
 * Replace every quote, name and project below with genuine client reviews
 * (with the client's permission) before the site goes live. Publishing
 * invented testimonials is misleading to customers.
 */
export const testimonials = [
  {
    quote:
      "PLACEHOLDER — Replace with a real client review. A sentence or two about how the studio listened, how the home feels now, and what the process was like.",
    name: "PLACEHOLDER Client Name",
    project: "Apartment · Placeholder Location",
  },
  {
    quote:
      "PLACEHOLDER — Replace with a real client review. Mention the quality of execution, the materials, or delivering on time and on budget.",
    name: "PLACEHOLDER Client Name",
    project: "Villa · Placeholder Location",
  },
  {
    quote:
      "PLACEHOLDER — Replace with a real client review. Ideally something specific — the kitchen, the lighting, the joinery — in the client's own words.",
    name: "PLACEHOLDER Client Name",
    project: "Penthouse · Placeholder Location",
  },
] as const;
