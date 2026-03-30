import React, { useEffect, useState } from "react";
import "./styles/DragDropQuiz.css";

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
  const [placedItems, setPlacedItems] = useState(
    createPlacedItemsState(question.dropboxes || [])
  );

  useEffect(() => {
    if (!question) return;

    setPool(question.dragItems || []);
    setPlacedItems(
      value && Object.keys(value).length > 0
        ? value
        : createPlacedItemsState(question.dropboxes || [])
    );
  }, [question]);

  const allowDrop = (e) => {
    e.preventDefault();
  };

  const handleDragStart = (e, item, source) => {
    if (disabled) return;
    e.dataTransfer.setData("item", JSON.stringify(item));
    e.dataTransfer.setData("source", source);
  };

  const removeFromSource = (itemId, source) => {
    if (source === "pool") {
      setPool((prev) => prev.filter((item) => item.id !== itemId));
    } else {
      setPlacedItems((prev) => ({
        ...prev,
        [source]: prev[source].filter((item) => item.id !== itemId),
      }));
    }
  };

  const addToTarget = (item, target) => {
    if (target === "pool") {
      setPool((prev) => [...prev, item]);
    } else {
      setPlacedItems((prev) => ({
        ...prev,
        [target]: [...prev[target], item],
      }));
    }
  };

  const handleDrop = (e, target) => {
    e.preventDefault();
    if (disabled) return;

    const item = JSON.parse(e.dataTransfer.getData("item"));
    const source = e.dataTransfer.getData("source");

    if (source === target) return;

    let nextPool = pool;
    let nextPlaced = placedItems;

    if (source === "pool") {
      nextPool = pool.filter((x) => x.id !== item.id);
    } else {
      nextPlaced = {
        ...nextPlaced,
        [source]: nextPlaced[source].filter((x) => x.id !== item.id),
      };
    }

    if (target === "pool") {
      nextPool = [...nextPool, item];
    } else {
      nextPlaced = {
        ...nextPlaced,
        [target]: [...nextPlaced[target], item],
      };
    }

    setPool(nextPool);
    setPlacedItems(nextPlaced);
    onChange?.(nextPlaced);
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
        items.map((item) => {
          const placedCorrectly = item.dropboxId === boxId;

          return (
            <div
              key={item.id}
              className="drag-item"
              draggable={!disabled}
              onDragStart={(e) => handleDragStart(e, item, boxId)}
            >
              <span>{item.text}</span>

              {showResults && (
                <span
                  className={`result-indicator ${
                    placedCorrectly ? "correct" : "wrong"
                  }`}
                >
                  {placedCorrectly ? "✓" : "✗"}
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div className="drag-drop-quiz-card">
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
            pool.map((item) => (
              <div
                key={item.id}
                className="drag-item"
                draggable={!disabled}
                onDragStart={(e) => handleDragStart(e, item, "pool")}
              >
                <span>{item.text}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="answer-sections">
        {(question.dropboxes || []).map((box) => (
          <React.Fragment key={box.id}>
            {renderBox(box.title, box.id, placedItems[box.id] || [])}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}