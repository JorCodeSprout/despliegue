/*
TODO
=============== 
1.- Mostrar todas las tareas creadas
2.- Mostrar todas las tareas creadas por un profesor específico
3.- Mostrar las entregas realizadas en las tareas por un profesor (Primero hay que ir a backend a corregir el método que las recoge)
4.- Botón para crear tareas
5.- Botón para aprobar entrega
6.- Botón para suspender entrega
7.- Ventana distinta para cada rol
*/

import type React from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import type { Entrega, Tarea } from "../types";
import { fetchCalificar, fetchMisEntregas, fetchTareasByProfesor, fetchTodasEntregas, fetchTodasTareas } from "../api/tareas";
import ContenidoNoLogueado from "./ContenidoNoLogueado";
import ContendioEstudiante from "./ContenidoEstudiante";
import ContenidoAdminProfesor from "./ContenidoProfesor";
import styles from '../assets/styles/Tareas.module.css'

const Tareas: React.FC = () => {
    const {isLogged, role, puntos, profesorId, id, token} = useAuth();
    const navigate = useNavigate();

    const [tareasDisponibles, setTareasDisponibles] = useState<Tarea[]>([]);
    const [entregas, setEntregas] = useState<Entrega[]>([]);
    const [misEntregas, setMisEntregas] = useState<Entrega[]>([]);

    const [loading, setLoading] = useState(true);

    const handleCrearTarea = () => {
        if(role !== "PROFESOR" && role !== "ADMIN") {
            alert("No tienes permisos suficientes para crear una tarea.");
            return;
        }

        navigate("tareas/crear");
    }

    const handlefetchCalificar = async (entrega_id: number, estado: "APROBADA" | "RECHAZADA") => {
        if(!token) {
            alert("Debes estar autenticado para poder fetchCalificar una tarea.");
            return;
        }

        try {
            setLoading(true);
            await fetchCalificar(entrega_id, estado, token);
            alert(`Entrega ${entrega_id} marcada como ${estado}`);
            await loadEntregas();
        } catch(err) {
            console.error(`Error al actualizar la entrega: ${err}`);
        } finally {
            setLoading(false);
        }
    }

    const loadEntregas = useCallback(async () => {
        if(!isLogged || !token) return;

        try {
            if(role === "ESTUDIANTE") {
                const fetchedEntregas = await fetchMisEntregas(token);
                setMisEntregas(fetchedEntregas);
            } else {
                if(id !== null) {
                    const fetchedEntregas = await fetchTodasEntregas(token, id);
                    setEntregas(fetchedEntregas);
                }
            }
        } catch(err) {
            console.error("Fallo al cargar las tareas: ", err);
        }
    }, [isLogged, role, id, token]);

    const loadTareas = useCallback(async () => {        
        let fetchedTareas: Tarea[];

        if(role === "PROFESOR" || role === "ADMIN") {
            fetchedTareas = await fetchTodasTareas(token);
        } else {
            fetchedTareas = await fetchTareasByProfesor(profesorId, token);
        }
        setTareasDisponibles(fetchedTareas);
    }, [profesorId, token, role]);

    const reloadEntregas = useCallback(() => {
        return loadEntregas();
    }, [loadEntregas]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {    
                await loadTareas(); 
                
                if (isLogged) {
                    await loadEntregas();
                }
            } catch(err) {
                console.error("No se pudieron cargar las tareas correctamente", err);
            } finally{
                setLoading(false);
            }
        }

        loadData();
    }, [isLogged, token, role, id, profesorId, loadEntregas, loadTareas]);

    const contenidoSegunRole = () => {
        if(loading) {
            return <p className={styles.cargando}>Cargando información de las tareas...</p>
        }

        if(!isLogged) {
            return <ContenidoNoLogueado tareasDisponibles={tareasDisponibles} />;
        }

        switch(role) {
            case "ESTUDIANTE":
                return <ContendioEstudiante puntos={puntos} profesor_id={profesorId} tareasDisponibles={tareasDisponibles} misEntregas={misEntregas} reloadEntregas={reloadEntregas} />
            case "ADMIN":
            case "PROFESOR":
                return <ContenidoAdminProfesor tareasDisponibles={tareasDisponibles} entregas={entregas} handleCrearTarea={handleCrearTarea} handleCalificar={handlefetchCalificar} />
            default:
                return <ContenidoNoLogueado tareasDisponibles={tareasDisponibles} />;
        }
    }

    return (
        <div className={styles.tareas_container}>
            {contenidoSegunRole()}
        </div>
    );
}

export default Tareas;