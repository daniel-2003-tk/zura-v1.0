// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingDown, 
  ArrowRightLeft, 
  Wallet, 
  Calendar,
  DollarSign,
  Percent,
  TrendingUp
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from "recharts";

// --- DADOS REVISADOS ---
const dataCaixa = [
  { dia: "01/03", entradas: 4500, saidas: 2000, saldo: 2500 },
  { dia: "02/03", entradas: 3200, saidas: 1500, saldo: 4200 },
  { dia: "03/03", entradas: 5100, saidas: 3000, saldo: 6300 },
  { dia: "04/03", entradas: 2800, saidas: 1000, saldo: 8100 },
  { dia: "05/03", entradas: 6000, saidas: 4500, saldo: 9600 },
  { dia: "06/03", entradas: 4100, saidas: 1200, saldo: 12500 },
  { dia: "07/03", entradas: 7500, saidas: 2500, saldo: 17500 },
];

const dataDre = [
  { name: "Jan", receita: 45000, despesa: 32000, lucro: 13000 },
  { name: "Fev", receita: 52000, despesa: 34000, lucro: 18000 },
  { name: "Mar", receita: 48000, despesa: 30000, lucro: 18000 },
];

const dataDespesas = [
  { name: "Custo (CMV)", value: 18000, color: "#3B82F6" },
  { name: "Desp. Fixas", value: 6000, color: "#F59E0B" },
  { name: "Folha Pagto", value: 4000, color: "#8B5CF6" },
  { name: "Impostos", value: 2000, color: "#EF4444" },
];

export default function AnalisesPage() {
  const [aba, setAba] = useState("dre");
  const [isClient, setIsClient] = useState(false);

  // Garante que o gráfico só renderiza no navegador para evitar erros de hidratação
  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      <Sidebar />

      <main className="flex-1 ml-64 p-8">
        <PageHeader 
          path={["Gestão", "Análises e DRE"]} 
          title="Inteligência de Negócio" 
          subtitle="Acompanhe o desempenho real da Adega TK"
        />

        {/* NAVEGAÇÃO ENTRE ABAS */}
        <div className="flex gap-4 mb-8 border-b border-slate-100 pb-4">
          <TabBtn active={aba === "caixa"} onClick={() => setAba("caixa")} icon={ArrowRightLeft} label="Fluxo de Caixa" />
          <TabBtn active={aba === "dre"} onClick={() => setAba("dre")} icon={PieChartIcon} label="DRE (Resultados)" />
          <TabBtn active={aba === "perdas"} onClick={() => setAba("perdas")} icon={TrendingDown} label="Perdas" />
        </div>

        {aba === "dre" && isClient && (
          <div className="animate-in fade-in duration-700">
            {/* CARDS DE RESUMO FINANCEIRO */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <KpiCard title="Receita Bruta" value={48000} icon={DollarSign} color="text-slate-800" bg="bg-slate-100" />
              <KpiCard title="Total Despesas" value={30000} icon={TrendingDown} color="text-red-500" bg="bg-red-50" />
              <KpiCard title="Lucro Líquido" value={18000} icon={TrendingUp} color="text-green-500" bg="bg-green-50" />
              <div className="bg-white p-6 rounded-[2rem] border border-slate-50 flex flex-col justify-between h-40 shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Margem Lucro</span>
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-500"><Percent size={18} /></div>
                </div>
                <h4 className="text-2xl font-black text-blue-500">37.5%</h4>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* GRÁFICO TRIMESTRAL - CORREÇÃO DE RENDERIZAÇÃO */}
              <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col">
                <h3 className="font-black text-slate-800 mb-8 flex items-center gap-2">
                  <BarChart3 className="text-blue-500" size={20} /> DRE Trimestral
                </h3>
                <div className="h-[300px] w-full min-h-[300px]">
                  <ResponsiveContainer width="99%" height="100%">
                    <BarChart data={dataDre} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} />
                      <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '30px', fontSize: '12px', fontWeight: 'bold' }} />
                      <Bar dataKey="receita" name="Receita" fill="#10B981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="despesa" name="Despesa" fill="#EF4444" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="lucro" name="Lucro" fill="#0088CC" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* GRÁFICO DE PIZZA - CORREÇÃO DE SOBREPOSIÇÃO */}
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col h-full">
                <h3 className="font-black text-slate-800 mb-2 uppercase text-[10px] tracking-widest text-slate-400">Distribuição de Despesas</h3>
                
                <div className="relative h-[220px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={dataDespesas} innerRadius={65} outerRadius={85} paddingAngle={5} dataKey="value" stroke="none">
                        {dataDespesas.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* TEXTO CENTRALIZADO */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[9px] font-bold text-slate-300 uppercase">Custos Totais</span>
                    <span className="text-sm font-black text-red-500">{formatBRL(30000)}</span>
                  </div>
                </div>

                <div className="mt-auto pt-6 space-y-3 border-t border-slate-50">
                  {dataDespesas.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-[11px]">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="font-bold text-slate-500">{item.name}</span>
                      </div>
                      <span className="font-black text-slate-800">{formatBRL(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {aba === "caixa" && <div className="p-20 text-center text-slate-300 font-bold">Resumo do Caixa Operacional...</div>}
        {aba === "perdas" && <div className="p-20 text-center text-slate-300 font-bold">Relatório de perdas de estoque...</div>}
      </main>
    </div>
  );
}

function TabBtn({ active, onClick, icon: Icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs transition-all ${active ? 'bg-blue-500 text-white shadow-lg shadow-blue-100' : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-50'}`}>
      <Icon size={16} /> {label}
    </button>
  );
}

function KpiCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm flex flex-col justify-between h-40">
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
        <div className={`p-2 rounded-xl ${bg} ${color}`}><Icon size={18} /></div>
      </div>
      <h4 className="text-2xl font-black text-slate-800 tracking-tight">
        <AnimatedCounter value={value} isCurrency />
      </h4>
    </div>
  );
}