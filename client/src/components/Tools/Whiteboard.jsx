import React, { useEffect, useRef, useState } from "react";
import "./Whiteboard.css";

export default function Whiteboard() {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);

  const [tool, setTool] = useState("select");
  const [isDrawing, setIsDrawing] = useState(false);

  const [color, setColor] = useState("#ffffff");
  const [brushSize, setBrushSize] = useState(4);

  const [objects, setObjects] = useState([]);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [matrixRows, setMatrixRows] = useState(3);
  const [matrixCols, setMatrixCols] = useState(3);

  useEffect(() => {
    const forceSelect = () => {
      setTool("select");
      setIsDrawing(false);
      setDraggingId(null);
    };

    window.addEventListener("whiteboard-force-select", forceSelect);

    return () => {
      window.removeEventListener("whiteboard-force-select", forceSelect);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const resizeCanvas = () => {
      const nextWidth = Math.floor(wrapper.clientWidth);
      const nextHeight = Math.floor(wrapper.clientHeight);

      // A display:none parent gives the canvas a 0 x 0 layout size.
      // Wait for ResizeObserver to call this again when the panel is visible.
      if (nextWidth <= 0 || nextHeight <= 0) return;

      if (canvas.width === nextWidth && canvas.height === nextHeight) return;

      let oldCanvas = null;

      // drawImage cannot use a canvas whose bitmap is 0 pixels wide or high.
      if (canvas.width > 0 && canvas.height > 0) {
        oldCanvas = document.createElement("canvas");
        oldCanvas.width = canvas.width;
        oldCanvas.height = canvas.height;

        const oldCtx = oldCanvas.getContext("2d");
        oldCtx?.drawImage(canvas, 0, 0);
      }

      canvas.width = nextWidth;
      canvas.height = nextHeight;

      if (oldCanvas) {
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(oldCanvas, 0, 0);
      }
    };

    resizeCanvas();

    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(wrapper);

    return () => observer.disconnect();
  }, []);

  const clampMatrixSize = (value) => {
    const number = Number(value);
    if (Number.isNaN(number)) return 1;
    return Math.min(Math.max(number, 1), 8);
  };

  const getPointerPosition = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    if (tool !== "pen" && tool !== "eraser") return;

    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPointerPosition(e);

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);

    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPointerPosition(e);

    ctx.lineTo(pos.x, pos.y);

    ctx.lineWidth = tool === "eraser" ? brushSize * 2.2 : brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
    }

    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearDrawings = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const clearEverything = () => {
    clearDrawings();
    setObjects([]);
    setTool("select");
  };

  const addText = () => {
    setObjects((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: "text",
        x: 90,
        y: 90,
        text: "Type your step here...",
      },
    ]);

    setTool("select");
  };

  const addSticky = () => {
    setObjects((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: "sticky",
        x: 130,
        y: 110,
        text: "Minor = remove row + column",
      },
    ]);

    setTool("select");
  };

  const addMatrix = () => {
    const rows = Array.from({ length: matrixRows }, () =>
      Array.from({ length: matrixCols }, () => "")
    );

    setObjects((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: "matrix",
        x: 140,
        y: 140,
        rows,
      },
    ]);

    setTool("select");
  };

  const addShape = (shapeType) => {
    setObjects((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: "shape",
        shapeType,
        x: 170,
        y: 160,
        text: "",
      },
    ]);

    setTool("select");
  };

  const updateObject = (id, updates) => {
    setObjects((prev) =>
      prev.map((obj) => (obj.id === id ? { ...obj, ...updates } : obj))
    );
  };

  const deleteObject = (id) => {
    setObjects((prev) => prev.filter((obj) => obj.id !== id));
  };

  const startDrag = (e, obj) => {
    if (tool !== "select") return;

    if (
      e.target.tagName === "INPUT" ||
      e.target.tagName === "TEXTAREA" ||
      e.target.tagName === "BUTTON"
    ) {
      return;
    }

    const rect = wrapperRef.current.getBoundingClientRect();

    setDraggingId(obj.id);
    setDragOffset({
      x: e.clientX - rect.left - obj.x,
      y: e.clientY - rect.top - obj.y,
    });
  };

  const dragObject = (e) => {
    if (!draggingId || tool !== "select") return;

    const rect = wrapperRef.current.getBoundingClientRect();

    updateObject(draggingId, {
      x: e.clientX - rect.left - dragOffset.x,
      y: e.clientY - rect.top - dragOffset.y,
    });
  };

  const stopDrag = () => {
    setDraggingId(null);
  };

  return (
    <div className="whiteboard-page">
      <div className="whiteboard-toolbar">
        <div className="whiteboard-title-group">
          <h2>Whiteboard</h2>
          <p>Select edits objects. Pen/Eraser draws over matrices.</p>
        </div>

        <div className="whiteboard-tools">
          <button
            type="button"
            className={tool === "select" ? "active-tool" : ""}
            onClick={() => setTool("select")}
          >
            Select
          </button>

          <button
            type="button"
            className={tool === "pen" ? "active-tool" : ""}
            onClick={() => setTool("pen")}
          >
            Pen
          </button>

          <button
            type="button"
            className={tool === "eraser" ? "active-tool" : ""}
            onClick={() => setTool("eraser")}
          >
            Eraser
          </button>

          <button type="button" onClick={addText}>
            Text
          </button>

          <button type="button" onClick={addSticky}>
            Note
          </button>

          <div className="matrix-size-control">
            <input
              type="number"
              min="1"
              max="8"
              value={matrixRows}
              onChange={(e) => setMatrixRows(clampMatrixSize(e.target.value))}
            />

            <span>×</span>

            <input
              type="number"
              min="1"
              max="8"
              value={matrixCols}
              onChange={(e) => setMatrixCols(clampMatrixSize(e.target.value))}
            />

            <button type="button" onClick={addMatrix}>
              Matrix
            </button>
          </div>

          <button type="button" onClick={() => addShape("rectangle")}>
            Box
          </button>

          <button type="button" onClick={() => addShape("circle")}>
            Circle
          </button>

          <label className="whiteboard-control">
            <span>Color</span>
            <input
              type="color"
              value={color}
              disabled={tool === "eraser"}
              onChange={(e) => setColor(e.target.value)}
            />
          </label>

          <label className="whiteboard-control brush-control">
            <span>{brushSize}px</span>
            <input
              type="range"
              min="1"
              max="30"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
            />
          </label>

          <button type="button" className="soft-clear-btn" onClick={clearDrawings}>
            Clear Ink
          </button>

          <button type="button" className="clear-board-btn" onClick={clearEverything}>
            Clear All
          </button>
        </div>
      </div>

      <div
        className="whiteboard-canvas-wrapper"
        ref={wrapperRef}
        onMouseMove={dragObject}
        onMouseUp={stopDrag}
        onMouseLeave={() => {
          stopDrag();
          stopDrawing();
        }}
      >
        <canvas
          ref={canvasRef}
          className={`whiteboard-canvas ${
            tool === "pen" || tool === "eraser" ? "draw-mode" : "select-mode"
          }`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />

        <div className="whiteboard-object-layer">
          {objects.map((obj) => (
            <div
              key={obj.id}
              className={`whiteboard-object ${obj.type}`}
              style={{ left: obj.x, top: obj.y }}
              onMouseDown={(e) => startDrag(e, obj)}
            >
              <button
                type="button"
                className="object-delete-btn"
                onClick={() => deleteObject(obj.id)}
              >
                ×
              </button>

              {obj.type === "text" && (
                <textarea
                  value={obj.text}
                  onChange={(e) => updateObject(obj.id, { text: e.target.value })}
                />
              )}

              {obj.type === "sticky" && (
                <textarea
                  value={obj.text}
                  onChange={(e) => updateObject(obj.id, { text: e.target.value })}
                />
              )}

              {obj.type === "matrix" && (
                <div className="matrix-object">
                  <span className="matrix-bracket">[</span>

                  <div
                    className="matrix-grid"
                    style={{ "--cols": obj.rows[0]?.length || 1 }}
                  >
                    {obj.rows.map((row, rIndex) =>
                      row.map((cell, cIndex) => (
                        <input
                          key={`${rIndex}-${cIndex}`}
                          value={cell}
                          onChange={(e) => {
                            const newRows = obj.rows.map((r) => [...r]);
                            newRows[rIndex][cIndex] = e.target.value;
                            updateObject(obj.id, { rows: newRows });
                          }}
                        />
                      ))
                    )}
                  </div>

                  <span className="matrix-bracket">]</span>
                </div>
              )}

              {obj.type === "shape" && (
                <div className={`shape-object ${obj.shapeType}`}>
                  <textarea
                    value={obj.text || ""}
                    placeholder={
                      obj.shapeType === "rectangle"
                        ? "Write inside box..."
                        : "Write..."
                    }
                    onChange={(e) =>
                      updateObject(obj.id, {
                        text: e.target.value,
                      })
                    }
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={`whiteboard-mode-badge mode-${tool}`}>
          {tool === "select" && "Select Mode"}
          {tool === "pen" && "Pen Mode"}
          {tool === "eraser" && "Eraser Mode"}
        </div>
      </div>
    </div>
  );
}
