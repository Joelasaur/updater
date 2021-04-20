import * as faker from 'faker';

/**
 * Helper function that gets tomorrow's date
 * @returns a date string in the format YYYY-MM-DD
 */
function getMoveDate(): string {
    const today = new Date();
    // Robust way to utilize the Date library for tomorrow's date
    return new Date(today.setDate(today.getDate() + 1)).toISOString().split('T')[0];

}
// TODO: Set access_token via API instead of UI login
Cypress.Commands.add('login', {
    prevSubject: true
}, (credentials: Cypress.Chainable<[string, string]>): void => {
    // Seems to be an important request for loading the logged in page,
    // so we will intercept and wait for it
    cy.intercept('POST', 'https://logx.optimizely.com/v1/events').as('events');
    cy.visit('/n/quick-setup');
    Cypress.on('uncaught:exception', (err, runnable) => {
        // TODO: Only disable this for headless Cypress runs,
        // since push notifications error out in headless mode
        return false;
    });
    cy.wrap(credentials).then((creds) => {
        // Enter login info
        cy.get('[name="email"]').type(creds[0]);
        cy.get('[name="password"]').type(creds[1]);
        // Click submit
        cy.get('[type="submit"]').click();
        // Wait for a request to finish instead of an arbitrary length of time
        cy.wait('@events');
    });

});

// TODO: Normally this is better done through an API instead of UI 
/**
 * Creates a random user and returns the new credentials
 * @returns Username, Password 
 */
Cypress.Commands.add('createUser', (): Cypress.Chainable<[string, string]> => {
    cy.visit('/n/invite');
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const phoneNumber = faker.phone.phoneNumber();
    const moveDate = getMoveDate();
    const email = faker.internet.email();
    const password = faker.internet.password() + '1';

    // Name
    cy.get('[name="firstname"]').type(firstName);
    cy.get('[name="lastname"]').type(lastName)
    cy.get('[type="submit"]').click();

    // Number
    cy.get('[name="phone"]').type(phoneNumber);
    cy.get('[type="submit"]').click();

    // Move Date
    cy.get('[name="move-date"]').type(moveDate);
    cy.get('[type="submit"]').click();

    // From Address
    cy.get('[name="address1"]').type('909 Asbury Dr');
    cy.get('[name="city"]').type('Buffalo Grove');
    cy.get('[name="state"]').select('IL');
    cy.get('[name="zip"]').type('60089');
    cy.get('[type="submit"]').click();

    // TODO: Remove this wait timer after proper selectors are added to the "To Address" form
    cy.wait(1000);

    // To Address
    cy.get('[name="address1"]').eq(1).type('19 Union Sq W');
    cy.get('[name="apartment"]').eq(1).type('12');
    cy.get('[name="city"]').eq(1).type('New York');
    cy.get('[name="state"]').eq(1).select('NY');
    cy.get('[name="zip"]').eq(1).type('10003');
    cy.get('[type="submit"]').click();

    // Rent or own
    cy.get('#ownership_RENT').should('be.checked');
    cy.get('[type="submit"]').click();

    // Home Size
    cy.get('[name="from-home-size"]').select('3 or more bedrooms');
    cy.get('[name="to-home-size"]').select('3 or more bedrooms');
    cy.get('[type="submit"]').click();

    // Reason for moving
    cy.contains('Moving for work').click();
    cy.get('[type="submit"]').click();

    // Who's moving
    cy.contains('Baby').click();
    cy.contains('Partner/spouse').click();
    cy.get('[type="submit"]').click();

    // Password
    cy.get('[name="email"]').type(email);
    cy.get('[name="password"]').type(password);
    cy.get('[type="submit"]').click();

    cy.contains('Welcome, ' + firstName, { timeout: 10000 });

    // Return credentials if additional logins are required in the test
    return cy.wrap([email, password]);
});
