import React, { useCallback, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import '../assets/styles/Home.css';
import type { SongItem, Tarea } from '../types';
import Tareas from '../components/Tareas';
import TareaCard from '../components/TareaCard';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const mainContentStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    minHeight: '90%'
}

const API_URL = '/api';
const SPOTIFY_TOKEN_ENDPOINT = `${API_URL}/spotify_token`;

const RANDOM_QUERIES = ['wos', 'duki', 'quevedo', 'nicky jam', 'bizarrap', 'Queen', 'Nirvana', 'Estopa'];
// Tiempo de renovación (59 min y 30 segundos)
const TOKEN_REFRESH_INTERNAL = (59 * 60 + 30) * 1000; 

const Home: React.FC = () => {
    const { isLogged, userName, role, profesorId, token } = useAuth(); 

    const [ultimasTareas, setUltimasTareas] = useState<Tarea[]>([]);
    const [isLoadingTareas, setIsLoadingTareas] = useState(true);
    const [errorTareas, setErrorTareas] = useState<string | null>(null);

    const [canciones, setCanciones] = useState<SongItem[]>([]);
    const [isLoadingSongs, setIsLoadingSongs] = useState<boolean>(true);
    const [errorSongs, setErrorSongs] = useState<string | null>(null);

    const [spotifyToken, setSpotifyToken] = useState<string>('');
    const [refreshTimerId, setRefreshTimerId] = useState<number | null>(null);

    const getSpotifyToken = useCallback(async () => {
        // Limpipamos el temporizador antes de intentar obtener uno nuevo
        if(refreshTimerId) {
            clearTimeout(refreshTimerId);
            setRefreshTimerId(null);
        }

        try {
            const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
                method: 'GET',
            });

            if(!response.ok) {
                throw new Error(`Fallo al obtener el token del backend: ${response.statusText}`);
            }

            const result = await response.json();
            const fetchedToken = result.accessToken;

            if(!fetchedToken) {
                throw new Error("El backend no devolvió un token válido");
            }

            setSpotifyToken(fetchedToken);
            const newTimerId = setTimeout(getSpotifyToken, TOKEN_REFRESH_INTERNAL);
            setRefreshTimerId(newTimerId as unknown as number);
            
        } catch (error) {
            console.error(error);
            setErrorSongs("Fallo en la autenticación con el backend. Refresca la página para restaurar las canciones.");            
        }
    }, [refreshTimerId]);
    
    const getSongLimit = (numTareas: number): number => {
        const effectiveTareas = numTareas > 0 ? numTareas : 1;
        const limit = effectiveTareas * 2; 
        return Math.min(limit, 4);
    };

    
    const cancionValida = useCallback(async (item: SongItem) => {
        const nombreCancion = item.name;
        const artista = item.artists?.[0]?.name;
        
        return nombreCancion && nombreCancion !== 'Título Desconocido' && artista && artista !== 'Artista Desconocido';
    }, []);

    const fetchRandomSongs = useCallback(async (limit: number, spotifyToken: string) => {
        if(!spotifyToken) {
            setErrorSongs("Error de autenticación. Token de Spotify no disponible");
            setIsLoadingSongs(false);
            return;
        }        

        setIsLoadingSongs(true);
        setErrorSongs(null);

        const randomIndex = Math.floor(Math.random() * RANDOM_QUERIES.length);
        const randomQuery = RANDOM_QUERIES[randomIndex];

        try {
            const url = `https://api.spotify.com/v1/search?q=${randomQuery}&type=track&limit=${limit}`;

            const data = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${spotifyToken}`,
                    'Content-Type': 'application/json'
                },
            });

            if(!data.ok) {
                throw new Error(`Error en la petición: ${data.status} - ${data.statusText}. Query: ${randomQuery.toUpperCase()}`);
            }

            const response = await data.json();
            const fetchedSongs: SongItem[] = response.tracks?.items || [];

            const cancionesValidas = fetchedSongs.filter(cancionValida).slice(0, limit);

            setCanciones(cancionesValidas);

            if(cancionesValidas.length === 0) {
                setErrorSongs(`No se encontraron canciones para el artísta: "${randomQuery}"`);
            }
        } catch (error) {
            console.error("Error al buscar canciones con la API oficial.", error);
            const errorMensaje = error instanceof Error ? error.message : 'Ocurrió un error desconocido';
            setErrorSongs(`Falló la carga de música: ${errorMensaje}`);            
        } finally {
            setIsLoadingSongs(false);
        }
    }, [setIsLoadingSongs, setErrorSongs, setCanciones, cancionValida]);

    useEffect(() => {
        getSpotifyToken();
        return () => {
            if(refreshTimerId !== null) {
                clearTimeout(refreshTimerId);
            }
        }
    }, [getSpotifyToken, refreshTimerId]);

    useEffect(() => {
        const fetchAllData = async () => {
            let numTareas = 0;
            setIsLoadingTareas(true);
            setErrorTareas(null);
            
            if (isLogged && profesorId) {
                try {
                    const response = await fetch(`${API_URL}/tareas/profesor/${profesorId}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if(!response.ok) {
                        throw new Error(`Error al cargar las tareas: ${response.statusText}`);
                    }

                    const data: Tarea[] = await response.json();
                    
                    const tareasLimitadas = data.slice(0, 3);
                    setUltimasTareas(tareasLimitadas);
                    numTareas = tareasLimitadas.length;

                } catch(err) {
                    console.error('Error fetching task: ', err);
                    setErrorTareas('No se pudieron cargar las tareas de tu profesor. Inténtalo de nuevo más tarde');
                } finally {
                    setIsLoadingTareas(false);
                }
            } else if (isLogged && profesorId === null) {
                setUltimasTareas([]);
                setErrorTareas('No tienes un profesor asignado para ver las tareas.');
                setIsLoadingTareas(false);
            } else {
                try {
                    const response = await fetch(`${API_URL}/tareas/ultimas`, {
                        method: 'GET'
                    });
                    if(!response.ok) {
                        throw new Error(`Error al cargar las tareas: ${response.statusText}`);
                    }
                    const data: Tarea[] = await response.json();
                    const tareasLimitadas = data.slice(0, 3);
                    setUltimasTareas(tareasLimitadas);
                    numTareas = tareasLimitadas.length;
                } catch(err) {
                    console.error('Error fetching task: ', err);
                    setErrorTareas('No se pudieron cargar las tareas. Inténtalo de nuevo más tarde');
                } finally {
                    setIsLoadingTareas(false);
                }
            }

            const songLimit = getSongLimit(numTareas);
            if(spotifyToken) {
                await fetchRandomSongs(songLimit, spotifyToken);
            } 
        }

        if(spotifyToken) {
            fetchAllData();
        }
    }, [isLogged, profesorId, spotifyToken, token, fetchRandomSongs]);

    const renderSongCards = () => {
        if (isLoadingSongs) return <p className={isLogged ? 'grid-item bloque-cancion-1' : ''}>Cargando música...</p>;
        if (errorSongs) return <p className={isLogged ? 'grid-item bloque-cancion-1' : ''} style={{color: 'red'}}>Música: {errorSongs}</p>;
        if (canciones.length === 0) return <p className={isLogged ? 'grid-item bloque-cancion-1' : ''}>No se encontraron sugerencias musicales.</p>;

        return canciones.map((item, index) => {
            const artista = 
                item.artists?.[0]?.name 
                || 'Artista Desconocido';
            const imagenUrl = 
            item.album?.images?.[0]?.url;
            const nombreCancion = item.name || 'Título Desconocido';

            const spotifyUrl = `https://open.spotify.com/track/${item.id}`;
            
            return (
                <article key={item.id} className={`grid-item bloque-cancion-${index + 1} song-card card-base`}>
                {imagenUrl && <img src={imagenUrl} alt={`Portada de ${nombreCancion}`} className='song-cover' />}
                <div className='song-info'>
                    <h3 title={nombreCancion}>{nombreCancion}</h3>
                    <p><span>Artista:</span> {artista}</p>
                </div>
                <a href={spotifyUrl} target="_blank" rel="noopener noreferrer">Escuchar</a>
                </article>
            );
        });
    }

    const bienvenido = isLogged 
        ? `Bienvenido a RITMATIZA ${userName}`
        : `Bienvenido a Ritmatiza.`;
    
    if(!isLogged) {        
        return (
            <Layout>
                <div style={mainContentStyles} className='logged-in-layout'>
                    <div className='grid-container-logout'>
                        <div className="grid-item bloque-header">
                            <div className="header-content">
                                <h1>{bienvenido}</h1>
                                <p><Link to="/login">Inicia sesión</Link> para poder entregar tareas y ganar puntos</p>
                            </div>
                        </div>
                        <div className="grid-item bloque-tareas">
                            <h2 style={{margin: '0 0 10px 0'}}>Tareas disponibles</h2>
                            {isLoadingTareas && <p>Cargando tareas...</p>}
                            {errorTareas && <p style={{color: 'red'}}>{errorTareas}</p>}

                            {!isLoadingTareas && !errorTareas && ultimasTareas.length === 0 && (
                                <p>No hay tareas disponibles en este momento.</p>
                            )}

                            {!isLoadingTareas && !errorTareas && ultimasTareas.map((tarea) => (
                                <div key={tarea.id}>
                                    <div>
                                        <TareaCard tarea={tarea} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {renderSongCards()}

                    </div>
                </div>
            </Layout>
        );
    }

    const profesor_admin = role === 'PROFESOR' || role === 'ADMIN';

    if (profesor_admin) {
        return (
            <>
                <Sidebar />
                <div id="body">
                    <div className='mainContentStyles logged-in-layout'>
                        <div className='grid-container-profesor'>
                            <div className='grid-item bloque-logged'>
                                <h1 className='titulo'>{bienvenido}</h1>
                                <p>Gestión y administración de la plataforma.</p>
                                <Tareas />
                            </div>
                        </div>
                    </div>
                    <Footer />
                </div>
            </>
        );
    }

    return (
        <>
            <Sidebar />
            <div id="body">
                <div className='mainContentStyles logged-in-layout'>
                    <div className='grid-container-estudiante'>
                        <div className='grid-item bloque-logged'>
                        <h1 className='titulo'>{bienvenido}</h1>
                        </div>

                        <Tareas />
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
}

export default Home;