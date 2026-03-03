// @ts-nocheck
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutGrid, ShoppingCart, Users, Package, Wallet, 
  BarChart3, ChevronDown, CircleDollarSign, LogOut 
} from "lucide-react";
import { useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState<string[]>(["Estoque", "Vendas", "Financeiro"]);

  const toggle = (n: string) => setOpen(prev => prev.includes(n) ? prev.filter(i => i !== n) : [...prev, n]);

  const NavItem = ({ href, label, icon: Icon, sub = false }: any) => (
    <Link href={href} className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all ${
      pathname === href ? "bg-[#E6F2F8] text-[#0088CC] font-bold" : "text-slate-500 hover:bg-slate-50"
    } ${sub ? "ml-4" : ""}`}>
      {Icon && <Icon size={18} />}
      <span>{label}</span>
    </Link>
  );

  return (
    <aside className="w-64 bg-white border-r border-slate-100 min-h-screen flex flex-col fixed left-0 top-0 z-40">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 border-2 border-[#0088CC] rounded-full flex items-center justify-center text-[#0088CC] font-black">!</div>
        <div>
          <h1 className="text-lg font-black text-slate-800 leading-none">Adega TK</h1>
          <p className="text-[9px] text-slate-400 uppercase font-bold mt-1">Zura ERP Profissional</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {/* MENUS PRINCIPAIS */}
        <NavItem href="/dashboard" icon={LayoutGrid} label="Dashboard" />
        <NavItem href="/analises" icon={BarChart3} label="Análises e DRE" /> {/* <--- O BOTÃO NOVO AQUI! */}
        <NavItem href="/caixa" icon={CircleDollarSign} label="Caixa (Operação)" />

        {/* GRUPOS */}
        <Group label="Vendas" icon={ShoppingCart} active={open.includes("Vendas")} onToggle={() => toggle("Vendas")}>
          <NavItem href="/vendas" label="Frente de Caixa" sub />
          <NavItem href="/vendas-do-dia" label="Vendas do Dia" sub />
        </Group>

        <Group label="Gestão" icon={Users} active={open.includes("Gestão")} onToggle={() => toggle("Gestão")}>
          <NavItem href="/clientes" label="Clientes" sub />
        </Group>

        <Group label="Estoque" icon={Package} active={open.includes("Estoque")} onToggle={() => toggle("Estoque")}>
          <NavItem href="/produtos" label="Produtos" sub />
          <NavItem href="/perdas" label="Perdas" sub />
          <NavItem href="/cascos" label="Cascos" sub />
          <NavItem href="/inventario" label="Inventário" sub />
        </Group>

        <Group label="Financeiro" icon={Wallet} active={open.includes("Financeiro")} onToggle={() => toggle("Financeiro")}>
          <NavItem href="/contas-pagar" label="Contas a Pagar" sub />
          <NavItem href="/taxas" label="Taxas de Cartão" sub />
        </Group>
      </nav>
      
      {/* BOTÃO SAIR */}
      <div className="p-4 border-t border-slate-100">
        <button className="flex items-center gap-3 px-4 py-2 w-full rounded-xl text-sm font-bold text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
          <LogOut size={18} /> Sair do Sistema
        </button>
      </div>
    </aside>
  );
}

function Group({ label, icon: Icon, children, active, onToggle }: any) {
  return (
    <div>
      <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-xl">
        <div className="flex items-center gap-3"><Icon size={18}/> <span className="text-sm">{label}</span></div>
        <ChevronDown size={14} className={`transition-transform ${active ? 'rotate-180' : ''}`} />
      </button>
      {active && <div className="mt-1 space-y-1 border-l border-slate-100 ml-6">{children}</div>}
    </div>
  );
}