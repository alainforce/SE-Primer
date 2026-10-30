describe('Demo walkthrough', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/v1beta/models/*:generateContent*', { fixture: 'tutor_responses.json' }).as('gemini');
  });

  it('walks a beginner AAA run and an experienced BBB run in real time', () => {
    cy.visit('/');
    cy.wait(4000);
    cy.playPath('AAA');
    cy.wait(5000);
    cy.get('[data-testid="ending-badge"]').should('have.attr', 'data-ending', 'A');
    cy.wait(4000);
    cy.get('[data-testid="restart-button"]').click();
    cy.wait(4000);

    cy.completeOnboarding('experienced', 'devops', 'uptime');
    cy.wait(5000);
    cy.chooseAt(1, 'B');
    cy.wait(3000);
    cy.chooseAt(2, 'B');
    cy.wait(3000);
    cy.chooseAt(3, 'B');
    cy.wait(5000);
    cy.get('[data-testid="ending-badge"]').should('have.attr', 'data-ending', 'B');
    cy.wait(5000);
  });
});
