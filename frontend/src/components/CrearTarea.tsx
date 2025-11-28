/*Fallo de servidor (405). Respuesta: <!DOCTYPE html> <html lang="en"> <head> <meta charset="utf-8" /> <meta name="viewport" conte..*/

import {useAuth} from "../hooks/useAuth";
import {useState} from "react";
import type { NuevaTarea } from "../types/index.tsx";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const CrearTarea: React.FC = () => {
    const {role, token} = useAuth();

    const getFechaManana = (): string => {
        const today = new Date();
        const tomorrow = new Date(today.getTime() + (24 * 60 * 60 * 1000));
        
        const year = tomorrow.getFullYear();
        const month = (tomorrow.getMonth() + 1).toString().padStart(2, '0');
        const day = tomorrow.getDate().toString().padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const [tareaData, setTareaData] = useState<NuevaTarea>({
        titulo: '',
        descripcion: '',
        recompensa: 10,
        fecha: getFechaManana(),
        reenviar: false,
    });

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string |null>(null);

    const isAuthorized = role === "PROFESOR" || role === "ADMIN";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value, type} = e.target;

        setTareaData(prev => ({
            ...prev,
            [name]: type === 'checkbox'
                ? (e.target as HTMLInputElement).checked
                : (name === 'recompensa'
                    ? parseInt(value) || 0
                    : value),
        }));
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!isAuthorized || !token) {
            setError("Acceso denegado");
            return;
        }

        if (tareaData.recompensa <= 0) {
            setError("La recompensa debe ser un número positivo");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/tareas/crear`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(tareaData),
            });

            const clonedResponse = response.clone();

            if (!response.ok) {
                let errorBody= { message: `Error HTTP ${response.status}: El servidor no pudo procesar la solicitud.` };

                try {
                    errorBody = await response.json();
                } catch {
                    const textError = await clonedResponse.text();
                    errorBody.message = `Fallo de servidor (${response.status}). Respuesta: ${textError.substring(0, 100)}...`;
                }

                const errorMessage = errorBody.message || JSON.stringify(errorBody || errorBody);
                throw new Error(errorMessage);
            }

            const result = await response.json();

            setSuccess(`Tarea ${result.tarea.titulo}, creada con éxito.`);
            setTareaData({titulo: '', descripcion: '', recompensa: 10, fecha: getFechaManana(), reenviar: false});
        } catch (error) {
            console.error("Error en el envío del formulario.", error);
            setError(error instanceof Error ? error.message : 'Error desconocido al crear la tarea.');
        } finally {
            setLoading(false);
        }
    }

    if(!isAuthorized) {
        return (
            <div className="tarea-form-container">
                <h2>Acceso denegado</h2>
                <p>Solo profesores y administradores pueden crear tareas.</p>
            </div>
        );
    }

    return (
        <div className="tarea-form-container">

            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <form onSubmit={handleSubmit} className="form-crear-tarea">
                <button 
                    className="return-button" 
                    onClick={() => navigate('/')}
                    title="Volver a la lista de tareas"
                >
                    ❌
                </button>
                <h2>Crear Nueva Tarea</h2>

                <div className="input-container">
                    <input
                        type="text"
                        id="titulo"
                        name="titulo"
                        placeholder=" "
                        value={tareaData.titulo}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                    <label htmlFor="titulo">Título</label>
                </div>

                <div className="input-container textarea-container">
                <textarea
                    id="descripcion"
                    name="descripcion"
                    placeholder=" "
                    value={tareaData.descripcion}
                    onChange={handleChange}
                    required
                    rows={5}
                    disabled={loading}
                />
                    <label htmlFor="descripcion">Descripción</label>
                </div>

                <div className="input-container">
                    <input
                        type="number"
                        id="recompensa"
                        name="recompensa"
                        placeholder=" "
                        value={tareaData.recompensa}
                        onChange={handleChange}
                        required
                        min="1"
                        disabled={loading}
                    />
                    <label htmlFor="recompensa">Recompensa (Puntos 🎵)</label>
                </div>

                <div className="input-container">
                    <input 
                        type="date" 
                        name="fecha" 
                        id="fecha" 
                        placeholder=" " 
                        value={tareaData.fecha} 
                        onChange={handleChange}
                        required 
                        disabled={loading}
                    />
                    <label htmlFor="fecha">Fecha de entrega</label>
                </div>

                <div className="term-container checkbox-group">
                    <input
                        type="checkbox"
                        id="reenviar"
                        name="reenviar"
                        checked={tareaData.reenviar}
                        onChange={handleChange}
                        disabled={loading}
                    />
                    <label htmlFor="reenviar">Permitir reenvío</label>
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Creando...' : 'Publicar Tarea'}
                </button>
            </form>
        </div>
    );
}

export  default CrearTarea;