beforeEach('Visit login page and do setup', () => {
    // Seems to be an important request for loading the logged in page,
    // so we will intercept and wait for it
    cy.intercept('POST', 'https://logx.optimizely.com/v1/events').as('events');
    cy.visit('/');
});

it('should be on the login page', () => {
    cy.contains('Please sign in');
});

it('should login', () => {
    Cypress.on('uncaught:exception', (err, runnable) => {
        // TODO: Only disable this for headless Cypress runs,
        // since push notifications error out in headless mode
        return false;
    });
    // Enter login info
    cy.get('[name="email"]').type(Cypress.env('UPDATER_USERNAME'));
    cy.get('[name="password"]').type(Cypress.env('UPDATER_PASSWORD'));
    // Click submit
    cy.get('.uds-button').click();
    // Wait for a request to finish instead of an arbitrary length of time
    cy.wait('@events');
    // User greeting page has loaded
    cy.contains('Welcome, SDET!');
});