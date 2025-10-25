"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { getDb, initDb } from '../lib/db';
import type { Database, Experience, Education, Project, Service, RawSkill, Testimonial, Blog } from '../types';

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
          setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
          return;
        }
      }
      // Non-ok or empty answer => fallback
      const reply = answerQuestion(q, db);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      const reply = answerQuestion(q, db);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    }
  };

  // Previously hidden on /admin to avoid UI overlap. Showing it everywhere for visibility.

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      {/* Toggle button */}
      <AnimatePresence initial={false}>
        {!open && (
          <motion.button
            key="chat-toggle"
            onClick={() => setOpen(true)}
            className="rounded-full bg-gradient-to-r from-brand-purple to-brand-accent text-white shadow-xl drop-shadow-lg px-4 py-3 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-white/20 border border-white/10 backdrop-blur-md"
            aria-label="Open chat"
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26, mass: 0.8 }}
          >
            Chat
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            className="relative w-[90vw] max-w-sm h-[60vh] max-h-[70vh] rounded-xl border border-white/10 bg-[#0b0b12]/95 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.6)] drop-shadow-2xl flex flex-col"
            initial={{ opacity: 0, x: 24, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24, mass: 0.9 }}
          >
            {/* Side pop arrow */}
            <motion.div
              aria-hidden
              className="hidden md:block absolute -right-2 bottom-16 w-4 h-4 bg-[#0b0b12]/95 border border-white/10 rotate-45 shadow-xl"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2 }}
            />
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
              <div className="text-sm">
                <div className="font-semibold">Ask about Priyesh</div>
                <div className="text-white/60">Friendly chat about projects, skills, and more</div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white">✕</button>
            </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-sm text-white/70">
                Hi! Ask me about projects, experience, skills, or how to contact me.
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div className={`inline-block rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-primary/20 border border-primary/30' : 'bg-white/5 border border-white/10'}`}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>

            <div className="p-3 border-t border-white/10 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send(); }}
              placeholder="Type your question..."
              className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button disabled={disabled} onClick={send} className={`px-3 py-2 rounded-md text-sm ${disabled ? 'bg-white/10 text-white/40' : 'bg-primary text-white hover:brightness-110'}`}>
              Send
            </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
