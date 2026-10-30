import { PATH_OUTCOMES } from '../../src/data/storyData';

describe('All story paths', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/v1beta/models/*:generateContent*', { fixture: 'tutor_responses.json' }).as('gemini');
    cy.visit('/');
  });

  for (const path of ['AAA', 'AAB', 'ABA', 'ABB', 'BAA', 'BAB', 'BBA', 'BBB']) {
    it(`path ${path} reaches the storyData ending and metrics`, () => {
      cy.playPath(path);
      const outcome = PATH_OUTCOMES[path];
      cy.get('[data-testid="ending-badge"]').should('have.attr', 'data-ending', path[2] === 'A' ? 'A' : 'B');
      cy.get('[data-testid="technical-debt-summary"]').should('contain.text', outcome.technicalDebtSummary[0]);
      cy.get('[data-testid="technical-debt-summary"]').should('contain.text', outcome.technicalDebtSummary[1]);
      cy.contains(outcome.resolutionTime).should('be.visible');
      cy.contains(`${outcome.leakedRecords} Hasta`).should('be.visible');
    });
  }
});
