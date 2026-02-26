import Link from "next/link";

export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-2xl font-bold text-blue-500 tracking-wider">ZURA<span className="text-white font-light">ERP</span></h2>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <span>📊</span> Painel Geral
        </Link>

        {/* NOVO LINK DO DRE */}
        <Link href="/dre" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <span>📈</span> DRE Gerencial
        </Link>
        
        <Link href="/caixa" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <span>💵</span> Fluxo de Caixa
        </Link>

        <Link href="/contas-pagar" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <span>🧾</span> Contas a Pagar
        </Link>

        <Link href="/entregas" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <span>🚚</span> Entregas
        </Link>

        <Link href="/clientes" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <span>👥</span> Clientes
        </Link>

        <Link href="/fiados" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <span>📝</span> Fiados
        </Link>
        
        <Link href="/produtos" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <span>📦</span> Produtos
        </Link>

        <Link href="/perdas" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <span>📉</span> Controle de Perdas
        </Link>

        <Link href="/cascos" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <span>🍾</span> Empréstimo de Cascos
        </Link>

        <Link href="/funcionarios" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <span>👔</span> Equipe / RH
        </Link>
        
        <Link href="/vendas" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <span>💰</span> Vendas
        </Link>
        
        <Link href="/configuracoes" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <span>⚙️</span> Configurações
        </Link>
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        <p>Zura ERP v0.1.0</p>
      </div>
    </aside>
  );
}