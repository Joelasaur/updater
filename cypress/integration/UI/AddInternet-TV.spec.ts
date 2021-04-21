/// <reference path="../../support/commands.d.ts" />
import "cypress-localstorage-commands";

describe('Add New Internet/TV Service', () => {
    before('Create user and save LocalStorage', () => {
        cy.createUser();
        cy.saveLocalStorage();
    });
  
    beforeEach('Restore LocalStorage', () => {
        cy.restoreLocalStorage();
    });

    it('should navigate to Connect Internet/TV page', () => {
        cy.get('[name="tv_internet"]').click();
        cy.url().should('include', '/tvi/landing');
    });
    describe('Service Method Setup', () => {
        it('should offer New service and Transfer service pages', () => {
            cy.visit('n/quick-setup/tvi/landing');
            cy.contains('How do you want to set up service?');
            // TODO: fix this selector in the updater application code
            // cy.get('.CircularProgress_progress__3B1-O > svg').contains('1');

            // New service
            cy.contains('New service').click();
            cy.url().should('include', '/tvi/internet-users');
            cy.go('back');

            // TODO: Doesn't work with the test address
            // Transfer service
            // cy.contains('Transfer service').click();
            // cy.contains('Who is your current service provider?');
            // cy.url().should('include', '/tvi/choose-provider');
        });
    });

    describe('Number of internet users', () => {
        it ('should have multiple options that navigate to different pages', () => {
            // Technically, the previous test already ended on this page, but we want to
            // isolate each page's functionality in case of individual failures.
            cy.visit('/n/quick-setup/tvi/internet-users');
            // We *could* click on each one of these individually and check the url's too,
            // but all 3 have the same function so we will stick with 3-4 people as the happy path.
            // It would be handy if we could check their href properties, but that isn't how these buttons work.
            // We could check if their class is correct? Might be overkill.
            cy.contains('Just me');
            cy.contains('2 people');
            cy.contains('5 or more people');

            // Internet for 3-4 people
            cy.contains('3-4 people').click();
            cy.url().should('include', '/tvi/internet-usage');

            // Skip straight to tv plans
            cy.go('back');
            cy.contains('I don\'t need internet').click();
            cy.url().should('include', '/tvi/tv-type');
            cy.contains('Are you interested in TV plans?');
        });
    });
});
