
import React from 'react';
import Musica from '../components/Musica';
import Sidebar from '../components/Sidebar';

const MusicPage: React.FC = () => {
    return (
        <>
            <Sidebar/>
            <Musica />
        </>
    );
}

export default MusicPage;