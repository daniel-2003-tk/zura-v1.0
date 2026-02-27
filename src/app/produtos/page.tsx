"use client";

import { useEffect, useState } from "react";
import { supabase } from "@core/config/supabase";
import { Sidebar } from "@/components/Sidebar";

type Venda = {
  id: number;
  created_at: string;
  valor_total: number;
  quantidade: number;
  produto_id: number;
  metodo_pagamento: string;
  clientes: { nome: string };
  produtos: { nome: string };
};

type Produto = {
  id: number;
  nome: string;
  preco: number;
  estoque: number;
  vende_dose: boolean;
  qtd_doses: number;
  preco_dose: number;
  estoque_doses: number;
};

export default function VendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [clientes, setClientes] = useState<{id: number, nome: string}[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [termoBusca, setTermoBusca] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estado da Venda
  const [novaVenda, setNovaVenda] = useState({ 
    cliente_id: "", 
    produto_id: "", 
    quantidade: 1,
    tipo_venda: "FECHADO" // Pode ser "FECHADO" ou "DOSE"
  });

  // Estado do Pagamento Misto
  const [pagamentos, setPagamentos] = useState({
    PIX: 0,
    DINHEIRO: 0,
    CARTAO: 0,
    FIADO: 0
  });

  const fetchData = async () => {
    setIsLoading(true);
    const { data: vendasData } = await supabase
      .from("vendas")
      .select(`
        id, created_at, valor_total, quantidade, produto_id, metodo_pagamento,
        clientes ( nome ),
        produtos ( nome )
      `)
      .order("id", { ascending: false });

    const { data: clientesData } = await supabase.from("clientes").select("id, nome");
    const { data: produtosData } = await supabase.from("produtos")
      .select("id, nome, preco, estoque, vende_dose, qtd_doses, preco_dose, estoque_doses");

    if (vendasData) setVendas(vendasData as any);
    if (clientesData) setClientes(clientesData);
    if (produtosData) setProdutos(produtosData as any);
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Seleciona o produto para recalcular valores em tempo real
  const produtoSelecionado = produtos.find(p => p.id === Number(novaVenda.produto_id));
  
  // Calcula o total da venda dependendo se é fechado ou dose
  const precoBase = novaVenda.tipo_venda === "DOSE" ? (produtoSelecionado?.preco_dose || 0) : (produtoSelecionado?.preco || 0);
  const totalVenda = precoBase * novaVenda.quantidade;
  
  const totalPago = pagamentos.PIX + pagamentos.DINHEIRO + pagamentos.CARTAO + pagamentos.FIADO;
  const faltaPagar = totalVenda - totalPago;

  // Quando muda o produto, garante que se não vender dose, volta para FECHADO
  useEffect(() => {
    if (produtoSelecionado && !produtoSelecionado.vende_dose && novaVenda.tipo_venda === "DOSE") {
      setNovaVenda(prev => ({ ...prev, tipo_venda: "FECHADO" }));
    }
  }, [produtoSelecionado]);

  const handleSalvarVenda = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (faltaPagar !== 0) {
      alert(`⚠️ A conta não bate certo! Falta distribuir ${formatMoeda(faltaPagar)} nos métodos de pagamento.`);
      return;
    }

    if (!produtoSelecionado) return;

    setIsSaving(true);
    const clienteSelecionado = clientes.find(c => c.id === Number(novaVenda.cliente_id));

    // ============================================
    // 🧠 INTELIGÊNCIA DE STOCK FRACIONADO (DOSES)
    // ============================================
    let novoEstoqueFechado = produtoSelecionado.estoque;
    let novoEstoqueDoses = produtoSelecionado.estoque_doses;

    if (novaVenda.tipo_venda === "DOSE") {
      if (novaVenda.quantidade <= novoEstoqueDoses) {
        // Tem doses abertas suficientes
        novoEstoqueDoses -= novaVenda.quantidade;
      } else {
        // Não tem doses abertas suficientes. Precisa abrir garrafas novas!
        const dosesFaltantes = novaVenda.quantidade - novoEstoqueDoses;
        const garrafasNecessarias = Math.ceil(dosesFaltantes / produtoSelecionado.qtd_doses);

        if (garrafasNecessarias > novoEstoqueFechado) {
           alert(`⚠️ Stock insuficiente! Precisa de abrir ${garrafasNecessarias} garrafa(s), mas só tem ${novoEstoqueFechado} em stock.`);
           setIsSaving(false);
           return;
        }

        novoEstoqueFechado -= garrafasNecessarias;
        novoEstoqueDoses = (garrafasNecessarias * produtoSelecionado.qtd_doses) - dosesFaltantes;
      }
    } else {
      // Venda normal (Garrafa Fechada)
      if (novaVenda.quantidade > novoEstoqueFechado) {
         alert(`⚠️ Stock insuficiente! Tem apenas ${novoEstoqueFechado} unidades.`);
         setIsSaving(false);
         return;
      }
      novoEstoqueFechado -= novaVenda.quantidade;
    }

    // ============================================

    // Monta a string de como foi pago
    let metodosUsados = [];
    if (pagamentos.PIX > 0) metodosUsados.push(`PIX (${pagamentos.PIX})`);
    if (pagamentos.DINHEIRO > 0) metodosUsados.push(`DINHEIRO (${pagamentos.DINHEIRO})`);
    if (pagamentos.CARTAO > 0) metodosUsados.push(`CARTÃO (${pagamentos.CARTAO})`);
    if (pagamentos.FIADO > 0) metodosUsados.push(`FIADO (${pagamentos.FIADO})`);
    const metodoFinal = metodosUsados.join(" + ");

    const nomeVendaDescricao = novaVenda.tipo_venda === "DOSE" 
      ? `${novaVenda.quantidade}x Dose de ${produtoSelecionado.nome}`
      : `${novaVenda.quantidade}x ${produtoSelecionado.nome}`;

    // 1. Regista a Venda
    const { error: vendaError } = await supabase.from("vendas").insert([
      { 
        cliente_id: Number(novaVenda.cliente_id), 
        produto_id: Number(novaVenda.produto_id), 
        quantidade: Number(novaVenda.quantidade),
        valor_total: totalVenda,
        metodo_pagamento: novaVenda.tipo_venda === "DOSE" ? `[DOSE] ${metodoFinal}` : metodoFinal
      }
    ]);

    if (vendaError) {
      alert(`❌ Erro ao registar venda: ${vendaError.message}`);
      setIsSaving(false);
      return;
    }

    // 2. Atualiza o Stock na Base de Dados (Atualiza garrafas e doses simultaneamente)
    await supabase
      .from("produtos")
      .update({ 
        estoque: novoEstoqueFechado,
        estoque_doses: novoEstoqueDoses
      })
      .eq("id", produtoSelecionado.id);

    // 3. Distribuição Financeira (Caixa / Fiados)
    if (pagamentos.PIX > 0) await supabase.from("caixa").insert([{ tipo: "ENTRADA", valor: pagamentos.PIX, descricao: `Venda PIX: ${nomeVendaDescricao} (${clienteSelecionado?.nome})` }]);
    if (pagamentos.DINHEIRO > 0) await supabase.from("caixa").insert([{ tipo: "ENTRADA", valor: pagamentos.DINHEIRO, descricao: `Venda Dinheiro: ${nomeVendaDescricao} (${clienteSelecionado?.nome})` }]);
    if (pagamentos.CARTAO > 0) await supabase.from("caixa").insert([{ tipo: "ENTRADA", valor: pagamentos.CARTAO, descricao: `Venda Cartão: ${nomeVendaDescricao} (${clienteSelecionado?.nome})` }]);
    
    if (pagamentos.FIADO > 0) {
      await supabase.from("fiados").insert([{
        cliente_id: Number(novaVenda.cliente_id),
        valor: pagamentos.FIADO,
        descricao: `Parte da Venda: ${nomeVendaDescricao}`,
        status: "PENDENTE"
      }]);
    }

    setIsSaving(false);
    setIsModalOpen(false);
    setNovaVenda({ cliente_id: "", produto_id: "", quantidade: 1, tipo_venda: "FECHADO" });
    setPagamentos({ PIX: 0, DINHEIRO: 0, CARTAO: 0, FIADO: 0 });
    fetchData();
  };

  const handleDeletarVenda = async (venda: Venda) => {
    if (!confirm("Atenção: Para manter a consistência matemática das garrafas abertas (Doses), caso cancele esta venda, precisará ajustar o Caixa, os Fiados e o Stock do produto manualmente no ecrã de Produtos. Confirmar exclusão do histórico?")) return;

    const { error } = await supabase.from("vendas").delete().eq("id", venda.id);
    if (!error) fetchData();
  };

  const formatMoeda = (valor: number) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(valor);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-8 max-w-7xl mx-auto mt-8 relative">
        
        <div className="flex justify-between items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">PDV e Histórico de Vendas</h2>
            <p className="text-sm text-gray-500">Registe vendas fracionadas e métodos mistos.</p>
          </div>
          
          <button 
            onClick={() => {
              setNovaVenda({ cliente_id: "", produto_id: "", quantidade: 1, tipo_venda: "FECHADO" });
              setPagamentos({ PIX: 0, DINHEIRO: 0, CARTAO: 0, FIADO: 0 });
              setIsModalOpen(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-bold transition-colors shadow-sm"
          >
            + Frente de Caixa (PDV)
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Data</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Cliente</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Produto</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Métodos Pagos</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Total</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="p-10 text-center text-gray-400">A carregar PDV...</td></tr>
              ) : vendas.map((v) => (
                <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-sm text-gray-600">{new Date(v.created_at).toLocaleDateString('pt-PT')}</td>
                  <td className="p-4 text-sm font-semibold text-gray-700">{v.clientes?.nome}</td>
                  <td className="p-4 text-sm text-gray-600">
                    {v.produtos?.nome} ({v.quantidade}x {v.metodo_pagamento.includes("[DOSE]") ? "Doses" : "Un"})
                  </td>
                  <td className="p-4 text-xs font-medium text-blue-600">
                    <span className="bg-blue-50 border border-blue-100 rounded-md p-1.5 inline-block">
                      {v.metodo_pagamento.replace("[DOSE] ", "")}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-bold text-green-600 text-right">
                    {formatMoeda(v.valor_total)}
                  </td>
                  <td className="p-4 text-sm text-right">
                    <button onClick={() => handleDeletarVenda(v)} className="text-red-400 hover:text-red-600 font-medium">Cancelar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-3xl border border-gray-100 flex gap-8">
              
              {/* LADO ESQUERDO: SELEÇÃO DE PRODUTO */}
              <div className="flex-1 space-y-4 border-r border-gray-100 pr-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">1. Dados do Pedido</h3>
                
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Cliente</label>
                  <select required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={novaVenda.cliente_id} onChange={(e) => setNovaVenda({...novaVenda, cliente_id: e.target.value})}>
                    <option value="">Selecione...</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Produto</label>
                  <select required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={novaVenda.produto_id} onChange={(e) => setNovaVenda({...novaVenda, produto_id: e.target.value})}>
                    <option value="">Selecione o produto...</option>
                    {produtos.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nome} (Stock: {p.estoque} garrafas {p.vende_dose ? `| ${p.estoque_doses} doses soltas` : ''})
                      </option>
                    ))}
                  </select>
                </div>

                {/* OPÇÃO DE GARRAFA FECHADA OU DOSE (Só aparece se o produto permitir) */}
                {produtoSelecionado && produtoSelecionado.vende_dose && (
                  <div className="flex bg-gray-100 rounded-lg p-1 gap-1 my-4">
                    <button type="button" 
                      className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${novaVenda.tipo_venda === 'FECHADO' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
                      onClick={() => setNovaVenda({...novaVenda, tipo_venda: "FECHADO"})}
                    >
                      🍾 Fechado ({formatMoeda(produtoSelecionado.preco)})
                    </button>
                    <button type="button" 
                      className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${novaVenda.tipo_venda === 'DOSE' ? 'bg-purple-100 shadow-sm text-purple-700' : 'text-gray-500 hover:bg-gray-200'}`}
                      onClick={() => setNovaVenda({...novaVenda, tipo_venda: "DOSE"})}
                    >
                      🥃 Em Dose ({formatMoeda(produtoSelecionado.preco_dose)})
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Quantidade</label>
                  <input type="number" min="1" required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={novaVenda.quantidade} onChange={(e) => setNovaVenda({...novaVenda, quantidade: parseInt(e.target.value) || 1})} />
                </div>
              </div>

              {/* LADO DIREITO: SPLIT PAYMENT */}
              <div className="flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-800 mb-4">2. Pagamento Misto</h3>
                
                <div className="bg-slate-900 text-white p-4 rounded-xl mb-6 text-center shadow-inner">
                  <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Total a Pagar</span>
                  <span className="text-3xl font-black text-green-400">{formatMoeda(totalVenda)}</span>
                </div>

                <div className="space-y-3 flex-1">
                  {Object.keys(pagamentos).map((metodo) => (
                    <div key={metodo} className="flex items-center justify-between gap-4">
                      <label className="text-xs font-bold text-gray-600 w-20">{metodo}</label>
                      <input 
                        type="number" step="0.01" min="0" 
                        className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-right font-medium text-gray-700"
                        value={pagamentos[metodo as keyof typeof pagamentos] || ""}
                        onChange={(e) => setPagamentos({...pagamentos, [metodo]: parseFloat(e.target.value) || 0})}
                        placeholder="0,00"
                      />
                    </div>
                  ))}
                </div>

                {/* Resumo da Falta */}
                <div className={`mt-6 p-3 rounded-lg border flex justify-between items-center font-bold text-sm ${faltaPagar === 0 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                  <span>Falta distribuir:</span>
                  <span>{formatMoeda(faltaPagar)}</span>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500 font-medium">Cancelar</button>
                  <button onClick={handleSalvarVenda} disabled={isSaving || faltaPagar !== 0 || !produtoSelecionado} className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 transition-all">
                    {isSaving ? "A registar..." : "Finalizar Pedido"}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}