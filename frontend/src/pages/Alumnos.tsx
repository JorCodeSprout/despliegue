import type React from "react";
import Sidebar from "../components/Sidebar";
import ListadoUsuarios from "../components/Listado";
import styles from "../assets/styles/Usuarios.module.css";
import Footer from "../components/Footer";

const Alumnos: React.FC = () => {
    return (
        <div>
            <Sidebar/>
            <div id="body">
                <div className={styles.profesor}>
                    <div className={styles.mostrar_usuarios}>
                        <ListadoUsuarios />
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    );
}

export default Alumnos;