import type React from "react";
import type { PanelProfesor } from "../types";
import styles from "../assets/styles/Tareas.module.css"
import { useAuth } from "../hooks/useAuth";

const ContenidoAdminProfesor: React.FC<PanelProfesor> = ({tareasDisponibles, handleCrearTarea}) => {
    const {user} = useAuth();
    
    return (
        <div className={styles.tareas}>
            <h1>Gestión de Tareas</h1>


            {user?.role === "PROFESOR" ? (
                <h2>Panel de PROFESOR</h2>
            ) : 
                <h2>Panel de ADMINISTRADOR</h2>
            }
            <hr />
            <div id={styles.div_btn}>
                <button onClick={handleCrearTarea} className={styles.btn_crear}>
                    ➕ Crear nueva tarea
                </button>
            </div>
            <div className={styles.seccion_tareas_creadas}>
                <h3>Ultimas tareas creadas</h3>
                {tareasDisponibles.length > 0 
                    ? (
                        <div className={styles.lista_tareas}>
                            {tareasDisponibles.map(tarea => (
                                <div key={tarea.id} className={styles.tarea_card}>
                                    <h4>{tarea.titulo}</h4>
                                    <p>Descripción: {tarea.descripcion}</p>
                                    <p>Puntos: {tarea.recompensa} 🌟</p>
                                </div>
                            ))}
                        </div>
                    )
                    : (
                        <p>No has creado ninguna tarea todavía</p>
                    )
                }
            </div>
        </div>
    );
}

export default ContenidoAdminProfesor;