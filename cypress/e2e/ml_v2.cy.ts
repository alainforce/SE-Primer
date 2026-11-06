type TestWindow = Window & { __SE_TEST_MODEL_OVERRIDE__?: { probability: number; threshold?: number } };

describe('v2 model and collection safeguards', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/v1beta/models/*:generateContent*', { fixture: 'tutor_responses.json' });
  });

  it('keeps natural behavior in collect mode', () => {
    cy.visit('/?collect=1');
    cy.get('[data-testid="collect-start-notice"]').should('be.visible');
    cy.completeOnboarding('experienced', 'backend', 'uptime');
    cy.get('[data-testid="choice-A"]').click();
    cy.get('[data-testid="continue-button"]').click();
    cy.get('[data-testid="timer"]').should('be.visible');
    cy.get('[data-testid="hint-panel"]').should('not.exist');
  });

  it('supports explicit test-only above and below threshold overrides', () => {
    cy.visit('/', { onBeforeLoad: win => {
      (win as TestWindow).__SE_TEST_MODEL_OVERRIDE__ = { probability: 0.9, threshold: 0.5 };
    }});
    cy.completeOnboarding('experienced', 'backend', 'uptime');
    cy.get('[data-testid="choice-A"]').click();
    cy.get('[data-testid="continue-button"]').click();
    cy.get('[data-testid="hint-panel"]').should('be.visible');
    cy.get('[data-testid="timer"]').should('not.exist');

    cy.visit('/', { onBeforeLoad: win => {
      (win as TestWindow).__SE_TEST_MODEL_OVERRIDE__ = { probability: 0.1, threshold: 0.5 };
    }});
    cy.completeOnboarding('experienced', 'backend', 'uptime');
    cy.get('[data-testid="choice-A"]').click();
    cy.get('[data-testid="continue-button"]').click();
    cy.get('[data-testid="timer"]').should('be.visible');
    cy.get('[data-testid="hint-panel"]').should('not.exist');
  });

  it('falls back to the standard timer when the model cannot load', () => {
    cy.intercept('GET', '**/model/model.onnx', { forceNetworkError: true });
    cy.visit('/');
    cy.completeOnboarding('experienced', 'backend', 'uptime');
    cy.get('[data-testid="choice-A"]').click();
    cy.get('[data-testid="continue-button"]').click();
    cy.get('[data-testid="timer"]').should('be.visible');
    cy.get('[data-testid="hint-panel"]').should('not.exist');
  });

  it('matches the DEV Python oracle through the parity page', () => {
    const parityFile = Cypress.env('PARITY_FILE') || 'tests/parite.dev.json';
    cy.readFile(parityFile).then((references: Array<{ input: Record<string, number>; p_riskli: number }>) => {
      references.forEach(reference => {
        cy.visit('/#/parite');
        Object.entries(reference.input).forEach(([key, value]) => {
          cy.get(`[data-cy="input-${key}"]`).click().type(`{selectall}${String(value)}`);
        });
        cy.get('[data-cy="run"]').click();
        cy.get('[data-cy="p"]', { timeout: 30000 }).should('not.have.text', '—').invoke('text').then(value => {
          expect(Math.abs(Number(value) - reference.p_riskli)).to.be.lessThan(1e-4);
        });
      });
    });
  });
});
