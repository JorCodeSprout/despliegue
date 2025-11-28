import React from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../assets/styles/general.css';

const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px">
        <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z"/>
    </svg>
);

const AdminIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px"><path d="M680-280q25 0 42.5-17.5T740-340q0-25-17.5-42.5T680-400q-25 0-42.5 17.5T620-340q0 25 17.5 42.5T680-280Zm0 120q31 0 57-14.5t42-38.5q-22-13-47-20t-52-7q-27 0-52 7t-47 20q16 24 42 38.5t57 14.5ZM480-80q-139-35-229.5-159.5T160-516v-244l320-120 320 120v227q-19-8-39-14.5t-41-9.5v-147l-240-90-240 90v188q0 47 12.5 94t35 89.5Q310-290 342-254t71 60q11 32 29 61t41 52q-1 0-1.5.5t-1.5.5Zm200 0q-83 0-141.5-58.5T480-280q0-83 58.5-141.5T680-480q83 0 141.5 58.5T880-280q0 83-58.5 141.5T680-80ZM480-494Z"/></svg>
);

const Header: React.FC = () => {
    const navigate = useNavigate();
    const {isLogged, logout, role} = useAuth();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
    }

    const paginaLogin = location.pathname === '/login';
    const paginaRegister = location.pathname === '/register';

    const menuItems = [
        { id: 'inicio', name: 'Inicio', href: '/' },
        { id: 'acerca', name: 'Acerca de', href: '/acerca' },
        { id: 'contacto', name: 'Contacto', href: '/contacto' },
    ];

    const menuLinksAMostrar = menuItems;

    return (
        <header>
            <Link to="/">
                <img 
                    src="../public/images/RITMATIZA.png"
                    alt="logo" 
                    title="logo"
                />
            </Link>

            <nav className='menu'>
                <ul>
                    {menuLinksAMostrar.map((item) => (
                        <li key={item.id} id={item.id}>
                            <NavLink to={item.href}>
                                {item.name}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div id="acceso">
                {isLogged ? (
                    <>
                        <button onClick={handleLogout} className='cerrar'>
                            Cerrar sesión
                        </button>
                        <Link to='/perfil' title='Ver perfil' className='user-icon'>
                            {role === "ADMIN" ? (
                                <AdminIcon fill='#1a3a5a' />
                            ): (
                                <UserIcon fill='#1a3a5a' />
                            )}
                        </Link>
                    </>
                ) : (
                    <>
                    {!paginaLogin && ( 
                        <button onClick={() => navigate('/login')} id='iniciar_sesion'>
                            Iniciar sesión
                        </button>
                    )}
                    {!paginaRegister && (
                        <button onClick={() => navigate('/register')}  className='registro_sesion'>
                            Registrarse
                        </button>
                    )}
                    </>
                )}
            </div>
        </header>
    );
}

export default Header;