"use client";

import { useEffect, useState } from "react";
import { supabase } from "@core/config/supabase";
import { Sidebar } from "@/components/Sidebar";

type Casco = {
  id: number;
  created_at: string;
  cliente_id: number;
  tipo_vasilhame: string;
  quantidade: number;
  status: "PENDENTE" | "DEVOLVIDO";
  clientes: { nome: string };
};

type Cliente = {
  id: number;
  nome: string;
};

export default function CascosPage() {
  const [cascos, setCascos] = useState<Casco[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPendentes, setTotalPendentes] = useState(0);
  
  const [termoBusca, setTermoBusca] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [novoCasco, setNovoCasco] = useState({ 
    cliente_id: "", 
    tipo_vasilhame: "Garrafa 600ml", 
    quantidade: 1 
  });

  const fetchData = async () => {
    setIsLoading(true);
    
    const { data: cascosData } = await supabase
      .from("cascos")
      .select(`id, created_at, cliente_id, tipo_vasilhame, quantidade, status, clientes (nome)`)
      .order("id", { ascending: false });

    const { data: clientesData } = await supabase.from("clientes").select("id, nome");

    if (cascosData) {
      setCascos(cascosData as any);
      
      // Calcula total de garrafas/cascos na rua
      const pendentes = cascosData
        .filter(c => c.status === "PENDENTE")
        .reduce((acc, curr) => acc + curr.quantidade, 0);
      setTotalPendentes(pendentes);
    }
    
    if (clientesData) setClientes(clientesData);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSalvarCasco = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const { error } = await supabase.from("cascos").insert([
      { 
        cliente_id: Number(novoCasco.cliente_id),
        tipo_vasilhame: novoCasco.tipo_vasilhame,
        quantidade: Number(novoCasco.quantidade),
        status: "PENDENTE"
      }
    ]);

    setIsSaving(false);

    if (error) {
      alert(`❌ Erro ao registrar empréstimo de casco: ${error.message}`);
    } else {
      setIsModalOpen(false);
      setNovoCasco({ cliente_id: "", tipo_vasilhame: "Garrafa 600ml", quantidade: 1 });
      fetchData();
    }
  };

  const handleDevolverCasco = async (casco: Casco) => {
    if (!confirm(`Confirmar a devolução de ${casco.quantidade}x ${casco.tipo_vasilhame} por ${casco.clientes.nome}?`)) return;

    const { error } = await supabase
      .from("cascos")
      .update({ status: "DEVOLVIDO" })
      .eq("id", casco.id);

    if (!error) fetchData();
  };

  const handleDeletarCasco = async (id: number) => {
    if (!confirm("Deseja apagar este registro permanentemente?")) return;
    const { error } = await supabase.from("cascos").delete().eq("id", id);
    if (!error) fetchData();
  };

  const cascosFiltrados = cascos.filter((casco) => {
    const nomeCliente = casco.clientes?.nome?.toLowerCase() || "";
    return nomeCliente.includes(termoBusca.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-8 max-w-7xl mx-auto mt-8 relative">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Controle de Cascos e Vasilhames</h2>
            <p className="text-sm text-gray-500">Acompanhe as garrafas e galões emprestados aos clientes.</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-end">
              <span className="text-xs font-bold text-gray-400 uppercase">Vasilhames na Rua</span>
              <span className="text-2xl font-black text-amber-600">
                {totalPendentes} un
              </span>
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-xl font-bold transition-colors shadow-sm"
            >
              + Emprestar Casco
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
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Tipo</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Qtd</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="p-10 text-center text-gray-400">Carregando registros...</td></tr>
              ) : cascosFiltrados.length === 0 ? (
                <tr><td colSpan={6} className="p-10 text-center text-gray-400">Nenhum casco emprestado no momento.</td></tr>
              ) : (
                cascosFiltrados.map((casco) => (
                  <tr key={casco.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-sm text-gray-600">{new Date(casco.created_at).toLocaleDateString('pt-BR')}</td>
                    <td className="p-4 text-sm font-bold text-gray-800">{casco.clientes?.nome}</td>
                    <td className="p-4 text-sm text-gray-700">{casco.tipo_vasilhame}</td>
                    <td className="p-4 text-sm text-center font-bold text-gray-800">{casco.quantidade}</td>
                    <td className="p-4 text-sm text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${casco.status === 'DEVOLVIDO' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        {casco.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-right space-x-3">
                      {casco.status === 'PENDENTE' ? (
                        <button 
                          onClick={() => handleDevolverCasco(casco)}
                          className="text-green-600 hover:text-green-800 font-bold transition-colors bg-green-50 px-3 py-1 rounded-md"
                        >
                          🔄 Receber
                        </button>
                      ) : (
                        <span className="text-gray-400 font-medium px-3 py-1">Baixado</span>
                      )}
                      <button 
                        onClick={() => handleDeletarCasco(casco.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                        title="Excluir Registro"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MODAL NOVO CASCO */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-1">Emprestar Vasilhame</h3>
              <p className="text-sm text-gray-500 mb-6">Registre garrafas ou galões levados pelo cliente.</p>
              
              <form onSubmit={handleSalvarCasco} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Cliente</label>
                  <select 
                    required 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={novoCasco.cliente_id}
                    onChange={(e) => setNovoCasco({...novoCasco, cliente_id: e.target.value})}
                  >
                    <option value="">Selecione um cliente...</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Tipo de Vasilhame</label>
                    <select 
                      required 
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      value={novoCasco.tipo_vasilhame}
                      onChange={(e) => setNovoCasco({...novoCasco, tipo_vasilhame: e.target.value})}
                    >
                      <option value="Garrafa 600ml">Garrafa 600ml</option>
                      <option value="Litrinho 300ml">Litrinho 300ml</option>
                      <option value="Litrão 1L">Litrão 1L</option>
                      <option value="Galão de Água 20L">Galão Água 20L</option>
                      <option value="Botijão de Gás">Botijão de Gás</option>
                      <option value="Engradado Plástico">Engradado Plástico</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Quantidade</label>
                    <input 
                      type="number" min="1" required 
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      value={novoCasco.quantidade}
                      onChange={(e) => setNovoCasco({...novoCasco, quantidade: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
                  <button type="submit" disabled={isSaving} className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold shadow-md transition-all disabled:opacity-50">
                    {isSaving ? "Registrando..." : "Confirmar Saída"}
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