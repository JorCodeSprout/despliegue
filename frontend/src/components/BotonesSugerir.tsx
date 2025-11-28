import type React from "react";
import type { BotonSugerirProps } from "../types";
import styles from "../assets/styles/Buscar.module.css";
import { Link } from "react-router-dom";

const BotonesSugerir: React.FC<BotonSugerirProps> = ({
    cancion, puntos, token, sugerenciasPendientes, sugerenciaEnCurso, handleSugerir
}) => {
    const sugerida = (cancionId: string) => {
        return sugerenciasPendientes.some(s => s.id_spotify_cancion === cancionId && s.estado === 'PENDIENTE');
    }

    const puntosSuficientes = Number(puntos) >= 50;
    const yaSugerida = sugerida(cancion.id);
    const sugiriendo = sugerenciaEnCurso === cancion.id;

    if(yaSugerida) {
        return (
            <button className={styles.sugerirButton} disabled>
                Sugerida (Pendiente)
            </button>
        );
    }

    if(puntosSuficientes && token) {
        return (
            <button className={styles.sugerirButton} onClick={() => handleSugerir(cancion)} disabled={sugiriendo}>
                {sugiriendo ? "Sugiriendo..." : "Sugerir"}
            </button>
        );
    }

    return (
        <Link to="/" className={styles.conseguirPuntos}>
            Conseguir puntos
        </Link>
    );
}

export default BotonesSugerir;