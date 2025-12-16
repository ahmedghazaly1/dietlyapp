describe("E2E: Login → Browse Meals → Meal Details → Generate/View Meal Plan", () => {
  it("runs the full happy-path flow", () => {
    // 1) Make UI consistent so menu buttons are visible (desktop layout)
    cy.viewport(1280, 720);

    // 2) Clean browser state (prevents old tokens from skipping login)
    cy.clearCookies();
    cy.clearLocalStorage();

    // 3) Intercepts (helps Cypress wait correctly)
    cy.intercept("POST", "**/meal-plans/generate").as("generatePlan");
    cy.intercept("GET", "**/meals*").as("getMeals");
    cy.intercept("GET", "**/meal-plans*").as("getMealPlans");
    cy.intercept("PUT", "**/meal-plans/*/stop").as("stopPlan");


    // =========================
    // Step A: Login
    // =========================
    cy.visit("/login");

    cy.get("#email").type("john@example.com");
    cy.get("#password").type("password123");

    // Use visible text (stable for users)
    cy.contains("button", "Sign In").click();

    // Confirm redirected to user dashboard
    cy.url().should("include", "/user-dashboard");

    // =========================
    // Step B: Browse meals
    // =========================
    cy.contains("button", "Browse Meals").click();

    cy.url().should("include", "/meals");

    // Wait for meals API to return so the grid is populated
    cy.wait("@getMeals");

    // Click the first meal card by clicking its title (h3) inside the meals grid
    cy.get('div[class*="xl:grid-cols-4"]')
      .find("h3")
      .first()
      .click();

    // =========================
    // Step C: Meal details
    // =========================
    cy.url().should("match", /\/meals\/[a-f0-9]{24}$/i);

    // Verify you’re on a meal details page (these headings exist in MealDetail)
    cy.contains("Ingredients").should("be.visible");
    cy.contains("Instructions").should("be.visible");
    cy.contains("Nutrition (per serving)").should("be.visible");
    cy.contains("Calories").should("be.visible");


    // =========================
    // Step D: Generate + view meal plan
    // =========================
    cy.contains("button", "My Plans").click();
    cy.url().should("include", "/meal-plans");

    // Wait meal plans list load
    cy.wait("@getMealPlans");

    // If there is an active plan, stop it first so "Generate Plan" is available
    // Ensure buttons are reachable
cy.scrollTo("top");

// Stop current plan if the button is visible
cy.get("body").then(($body) => {
  const stopBtn = $body
    .find('button:contains("Stop Current Plan")')
    .filter(":visible");

  if (stopBtn.length) {
    cy.wrap(stopBtn).scrollIntoView().click();
    cy.wait("@getMealPlans");
  }
});

// Now find a visible generate button (scrolling helps if it's lower)
cy.scrollTo("bottom");

cy.get("body").then(($body) => {
  const firstBtn = $body
    .find('button:contains("Generate Your First Meal Plan")')
    .filter(":visible");

  const genBtn = $body
    .find('button:contains("Generate Plan")')
    .filter(":visible");

  if (firstBtn.length) {
    cy.wrap(firstBtn).scrollIntoView().click();
  } else if (genBtn.length) {
    cy.wrap(genBtn).scrollIntoView().click();
  } else {
    throw new Error('No visible "Generate" button found on /meal-plans');
  }
});


    // Now you should be on generator screen
    cy.contains("Generate Meal Plan").should("be.visible");

    // Fill the generator form (IDs are stable)
    const today = new Date().toISOString().split("T")[0];
    cy.get("#startDate").clear().type(today);
    cy.get("#duration").select("3 days"); // keeps test fast

    cy.contains("button", "Generate Meal Plan").click();

    // Wait for backend generation call to finish
    cy.wait("@generatePlan");

    // Confirm it navigated to the view page
    cy.url().should("match", /\/meal-plans\/view\/[a-f0-9]{24}$/i);

    // Verify plan view content exists
    cy.contains("Breakfast").should("be.visible");
    cy.contains("Lunch").should("be.visible");
    cy.contains("Dinner").should("be.visible");
  });
});
