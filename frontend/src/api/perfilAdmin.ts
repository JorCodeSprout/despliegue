/*
PETICIONES
===========================
Crear un nuevo usuario --> POST - usuario/crear
Obtener todos los profesores y admin --> GET - usuario/profesores
Mostrar los usuarios --> GET - usuario/all
Actualizar un usuario --> PUT usuario/{usuario}/cambiar
*/
import type { CrearUsuario, EditarUsuario, ProfesorAdmin, RespuestaObtenerUsuarios, User } from "../types";

const API_URL = '/api/';

export const fetchCrearUsuario = async (token: string | null, userData: CrearUsuario): Promise<CrearUsuario[]> => {
    try {
        const response = await fetch(`${API_URL}/usuario/crear`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if(!response.ok) {
            throw new Error(data.error || "Error al crear el usuario");
        }

        return data.user;
    } catch(err) {
        console.error(`Error al crear el usuario`, err);
        throw err;
    }
}

export const fetchProfesores = async (token: string | null): Promise<ProfesorAdmin[]> => {
    try {
        const response = await fetch(`${API_URL}/usuario/profesores`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if(!response.ok) {
            throw new Error(data.error || "Error al cargar los profesores");
        }

        return data.profesores;
    } catch(err) {
        console.error(`Error al cargar los profesores`, err);
        throw err;
    }
}

export const fetchUsuarios = async (token: string | null) : Promise<RespuestaObtenerUsuarios> => {
    try {
        if(!token) {
            throw new Error("Token de autenticación no proporcionado");
        }

        const response = await fetch(`${API_URL}/usuario/all`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if(!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || `Error al obtener los usuarios: ${response.statusText}`);
        }

        const data: RespuestaObtenerUsuarios = await response.json();
        return data;
    } catch(err) {
        console.error("Error al cargar los usuarios");
        throw err;
    }
}

export const fetchActualizarDatosAdmin = async (token: string, datos: EditarUsuario): Promise<User> => {
    if(!datos.id) {
        throw new Error("El ID del usuario a actualizar es obligatorio")
    }

    const datosBody = { ...datos };
    delete datosBody.id;

    try {
        const response = await fetch(`${API_URL}/usuario/${datos.id}/cambiar`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosBody)
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