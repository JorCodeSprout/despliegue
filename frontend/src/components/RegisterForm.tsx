import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { RegisterFormProps, User } from "../types";

const API_URL = import.meta.env.VITE_API_URL;

const RegisterForm: React.FC<RegisterFormProps> = ({ registroExitoso }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [terminos, setTerminos] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e:React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if(password !== passwordConfirmation) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        } 

        if(!terminos) {
            setError('Debes aceptar los términos y condiciones');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/register`, {
                name: name,
                email: email,
                password: password
            });

            const token = response.data.access_token;
            const userObject: User = response.data.user;

            // Se pasa el objeto user COMPLETO al AuthProvider
            if(token && userObject) {
                registroExitoso(token, userObject);
            } else {
                setError('Respuesta inválida del servidor después del registro.');
            }
        } catch(err) {
            if(axios.isAxiosError(err) && err.response) {
                const backendError = err.response.data.message || 'Error al procesar el registro';
                setError(backendError);
            } else {
                setError('Error de red o servidor no disponible');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} autoComplete="off">
            <h2>Bienvenido</h2>
            <p>Crea una nueva cuenta para poder ganar recompensas</p>

            {error && <p style={{color: 'red', fontWeight: 'bold'}}>{error}</p>}

            <div className="input-container">
                <input 
                    type="text" 
                    name="nombre" 
                    id="nombre" 
                    placeholder=" " 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    disabled={loading}
                />
                <label htmlFor="nombre">Nombre completo *</label>
            </div>

            <div className="input-container">
                <input 
                    type="email" 
                    name="correo" 
                    id="correo" 
                    placeholder=" " 
                    value={email} 
                    autoComplete="off" 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    disabled={loading} 
                />
                <label htmlFor="correo">Correo corporativo *</label>
            </div>

            <div className="input-container">
                <input 
                    type="password" 
                    name="clave" 
                    id="clave" 
                    placeholder=" " 
                    value={password} 
                    autoComplete="new-password" 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    disabled={loading}
                />
                <label htmlFor="clave">Contraseña *</label>
            </div>

            <div className="input-container">
                <input 
                    type="password" 
                    name="confirmacion" 
                    id="confirmacion" 
                    placeholder=" " 
                    value={passwordConfirmation} 
                    autoComplete="new-password" 
                    onChange={(e) => setPasswordConfirmation(e.target.value)} 
                    required 
                    disabled={loading}
                />
                <label htmlFor="confirmacion">Confirmar contraseña *</label>
            </div>

            <div className="term-container">
                <input type="checkbox" 
                name="terms" 
                id="terms" 
                checked={terminos} 
                onChange={(e) => setTerminos(e.target.checked)} 
                disabled={loading} 
            />

            <label htmlFor="terms">
                Acepto los <Link to="/terms">Términos y Condiciones</Link>
            </label>
            </div>

            <button
                type="submit"
                id='registro'
                disabled={loading}
            >
                {loading ? 'Registrando...' : 'Registrarse'}
            </button>

            <p>¿Ya tienes una cuenta?</p>

            <button
                type="button"
                id='iniciar'
                onClick={() => navigate('/login')}
                disabled={loading}
            >
                Iniciar sesión
            </button>
        </form>
    );
}

export default RegisterForm;