import type React from "react";
import { useAuth } from "../hooks/useAuth";
import { useCallback, useEffect, useState } from "react";
import { fetchSolicitudes } from "../api/solicitudes";
import styles from "../assets/styles/Sugerencias.module.css"
import type { SugerenciasCanciones } from "../types";
import BotonesSolicitud from "./BotonesSolicitud";

const SugerenciaCard : React.FC = () => {
    const {token, user} = useAuth();

    const [sugerencias, setSugerencias] = useState<SugerenciasCanciones[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cargarSugerencias = useCallback(async () => {
        if(!token) {
            setError("Debes estar autenticado para estar aquí");
            return;
        }

        setLoading(true);
        try {
            const response = await fetchSolicitudes(token);
            setSugerencias(response as SugerenciasCanciones[]);
            setError(null);
        } catch(err) {
            console.error("Error al cargar las sugerencias.", err);
            setError("Error al cargar las sugerencias");
            throw err;
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        cargarSugerencias();
    }, [token, cargarSugerencias]);

    return (
        <>
            {error && <p style={{color: "red"}}>{error}</p>}
            {loading ? "Cargando sugerencias..." : ""}

            {sugerencias.length > 0 && (
                <div className={styles.container}>
                    <div className={styles.resultadosContainer}>
                        {sugerencias.map((s) => (
                            <div key={s.id_spotify_cancion} className={`${styles.cancionCard} ${styles[s.estado]}`}>
                                <article className={styles.songArticle}> 
                                    <div className={styles.songInfo}>
                                        <h3 title={s.titulo}>{s.titulo}</h3>
                                        <p><span>Artista:</span> {s.artista}</p>
                                        <p><span>Estado:</span> {s.estado}</p>
                                    </div>
                                    <a href={`https://open.spotify.com/track/${s.id_spotify_cancion}`} target="_blank" rel="noopener noreferrer" className={styles.escucharButton}>🎧Escuchar</a> 
                                </article>
                                {user?.role === "ADMIN" && (
                                    <BotonesSolicitud cargarSugerencias={cargarSugerencias} sugerenciaId={s.id} estado={s.estado} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {(!loading && !error && sugerencias.length === 0) && (
                <div>
                    <p>No hay sugerencias pendientes</p>
                </div>
            )}
        </>
    );
}

export default SugerenciaCard;