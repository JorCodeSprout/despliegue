/*
TODO
=============== 
1.- Formulario para actualizar la contraseña o email
2.- Historial de las peticiones realizadas
3.- Historial de entregas
*/
import React, { useState } from 'react';
import ActualizarPassword from './ActualizarPassword';

const DatosPersonales: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Actualizar Contraseña</h2>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
                    {success}
                </div>
            )}
            
            <ActualizarPassword 
                setError={setError} 
                setSuccess={setSuccess} 
            />
        </div>
    );
}

export default DatosPersonales;