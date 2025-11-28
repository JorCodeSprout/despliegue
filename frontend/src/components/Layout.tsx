import React from 'react';
import Header from './Header'; 
import Footer from './Footer'; 
import type { LayoutProps } from '../types';

const Layout: React.FC<LayoutProps> = ({ children, includeFooter = true }) => {
    return (
        <div id='body'>
            <Header />

            <main>
                {children}
            </main>

            {includeFooter && <Footer />}
        </div>
    );
}

export default Layout;