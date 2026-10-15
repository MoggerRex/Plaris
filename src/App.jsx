import React, { useState } from 'react';
import ResultadoAsesoria from './components/ResultadoAsesoria';
import { 
  clasificarViabilidadMeta, 
  generarPlanEstandar, 
  generarPlanAvanzadoCoT 
} from './services/ollamaService';

function App() {
  // Estado para la selección de plan ('estandar' | 'avanzado')
  const [tipoPlan, setTipoPlan] = useState('estandar');

  // Estados del formulario para Datos Financieros
  const [datosFinancieros, setDatosFinancieros] = useState({
    ingresosMensuales: 18000,
    gastosFijos: 8500,
    gastosVariables: 3500,
    ahorroActual: 6000
  });

  // Estados del formulario para la Meta / Problemática
  const [meta, setMeta] = useState({
    nombre: "Comprar Laptop de Trabajo",
    costo: 22000,
    plazoDias: 90,
    descripcionProblematica: "Necesito renovar mi equipo principal porque falla frecuentemente, pero no quiero desarmar todo mi fondo de emergencia actual."
  });

  // Estados del formulario para Deudas (exclusivo Plan Avanzado)
  const [deudas, setDeudas] = useState([
    { concepto: "Tarjeta de Crédito Santander", monto: 5000, interesAnual: "28%" }
  ]);

  // Estados de carga y resultados
  const [loading, setLoading] = useState(false);
  const [etapaActual, setEtapaActual] = useState('');
  const [resultado, setResultado] = useState(null);

  // Manejadores de cambios en los inputs
const handleDatosFinancierosChange = (e) => {
  const { name, value } = e.target;
  setDatosFinancieros(prev => ({
    ...prev,
    [name]: name === 'ahorroParaMeta' && value === '' ? undefined : Number(value)
  }));
};

  const handleMetaChange = (e) => {
    const { name, value } = e.target;
    setMeta(prev => ({ 
      ...prev, 
      [name]: name === 'costo' || name === 'plazoDias' ? Number(value) : value 
    }));
  };

  const handleDeudaChange = (index, e) => {
    const { name, value } = e.target;
    const nuevasDeudas = [...deudas];
    nuevasDeudas[index] = { ...nuevasDeudas[index], [name]: name === 'monto' ? Number(value) : value };
    setDeudas(nuevasDeudas);
  };

  const agregarDeuda = () => {
    setDeudas([...deudas, { concepto: '', monto: 0, interesAnual: '' }]);
  };

  const eliminarDeuda = (index) => {
    setDeudas(deudas.filter((_, i) => i !== index));
  };

  // Proceso principal al enviar el formulario
  const handleGenerarAsesoria = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResultado(null);

    // 1. Paso A: Clasificación Flash con llama3.2:3b
    setEtapaActual('1/2 Clasificando viabilidad de la meta (llama3.2:3b)...');
    const clasificacion = await clasificarViabilidadMeta(
      datosFinancieros, meta, tipoPlan === 'avanzado' ? deudas : []
    );
    if (clasificacion.error) {
      setResultado(clasificacion);
      setLoading(false);
      setEtapaActual('');
      return;
    }

    // 2. Paso B: Asesoría con llama3.1:8b según el plan seleccionado
    if (tipoPlan === 'estandar') {
      setEtapaActual('2/2 Diseñando Plan Estándar y estructura de gráficas (llama3.1:8b)...');
      const planEstandar = await generarPlanEstandar(datosFinancieros, meta, clasificacion);
      
      setResultado({
        plan: "Estándar",
        clasificacionFlash: clasificacion,
        asesoria: planEstandar
      });
    } else {
      setEtapaActual('2/2 Ejecutando análisis financiero profundo CoT (llama3.1:8b)...');
      const planAvanzado = await generarPlanAvanzadoCoT(datosFinancieros, deudas, meta, clasificacion);

      setResultado({
        plan: "Avanzado (Chain of Thought)",
        clasificacionFlash: clasificacion,
        asesoria: planAvanzado
      });
    }

    setLoading(false);
    setEtapaActual('');
  };

  return (
    <div style={{
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      backgroundColor: "#fafafa",
      color: "#106057",
      minHeight: "100vh",
      padding: "40px 20px"
    }}>
      <div style={{ maxWidth: "850px", margin: "0 auto" }}>
        
        {/* Encabezado Principal */}
        <header style={{ borderBottom: "3px solid #34b8a9", paddingBottom: "15px", marginBottom: "30px" }}>
          <h1 style={{ color: "#106057", fontSize: "2.4rem", margin: 0, fontWeight: "bold" }}>📊 Plaris</h1>
          <p style={{ color: "#34b8a9", marginTop: "5px", fontSize: "1.1rem" }}>
            Plataforma de Asesoría Financiera Inteligente con Meta Llama
          </p>
        </header>

        {/* PASO 1: Selección del Tipo de Plan */}
        <section style={{
          backgroundColor: "#ffffff",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          marginBottom: "25px"
        }}>
          <h2 style={{ fontSize: "1.2rem", color: "#106057", marginTop: 0 }}>
            1. Elige el tipo de Asesoría
          </h2>
          
          <div style={{ display: "flex", gap: "15px", marginTop: "15px" }}>
            <button
              type="button"
              onClick={() => setTipoPlan('estandar')}
              style={{
                flex: 1,
                padding: "16px",
                borderRadius: "10px",
                border: tipoPlan === 'estandar' ? "3px solid #34b8a9" : "2px solid #e0e0e0",
                backgroundColor: tipoPlan === 'estandar' ? "#e6f4f2" : "#ffffff",
                color: "#106057",
                cursor: "pointer",
                fontWeight: "bold",
                textAlign: "left",
                transition: "all 0.2s"
              }}
            >
              <div style={{ fontSize: "1.1rem" }}>📊 Plan Estándar</div>
              <div style={{ fontSize: "0.85rem", color: "#555", marginTop: "5px", fontWeight: "normal" }}>
                Clasificación rápida de viabilidad + plan de ahorro por semanas estructurado para gráficas.
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTipoPlan('avanzado')}
              style={{
                flex: 1,
                padding: "16px",
                borderRadius: "10px",
                border: tipoPlan === 'avanzado' ? "3px solid #ffd53f" : "2px solid #e0e0e0",
                backgroundColor: tipoPlan === 'avanzado' ? "#fffdf0" : "#ffffff",
                color: "#106057",
                cursor: "pointer",
                fontWeight: "bold",
                textAlign: "left",
                transition: "all 0.2s"
              }}
            >
              <div style={{ fontSize: "1.1rem" }}>🧠 Plan Avanzado (CoT)</div>
              <div style={{ fontSize: "0.85rem", color: "#555", marginTop: "5px", fontWeight: "normal" }}>
                Análisis financiero profundo paso a paso, estrategia de liquidación de deudas y mitigación de riesgos.
              </div>
            </button>
          </div>
        </section>

        {/* PASO 2: Formulario de Datos */}
        <form onSubmit={handleGenerarAsesoria}>
          <section style={{
            backgroundColor: "#ffffff",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            marginBottom: "25px"
          }}>
            <h2 style={{ fontSize: "1.2rem", color: "#106057", marginTop: 0 }}>
              2. Ingresa tus Datos Financieros
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginTop: "15px" }}>
              <div>
                <label style={labelStyle}>Ingresos Mensuales ($):</label>
                <input
                  type="number"
                  name="ingresosMensuales"
                  value={datosFinancieros.ingresosMensuales}
                  onChange={handleDatosFinancierosChange}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Gastos Fijos Mensuales ($):</label>
                <input
                  type="number"
                  name="gastosFijos"
                  value={datosFinancieros.gastosFijos}
                  onChange={handleDatosFinancierosChange}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Gastos Variables Estimados ($):</label>
                <input
                  type="number"
                  name="gastosVariables"
                  value={datosFinancieros.gastosVariables}
                  onChange={handleDatosFinancierosChange}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Ahorro Actual Disponible ($):</label>
                <input
                  type="number"
                  name="ahorroActual"
                  value={datosFinancieros.ahorroActual}
                  onChange={handleDatosFinancierosChange}
                  style={inputStyle}
                  required
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>De ese ahorro, ¿cuánto es para la meta? ($) — opcional:</label>
                <input
                  type="number"
                  name="ahorroParaMeta"
                  value={datosFinancieros.ahorroParaMeta ?? ''}
                  onChange={handleDatosFinancierosChange}
                  style={inputStyle}
                  placeholder="Vacío = se llena primero el fondo de emergencia"
                />
              </div>
            </div>
          </section>

          {/* Sección de Meta / Problemática */}
          <section style={{
            backgroundColor: "#ffffff",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            marginBottom: "25px"
          }}>
            <h2 style={{ fontSize: "1.2rem", color: "#106057", marginTop: 0 }}>
              3. Define tu Meta o Problemática
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "15px" }}>
              <div>
                <label style={labelStyle}>Nombre de la Meta / Objetivo:</label>
                <input
                  type="text"
                  name="nombre"
                  value={meta.nombre}
                  onChange={handleMetaChange}
                  style={inputStyle}
                  placeholder="Ej. Fondo de Emergencia, Comprar Auto, Liquidar Tarjeta"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div>
                  <label style={labelStyle}>Monto / Costo Requerido ($):</label>
                  <input
                    type="number"
                    name="costo"
                    value={meta.costo}
                    onChange={handleMetaChange}
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>Plazo Deseado (en Días):</label>
                  <input
                    type="number"
                    name="plazoDias"
                    value={meta.plazoDias}
                    onChange={handleMetaChange}
                    style={inputStyle}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Explica tu situación o problemática actual:</label>
                <textarea
                  name="descripcionProblematica"
                  value={meta.descripcionProblematica}
                  onChange={handleMetaChange}
                  style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
                  placeholder="Describe los detalles de tu meta o las dificultades financieras que enfrentas..."
                  required
                />
              </div>
            </div>
          </section>

          {/* Sección de Deudas (Solo en Plan Avanzado) */}
          {tipoPlan === 'avanzado' && (
            <section style={{
              backgroundColor: "#ffffff",
              padding: "25px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              marginBottom: "25px",
              borderLeft: "5px solid #ffd53f"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontSize: "1.2rem", color: "#106057", margin: 0 }}>
                  4. Registro de Deudas Activas (Para Análisis CoT)
                </h2>
                <button
                  type="button"
                  onClick={agregarDeuda}
                  style={{
                    backgroundColor: "#34b8a9",
                    color: "#fff",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
                >
                  + Agregar Deuda
                </button>
              </div>

              {deudas.map((deuda, index) => (
                <div key={index} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: "10px", marginTop: "15px", alignItems: "center" }}>
                  <input
                    type="text"
                    name="concepto"
                    placeholder="Ej. Tarjeta de Crédito"
                    value={deuda.concepto}
                    onChange={(e) => handleDeudaChange(index, e)}
                    style={inputStyle}
                    required
                  />
                  <input
                    type="number"
                    name="monto"
                    placeholder="Monto ($)"
                    value={deuda.monto}
                    onChange={(e) => handleDeudaChange(index, e)}
                    style={inputStyle}
                    required
                  />
                  <input
                    type="text"
                    name="interesAnual"
                    placeholder="Interés (ej. 24%)"
                    value={deuda.interesAnual}
                    onChange={(e) => handleDeudaChange(index, e)}
                    style={inputStyle}
                    required
                  />
                  {deudas.length > 1 && (
                    <button
                      type="button"
                      onClick={() => eliminarDeuda(index)}
                      style={{
                        backgroundColor: "#e74c3c",
                        color: "#fff",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        cursor: "pointer"
                      }}
                    >
                      X
                    </button>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Botón de Envío */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              backgroundColor: tipoPlan === 'estandar' ? "#34b8a9" : "#106057",
              color: "#ffffff",
              border: "none",
              padding: "16px",
              borderRadius: "10px",
              fontSize: "1.1rem",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              opacity: loading ? 0.7 : 1,
              transition: "all 0.2s",
              marginBottom: "30px"
            }}
          >
            {loading ? "Procesando Asesoría con IA..." : `🚀 Generar Asesoría (${tipoPlan === 'estandar' ? 'Plan Estándar' : 'Plan Avanzado'})`}
          </button>
        </form>

        {/* Banner de Estado de Carga */}
        {loading && (
          <div style={{
            backgroundColor: "#e6f4f2",
            borderLeft: "5px solid #34b8a9",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "30px"
          }}>
            <strong style={{ color: "#106057", fontSize: "1.05rem" }}>🤖 Ollama está analizando tus datos...</strong>
            <p style={{ margin: "8px 0 0 0", fontSize: "0.95rem", color: "#555" }}>
              {etapaActual}
            </p>
          </div>
        )}

        {/* Visor de Resultados en Formato JSON */}
        {/* Resultados */}
          {resultado && <ResultadoAsesoria resultado={resultado} />}

      </div>
    </div>
  );
}

// Estilos auxiliares reutilizables
const labelStyle = {
  display: "block",
  fontSize: "0.9rem",
  fontWeight: "600",
  color: "#106057",
  marginBottom: "6px"
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "0.95rem",
  boxSizing: "border-box"
};

export default App;