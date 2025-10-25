"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { getDb, initDb } from '../lib/db';
import type { Database, Experience, Education, Project, Service, RawSkill, Testimonial, Blog } from '../types';
import { Bot, Send } from 'lucide-react';

type Msg = { role: 'user' | 'assistant'; content: string };

function summarize(db: Database) {
  const name = db.hero?.name || 'Me';
  const title = db.hero?.title || '';
  const shortBio = db.hero?.shortBio || '';
  const topSkills = (db.skills || []).slice(0, 6).map((s: RawSkill) => s.skillName || s.skillIcon).filter(Boolean) as string[];
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

function answerQuestion(q: string, db: Database): string {
  const query = q.toLowerCase();
  const s = summarize(db);

  const includesAny = (words: string[]) => words.some(w => query.includes(w));

  if (includesAny(['who are you', 'who is', 'your name', 'introduce', 'about you'])) {
    return `Hi! I'm ${s.name}${s.title ? `, ${s.title}` : ''}. ${s.shortBio || 'I build delightful, performant web experiences.'}`;
  }

  if (includesAny(['skill', 'stack', 'technology', 'tools'])) {
    const skillsText = list(db.skills || [], (sk: RawSkill) => sk.skillName || sk.skillIcon);
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
    const edText = list(db.educations || [], (e: Education) => `${e.courseTitle} — ${e.instituteName} (${e.startYear}–${e.endYear})`);
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
      'You can reach me via:',
      email ? `• Email: ${email}` : '',
      phone ? `• Phone: ${phone}` : '',
      socials ? `• Socials:\n${socials}` : '',
    ].filter(Boolean);
    return lines.join('\n') || `Use the contact form and I’ll get back to you soon!`;
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
  const skillsLine = s.topSkills.length ? ` I often work with ${s.topSkills.slice(0, 4).join(', ')}.` : '';
  const projectLine = s.featuredTitles.length ? ` Recent projects include ${s.featuredTitles.slice(0, 2).join(', ')}.` : '';
  return `Hi! I'm ${s.name}${s.title ? `, ${s.title}` : ''}. ${s.shortBio || ''}${skillsLine}${projectLine} Ask me about my projects, skills, or how I can help you.`.trim();
}

export default function Chatbot() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [db, setDb] = useState<Database | null>(null);
  const [input, setInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [animatedReply, setAnimatedReply] = useState<string | null>(null);
  const [animatedIndex, setAnimatedIndex] = useState(0);
  const [messages, setMessages] = useState<Msg[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('chatbot-history');
      return raw ? (JSON.parse(raw) as Msg[]) : [];
    } catch { return []; }
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try { initDb(); setDb(getDb()); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem('chatbot-history', JSON.stringify(messages.slice(-50))); } catch {}
    // scroll to bottom on new message
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const disabled = useMemo(() => !db || !input.trim(), [db, input]);

  const send = async () => {
    const q = input.trim();
    if (!db || !q) return;
    const userMsg: Msg = { role: 'user', content: q };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsBotTyping(true);
    // Try LLM first via server route; fallback to local rule-based answer
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });
      if (res.ok) {
        const data = await res.json();
        const reply = (data?.answer as string) || '';
        if (reply) {
          // start typewriter animation
          setIsBotTyping(false);
          setAnimatedReply(reply);
          setAnimatedIndex(0);
          return;
        }
      }
      // Non-ok or empty answer => fallback
      const reply = answerQuestion(q, db);
      setIsBotTyping(false);
      setAnimatedReply(reply);
      setAnimatedIndex(0);
    } catch {
      const reply = answerQuestion(q, db);
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
          setMessages(prevMsgs => [...prevMsgs, { role: 'assistant', content: animatedReply }]);
          setAnimatedReply(null);
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
    setInput(text);
    await new Promise(r => setTimeout(r, 0));
    if (navigateId) scrollToId(navigateId);
    send();
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999]" style={{ fontFamily: 'Inter, Poppins, sans-serif' }}>
      {/* Toggle button */}
      <AnimatePresence initial={false}>
        {!open && (
          <motion.button
            key="chat-toggle"
            onClick={() => setOpen(true)}
            aria-label="Open chat"
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26, mass: 0.8 }}
            className="group relative select-none w-14 h-14 md:w-16 md:h-16 rounded-[22px] outline-none focus-visible:ring-2 focus-visible:ring-purple-400/40"
          >
            {/* Outer neon aura */}
            <span aria-hidden className="pointer-events-none absolute -inset-2 rounded-[26px] bg-[radial-gradient(ellipse_at_center,rgba(108,99,255,0.35),rgba(108,99,255,0)_60%)] opacity-70 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
            {/* Button core with subtle gradient and inner glow */}
            <span
              className="relative inline-flex w-full h-full items-center justify-center rounded-[22px] bg-gradient-to-br from-dark-bg via-[#231c4a] to-deep-violet text-white shadow-[0_2px_8px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] transition-shadow duration-300"
              style={{ boxShadow: '0 0 0 2px rgba(255,255,255,0.06), 0 12px 30px rgba(0,0,0,0.45), 0 0 36px 6px rgba(108,99,255,0.25)' }}
            >
              {/* Neon edge ring intensifies on hover */}
              <span aria-hidden className="absolute inset-0 rounded-[22px] ring-1 ring-brand-purple/30 group-hover:ring-brand-purple-light/40 transition" />
              {/* Icon */}
              <span className="relative flex items-center justify-center text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.75)]">
                <Bot size={22} className="opacity-90" />
              </span>
              {/* Glow on hover */}
              <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[22px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            className="relative w-[90vw] max-w-md h-[65vh] max-h-[75vh] rounded-2xl border border-brand-purple/10 bg-dark-bg/95 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col"
            initial={{ opacity: 0, x: 24, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24, mass: 0.9 }}
          >
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
                  <div className="font-semibold text-white">Virtual Assistant</div>
                  <div className="text-white/60">Ask about projects, skills, and more</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white" aria-label="Close">✕</button>
            </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="flex items-start gap-2 text-sm">
                <div className="mt-0.5 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                  <Bot size={14} className="opacity-90" />
                </div>
                <div className="inline-block rounded-2xl rounded-tl-sm px-3 py-2 bg-white/5 text-white shadow-sm border border-brand-purple/10">
                  Hey there 👋 I’m your virtual assistant! Want to know more about my projects, skills, or background?
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
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
            <button onClick={() => { try { window.open('/images/Priyesh%20Mishra%20UIUX.pdf', '_blank'); } catch {} quickSend('Can I download your resume?'); }} className="px-3 py-1.5 rounded-full text-xs bg-brand-purple/10 text-brand-purple hover:bg-brand-purple/20 transition">Download Resume</button>
            <button onClick={() => quickSend('How can I contact you?', 'contact')} className="px-3 py-1.5 rounded-full text-xs bg-brand-purple/10 text-brand-purple hover:bg-brand-purple/20 transition">Contact Me</button>
            <button onClick={() => quickSend('Tell me about yourself', 'home')} className="px-3 py-1.5 rounded-full text-xs bg-brand-purple/10 text-brand-purple hover:bg-brand-purple/20 transition">About Me</button>
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
              <button disabled={disabled} onClick={send} className={`px-3.5 py-2 rounded-full text-sm flex items-center gap-1 ${disabled ? 'bg-white/10 text-white/40' : 'bg-brand-purple text-white hover:brightness-110'}`} aria-label="Send">
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
