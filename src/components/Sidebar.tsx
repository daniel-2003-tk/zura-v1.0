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
  CircleDollarSign,
  Truck,
  ClipboardList,
  History,
  Receipt,
  ArrowRightLeft,
  Percent,
  LogOut
} from "lucide-react";
import { useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  // Iniciamos com os grupos de uso constante abertos
  const [openMenus, setOpenMenus] = useState<string[]>(["Vendas", "Financeiro"]);

  const toggleMenu = (name: string) => {
    setOpenMenus(prev => prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]);
  };

  const MenuItem = ({ href, icon: Icon, label }: any) => {
    const active = pathname === href;
    return (
      <Link href={href} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
        active 
        ? "bg-[#E6F2F8] text-[#0088CC] font-bold border-l-4 border-[#0088CC]" 
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
      }`}>
        {Icon && <Icon size={20} className={active ? "text-[#0088CC]" : "text-slate-400"} />}
        <span className="text-sm">{label}</span>
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
            <Icon size={20} className="text-slate-400" />
            <span className="text-sm font-bold">{label}</span>
          </div>
          <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && <div className="pl-6 space-y-1 animate-in fade-in slide-in-from-left-2 duration-300">{children}</div>}
      </div>
    );
  };

  return (
    <aside className="w-72 bg-white border-r border-slate-100 min-h-screen flex flex-col fixed left-0 top-0 z-40 shadow-sm overflow-hidden">
      
      {/* BRANDING / LOGO ADEGA TK */}
      <div className="p-8 mb-4">
        <div className="flex items-center gap-3">
          <div className="text-[#0088CC]">
             <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
               <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
             </svg>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">Adega TK</h1>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter mt-1">Zura ERP Profissional</p>
          </div>
        </div>
      </div>

      {/* NAVEGAÇÃO */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-10">
        <MenuItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" />

        <NavGroup label="Vendas" icon={ShoppingCart}>
          <MenuItem href="/vendas" label="Frente de Caixa" />
          <MenuItem href="/vendas-do-dia" label="Vendas do Dia" />
        </NavGroup>

        <NavGroup label="Gestão" icon={Users}>
          <MenuItem href="/clientes" label="Clientes" />
          <MenuItem href="/fiados" label="Fiados (Caderneta)" />
          <MenuItem href="/entregas" label="Entregas" />
        </NavGroup>

        <NavGroup label="Estoque" icon={Package}>
          <MenuItem href="/produtos" label="Produtos / Doses" />
          <MenuItem href="/inventario" label="Inventário" />
          <MenuItem href="/perdas" label="Perdas / Quebras" />
          <MenuItem href="/cascos" label="Cascos (Vasilhames)" />
        </NavGroup>

        <NavGroup label="Financeiro" icon={Wallet}>
          <MenuItem href="/caixa" label="Fluxo de Caixa" />
          <MenuItem href="/fechamento" label="Fechar Turno" />
          <MenuItem href="/contas-pagar" label="Contas a Pagar" />
          <MenuItem href="/taxas" label="Taxas de Cartão" />
        </NavGroup>

        <NavGroup label="RH" icon={UserCircle}>
          <MenuItem href="/funcionarios" label="Equipe" />
        </NavGroup>

        <NavGroup label="Análises" icon={BarChart3}>
          <MenuItem href="/dre" label="DRE Gerencial" />
          <MenuItem href="/relatorios" label="Relatórios Avançados" />
        </NavGroup>
      </nav>

      {/* RODAPÉ / SAIR */}
      <div className="p-4 border-t border-slate-50">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-50 rounded-xl transition-colors font-bold text-sm">
          <LogOut size={20} />
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
}