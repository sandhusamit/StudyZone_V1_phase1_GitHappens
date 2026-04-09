import React, { useMemo, useState } from "react";
import "./styles/DiagramQuestion.css";

const draggableItems = [
  { id: "router", label: "Router" },
  { id: "dhcp", label: "DHCP Server" },
  { id: "modem", label: "Modem" },
  { id: "isp", label: "ISP Network" },
  { id: "internet", label: "Internet" },
  { id: "mobile", label: "Mobile Client\n192.168.1.25" },
  { id: "client1", label: "Client\n192.168.1.30" },
  { id: "client2", label: "Client\n192.168.1.18" },
];

const dropZones = [
  { id: "zone-dhcp", correctItemId: "dhcp", left: 30, top: 120, width: 110, height: 60 },
  { id: "zone-router", correctItemId: "router", left: 260, top: 80, width: 110, height: 60 },
  { id: "zone-modem", correctItemId: "modem", left: 390, top: 160, width: 110, height: 60 },
  { id: "zone-isp", correctItemId: "isp", left: 540, top: 110, width: 150, height: 70 },
  { id: "zone-internet", correctItemId: "internet", left: 705, top: 115, width: 75, height: 60 },
  { id: "zone-mobile", correctItemId: "mobile", left: 180, top: 305, width: 95, height: 75 },
  { id: "zone-client1", correctItemId: "client1", left: 290, top: 305, width: 105, height: 75 },
  { id: "zone-client2", correctItemId: "client2", left: 410, top: 305, width: 105, height: 75 },
];

export default function DiagramQuestion() {
  const [placements, setPlacements] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const placedItemIds = useMemo(() => Object.values(placements), [placements]);

  const availableItems = useMemo(() => {
    return draggableItems.filter((item) => !placedItemIds.includes(item.id));
  }, [placedItemIds]);

  const handleDragStart = (e, itemId, sourceZoneId = null) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ itemId, sourceZoneId })
    );
  };

  const allowDrop = (e) => {
    e.preventDefault();
  };

  const handleDropOnZone = (e, zoneId) => {
    e.preventDefault();

    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;

    const { itemId, sourceZoneId } = JSON.parse(raw);

    setPlacements((prev) => {
      const updated = { ...prev };

      if (sourceZoneId) {
        delete updated[sourceZoneId];
      }

      for (const key of Object.keys(updated)) {
        if (updated[key] === itemId) {
          delete updated[key];
        }
      }

      updated[zoneId] = itemId;
      return updated;
    });
  };

  const handleDropBackToBank = (e) => {
    e.preventDefault();

    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;

    const { sourceZoneId } = JSON.parse(raw);
    if (!sourceZoneId) return;

    setPlacements((prev) => {
      const updated = { ...prev };
      delete updated[sourceZoneId];
      return updated;
    });
  };

  const checkAnswers = () => {
    setSubmitted(true);
  };

  const resetAll = () => {
    setPlacements({});
    setSubmitted(false);
  };

  const getZoneStatus = (zone) => {
    const placedItemId = placements[zone.id];
    if (!submitted || !placedItemId) return "";
    return placedItemId === zone.correctItemId ? "correct" : "wrong";
  };

  const score = submitted
    ? dropZones.filter((zone) => placements[zone.id] === zone.correctItemId).length
    : 0;

  const renderPlacedLabel = (zone) => {
    const itemId = placements[zone.id];
    if (!itemId) return null;

    const item = draggableItems.find((x) => x.id === itemId);
    if (!item) return null;

    return (
      <div
        className={`diagram-node placed ${submitted ? getZoneStatus(zone) : ""}`}
        draggable
        onDragStart={(e) => handleDragStart(e, item.id, zone.id)}
      >
        {item.label.split("\n").map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    );
  };

  return (
    <div className="diagram-question-page">
      <h2>Diagram Labeling Question</h2>
      <p className="diagram-instructions">
        Drag each label into the correct spot on the network diagram.
      </p>

      <div
        className="label-bank"
        onDragOver={allowDrop}
        onDrop={handleDropBackToBank}
      >
        <h3>Labels</h3>
        <div className="label-bank-items">
          {availableItems.map((item) => (
            <div
              key={item.id}
              className="diagram-node"
              draggable
              onDragStart={(e) => handleDragStart(e, item.id, null)}
            >
              {item.label.split("\n").map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="diagram-canvas-wrapper">
        <div className="diagram-title">Step One: Client Connection to Internet</div>

        <div className="diagram-canvas">
          <svg className="diagram-svg" viewBox="0 0 800 420" preserveAspectRatio="none">
            {/* DHCP -> Router */}
            <line x1="140" y1="150" x2="260" y2="110" className="diagram-line" />
            {/* Router -> Modem */}
            <line x1="370" y1="110" x2="390" y2="190" className="diagram-line" />
            {/* Modem -> ISP */}
            <line x1="500" y1="190" x2="540" y2="145" className="diagram-line" />
            {/* ISP -> Internet */}
            <line x1="690" y1="145" x2="705" y2="145" className="diagram-line" />

            {/* Router down to LAN */}
            <line x1="315" y1="140" x2="315" y2="275" className="diagram-line" />
            <line x1="200" y1="275" x2="450" y2="275" className="diagram-line" />

            {/* LAN to devices */}
            <line x1="225" y1="275" x2="225" y2="305" className="diagram-line" />
            <line x1="340" y1="275" x2="340" y2="305" className="diagram-line" />
            <line x1="460" y1="275" x2="460" y2="305" className="diagram-line" />

            {/* Arrowheads approximation with tiny lines */}
            <polyline points="252,106 260,110 255,118" className="diagram-line" />
            <polyline points="382,180 390,190 379,189" className="diagram-line" />
            <polyline points="531,151 540,145 538,156" className="diagram-line" />
            <polyline points="697,138 705,145 696,152" className="diagram-line" />
          </svg>

          {dropZones.map((zone) => (
            <div
              key={zone.id}
              className={`drop-zone ${submitted ? getZoneStatus(zone) : ""}`}
              style={{
                left: zone.left,
                top: zone.top,
                width: zone.width,
                height: zone.height,
              }}
              onDragOver={allowDrop}
              onDrop={(e) => handleDropOnZone(e, zone.id)}
            >
              {!placements[zone.id] && <span className="drop-zone-placeholder">Drop here</span>}
              {renderPlacedLabel(zone)}
            </div>
          ))}

          <div className="lan-box-label">LAN: 192.168.1.x</div>
        </div>
      </div>

      <div className="diagram-actions">
        <button onClick={checkAnswers}>Check Answer</button>
        <button onClick={resetAll} className="secondary-btn">
          Reset
        </button>
      </div>

      {submitted && (
        <div className="diagram-result">
          Score: {score} / {dropZones.length}
        </div>
      )}
    </div>
  );
}