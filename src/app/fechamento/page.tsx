"use client";

import { useEffect, useState } from "react";
import { supabase } from "@core/config/supabase";
import { Sidebar } from "@/components/Sidebar";
import { 
  Lock, 
  Unlock, 
  Calculator, 
  Banknote, 
  AlertCircle, 
  CheckCircle2,
  TrendingUp
} from "lucide-react";

export default function FechamentoPage() {
  const [turnoAtivo, setTurnoAtivo] = useState<any>(null);
  const [vendasTurno, setVendasTurno] = useState({ total: 0, dinheiro: 0, pix: 0, cartao: 0 });
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para formulários
  const [valorInicial, setValorInicial] = useState("");
  const [valorFisico, setValorFisico] = useState("");

  const fetchTurno = async () => {
    setIsLoading(true);
    // 1. Procurar turno aberto
    const { data: turno } = await supabase
      .from("caixa_turnos")
      .select("*")
      .eq("status", "ABERTO")
      .single();

    if (turno) {
      setTurnoAtivo(turno);
      // 2. Calcular vendas desde que o turno abriu
      const { data: vendas } = await supabase
        .from("vendas")
        .select("valor_total, metodo_pagamento")
        .gte("created_at", turno.aberto_em);

      if (vendas) {
        const resumo = vendas.reduce((acc, v) => {
          const met = v.metodo_pagamento.toUpperCase();
          if (met.includes("DINHEIRO")) acc.dinheiro += v.valor_total;
          if (met.includes("PIX")) acc.pix += v.valor_total;
          if (met.includes("CARTAO") || met.includes("CARTÃO")) acc.cartao += v.valor_total;
          acc.total += v.valor_total;
          return acc;
        }, { total: 0, dinheiro: 0, pix: 0, cartao: 0 });
        setVendasTurno(resumo);
      }
    } else {
      setTurnoAtivo(null);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchTurno(); }, []);

  const handleAbrirCaixa = async () => {
    if (!valorInicial) return alert("Insira o valor do troco inicial!");
    
    const { error } = await supabase.from("caixa_turnos").insert([
      { valor_inicial: parseFloat(valorInicial), status: "ABERTO" }
    ]);

    if (!error) {
      alert("Caixa aberto com sucesso! Boas vendas.");
      setValorInicial("");
      fetchTurno();
    }
  };

  const handleFecharCaixa = async () => {
    if (!valorFisico) return alert("Insira quanto dinheiro tem na gaveta para conferência.");

    const valorEsperado = turnoAtivo.valor_inicial + vendasTurno.dinheiro;
    const quebra = parseFloat(valorFisico) - valorEsperado;

    const { error } = await supabase
      .from("caixa_turnos")
      .update({
        fechado_em: new Date().toISOString(),
        valor_vendas: vendasTurno.total,
        valor_final_fisico: parseFloat(valorFisico),
        status: "FECHADO"
      })
      .eq("id", turnoAtivo.id);

    if (!error) {
      const msg = quebra === 0 
        ? "Caixa fechado com sucesso! Tudo bateu certo." 
        : `Caixa fechado. Diferença de ${format(quebra)} detectada.`;
      alert(msg);
      fetchTurno();
    }
  };

  const format = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex">
      <Sidebar />
      <main className="flex-1 ml-72 p-10">
        
        <header className="mb-10">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Gestão de Turno</h2>
          <p className="text-slate-500 font-medium">Controlo de abertura e fecho de caixa</p>
        </header>

        {isLoading ? (
          <div className="p-20 text-center font-bold text-slate-400">A verificar estado do caixa...</div>
        ) : !turnoAtivo ? (
          /* ESTADO: CAIXA FECHADO - MOSTRAR ABERTURA */
          <div className="max-w-md mx-auto bg-white rounded-[2.5rem] p-10 shadow-soft border border-slate-100 text-center">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Lock size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Caixa Fechado</h3>
            <p className="text-sm text-slate-500 mb-8">Para começar a vender, abra o turno e informe o valor de troco inicial na gaveta.</p>
            
            <div className="text-left mb-6">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Troco Inicial (R$)</label>
              <input 
                type="number" 
                placeholder="Ex: 100,00"
                className="w-full mt-1 p-4 bg-[#F4F7FE] border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-lg"
                value={valorInicial}
                onChange={(e) => setValorInicial(e.target.value)}
              />
            </div>

            <button 
              onClick={handleAbrirCaixa}
              className="w-full py-5 bg-[#0088CC] text-white rounded-[1.5rem] font-black shadow-lg shadow-blue-200 hover:bg-[#0077b3] transition-all"
            >
              ABRIR TURNO AGORA
            </button>
          </div>
        ) : (
          /* ESTADO: CAIXA ABERTO - MOSTRAR RESUMO E FECHO */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Resumo do Turno */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 text-green-600 rounded-xl"><Unlock size={20}/></div>
                    <h3 className="text-xl font-black text-slate-800">Turno em Aberto</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-400">Iniciado em: {new Date(turnoAtivo.aberto_em).toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-50 rounded-3xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Troco Inicial</p>
                    <p className="text-2xl font-black text-slate-800">{format(turnoAtivo.valor_inicial)}</p>
                  </div>
                  <div className="p-6 bg-blue-50 rounded-3xl">
                    <p className="text-[10px] font-black text-blue-400 uppercase mb-1">Total Vendas (Hoje)</p>
                    <p className="text-2xl font-black text-[#0088CC]">{format(vendasTurno.total)}</p>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                   <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Distribuição por Método</h4>
                   <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-600 flex items-center gap-2"><Banknote size={16} className="text-green-500"/> Dinheiro</span>
                      <span className="font-black text-slate-800">{format(vendasTurno.dinheiro)}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-600 flex items-center gap-2"><TrendingUp size={16} className="text-blue-500"/> PIX</span>
                      <span className="font-black text-slate-800">{format(vendasTurno.pix)}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-600 flex items-center gap-2"><Calculator size={16} className="text-purple-500"/> Cartão</span>
                      <span className="font-black text-slate-800">{format(vendasTurno.cartao)}</span>
                   </div>
                </div>
              </div>
            </div>

            {/* Coluna de Fecho */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-soft flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-800 mb-6">Conferência de Final de Dia</h3>
                <div className="bg-slate-900 rounded-3xl p-6 text-white mb-8 text-center">
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Esperado em Dinheiro</p>
                   <h4 className="text-3xl font-black text-green-400">
                     {format(turnoAtivo.valor_inicial + vendasTurno.dinheiro)}
                   </h4>
                   <p className="text-[9px] text-slate-500 mt-2">(Troco Inicial + Vendas Dinheiro)</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Total Físico na Gaveta (R$)</label>
                    <input 
                      type="number"
                      placeholder="Quanto contou na mão?"
                      className="w-full mt-1 p-4 bg-[#F4F7FE] border-none rounded-2xl outline-none focus:ring-2 focus:ring-red-500 font-bold"
                      value={valorFisico}
                      onChange={(e) => setValorFisico(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={handleFecharCaixa}
                className="w-full py-5 bg-red-600 text-white rounded-[1.5rem] font-black shadow-lg shadow-red-100 hover:bg-red-700 transition-all mt-8"
              >
                ENCERRAR TURNO
              </button>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}