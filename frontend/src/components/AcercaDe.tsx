import React from "react";
import "../assets/styles/AcercaDe.css";

const AcercaDe: React.FC = () => {
    return (
        <div id="body">
            <div className="grid-container">
                <div className="grid-item bloque-header-izq">
                    <img
                        src="../../public/images/RITMATIZA.png"
                        alt="Logo de Ritmatiza"
                        className="ritmatiza-logo"
                    />
                    <h1>MÚSICA PARA MOTIVAR, PUNTOS PARA INSPIRAR</h1>
                </div>

                <section className="about-section">
                    <h2>🎶 Armonizando el Esfuerzo y la Música 🎶</h2>

                    <p>En Ritmatiza creemos que la motivación es el <em>tempo</em> del aprendizaje. Hemos creado una innovadora aplicación web que transforma las tareas académicas en una emocionante búsqueda de recompensas musicales. Nuestro objetivo es simple pero poderoso: convertir la responsabilidad en una fuente de alegría y empoderamiento estudiantil.</p>

                    <hr />

                    <h3>✨ Nuestra Misión ✨</h3>

                    <p><strong>Ritmatiza existe para inspirar a la próxima generación de estudiantes.</strong> Queremos forjar un vínculo positivo entre el esfuerzo académico y la recompensa tangible, utilizando la música como catalizador. Al permitir que los estudiantes definan la banda sonora de su centro educativo, no solo fomentamos la finalización de tareas, sino que también cultivamos un sentido de comunidad, pertenencia y autogestión dentro del entorno escolar.</p>

                    <ul>
                        <li>
                            Gamificación del Aprendizaje: Transformar el "deber" en "desafío" a través de un sistema de puntos y recompensas.
                        </li>
                        <li>
                            Voz Estudiantil: Otorgar a los alumnos el poder de personalizar su ambiente escolar a través de la música que aman.
                        </li>
                        <li>
                            Filtro Seguro: Mantener un ambiente de escucha apropiado y respetuoso, garantizando que todas las canciones pasen un filtro de seguridad.
                        </li>
                    </ul>

                    <hr />

                    <h3>💡 ¿Cómo Funcionamos? 💡</h3>
                    <p>Ritmatiza es más que una <em>playlist</em>, es un ecosistema de motivación:</p>

                    <div className="process-steps">
                        <div className="step-card">
                            <h4>1. Gana Puntos</h4>
                            <p>Los estudiantes completan tareas asignadas por los profesores. Con la entrega de dichas tareas pueden conseguir puntos para posteriormente comprar canciones.</p>
                        </div>
                        <div className="step-card">
                            <h4>2. Canjea Canciones</h4>
                            <p>Una vez acumulados los puntos necesarios, el alumno solicita su canción favorita para la playlist oficial del centro.</p>
                        </div>
                        <div className="step-card">
                            <h4>3. La Banda Sonora de Todos</h4>
                            <p>Tras el filtro de seguridad y la aprobación del Administrador, la canción se añade a la cola, sonando en el centro. ¡La música que escuchan es el fruto de su propio  esfuerzo!
                            </p>
                        </div>
                    </div>

                    <p className="note">Nuestro sistema de acceso por roles (Alumno, Profesor y Administrador) asegura que cada miembro de la comunidad tenga las herramientas necesarias para contribuir al ritmo del centro, manteniendo la seguridad y la equidad en el proceso.</p>
                </section>
            </div>
        </div>
    );
};

export default AcercaDe;
