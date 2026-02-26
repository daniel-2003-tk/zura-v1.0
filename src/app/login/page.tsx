"use client";

import { useState } from "react";
// Importando o motorista de rotas do Next.js
import { useRouter } from "next/navigation";
import { supabase } from "@core/config/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Criando a variável do motorista
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    setIsLoading(false);

    if (error) {
      alert("❌ Erro ao entrar: E-mail ou senha incorretos.");
      return;
    }

    if (data.user) {
      // TELETRANSPORTE! Se deu certo, joga o usuário para o painel
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Zura ERP</h1>
          <p className="text-gray-500 mt-2">Faça login para acessar o sistema</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        
      </div>
    </div>
  );
}