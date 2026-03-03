// @ts-nocheck
"use client";

import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { 
  ShoppingCart, 
  Package, 
  TrendingDown, 
  AlertTriangle, 
  Printer, 
  Menu,
  TrendingUp,
  Wallet
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

// --- DADOS DOS GRÁFICOS (Isso virá do seu Supabase depois) ---
const dataLucro = [
  { dia: "01/03", lucro: 1200 }, { dia: "05/03", lucro: 1800 },
  { dia: "10/03", lucro: 1400 }, { dia: "15/03", lucro: 2200 },
  { dia: "20/03", lucro: 2800 }, { dia: "25/03", lucro: 2100 },
  { dia: "30/03", lucro: 3100 }
];

const dataReceitas = [
  { name: "Recebido (Caixa)", value: 8500, color: "#10B981" }, // Verde
  { name: "Aberto (Fiados)", value: 1500, color: "#F43F5E" }   // Vermelho
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#F4F7FE] flex">
      <Sidebar />

      {/* Slim Fit aplicado: ml-64 p-8 */}
      <main className="flex-1 ml-64 p-8">
        
        {/* HEADER SUPERIOR INTACTO */}
        <header className="flex justify-between items-center mb-8">
          <Menu className="text-slate-400 cursor-pointer hover:text-[#0088CC] transition-colors" size={24} />
          
          <div className="flex items-center gap-8">
            <Printer className="text-slate-400 cursor-pointer hover:text-[#0088CC] transition-colors" size={20} />
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
          <p className="text-slate-500 font-medium mt-1">Visão geral do seu negócio</p>
        </div>

        {/* SEÇÃO DE ALERTAS INTACTA */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-500" size={22} />
              <h3 className="text-lg font-bold text-slate-800">Alertas Inteligentes</h3>
            </div>
            <span className="bg-[#E53E3E] text-white text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">1 crítico</span>
          </div>

          <div className="bg-[#FFF5F5] border border-[#FED7D7] rounded-2xl p-5 flex items-center justify-between hover:bg-red-50 transition-colors cursor-pointer group">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-red-500 shadow-sm group-hover:scale-105 transition-transform">
                <Package size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-800">Estoque Baixo</p>
                  <span className="bg-[#E53E3E] text-white text-[9px] px-2 py-0.5 rounded font-black uppercase">Crítico</span>
                </div>
                <p className="text-sm text-slate-500 mt-1">2 produto(s) zerado(s) e 2 abaixo do mínimo</p>
              </div>
            </div>
            <span className="text-slate-400 text-xl font-bold group-hover:text-red-500 transition-colors">→</span>
          </div>
        </div>

        {/* GRID DE CARDS COM ANIMATED COUNTER */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Vendas Hoje" value={14} sub="transações" icon={ShoppingCart} color="text-blue-500" />
          <StatCard title="Falta de Estoque" value={4} sub="Requer atenção" icon={Package} color="text-orange-500" border="border-orange-100" />
          <StatCard title="Taxas (30d)" value={125.50} isCurrency sub="custos operadoras" icon={TrendingDown} color="text-orange-400" />
          <StatCard title="Perdas (30d)" value={45.00} isCurrency sub="prejuízo operacional" icon={AlertTriangle} color="text-red-400" />
        </div>

        {/* SEÇÃO FINAL: GRÁFICOS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* GRÁFICO DE LINHAS: EVOLUÇÃO */}
          <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col min-h-[350px]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                  <TrendingUp className="text-[#0088CC]" size={20} /> Evolução de Faturamento
                </h3>
              </div>
              <select className="text-xs font-bold text-slate-400 bg-slate-50 border-none rounded-xl p-3 outline-none">
                <option>Últimos 30 dias</option>
              </select>
            </div>
            
            <div className="flex-1 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataLucro} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(val: any) => [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val), "Faturamento"]}
                  />
                  <Line type="monotone" dataKey="lucro" stroke="#0088CC" strokeWidth={4} dot={{ r: 4, fill: "#0088CC", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GRÁFICO DONUT + LUCRO */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-between min-h-[350px]">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-black text-slate-800 text-lg">Lucro Líquido</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Últimos 30 dias</p>
                </div>
                <div className="text-right">
                   <p className="text-2xl font-black text-[#0088CC]">
                     <AnimatedCounter value={7850} isCurrency />
                   </p>
                   <p className="text-[10px] font-black text-green-500 bg-green-50 px-2 py-1 rounded-md mt-1 inline-block">↗ 12.5% vs ant.</p>
                </div>
              </div>
            </div>

            <div className="flex-1 relative min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dataReceitas} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                    {dataReceitas.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <Wallet size={20} className="text-slate-300 mb-1" />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {dataReceitas.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="font-bold text-slate-600">{item.name}</span>
                  </div>
                  <span className="font-black text-slate-800">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}

function StatCard({ title, value, sub, icon: Icon, color, border = "border-slate-50", isCurrency = false }: any) {
  return (
    <div className={`bg-white p-6 rounded-[2rem] shadow-sm border ${border} h-44 flex flex-col justify-between hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-start">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter w-24 leading-tight">{title}</span>
        <div className={`p-2 rounded-xl bg-slate-50 ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <div>
        <h4 className="text-3xl font-black text-slate-800 tracking-tight">
          <AnimatedCounter value={value} isCurrency={isCurrency} />
        </h4>
        <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">{sub}</p>
      </div>
    </div>
  );
}