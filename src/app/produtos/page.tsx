"use client";

import { useEffect, useState } from "react";
import { supabase } from "@core/config/supabase";
import { Sidebar } from "@/components/Sidebar";

type Produto = {
  id: number;
  nome: string;
  preco: number;
  estoque: number;
};

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Novo estado para o campo de pesquisa
  const [termoBusca, setTermoBusca] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [novoProduto, setNovoProduto] = useState({ nome: "", preco: "", estoque: "" });

  const fetchProdutos = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .order("id", { ascending: false });
    
    if (!error) {
      setProdutos(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setNovoProduto({ nome: "", preco: "", estoque: "" });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (produto: Produto) => {
    setEditingId(produto.id);
    setNovoProduto({ 
      nome: produto.nome, 
      preco: produto.preco.toString(), 
      estoque: produto.estoque.toString() 
    });
    setIsModalOpen(true);
  };

  const handleSalvarProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const dados = { 
      nome: novoProduto.nome, 
      preco: parseFloat(novoProduto.preco), 
      estoque: parseInt(novoProduto.estoque) 
    };

    if (editingId) {
      const { error } = await supabase.from("produtos").update(dados).eq("id", editingId);
      if (error) alert(error.message);
    } else {
      const { error } = await supabase.from("produtos").insert([dados]);
      if (error) alert(error.message);
    }

    setIsSaving(false);
    setIsModalOpen(false);
    fetchProdutos();
  };

  const handleDeletarProduto = async (id: number) => {
    if (!confirm("Eliminar este produto permanentemente?")) return;
    const { error } = await supabase.from("produtos").delete().eq("id", id);
    if (!error) fetchProdutos();
  };

  const getStockBadge = (qtd: number) => {
    if (qtd <= 0) return "bg-red-100 text-red-700 border-red-200";
    if (qtd <= 5) return "bg-orange-100 text-orange-700 border-orange-200";
    return "bg-green-100 text-green-700 border-green-200";
  };

  // Lógica de Filtro em Tempo Real
  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 ml-64 p-8 max-w-7xl mx-auto mt-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Estoque de Produtos</h2>
            <p className="text-sm text-gray-500">Faça a gestão dos seus itens e níveis de reposição</p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            {/* CAMPO DE PESQUISA */}
            <input 
              type="text" 
              placeholder="Pesquisar produto pelo nome..." 
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
            />

            <button 
              onClick={handleOpenCreateModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm whitespace-nowrap"
            >
              + Adicionar Produto
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Produto</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Preço</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Estoque</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="p-10 text-center text-gray-400">A carregar o stock...</td></tr>
              ) : produtosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-gray-400">
                    {termoBusca ? "Nenhum produto encontrado para essa pesquisa." : "Nenhum item em stock."}
                  </td>
                </tr>
              ) : (
                produtosFiltrados.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-sm font-semibold text-gray-700">{p.nome}</td>
                    <td className="p-4 text-sm text-gray-600 font-medium">
                      {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(p.preco)}
                    </td>
                    <td className="p-4 text-sm">
                      <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold ${getStockBadge(p.estoque)}`}>
                        {p.estoque} un
                      </span>
                    </td>
                    <td className="p-4 text-sm text-right space-x-4">
                      <button 
                        onClick={() => handleOpenEditModal(p)}
                        className="text-blue-500 hover:text-blue-700 font-medium"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDeletarProduto(p.id)} 
                        className="text-red-400 hover:text-red-600 font-medium"
                      >
                        Eliminar
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
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                {editingId ? "Editar Produto" : "Novo Produto"}
              </h3>
              <p className="text-sm text-gray-500 mb-6">Preencha as informações abaixo.</p>
              
              <form onSubmit={handleSalvarProduto} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nome do Produto</label>
                  <input type="text" required value={novoProduto.nome}
                    onChange={(e) => setNovoProduto({...novoProduto, nome: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Preço</label>
                    <input type="number" step="0.01" required value={novoProduto.preco}
                      onChange={(e) => setNovoProduto({...novoProduto, preco: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Estoque</label>
                    <input type="number" required value={novoProduto.estoque}
                      onChange={(e) => setNovoProduto({...novoProduto, estoque: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500 font-medium">Cancelar</button>
                  <button type="submit" disabled={isSaving} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-md hover:bg-blue-700 disabled:opacity-50 transition-all">
                    {isSaving ? "A guardar..." : "Confirmar"}
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