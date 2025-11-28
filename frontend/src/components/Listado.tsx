import type React from "react";
import type { UsuarioAdmin, UsuarioProfesor } from "../types";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { fetchUsuarios } from "../api/perfilAdmin";
import styles from "../assets/styles/Usuarios.module.css"
import { Link } from "react-router-dom";

export const TablaAdmin: React.FC<{usuarios: UsuarioAdmin[], loading: boolean}> = ({usuarios, loading}) => (
    <div className={styles.tabla_card}>
        <h3 className={styles.titulo_listado}>Listado General de Usuarios</h3>
        
        <div className={styles.tabla_scroll_container}>
            {loading ? (
                <p style={{marginLeft: "20px"}}>Cargando usuarios...</p>
            ) : (
                usuarios.length <= 0 ? (
                    <p style={{color: "red"}}>No existen usuarios</p>
                ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map((u) => (
                            <tr key={u.id}>
                                <td>{u.name}</td>
                                <td>{u.email}</td>
                                <td>{u.role}</td>
                                <td>
                                    {u.role !== "ADMIN" && (
                                        <Link to={`/usuarios/${u.id}/edit`}>Editar</Link>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ))}
        </div>
    </div>
);

export const TablaProfesor: React.FC<{alumnos: UsuarioProfesor[], loading: boolean}> = ({alumnos, loading}) => (
    <div className={styles.tabla_card2}>
        <h3 className={styles.titulo_listado}>Estudiantes Asignados</h3>
        <div className={styles.tabla_scroll_container2}>
            {loading ? (
                <p>Cargando alumnos...</p>
            ) : (
                alumnos.length <= 0 ? (
                    <p style={{color: "red"}}>No tienes alumnos a tu cargo</p>
                ) :  (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Puntos</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {alumnos.map((a) => (
                                <tr key={a.id}>
                                    <td>{a.id}</td>
                                    <td>{a.name}</td>
                                    <td>{a.email}</td>
                                    <td>{a.puntos}</td>
                                    <td>
                                        <Link to={`/alumnos/${a.id}/edit`}>Editar</Link>
                                </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )
            )}
        </div>
    </div>
);

const ListadoUsuarios: React.FC = () => {
    const {token, role} = useAuth();
    const [usuarios, setUsuarios] = useState<UsuarioAdmin[] | UsuarioProfesor[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if(!token || (role !== "ADMIN" && role !== "PROFESOR")) {
            setLoading(false);
            if(!token) {
                setError("No estás autenticado");
            }
            else {
                setError("No tienes permisos para ver el listado");
            }
            return;
        } 

        const cargarUsuarios = async () => {
            try {
                setError(null);
                setLoading(true);
                const data = await fetchUsuarios(token);
                setUsuarios(data.usuarios);
            } catch(err) {
                console.error("Error al cargar los usuarios: ", err);
                setError(err instanceof Error ? err.message : "Error desconocido al cargar los datos");
            } finally {
                setLoading(false);
            }
        }

        cargarUsuarios();
    }, [token, role]);

    return (
        <>
            {error && <p style={{color: "red"}}>{error}</p>}

            {role === "ADMIN" && (
                <TablaAdmin usuarios={usuarios as UsuarioAdmin[]} loading={loading} />
            )}

            {role === "PROFESOR" && (
                <TablaProfesor alumnos={usuarios as UsuarioProfesor[]} loading={loading} />
            )}

            {role !== "PROFESOR" && role !== "ADMIN" && (
                <div className="p-4 bg-yellow-100 text-yellow-700 rounded-md">Acceso denegado</div>
            )}
        </>
    );
}

export default ListadoUsuarios;