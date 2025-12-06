describe('template spec', () => {
  it('passes', () => {
    cy.visit('https://example.cypress.io')
  })
});

it('loginDirect', function() {
  cy.visit('http://localhost:3000/login')
  cy.get('#root [name="email"]').click();
  cy.get('#root [name="email"]').type('samit@gmail.com');
  cy.get('#root [name="password"]').type('sam123');
  cy.get('#root button').click();
  cy.url().should('eq', 'http://localhost:3000/');
});

it('logout User', function() {
    cy.visit('http://localhost:3000/login')
    cy.get('#root [name="email"]').click();
    cy.get('#root [name="email"]').type('samit@gmail.com');
    cy.get('#root [name="password"]').type('sam123');
    cy.get('#root button').click();
    cy.url().should('eq', 'http://localhost:3000/');
    cy.get('#root button.btn').click();
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null;
      expect(win.localStorage.getItem('user')).to.be.null;
    })
});



