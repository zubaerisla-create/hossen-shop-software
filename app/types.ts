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
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'admin';
  content: string;
  timestamp: string;
  file?: FileAttachment;
  meetingLink?: string;
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
