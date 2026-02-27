"use client";

import { useEffect, useState } from "react";
import { supabase } from "@core/config/supabase";
import { Sidebar } from "@/components/Sidebar";
import { CircleDollarSign, ArrowUpCircle, ArrowDownCircle, Search } from "lucide-react";

export default function CaixaPage() {
  const [movimentos, setMovimentos] = useState<any[]>([]);
  const [saldo, setSaldo] = useState(0);

  const fetchCaixa = async () => {
    const { data } = await supabase.from("caixa").select("*").order("id", { ascending: false });
    if (data) {
      setMovimentos(data);
      const s = data.reduce((acc, curr) => curr.tipo === "ENTRADA" ? acc + curr.valor : acc - curr.valor, 0);
      setSaldo(s);
    }
  };

  useEffect(() => { fetchCaixa(); }, []);

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex">
      <Sidebar />
      <main className="flex-1 ml-72 p-10">
        
        <header className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Fluxo de Caixa</h2>
            <p className="text-slate-500 font-medium">Controle de entradas e saídas diárias</p>
          </div>
          <div className="bg-white px-10 py-6 rounded-[2rem] border border-slate-100 shadow-sm text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Saldo em Gaveta</p>
            <h3 className={`text-3xl font-black ${saldo >= 0 ? 'text-[#0088CC]' : 'text-red-500'}`}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldo)}
            </h3>
          </div>
        </header>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-[11px] uppercase font-black tracking-widest">
              <tr>
                <th className="p-6">Tipo</th>
                <th className="p-6">Descrição / Motivo</th>
                <th className="p-6">Data</th>
                <th className="p-6 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {movimentos.map(m => (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-6">
                    {m.tipo === "ENTRADA" 
                      ? <div className="flex items-center gap-2 text-green-600 font-bold text-sm"><ArrowUpCircle size={18}/> Entrada</div>
                      : <div className="flex items-center gap-2 text-red-500 font-bold text-sm"><ArrowDownCircle size={18}/> Saída</div>
                    }
                  </td>
                  <td className="p-6 text-sm font-bold text-slate-700">{m.descricao}</td>
                  <td className="p-6 text-sm text-slate-400">{new Date(m.created_at).toLocaleString()}</td>
                  <td className={`p-6 text-right font-black ${m.tipo === "ENTRADA" ? "text-green-600" : "text-red-500"}`}>
                    {m.tipo === "ENTRADA" ? "+" : "-"} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(m.valor)}
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