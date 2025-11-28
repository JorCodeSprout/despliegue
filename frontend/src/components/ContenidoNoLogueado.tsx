import type { PanelNoLogueado } from "../types";
import TareaCard from "./TareaCard";

const ContinidoNoLogueado: React.FC<PanelNoLogueado> = ({tareasDisponibles: tareasDisponibles}) => {
    return (
        <>
            <div className="tareas-seccion">
                <h3>📜 Últimas tareas generadas</h3>
                <p>Estas son las últimas tareas visibles para todos:</p>

                {tareasDisponibles.length > 0 
                    ? (
                        <div className="lista-tareas">
                            {tareasDisponibles.map(tarea => (
                                <div className="tarea-card" key={tarea.id}>
                                    <TareaCard key={tarea.id} tarea={tarea} />
                                </div>
                            ))}
                        </div>
                    )
                    : (
                        <p>No hay tareas disponibles en este momento.</p>
                    )
                }
            </div>
        </>
    );
}  

export default ContinidoNoLogueado;