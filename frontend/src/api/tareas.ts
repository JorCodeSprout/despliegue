/*
PETICIONES
===========================
Listar tareas --> GET - /tareas
Entregar --> POST - /tareas/id_tarea/entregar
Ver mis entregas --> GET - /tareas/mis-entregas
Últimas tareas creadas --> GET - /tareas/ultimas

profesores o admin
---------------------------
Crear --> POST - /tareas/crear
Ver entregas --> GET - /tareas/id_tarea/entregas (Obtener el id de todas las entregas que tengan el creador_id del profesor o admin logueado)
Calificar --> POST /entregas/entrega_id/calificar
*/
import type { Entrega, Tarea } from "../types";

const URL = import.meta.env.VITE_API_URL;

export const fetchTareasByProfesor = async (profesor_id: number | null, token: string | null): Promise<Tarea[]> => {
    let url: string;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };

    if(token && profesor_id) {
        url = `${URL}/tareas/profesor/${profesor_id}`;
        headers['Authorization'] = `Bearer ${token}`;
    } else {
        url = `${URL}/tareas/ultimas`;
    }

    try {
        const response = await fetch(url, {headers});
        if(!response.ok) {
            throw new Error(`Error al cargar las tareas. ${response.statusText}`);
        }

        return await response.json();
    } catch(err) {
        console.error("Fallo al obtener las tareas: ", err);
        return[];        
    }
} 

export const fetchTodasTareas = async (token: string | null): Promise<Tarea[]> => {
    try {
        const response = await fetch(`${URL}/tareas/ultimas`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if(!response.ok) {
            throw new Error(`Error al cargar las tareas: ${response.statusText}`);
        }

        return await response.json();
    } catch(err) {
        console.error("Fallo al obtener las tareas: ", err);
        return[];        
    }
}

export const fetchMisEntregas = async (token: string) : Promise<Entrega[]> => {
    try {
        const response = await fetch(`${URL}/tareas/mis-entregas`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if(!response.ok) {
            throw new Error(`Error al cargar las entregas que has realizado: ${response.statusText}`);
        }

        return await response.json();
    } catch(err) {
        console.error("Fallo al obtener las entregas: ", err);
        return [];
    }
}

export const fetchTodasEntregas = async (token: string, profesor_id: number) : Promise<Entrega[]> => {
    try {
        const response = await fetch(`${URL}/tareas/${profesor_id}/entregas`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });


        if(!response.ok) {
            throw new Error(`Error al cargar las entregas: ${response.statusText}`);
        }

        return await response.json();
    } catch(err) {
        console.error("Fallo al obtener las entregas: ", err);
        return[];        
    }
}

export const fetchCalificar = async (entrega_id: number, estado: "APROBADA" | "RECHAZADA", token: string) => {
    try {
        const response = await fetch(`${URL}/entregas/${entrega_id}/calificar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({estado})
        });

        if(!response.ok) {
            throw new Error("Error al calificar la entrega");
        }
        return response.json();
    } catch(err) {
        console.error(`No se ha podido calificar la entrega: ${err}`);
        throw err;
    }
}

export const fetchEnviarEntrega = async (tarea_id: number, archivo: File, token: string) => {
    const formData = new FormData();
    formData.append('ruta', archivo);

    try {
        const response = await fetch(`${URL}/tareas/${tarea_id}/entregar`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData
        });

        if(!response.ok) {
            const errData = await response.json().catch(() => ({message: response.statusText}));
            throw new Error(errData.message || `Error al subir la entrega: ${response.status}`);
        }

        return response.json();
    } catch(err) {
        console.error("Fallo en enviarEntrega: ", err);
        throw err;
    }
}