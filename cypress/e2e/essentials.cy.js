describe("StudyZone Essentials - Mixed Quiz Creation", () => {
  let quizId = null;

  afterEach(() => {
    if (quizId) {
      cy.task("deleteQuiz", quizId).then(() => {
        quizId = null;
      });
    }
  });

  function login(
    email = "ssand139@my.centennialcollege.ca",
    password = "sam123"
  ) {
    cy.visit("http://localhost:5173/login");
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.get('button[type="submit"]').click();
  }

  function goToCreateQuiz() {
    cy.get('a[href="/quizlist"]').click();
    cy.get('button[title="Create a new quiz"]').click();
  }

  it("creates a quiz using manual MCQ, DDQ, bulk parser, and pool question", () => {
    const quizTitle = `Mixed Quiz ${Date.now()}`;
    const bulkQuestionText = "What does CSS stand for?";
    const manualQuestionText = "Manual Cypress MCQ Question";
    const ddqQuestionText = "Sort the items into the correct drop boxes";

    login();

    cy.url().should("eq", "http://localhost:5173/");
    cy.getCookie("token").should("exist");

    goToCreateQuiz();

    cy.contains("1. Quiz Info").should("exist");

    cy.get('input[type="text"]').first().clear().type(quizTitle);
    cy.get("textarea").first().type(
      "Quiz created through Cypress using all creation methods."
    );
    cy.get("select").first().select("public");

    cy.contains("button", "Next").click();

    cy.contains("2. Build Questions").should("exist");

    // -----------------------------
    // 1) MANUAL MCQ
    // -----------------------------
    cy.contains("button", "+ Add MCQ").click();

    cy.get(".cq-question-card")
      .last()
      .within(() => {
        cy.get("textarea")
          .first()
          .clear()
          .type(manualQuestionText);

        cy.get('input[placeholder="Choice 1"]').type("Manual Answer 1");
        cy.get('input[placeholder="Choice 2"]').type("Manual Answer 2");

        cy.contains("button", "+ Add Choice").click();
        cy.get('input[placeholder="Choice 3"]').type("Manual Answer 3");

        cy.contains("button", "+ Add Choice").click();
        cy.get('input[placeholder="Choice 4"]').type("Manual Answer 4");

        cy.get('input[type="radio"]').eq(1).check({ force: true });

        cy.get("input[type='number']").clear().type("2");
        cy.get("select").select("SWE");
        cy.get("textarea").eq(1).type("Manual MCQ explanation.");
      });

    // -----------------------------
    // 2) DDQ
    // -----------------------------
    cy.contains("button", "+ Add DDQ").click();

    cy.get(".cq-question-card")
      .last()
      .within(() => {
        cy.get("textarea")
          .first()
          .clear()
          .type(ddqQuestionText);

        // Drag item 1
        cy.get('input[placeholder^="Drag item"]').eq(0).clear().type("Standards");

        // Drop box titles
        cy.get('input[placeholder^="Drop box"]').eq(0).clear().type("QMS Elements");
        cy.get('input[placeholder^="Drop box"]').eq(1).clear().type("Not QMS");

        // Add second drag item
        cy.contains("button", "+ Add Drag Item").click();
        cy.get('input[placeholder^="Drag item"]').eq(1).clear().type("Auditing");

        // Assign second drag item to second dropbox
        cy.get("select").eq(1).select(1);

        cy.get("input[type='number']").clear().type("3");
        cy.get("select").first().select("SWE");
        cy.get("textarea").eq(1).type("DDQ explanation.");
      });

    // -----------------------------
    // 3) BULK IMPORT
    // -----------------------------
    cy.contains("button", "+ Bulk Import MCQs").click();

    const bulkText = `1. ${bulkQuestionText}
A. Computer Style Sheets
B. Cascading Style Sheets
C. Creative Style Syntax
D. Colorful Style System
Answer: B
Explanation: CSS stands for Cascading Style Sheets.
Subject: SWE`;

    cy.get(".bulk-import-panel").within(() => {
      cy.get("textarea").type(bulkText);
      cy.contains("button", "Parse Questions").click();
      cy.contains(/Parsed 1 question/i).should("exist");
      cy.contains("button", "Import Into Quiz").click();
    });

    // confirm imported question now exists in builder
    cy.contains(".cq-question-card", bulkQuestionText).should("exist");

    // -----------------------------
    // 4) QUESTION POOL
    // -----------------------------
    cy.contains("button", "Next").click();
    cy.contains("3. Question Pool").should("exist");

    // add one question from pool
    cy.get(".cq-pool-table tbody tr").first().within(() => {
      cy.contains("button", "Add").click();
    });

    // back in selected questions list
    cy.get(".cq-selected-pool .cq-question-card").should("have.length.at.least", 4);

    cy.intercept("POST", "**/quiz**").as("createQuizRequest");

    cy.contains("button", "Create Quiz").click();

    cy.wait("@createQuizRequest").then((interception) => {
      const body = interception.response?.body;

      quizId =
        body?._id ||
        body?.quiz?._id ||
        body?.createdQuiz?._id ||
        body?.id ||
        null;

      expect(quizId).to.exist;
    });

    cy.contains("4. Complete").should("exist");
    cy.contains(/Quiz Created/i).should("exist");

    // -----------------------------
    // PLAY THE QUIZ
    // -----------------------------
    cy.contains("button", "Play Quiz").click();

    cy.url().should("include", "/play/");
    cy.contains(quizTitle).should("exist");

    // Manual MCQ
    cy.contains(manualQuestionText)
      .closest(".play-question-card, .cq-question-card, div")
      .within(() => {
        cy.get('input[type="radio"]').first().check({ force: true });
      });

    // Bulk MCQ
    cy.contains(bulkQuestionText)
      .closest(".play-question-card, .cq-question-card, div")
      .within(() => {
        cy.get('input[type="radio"]').eq(1).check({ force: true });
      });

    // DDQ exists
    cy.contains(ddqQuestionText).should("exist");

    cy.contains("button", /Submit Quiz/i).click();

    cy.contains(/score/i).should("exist");
  });
});

function generateRandomString(length) {
  const characters = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}