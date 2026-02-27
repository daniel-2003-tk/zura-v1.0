"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutGrid, ShoppingCart, Users, Package, UserCircle, 
  Wallet, BarChart3, ChevronDown, CircleDollarSign, 
  History, AlertTriangle, RotateCcw, ClipboardList 
} from "lucide-react";
import { useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>(["Estoque", "Vendas"]);

  const toggleMenu = (name: string) => {
    setOpenMenus(prev => prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]);
  };

  const MenuItem = ({ href, icon: Icon, label, isSub = false }: any) => {
    const active = pathname === href;
    return (
      <Link href={href} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
        active 
        ? "bg-[#E6F2F8] text-[#0088CC] font-bold border-l-4 border-[#0088CC]" 
        : "text-slate-500 hover:bg-slate-50"
      } ${isSub ? "ml-4" : ""}`}>
        {Icon && <Icon size={20} className={active ? "text-[#0088CC]" : "text-slate-400"} />}
        <span className="text-sm">{label}</span>
      </Link>
    );
  };

  return (
    <aside className="w-72 bg-white border-r border-slate-100 min-h-screen flex flex-col fixed left-0 top-0 z-40 shadow-sm">
      <div className="p-8 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center text-blue-500 font-black">!</div>
          <div>
            <h1 className="text-xl font-black text-slate-800 leading-none">Adega TK</h1>
            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter mt-1">Zura ERP Profissional</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <MenuItem href="/dashboard" icon={LayoutGrid} label="Dashboard" />
        <MenuItem href="/caixa" icon={CircleDollarSign} label="Caixa" />

        <div className="py-2">
          <button onClick={() => toggleMenu("Vendas")} className="w-full flex items-center justify-between px-4 py-2 text-slate-500 font-bold">
            <div className="flex items-center gap-3"><ShoppingCart size={20}/> <span className="text-sm">Vendas</span></div>
            <ChevronDown size={14} className={openMenus.includes("Vendas") ? "rotate-180" : ""} />
          </button>
          {openMenus.includes("Vendas") && (
            <div className="mt-1 space-y-1">
              <MenuItem href="/vendas" label="Frente de Caixa" isSub />
              <MenuItem href="/vendas-do-dia" label="Vendas do Dia" isSub />
            </div>
          )}
        </div>

        <div className="py-2">
          <button onClick={() => toggleMenu("Estoque")} className="w-full flex items-center justify-between px-4 py-2 text-slate-500 font-bold">
            <div className="flex items-center gap-3"><Package size={20}/> <span className="text-sm">Estoque</span></div>
            <ChevronDown size={14} className={openMenus.includes("Estoque") ? "rotate-180" : ""} />
          </button>
          {openMenus.includes("Estoque") && (
            <div className="mt-1 space-y-1 border-l border-slate-100 ml-6">
              <MenuItem href="/produtos" icon={Package} label="Produtos" />
              <MenuItem href="/perdas" icon={AlertTriangle} label="Perdas" />
              <MenuItem href="/cascos" icon={RotateCcw} label="Cascos" />
              <MenuItem href="/inventario" icon={ClipboardList} label="Inventário" />
            </div>
          )}
        </div>
        {/* Adicione RH, Financeiro e Análises seguindo o mesmo padrão */}
      </nav>
      
      <div className="p-6">
        <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold text-xs">N</div>
      </div>
    </aside>
  );
}