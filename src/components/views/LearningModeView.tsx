import React, { useState } from 'react';
import { LEARNING_MODULES } from '../../services/knowledge/learningModules';
import { LearningModule } from '../../types';
import { BookMarked, GraduationCap, CheckCircle2, HelpCircle, Code2, ArrowRight } from 'lucide-react';

export const LearningModeView: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedModule, setSelectedModule] = useState<LearningModule>(LEARNING_MODULES[0]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

  const filtered = LEARNING_MODULES.filter(
    (m) => selectedLevel === 'ALL' || m.level === selectedLevel
  );

  const handleSelectModule = (mod: LearningModule) => {
    setSelectedModule(mod);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
  };

  const handleAnswerClick = (index: number) => {
    if (!isAnswerSubmitted) {
      setSelectedAnswer(index);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer !== null) {
      setIsAnswerSubmitted(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#F7931A]">
            <BookMarked className="w-3.5 h-3.5" />
            <span>CLAUDE PARA EL DESARROLLO BLOCKCHAIN · POR DIEGO EDUARDO BELTRAMO</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">LEARNING MODE</h1>
          <p className="text-xs text-slate-400">
            Módulos interactivos de estudio estructurados por niveles: fundamentos de UTXO, Taproot, smart contracts y matemáticas de AMMs.
          </p>
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedLevel === lvl
                  ? 'bg-[#1E293B] text-[#F7931A] font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-white bg-[#0A0E17] border border-[#1E293B]'
              }`}
            >
              {lvl === 'ALL' ? 'Todos' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Pane: Chapter List & Module Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Module Chapters */}
        <div className="lg:col-span-5 space-y-3">
          {filtered.map((mod) => {
            const isSelected = selectedModule.id === mod.id;
            return (
              <div
                key={mod.id}
                onClick={() => handleSelectModule(mod)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0F172A] border-[#F7931A] shadow-md'
                    : 'bg-[#0A0E17] border-[#1E293B] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono text-[#F7931A] text-[10px] font-bold">
                    {mod.level}
                  </span>
                  <span className="text-slate-500 text-[11px] truncate max-w-[200px]">
                    {mod.chapter}
                  </span>
                </div>
                <div className="text-xs font-bold text-white leading-snug">
                  {mod.title}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Concept, Code & Interactive Quiz */}
        <div className="lg:col-span-7">
          <div className="p-6 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-6">
            <div className="border-b border-[#1E293B] pb-4">
              <span className="text-xs font-mono text-[#F7931A]">{selectedModule.chapter}</span>
              <h2 className="text-xl font-bold text-white mt-1">{selectedModule.title}</h2>
            </div>

            {/* Concept Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Concepto Teórico</h3>
              <p className="text-xs text-slate-200 leading-relaxed bg-[#0F172A] p-4 rounded-lg border border-slate-800">
                {selectedModule.concept}
              </p>
            </div>

            {/* Practical Example */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ejemplo Práctico</h3>
              <div className="text-xs text-slate-300 leading-relaxed bg-[#0C1322] p-4 rounded-lg border border-slate-800">
                {selectedModule.practicalExample}
              </div>
            </div>

            {/* Code Snippet if present */}
            {selectedModule.codeSnippet && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Código de Demostración</span>
                </h3>
                <div className="bg-[#05080E] p-4 rounded-lg border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed">
                  <pre>{selectedModule.codeSnippet}</pre>
                </div>
              </div>
            )}

            {/* Interactive Quiz */}
            <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <GraduationCap className="w-4 h-4 text-[#F7931A]" />
                <span>Quiz de Verificación de Concepto</span>
              </div>

              <div className="text-xs font-semibold text-slate-100">
                {selectedModule.quiz.question}
              </div>

              <div className="space-y-2">
                {selectedModule.quiz.options.map((opt, idx) => {
                  const isChosen = selectedAnswer === idx;
                  const isCorrect = idx === selectedModule.quiz.correctAnswerIndex;

                  let optionStyle = 'bg-[#0A0E17] border-slate-800 text-slate-300 hover:border-slate-700';
                  if (isChosen) optionStyle = 'bg-[#1E293B] border-[#F7931A] text-white';
                  if (isAnswerSubmitted) {
                    if (isCorrect) optionStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200';
                    else if (isChosen && !isCorrect) optionStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerClick(idx)}
                      disabled={isAnswerSubmitted}
                      className={`w-full text-left p-3 rounded-lg text-xs border transition-colors ${optionStyle}`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-mono text-slate-500 uppercase">{String.fromCharCode(65 + idx)}.</span>
                        <span>{opt}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {!isAnswerSubmitted ? (
                <div className="flex justify-end">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null}
                    className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#F7931A] hover:bg-[#e08213] text-white transition-colors disabled:opacity-40"
                  >
                    Verificar Respuesta
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-[#0A0E17] border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="font-semibold text-white">Explicación Oficial:</div>
                  <p>{selectedModule.quiz.explanation}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
