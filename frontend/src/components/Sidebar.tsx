import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; 
import styles from '../assets/styles/Sidebar.module.css'; 
import type { MenuItem } from '../types';

const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px">
        <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z"/>
    </svg>
);

const AdminIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px"><path d="M680-280q25 0 42.5-17.5T740-340q0-25-17.5-42.5T680-400q-25 0-42.5 17.5T620-340q0 25 17.5 42.5T680-280Zm0 120q31 0 57-14.5t42-38.5q-22-13-47-20t-52-7q-27 0-52 7t-47 20q16 24 42 38.5t57 14.5ZM480-80q-139-35-229.5-159.5T160-516v-244l320-120 320 120v227q-19-8-39-14.5t-41-9.5v-147l-240-90-240 90v188q0 47 12.5 94t35 89.5Q310-290 342-254t71 60q11 32 29 61t41 52q-1 0-1.5.5t-1.5.5Zm200 0q-83 0-141.5-58.5T480-280q0-83 58.5-141.5T680-480q83 0 141.5 58.5T880-280q0 83-58.5 141.5T680-80ZM480-494Z"/></svg>
);

const Sidebar: React.FC = () => {
    const { isLogged, user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [adminMenuOpen, setAdminMenuOpen] = useState(false);
    const menuAdmin = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        logout();
        navigate('/');
    }

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if(menuAdmin.current && !menuAdmin.current.contains(event.target as Node)) {
                setAdminMenuOpen(false);
            }
        }

        if(adminMenuOpen) {
            document.addEventListener('click', handleClick);
        }

        return () => {
            document.removeEventListener('click', handleClick);
        }
    }, [adminMenuOpen]);

    const menuItems: MenuItem[] = useMemo(() => {
        if (!isLogged || !user?.role) {
            return [
                { id: 'inicio', name: 'Inicio', href: '/' },
                { id: 'musica', name: 'Playlist', href: '/musica' },
                { id: 'acerca', name: 'Acerca de', href: '/acerca' },
                { id: 'contacto', name: 'Contacto', href: '/contacto' },
            ];
        }

        switch(user?.role) {
            case "ESTUDIANTE":
                return [
                    {id: 'inicio', name: 'Tareas', href: '/'},
                    {id: 'entregas', name: 'Entregas', href: '/entregas'},
                    {id: 'canciones', name: 'Canciones', href: '/canciones'},
                    {id: 'solicitudes', name: 'Solicitudes', href: '/solicitudes'},
                    { id: 'contacto', name: 'Contacto', href: '/contacto' },
                    {id: 'datosPersonales', name: 'Cuenta', href: '/datosPersonales'},
                ];
            case "PROFESOR":
                return [
                    {id: 'inicio', name: 'Tareas', href: '/'},
                    {id: 'entregas', name: 'Entregas', href: '/entregas'},
                    {id: 'musica', name: 'Playlist', href: '/musica'},
                    {id: 'alumnos', name: 'Alumnos', href: '/alumnos'},
                    { id: 'contacto', name: 'Contacto', href: '/contacto' },
                    {id: 'datosPersonales', name: 'Cuenta', href: '/datosPersonales'},
                ];
            case "ADMIN":
                return [
                    {id: 'inicio', name: 'Inicio', href: '/'},
                    {id: 'musica', name: 'Playlist', href: '/musica'},
                    {id: 'solicitudes', name: 'Solicitudes', href: '/solicitudes'},
                    {id: 'usuarios', name: 'Usuarios', href: '/usuarios'},
                ];
        }
    }, [isLogged, user?.role]);

    return (
        <div className={styles.sidebar}>
            <div className={styles.header}>
                <Link to="/">
                    <img 
                        src="/images/RITMATIZA.png"
                        alt="logo" 
                        title="RITMATIZA Logo"
                        className={styles.logo}
                    />
                </Link>
            </div>

            <nav className={styles.navigation}>
                <ul>
                    {menuItems.map((item) => (
                        <li key={item.id} id={item.id} className={styles.navItem}>
                            <NavLink to={item.href} className={({isActive}) => 
                                isActive
                                    ? `${styles.navLink} ${styles.isActive}`
                                    : styles.navLink 
                                }>
                                {item.name}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className={styles.footer}>
                {isLogged ? (
                    <div ref={menuAdmin}>
                        {adminMenuOpen && (
                            <div className={styles.div_boton_admin}>
                                <button 
                                    onClick={handleLogout} 
                                    className={styles.logoutButton}
                                >
                                    Cerrar sesión
                                </button>
                            </div>
                        )}

                        <div onClick={() => setAdminMenuOpen(prev => !prev)} title='Cerrar sesión' className={styles.userProfile}>
                            {user?.role !== "ADMIN" ? (
                                <>
                                    <UserIcon className={styles.userIconSvg} fill='white' /> 
                                    <div className={styles.userInfo}>
                                        <div className={styles.userName}>{user?.name}</div>
                                        <div className={styles.userRole}>{user?.role}</div>
                                        <div className={styles.userEmail}>{user?.email}</div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <AdminIcon className={styles.userIconSvg} fill='white' />
                                    <div className={styles.userInfo}>
                                        <div className={styles.userName}>{user?.name}</div>
                                        <div className={styles.userRole}>{user?.role}</div>
                                        <div className={styles.userEmail}>{user?.email}</div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className={styles.accessLinks}>
                        {location.pathname !== '/login' && (
                            <Link to='/login' className={styles.accessButton}>
                                Iniciar sesión
                            </Link>
                        )}
                        {location.pathname !== '/register' && (
                        <Link to='/register' className={styles.accessButton}>
                                Registrarse
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Sidebar;