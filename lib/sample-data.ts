import type { ProductWithMedia } from "@/lib/types";

export const sampleProducts: ProductWithMedia[] = [
  {
    id: "sample-aurora-hub",
    company_id: "sample-company",
    name: "Aurora Hub X2",
    category: "Smart Home",
    manufacturer: "Northline Systems",
    short_description: "A compact control hub for connected lighting, security, and climate devices.",
    detailed_description:
      "Aurora Hub X2 gives support teams and customers a single product home for setup guides, firmware notes, warranty details, and troubleshooting resources.",
    tags: ["hub", "iot", "automation"],
    featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profiles: { company_name: "Northline Systems", full_name: null, email: "support@northline.example" },
    product_images: [
      {
        id: "img-1",
        product_id: "sample-aurora-hub",
        storage_path: "",
        public_url:
          "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80",
        alt_text: "Smart home hub on a table",
        sort_order: 0,
        created_at: new Date().toISOString()
      }
    ],
    product_resources: [
      {
        id: "res-1",
        product_id: "sample-aurora-hub",
        company_id: "sample-company",
        title: "Quick start manual",
        resource_type: "pdf",
        storage_path: null,
        public_url: null,
        external_url: "https://example.com/manual.pdf",
        description: "Installation and first-run setup guide.",
        created_at: new Date().toISOString()
      }
    ]
  },
  {
    id: "sample-pulse-meter",
    company_id: "sample-company",
    name: "Pulse Meter Pro",
    category: "Healthcare",
    manufacturer: "Civic BioWorks",
    short_description: "A clinical-grade monitoring device with portable reporting workflows.",
    detailed_description:
      "Pulse Meter Pro centralizes device specs, compliance documents, usage videos, and service resources for field teams and end users.",
    tags: ["medical", "monitoring", "portable"],
    featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profiles: { company_name: "Civic BioWorks", full_name: null, email: "hello@civic.example" },
    product_images: [
      {
        id: "img-2",
        product_id: "sample-pulse-meter",
        storage_path: "",
        public_url:
          "https://images.unsplash.com/photo-1581093458791-9d09cc4a9c4d?auto=format&fit=crop&w=1200&q=80",
        alt_text: "Device components on a workbench",
        sort_order: 0,
        created_at: new Date().toISOString()
      }
    ],
    product_resources: []
  },
  {
    id: "sample-forge-drone",
    company_id: "sample-company",
    name: "Forge Drone M4",
    category: "Industrial",
    manufacturer: "TerraForge Robotics",
    short_description: "Inspection drone for maintenance teams working in complex industrial sites.",
    detailed_description:
      "Forge Drone M4 product pages include inspection procedures, battery safety documents, training media, and future assistant conversations.",
    tags: ["drone", "inspection", "robotics"],
    featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profiles: { company_name: "TerraForge Robotics", full_name: null, email: "ops@terraforge.example" },
    product_images: [
      {
        id: "img-3",
        product_id: "sample-forge-drone",
        storage_path: "",
        public_url:
          "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80",
        alt_text: "Drone in flight",
        sort_order: 0,
        created_at: new Date().toISOString()
      }
    ],
    product_resources: []
  }
];
