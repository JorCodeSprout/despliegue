import type React from "react";
import { useParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import FormularioEdit from "./FormularioEdit";
import { useState } from "react";
import styles from '../assets/styles/Usuarios.module.css'; 

const EditarAdmin: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const params = useParams<{ userId: string }>();
    const userId = params.userId;

    if(!userId) {
        setError("No se encontró el ID del usuario que quieres editar en la URL");
        return;
    }

    return (
        <>
            <Sidebar />
            <div id="body">
                <div className={styles.contenedor}>
                    {error && <p style={{color: "red"}}>{error}</p>}
                    {success && <p style={{color: "green"}}>{success}</p>}
                    <div>
                            <FormularioEdit setError={setError} setSuccess={setSuccess} id={userId} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default EditarAdmin;