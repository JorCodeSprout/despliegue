import type React from "react";
import type { BuscarCancionesFormProp } from "../types";
import { useState, type FormEvent } from "react";
import { fetchBuscarCanciones } from "../api/solicitudes";
import styles from "../assets/styles/Buscar.module.css"

const Buscador: React.FC<BuscarCancionesFormProp> = ({token, resultadosBusqueda, setError}) => {
    const [query, setQuery] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if(query?.trim().length < 3) {
            setError("La búsqueda debe tener al menos 3 caracteres");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetchBuscarCanciones(token, query.trim());

            resultadosBusqueda(response);
        } catch (err) {
            console.error("Error al buscar canciones: ", err);
            const errorMessage = err instanceof Error ? err.message : "Error desconocido al realizar la búsqueda";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className={styles.buscador}>
            <h2>Buscador de canciones</h2>
            <div className={styles.input_container}>
                <input 
                    type="text" 
                    name="query"
                    id="query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder=" "
                    disabled={loading}
                />
                <label htmlFor="query">Buscar canción...</label>
            </div>

            <button type="submit" disabled={loading}>
                {loading ? "Buscando..." : "Buscar"}
            </button>
        </form>
    );
}

export default Buscador;