import React, { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Pill, Printer } from "lucide-react";

export default function PharmacistMode({ hasAiKey }: { hasAiKey: boolean }) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setAnalysisResult(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile.type.startsWith('image/')) {
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
        setAnalysisResult(null);
      }
    }
  };

  const verifyPrescription = async () => {
    if (!previewUrl) return;
    
    setAnalyzing(true);
    try {
      const response = await fetch("/api/verify-prescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: previewUrl.split(',')[1], mimeType: file?.type })
      });
      
      const data = await response.json();
      setAnalysisResult(data.data);
    } catch (err) {
      console.error(err);
      setAnalysisResult({ 
        error: "Falha ao processar a receita. Tente novamente mais tarde." 
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const printLabels = () => {
    if (!analysisResult || !analysisResult.medicamentos) return;
    
    let printContent = "";
    
    analysisResult.medicamentos.forEach((med: any) => {
      const isAvailable = med.disponivel ? "✓ EM ESTOQUE" : "✗ EM FALTA";
      printContent += `
----------------------------------------
MEDICAMENTO: ${med.nome.toUpperCase()}
POSOLOGIA: ${med.posologia}
STATUS: ${isAvailable}
DATA: ${new Date().toLocaleDateString('pt-BR')}
----------------------------------------
`;
    });

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Etiquetas de Medicamentos</title>
            <style>
              body { font-family: monospace; padding: 20px; white-space: pre; }
            </style>
          </head>
          <body>${printContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-150 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
            <Pill size={24} />
          </div>
          <div>
            <h2 className="text-lg font-black text-[#1c1a5e]">Análise de Receita (Modo Farmacêutico)</h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">Envie a foto da receita para verificação de disponibilidade em estoque.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div 
              className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer ${
                previewUrl ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
              {previewUrl ? (
                <div className="space-y-4">
                  <img src={previewUrl} alt="Receita" className="max-h-48 mx-auto rounded-xl shadow-xs" />
                  <p className="text-xs font-bold text-emerald-600">Clique ou arraste para trocar a imagem</p>
                </div>
              ) : (
                <div className="space-y-4 py-8">
                  <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto border border-slate-100">
                    <Upload size={24} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#1c1a5e]">Enviar Receita Médica</p>
                    <p className="text-xs text-slate-400 mt-1">Arraste a foto ou clique para selecionar</p>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={verifyPrescription}
              disabled={!previewUrl || analyzing}
              className="w-full bg-[#1c1a5e] hover:bg-[#201d6d] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm py-3.5 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Processando IA...
                </>
              ) : (
                <>
                  <FileText size={18} /> Verificar Disponibilidade (Oculte a API Key)
                </>
              )}
            </button>
            {!hasAiKey && (
              <p className="text-[10px] text-amber-600 font-bold text-center bg-amber-50 py-2 rounded-xl border border-amber-100">
                ⚠️ Modo simulação: A API Key do Gemini não está presente ou é inválida.
              </p>
            )}
          </div>

          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200">
            <h3 className="text-sm font-black text-[#1c1a5e] mb-4 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              Resultado da Verificação
            </h3>
            
            {!analysisResult && !analyzing && (
              <div className="text-center text-slate-400 text-xs font-medium py-12 px-4 border border-dashed border-slate-200 rounded-2xl bg-white">
                O resultado e a disponibilidade dos medicamentos aparecerão aqui. <br/>
                Sua chave de API está 100% segura no backend.
              </div>
            )}
            
            {analyzing && (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <Loader2 size={32} className="animate-spin text-emerald-500" />
                <p className="text-xs font-bold text-slate-500 animate-pulse">Lendo receituário no servidor seguro...</p>
              </div>
            )}

            {analysisResult && !analysisResult.error && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Medicamentos Identificados</h4>
                  <ul className="space-y-3">
                    {analysisResult.medicamentos?.map((med: any, i: number) => (
                      <li key={i} className="flex justify-between items-start gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#1c1a5e] truncate">{med.nome}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{med.posologia}</p>
                        </div>
                        <div className={`shrink-0 px-2.5 py-1 text-[10px] font-black rounded-lg uppercase tracking-wide
                          ${med.disponivel 
                            ? 'bg-emerald-100 text-emerald-700 font-mono shadow-xs border border-emerald-200' 
                            : 'bg-red-100 text-red-700 font-mono shadow-xs border border-red-200'}`}
                        >
                          {med.disponivel ? "EM ESTOQUE" : "FALTA"}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  analysisResult.valida ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'
                }`}>
                  {analysisResult.valida ? (
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className={`text-xs font-black ${analysisResult.valida ? 'text-emerald-800' : 'text-red-800'}`}>
                      {analysisResult.valida ? 'Receita Válida' : 'Atenção na Validação'}
                    </h4>
                    <p className={`text-[10px] mt-1 font-medium ${analysisResult.valida ? 'text-emerald-600' : 'text-red-600'}`}>
                      {analysisResult.observacao}
                    </p>
                  </div>
                </div>

                <button
                  onClick={printLabels}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 mt-4"
                >
                  <Printer size={16} /> Imprimir Etiquetas
                </button>
              </div>
            )}

            {analysisResult?.error && (
              <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-2xl flex items-center gap-2 text-xs font-bold">
                <AlertCircle size={16} />
                {analysisResult.error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
