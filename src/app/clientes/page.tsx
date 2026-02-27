"use client";

import { useEffect, useState } from "react";
import { supabase } from "@core/config/supabase";
import { Sidebar } from "@/components/Sidebar";
import { Users, UserPlus, Search, MoreHorizontal, Mail, Phone } from "lucide-react";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClientes = async () => {
    const { data } = await supabase.from("clientes").select("*").order("nome");
    setClientes(data || []);
    setIsLoading(false);
  };

  useEffect(() => { fetchClientes(); }, []);

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex">
      <Sidebar />
      <main className="flex-1 ml-72 p-10">
        
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Clientes</h2>
            <p className="text-slate-500 font-medium">Base de contatos e histórico</p>
          </div>
          <button className="bg-[#0088CC] text-white px-8 py-4 rounded-[1.5rem] font-bold shadow-lg shadow-blue-100 flex items-center gap-2 hover:bg-[#0077b3] transition-all active:scale-95">
            <UserPlus size={20} /> Adicionar Cliente
          </button>
        </header>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
            <div className="relative w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Pesquisar por nome ou e-mail..." className="w-full pl-12 pr-4 py-3 bg-[#F4F7FE] border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
          </div>

          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-[11px] uppercase font-black tracking-widest">
              <tr>
                <th className="p-6">Nome / Identificação</th>
                <th className="p-6">Contato</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {clientes.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 text-[#0088CC] rounded-full flex items-center justify-center font-bold">
                        {c.nome.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-700">{c.nome}</span>
                    </div>
                  </td>
                  <td className="p-6 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500"><Phone size={12}/> {c.telefone || "Não inf."}</div>
                    <div className="flex items-center gap-2 text-xs text-slate-500"><Mail size={12}/> {c.email || "Não inf."}</div>
                  </td>
                  <td className="p-6">
                    <span className="bg-green-50 text-green-600 text-[10px] font-black px-2 py-1 rounded-md uppercase">Ativo</span>
                  </td>
                  <td className="p-6 text-right">
                    <button className="text-slate-300 hover:text-slate-600 transition-colors"><MoreHorizontal /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}