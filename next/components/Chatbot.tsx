"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useDragControls } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { getDb, initDb } from '../lib/db';
import type { Database, Experience, Education, Project, Service, RawSkill, Testimonial, Blog, ChatbotSettings } from '../types';
import { getChatbotSettings } from '@/lib/api';
import { Bot, Send, X, Trash2, Calendar } from 'lucide-react';

type Msg = { role: 'user' | 'assistant'; content: string };

// Cookie helpers for persisting chat history
const CHAT_COOKIE = 'chatbot-history';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
const COOKIE_SIZE_BUDGET = 3500; // bytes budget target for cookie value

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const cookies = document.cookie?.split('; ') || [];
    for (const c of cookies) {
      const [k, v] = c.split('=');
      if (k === name) return decodeURIComponent(v || '');
    }
  } catch { /* noop */ }
  return null;
}

function writeCookie(name: string, value: string, maxAgeSeconds = COOKIE_MAX_AGE_SECONDS) {
  if (typeof document === 'undefined') return;
  try {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}`;
  } catch { /* noop */ }
}

function clearCookie(name: string) {
  if (typeof document === 'undefined') return;
  try {
    document.cookie = `${name}=; path=/; max-age=0`;
  } catch { /* noop */ }
}

function getCookieMessages(): Msg[] {
  try {
    const raw = readCookie(CHAT_COOKIE);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((m: any) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string');
    }
  } catch { /* noop */ }
  return [];
}

function saveCookieMessages(msgs: Msg[]) {
  // Keep last N messages and ensure cookie size stays under budget
  const maxKeep = 20;
  let slice = msgs.slice(-maxKeep);
  let json = JSON.stringify(slice);
  // If too big, trim further until under budget
  while (json.length > COOKIE_SIZE_BUDGET && slice.length > 1) {
    slice = slice.slice(1); // drop oldest
    json = JSON.stringify(slice);
  }
  writeCookie(CHAT_COOKIE, json);
}

function summarize(db: Database) {
  const name = db.hero?.name || 'Me';
  const title = db.hero?.title || '';
  const shortBio = db.hero?.shortBio || '';
  const topSkills = (db.skills || []).slice(0, 6).map((s: RawSkill) => s.name || s.icon).filter(Boolean) as string[];
  const featured = (db.projects || []).filter(p => p.featured).slice(0, 3);
  const companies = (db.experiences || []).map(e => e.companyName).filter(Boolean);
  return {
    name,
    title,
    shortBio,
    topSkills,
    featuredTitles: featured.map(p => p.title),
    companies: Array.from(new Set(companies)),
  };
}

function list<T>(items: T[], pick: (t: T) => string, max = 5): string {
  return items.slice(0, max).map(pick).filter(Boolean).map(s => `• ${s}`).join('\n');
}

function answerQuestion(q: string, db: Database, chatbot: ChatbotSettings | null | undefined, visitorName?: string): string {
  const query = q.toLowerCase();
  const s = summarize(db);

  const includesAny = (words: string[]) => words.some(w => query.includes(w));

  // 0) Custom Q&A: first match wins
  const rules = (chatbot?.customQA || []).filter(r => r && (r.enabled !== false) && r.reply?.trim());
  const formatReply = (tpl: string) => {
    // simple placeholder replacement
    const base = (tpl || '')
      .replace(/\{\s*name\s*\}/gi, visitorName || 'there')
      .replace(/\{\s*date\s*\}/gi, new Date().toLocaleDateString())
      .replace(/\{\s*email\s*\}/gi, (db.contact?.email || ''))
      .replace(/\{\s*phone\s*\}/gi, (db.contact?.phone || ''))
      .replace(/\{\s*path\s*\}/gi, (typeof window !== 'undefined' ? window.location.pathname : ''))
      .replace(/\{\s*bookingUrl\s*\}/gi, (chatbot?.bookingUrl || ''))
      .replace(/\{\s*contactLink\s*\}/gi, '#contact');
  // apply admin-defined placeholders
    const ph: Record<string, string> = {};
    if (Array.isArray(chatbot?.placeholders)) {
      for (const p of chatbot.placeholders) {
        if (p && typeof p.key === 'string' && typeof p.value === 'string') {
          ph[p.key] = p.value;
        }
      }
    }
    let out = base;
    for (const [k, v] of Object.entries(ph)) {
      if (!k) continue;
      try {
        const re = new RegExp(`\\{\\s*${escapeRegExp(k)}\\s*\\}`, 'g');
        out = typeof out === 'string' ? out.replace(re, v ?? '') : out;
      } catch { /* ignore bad keys */ }
    }
    return out;
  };
  for (const r of rules) {
    const hasQuestion = !!(r.question && r.question.trim());
    const hasKeywords = Array.isArray(r.keywords) && r.keywords.length > 0;
    const matchMode = r.matchMode || 'any';
    let matched = false;
    if (hasQuestion) {
      const needle = (r.question || '').trim().toLowerCase();
      matched = query.includes(needle);
    }
    if (!matched && hasKeywords) {
      const kws = (r.keywords || []).map(k => (k || '').trim().toLowerCase()).filter(Boolean);
      if (matchMode === 'all') matched = kws.length > 0 && kws.every(k => query.includes(k));
      else matched = kws.some(k => query.includes(k));
    }
    if (matched) {
      return formatReply(r.reply.trim());
    }
  }

  if (includesAny(['who are you', 'who is', 'your name', 'introduce', 'about you'])) {
    const greet = visitorName ? `Hi ${visitorName}! ` : 'Hi! ';
    return `${greet}I'm ${s.name}${s.title ? `, ${s.title}` : ''}. ${s.shortBio || 'I build delightful, performant web experiences.'}`;
  }

  if (includesAny(['skill', 'stack', 'technology', 'tools'])) {
    const skillsText = list(db.skills || [], (sk: RawSkill) => sk.name || sk.icon);
    return skillsText
      ? `Here are some of my skills:\n${skillsText}\n\nI also love learning and adding to this list.`
      : `I focus on clean UI, solid UX, and modern web tooling like Next.js and Tailwind.`;
  }

  if (includesAny(['project', 'portfolio', 'work you did'])) {
    const projsText = list(db.projects || [], (p: Project) => `${p.title} — ${p.category}${p.liveUrl ? ` (${p.liveUrl})` : ''}`);
    return projsText
      ? `Some projects I'm proud of:\n${projsText}`
      : `I showcase selected projects on this site—feel free to explore the Recent Works section!`;
  }

  if (includesAny(['experience', 'company', 'worked at', 'work history', 'career'])) {
    const expText = list(db.experiences || [], (e: Experience) => `${e.positionTitle} @ ${e.companyName} (${e.startYear}–${e.endYear})`);
    return expText
      ? `My experience:\n${expText}`
      : `I have hands-on experience across design and development—happy to share more if you have specifics!`;
  }

  if (includesAny(['education', 'degree', 'college', 'university', 'study'])) {
    const edText = list(db.educations || [], (e: Education) => `${e.degree} — ${e.institution} (${e.startYear}–${e.endYear})`);
    return edText || `I'm self-driven and continuously learning—ask me about courses or certifications!`;
  }

  if (includesAny(['service', 'offer', 'what do you do', 'help me'])) {
    const servText = list(db.services || [], (s: Service) => s.title);
    return servText
      ? `I can help with:\n${servText}\n\nTell me what you're planning—I can suggest where to start.`
      : `I help companies design and build great products—from UX to polished UI and production-ready code.`;
  }

  if (includesAny(['contact', 'email', 'phone', 'reach'])) {
    const email = db.contact?.email || '';
    const phone = db.contact?.phone || '';
    const socials = (db.contact?.socialLinks || []).slice(0, 5).map(s => `${s.platform}: ${s.url}`).join('\n');
    const lines = [
      visitorName ? `Happy to connect${visitorName ? `, ${visitorName}` : ''}!` : 'You can reach me via:',
      email ? `• Email: ${email}` : '',
      phone ? `• Phone: ${phone}` : '',
      socials ? `• Socials:\n${socials}` : '',
    ].filter(Boolean);
    return lines.join('\n') || `Use the contact form and I’ll get back to you soon!`;
  }

  if (includesAny(['book', 'schedule', 'meeting', 'call', 'calendar', '30-minute', '30 minute', '30min', 'appointment'])) {
    const desc = (chatbot?.bookingDescription || '').trim();
    const url = (chatbot?.bookingUrl || '').trim();
    const fallbackDesc = 'Let’s schedule a 30‑minute call to align on your goals and how I can help.';
    const fallbackUrl = '#contact';
    const lines = [desc || fallbackDesc, '', `Book here: ${url || fallbackUrl}`];
    return lines.join('\n');
  }

  if (includesAny(['testimonial', 'client', 'feedback'])) {
    const ts = list(db.testimonials || [], (t: Testimonial) => `“${t.quote}” — ${t.clientName}, ${t.roleCompany}`);
    return ts || `Clients describe me as collaborative, reliable, and detail-oriented.`;
  }

  if (includesAny(['blog', 'article', 'write', 'writing'])) {
    const blogs = list(db.blogs || [], (b: Blog) => `${b.title}${b.url ? ` (${b.url})` : ''}`);
    return blogs || `I occasionally write about design and product—check the Blog section here.`;
  }

  // Default friendly intro
  const salutation = visitorName ? `Hi ${visitorName}! ` : 'Hi! ';
  const skillsLine = s.topSkills.length ? ` I often work with ${s.topSkills.slice(0, 4).join(', ')}.` : '';
  const projectLine = s.featuredTitles.length ? ` Recent projects include ${s.featuredTitles.slice(0, 2).join(', ')}.` : '';
  return `${salutation}I'm ${s.name}${s.title ? `, ${s.title}` : ''}. ${s.shortBio || ''}${skillsLine}${projectLine} Ask me about my projects, skills, or how I can help you.`.trim();
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function Chatbot() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dragControls = useDragControls();
  const [db, setDb] = useState<Database | null>(null);
  const [input, setInput] = useState('');
  const [visitorName, setVisitorName] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    try { return sessionStorage.getItem('chat-visitor-name') || ''; } catch { return ''; }
  });
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [animatedReply, setAnimatedReply] = useState<string | null>(null);
  const [animatedIndex, setAnimatedIndex] = useState(0);
  const [messages, setMessages] = useState<Msg[]>(() => {
    if (typeof window === 'undefined') return [];
    // Prefer cookie; fallback to existing localStorage if any
    const fromCookie = getCookieMessages();
    if (fromCookie.length) return fromCookie;
    try {
      const raw = localStorage.getItem('chatbot-history');
      return raw ? (JSON.parse(raw) as Msg[]) : [];
    } catch { return []; }
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);
  const lastSendAtRef = useRef(0);
  const [opening, setOpening] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const [chatbot, setChatbot] = useState<ChatbotSettings | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try { initDb(); setDb(getDb()); } catch { /* ignore */ }
  }, []);

  // Load chatbot settings
  useEffect(() => {
    (async () => {
      try {
        const s = await getChatbotSettings();
        setChatbot(s);
      } catch {
        setChatbot({
          enabled: true,
          name: 'Prism',
          initialGreeting: 'Hey there 👋 I’m Prism — Priyesh’s virtual assistant. Ask me about design, branding, or creative strategy — I’ll help and answer in Priyesh’s voice.',
          bookingUrl: '',
          bookingDescription: '',
          showBookingQuickReply: true,
          placeholders: [],
          customQA: []
        });
      }
    })();
  }, []);

  // Seed an initial assistant greeting if there is no prior history (wait for chatbot settings)
  useEffect(() => {
    if (!chatbot) return;
    if (messages.length === 0) {
  const greeting = chatbot.initialGreeting?.trim() || `Hi! I’m ${chatbot.name || 'Prism'} — ask me about projects, skills, or how I work.`;
      const seed = [{ role: 'assistant', content: greeting } as Msg];
      setMessages(seed);
      // persist to cookie and localStorage as a fallback
      saveCookieMessages(seed);
      try { localStorage.setItem('chatbot-history', JSON.stringify(seed)); } catch { }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatbot]);

  useEffect(() => {
    // persist to cookie (primary) and localStorage (fallback) on changes
    saveCookieMessages(messages);
    try { localStorage.setItem('chatbot-history', JSON.stringify(messages.slice(-50))); } catch { }
    // scroll to bottom on new message
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const disabled = useMemo(() => !db || !input.trim() || isBotTyping || sendingRef.current, [db, input, isBotTyping]);

  const openChat = () => {
    setOpening(true);
    setOpen(true);
    // stop ripple after animation window
    setTimeout(() => setOpening(false), 500);
    // Refresh chatbot settings in background (settings already loaded in mount effect)
    getChatbotSettings().then(s => setChatbot(s)).catch(() => {});
  };

  const closeChat = () => {
    setOpen(false);
  };

  const clearChat = () => {
    // reset chat history and visitor state
  const greeting = (chatbot?.initialGreeting?.trim()) || `Hi! I’m ${(chatbot?.name || 'Prism')} — ask me about projects, skills, or how I work.`;
    const seed = [{ role: 'assistant', content: greeting } as Msg];
    setMessages(seed);
    setAnimatedReply(null);
    setAnimatedIndex(0);
    try { sessionStorage.removeItem('chat-visitor-name'); } catch { }
    setVisitorName('');
    clearCookie(CHAT_COOKIE);
    try { localStorage.removeItem('chatbot-history'); } catch { }
    // Save seed back to cookie so greeting persists
    saveCookieMessages(seed);
  };

  const extractName = (text: string): string | null => {
    // Simple patterns: "my name is <name>", "i am <name>", "i'm <name>"
    const t = text.trim();
    const patterns = [
      /\bmy\s+name\s+is\s+([a-zA-Z][a-zA-Z\-\s]{1,40})/i,
      /\bi\s*am\s+([a-zA-Z][a-zA-Z\-\s]{1,40})/i,
      /\bi\s*'\s*m\s+([a-zA-Z][a-zA-Z\-\s]{1,40})/i,
    ];
    for (const re of patterns) {
      const m = t.match(re);
      if (m && m[1]) return m[1].trim();
    }
    return null;
  };

  const send = async (overrideText?: string) => {
    const q = (overrideText ?? input).trim();
    if (!db || !q) return;
    const now = Date.now();
    if (now - lastSendAtRef.current < 500) return; // debounce rapid triggers
    lastSendAtRef.current = now;
    if (sendingRef.current) return; // prevent duplicate sends
    // Capture visitor name if they provided one in this turn
    const maybeName = extractName(q);
    if (maybeName) {
      setVisitorName(maybeName);
      try { sessionStorage.setItem('chat-visitor-name', maybeName); } catch { }
    }
    const userMsg: Msg = { role: 'user', content: q };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    // Check custom rules before invoking server or fallback
    const ruleReply = answerQuestion(q, db, chatbot, visitorName || maybeName || '');
    // If a rule matched (and not just generic fallback), we can tell by comparing
    // whether it came from rules path: we applied rules first in answerQuestion.
    // To avoid ambiguity, explicitly match again but only through rules:
    const rules = (chatbot?.customQA || []).filter(r => r && (r.enabled !== false) && r.reply?.trim());
    const query = q.toLowerCase();
    const ruleMatched = rules.some(r => {
      const hasQ = !!(r.question && r.question.trim());
      const hasKw = Array.isArray(r.keywords) && r.keywords.length > 0;
      const hitQ = hasQ && query.includes((r.question || '').trim().toLowerCase());
      let hitKw = false;
      if (hasKw) {
        const kws = (r.keywords || []).map(k => (k || '').trim().toLowerCase()).filter(Boolean);
        hitKw = (r.matchMode || 'any') === 'all'
          ? (kws.length > 0 && kws.every(k => query.includes(k)))
          : kws.some(k => query.includes(k));
      }
      return (hitQ || hitKw);
    });
    if (ruleMatched) {
      sendingRef.current = true;
      setIsBotTyping(false);
      setAnimatedReply(ruleReply);
      setAnimatedIndex(0);
      return;
    }
    setIsBotTyping(true);
    sendingRef.current = true;
    // Try LLM first via server route; fallback to local rule-based answer
    try {
      const snapshot = db ? {
        hero: db.hero,
        services: db.services,
        projects: db.projects,
        experiences: db.experiences,
        educations: db.educations,
        skills: db.skills,
        testimonials: db.testimonials,
        contact: db.contact,
        blogs: db.blogs,
      } : undefined;
      // Provide short recent chat history so the assistant can respond contextually
      const recent = [...messages, userMsg].slice(-16);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          messages: recent,
          snapshot,
          visitor: { name: visitorName || maybeName || '', path: pathname || '/' }
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const reply = (data?.answer as string) || '';
        if (reply) {
          // If server returned its graceful fallback, prefer our local rule-based reply (includes booking intent handling)
          const isServerFallback = /couldn[’'`]?t reach the AI service/i.test(reply);
          const finalReply = isServerFallback ? answerQuestion(q, db, chatbot, visitorName || maybeName || '') : reply;
          setIsBotTyping(false);
          setAnimatedReply(finalReply);
          setAnimatedIndex(0);
          return;
        }
      }
      // Non-ok or empty answer => fallback
      const reply = answerQuestion(q, db, chatbot, visitorName || maybeName || '');
      setIsBotTyping(false);
      setAnimatedReply(reply);
      setAnimatedIndex(0);
    } catch {
      const reply = answerQuestion(q, db, chatbot, visitorName || maybeName || '');
      setIsBotTyping(false);
      setAnimatedReply(reply);
      setAnimatedIndex(0);
    }
  };

  // Previously hidden on /admin to avoid UI overlap. Showing it everywhere for visibility.

  // Typewriter effect for assistant replies
  useEffect(() => {
    if (animatedReply == null) return;
    setAnimatedIndex(0);
    const step = Math.max(1, Math.floor(animatedReply.length / 120)); // ~120 steps
    const id = window.setInterval(() => {
      setAnimatedIndex(prev => {
        const next = prev + step;
        if (next >= animatedReply.length) {
          window.clearInterval(id);
          // finalize message
          setMessages(prevMsgs => {
            const last = prevMsgs[prevMsgs.length - 1];
            if (last && last.role === 'assistant' && last.content.trim() === animatedReply.trim()) {
              return prevMsgs; // avoid duplicate assistant bubbles
            }
            return [...prevMsgs, { role: 'assistant', content: animatedReply }];
          });
          setAnimatedReply(null);
          sendingRef.current = false; // allow next send
          return animatedReply.length;
        }
        return next;
      });
      // keep scrolled to bottom while animating
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, 20);
    return () => window.clearInterval(id);
  }, [animatedReply]);

  const scrollToId = (id: string) => {
    try {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.location.hash = id;
      }
    } catch { /* noop */ }
  };

  const quickSend = async (text: string, navigateId?: string) => {
    setInput('');
    if (navigateId) scrollToId(navigateId);
    send(text);
  };

  return (
    <div className="fixed bottom-3 right-3 md:bottom-4 md:right-4 z-[9999]" style={{ fontFamily: 'Inter, Poppins, sans-serif' }}>
      {/* Toggle button */}
      <AnimatePresence initial={false} mode="sync">
        {open ? (
          <motion.div
            key="chat-panel"
            className="relative w-[90vw] max-w-md h-[65vh] rounded-2xl border border-brand-purple/10 bg-dark-bg/95 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden"
            style={{ transformOrigin: 'bottom right', willChange: 'transform, opacity' }}
            initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.92, y: prefersReducedMotion ? 0 : 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.92, y: prefersReducedMotion ? 0 : 12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.9 }}
            /* §2/§5/§6 Swipe-to-dismiss: drag starts only from the grabber handle
               (dragListener=false) so it never fights the message-list scroll.
               Framer carries the release velocity into the snap-back / dismiss. */
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_e, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) closeChat();
            }}
          >
            {/* Optional glow ripple on open for premium feel */}
            <AnimatePresence>
              {opening && !prefersReducedMotion && (
                <motion.span
                  key="open-ripple"
                  className="pointer-events-none absolute -bottom-3 -right-3 w-20 h-20 rounded-full"
                  style={{
                    background:
                      'radial-gradient(ellipse at center, rgba(108,99,255,0.35), rgba(108,99,255,0) 60%)',
                    filter: 'blur(12px)'
                  }}
                  initial={{ opacity: 0.5, scale: 1 }}
                  animate={{ opacity: 0, scale: 1.8 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                />
              )}
            </AnimatePresence>
            {/* Secondary ripple for richer premium feel */}
            <AnimatePresence>
              {opening && !prefersReducedMotion && (
                <motion.span
                  key="open-ripple-2"
                  className="pointer-events-none absolute -bottom-6 -right-6 w-28 h-28 rounded-full"
                  style={{
                    background:
                      'radial-gradient(ellipse at center, rgba(108,99,255,0.20), rgba(108,99,255,0) 70%)',
                    filter: 'blur(18px)'
                  }}
                  initial={{ opacity: 0.35, scale: 1 }}
                  animate={{ opacity: 0, scale: 2.1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
                />
              )}
            </AnimatePresence>
            {/* Content fade-in to avoid popping during scale animation */}
            <motion.div className="contents" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08, duration: 0.2 }}>
              {/* Grabber — swipe down to dismiss. Drag is bound here (dragListener
                  is off on the panel) so the message list still scrolls normally. */}
              <div
                onPointerDown={(e) => dragControls.start(e)}
                className="flex justify-center pt-2.5 pb-1 shrink-0 cursor-grab active:cursor-grabbing"
                style={{ touchAction: 'none' }}
                aria-hidden="true"
              >
                <span className="h-1 w-10 rounded-full bg-white/20" />
              </div>
              {/* Side pop arrow */}
              <motion.div
                aria-hidden
                className="hidden md:block absolute -right-2 bottom-16 w-4 h-4 bg-dark-bg/95 border border-brand-purple/10 rotate-45 shadow-xl"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
              />
              <div className="p-4 border-b border-brand-purple/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                    <Bot size={18} className="opacity-90" />
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold text-white">{chatbot?.name || 'Prism'}</div>
                    <div className="text-white/60">Ask about projects, skills, and more</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <motion.button
                    onClick={clearChat}
                    className="text-white/60 hover:text-white p-1 rounded-md"
                    aria-label="Clear chat"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    title="Clear chat"
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <Trash2 size={18} />
                  </motion.button>
                  <motion.button
                    onClick={closeChat}
                    className="text-white/60 hover:text-white p-1 rounded-md"
                    aria-label="Close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <X size={18} />
                  </motion.button>
                </div>
              </div>

              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-3"
                aria-live="polite"
                aria-label="Chat messages"
                role="log"
              >
                {/* Initial assistant message is injected into history on first load */}

                {messages.map((m, i) => (
                  <div key={`${m.role}-${i}`} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                    {m.role === 'assistant' && (
                      <div className="mb-1 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white">
                        <Bot size={14} className="opacity-90" />
                      </div>
                    )}
                    <div className={`max-w-[80%] inline-block whitespace-pre-wrap break-words px-3 py-2 text-sm rounded-2xl shadow-sm ${m.role === 'user' ? 'bg-brand-purple text-white rounded-br-sm' : 'bg-white/5 text-white rounded-tl-sm border border-brand-purple/10'}`}>
                      {m.content}
                    </div>
                  </div>
                ))}

                {/* Typing/animated assistant reply */}
                {isBotTyping && (
                  <div className="flex justify-start items-end gap-2">
                    <div className="mb-1 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white">
                      <Bot size={14} className="opacity-90" />
                    </div>
                    <div className="inline-flex items-center gap-1 bg-white/5 text-white rounded-2xl rounded-tl-sm px-3 py-2 text-sm shadow-sm border border-brand-purple/10">
                      <span className="animate-bounce">•</span>
                      <span className="animate-bounce [animation-delay:150ms]">•</span>
                      <span className="animate-bounce [animation-delay:300ms]">•</span>
                    </div>
                  </div>
                )}

                {animatedReply != null && (
                  <div className="flex justify-start items-end gap-2">
                    <div className="mb-1 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white">
                      <Bot size={14} className="opacity-90" />
                    </div>
                    <div className="max-w-[80%] inline-block whitespace-pre-wrap break-words px-3 py-2 text-sm rounded-2xl shadow-sm bg-white/5 text-white rounded-tl-sm border border-brand-purple/10">
                      {animatedReply.slice(0, animatedIndex)}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick reply buttons */}
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                <button onClick={() => quickSend('Show me your projects', 'works')} className="px-3 py-1.5 rounded-full text-xs bg-brand-purple/10 text-brand-purple hover:bg-brand-purple/20 transition">View My Projects</button>
                <button onClick={() => { try { window.open('/images/Priyesh%20Mishra%20UIUX.pdf', '_blank'); } catch { } quickSend('Can I download your resume?'); }} className="px-3 py-1.5 rounded-full text-xs bg-brand-purple/10 text-brand-purple hover:bg-brand-purple/20 transition">Download Resume</button>
                <button onClick={() => quickSend('How can I contact you?', 'contact')} className="px-3 py-1.5 rounded-full text-xs bg-brand-purple/10 text-brand-purple hover:bg-brand-purple/20 transition">Contact Me</button>
                <button onClick={() => quickSend('Tell me about yourself', 'home')} className="px-3 py-1.5 rounded-full text-xs bg-brand-purple/10 text-brand-purple hover:bg-brand-purple/20 transition">About Me</button>
                {chatbot?.showBookingQuickReply && chatbot?.bookingUrl && (
                  <button onClick={() => { try { window.open(chatbot.bookingUrl as string, '_blank'); } catch { } quickSend('I want to book a 30-minute session.'); }} className="px-3 py-1.5 rounded-full text-xs bg-green-500/15 text-green-300 hover:bg-green-500/25 transition inline-flex items-center gap-1">
                    <Calendar size={14} /> Book 30‑min Session
                  </button>
                )}
              </div>

              <div className="p-3 border-t border-brand-purple/10 flex gap-2">
                <div className="flex-1 relative">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') send(); }}
                    placeholder="Ask anything…"
                    className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-brand-purple/30"
                  />
                </div>
                <button disabled={disabled} onClick={() => send()} className={`px-3.5 py-2 rounded-full text-sm flex items-center gap-1 ${disabled ? 'bg-white/10 text-white/40' : 'bg-brand-purple text-white hover:brightness-110'}`} aria-label="Send">
                  <Send size={16} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : ((chatbot?.enabled ?? true) ? (
          <motion.button
            key="chat-toggle"
            onClick={openChat}
            aria-label={`Open ${chatbot?.name || 'Prism'}`}
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 1.02 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26, mass: 0.8 }}
            className="group relative select-none w-12 h-12 md:w-16 md:h-16 rounded-[18px] md:rounded-[22px] outline-none focus-visible:ring-2 focus-visible:ring-purple-400/40"
            style={{ transformOrigin: 'bottom right' }}
          >
            {/* Outer neon aura with breathing glow */}
            <motion.span
              aria-hidden
              className="pointer-events-none absolute -inset-2 rounded-[26px] bg-[radial-gradient(ellipse_at_center,rgba(108,99,255,0.35),rgba(108,99,255,0)_60%)] blur-xl"
              animate={prefersReducedMotion ? undefined : { opacity: [0.55, 0.85, 0.55], scale: [1, 1.05, 1] }}
              transition={prefersReducedMotion ? undefined : { duration: 3, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
            />
            {/* Button core with subtle gradient and inner glow */}
            <motion.span
              className="relative inline-flex w-full h-full items-center justify-center rounded-[22px] bg-gradient-to-br from-dark-bg via-[#231c4a] to-deep-violet text-white shadow-[0_2px_8px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] transition-shadow duration-300"
              style={{ boxShadow: '0 0 0 2px rgba(255,255,255,0.06), 0 12px 30px rgba(0,0,0,0.45), 0 0 36px 6px rgba(108,99,255,0.25)', transformOrigin: 'bottom right' }}
              animate={prefersReducedMotion ? undefined : { scale: opening ? 1.1 : 1 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.18, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* Neon edge ring intensifies on hover */}
              <span aria-hidden className="absolute inset-0 rounded-[22px] ring-1 ring-brand-purple/30 group-hover:ring-brand-purple-light/40 transition" />
              {/* Icon */}
              <span className="relative flex items-center justify-center text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.75)]">
                <AnimatePresence mode="popLayout" initial={false}>
                  {!opening ? (
                    <motion.span
                      key="icon-bot"
                      initial={{ opacity: 0, rotate: -10 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 10 }}
                      transition={{ duration: prefersReducedMotion ? 0.12 : 0.2, ease: [0.4, 0, 0.2, 1] }}
                      className="inline-flex"
                    >
                      <Bot size={22} className="opacity-90" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="icon-x"
                      initial={{ opacity: 0, rotate: -90, scale: 0.9 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, rotate: 90, scale: 0.9 }}
                      transition={{ duration: prefersReducedMotion ? 0.12 : 0.2, ease: [0.4, 0, 0.2, 1] }}
                      className="inline-flex"
                    >
                      <X size={20} className="opacity-90" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
              {/* Glow on hover */}
              <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[22px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.span>
          </motion.button>
        ) : null)}
      </AnimatePresence>
    </div>
  );
}
