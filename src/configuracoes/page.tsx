"use client";

import { useEffect, useState } from "react";
import { supabase } from "@core/config/supabase";
import { Sidebar } from "@/components/Sidebar";

export default function ConfiguracoesPage() {
  const [userEmail, setUserEmail] = useState<string | null>("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });

  useEffect(() => {
    // Busca os dados do usuário logado
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "E-mail não encontrado");
      }
    };
    fetchUser();
  }, []);

  const handleAtualizarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem({ texto: "", tipo: "" });

    if (novaSenha !== confirmarSenha) {
      setMensagem({ texto: "As senhas não coincidem.", tipo: "erro" });
      return;
    }

    if (novaSenha.length < 6) {
      setMensagem({ texto: "A senha deve ter pelo menos 6 caracteres.", tipo: "erro" });
      return;
    }

    setIsUpdating(true);

    // Comando do Supabase para atualizar a senha do usuário autenticado
    const { error } = await supabase.auth.updateUser({
      password: novaSenha
    });

    setIsUpdating(false);

    if (error) {
      setMensagem({ texto: `Erro ao atualizar senha: ${error.message}`, tipo: "erro" });
    } else {
      setMensagem({ texto: "Senha atualizada com sucesso!", tipo: "sucesso" });
      setNovaSenha("");
      setConfirmarSenha("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 ml-64 p-8 max-w-4xl mx-auto mt-8 relative">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">Configurações da Conta</h2>
          <p className="text-sm text-gray-500">Gerencie seus dados de acesso e segurança.</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-8">
          
          {/* Seção de Perfil */}
          <div className="mb-10 pb-8 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Perfil do Usuário</h3>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">E-mail de Acesso (Não editável)</label>
              <input 
                type="text" 
                disabled 
                value={userEmail || "Carregando..."}
                className="w-full md:w-1/2 px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-2">
                O e-mail é a sua chave única no Zura ERP e não pode ser alterado por aqui.
              </p>
            </div>
          </div>

          {/* Seção de Segurança (Senha) */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Segurança</h3>
            <form onSubmit={handleAtualizarSenha} className="space-y-4 md:w-1/2">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nova Senha</label>
                <input 
                  type="password" required
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Confirmar Nova Senha</label>
                <input 
                  type="password" required
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Digite a senha novamente"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {mensagem.texto && (
                <div className={`p-3 rounded-lg text-sm font-medium ${mensagem.tipo === 'erro' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {mensagem.texto}
                </div>
              )}

              <div className="pt-4">
                <button 
                  type="submit" disabled={isUpdating}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {isUpdating ? "Atualizando..." : "Atualizar Senha"}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}