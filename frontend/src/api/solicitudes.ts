/*
PETICIONES
========================
Ver canciones solicitadas --> GET - musica/sugerencias
Sugerir canción --> POST musica/sugerirCancion
Añadir a la playlist --> POST - musica/sugerencias/add
Elimiar de la playlist --> DELETE - musica/playlist/eliminar
Cancelar solicitud --> PUT - musica/sugerencias/cancelar
Mostrar canciones pendientes --> musica/playlist
*/

import type { CancionPlaylist, SongItem, SugerenciasCanciones } from "../types";

const API_URL = '/api/';

export const fetchSolicitudes = async (token: string | null) : Promise<SugerenciasCanciones[]> => {
    try {
        const response = await fetch(`${API_URL}/musica/sugerencias`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if(!response.ok) {
            throw new Error(`Error al cargar las solicitudes que has realizado: ${response.status}`);
        }

        return await response.json();
    } catch(err) {
        console.error("Fallo al obtener las solicitudes: ", err);
        return [];
    }
}

export const fetchSugerirCancion = async (token: string | null, cancion: SongItem) => {
    try {
        const response = await fetch(`${API_URL}/musica/sugerir`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_spotify_cancion: cancion.id,
                titulo: cancion.name,
                artista: cancion.artists?.[0]?.name
            })
        });

        const data = await response.json();

        if(!response.ok) {
            const errMessage = data.message || data.error || response.statusText;
            if(response.status === 422 && data.id_spotify_cancion) {
                throw new Error("Esta canción ya ha sido sugerida (es única)");
            }
            throw new Error(errMessage);
        }

        return data;
    } catch(err) {
        console.error("Error al sugerir la canción", err);
        throw err;
    }
}

export const fetchAprobarSolicitud = async (token: string | null, sugerenciaID: number | null) => {
    try {
        const response = await fetch(`${API_URL}/musica/sugerencias/${sugerenciaID}/add`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        const data = await response.json();

        if(!response.ok) {
            throw new Error(`Error al aprobar la solicitud: ${data.error}`);
        }

        return data.cancion;
    } catch(err) {
        console.error("Error al aprobar la solicitud: ", err);
        throw err;
    }    
}

export const fetchCancelarSolicitud = async (token: string | null, sugerenciaID: number | null) => {
    try {
        const response = await fetch(`${API_URL}/musica/sugerencias/${sugerenciaID}/cancelar`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        const data = await response.json();

        if(!response.ok) {
            throw new Error(`Error al cancelar la solicitud: ${response.statusText}`);
        }

        return data.cancion;
    } catch(err) {
        console.error("Error al cancelar la solicitud: ", err);
        throw err;
    }    
}

export const fetchBuscarCanciones = async (token: string | null, cancion: string) : Promise<SongItem[]> => {
    const params = new URLSearchParams({
        query: cancion
    });

    try {
        const response = await fetch(`${API_URL}/musica/buscar?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if(!response.ok) {
            const errMessage = data.error || response.statusText;
            throw new Error(errMessage);
        }

        return data;
    } catch(err) {
        console.error("Error al buscar en la API de Spotify: ", err);
        throw err;
    }
}

export const fetchMostrarPendientes = async (token: string): Promise<CancionPlaylist[]> => {
    try {
        const response = await fetch(`${API_URL}/musica/playlist`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if(!response.ok) {
            throw new Error(`Error al obtener las solicitudes pendientes: ${response.statusText}`);
        }

        return await response.json() as CancionPlaylist[];
    } catch(err) {
        console.error("Fallo al obtener la cola de reproducción: ", err);
        return [];
    }
}

export const fetchEliminarCancion = async (token: string | null, cancionId: string) => {
    try {
        const response = await fetch(`${API_URL}/musica/playlist/${cancionId}/eliminar`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if(response.status === 403) {
            throw new Error("Acceso denegado. Solo el administrador puede eliminar canciones");
        }

        if(!response.ok) {
            const data = await response.json();
            throw new Error(`Error al eliminar de Spotify: ${data.error || response.statusText}`);
        }

        return true;
    } catch(err) {
        console.error("Error al intentar eliminar la canción de la playlist: ", err);
        throw err;
    }
}

export const fetchEstadoCancion = async (token: string | null, cancionId: string) => {
    try {
        const response = await fetch(`${API_URL}/musica/playlist/${cancionId}/reproducida`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if(!response.ok) {
            const data = await response.json();
            throw new Error(`Error al marcar la canción como reproducida: ${data.error || response.statusText}`);
        }

        return await response.json();
    } catch (err) {
        console.error("Error al marcar como reproducida", err);
        throw err;
    }
}