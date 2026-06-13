import React from 'react';
import InfoCards from '../components/UI/InfoCards/InfoCards';
import PersonalPNP from '../components/UI/PersonalPageNamePart/PersonalPNP';
import PersonalList from '../components/UI/PersonaList/PersonalList';
import PersonaListNotVerify from '../components/UI/PersonaListNotVerify/PersonaListNotVerify';

const PersonalPage = (user) => {
    return (
        <div className='mainholder'>
            <PersonalPNP />
            <InfoCards />
            <PersonalList/>
            <PersonaListNotVerify/>
        </div>

    );
};

export default PersonalPage; 