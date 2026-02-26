"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Esse comando força o navegador a ir para a tela de login imediatamente
    router.push("/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 animate-pulse text-lg">Iniciando Zura ERP...</p>
      </div>
    </div>
  );
}