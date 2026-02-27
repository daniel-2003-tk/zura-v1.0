"use client";

import { Sidebar } from "@/components/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { RotateCcw, Package, ArrowRight, Save, History } from "lucide-react";

export default function CascosPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <Sidebar />
      <main className="flex-1 ml-72 p-10">
        <PageHeader 
          path={["Estoque", "Cascos"]} 
          title="Gestão de Cascos" 
          subtitle="Controle de cascos retornáveis e devoluções" 
        />

        {/* METRICAS DE CASCOS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard label="Total de Cascos" value="50" sub="Em estoque físico" icon={Package} color="text-slate-800" />
          <StatCard label="Vendas c/ Casco" value="0" sub="Saídas registradas" icon={RotateCcw} color="text-red-500" />
          <StatCard label="Devoluções" value="0" sub="Retornos ao estoque" icon={RotateCcw} color="text-green-500" />
          <StatCard label="Vendas s/ Casco" value="0" sub="Troca direta" icon={ArrowRight} color="text-blue-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* COLUNA ESQUERDA: FORMULÁRIO */}
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="font-black text-2xl text-slate-800 mb-8 flex items-center gap-3">
              <RotateCcw size={24} className="text-[#0088CC]" /> Registrar Movimentação
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Tipo de Operação</label>
                <select className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 outline-none">
                  <option>Devolução de Cliente</option>
                  <option>Ajuste de Inventário</option>
                  <option>Quebra de Vasilhame</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Produto (Casco)</label>
                <select className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 outline-none">
                  <option>Selecione o produto...</option>
                  <option>Cerveja 600ml (Vasilhame)</option>
                  <option>Litro Retornável</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Quantidade</label>
                <input type="number" defaultValue={1} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none font-black text-lg text-slate-700" />
              </div>

              <button className="w-full py-5 bg-[#0088CC] text-white rounded-[1.5rem] font-black shadow-lg shadow-blue-50 hover:bg-[#0077b3] transition-all flex items-center justify-center gap-2 mt-4">
                <Save size={20} /> CONFIRMAR REGISTRO
              </button>
            </div>
          </div>

          {/* COLUNA DIREITA: TABELA DE STOCK */}
          <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <div className="flex justify-between items-center mb-10">
                <h3 className="font-black text-2xl text-slate-800 flex items-center gap-3">
                  <Package size={24} className="text-slate-400" /> Estoque por Item
                </h3>
                <button className="text-xs font-black text-[#0088CC] uppercase tracking-widest flex items-center gap-2">
                  <History size={14}/> Ver Histórico
                </button>
             </div>

             <table className="w-full text-left">
               <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                 <tr>
                   <th className="pb-6">Vasilhame / Produto</th>
                   <th className="pb-6 text-center">Quantidade</th>
                   <th className="pb-6">Valor/Un</th>
                   <th className="pb-6 text-right">Valor Total</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 <tr className="group">
                   <td className="py-6 font-bold text-slate-700">Cerveja 600ml Retornável</td>
                   <td className="py-6 text-center">
                      <span className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-black">50</span>
                   </td>
                   <td className="py-6 font-bold text-slate-400">R$ 5,00</td>
                   <td className="py-6 text-right font-black text-slate-800 text-lg">R$ 250,00</td>
                 </tr>
               </tbody>
             </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-48 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Icon size={14} /> {label}
        </span>
      </div>
      <div>
        <h4 className={`text-4xl font-black ${color} tracking-tighter`}>{value}</h4>
        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{sub}</p>
      </div>
    </div>
  );
}