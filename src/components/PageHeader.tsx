export function PageHeader({ path, title, subtitle, button }: any) {
    return (
      <div className="mb-6"> {/* Reduzi de mb-8 */}
        <div className="flex justify-between items-start mb-4">
          <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>🏠 Início</span>
            {path.map((p: any, i: number) => (
              <span key={i} className="flex items-center gap-2">
                <span className="text-slate-200">›</span> {p}
              </span>
            ))}
          </nav>
          {/* Perfil e Printer mantidos, mas com gap menor */}
        </div>
        <div className="flex justify-between items-end gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 font-medium mt-1">{subtitle}</p>}
          </div>
          <div className="shrink-0">{button}</div> {/* Evita que o botão "esmague" o título */}
        </div>
      </div>
    );
  }