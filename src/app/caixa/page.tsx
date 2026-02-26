"use client";

import { useEffect, useState } from "react";
import { supabase } from "@core/config/supabase";
import { Sidebar } from "@/components/Sidebar";

type Movimentacao = {
  id: number;
  created_at: string;
  tipo: "ENTRADA" | "SAIDA";
  valor: number;
  descricao: string;
};

export default function CaixaPage() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [saldoAtual, setSaldoAtual] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [novaMovimentacao, setNovaMovimentacao] = useState({ 
    tipo: "ENTRADA", 
    valor: "", 
    descricao: "" 
  });

  const fetchCaixa = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("caixa")
      .select("*")
      .order("id", { ascending: false });
    
    if (!error && data) {
      setMovimentacoes(data as Movimentacao[]);
      
      // Calcula o Saldo (Entradas - Saídas)
      const saldo = data.reduce((acc, curr) => {
        if (curr.tipo === "ENTRADA") return acc + curr.valor;
        return acc - curr.valor;
      }, 0);
      
      setSaldoAtual(saldo);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCaixa();
  }, []);

  const handleSalvarMovimentacao = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const { error } = await supabase.from("caixa").insert([
      { 
        tipo: novaMovimentacao.tipo, 
        valor: parseFloat(novaMovimentacao.valor), 
        descricao: novaMovimentacao.descricao 
      }
    ]);

    setIsSaving(false);

    if (error) {
      alert(`❌ Erro ao registrar: ${error.message}`);
    } else {
      setIsModalOpen(false);
      setNovaMovimentacao({ tipo: "ENTRADA", valor: "", descricao: "" });
      fetchCaixa();
    }
  };

  const handleDeletarMovimentacao = async (id: number) => {
    if (!confirm("Deseja excluir este registro do caixa?")) return;
    const { error } = await supabase.from("caixa").delete().eq("id", id);
    if (!error) fetchCaixa();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 ml-64 p-8 max-w-7xl mx-auto mt-8 relative">
        
        {/* CABEÇALHO E SALDO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Fluxo de Caixa</h2>
            <p className="text-sm text-gray-500">Controle as entradas e saídas da gaveta.</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-end">
              <span className="text-xs font-bold text-gray-400 uppercase">Saldo em Caixa</span>
              <span className={`text-2xl font-black ${saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldoAtual)}
              </span>
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold transition-colors shadow-sm"
            >
              + Novo Registro
            </button>
          </div>
        </div>
        
        {/* TABELA DE MOVIMENTAÇÕES */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Data</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Descrição</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Tipo</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Valor</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="p-10 text-center text-gray-400">Carregando movimentações...</td></tr>
              ) : movimentacoes.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-gray-400">Nenhum registro encontrado.</td></tr>
              ) : (
                movimentacoes.map((mov) => (
                  <tr key={mov.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-sm text-gray-600">{new Date(mov.created_at).toLocaleDateString('pt-BR')}</td>
                    <td className="p-4 text-sm font-semibold text-gray-700">{mov.descricao}</td>
                    <td className="p-4 text-sm text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${mov.tipo === 'ENTRADA' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {mov.tipo}
                      </span>
                    </td>
                    <td className={`p-4 text-sm text-right font-bold ${mov.tipo === 'ENTRADA' ? 'text-green-600' : 'text-red-600'}`}>
                      {mov.tipo === 'ENTRADA' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mov.valor)}
                    </td>
                    <td className="p-4 text-sm text-right">
                      <button 
                        onClick={() => handleDeletarMovimentacao(mov.id)}
                        className="text-red-400 hover:text-red-600 font-medium transition-colors"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MODAL DE NOVO REGISTRO */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-1">Novo Registro de Caixa</h3>
              <p className="text-sm text-gray-500 mb-6">Adicione uma entrada ou saída de dinheiro.</p>
              
              <form onSubmit={handleSalvarMovimentacao} className="space-y-4">
                <div className="flex gap-4 mb-4">
                  <label className={`flex-1 flex justify-center items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${novaMovimentacao.tipo === 'ENTRADA' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    <input type="radio" name="tipo" value="ENTRADA" className="hidden" 
                      checked={novaMovimentacao.tipo === 'ENTRADA'}
                      onChange={() => setNovaMovimentacao({...novaMovimentacao, tipo: 'ENTRADA'})} 
                    />
                    <span className="font-bold">➕ Entrada</span>
                  </label>
                  
                  <label className={`flex-1 flex justify-center items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${novaMovimentacao.tipo === 'SAIDA' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    <input type="radio" name="tipo" value="SAIDA" className="hidden" 
                      checked={novaMovimentacao.tipo === 'SAIDA'}
                      onChange={() => setNovaMovimentacao({...novaMovimentacao, tipo: 'SAIDA'})} 
                    />
                    <span className="font-bold">➖ Saída</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Descrição</label>
                  <input 
                    type="text" required
                    placeholder="Ex: Troco inicial, Pagamento Fornecedor..."
                    value={novaMovimentacao.descricao}
                    onChange={(e) => setNovaMovimentacao({...novaMovimentacao, descricao: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Valor (R$)</label>
                  <input 
                    type="number" step="0.01" min="0.01" required 
                    value={novaMovimentacao.valor}
                    onChange={(e) => setNovaMovimentacao({...novaMovimentacao, valor: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex justify-end gap-3 mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
                  <button type="submit" disabled={isSaving} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md transition-all disabled:opacity-50">
                    {isSaving ? "Salvando..." : "Confirmar"}
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