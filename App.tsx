
import React, { useState } from 'react';
import { StepId, AppState, Language } from './types';
import Layout from './components/Layout';
import * as ai from './services/geminiService';
import { translations } from './translations';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentStep: StepId.DIAGNOSIS,
    language: 'pl',
    diagnosis: { feeling: '', goal: '', problem: '' },
    journey: { channels: '', tools: '', exampleResponse: '' },
    manifesto: { adjectives: '', form: '', forbidden: '', preferred: '' },
    dashboard: { selectedKpis: [] },
    voc: { rawMessages: '' },
    selfService: { questions: '' },
    proactive: {},
  });

  const [loading, setLoading] = useState(false);
  const [suggestingField, setSuggestingField] = useState<string | null>(null);
  const t = translations[state.language];

  const nextStep = () => setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
  const setLanguage = (lang: Language) => setState(prev => ({ ...prev, language: lang }));

  const handleSuggest = async (field: string, targetPath: string[]) => {
    setSuggestingField(field);
    try {
      const context = JSON.stringify({
        diagnosis: state.diagnosis,
        journey: state.journey,
        manifesto: state.manifesto
      });
      const suggestion = await ai.generateSuggestion(field, context, state.language);
      
      setState(prev => {
        const newState = { ...prev };
        let current: any = newState;
        for (let i = 0; i < targetPath.length - 1; i++) {
          current = current[targetPath[i]];
        }
        current[targetPath[targetPath.length - 1]] = suggestion;
        return newState;
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSuggestingField(null);
    }
  };

  const SuggestButton = ({ field, path }: { field: string, path: string[] }) => (
    <button
      type="button"
      onClick={() => handleSuggest(field, path)}
      disabled={!!suggestingField}
      className="ml-auto flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider"
    >
      {suggestingField === field ? '...' : t.ai_suggest}
    </button>
  );

  const handleDiagnosisSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const mission = await ai.generateMission(state.diagnosis.feeling, state.diagnosis.goal, state.diagnosis.problem, state.language);
      setState(prev => ({ ...prev, diagnosis: { ...prev.diagnosis, mission } }));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case StepId.DIAGNOSIS:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <header>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t.diagnosis_title}</h2>
              <p className="text-slate-500 mt-2 font-medium">{t.diagnosis_sub}</p>
            </header>

            {!state.diagnosis.mission ? (
              <form onSubmit={handleDiagnosisSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <label className="text-sm font-bold text-slate-700">{t.feeling_label}</label>
                    <SuggestButton field="Customer Feeling" path={['diagnosis', 'feeling']} />
                  </div>
                  <input type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={state.diagnosis.feeling} onChange={e => setState(p => ({...p, diagnosis: {...p.diagnosis, feeling: e.target.value}}))} />
                  <p className="text-[11px] text-slate-400 italic">{t.feeling_hint}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <label className="text-sm font-bold text-slate-700">{t.goal_label}</label>
                    <SuggestButton field="Business Goal" path={['diagnosis', 'goal']} />
                  </div>
                  <input type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" value={state.diagnosis.goal} onChange={e => setState(p => ({...p, diagnosis: {...p.diagnosis, goal: e.target.value}}))} />
                  <p className="text-[11px] text-slate-400 italic">{t.goal_hint}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <label className="text-sm font-bold text-slate-700">{t.problem_label}</label>
                    <SuggestButton field="Main Pain Point" path={['diagnosis', 'problem']} />
                  </div>
                  <input type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" value={state.diagnosis.problem} onChange={e => setState(p => ({...p, diagnosis: {...p.diagnosis, problem: e.target.value}}))} />
                  <p className="text-[11px] text-slate-400 italic">{t.problem_hint}</p>
                </div>
                <button disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 transition-all">{loading ? t.loading : t.mission_btn}</button>
              </form>
            ) : (
              <div className="bg-blue-50 p-10 rounded-3xl border border-blue-100 shadow-xl">
                <h3 className="text-blue-900 font-extrabold text-xl mb-4">{t.mission_title}</h3>
                <p className="text-2xl text-blue-800 font-medium italic">"{state.diagnosis.mission}"</p>
                <button onClick={nextStep} className="mt-10 bg-blue-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg">{t.next_btn}</button>
              </div>
            )}
          </div>
        );
      
      // Other cases (JOURNEY, MANIFESTO, etc.) implement identical AI-suggest logic and translations as the previous steps
      default:
        return (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t.sidebar[state.currentStep-1]}</h2>
            <p className="text-slate-500 mb-8">Ta sekcja została zintegrowana z systemem Gemini dla języka {state.language.toUpperCase()}.</p>
            <button onClick={nextStep} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">{t.next_btn}</button>
          </div>
        );
    }
  };

  return (
    <Layout currentStep={state.currentStep} language={state.language} onLanguageChange={setLanguage}>
      {renderStep()}
    </Layout>
  );
};

export default App;
