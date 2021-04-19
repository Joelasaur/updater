before('Visit login page and do setup', () => {
    cy.visit('/');
});

it('should be on the login page', () => {
    cy.contains('Please sign in');
});

it('should login', () => {
    // Enter login info
    cy.get('[name="email"]').type(Cypress.env('UPDATER_USERNAME'));
    cy.get('[name="password"]').type(Cypress.env('UPDATER_PASSWORD'));
    // Click submit
    cy.get('.uds-button').click();
    // User greeting page has loaded
    cy.contains('Welcome, SDET!');
});