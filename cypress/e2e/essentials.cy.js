describe('template spec', () => {
  it('passes', () => {
    cy.visit('https://example.cypress.io')
  })
});

it('loginDirect', function() {
  cy.visit('http://localhost:3000/login')
  cy.get('#root [name="email"]').click();
  cy.get('#root [name="email"]').type('ssand139@my.centennialcollege.ca');
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

it('registerExistingEmail', function() {
  cy.visit('http://localhost:3000/register')
  cy.get('#root [name="firstName"]').click();
  cy.get('#root [name="firstName"]').type('Dave');
  cy.get('#root [name="lastName"]').type('Mustard');
  cy.get('#root [name="username"]').type('meg');
  cy.get('#root [name="email"]').type('samit@gmail.com');
  cy.get('#root [name="password"]').type('sam123');
  cy.get('#root button').click();
  //Expect alert and direct to login
  cy.on('window:alert', (str) => {
    expect(str).to.equal('Email already in use. Please use a different email.');
  });
  cy.url().should('eq', 'http://localhost:3000/login');
  
});




it('register', function() {
  const firstName = generateRandomString(5);
  const lastName = generateRandomString(5);
  const username = generateRandomString(8);
  const email = `${generateRandomString(5)}@gmail.com`;
  const password = 'test123';

  cy.visit('http://localhost:3000/register')
  cy.get('#root [name="firstName"]').click();
  cy.get('#root [name="firstName"]').type(firstName);
  cy.get('#root [name="lastName"]').type(lastName);
  cy.get('#root [name="username"]').type(username);
  cy.get('#root [name="email"]').type(email);
  cy.get('#root [name="password"]').type(password);
  cy.get('#root button').click();
  cy.url().should('eq', 'http://localhost:3000/login');
  cy.get('#root [name="email"]').click();
  cy.get('#root [name="email"]').type(email);
  cy.get('#root [name="password"]').type(password);
  cy.get('#root button').click();
  cy.url().should('eq', 'http://localhost:3000/');
});


//Generate Random String - unsecure just for testing
function generateRandomString(length) {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}