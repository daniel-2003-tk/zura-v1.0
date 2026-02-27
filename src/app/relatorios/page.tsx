"use client";

import { useEffect, useState } from "react";
import { supabase } from "@core/config/supabase";
import { Sidebar } from "@/components/Sidebar";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie 
} from "recharts";
import { 
  Trophy, 
  TrendingUp, 
  Calendar, 
  ArrowUpRight, 
  Download,
  Filter
} from "lucide-react";

export default function RelatoriosPage() {
  const [dataVendas, setDataVendas] = useState<any[]>([]);
  const [topProdutos, setTopProdutos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRelatorios = async () => {
    setIsLoading(true);
    
    // 1. Vendas por dia (últimos 7 dias)
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

    const { data: vendasRaw } = await supabase
      .from("vendas")
      .select("valor_total, created_at")
      .gte("created_at", seteDiasAtras.toISOString());

    if (vendasRaw) {
      // Agrupar por dia da semana
      const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      const agrupado = vendasRaw.reduce((acc: any, curr: any) => {
        const dia = diasSemana[new Date(curr.created_at).getDay()];
        acc[dia] = (acc[dia] || 0) + curr.valor_total;
        return acc;
      }, {});

      const chartData = diasSemana.map(d => ({ name: d, total: agrupado[d] || 0 }));
      setDataVendas(chartData);
    }

    // 2. Top 5 Produtos mais vendidos
    const { data: topP } = await supabase
      .from("vendas")
      .select("quantidade, produtos(nome)")
      .limit(100);

    if (topP) {
      const pAgrupados = topP.reduce((acc: any, curr: any) => {
        const nome = curr.produtos?.nome || "Desconhecido";
        acc[nome] = (acc[nome] || 0) + curr.quantidade;
        return acc;
      }, {});

      const finalProdutos = Object.keys(pAgrupados)
        .map(nome => ({ name: nome, value: pAgrupados[nome] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
      
      setTopProdutos(finalProdutos);
    }

    setIsLoading(false);
  };

  useEffect(() => { fetchRelatorios(); }, []);

  const COLORS = ["#0088CC", "#00A3FF", "#66C2FF", "#99D6FF", "#CCEBFf"];

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex">
      <Sidebar />
      
      <main className="flex-1 ml-72 p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Relatórios Avançados</h2>
            <p className="text-slate-500 font-medium">Análise de desempenho e inteligência de negócio</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white text-slate-600 p-4 rounded-2xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-all">
              <Filter size={20} />
            </button>
            <button className="bg-[#0088CC] text-white px-8 py-4 rounded-[1.5rem] font-black shadow-lg shadow-blue-100 flex items-center gap-3 hover:bg-[#0077b3] transition-all">
              <Download size={20} />
              EXPORTAR PDF
            </button>
          </div>
        </header>

        {/* CARDS DE INSIGHTS RÁPIDOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <InsightCard 
            title="Melhor Dia" 
            value="Sexta-feira" 
            sub="+24% em relação à média" 
            icon={Calendar} 
            color="text-blue-500" 
          />
          <InsightCard 
            title="Ticket Médio" 
            value="R$ 42,50" 
            sub="Valor médio por venda" 
            icon={ArrowUpRight} 
            color="text-green-500" 
          />
          <InsightCard 
            title="Produto Estrela" 
            value={topProdutos[0]?.name || "Carregando..."} 
            sub="Mais vendido da semana" 
            icon={Trophy} 
            color="text-orange-500" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* GRÁFICO DE BARRAS: VENDAS POR DIA */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-black text-slate-800">Faturamento Semanal</h3>
              <TrendingUp className="text-blue-500" size={20} />
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataVendas}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                  <YAxis hide />
                  <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="total" fill="#0088CC" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GRÁFICO DE PIZZA: TOP PRODUTOS */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50">
            <h3 className="text-lg font-black text-slate-800 mb-8">Mix de Produtos (Top 5)</h3>
            <div className="flex items-center justify-between">
              <div className="h-64 w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topProdutos}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {topProdutos.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-4">
                {topProdutos.map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i]}}></div>
                      <span className="text-xs font-bold text-slate-600 truncate max-w-[100px]">{p.name}</span>
                    </div>
                    <span className="text-xs font-black text-slate-800">{p.value} un</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

function InsightCard({ title, value, sub, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50 flex items-center gap-6">
      <div className={`p-4 rounded-2xl bg-slate-50 ${color}`}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h4 className="text-xl font-black text-slate-800 tracking-tight">{value}</h4>
        <p className="text-[10px] font-bold text-slate-400 mt-1">{sub}</p>
      </div>
    </div>
  );
}