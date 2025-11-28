import type React from "react";
import Sidebar from "../components/Sidebar";
import SugerenciaCard from "../components/SugerenciaCard";
import styles from "../assets/styles/Sugerencias.module.css";
import { useAuth } from "../hooks/useAuth";
import Footer from "../components/Footer";

const Sugerencias: React.FC = () => {
    const {user} = useAuth();
    return (
        <>
            <Sidebar />
            <div id="body">
                {user?.role === "ADMIN" ? (
                        <h1 className={styles.sugerenciasTitulo}>Solicitudes recibidas</h1>
                    ) : (
                        <h1 className={styles.sugerenciasTitulo}>Mis solicitudes</h1>
                    )}
                <div className={styles.contenedor}>
                    <SugerenciaCard />
                </div>

                <Footer />
            </div>
        </>
    )
}

export default Sugerencias;