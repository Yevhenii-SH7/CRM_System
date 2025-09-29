import React from 'react';
import { FooterContainer, FooterText } from './styled/FooterStyled';

function Footer() {
    return (
        <FooterContainer>
            <FooterText variant="body2" color="text.secondary" align="center">
                © {new Date().getFullYear()} CRM Task Planner Yevhenii Shapoval. All rights reserved.
            </FooterText>
        </FooterContainer>
    );
};

export default Footer;