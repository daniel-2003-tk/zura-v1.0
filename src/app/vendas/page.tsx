"use client";

import { Sidebar } from "@/components/Sidebar";
import { 
  ShoppingCart, 
  Package, 
  ArrowDownRight, 
  AlertTriangle, 
  Printer, 
  Menu,
  TrendingUp
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <Sidebar />

      <main className="flex-1 ml-64 p-10">
        
        {/* TOPBAR - Identica ao Protótipo */}
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="p-2 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors">
              <Menu size={20} className="text-slate-500" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Dashboard</h2>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Visão Geral do Negócio</p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <Printer className="text-slate-300 cursor-pointer hover:text-slate-600 transition-colors" size={20} />
            
            <div className="flex items-center gap-4 border-l border-slate-200 pl-8">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-700 leading-tight">Adega TK</p>
                <p className="text-[11px] text-slate-400 font-medium">tininho2mil0@gmail.com</p>
              </div>
              <div className="w-10 h-10 bg-[#0088CC] rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200">
                TI
              </div>
            </div>
          </div>
        </header>

        {/* SEÇÃO DE ALERTAS - Com o badge vermelho */}
        <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-50 rounded-xl">
                <AlertTriangle className="text-red-500" size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Alertas Inteligentes</h3>
            </div>
            <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              1 Crítico
            </span>
          </div>
          
          <div className="group bg-red-50/40 border border-red-100 rounded-[1.5rem] p-5 flex items-center justify-between hover:bg-red-50 transition-all cursor-pointer">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                <Package size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Estoque Crítico detectado</p>
                <p className="text-xs text-slate-500">Existem <span className="text-red-600 font-bold">4 produtos</span> que precisam de reposição imediata.</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm group-hover:text-red-500">
              →
            </div>
          </div>
        </section>

        {/* GRID DE CARDS - Spacing ajustado */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Vendas Hoje" value="0" sub="transações realizadas" icon={ShoppingCart} color="bg-blue-50 text-blue-500" />
          <StatCard title="Produtos em Falta" value="4" sub="requer atenção" icon={Package} color="bg-orange-50 text-orange-500" border="border-orange-100" />
          <StatCard title="Taxas (30d)" value="R$ 0,00" sub="custos operadoras" icon={ArrowDownRight} color="bg-slate-50 text-slate-400" />
          <StatCard title="Perdas (30d)" value="R$ 0,00" sub="prejuízo operacional" icon={AlertTriangle} color="bg-red-50 text-red-400" />
        </div>

        {/* GRÁFICOS / RESUMO INFERIOR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 min-h-[300px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-500" /> Faturamento Mensal
              </h3>
              <select className="text-xs font-bold text-slate-400 bg-slate-50 border-none rounded-lg p-2 outline-none">
                <option>Últimos 30 dias</option>
              </select>
            </div>
            <div className="h-full flex items-center justify-center text-slate-300 text-sm italic">
              Gráfico de desempenho será renderizado aqui...
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-800 mb-1">Lucro Líquido</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Últimos 30 dias</p>
            </div>
            
            <div className="py-6">
              <h4 className="text-4xl font-black text-blue-600 leading-none">R$ 0,00</h4>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-lg">↘ 100.0%</span>
                <span className="text-[10px] text-slate-400">vs 30 dias ant.</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50">
              <button className="w-full py-3 bg-slate-50 text-slate-600 text-xs font-bold rounded-2xl hover:bg-slate-100 transition-colors">
                Ver Relatório Detalhado
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

function StatCard({ title, value, sub, icon: Icon, color, border = "border-slate-100" }: any) {
  return (
    <div className={`bg-white p-7 rounded-[2rem] shadow-sm border ${border} flex flex-col justify-between h-44 hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
        <div className={`p-2 rounded-xl ${color}`}>
          <Icon size={18} />
        </div>
      </div>
      <div>
        <h4 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h4>
        <p className="text-[10px] font-medium text-slate-400 mt-1">{sub}</p>
      </div>
    </div>
  );
}