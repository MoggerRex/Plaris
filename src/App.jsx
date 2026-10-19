import React, { useState } from "react";
import { prepararContextoFinanciero } from "./utils/selectores";
import { emptyDbState } from "./data/mockDb";
import { generarPlanAvanzadoCoT } from './services/ollamaService'; //[cite: 1, 2]

function App() {
  const [db, setDb] = useState(emptyDbState);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  // datos simulados para llenar la base de datos (el mockDb.js)
  const simularIngreso = () => {
    const nuevoIngreso = {
      id: `tx_${Date.now()}`,
      fecha: "2026-10-15",
      tipo: "ingreso",
      categoria: "Trabajo Fijo",
      monto: 15000,
      detalles: "Pago quincena",
      origen_datos: "usuario"
    };
    
    setDb(prev => ({
      ...prev,
      tracking_transacciones: [...prev.tracking_transacciones, nuevoIngreso]
    }));
  };

  const simularGasto = () => {
    const nuevoGasto = {
      id: `tx_${Date.now()}`,
      fecha: "2026-10-16",
      tipo: "gasto",
      categoria: "Despensa",
      monto: 16000, 
      detalles: "Supermercado excedido",
      origen_datos: "usuario"
    };
    
    setDb(prev => ({
      ...prev,
      tracking_transacciones: [...prev.tracking_transacciones, nuevoGasto]
    }));
  };

  // estas son las funciones que se utilizarian para agregar datos nuevo al estado de la db
  const agregarTransaccion = (nuevaTransaccion) => {
    setDb((prevDb) => {
      return {
        ...prevDb, 
        tracking_transacciones: [
          ...prevDb.tracking_transacciones, 
          nuevaTransaccion 
        ]
      };
    });
  };

  const guardarPresupuestoMes = (mes, datosPresupuesto) => {
    setDb((prevDb) => {
      return {
        ...prevDb, 
        presupuesto_planificado: {
          ...prevDb.presupuesto_planificado, 
          [mes]: datosPresupuesto 
        }
      };
    });
  };


  // ejemplo de como se veria la consulta a Ollama
  const handleConsultarAsesor = async () => {
    setLoading(true);
    setResultado(null);
    
    // extrae los datos procesados del js
    const contextoDigerido = prepararContextoFinanciero(db);
    const deudas = db.deudas_activas;
    const metaPrincipal = db.metas_financieras[0] || { nombre: "Ajuste de presupuesto", costo: 0, plazoDias: 30 };
    
    // se le mandan a llama
    const res = await generarPlanAvanzadoCoT(contextoDigerido, deudas, metaPrincipal);
    setResultado(res);
    setLoading(false);
  };

  const contextoActual = prepararContextoFinanciero(db);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Dashboard ZeroBasedBudget</h1>
      
      <div style={{ border: "1px solid #ccc", padding: "15px", marginBottom: "20px" }}>
        <h3>Estado Financiero Actual (Oct 2026)</h3>
        <p>Ingresos Reales: ${contextoActual.ingresos.real}</p>
        <p>Gastos Reales: ${contextoActual.gastos.real}</p>
        <p style={{ color: contextoActual.balanceActual < 0 ? "red" : "green", fontWeight: "bold" }}>
          Balance: ${contextoActual.balanceActual}
        </p>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button onClick={simularIngreso}>+ Agregar Ingreso de $15,000</button>
        <button onClick={simularGasto}>- Agregar Gasto de $16,000</button>
      </div>

      <button 
        onClick={handleConsultarAsesor} 
        disabled={loading}
        style={{ padding: "10px 20px", backgroundColor: "#106057", color: "white", border: "none" }}
      >
        {loading ? "Analizando..." : "Consultar a Ollama (Plan Avanzado)"}
      </button>

      {resultado && (
        <pre style={{ background: "#222", color: "#a6e22e", padding: "15px", marginTop: "20px" }}>
          {JSON.stringify(resultado, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default App;