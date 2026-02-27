"use client";

import { useEffect, useState } from "react";
import { supabase } from "@core/config/supabase";
import { Sidebar } from "@/components/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { Plus, Search, Package, Edit2, Trash2 } from "lucide-react";

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("produtos").select("*").order("nome");
      if (data) setProdutos(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const formatBRL = (v: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v) || 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <PageHeader 
          path={["Estoque", "Produtos"]} 
          title="Estoque" 
          subtitle="Controle de itens"
          button={
            <button className="bg-[#0088CC] text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 text-sm">
              <Plus size={18} /> Novo Produto
            </button>
          }
        />

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar produto..." 
            className="w-full pl-11 py-3 bg-white border border-slate-200 rounded-xl outline-none text-sm"
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-slate-400 py-10">Carregando estoque...</p>
          ) : produtos.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase())).map((p) => {
            // CORREÇÃO DO NaN: Garantindo que valores nulos virem 0 antes do cálculo
            const f = Number(p.fardos) || 0;
            const upf = Number(p.un_por_fardo) || 0;
            const s = Number(p.unidades_soltas) || 0;
            const total = (f * upf) + s;

            return (
              <div key={p.id} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                      <Package size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 capitalize leading-none">{p.nome}</h3>
                      <p className="text-sm text-slate-400 font-bold mt-1">{p.marca || "Ambev"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-red-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase">Long Neck</span>
                    <Edit2 size={16} className="text-slate-300 cursor-pointer hover:text-blue-500" />
                  </div>
                </div>

                {/* LAYOUT JUSTIFICADO: Evita encavalar as palavras */}
                <div className="space-y-2 max-w-md">
                  <InfoLine label="Fardos Fechados:" value={`${f} (${upf} un/fardo)`} />
                  <InfoLine label="Unidades Soltas:" value={s} />
                  <InfoLine label="Total Unidades:" value={total} highlight />
                  <InfoLine label="Preço Fardo:" value={formatBRL(p.preco_fardo)} />
                  <InfoLine label="Preço Unitário:" value={formatBRL(p.preco_un)} />
                  <InfoLine label="Custo:" value={formatBRL(p.custo)} />
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function InfoLine({ label, value, highlight = false }: any) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-400 font-bold">{label}</span>
      <span className={`font-black ${highlight ? 'text-[#0088CC]' : 'text-slate-800'}`}>
        {value}
      </span>
    </div>
  );
}