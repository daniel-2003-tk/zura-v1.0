"use client";

import { useEffect, useState } from "react";
import { supabase } from "@core/config/supabase";
import { Sidebar } from "@/components/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { 
  Search, ShoppingCart, Plus, Minus, Trash2, 
  Banknote, QrCode, CreditCard, ArrowRight, CheckCircle2
} from "lucide-react";

export default function VendasPage() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [carrinho, setCarrinho] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Checkout states
  const [metodo, setMetodo] = useState("PIX");
  const [valorRecebido, setValorRecebido] = useState("");
  const [isFinalizando, setIsFinalizando] = useState(false);

  useEffect(() => {
    const fetchProdutos = async () => {
      const { data } = await supabase.from("produtos").select("*").order("nome");
      if (data) setProdutos(data);
      setLoading(false);
    };
    fetchProdutos();
  }, []);

  const formatBRL = (v: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v) || 0);

  // --- LÓGICA DO CARRINHO ---
  const adicionarProduto = (produto: any) => {
    setCarrinho(prev => {
      const existe = prev.find(p => p.id === produto.id);
      if (existe) {
        return prev.map(p => p.id === produto.id ? { ...p, qtd: p.qtd + 1 } : p);
      }
      return [...prev, { ...produto, qtd: 1 }];
    });
  };

  const alterarQtd = (id: number, delta: number) => {
    setCarrinho(prev => prev.map(p => {
      if (p.id === id) {
        const novaQtd = p.qtd + delta;
        return novaQtd > 0 ? { ...p, qtd: novaQtd } : p;
      }
      return p;
    }));
  };

  const removerProduto = (id: number) => {
    setCarrinho(prev => prev.filter(p => p.id !== id));
  };

  // --- CÁLCULOS BLINDADOS ---
  const totalCarrinho = carrinho.reduce((acc, curr) => acc + (Number(curr.preco_un) * curr.qtd), 0);
  const troco = metodo === "DINHEIRO" && valorRecebido ? (Number(valorRecebido) - totalCarrinho) : 0;

  // --- FINALIZAR VENDA ---
  const finalizarVenda = async () => {
    if (carrinho.length === 0) return alert("Adicione produtos ao carrinho.");
    if (metodo === "DINHEIRO" && troco < 0) return alert("Valor recebido é menor que o total.");
    
    setIsFinalizando(true);

    try {
      // 1. Criar a venda principal
      const { data: vendaData, error: vendaError } = await supabase
        .from("vendas")
        .insert([{ 
          valor_total: totalCarrinho, 
          metodo_pagamento: metodo,
          status: "CONCLUIDA"
        }])
        .select()
        .single();

      if (vendaError) throw vendaError;

      // 2. Abater o estoque de cada produto (simplificado: abate unidades soltas)
      const promessasEstoque = carrinho.map(item => {
        const novoEstoqueSolto = (Number(item.unidades_soltas) || 0) - item.qtd;
        return supabase.from("produtos").update({ unidades_soltas: novoEstoqueSolto }).eq("id", item.id);
      });

      await Promise.all(promessasEstoque);

      alert("Venda finalizada com sucesso!");
      setCarrinho([]);
      setValorRecebido("");
      
      // Atualiza a lista para refletir o novo estoque
      const { data } = await supabase.from("produtos").select("*").order("nome");
      if (data) setProdutos(data);

    } catch (error) {
      alert("Erro ao finalizar venda. Tente novamente.");
    } finally {
      setIsFinalizando(false);
    }
  };

  const produtosFiltrados = produtos.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 flex flex-col h-screen overflow-hidden">
        
        <PageHeader 
          path={["Vendas", "PDV"]} 
          title="Frente de Caixa" 
          subtitle="Ponto de venda ágil"
        />

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
          
          {/* LADO ESQUERDO: LISTA DE PRODUTOS */}
          <div className="lg:col-span-2 flex flex-col min-h-0 bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <div className="relative mb-6 shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar produto por nome ou código..." 
                className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-slate-100 rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-100"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {loading ? (
                <p className="text-center text-slate-400 py-10">Carregando prateleira...</p>
              ) : produtosFiltrados.map((p) => {
                const totalUn = (Number(p.fardos || 0) * Number(p.un_por_fardo || 0)) + Number(p.unidades_soltas || 0);
                const semEstoque = totalUn <= 0;

                return (
                  <div key={p.id} 
                    onClick={() => !semEstoque && adicionarProduto(p)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      semEstoque 
                      ? "bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed" 
                      : "bg-white border-slate-100 hover:border-blue-200 hover:shadow-sm cursor-pointer"
                    }`}
                  >
                    <div>
                      <h4 className="font-black text-slate-800 capitalize leading-tight">
                        {p.nome} <span className="text-xs text-slate-400 font-normal ml-1">| {p.marca || "Ambev"}</span>
                      </h4>
                      <p className={`text-[10px] font-bold mt-1 uppercase ${semEstoque ? 'text-red-400' : 'text-slate-400'}`}>
                        {semEstoque ? "Sem Estoque" : `${totalUn} unidades disponíveis`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[#0088CC] text-lg">{formatBRL(p.preco_un)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LADO DIREITO: CUPOM / CARRINHO */}
          <div className="lg:col-span-1 flex flex-col min-h-0 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            
            {/* Header do Carrinho */}
            <div className="p-6 border-b border-slate-50 bg-slate-900 text-white flex items-center gap-3 shrink-0">
              <ShoppingCart size={20} className="text-blue-400" />
              <h3 className="font-black text-lg">Cupom Atual</h3>
            </div>

            {/* Itens do Carrinho */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {carrinho.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                  <ShoppingCart size={48} strokeWidth={1} />
                  <p className="text-sm font-bold">Carrinho vazio</p>
                </div>
              ) : carrinho.map((item) => (
                <div key={item.id} className="flex flex-col gap-2 pb-4 border-b border-slate-50">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-black text-slate-800 capitalize leading-tight">{item.nome}</span>
                    <span className="text-sm font-black text-slate-800">{formatBRL(item.preco_un * item.qtd)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-medium">{formatBRL(item.preco_un)} / un</span>
                    <div className="flex items-center gap-3 bg-[#F8FAFC] rounded-lg p-1">
                      <button onClick={() => alterarQtd(item.id, -1)} className="p-1 text-slate-400 hover:text-red-500 rounded-md bg-white shadow-sm"><Minus size={14}/></button>
                      <span className="text-xs font-black w-4 text-center">{item.qtd}</span>
                      <button onClick={() => alterarQtd(item.id, 1)} className="p-1 text-slate-400 hover:text-blue-500 rounded-md bg-white shadow-sm"><Plus size={14}/></button>
                      <button onClick={() => removerProduto(item.id)} className="p-1 ml-2 text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Painel de Pagamento e Finalização */}
            <div className="p-6 bg-[#F8FAFC] shrink-0 border-t border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total</span>
                <span className="text-3xl font-black text-[#0088CC]">{formatBRL(totalCarrinho)}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <PaymentBtn icon={QrCode} label="PIX" active={metodo === "PIX"} onClick={() => setMetodo("PIX")} />
                <PaymentBtn icon={Banknote} label="Dinheiro" active={metodo === "DINHEIRO"} onClick={() => setMetodo("DINHEIRO")} />
                <PaymentBtn icon={CreditCard} label="Cartão" active={metodo === "CARTAO"} onClick={() => setMetodo("CARTAO")} />
              </div>

              {metodo === "DINHEIRO" && (
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Recebido</label>
                    <input 
                      type="number" 
                      placeholder="R$ 0,00" 
                      className="w-full p-3 rounded-xl outline-none font-bold text-sm border border-slate-200 focus:border-blue-400"
                      value={valorRecebido}
                      onChange={(e) => setValorRecebido(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Troco</label>
                    <div className={`p-3 rounded-xl font-black text-sm border border-transparent ${troco < 0 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                      {troco < 0 ? "Falta " + formatBRL(Math.abs(troco)) : formatBRL(troco)}
                    </div>
                  </div>
                </div>
              )}

              <button 
                onClick={finalizarVenda}
                disabled={isFinalizando || carrinho.length === 0}
                className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                  carrinho.length === 0 ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed' : 'bg-[#0088CC] text-white hover:bg-[#0077b3] shadow-blue-100'
                }`}
              >
                {isFinalizando ? "PROCESSANDO..." : "FINALIZAR VENDA"} <ArrowRight size={18} />
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

// Botão de Seleção de Pagamento
function PaymentBtn({ icon: Icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`py-3 flex flex-col items-center justify-center gap-1 rounded-xl border transition-all ${
        active 
        ? "bg-slate-900 border-slate-900 text-white shadow-md" 
        : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
      }`}
    >
      <Icon size={18} />
      <span className="text-[10px] font-bold uppercase">{label}</span>
    </button>
  );
}