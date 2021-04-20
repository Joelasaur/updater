/// <reference path="../../support/commands.d.ts" />

it('should be on the login page', () => {
    cy.visit('/n/quick-setup');
    cy.contains('Please sign in');
});

it('should login', () => {
    cy.login();
    // User greeting page has loaded
    cy.contains('Welcome, SDET!');
});