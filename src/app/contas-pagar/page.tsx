"use client";

import { useEffect, useState } from "react";
import { supabase } from "@core/config/supabase";
import { Sidebar } from "@/components/Sidebar";
import { Wallet, Plus, Calendar, AlertCircle } from "lucide-react";

export default function ContasPagarPage() {
  const [contas, setContas] = useState<any[]>([]);
  const [totalPagar, setTotalPagar] = useState(0);

  const fetchContas = async () => {
    const { data } = await supabase.from("contas_pagar").select("*").order("vencimento", { ascending: true });
    if (data) {
      setContas(data);
      const total = data.filter(c => c.status === "PENDENTE").reduce((acc, curr) => acc + curr.valor, 0);
      setTotalPagar(total);
    }
  };

  useEffect(() => { fetchContas(); }, []);

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex">
      <Sidebar />
      <main className="flex-1 ml-72 p-10">
        
        <header className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Contas a Pagar</h2>
            <p className="text-slate-500 font-medium">Gestão de fornecedores e custos fixos</p>
          </div>
          <div className="bg-white px-10 py-6 rounded-[2rem] border border-slate-100 shadow-sm text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total em Aberto</p>
            <h3 className="text-3xl font-black text-red-500">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPagar)}</h3>
          </div>
        </header>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-end">
            <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all">
              <Plus size={20} /> Nova Conta
            </button>
          </div>

          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-[11px] uppercase font-black tracking-widest">
              <tr>
                <th className="p-6">Vencimento</th>
                <th className="p-6">Descrição</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {contas.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                      <Calendar size={16} className="text-slate-400" />
                      {new Date(c.vencimento + 'T00:00:00').toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-6 text-sm font-black text-slate-800">{c.descricao}</td>
                  <td className="p-6">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${c.status === 'PAGO' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-6 text-right font-black text-slate-700">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.valor)}
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