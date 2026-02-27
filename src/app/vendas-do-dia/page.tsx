"use client";

import { useEffect, useState } from "react";
import { supabase } from "@core/config/supabase";
import { Sidebar } from "@/components/Sidebar";
import { 
  ShoppingBag, 
  Banknote, 
  CreditCard, 
  QrCode, 
  Search, 
  ArrowRight,
  Clock
} from "lucide-react";

export default function VendasDoDiaPage() {
  const [vendas, setVendas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resumo, setResumo] = useState({ pix: 0, dinheiro: 0, cartao: 0, total: 0 });

  const fetchVendasHoje = async () => {
    setIsLoading(true);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Início do dia
    
    const { data } = await supabase
      .from("vendas")
      .select(`*, clientes(nome), produtos(nome)`)
      .gte("created_at", hoje.toISOString())
      .order("created_at", { ascending: false });

    if (data) {
      setVendas(data);
      const r = data.reduce((acc, v) => {
        const met = v.metodo_pagamento.toUpperCase();
        if (met.includes("PIX")) acc.pix += v.valor_total;
        if (met.includes("DINHEIRO")) acc.dinheiro += v.valor_total;
        if (met.includes("CARTÃO") || met.includes("CARTAO")) acc.cartao += v.valor_total;
        acc.total += v.valor_total;
        return acc;
      }, { pix: 0, dinheiro: 0, cartao: 0, total: 0 });
      setResumo(r);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchVendasHoje(); }, []);

  const format = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex">
      <Sidebar />
      
      <main className="flex-1 ml-72 p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Vendas do Dia</h2>
            <p className="text-slate-500 font-medium">Movimentação em tempo real (Hoje)</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
             <div className="bg-blue-50 text-[#0088CC] p-2 rounded-xl">
               <Clock size={20} />
             </div>
             <span className="text-sm font-bold text-slate-600 pr-4">
               {new Date().toLocaleDateString('pt-BR')}
             </span>
          </div>
        </header>

        {/* CARDS DE RESUMO DO DIA */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <ResumoCard label="Dinheiro" value={format(resumo.dinheiro)} icon={Banknote} color="text-green-500" bgColor="bg-green-50" />
          <ResumoCard label="PIX" value={format(resumo.pix)} icon={QrCode} color="text-[#0088CC]" bgColor="bg-blue-50" />
          <ResumoCard label="Cartão" value={format(resumo.cartao)} icon={CreditCard} color="text-purple-500" bgColor="bg-purple-50" />
          <ResumoCard label="Total Hoje" value={format(resumo.total)} icon={ShoppingBag} color="text-slate-800" bgColor="bg-slate-100" highlight />
        </div>

        {/* LISTAGEM DETALHADA */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Linha do Tempo</h3>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Filtrar venda..." className="pl-12 pr-4 py-3 bg-[#F4F7FE] border-none rounded-2xl text-sm outline-none w-64" />
            </div>
          </div>

          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="p-6">Horário</th>
                <th className="p-6">Cliente</th>
                <th className="p-6">Produto</th>
                <th className="p-6">Método</th>
                <th className="p-6 text-right">Valor</th>
                <th className="p-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={6} className="p-20 text-center text-slate-400 font-bold">Buscando vendas de hoje...</td></tr>
              ) : vendas.length === 0 ? (
                <tr><td colSpan={6} className="p-20 text-center text-slate-400 font-bold">Nenhuma venda realizada hoje até o momento.</td></tr>
              ) : (
                vendas.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-6 text-sm font-bold text-slate-400">
                      {new Date(v.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-6">
                      <p className="font-bold text-slate-700">{v.clientes?.nome}</p>
                    </td>
                    <td className="p-6 text-sm text-slate-500">
                      {v.produtos?.nome} ({v.quantidade}x)
                    </td>
                    <td className="p-6">
                      <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-md uppercase tracking-tighter">
                        {v.metodo_pagamento}
                      </span>
                    </td>
                    <td className="p-6 text-right font-black text-[#0088CC]">
                      {format(v.valor_total)}
                    </td>
                    <td className="p-6 text-right">
                      <button className="p-2 text-slate-300 hover:text-[#0088CC] transition-all">
                        <ArrowRight size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function ResumoCard({ label, value, icon: Icon, color, bgColor, highlight = false }: any) {
  return (
    <div className={`p-8 rounded-[2rem] shadow-sm border border-slate-50 transition-all hover:shadow-md ${highlight ? 'bg-white ring-2 ring-blue-100' : 'bg-white'}`}>
      <div className="flex justify-between items-start mb-6">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <div className={`p-2 rounded-xl ${bgColor} ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <h4 className={`text-2xl font-black tracking-tight ${highlight ? 'text-[#0088CC]' : 'text-slate-800'}`}>{value}</h4>
    </div>
  );
}