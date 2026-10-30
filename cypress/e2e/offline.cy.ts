describe('Offline tutor behavior', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('shows the static hint and does not crash when tutor networking fails', () => {
    cy.intercept('POST', '**/v1beta/models/*:generateContent*', { forceNetworkError: true }).as('geminiOffline');
    cy.completeOnboarding('beginner', 'backend', 'uptime');
    cy.get('[data-testid="hint-panel"]').should('be.visible');
    cy.get('[data-testid="tutor-toggle"]').click();
    cy.get('[data-testid="tutor-input"]').type('Ağ yokken neyi kontrol etmeliyim?');
    cy.get('[data-testid="tutor-send"]').click();
    cy.wait('@geminiOffline');
    cy.get('[data-testid="hint-panel"]').should('be.visible');
    cy.get('[data-testid="scene-title"]').should('be.visible');
    cy.get('body').should('not.contain.text', 'Something went wrong');
  });
});
