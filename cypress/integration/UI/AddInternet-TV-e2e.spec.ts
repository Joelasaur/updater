/// <reference path="../../support/commands.d.ts" />
import "cypress-localstorage-commands";

describe('Add New Internet/TV Service - e2e', () => {
    before('Create user and save LocalStorage', () => {
        // We are testing basic user flow without time critical path
        cy.createUser(2);
        cy.saveLocalStorage();
    });
  
    beforeEach('Restore LocalStorage', () => {
        cy.restoreLocalStorage();
        // Setup graphql API route test
        // https://docs.cypress.io/api/commands/intercept#Aliasing-individual-GraphQL-requests
        cy.intercept('POST', Cypress.env('GRAPHQL_ENDPOINT'), (req) => {
            const { body } = req;
            if (body.hasOwnProperty('query') && body.query.includes('availableOffers')) {
                req.alias = 'gqlOffers';
            }
        });
    });

    context('Full user flow', () => {
        it('should add Internet service without TV', () => {
            cy.visit('n/quick-setup/tvi/landing');

            // New service
            cy.contains('New service').click();
    
            // Internet for 3-4 people
            cy.contains('3-4 people').click();
            cy.url().should('include', '/tvi/internet-usage');
            cy.contains('Select all that apply.');
            cy.contains('Email and browsing the web').click();
            cy.contains('Streaming movies and shows').click();

            cy.contains('Next')
                .should('be.enabled')
                .click();

            // With no tv
            cy.get('[for=not_needed]').click();
            cy.url().should('include', 'phone-needs');

            // With no phone plan
            cy.get('[for=not_needed]').click();
            // graphql API test
            // TODO: Find out why this API request is taking almost a minute to complete. Perhaps a bug? 
            // See https://github.com/Joelasaur/updater/issues/8
            cy.wait('@gqlOffers', { timeout: 60000 }).then((interception) => {
                // Doesn't work with Updater address
                // See https://github.com/Joelasaur/updater/issues/7
                const firstOffer = interception.response.body.data.availableOffers.offers[0]

                // TODO: Given more time, we should validate the entire offer JSON schema instead of a few values. 
                // See https://www.cypress.io/blog/2018/07/10/json-schemas-are-your-true-testing-friend/ 
                // Also these hard coded data are subject to flake, might be a better idea 
                // to move data validation somewhere else and stub this to test just the JSON schema structure
                expect(firstOffer, 'first offer').to.not.be.empty;
                expect(firstOffer.code, 'offer code').to.eq('9777104669');
                expect(firstOffer.pricing.price, 'price').to.eq(180);
            });
            cy.url().should('include', 'browse-offers');


    
            // Select offer
            // TODO: stub the API response and manipulate filters
            cy.get('.uds-button', { timeout: 10000 }).eq(0).click();
            cy.url().should('include', 'schedule-installation');
            cy.contains('Good choice! One last step.');
        });
    });
});
