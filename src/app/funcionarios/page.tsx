"use client";

import { useEffect, useState } from "react";
import { supabase } from "@core/config/supabase";
import { Sidebar } from "@/components/Sidebar";

type Funcionario = {
  id: number;
  nome: string;
  cargo: string;
  telefone: string;
  salario: number;
  status: "ATIVO" | "INATIVO";
};

export default function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [folhaPagamento, setFolhaPagamento] = useState(0);
  const [termoBusca, setTermoBusca] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [novoFuncionario, setNovoFuncionario] = useState({ 
    nome: "", 
    cargo: "", 
    telefone: "",
    salario: "" 
  });

  const fetchFuncionarios = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("funcionarios")
      .select("*")
      .order("status", { ascending: true }) // ATIVOS primeiro
      .order("nome", { ascending: true });
    
    if (!error && data) {
      setFuncionarios(data as Funcionario[]);
      
      // Calcula o total da folha salarial dos ATIVOS
      const totalFolha = data
        .filter(f => f.status === "ATIVO")
        .reduce((acc, curr) => acc + curr.salario, 0);
      setFolhaPagamento(totalFolha);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchFuncionarios();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setNovoFuncionario({ nome: "", cargo: "", telefone: "", salario: "" });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (func: Funcionario) => {
    setEditingId(func.id);
    setNovoFuncionario({ 
      nome: func.nome, 
      cargo: func.cargo, 
      telefone: func.telefone,
      salario: func.salario.toString()
    });
    setIsModalOpen(true);
  };

  const handleSalvarFuncionario = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const dados = { 
      nome: novoFuncionario.nome, 
      cargo: novoFuncionario.cargo, 
      telefone: novoFuncionario.telefone,
      salario: parseFloat(novoFuncionario.salario),
    };

    if (editingId) {
      // MODO EDIÇÃO
      const { error } = await supabase.from("funcionarios").update(dados).eq("id", editingId);
      if (error) alert(`❌ Erro ao atualizar: ${error.message}`);
    } else {
      // MODO CRIAÇÃO
      const { error } = await supabase.from("funcionarios").insert([{ ...dados, status: "ATIVO" }]);
      if (error) alert(`❌ Erro ao salvar: ${error.message}`);
    }

    setIsSaving(false);
    setIsModalOpen(false);
    fetchFuncionarios();
  };

  const handleAlternarStatus = async (id: number, statusAtual: string) => {
    const novoStatus = statusAtual === "ATIVO" ? "INATIVO" : "ATIVO";
    const msg = novoStatus === "INATIVO" 
      ? "Deseja desativar (demitir) este funcionário?" 
      : "Deseja reativar este funcionário?";
      
    if (!confirm(msg)) return;

    const { error } = await supabase.from("funcionarios").update({ status: novoStatus }).eq("id", id);
    if (!error) fetchFuncionarios();
  };

  const funcionariosFiltrados = funcionarios.filter((f) => 
    f.nome.toLowerCase().includes(termoBusca.toLowerCase()) || 
    f.cargo.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 ml-64 p-8 max-w-7xl mx-auto mt-8 relative">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Gestão de Equipe (RH)</h2>
            <p className="text-sm text-gray-500">Cadastre funcionários e controle a folha salarial.</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-end">
              <span className="text-xs font-bold text-gray-400 uppercase">Custo Fixo (Folha)</span>
              <span className="text-2xl font-black text-blue-600">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(folhaPagamento)}
              </span>
            </div>

            <button 
              onClick={handleOpenCreateModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold transition-colors shadow-sm"
            >
              + Novo Funcionário
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <input 
            type="text" 
            placeholder="Buscar por nome ou cargo..." 
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-96 shadow-sm"
          />
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Nome</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Cargo</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Telefone</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Salário Base</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="p-10 text-center text-gray-400">Carregando equipe...</td></tr>
              ) : funcionariosFiltrados.length === 0 ? (
                <tr><td colSpan={6} className="p-10 text-center text-gray-400">Nenhum funcionário encontrado.</td></tr>
              ) : (
                funcionariosFiltrados.map((func) => (
                  <tr key={func.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${func.status === 'INATIVO' ? 'opacity-50' : ''}`}>
                    <td className="p-4 text-sm font-bold text-gray-800">{func.nome}</td>
                    <td className="p-4 text-sm text-gray-600">{func.cargo}</td>
                    <td className="p-4 text-sm text-gray-600">{func.telefone}</td>
                    <td className="p-4 text-sm font-medium text-gray-700">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(func.salario)}
                    </td>
                    <td className="p-4 text-sm text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${func.status === 'ATIVO' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {func.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-right space-x-4">
                      <button 
                        onClick={() => handleOpenEditModal(func)}
                        className="text-blue-500 hover:text-blue-700 font-medium transition-colors"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleAlternarStatus(func.id, func.status)}
                        className={`${func.status === 'ATIVO' ? 'text-red-400 hover:text-red-600' : 'text-green-500 hover:text-green-700'} font-medium transition-colors`}
                      >
                        {func.status === 'ATIVO' ? 'Desativar' : 'Reativar'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MODAL FUNCIONÁRIO */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                {editingId ? "Editar Funcionário" : "Novo Funcionário"}
              </h3>
              <p className="text-sm text-gray-500 mb-6">Preencha os dados da sua equipe.</p>
              
              <form onSubmit={handleSalvarFuncionario} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nome Completo</label>
                  <input 
                    type="text" required
                    value={novoFuncionario.nome}
                    onChange={(e) => setNovoFuncionario({...novoFuncionario, nome: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Cargo</label>
                    <input 
                      type="text" required placeholder="Ex: Motoboy"
                      value={novoFuncionario.cargo}
                      onChange={(e) => setNovoFuncionario({...novoFuncionario, cargo: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Telefone</label>
                    <input 
                      type="text" required placeholder="(11) 9999-9999"
                      value={novoFuncionario.telefone}
                      onChange={(e) => setNovoFuncionario({...novoFuncionario, telefone: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Salário Base Mensal (R$)</label>
                  <input 
                    type="number" step="0.01" min="0" required 
                    value={novoFuncionario.salario}
                    onChange={(e) => setNovoFuncionario({...novoFuncionario, salario: e.target.value})}
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