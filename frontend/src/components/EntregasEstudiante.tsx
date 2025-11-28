import React from "react";
import type { EntregasProps } from "../types";
import styles from '../assets/styles/Entregas.module.css'; 

const EntregasEstudiante: React.FC<EntregasProps> = ({ misEntregas }) => {
    return (
        <div className={styles.seccionEntregas}>
            <h3>Entregas realizadas</h3>
            {misEntregas.length > 0
                ? (
                    <div className={styles.listaEntregas}>
                        {misEntregas.map(entrega => {
                            let colorEstado: string;
                            if (entrega.estado === "PENDIENTE") {
                                colorEstado = "orange";
                            } else if (entrega.estado === "APROBADA") {
                                colorEstado = "green";
                            } else {
                                colorEstado = "red";
                            }
                            
                            const estadoTexto = entrega.estado === "RECHAZADA" ? "SUSPENSA" : entrega.estado;

                            return (
                                <div 
                                    key={entrega.id} 
                                    className={`${styles.enterga_item} ${styles[`estado_${entrega.estado.toLowerCase()}`]}`}
                                >
                                    <h4>Tarea: {entrega.tarea_titulo}</h4>
                                    <p>
                                        <strong>Archivo:</strong> {entrega.ruta}
                                    </p>
                                    <p style={{ color: colorEstado }}>
                                        <strong style={{ color: "black" }}>Estado:</strong> {estadoTexto}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )
                : (
                    <p>No has realizado ninguna entrega todavía.</p>
                )
            }
        </div>
    );
};

export default EntregasEstudiante;