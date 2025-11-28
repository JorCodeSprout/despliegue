import type { Entrega, PanelEstudiante } from "../types";
import TareaCard from "./TareaCard";
import styles from "../assets/styles/Tareas.module.css"

const ContendioEstudiante: React.FC<PanelEstudiante> = ({profesor_id, tareasDisponibles, misEntregas, reloadEntregas}) => {
    return (    
        <div className={styles.tareas_estudiante}>
            <h1>Gestión de Tareas</h1>

            <h2>Panel de ESTUDIANTE</h2>
            <hr />

            <div className={styles.tareas_seccion}>
                <h3>
                    {profesor_id 
                        ? "✅Tareas de tu profesor" 
                        : "📜Tareas generales"
                    }
                </h3>
                <p>
                    {profesor_id 
                        ? "Aquí puedes ver el estado de las tareas de tu profesor y subir entregas" 
                        : "No tienes ningún profesor asignado. Viendo las últimas tareas publicadas."
                    }
                </p>

                {tareasDisponibles.length > 0
                    ? (
                        <div className={styles.lista_tareas}>
                            {tareasDisponibles.map(tarea => {
                                const entregaActual: Entrega | undefined = misEntregas.find(entrega => entrega.tarea_id === tarea.id);

                                return (<TareaCard key={tarea.id} tarea={tarea} reloadEntregas={reloadEntregas} entregaActual={entregaActual || null} />)}
                            )}
                        </div>
                    )
                    : (
                        <p>No hay tareas disponibles en este momento</p>
                    )
                }
            </div>
        </div>
    );
}

export default ContendioEstudiante;