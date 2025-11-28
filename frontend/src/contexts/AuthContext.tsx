import React, { useState, useEffect } from 'react';
import { AuthContext, type AuthContextType, type User } from "./AuthTypes.ts"; 

const initialAuthState: Omit<AuthContextType, 'login' | 'logout' | 'setUserData'> = {
    user: null,
    id: null,
    email: null,
    userName: null,
    role: null,
    puntos: null,
    profesorId: null,
    isLogged: false,
    token: null,
    loadingAuth: true,
};

const storageKey = 'userAuthData';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [authState, setAuthState] = useState(initialAuthState);

    useEffect(() => {
        const loadInitialState = () => {
            try {
                const storedData = localStorage.getItem(storageKey);
                if (storedData) {
                    const parsedData = JSON.parse(storedData);
                    
                    if (parsedData.token) {
                        setAuthState(prev => ({
                            ...prev,
                            ...parsedData,
                            isLogged: true,
                        }));
                    }
                }
            } catch (error) {
                console.error("Error al cargar el estado de autenticación:", error);
                localStorage.removeItem(storageKey);
            } finally {
                setAuthState(prev => ({ ...prev, loadingAuth: false }));
            }
        };

        loadInitialState();
    }, []);

    const login: AuthContextType['login'] = (newToken, user) => {
        const fullData = { 
            id: user.id,
            email: user.email,
            userName: user.name,
            role: user.role,
            puntos: user.puntos,
            profesorId: user.profesor_id,
            token: newToken 
        };
        
        setAuthState(prev => ({
            ...prev,
            ...fullData,
            isLogged: true,
            loadingAuth: false,
        }));
        
        localStorage.setItem(storageKey, JSON.stringify(fullData));
    };

    const logout: AuthContextType['logout'] = () => {
        setAuthState({
            ...initialAuthState,
            loadingAuth: false,
        });
        localStorage.removeItem(storageKey);
    };

    const setUserData: AuthContextType['setUserData'] = (newUserData) => {
        setAuthState(prev => {
            const newState = { 
                ...prev, 
                ...newUserData,
                role: newUserData.role !== undefined ? newUserData.role : prev.role,
                puntos: newUserData.puntos !== undefined ? newUserData.puntos : prev.puntos
            };

            const dataToStore = {
                id: newState.id,
                email: newState.email,
                userName: newState.userName,
                role: newState.role,
                puntos: newState.puntos,
                profesorId: newState.profesorId,
                token: newState.token
            }; 
            localStorage.setItem(storageKey, JSON.stringify(dataToStore));
            
            return newState;
        });
    };

    const currentUser: User | null = authState.isLogged && authState.id !== null && authState.email !== null 
        ? {
            id: authState.id,
            name: authState.userName || '',
            email: authState.email,
            role: (authState.role as User['role']) || 'ESTUDIANTE',
            puntos: authState.puntos,
            profesor_id: authState.profesorId,
        }
        : null;

    const contextValue: AuthContextType = {
        ...authState,
        user: currentUser,
        login,
        logout,
        setUserData,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};