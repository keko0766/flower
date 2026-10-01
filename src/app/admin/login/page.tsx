import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Вход" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-[24px] bg-white p-8">
        <p className="font-serif text-4xl">Ақ Гүл</p>
        <p className="mt-1 text-sm text-muted">Панель управления</p>
        <LoginForm />
      </div>
    </div>
  );
}
