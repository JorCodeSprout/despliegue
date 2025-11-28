import type React from "react";
import { type EditarPropForm, type EditarUsuario, type ProfesorAdmin } from "../types";
import { useAuth } from "../hooks/useAuth";
import { useCallback, useEffect, useState } from "react";
import styles from '../assets/styles/Actualizar.module.css'; 
import { fetchActualizarDatosAdmin, fetchProfesores } from "../api/perfilAdmin";

const DATOS_VACIOS = {
    email: '',
    email_confirmation: '',
    name: '',
    puntos: 0,
    role: '',
    profesor_id: null,
};

const ROLES = [
    "ESTUDIANTE",
    "PROFESOR",
    "ADMIN"
];

type Role = 'ADMIN' | 'PROFESOR' | 'ESTUDIANTE';

const FormularioEdit: React.FC<EditarPropForm> = ({setError, setSuccess, id, profesorIdInicial = null}) => {
    const {token, user} = useAuth();

    const [dataForm, setDataForm] = useState<Partial<EditarUsuario>>(DATOS_VACIOS);
    const [loading, setLoading] = useState(false);
    const [profesorId, setProfesorId] = useState<number | null>(profesorIdInicial);
    const [profesores, setProfesores] = useState<ProfesorAdmin[]>([]);

    const loadProfesores = useCallback(async () => {
        if(!token) {
            return;
        }

        try {
            const data = await fetchProfesores(token);
            setProfesores(data);
        } catch(err) {
            console.error("Error al cargar los profesores: ", err);
            throw err;
        } 
    }, [token]);

    useEffect(() => {
        loadProfesores();
    }, [loadProfesores]);

    const handleChange = (e:React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setError(null);
        setSuccess(null);

        if(name === 'profesorId') {
            setProfesorId(value ? parseInt(value) : null);
            return;
        } else if(name === 'role') {
            if(value !== 'ESTUDIANTE') {
                setProfesorId(null);
            }
        }

        setDataForm(prev => ({
            ...prev,
            [name]: value
        }));
        setError(null);
        setSuccess(null);        
    }

    const handleUpdateDatos = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!token) {
            setError("No tienes un token de autenticación válido");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        const data: EditarUsuario = {};

        if (dataForm.email || dataForm.email_confirmation) {
            if (!dataForm.email || !dataForm.email_confirmation) {
                setError("Si deseas actualizar el email, debes proporcionar y confirmar ambos campos.");
                setLoading(false);
                return;
            }

            if (dataForm.email !== dataForm.email_confirmation) {
                setError("El email nuevo y la confirmación no coinciden");
                setLoading(false);
                return;
            }
            
            data.email = dataForm.email;
            data.email_confirmation = dataForm.email_confirmation;
        }

        if(dataForm.name) {
            if(dataForm.name.length >= 6) {
                data.name = dataForm.name;
            } else {
                setError("El nombre no ha pasado la verificación. Ha de tener mínimo 6 caracteres");
                return;
            }
        }

        if(user?.role === "ADMIN" && dataForm.role !== "") {
            if(!ROLES.includes(dataForm.role as Role)) {
                setError("El rol indicado no es válido");
                return;
            }
            data.role = dataForm.role;
        } 

        if(user?.role === "ADMIN" && dataForm.role === "ESTUDIANTE" && !profesorId) {
            setError("Los estudiantes deben tener un profesor asignado.");
            setLoading(false);
            return;
        }

        if (dataForm.role === "ESTUDIANTE" && profesorId !== undefined) {
            data.profesor_id = profesorId;
        } else if (dataForm.role !== "ESTUDIANTE") {
            data.profesor_id = null; 
        }

        const puntos = dataForm.puntos;
        
        if (puntos !== undefined && puntos !== null && puntos !== 0) {
            const puntosNum = Number(puntos);
            if(isNaN(puntosNum) || !Number.isInteger(puntosNum) || puntosNum < 0) {
                setError("Los puntos han de ser un número entero positivo");
                setLoading(false);
                return;
            }
            data.puntos = puntosNum;
        }

        if (Object.keys(data).length === 0) {
            setError("No se detectaron cambios para actualizar.");
            setLoading(false);
            return;
        }

        data.id = Number(id);

        try {
            await fetchActualizarDatosAdmin(token, data);

            setSuccess("Datos actualizados correctamente");
            // Limpiamos los campos del formulario
            setDataForm(DATOS_VACIOS);
        } catch(err) {
            console.log(data);
            
            const errMessage: string = (err as Error).message || "Error desconocido al intentar actualizar tus datos.";

            setError(errMessage);
        } finally {
            setLoading(false);
        }
    }

    if(!user) {
        return (
            <div className={styles.carga}>Cargando datos de usuario {id}...</div>
        );
    }

    return (
        <>
            <form onSubmit={handleUpdateDatos}>
                <h2 className={styles.titulo}>Actualizar Usuario</h2>
                <h3>ID {id}</h3>
                <div className={styles.input_container}>
                    <input 
                        type="text" 
                        name="name" 
                        id="name" 
                        placeholder=" " 
                        value={dataForm.name || ''} 
                        onChange={handleChange} 
                        disabled={loading}
                    />
                    <label htmlFor="name">Nombre Completo</label>
                </div>

                <div className={styles.input_container}>
                    <input 
                        type="email" 
                        name="email" 
                        id="email" 
                        placeholder=" " 
                        value={dataForm.email || ''} 
                        onChange={handleChange} 
                        disabled={loading}
                    />
                    <label htmlFor="email">Email Nuevo</label>
                </div>

                <div className={styles.input_container}>
                    <input 
                        type="email" 
                        name="email_confirmation" 
                        id="email_confirmation" 
                        placeholder=" " 
                        value={dataForm.email_confirmation || ''} 
                        onChange={handleChange} 
                        disabled={loading}
                    />
                    <label htmlFor="email_confirmation">Confirmar Email</label>
                </div>

                {user.role === "ADMIN" && (
                    <div className={styles.input_container}>
                        <label htmlFor="role"></label>
                        <select 
                            name="role" 
                            id="role" 
                            value={dataForm.role} 
                            onChange={handleChange} 
                            disabled={loading} >

                            <option value="">SELECCIONAR ROL</option>
                            {ROLES.map(r => (
                                <option value={r} key={r}>{r}</option>
                            ))}

                        </select>
                    </div>
                )}

                {user.role === "ADMIN" && dataForm.role === "ESTUDIANTE" && (
                    <div className={`${styles.input_container} input-container`}>
                        <label htmlFor="profesorId"></label> 
                        <select 
                            name="profesorId" 
                            id="profesorId" 
                            value={profesorId || ''} 
                            onChange={handleChange} 
                            disabled={loading}>

                            <option value="">SELECCIONAR PROFESOR</option>
                            {profesores.map(profesor => (
                                <option key={profesor.id} value={profesor.id}>{profesor.name} - ({profesor.email})</option>
                            ))}

                        </select>
                    </div>
                )}

                <div className={styles.input_container}>
                    <input 
                        type="number" 
                        name="puntos" 
                        id="puntos" 
                        placeholder=" " 
                        value={dataForm.puntos || 0} 
                        onChange={handleChange} 
                        disabled={loading}
                    />
                    <label htmlFor="puntos">Puntos</label>
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

export default FormularioEdit;