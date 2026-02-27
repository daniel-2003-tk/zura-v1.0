"use client";

import { Sidebar } from "@/components/Sidebar";
import { AlertTriangle, Plus, Eye, Trash2 } from "lucide-react";

export default function InventarioPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <Sidebar />
      <main className="flex-1 ml-72 p-10">
        {/* Page Header (reutilize o do Produtos) */}

        {/* O BANNER AMARELO DA FOTO */}
        <div className="bg-[#FFFBEB] border border-[#FEF3C7] p-8 rounded-[2rem] flex items-center justify-between mb-10">
          <div className="flex items-center gap-5">
            <div className="p-3 bg-white rounded-2xl text-[#D97706] shadow-sm">
              <AlertTriangle size={28} />
            </div>
            <div>
              <p className="font-black text-[#92400E] text-lg">Você possui um inventário em andamento</p>
              <p className="text-[#B45309] font-medium">Finalize ou cancele o inventário atual antes de criar um novo.</p>
            </div>
          </div>
          <button className="bg-white text-slate-800 px-8 py-3 rounded-2xl font-black shadow-sm border border-slate-100 hover:bg-slate-50 transition-all">
            Continuar Contagem
          </button>
        </div>

        {/* Métricas e Tabela seguindo o design da Captura 170930 */}
      </main>
    </div>
  );
}