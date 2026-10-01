"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || data.user?.app_metadata?.role !== "admin") {
      if (!error) await supabase.auth.signOut();
      setError(error ? "Неверный email или пароль" : "У этого аккаунта нет доступа к админке");
      setPending(false);
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  const cls = "w-full rounded-xl border border-line px-4 py-3 text-sm outline-none focus:border-blush-dark";
  return (
    <form onSubmit={submit} className="mt-8 space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs text-muted">Email</label>
        <input id="email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={cls} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs text-muted">Пароль</label>
        <input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={cls} />
      </div>
      {error && <p role="alert" className="text-sm text-rose">{error}</p>}
      <Button type="submit" disabled={pending} className="w-full disabled:opacity-60">
        {pending ? "Входим…" : "Войти"}
      </Button>
    </form>
  );
}
