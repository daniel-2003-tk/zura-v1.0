"use client";

import { useEffect, useState } from "react";
import { supabase } from "@core/config/supabase";
import { Sidebar } from "@/components/Sidebar";
import { 
  Percent, 
  Save, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Info,
  ShieldCheck
} from "lucide-react";

export default function TaxasPage() {
  const [taxas, setTaxas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchTaxas = async () => {
    setIsLoading(true);
    const { data } = await supabase.from("taxas_pagamento").select("*");
    if (data) setTaxas(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchTaxas(); }, []);

  const handleTaxaChange = (id: number, novoValor: string) => {
    setTaxas(prev => prev.map(t => 
      t.id === id ? { ...t, taxa_percentual: parseFloat(novoValor) || 0 } : t
    ));
  };

  const handleSalvarTaxas = async () => {
    setIsSaving(true);
    
    // Faz o update de cada taxa individualmente
    const promises = taxas.map(t => 
      supabase.from("taxas_pagamento").update({ taxa_percentual: t.taxa_percentual }).eq("id", t.id)
    );

    await Promise.all(promises);
    
    setIsSaving(false);
    alert("Taxas atualizadas com sucesso! O sistema aplicará estes descontos nos próximos cálculos de lucro.");
  };

  const getIcon = (metodo: string) => {
    const m = metodo.toUpperCase();
    if (m.includes("PIX")) return <QrCode size={24} />;
    if (m.includes("CARTAO") || m.includes("CARTÃO") || m.includes("CREDITO") || m.includes("DEBITO")) return <CreditCard size={24} />;
    return <Banknote size={24} />;
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex">
      <Sidebar />
      
      <main className="flex-1 ml-72 p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Taxas de Pagamento</h2>
            <p className="text-slate-500 font-medium">Configure os descontos das operadoras de cartão e bancos</p>
          </div>
          <button 
            onClick={handleSalvarTaxas}
            disabled={isSaving}
            className="bg-[#0088CC] text-white px-8 py-4 rounded-[1.5rem] font-black shadow-lg shadow-blue-100 flex items-center gap-3 hover:bg-[#0077b3] transition-all disabled:opacity-50"
          >
            <Save size={20} />
            {isSaving ? "A GUARDAR..." : "SALVAR ALTERAÇÕES"}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Lado Esquerdo: Lista de Taxas */}
          <div className="lg:col-span-2 space-y-4">
            {isLoading ? (
              <div className="p-20 text-center font-bold text-slate-300">A carregar configurações...</div>
            ) : taxas.map(t => (
              <div key={t.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-50 flex items-center justify-between group hover:border-blue-100 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-[#0088CC] transition-colors">
                    {getIcon(t.metodo)}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg">{t.metodo}</h4>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Taxa administrativa</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.01"
                      className="w-32 p-4 bg-[#F4F7FE] border-none rounded-2xl text-right font-black text-[#0088CC] outline-none focus:ring-2 focus:ring-[#0088CC]/20"
                      value={t.taxa_percentual}
                      onChange={(e) => handleTaxaChange(t.id, e.target.value)}
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Lado Direito: Info Card */}
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                  <Info size={20} />
                </div>
                <h3 className="font-bold text-lg">Por que configurar?</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                As taxas configuradas aqui serão subtraídas automaticamente do seu **Faturamento Bruto** para gerar o **Lucro Líquido** no Dashboard e no DRE.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-xs text-slate-300">
                  <ShieldCheck size={16} className="text-green-500 shrink-0" />
                  PIX geralmente tem taxa 0% ou fixa.
                </li>
                <li className="flex items-start gap-3 text-xs text-slate-300">
                  <ShieldCheck size={16} className="text-green-500 shrink-0" />
                  Cartão de Crédito varia entre 2% a 5%.
                </li>
                <li className="flex items-start gap-3 text-xs text-slate-300">
                  <ShieldCheck size={16} className="text-green-500 shrink-0" />
                  Mantenha as taxas atualizadas conforme o seu contrato com a maquininha.
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
               <div className="flex items-center gap-3 text-orange-500 mb-2">
                 <Percent size={20} />
                 <h4 className="font-black uppercase text-[10px] tracking-widest">Atenção</h4>
               </div>
               <p className="text-xs text-slate-500 font-medium">
                 Alterar as taxas não altera o passado. Apenas as vendas feitas **após** a alteração usarão a nova percentagem para o cálculo de impostos/taxas.
               </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}