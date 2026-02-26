"use client";

import { useEffect, useState } from "react";
import { supabase } from "@core/config/supabase";
import { Sidebar } from "@/components/Sidebar";

type Entrega = {
  id: number;
  created_at: string;
  cliente_id: number;
  descricao: string;
  endereco: string;
  status: "PENDENTE" | "EM_ROTA" | "ENTREGUE";
  taxa: number;
  clientes: { nome: string };
};

type Cliente = {
  id: number;
  nome: string;
};

export default function EntregasPage() {
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [novaEntrega, setNovaEntrega] = useState({ 
    cliente_id: "", 
    descricao: "", 
    endereco: "",
    taxa: "0" 
  });

  const fetchData = async () => {
    setIsLoading(true);
    
    const { data: entregasData } = await supabase
      .from("entregas")
      .select(`id, created_at, cliente_id, descricao, endereco, status, taxa, clientes (nome)`)
      .order("id", { ascending: false });

    const { data: clientesData } = await supabase.from("clientes").select("id, nome");

    if (entregasData) setEntregas(entregasData as any);
    if (clientesData) setClientes(clientesData);
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSalvarEntrega = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const { error } = await supabase.from("entregas").insert([
      { 
        cliente_id: Number(novaEntrega.cliente_id),
        descricao: novaEntrega.descricao,
        endereco: novaEntrega.endereco,
        taxa: parseFloat(novaEntrega.taxa),
        status: "PENDENTE"
      }
    ]);

    setIsSaving(false);

    if (error) {
      alert(`❌ Erro ao registrar entrega: ${error.message}`);
    } else {
      setIsModalOpen(false);
      setNovaEntrega({ cliente_id: "", descricao: "", endereco: "", taxa: "0" });
      fetchData();
    }
  };

  const handleAtualizarStatus = async (id: number, novoStatus: string) => {
    const { error } = await supabase
      .from("entregas")
      .update({ status: novoStatus })
      .eq("id", id);
      
    if (!error) fetchData();
  };

  const handleDeletarEntrega = async (id: number) => {
    if (!confirm("Deseja excluir este registro de entrega?")) return;
    const { error } = await supabase.from("entregas").delete().eq("id", id);
    if (!error) fetchData();
  };

  const getStatusStyle = (status: string) => {
    if (status === 'PENDENTE') return 'bg-red-50 text-red-700 border-red-200';
    if (status === 'EM_ROTA') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-green-50 text-green-700 border-green-200';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'PENDENTE') return 'Pendente';
    if (status === 'EM_ROTA') return 'Em Rota';
    return 'Entregue';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-8 max-w-7xl mx-auto mt-8 relative">
        
        <div className="flex justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Painel de Entregas</h2>
            <p className="text-sm text-gray-500">Acompanhe a logística dos seus pedidos.</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold transition-colors shadow-sm"
          >
            + Nova Entrega
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Cliente</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-1/4">Pedido</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-1/4">Endereço</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Gestão de Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="p-10 text-center text-gray-400">Carregando entregas...</td></tr>
              ) : entregas.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-gray-400">Nenhuma entrega registrada.</td></tr>
              ) : (
                entregas.map((entrega) => (
                  <tr key={entrega.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-sm font-bold text-gray-800">{entrega.clientes?.nome}</td>
                    <td className="p-4 text-sm text-gray-600">{entrega.descricao}</td>
                    <td className="p-4 text-sm text-gray-600">{entrega.endereco}</td>
                    
                    <td className="p-4 text-sm text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(entrega.status)}`}>
                        {getStatusLabel(entrega.status)}
                      </span>
                    </td>
                    
                    <td className="p-4 text-sm text-center space-x-2">
                      {entrega.status === 'PENDENTE' && (
                        <button onClick={() => handleAtualizarStatus(entrega.id, 'EM_ROTA')} className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-md font-bold text-xs transition-colors">
                          🛵 Enviar
                        </button>
                      )}
                      
                      {entrega.status === 'EM_ROTA' && (
                        <button onClick={() => handleAtualizarStatus(entrega.id, 'ENTREGUE')} className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-md font-bold text-xs transition-colors">
                          ✅ Finalizar
                        </button>
                      )}

                      <button onClick={() => handleDeletarEntrega(entrega.id)} className="text-gray-400 hover:text-red-500 font-medium px-2 transition-colors">
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MODAL NOVA ENTREGA */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-1">Agendar Entrega</h3>
              <p className="text-sm text-gray-500 mb-6">Preencha as informações para o motoboy.</p>
              
              <form onSubmit={handleSalvarEntrega} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Cliente</label>
                  <select 
                    required 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={novaEntrega.cliente_id}
                    onChange={(e) => setNovaEntrega({...novaEntrega, cliente_id: e.target.value})}
                  >
                    <option value="">Selecione um cliente...</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">O que vai ser entregue?</label>
                  <input 
                    type="text" required
                    placeholder="Ex: 5 caixas de cerveja, 1 pacote de gelo..."
                    value={novaEntrega.descricao}
                    onChange={(e) => setNovaEntrega({...novaEntrega, descricao: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Endereço Completo</label>
                  <input 
                    type="text" required
                    placeholder="Rua, Número, Bairro, Referência..."
                    value={novaEntrega.endereco}
                    onChange={(e) => setNovaEntrega({...novaEntrega, endereco: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Taxa de Entrega (R$)</label>
                  <input 
                    type="number" step="0.01" min="0" required 
                    value={novaEntrega.taxa}
                    onChange={(e) => setNovaEntrega({...novaEntrega, taxa: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex justify-end gap-3 mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
                  <button type="submit" disabled={isSaving} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-md transition-all disabled:opacity-50">
                    {isSaving ? "Salvando..." : "Registrar"}
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