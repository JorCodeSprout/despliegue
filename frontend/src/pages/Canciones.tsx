import type React from "react";
import { useAuth } from "../hooks/useAuth";
import { useCallback, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Buscador from "../components/Buscador";
import { type SongItem, type SugerenciasCanciones } from "../types";
import styles from "../assets/styles/Buscar.module.css"
import { fetchSolicitudes, fetchSugerirCancion } from "../api/solicitudes";
import BotonesSugerir from "../components/BotonesSugerir";
import Footer from "../components/Footer";

const Canciones: React.FC = () => {
    const {token, puntos} = useAuth();

    const [resultadosBusqueda, setResultadosBusqueda] = useState<SongItem[]>([]);
    const [error, setError] = useState<string | null >(null);

    const [sugerenciasPendientes, setSugerenciasPendientes] = useState<SugerenciasCanciones[]>([]);
    const [sugerenciaEnCurso, setSugerenciaEnCurso] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const cargarSolicitudesPendientes = useCallback(async () => {
        if(token) {
            try {
                const response = await fetchSolicitudes(token);
                setSugerenciasPendientes(response as SugerenciasCanciones[]);
            } catch(err) {
                console.error("Error al cargar las sugerencias.", err);
                throw err;
            }
        }
    }, [token]);

    useEffect(() => {
        if(!token) {
            setError("No puedes estar aquí. No tienes las credenciales necesarias.");
        } else {
            setError(null);
            cargarSolicitudesPendientes();
        }
    }, [token, cargarSolicitudesPendientes]);

    const handleResultados = (resultados: SongItem[]) => {
        setResultadosBusqueda(resultados);
        setError(null);
        console.log("Resultados obtenidos: ", resultados);
    }

    const handleError = (message: string | null) => {
        setError(message);
        setResultadosBusqueda([]);
    }

    const handleSugerir = async (cancion: SongItem) => {
        if(!token || sugerenciaEnCurso) {
            return;
        }

        setSugerenciaEnCurso(cancion.id);

        try {
            const response = await fetchSugerirCancion(token, cancion);

            console.log(response);
            

            const nuevaSugerencia: SugerenciasCanciones = {
                ...response.sugerencia
            }

            setSugerenciasPendientes(prev => [...prev, nuevaSugerencia]);
            setError(null);
            setSuccess(`La canción ${cancion.name} ha sido sugerida con éxito`);
        } catch(err) {
            const errorMessage = err instanceof Error ? err.message : "Error al sugerir la canción";
            console.error(errorMessage, err);
            setError(errorMessage);
        } finally {
            setSugerenciaEnCurso(null);
        }
    }

    if(!token && !error) {
        return <p>Cargando autenticación...</p>
    }

    return (
        <>
            <Sidebar />
            <div id="body">
                <Buscador token={token} resultadosBusqueda={handleResultados} setError={handleError} />

                <div className={styles.mensajes}>
                    {error && <p style={{color: "red"}}>{error}</p>}
                    {success && <p style={{color: "green"}}>{success}</p>}
                </div>

                {resultadosBusqueda.length > 0 && (
                    <div className={styles.container}>
                        <h2>Resultados de la búsqueda</h2>

                        <div className={styles.resultadosContainer}> 
                            {resultadosBusqueda.map((s) => (
                                <div key={s.id} className={styles.cancionCard}>
                                    <article className={styles.songArticle}> 
                                        {s.album?.images?.[0]?.url && <img src={s.album?.images?.[0]?.url} alt={`Portada de ${s.name}`} className={styles.songCover} />}
                                        <div className={styles.songInfo}>
                                            <h3 title={s.name}>{s.name}</h3>
                                            <p><span>Artista:</span> {s.artists?.[0]?.name}</p>
                                        </div>
                                        <a href={`https://open.spotify.com/track/${s.id}`} target="_blank" rel="noopener noreferrer" className={styles.escucharButton}>Escuchar</a> 
                                    </article>
                                    <BotonesSugerir 
                                        cancion={s}
                                        puntos={puntos}
                                        token={token}
                                        sugerenciasPendientes={sugerenciasPendientes}
                                        sugerenciaEnCurso={sugerenciaEnCurso}
                                        handleSugerir={handleSugerir}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <Footer />
            </div>
        </>
    );
}

export default Canciones;