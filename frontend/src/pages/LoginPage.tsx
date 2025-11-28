import React, { useCallback } from 'react';
import Layout from '../components/Layout';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/formulario_inicio.css'
import type { User } from '../types';


const mainContentStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    flexGrow: 1, 
};

const LoginPage: React.FC = () => {
    const {login} = useAuth();
    const navigate = useNavigate();

    const handleLoginSuccess = useCallback((apiToken: string, user: User) => {
        console.log("Login exitoso. Nombre del usuario: ", user)
        
        login(apiToken, user); 
        navigate('/');
    }, [login, navigate]);

    return (
        <Layout>
            <div style={mainContentStyles}>
                <LoginForm onLoginSuccess={handleLoginSuccess}/>
            </div>
        </Layout>
    );
};

export default LoginPage;