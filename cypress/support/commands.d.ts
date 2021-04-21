// load type definitions that come with Cypress module
/// <reference types="cypress" />
import { credentials } from './credentials';
export {};


declare global {
namespace Cypress {
    interface Chainable<Subject = any> {
      /**
       * Custom command to login
       */
      login(creds: credentials): void
      /**
       * Creates a random user and returns the new credentials
       * @returns Username, Password 
       */
      createUser(): Cypress.Chainable<credentials> 
      logout(): void
    }
  }
}