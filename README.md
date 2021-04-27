# updater
Demo of basic log in and other feature testing using [Cypress](https://docs.cypress.io/guides/overview/why-cypress).

# How to Run Tests

In the project root directory, run `npx cypress open` which will open the Cypress Test Runner. Click on the test spec you'd like to run and it'll open the browser and start the test.

# Framework
For this mostly UI-focused test, I chose Cypress with tests written in Typescript. CI/CD is handled by [Github Actions](https://github.com/Joelasaur/updater/actions/workflows/cypress-github-actions.yml), and test results are hooked up to [Cypress Dashboard](https://dashboard.cypress.io/organizations/6ba0b3c0-6cc2-4694-af9e-4fb4eb19385b/projects). 

This testing stack has particular benefits and drawbacks, and is not applicable to every use case:
## Pros

- Typescript makes test writing and maintenance easier across the board due to type safety
- Cypress Dashboard parallelization is fairly straightforward to setup and drastically reduces test execution time
- Since it's in-browser, Cypress is developer friendly in terms of speed and ease of use, and developer-written tests are typically superior quality
- Cypress integrates with Pact to make fixture maintenance hassle-free 
- Cypress Dashboard has screenshots and video recordings which can be nicer to diagnose test failures than reading CI/CD logs
## Cons

- Typescript adds some overhead with setting it up in your project
- Contract testing requires heavy development investment to work, so Cypress may not be able to take advantage of it
- Cypress cannot test Safari, which can be an important business requirement
- The release schedule of Cypress can be hard to keep up with, especially when there are breaking changes
# Test Strategy

I have divided the front end testing strategy into three distinct parts: Full e2e workflow UI test, detailed UI integration test, and an API integration test. This strategy follows the [test pyramid](https://martinfowler.com/articles/practical-test-pyramid.html) concept of grouping our tests in buckets of differing granularity. Our full e2e workflow is the slowest, most "expensive" test (in terms of both maintenance time/money and execution time/money), followed by detailed UI tests and API integration tests. 

In addition to the pyramid strategy, these tests do their best to conform to [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices), such as using good selectors when they're available, configuring a `baseUrl`, not relying on previous test results to conduct future tests, and using `before` hooks instead of `after`. Some of these best practices were not possible due to application and time restrictions, like `data-cy` selectors (don't have access to the underlying application to add selectors), programmatically logging in with the API (could not get the required access-token, I would ask a developer to help me find this), and unecessary waiting (some `cy.wait` calls were left in due to not finding the appropriate API call to wait for). 

## Full e2e workflow UI test

If you want to test an entire business use-case at once, this is the strategy that does it best. Start from the top, and complete the entire workflow until the end, making some checks along the way on each page. We register, log in, select our Internet/TV service, perform all the steps to reach the end page with offers, and reach the end state of this business flow with selecting an offer. 

### Pros

- Full confidence to release code related to the tested business flow, because it's a "complete" integration test
- Fairly easy to organize and write, due to the straight-forward concept of "just keep clicking until you reach the end"

### Cons

- Takes longer to reach any individual step in the workflow
- Test failures are harder to troubleshoot because they aren't isolated
- Does not scale with permutations in the business flow, because starting over from the top for every logic branch is too costly

## Detailed UI integration test

While closely related to the Full e2e workflow UI test (it even reuses a small amount of code), these tests are isolated to indidual pages/urls and testing them in full. These check every possible logic branch available on the page, and that the buttons function as expected in terms of visibility, availability, and navigation.

### Pros

- More feature-complete than e2e or API tests
- Faster than full flow e2e tests
- Easier to troubleshoot failures due to tests being more isolated
- Scales decently well when adding more tests

### Cons

- Does not test the end state of the offers list for each business permutation (e.g phone vs no phone, tv vs no tv)
- Requires more `cy.visit` calls which are more resource intensive than other commands

## API integration test

Much more granular than any UI test, this could be considered the "unit test" of this strategy. In reality it's testing the integration of the graphql API with the updater UI, but is still the fastest and cheapest kind of test.

### Pros

- Cheap and fast
- Scales very well in terms of execution time
- More detailed test feedback on failures (we know it's an issue with graphql vs the UI)

### Cons

- Mostly ignorant of the UI integration; only cares that a response from graphql comes back
- Maintaining JSON fixtures can become costly if not handled by automated contract tests

# CICD Integration

I was able to add Github Actions for running Cypress with pretty minimal setup, I think I spent just under an hour setting it up, including troubleshooting. Since I configured it to run on every push to the repository early on, I was able to get fast feedback during the development process simply by pushing to my remote branch. Github Actions also made it easy to manage secrets for application authentication and Cypress Dashboard integration, which can be found [here](https://dashboard.cypress.io/organizations/6ba0b3c0-6cc2-4694-af9e-4fb4eb19385b/projects).

# What would I do with more time and resources?

Quite a lot, actually. This was a fun exercise, but it lacks quality that I would've liked to add with more time. In no particular order, I would: 

- utilize API's to setup tests faster, especially with registration and log in
- move login and register commands into their own individual UI tests, replace with headless register/login commands
- beef up the github actions runner to acommodate e2e browser tests better
- implement parallelization through Cypress Dashboard
- create a subset of tests that stub graphql API responses so we could consistently look at pages like available offers outside of the full e2e workflow
- gain access to the updater application to make it more test-friendly by adding data-cy selectors to elements under test
- learn the full API's being used and make more complete tests with them outside of the full e2e workflow tests using cy.intercept
- do full JSON schema validation of API responses instead of individual data points
- add more tests for things like filters and other workflows not covered by the existing e2e full workflow
- find a way to either manage addresses for the Transfer Service workflow or stub responses to force it to work
- implement contract tests with Pact that could be used to generate and maintain fixtures for API stubbing ([example](https://pactflow.io/blog/cypress-pact-front-end-testing-with-confidence/))
- investigate and fix various issues logged under this repository's github issues tab
- add cross browser runs to Github Actions
- add better npm scripts to aid users in different configurations and environments
- containerize cypress and the updater application with docker-compose for hermetic test environment
