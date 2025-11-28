import React from "react";
import type { EntregasProfProps } from "../types";
import styles from '../assets/styles/Entregas.module.css'; 

const EntregasProfesorAdmin: React.FC<EntregasProfProps> = ({ entregasPendientes, handleCalificar }) => {
    return (
        <div className={styles.seccionEntregas}>
            <h3>Entregas pendientes de calificar</h3>
            {entregasPendientes.length > 0
                ? (
                    <div className={styles.listaEntregas}>
                        {entregasPendientes.map(entrega => (
                            <div key={entrega.id} className={`${styles.enterga_item} ${styles[`estado_${entrega.estado.toLowerCase()}`]}`}>
                                <h4>Tarea: {entrega.tarea_titulo}</h4>
                                <p>
                                    <strong>Estudiante ID:</strong> {entrega.estudiante_id}
                                </p>
                                <p>
                                    <strong>Archivo:</strong> {entrega.ruta}
                                </p>
                                <p style={{color: 
                                    entrega.estado === "PENDIENTE" ? "orange"
                                    : entrega.estado === "APROBADA" ? "green"
                                    : "red"
                                }}>
                                    <strong style={{color: "black"}}>Estado:</strong> {entrega.estado}
                                </p>
                                <div className={styles.acciones_calificacion}>
                                    <button onClick={() => handleCalificar(entrega.id, "APROBADA")} className={styles.btn_aprobar}>✅ Aprobar</button>
                                    <button onClick={() => handleCalificar(entrega.id, "RECHAZADA")} className={styles.btn_suspender}>❌ Suspender</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
                : (
                    <p>No hay entregas pendientes para calificar.</p>
                )
            }
        </div>
    );
};

export default EntregasProfesorAdmin;