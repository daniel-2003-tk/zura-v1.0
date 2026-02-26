"use client";

import { useEffect, useState } from "react";
import { supabase } from "@core/config/supabase";
import { Sidebar } from "@/components/Sidebar";

type Perda = {
  id: number;
  created_at: string;
  produto_id: number;
  quantidade: number;
  motivo: string;
  observacao: string;
  produtos: { nome: string; preco: number };
};

type Produto = {
  id: number;
  nome: string;
  estoque: number;
  preco: number;
};

export default function PerdasPage() {
  const [perdas, setPerdas] = useState<Perda[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [prejuizoTotal, setPrejuizoTotal] = useState(0);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [novaPerda, setNovaPerda] = useState({ 
    produto_id: "", 
    quantidade: 1, 
    motivo: "QUEBRA",
    observacao: "" 
  });

  const fetchData = async () => {
    setIsLoading(true);
    
    const { data: perdasData } = await supabase
      .from("perdas")
      .select(`id, created_at, produto_id, quantidade, motivo, observacao, produtos (nome, preco)`)
      .order("id", { ascending: false });

    const { data: produtosData } = await supabase.from("produtos").select("id, nome, estoque, preco");

    if (perdasData) {
      setPerdas(perdasData as any);
      
      // Calcula o prejuízo (Quantidade perdida * Preço do produto)
      const prejuizo = (perdasData as any).reduce((acc: number, curr: any) => {
        return acc + (curr.quantidade * curr.produtos.preco);
      }, 0);
      setPrejuizoTotal(prejuizo);
    }
    
    if (produtosData) setProdutos(produtosData);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSalvarPerda = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const produtoSelecionado = produtos.find(p => p.id === Number(novaPerda.produto_id));
    
    if (!produtoSelecionado) {
      alert("Selecione um produto válido.");
      setIsSaving(false);
      return;
    }

    if (produtoSelecionado.estoque < novaPerda.quantidade) {
      alert(`⚠️ Não pode registar uma perda maior que o stock atual (${produtoSelecionado.estoque} unidades).`);
      setIsSaving(false);
      return;
    }

    // 1. Regista a perda
    const { error: perdaError } = await supabase.from("perdas").insert([
      { 
        produto_id: Number(novaPerda.produto_id),
        quantidade: Number(novaPerda.quantidade),
        motivo: novaPerda.motivo,
        observacao: novaPerda.observacao
      }
    ]);

    if (perdaError) {
      alert(`❌ Erro ao registar perda: ${perdaError.message}`);
      setIsSaving(false);
      return;
    }

    // 2. Remove do Stock
    await supabase
      .from("produtos")
      .update({ estoque: produtoSelecionado.estoque - novaPerda.quantidade })
      .eq("id", produtoSelecionado.id);

    setIsSaving(false);
    setIsModalOpen(false);
    setNovaPerda({ produto_id: "", quantidade: 1, motivo: "QUEBRA", observacao: "" });
    fetchData();
  };

  const handleDeletarPerda = async (perda: Perda) => {
    if (!confirm("Deseja anular este registo de perda? O produto voltará para o stock.")) return;

    const produto = produtos.find(p => p.id === perda.produto_id);
    
    // Devolve ao stock
    if (produto) {
      const novoEstoque = produto.estoque + perda.quantidade;
      await supabase.from("produtos").update({ estoque: novoEstoque }).eq("id", produto.id);
    }

    // Apaga o registo
    const { error } = await supabase.from("perdas").delete().eq("id", perda.id);
    if (!error) fetchData();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-8 max-w-7xl mx-auto mt-8 relative">
        
        <div className="flex justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Controlo de Perdas</h2>
            <p className="text-sm text-gray-500">Registe quebras, produtos fora de validade e desvios.</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-end">
              <span className="text-xs font-bold text-gray-400 uppercase">Prejuízo Acumulado</span>
              <span className="text-2xl font-black text-red-600">
                {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(prejuizoTotal)}
              </span>
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-bold transition-colors shadow-sm"
            >
              + Registar Perda
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Data</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Produto</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Qtd</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Motivo</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="p-10 text-center text-gray-400">A carregar registos...</td></tr>
              ) : perdas.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-gray-400">Nenhuma perda registada. Excelente!</td></tr>
              ) : (
                perdas.map((perda) => (
                  <tr key={perda.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-sm text-gray-600">{new Date(perda.created_at).toLocaleDateString('pt-PT')}</td>
                    <td className="p-4 text-sm font-bold text-gray-800">{perda.produtos?.nome}</td>
                    <td className="p-4 text-sm text-center font-bold text-red-500">-{perda.quantidade}</td>
                    <td className="p-4 text-sm">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-md">
                        {perda.motivo}
                      </span>
                      {perda.observacao && <span className="block text-xs text-gray-400 mt-1">{perda.observacao}</span>}
                    </td>
                    <td className="p-4 text-sm text-right">
                      <button 
                        onClick={() => handleDeletarPerda(perda)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Anular Registo"
                      >
                        🗑️ Anular
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MODAL NOVA PERDA */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-1">Registar Perda de Produto</h3>
              <p className="text-sm text-gray-500 mb-6">Este item será deduzido do stock.</p>
              
              <form onSubmit={handleSalvarPerda} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Produto</label>
                  <select 
                    required 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={novaPerda.produto_id}
                    onChange={(e) => setNovaPerda({...novaPerda, produto_id: e.target.value})}
                  >
                    <option value="">Selecione o produto...</option>
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
                      value={novaPerda.quantidade}
                      onChange={(e) => setNovaPerda({...novaPerda, quantidade: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Motivo</label>
                    <select 
                      required 
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      value={novaPerda.motivo}
                      onChange={(e) => setNovaPerda({...novaPerda, motivo: e.target.value})}
                    >
                      <option value="QUEBRA">Quebra / Danos</option>
                      <option value="VENCIMENTO">Fora de Validade</option>
                      <option value="FURTO">Furto / Desvio</option>
                      <option value="CONSUMO">Consumo Interno</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Observação (Opcional)</label>
                  <input 
                    type="text"
                    placeholder="Ex: Garrafa caiu ao descarregar..."
                    value={novaPerda.observacao}
                    onChange={(e) => setNovaPerda({...novaPerda, observacao: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex justify-end gap-3 mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
                  <button type="submit" disabled={isSaving} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-md transition-all disabled:opacity-50">
                    {isSaving ? "A registar..." : "Confirmar Perda"}
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