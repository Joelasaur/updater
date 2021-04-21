/// <reference path="../../support/commands.d.ts" />

import { credentials } from "../../support/credentials";

it('should be on the login page', () => {
    cy.visit('/n/quick-setup');
    cy.contains('Please sign in');
});

it('should login', () => {
    cy.createUser().then((creds) => {
        cy.logout();
        cy.login(creds);
        // User greeting page has loaded
        cy.contains('Welcome, ' + creds.firstName);
    });

});