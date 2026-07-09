import { Product, CustomDeal, ChatMessage, Invoice, SupportTicket } from './types';

export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'DevFlow - Next.js 15 SaaS Boilerplate & Starter Kit',
    price: 12000,
    category: 'SaaS',
    demoUrl: 'https://devflow.example.com',
    images: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'
    ],
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    technologies: ['Next.js 15', 'React 19', 'Tailwind CSS v4', 'TypeScript', 'Prisma', 'PostgreSQL', 'Stripe'],
    documentationUrl: 'https://docs.devflow.example.com',
    description: 'DevFlow is a premium production-ready SaaS starter kit that comes pre-configured with user authentication, billing subscription integration, transactional email, SEO optimization, and a polished admin dashboard. Save over 80 hours of development time!',
    features: [
      'Authentication: NextAuth.js / Lucide icons / Google, GitHub & Passwordless login',
      'Stripe Integration: Pre-configured monthly & annual pricing plans with webhooks',
      'Database Ready: Prisma ORM with PostgreSQL schema and pre-made migrations',
      'UI Library: Tailwind CSS v4, custom shadcn-inspired animated UI components',
      'SEO Optimized: Dynamic meta tags, OpenGraph, sitemap.xml, and robot.txt configured',
      'Email Integration: Ready-to-go Resend email integration for verification and invoices'
    ],
    requirements: [
      'Node.js 18.x or higher',
      'PostgreSQL Database (Local or Hosted like Neon/Supabase)',
      'Stripe API keys for payment processing',
      'Resend API key for transactional emails'
    ],
    version: '2.1.0',
    changelog: [
      {
        version: '2.1.0',
        date: '2026-06-15',
        changes: ['Upgraded to Next.js 15 and React 19', 'Migrated to Tailwind CSS v4', 'Added Resend templates']
      },
      {
        version: '2.0.0',
        date: '2026-04-01',
        changes: ['Added full multi-tenant workspace management', 'Integrated PostgreSQL Prisma adapter']
      }
    ],
    license: 'Single-Site Commercial License (Modify and use for 1 project)',
    salesCount: 142,
    rating: 4.8,
    githubUrl: 'https://github.com/agency-internal/devflow-starter-kit',
    zipUrl: 'https://storage.agency.com/assets/downloads/devflow-v2.1.0.zip',
    reviews: [
      {
        user: 'Tanvir Rahman',
        rating: 5,
        comment: 'This saved me weeks of boilerplate work. The database setup is perfect and Tailwind v4 compilation is blazing fast.',
        date: '2026-06-20'
      },
      {
        user: 'Nusrat Jahan',
        rating: 4,
        comment: 'Excellent code quality. The subscription workflow is very clear, but I had to spend a little time adjusting standard icons.',
        date: '2026-05-18'
      }
    ],
    faqs: [
      {
        q: 'Can I use this for multiple client projects?',
        a: 'The standard license is for a single commercial project. If you wish to use it for multiple clients, you can purchase the Unlimited Developer license.'
      },
      {
        q: 'Is there support provided?',
        a: 'Yes! We offer lifetime email support for configuration, bugs, and updates. We also have a community discord for developer help.'
      }
    ]
  },
  {
    id: 'prod-2',
    name: 'EcoShop - High-Conversion Next.js E-Commerce Storefront',
    price: 18000,
    category: 'Full Website',
    demoUrl: 'https://ecoshop.example.com',
    images: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80'
    ],
    technologies: ['Next.js 15', 'Tailwind CSS', 'Redux Toolkit', 'Stripe', 'NodeJS', 'Express', 'MongoDB'],
    description: 'EcoShop is a lightning-fast, fully responsive fashion and electronics e-commerce storefront. Designed with conversion optimization in mind, it features search autocomplete, advanced multi-facet filters, slide-out cart, checkout progress indicator, and custom admin dashboard for product inventory tracking.',
    features: [
      'Infinite scroll & paginated collections',
      'Live search with elasticsearch-style autocomplete',
      'Add-to-cart animations & persistent local storage sync',
      'Multi-currency support and automated tax/shipping calculator',
      'Admin portal for adding products, managing order statuses, and viewing sales analytics'
    ],
    requirements: [
      'Node.js 18+',
      'MongoDB instance (Atlas or Local)',
      'Cloudinary account for image storage'
    ],
    version: '1.4.0',
    changelog: [
      {
        version: '1.4.0',
        date: '2026-05-20',
        changes: ['Integrated bKash and SSLCommerz payment options', 'Added analytics dashboard tab']
      }
    ],
    license: 'Commercial License',
    salesCount: 89,
    rating: 4.9,
    reviews: [
      {
        user: 'Abid Hasan',
        rating: 5,
        comment: 'Out of the box bKash integration is a lifesaver in Bangladesh! The admin panel is clean and easy to customize.',
        date: '2026-06-02'
      }
    ],
    faqs: [
      {
        q: 'Does it support local payment gateways like SSLCommerz and bKash?',
        a: 'Yes, it comes with pre-integrated modules for SSLCommerz, bKash, Rocket, and Stripe. You only need to plug in your merchant credentials.'
      }
    ]
  },
  {
    id: 'prod-3',
    name: 'SwiftRide - Flutter Ride Sharing & Taxi Booking App Template',
    price: 22000,
    category: 'Mobile App',
    demoUrl: 'https://swiftride.example.com',
    images: [
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?auto=format&fit=crop&w=800&q=80'
    ],
    technologies: ['Flutter', 'Dart', 'Firebase', 'Google Maps API', 'NodeJS', 'Socket.io'],
    description: 'SwiftRide is a dual-app template (Rider App and Driver App) built with Flutter. It utilizes WebSockets (Socket.io) for real-time location tracking on Google Maps, route calculation, push notifications, and ride fare estimation. Highly optimized and clean code based on BLoC pattern.',
    features: [
      'Real-time Rider & Driver coordinate tracking via Socket.io',
      'Interactive route rendering using Google Maps API',
      'Fare estimation calculator based on distance & duration',
      'Push notification alerts for ride requests, acceptances, and completions',
      'Built-in wallet, ride history, and user/driver profile rating reviews'
    ],
    requirements: [
      'Flutter SDK 3.19.x or higher',
      'Google Maps Developer API Keys',
      'Firebase Project for authentication & notifications'
    ],
    version: '1.0.2',
    changelog: [
      {
        version: '1.0.2',
        date: '2026-03-10',
        changes: ['Improved GPS accuracy logic', 'Added Dark Mode style map support']
      }
    ],
    license: 'Single-App Commercial License',
    salesCount: 64,
    rating: 4.7,
    reviews: [
      {
        user: 'Fahim Faisal',
        rating: 5,
        comment: 'Code is very clean, utilizing the BLoC architecture. WebSocket driver assignment logic is robust.',
        date: '2026-04-12'
      }
    ],
    faqs: [
      {
        q: 'Is the backend included?',
        a: 'Yes, this package includes both the Rider/Driver Flutter codebases and the Node.js WebSocket backend server.'
      }
    ]
  },
  {
    id: 'prod-4',
    name: 'FinTrack - Fintech & Investment Dashboard Figma UI Kit',
    price: 4000,
    category: 'UI/UX',
    demoUrl: 'https://figma.example.com/fintrack',
    images: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541462608141-ad4979e408c9?auto=format&fit=crop&w=800&q=80'
    ],
    technologies: ['Figma', 'Auto Layout 5.0', 'Design System', 'Component Variables'],
    description: 'FinTrack is a premium Figma UI kit meticulously crafted for financial, stock trading, and crypto wallet management platforms. Contains over 150 component variants, dark/light modes, reusable design tokens, charts, invoices, and comprehensive wireframes.',
    features: [
      '100% vector, fully customizable with Figma variables',
      'Light & Dark mode token variations',
      'Auto-Layout 5.0 responsive scaling enabled',
      '45+ desktop & mobile screens ready to hand off',
      'Includes premium charting graphics, cards, table mockups, and icons'
    ],
    requirements: [
      'Figma Desktop or Web Account'
    ],
    version: '1.0.0',
    changelog: [
      {
        version: '1.0.0',
        date: '2026-01-01',
        changes: ['Initial Figma release']
      }
    ],
    license: 'Commercial Asset Licence',
    salesCount: 215,
    rating: 4.9,
    reviews: [
      {
        user: 'Maliha Ahmed',
        rating: 5,
        comment: 'Beautiful aesthetics. The component architecture makes it incredibly easy to swap styles and colors.',
        date: '2026-05-30'
      }
    ],
    faqs: []
  },
  {
    id: 'prod-5',
    name: 'AI Agent Generator - Intelligent Workflow Automator',
    price: 25000,
    category: 'AI Project',
    demoUrl: 'https://ai-agents.example.com',
    images: [
      'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1680814907495-752110058760?auto=format&fit=crop&w=800&q=80'
    ],
    technologies: ['Python', 'LangChain', 'FastAPI', 'Next.js 15', 'OpenAI API', 'VectorDB (Pinecone)'],
    description: 'An AI-powered autonomous agent system that allows users to create visual prompt pipelines, connect web scrapers, parse PDFs, index vectorized documentation, and deploy custom chatbot assistants to Slack, Discord, or WhatsApp in minutes.',
    features: [
      'Visual drag-and-drop prompt node builder',
      'RAG (Retrieval Augmented Generation) framework with Pinecone DB',
      'Long-term memory storage using Redis caching',
      'Supports OpenAI GPT-4o, Anthropic Claude, and Llama-3 local servers',
      'Next.js 15 UI to track active agent tokens, running costs, and chat transcripts'
    ],
    requirements: [
      'Python 3.10+',
      'Node.js 18+',
      'OpenAI or Anthropic API credentials',
      'Pinecone Database API key (Free Tier works)'
    ],
    version: '1.2.0',
    changelog: [
      {
        version: '1.2.0',
        date: '2026-06-10',
        changes: ['Added support for Claude 3.5 Sonnet', 'Integrated local Ollama execution support']
      }
    ],
    license: 'Commercial Software License',
    salesCount: 47,
    rating: 4.6,
    reviews: [
      {
        user: 'Imran Khan',
        rating: 4,
        comment: 'Very solid codebase. Setting up LangChain agents with custom tool functions was very straightforward.',
        date: '2026-06-25'
      }
    ],
    faqs: []
  },
  {
    id: 'prod-6',
    name: 'TaskFlow - Collaborative Project Management Suite',
    price: 15000,
    category: 'SaaS',
    demoUrl: 'https://taskflow.example.com',
    images: [
      'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80'
    ],
    technologies: ['Next.js 15', 'React 19', 'Tailwind CSS', 'TypeScript', 'Prisma', 'PostgreSQL', 'Socket.io'],
    description: 'TaskFlow is a multi-tenant project management platform with real-time kanban boards, Gantt charts, file sharing, role-based access control, and team chat rooms. Includes full dashboard analytics.',
    features: [
      'Real-time workspace sync using Socket.io',
      'Drag-and-drop Kanban Board layout',
      'Interactive Gantt timeline progress tracking',
      'Integrated text chat channels per project group'
    ],
    requirements: [
      'NodeJS 18+',
      'PostgreSQL database node'
    ],
    version: '1.0.0',
    changelog: [{ version: '1.0.0', date: '2026-07-01', changes: ['Initial code release'] }],
    license: 'Commercial License',
    salesCount: 38,
    rating: 4.7,
    reviews: [],
    faqs: []
  },
  {
    id: 'prod-7',
    name: 'MediCall - Telemedicine App for Doctors & Patients',
    price: 24000,
    category: 'Mobile App',
    demoUrl: 'https://medicall.example.com',
    images: [
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80'
    ],
    technologies: ['Flutter', 'Dart', 'Firebase', 'Agora WebRTC SDK', 'NodeJS'],
    description: 'MediCall is a premium cross-platform mobile application supporting online appointment bookings, virtual prescription management, and encrypted Agora video consulting.',
    features: [
      'Encrypted voice & video streaming using Agora WebRTC SDK',
      'Google Maps doctor search & specialty filters',
      'bKash / Card billing payments pre-integrated',
      'Prescription storage using secure Firebase nodes'
    ],
    requirements: [
      'Flutter SDK 3.19.x',
      'Agora Developer Token Credentials'
    ],
    version: '1.1.0',
    changelog: [{ version: '1.1.0', date: '2026-06-20', changes: ['Upgraded Agora SDK version'] }],
    license: 'Single-App Commercial License',
    salesCount: 29,
    rating: 4.8,
    reviews: [],
    faqs: []
  },
  {
    id: 'prod-8',
    name: 'AI SmartWriter - Automated SEO Content Creator',
    price: 9000,
    category: 'SaaS',
    demoUrl: 'https://smartwriter.example.com',
    images: [
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80'
    ],
    technologies: ['React', 'Next.js', 'OpenAI API', 'Tailwind CSS', 'NodeJS'],
    description: 'Generate high-conversion blog posts, marketing copies, and social media captions using tailored AI agents trained on industry best practices.',
    features: [
      'Structured templates for SEO outline generation',
      'Direct markdown export options',
      'Tone adjustments and multi-language support',
      'Token consumption usage history dashboards'
    ],
    requirements: [
      'Node.js 18+',
      'OpenAI API Key'
    ],
    version: '1.0.0',
    changelog: [{ version: '1.0.0', date: '2026-07-02', changes: ['Initial code release'] }],
    license: 'Commercial License',
    salesCount: 82,
    rating: 4.5,
    reviews: [],
    faqs: []
  }
];

export const mockCustomDeals: CustomDeal[] = [
  {
    id: 'deal-101',
    title: 'Hospital Management & Telemedicine Portal',
    description: 'We need a web-based Hospital Management portal. It will have patient booking, doctor dashboard, live video calling for consultations, and digital prescription generation. It needs a secure database, SMS notifications for appointments, and bKash payment support.',
    projectType: 'Web Application',
    budget: 85000,
    deadline: '2026-08-15',
    technology: 'Next.js, Tailwind CSS, PostgreSQL, WebRTC, Node.js',
    referenceWebsite: 'https://carehospital.example.com',
    priority: 'High',
    status: 'In Development',
    developer: 'Sabbir Ahmed (Senior Full-stack Dev)',
    overallProgress: 60,
    uploadedFiles: [
      { name: 'PRD_Hospital_Management.pdf', size: '1.2 MB', url: '#', type: 'pdf' },
      { name: 'Wireframes_v1.zip', size: '14.5 MB', url: '#', type: 'zip' }
    ],
    quotation: {
      totalCost: 85000,
      developmentTime: '45 Days',
      terms: [
        'Payment structure follows the agreed milestone layout.',
        '6 months of post-delivery maintenance and bug fixing included.',
        'Client will provide server hosting credentials or pay server costs separately.'
      ],
      supportPeriod: '6 Months Free Support',
      maintenanceOffer: '5,000 BDT/Month post warranty',
      milestones: [
        {
          id: 'm1',
          title: 'Requirement Analysis & UI/UX Figma Design',
          description: 'Define clear wireframes, page maps, branding, and interactive Figma layout for client approval.',
          cost: 25000,
          percentage: 30,
          status: 'Approved',
          paymentStatus: 'Paid',
          progress: 100,
          dueDate: '2026-07-10',
          deliverables: [
            { name: 'Figma_Branding_Prototypes.pdf', size: '4.8 MB', url: 'https://figma.com/file/mock-hospital-layout', type: 'pdf' },
            { name: 'Wireframes_Specification_PRD.pdf', size: '1.5 MB', url: 'https://drive.google.com/mock-prd.pdf', type: 'pdf' }
          ]
        },
        {
          id: 'm2',
          title: 'Frontend Development & Core Portal Setup',
          description: 'Implementation of the dashboard layout, appointment forms, doctor schedules, and UI pages.',
          cost: 30000,
          percentage: 35,
          status: 'Awaiting Approval',
          paymentStatus: 'Unpaid', // Customer needs to approve and pay this milestone
          dueDate: '2026-07-25'
        },
        {
          id: 'm3',
          title: 'Backend Integration & WebRTC Video Call module',
          description: 'Database design, video call signaling, prescription builder, API endpoints integration.',
          cost: 20000,
          percentage: 25,
          status: 'Pending',
          paymentStatus: 'Unpaid',
          dueDate: '2026-08-05'
        },
        {
          id: 'm4',
          title: 'Final Testing, Bug Fixing & Delivery',
          description: 'Load testing, security auditing, SMS gateway integration, and server deployment.',
          cost: 10000,
          percentage: 10,
          status: 'Pending',
          paymentStatus: 'Unpaid',
          dueDate: '2026-08-15'
        }
      ]
    },
    contractSigned: true,
    clientSignature: 'Dr. Mahbubul Alam',
    signedDate: '2026-06-28',
    credentials: {
      github: 'https://github.com/agency-internal/hospital-portal-client',
      cPanel: 'https://hospital-dev.agency.com:2083 (Dev server)',
      database: 'PostgreSQL Staging DB (Supabase)'
    }
  },
  {
    id: 'deal-102',
    title: 'E-Commerce Mobile App (Android & iOS)',
    description: 'Submit requirements for a brand new fashion e-commerce mobile application to sync with our Shopify backend. Need custom designs, push alerts, and easy apple/google pay options.',
    projectType: 'Mobile App',
    budget: 50000,
    deadline: '2026-09-01',
    technology: 'Flutter, Shopify Buy SDK, Firebase',
    priority: 'Medium',
    status: 'Discussion',
    uploadedFiles: [
      { name: 'AppRequirements.docx', size: '240 KB', url: '#', type: 'doc' }
    ],
    overallProgress: 10,
    contractSigned: false
  }
];

export const mockChatMessages: Record<string, ChatMessage[]> = {
  'deal-101': [
    {
      id: 'msg-1',
      sender: 'customer',
      content: 'Hello, we have uploaded the wireframes and requirement document. Could you look into it?',
      timestamp: '2026-06-25 10:15 AM'
    },
    {
      id: 'msg-2',
      sender: 'admin',
      content: 'Hi Dr. Mahbubul! Yes, our engineering team reviewed the documents. It seems very clear. We are designing the quotation now.',
      timestamp: '2026-06-25 11:30 AM'
    },
    {
      id: 'msg-3',
      sender: 'admin',
      content: 'We have updated the quotation in the dashboard. You can review it, check the 4 milestones, and accept the contract when ready.',
      timestamp: '2026-06-28 09:12 AM'
    },
    {
      id: 'msg-4',
      sender: 'customer',
      content: 'Perfect. I have reviewed the milestones, signed the contract online, and completed the advance payment of 25,000 BDT.',
      timestamp: '2026-06-28 11:45 AM'
    },
    {
      id: 'msg-5',
      sender: 'admin',
      content: 'Payment confirmed! Thank you. We have assigned Sabbir Ahmed to your project. He has started UI/UX designs. Here is our kickoff meeting Jitsi Link.',
      timestamp: '2026-06-28 02:00 PM',
      meetingLink: 'https://meet.jit.si/hospital-kickoff-agency'
    },
    {
      id: 'msg-6',
      sender: 'admin',
      content: 'Hi! We have finished Phase 1 (UI/UX design) and marked Phase 2 (Frontend setup) as ready for your approval. Can you check the Dev Server?',
      timestamp: '2026-07-04 04:30 PM'
    }
  ],
  'deal-102': [
    {
      id: 'msg-10',
      sender: 'customer',
      content: 'Hi, we submitted the requirements for our fashion store app. We need this ready before the Autumn Sale.',
      timestamp: '2026-07-04 11:20 AM'
    },
    {
      id: 'msg-11',
      sender: 'admin',
      content: 'Greetings! Thanks for reaching out. We see you want to connect to Shopify backend. Have you already created public custom app credentials in Shopify?',
      timestamp: '2026-07-05 09:15 AM'
    },
    {
      id: 'msg-12',
      sender: 'customer',
      content: 'Yes, we have custom API keys ready. Let us discuss the budget. Our budget is around 50,000 BDT. Is that workable?',
      timestamp: '2026-07-05 02:30 PM'
    }
  ]
};

export const mockInvoices: Invoice[] = [
  {
    id: 'inv-2001',
    invoiceNumber: 'INV-2026-001',
    dealId: 'deal-101',
    title: 'Hospital Telemedicine Portal - Advance payment (Milestone 1)',
    amount: 25000,
    tax: 1250, // 5%
    discount: 0,
    total: 26250,
    type: 'custom_milestone',
    status: 'Paid',
    date: '2026-06-28'
  },
  {
    id: 'inv-2002',
    invoiceNumber: 'INV-2026-002',
    productId: 'prod-1',
    title: 'DevFlow SaaS Starter Kit License Purchase',
    amount: 12000,
    tax: 0,
    discount: 1000, // Coupon
    total: 11000,
    type: 'ready_product',
    status: 'Paid',
    date: '2026-07-01'
  }
];

export const mockSupportTickets: SupportTicket[] = [
  {
    id: 'tkt-301',
    subject: 'Prisma migration error on local PostgreSQL host',
    description: 'When running npx prisma migrate dev, I get a DialectError saying Postgres SSL is required. How can I disable SSL for localhost database connection?',
    category: 'Technical',
    priority: 'Medium',
    status: 'In Progress',
    createdAt: '2026-07-02 03:20 PM',
    messages: [
      {
        sender: 'customer',
        content: 'When running npx prisma migrate dev, I get a DialectError saying Postgres SSL is required. How can I disable SSL for localhost database connection?',
        timestamp: '2026-07-02 03:20 PM'
      },
      {
        sender: 'admin',
        content: 'Hi! In your .env file, make sure the DATABASE_URL does not include sslmode=require. For localhost, you can change it to sslmode=disable, or omit sslmode entirely. Let me know if that works!',
        timestamp: '2026-07-02 05:40 PM'
      }
    ]
  }
];
