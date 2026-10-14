import React, { useState } from 'react';
import { 
  clasificarViabilidadMeta, 
  generarPlanEstandar, 
  generarPlanAvanzadoCoT 
} from './services/ollamaService';

function App() {
  const [loading, setLoading] = useState(false);
  const [tipoPrueba, setTipoPrueba] = useState('');
  const [resultado, setResultado] = useState(null);

  // Datos de prueba simulados
  const datosFinancieros = {
    ingresosMensuales: 15000,
    gastosFijos: 8000,
    gastosVariables: 3000,
    ahorroActual: 5000
  };

  const metaEjemplo = {
    nombre: "Fondo de Emergencia / Equipamiento",
    costo: 12000,
    plazoDias: 60
  };

  const deudasEjemplo = [
    { concepto: "Tarjeta de Crédito", monto: 4000, interesAnual: "24%" }
  ];

  // Handler 1: Clasificación Flash (llama3.2:3b)
  const handleProbarFlash = async () => {
    setLoading(true);
    setTipoPrueba('Clasificación Flash (llama3.2:3b)');
    setResultado(null);
    const res = await clasificarViabilidadMeta(datosFinancieros, metaEjemplo);
    setResultado(res);
    setLoading(false);
  };

  // Handler 2: Plan Estándar (llama3.1:8b)
  const handleProbarEstandar = async () => {
    setLoading(true);
    setTipoPrueba('Plan Estándar (llama3.1:8b)');
    setResultado(null);
    const res = await generarPlanEstandar(datosFinancieros, metaEjemplo);
    setResultado(res);
    setLoading(false);
  };

  // Handler 3: Plan Avanzado CoT (llama3.1:8b)
  const handleProbarAvanzado = async () => {
    setLoading(true);
    setTipoPrueba('Plan Avanzado CoT (llama3.1:8b)');
    setResultado(null);
    const res = await generarPlanAvanzadoCoT(datosFinancieros, deudasEjemplo, metaEjemplo);
    setResultado(res);
    setLoading(false);
  };

  return (
    <div style={{
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      backgroundColor: "#fafafa",
      color: "#106057",
      minHeight: "100vh",
      padding: "40px 20px"
    }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        {/* Encabezado */}
        <header style={{ borderBottom: "2px solid #34b8a9", paddingBottom: "15px", marginBottom: "30px" }}>
          <h1 style={{ color: "#106057", fontSize: "2.2rem", margin: 0 }}>📊 Plaris</h1>
          <p style={{ color: "#34b8a9", marginTop: "5px", fontSize: "1.1rem" }}>
            Prueba de Integración - Modelos Meta Llama
          </p>
        </header>

        {/* Panel de Control de Pruebas */}
        <div style={{
          backgroundColor: "#ffffff",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          marginBottom: "30px"
        }}>
          <h2 style={{ fontSize: "1.2rem", color: "#106057", marginTop: 0 }}>
            Ejecutar pruebas de IA Local
          </h2>
          <p style={{ fontSize: "0.95rem", color: "#555", marginBottom: "20px" }}>
            Selecciona el modelo y la tarea que deseas probar con el backend de Ollama:
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={handleProbarFlash}
              disabled={loading}
              style={{
                backgroundColor: "#34b8a9",
                color: "#ffffff",
                border: "none",
                padding: "12px 18px",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1
              }}
            >
              1. Clasificación Flash (3B)
            </button>

            <button
              onClick={handleProbarEstandar}
              disabled={loading}
              style={{
                backgroundColor: "#106057",
                color: "#ffffff",
                border: "none",
                padding: "12px 18px",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1
              }}
            >
              2. Plan Estándar (8B)
            </button>

            <button
              onClick={handleProbarAvanzado}
              disabled={loading}
              style={{
                backgroundColor: "#ffd53f",
                color: "#106057",
                border: "none",
                padding: "12px 18px",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1
              }}
            >
              3. Plan Avanzado CoT (8B)
            </button>
          </div>
        </div>

        {/* Estado de Carga */}
        {loading && (
          <div style={{
            backgroundColor: "#e6f4f2",
            borderLeft: "4px solid #34b8a9",
            padding: "15px 20px",
            borderRadius: "6px",
            marginBottom: "20px"
          }}>
            <strong style={{ color: "#106057" }}>Procesando consulta...</strong>
            <p style={{ margin: "5px 0 0 0", fontSize: "0.9rem", color: "#555" }}>
              Esperando respuesta del modelo en Ollama local.
            </p>
          </div>
        )}

        {/* Visor de Resultados */}
        {resultado && (
          <div style={{
            backgroundColor: "#ffffff",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
          }}>
            <h3 style={{ marginTop: 0, color: "#106057", fontSize: "1.1rem" }}>
              Respuesta recibida: <span style={{ color: "#34b8a9" }}>{tipoPrueba}</span>
            </h3>
            <pre style={{
              backgroundColor: "#222",
              color: "#a6e22e",
              padding: "15px",
              borderRadius: "8px",
              overflowX: "auto",
              fontSize: "0.88rem",
              lineHeight: "1.4"
            }}>
              {JSON.stringify(resultado, null, 2)}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;