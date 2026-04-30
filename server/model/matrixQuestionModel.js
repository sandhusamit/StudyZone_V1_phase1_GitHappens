import mongoose from "mongoose";

const MatrixSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },

    matrixType: {
      type: String,
      enum: [
        "square",
        "rectangular",
        "zero",
        "identity",
        "diagonal",
        "column",
        "row",
        "singleton",
      ],
      required: true,
    },

    rows: {
      type: [[Number]],
      required: true,
      validate: {
        validator: function (rows) {
          if (!Array.isArray(rows) || rows.length === 0) return false;

          const columnCount = rows[0]?.length;
          if (!columnCount) return false;

          return rows.every(
            (row) =>
              Array.isArray(row) &&
              row.length === columnCount &&
              row.every((value) => typeof value === "number")
          );
        },
        message: "Matrix rows must be a valid rectangular 2D number array.",
      },
    },

    rowCount: {
      type: Number,
      required: true,
      min: 1,
    },

    columnCount: {
      type: Number,
      required: true,
      min: 1,
    },

    dividerIndex: {
      type: Number,
      default: null,
    },
  },
  { _id: false }
);

const isValidMatrixAnswer = (ans) => {
  if (!ans || typeof ans !== "object" || Array.isArray(ans)) return false;

  if (!ans.label || typeof ans.label !== "string") return false;
  if (!ans.matrixType || typeof ans.matrixType !== "string") return false;

  if (!Array.isArray(ans.rows) || ans.rows.length === 0) return false;

  const columnCount = ans.rows[0]?.length;
  if (!columnCount) return false;

  const validRows = ans.rows.every(
    (row) =>
      Array.isArray(row) &&
      row.length === columnCount &&
      row.every((value) => typeof value === "number")
  );

  return (
    validRows &&
    typeof ans.rowCount === "number" &&
    ans.rowCount === ans.rows.length &&
    typeof ans.columnCount === "number" &&
    ans.columnCount === columnCount
  );
};

const MatrixQuestionSchema = new mongoose.Schema(
  {
    questionType: {
      type: String,
      enum: [
        "addition",
        "subtraction",
        "multiplication",
        "determinant",
        "trace",
        "inverse",
        "transpose",
        "RREF",
        "REF",
        "custom",
      ],
      required: true,
      index: true,
    },

    title: {
      type: String,
      default: "",
      trim: true,
    },

    prompt: {
      type: String,
      required: true,
      trim: true,
    },

    matrices: {
      type: [MatrixSchema],
      required: true,
      validate: {
        validator: function (matrices) {
          return Array.isArray(matrices) && matrices.length > 0;
        },
        message: "At least one matrix is required.",
      },
    },

    answerMode: {
      type: String,
      enum: ["single", "multiple", "steps"],
      default: "single",
    },

    expectedAnswers: {
      type: [mongoose.Schema.Types.Mixed],
      required: true,
      validate: {
        validator: function (answers) {
          if (!Array.isArray(answers) || answers.length === 0) return false;

          return answers.every((ans) => {
            const isScalar = typeof ans === "number";
            const isMatrix = isValidMatrixAnswer(ans);

            return isScalar || isMatrix;
          });
        },
        message:
          "Expected answers must be valid scalar numbers or valid matrix objects.",
      },
    },

    points: {
      type: Number,
      default: 1,
      min: 1,
    },

    explanation: {
      type: String,
      default: "",
    },

    subject: {
      type: String,
      enum: ["Math", "SWE", "Data", "General"],
      default: "Math",
      index: true,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "MatrixQuestion",
  MatrixQuestionSchema,
  "matrixQuestions"
);