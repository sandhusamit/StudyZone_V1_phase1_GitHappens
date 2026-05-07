import { useMemo, useState } from "react";
import "./SmartCalculator.css";

export default function SmartCalculator() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState([]);
  const [mode, setMode] = useState("basic");
  const [angleMode, setAngleMode] = useState("rad");

  const buttons = useMemo(() => {
    const basic = [
      "7", "8", "9", "/",
      "4", "5", "6", "*",
      "1", "2", "3", "-",
      "0", ".", "(", ")",
      "C", "⌫", "^", "+",
      "%", "=", 
    ];

    const scientific = [
      "sin(", "cos(", "tan(",
      "asin(", "acos(", "atan(",
      "sqrt(", "root(",
      "log(", "ln(",
      "abs(", "floor(", "ceil(", "round(",
      "π", "e", "!", ",",
    ];

    return mode === "scientific" ? [...scientific, ...basic] : basic;
  }, [mode]);

  const appendValue = (value) => {
    setExpression((prev) => prev + value);
  };

  const handleClear = () => {
    setExpression("");
    setResult("");
  };

  const handleBackspace = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  const factorial = (n) => {
    if (!Number.isInteger(n) || n < 0) return NaN;

    let total = 1;

    for (let i = 2; i <= n; i++) {
      total *= i;
    }

    return total;
  };

  const decimalToFraction = (value, tolerance = 1e-8) => {
    const num = Number(value);

    if (Number.isNaN(num)) return value;
    if (Number.isInteger(num)) return String(num);

    let bestNumerator = Math.round(num);
    let bestDenominator = 1;
    let bestError = Math.abs(num - bestNumerator / bestDenominator);

    for (let denominator = 1; denominator <= 200; denominator++) {
      const numerator = Math.round(num * denominator);
      const error = Math.abs(num - numerator / denominator);

      if (error < bestError) {
        bestNumerator = numerator;
        bestDenominator = denominator;
        bestError = error;
      }

      if (error < tolerance) break;
    }

    return `${bestNumerator}/${bestDenominator}`;
  };

  const formatResult = (value) => {
    if (typeof value !== "number") return value;
    if (!Number.isFinite(value)) return "Undefined";

    const rounded = Number(value.toFixed(10));
    return rounded;
  };

  const convertNormalTrig = (expr) => {
    if (angleMode === "rad") {
      return expr
        .replace(/\bsin\(/g, "Math.sin(")
        .replace(/\bcos\(/g, "Math.cos(")
        .replace(/\btan\(/g, "Math.tan(");
    }

    return expr
      .replace(/\bsin\(/g, "Math.sin((Math.PI/180)*")
      .replace(/\bcos\(/g, "Math.cos((Math.PI/180)*")
      .replace(/\btan\(/g, "Math.tan((Math.PI/180)*");
  };

  const convertInverseTrig = (expr) => {
    if (angleMode === "rad") {
      return expr
        .replace(/\basin\(/g, "Math.asin(")
        .replace(/\bacos\(/g, "Math.acos(")
        .replace(/\batan\(/g, "Math.atan(");
    }

    return expr
      .replace(/\basin\(/g, "(180/Math.PI)*Math.asin(")
      .replace(/\bacos\(/g, "(180/Math.PI)*Math.acos(")
      .replace(/\batan\(/g, "(180/Math.PI)*Math.atan(");
  };

  const preprocessExpression = (input) => {
    let formatted = input;

    formatted = formatted
      .replaceAll("π", "Math.PI")
      .replace(/\be\b/g, "Math.E")
      .replaceAll("^", "**");

    formatted = formatted
      .replaceAll("sqrt(", "Math.sqrt(")
      .replace(/root\(([^,]+),([^)]+)\)/g, "Math.pow($1, 1 / ($2))")
      .replaceAll("log(", "Math.log10(")
      .replaceAll("ln(", "Math.log(")
      .replaceAll("abs(", "Math.abs(")
      .replaceAll("floor(", "Math.floor(")
      .replaceAll("ceil(", "Math.ceil(")
      .replaceAll("round(", "Math.round(");

    formatted = convertInverseTrig(formatted);
    formatted = convertNormalTrig(formatted);

    formatted = formatted.replace(/(\d+(\.\d+)?)!/g, "factorial($1)");

    formatted = formatted.replace(/(\d+(\.\d+)?)%/g, "($1/100)");

    return formatted;
  };

  const evaluateExpression = () => {
    try {
      if (!expression.trim()) return;

      const formatted = preprocessExpression(expression);

      const evalResult = Function(
        "factorial",
        `"use strict"; return (${formatted});`
      )(factorial);

      const rounded = formatResult(evalResult);

      setResult(rounded);

      setHistory((prev) => [
        {
          expression,
          result: rounded,
          fractionResult:
            typeof rounded === "number" ? decimalToFraction(rounded) : rounded,
        },
        ...prev.slice(0, 19),
      ]);
    } catch (error) {
      setResult("Invalid Expression");
    }
  };

  const handleKeyPress = (value) => {
    if (value === "C") {
      handleClear();
      return;
    }

    if (value === "⌫") {
      handleBackspace();
      return;
    }

    if (value === "=") {
      evaluateExpression();
      return;
    }

    appendValue(value);
  };

  return (
    <div className="smart-calc">
      <div className="calc-header">
        <div>
          <h2>Smart Calculator</h2>
          <p>
            Fractions, trig, inverse trig, roots, logs, powers, factorials, and
            quick math support.
          </p>
        </div>

        <div className="calc-top-actions">
          <button
            type="button"
            className="mode-btn"
            onClick={() =>
              setAngleMode((prev) => (prev === "rad" ? "deg" : "rad"))
            }
          >
            {angleMode.toUpperCase()}
          </button>

          <button
            type="button"
            className="mode-btn"
            onClick={() =>
              setMode((prev) => (prev === "basic" ? "scientific" : "basic"))
            }
          >
            {mode === "basic" ? "Scientific" : "Basic"}
          </button>
        </div>
      </div>

      <div className="calc-screen">
        <input
          className="calc-expression-input"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="Example: sin(30), 3/4 + 2, sqrt(16)"
        />

        <div className="calc-result">
          {result !== "" ? result : "--"}
        </div>

        {typeof result === "number" && !Number.isInteger(result) && (
          <div className="calc-fraction-result">
            ≈ {decimalToFraction(result)}
          </div>
        )}
      </div>

      <div className="calc-grid">
        {buttons.map((btn) => (
          <button
            key={btn}
            type="button"
            className={`calc-btn ${
              ["+", "-", "*", "/", "^", "="].includes(btn)
                ? "operator-btn"
                : ""
            } ${btn === "=" ? "equals-btn" : ""}`}
            onClick={() => handleKeyPress(btn)}
          >
            {btn}
          </button>
        ))}
      </div>

      <div className="calc-history">
        <div className="history-header">
          <h3>History</h3>

          <button
            type="button"
            className="history-clear-btn"
            onClick={() => setHistory([])}
          >
            Clear
          </button>
        </div>

        {history.length === 0 && (
          <p className="history-empty">No calculations yet.</p>
        )}

        {history.map((item, index) => (
          <button
            key={index}
            type="button"
            className="history-item"
            onClick={() => {
              setExpression(item.expression);
              setResult(item.result);
            }}
          >
            <span>{item.expression}</span>
            <strong>= {item.result}</strong>

            {item.fractionResult !== item.result && (
              <small>≈ {item.fractionResult}</small>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}