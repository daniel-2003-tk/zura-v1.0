// @ts-nocheck
"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { Lock, Unlock, ArrowDownCircle, ArrowUpCircle, Banknote, History } from "lucide-react";

export default function CaixaOperacional() {
  const [statusCaixa, setStatusCaixa] = useState("ABERTO"); // FECHADO ou ABERTO
  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <Sidebar />

      <main className="flex-1 ml-64 p-8">
        <PageHeader 
          path={["Vendas", "Controle de Caixa"]} 
          title="Frente de Caixa" 
          subtitle="Abertura, fechamento e sangrias do turno"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUNA ESQUERDA: STATUS E AÇÕES */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* CARD STATUS DO CAIXA */}
            <div className={`p-8 rounded-[2.5rem] border shadow-sm text-center ${statusCaixa === 'ABERTO' ? 'bg-[#0088CC] text-white border-blue-500' : 'bg-slate-800 text-white border-slate-700'}`}>
              <div className="w-16 h-16 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                {statusCaixa === "ABERTO" ? <Unlock size={32} /> : <Lock size={32} />}
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Status Atual</p>
              <h2 className="text-4xl font-black tracking-tight mb-6">{statusCaixa}</h2>
              
              <button 
                onClick={() => setStatusCaixa(prev => prev === "ABERTO" ? "FECHADO" : "ABERTO")}
                className="w-full py-4 bg-white text-slate-800 rounded-2xl font-black text-sm hover:shadow-lg transition-all"
              >
                {statusCaixa === "ABERTO" ? "FECHAR TURNO" : "ABRIR CAIXA"}
              </button>
            </div>

            {/* AÇÕES OPERACIONAIS */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
              <button disabled={statusCaixa === "FECHADO"} className="w-full p-4 rounded-2xl flex items-center gap-3 bg-red-50 text-red-600 font-black hover:bg-red-100 transition-colors disabled:opacity-50">
                <ArrowDownCircle size={20} /> SANGRIA (Retirar Dinheiro)
              </button>
              <button disabled={statusCaixa === "FECHADO"} className="w-full p-4 rounded-2xl flex items-center gap-3 bg-green-50 text-green-600 font-black hover:bg-green-100 transition-colors disabled:opacity-50">
                <ArrowUpCircle size={20} /> SUPRIMENTO (Adicionar Troco)
              </button>
            </div>
          </div>

          {/* COLUNA DIREITA: RESUMO FINANCEIRO DO TURNO */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="grid grid-cols-2 gap-6">
              <ResumoCard label="Saldo Inicial (Fundo de Troco)" valor={150.00} />
              <ResumoCard label="Vendas em Dinheiro" valor={450.50} highlight />
              <ResumoCard label="Vendas em PIX" valor={890.00} />
              <ResumoCard label="Vendas em Cartão" valor={320.00} />
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total na Gaveta (Dinheiro)</p>
                <p className="text-sm text-slate-500 font-medium">Saldo Inicial + Vendas - Sangrias</p>
              </div>
              <h3 className="text-4xl font-black text-slate-800">{formatBRL(600.50)}</h3>
            </div>

            {/* HISTÓRICO DE MOVIMENTAÇÕES */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
               <h3 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-2">
                 <History size={20} className="text-[#0088CC]"/> Movimentações da Gaveta
               </h3>
               <div className="divide-y divide-slate-50 text-sm">
                 <div className="py-4 flex justify-between items-center">
                   <div><p className="font-bold text-slate-700">Abertura de Caixa</p><p className="text-[10px] text-slate-400 font-bold uppercase">Hoje, 08:00 • Operador: TI</p></div>
                   <span className="font-black text-slate-800">{formatBRL(150.00)}</span>
                 </div>
                 <div className="py-4 flex justify-between items-center">
                   <div><p className="font-bold text-red-600">Sangria (Pagamento Fornecedor)</p><p className="text-[10px] text-slate-400 font-bold uppercase">Hoje, 10:15 • Operador: TI</p></div>
                   <span className="font-black text-red-500">-{formatBRL(200.00)}</span>
                 </div>
                 <div className="py-4 flex justify-between items-center">
                   <div><p className="font-bold text-green-600">Suprimento (Troco Extra)</p><p className="text-[10px] text-slate-400 font-bold uppercase">Hoje, 14:00 • Operador: TI</p></div>
                   <span className="font-black text-green-500">+{formatBRL(100.00)}</span>
                 </div>
               </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

function ResumoCard({ label, valor, highlight = false }: any) {
  return (
    <div className={`p-6 rounded-3xl border shadow-sm ${highlight ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800'}`}>
      <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${highlight ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
      <h4 className="text-2xl font-black">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)}</h4>
    </div>
  );
}