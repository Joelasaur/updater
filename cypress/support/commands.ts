import * as faker from 'faker';
import { credentials } from './credentials';
/**
 * Helper function that gets tomorrow's date
 * @returns a date string in the format YYYY-MM-DD
 */
function getMoveDate(tMinusMoveDate: number): string {
    const today = new Date();
    // Robust way to utilize the Date library for tomorrow's date
    // TODO: Apparently there's an entirely new page load for dates
    // Github issue here https://github.com/Joelasaur/updater/issues/6
    const tomorrow = new Date(today.setDate(today.getDate() + tMinusMoveDate)).toISOString().split('T')[0];
    return tomorrow;
}
// TODO: Set access_token via API instead of UI login
Cypress.Commands.add('login', (creds: credentials): void => {
    Cypress.log({
        name: 'login'
    });
    // Seems to be an important request for loading the logged in page,
    // so we will intercept and wait for it
    cy.intercept('POST', 'https://logx.optimizely.com/v1/events').as('events');
    cy.visit('/n/quick-setup');
    Cypress.on('uncaught:exception', (err, runnable) => {
        // TODO: Only disable this for headless Cypress runs,
        // since push notifications error out in headless mode
        return false;
    });
    // Enter login info
    cy.get('[name="email"]').type(creds.username);
    cy.get('[name="password"]').type(creds.password);
    // Click submit
    cy.get('[type="submit"]').click();
    // Wait for a request to finish instead of an arbitrary length of time
    cy.wait('@events');
});

Cypress.Commands.add('logout', (): void => {
    Cypress.log({
        name: 'logout'
    });
    cy.get('[name="hamburger-menu"]').click();
    cy.contains('Sign out').click();
    cy.url().should('include', '/n/quick-setup');
});

// TODO: Normally this is better done through an API instead of UI 
/**
 * Creates a random user and returns the new credentials
 * @param tMinusMoveDate number of days into the future from today's date that the user would like to move
 * @returns Username, Password 
 */
Cypress.Commands.add('createUser', (tMinusMoveDate: number): Cypress.Chainable<credentials> => {
    Cypress.log({
        name: 'createUser'
    });

    cy.visit('/n/invite');
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const phoneNumber = faker.phone.phoneNumber();
    const moveDate = getMoveDate(tMinusMoveDate);
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
    cy.get('[name="address1"]').eq(1).type('3156 Cobblestone Rdg');
    cy.get('[name="city"]').eq(1).type('Tecumseh');
    cy.get('[name="state"]').eq(1).select('MI');
    cy.get('[name="zip"]').eq(1).type('49286');
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

    // TODO: The firstName doesn't consistently appear upon login, even with a long timeout
    // so we will wait on something more consistent
    // See github issue: https://github.com/Joelasaur/updater/issues/4
    // cy.contains('Welcome, ' + firstName, { timeout: 30000 });
    cy.contains('Set up Internet/TV', { timeout: 30000 });

    // Return credentials if additional logins are required in the test
    return cy.wrap({ username: email, password, firstName });
});
