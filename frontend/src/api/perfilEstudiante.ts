/*
PETICIONES
===========================
Ver mis entregas --> GET - tareas/mis-entregas
Actualizar información --> PUT alumno/update
Ver canciones solicitadas --> GET musica/sugerencias
*/
import type { Entrega, User, UsuarioActualizado } from "../types";

const URL = import.meta.env.VITE_API_URL;

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

export const fetchActualizarDatos = async (token: string, datos: UsuarioActualizado): Promise<User> => {
    try {
        const response = await fetch(`${URL}/usuario/update`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });

        if(!response.ok) {
            throw new Error(`No se han podido actualizar los datos: ${response.status}`);
        }

        return await response.json();
    } catch(err) {
        console.error("Error al actualizar los datos", err);
        throw err;
    }
}