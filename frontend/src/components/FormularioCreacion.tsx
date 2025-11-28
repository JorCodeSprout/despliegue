import type React from "react";
import { useAuth } from "../hooks/useAuth";
import type { CrearUsuarioAdminProps } from "../types";
import { useState } from "react";
import { fetchCrearUsuario } from "../api/perfilAdmin";
import styles from '../assets/styles/Usuarios.module.css'; 

const ROLES = [
    "ESTUDIANTE",
    "PROFESOR",
    "ADMIN"
];

const FormularioCreacion: React.FC<CrearUsuarioAdminProps> = ({profesores = []}) => {
    const { token, user } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [role, setRole] = useState('');
    const [profesorId, setProfesorId] = useState<number | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        switch(name) {
            case 'name':
                setName(value);
                break;
            case 'email':
                setEmail(value);
                break;
            case 'password':
                setPassword(value);
                break;
            case 'passwordConfirmation':
                setPasswordConfirmation(value);
                break;
            case 'role':
                setRole(value as "ESTUDIANTE" | "PROFESOR" | "ADMINISTRADOR");
                if(value !== "ESTUDIANTE") {
                    setProfesorId(null);
                }
                break;
            case 'profesorId':
                setProfesorId(value ? parseInt(value) : null);
                break;
            default:
                break;
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        setSuccess(null);

        if(!name || !email || !password || !passwordConfirmation || !role){
            setError("Todos los campos obligatorios deben estar llenos.");
            setLoading(false);
            return;
        }

        if(password !== passwordConfirmation) {
            setError("Las contraseñas no coinciden.");
            setLoading(false);
            return;
        }

        if(role === "ESTUDIANTE" && !profesorId) {
            setError("Todos los estudiantes deben tener un profesor.");
            setLoading(false);
            return;
        }

        if(!token || user?.role !== "ADMIN") {
            setError("Debes estar autenticado y tener los permisos necesarios.");
            setLoading(false);
            return;
        }

        try {
            const userData = {
                email: email,
                name: name,
                password: password,
                role: role as "ESTUDIANTE" | "PROFESOR" | "ADMIN",
                puntos: 0,
                profesor_id: profesorId
            }

            await fetchCrearUsuario(token, userData);

            setSuccess(`Usuario ${name} creado con éxito`);

            setName('');
            setEmail('');
            setPassword('');
            setPasswordConfirmation('');
            setRole('');
            setProfesorId(null);
        } catch(err) {
            const errMessage = err instanceof Error ? err.message : "Error desconocido al crear el usuario";
            setError(errMessage);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className={styles.usuariosForm}>
            <h2>Crear Nuevo Usuario</h2>

            {error && <p style={{color: "red"}}>{error}</p>}
            {success && <p style={{color: "green"}}>{success}</p>}

            <div className={styles.input_container}>
                <input 
                    type="text" 
                    name="name" 
                    id="name" 
                    placeholder=" " 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    disabled={loading}
                />
                <label htmlFor="name">Nombre completo *</label>
            </div>

            <div className={styles.input_container}>
                <input 
                    type="email" 
                    name="email" 
                    id="email" 
                    placeholder=" " 
                    value={email} 
                    autoComplete="off" 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    disabled={loading} 
                />
                <label htmlFor="email">Correo corporativo *</label>
            </div>

            <div className={styles.input_container}>
                <input 
                    type="password" 
                    name="password" 
                    id="password" 
                    placeholder=" " 
                    value={password} 
                    autoComplete="new-password" 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    disabled={loading}
                />
                <label htmlFor="password">Contraseña *</label>
            </div>

            <div className={styles.input_container}>
                <input 
                    type="password" 
                    name="passwordConfirmation" 
                    id="passwordConfirmation" 
                    placeholder=" " 
                    value={passwordConfirmation} 
                    autoComplete="new-password" 
                    onChange={(e) => setPasswordConfirmation(e.target.value)} 
                    required 
                    disabled={loading}
                />
                <label htmlFor="passwordConfirmation">Confirmar contraseña *</label>
            </div>

            <div className={`${styles.input_container} input-container`}>
                <label htmlFor="role"></label>
                <select 
                    name="role" 
                    id="role" 
                    value={role} 
                    onChange={handleChange} 
                    disabled={loading} 
                    required>

                    <option value="">SELECCIONAR ROL</option>
                    {ROLES.map(r => (
                        <option value={r} key={r}>{r}</option>
                    ))}

                </select>
            </div>

            {role === "ESTUDIANTE" && (
                <div className={`${styles.input_container} input-container`}>
                    <label htmlFor="profesorId"></label>
                    <select 
                        name="profesorId" 
                        id="profesorId" 
                        value={profesorId || ''} 
                        onChange={handleChange} 
                        disabled={loading} 
                        required>

                        <option value="">SELECCIONAR PROFESOR</option>
                        {profesores.map(profesor => (
                            <option key={profesor.email} value={profesor.id?.toString() ?? ''}>{profesor.name} - ({profesor.email})</option>
                        ))}

                    </select>
                </div>
            )}

            <button className={styles.crear} type="submit" disabled={loading}>
                {loading ? "Creando usuario..." : "Crear Usuario"}
            </button>
        </form>
    );
}

export default FormularioCreacion;