"use client";

import { Sidebar } from "@/components/Sidebar";
import { 
  ShoppingCart, 
  Package, 
  TrendingDown, 
  AlertTriangle, 
  Printer, 
  Menu 
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#F4F7FE] flex">
      <Sidebar />

      <main className="flex-1 ml-72 p-10">
        
        {/* HEADER SUPERIOR */}
        <header className="flex justify-between items-center mb-10">
          <Menu className="text-slate-400 cursor-pointer" size={24} />
          
          <div className="flex items-center gap-8">
            <Printer className="text-slate-400 cursor-pointer" size={20} />
            <div className="flex items-center gap-4 text-right">
              <div>
                <p className="text-sm font-bold text-slate-800">Adega TK</p>
                <p className="text-xs text-slate-400">tikinho2mil0@gmail.com</p>
              </div>
              <div className="w-12 h-12 bg-[#0088CC] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-200">
                TI
              </div>
            </div>
          </div>
        </header>

        <div className="mb-8">
          <h2 className="text-3xl font-black text-slate-800">Dashboard</h2>
          <p className="text-slate-500 font-medium">Visão geral do seu negócio</p>
        </div>

        {/* SEÇÃO DE ALERTAS */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-500" size={24} />
              <h3 className="text-lg font-bold text-slate-800">Alertas Inteligentes</h3>
            </div>
            <span className="bg-[#E53E3E] text-white text-[11px] font-black px-4 py-1.5 rounded-full uppercase">1 crítico</span>
          </div>

          <div className="bg-[#FFF5F5] border border-[#FED7D7] rounded-3xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-sm">
                <Package size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-800">Estoque Baixo</p>
                  <span className="bg-[#E53E3E] text-white text-[9px] px-2 py-0.5 rounded font-black uppercase">Crítico</span>
                </div>
                <p className="text-sm text-slate-500 mt-0.5">2 produto(s) zerado(s) e 2 abaixo do mínimo</p>
              </div>
            </div>
            <span className="text-slate-400 text-xl font-bold cursor-pointer">→</span>
          </div>
        </div>

        {/* GRID DE CARDS (4 COLUNAS) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard title="Vendas Hoje" value="0" sub="transações" icon={ShoppingCart} color="text-blue-500" />
          <StatCard title="Produtos em Falta" value="4" sub="Requer atenção" icon={Package} color="text-orange-500" border="border-orange-100" />
          <StatCard title="Taxas (30d)" value="R$ 0.00" sub="custos operadoras" icon={TrendingDown} color="text-orange-400" />
          <StatCard title="Perdas (30d)" value="R$ 0.00" sub="prejuízo operacional" icon={AlertTriangle} color="text-red-400" />
        </div>

        {/* SEÇÃO FINAL */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-[2.5rem] p-8 h-64 border border-slate-100 shadow-sm flex items-center">
            <h3 className="font-bold text-slate-400">Faturamento</h3>
          </div>
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between">
              <h3 className="font-bold text-slate-800">Lucro</h3>
              <div className="text-right">
                 <p className="text-3xl font-black text-[#0088CC]">R$ 0.00</p>
                 <p className="text-xs font-bold text-red-500">↘ 100.0% <span className="text-slate-300 font-normal ml-1">vs 30 dias ant.</span></p>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-4">Últimos 30 dias</p>
          </div>
        </div>

      </main>
    </div>
  );
}

function StatCard({ title, value, sub, icon: Icon, color, border = "border-slate-50" }: any) {
  return (
    <div className={`bg-white p-8 rounded-[2.5rem] shadow-sm border ${border} h-48 flex flex-col justify-between`}>
      <div className="flex justify-between items-start">
        <span className="text-sm font-bold text-slate-600">{title}</span>
        <Icon className={color} size={22} />
      </div>
      <div>
        <h4 className="text-4xl font-black text-slate-800 tracking-tight">{value}</h4>
        <p className="text-xs text-slate-400 mt-1 font-medium">{sub}</p>
      </div>
    </div>
  );
}