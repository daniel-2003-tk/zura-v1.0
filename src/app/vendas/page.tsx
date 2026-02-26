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
};

export default function VendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [clientes, setClientes] = useState<{id: number, nome: string}[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [termoBusca, setTermoBusca] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [novaVenda, setNovaVenda] = useState({ 
    cliente_id: "", 
    produto_id: "", 
    quantidade: 1,
    metodo_pagamento: "PIX" // Valor por defeito
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
    const { data: produtosData } = await supabase.from("produtos").select("id, nome, preco, estoque");

    if (vendasData) setVendas(vendasData as any);
    if (clientesData) setClientes(clientesData);
    if (produtosData) setProdutos(produtosData);
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSalvarVenda = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const produtoSelecionado = produtos.find(p => p.id === Number(novaVenda.produto_id));
    const clienteSelecionado = clientes.find(c => c.id === Number(novaVenda.cliente_id));
    
    if (!produtoSelecionado || !clienteSelecionado) {
      alert("Selecione um produto e um cliente válidos.");
      setIsSaving(false);
      return;
    }

    if (produtoSelecionado.estoque < novaVenda.quantidade) {
      alert(`⚠️ Stock insuficiente! Tem apenas ${produtoSelecionado.estoque} unidades.`);
      setIsSaving(false);
      return;
    }

    const total = produtoSelecionado.preco * novaVenda.quantidade;

    // 1. Regista a Venda com o método de pagamento
    const { error: vendaError } = await supabase.from("vendas").insert([
      { 
        cliente_id: Number(novaVenda.cliente_id), 
        produto_id: Number(novaVenda.produto_id), 
        quantidade: Number(novaVenda.quantidade),
        valor_total: total,
        metodo_pagamento: novaVenda.metodo_pagamento
      }
    ]);

    if (vendaError) {
      alert(`❌ Erro ao registar venda: ${vendaError.message}`);
      setIsSaving(false);
      return;
    }

    // 2. Baixa no Stock
    await supabase
      .from("produtos")
      .update({ estoque: produtoSelecionado.estoque - novaVenda.quantidade })
      .eq("id", produtoSelecionado.id);

    // 3. INTELIGÊNCIA DE ROTAS (Caixa vs Fiado)
    if (novaVenda.metodo_pagamento === "FIADO") {
      // Vai para a Caderneta
      await supabase.from("fiados").insert([
        {
          cliente_id: Number(novaVenda.cliente_id),
          valor: total,
          descricao: `Venda: ${novaVenda.quantidade}x ${produtoSelecionado.nome}`,
          status: "PENDENTE"
        }
      ]);
    } else {
      // Vai para o Caixa
      await supabase.from("caixa").insert([
        {
          tipo: "ENTRADA",
          valor: total,
          descricao: `Venda (${novaVenda.metodo_pagamento}): ${novaVenda.quantidade}x ${produtoSelecionado.nome} (${clienteSelecionado.nome})`
        }
      ]);
    }

    setIsSaving(false);
    setIsModalOpen(false);
    setNovaVenda({ cliente_id: "", produto_id: "", quantidade: 1, metodo_pagamento: "PIX" });
    fetchData();
  };

  const handleDeletarVenda = async (venda: Venda) => {
    if (!confirm("Deseja cancelar esta venda? O stock será devolvido e as finanças ajustadas.")) return;

    const produto = produtos.find(p => p.id === venda.produto_id);
    
    // 1. Devolve o stock
    if (produto) {
      const novoEstoque = produto.estoque + venda.quantidade;
      await supabase.from("produtos").update({ estoque: novoEstoque }).eq("id", produto.id);
    }

    // 2. Inteligência do Estorno
    if (venda.metodo_pagamento === "FIADO") {
      alert("Atenção: Esta venda foi registada a Fiado. Por favor, elimine a dívida manualmente no menu 'Fiados' para não cobrar o cliente indevidamente.");
    } else {
      // Lança o Estorno (Saída) no Caixa
      await supabase.from("caixa").insert([
        {
          tipo: "SAIDA",
          valor: venda.valor_total,
          descricao: `Estorno de Venda Cancelada: ${venda.produtos?.nome}`
        }
      ]);
    }

    // 3. Elimina a venda do histórico
    const { error } = await supabase.from("vendas").delete().eq("id", venda.id);

    if (error) {
      alert("Erro ao cancelar venda.");
    } else {
      fetchData();
    }
  };

  const vendasFiltradas = vendas.filter((venda) => {
    const nomeCliente = venda.clientes?.nome?.toLowerCase() || "";
    const nomeProduto = venda.produtos?.nome?.toLowerCase() || "";
    const busca = termoBusca.toLowerCase();
    
    return nomeCliente.includes(busca) || nomeProduto.includes(busca);
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-8 max-w-7xl mx-auto mt-8 relative">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Histórico de Vendas</h2>
            <p className="text-sm text-gray-500">Faça a gestão de todos os pedidos realizados.</p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <input 
              type="text" 
              placeholder="Pesquisar cliente ou produto..." 
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
            />
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-colors whitespace-nowrap shadow-sm"
            >
              + Nova Venda
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Data</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Cliente</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Produto</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Método</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="p-10 text-center text-gray-400">A carregar histórico...</td></tr>
              ) : vendasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-400">
                    {termoBusca ? "Nenhuma venda encontrada para esta pesquisa." : "Nenhuma venda registada."}
                  </td>
                </tr>
              ) : (
                vendasFiltradas.map((v) => (
                  <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-sm text-gray-600">{new Date(v.created_at).toLocaleDateString('pt-PT')}</td>
                    <td className="p-4 text-sm font-semibold text-gray-700">{v.clientes?.nome}</td>
                    <td className="p-4 text-sm text-gray-600">{v.produtos?.nome} ({v.quantidade}x)</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 text-xs font-bold rounded-md ${v.metodo_pagamento === 'FIADO' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                        {v.metodo_pagamento}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-bold text-green-600">
                      {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(v.valor_total)}
                    </td>
                    <td className="p-4 text-sm text-right">
                      <button 
                        onClick={() => handleDeletarVenda(v)}
                        className="text-red-400 hover:text-red-600 font-medium transition-colors"
                      >
                        Cancelar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-1">Registar Nova Venda</h3>
              <p className="text-sm text-gray-500 mb-6">Selecione os dados do pedido.</p>
              
              <form onSubmit={handleSalvarVenda} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Cliente</label>
                  <select 
                    required 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={novaVenda.cliente_id}
                    onChange={(e) => setNovaVenda({...novaVenda, cliente_id: e.target.value})}
                  >
                    <option value="">Selecione um cliente...</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Produto</label>
                  <select 
                    required 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={novaVenda.produto_id}
                    onChange={(e) => setNovaVenda({...novaVenda, produto_id: e.target.value})}
                  >
                    <option value="">Selecione um produto...</option>
                    {produtos.map(p => (
                      <option key={p.id} value={p.id}>{p.nome} (Stock: {p.estoque})</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Quantidade</label>
                    <input 
                      type="number" min="1" required 
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      value={novaVenda.quantidade}
                      onChange={(e) => setNovaVenda({...novaVenda, quantidade: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Pagamento</label>
                    <select 
                      required 
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      value={novaVenda.metodo_pagamento}
                      onChange={(e) => setNovaVenda({...novaVenda, metodo_pagamento: e.target.value})}
                    >
                      <option value="PIX">PIX</option>
                      <option value="DINHEIRO">Dinheiro</option>
                      <option value="CARTAO">Cartão</option>
                      <option value="FIADO">Fiado</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
                  <button type="submit" disabled={isSaving} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-md transition-all disabled:opacity-50">
                    {isSaving ? "A processar..." : "Finalizar Pedido"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}