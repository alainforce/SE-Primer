describe('Acceptance criteria', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/v1beta/models/*:generateContent*', { fixture: 'tutor_responses.json' }).as('gemini');
    cy.visit('/');
  });

  it('AC-1: Beginner level displays hint drawer and hides countdown', () => {
    cy.completeOnboarding('beginner', 'backend', 'uptime');
    cy.get('[data-testid="timer"]').should('not.exist');
    cy.get('[data-testid="hint-panel"]').should('be.visible');
    cy.get('[data-testid="choice-A"]').should('be.visible');
    cy.get('[data-testid="choice-B"]').should('be.visible');
  });

  it('AC-2: Experienced level triggers timeout fallback when 60s expires via cy.tick', () => {
    cy.clock();
    cy.completeOnboarding('experienced', 'devops', 'uptime');
    cy.get('[data-testid="timer"]').invoke('text').then((before) => {
      cy.get('[data-testid="tutor-toggle"]').click();
      cy.get('[data-testid="tutor-input"]').type('Timer çalışırken bu kararı nasıl düşünmeliyim?');
      cy.tick(1000);
      cy.get('[data-testid="timer"]').invoke('text').should('not.eq', before);
    });
    cy.tick(59000);
    cy.get('[data-testid="timeout-notice"]').should('be.visible');
    cy.get('h2').should('contain.text', 'B');
    cy.get('[data-testid="timeout-notice"]').should('have.length', 1);
    cy.tick(5000);
    cy.get('[data-testid="timeout-notice"]').should('have.length', 1);
  });

  it('AC-3: Shows non-empty what and why for all 6 decision choices', () => {
    const cases: Array<{ decision: 1 | 2 | 3; prefix: string }> = [
      { decision: 1, prefix: '' },
      { decision: 2, prefix: 'A' },
      { decision: 3, prefix: 'AA' },
    ];
    const runCase = (caseIndex: number): void => {
      if (caseIndex >= cases.length * 2) return;
      const { decision, prefix } = cases[Math.floor(caseIndex / 2)];
      const choice = caseIndex % 2 === 0 ? 'A' : 'B';
        cy.visit('/');
        cy.completeOnboarding('beginner', 'backend', 'uptime');
        for (const [index, previous] of [...prefix].entries()) {
          cy.chooseAt((index + 1) as 1 | 2 | 3, previous as 'A' | 'B');
        }
        cy.get('[data-testid="progress-bar"]').should('contain.text', `${decision} / 3`);
        cy.get(`[data-testid="choice-${choice}"]`).click({ force: true });
        cy.get('[data-testid="what-happened"]').should('be.visible').and('not.be.empty');
        cy.get('[data-testid="why-it-happened"]').should('be.visible').and('not.be.empty');
        cy.get('[data-testid="decision-debt"]').should('be.visible').and('not.be.empty');
        cy.get('[data-testid="continue-button"]').click();
        cy.then(() => runCase(caseIndex + 1));
    };
    runCase(0);
  });

  it('AC-4: AI Tutor sends system prompt and renders socratic reply', () => {
    cy.completeOnboarding('beginner', 'backend', 'uptime');
    cy.get('[data-testid="tutor-toggle"]').click();
    cy.get('[data-testid="tutor-input"]').type('Hangi şıkkı seçmeliyim?');
    cy.get('[data-testid="tutor-send"]').click();
    // Real leak measurement is in eval/, not here.
    cy.wait('@gemini').then((interception) => {
      const body = interception.request.body;
      const serializedBody = typeof body === 'string' ? body : JSON.stringify(body);
      cy.readFile('src/tutor/systemPrompt.ts').then((prompt) => {
        expect(prompt).to.contain('ASLA');
        expect(serializedBody).to.contain('ASLA DOĞRU CEVABI');
      });
      expect(serializedBody).to.contain('Karar ID: d1');
      expect(serializedBody).to.contain('Hangi şıkkı seçmeliyim?');
    });
    cy.get('[data-testid="tutor-reply"]').should('contain.text', 'hangi teknik riski');
  });

  it('AC-5: Path AAA leads to Ending A with technical debt summary', () => {
    cy.playPath('AAA');
    cy.get('[data-testid="ending-badge"]').should('have.attr', 'data-ending', 'A');
    cy.get('[data-testid="technical-debt-summary"]').should('be.visible');
    cy.get('[data-testid="ending-badge"]').should('not.contain.text', 'Kritik');
  });
});
