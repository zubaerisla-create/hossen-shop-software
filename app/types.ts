export interface Review {
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface ChangelogItem {
  version: string;
  date: string;
  changes: string[];
}

export interface Product {
  id: string;
  name: string;
  price: number; // in USD or BDT. Let's use BDT for agency / USD conversion. Let's show both or BDT primarily.
  category: 'Website Template' | 'Full Website' | 'SaaS' | 'Mobile App' | 'Source Code' | 'UI/UX' | 'AI Project';
  demoUrl: string;
  images: string[];
  videoUrl?: string;
  technologies: string[];
  documentationUrl?: string;
  features: string[];
  requirements: string[];
  version: string;
  changelog: ChangelogItem[];
  license: string;
  reviews: Review[];
  faqs: FAQItem[];
  description: string;
  salesCount: number;
  rating: number;
  githubUrl?: string;
  frontendGithubUrl?: string;
  backendGithubUrl?: string;
  zipUrl?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  cost: number;
  percentage: number;
  status: 'Pending' | 'In Progress' | 'Awaiting Approval' | 'Approved';
  paymentStatus: 'Unpaid' | 'Paid';
  dueDate: string;
  progress?: number; // Progress of this specific phase (0 to 100)
  deliverables?: FileAttachment[]; // Submitted files / documents for this phase
}

export interface ProjectTask {
  id: string;
  title: string;
  status: 'Todo' | 'In Progress' | 'Testing' | 'Client Review' | 'Revision' | 'Completed';
  assignee: string;
  dueDate: string;
}

export interface Quotation {
  totalCost: number;
  developmentTime: string; // e.g. "20 Days"
  milestones: Milestone[];
  terms: string[];
  supportPeriod: string; // e.g. "6 Months Free Support"
  maintenanceOffer: string; // e.g. "10,000 BDT/month optional"
}

export interface FileAttachment {
  name: string;
  size: string;
  url: string;
  type: string;
}

export interface CustomDeal {
  id: string;
  title: string;
  description: string;
  projectType: string;
  budget: number;
  deadline: string;
  technology: string;
  referenceWebsite?: string;
  uploadedFiles: FileAttachment[];
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'New' | 'Reviewing' | 'Discussion' | 'Quotation Sent' | 'Accepted' | 'Rejected' | 'In Development' | 'Testing' | 'Client Review' | 'Revision' | 'Completed' | 'Delivered';
  developer?: string;
  overallProgress: number; // 0 to 100
  quotation?: Quotation;
  contractSigned: boolean;
  clientSignature?: string; // name or e-sign image
  signedDate?: string;
  maintenancePlan?: string;
  credentials?: {
    cPanel?: string;
    github?: string;
    database?: string;
  };
  finalDeliveryFiles?: FileAttachment[];
  unreadAdmin?: boolean;
  unreadPortal?: boolean;
  customer?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'admin';
  content: string;
  timestamp: string;
  file?: FileAttachment;
  meetingLink?: string;
  createdAt?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  dealId?: string;
  productId?: string;
  title: string;
  amount: number;
  tax: number;
  discount: number;
  total: number;
  type: 'ready_product' | 'custom_milestone' | 'maintenance';
  status: 'Paid' | 'Unpaid';
  date: string;
  customerName?: string;
  customerEmail?: string;
  createdAt?: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  category: 'Technical' | 'Billing' | 'Customization' | 'Other';
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
  messages: {
    sender: 'customer' | 'admin';
    content: string;
    timestamp: string;
  }[];
}

export interface BlogBlock {
  id: string;
  type: 'text' | 'image' | 'video' | 'code' | 'table' | 'faq' | 'gallery' | 'quote' | 'cta' | 'button' | 'newsletter' | 'divider' | 'callout' | 'accordion';
  data: {
    text?: string;
    level?: number;
    url?: string;
    caption?: string;
    code?: string;
    language?: string;
    columns?: string[];
    rows?: string[][];
    items?: { q: string; a: string; }[];
    buttonText?: string;
    buttonUrl?: string;
    title?: string;
    style?: string;
  };
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  image: string;
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;

  // Basic Information
  excerpt: string;
  authorBio: string;
  authorSocials?: { twitter?: string; linkedin?: string; github?: string; } | null;
  status: 'Draft' | 'Published' | 'Scheduled' | 'Archived';
  publishDate: string;
  readingTime: number;
  imageAlt: string;
  imageCaption: string;
  imageCredit: string;
  
  contentBlocks?: BlogBlock[] | null;
  categories: string[];

  // SEO Section
  seoTitle: string;
  seoDesc: string;
  seoKeywords: string;
  canonicalUrl: string;
  robotsIndex: boolean;
  ogTitle: string;
  ogDesc: string;
  ogImage: string;
  twitterCardImage: string;

  // Additional Sections
  faqs?: { q: string; a: string; }[] | null;
  tableOfContents?: { text: string; id: string; level: number; }[] | null;
  relatedArticles?: { id: string; title: string; }[] | null;
  cta?: { label: string; url: string; type: string; } | null;
  attachments?: { name: string; url: string; type: string; }[] | null;
  socialShareText?: { facebook?: string; linkedin?: string; twitter?: string; } | null;

  allowComments: boolean;
  comments?: { id: string; user: string; text: string; createdAt: string; }[] | null;
  visibility: 'Public' | 'Private' | 'Members Only' | 'Premium';

  // Hosen Academy / Promotional integrations
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  completionTime: string;
  keyTakeaways: string[];
  prerequisites: string[];
  linkedCourseId: string;
  linkedService: string;
  productId?: string | null;

  // Analytics Metrics
  views: number;
  uniqueVisitors: number;
  shares: number;
  likes: number;
  saves: number;

  // Extra options
  isFeatured: boolean;
  isTrending: boolean;
  isPopular: boolean;
  isEditorsPick: boolean;
  sticky: boolean;
}

export interface CaseStudy {
  id: string;
  title: string;
  type: string;
  image: string;
  desc: string;
  productId: string | null;
  createdAt: string;
  updatedAt: string;
}
