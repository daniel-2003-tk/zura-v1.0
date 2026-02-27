"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  UserCircle, 
  Wallet, 
  BarChart3, 
  ChevronDown,
  CircleDollarSign
} from "lucide-react";
import { useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>(["Vendas", "Estoque"]);

  const toggleMenu = (name: string) => {
    setOpenMenus(prev => prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]);
  };

  const MenuItem = ({ href, icon: Icon, label, active: propActive }: any) => {
    const active = propActive || pathname === href;
    return (
      <Link href={href} className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
        active 
        ? "bg-[#E6F2F8] text-[#0088CC] font-bold border-l-4 border-[#0088CC]" 
        : "text-slate-500 hover:bg-slate-50"
      }`}>
        <div className="flex items-center gap-3">
          <Icon size={22} className={active ? "text-[#0088CC]" : "text-slate-400"} />
          <span className="text-sm">{label}</span>
        </div>
      </Link>
    );
  };

  const NavGroup = ({ label, icon: Icon, children }: any) => {
    const isOpen = openMenus.includes(label);
    return (
      <div className="space-y-1">
        <button 
          onClick={() => toggleMenu(label)}
          className="w-full flex items-center justify-between px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
        >
          <div className="flex items-center gap-3">
            <Icon size={22} className="text-slate-400" />
            <span className="text-sm font-medium">{label}</span>
          </div>
          <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && <div className="pl-6 space-y-1">{children}</div>}
      </div>
    );
  };

  return (
    <aside className="w-72 bg-white border-r border-slate-100 min-h-screen flex flex-col fixed left-0 top-0 z-40 shadow-sm">
      <div className="p-8 mb-4">
        <div className="flex items-center gap-3">
          <div className="text-[#0088CC]">
             {/* Ícone de Arara/Pássaro aproximado */}
             <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Zura</h1>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Gestão sem complicação</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <MenuItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" active={pathname === '/dashboard'} />
        <MenuItem href="/caixa" icon={CircleDollarSign} label="Caixa" />

        <NavGroup label="Vendas" icon={ShoppingCart}>
          <MenuItem href="/vendas" label="Frente de Caixa" icon={() => null} />
        </NavGroup>

        <NavGroup label="Gestão" icon={Users}>
          <MenuItem href="/clientes" label="Clientes" icon={() => null} />
        </NavGroup>

        <NavGroup label="Estoque" icon={Package}>
          <MenuItem href="/produtos" label="Produtos" icon={() => null} />
        </NavGroup>

        <NavGroup label="RH" icon={UserCircle}>
          <MenuItem href="/funcionarios" label="Equipe" icon={() => null} />
        </NavGroup>

        <NavGroup label="Financeiro" icon={Wallet}>
          <MenuItem href="/contas-pagar" label="Contas" icon={() => null} />
        </NavGroup>

        <NavGroup label="Análises" icon={BarChart3}>
          <MenuItem href="/dre" label="DRE" icon={() => null} />
        </NavGroup>
      </nav>
    </aside>
  );
}