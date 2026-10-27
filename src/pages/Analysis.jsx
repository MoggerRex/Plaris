import { useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { financeSections } from '../config/financeSections';
import { useMonthBudget } from '../hooks/useMonthBudget';
import { selectedFinanceContext } from '../services/financeAdapter';
import { analysisMovements } from '../services/analysisMovements';
import FinanceChat from '../components/analysis/FinanceChat';
import AnalysisWorkspace from '../components/analysis/AnalysisWorkspace';
import { AnalysisDataTable, AnalysisCategoryDetail } from '../components/analysis/AnalysisTables';
import MonthPicker from '../components/common/MonthPicker';

export default function Analysis() {
  const state = useMonthBudget();
  const [selectedIds, setSelectedIds] = useState([]);
  const chat = useRef(null);
  const workspace = useRef(null);
  const sections = financeSections.map((item) => item.key);
  const context = selectedFinanceContext(
    state.budget,
    state.deudas_activas,
    state.comparison,
    sections,
    state.month,
    state.transactions,
  );
  context.perfil = {
    nombre: state.profile.displayName || '',
    ahorroActual: Number(state.profile.savings || 0),
    reservaProtegida: Number(state.profile.reserve || 0),
    meta: {
      nombre: state.profile.goalName || '',
      costo: Number(state.profile.cost || 0),
      plazoDias: Number(state.profile.days || 90),
    },
  };
  const movements = analysisMovements(state.transactions, sections, state.month);
  const ask = (text) => {
    workspace.current?.revealPanel('chat');
    chat.current?.prepareQuestion(text);
  };

  return (
    <main className="page-shell analysis-page">
      <header className="analysis-heading">
        <div>
          <span className="eyebrow">
            <Sparkles size={14} /> Tu copiloto financiero
          </span>
          <h1>Tu dinero, con perspectiva</h1>
          <p>Conversa con Plaris y explora los movimientos que dan contexto a tus decisiones.</p>
        </div>
        <MonthPicker
          month={state.month}
          onChange={(month) => {
            setSelectedIds([]);
            state.changeMonth(month);
          }}
        />
      </header>
      <AnalysisWorkspace
        ref={workspace}
        panels={{
          chat: {
            title: 'Plaris · Tu copiloto',
            badge: <span className="analysis-local-badge">Ollama local</span>,
            content: (
              <FinanceChat
                key={JSON.stringify(context)}
                ref={chat}
                context={context}
                onSave={state.saveAnalysis}
              />
            ),
          },
          data: {
            title: 'Tus datos',
            content: (
              <AnalysisDataTable
                key={state.month}
                movements={movements}
                comparison={state.comparison}
                budget={state.budget}
                debts={state.deudas_activas}
                breakdown={context.desgloseGastos || []}
                selectedIds={selectedIds}
                onToggle={(id) =>
                  setSelectedIds((previous) =>
                    previous.includes(id)
                      ? previous.filter((item) => item !== id)
                      : [...previous, id],
                  )
                }
                onClear={() => setSelectedIds([])}
                onAsk={ask}
              />
            ),
          },
          detail: {
            title: 'Detalle de la categoría',
            content: (
              <AnalysisCategoryDetail
                key={state.month}
                breakdown={context.desgloseGastos || []}
                onAsk={ask}
              />
            ),
          },
        }}
      />
    </main>
  );
}
