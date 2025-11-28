import React from 'react';

const footerTextStyles: React.CSSProperties = {
    color: 'grey',
    textAlign: 'center',
    fontSize: '0.8rem',
    margin: 0, 
    padding: '10px 0',
};

const Footer: React.FC = () => {
    return (
        <footer style={{ width: '100%', padding: '0'}}>
            <p style={footerTextStyles}>
                &copy; 2025 RITMATIZA. Todos los derechos reservados.
            </p>
        </footer>
    );
}

export default Footer;