import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { Video, Square, RotateCcw, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/gravar")({
  head: () => ({
    meta: [
      { title: "Gravar depoimento — Digitale Têxtil" },
      { name: "description", content: "Grave seu depoimento em vídeo direto pelo navegador." },
    ],
  }),
  component: RecordPage,
});

const MAX_SECONDS = 180;

const schema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(100),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  role: z.string().trim().max(80).optional().or(z.literal("")),
  email: z.string().trim().email("E-mail inválido").max(160).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

type Phase = "idle" | "ready" | "recording" | "recorded" | "uploading" | "done" | "error";

function pickMimeType() {
  const types = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"];
  for (const t of types) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) return t;
  }
  return "video/webm";
}

function RecordPage() {
  const navigate = useNavigate();
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const playbackRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [mime, setMime] = useState<string>("video/webm");

  const [form, setForm] = useState({ name: "", company: "", role: "", email: "", phone: "", message: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function requestCamera() {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: true,
      });
      streamRef.current = stream;
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
        await liveVideoRef.current.play().catch(() => {});
      }
      setPhase("ready");
    } catch (e) {
      console.error(e);
      setPhase("error");
      setErrorMsg("Não conseguimos acessar sua câmera/microfone. Verifique as permissões do navegador e tente novamente.");
    }
  }

  function startRecording() {
    if (!streamRef.current) return;
    const m = pickMimeType();
    setMime(m);
    chunksRef.current = [];
    const rec = new MediaRecorder(streamRef.current, { mimeType: m });
    rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    rec.onstop = () => {
      const b = new Blob(chunksRef.current, { type: m });
      setBlob(b);
      const url = URL.createObjectURL(b);
      setBlobUrl(url);
      setPhase("recorded");
    };
    recorderRef.current = rec;
    rec.start(250);
    setSeconds(0);
    setPhase("recording");
    timerRef.current = window.setInterval(() => {
      setSeconds((s) => {
        if (s + 1 >= MAX_SECONDS) {
          stopRecording();
          return MAX_SECONDS;
        }
        return s + 1;
      });
    }, 1000);
  }

  function stopRecording() {
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
    recorderRef.current?.state === "recording" && recorderRef.current.stop();
  }

  function discardAndRetry() {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlob(null); setBlobUrl(null); setSeconds(0);
    setPhase("ready");
  }

  async function submit() {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    if (!blob) return;

    setPhase("uploading");
    try {
      const ext = mime.includes("mp4") ? "mp4" : "webm";
      const safeName = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "depoimento";
      const path = `${new Date().toISOString().slice(0, 10)}/${safeName}-${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage.from("testimonials").upload(path, blob, {
        contentType: mime, upsert: false,
      });
      if (upErr) throw upErr;

      const { error: insErr } = await supabase.from("testimonials").insert({
        name: form.name.trim(),
        company: form.company.trim() || null,
        role: form.role.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        message: form.message.trim() || null,
        video_path: path,
        duration_seconds: seconds,
      });
      if (insErr) throw insErr;

      streamRef.current?.getTracks().forEach((t) => t.stop());
      setPhase("done");
      setTimeout(() => navigate({ to: "/obrigado" }), 800);
    } catch (e) {
      console.error(e);
      setPhase("recorded");
      setErrorMsg("Houve um erro ao enviar seu vídeo. Tente novamente em alguns instantes.");
    }
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 md:py-14">
        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-3">Sua opinião importa</div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">Grave seu depoimento</h1>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Até {MAX_SECONDS / 60} minutos. Conte como tem sido sua experiência com a Digitale Têxtil.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm">{errorMsg}</div>
          </div>
        )}

        {/* Video stage */}
        <div className="relative rounded-2xl overflow-hidden bg-secondary aspect-video shadow-[var(--shadow-soft)] border border-border">
          {phase === "idle" || phase === "error" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-foreground text-center px-6">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <Video className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Pronto para começar?</h3>
              <p className="text-foreground/70 mb-6 max-w-sm">Vamos pedir acesso à sua câmera e microfone.</p>
              <button onClick={requestCamera} className="px-8 py-3 rounded-full bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity shadow-[var(--shadow-orange)]">
                Liberar câmera
              </button>
            </div>
          ) : phase === "recorded" || phase === "uploading" || phase === "done" ? (
            <video ref={playbackRef} src={blobUrl ?? undefined} controls className="absolute inset-0 w-full h-full object-cover bg-black" />
          ) : (
            <video ref={liveVideoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover bg-black" />
          )}

          {phase === "recording" && (
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur text-white text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> REC {mm}:{ss}
            </div>
          )}
          {phase === "ready" && (
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur text-white text-xs uppercase tracking-wider">
              Pré-visualização
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {phase === "ready" && (
            <button onClick={startRecording} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity shadow-[var(--shadow-orange)]">
              <span className="w-3 h-3 rounded-full bg-red-500" /> Iniciar gravação
            </button>
          )}
          {phase === "recording" && (
            <button onClick={stopRecording} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-foreground text-background font-semibold hover:opacity-90 transition-opacity">
              <Square className="w-4 h-4" /> Parar gravação
            </button>
          )}
          {phase === "recorded" && (
            <>
              <button onClick={discardAndRetry} className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-foreground font-medium hover:bg-secondary transition-colors">
                <RotateCcw className="w-4 h-4" /> Regravar
              </button>
            </>
          )}
          {phase === "ready" && (
            <div className="text-xs text-muted-foreground">Máx. {MAX_SECONDS / 60} min</div>
          )}
        </div>

        {/* Form */}
        {phase === "recorded" || phase === "uploading" || phase === "done" ? (
          <div className="mt-10 p-6 md:p-8 rounded-2xl border border-border bg-card">
            <h3 className="text-xl font-semibold text-foreground mb-1">Quase lá!</h3>
            <p className="text-sm text-muted-foreground mb-6">Preencha seus dados para que possamos identificar seu depoimento.</p>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Nome completo *" name="name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} error={fieldErrors.name} />
              <Field label="Empresa" name="company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} error={fieldErrors.company} />
              <Field label="Cargo" name="role" value={form.role} onChange={(v) => setForm({ ...form, role: v })} error={fieldErrors.role} />
              <Field label="E-mail" name="email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} error={fieldErrors.email} />
              <Field label="Telefone" name="phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} error={fieldErrors.phone} />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">Mensagem (opcional)</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={3}
                  maxLength={1000}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-accent transition"
                  placeholder="Algo que queira complementar por escrito..."
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              <button
                onClick={submit}
                disabled={phase !== "recorded"}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[image:var(--gradient-orange)] text-accent-foreground font-semibold hover:opacity-90 transition-opacity shadow-[var(--shadow-orange)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {phase === "uploading" ? (<><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>) :
                 phase === "done" ? (<><CheckCircle2 className="w-4 h-4" /> Enviado!</>) :
                 (<><Send className="w-4 h-4" /> Enviar depoimento</>)}
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-accent transition-colors">← Voltar ao início</Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({ label, name, value, onChange, error, type = "text" }: {
  label: string; name: string; value: string; onChange: (v: string) => void; error?: string; type?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      <input
        id={name} name={name} type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-accent transition"
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
