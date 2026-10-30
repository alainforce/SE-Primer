describe('Onboarding personalization', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/v1beta/models/*:generateContent*', { fixture: 'tutor_responses.json' }).as('gemini');
    cy.visit('/');
  });

  it('shows role-specific technical terms', () => {
    cy.completeOnboarding('beginner', 'devops', 'uptime');
    cy.get('[data-testid="scene-narrative"]').should('contain.text', 'Kubernetes').and('contain.text', 'canary');
    cy.visit('/');
    cy.completeOnboarding('beginner', 'backend', 'uptime');
    cy.get('[data-testid="scene-narrative"]').should('contain.text', 'HikariPool').and('contain.text', 'migration');
    cy.visit('/');
    cy.completeOnboarding('beginner', 'frontend', 'uptime');
    cy.get('[data-testid="scene-narrative"]').should('contain.text', 'gateway timeout').and('contain.text', 'retry');
  });

  it('changes wording for each goal and keeps start disabled until complete', () => {
    let uptimeNarrative = '';
    let complianceNarrative = '';
    cy.get('[data-testid="onboarding-start"]').should('be.disabled');
    cy.get('[data-testid="onboarding-level-beginner"]').click();
    cy.get('[data-testid="onboarding-start"]').should('be.disabled');
    cy.get('[data-testid="onboarding-role-backend"]').click();
    cy.get('[data-testid="onboarding-start"]').should('be.disabled');
    cy.get('[data-testid="onboarding-goal-uptime"]').click();
    cy.get('[data-testid="onboarding-start"]').should('not.be.disabled');
    cy.get('[data-testid="onboarding-start"]').click();
    cy.get('[data-testid="scene-narrative"]').invoke('text').then((text) => { uptimeNarrative = text; });

    cy.visit('/');
    cy.completeOnboarding('beginner', 'backend', 'compliance');
    cy.get('[data-testid="scene-narrative"]').invoke('text').then((text) => { complianceNarrative = text; });
    cy.visit('/');
    cy.completeOnboarding('beginner', 'backend', 'learning');
    cy.get('[data-testid="scene-narrative"]').invoke('text').then((learning) => {
      expect(uptimeNarrative).not.to.equal(learning);
      expect(complianceNarrative).not.to.equal(learning);
    });
  });
});
