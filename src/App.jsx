import React, { useState, useEffect } from 'react';
import ResultadoAsesoria from './components/ResultadoAsesoria';
import { 
  clasificarViabilidadMeta, 
  generarPlanEstandar, 
  generarPlanAvanzadoCoT 
} from './services/ollamaService';
import { formatearMoneda as $, parsearTasa } from './utils/calculadoraFinanciera';

function App() {
  const [tipoPlan, setTipoPlan] = useState('estandar');

  // Datos financieros base
  const [datosFinancieros, setDatosFinancieros] = useState({
    ingresosMensuales: 30000,
    gastosFijos: 19000,
    gastosVariables: 7000
  });

  // Cálculo automático del ahorro/sobrante mensual
  const sobranteMensual = Math.max(
    0, 
    (Number(datosFinancieros.ingresosMensuales) || 0) - 
    (Number(datosFinancieros.gastosFijos) || 0) - 
    (Number(datosFinancieros.gastosVariables) || 0)
  );

  // Distribución base por defecto: 70% Meta / 30% Emergencia / 0% Deudas
  const [distribucionSobrante, setDistribucionSobrante] = useState({
    meta: { valor: 70, modo: 'porcentaje' },
    emergencia: { valor: 30, modo: 'porcentaje' },
    deudas: { valor: 0, modo: 'porcentaje' }
  });

  const [deudasEditadoManualmente, setDeudasEditadoManualmente] = useState(false);

  // Meta u Objetivo
  const [meta, setMeta] = useState({
    nombre: "Comprar un carro",
    costo: 360000,
    plazoDias: 1440,
    descripcionProblematica: "Quiero comprar un carro, me gustaria comprarlo en 48 meses"
  });

  // Deudas
  const [deudas, setDeudas] = useState([
    { concepto: "Tarjeta de Crédito Liverpool", monto: 6000, interesAnual: "0%" },
    { concepto: "Tarjeta de Crédito Bancomer", monto: 10000, interesAnual: "3%" }
  ]);

  const [loading, setLoading] = useState(false);
  const [etapaActual, setEtapaActual] = useState('');
  const [resultado, setResultado] = useState(null);

  // 1. Cálculo del % equivalente de cada campo para verificar que la suma no supere el 100%
  const obtenerPorcentajeEquivalente = (item) => {
    if (item.valor === '' || sobranteMensual <= 0) return 0;
    const val = Number(item.valor) || 0;
    if (item.modo === 'porcentaje') return val;
    return (val / sobranteMensual) * 100;
  };

  const pctMeta = obtenerPorcentajeEquivalente(distribucionSobrante.meta);
  const pctEmergencia = obtenerPorcentajeEquivalente(distribucionSobrante.emergencia);
  const pctDeudas = obtenerPorcentajeEquivalente(distribucionSobrante.deudas);

  const sumaPorcentajesTotal = Math.round((pctMeta + pctEmergencia + pctDeudas) * 10) / 10;
  const distribucionInvalida = sumaPorcentajesTotal > 100;

  // 2. Cálculo dinámico del interés mensual total de las deudas y su % mínimo necesario
  const interesMensualTotal = deudas.reduce((acc, d) => {
    const m = Number(d.monto) || 0;
    const t = parsearTasa(d.interesAnual);
    return acc + (m * (t / 100)) / 12;
  }, 0);

  let pctMinimoDeudas = 0;
  if (sobranteMensual > 0 && deudas.length > 0) {
    if (interesMensualTotal > 0) {
      pctMinimoDeudas = Math.min(100, Math.ceil((interesMensualTotal / sobranteMensual) * 100));
    } else {
      const totalDeuda = deudas.reduce((acc, d) => acc + (Number(d.monto) || 0), 0);
      pctMinimoDeudas = totalDeuda > 0 ? 10 : 0;
    }
  }

  // 3. Auto-ajustar la distribución en Plan Avanzado para acomodar deudas manteniendo la proporción 70/30 en el sobrante
  useEffect(() => {
    if (tipoPlan === 'avanzado' && deudas.length > 0 && !deudasEditadoManualmente) {
      const restanteParaAhorro = Math.max(0, 100 - pctMinimoDeudas);
      const nuevoMeta = Math.round(restanteParaAhorro * 0.7);
      const nuevoEmergencia = Math.round(restanteParaAhorro * 0.3);

      setDistribucionSobrante({
        meta: { valor: nuevoMeta, modo: 'porcentaje' },
        emergencia: { valor: nuevoEmergencia, modo: 'porcentaje' },
        deudas: { valor: pctMinimoDeudas, modo: 'porcentaje' }
      });
    }
  }, [deudas, sobranteMensual, tipoPlan, pctMinimoDeudas, deudasEditadoManualmente]);

  const handleDatosFinancierosChange = (e) => {
    const { name, value } = e.target;
    setDatosFinancieros(prev => ({
      ...prev,
      [name]: value === '' ? 0 : Number(value)
    }));
  };

  const handleDistribucionChange = (campo, propiedad, valor) => {
    if (campo === 'deudas') {
      setDeudasEditadoManualmente(true);
    }
    setDistribucionSobrante(prev => ({
      ...prev,
      [campo]: {
        ...prev[campo],
        [propiedad]: propiedad === 'valor' ? (valor === '' ? '' : Number(valor)) : valor
      }
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

  const renderCampoDistribucion = (llave, titulo) => {
    const item = distribucionSobrante[llave];
    const val = Number(item.valor) || 0;

    let textoConversion = "";
    let mensajeAlertaDeuda = null;

    if (sobranteMensual > 0 && item.valor !== '') {
      if (item.modo === 'monto') {
        const pct = ((val / sobranteMensual) * 100).toFixed(1);
        textoConversion = `💡 Equivale al ${pct}% de tu sobrante`;
      } else {
        const montoEquiv = (sobranteMensual * (val / 100)).toFixed(2);
        textoConversion = `💡 Equivale a ${$(montoEquiv)} al mes`;
      }
    }

    if (llave === 'deudas' && tipoPlan === 'avanzado' && deudas.length > 0 && item.valor !== '') {
      const pctActual = item.modo === 'porcentaje' ? val : ((val / sobranteMensual) * 100);

      if (pctActual < pctMinimoDeudas) {
        mensajeAlertaDeuda = (
          <div style={{ marginTop: "6px", fontSize: "0.78rem", color: "#d32f2f", fontWeight: "bold" }}>
            ⚠️ Si bajas este porcentaje por debajo del {pctMinimoDeudas}%, no cubrirás los intereses mínimos.
          </div>
        );
      } else if (pctActual > pctMinimoDeudas) {
        mensajeAlertaDeuda = (
          <div style={{ marginTop: "6px", fontSize: "0.78rem", color: "#2e7d32", fontWeight: "bold" }}>
            🚀 ¡Excelente! Al destinar más del mínimo ({pctMinimoDeudas}%), terminarás de pagar tu deuda mucho antes.
          </div>
        );
      } else {
        mensajeAlertaDeuda = (
          <div style={{ marginTop: "6px", fontSize: "0.78rem", color: "#0288d1", fontWeight: "bold" }}>
            ✅ Con este porcentaje mínimo ({pctMinimoDeudas}%) cubrirás tus deudas sin sufrir por intereses.
          </div>
        );
      }
    }

    return (
      <div style={{
        backgroundColor: "#f4f8f8",
        padding: "14px",
        borderRadius: "8px",
        border: distribucionInvalida ? "1px solid #e74c3c" : "1px solid #d0e2e0"
      }}>
        <label style={{ ...labelStyle, fontSize: "0.88rem", marginBottom: "8px" }}>
          {titulo}
        </label>
        
        <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
          <select
            value={item.modo}
            onChange={(e) => handleDistribucionChange(llave, 'modo', e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontWeight: "bold",
              backgroundColor: "#fff",
              color: "#106057",
              cursor: "pointer"
            }}
          >
            <option value="porcentaje">% (Porcentaje)</option>
            <option value="monto">$ (Monto)</option>
          </select>

          <input
            type="number"
            value={item.valor}
            onChange={(e) => handleDistribucionChange(llave, 'valor', e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
            placeholder={item.modo === 'monto' ? "$0.00" : "0%"}
            min="0"
          />
        </div>

        <div style={{ fontSize: "0.78rem", color: "#2c7a70", fontWeight: "600", minHeight: "18px" }}>
          {textoConversion}
        </div>

        {mensajeAlertaDeuda}
      </div>
    );
  };

  const handleGenerarAsesoria = async (e) => {
    e.preventDefault();

    if (distribucionInvalida) {
      alert(`⚠️ Distribución inválida: La suma de tus porcentajes suma ${sumaPorcentajesTotal}%, lo cual excede el 100% de tu sobrante disponible. Por favor ajusta los valores para que no superen el 100% antes de continuar.`);
      return;
    }

    if (Number(meta.costo) < 0 || Number(meta.plazoDias) <= 0) {
      setResultado({ error: "El costo no puede ser negativo y el plazo debe ser mayor que cero." });
      return;
    }

    setLoading(true);
    setResultado(null);

    const datosFinancierosConDistribucion = {
      ...datosFinancieros,
      ahorroActual: sobranteMensual,
      distribucionPersonalizada: {
        meta: distribucionSobrante.meta.modo === 'monto'
          ? Number(distribucionSobrante.meta.valor) || 0
          : (sobranteMensual * (Number(distribucionSobrante.meta.valor) || 0)) / 100,
        emergencia: distribucionSobrante.emergencia.modo === 'monto'
          ? Number(distribucionSobrante.emergencia.valor) || 0
          : (sobranteMensual * (Number(distribucionSobrante.emergencia.valor) || 0)) / 100,
        deudas: distribucionSobrante.deudas.modo === 'monto'
          ? Number(distribucionSobrante.deudas.valor) || 0
          : (sobranteMensual * (Number(distribucionSobrante.deudas.valor) || 0)) / 100
      }
    };

    try {
      setEtapaActual('1/2 Calculando la viabilidad de la meta...');
      const clasificacion = await clasificarViabilidadMeta(
        datosFinancierosConDistribucion, meta, tipoPlan === 'avanzado' ? deudas : []
      );
      if (clasificacion?.error) {
        setResultado(clasificacion);
        return;
      }

      if (tipoPlan === 'estandar') {
        setEtapaActual('2/2 Generando el plan estándar con IA...');
        const planEstandar = await generarPlanEstandar(datosFinancierosConDistribucion, meta, clasificacion);
        if (planEstandar?.error) {
          setResultado(planEstandar);
          return;
        }
        setResultado({
          plan: "Estándar",
          clasificacionFlash: clasificacion,
          asesoria: planEstandar
        });
      } else {
        setEtapaActual('2/2 Generando el análisis avanzado con IA...');
        const planAvanzado = await generarPlanAvanzadoCoT(datosFinancierosConDistribucion, deudas, meta, clasificacion);
        if (planAvanzado?.error) {
          setResultado(planAvanzado);
          return;
        }
        setResultado({
          plan: "Avanzado",
          clasificacionFlash: clasificacion,
          asesoria: planAvanzado
        });
      }
    } catch (error) {
      console.error("Error generando asesoría Plaris:", error);
      setResultado({
        error: "Ocurrió un error al generar la asesoría. Revisa que Ollama esté activo y que los modelos necesarios estén instalados."
      });
    } finally {
      setLoading(false);
      setEtapaActual('');
    }
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
        
        {/* Encabezado */}
        <header style={{ borderBottom: "3px solid #34b8a9", paddingBottom: "15px", marginBottom: "30px" }}>
          <h1 style={{ color: "#106057", fontSize: "2.4rem", margin: 0, fontWeight: "bold" }}>📊 Plaris</h1>
          <p style={{ color: "#34b8a9", marginTop: "5px", fontSize: "1.1rem" }}>
            Plataforma de Asesoría Financiera Inteligente con Meta Llama
          </p>
        </header>

        {/* 1. Selección de Plan */}
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
                textAlign: "left"
              }}
            >
              <div style={{ fontSize: "1.1rem" }}>📊 Plan Estándar</div>
              <div style={{ fontSize: "0.85rem", color: "#555", marginTop: "5px", fontWeight: "normal" }}>
                Clasificación rápida de viabilidad + plan de ahorro por semanas estructurado.
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
                textAlign: "left"
              }}
            >
              <div style={{ fontSize: "1.1rem" }}>🧠 Plan Avanzado (CoT)</div>
              <div style={{ fontSize: "0.85rem", color: "#555", marginTop: "5px", fontWeight: "normal" }}>
                Análisis financiero profundo paso a paso, liquidación de deudas y mitigación de riesgos.
              </div>
            </button>
          </div>
        </section>

        {/* 2. Formulario de Datos */}
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
                <label style={labelStyle}>Ahorro/Sobrante Actual Disponible Mensual ($):</label>
                <input
                  type="number"
                  value={sobranteMensual}
                  readOnly
                  style={{
                    ...inputStyle,
                    backgroundColor: "#eef6f5",
                    fontWeight: "bold",
                    color: "#106057",
                    cursor: "not-allowed"
                  }}
                />
              </div>
            </div>

            {/* Distribución en 3 campos alineados */}
            <div style={{ marginTop: "22px", borderTop: "1px dashed #c0dedb", paddingTop: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <label style={{ ...labelStyle, fontSize: "0.98rem", color: "#106057", margin: 0 }}>
                  De ese ahorro/sobrante, ¿cómo está distribuido mensualmente? ($ o %) — opcional:
                </label>
                <span style={{ 
                  fontSize: "0.88rem", 
                  fontWeight: "bold",
                  color: distribucionInvalida ? "#d32f2f" : "#106057"
                }}>
                  Total distribuido: {sumaPorcentajesTotal}%
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                {renderCampoDistribucion('meta', '🎯 Meta / Objetivo')}
                {renderCampoDistribucion('emergencia', '🛡️ Fondo de Emergencia')}
                {renderCampoDistribucion('deudas', '💳 Deudas')}
              </div>

              {distribucionInvalida && (
                <div style={{
                  marginTop: "12px",
                  padding: "10px 14px",
                  backgroundColor: "#fde8e8",
                  borderLeft: "4px solid #e74c3c",
                  color: "#c0392b",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  borderRadius: "4px"
                }}>
                  ⚠️ La suma de la distribución ({sumaPorcentajesTotal}%) excede el 100% de tu sobrante mensual. Ajusta las proporciones antes de continuar.
                </div>
              )}
            </div>
          </section>

          {/* 3. Meta */}
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
                  required
                />
              </div>
            </div>
          </section>

          {/* 4. Deudas (Solo Avanzado) */}
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

          <button
            type="submit"
            disabled={loading || distribucionInvalida}
            style={{
              width: "100%",
              backgroundColor: distribucionInvalida ? "#95a5a6" : (tipoPlan === 'estandar' ? "#34b8a9" : "#106057"),
              color: "#ffffff",
              border: "none",
              padding: "16px",
              borderRadius: "10px",
              fontSize: "1.1rem",
              fontWeight: "bold",
              cursor: (loading || distribucionInvalida) ? "not-allowed" : "pointer",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              opacity: loading ? 0.7 : 1,
              transition: "all 0.2s",
              marginBottom: "30px"
            }}
          >
            {loading ? "Procesando Asesoría con IA..." : `🚀 Generar Asesoría (${tipoPlan === 'estandar' ? 'Plan Estándar' : 'Plan Avanzado'})`}
          </button>
        </form>

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

        {resultado && <ResultadoAsesoria resultado={resultado} />}
      </div>
    </div>
  );
}

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