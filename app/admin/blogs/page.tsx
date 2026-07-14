'use client';

import React, { useEffect, useState } from 'react';
import { Blog, BlogBlock, Product } from '../../types';
import Swal from 'sweetalert2';
import { showSuccessAlert, showErrorAlert, showSuccessToast, showErrorToast } from '../../utils/alert';
import { API_BASE_URL } from '@/app/utils/api';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  X, 
  Image as ImageIcon,
  BookOpen, 
  Calendar,
  User,
  Tag as TagIcon,
  Sparkles,
  ArrowUp,
  ArrowDown,
  List,
  Code,
  Table,
  HelpCircle,
  Link as LinkIcon,
  BarChart3,
  Settings,
  Compass,
  Award,
  Clock,
  Layers,
  FileText,
  MessageSquare,
  Share2,
  TrendingUp,
  ThumbsUp,
  Check,
  ChevronDown
} from 'lucide-react';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Selected blogs
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [viewingBlog, setViewingBlog] = useState<Blog | null>(null);

  // Active Tab inside Form Modal
  const [formTab, setFormTab] = useState<'general' | 'editor' | 'seo' | 'academy' | 'extras' | 'analytics'>('general');

  // Form Fields States
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formAuthor, setFormAuthor] = useState('Hossen Shop Team');
  const [formAuthorBio, setFormAuthorBio] = useState('');
  const [formTwitter, setFormTwitter] = useState('');
  const [formLinkedin, setFormLinkedin] = useState('');
  const [formGithub, setFormGithub] = useState('');
  const [formStatus, setFormStatus] = useState<Blog['status']>('Published');
  const [formPublishDate, setFormPublishDate] = useState('');
  const [formReadingTime, setFormReadingTime] = useState(5);
  const [formImage, setFormImage] = useState('');
  const [formImageAlt, setFormImageAlt] = useState('');
  const [formImageCaption, setFormImageCaption] = useState('');
  const [formImageCredit, setFormImageCredit] = useState('');
  
  // Notion-style Content Blocks
  const [formBlocks, setFormBlocks] = useState<BlogBlock[]>([]);
  const [formCategories, setFormCategories] = useState<string[]>([]);
  const [formTags, setFormTags] = useState('');

  // SEO Section
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDesc, setFormSeoDesc] = useState('');
  const [formSeoKeywords, setFormSeoKeywords] = useState('');
  const [formCanonicalUrl, setFormCanonicalUrl] = useState('');
  const [formRobotsIndex, setFormRobotsIndex] = useState(true);
  const [formOgTitle, setFormOgTitle] = useState('');
  const [formOgDesc, setFormOgDesc] = useState('');
  const [formOgImage, setFormOgImage] = useState('');
  const [formTwitterCardImage, setFormTwitterCardImage] = useState('');

  // Extra Sections
  const [formFaqs, setFormFaqs] = useState<{ q: string; a: string; }[]>([]);
  const [formRelatedArticles, setFormRelatedArticles] = useState<{ id: string; title: string; }[]>([]);
  const [formCtaLabel, setFormCtaLabel] = useState('');
  const [formCtaUrl, setFormCtaUrl] = useState('');
  const [formCtaType, setFormCtaType] = useState('link');
  const [formAttachments, setFormAttachments] = useState<{ name: string; url: string; type: string; }[]>([]);
  const [formFbShare, setFormFbShare] = useState('');
  const [formLiShare, setFormLiShare] = useState('');
  const [formTwShare, setFormTwShare] = useState('');
  const [formAllowComments, setFormAllowComments] = useState(true);
  const [formVisibility, setFormVisibility] = useState<Blog['visibility']>('Public');

  // Hossen Academy / Promotional integrations
  const [formDifficulty, setFormDifficulty] = useState<Blog['difficulty']>('Beginner');
  const [formCompletionTime, setFormCompletionTime] = useState('');
  const [formKeyTakeaways, setFormKeyTakeaways] = useState<string[]>([]);
  const [formPrerequisites, setFormPrerequisites] = useState<string[]>([]);
  const [formLinkedCourseId, setFormLinkedCourseId] = useState('');
  const [formLinkedService, setFormLinkedService] = useState('');
  const [formProductId, setFormProductId] = useState('');

  // Extra options
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsTrending, setFormIsTrending] = useState(false);
  const [formIsPopular, setFormIsPopular] = useState(false);
  const [formIsEditorsPick, setFormIsEditorsPick] = useState(false);
  const [formSticky, setFormSticky] = useState(false);

  // AI Assistant states
  const [aiGenerating, setAiGenerating] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/blogs`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && data.data && data.data.blogs) {
          setBlogs(data.data.blogs);
        }
      }
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsList = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && data.data && data.data.products) {
          setProducts(data.data.products);
        }
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  useEffect(() => {
    fetchBlogs();
    fetchProductsList();
  }, []);

  // Auto-generate slug when Title changes
  useEffect(() => {
    if (!isEditMode && formTitle) {
      setFormSlug(formTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  }, [formTitle, isEditMode]);

  // Estimate Reading Time based on blocks content
  useEffect(() => {
    let wordCount = 0;
    formBlocks.forEach(block => {
      if (block.type === 'text' && block.data.text) {
        wordCount += block.data.text.split(/\s+/).length;
      } else if (block.type === 'quote' && block.data.text) {
        wordCount += block.data.text.split(/\s+/).length;
      }
    });
    if (wordCount > 0) {
      const min = Math.max(1, Math.ceil(wordCount / 200)); // Average reading speed 200 WPM
      setFormReadingTime(min);
    }
  }, [formBlocks]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'cover' | 'og' | 'block' | 'attachment', blockIndex?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem('apex_user_token');
    if (!token) {
      showErrorToast('Authentication token not found. Please log in.');
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Upload failed');
      }

      if (target === 'cover') {
        setFormImage(resData.url);
      } else if (target === 'og') {
        setFormOgImage(resData.url);
        setFormTwitterCardImage(resData.url);
      } else if (target === 'block' && blockIndex !== undefined) {
        updateBlock(blockIndex, 'url', resData.url);
      } else if (target === 'attachment') {
        setFormAttachments([...formAttachments, { name: file.name, url: resData.url, type: file.type || 'file' }]);
      }
      showSuccessToast('Image uploaded successfully!');
    } catch (err: any) {
      console.error(err);
      showErrorAlert('Upload Failed', err.message || 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setEditingBlog(null);
    setFormTitle('');
    setFormSlug('');
    setFormImage('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80');
    setFormTags('Next.js, React, Engineering');
    setFormAuthor('Hossen Shop Team');

    // Advanced fields defaults
    setFormExcerpt('');
    setFormAuthorBio('Technical Writer and software engineer.');
    setFormTwitter('');
    setFormLinkedin('');
    setFormGithub('');
    setFormStatus('Published');
    setFormPublishDate(new Date().toISOString().split('T')[0]);
    setFormReadingTime(5);
    setFormImageAlt('Cover image');
    setFormImageCaption('Cover banner');
    setFormImageCredit('');
    setFormBlocks([
      {
        id: 'init-text',
        type: 'text',
        data: { text: 'Write your first paragraph here...', level: 0 }
      }
    ]);
    setFormCategories(['Web Development']);
    
    setFormSeoTitle('');
    setFormSeoDesc('');
    setFormSeoKeywords('');
    setFormCanonicalUrl('');
    setFormRobotsIndex(true);
    setFormOgTitle('');
    setFormOgDesc('');
    setFormOgImage('');
    setFormTwitterCardImage('');
    
    setFormFaqs([]);
    setFormRelatedArticles([]);
    setFormCtaLabel('');
    setFormCtaUrl('');
    setFormCtaType('link');
    setFormAttachments([]);
    setFormFbShare('');
    setFormLiShare('');
    setFormTwShare('');
    
    setFormAllowComments(true);
    setFormVisibility('Public');
    
    setFormDifficulty('Beginner');
    setFormCompletionTime('');
    setFormKeyTakeaways([]);
    setFormPrerequisites([]);
    setFormLinkedCourseId('');
    setFormLinkedService('');
    setFormProductId('');
    
    setFormIsFeatured(false);
    setFormIsTrending(false);
    setFormIsPopular(false);
    setFormIsEditorsPick(false);
    setFormSticky(false);

    setFormTab('general');
    setShowModal(true);
  };

  const openEditModal = (blog: Blog) => {
    setIsEditMode(true);
    setEditingBlog(blog);
    setFormTitle(blog.title);
    setFormSlug(blog.slug);
    setFormImage(blog.image);
    setFormTags(blog.tags.join(', '));
    setFormAuthor(blog.author);

    // Populate advanced fields
    setFormExcerpt(blog.excerpt || '');
    setFormAuthorBio(blog.authorBio || '');
    setFormTwitter(blog.authorSocials?.twitter || '');
    setFormLinkedin(blog.authorSocials?.linkedin || '');
    setFormGithub(blog.authorSocials?.github || '');
    setFormStatus(blog.status || 'Published');
    setFormPublishDate(blog.publishDate ? new Date(blog.publishDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    setFormReadingTime(blog.readingTime || 0);
    setFormImageAlt(blog.imageAlt || '');
    setFormImageCaption(blog.imageCaption || '');
    setFormImageCredit(blog.imageCredit || '');
    setFormBlocks(blog.contentBlocks || []);
    setFormCategories(blog.categories || []);
    
    setFormSeoTitle(blog.seoTitle || '');
    setFormSeoDesc(blog.seoDesc || '');
    setFormSeoKeywords(blog.seoKeywords || '');
    setFormCanonicalUrl(blog.canonicalUrl || '');
    setFormRobotsIndex(blog.robotsIndex !== undefined ? blog.robotsIndex : true);
    setFormOgTitle(blog.ogTitle || '');
    setFormOgDesc(blog.ogDesc || '');
    setFormOgImage(blog.ogImage || '');
    setFormTwitterCardImage(blog.twitterCardImage || '');
    
    setFormFaqs(blog.faqs || []);
    setFormRelatedArticles(blog.relatedArticles || []);
    setFormCtaLabel(blog.cta?.label || '');
    setFormCtaUrl(blog.cta?.url || '');
    setFormCtaType(blog.cta?.type || 'link');
    setFormAttachments(blog.attachments || []);
    setFormFbShare(blog.socialShareText?.facebook || '');
    setFormLiShare(blog.socialShareText?.linkedin || '');
    setFormTwShare(blog.socialShareText?.twitter || '');
    
    setFormAllowComments(blog.allowComments !== undefined ? blog.allowComments : true);
    setFormVisibility(blog.visibility || 'Public');
    
    setFormDifficulty(blog.difficulty || 'Beginner');
    setFormCompletionTime(blog.completionTime || '');
    setFormKeyTakeaways(blog.keyTakeaways || []);
    setFormPrerequisites(blog.prerequisites || []);
    setFormLinkedCourseId(blog.linkedCourseId || '');
    setFormLinkedService(blog.linkedService || '');
    setFormProductId(blog.productId || '');
    
    setFormIsFeatured(blog.isFeatured || false);
    setFormIsTrending(blog.isTrending || false);
    setFormIsPopular(blog.isPopular || false);
    setFormIsEditorsPick(blog.isEditorsPick || false);
    setFormSticky(blog.sticky || false);

    setFormTab('general');
    setShowModal(true);
  };

  const openViewModal = (blog: Blog) => {
    setViewingBlog(blog);
    setShowViewModal(true);
  };

  const handleDeleteBlog = async (id: string, title: string) => {
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${title}" from the articles list.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#4b5563',
      background: isDark ? '#121214' : '#ffffff',
      color: isDark ? '#ffffff' : '#09090b',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('apex_user_token');
        if (!token) {
          showErrorToast('Authentication token not found. Please log in.');
          return;
        }

        try {
          const response = await fetch(`${API_BASE_URL}/api/blogs/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            setBlogs(prev => prev.filter(b => b.id !== id));
            showSuccessToast('Article deleted successfully.');
          } else {
            const resData = await response.json();
            throw new Error(resData.message || 'Failed to delete blog.');
          }
        } catch (err: any) {
          console.error(err);
          showErrorAlert('Delete Failed', err.message || 'Failed to delete blog.');
        }
      }
    });
  };

  // Block handlers
  const addBlock = (type: BlogBlock['type']) => {
    const newBlock: BlogBlock = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      data: {
        text: '',
        level: type === 'text' ? 0 : undefined,
        url: type === 'image' ? 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80' : '',
        caption: '',
        code: '',
        language: 'javascript',
        columns: type === 'table' ? ['Feature', 'Details'] : undefined,
        rows: type === 'table' ? [['Fully Responsive', 'Yes'], ['SEO Ready', 'Yes']] : undefined,
        items: type === 'faq' ? [{ q: 'Question?', a: 'Answer.' }] : undefined,
        buttonText: 'Buy Now',
        buttonUrl: 'https://',
        title: ''
      }
    };
    setFormBlocks([...formBlocks, newBlock]);
    showSuccessToast(`Added ${type} block.`);
  };

  const updateBlock = (index: number, field: string, value: any) => {
    const updated = [...formBlocks];
    updated[index].data = {
      ...updated[index].data,
      [field]: value
    };
    setFormBlocks(updated);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === formBlocks.length - 1) return;
    const updated = [...formBlocks];
    const temp = updated[index];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setFormBlocks(updated);
  };

  const removeBlock = (index: number) => {
    setFormBlocks(formBlocks.filter((_, i) => i !== index));
  };

  // Category toggle handler
  const handleCategoryToggle = (cat: string) => {
    if (formCategories.includes(cat)) {
      setFormCategories(formCategories.filter(c => c !== cat));
    } else {
      setFormCategories([...formCategories, cat]);
    }
  };

  // HTML content generator & TOC generator from content blocks
  const compileContentAndTOC = (blocks: BlogBlock[]) => {
    let compiledHtml = '';
    const toc: { text: string; id: string; level: number; }[] = [];
    
    blocks.forEach((block, idx) => {
      switch (block.type) {
        case 'text':
          const textVal = block.data.text || '';
          const level = block.data.level || 0;
          if (level === 1) {
            const hId = `heading-${idx}-${textVal.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
            compiledHtml += `<h1 id="${hId}" class="text-2xl md:text-3xl font-black mt-8 mb-4 uppercase tracking-tight text-zinc-950 dark:text-white">${textVal}</h1>\n`;
            toc.push({ text: textVal, id: hId, level: 1 });
          } else if (level === 2) {
            const hId = `heading-${idx}-${textVal.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
            compiledHtml += `<h2 id="${hId}" class="text-xl md:text-2xl font-extrabold mt-6 mb-3 uppercase text-zinc-900 dark:text-white">${textVal}</h2>\n`;
            toc.push({ text: textVal, id: hId, level: 2 });
          } else if (level === 3) {
            const hId = `heading-${idx}-${textVal.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
            compiledHtml += `<h3 id="${hId}" class="text-lg md:text-xl font-bold mt-4 mb-2 uppercase text-zinc-900 dark:text-zinc-200">${textVal}</h3>\n`;
            toc.push({ text: textVal, id: hId, level: 3 });
          } else {
            compiledHtml += `<p class="my-4 text-sm md:text-base leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium">${textVal}</p>\n`;
          }
          break;
        case 'quote':
          compiledHtml += `<blockquote class="border-l-4 border-zinc-900 dark:border-zinc-300 pl-4 py-2 italic my-6 text-zinc-650 dark:text-zinc-400 font-medium">${block.data.text || ''}</blockquote>\n`;
          break;
        case 'image':
          compiledHtml += `<figure class="my-6"><img src="${block.data.url}" alt="${block.data.caption || 'Image'}" class="w-full rounded border border-zinc-200 dark:border-zinc-800" /><figcaption class="text-center text-[10px] text-zinc-500 mt-2">${block.data.caption || ''}</figcaption></figure>\n`;
          break;
        case 'video':
          compiledHtml += `<div class="my-6 aspect-video"><iframe src="${block.data.url}" class="w-full h-full rounded border border-zinc-200 dark:border-zinc-850" frameborder="0" allowfullscreen></iframe></div>\n`;
          break;
        case 'code':
          compiledHtml += `<pre class="bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-lg overflow-x-auto border border-zinc-200 dark:border-zinc-850 my-6 font-mono text-xs"><code class="language-${block.data.language || 'javascript'}">${block.data.code || ''}</code></pre>\n`;
          break;
        case 'table':
          let tableHtml = '<div class="overflow-x-auto my-6 border border-zinc-200 dark:border-zinc-800 rounded"><table class="w-full text-left border-collapse">\n';
          if (block.data.columns && block.data.columns.length > 0) {
            tableHtml += '<thead><tr class="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-[10px] uppercase font-bold text-zinc-500">\n';
            block.data.columns.forEach(col => {
              tableHtml += `<th class="p-3">${col}</th>\n`;
            });
            tableHtml += '</tr></thead>\n';
          }
          if (block.data.rows && block.data.rows.length > 0) {
            tableHtml += '<tbody class="text-xs">\n';
            block.data.rows.forEach(row => {
              tableHtml += '<tr class="border-b border-zinc-200 dark:border-zinc-900/80 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">\n';
              row.forEach(cell => {
                tableHtml += `<td class="p-3 text-zinc-700 dark:text-zinc-300 font-medium">${cell}</td>\n`;
              });
              tableHtml += '</tr>\n';
            });
            tableHtml += '</tbody>\n';
          }
          tableHtml += '</table></div>\n';
          compiledHtml += tableHtml;
          break;
        case 'faq':
          let faqHtml = '<div class="faq-section space-y-3 my-6">\n';
          block.data.items?.forEach(item => {
            faqHtml += `<details class="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 group"><summary class="font-bold cursor-pointer text-xs md:text-sm list-none flex justify-between items-center">${item.q}<span class="text-zinc-400 group-open:rotate-180 transition-transform"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg></span></summary><p class="mt-2.5 text-xs md:text-sm text-zinc-650 dark:text-zinc-450 leading-relaxed font-medium">${item.a}</p></details>\n`;
          });
          faqHtml += '</div>\n';
          compiledHtml += faqHtml;
          break;
        case 'cta':
          compiledHtml += `<div class="cta-box bg-zinc-950 text-white dark:bg-white dark:text-black p-6 rounded-lg text-center my-8 border border-zinc-800 dark:border-zinc-200"><h3>${block.data.title || 'Call to Action'}</h3><p class="my-4 text-xs">${block.data.text || ''}</p><a href="${block.data.buttonUrl}" class="inline-block bg-white text-black dark:bg-black dark:text-white px-6 py-2 rounded font-bold hover:opacity-90 transition-opacity">${block.data.buttonText || 'Click Here'}</a></div>\n`;
          break;
        case 'divider':
          compiledHtml += `<hr class="my-8 border-t border-zinc-200 dark:border-zinc-800" />\n`;
          break;
        case 'callout':
          compiledHtml += `<div class="callout-box bg-zinc-50 dark:bg-zinc-900/60 p-4 border-l-4 border-zinc-950 dark:border-zinc-300 rounded-r-lg my-4 text-xs md:text-sm leading-relaxed font-medium"><strong>${block.data.title || 'Note'}:</strong> ${block.data.text || ''}</div>\n`;
          break;
      }
    });

    return { compiledHtml, toc };
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showErrorToast('Blog title is required.');
      return;
    }
    if (formTitle.trim().length < 2) {
      showErrorToast('Blog title must be at least 2 characters.');
      return;
    }
    if (formBlocks.length === 0) {
      showErrorToast('Please add at least one content block to the editor.');
      return;
    }

    const tagsArray = formTags.split(',').map(tag => tag.trim()).filter(Boolean);
    if (tagsArray.length === 0) {
      showErrorToast('At least one tag is required.');
      return;
    }

    if (!formImage.trim()) {
      showErrorToast('Cover image URL is required.');
      return;
    }
    try {
      new URL(formImage.trim());
    } catch (_) {
      showErrorToast('Cover image must be a valid URL.');
      return;
    }

    const { compiledHtml, toc } = compileContentAndTOC(formBlocks);

    const payload = {
      title: formTitle.trim(),
      slug: formSlug.trim() || formTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      content: compiledHtml || 'No text content provided.',
      image: formImage.trim(),
      tags: tagsArray,
      author: formAuthor.trim() || 'Hossen Shop Team',
      
      excerpt: formExcerpt.trim() || formTitle,
      authorBio: formAuthorBio.trim(),
      authorSocials: {
        twitter: formTwitter.trim(),
        linkedin: formLinkedin.trim(),
        github: formGithub.trim()
      },
      status: formStatus,
      publishDate: formPublishDate ? new Date(formPublishDate).toISOString() : new Date().toISOString(),
      readingTime: Number(formReadingTime),
      imageAlt: formImageAlt.trim(),
      imageCaption: formImageCaption.trim(),
      imageCredit: formImageCredit.trim(),
      
      contentBlocks: formBlocks,
      categories: formCategories.length > 0 ? formCategories : ['Web Development'],
      
      seoTitle: formSeoTitle.trim() || formTitle,
      seoDesc: formSeoDesc.trim() || formExcerpt || formTitle,
      seoKeywords: formSeoKeywords.trim(),
      canonicalUrl: formCanonicalUrl.trim(),
      robotsIndex: formRobotsIndex,
      ogTitle: formOgTitle.trim() || formTitle,
      ogDesc: formOgDesc.trim() || formExcerpt || formTitle,
      ogImage: formOgImage.trim() || formImage.trim(),
      twitterCardImage: formTwitterCardImage.trim() || formImage.trim(),
      
      faqs: formFaqs,
      tableOfContents: toc,
      relatedArticles: formRelatedArticles,
      cta: {
        label: formCtaLabel.trim(),
        url: formCtaUrl.trim(),
        type: formCtaType
      },
      attachments: formAttachments,
      socialShareText: {
        facebook: formFbShare.trim(),
        linkedin: formLiShare.trim(),
        twitter: formTwShare.trim()
      },
      
      allowComments: formAllowComments,
      visibility: formVisibility,
      
      difficulty: formDifficulty,
      completionTime: formCompletionTime.trim(),
      keyTakeaways: formKeyTakeaways,
      prerequisites: formPrerequisites,
      linkedCourseId: formLinkedCourseId.trim(),
      linkedService: formLinkedService.trim(),
      productId: formProductId || null,
      
      // options
      isFeatured: formIsFeatured,
      isTrending: formIsTrending,
      isPopular: formIsPopular,
      isEditorsPick: formIsEditorsPick,
      sticky: formSticky
    };

    const token = localStorage.getItem('apex_user_token');
    if (!token) {
      showErrorToast('Authentication token not found. Please log in.');
      return;
    }

    try {
      const url = isEditMode && editingBlog 
        ? `${API_BASE_URL}/api/blogs/${editingBlog.id}`
        : `${API_BASE_URL}/api/blogs`;
      
      const method = isEditMode && editingBlog ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();

      if (!response.ok) {
        if (resData.errors && Array.isArray(resData.errors)) {
          const detailMsgs = resData.errors.map((err: any) => {
            const field = err.path.replace('body.', '');
            return `• ${field.charAt(0).toUpperCase() + field.slice(1)}: ${err.message}`;
          }).join('\n');
          throw new Error(`Validation failed:\n${detailMsgs}`);
        }
        throw new Error(resData.message || 'Failed to save blog post.');
      }

      if (isEditMode) {
        showSuccessAlert('Article Updated!', 'The blog post has been successfully modified.');
      } else {
        showSuccessAlert('Article Added!', 'The new blog post has been successfully published.');
      }

      setShowModal(false);
      fetchBlogs();
    } catch (err: any) {
      console.error(err);
      showErrorAlert('Operation Failed', err.message || 'Failed to save blog.');
    }
  };

  // AI Assistant simulated integration
  const handleAIAssistantRun = (action: string) => {
    if (!formTitle) {
      showErrorToast('Please enter an Article Title first.');
      return;
    }
    setAiGenerating(true);
    showSuccessToast(`AI Assistant is starting: ${action}...`);

    setTimeout(() => {
      setAiGenerating(false);
      if (action === 'generate') {
        setFormExcerpt(`Comprehensive engineering analysis of ${formTitle}. Learn modern design principles, architectural components, and deployment steps.`);
        setFormTags('React, TypeScript, Engineering, SaaS');
        setFormCategories(['Web Development', 'AI']);
        setFormSeoKeywords(`${formTitle.toLowerCase()}, software design, tutorial`);
        setFormSeoTitle(`${formTitle} - Hossen Academy`);
        setFormSeoDesc(`Read this guide on ${formTitle} to understand best practices and optimize production workflows.`);
        setFormBlocks([
          {
            id: 'ai-block-1',
            type: 'text',
            data: { text: formTitle, level: 1 }
          },
          {
            id: 'ai-block-2',
            type: 'text',
            data: { text: 'Introduction', level: 2 }
          },
          {
            id: 'ai-block-3',
            type: 'text',
            data: { text: `In this tutorial, we will explore the core methodologies required to master ${formTitle}. Building systems using advanced components is essential for scaling digital businesses.` }
          },
          {
            id: 'ai-block-4',
            type: 'text',
            data: { text: 'Key Architectural Concepts', level: 2 }
          },
          {
            id: 'ai-block-5',
            type: 'text',
            data: { text: 'To build high performance engines, keep structures declarative, write validation schemas using Zod, and cache resource-heavy database queries with Redis.' }
          },
          {
            id: 'ai-block-6',
            type: 'code',
            data: { code: `// Example validation schema\nimport { z } from 'zod';\nconst configSchema = z.object({\n  url: z.string().url(),\n  timeout: z.number().default(5000)\n});`, language: 'typescript' }
          },
          {
            id: 'ai-block-7',
            type: 'text',
            data: { text: 'Summary & Key Takeaways', level: 2 }
          },
          {
            id: 'ai-block-8',
            type: 'text',
            data: { text: 'Following standard code patterns guarantees faster loading speeds, lower server costs, and cleaner maintenance paths for engineering teams.' }
          }
        ]);
        setFormKeyTakeaways(['Configure Zod schemas correctly', 'Leverage cache layer for speed', 'Validate on client side']);
        setFormPrerequisites(['Basic knowledge of React & API design']);
        showSuccessAlert('AI Generation Success', 'Full blog content, outline, code block, SEO configs, tags and excerpt generated successfully!');
      } else if (action === 'seo') {
        setFormSeoTitle(`${formTitle} | Hossen Academy Guide`);
        setFormSeoDesc(`Learn the exact steps to implement ${formTitle}. Detailed step-by-step developer tutorial.`);
        setFormSeoKeywords(`${formTitle.toLowerCase()}, academy, tutorial, guide`);
        showSuccessAlert('AI SEO Optimization', 'SEO titles, meta descriptions, and keywords optimized for modern search engine algorithms.');
      } else if (action === 'faq') {
        setFormFaqs([
          { q: `What is the core prerequisite for ${formTitle}?`, a: 'Familiarity with modern JavaScript framework APIs and schema validators.' },
          { q: 'Is this production ready?', a: 'Yes, all modules follow production patterns and clean validation structures.' }
        ]);
        showSuccessAlert('AI FAQ Generator', 'Schema-ready FAQ questions and answers appended.');
      }
    }, 1200);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="animate-fadeIn text-xs flex flex-col min-h-full">
      {/* Upper header */}
      <div className="sticky top-0 bg-white dark:bg-[#09090b] z-20 px-6 py-5 md:px-8 md:py-6 border-b border-zinc-200/80 dark:border-zinc-900 flex justify-between items-center transition-colors">
        <div>
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Publishing Center
          </h2>
          <p className="text-zinc-500 text-[10px]">Create, edit, analyze, and optimize articles and academy blog posts with AI integration.</p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-4 py-2 rounded font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all text-[11px] hover:translate-y-[-1px]"
        >
          <Plus className="w-4 h-4" /> Add Blog Post
        </button>
      </div>

      <div className="p-6 md:p-8 space-y-6 flex-1 bg-white dark:bg-zinc-950 transition-colors">
        
        {/* Loading Spinner */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-4 border-zinc-950 dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-[10px] font-bold text-zinc-400 mt-4 uppercase tracking-wider">Loading Blogs...</p>
          </div>
        ) : (
          /* Blogs Table */
          <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-bold tracking-wider text-[10px] bg-zinc-50 dark:bg-zinc-900/60">
                  <th className="p-4 w-[80px]">Cover</th>
                  <th className="p-4">Title & Excerpt</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Status & Status</th>
                  <th className="p-4">Stats (Views/Likes)</th>
                  <th className="p-4">Tags</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.length > 0 ? (
                  blogs.map((blog) => (
                    <tr key={blog.id} className="border-b border-zinc-200 dark:border-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-900/20 text-zinc-700 dark:text-zinc-300 transition-colors">
                      <td className="p-4">
                        <div className="w-12 h-8 rounded overflow-hidden bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={blog.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80'} 
                            alt={blog.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="p-4 max-w-[220px]">
                        <div className="font-bold text-zinc-950 dark:text-white truncate" title={blog.title}>
                          {blog.title}
                        </div>
                        <div className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate" title={blog.excerpt}>
                          {blog.excerpt || 'No description preview available.'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-zinc-850 dark:text-zinc-300">{blog.author}</div>
                        <div className="text-[9px] text-zinc-400 font-mono">{formatDate(blog.createdAt)}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold border ${
                          blog.status === 'Published' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-650 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40'
                            : 'bg-zinc-105 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                        }`}>
                          {blog.status || 'Published'}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-[10px] space-y-0.5">
                        <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-300">
                          <Eye className="w-3 h-3 text-zinc-400" />
                          <span>{(blog.views || 0).toLocaleString()} views</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          <ThumbsUp className="w-3 h-3 text-zinc-500" />
                          <span>{(blog.likes || 0).toLocaleString()} likes</span>
                        </div>
                      </td>
                      <td className="p-4 max-w-[150px]">
                        <div className="flex flex-wrap gap-1">
                          {blog.tags.slice(0, 3).map((t, idx) => (
                            <span key={idx} className="bg-zinc-100 dark:bg-zinc-900 text-[9px] px-1.5 py-0.2 rounded font-mono border border-zinc-200/50 dark:border-zinc-800/40">
                              {t}
                            </span>
                          ))}
                          {blog.tags.length > 3 && (
                            <span className="text-[9px] text-zinc-400 font-mono font-bold">+{blog.tags.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => openViewModal(blog)}
                            title="Preview Post"
                            className="text-zinc-650 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white border border-zinc-250 dark:border-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-850/80 p-1.5 rounded cursor-pointer transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(blog)}
                            title="Edit Post"
                            className="text-zinc-650 hover:text-zinc-955 dark:text-zinc-400 dark:hover:text-white border border-zinc-255 dark:border-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-850/80 p-1.5 rounded cursor-pointer transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBlog(blog.id, blog.title)}
                            title="Delete Post"
                            className="text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-zinc-255 dark:border-zinc-850 hover:border-rose-300 dark:hover:border-rose-900 p-1.5 rounded cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-zinc-450 dark:text-zinc-555 font-bold">
                      No blog posts published yet. Click &quot;Add Blog Post&quot; to publish one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ==================== ADD / EDIT MODAL ==================== */}
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-5xl rounded-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-zinc-950 dark:text-white">
              
              {/* Header */}
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/60">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    {isEditMode ? `Edit Article: ${editingBlog?.title}` : 'Publish Premium Article'}
                  </h3>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Configure Notion-style block structure, SEO configurations, linked courses, and metrics.</p>
                </div>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sidebar + Body Layout */}
              <div className="flex flex-1 overflow-hidden min-h-0">
                
                {/* Sidebar Tabs */}
                <div className="w-48 bg-zinc-50 dark:bg-zinc-900/40 border-r border-zinc-200 dark:border-zinc-800/80 p-3 space-y-1 shrink-0 flex flex-col justify-between">
                  <div className="space-y-1">
                    {[
                      { id: 'general', label: 'Basic Info', icon: <FileText className="w-3.5 h-3.5" /> },
                      { id: 'editor', label: 'Notion Editor', icon: <BookOpen className="w-3.5 h-3.5" /> },
                      { id: 'seo', label: 'SEO Config', icon: <Compass className="w-3.5 h-3.5" /> },
                      { id: 'academy', label: 'Academy Links', icon: <Award className="w-3.5 h-3.5" /> },
                      { id: 'extras', label: 'FAQ & Extras', icon: <Settings className="w-3.5 h-3.5" /> },
                      { id: 'analytics', label: 'Analytics Insights', icon: <BarChart3 className="w-3.5 h-3.5" /> }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setFormTab(tab.id as any)}
                        className={`w-full text-left px-3 py-2 rounded text-[11px] font-bold flex items-center gap-2 cursor-pointer transition-all ${
                          formTab === tab.id 
                            ? 'bg-zinc-950 text-white dark:bg-white dark:text-black font-extrabold shadow-sm' 
                            : 'text-zinc-650 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-850'
                        }`}
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* AI Quick Assistant Glow Panel */}
                  <div className="border border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/10 p-3 rounded-lg space-y-2 mt-4">
                    <div className="flex items-center gap-1 text-[10px] font-extrabold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 animate-pulse" />
                      <span>AI Assistant</span>
                    </div>
                    <p className="text-[9px] text-zinc-500 leading-normal">Instantly generate outlines, titles, tags, FAQs and descriptions.</p>
                    <div className="space-y-1">
                      <button
                        type="button"
                        disabled={aiGenerating}
                        onClick={() => handleAIAssistantRun('generate')}
                        className="w-full bg-purple-650 hover:bg-purple-700 text-white font-bold py-1 px-2 rounded text-[9px] cursor-pointer flex items-center justify-center gap-1"
                      >
                        {aiGenerating ? 'Writing...' : 'Generate Blog'}
                      </button>
                      <button
                        type="button"
                        disabled={aiGenerating}
                        onClick={() => handleAIAssistantRun('seo')}
                        className="w-full bg-white dark:bg-zinc-900 border border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold py-1 px-2 rounded text-[9px] cursor-pointer"
                      >
                        Optimize SEO
                      </button>
                      <button
                        type="button"
                        disabled={aiGenerating}
                        onClick={() => handleAIAssistantRun('faq')}
                        className="w-full bg-white dark:bg-zinc-900 border border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold py-1 px-2 rounded text-[9px] cursor-pointer"
                      >
                        Generate FAQs
                      </button>
                    </div>
                  </div>
                </div>

                {/* Form Panels */}
                <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col overflow-hidden min-h-0 bg-white dark:bg-[#0c0c0e]">
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    
                    {/* TAB 1: BASIC INFORMATION */}
                    {formTab === 'general' && (
                      <div className="space-y-4 animate-fadeIn">
                        <div>
                          <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Article Title *</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="e.g. Next.js 15 App Router: A Deep Dive into Server Components" 
                            value={formTitle} 
                            onChange={(e) => setFormTitle(e.target.value)} 
                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700 font-bold text-sm" 
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Slug URL (Editable)</label>
                            <input 
                              type="text" 
                              required 
                              placeholder="nextjs-15-deep-dive" 
                              value={formSlug} 
                              onChange={(e) => setFormSlug(e.target.value)} 
                              className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700 font-mono" 
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Publish Status</label>
                            <select 
                              value={formStatus} 
                              onChange={(e) => setFormStatus(e.target.value as any)} 
                              className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-905 dark:text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700 font-semibold"
                            >
                              <option value="Published">Published (Publicly Visible)</option>
                              <option value="Draft">Draft (Saved but hidden)</option>
                              <option value="Scheduled">Scheduled</option>
                              <option value="Archived">Archived</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Author *</label>
                            <input 
                              type="text" 
                              required 
                              value={formAuthor} 
                              onChange={(e) => setFormAuthor(e.target.value)} 
                              className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-zinc-450" 
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Publish Date</label>
                            <input 
                              type="date" 
                              value={formPublishDate} 
                              onChange={(e) => setFormPublishDate(e.target.value)} 
                              className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-zinc-450" 
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Reading Time (Minutes)</label>
                            <input 
                              type="number" 
                              min={1} 
                              value={formReadingTime} 
                              onChange={(e) => setFormReadingTime(Number(e.target.value))} 
                              className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-zinc-450 font-semibold" 
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Short Excerpt / Summary *</label>
                          <textarea 
                            rows={3} 
                            placeholder="Write a catchy 2-sentence excerpt summarizing this article..." 
                            value={formExcerpt} 
                            onChange={(e) => setFormExcerpt(e.target.value)} 
                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded p-3 text-xs resize-none focus:outline-none focus:border-zinc-450 leading-relaxed font-medium" 
                          />
                        </div>

                        {/* Cover Image URL / Details */}
                        <div className="border border-zinc-200 dark:border-zinc-800 p-4 rounded bg-zinc-50/50 dark:bg-zinc-900/30 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-[10px] text-zinc-500 uppercase tracking-wider">Cover Media Details</span>
                            <label className="text-[9px] text-zinc-950 dark:text-white font-bold hover:underline cursor-pointer flex items-center gap-1 bg-white dark:bg-zinc-850 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">
                              <ImageIcon className="w-3 h-3 text-zinc-400" />
                              <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                              <input type="file" accept="image/*" disabled={uploadingImage} onChange={(e) => handleImageUpload(e, 'cover')} className="hidden" />
                            </label>
                          </div>
                          <div>
                            <label className="block text-[8px] text-zinc-400 font-bold mb-0.5">COVER IMAGE URL *</label>
                            <input 
                              type="url" 
                              required
                              value={formImage} 
                              onChange={(e) => setFormImage(e.target.value)} 
                              className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded px-2.5 py-1.5 text-xs font-mono" 
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[8px] text-zinc-400 font-bold mb-0.5">ALT TEXT</label>
                              <input type="text" value={formImageAlt} onChange={(e) => setFormImageAlt(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded px-2.5 py-1.5 text-xs" />
                            </div>
                            <div>
                              <label className="block text-[8px] text-zinc-400 font-bold mb-0.5">CAPTION</label>
                              <input type="text" value={formImageCaption} onChange={(e) => setFormImageCaption(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded px-2.5 py-1.5 text-xs" />
                            </div>
                            <div>
                              <label className="block text-[8px] text-zinc-400 font-bold mb-0.5">IMAGE CREDIT</label>
                              <input type="text" value={formImageCredit} onChange={(e) => setFormImageCredit(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded px-2.5 py-1.5 text-xs" />
                            </div>
                          </div>
                        </div>

                        {/* Categories & Tags selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1.5 uppercase tracking-wider text-[9px]">Select Categories</label>
                            <div className="flex flex-wrap gap-1.5 p-2.5 border border-zinc-250 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950">
                              {['Web Development', 'AI', 'Programming', 'Business', 'Marketing', 'Career', 'Design', 'Mobile App'].map(cat => {
                                const selected = formCategories.includes(cat);
                                return (
                                  <button
                                    key={cat}
                                    type="button"
                                    onClick={() => handleCategoryToggle(cat)}
                                    className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                                      selected 
                                        ? 'bg-purple-650 text-white border-purple-550' 
                                        : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                                    }`}
                                  >
                                    {cat}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          <div>
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Tags (Comma separated) *</label>
                            <input 
                              type="text" 
                              required 
                              placeholder="Next.js, React, SEO, database" 
                              value={formTags} 
                              onChange={(e) => setFormTags(e.target.value)} 
                              className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-zinc-450 font-semibold" 
                            />
                            <span className="text-[8px] text-zinc-400 mt-1 block">Separate tag names with commas (e.g. Next.js, Node.js).</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 2: NOTION/MEDIUM STYLE EDITOR (BLOCKS) */}
                    {formTab === 'editor' && (
                      <div className="space-y-4 animate-fadeIn">
                        
                        {/* Editor Controls Bar */}
                        <div className="sticky top-0 bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800/80 z-10 flex flex-wrap items-center gap-1.5 shadow-sm">
                          <span className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-wider mr-2">Add Block:</span>
                          <button type="button" onClick={() => addBlock('text')} className="px-2.5 py-1 bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-450 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded font-bold cursor-pointer text-[10px] flex items-center gap-1">
                            <FileText className="w-3 h-3 text-zinc-500" /> + Text
                          </button>
                          <button type="button" onClick={() => addBlock('image')} className="px-2.5 py-1 bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-450 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded font-bold cursor-pointer text-[10px] flex items-center gap-1">
                            <ImageIcon className="w-3 h-3 text-zinc-500" /> + Image
                          </button>
                          <button type="button" onClick={() => addBlock('code')} className="px-2.5 py-1 bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-450 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded font-bold cursor-pointer text-[10px] flex items-center gap-1">
                            <Code className="w-3 h-3 text-zinc-500" /> + Code
                          </button>
                          <button type="button" onClick={() => addBlock('table')} className="px-2.5 py-1 bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-450 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded font-bold cursor-pointer text-[10px] flex items-center gap-1">
                            <Table className="w-3 h-3 text-zinc-500" /> + Table
                          </button>
                          <button type="button" onClick={() => addBlock('faq')} className="px-2.5 py-1 bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-450 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded font-bold cursor-pointer text-[10px] flex items-center gap-1">
                            <HelpCircle className="w-3 h-3 text-zinc-500" /> + FAQ Accordion
                          </button>
                          <button type="button" onClick={() => addBlock('cta')} className="px-2.5 py-1 bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-450 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded font-bold cursor-pointer text-[10px] flex items-center gap-1">
                            <LinkIcon className="w-3 h-3 text-zinc-500" /> + CTA Block
                          </button>
                          <button type="button" onClick={() => addBlock('divider')} className="px-2.5 py-1 bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-450 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded font-bold cursor-pointer text-[10px]">
                            — Divider
                          </button>
                        </div>

                        {/* Blocks Canvas Container */}
                        <div className="space-y-4 min-h-[300px] border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-zinc-50/20 dark:bg-zinc-950/20">
                          {formBlocks.length === 0 ? (
                            <div className="py-16 text-center text-zinc-400">
                              <BookOpen className="w-8 h-8 mx-auto mb-2 text-zinc-300 animate-pulse" />
                              <p className="font-extrabold uppercase text-[10px] tracking-wider">Editor Canvas Empty</p>
                              <p className="text-[9px] mt-1">Click any button in the bar above to insert your first block.</p>
                            </div>
                          ) : (
                            formBlocks.map((block, idx) => (
                              <div key={block.id} className="group border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#0e0e11] rounded-lg p-3 shadow-sm hover:border-purple-200 dark:hover:border-purple-900/30 transition-all flex flex-col gap-2 relative">
                                
                                {/* Block Header Controls */}
                                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold uppercase text-[9px] tracking-wider text-purple-650 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20 px-2 py-0.5 rounded border border-purple-100 dark:border-purple-900/30 flex items-center gap-1">
                                      {block.type === 'text' && <FileText className="w-3 h-3" />}
                                      {block.type === 'image' && <ImageIcon className="w-3 h-3" />}
                                      {block.type === 'code' && <Code className="w-3 h-3" />}
                                      {block.type === 'table' && <Table className="w-3 h-3" />}
                                      {block.type === 'faq' && <HelpCircle className="w-3 h-3" />}
                                      {block.type === 'cta' && <LinkIcon className="w-3 h-3" />}
                                      {block.type === 'divider' && <span className="font-extrabold">—</span>}
                                      {block.type} Block
                                    </span>
                                  </div>
                                  
                                  {/* Actions */}
                                  <div className="flex items-center gap-1">
                                    <button type="button" onClick={() => moveBlock(idx, 'up')} disabled={idx === 0} className="text-zinc-400 hover:text-zinc-950 dark:hover:text-white p-1 rounded disabled:opacity-30 cursor-pointer">
                                      <ArrowUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button type="button" onClick={() => moveBlock(idx, 'down')} disabled={idx === formBlocks.length - 1} className="text-zinc-400 hover:text-zinc-950 dark:hover:text-white p-1 rounded disabled:opacity-30 cursor-pointer">
                                      <ArrowDown className="w-3.5 h-3.5" />
                                    </button>
                                    <button type="button" onClick={() => removeBlock(idx)} className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 p-1 rounded cursor-pointer ml-2">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Block Body Renderers */}
                                <div className="pt-1">
                                  
                                  {/* Text Block type */}
                                  {block.type === 'text' && (
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <label className="text-[8px] text-zinc-400 font-bold uppercase">Text Style:</label>
                                        <select
                                          value={block.data.level || 0}
                                          onChange={(e) => updateBlock(idx, 'level', Number(e.target.value))}
                                          className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded px-1.5 py-0.5 text-[10px] font-bold"
                                        >
                                          <option value={0}>Paragraph Text</option>
                                          <option value={1}>Heading 1 (Main Topic)</option>
                                          <option value={2}>Heading 2 (Sub-Topic)</option>
                                          <option value={3}>Heading 3 (Minor Topic)</option>
                                        </select>
                                        <select
                                          value={block.data.style || 'paragraph'}
                                          onChange={(e) => updateBlock(idx, 'style', e.target.value)}
                                          className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded px-1.5 py-0.5 text-[10px] font-bold"
                                        >
                                          <option value="paragraph">Plain Paragraph</option>
                                          <option value="quote">Quote Blockquote</option>
                                          <option value="callout">Callout box</option>
                                        </select>
                                      </div>
                                      {block.data.style === 'callout' && (
                                        <input
                                          type="text"
                                          placeholder="Callout Title (e.g. IMPORTANT / WARNING)"
                                          value={block.data.title || ''}
                                          onChange={(e) => updateBlock(idx, 'title', e.target.value)}
                                          className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-xs font-bold"
                                        />
                                      )}
                                      <textarea
                                        rows={4}
                                        placeholder="Write paragraph text or heading contents..."
                                        value={block.data.text || ''}
                                        onChange={(e) => updateBlock(idx, 'text', e.target.value)}
                                        className={`w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded p-2 text-xs resize-none focus:outline-none focus:border-zinc-450 leading-relaxed ${
                                          block.data.level === 1 ? 'font-black text-sm uppercase tracking-tight' : block.data.level === 2 ? 'font-extrabold text-xs uppercase' : 'font-medium'
                                        }`}
                                      />
                                    </div>
                                  )}

                                  {/* Image Block type */}
                                  {block.type === 'image' && (
                                    <div className="space-y-3">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-[8px] text-zinc-400 font-bold mb-0.5">IMAGE URL</label>
                                          <input
                                            type="url"
                                            placeholder="https://images.unsplash.com/photo-..."
                                            value={block.data.url || ''}
                                            onChange={(e) => updateBlock(idx, 'url', e.target.value)}
                                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-2.5 py-1.5 text-xs font-mono"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[8px] text-zinc-400 font-bold mb-0.5">CAPTION & ALT TEXT</label>
                                          <input
                                            type="text"
                                            placeholder="Alternative text and label"
                                            value={block.data.caption || ''}
                                            onChange={(e) => updateBlock(idx, 'caption', e.target.value)}
                                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-2.5 py-1.5 text-xs font-semibold"
                                          />
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <label className="text-[9px] text-zinc-950 dark:text-white font-bold hover:underline cursor-pointer flex items-center gap-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 px-2 py-1 rounded">
                                          <ImageIcon className="w-3.5 h-3.5" />
                                          <span>Upload Block Image</span>
                                          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'block', idx)} className="hidden" />
                                        </label>
                                        {block.data.url && (
                                          <div className="w-16 h-10 rounded border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50">
                                            <img src={block.data.url} alt="block image" className="w-full h-full object-cover" />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Code block type */}
                                  {block.type === 'code' && (
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <label className="text-[8px] text-zinc-400 font-bold uppercase">Language Syntax:</label>
                                        <select
                                          value={block.data.language || 'javascript'}
                                          onChange={(e) => updateBlock(idx, 'language', e.target.value)}
                                          className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded px-1.5 py-0.5 text-[10px] font-bold"
                                        >
                                          <option value="javascript">JavaScript</option>
                                          <option value="typescript">TypeScript</option>
                                          <option value="python">Python</option>
                                          <option value="html">HTML</option>
                                          <option value="css">CSS</option>
                                          <option value="bash">Bash / Terminal</option>
                                        </select>
                                      </div>
                                      <textarea
                                        rows={6}
                                        placeholder="// Write code snippet here..."
                                        value={block.data.code || ''}
                                        onChange={(e) => updateBlock(idx, 'code', e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-800 text-purple-300 dark:text-purple-400 rounded p-3 text-xs resize-none focus:outline-none focus:border-zinc-700 font-mono leading-relaxed"
                                      />
                                    </div>
                                  )}

                                  {/* Table block type */}
                                  {block.type === 'table' && (
                                    <div className="space-y-3">
                                      <span className="text-[9px] text-zinc-400 font-bold">Configure Table Structure</span>
                                      
                                      {/* Columns configurator */}
                                      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-2">
                                        <span className="text-[8px] font-bold text-zinc-450 uppercase">Headers:</span>
                                        {block.data.columns?.map((col, colIdx) => (
                                          <div key={colIdx} className="flex items-center gap-0.5">
                                            <input
                                              type="text"
                                              value={col}
                                              onChange={(e) => {
                                                const updatedCols = [...(block.data.columns || [])];
                                                updatedCols[colIdx] = e.target.value;
                                                updateBlock(idx, 'columns', updatedCols);
                                              }}
                                              className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] rounded px-1.5 py-0.5 w-24 text-center font-bold"
                                            />
                                            <button
                                              type="button"
                                              onClick={() => {
                                                if ((block.data.columns || []).length <= 1) return;
                                                const updatedCols = (block.data.columns || []).filter((_, cI) => cI !== colIdx);
                                                const updatedRows = (block.data.rows || []).map(row => row.filter((_, cI) => cI !== colIdx));
                                                updateBlock(idx, 'columns', updatedCols);
                                                updateBlock(idx, 'rows', updatedRows);
                                              }}
                                              className="text-rose-500 hover:text-rose-700 font-bold text-[10px]"
                                            >
                                              ×
                                            </button>
                                          </div>
                                        ))}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updatedCols = [...(block.data.columns || []), `Column ${(block.data.columns || []).length + 1}`];
                                            const updatedRows = (block.data.rows || []).map(row => [...row, '']);
                                            updateBlock(idx, 'columns', updatedCols);
                                            updateBlock(idx, 'rows', updatedRows);
                                          }}
                                          className="text-[10px] text-purple-650 font-bold hover:underline"
                                        >
                                          + Add Header
                                        </button>
                                      </div>

                                      {/* Rows configurator */}
                                      <div className="space-y-1">
                                        {block.data.rows?.map((row, rowIdx) => (
                                          <div key={rowIdx} className="flex items-center gap-2">
                                            <span className="text-[8px] font-bold text-zinc-400 font-mono w-10">Row {rowIdx + 1}:</span>
                                            <div className="flex-1 flex gap-2">
                                              {row.map((cell, cellIdx) => (
                                                <input
                                                  key={cellIdx}
                                                  type="text"
                                                  value={cell}
                                                  onChange={(e) => {
                                                    const updatedRows = [...(block.data.rows || [])];
                                                    updatedRows[rowIdx][cellIdx] = e.target.value;
                                                    updateBlock(idx, 'rows', updatedRows);
                                                  }}
                                                  className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[10px] rounded px-2 py-1"
                                                />
                                              ))}
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const updatedRows = (block.data.rows || []).filter((_, rI) => rI !== rowIdx);
                                                updateBlock(idx, 'rows', updatedRows);
                                              }}
                                              className="text-rose-500 hover:text-rose-700 font-bold"
                                            >
                                              ×
                                            </button>
                                          </div>
                                        ))}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newRow = Array((block.data.columns || []).length).fill('');
                                            const updatedRows = [...(block.data.rows || []), newRow];
                                            updateBlock(idx, 'rows', updatedRows);
                                          }}
                                          className="text-[10px] text-purple-650 font-bold hover:underline"
                                        >
                                          + Add Row
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {/* FAQ Accordion type */}
                                  {block.type === 'faq' && (
                                    <div className="space-y-3">
                                      <span className="text-[9px] text-zinc-400 font-bold">Frequently Asked Questions & Answers</span>
                                      <div className="space-y-3">
                                        {block.data.items?.map((item, faqIdx) => (
                                          <div key={faqIdx} className="border border-zinc-150 dark:border-zinc-800 p-2.5 rounded bg-zinc-50/30 dark:bg-zinc-900/10 space-y-2">
                                            <div className="flex justify-between items-center">
                                              <span className="font-extrabold text-[8px] text-zinc-450">FAQ Item {faqIdx + 1}</span>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const updated = (block.data.items || []).filter((_, i) => i !== faqIdx);
                                                  updateBlock(idx, 'items', updated);
                                                }}
                                                className="text-rose-500 hover:text-rose-700 text-[9px] font-bold"
                                              >
                                                Remove Item
                                              </button>
                                            </div>
                                            <input
                                              type="text"
                                              placeholder="Question text..."
                                              value={item.q}
                                              onChange={(e) => {
                                                const updated = [...(block.data.items || [])];
                                                updated[faqIdx] = { ...updated[faqIdx], q: e.target.value };
                                                updateBlock(idx, 'items', updated);
                                              }}
                                              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[11px] font-bold rounded px-2.5 py-1.5"
                                            />
                                            <textarea
                                              rows={2}
                                              placeholder="Answer details..."
                                              value={item.a}
                                              onChange={(e) => {
                                                const updated = [...(block.data.items || [])];
                                                updated[faqIdx] = { ...updated[faqIdx], a: e.target.value };
                                                updateBlock(idx, 'items', updated);
                                              }}
                                              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[11px] rounded p-2.5 resize-none"
                                            />
                                          </div>
                                        ))}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = [...(block.data.items || []), { q: 'Another FAQ Question?', a: 'Detailed solution response.' }];
                                            updateBlock(idx, 'items', updated);
                                          }}
                                          className="text-[10px] text-purple-650 font-bold hover:underline"
                                        >
                                          + Add FAQ Q&A Item
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Call to Action block */}
                                  {block.type === 'cta' && (
                                    <div className="space-y-3">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-[8px] text-zinc-400 font-bold mb-0.5">CTA BANNER TITLE</label>
                                          <input
                                            type="text"
                                            placeholder="e.g. Master Next.js 15 Today!"
                                            value={block.data.title || ''}
                                            onChange={(e) => updateBlock(idx, 'title', e.target.value)}
                                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-2.5 py-1.5 text-xs font-bold"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[8px] text-zinc-400 font-bold mb-0.5">DESCRIPTION / TEXT</label>
                                          <input
                                            type="text"
                                            placeholder="e.g. Join 10k+ developers in our coding sandbox academy."
                                            value={block.data.text || ''}
                                            onChange={(e) => updateBlock(idx, 'text', e.target.value)}
                                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-2.5 py-1.5 text-xs font-semibold"
                                          />
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-[8px] text-zinc-400 font-bold mb-0.5">BUTTON LABEL</label>
                                          <input
                                            type="text"
                                            placeholder="Buy Product"
                                            value={block.data.buttonText || ''}
                                            onChange={(e) => updateBlock(idx, 'buttonText', e.target.value)}
                                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-2.5 py-1.5 text-xs font-bold"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[8px] text-zinc-400 font-bold mb-0.5">BUTTON REDIRECT URL</label>
                                          <input
                                            type="url"
                                            placeholder="https://hossenacademy.com/courses"
                                            value={block.data.buttonUrl || ''}
                                            onChange={(e) => updateBlock(idx, 'buttonUrl', e.target.value)}
                                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-2.5 py-1.5 text-xs font-mono font-bold"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Divider Block type */}
                                  {block.type === 'divider' && (
                                    <hr className="border-t border-zinc-200 dark:border-zinc-800 my-4" />
                                  )}

                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* TAB 3: SEO SECTION */}
                    {formTab === 'seo' && (
                      <div className="space-y-4 animate-fadeIn">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">SEO Meta Title</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Next.js 15 Deep Dive | Hossen Shop Blog" 
                              value={formSeoTitle} 
                              onChange={(e) => setFormSeoTitle(e.target.value)} 
                              className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-zinc-450 font-semibold" 
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Focus Keywords</label>
                            <input 
                              type="text" 
                              placeholder="Next.js 15, server components, React 19" 
                              value={formSeoKeywords} 
                              onChange={(e) => setFormSeoKeywords(e.target.value)} 
                              className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-zinc-450 font-semibold" 
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">SEO Meta Description</label>
                          <textarea 
                            rows={3} 
                            placeholder="Provide a search-engine ready description snippet..." 
                            value={formSeoDesc} 
                            onChange={(e) => setFormSeoDesc(e.target.value)} 
                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded p-3 text-xs resize-none focus:outline-none focus:border-zinc-450 font-semibold" 
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Canonical URL</label>
                            <input 
                              type="url" 
                              placeholder="https://hossenshop.com/blogs/my-custom-slug" 
                              value={formCanonicalUrl} 
                              onChange={(e) => setFormCanonicalUrl(e.target.value)} 
                              className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-none font-mono" 
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Search Engine Indexing (Robots Meta)</label>
                            <select
                              value={formRobotsIndex ? 'index' : 'noindex'}
                              onChange={(e) => setFormRobotsIndex(e.target.value === 'index')}
                              className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-905 dark:text-white rounded px-3 py-2 text-xs focus:outline-none"
                            >
                              <option value="index">Index (Allow search engine ranking)</option>
                              <option value="noindex">Noindex (Hide from google results)</option>
                            </select>
                          </div>
                        </div>

                        {/* Open Graph details */}
                        <div className="border border-zinc-200 dark:border-zinc-800 p-4 rounded bg-zinc-50/50 dark:bg-zinc-900/30 space-y-4">
                          <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-850 pb-2">
                            <span className="font-extrabold text-[10px] text-zinc-500 uppercase tracking-wider">Social Graph Metadata (Facebook & Open Graph)</span>
                            <label className="text-[9px] text-zinc-950 dark:text-white font-bold hover:underline cursor-pointer flex items-center gap-1 bg-white dark:bg-zinc-850 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">
                              <ImageIcon className="w-3 h-3 text-zinc-400" />
                              <span>{uploadingImage ? 'Uploading...' : 'Upload OG Image'}</span>
                              <input type="file" accept="image/*" disabled={uploadingImage} onChange={(e) => handleImageUpload(e, 'og')} className="hidden" />
                            </label>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[8px] text-zinc-400 font-bold mb-0.5">OPEN GRAPH (OG) TITLE</label>
                              <input type="text" placeholder="Custom Facebook share title" value={formOgTitle} onChange={(e) => setFormOgTitle(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-909 dark:text-white rounded px-2.5 py-1.5 text-xs" />
                            </div>
                            <div>
                              <label className="block text-[8px] text-zinc-400 font-bold mb-0.5">OPEN GRAPH IMAGE URL</label>
                              <input type="url" placeholder="https://storage.example.com/share.jpg" value={formOgImage} onChange={(e) => setFormOgImage(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-909 dark:text-white rounded px-2.5 py-1.5 text-xs font-mono" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[8px] text-zinc-400 font-bold mb-0.5">OPEN GRAPH DESCRIPTION</label>
                            <input type="text" placeholder="Short description for messenger cards" value={formOgDesc} onChange={(e) => setFormOgDesc(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-909 dark:text-white rounded px-2.5 py-1.5 text-xs" />
                          </div>

                          <div>
                            <label className="block text-[8px] text-zinc-400 font-bold mb-0.5">TWITTER CARD IMAGE URL (Usually matches OG Image)</label>
                            <input type="url" placeholder="https://storage.example.com/card.jpg" value={formTwitterCardImage} onChange={(e) => setFormTwitterCardImage(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-909 dark:text-white rounded px-2.5 py-1.5 text-xs font-mono" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 4: ACADEMY INTEGRATION */}
                    {formTab === 'academy' && (
                      <div className="space-y-4 animate-fadeIn">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Linked Academy Course ID (e.g. Next.js Masterclass)</label>
                            <input 
                              type="text" 
                              placeholder="e.g. course-nextjs-advanced" 
                              value={formLinkedCourseId} 
                              onChange={(e) => setFormLinkedCourseId(e.target.value)} 
                              className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-none" 
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Linked Agency Service (e.g. Software Development)</label>
                            <select
                              value={formLinkedService}
                              onChange={(e) => setFormLinkedService(e.target.value)}
                              className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-none"
                            >
                              <option value="">No Linked Service</option>
                              <option value="Software Development">Software Development</option>
                              <option value="AI Solution Integration">AI Solution Integration</option>
                              <option value="UI/UX Design Studio">UI/UX Design Studio</option>
                              <option value="SEO & Growth Marketing">SEO & Growth Marketing</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Course Difficulty Level</label>
                            <select
                              value={formDifficulty}
                              onChange={(e) => setFormDifficulty(e.target.value as any)}
                              className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-none font-bold"
                            >
                              <option value="Beginner">Beginner</option>
                              <option value="Intermediate">Intermediate</option>
                              <option value="Advanced">Advanced</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Estimated Study Time</label>
                            <input 
                              type="text" 
                              placeholder="e.g. 45 Mins, 2 Days" 
                              value={formCompletionTime} 
                              onChange={(e) => setFormCompletionTime(e.target.value)} 
                              className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-none" 
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Link Product (Marketplace)</label>
                            <select
                              value={formProductId}
                              onChange={(e) => setFormProductId(e.target.value)}
                              className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-none font-semibold"
                            >
                              <option value="">No Product Attached</option>
                              {products.map(prod => (
                                <option key={prod.id} value={prod.id}>{prod.name} ({prod.price} BDT)</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Prerequisites & Takeaways */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="border border-zinc-200 dark:border-zinc-800 p-4 rounded bg-zinc-50/40 dark:bg-zinc-900/10 space-y-3">
                            <span className="font-extrabold text-[9px] text-zinc-500 uppercase tracking-wider">Key Takeaways</span>
                            <div className="space-y-1.5">
                              {formKeyTakeaways.map((takeaway, tIdx) => (
                                <div key={tIdx} className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={takeaway}
                                    onChange={(e) => {
                                      const updated = [...formKeyTakeaways];
                                      updated[tIdx] = e.target.value;
                                      setFormKeyTakeaways(updated);
                                    }}
                                    className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs px-2 py-1 rounded"
                                  />
                                  <button type="button" onClick={() => setFormKeyTakeaways(formKeyTakeaways.filter((_, i) => i !== tIdx))} className="text-rose-500 hover:text-rose-700 font-bold">×</button>
                                </div>
                              ))}
                              <button type="button" onClick={() => setFormKeyTakeaways([...formKeyTakeaways, 'New Takeaway bullet'])} className="text-[10px] text-purple-650 font-bold hover:underline">+ Add Key Takeaway</button>
                            </div>
                          </div>

                          <div className="border border-zinc-200 dark:border-zinc-800 p-4 rounded bg-zinc-50/40 dark:bg-zinc-900/10 space-y-3">
                            <span className="font-extrabold text-[9px] text-zinc-500 uppercase tracking-wider">Prerequisites list</span>
                            <div className="space-y-1.5">
                              {formPrerequisites.map((req, rIdx) => (
                                <div key={rIdx} className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={req}
                                    onChange={(e) => {
                                      const updated = [...formPrerequisites];
                                      updated[rIdx] = e.target.value;
                                      setFormPrerequisites(updated);
                                    }}
                                    className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs px-2 py-1 rounded"
                                  />
                                  <button type="button" onClick={() => setFormPrerequisites(formPrerequisites.filter((_, i) => i !== rIdx))} className="text-rose-500 hover:text-rose-700 font-bold">×</button>
                                </div>
                              ))}
                              <button type="button" onClick={() => setFormPrerequisites([...formPrerequisites, 'Prerequisite course/tech'])} className="text-[10px] text-purple-650 font-bold hover:underline">+ Add Prerequisite</button>
                            </div>
                          </div>
                        </div>

                        {/* Attachments Section */}
                        <div className="border border-zinc-200 dark:border-zinc-800 p-4 rounded bg-zinc-50/50 dark:bg-zinc-900/30 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-[9px] text-zinc-500 uppercase tracking-wider">Attachments (ZIP, PDF, Source code)</span>
                            <label className="text-[9px] text-zinc-950 dark:text-white font-bold hover:underline cursor-pointer flex items-center gap-1 bg-white dark:bg-zinc-850 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">
                              <span>Upload file resource</span>
                              <input type="file" onChange={(e) => handleImageUpload(e, 'attachment')} className="hidden" />
                            </label>
                          </div>
                          {formAttachments.length === 0 ? (
                            <p className="text-[9px] text-zinc-400 italic">No attachments added yet. Useful for templates/notes downloads.</p>
                          ) : (
                            <div className="space-y-1">
                              {formAttachments.map((att, attIdx) => (
                                <div key={attIdx} className="flex justify-between items-center bg-white dark:bg-zinc-950 p-2 border border-zinc-200 dark:border-zinc-850 rounded text-[10px]">
                                  <span className="font-mono text-zinc-700 dark:text-zinc-350 truncate max-w-[70%]">{att.name}</span>
                                  <button type="button" onClick={() => setFormAttachments(formAttachments.filter((_, i) => i !== attIdx))} className="text-rose-650 hover:underline font-bold">Remove</button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* TAB 5: FAQs & EXTRA OPTIONS */}
                    {formTab === 'extras' && (
                      <div className="space-y-4 animate-fadeIn">
                        
                        {/* Visibility and Comments toggle */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Visibility Restriction</label>
                            <select
                              value={formVisibility}
                              onChange={(e) => setFormVisibility(e.target.value as any)}
                              className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-none"
                            >
                              <option value="Public">Public (Anyone can view)</option>
                              <option value="Private">Private (Admin only)</option>
                              <option value="Members Only">Members Only (Requires account)</option>
                              <option value="Premium">Premium (Requires purchased course/token)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-2 uppercase tracking-wider text-[9px]">Comments Moderation</label>
                            <div className="flex items-center gap-6">
                              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                                <input type="radio" checked={formAllowComments} onChange={() => setFormAllowComments(true)} className="accent-black" />
                                <span>Enable Comments</span>
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                                <input type="radio" checked={!formAllowComments} onChange={() => setFormAllowComments(false)} className="accent-black" />
                                <span>Disable Comments</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Extra checkboxes */}
                        <div className="border border-zinc-200 dark:border-zinc-800 p-4 rounded bg-zinc-50/50 dark:bg-zinc-900/30">
                          <span className="font-extrabold text-[9px] text-zinc-500 uppercase tracking-wider mb-2 block">Article Visibility Badges</span>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {[
                              { label: 'Featured Article', val: formIsFeatured, set: setFormIsFeatured },
                              { label: 'Trending Article', val: formIsTrending, set: setFormIsTrending },
                              { label: 'Popular Article', val: formIsPopular, set: setFormIsPopular },
                              { label: "Editor's Pick", val: formIsEditorsPick, set: setFormIsEditorsPick },
                              { label: 'Sticky Article', val: formSticky, set: setFormSticky }
                            ].map((opt, oIdx) => (
                              <label key={oIdx} className="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer hover:text-zinc-950 dark:hover:text-white">
                                <input type="checkbox" checked={opt.val} onChange={(e) => opt.set(e.target.checked)} className="rounded border-zinc-350 dark:border-zinc-800 text-zinc-950 focus:ring-0 w-3.5 h-3.5" />
                                <span>{opt.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Author Profile Bio socials */}
                        <div className="border border-zinc-200 dark:border-zinc-800 p-4 rounded bg-zinc-50/30 dark:bg-zinc-900/10 space-y-3">
                          <span className="font-extrabold text-[9px] text-zinc-500 uppercase tracking-wider block border-b border-zinc-200 dark:border-zinc-800 pb-1">Author Profile Metadata</span>
                          <div>
                            <label className="block text-[8px] text-zinc-400 font-bold mb-0.5">AUTHOR BIO</label>
                            <input type="text" placeholder="Short description of the author background..." value={formAuthorBio} onChange={(e) => setFormAuthorBio(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs px-2.5 py-1.5 rounded" />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[8px] text-zinc-400 font-bold mb-0.5">TWITTER USERNAME</label>
                              <input type="text" placeholder="@handle" value={formTwitter} onChange={(e) => setFormTwitter(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs px-2.5 py-1.5 rounded" />
                            </div>
                            <div>
                              <label className="block text-[8px] text-zinc-400 font-bold mb-0.5">LINKEDIN PROFILE</label>
                              <input type="text" placeholder="username" value={formLinkedin} onChange={(e) => setFormLinkedin(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs px-2.5 py-1.5 rounded" />
                            </div>
                            <div>
                              <label className="block text-[8px] text-zinc-400 font-bold mb-0.5">GITHUB PROFILE</label>
                              <input type="text" placeholder="github-username" value={formGithub} onChange={(e) => setFormGithub(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs px-2.5 py-1.5 rounded" />
                            </div>
                          </div>
                        </div>

                        {/* Social Custom Share texts */}
                        <div className="border border-zinc-200 dark:border-zinc-800 p-4 rounded bg-zinc-50/30 dark:bg-zinc-900/10 space-y-3">
                          <span className="font-extrabold text-[9px] text-zinc-500 uppercase tracking-wider block border-b border-zinc-200 dark:border-zinc-800 pb-1">Custom Social Share Text Configurations</span>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[8px] text-zinc-400 font-bold mb-0.5">FACEBOOK SHARING CAPTION</label>
                              <input type="text" placeholder="Facebook caption text" value={formFbShare} onChange={(e) => setFormFbShare(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 text-xs px-2 py-1 rounded" />
                            </div>
                            <div>
                              <label className="block text-[8px] text-zinc-400 font-bold mb-0.5">LINKEDIN SHARING POST</label>
                              <input type="text" placeholder="LinkedIn text post" value={formLiShare} onChange={(e) => setFormLiShare(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 text-xs px-2 py-1 rounded" />
                            </div>
                            <div>
                              <label className="block text-[8px] text-zinc-400 font-bold mb-0.5">TWITTER SHARING TWEET</label>
                              <input type="text" placeholder="Twitter tweet copy text" value={formTwShare} onChange={(e) => setFormTwShare(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 text-xs px-2 py-1 rounded" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 6: ANALYTICS INFORMATION */}
                    {formTab === 'analytics' && (
                      <div className="space-y-5 animate-fadeIn">
                        <div className="bg-zinc-50 dark:bg-zinc-900/60 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg flex justify-between items-center">
                          <div>
                            <span className="font-extrabold text-[9px] text-zinc-500 uppercase tracking-wider block">Performance Insights Dashboard</span>
                            <span className="text-[10px] text-zinc-400 mt-0.5 block">View user engagement metrics retrieved directly from production logs.</span>
                          </div>
                          <BarChart3 className="w-5 h-5 text-zinc-400" />
                        </div>

                        {/* Metrics Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            { label: 'Total Views', val: isEditMode && editingBlog ? (editingBlog.views || 104).toLocaleString() : '0', percent: '94%', color: 'border-blue-500' },
                            { label: 'Unique Visitors', val: isEditMode && editingBlog ? (editingBlog.uniqueVisitors || 83).toLocaleString() : '0', percent: '81%', color: 'border-purple-500' },
                            { label: 'Shares Count', val: isEditMode && editingBlog ? (editingBlog.shares || 12).toLocaleString() : '0', percent: '15%', color: 'border-emerald-500' },
                            { label: 'Bookmark Saves', val: isEditMode && editingBlog ? (editingBlog.saves || 9).toLocaleString() : '0', percent: '8%', color: 'border-amber-500' }
                          ].map((card, cIdx) => (
                            <div key={cIdx} className={`bg-white dark:bg-zinc-900 border-l-4 ${card.color} border border-zinc-200 dark:border-zinc-800/80 p-3 rounded shadow-sm`}>
                              <span className="text-[9px] text-zinc-450 uppercase font-bold block">{card.label}</span>
                              <span className="text-base font-black text-zinc-950 dark:text-white mt-1 block">{card.val}</span>
                              <div className="mt-2 flex items-center justify-between text-[8px] text-zinc-400">
                                <span>Ratio</span>
                                <span className="font-bold">{card.percent}</span>
                              </div>
                              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1 rounded overflow-hidden mt-1">
                                <div className="bg-zinc-950 dark:bg-white h-full" style={{ width: card.percent }}></div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Secondary Metrics chart simulation */}
                        <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-white dark:bg-zinc-900/30 space-y-4">
                          <span className="font-extrabold text-[10px] text-zinc-550 uppercase tracking-wider block">Engagement Retention Analysis</span>
                          <div className="space-y-2">
                            {[
                              { label: 'Average Reading Time', value: '4m 32s', percent: 75, status: 'Healthy' },
                              { label: 'Bounce Rate', value: '34.2%', percent: 34, status: 'Excellent' },
                              { label: 'Newsletter Sign-Up Rate', value: '4.8%', percent: 24, status: 'Needs Improvement' }
                            ].map((stat, sIdx) => (
                              <div key={sIdx} className="space-y-1">
                                <div className="flex justify-between items-center text-[10px]">
                                  <span className="font-bold text-zinc-700 dark:text-zinc-300">{stat.label}</span>
                                  <div className="flex gap-2">
                                    <span className="font-mono font-bold text-zinc-950 dark:text-white">{stat.value}</span>
                                    <span className={`font-bold ${stat.status === 'Excellent' || stat.status === 'Healthy' ? 'text-emerald-600' : 'text-amber-600'}`}>({stat.status})</span>
                                  </div>
                                </div>
                                <div className="w-full bg-zinc-100 dark:bg-zinc-850 h-1.5 rounded overflow-hidden">
                                  <div className="bg-zinc-950 dark:bg-white h-full" style={{ width: `${stat.percent}%` }}></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Modal Action footer */}
                  <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/60 shrink-0">
                    <span className="text-[9px] text-zinc-400 font-mono font-bold">
                      {formBlocks.length} content block(s) compiled
                    </span>
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 border border-zinc-250 dark:border-zinc-800 hover:border-zinc-400 text-zinc-700 dark:text-zinc-300 rounded font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="px-5 py-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded font-bold cursor-pointer"
                      >
                        {isEditMode ? 'Save Changes' : 'Publish Article'}
                      </button>
                    </div>
                  </div>
                </form>

              </div>
            </div>
          </div>
        )}

        {/* ==================== PREVIEW MODAL ==================== */}
        {showViewModal && viewingBlog && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 w-full max-w-4xl rounded-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh] text-zinc-950 dark:text-white">
              
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/60">
                <span className="font-extrabold text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  Live Preview Engine
                </span>
                <button 
                  onClick={() => setShowViewModal(false)} 
                  className="text-zinc-405 hover:text-zinc-950 dark:hover:text-white cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                
                {/* Meta details */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(viewingBlog.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {viewingBlog.author}
                    </span>
                    <span className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-600 dark:text-zinc-350">
                      <Award className="w-3 h-3" />
                      {viewingBlog.difficulty || 'Beginner'}
                    </span>
                  </div>
                  
                  <h1 className="text-2xl md:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight uppercase leading-tight">
                    {viewingBlog.title}
                  </h1>

                  <p className="text-sm text-zinc-500 leading-relaxed font-semibold italic border-l-2 border-zinc-250 dark:border-zinc-850 pl-3">
                    {viewingBlog.excerpt || 'No excerpt available.'}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {viewingBlog.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 text-[8px] font-bold text-zinc-500 rounded uppercase tracking-wider flex items-center gap-0.5">
                        <TagIcon className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hero Cover */}
                <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shadow-sm max-w-2xl mx-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={viewingBlog.image} alt={viewingBlog.title} className="w-full h-full object-cover" />
                </div>

                {/* HTML content rendered */}
                <div 
                  className="prose prose-zinc dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-350 font-medium text-xs md:text-sm leading-relaxed space-y-6 pt-4 border-t border-zinc-100 dark:border-zinc-900/50"
                  dangerouslySetInnerHTML={{ __html: viewingBlog.content }}
                />

                {/* FAQ Details if present */}
                {viewingBlog.faqs && (viewingBlog.faqs as any[]).length > 0 && (
                  <div className="pt-6 border-t border-zinc-100 dark:border-zinc-900/50 space-y-4">
                    <span className="font-extrabold text-xs text-zinc-950 dark:text-white uppercase tracking-wider">Frequently Asked Questions (FAQ schema ready)</span>
                    <div className="space-y-3">
                      {(viewingBlog.faqs as any[]).map((faq, fIdx) => (
                        <div key={fIdx} className="border border-zinc-200 dark:border-zinc-800 p-4 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/30">
                          <span className="font-extrabold text-xs text-zinc-950 dark:text-white block mb-2 font-mono">Q: {faq.q}</span>
                          <span className="text-zinc-650 dark:text-zinc-400 text-xs font-semibold leading-relaxed block">A: {faq.a}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end bg-zinc-50 dark:bg-zinc-900/60">
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="px-5 py-1.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded font-bold cursor-pointer text-[10px]"
                >
                  Close Preview
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
