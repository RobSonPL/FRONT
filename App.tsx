
import React, { useState } from 'react';
import { StepId, AppState, VocItem, FaqItem } from './types';
import Layout from './components/Layout';
import * as ai from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentStep: StepId.DIAGNOSIS,
    diagnosis: { feeling: '', goal: '', problem: '' },
    journey: { channels: '', tools: '', exampleResponse: '' },
    manifesto: { adjectives: '', form: '', forbidden: '', preferred: '' },
    dashboard: { selectedKpis: [] },
    voc: { rawMessages: '' },
    selfService: { questions: '' },
    proactive: {},
  });

  const [loading, setLoading] = useState(false);

  const nextStep = () => setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));

  // Export Utilities
  const exportToCSV = (data: any[], headers: string[], filename: string) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${(row as any)[header]?.toString().replace(/"/g, '""') || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const exportToWord = (htmlContent: string, filename: string) => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' "+
            "xmlns:w='urn:schemas-microsoft-com:office:word' "+
            "xmlns='http://www.w3.org/TR/REC-html40'>"+
            "<head><meta charset='utf-8'><title>Export</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + htmlContent + footer;
    
    const blob = new Blob(['\ufeff', sourceHTML], {
        type: 'application/msword'
    });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.doc`;
    link.click();
  };

  // Step 1 logic
  const handleDiagnosisSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const mission = await ai.generateMission(state.diagnosis.feeling, state.diagnosis.goal, state.diagnosis.problem);
      setState(prev => ({ ...prev, diagnosis: { ...prev.diagnosis, mission } }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Step 2 logic
  const handleJourneySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const analysis = await ai.analyzeJourney(state.journey.channels, state.journey.tools, state.journey.exampleResponse);
      setState(prev => ({ ...prev, journey: { ...prev.journey, analysis } }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Step 3 logic
  const handleManifestoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await ai.generateManifesto(state.manifesto.adjectives, state.manifesto.form, state.manifesto.forbidden, state.manifesto.preferred);
      setState(prev => ({ ...prev, manifesto: { ...prev.manifesto, result } }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Step 5 logic
  const handleVocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const analysis = await ai.analyzeVoc(state.voc.rawMessages);
      setState(prev => ({ ...prev, voc: { ...prev.voc, analysis } }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Step 6 logic
  const handleFaqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const faqItems = await ai.generateFaq(state.selfService.questions);
      setState(prev => ({ ...prev, selfService: { ...prev.selfService, faqItems } }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Step 9 logic
  const handleProactiveAnalysis = async () => {
    setLoading(true);
    try {
      const context = JSON.stringify(state);
      const strategy = await ai.generateProactiveStrategy(context);
      setState(prev => ({ ...prev, proactive: { strategy } }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case StepId.DIAGNOSIS:
        return (
          <div className="space-y-6">
            <header>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">1. Diagnoza Doświadczeń Klienta</h2>
              <p className="text-slate-500 mt-2 font-medium">Zdefiniujmy Twoją Obietnicę CX, czyli to, co klienci będą o Tobie mówić.</p>
            </header>

            {!state.diagnosis.mission ? (
              <form onSubmit={handleDiagnosisSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Jakie emocje ma wywoływać Twoja obsługa?</label>
                  <input 
                    type="text" 
                    required
                    placeholder="np. spokój, pewność, radość"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    value={state.diagnosis.feeling}
                    onChange={e => setState(p => ({...p, diagnosis: {...p.diagnosis, feeling: e.target.value}}))}
                  />
                  <p className="text-[11px] text-slate-400 italic">To słowo będzie fundamentem Twojego języka korzyści.</p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Główny cel biznesowy obsługi?</label>
                  <input 
                    type="text" 
                    required
                    placeholder="np. zwiększenie retencji klientów o 20%"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    value={state.diagnosis.goal}
                    onChange={e => setState(p => ({...p, diagnosis: {...p.diagnosis, goal: e.target.value}}))}
                  />
                  <p className="text-[11px] text-slate-400 italic">Obsługa to nie koszt, to inwestycja w ten konkretny cel.</p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Twój "Czarny Koń" (największy problem)?</label>
                  <input 
                    type="text" 
                    required
                    placeholder="np. brak informacji o statusie reklamacji"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    value={state.diagnosis.problem}
                    onChange={e => setState(p => ({...p, diagnosis: {...p.diagnosis, problem: e.target.value}}))}
                  />
                  <p className="text-[11px] text-slate-400 italic">Zidentyfikowanie tego punktu pozwoli nam go najpierw wyeliminować.</p>
                </div>
                <button 
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg shadow-slate-900/10"
                >
                  {loading ? 'Przetwarzam strategię...' : 'Sformułuj Misję CX'}
                </button>
              </form>
            ) : (
              <div className="bg-blue-50 p-10 rounded-3xl border border-blue-100 animate-in zoom-in duration-500 shadow-xl shadow-blue-500/5">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
                <h3 className="text-blue-900 font-extrabold text-xl mb-4 tracking-tight">Twoja Misja Obsługi Klienta:</h3>
                <p className="text-2xl text-blue-800 leading-snug font-medium italic">"{state.diagnosis.mission}"</p>
                <button onClick={nextStep} className="mt-10 bg-blue-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                  Zaczynajmy pracę →
                </button>
              </div>
            )}
          </div>
        );

      case StepId.JOURNEY:
        return (
          <div className="space-y-6">
            <header>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">2. Mapa Podróży Klienta</h2>
              <p className="text-slate-500 mt-2 font-medium">Sprawdzamy, gdzie Twoja obietnica mija się z rzeczywistością.</p>
            </header>

            {!state.journey.analysis ? (
              <form onSubmit={handleJourneySubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Wszystkie kanały kontaktu</label>
                  <input 
                    type="text" 
                    required
                    placeholder="np. telefon, mail, Facebook Messenger, LiveChat"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={state.journey.channels}
                    onChange={e => setState(p => ({...p, journey: {...p.journey, channels: e.target.value}}))}
                  />
                  <p className="text-[11px] text-slate-400 italic">Wymień wszystko, czym klient może do Ciebie dotrzeć.</p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Obecne narzędzia (CRM/Helpdesk)</label>
                  <input 
                    type="text" 
                    required
                    placeholder="np. Outlook, HubSpot, LiveAgent"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={state.journey.tools}
                    onChange={e => setState(p => ({...p, journey: {...p.journey, tools: e.target.value}}))}
                  />
                  <p className="text-[11px] text-slate-400 italic">Gdzie "lądują" zgłoszenia i jak nimi zarządzasz?</p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Typowa odpowiedź do klienta</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Wklej tu fragment prawdziwej odpowiedzi..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={state.journey.exampleResponse}
                    onChange={e => setState(p => ({...p, journey: {...p.journey, exampleResponse: e.target.value}}))}
                  />
                  <p className="text-[11px] text-slate-400 italic">Dzięki temu sprawdzę styl, ton i szybkość komunikacji.</p>
                </div>
                <button 
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                >
                  {loading ? 'Analizuję procesy...' : 'Wykonaj Audyt Procesów'}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
                  <h3 className="font-bold text-lg mb-6 text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                    Wnioski z Audytu:
                  </h3>
                  <div className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-700 font-medium">
                    {state.journey.analysis}
                  </div>
                </div>
                <button onClick={nextStep} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                  Naprawmy komunikację →
                </button>
              </div>
            )}
          </div>
        );

      case StepId.MANIFESTO:
        return (
          <div className="space-y-6">
            <header>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">3. Manifest Komunikacji</h2>
              <p className="text-slate-500 mt-2 font-medium">To instrukcja obsługi Twojej marki dla zespołu.</p>
            </header>

            {!state.manifesto.result ? (
              <form onSubmit={handleManifestoSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">3 filary Twojego głosu</label>
                  <input 
                    type="text" 
                    required
                    placeholder="np. profesjonalizm, empatia, konkret"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={state.manifesto.adjectives}
                    onChange={e => setState(p => ({...p, manifesto: {...p.manifesto, adjectives: e.target.value}}))}
                  />
                  <p className="text-[11px] text-slate-400 italic">Jakie 3 cechy muszą przebijać z każdego Twojego maila?</p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Stosowana forma grzecznościowa</label>
                  <input 
                    type="text" 
                    required
                    placeholder="np. Pan/Pani, bo to buduje autorytet"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={state.manifesto.form}
                    onChange={e => setState(p => ({...p, manifesto: {...p.manifesto, form: e.target.value}}))}
                  />
                  <p className="text-[11px] text-slate-400 italic">Ty czy Pan/Pani? To zmienia cały dystans w relacji.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 text-red-600">Zakazany zwrot (Stop-słowo)</label>
                    <input 
                      type="text" 
                      required
                      placeholder="np. 'proszę czekać'"
                      className="w-full px-4 py-3 rounded-xl border border-red-100 bg-red-50 focus:ring-2 focus:ring-red-500 outline-none"
                      value={state.manifesto.forbidden}
                      onChange={e => setState(p => ({...p, manifesto: {...p.manifesto, forbidden: e.target.value}}))}
                    />
                    <p className="text-[11px] text-slate-400 italic">Czego kategorycznie nie wolno pisać klientowi?</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 text-emerald-600">Magiczny zwrot (Go-słowo)</label>
                    <input 
                      type="text" 
                      required
                      placeholder="np. 'już dla Pana to sprawdzę'"
                      className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={state.manifesto.preferred}
                      onChange={e => setState(p => ({...p, manifesto: {...p.manifesto, preferred: e.target.value}}))}
                    />
                    <p className="text-[11px] text-slate-400 italic">Co sprawia, że Twoi klienci czują się docenieni?</p>
                  </div>
                </div>
                <button 
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                >
                  {loading ? 'Kodyfikuję zasady...' : 'Wygeneruj Manifest Zespołu'}
                </button>
              </form>
            ) : (
              <div className="bg-slate-900 text-white p-12 rounded-[2rem] shadow-2xl relative overflow-hidden border border-white/10">
                <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12">
                  <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                </div>
                <h3 className="text-3xl font-extrabold mb-10 uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">Nasz Manifest Komunikacji</h3>
                <div className="prose prose-invert max-w-none whitespace-pre-wrap text-xl leading-relaxed font-light italic">
                  {state.manifesto.result}
                </div>
                <button onClick={nextStep} className="mt-12 bg-white text-slate-900 px-10 py-5 rounded-2xl font-bold hover:bg-blue-50 transition-all w-full shadow-2xl">
                  Wdrażamy ten styl →
                </button>
              </div>
            )}
          </div>
        );

      case StepId.DASHBOARD:
        const kpis = [
          { id: 'csat', label: 'CSAT (Satysfakcja)', desc: 'Jak bardzo klient jest zadowolony z konkretnej rozmowy?' },
          { id: 'frt', label: 'FRT (Czas Reakcji)', desc: 'Ile minut klient czeka na pierwszą wiadomość?' },
          { id: 'fcr', label: 'FCR (Skuteczność)', desc: 'Czy problem został rozwiązany przy pierwszej odpowiedzi?' },
          { id: 'nps', label: 'NPS (Polecenia)', desc: 'Czy klient poleciłby nas swoim znajomym?' }
        ];
        return (
          <div className="space-y-6">
            <header>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">4. Dashboard Wyników</h2>
              <p className="text-slate-500 mt-2 font-medium">To, czego nie mierzysz, nie istnieje. Wybierz 3 kluczowe metryki.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {kpis.map(kpi => (
                <div 
                  key={kpi.id}
                  onClick={() => {
                    const current = state.dashboard.selectedKpis;
                    if (current.includes(kpi.id)) {
                      setState(p => ({...p, dashboard: {selectedKpis: current.filter(i => i !== kpi.id)}}));
                    } else if (current.length < 3) {
                      setState(p => ({...p, dashboard: {selectedKpis: [...current, kpi.id]}}));
                    }
                  }}
                  className={`p-8 rounded-3xl border-2 transition-all duration-300 group cursor-pointer ${
                    state.dashboard.selectedKpis.includes(kpi.id) 
                    ? 'border-blue-600 bg-blue-50 shadow-lg shadow-blue-500/10' 
                    : 'border-slate-100 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className={`font-bold text-xl ${state.dashboard.selectedKpis.includes(kpi.id) ? 'text-blue-900' : 'text-slate-700'}`}>{kpi.label}</span>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        state.dashboard.selectedKpis.includes(kpi.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-200'
                    }`}>
                        {state.dashboard.selectedKpis.includes(kpi.id) && <span className="text-white text-xs font-bold">✓</span>}
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">{kpi.desc}</p>
                </div>
              ))}
            </div>
            {state.dashboard.selectedKpis.length === 3 && (
              <button onClick={nextStep} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold hover:bg-blue-700 transition-all animate-in fade-in slide-in-from-bottom-4 shadow-xl shadow-blue-600/20">
                Ustaw te wskaźniki jako priorytet →
              </button>
            )}
          </div>
        );

      case StepId.VOC:
        return (
          <div className="space-y-6">
            <header className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">5. Głos Klienta (VoC)</h2>
                <p className="text-slate-500 mt-2 font-medium">Przekuwamy skargi w systemowe ulepszenia produktu.</p>
              </div>
              {state.voc.analysis && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => exportToCSV(state.voc.analysis || [], ['problem', 'cause', 'response', 'systemAction'], 'Analiza-VoC-FRONT')}
                    className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
                  >
                    CSV
                  </button>
                  <button 
                    onClick={() => exportToWord(document.getElementById('voc-table')?.innerHTML || '', 'Analiza-VoC-FRONT')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
                  >
                    Word
                  </button>
                </div>
              )}
            </header>

            {!state.voc.analysis ? (
              <form onSubmit={handleVocSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <label className="block text-sm font-semibold text-slate-700">Wklej kilka prawdziwych (anonimowych) wiadomości od klientów:</label>
                <textarea 
                  required
                  rows={8}
                  placeholder="Klient: Zamówienie przyszło uszkodzone i nikt nie odbiera telefonu...&#10;Klient: Nie mogę znaleźć przycisku do zwrotu na stronie..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                  value={state.voc.rawMessages}
                  onChange={e => setState(p => ({...p, voc: {...p.voc, rawMessages: e.target.value}}))}
                />
                <p className="text-[11px] text-slate-400 italic">Im więcej autentycznych wiadomości, tym lepszą strategię naprawczą przygotuję.</p>
                <button 
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
                >
                  {loading ? 'Analizuję psychologię klienta...' : 'Wygeneruj Mapę Problemów i Rozwiązań'}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div id="voc-table" className="overflow-hidden bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-5 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Problem (Concern)</th>
                        <th className="px-6 py-5 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Przyczyna (Cause)</th>
                        <th className="px-6 py-5 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Idealna Odpowiedź</th>
                        <th className="px-6 py-5 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Akcja Systemowa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {state.voc.analysis.map((item, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-6 py-5 text-sm font-bold text-slate-900">{item.problem}</td>
                          <td className="px-6 py-5 text-sm text-slate-600 font-medium">{item.cause}</td>
                          <td className="px-6 py-5 text-sm text-blue-700 italic font-medium leading-relaxed">"{item.response}"</td>
                          <td className="px-6 py-5">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                              {item.systemAction}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button onClick={nextStep} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20">
                  Stwórzmy Bazę Wiedzy →
                </button>
              </div>
            )}
          </div>
        );

      case StepId.SELF_SERVICE:
        return (
          <div className="space-y-6">
            <header className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">6. Centrum Samoobsługi</h2>
                <p className="text-slate-500 mt-2 font-medium">Uwalniamy Twój czas. Niech klienci sami znajdują odpowiedzi na 80% pytań.</p>
              </div>
              {state.selfService.faqItems && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => exportToCSV(state.selfService.faqItems || [], ['question', 'answer', 'proactiveAction'], 'FAQ-FRONT')}
                    className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
                  >
                    CSV
                  </button>
                  <button 
                    onClick={() => exportToWord(document.getElementById('faq-list')?.innerHTML || '', 'FAQ-FRONT')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
                  >
                    Word
                  </button>
                </div>
              )}
            </header>

            {!state.selfService.faqItems ? (
              <form onSubmit={handleFaqSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <label className="block text-sm font-semibold text-slate-700">Jakie 5 pytań najmocniej obciąża Twój zespół każdego dnia?</label>
                <textarea 
                  required
                  rows={5}
                  placeholder="1. Jak złożyć reklamację?&#10;2. Czy wysyłacie za granicę?&#10;..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={state.selfService.questions}
                  onChange={e => setState(p => ({...p, selfService: {...p.selfService, questions: e.target.value}}))}
                />
                <p className="text-[11px] text-slate-400 italic">Te odpowiedzi staną się gotowymi szablonami (macros) dla zespołu.</p>
                <button 
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
                >
                  {loading ? 'Piszę artykuły pomocy...' : 'Zaprojektuj Inteligentne FAQ'}
                </button>
              </form>
            ) : (
              <div id="faq-list" className="space-y-6">
                {state.selfService.faqItems.map((item, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg shadow-slate-200/50 group hover:border-blue-200 transition-all">
                    <h4 className="font-extrabold text-xl text-slate-900 mb-4 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">Q</span>
                        {item.question}
                    </h4>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-4 group-hover:bg-blue-50/50 transition-all">
                      <p className="text-slate-700 leading-relaxed font-medium">{item.answer}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest">Rekomendacja Proaktywna:</span>
                      <span className="text-sm font-bold text-emerald-800">{item.proactiveAction}</span>
                    </div>
                  </div>
                ))}
                <button onClick={nextStep} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20">
                  Ustalmy Plan Wdrożenia →
                </button>
              </div>
            )}
          </div>
        );

      case StepId.SPRINT:
        return (
          <div className="space-y-6">
            <header>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">7. Sprint CX (30 dni)</h2>
              <p className="text-slate-500 mt-2 font-medium">Od teorii do praktyki. Realny plan transformacji Twojego zespołu.</p>
            </header>
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                <h3 className="font-extrabold text-lg uppercase tracking-widest">Mapa Drogowa Transformacji</h3>
                <span className="bg-blue-600 px-3 py-1 rounded-full text-[10px] font-bold">START: DZIŚ</span>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { w: "Tydzień 1", mission: "Zbieranie Danych", task: "Zapisuj każde powtarzalne pytanie w arkuszu.", support: "Szablon arkusza VoC od FRONT." },
                  { w: "Tydzień 2", mission: "Priorytetyzacja", task: "Wklej tu listę TOP 10 najczęstszych pytań.", support: "Przydzielę im poziom trudności i wagę." },
                  { w: "Tydzień 3", mission: "Akceptacja Manifestu", task: "Przeszkol zespół z nowego stylu (Step 3).", support: "Wzór prezentacji wdrożeniowej." },
                  { w: "Tydzień 4", mission: "Pełne Wdrożenie", task: "Publikacja FAQ i wdrożenie metryk KPI.", support: "Raport końcowy z audytu FRONT." }
                ].map(row => (
                  <div key={row.w} className="p-8 grid grid-cols-1 md:grid-cols-4 gap-8 hover:bg-slate-50 transition-colors group">
                    <span className="font-extrabold text-blue-600 text-lg">{row.w}</span>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-slate-400 font-extrabold tracking-widest mb-1">Misja Tygodnia</span>
                      <span className="font-bold text-slate-900 group-hover:text-blue-900 transition-colors">{row.mission}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-slate-400 font-extrabold tracking-widest mb-1">Zadanie Zespołu</span>
                      <span className="text-sm text-slate-600 font-medium">{row.task}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-slate-400 font-extrabold tracking-widest mb-1">Rola AI FRONT</span>
                      <span className="text-sm italic text-slate-500 font-medium">{row.support}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={nextStep} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">
              Akceptuję plan i zaczynamy sprint →
            </button>
          </div>
        );

      case StepId.FEEDBACK:
        return (
          <div className="space-y-6">
            <header>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">8. Zamknięta Pętla Feedbacku</h2>
              <p className="text-slate-500 mt-2 font-medium">Jak sprawić, by błędy operacyjne stawały się innowacjami produktowymi?</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative pt-16 group hover:shadow-xl transition-all">
                <div className="absolute top-0 left-8 -translate-y-1/2 w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-extrabold text-xl shadow-lg shadow-blue-600/30 group-hover:rotate-6 transition-transform">1</div>
                <h4 className="font-extrabold mb-4 text-slate-900 uppercase tracking-widest text-sm">ZBIERAJ (Triage)</h4>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Każde zgłoszenie oznaczaj tagiem: błąd, sugestia, pytanie o brak.</p>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative pt-16 group hover:shadow-xl transition-all">
                <div className="absolute top-0 left-8 -translate-y-1/2 w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-extrabold text-xl shadow-lg shadow-indigo-600/30 group-hover:rotate-6 transition-transform">2</div>
                <h4 className="font-extrabold mb-4 text-slate-900 uppercase tracking-widest text-sm">ANALIZUJ (FRONT)</h4>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Wysyłaj do mnie logi z całego tygodnia. Wskażę, które 2 zmiany dadzą 80% wzrostu CSAT.</p>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative pt-16 group hover:shadow-xl transition-all">
                <div className="absolute top-0 left-8 -translate-y-1/2 w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-extrabold text-xl shadow-lg shadow-emerald-600/30 group-hover:rotate-6 transition-transform">3</div>
                <h4 className="font-extrabold mb-4 text-slate-900 uppercase tracking-widest text-sm">DZIAŁAJ (Backlog)</h4>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Przekazuj wnioski prosto do działu IT/Produktu. Zamknij pętlę informacją dla klienta.</p>
              </div>
            </div>
            <button onClick={nextStep} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20">
              Wdróż kulturę feedbacku →
            </button>
          </div>
        );

      case StepId.PROACTIVE:
        return (
          <div className="space-y-6">
            <header>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">9. Finał: Strategia Proaktywna</h2>
              <p className="text-slate-500 mt-2 font-medium">Wchodzisz na poziom mistrzowski: zapobiegasz pytaniom, zanim w ogóle powstaną w głowie klienta.</p>
            </header>

            {!state.proactive.strategy ? (
              <div className="bg-white p-16 rounded-[3rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-8 hover:border-blue-300 transition-colors group">
                <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-bounce"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Kompilacja Systemu FRONT</h3>
                  <p className="text-slate-500 max-w-lg mt-4 font-medium leading-relaxed">Przeanalizuję Misję, Manifest, Głos Twoich Klientów oraz Dashboard, aby stworzyć Twój unikalny plan Proaktywnego CX.</p>
                </div>
                <button 
                  disabled={loading}
                  onClick={handleProactiveAnalysis}
                  className="bg-blue-600 text-white px-16 py-5 rounded-2xl font-extrabold text-lg hover:bg-blue-700 transition-all disabled:opacity-50 shadow-2xl shadow-blue-600/40"
                >
                  {loading ? 'Łączę kropki i dane...' : 'Wygeneruj Finalną Strategię'}
                </button>
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-700">
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50">
                   <div className="prose prose-slate max-w-none whitespace-pre-wrap text-lg leading-relaxed font-medium text-slate-700">
                     {state.proactive.strategy}
                   </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-12 rounded-[3rem] shadow-2xl text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0 100 C 20 0 50 0 100 100 Z" fill="white"/></svg>
                  </div>
                  <h3 className="text-4xl font-black text-white mb-4 tracking-tighter">System FRONT Gotowy.</h3>
                  <p className="text-emerald-50 text-xl font-medium max-w-2xl mx-auto leading-relaxed">Zbudowałeś właśnie fundamenty pod najlepszą obsługę klienta w swojej branży. Pamiętaj: CX to maraton, nie sprint.</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
                      <button onClick={() => window.location.reload()} className="bg-white text-emerald-600 px-12 py-5 rounded-2xl font-black text-lg hover:bg-emerald-50 transition-all shadow-xl">
                        RESETUJ PROCES
                      </button>
                      <button onClick={() => window.print()} className="bg-emerald-800/30 backdrop-blur-md text-white border border-emerald-400/30 px-12 py-5 rounded-2xl font-black text-lg hover:bg-emerald-800/40 transition-all">
                        DRUKUJ STRATEGIĘ
                      </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return <div>Unknown Step</div>;
    }
  };

  return (
    <Layout currentStep={state.currentStep}>
      {renderStep()}
    </Layout>
  );
};

export default App;
