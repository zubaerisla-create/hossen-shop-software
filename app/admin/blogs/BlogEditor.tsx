'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Blog, BlogBlock, Product } from '../../types';
import Swal from 'sweetalert2';
import { showSuccessAlert, showErrorAlert, showSuccessToast, showErrorToast } from '../../utils/alert';
import { API_BASE_URL } from '@/app/utils/api';
import { 
  Plus, 
  Trash2, 
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
  Check,
  ChevronDown,
  ArrowLeft,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';

interface BlogEditorProps {
  blogId?: string;
}

export default function BlogEditor({ blogId }: BlogEditorProps) {
  const router = useRouter();
  const isEditMode = !!blogId;

  const [loading, setLoading] = useState(isEditMode);
  const [products, setProducts] = useState<Product[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Active Tab inside Editor Form
  const [formTab, setFormTab] = useState<'general' | 'editor' | 'seo' | 'academy' | 'extras' | 'analytics'>('general');

  // Form Fields States
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formAuthor, setFormAuthor] = useState('Hossen Shop Team');
  const [formAuthorBio, setFormAuthorBio] = useState('Technical Writer and software engineer.');
  const [formTwitter, setFormTwitter] = useState('');
  const [formLinkedin, setFormLinkedin] = useState('');
  const [formGithub, setFormGithub] = useState('');
  const [formStatus, setFormStatus] = useState<Blog['status']>('Published');
  const [formPublishDate, setFormPublishDate] = useState(new Date().toISOString().split('T')[0]);
  const [formReadingTime, setFormReadingTime] = useState(5);
  const [formImage, setFormImage] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80');
  const [formImageAlt, setFormImageAlt] = useState('Cover image');
  const [formImageCaption, setFormImageCaption] = useState('Cover banner');
  const [formImageCredit, setFormImageCredit] = useState('');
  
  // Notion-style Content Blocks
  const [formBlocks, setFormBlocks] = useState<BlogBlock[]>([
    {
      id: 'init-text',
      type: 'text',
      data: { text: 'Write your first paragraph here...', level: 0 }
    }
  ]);
  const [formCategories, setFormCategories] = useState<string[]>(['Web Development']);
  const [formTags, setFormTags] = useState('Next.js, React, Engineering');

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

  useEffect(() => {
    fetchProductsList();
    if (blogId) {
      fetchBlogDetails();
    }
  }, [blogId]);

  // Auto-calculate reading time based on text content blocks
  useEffect(() => {
    let wordCount = 0;
    formBlocks.forEach(b => {
      if (b.type === 'text' && b.data.text) {
        wordCount += b.data.text.trim().split(/\s+/).length;
      }
    });
    if (wordCount > 0) {
      const min = Math.max(1, Math.ceil(wordCount / 200)); // Average reading speed 200 WPM
      setFormReadingTime(min);
    }
  }, [formBlocks]);

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

  const fetchBlogDetails = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/blogs/${blogId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && data.data?.blog) {
          const blog: Blog = data.data.blog;
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
        }
      }
    } catch (err) {
      console.error('Failed to fetch blog details:', err);
      showErrorToast('Failed to load blog details.');
    } finally {
      setLoading(false);
    }
  };

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
            faqHtml += `<details class="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 group"><summary class="font-bold cursor-pointer text-xs md:text-sm list-none flex justify-between items-center">${item.q}<span class="text-zinc-400 group-open:rotate-180 transition-transform"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg></span></summary><p class="mt-2.5 text-xs md:text-sm text-zinc-650 dark:text-zinc-455 leading-relaxed font-medium">${item.a}</p></details>\n`;
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

    setIsSaving(true);
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
      setIsSaving(false);
      return;
    }

    try {
      const url = isEditMode
        ? `${API_BASE_URL}/api/blogs/${blogId}`
        : `${API_BASE_URL}/api/blogs`;
      
      const method = isEditMode ? 'PUT' : 'POST';

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

      router.push('/admin/blogs');
    } catch (err: any) {
      console.error(err);
      showErrorAlert('Operation Failed', err.message || 'Failed to save blog.');
    } finally {
      setIsSaving(false);
    }
  };

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
        const testOutline: BlogBlock[] = [
          {
            id: 'ai-h1-1',
            type: 'text',
            data: { text: `Understanding ${formTitle}`, level: 1 }
          },
          {
            id: 'ai-p1',
            type: 'text',
            data: { text: `This article provides an in-depth exploration of ${formTitle}, covering core methodologies, real-world developer use cases, and configuration patterns.`, level: 0 }
          },
          {
            id: 'ai-quote',
            type: 'quote',
            data: { text: 'Developing elegant technology is about mastering simplicity inside complex software architectures.' }
          },
          {
            id: 'ai-h1-2',
            type: 'text',
            data: { text: 'Key Architectural Concepts', level: 2 }
          },
          {
            id: 'ai-code',
            type: 'code',
            data: { code: '// Configure custom configurations\nconst config = {\n  debug: true,\n  staggerInterval: 15,\n  mode: "production"\n};\nconsole.log("System initialized:", config);', language: 'javascript' }
          }
        ];
        setFormBlocks(testOutline);
        setFormExcerpt(`An industry guide discussing the core aspects of ${formTitle} with optimization strategies.`);
        setFormTags(`${formTitle.split(' ')[0]}, Development, Tech`);
        showSuccessToast('AI successfully drafted a structural article outline!');
      } else if (action === 'seo') {
        setFormSeoTitle(`${formTitle} | Hossen Software Shop Insights`);
        setFormSeoDesc(`Read the latest developer guide about ${formTitle} published by the software engineering team at Hossen Software Shop.`);
        setFormSeoKeywords(`${formTitle.toLowerCase().split(' ').join(', ')}, software development, web app`);
        showSuccessToast('AI optimized all SEO and Meta Tags!');
      } else if (action === 'faq') {
        setFormFaqs([
          { q: `What is the primary benefit of ${formTitle}?`, a: `It simplifies standard coding procedures while maintaining robust performance across target systems.` },
          { q: 'Is this guide suitable for beginners?', a: 'Yes, this tutorial covers foundational modules before introducing complex optimization patterns.' }
        ]);
        showSuccessToast('AI generated structured FAQ schema!');
      }
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-2.5">
        <Loader2 className="w-8 h-8 animate-spin text-purple-650" />
        <span className="text-xs uppercase font-extrabold tracking-wider text-zinc-400">Loading Article Details...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      
      {/* Top action header */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => router.push('/admin/blogs')} 
            className="p-2 border border-zinc-250 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base md:text-lg font-black uppercase tracking-tight text-zinc-950 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" />
              {isEditMode ? 'Edit Article Editor' : 'Create Premium Article'}
            </h1>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Notion-style full block structure editor. All changes will be saved to production database.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push('/admin/blogs')}
            className="px-4 py-2 border border-zinc-250 dark:border-zinc-800 hover:border-zinc-400 text-zinc-700 dark:text-zinc-350 text-xs font-extrabold rounded-lg uppercase tracking-wider transition-colors cursor-pointer"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={handleFormSubmit}
            disabled={isSaving}
            className="px-5 py-2 bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-extrabold rounded-lg uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{isEditMode ? 'Save Changes' : 'Publish Blog'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Main Content Area */}
      <div className="flex flex-1 overflow-hidden min-h-0 bg-white dark:bg-[#0c0c0e]">
        
        {/* Left Sidebar navigation */}
        <div className="w-48 bg-zinc-50 dark:bg-zinc-900/40 border-r border-zinc-200 dark:border-zinc-800/80 p-4 space-y-1 shrink-0 flex flex-col justify-between overflow-y-auto">
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
                className={`w-full text-left px-3 py-2.5 rounded text-[11px] font-bold flex items-center gap-2.5 cursor-pointer transition-all ${
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

          {/* AI Quick Assistant Panel */}
          <div className="border border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/10 p-3.5 rounded-lg space-y-2.5 mt-8 shrink-0">
            <div className="flex items-center gap-1 text-[10px] font-extrabold text-purple-750 dark:text-purple-300 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 animate-pulse text-purple-500" />
              <span>AI Writing Copilot</span>
            </div>
            <p className="text-[9px] text-zinc-500 leading-normal font-semibold">Generate outlines, titles, tags, FAQs and SEO summaries.</p>
            <div className="space-y-1.5">
              <button
                type="button"
                disabled={aiGenerating}
                onClick={() => handleAIAssistantRun('generate')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-1.5 px-2 rounded text-[9px] cursor-pointer flex items-center justify-center gap-1 shadow-sm transition-all disabled:opacity-50"
              >
                {aiGenerating ? 'Writing...' : 'Draft Outline'}
              </button>
              <button
                type="button"
                disabled={aiGenerating}
                onClick={() => handleAIAssistantRun('seo')}
                className="w-full bg-white dark:bg-zinc-900 border border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-300 font-bold py-1 px-2 rounded text-[9px] cursor-pointer hover:bg-purple-50 transition-colors"
              >
                AI SEO Optimizer
              </button>
              <button
                type="button"
                disabled={aiGenerating}
                onClick={() => handleAIAssistantRun('faq')}
                className="w-full bg-white dark:bg-zinc-900 border border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-300 font-bold py-1 px-2 rounded text-[9px] cursor-pointer hover:bg-purple-50 transition-colors"
              >
                Generate FAQ schema
              </button>
            </div>
          </div>
        </div>

        {/* Right Main Form Container */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          
          {/* TAB 1: BASIC INFORMATION */}
          {formTab === 'general' && (
            <div className="space-y-5 animate-fadeIn w-full">
              <div>
                <label className="block text-zinc-500 dark:text-zinc-400 font-extrabold mb-1 uppercase tracking-wider text-[9px]">Article Title *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Next.js 15 App Router: A Deep Dive into Server Components" 
                  value={formTitle} 
                  onChange={(e) => setFormTitle(e.target.value)} 
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-500 font-black" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-500 dark:text-zinc-400 font-extrabold mb-1 uppercase tracking-wider text-[9px]">Slug URL (Editable)</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="nextjs-15-deep-dive" 
                    value={formSlug} 
                    onChange={(e) => setFormSlug(e.target.value)} 
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-purple-500 font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 dark:text-zinc-400 font-extrabold mb-1 uppercase tracking-wider text-[9px]">Publish Status</label>
                  <select 
                    value={formStatus} 
                    onChange={(e) => setFormStatus(e.target.value as any)} 
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-purple-500 font-semibold cursor-pointer"
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
                  <label className="block text-zinc-500 dark:text-zinc-400 font-extrabold mb-1 uppercase tracking-wider text-[9px]">Author Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={formAuthor} 
                    onChange={(e) => setFormAuthor(e.target.value)} 
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-purple-500" 
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 dark:text-zinc-400 font-extrabold mb-1 uppercase tracking-wider text-[9px]">Publish Date</label>
                  <input 
                    type="date" 
                    value={formPublishDate} 
                    onChange={(e) => setFormPublishDate(e.target.value)} 
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-lg px-3 py-2.5 text-xs focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 dark:text-zinc-400 font-extrabold mb-1 uppercase tracking-wider text-[9px]">Reading Time (Minutes)</label>
                  <input 
                    type="number" 
                    min={1} 
                    value={formReadingTime} 
                    onChange={(e) => setFormReadingTime(Number(e.target.value))} 
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-purple-500 font-semibold" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-500 dark:text-zinc-400 font-extrabold mb-1 uppercase tracking-wider text-[9px]">Short Excerpt / Summary *</label>
                <textarea 
                  rows={4} 
                  placeholder="Write a catchy excerpt summarizing this article..." 
                  value={formExcerpt} 
                  onChange={(e) => setFormExcerpt(e.target.value)} 
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-lg p-3.5 text-xs focus:outline-none focus:border-purple-500 leading-relaxed font-semibold" 
                />
              </div>

              {/* Cover Image Details */}
              <div className="border border-zinc-200 dark:border-zinc-800 p-5 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-[10px] text-zinc-500 uppercase tracking-wider">Cover Media Details</span>
                  <label className="text-[9px] text-zinc-950 dark:text-white font-extrabold hover:underline cursor-pointer flex items-center gap-1.5 bg-white dark:bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                    <input type="file" accept="image/*" disabled={uploadingImage} onChange={(e) => handleImageUpload(e, 'cover')} className="hidden" />
                  </label>
                </div>
                <div>
                  <label className="block text-[8px] text-zinc-400 font-extrabold mb-1">COVER IMAGE URL *</label>
                  <input 
                    type="url" 
                    required
                    value={formImage} 
                    onChange={(e) => setFormImage(e.target.value)} 
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-lg px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-purple-500" 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[8px] text-zinc-400 font-extrabold mb-1">ALT TEXT</label>
                    <input type="text" value={formImageAlt} onChange={(e) => setFormImageAlt(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-lg px-2.5 py-2 text-xs focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[8px] text-zinc-400 font-extrabold mb-1">CAPTION</label>
                    <input type="text" value={formImageCaption} onChange={(e) => setFormImageCaption(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-lg px-2.5 py-2 text-xs focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[8px] text-zinc-400 font-extrabold mb-1">IMAGE CREDIT</label>
                    <input type="text" value={formImageCredit} onChange={(e) => setFormImageCredit(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-lg px-2.5 py-2 text-xs focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* Categories & Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-zinc-500 dark:text-zinc-400 font-extrabold mb-2 uppercase tracking-wider text-[9px]">Select Categories</label>
                  <div className="flex flex-wrap gap-1.5 p-3.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/20 dark:bg-zinc-950/40">
                    {['Web Development', 'AI', 'Programming', 'Business', 'Marketing', 'Career', 'Design', 'Mobile App'].map(cat => {
                      const selected = formCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => handleCategoryToggle(cat)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold border transition-all cursor-pointer ${
                            selected 
                              ? 'bg-purple-600 text-white border-purple-555 shadow-sm font-black' 
                              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-zinc-500 dark:text-zinc-400 font-extrabold mb-1 uppercase tracking-wider text-[9px]">Tags (Comma separated) *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Next.js, React, SEO, database" 
                    value={formTags} 
                    onChange={(e) => setFormTags(e.target.value)} 
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-purple-500 font-semibold" 
                  />
                  <span className="text-[8px] text-zinc-400 mt-1 block">Separate tag names with commas (e.g. Next.js, Node.js).</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NOTION/MEDIUM STYLE EDITOR (BLOCKS) */}
          {formTab === 'editor' && (
            <div className="space-y-6 animate-fadeIn w-full">
              
              {/* Editor Controls Bar */}
              <div className="sticky top-0 bg-zinc-150/80 dark:bg-zinc-900/90 backdrop-blur p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 z-10 flex flex-wrap items-center gap-2 shadow-sm">
                <span className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-wider mr-2">Add Content Block:</span>
                <button type="button" onClick={() => addBlock('text')} className="px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 text-zinc-800 dark:text-zinc-200 rounded-lg font-extrabold cursor-pointer text-[10px] flex items-center gap-1.5 transition-colors">
                  <FileText className="w-3.5 h-3.5 text-zinc-400" /> + Text
                </button>
                <button type="button" onClick={() => addBlock('image')} className="px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 text-zinc-800 dark:text-zinc-200 rounded-lg font-extrabold cursor-pointer text-[10px] flex items-center gap-1.5 transition-colors">
                  <ImageIcon className="w-3.5 h-3.5 text-zinc-400" /> + Image
                </button>
                <button type="button" onClick={() => addBlock('code')} className="px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 text-zinc-800 dark:text-zinc-200 rounded-lg font-extrabold cursor-pointer text-[10px] flex items-center gap-1.5 transition-colors">
                  <Code className="w-3.5 h-3.5 text-zinc-400" /> + Code Block
                </button>
                <button type="button" onClick={() => addBlock('quote')} className="px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 text-zinc-800 dark:text-zinc-200 rounded-lg font-extrabold cursor-pointer text-[10px] flex items-center gap-1.5 transition-colors">
                  <MessageSquare className="w-3.5 h-3.5 text-zinc-400" /> + Quote
                </button>
                <button type="button" onClick={() => addBlock('table')} className="px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 text-zinc-800 dark:text-zinc-200 rounded-lg font-extrabold cursor-pointer text-[10px] flex items-center gap-1.5 transition-colors">
                  <Table className="w-3.5 h-3.5 text-zinc-400" /> + Table
                </button>
                <button type="button" onClick={() => addBlock('faq')} className="px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 text-zinc-800 dark:text-zinc-200 rounded-lg font-extrabold cursor-pointer text-[10px] flex items-center gap-1.5 transition-colors">
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-400" /> + FAQ Details
                </button>
                <button type="button" onClick={() => addBlock('cta')} className="px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 text-zinc-800 dark:text-zinc-200 rounded-lg font-extrabold cursor-pointer text-[10px] flex items-center gap-1.5 transition-colors">
                  <LinkIcon className="w-3.5 h-3.5 text-zinc-400" /> + CTA Banner
                </button>
                <button type="button" onClick={() => addBlock('divider')} className="px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 text-zinc-800 dark:text-zinc-200 rounded-lg font-extrabold cursor-pointer text-[10px] flex items-center gap-1.5 transition-colors">
                  <Layers className="w-3.5 h-3.5 text-zinc-400" /> + Divider
                </button>
                <button type="button" onClick={() => addBlock('callout')} className="px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 text-zinc-800 dark:text-zinc-200 rounded-lg font-extrabold cursor-pointer text-[10px] flex items-center gap-1.5 transition-colors">
                  <Sparkles className="w-3.5 h-3.5 text-zinc-400" /> + Callout
                </button>
              </div>

              {/* Blocks Editor Surface */}
              <div className="space-y-4 pt-2">
                {formBlocks.map((block, idx) => (
                  <div key={block.id || idx} className="group border border-zinc-200 dark:border-zinc-850 bg-zinc-50/40 dark:bg-zinc-900/20 p-4 rounded-xl space-y-3 relative">
                    
                    {/* Block Action Controls */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="button" onClick={() => moveBlock(idx, 'up')} disabled={idx === 0} className="p-1 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 hover:text-purple-500 cursor-pointer disabled:opacity-30"><ArrowUp className="w-3 h-3" /></button>
                      <button type="button" onClick={() => moveBlock(idx, 'down')} disabled={idx === formBlocks.length - 1} className="p-1 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 hover:text-purple-500 cursor-pointer disabled:opacity-30"><ArrowDown className="w-3 h-3" /></button>
                      <button type="button" onClick={() => removeBlock(idx)} className="p-1 border border-rose-100 dark:border-rose-950/20 rounded bg-rose-50/50 text-rose-600 hover:bg-rose-50 cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                    </div>

                    {/* Block Title Header Label */}
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
                      <List className="w-3.5 h-3.5 opacity-60" />
                      <span>{block.type} Block</span>
                    </div>

                    {/* Text Block Content */}
                    {block.type === 'text' && (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <select 
                            value={block.data.level || 0}
                            onChange={(e) => updateBlock(idx, 'level', Number(e.target.value))}
                            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold rounded-lg px-2 py-1.5 cursor-pointer focus:outline-none"
                          >
                            <option value={0}>Normal Text (P)</option>
                            <option value={1}>Heading 1 (H1)</option>
                            <option value={2}>Heading 2 (H2)</option>
                            <option value={3}>Heading 3 (H3)</option>
                          </select>
                        </div>
                        <textarea
                          rows={3}
                          value={block.data.text || ''}
                          onChange={(e) => updateBlock(idx, 'text', e.target.value)}
                          placeholder={block.data.level ? `Heading ${block.data.level} title text...` : 'Enter normal paragraph content text...'}
                          className={`w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-3 text-xs focus:outline-none focus:border-purple-550 leading-relaxed font-medium ${
                            block.data.level === 1 ? 'font-black text-sm' : block.data.level === 2 ? 'font-extrabold' : ''
                          }`}
                        />
                      </div>
                    )}

                    {/* Quote Block */}
                    {block.type === 'quote' && (
                      <div>
                        <textarea
                          rows={2}
                          value={block.data.text || ''}
                          onChange={(e) => updateBlock(idx, 'text', e.target.value)}
                          placeholder="Enter inspirational blockquote text content here..."
                          className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-3 text-xs italic focus:outline-none focus:border-purple-550 font-semibold"
                        />
                      </div>
                    )}

                    {/* Image Block */}
                    {block.type === 'image' && (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[8px] font-bold text-zinc-400">IMAGE URL</label>
                          <label className="text-[9px] text-zinc-900 dark:text-white font-extrabold hover:underline cursor-pointer flex items-center gap-1.5 bg-white dark:bg-zinc-950 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Upload Image</span>
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'block', idx)} className="hidden" />
                          </label>
                        </div>
                        <input
                          type="url"
                          value={block.data.url || ''}
                          onChange={(e) => updateBlock(idx, 'url', e.target.value)}
                          placeholder="Image asset address URL..."
                          className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-purple-550"
                        />
                        <input
                          type="text"
                          value={block.data.caption || ''}
                          onChange={(e) => updateBlock(idx, 'caption', e.target.value)}
                          placeholder="Optional image caption text..."
                          className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>
                    )}

                    {/* Code Block */}
                    {block.type === 'code' && (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <select 
                            value={block.data.language || 'javascript'}
                            onChange={(e) => updateBlock(idx, 'language', e.target.value)}
                            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold rounded px-2 py-1 focus:outline-none cursor-pointer"
                          >
                            <option value="javascript">JavaScript / ES6</option>
                            <option value="typescript">TypeScript</option>
                            <option value="html">HTML</option>
                            <option value="css">CSS / Tailwind</option>
                            <option value="json">JSON</option>
                            <option value="python">Python</option>
                            <option value="bash">Shell / Bash</option>
                          </select>
                        </div>
                        <textarea
                          rows={5}
                          value={block.data.code || ''}
                          onChange={(e) => updateBlock(idx, 'code', e.target.value)}
                          placeholder="Paste or write programming source code here..."
                          className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-3 text-xs font-mono focus:outline-none focus:border-purple-550 leading-normal"
                        />
                      </div>
                    )}

                    {/* Table Block */}
                    {block.type === 'table' && (
                      <div className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl space-y-3">
                        <span className="text-[9px] font-extrabold text-zinc-400">Custom Table Matrix</span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Columns (comma separated)"
                            value={block.data.columns?.join(', ') || ''}
                            onChange={(e) => updateBlock(idx, 'columns', e.target.value.split(',').map(c => c.trim()))}
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded px-2.5 py-1 text-xs"
                          />
                        </div>
                        <span className="text-[8px] text-zinc-400 block">Row details will render matching header sizes. Configure rows matrix in final rendering logic.</span>
                      </div>
                    )}

                    {/* FAQ Details */}
                    {block.type === 'faq' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-extrabold text-zinc-450">FAQ Accordion Questions</span>
                          <button
                            type="button"
                            onClick={() => {
                              const items = block.data.items || [];
                              updateBlock(idx, 'items', [...items, { q: 'Another Question?', a: 'Answer.' }]);
                            }}
                            className="text-[9px] font-extrabold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20 px-2 py-0.5 rounded cursor-pointer"
                          >
                            + Add Question
                          </button>
                        </div>
                        {block.data.items?.map((item, qIdx) => (
                          <div key={qIdx} className="space-y-2 p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg relative">
                            <button
                              type="button"
                              onClick={() => {
                                const filtered = block.data.items?.filter((_, qi) => qi !== qIdx) || [];
                                updateBlock(idx, 'items', filtered);
                              }}
                              className="absolute top-2 right-2 text-rose-500 hover:text-rose-600 cursor-pointer text-[9px]"
                            >
                              Remove
                            </button>
                            <input
                              type="text"
                              value={item.q}
                              onChange={(e) => {
                                const copy = [...(block.data.items || [])];
                                copy[qIdx].q = e.target.value;
                                updateBlock(idx, 'items', copy);
                              }}
                              placeholder="FAQ Question..."
                              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-xs font-bold"
                            />
                            <textarea
                              rows={2}
                              value={item.a}
                              onChange={(e) => {
                                const copy = [...(block.data.items || [])];
                                copy[qIdx].a = e.target.value;
                                updateBlock(idx, 'items', copy);
                              }}
                              placeholder="FAQ Answer Details..."
                              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-2 text-xs font-semibold"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* CTA Box Block */}
                    {block.type === 'cta' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[8px] font-bold text-zinc-400">CTA BANNER TITLE</label>
                          <input type="text" value={block.data.title || ''} onChange={(e) => updateBlock(idx, 'title', e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-3 py-1.5 text-xs font-bold" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[8px] font-bold text-zinc-400">SUBTEXT</label>
                          <input type="text" value={block.data.text || ''} onChange={(e) => updateBlock(idx, 'text', e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-3 py-1.5 text-xs font-semibold" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[8px] font-bold text-zinc-400">BUTTON TEXT</label>
                          <input type="text" value={block.data.buttonText || ''} onChange={(e) => updateBlock(idx, 'buttonText', e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-3 py-1.5 text-xs font-bold" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[8px] font-bold text-zinc-400">BUTTON REDIRECT URL</label>
                          <input type="text" value={block.data.buttonUrl || ''} onChange={(e) => updateBlock(idx, 'buttonUrl', e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-3 py-1.5 text-xs font-mono" />
                        </div>
                      </div>
                    )}

                    {/* Divider Block */}
                    {block.type === 'divider' && (
                      <div className="flex justify-center items-center py-2">
                        <hr className="w-full border-t border-dashed border-zinc-350 dark:border-zinc-700" />
                      </div>
                    )}

                    {/* Callout Box Block */}
                    {block.type === 'callout' && (
                      <div className="grid grid-cols-1 gap-2">
                        <input
                          type="text"
                          value={block.data.title || ''}
                          onChange={(e) => updateBlock(idx, 'title', e.target.value)}
                          placeholder="Callout Header Title (e.g. IMPORTANT NOTE)"
                          className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-extrabold"
                        />
                        <textarea
                          rows={2}
                          value={block.data.text || ''}
                          onChange={(e) => updateBlock(idx, 'text', e.target.value)}
                          placeholder="Enter callout description text..."
                          className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-3 text-xs font-semibold"
                        />
                      </div>
                    )}

                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SEO CONFIG */}
          {formTab === 'seo' && (
            <div className="space-y-5 animate-fadeIn w-full">
              <h3 className="text-xs font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider">Search Engine Optimization Meta Tags</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-550 dark:text-zinc-400 font-extrabold mb-1 uppercase tracking-wider text-[9px]">SEO Meta Title</label>
                  <input type="text" value={formSeoTitle} onChange={(e) => setFormSeoTitle(e.target.value)} placeholder="e.g. Next.js 15 App Router | Premium Web Guide" className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-xs" />
                </div>
                <div>
                  <label className="block text-zinc-550 dark:text-zinc-400 font-extrabold mb-1 uppercase tracking-wider text-[9px]">SEO Keywords</label>
                  <input type="text" value={formSeoKeywords} onChange={(e) => setFormSeoKeywords(e.target.value)} placeholder="nextjs, app router, seo, react" className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-xs" />
                </div>
              </div>

              <div>
                <label className="block text-zinc-550 dark:text-zinc-400 font-extrabold mb-1 uppercase tracking-wider text-[9px]">SEO Description</label>
                <textarea rows={3} value={formSeoDesc} onChange={(e) => setFormSeoDesc(e.target.value)} placeholder="Enter search meta description summary..." className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-xs font-semibold resize-none" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-550 dark:text-zinc-400 font-extrabold mb-1 uppercase tracking-wider text-[9px]">Canonical URL link</label>
                  <input type="url" value={formCanonicalUrl} onChange={(e) => setFormCanonicalUrl(e.target.value)} placeholder="https://hossenshop.com/blogs/..." className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-xs" />
                </div>
                <div>
                  <label className="block text-zinc-550 dark:text-zinc-400 font-extrabold mb-1.5 uppercase tracking-wider text-[9px]">Robots Index Permission</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setFormRobotsIndex(true)} className={`flex-1 py-2 text-xs font-extrabold rounded-lg border transition-all cursor-pointer ${formRobotsIndex ? 'bg-zinc-950 text-white dark:bg-white dark:text-black' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500'}`}>Index (index, follow)</button>
                    <button type="button" onClick={() => setFormRobotsIndex(false)} className={`flex-1 py-2 text-xs font-extrabold rounded-lg border transition-all cursor-pointer ${!formRobotsIndex ? 'bg-zinc-950 text-white dark:bg-white dark:text-black' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500'}`}>NoIndex (noindex, nofollow)</button>
                  </div>
                </div>
              </div>

              {/* Social Graph Details */}
              <div className="border border-zinc-200 dark:border-zinc-800 p-5 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-[10px] text-zinc-500 uppercase tracking-wider">OpenGraph Social Share Config</span>
                  <label className="text-[9px] text-zinc-950 dark:text-white font-extrabold hover:underline cursor-pointer flex items-center gap-1.5 bg-white dark:bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Upload OpenGraph Image</span>
                    <input type="file" accept="image/*" disabled={uploadingImage} onChange={(e) => handleImageUpload(e, 'og')} className="hidden" />
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[8px] text-zinc-400 font-extrabold mb-1">OG TITLE</label>
                    <input type="text" value={formOgTitle} onChange={(e) => setFormOgTitle(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs" />
                  </div>
                  <div>
                    <label className="block text-[8px] text-zinc-400 font-extrabold mb-1">OG IMAGE URL</label>
                    <input type="url" value={formOgImage} onChange={(e) => setFormOgImage(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono" />
                  </div>
                </div>
                <div>
                  <label className="block text-[8px] text-zinc-400 font-extrabold mb-1">OG DESCRIPTION</label>
                  <textarea rows={2} value={formOgDesc} onChange={(e) => setFormOgDesc(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 rounded-lg p-2.5 text-xs font-semibold resize-none" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACADEMY LINKS */}
          {formTab === 'academy' && (
            <div className="space-y-5 animate-fadeIn w-full">
              <h3 className="text-xs font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider">Hossen Academy / Service Promotion Linkages</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-550 dark:text-zinc-400 font-extrabold mb-1.5 uppercase tracking-wider text-[9px]">Linked Shop Product</label>
                  <select 
                    value={formProductId} 
                    onChange={(e) => setFormProductId(e.target.value)} 
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-xs font-semibold cursor-pointer"
                  >
                    <option value="">-- No Product Linked --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-550 dark:text-zinc-400 font-extrabold mb-1.5 uppercase tracking-wider text-[9px]">Linked Academy Course ID</label>
                  <input type="text" value={formLinkedCourseId} onChange={(e) => setFormLinkedCourseId(e.target.value)} placeholder="e.g. course-next-15-basic" className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-xs font-semibold" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-550 dark:text-zinc-400 font-extrabold mb-1 uppercase tracking-wider text-[9px]">Difficulty level</label>
                  <select 
                    value={formDifficulty} 
                    onChange={(e) => setFormDifficulty(e.target.value as any)} 
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-xs font-semibold cursor-pointer"
                  >
                    <option value="Beginner">Beginner Level</option>
                    <option value="Intermediate">Intermediate Level</option>
                    <option value="Advanced">Advanced Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-550 dark:text-zinc-400 font-extrabold mb-1 uppercase tracking-wider text-[9px]">Completion Estimate Time</label>
                  <input type="text" value={formCompletionTime} onChange={(e) => setFormCompletionTime(e.target.value)} placeholder="e.g. 4 Hours Completion" className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-xs" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FAQ & EXTRAS */}
          {formTab === 'extras' && (
            <div className="space-y-5 animate-fadeIn w-full">
              
              {/* FAQS */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-[10px] text-zinc-500 uppercase tracking-wider">JSON-LD FAQ Schema Accordion</span>
                  <button
                    type="button"
                    onClick={() => setFormFaqs([...formFaqs, { q: 'Question?', a: 'Answer.' }])}
                    className="text-[9px] font-extrabold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20 px-2 py-0.5 rounded cursor-pointer"
                  >
                    + Add FAQ Schema
                  </button>
                </div>
                {formFaqs.map((faq, fIdx) => (
                  <div key={fIdx} className="p-4 border border-zinc-200 dark:border-zinc-850 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/10 space-y-2 relative">
                    <button type="button" onClick={() => setFormFaqs(formFaqs.filter((_, i) => i !== fIdx))} className="absolute top-2 right-2 text-rose-500 hover:text-rose-600 text-[9px] font-bold cursor-pointer">Remove</button>
                    <input type="text" value={faq.q} onChange={(e) => {
                      const copy = [...formFaqs];
                      copy[fIdx].q = e.target.value;
                      setFormFaqs(copy);
                    }} placeholder="Question..." className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-2.5 py-1 text-xs font-extrabold" />
                    <textarea rows={2} value={faq.a} onChange={(e) => {
                      const copy = [...formFaqs];
                      copy[fIdx].a = e.target.value;
                      setFormFaqs(copy);
                    }} placeholder="Answer content..." className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded p-2.5 text-xs font-semibold resize-none" />
                  </div>
                ))}
              </div>

              {/* Attachments Section */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-[10px] text-zinc-500 uppercase tracking-wider">Campaign Attachments & Source Files</span>
                  <label className="text-[9px] text-zinc-950 dark:text-white font-extrabold hover:underline cursor-pointer flex items-center gap-1.5 bg-white dark:bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Upload Attachment</span>
                    <input type="file" onChange={(e) => handleImageUpload(e, 'attachment')} className="hidden" />
                  </label>
                </div>
                {formAttachments.map((att, aIdx) => (
                  <div key={aIdx} className="p-3 border border-zinc-200 dark:border-zinc-850 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/10 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{att.name}</span>
                      <span className="text-[9px] text-zinc-400 dark:text-zinc-555 block font-mono">{att.url}</span>
                    </div>
                    <button type="button" onClick={() => setFormAttachments(formAttachments.filter((_, i) => i !== aIdx))} className="text-rose-500 hover:text-rose-600 text-xs font-extrabold cursor-pointer">Remove</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: ANALYTICS INSIGHTS */}
          {formTab === 'analytics' && (
            <div className="space-y-5 animate-fadeIn w-full">
              <h3 className="text-xs font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider">Premium Marketing Options</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { state: formIsFeatured, setState: setFormIsFeatured, label: 'Featured Article', desc: 'Prominently display at top header.' },
                  { state: formIsTrending, setState: setFormIsTrending, label: 'Trending Badge', desc: 'Add glowing popularity metrics.' },
                  { state: formIsPopular, setState: setFormIsPopular, label: 'Popular Post', desc: 'Highlight in sidebar list logs.' },
                  { state: formIsEditorsPick, setState: setFormIsEditorsPick, label: "Editor's Pick Choice", desc: 'Add expert evaluation tag.' },
                  { state: formSticky, setState: setFormSticky, label: 'Sticky Thread', desc: 'Pin to top of directory listing.' }
                ].map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => opt.setState(!opt.state)}
                    className={`p-4 border rounded-xl text-left transition-all cursor-pointer select-none space-y-2 flex flex-col justify-between ${
                      opt.state 
                        ? 'bg-purple-50/50 border-purple-250 dark:bg-purple-950/10 dark:border-purple-900/50' 
                        : 'bg-white border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 hover:bg-zinc-50'
                    }`}
                  >
                    <span className="text-xs font-extrabold text-zinc-900 dark:text-white block uppercase tracking-wider">{opt.label}</span>
                    <p className="text-[10px] text-zinc-450 leading-normal">{opt.desc}</p>
                    <span className={`text-[8px] font-black uppercase self-end px-2 py-0.5 rounded border ${
                      opt.state ? 'bg-purple-600 text-white border-purple-500' : 'bg-zinc-50 text-zinc-400 border-zinc-150'
                    }`}>{opt.state ? 'Active' : 'Disabled'}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

