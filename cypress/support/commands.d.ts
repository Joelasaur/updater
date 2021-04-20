// load type definitions that come with Cypress module
/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login with an access token
       */
       login(): void
       /**
       * Creates a random user and returns the new credentials
       * @returns Username, Password 
       */
       createUser(): Cypress.Chainable<[string, string]> 
    }
  }