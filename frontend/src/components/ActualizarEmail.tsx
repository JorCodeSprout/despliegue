import type React from "react";
import type { UsuarioActualizado, ActualizarPropForm } from "../types";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import { fetchActualizarDatos } from "../api/perfilEstudiante";
import styles from '../assets/styles/Actualizar.module.css'; 

const CAMPOS_VACIOS: Partial<UsuarioActualizado> = {
    current_email: '',
    email: '',
    email_confirmation: ''
};

const ActualizarEmail: React.FC<ActualizarPropForm> = ({setError, setSuccess}) => {
    const {token, user} = useAuth();

    const [dataForm, setDataForm] = useState<Partial<UsuarioActualizado>>(CAMPOS_VACIOS);
    const [loading, setLoading] = useState(false);

    const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setDataForm(prev => ({
            ...prev,
            [name]: value
        }));
        setError(null);
        setSuccess(null);
    }

    const handleUpdateEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!token) {
            setError("No tienes un token de autenticación válido");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        const data: UsuarioActualizado = {};

        if(!dataForm.current_email || !dataForm.email || !dataForm.email_confirmation) {
            setError("Debes llenar todos los campos de email");
            setLoading(false);
            return;
        }
        
        if(dataForm.email !== dataForm.email_confirmation) {
            setError("El email nuevo y la confirmación no coinciden");
            setLoading(false);
            return;
        }

        data.current_email = dataForm.current_email;
        data.email = dataForm.email;
        data.email_confirmation = dataForm.email_confirmation;

        try {
            await fetchActualizarDatos(token, data);

            setSuccess("Datos actualizados correctamente");
            // Limpiamos los campos del formulario
            setDataForm(CAMPOS_VACIOS);
        } catch(err) {
            const errMessage: string = (err as Error).message || "Error desconocido al intentar actualizar tus datos.";

            setError(errMessage);
        } finally {
            setLoading(false);
        }
    }

    if(!user) {
        return (
            <div className={styles.carga}>Cargando datos de usuario...</div>
        );
    }

    return (
        <>
            <form onSubmit={handleUpdateEmailSubmit} id={styles.formulario} className={styles.formulario_email}>
                <h2 className={styles.titulo}>Actualizar Email</h2>
                <div className="input-container">
                    <input 
                        type="email" 
                        name="current_email" 
                        id="current_email" 
                        placeholder=" " 
                        value={dataForm.current_email || ''} 
                        onChange={handleChange} 
                        required 
                        disabled={loading}
                    />
                    <label htmlFor="current_email">Email Actual</label>
                </div>

                <div className="input-container">
                    <input 
                        type="email" 
                        name="email" 
                        id="email" 
                        placeholder=" " 
                        value={dataForm.email || ''} 
                        onChange={handleChange} 
                        required 
                        disabled={loading}
                    />
                    <label htmlFor="email">Email Nuevo</label>
                </div>

                <div className="input-container">
                    <input 
                        type="email" 
                        name="email_confirmation" 
                        id="email_confirmation" 
                        placeholder=" " 
                        value={dataForm.email_confirmation || ''} 
                        onChange={handleChange} 
                        required 
                        disabled={loading}
                    />
                    <label htmlFor="email_confirmation">Confirmar Email</label>
                </div>

                <button
                    type="submit"
                    id={styles.botonActualizar}
                    disabled={loading}
                >
                    {loading ? 'Actualizando...' : 'Actualizar'}
                </button>
            </form>
        </>
    );
}

export default ActualizarEmail;