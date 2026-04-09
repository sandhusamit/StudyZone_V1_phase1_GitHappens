import React, { useEffect, useState } from "react";
import "./DragDropQuestion.css";

const createPlacedItemsState = (dropboxes) => {
  const state = {};
  dropboxes.forEach((box) => {
    state[box.id] = [];
  });
  return state;
};

export default function DragDropQuestionCard({
  question,
  value,
  onChange,
  showResults,
  disabled = false,
}) {
  const [pool, setPool] = useState([]);
  const [placedItems, setPlacedItems] = useState({});

  // INIT / SYNC QUESTION
  useEffect(() => {
    if (!question) return;

    const initialPlaced = createPlacedItemsState(question.dropboxes || []);

    setPool(question.dragItems || []);

    setPlacedItems(
      value && Object.keys(value).length > 0
        ? value
        : initialPlaced
    );
  }, [question]);

  const allowDrop = (e) => e.preventDefault();

  const handleDragStart = (e, item, source) => {
    if (disabled) return;
    e.dataTransfer.setData("item", JSON.stringify(item));
    e.dataTransfer.setData("source", source);
  };

  const handleDrop = (e, target) => {
    e.preventDefault();
    if (disabled) return;

    const item = JSON.parse(e.dataTransfer.getData("item"));
    const source = e.dataTransfer.getData("source");

    if (!item) return;
    if (source === target) return;

    let nextPool = [...pool];
    let nextPlaced = { ...placedItems };

    // REMOVE FROM SOURCE
    if (source === "pool") {
      nextPool = nextPool.filter((x) => x.id !== item.id);
    } else {
      nextPlaced[source] = nextPlaced[source].filter((x) => x.id !== item.id);
    }

    // ADD TO TARGET
    if (target === "pool") {
      nextPool.push(item);
    } else {
      nextPlaced[target] = [...(nextPlaced[target] || []), item];
    }

    setPool(nextPool);
    setPlacedItems(nextPlaced);
    onChange?.(nextPlaced);
  };

  const renderItem = (item, sourceBoxId) => {
    const isCorrect = item.dropboxId === sourceBoxId;

    return (
      <div
        key={item.id}
        className="drag-item"
        draggable={!disabled}
        onDragStart={(e) => handleDragStart(e, item, sourceBoxId)}
      >
        <span>{item.text}</span>

        {showResults && (
          <span
            className={`result-indicator ${
              isCorrect ? "correct" : "wrong"
            }`}
          >
            {isCorrect ? "✓" : "✗"}
          </span>
        )}
      </div>
    );
  };

  const renderBox = (title, boxId, items) => (
    <div
      className="drop-box"
      onDragOver={allowDrop}
      onDrop={(e) => handleDrop(e, boxId)}
    >
      <h3>{title}</h3>

      {items.length === 0 ? (
        <p className="placeholder">Drop here</p>
      ) : (
        items.map((item) => renderItem(item, boxId))
      )}
    </div>
  );

  return (
    <div className="drag-drop-quiz-card">
      {/* POOL */}
      <div className="top-pool">
        <h3>Choices</h3>

        <div
          className="pool-box"
          onDragOver={allowDrop}
          onDrop={(e) => handleDrop(e, "pool")}
        >
          {pool.length === 0 ? (
            <p className="placeholder">No more items</p>
          ) : (
            pool.map((item) => renderItem(item, "pool"))
          )}
        </div>
      </div>

      {/* DROPS */}
      <div className="answer-sections">
        {(question.dropboxes || []).map((box) => (
          <div key={box.id}>
            {renderBox(
              box.title,
              box.id,
              placedItems[box.id] || []
            )}
          </div>
        ))}
      </div>
    </div>
  );
}