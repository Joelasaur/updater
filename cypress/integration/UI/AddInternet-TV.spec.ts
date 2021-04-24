/// <reference path="../../support/commands.d.ts" />
import "cypress-localstorage-commands";

describe('Add New Internet/TV Service - Detailed', () => {
    before('Create user and save LocalStorage', () => {
        // We are testing basic user flow without time critical path
        cy.createUser(2);
        cy.saveLocalStorage();
    });
  
    beforeEach('Restore LocalStorage', () => {
        cy.restoreLocalStorage();
    });

    it('should navigate to Connect Internet/TV page', () => {
        cy.get('[name="tv_internet"]').click();
        cy.url().should('include', '/tvi/landing');
    });
    context('Service Method Setup', () => {
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

    context('Number of internet users', () => {
        it ('should ask how much internet usage is required', () => {
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
            cy.contains('What do you use the internet for?');

            // Skip straight to tv plans
            cy.go('back');
            cy.contains('I don\'t need internet').click();
            cy.url().should('include', '/tvi/tv-type');
            cy.contains('Are you interested in TV plans?');
        });

        it('should have multiple internet use cases', () => {
            cy.visit('/n/quick-setup/tvi/internet-usage');
            cy.contains('Select all that apply.');

            // Next button should be disabled until the user selects at least 1 option
            cy.contains('Next').should('be.disabled');
            // TODO: More permutations of options could be selected here
            // TODO: these should be in-line data-cy selectors
            cy.contains('Email and browsing the web').click();
            cy.contains('Streaming movies and shows').click();
            cy.contains('Gaming').click();
            cy.contains('Sharing large files').click();
            cy.contains('Connecting smart devices').click();

            cy.contains('Next')
                .should('not.be.disabled')
                .click();
        });
    });

    context('TV Plans', () => {
        it('should have 2 options that navigate to phone or tv plans', () => {
            cy.visit('/n/quick-setup/tvi/tv-type');

            // With no tv
            cy.get('[for=not_needed]').click();
            cy.url().should('include', 'phone-needs');
            cy.contains('Do you need a landline?');

            // With tv
            cy.go('back');
            cy.get('[for="yes"]').click();
            cy.url().should('include', 'tv-channels');
            cy.contains('What do you usually watch on TV?');
        });

        // TODO: Skipping for now due to extra "time sensitive" page
        // need to unskip and test later
        it.skip('should have tv channel options', () => {
            // TODO: we could optionally add more permutations of selecting options here,
            // but that seems more appropriate for a unit test
            cy.visit('/n/quick/setup/tvi/tv-channels');
            cy.get('[for="local"]').click();
            cy.get('[for="news"]').click();
            cy.get('[for="sports"]').click();
            cy.get('[for="movies"]').click();
            cy.get('[for="music"]').click();
            cy.get('[for="kids"]').click();
            // TODO: add a real selector here
            cy.contains('Spanish').click();

            // Navigation
            cy.contains('Next').click();
            cy.url().should('include', 'phone-needs');
            cy.contains('Do you need a landline?');
        });
    });

    context('Phone Plans', () => {
        it('should ask if you need a landline', () => {
            cy.visit('/n/quick-setup/tvi/phone-needs');
            cy.contains('You may still see bundles if they save you money');

            // With no phone plan
            cy.get('[for=not_needed]').click();
            cy.url().should('include', 'browse-offers');
            cy.contains('Your best options');

            // With phone plan
            cy.go('back');
            cy.get('[for=yes]').click();
            cy.url().should('include', 'browse-offers');
            cy.contains('Your best options');
        });
    });
});
