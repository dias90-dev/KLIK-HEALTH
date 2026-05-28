import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, 
  Heart, 
  ShieldCheck, 
  Globe, 
  Layers, 
  PlusSquare, 
  Sparkles,
  Award,
  Building2,
  Search,
  X
} from "lucide-react";

interface Partner {
  id: string;
  name: string;
  category: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  colorClass: string;
}

const partnersList: Partner[] = [
  { id: "p1", name: "Albert Einstein", category: "Hospital Israelita", icon: PlusSquare, colorClass: "text-blue-500" },
  { id: "p2", name: "Grupo Fleury", category: "Medicina Diagnóstica", icon: Activity, colorClass: "text-emerald-500" },
  { id: "p3", name: "Rede D'Or São Luiz", category: "Complexo Hospitalar", icon: Award, colorClass: "text-amber-500" },
  { id: "p4", name: "BP - Beneficência Portuguesa", category: "Excelência Médica", icon: Heart, colorClass: "text-rose-500" },
  { id: "p5", name: "Dasa Labs", category: "Análises Clínicas", icon: Layers, colorClass: "text-sky-500" },
  { id: "p6", name: "Anvisa Oficial", category: "Regulação Sanitária", icon: ShieldCheck, colorClass: "text-teal-500" },
  { id: "p7", name: "OPAS / OMS", category: "Saúde Global", icon: Globe, colorClass: "text-indigo-500" },
  { id: "p8", name: "InCor USP", category: "Instituto do Coração", icon: Sparkles, colorClass: "text-red-500" },
];

interface PartnersMarqueeProps {
  theme?: "light" | "dark";
}

export default function PartnersMarquee({ theme = "dark" }: PartnersMarqueeProps) {
  const [filterQuery, setFilterQuery] = useState("");

  const filteredPartners = partnersList.filter(partner => 
    partner.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    partner.category.toLowerCase().includes(filterQuery.toLowerCase())
  );

  // We duplicate the filtered list to ensure infinite seamless scrolling loop without any cuts
  const duplicatedList = filteredPartners.length > 0 
    ? [...filteredPartners, ...filteredPartners, ...filteredPartners] 
    : [];

  return (
    <div className={`w-full py-6 select-none overflow-hidden ${theme === 'dark' ? 'bg-[#06070a]' : 'bg-slate-50'}`}>
      <div className="max-w-7xl mx-auto px-6 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <div className="flex items-center gap-1.5">
            <Building2 size={13} className={theme === 'dark' ? 'text-teal-400' : 'text-[#1c1a5e]'} />
            <span className={`text-[9px] font-black uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Instituições e Hospitais Homologados
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[8.5px] font-bold text-slate-500 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping"></span>
            <span>Ativa ({filteredPartners.length})</span>
          </div>
        </div>

        {/* Real-time Filter Input */}
        <div className="relative w-full sm:max-w-xs shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={13} className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
          </div>
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Buscar parceiro ou categoria..."
            className={`w-full pl-8 pr-8 py-1.5 rounded-xl text-xs font-semibold outline-none transition-all ${
              theme === 'dark'
                ? 'bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30'
                : 'bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-[#1c1a5e] focus:ring-1 focus:ring-[#1c1a5e]/30 shadow-xs'
            }`}
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 hover:text-slate-650 bg-transparent border-0"
              title="Limpar busca"
            >
              <X size={13} className={theme === 'dark' ? 'hover:text-slate-200' : 'hover:text-slate-800'} />
            </button>
          )}
        </div>
      </div>

      {/* Marquee Outer Container */}
      <div className="relative w-full flex items-center justify-center overflow-hidden py-1 min-h-[58px]">
        {filteredPartners.length === 0 ? (
          <div className={`text-xs font-semibold py-3 px-5 rounded-xl border ${
            theme === 'dark' 
              ? 'bg-slate-900/40 border-slate-800/60 text-slate-500' 
              : 'bg-white border-slate-200/60 text-slate-450 shadow-xs'
          }`}>
            Nenhum parceiro homologado encontrado para "{filterQuery}"
          </div>
        ) : (
          <>
            {/* Soft Left and Right Blur Fade Gradient Overlays for High-End Cinematic Aesthetics */}
            <div className={`absolute left-0 top-0 bottom-0 w-16 md:w-32 z-10 pointer-events-none bg-gradient-to-r ${theme === 'dark' ? 'from-[#06070a]' : 'from-slate-50'} to-transparent`} />
            <div className={`absolute right-0 top-0 bottom-0 w-16 md:w-32 z-10 pointer-events-none bg-gradient-to-l ${theme === 'dark' ? 'from-[#06070a]' : 'from-slate-50'} to-transparent`} />

            {/* Endless Moving Track */}
            <div id="partners-marquee-items" className="animate-marquee-scroll flex items-center gap-4">
              <AnimatePresence mode="popLayout">
                {duplicatedList.map((partner, index) => {
                  const IconComponent = partner.icon;
                  // Unique combination key for motion to track items across transitions
                  const animationKey = `${partner.id}-${index}-${filterQuery}`;
                  return (
                    <motion.div
                      key={animationKey}
                      initial={{ opacity: 0, scale: 0.85, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.85, y: -4 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 300,
                        damping: 24,
                        opacity: { duration: 0.25 }
                      }}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all duration-300 min-w-[210px] ${
                        theme === "dark"
                          ? "bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700/80"
                          : "bg-white border-slate-200/60 hover:bg-slate-50 shadow-xs"
                      }`}
                    >
                      {/* Logo Icon Visual Representation */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        theme === "dark" ? "bg-slate-950" : "bg-slate-100"
                      }`}>
                        <IconComponent size={18} className={partner.colorClass} />
                      </div>

                      {/* Info Metas */}
                      <div className="text-left min-w-0">
                        <span className={`block text-[11px] font-black tracking-tight leading-tight truncate ${
                          theme === "dark" ? "text-white" : "text-[#1c1a5e]"
                        }`}>
                          {partner.name}
                        </span>
                        <span className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wide truncate leading-none mt-1">
                          {partner.category}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
