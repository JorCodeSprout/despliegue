import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import '../assets/styles/formulario_inicio.css'

const URL = '/api/';

const EMAIL_API_URL = `${URL}/contacto`;
const Contacto = () => {
    const {user} = useAuth();

    const [name, setName] = useState(user?.name ?? '');
    const [email, setEmail] = useState(user?.email ?? '');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitStatus({type: '', message: ''});

        if(!name || !email || !subject || !message) {
            setSubmitStatus({type: 'error', message: 'Por favor, rellena todos los campos'});
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(EMAIL_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({name, email, subject, message})
            });

            if(!response.ok) {
                const errData = await response.json().catch(() => ({
                    message: 'Error desconocido del servidor'
                }));
                throw new Error(errData['message'] || 'Error al enviar el mensaje');
            }

            setSubmitStatus({
                type: 'success',
                message: '¡Mensaje enviado con éxito! Nos pondremos en contacto pronto'
            });

            setName('');
            setEmail('');
            setSubject('');
            setMessage('');
        } catch (error) {
            const errMessage = error instanceof Error ? error.message : 'Error de conexión o servidor no disponible';
            setSubmitStatus({
                type: 'error',
                message: `Hubo un error: ${errMessage}`
            });
        } finally {
            setLoading(false);
        }
    }

    const StatusMessage = () => {
        if (!submitStatus.message) return null;
        
        const style = submitStatus.type === 'success' ? 
            { color: '#10B981', fontWeight: 'bold', marginBottom: '10px' } : 
            { color: '#EF4444', fontWeight: 'bold', marginBottom: '10px' };

        return <p style={style}>{submitStatus.message}</p>;
    }

    return (
        <div className={`${user ? 'logged-contact-form' : 'noLogged'}`}>
            <form onSubmit={handleSubmit} className="contact-form">
                <h2>Contáctanos</h2>
                <p className='description'>
                    ¿Tienes alguna duda o propuesta? Déjanos un mensaje.
                </p>

                <StatusMessage />

                <div className='input-container'>
                    <input 
                        type="text" 
                        name="name" 
                        id="name" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder=' '
                        disabled={loading}
                    />
                    <label htmlFor="name">Nombre completo</label>
                </div>

                <div className='input-container'>
                    <input 
                        type="email" 
                        name="email" 
                        id="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder=' '
                        disabled={loading}
                    />
                    <label htmlFor="email">Correo electrónico</label>
                </div>

                <div className='input-container'>
                    <input 
                        type="text" 
                        name="subject" 
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                        placeholder=' ' 
                        disabled={loading}
                    />
                    <label htmlFor="subject">Asunto</label>
                </div>

                <div className='input-container'>
                    <textarea 
                        name="message" 
                        id="message"
                        rows={6}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        placeholder=' ' 
                        disabled={loading}
                    ></textarea>
                    <label htmlFor="message">Tu mensaje</label>
                </div>

                <button 
                    type="submit" 
                    id="iniciar"
                    disabled={loading}
                >
                    {loading ? 'Enviando...' : 'Enviar mensaje'}
                </button>
            </form>
        </div>
    );
}

export default Contacto;
