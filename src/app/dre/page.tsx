"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { BarChart3, TrendingUp, TrendingDown, Info } from "lucide-react";

export default function DREPage() {
  return (
    <div className="min-h-screen bg-[#F4F7FE] flex">
      <Sidebar />
      <main className="flex-1 ml-72 p-10">
        
        <header className="mb-10">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">DRE Gerencial</h2>
          <p className="text-slate-500 font-medium">Demonstrativo de Resultado do Exercício</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="bg-[#0088CC] p-8 rounded-[2.5rem] text-white shadow-lg shadow-blue-100">
            <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-2">Receita Bruta</p>
            <h4 className="text-4xl font-black">R$ 0,00</h4>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-200">
              <TrendingUp size={14}/> +0% este mês
            </div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Despesas</p>
            <h4 className="text-4xl font-black text-red-500">R$ 0,00</h4>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-400">
              <TrendingDown size={14}/> Custos operacionais
            </div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lucro Líquido</p>
            <h4 className="text-4xl font-black text-[#0088CC]">R$ 0,00</h4>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-green-500">
               Margem de 0%
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10">
          <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
            <Info size={20} className="text-blue-500" /> Detalhamento de Operações
          </h3>
          <div className="space-y-6">
            <DRERow label="Receita de Vendas" value="R$ 0,00" color="text-green-600" />
            <DRERow label="(-) Contas de Fornecedores" value="R$ 0,00" color="text-red-500" />
            <DRERow label="(-) Custos de Pessoal" value="R$ 0,00" color="text-red-500" />
            <DRERow label="(-) Perdas e Quebras" value="R$ 0,00" color="text-red-500" />
            <div className="pt-6 border-t border-slate-100">
              <DRERow label="RESULTADO LÍQUIDO" value="R$ 0,00" color="text-[#0088CC]" bold />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function DRERow({ label, value, color, bold = false }: any) {
  return (
    <div className="flex justify-between items-center">
      <span className={`text-sm ${bold ? 'font-black text-slate-800' : 'font-bold text-slate-500'}`}>{label}</span>
      <span className={`text-lg font-black ${color}`}>{value}</span>
    </div>
  );
}