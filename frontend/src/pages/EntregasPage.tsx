import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import type { Entrega } from "../types";
import { fetchCalificar, fetchMisEntregas, fetchTodasEntregas } from "../api/tareas";
import styles from '../assets/styles/Entregas.module.css'; 
import Sidebar from "../components/Sidebar";
import EntregasProfesorAdmin from "../components/EntregasProfesorAdmin";
import EntregasEstudiante from "../components/EntregasEstudiante";
import Footer from "../components/Footer";

const EntregasPage: React.FC = () => {
    const { isLogged, role, token, id } = useAuth();

    const [entregas, setEntregas] = useState<Entrega[]>([]);
    const [loading, setLoading] = useState(false);

    const loadEntregas = useCallback(async () => {
        if (!isLogged || !token) {
            return;
        }

        setLoading(true);

        try {
            let fetchedEntregas: Entrega[] = [];
            
            if (role === "ESTUDIANTE") {
                fetchedEntregas = await fetchMisEntregas(token);
            } else if (role === "PROFESOR") {
                if (id !== null) {
                    fetchedEntregas = await fetchTodasEntregas(token, id);
                }
            }
            setEntregas(fetchedEntregas);
        } catch (err) {
            console.error("Fallo al cargar las entregas: ", err);
        } finally {
            setLoading(false);
        }
    }, [isLogged, role, id, token]);

    useEffect(() => {
        loadEntregas();
    }, [loadEntregas]);

    const handlefetchCalificar = async (entrega_id: number, estado: "APROBADA" | "RECHAZADA") => {
        if (!token || (role !== "PROFESOR" && role !== "ADMIN")) {
            alert("No tienes permisos suficientes o no estás autenticado para calificar.");
            return;
        }

        try {
            setLoading(true);
            await fetchCalificar(entrega_id, estado, token);
            alert(`Entrega ${entrega_id} marcada como ${estado}`);
            await loadEntregas(); // Recargar la lista
        } catch(err) {
            console.error(`Error al actualizar la entrega: ${err}`);
        } finally {
            setLoading(false);
        }
    }

    const contenidoSegunRole = () => {
        if(loading) {
            return (
                <>
                    <Sidebar />
                    <p>Cargando información de las entregas...</p>
                </>
            );
        }

        switch(role) {
            case "ESTUDIANTE":
                return (
                    <>
                        <Sidebar />
                        <EntregasEstudiante misEntregas={entregas} />
                        <Footer />
                    </>
                );
            case "PROFESOR":
                return (
                    <>
                        <Sidebar />
                        <EntregasProfesorAdmin 
                            entregasPendientes={entregas} 
                            handleCalificar={handlefetchCalificar} 
                        />
                        <Footer />
                    </>
                );
            default:
                return <p>Rol no reconocido.</p>;
        }
    }

    return (
        <div id="body">
            <div className={styles.entregas_container}>
                <h1>Gestión de Entregas</h1>
                <hr />
                {contenidoSegunRole()}
            </div>
        </div>
    );
};

export default EntregasPage;