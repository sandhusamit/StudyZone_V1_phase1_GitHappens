import React, { useMemo, useState } from "react";
import "./styles/CreateDiagramQuestion.css";

const emptyLine = () => ({
  id: crypto.randomUUID(),
  x1: 100,
  y1: 100,
  x2: 200,
  y2: 100,
});

const emptyDropZone = () => ({
  id: crypto.randomUUID(),
  zoneKey: "",
  correctItemId: "",
  left: 100,
  top: 100,
  width: 120,
  height: 60,
});

const emptyDraggableItem = () => ({
  id: crypto.randomUUID(),
  itemKey: "",
  label: "",
});

export default function CreateDiagramQuestion()  {
  const [title, setTitle] = useState("Untitled Diagram Question");
  const [instructions, setInstructions] = useState(
    "Drag each label into the correct position."
  );
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(420);
  const [backgroundImage, setBackgroundImage] = useState("");

  const [draggableItems, setDraggableItems] = useState([
    { id: crypto.randomUUID(), itemKey: "router", label: "Router" },
    { id: crypto.randomUUID(), itemKey: "modem", label: "Modem" },
  ]);

  const [dropZones, setDropZones] = useState([
    {
      id: crypto.randomUUID(),
      zoneKey: "zone-router",
      correctItemId: "router",
      left: 250,
      top: 80,
      width: 120,
      height: 60,
    },
    {
      id: crypto.randomUUID(),
      zoneKey: "zone-modem",
      correctItemId: "modem",
      left: 420,
      top: 150,
      width: 120,
      height: 60,
    },
  ]);

  const [lines, setLines] = useState([
    { id: crypto.randomUUID(), x1: 120, y1: 110, x2: 250, y2: 110 },
    { id: crypto.randomUUID(), x1: 370, y1: 110, x2: 420, y2: 180 },
  ]);

  const [placements, setPlacements] = useState({});

  const questionPayload = useMemo(() => {
    return {
      type: "diagram-label",
      title: title.trim(),
      instructions: instructions.trim(),
      canvasWidth: Number(canvasWidth),
      canvasHeight: Number(canvasHeight),
      backgroundImage: backgroundImage.trim() || null,
      draggableItems: draggableItems.map((item) => ({
        itemKey: item.itemKey.trim(),
        label: item.label,
      })),
      dropZones: dropZones.map((zone) => ({
        zoneKey: zone.zoneKey.trim(),
        correctItemId: zone.correctItemId.trim(),
        left: Number(zone.left),
        top: Number(zone.top),
        width: Number(zone.width),
        height: Number(zone.height),
      })),
      lines: lines.map((line) => ({
        x1: Number(line.x1),
        y1: Number(line.y1),
        x2: Number(line.x2),
        y2: Number(line.y2),
      })),
    };
  }, [
    title,
    instructions,
    canvasWidth,
    canvasHeight,
    backgroundImage,
    draggableItems,
    dropZones,
    lines,
  ]);

  const handleDragStart = (e, itemKey, sourceZoneKey = null) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ itemKey, sourceZoneKey })
    );
  };

  const allowDrop = (e) => e.preventDefault();

  const handleDropOnZone = (e, zoneKey) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;

    const { itemKey, sourceZoneKey } = JSON.parse(raw);

    setPlacements((prev) => {
      const updated = { ...prev };

      if (sourceZoneKey) {
        delete updated[sourceZoneKey];
      }

      Object.keys(updated).forEach((key) => {
        if (updated[key] === itemKey) {
          delete updated[key];
        }
      });

      updated[zoneKey] = itemKey;
      return updated;
    });
  };

  const handleDropBackToBank = (e) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;

    const { sourceZoneKey } = JSON.parse(raw);
    if (!sourceZoneKey) return;

    setPlacements((prev) => {
      const updated = { ...prev };
      delete updated[sourceZoneKey];
      return updated;
    });
  };

  const placedItemKeys = useMemo(() => Object.values(placements), [placements]);

  const availableItems = useMemo(() => {
    return draggableItems.filter((item) => !placedItemKeys.includes(item.itemKey));
  }, [draggableItems, placedItemKeys]);

  const addDraggableItem = () => {
    setDraggableItems((prev) => [...prev, emptyDraggableItem()]);
  };

  const updateDraggableItem = (id, field, value) => {
    setDraggableItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removeDraggableItem = (id, itemKey) => {
    setDraggableItems((prev) => prev.filter((item) => item.id !== id));

    setDropZones((prev) =>
      prev.map((zone) =>
        zone.correctItemId === itemKey ? { ...zone, correctItemId: "" } : zone
      )
    );

    setPlacements((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((zoneKey) => {
        if (updated[zoneKey] === itemKey) {
          delete updated[zoneKey];
        }
      });
      return updated;
    });
  };

  const addDropZone = () => {
    setDropZones((prev) => [...prev, emptyDropZone()]);
  };

  const updateDropZone = (id, field, value) => {
    setDropZones((prev) =>
      prev.map((zone) => (zone.id === id ? { ...zone, [field]: value } : zone))
    );
  };

  const removeDropZone = (id, zoneKey) => {
    setDropZones((prev) => prev.filter((zone) => zone.id !== id));

    setPlacements((prev) => {
      const updated = { ...prev };
      delete updated[zoneKey];
      return updated;
    });
  };

  const addLine = () => {
    setLines((prev) => [...prev, emptyLine()]);
  };

  const updateLine = (id, field, value) => {
    setLines((prev) =>
      prev.map((line) => (line.id === id ? { ...line, [field]: Number(value) } : line))
    );
  };

  const removeLine = (id) => {
    setLines((prev) => prev.filter((line) => line.id !== id));
  };

  const fillSample = () => {
    setTitle("Client Connection to Internet");
    setInstructions("Drag each label into the correct position.");
    setCanvasWidth(800);
    setCanvasHeight(420);
    setBackgroundImage("");
    setDraggableItems([
      { id: crypto.randomUUID(), itemKey: "dhcp", label: "DHCP Server" },
      { id: crypto.randomUUID(), itemKey: "router", label: "Router" },
      { id: crypto.randomUUID(), itemKey: "modem", label: "Modem" },
      { id: crypto.randomUUID(), itemKey: "isp", label: "ISP Network" },
      { id: crypto.randomUUID(), itemKey: "internet", label: "Internet" },
    ]);
    setDropZones([
      {
        id: crypto.randomUUID(),
        zoneKey: "zone-dhcp",
        correctItemId: "dhcp",
        left: 30,
        top: 110,
        width: 120,
        height: 60,
      },
      {
        id: crypto.randomUUID(),
        zoneKey: "zone-router",
        correctItemId: "router",
        left: 250,
        top: 70,
        width: 120,
        height: 60,
      },
      {
        id: crypto.randomUUID(),
        zoneKey: "zone-modem",
        correctItemId: "modem",
        left: 400,
        top: 155,
        width: 120,
        height: 60,
      },
      {
        id: crypto.randomUUID(),
        zoneKey: "zone-isp",
        correctItemId: "isp",
        left: 550,
        top: 105,
        width: 150,
        height: 70,
      },
      {
        id: crypto.randomUUID(),
        zoneKey: "zone-internet",
        correctItemId: "internet",
        left: 710,
        top: 110,
        width: 80,
        height: 60,
      },
    ]);
    setLines([
      { id: crypto.randomUUID(), x1: 150, y1: 140, x2: 250, y2: 100 },
      { id: crypto.randomUUID(), x1: 370, y1: 100, x2: 400, y2: 185 },
      { id: crypto.randomUUID(), x1: 520, y1: 185, x2: 550, y2: 140 },
      { id: crypto.randomUUID(), x1: 700, y1: 140, x2: 710, y2: 140 },
    ]);
    setPlacements({});
  };

  return (
    <div className="diagram-creator-page">
      <h2>Create Diagram Question</h2>

      <div className="creator-grid">
        <div className="creator-panel">
          <section className="panel-section">
            <h3>Question Setup</h3>

            <label>
              Title
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>

            <label>
              Instructions
              <textarea
                rows="3"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </label>

            <div className="row-2">
              <label>
                Canvas Width
                <input
                  type="number"
                  value={canvasWidth}
                  onChange={(e) => setCanvasWidth(e.target.value)}
                />
              </label>

              <label>
                Canvas Height
                <input
                  type="number"
                  value={canvasHeight}
                  onChange={(e) => setCanvasHeight(e.target.value)}
                />
              </label>
            </div>

            <label>
              Background Image URL
              <input
                type="text"
                value={backgroundImage}
                onChange={(e) => setBackgroundImage(e.target.value)}
                placeholder="Optional image URL"
              />
            </label>

            <div className="btn-row">
              <button type="button" onClick={fillSample}>
                Load Sample
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setPlacements({});
                }}
              >
                Clear Preview Placements
              </button>
            </div>
          </section>

          <section className="panel-section">
            <div className="section-header">
              <h3>Draggable Labels</h3>
              <button type="button" onClick={addDraggableItem}>
                + Add Label
              </button>
            </div>

            {draggableItems.map((item) => (
              <div className="editor-card" key={item.id}>
                <label>
                  itemKey
                  <input
                    type="text"
                    value={item.itemKey}
                    onChange={(e) =>
                      updateDraggableItem(item.id, "itemKey", e.target.value)
                    }
                    placeholder="router"
                  />
                </label>

                <label>
                  Label
                  <textarea
                    rows="2"
                    value={item.label}
                    onChange={(e) =>
                      updateDraggableItem(item.id, "label", e.target.value)
                    }
                    placeholder="Router"
                  />
                </label>

                <button
                  type="button"
                  className="danger-btn"
                  onClick={() => removeDraggableItem(item.id, item.itemKey)}
                >
                  Remove
                </button>
              </div>
            ))}
          </section>

          <section className="panel-section">
            <div className="section-header">
              <h3>Drop Zones</h3>
              <button type="button" onClick={addDropZone}>
                + Add Zone
              </button>
            </div>

            {dropZones.map((zone) => (
              <div className="editor-card" key={zone.id}>
                <div className="row-2">
                  <label>
                    zoneKey
                    <input
                      type="text"
                      value={zone.zoneKey}
                      onChange={(e) =>
                        updateDropZone(zone.id, "zoneKey", e.target.value)
                      }
                      placeholder="zone-router"
                    />
                  </label>

                  <label>
                    correctItemId
                    <select
                      value={zone.correctItemId}
                      onChange={(e) =>
                        updateDropZone(zone.id, "correctItemId", e.target.value)
                      }
                    >
                      <option value="">Select label</option>
                      {draggableItems.map((item) => (
                        <option key={item.id} value={item.itemKey}>
                          {item.itemKey || "(empty itemKey)"}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="row-4">
                  <label>
                    left
                    <input
                      type="number"
                      value={zone.left}
                      onChange={(e) =>
                        updateDropZone(zone.id, "left", Number(e.target.value))
                      }
                    />
                  </label>

                  <label>
                    top
                    <input
                      type="number"
                      value={zone.top}
                      onChange={(e) =>
                        updateDropZone(zone.id, "top", Number(e.target.value))
                      }
                    />
                  </label>

                  <label>
                    width
                    <input
                      type="number"
                      value={zone.width}
                      onChange={(e) =>
                        updateDropZone(zone.id, "width", Number(e.target.value))
                      }
                    />
                  </label>

                  <label>
                    height
                    <input
                      type="number"
                      value={zone.height}
                      onChange={(e) =>
                        updateDropZone(zone.id, "height", Number(e.target.value))
                      }
                    />
                  </label>
                </div>

                <button
                  type="button"
                  className="danger-btn"
                  onClick={() => removeDropZone(zone.id, zone.zoneKey)}
                >
                  Remove
                </button>
              </div>
            ))}
          </section>

          <section className="panel-section">
            <div className="section-header">
              <h3>Lines / Arrows</h3>
              <button type="button" onClick={addLine}>
                + Add Line
              </button>
            </div>

            {lines.map((line) => (
              <div className="editor-card" key={line.id}>
                <div className="row-4">
                  <label>
                    x1
                    <input
                      type="number"
                      value={line.x1}
                      onChange={(e) => updateLine(line.id, "x1", e.target.value)}
                    />
                  </label>

                  <label>
                    y1
                    <input
                      type="number"
                      value={line.y1}
                      onChange={(e) => updateLine(line.id, "y1", e.target.value)}
                    />
                  </label>

                  <label>
                    x2
                    <input
                      type="number"
                      value={line.x2}
                      onChange={(e) => updateLine(line.id, "x2", e.target.value)}
                    />
                  </label>

                  <label>
                    y2
                    <input
                      type="number"
                      value={line.y2}
                      onChange={(e) => updateLine(line.id, "y2", e.target.value)}
                    />
                  </label>
                </div>

                <button
                  type="button"
                  className="danger-btn"
                  onClick={() => removeLine(line.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </section>
        </div>

        <div className="preview-panel">
          <section className="panel-section">
            <h3>Live Preview</h3>
            <p>{instructions}</p>

            <div
              className="label-bank"
              onDragOver={allowDrop}
              onDrop={handleDropBackToBank}
            >
              <h4>Labels</h4>
              <div className="label-bank-items">
                {availableItems.map((item) => (
                  <div
                    key={item.id}
                    className="diagram-node"
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.itemKey, null)}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            <div
              className="diagram-preview-canvas"
              style={{
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`,
                backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
              }}
            >
              <svg
                className="diagram-svg"
                viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
                preserveAspectRatio="none"
              >
                {lines.map((line) => (
                  <g key={line.id}>
                    <line
                      x1={line.x1}
                      y1={line.y1}
                      x2={line.x2}
                      y2={line.y2}
                      className="diagram-line"
                    />
                  </g>
                ))}
              </svg>

              {dropZones.map((zone) => {
                const placedItemKey = placements[zone.zoneKey];
                const placedItem = draggableItems.find(
                  (item) => item.itemKey === placedItemKey
                );

                return (
                  <div
                    key={zone.id}
                    className="drop-zone"
                    style={{
                      left: zone.left,
                      top: zone.top,
                      width: zone.width,
                      height: zone.height,
                    }}
                    onDragOver={allowDrop}
                    onDrop={(e) => handleDropOnZone(e, zone.zoneKey)}
                  >
                    {!placedItem && <span>Drop here</span>}

                    {placedItem && (
                      <div
                        className="diagram-node placed"
                        draggable
                        onDragStart={(e) =>
                          handleDragStart(e, placedItem.itemKey, zone.zoneKey)
                        }
                      >
                        {placedItem.label}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="panel-section">
            <h3>Question Object Preview</h3>
            <pre className="payload-preview">
              {JSON.stringify(questionPayload, null, 2)}
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
}