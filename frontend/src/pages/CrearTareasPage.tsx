import '../assets/styles/formulario_tareas.css';
import React from "react";
import CrearTarea from "../components/CrearTarea.tsx";
import Sidebar from '../components/Sidebar.tsx';
import Footer from '../components/Footer.tsx';

const CrearTareasPage: React.FC = () => {
    return (
        <>
            <Sidebar />
            <div id="body">
                <CrearTarea />    
                <Footer />
            </div>
        </>
    )
}

export default CrearTareasPage;