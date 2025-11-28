import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Home from "./pages/Home";
import { AuthProvider } from "./contexts/AuthContext";
import RegisterPage from "./pages/RegisterPage";
import AcercaDePage from "./pages/AcercaDePage";
import ContactoPage from "./pages/ContactoPage";
import CrearTareasPage from "./pages/CrearTareasPage.tsx";
import MusicPage from "./pages/MusicPage.tsx";
import DatosPersonales from "./pages/DatosPersonales.tsx";
import EntregasPage from "./pages/EntregasPage.tsx";
import Politica from "./pages/Politica.tsx";
import Usuarios from "./pages/Usuarios.tsx";
import Alumnos from "./pages/Alumnos.tsx";
import EditarAdmin from "./components/EditarAdmin.tsx";
import EditarProfesor from "./components/EditarProfesor.tsx";
import Canciones from "./pages/Canciones.tsx";
import Sugerencias from "./pages/Sugerencias.tsx";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/register" element={<RegisterPage/>} />
          <Route path="/terms" element={<Politica />} />
          <Route path="/acerca" element={<AcercaDePage/>} />
          <Route path="/contacto" element={<ContactoPage/>} />
          <Route path="/tareas/crear" element={<CrearTareasPage/>} />
          <Route path="/musica" element={<MusicPage/>} />
          <Route path="/datosPersonales" element={<DatosPersonales />} />
          <Route path="/entregas" element={<EntregasPage />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/usuarios/:userId/edit" element={<EditarAdmin />} />
          <Route path="/alumnos" element={<Alumnos />} />
          <Route path="/alumnos/:alumnoId/edit" element={<EditarProfesor />} />
          <Route path="/canciones" element={<Canciones />} />
          <Route path="/solicitudes" element={<Sugerencias />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}