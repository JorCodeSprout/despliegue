import type React from "react";
import { useAuth } from "../hooks/useAuth";
import { useCallback, useEffect, useState } from "react";
import type { Profesor } from "../types";

const URL = '/api';

const MostrarProfesor: React.FC = () => {
    const {isLogged, role, token} = useAuth();

    const [profesor, setProfesor] = useState<Profesor | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const obtenerInfo = useCallback(async () => {
        if(!token || role !== "ESTUDIANTE") {
            return;
        }

        setLoading(true);
        setError(null);
        setProfesor(null);

        try {
            const response = await fetch(`${URL}/usuario/profesor`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if(!response.ok) {
                throw new Error(data.error || `Error ${response.status}: Fallo al obtener el profesor`);
            }

            if(data.message) {
                setError(data.message);
                setProfesor(null);
            } else if(data.nombre && data.email) {
                setProfesor({
                    nombre: data.nombre,
                    email: data.email
                });
            } else {
                setError("Respuesta del servidor válida pero sin datos de profesor");
            }
        } catch(err) {
            console.error("Error al obtener información del profesor:", err); 
            
            const dataErr = err instanceof Error ? err.message : 'Ocurrió un error desconocido';
            setError(`Fallo en la conexión: ${dataErr}`);
        } finally {
            setLoading(false);
        }
    }, [token, role]);

    useEffect(() => {
        if(isLogged && role === "ESTUDIANTE") {
            obtenerInfo();
        }
    }, [isLogged, role, obtenerInfo]);

    return (
        <div>
            <h2>Tu profesor asignado</h2>
            {loading && <p>Cargando información del profesor...</p>}
            {error && <p style={{color: 'red'}}>{error}</p>}

            {profesor && (
                <div>
                    <p><strong>Nombre:</strong> {profesor.nombre}</p>
                    <p><strong>Email:</strong> <a href={`mailto:${profesor.email}`}>{profesor.email}</a></p>
                </div>
            )}
        </div>
    );
}

export default MostrarProfesor;