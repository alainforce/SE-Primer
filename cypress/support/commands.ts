declare global {
  namespace Cypress {
    interface Chainable {
      completeOnboarding(level: 'beginner' | 'experienced', role: 'backend' | 'devops' | 'frontend', goal: 'uptime' | 'compliance' | 'learning'): Chainable<void>;
      chooseAt(decision: 1 | 2 | 3, choice: 'A' | 'B'): Chainable<void>;
      playPath(path: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('completeOnboarding', (level, role, goal) => {
  cy.get(`[data-testid="onboarding-level-${level}"]`).click();
  cy.get(`[data-testid="onboarding-role-${role}"]`).click();
  cy.get(`[data-testid="onboarding-goal-${goal}"]`).click();
  cy.get('[data-testid="onboarding-start"]').should('not.be.disabled').click();
  cy.get('[data-testid="scene-title"]').should('be.visible');
});

Cypress.Commands.add('chooseAt', (decision, choice) => {
  cy.get('[data-testid="progress-bar"]').should('contain.text', `${decision} / 3`);
  cy.get(`[data-testid="choice-${choice}"]`).click();
  cy.get('[data-testid="continue-button"]').should('be.visible').click();
});

Cypress.Commands.add('playPath', (path) => {
  if (!/^[AB]{3}$/.test(path)) throw new Error(`Invalid path: ${path}`);
  cy.completeOnboarding('beginner', 'backend', 'uptime');
  [...path].forEach((choice, index) => cy.chooseAt((index + 1) as 1 | 2 | 3, choice as 'A' | 'B'));
});

export {};
