/// <reference path="../../support/commands.d.ts" />

import { credentials } from "../../support/credentials";

it('should be on the login page', () => {
    cy.visit('/n/quick-setup');
    cy.contains('Please sign in');
});

it('should login', () => {
    cy.createUser(2).then((creds) => {
        cy.logout();
        cy.login(creds);

        // TODO: The firstName value doesn't consistently appear upon login, even with a long timeout
        // so we will wait on something more consistent
        // See github issue: https://github.com/Joelasaur/updater/issues/4
        // cy.contains('Welcome, ' + creds.firstName, { timeout: 10000 });
        // User greeting page has loaded
        cy.contains('Set up Internet/TV', { timeout: 10000 });
    });

});