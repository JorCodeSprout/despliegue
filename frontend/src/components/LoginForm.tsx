import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { LoginFormProps, User } from '../types';

const API_URL = '/api';

const LoginForm: React.FC<LoginFormProps> = ({onLoginSuccess}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/login`, {
                email: email,
                password: password,
            });

            const token = response.data.access_token;
            const userObject: User = response.data.user; 

            if(token && userObject) {
                // Se ejecuta el callback de éxito, pasando el objeto user completo
                onLoginSuccess(token, userObject); 
            }else {
                setError('Respuesta inválida del servidor');
            }
        } catch(err) {
            if(axios.isAxiosError(err) && err.response && err.response.status === 401) {
                setError('Credenciales incorrectas. Inténtalo de nuevo');
            } else {
                setError('Error al conectar con el servidor.');
                console.error('Error de Login: ', err);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Bienvenido</h2>
            <p>Inicia sesión para solicitar una canción</p>

            {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

            <div className='input-container'>
                <input 
                    type="email" 
                    name="correo" 
                    id="correo" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder=' '
                    pattern='^.+@ritmatiza\.local$'
                    disabled={loading}
                />
                <label htmlFor="correo">Correo corporativo</label>
            </div>

            <div className='input-container'>
                <input 
                    type="password" 
                    name="clave" 
                    id="clave"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder=' ' 
                    disabled={loading}
                />
                <label htmlFor="clave">Contraseña</label>
            </div>

            <p className='olvidado'>
                <Link to="/forgot-password" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}>
                    ¿Olvidaste tu contraseña?
                </Link>
            </p>

            <button 
                type="submit" 
                id='iniciar' 
                disabled={loading}
            >
                {loading ? 'Iniciando...' : 'Iniciar sesión'}
            </button>

            <p>¿No tienes una cuenta?</p>

            <button 
                type="button"
                className='registro'
                onClick={() => navigate('/register')}
                disabled={loading}
            >
                Registrarse
            </button>
        </form>
    );
};

export default LoginForm;