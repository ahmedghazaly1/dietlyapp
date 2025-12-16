# Test Traceability (User Stories → Test Cases)

> Note: Login is a prerequisite step for accessing the system. It is not listed as a separate user story in Milestone 1, so it is treated as a precondition in E2E testing.

| User Story (Milestone 1) | E2E Flow Tested | Cypress Spec / Test |
|---|---|---|
| US-01: As a user, I want to input my health goals and dietary preferences so I can receive personalized meal plans. | Login → Browse Meals → Open Meal Details → Generate/View Meal Plan | client/cypress/e2e/mealplan_flow.cy.js — `E2E: Login → Browse Meals → Meal Details → Generate/View Meal Plan` / `runs the full happy-path flow` |
| US-02: As a user, I want to view nutrition information for each meal so I can understand my nutrient intake. | Login → Browse Meals → Open Meal Details (verify nutrition info is shown) → Generate/View Meal Plan | client/cypress/e2e/mealplan_flow.cy.js — `E2E: Login → Browse Meals → Meal Details → Generate/View Meal Plan` / `runs the full happy-path flow` |
