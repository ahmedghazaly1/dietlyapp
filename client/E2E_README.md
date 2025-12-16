## How to Run E2E Tests

1) Start backend:
   cd server
   npm install
   npm run seed:users
   node src/scripts/seedMeals-manual.js
   npm run dev

2) Start frontend:
   cd client
   npm install
   npm start

3) Run Cypress:
   cd client
   npm i -D cypress
   npx cypress run --spec "cypress/e2e/mealplan_flow.cy.js"
