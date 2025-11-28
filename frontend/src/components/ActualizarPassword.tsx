import type React from "react";
import type { UsuarioActualizado, ActualizarPropForm } from "../types";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import { fetchActualizarDatos } from "../api/perfilEstudiante";
import styles from '../assets/styles/Actualizar.module.css'; 

const CAMPOS_VACIOS: Partial<UsuarioActualizado> = {
    password: '',
    current_password: '',
    password_confirmation: ''
};

const ActualizarPassword: React.FC<ActualizarPropForm> = ({setError, setSuccess}) => {
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

    const handleUpdatePasswordSubmit = async (e: React.FormEvent) => {
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
            setError("Debes llenar todos los campos de contraseña");
            setLoading(false);
            return;
        }
        
        if(dataForm.email !== dataForm.email_confirmation) {
            setError("La contraseña nueva y la confirmación no coinciden");
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
            <form onSubmit={handleUpdatePasswordSubmit} id={styles.formulario1} className={styles.formulario_password}>
                <h2 className={styles.titulo}>Actualizar Contraseña</h2>
                <div className="input-container">
                    <input 
                        type="password" 
                        name="current_password" 
                        id="current_password" 
                        placeholder=" " 
                        value={dataForm.current_email || ''} 
                        onChange={handleChange} 
                        required 
                        disabled={loading}
                    />
                    <label htmlFor="current_password">Contraseña Actual</label>
                </div>

                <div className="input-container">
                    <input 
                        type="password" 
                        name="password" 
                        id="password" 
                        placeholder=" " 
                        value={dataForm.email || ''} 
                        onChange={handleChange} 
                        required 
                        disabled={loading}
                    />
                    <label htmlFor="password">Nueva Contraseña</label>
                </div>

                <div className="input-container">
                    <input 
                        type="password" 
                        name="password_confirmation" 
                        id="password_confirmation" 
                        placeholder=" " 
                        value={dataForm.email_confirmation || ''} 
                        onChange={handleChange} 
                        required 
                        disabled={loading}
                    />
                    <label htmlFor="password_confirmation">Confirmar contraseña</label>
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

export default ActualizarPassword;