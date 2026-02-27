"use client";

import { useEffect, useState } from "react";
import { supabase } from "@core/config/supabase";
import { Sidebar } from "@/components/Sidebar";
import { 
  ClipboardCheck, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRightLeft,
  PackageSearch
} from "lucide-react";

export default function InventarioPage() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState("");
  
  // Estado para a contagem física
  const [contagens, setContagens] = useState<Record<number, string>>({});

  const fetchProdutos = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("produtos")
      .select("*")
      .order("nome", { ascending: true });
    
    if (data) setProdutos(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchProdutos(); }, []);

  const handleInputChange = (id: number, valor: string) => {
    setContagens(prev => ({ ...prev, [id]: valor }));
  };

  const handleAjustarStock = async (produto: any) => {
    const qtdFisica = parseInt(contagens[produto.id]);
    
    if (isNaN(qtdFisica)) {
      alert("Por favor, insira uma quantidade válida para a contagem.");
      return;
    }

    const diferenca = qtdFisica - produto.estoque;

    if (diferenca === 0) {
      alert("A contagem bate certo com o sistema. Nada a ajustar!");
      return;
    }

    const confirmar = confirm(
      `Divergência detectada: ${diferenca > 0 ? '+' : ''}${diferenca} unidades.\n` +
      `O stock de "${produto.nome}" será ajustado para ${qtdFisica}.\n\n` +
      `Confirmar ajuste?`
    );

    if (!confirmar) return;

    // 1. Atualizar o Stock do Produto
    const { error: updateError } = await supabase
      .from("produtos")
      .update({ estoque: qtdFisica })
      .eq("id", produto.id);

    if (updateError) {
      alert("Erro ao ajustar stock: " + updateError.message);
      return;
    }

    // 2. Se for uma perda (diferença negativa), registar na tabela de perdas
    if (diferenca < 0) {
      await supabase.from("perdas").insert([{
        produto_id: produto.id,
        quantidade: Math.abs(diferenca),
        motivo: "Divergência de Inventário (Ajuste)",
        data_perda: new Date().toISOString()
      }]);
    }

    alert("Stock ajustado com sucesso!");
    // Limpar input e recarregar
    setContagens(prev => {
      const newC = { ...prev };
      delete newC[produto.id];
      return newC;
    });
    fetchProdutos();
  };

  const filtrados = produtos.filter(p => 
    p.nome.toLowerCase().includes(termoBusca.toLowerCase())
  );

  const formatMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex">
      <Sidebar />
      
      <main className="flex-1 ml-72 p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Inventário</h2>
            <p className="text-slate-500 font-medium">Auditoria física vs Stock do sistema</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
             <div className="bg-orange-50 text-orange-500 p-2 rounded-xl">
               <PackageSearch size={24} />
             </div>
             <div>
               <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Itens em stock</p>
               <p className="text-lg font-black text-slate-800 leading-none mt-1">{produtos.length}</p>
             </div>
          </div>
        </header>

        {/* BUSCA */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Pesquisar produto para contar..." 
              className="w-full pl-14 pr-6 py-4 bg-[#F4F7FE] border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#0088CC]/20"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
            />
          </div>
        </div>

        {/* LISTA DE CONTAGEM */}
        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            <div className="p-20 text-center font-bold text-slate-300">A carregar produtos...</div>
          ) : filtrados.map(p => {
            const qtdFisica = parseInt(contagens[p.id] || "");
            const temDiferenca = !isNaN(qtdFisica) && qtdFisica !== p.estoque;

            return (
              <div key={p.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">
                
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${p.estoque <= 0 ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-[#0088CC]'}`}>
                    <ClipboardCheck size={28} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg leading-tight">{p.nome}</h4>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter mt-1">Preço: {formatMoeda(p.preco)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-10">
                  {/* Stock Sistema */}
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">No Sistema</p>
                    <p className="text-xl font-black text-slate-700">{p.estoque} <span className="text-xs font-medium">un</span></p>
                  </div>

                  <ArrowRightLeft className="text-slate-200" size={20} />

                  {/* Entrada Física */}
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Contagem Física</p>
                    <input 
                      type="number" 
                      placeholder="0"
                      className={`w-24 p-3 rounded-xl text-center font-black text-lg outline-none transition-all ${temDiferenca ? 'bg-orange-50 text-orange-600 ring-2 ring-orange-200' : 'bg-slate-50 text-slate-800'}`}
                      value={contagens[p.id] || ""}
                      onChange={(e) => handleInputChange(p.id, e.target.value)}
                    />
                  </div>
                </div>

                {/* Ação */}
                <div className="w-full md:w-auto">
                  <button 
                    onClick={() => handleAjustarStock(p)}
                    disabled={isNaN(qtdFisica)}
                    className={`w-full md:w-auto px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                      !isNaN(qtdFisica) 
                      ? 'bg-[#0088CC] text-white shadow-blue-100 hover:bg-[#0077b3]' 
                      : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {temDiferenca ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                    {temDiferenca ? "AJUSTAR STOCK" : "CONFIRMAR"}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}