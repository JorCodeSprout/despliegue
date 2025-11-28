import type React from "react";
import styles from "../assets/styles/Sugerencias.module.css";
import { useCallback, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { fetchAprobarSolicitud, fetchCancelarSolicitud } from "../api/solicitudes";
import type { BotonesSolicitudProps } from "../types";

const BotonesSolicitud: React.FC<BotonesSolicitudProps> = ({cargarSugerencias, sugerenciaId, estado}) => {
    const {token, user} = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const yaManejada = estado !== 'PENDIENTE';

    const handleAceptar = useCallback(async () => {
        if(!token || user?.role !== "ADMIN" || yaManejada) {
            setError("Acción no autorizada o sugerencia ya gestionada");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await fetchAprobarSolicitud(token, sugerenciaId);
            await cargarSugerencias();
        } catch(err) {
            console.error("Error al aprobar la sugerencia", err);
            setError(err instanceof Error ? err.message : "Error al aprobar la sugerencia");
        } finally {
            setLoading(false);
        }
    }, [token, user, cargarSugerencias, sugerenciaId, yaManejada]);

    const handleRechazar = useCallback(async () => {
        if(!token || user?.role !== "ADMIN" || yaManejada) {
            setError("Acción no autorizada o sugerencia ya gestionada.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await fetchCancelarSolicitud(token, sugerenciaId);
            await cargarSugerencias();
        } catch(err) {
            console.error("Error al cancelar la sugerencia", err);
            setError(err instanceof Error ? err.message : "Error al cancelar la sugerencia");            
        } finally {
            setLoading(false);
        }
    }, [token, user, cargarSugerencias, sugerenciaId, yaManejada]);

    return (
        <>
            {error && <p style={{color: "red"}}>{error}</p>}
            <div className={styles.acciones_solicitud}>
                <button 
                    className={styles.aceptar}
                    onClick={handleAceptar}    
                    disabled={loading || yaManejada}
                >
                    Aceptar
                </button>
                
                <button 
                    className={styles.rechazar}
                    onClick={handleRechazar}    
                    disabled={loading || yaManejada}
                >
                    Rechazar
                </button>
            </div>
        </>
    );
}

export default BotonesSolicitud;