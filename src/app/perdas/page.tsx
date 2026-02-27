"use client";

import { Sidebar } from "@/components/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { AlertCircle, TrendingDown, Package, DollarSign, Filter, Plus } from "lucide-react";

export default function PerdasPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <Sidebar />
      <main className="flex-1 ml-72 p-10">
        <PageHeader 
          path={["Estoque", "Perdas"]} 
          title="Perdas / Prejuízos" 
          subtitle="Registre e acompanhe perdas de estoque para controle financeiro"
          button={
            <div className="flex gap-3">
              <button className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all">
                <TrendingDown size={20} /> Ver Gráficos
              </button>
              <button className="bg-[#0088CC] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100">
                <Plus size={20} /> Registrar Perda
              </button>
            </div>
          }
        />

        <div className="grid grid-cols-4 gap-6 mb-10">
          <MetricCard label="Total de Perdas" value="R$ 0.00" icon={DollarSign} color="text-red-500" bgColor="bg-red-50" />
          <MetricCard label="Itens Perdidos" value="0" icon={Package} color="text-orange-500" bgColor="bg-orange-50" />
          <MetricCard label="Tendência (7d)" value="0.0%" sub="Estável" icon={TrendingDown} color="text-green-500" bgColor="bg-green-50" />
          <MetricCard label="Principal Causa" value="-" icon={AlertCircle} color="text-orange-400" bgColor="bg-orange-50" />
        </div>

        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-8 text-slate-800 font-bold">
            <Filter size={18} /> Filtros
          </div>
          <div className="grid grid-cols-2 gap-8 mb-10">
            <FilterGroup label="Período" options={["Últimos 30 dias", "Hoje", "Semana"]} />
            <FilterGroup label="Motivo" options={["Todos", "Vencimento", "Quebra", "Furto"]} />
          </div>
          <div className="border-t border-slate-50 pt-8">
             <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">📄 Histórico de Perdas</h3>
             <p className="text-sm text-slate-400">0 registro(s) ativo(s) no período selecionado</p>
          </div>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ label, value, sub, icon: Icon, color, bgColor }: any) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between h-48">
      <div className="flex justify-between items-start">
        <span className="text-sm font-bold text-slate-600 w-24 leading-tight">{label}</span>
        <div className={`p-3 rounded-2xl ${bgColor} ${color}`}><Icon size={24} /></div>
      </div>
      <div>
        <h4 className={`text-3xl font-black ${color}`}>{value}</h4>
        {sub && <p className="text-xs text-slate-400 font-bold mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function FilterGroup({ label, options }: any) {
  return (
    <div>
      <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">{label}</label>
      <select className="w-full p-3 bg-slate-50 border-none rounded-xl font-bold text-slate-700 outline-none">
        {options.map((o: any) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}