"use client";

import { useEffect, useState } from "react";
import { supabase } from "@core/config/supabase";
import { Sidebar } from "@/components/Sidebar";

type Fiado = {
  id: number;
  created_at: string;
  cliente_id: number;
  valor: number;
  status: "PENDENTE" | "PAGO";
  descricao: string;
  clientes: { nome: string };
};

type Cliente = {
  id: number;
  nome: string;
};

export default function FiadosPage() {
  const [fiados, setFiados] = useState<Fiado[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPendente, setTotalPendente] = useState(0);
  
  const [termoBusca, setTermoBusca] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [novoFiado, setNovoFiado] = useState({ 
    cliente_id: "", 
    valor: "", 
    descricao: "" 
  });

  const fetchData = async () => {
    setIsLoading(true);
    
    // Busca os fiados com o nome do cliente
    const { data: fiadosData } = await supabase
      .from("fiados")
      .select(`id, created_at, cliente_id, valor, status, descricao, clientes (nome)`)
      .order("id", { ascending: false });

    // Busca clientes para o select do modal
    const { data: clientesData } = await supabase.from("clientes").select("id, nome");

    if (fiadosData) {
      setFiados(fiadosData as any);
      const somaPendentes = fiadosData
        .filter(f => f.status === "PENDENTE")
        .reduce((acc, curr) => acc + curr.valor, 0);
      setTotalPendente(somaPendentes);
    }
    
    if (clientesData) setClientes(clientesData);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSalvarFiado = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const { error } = await supabase.from("fiados").insert([
      { 
        cliente_id: Number(novoFiado.cliente_id),
        valor: parseFloat(novoFiado.valor),
        descricao: novoFiado.descricao,
        status: "PENDENTE"
      }
    ]);

    setIsSaving(false);

    if (error) {
      alert(`❌ Erro ao registrar fiado: ${error.message}`);
    } else {
      setIsModalOpen(false);
      setNovoFiado({ cliente_id: "", valor: "", descricao: "" });
      fetchData();
    }
  };

  const handleQuitarFiado = async (fiado: Fiado) => {
    if (!confirm(`Confirmar o pagamento de R$ ${fiado.valor} feito por ${fiado.clientes.nome}? O valor entrará no caixa.`)) return;

    // 1. Atualiza o status para PAGO
    const { error: fiadoError } = await supabase
      .from("fiados")
      .update({ status: "PAGO" })
      .eq("id", fiado.id);

    if (fiadoError) {
      alert("Erro ao quitar fiado.");
      return;
    }

    // 2. Lança a Entrada no Caixa automaticamente
    await supabase.from("caixa").insert([
      {
        tipo: "ENTRADA",
        valor: fiado.valor,
        descricao: `Pagamento de Fiado: ${fiado.clientes.nome} (${fiado.descricao})`
      }
    ]);

    fetchData();
  };

  const fiadosFiltrados = fiados.filter((fiado) => {
    const nomeCliente = fiado.clientes?.nome?.toLowerCase() || "";
    return nomeCliente.includes(termoBusca.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-8 max-w-7xl mx-auto mt-8 relative">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Contas a Receber (Fiados)</h2>
            <p className="text-sm text-gray-500">Gerencie a caderneta dos seus clientes.</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-end">
              <span className="text-xs font-bold text-gray-400 uppercase">Total a Receber</span>
              <span className="text-2xl font-black text-orange-600">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPendente)}
              </span>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl font-bold transition-colors shadow-sm"
            >
              + Lançar Fiado
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <input 
            type="text" 
            placeholder="Buscar por nome do cliente..." 
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-96 shadow-sm"
          />
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Data</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Cliente</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Descrição</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Valor</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="p-10 text-center text-gray-400">Carregando caderneta...</td></tr>
              ) : fiadosFiltrados.length === 0 ? (
                <tr><td colSpan={6} className="p-10 text-center text-gray-400">Nenhum fiado encontrado.</td></tr>
              ) : (
                fiadosFiltrados.map((fiado) => (
                  <tr key={fiado.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-sm text-gray-600">{new Date(fiado.created_at).toLocaleDateString('pt-BR')}</td>
                    <td className="p-4 text-sm font-semibold text-gray-700">{fiado.clientes?.nome}</td>
                    <td className="p-4 text-sm text-gray-600">{fiado.descricao}</td>
                    <td className="p-4 text-sm text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${fiado.status === 'PAGO' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                        {fiado.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-bold text-right text-gray-700">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(fiado.valor)}
                    </td>
                    <td className="p-4 text-sm text-right">
                      {fiado.status === 'PENDENTE' ? (
                        <button 
                          onClick={() => handleQuitarFiado(fiado)}
                          className="text-green-600 hover:text-green-800 font-bold transition-colors bg-green-50 px-3 py-1 rounded-md"
                        >
                          💸 Quitar
                        </button>
                      ) : (
                        <span className="text-gray-400 font-medium px-3 py-1">Resolvido</span>
                      )}
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
              <h3 className="text-xl font-bold text-gray-800 mb-1">Lançar Fiado</h3>
              <p className="text-sm text-gray-500 mb-6">Adicione uma nova dívida para um cliente.</p>
              
              <form onSubmit={handleSalvarFiado} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Cliente</label>
                  <select 
                    required 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={novoFiado.cliente_id}
                    onChange={(e) => setNovoFiado({...novoFiado, cliente_id: e.target.value})}
                  >
                    <option value="">Selecione um cliente...</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Descrição do que foi levado</label>
                  <input 
                    type="text" required
                    placeholder="Ex: 2 Fardos de Cerveja, Carvão..."
                    value={novoFiado.descricao}
                    onChange={(e) => setNovoFiado({...novoFiado, descricao: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Valor Total (R$)</label>
                  <input 
                    type="number" step="0.01" min="0.01" required 
                    value={novoFiado.valor}
                    onChange={(e) => setNovoFiado({...novoFiado, valor: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex justify-end gap-3 mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
                  <button type="submit" disabled={isSaving} className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold shadow-md transition-all disabled:opacity-50">
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