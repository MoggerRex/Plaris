import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMonthBudget } from '../../hooks/useMonthBudget';
import { SquarePen, TextSearch, PanelLeftClose } from 'lucide-react';
import AnalysisHistory from '../analysis/AnalysisHistory';

export default function TemplateSidebar({ onNavigate, onToggle, isOpen }) {
  const { savedTemplates, profile, month, analysisHistory, deleteAnalysis } = useMonthBudget();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  function openSavedAnalysis(record) {
    if (!record?.id) return;
    const params = new URLSearchParams();
    params.set('mes', record.month || month);
    params.set('analisis', record.id);
    navigate(`/dashboard?${params.toString()}`);
    onNavigate?.();
  }

  function deleteSavedAnalysis(record) {
    deleteAnalysis(record);

    // Si el análisis eliminado es el que se está viendo, vuelve al agente.
    if (record?.id && searchParams.get('analisis') === record.id) {
      const params = new URLSearchParams(searchParams);
      params.delete('analisis');
      params.set('mes', record.month || month);
      navigate(`/dashboard?${params.toString()}`, { replace: true });
    }
  }

  const animationConfig = {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1],
  };

  return (
    <motion.aside
      className="template-sidebar"
      id="template-sidebar"
      initial={false}
      animate={{ x: isOpen ? 0 : '-100%' }}
      transition={animationConfig}
    >
      {/* SECCIÓN 0: Cerrar menú */}
      <section className="sidebar-section">
        <button
          type="button"
          className="sidebar-action-button"
          onClick={onToggle}
          aria-controls="template-sidebar"
          aria-label="Cerrar menú"
        >
          <PanelLeftClose size={18} />
          Menu PLARIS
        </button>
      </section>

      {/* SECCIÓN 1: Acciones */}
      <section className="sidebar-section" aria-labelledby="sidebar-acciones">
        <span className="eyebrow" id="sidebar-acciones">
          Acciones
        </span>
        <Link
          className="sidebar-action-button"
          to={'/plantillas?mes=' + month}
          onClick={onNavigate}
        >
          <SquarePen size={18} />
          Nueva plantilla
        </Link>
        <Link className="sidebar-action-button" to={'/analisis?mes=' + month} onClick={onNavigate}>
          <TextSearch size={18} />
          Análisis de tus datos
        </Link>
      </section>

      {/* Análisis guardados */}
      <section className="sidebar-section" aria-labelledby="sidebar-analisis">
        <span className="eyebrow" id="sidebar-analisis">
          Análisis guardados
        </span>
        <AnalysisHistory
          records={analysisHistory}
          onSelect={openSavedAnalysis}
          onDelete={deleteSavedAnalysis}
        />
      </section>

      {/* SECCIÓN 2: Plantillas guardadas */}
      <section className="sidebar-section" aria-labelledby="sidebar-plantillas">
        <span className="eyebrow" id="sidebar-plantillas">
          Plantillas guardadas
        </span>
        {savedTemplates.map((item) => (
          <Link
            key={item.id}
            className="sidebar-action-button"
            to={'/plantillas?mes=' + month + '#plantilla-' + item.id}
            onClick={onNavigate}
          >
            {item.name}
          </Link>
        ))}
        {!savedTemplates.length && (
          <p className="sidebar-empty">No has guardado plantillas todavía.</p>
        )}
      </section>

      {/* Perfil, pegado al fondo */}
      <Link
        className="sidebar-action-button sidebar-profile"
        to="/perfil/resumen"
        onClick={onNavigate}
      >
        {profile.displayName || 'Mi perfil'}
      </Link>
    </motion.aside>
  );
}
