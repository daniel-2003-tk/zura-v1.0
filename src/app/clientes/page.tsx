"use client";

import { useEffect, useState } from "react";
import { supabase } from "@core/config/supabase";
import { Sidebar } from "@/components/Sidebar";

type Cliente = {
  id: number;
  nome: string;
  email: string;
  telefone: string;
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Novo estado para o campo de busca
  const [termoBusca, setTermoBusca] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [novoCliente, setNovoCliente] = useState({ nome: "", email: "", telefone: "" });

  const fetchClientes = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("id", { ascending: false });
    
    if (!error) {
      setClientes(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setNovoCliente({ nome: "", email: "", telefone: "" });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cliente: Cliente) => {
    setEditingId(cliente.id);
    setNovoCliente({ 
      nome: cliente.nome, 
      email: cliente.email, 
      telefone: cliente.telefone 
    });
    setIsModalOpen(true);
  };

  const handleSalvarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const dados = { 
      nome: novoCliente.nome, 
      email: novoCliente.email, 
      telefone: novoCliente.telefone 
    };

    if (editingId) {
      const { error } = await supabase.from("clientes").update(dados).eq("id", editingId);
      if (error) alert(`❌ Erro ao atualizar: ${error.message}`);
    } else {
      const { error } = await supabase.from("clientes").insert([dados]);
      if (error) alert(`❌ Erro ao salvar: ${error.message}`);
    }

    setIsSaving(false);
    setIsModalOpen(false);
    fetchClientes();
  };

  const handleDeletarCliente = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este cliente? O histórico dele pode ser perdido.")) return;

    const { error } = await supabase
      .from("clientes")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Erro ao excluir. Verifique se o cliente possui vendas atreladas a ele.");
    } else {
      fetchClientes();
    }
  };

  // Lógica de Filtro Inteligente (busca por nome, email ou telefone)
  const clientesFiltrados = clientes.filter((c) => {
    const busca = termoBusca.toLowerCase();
    return (
      c.nome.toLowerCase().includes(busca) ||
      c.email.toLowerCase().includes(busca) ||
      c.telefone.includes(busca)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 ml-64 p-8 max-w-7xl mx-auto mt-8 relative">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Meus Clientes</h2>
            <p className="text-sm text-gray-500">Gerencie a sua base de contatos</p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            {/* CAMPO DE BUSCA */}
            <input 
              type="text" 
              placeholder="Buscar nome, email ou tel..." 
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
            />

            <button 
              onClick={handleOpenCreateModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm whitespace-nowrap"
            >
              + Novo Cliente
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Nome</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">E-mail</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Telefone</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="p-10 text-center text-gray-400">Buscando no banco de dados...</td></tr>
              ) : clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-gray-400">
                    {termoBusca ? "Nenhum cliente encontrado para essa busca." : "Nenhum cliente cadastrado."}
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-sm font-semibold text-gray-700">{cliente.nome}</td>
                    <td className="p-4 text-sm text-gray-600">{cliente.email}</td>
                    <td className="p-4 text-sm text-gray-600">{cliente.telefone}</td>
                    <td className="p-4 text-sm text-right space-x-4">
                      <button 
                        onClick={() => handleOpenEditModal(cliente)}
                        className="text-blue-500 hover:text-blue-700 font-medium transition-colors"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDeletarCliente(cliente.id)}
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

        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                {editingId ? "Editar Cliente" : "Cadastrar Novo Cliente"}
              </h3>
              <p className="text-sm text-gray-500 mb-6">Preencha as informações de contato abaixo.</p>
              
              <form onSubmit={handleSalvarCliente} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nome Completo</label>
                  <input 
                    type="text" required
                    value={novoCliente.nome}
                    onChange={(e) => setNovoCliente({...novoCliente, nome: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">E-mail</label>
                  <input 
                    type="email" required
                    value={novoCliente.email}
                    onChange={(e) => setNovoCliente({...novoCliente, email: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Telefone</label>
                  <input 
                    type="text" required
                    value={novoCliente.telefone}
                    onChange={(e) => setNovoCliente({...novoCliente, telefone: e.target.value})}
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-8">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" disabled={isSaving}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md transition-all disabled:opacity-50"
                  >
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