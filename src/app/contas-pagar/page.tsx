"use client";

import { useEffect, useState } from "react";
import { supabase } from "@core/config/supabase";
import { Sidebar } from "@/components/Sidebar";

type ContaPagar = {
  id: number;
  created_at: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: "PENDENTE" | "PAGO";
};

export default function ContasPagarPage() {
  const [contas, setContas] = useState<ContaPagar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPendente, setTotalPendente] = useState(0);
  
  const [termoBusca, setTermoBusca] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [novaConta, setNovaConta] = useState({ 
    descricao: "", 
    valor: "", 
    vencimento: "" 
  });

  const fetchData = async () => {
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from("contas_pagar")
      .select("*")
      .order("vencimento", { ascending: true }); // Ordena pelas contas que vencem primeiro

    if (!error && data) {
      setContas(data as ContaPagar[]);
      
      const somaPendentes = data
        .filter(c => c.status === "PENDENTE")
        .reduce((acc, curr) => acc + curr.valor, 0);
      setTotalPendente(somaPendentes);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSalvarConta = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const { error } = await supabase.from("contas_pagar").insert([
      { 
        descricao: novaConta.descricao,
        valor: parseFloat(novaConta.valor),
        vencimento: novaConta.vencimento,
        status: "PENDENTE"
      }
    ]);

    setIsSaving(false);

    if (error) {
      alert(`❌ Erro ao registrar conta: ${error.message}`);
    } else {
      setIsModalOpen(false);
      setNovaConta({ descricao: "", valor: "", vencimento: "" });
      fetchData();
    }
  };

  const handlePagarConta = async (conta: ContaPagar) => {
    if (!confirm(`Confirmar o pagamento de ${conta.descricao} no valor de R$ ${conta.valor}? O dinheiro sairá do Caixa.`)) return;

    // 1. Atualiza o status para PAGO
    const { error: contaError } = await supabase
      .from("contas_pagar")
      .update({ status: "PAGO" })
      .eq("id", conta.id);

    if (contaError) {
      alert("Erro ao baixar conta.");
      return;
    }

    // 2. Lança a Saída no Caixa automaticamente
    await supabase.from("caixa").insert([
      {
        tipo: "SAIDA",
        valor: conta.valor,
        descricao: `Pagamento de Conta: ${conta.descricao}`
      }
    ]);

    fetchData();
  };

  const handleDeletarConta = async (id: number) => {
    if (!confirm("Deseja apagar este registro do sistema? (Isso não altera o fluxo de caixa)")) return;
    const { error } = await supabase.from("contas_pagar").delete().eq("id", id);
    if (!error) fetchData();
  };

  // Lógica para verificar se a conta está atrasada
  const isAtrasada = (vencimento: string, status: string) => {
    if (status === "PAGO") return false;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataVencimento = new Date(vencimento + 'T00:00:00'); // Fuso local
    return dataVencimento < hoje;
  };

  const contasFiltradas = contas.filter((conta) => 
    conta.descricao.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-8 max-w-7xl mx-auto mt-8 relative">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Contas a Pagar</h2>
            <p className="text-sm text-gray-500">Controle boletos, fornecedores e despesas fixas.</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-end">
              <span className="text-xs font-bold text-gray-400 uppercase">Total Pendente</span>
              <span className="text-2xl font-black text-red-600">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPendente)}
              </span>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-bold transition-colors shadow-sm"
            >
              + Lançar Despesa
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <input 
            type="text" 
            placeholder="Buscar por descrição..." 
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-96 shadow-sm"
          />
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Vencimento</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Descrição</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Valor</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="p-10 text-center text-gray-400">Carregando boletos...</td></tr>
              ) : contasFiltradas.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-gray-400">Nenhuma conta encontrada.</td></tr>
              ) : (
                contasFiltradas.map((conta) => (
                  <tr key={conta.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-sm text-gray-600">
                      <span className={isAtrasada(conta.vencimento, conta.status) ? "text-red-600 font-bold" : ""}>
                        {new Date(conta.vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-semibold text-gray-700">{conta.descricao}</td>
                    <td className="p-4 text-sm text-center">
                      {conta.status === 'PAGO' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border bg-green-50 text-green-700 border-green-200">PAGO</span>
                      ) : isAtrasada(conta.vencimento, conta.status) ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border bg-red-50 text-red-700 border-red-200">ATRASADA</span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border bg-yellow-50 text-yellow-700 border-yellow-200">PENDENTE</span>
                      )}
                    </td>
                    <td className="p-4 text-sm font-bold text-right text-gray-700">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(conta.valor)}
                    </td>
                    <td className="p-4 text-sm text-right space-x-3">
                      {conta.status === 'PENDENTE' ? (
                        <button 
                          onClick={() => handlePagarConta(conta)}
                          className="text-green-600 hover:text-green-800 font-bold transition-colors bg-green-50 px-3 py-1 rounded-md border border-green-200"
                        >
                          💸 Pagar
                        </button>
                      ) : (
                        <span className="text-gray-400 font-medium px-3 py-1">Concluído</span>
                      )}
                      <button 
                        onClick={() => handleDeletarConta(conta.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Apagar Registro"
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

        {/* MODAL NOVA CONTA */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-1">Lançar Despesa</h3>
              <p className="text-sm text-gray-500 mb-6">Cadastre boletos e contas para não esquecer de pagar.</p>
              
              <form onSubmit={handleSalvarConta} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Descrição</label>
                  <input 
                    type="text" required
                    placeholder="Ex: Boleto Ambev, Energia..."
                    value={novaConta.descricao}
                    onChange={(e) => setNovaConta({...novaConta, descricao: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Vencimento</label>
                    <input 
                      type="date" required 
                      value={novaConta.vencimento}
                      onChange={(e) => setNovaConta({...novaConta, vencimento: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Valor Total (R$)</label>
                    <input 
                      type="number" step="0.01" min="0.01" required 
                      value={novaConta.valor}
                      onChange={(e) => setNovaConta({...novaConta, valor: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
                  <button type="submit" disabled={isSaving} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-md transition-all disabled:opacity-50">
                    {isSaving ? "Salvando..." : "Salvar Conta"}
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