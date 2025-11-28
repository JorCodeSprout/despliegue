import React from 'react';
import Contacto from '../components/Contacto';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import Layout from '../components/Layout';

const ContactoPage: React.FC = () => {
    const {isLogged} = useAuth();
    return (
        isLogged ? (
            <>
                <Sidebar />
                <div id="body">
                    <Contacto />
                </div>
            </>
        ) : (
            <Layout>
                <Contacto/>
            </Layout>
        )
    );
}

export default ContactoPage;