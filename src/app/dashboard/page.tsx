"use client";

import { useEffect, useState } from "react";
import { supabase } from "@core/config/supabase";
import { Sidebar } from "@/components/Sidebar";

type ProdutoCritico = { nome: string; estoque: number };
type UltimaVenda = { 
  id: number; 
  valor_total: number; 
  metodo_pagamento: string; 
  clientes: { nome: string } 
};

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Indicadores Principais
  const [faturamentoTotal, setFaturamentoTotal] = useState(0);
  const [saldoCaixa, setSaldoCaixa] = useState(0);
  const [fiadosPendentes, setFiadosPendentes] = useState(0);
  
  // Alertas e Listas
  const [produtosCriticos, setProdutosCriticos] = useState<ProdutoCritico[]>([]);
  const [ultimasVendas, setUltimasVendas] = useState<UltimaVenda[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);

      // 1. Faturamento Total (Vendas)
      const { data: vendas } = await supabase.from("vendas").select("valor_total");
      if (vendas) {
        const total = vendas.reduce((acc, curr) => acc + curr.valor_total, 0);
        setFaturamentoTotal(total);
      }

      // 2. Saldo do Caixa
      const { data: caixa } = await supabase.from("caixa").select("tipo, valor");
      if (caixa) {
        const saldo = caixa.reduce((acc, curr) => {
          return curr.tipo === "ENTRADA" ? acc + curr.valor : acc - curr.valor;
        }, 0);
        setSaldoCaixa(saldo);
      }

      // 3. Fiados Pendentes (A Receber)
      const { data: fiados } = await supabase.from("fiados").select("valor").eq("status", "PENDENTE");
      if (fiados) {
        const totalFiados = fiados.reduce((acc, curr) => acc + curr.valor, 0);
        setFiadosPendentes(totalFiados);
      }

      // 4. Alerta de Estoque (< 5 unidades)
      const { data: criticos } = await supabase
        .from("produtos")
        .select("nome, estoque")
        .lt("estoque", 5)
        .order("estoque", { ascending: true })
        .limit(5);
      if (criticos) setProdutosCriticos(criticos);

      // 5. Últimas 5 Vendas
      const { data: ultimas } = await supabase
        .from("vendas")
        .select("id, valor_total, metodo_pagamento, clientes(nome)")
        .order("id", { ascending: false })
        .limit(5);
      if (ultimas) setUltimasVendas(ultimas as any);

      setIsLoading(false);
    };

    fetchDashboardData();
  }, []);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 ml-64 p-8 max-w-7xl mx-auto mt-8">
        
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Visão Geral do Negócio</h2>
          <p className="text-gray-500 text-sm">Acompanhe os principais indicadores do seu Zura ERP.</p>
        </header>

        {isLoading ? (
          <div className="flex justify-center items-center h-64 text-gray-400 font-medium animate-pulse">
            Sincronizando dados com o servidor...
          </div>
        ) : (
          <>
            {/* CARDS SUPERIORES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              
              {/* Card 1: Saldo em Caixa */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:-translate-y-1 transition-transform">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-green-50 rounded-lg text-green-600">💵</div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Livre Hoje</span>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-gray-800">{formatarMoeda(saldoCaixa)}</h3>
                  <p className="text-sm text-gray-500 mt-1">Saldo atual na gaveta</p>
                </div>
              </div>

              {/* Card 2: A Receber (Fiados) */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:-translate-y-1 transition-transform">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-orange-50 rounded-lg text-orange-600">📝</div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fiados</span>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-orange-600">{formatarMoeda(fiadosPendentes)}</h3>
                  <p className="text-sm text-gray-500 mt-1">Total pendente na rua</p>
                </div>
              </div>

              {/* Card 3: Faturamento Total */}
              <div className="bg-blue-600 p-6 rounded-2xl shadow-md border border-blue-500 flex flex-col justify-between hover:-translate-y-1 transition-transform text-white">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-500/50 rounded-lg text-white">💰</div>
                  <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">Histórico</span>
                </div>
                <div>
                  <h3 className="text-3xl font-black">{formatarMoeda(faturamentoTotal)}</h3>
                  <p className="text-sm text-blue-200 mt-1">Faturamento bruto total</p>
                </div>
              </div>

            </div>

            {/* SEÇÃO INFERIOR: Alertas e Atividade */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* ALERTA DE ESTOQUE */}
              <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden col-span-1 flex flex-col">
                <div className="bg-orange-50/50 p-5 border-b border-orange-100">
                  <h3 className="font-bold text-orange-800 flex items-center gap-2">
                    ⚠️ Atenção Necessária
                  </h3>
                  <p className="text-xs text-orange-600/80 mt-1">Produtos precisando de reposição</p>
                </div>
                <div className="p-5 flex-1">
                  {produtosCriticos.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm text-gray-400">
                      Estoque sob controle! Nenhum alerta.
                    </div>
                  ) : (
                    <ul className="space-y-4">
                      {produtosCriticos.map((p, index) => (
                        <li key={index} className="flex justify-between items-center pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                          <span className="text-sm font-medium text-gray-700">{p.nome}</span>
                          <span className="text-xs font-bold px-2 py-1 bg-red-50 text-red-600 rounded-md">
                            {p.estoque} un
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* ÚLTIMAS VENDAS */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2 flex flex-col">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-800">Últimas Movimentações</h3>
                    <p className="text-xs text-gray-500 mt-1">As 5 vendas mais recentes do sistema</p>
                  </div>
                </div>
                <div className="p-0 flex-1">
                  {ultimasVendas.length === 0 ? (
                    <div className="p-10 text-center text-sm text-gray-400">
                      Nenhuma venda registrada ainda.
                    </div>
                  ) : (
                    <table className="w-full text-left">
                      <tbody>
                        {ultimasVendas.map((v) => (
                          <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="p-4 text-sm font-semibold text-gray-700">
                              {v.clientes?.nome || "Cliente Removido"}
                            </td>
                            <td className="p-4 text-sm">
                              <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md ${v.metodo_pagamento === 'FIADO' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                                {v.metodo_pagamento}
                              </span>
                            </td>
                            <td className="p-4 text-sm font-bold text-green-600 text-right">
                              {formatarMoeda(v.valor_total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}