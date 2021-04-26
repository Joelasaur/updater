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
      createUser(tMinusMoveDate: number): Cypress.Chainable<credentials> 
      /**
       * Logs out via the UI 
       */
      logout(): void
    }
  }
}