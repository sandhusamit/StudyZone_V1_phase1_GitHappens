
describe("StudyZone - Mixed Quiz Creation (UPDATED)", () => {
  let quizId = null;

  afterEach(() => {
    if (quizId) {
      cy.task("deleteQuiz", quizId);
      quizId = null;
    }
  });

  function login() {
    cy.visit("http://localhost:5173/login");

    cy.get('input[type="email"]').type(Cypress.env("email"));
    cy.get('input[type="password"]').type(Cypress.env("password"));

    cy.contains("button", /login/i).click();
  }

  function goToCreateQuiz() {
    cy.get('a[href="/quizlist"]').click();
    cy.get('button[title="Create a new quiz"]').click();
  }

  function createMCQQuestion() {
    cy.contains("button", "+ Add MCQ").click();

    cy.get(".cq-question-card").last().as("newQuestion");

    cy.get("@newQuestion").find('textarea[placeholder="Enter question text"]').type("What does quality mean for users?");

    cy.get("@newQuestion").find('textarea[title="Explain why its correct."]').type("For users vs for developers.");

    cy.get("@newQuestion").find('input[title="Option"]').eq(0).type("Measurable and testable");
    cy.get("@newQuestion").find('input[title="Option"]').eq(1).type("Increase profits, customer base, and retention");

    cy.get("@newQuestion").find('button[title="Add Choice"]').click();
    cy.get("@newQuestion").find('input[title="Option"]').eq(2).type("best practices and standards");

    // Mark "Increase profits, customer base, and retention" as correct answer


    cy.get("@newQuestion").find('input[title="IsCorrect"]').eq(1).check();

  }

  function createDDQQuestion() {
    cy.contains("button", "+ Add DDQ").click();

    cy.get(".cq-question-card").last().as("newQuestion");

    cy.get("@newQuestion").find('textarea[placeholder="Enter question text"]').type("Match the following:");

    // Add drag items

    cy.get("@newQuestion").find('input[title="Drag item text"]').eq(0).type("Fitness");
    cy.get("@newQuestion").find('button[title="Add Item"]').click();
    cy.get("@newQuestion").find('input[title="Drag item text"]').eq(1).type("Defects");
    cy.get("@newQuestion").find('button[title="Add Item"]').click();
    cy.get("@newQuestion").find('input[title="Drag item text"]').eq(2).type("Measurable Attributes");
    cy.get("@newQuestion").find('button[title="Add Item"]').click();
    cy.get("@newQuestion").find('input[title="Drag item text"]').eq(3).type("Transcendent Feelings");

    // Add dropboxes
    cy.get("@newQuestion").find('input[title="Dropbox title"]').eq(0).type("Objective of Testing");
    cy.get("@newQuestion").find('input[title="Dropbox title"]').eq(1).type("Quality for Users");

    // Set correct answers
    cy.get("@newQuestion").find('select[title="Dropbox it belongs to."]').eq(0).select("Objective of Testing");
    cy.get("@newQuestion").find('select[title="Dropbox it belongs to."]').eq(1).select("Objective of Testing");
    cy.get("@newQuestion").find('select[title="Dropbox it belongs to."]').eq(2).select("Quality for Users");
    cy.get("@newQuestion").find('select[title="Dropbox it belongs to."]').eq(3).select("Quality for Users");
  }

  function bulkImportMCQs() {
    cy.contains("button", "+ Bulk Import MCQs").click();

    cy.get("textarea[title='Paste formatted questions here...']").type(`
      1. What is HTML?
Type: mcq
A. HyperText Markup Language
B. HighText Markdown Language
C. Hyper Tool Markup Language
D. Home Tool Markup Language
Answer: A
Explanation: HTML is the standard markup language for creating web pages.
Subject: SWE

2. Match each language to its purpose.
Type: ddq
Dropbox: frontend | Frontend
Dropbox: backend | Backend

DragItem: html | HTML | frontend
DragItem: node | Node.js | backend

Explanation: HTML is used on the frontend, Node.js on the backend.
Subject: SWE`);

    cy.contains("button", "Parse Questions").click();
    cy.contains(/Parsed/i);
    cy.contains("button", "Import Into Quiz").click();
  }


  function playQuiz() {
    cy.url().should("include", "/play/");

    // For MCQ, select the correct answer
    cy.contains("What does quality mean for users?").parent().as("mcqQuestion");
    cy.get("@mcqQuestion").find('input[title="Choices"]').eq(1).check(); // wrong or right

    // For DDQ, drag and drop items to correct dropboxes
    cy.contains("Match the following:").parent().as("ddqQuestion");

    cy.contains("Match the following:").parent().as("ddqQuestion");

    // get draggable items
    cy.get("@ddqQuestion").find(".drag-item").as("items");

    // get drop zones
    cy.get("@ddqQuestion").find(".drop-box").as("boxes");



    const dataTransfer = new DataTransfer();

    // Fitness → Objective of Testing
    cy.get("@items").eq(0).trigger("dragstart", { dataTransfer });
    cy.get("@boxes").eq(0).trigger("drop", { dataTransfer });

    // Defects → Objective of Testing
    cy.get("@items").eq(0).trigger("dragstart", { dataTransfer });
    cy.get("@boxes").eq(0).trigger("drop", { dataTransfer });

    // Measurable Attributes → Quality for Users
    cy.get("@items").eq(0).trigger("dragstart", { dataTransfer });
    cy.get("@boxes").eq(1).trigger("drop", { dataTransfer });

    // Transcendent Feelings → Quality for Users
    cy.get("@items").eq(0).trigger("dragstart", { dataTransfer });
    cy.get("@boxes").eq(1).trigger("drop", { dataTransfer });

    

    // Submit quiz
    cy.contains("Submit Quiz").click();

    // Verify results
    cy.get(".quiz-score").should("contain", "Score: 2 / 5");
  }


  it("creates a full mixed quiz", () => {
    const quizTitle = `Mixed Quiz ${Date.now()}`;

    login();

    cy.url().should("eq", "http://localhost:5173/");
    cy.getCookie("token").should("exist");

    goToCreateQuiz();



    cy.url().should("include", "/create");

    // -------------------------
    // STEP 1 - QUIZ INFO
    // -------------------------
    cy.get('input[title="Title of quiz"]').first().type(quizTitle);
    cy.get("textarea").first().type("Cypress generated quiz");
    cy.get("select").select("public");


    cy.get('button[title="Next Step"]').should("not.be.disabled").click();
    // -------------------------
    // STEP 2 - BUILD QUESTIONS
    // -------------------------

    createMCQQuestion();
    createDDQQuestion();
    bulkImportMCQs();

    cy.get("input[title='Total number of questions in quiz']").should("have.value", "4");
    cy.get('button[title="Next Step"]').click();

    // -------------------------
    // STEP 3 - POOL
    // -------------------------

    cy.get('button[title="Show Question Pool"]').click();
    cy.get(".cq-pool-table tbody tr")
      .first()
      .contains("Add")
      .click();

    cy.get('button[type="submit"]').click();

    cy.intercept("POST", "**/quiz**").as("createQuiz");

    cy.wait("@createQuiz").then((res) => {
      const body = res.response?.body;
      quizId =
        body?._id ||
        body?.quiz?._id ||
        body?.createdQuiz?._id;
    });

    cy.contains(/Quiz Created/i);

    // -------------------------
    // PLAY QUIZ
    // -------------------------
    // ----- FAILURE CASE: Demo Cypress
    //cy.contains("Play Quiz").click();
    cy.get('button[title="Back to Quizzes"]').click();
    cy.contains(quizTitle).should("exist").click();

    cy.url().should("include", "/quizlist");
    cy.contains(quizTitle).should("exist");
    cy.get(".quiz-actions").last().as("newQuiz");
    cy.get("@newQuiz").contains("Play").click();


    playQuiz();

  });
});