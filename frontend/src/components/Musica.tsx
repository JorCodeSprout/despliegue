import React, { useCallback, useState } from "react";
import styles from '../assets/styles/Musica.module.css' 
import { useAuth } from "../hooks/useAuth";
import Sidebar from "./Sidebar";
import { Link } from "react-router-dom";
import Footer from "./Footer";

const Musica: React.FC = () => {
    const {user} = useAuth();
    const [iframeKey, setIframeKey] = useState(0);

    const handleRecargar = useCallback(() => {
        setIframeKey(prev => prev + 1);
    }, []);

    if(user?.role === "ESTUDIANTE") {
        return (
            <>
                <Sidebar />
                <div id="body">
                    <div className={styles.permiso_denegado}>
                        <h2>No tienes permiso para estar aquí</h2>
                        <Link to="/datosPersonales">Vuelve a tu perfil</Link>
                    </div>
                </div>
            </>
        );
    }

    const spotifyUrl = "https://open.spotify.com/embed/playlist/4l1f3lTvE51CtwLa53KuGz?utm_source=generator";

    return (
        <div id="body">
            <div className={styles.grid_container}>
                <div className={styles.grid_item}>
                    <div className={styles.header_content}>
                        <h1>RITMATIZANDO ALUMNOS</h1>
                    </div>
                </div>

                <button onClick={handleRecargar} className={styles.boton_recargar}>
                    Recargar Playlist
                </button>
                
                <div className="playlist_contenedor">
                    <iframe key={iframeKey} data-testid="embed-iframe" src={spotifyUrl} width="90%" height="500" allow="clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default Musica;