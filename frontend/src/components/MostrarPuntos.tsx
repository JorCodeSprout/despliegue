import type React from "react";
import { useAuth } from "../hooks/useAuth";
import { useCallback, useEffect, useState } from "react";
import type { User } from "../types";

const URL = '/api';

const MostrarPuntos: React.FC = () => {
    const {isLogged, role, token} = useAuth();

    const [userData, setUserData] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const obtenerInfo = useCallback(async () => {
        if(!token || role !== "ESTUDIANTE") {
            return;
        }

        setLoading(true);
        setError(null);
        setUserData(null);

        try {
            const response = await fetch(`${URL}/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if(!response.ok) {
                setError("Error al obtener los puntos del usuario");
            }

            if(data && typeof data.puntos === "number") {
                setUserData(data);
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
            {loading && <p>Cargando tus puntos...</p>}
            {error && <p style={{color: 'red'}}>{error}</p>}

            {userData && (
                <div>
                    <h3>Puntos</h3>
                    <h2>🌟{userData.puntos}🌟</h2>
                </div>
            )}
        </div>
    );
}

export default MostrarPuntos;