"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent, type PointerEvent } from "react";

import { chatbotContent, welixBehavior } from "@/data/chatbot";
import { chatAllowedPaths, MAX_CHAT_MESSAGE_LENGTH, MAX_CHAT_HISTORY, type ChatLink, type ChatTurn } from "@/lib/chat/shared";
import { WelixAvatar, type WelixPose } from "./welix-avatar";

type Message = ChatTurn & { id: string; links?: ChatLink[] };
type Mode = "ai" | "demo" | "loading";
type Offer = "welcome" | null;
type Point = { x: number; y: number };
type DragSession = { pointerId: number; startX: number; startY: number; offsetX: number; offsetY: number; moved: boolean };
const STORAGE_KEY = "golf-marcilly-welix-visit";
const PROMPT_KEY = "golf-marcilly-welix-prompted-v3";
const HIDDEN_KEY = "golf-marcilly-welix-hidden";
const MOTION_KEY = "golf-marcilly-welix-motion-off";
const POSITION_KEY = "golf-marcilly-welix-position";

function readFlag(storage: "local" | "session", key: string): boolean {
  try { return (storage === "local" ? localStorage : sessionStorage).getItem(key) === "1"; } catch { return false; }
}

function writeFlag(storage: "local" | "session", key: string, enabled: boolean): void {
  try { (storage === "local" ? localStorage : sessionStorage).setItem(key, enabled ? "1" : "0"); } catch { /* Stockage facultatif. */ }
}

function clampPosition(point: Point, width: number, height: number): Point {
  const mobile = width < 640;
  const size = mobile ? welixBehavior.mobileSizePx : welixBehavior.desktopSizePx;
  const margin = welixBehavior.screenMarginPx;
  const maxX = Math.max(margin, width - size - margin);
  const maxY = Math.max(margin, height - size - (mobile ? welixBehavior.mobileBottomClearancePx : welixBehavior.desktopBottomClearancePx));
  return {
    x: Math.min(maxX, Math.max(margin, point.x)),
    y: Math.min(maxY, Math.max(Math.min(welixBehavior.topClearancePx, maxY), point.y)),
  };
}

function initialPosition(width: number, height: number): Point {
  const mobile = width < 640;
  return clampPosition({
    x: width - (mobile ? welixBehavior.mobileSizePx : welixBehavior.desktopSizePx) - 12,
    y: height - (mobile ? welixBehavior.mobileSizePx + welixBehavior.mobileBottomClearancePx : welixBehavior.desktopSizePx + welixBehavior.desktopBottomClearancePx),
  }, width, height);
}

function pageHasActiveInputOrDialog(): boolean {
  const focused = document.activeElement;
  if (focused?.matches("input, textarea, select, [contenteditable='true']")) return true;
  if (document.querySelector("[data-cookie-consent]")) return true;
  return [...document.querySelectorAll("dialog[open], [role='dialog']")].some((dialog) => dialog.getClientRects().length > 0);
}

function greeting(mode: Mode): Message {
  return { id: "welcome", role: "assistant", content: mode === "demo" ? chatbotContent.demoGreeting : chatbotContent.greeting };
}

function validStoredMessages(value: unknown): Message[] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 30) return null;
  const messages = value.filter((item): item is Message => item && typeof item === "object" && typeof item.id === "string" && (item.role === "user" || item.role === "assistant") && typeof item.content === "string" && item.content.length <= MAX_CHAT_MESSAGE_LENGTH && (!item.links || (Array.isArray(item.links) && item.links.every((link: ChatLink) => link && chatAllowedPaths.some((path) => path === link.href) && typeof link.label === "string" && link.label.length <= 50))));
  return messages.length === value.length ? messages : null;
}

export function GolfChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [motionOff, setMotionOff] = useState(false);
  const [offer, setOffer] = useState<Offer>(null);
  const [position, setPosition] = useState<Point | null>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [dragging, setDragging] = useState(false);
  const [pose, setPose] = useState<WelixPose>("idle");
  const [walkFrame, setWalkFrame] = useState(false);
  const [roamOffset, setRoamOffset] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mode, setMode] = useState<Mode>("loading");
  const [messages, setMessages] = useState<Message[]>([greeting("loading")]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const hadOpenRef = useRef(false);
  const solicitedRef = useRef(false);
  const movedRef = useRef(false);
  const dragRef = useRef<DragSession | null>(null);
  const previousPathRef = useRef<string | null>(null);
  const swingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const stored = validStoredMessages(JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null"));
      if (stored) setMessages(stored);
    } catch { /* Stockage désactivé par le navigateur : la visite fonctionne en mémoire. */ }
    solicitedRef.current = readFlag("session", PROMPT_KEY);
    setHidden(readFlag("local", HIDDEN_KEY));
    setMotionOff(readFlag("local", MOTION_KEY));
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    let storedPosition: Point | null = null;
    try {
      const parsed: unknown = JSON.parse(sessionStorage.getItem(POSITION_KEY) || "null");
      if (parsed && typeof parsed === "object" && "x" in parsed && "y" in parsed && typeof parsed.x === "number" && typeof parsed.y === "number" && Number.isFinite(parsed.x) && Number.isFinite(parsed.y)) storedPosition = { x: parsed.x, y: parsed.y };
    } catch { /* facultatif */ }
    movedRef.current = storedPosition !== null;
    setPosition(storedPosition ? clampPosition(storedPosition, innerWidth, innerHeight) : initialPosition(innerWidth, innerHeight));
    setViewport({ width: innerWidth, height: innerHeight });
    setHydrated(true);
    const controller = new AbortController();
    fetch("/api/chat", { signal: controller.signal, cache: "no-store" })
      .then((response) => response.json())
      .then((data: { mode?: string }) => {
        const nextMode = data.mode === "ai" ? "ai" : "demo";
        setMode(nextMode);
        setMessages((current) => current.length === 1 && current[0].id === "welcome" ? [greeting(nextMode)] : current);
      })
      .catch(() => setMode("demo"));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!hydrated || previousPathRef.current === pathname) return;
    previousPathRef.current = pathname;
    if (swingTimerRef.current) clearTimeout(swingTimerRef.current);
    setRoamOffset(0);
    if (hidden || open || motionOff || reducedMotion) {
      setPose("idle");
      return;
    }
    setPose("swing");
    swingTimerRef.current = setTimeout(() => setPose("idle"), welixBehavior.swingDurationMs);
  }, [pathname, hydrated, hidden, open, motionOff, reducedMotion]);

  useEffect(() => () => {
    if (swingTimerRef.current) clearTimeout(swingTimerRef.current);
  }, []);

  useEffect(() => {
    if (!open && !hidden && !motionOff && !reducedMotion && !dragging) return;
    setPose("idle");
    setRoamOffset(0);
  }, [open, hidden, motionOff, reducedMotion, dragging]);

  useEffect(() => {
    if (!hydrated || hidden || open || offer || dragging || motionOff || reducedMotion || pose !== "idle" || !position) return;
    const timer = setInterval(() => {
      if (pageHasActiveInputOrDialog() || document.visibilityState !== "visible") return;
      const direction = position.x > viewport.width / 2 ? -1 : 1;
      const destination = clampPosition({ x: position.x + direction * welixBehavior.idleWalkDistancePx, y: position.y }, innerWidth, innerHeight);
      const offset = destination.x - position.x;
      if (!offset) return;
      setRoamOffset(offset);
      setPose("walk");
    }, welixBehavior.idleWalkDelayMs);
    return () => clearInterval(timer);
  }, [hydrated, hidden, open, offer, dragging, motionOff, reducedMotion, pose, position, viewport.width]);

  useEffect(() => {
    if (pose !== "walk") return;
    const frame = setInterval(() => setWalkFrame((current) => !current), 280);
    const returnTimer = setTimeout(() => setRoamOffset(0), welixBehavior.walkOutDurationMs);
    const finishTimer = setTimeout(() => { setPose("idle"); setWalkFrame(false); }, welixBehavior.walkTotalDurationMs);
    return () => { clearInterval(frame); clearTimeout(returnTimer); clearTimeout(finishTimer); };
  }, [pose]);

  useEffect(() => {
    if (!hydrated) return;
    writeFlag("local", HIDDEN_KEY, hidden);
    writeFlag("local", MOTION_KEY, motionOff);
  }, [hydrated, hidden, motionOff]);

  useEffect(() => {
    if (!hydrated || !position) return;
    try {
      if (movedRef.current) sessionStorage.setItem(POSITION_KEY, JSON.stringify(position));
      else sessionStorage.removeItem(POSITION_KEY);
    } catch { /* facultatif */ }
  }, [hydrated, position]);

  useEffect(() => {
    if (!hydrated) return;
    const onResize = () => {
      setViewport({ width: innerWidth, height: innerHeight });
      setPosition((current) => movedRef.current && current ? clampPosition(current, innerWidth, innerHeight) : initialPosition(innerWidth, innerHeight));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || hidden || open || offer || dragging || solicitedRef.current) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = (delay: number) => { clearTimeout(timer); timer = setTimeout(attempt, delay); };
    const attempt = () => {
      if (pageHasActiveInputOrDialog() || document.visibilityState !== "visible") {
        schedule(welixBehavior.retryWhileBusyMs);
        return;
      }
      solicitedRef.current = true;
      writeFlag("session", PROMPT_KEY, true);
      setOffer("welcome");
    };
    schedule(welixBehavior.firstWelcomeDelayMs);
    return () => clearTimeout(timer);
  }, [hydrated, hidden, open, offer, dragging]);

  useEffect(() => {
    if (!offer) return;
    const timer = setTimeout(() => setOffer(null), welixBehavior.offerDurationMs);
    const onFocus = (event: FocusEvent) => {
      if (event.target instanceof HTMLElement && event.target.matches("input, textarea, select, [contenteditable='true']")) setOffer(null);
    };
    document.addEventListener("focusin", onFocus);
    return () => { clearTimeout(timer); document.removeEventListener("focusin", onFocus); };
  }, [offer]);

  useEffect(() => {
    if (!hydrated) return;
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30))); } catch { /* facultatif */ }
  }, [hydrated, messages]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [open]);

  useEffect(() => {
    if (open) hadOpenRef.current = true;
    else if (hadOpenRef.current) launcherRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (messages.length === 1) logRef.current?.scrollTo({ top: 0 });
    else endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, pending, open]);

  const send = useCallback(async (text: string, retry = false) => {
    const content = text.trim();
    if (!content || pending || content.length > MAX_CHAT_MESSAGE_LENGTH) return;
    const nextMessages = retry ? messages : [...messages, { id: crypto.randomUUID(), role: "user" as const, content }];
    if (!retry) { setMessages(nextMessages); setDraft(""); }
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-MAX_CHAT_HISTORY).map(({ role, content: value }) => ({ role, content: value })) }),
      });
      const data: { answer?: string; links?: ChatLink[]; mode?: "ai" | "demo"; error?: string } = await response.json();
      if (!response.ok || typeof data.answer !== "string") throw new Error(data.error || "La réponse n’a pas pu être affichée.");
      setMode(data.mode === "demo" ? "demo" : "ai");
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", content: data.answer!, links: Array.isArray(data.links) ? data.links : [] }]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Une erreur est survenue. Réessayez.");
    } finally {
      setPending(false);
    }
  }, [messages, pending]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(draft);
  }

  function handlePanelKeys(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "Tab") return;
    const focusable = panelRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], textarea:not([disabled])");
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  function openChat() {
    solicitedRef.current = true;
    writeFlag("session", PROMPT_KEY, true);
    setOffer(null);
    setPose("idle");
    setRoamOffset(0);
    setOpen(true);
  }

  function hideWelix() {
    setOffer(null);
    setOpen(false);
    setHidden(true);
  }

  function moveTo(point: Point) {
    movedRef.current = true;
    setPosition(clampPosition(point, innerWidth, innerHeight));
  }

  function startDrag(event: PointerEvent<HTMLButtonElement>) {
    if (!position || (event.pointerType === "mouse" && event.button !== 0)) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const bounds = event.currentTarget.getBoundingClientRect();
    const visualPosition = clampPosition({ x: bounds.left, y: bounds.top }, innerWidth, innerHeight);
    setPosition(visualPosition);
    setRoamOffset(0);
    setPose("idle");
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, offsetX: event.clientX - visualPosition.x, offsetY: event.clientY - visualPosition.y, moved: false };
    setOffer(null);
  }

  function drag(event: PointerEvent<HTMLButtonElement>) {
    const current = dragRef.current;
    if (!current || current.pointerId !== event.pointerId) return;
    if (!current.moved && Math.hypot(event.clientX - current.startX, event.clientY - current.startY) < welixBehavior.dragThresholdPx) return;
    if (!current.moved) { current.moved = true; setDragging(true); }
    moveTo({ x: event.clientX - current.offsetX, y: event.clientY - current.offsetY });
  }

  function stopDrag(event: PointerEvent<HTMLButtonElement>, cancelled = false) {
    const current = dragRef.current;
    if (current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (!cancelled && !current.moved) openChat();
  }

  function handleDragKeys(event: KeyboardEvent<HTMLButtonElement>) {
    if (!position) return;
    const step = welixBehavior.dragKeyboardStepPx;
    const moves: Record<string, Point> = {
      ArrowLeft: { x: -step, y: 0 }, ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: -step }, ArrowDown: { x: 0, y: step },
    };
    const delta = moves[event.key];
    if (delta) { event.preventDefault(); moveTo({ x: position.x + delta.x, y: position.y + delta.y }); }
    if (event.key === "Home") { event.preventDefault(); movedRef.current = false; setPosition(initialPosition(innerWidth, innerHeight)); }
  }

  const presenceState = hidden ? "hidden" : open ? pending ? "responding" : "conversation" : pose === "swing" ? "swing" : pose === "walk" ? "walking" : offer === "welcome" ? "greeting" : offer ? "offer" : "idle";
  const offerWidth = Math.min(310, Math.max(240, viewport.width - 16));
  const offerTop = position ? position.y > 250 ? position.y - 218 : position.y + (viewport.width < 640 ? welixBehavior.mobileSizePx : welixBehavior.desktopSizePx) + 8 : 80;
  const offerStyle = position ? {
    left: Math.max(8, Math.min(viewport.width - offerWidth - 8, position.x - offerWidth + 72)),
    top: Math.max(80, Math.min(viewport.height - 225, offerTop)),
    width: offerWidth,
  } : undefined;

  if (!hydrated) return null;

  return (
    <>
      {hidden ? (
        <button
          ref={launcherRef}
          type="button"
          onClick={() => setHidden(false)}
          aria-label="Réafficher Welix, assistant IA"
          className="fixed bottom-[calc(7rem+env(safe-area-inset-bottom))] right-3 z-[70] flex h-10 w-10 items-center justify-center rounded-full bg-emerald-950 text-sm font-bold text-white shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 sm:bottom-5 sm:right-5"
        >W</button>
      ) : (
        <div
          data-welix-state={presenceState}
          style={position ? { left: position.x + roamOffset, top: position.y, "--welix-nudge": `${welixBehavior.maxAutomaticMovePx / 2}px` } as CSSProperties : undefined}
          className={`welix-appear fixed z-[70] h-20 w-20 sm:h-24 sm:w-24 ${open ? "invisible pointer-events-none" : ""} ${pose === "walk" ? "welix-walking" : ""} ${motionOff || reducedMotion || dragging ? "welix-no-motion" : ""}`}
        >
          <button
            ref={launcherRef}
            type="button"
            aria-label="Parler à Welix, assistant IA. Faire glisser ou utiliser les flèches pour le déplacer. Touche Début pour le remettre à sa place."
            aria-expanded={open}
            aria-controls="golf-chat-panel"
            aria-hidden={open}
            tabIndex={open ? -1 : 0}
            onClick={(event) => { if (event.detail === 0) openChat(); }}
            onPointerDown={startDrag}
            onPointerMove={drag}
            onPointerUp={stopDrag}
            onPointerCancel={(event) => stopDrag(event, true)}
            onKeyDown={handleDragKeys}
            className={`welix-robot flex h-full w-full touch-none items-center justify-center bg-transparent focus-visible:rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${pose === "walk" ? "welix-walking" : pose === "swing" ? "welix-swinging" : offer === "welcome" ? "welix-greeting" : offer ? "welix-offering" : "welix-idle"}`}
          >
            <WelixAvatar pose={pose === "walk" && !walkFrame ? "idle" : pose} className="h-20 w-20 drop-shadow-[0_8px_8px_rgba(0,35,27,0.35)] sm:h-24 sm:w-24" />
          </button>
        </div>
      )}

      {offer && !hidden && !open && (
        <aside
          style={offerStyle}
          aria-label="Proposition d’aide de Welix"
          className="fixed z-[69] rounded-2xl border border-emerald-950/15 bg-[#f7f4e9] p-4 text-sm text-emerald-950 shadow-xl"
        >
          <button type="button" onClick={() => setOffer(null)} aria-label="Fermer la proposition de Welix" className="absolute right-2 top-2 rounded-full px-2 text-xl leading-6 hover:bg-emerald-950/10 focus-visible:outline-2 focus-visible:outline-emerald-700">×</button>
          <p className="pr-5 leading-5" aria-live="polite">{chatbotContent.welcomeOffer}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={openChat} className="rounded-full bg-emerald-800 px-3 py-2 text-xs font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">Oui, guidez-moi</button>
            <button type="button" onClick={openChat} className="rounded-full border border-emerald-800/25 bg-white px-3 py-2 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-emerald-700">J’ai une question</button>
            <button type="button" onClick={() => setOffer(null)} className="rounded-full px-3 py-2 text-xs font-semibold underline focus-visible:outline-2 focus-visible:outline-emerald-700">Plus tard</button>
          </div>
        </aside>
      )}

      {open && (
        <section
          id="golf-chat-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="golf-chat-title"
          onKeyDown={handlePanelKeys}
          className="fixed bottom-[calc(7rem+env(safe-area-inset-bottom))] right-3 z-[69] flex h-[min(440px,calc(100dvh-12rem))] w-[min(340px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-[24px] border border-emerald-950/15 bg-[#f7f4e9] shadow-2xl shadow-emerald-950/25 sm:bottom-24 sm:right-6 sm:h-[min(480px,calc(100dvh-7rem))]"
        >
          <div className="flex items-center gap-1 bg-emerald-950 px-3 py-3 text-white">
            <WelixAvatar className="h-9 w-9 shrink-0 drop-shadow-sm" />
            <div className="min-w-0 flex-1">
              <h2 id="golf-chat-title" className="font-serif text-base leading-tight">Welix, votre caddie IA</h2>
              <p className="text-xs text-emerald-100">Assistant IA · {mode === "demo" ? "mode démo" : mode === "loading" ? "connexion…" : "réponses IA"}</p>
            </div>
            <button type="button" onClick={() => setMotionOff((value) => !value)} aria-label={motionOff ? "Activer les animations de Welix" : "Désactiver les animations de Welix"} aria-pressed={motionOff} title={motionOff ? "Activer les animations" : "Désactiver les animations"} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base leading-none hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white">{motionOff ? "▶" : "Ⅱ"}</button>
            <button type="button" onClick={hideWelix} aria-label="Masquer Welix" title="Masquer Welix" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base leading-none hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white">◌</button>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fermer la discussion" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-2xl leading-none hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white">×</button>
          </div>

          <div ref={logRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-4" role="log" aria-label="Conversation avec Welix" aria-live="polite" aria-relevant="additions text">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${message.role === "user" ? "rounded-br-sm bg-emerald-800 text-white" : "rounded-bl-sm border border-emerald-950/10 bg-white text-emerald-950"}`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.links?.length ? <div className="mt-3 flex flex-wrap gap-2">{message.links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-full border border-emerald-700/30 px-3 py-1 text-xs font-semibold text-emerald-800 underline-offset-2 hover:bg-emerald-50 hover:underline focus-visible:outline-2 focus-visible:outline-emerald-700">{link.label} ↗</Link>)}</div> : null}
                </div>
              </div>
            ))}
            {messages.length === 1 && <div className="flex flex-wrap gap-2" aria-label="Questions proposées">{chatbotContent.suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => void send(suggestion)} className="rounded-full border border-emerald-800/20 bg-white px-3 py-2 text-left text-xs font-medium text-emerald-900 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-700">{suggestion}</button>)}</div>}
            {pending && <p className="text-sm text-emerald-800" role="status">Welix prépare sa réponse…</p>}
            {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900"><p>{error}</p><button type="button" onClick={() => void send(messages.at(-1)?.content || "", true)} className="mt-2 font-semibold underline underline-offset-2">Réessayer</button></div>}
            <div ref={endRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-emerald-950/10 bg-white p-3">
            <label htmlFor="golf-chat-input" className="sr-only">Votre message à Welix</label>
            <div className="flex items-end gap-2 rounded-2xl border border-emerald-950/20 bg-[#f7f4e9] p-2 focus-within:ring-2 focus-within:ring-emerald-700">
              <textarea
                ref={inputRef}
                id="golf-chat-input"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); if (!pending) void send(draft); } }}
                maxLength={MAX_CHAT_MESSAGE_LENGTH}
                rows={2}
                placeholder="Posez votre question…"
                className="max-h-24 min-h-12 flex-1 resize-none bg-transparent px-2 py-1 text-sm text-emerald-950 outline-none placeholder:text-emerald-950/50"
              />
              <button type="submit" disabled={pending || !draft.trim()} className="mb-1 rounded-full bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">Envoyer</button>
            </div>
            <p className="mt-2 px-1 text-[11px] leading-4 text-emerald-950/65">{mode === "demo" ? "Mode démo : réponses limitées aux informations du site. " : ""}Ne partagez pas de données personnelles. Vérifiez les informations importantes auprès du golf.</p>
          </form>
        </section>
      )}
    </>
  );
}
