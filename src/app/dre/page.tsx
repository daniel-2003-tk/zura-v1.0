"use client";

import { useEffect, useState } from "react";
import { supabase } from "@core/config/supabase";
import { Sidebar } from "@/components/Sidebar";

export default function DREPage() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Linhas do DRE
  const [receitaBruta, setReceitaBruta] = useState(0);
  const [despesasOperacionais, setDespesasOperacionais] = useState(0);
  const [despesasRH, setDespesasRH] = useState(0);
  const [custoPerdas, setCustoPerdas] = useState(0);

  const fetchDRE = async () => {
    setIsLoading(true);

    // 1. Receita Bruta (Todas as Vendas)
    const { data: vendas } = await supabase.from("vendas").select("valor_total");
    const totalVendas = vendas?.reduce((acc, curr) => acc + curr.valor_total, 0) || 0;
    setReceitaBruta(totalVendas);

    // 2. Despesas Operacionais (Contas Pagas)
    const { data: contas } = await supabase.from("contas_pagar").select("valor").eq("status", "PAGO");
    const totalContas = contas?.reduce((acc, curr) => acc + curr.valor, 0) || 0;
    setDespesasOperacionais(totalContas);

    // 3. Despesas de RH (Folha de Pagamento de funcionários ativos)
    const { data: rh } = await supabase.from("funcionarios").select("salario").eq("status", "ATIVO");
    const totalRH = rh?.reduce((acc, curr) => acc + curr.salario, 0) || 0;
    setDespesasRH(totalRH);

    // 4. Custo de Perdas (Prejuízo com estoque avariado/vencido)
    const { data: perdas } = await supabase.from("perdas").select("quantidade, produtos(preco)");
    const totalPerdas = perdas?.reduce((acc, curr: any) => {
      const preco = curr.produtos?.preco || 0;
      return acc + (curr.quantidade * preco);
    }, 0) || 0;
    setCustoPerdas(totalPerdas);

    setIsLoading(false);
  };

  useEffect(() => {
    fetchDRE();
  }, []);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  // Cálculos Automáticos do DRE
  const totalDespesas = despesasOperacionais + despesasRH + custoPerdas;
  const lucroLiquido = receitaBruta - totalDespesas;
  
  // Margem de Lucro (evitando divisão por zero)
  const margemLucro = receitaBruta > 0 ? ((lucroLiquido / receitaBruta) * 100).toFixed(1) : "0.0";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-8 max-w-4xl mx-auto mt-8 relative">
        
        <div className="flex justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">DRE Gerencial</h2>
            <p className="text-sm text-gray-500">Demonstrativo de Resultado do Exercício (Visão Global).</p>
          </div>
          <button 
            onClick={fetchDRE}
            className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
          >
            🔄 Recalcular
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64 text-gray-400 font-medium animate-pulse">
            Processando cálculos financeiros...
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            
            {/* CABEÇALHO DRE */}
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-slate-100">Resultado Consolidado</h3>
                <p className="text-sm text-slate-400 mt-1">Acumulado de todas as operações</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Margem Líquida</span>
                <span className={`text-2xl font-black ${lucroLiquido >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {margemLucro}%
                </span>
              </div>
            </div>

            {/* CORPO DO DRE */}
            <div className="p-8">
              
              {/* Receitas */}
              <div className="flex justify-between items-end mb-4 border-b border-gray-100 pb-4">
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">(=) Receita Bruta</h4>
                  <p className="text-xs text-gray-500">Total faturado em vendas</p>
                </div>
                <span className="font-black text-xl text-green-600">
                  {formatarMoeda(receitaBruta)}
                </span>
              </div>

              {/* Seção de Custos e Despesas */}
              <div className="pl-6 space-y-6 mb-6">
                
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-gray-600">(-) Despesas Operacionais</span>
                    <p className="text-xs text-gray-400">Contas a pagar quitadas (luz, água, boletos)</p>
                  </div>
                  <span className="font-bold text-red-500">
                    {formatarMoeda(despesasOperacionais)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-gray-600">(-) Despesas de Pessoal (RH)</span>
                    <p className="text-xs text-gray-400">Folha de pagamento (funcionários ativos)</p>
                  </div>
                  <span className="font-bold text-red-500">
                    {formatarMoeda(despesasRH)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-gray-600">(-) Custo de Perdas e Quebras</span>
                    <p className="text-xs text-gray-400">Prejuízo com estoque avariado ou vencido</p>
                  </div>
                  <span className="font-bold text-red-500">
                    {formatarMoeda(custoPerdas)}
                  </span>
                </div>

              </div>

              {/* Subtotal de Despesas */}
              <div className="flex justify-between items-center mb-8 bg-red-50 p-4 rounded-lg border border-red-100">
                <span className="font-bold text-red-800 text-sm uppercase">Total de Custos e Despesas</span>
                <span className="font-black text-red-600">
                  {formatarMoeda(totalDespesas)}
                </span>
              </div>

              {/* RESULTADO LÍQUIDO */}
              <div className={`flex justify-between items-center p-6 rounded-xl border-2 ${lucroLiquido >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div>
                  <h4 className={`font-black text-xl uppercase tracking-wider ${lucroLiquido >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                    Resultado Líquido
                  </h4>
                  <p className={`text-sm font-medium ${lucroLiquido >= 0 ? 'text-green-600/80' : 'text-red-600/80'}`}>
                    {lucroLiquido >= 0 ? 'O negócio está dando lucro 🚀' : 'O negócio está operando no vermelho ⚠️'}
                  </p>
                </div>
                <span className={`font-black text-4xl ${lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatarMoeda(lucroLiquido)}
                </span>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}