"use client";

import { useEffect, useState } from "react";
import { supabase } from "@core/config/supabase";
import { Sidebar } from "@/components/Sidebar";
import { FileText, Plus, Search, CheckCircle2, History } from "lucide-react";

export default function FiadosPage() {
  const [fiados, setFiados] = useState<any[]>([]);
  const [totalPendente, setTotalPendente] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    const { data } = await supabase.from("fiados").select(`*, clientes(nome)`).order("id", { ascending: false });
    if (data) {
      setFiados(data);
      const total = data.filter(f => f.status === "PENDENTE").reduce((acc, curr) => acc + curr.valor, 0);
      setTotalPendente(total);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const formatMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex">
      <Sidebar />
      <main className="flex-1 ml-72 p-10">
        
        <header className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Fiados</h2>
            <p className="text-slate-500 font-medium">Controle de caderneta e contas a receber</p>
          </div>
          <div className="bg-white px-10 py-6 rounded-[2rem] border border-slate-100 shadow-sm text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total a Receber</p>
            <h3 className="text-3xl font-black text-orange-500">{formatMoeda(totalPendente)}</h3>
          </div>
        </header>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
            <div className="relative w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Buscar cliente na caderneta..." className="w-full pl-12 pr-4 py-3 bg-[#F4F7FE] border-none rounded-2xl text-sm outline-none" />
            </div>
            <button className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-orange-600 transition-all">
              <Plus size={20} /> Novo Fiado
            </button>
          </div>

          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-[11px] uppercase font-black tracking-widest">
              <tr>
                <th className="p-6">Cliente</th>
                <th className="p-6">Descrição</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Valor</th>
                <th className="p-6 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {fiados.map(f => (
                <tr key={f.id} className={`hover:bg-slate-50/50 transition-colors ${f.status === 'PAGO' ? 'opacity-50' : ''}`}>
                  <td className="p-6 font-bold text-slate-700">{f.clientes?.nome}</td>
                  <td className="p-6 text-sm text-slate-500">{f.descricao}</td>
                  <td className="p-6">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${f.status === 'PAGO' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="p-6 text-right font-black text-slate-700">{formatMoeda(f.valor)}</td>
                  <td className="p-6 text-center">
                    {f.status === 'PENDENTE' && (
                      <button className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all">
                        <CheckCircle2 size={20} />
                      </button>
                    )}
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