"use client";

interface ColumnGridDiagramProps {
  landLength: number;
  landWidth: number;
  columnsX: number;
  columnsY: number;
  spacingX: number;
  spacingY: number;
  showCoordinates?: boolean;
  coordinates?: Array<{
    label: string;
    x: number;
    y: number;
    unit: string;
    type: "corner" | "edge" | "interior";
  }>;
}

export function ColumnGridDiagram({
  landLength,
  landWidth,
  columnsX,
  columnsY,
  spacingX,
  spacingY,
  showCoordinates = false,
  coordinates,
}: ColumnGridDiagramProps) {
  const padding = 48;
  const maxDrawWidth = 560;
  const maxDrawHeight = 360;
  const aspect = landLength / landWidth;

  let drawWidth = maxDrawWidth;
  let drawHeight = drawWidth / aspect;
  if (drawHeight > maxDrawHeight) {
    drawHeight = maxDrawHeight;
    drawWidth = drawHeight * aspect;
  }

  const svgWidth = drawWidth + padding * 2;
  const svgHeight = drawHeight + padding * 2 + 28;

  const scaleX = drawWidth / landLength;
  const scaleY = drawHeight / landWidth;

  const columnPositions: { x: number; y: number; type: "corner" | "edge" | "interior" }[] = [];

  for (let ix = 0; ix < columnsX; ix++) {
    for (let iy = 0; iy < columnsY; iy++) {
      const xPos = ix === 0 ? 0 : ix === columnsX - 1 ? landLength : ix * spacingX;
      const yPos = iy === 0 ? 0 : iy === columnsY - 1 ? landWidth : iy * spacingY;

      const isCorner =
        (ix === 0 || ix === columnsX - 1) && (iy === 0 || iy === columnsY - 1);
      const isEdge =
        !isCorner && (ix === 0 || ix === columnsX - 1 || iy === 0 || iy === columnsY - 1);

      columnPositions.push({
        x: padding + xPos * scaleX,
        y: padding + yPos * scaleY,
        type: isCorner ? "corner" : isEdge ? "edge" : "interior",
      });
    }
  }

  const columnColor = {
    corner: "#1d4ed8",
    edge: "#3b82f6",
    interior: "#93c5fd",
  };

  const coords = coordinates ?? [];

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-700">Column Grid Diagram — Plan View</p>
        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-blue-700" /> Corner
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-blue-500" /> Edge
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-blue-300" /> Interior
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="mx-auto max-w-full"
          role="img"
          aria-label={`Column grid diagram showing ${columnsX} by ${columnsY} columns on a ${landLength} by ${landWidth} meter site`}
        >
          {/* Site boundary */}
          <rect
            x={padding}
            y={padding}
            width={drawWidth}
            height={drawHeight}
            fill="#eff6ff"
            stroke="#1d4ed8"
            strokeWidth={2}
            rx={2}
          />

          {/* Grid lines */}
          {Array.from({ length: columnsX }).map((_, ix) => {
            const x =
              padding +
              (ix === 0 ? 0 : ix === columnsX - 1 ? landLength : ix * spacingX) * scaleX;
            return (
              <line
                key={`vx-${ix}`}
                x1={x}
                y1={padding}
                x2={x}
                y2={padding + drawHeight}
                stroke="#bfdbfe"
                strokeWidth={1}
                strokeDasharray="4 3"
              />
            );
          })}
          {Array.from({ length: columnsY }).map((_, iy) => {
            const y =
              padding +
              (iy === 0 ? 0 : iy === columnsY - 1 ? landWidth : iy * spacingY) * scaleY;
            return (
              <line
                key={`hy-${iy}`}
                x1={padding}
                y1={y}
                x2={padding + drawWidth}
                y2={y}
                stroke="#bfdbfe"
                strokeWidth={1}
                strokeDasharray="4 3"
              />
            );
          })}

          {/* Columns */}
          {columnPositions.map((col, i) => (
            <g key={i}>
              <rect
                x={col.x - 6}
                y={col.y - 6}
                width={12}
                height={12}
                fill={columnColor[col.type]}
                stroke="#1e3a8a"
                strokeWidth={1}
                rx={1}
              />
            </g>
          ))}

          {showCoordinates &&
            coords.slice(0, 120).map((c) => {
              const x = padding + c.x * scaleX;
              const y = padding + c.y * scaleY;
              return (
                <text
                  key={c.label}
                  x={x + 8}
                  y={y - 8}
                  className="fill-slate-700 text-[10px]"
                >
                  {c.label}
                </text>
              );
            })}

          {/* Dimension — length */}
          <line
            x1={padding}
            y1={padding + drawHeight + 14}
            x2={padding + drawWidth}
            y2={padding + drawHeight + 14}
            stroke="#64748b"
            strokeWidth={1}
            markerStart="url(#arrow)"
            markerEnd="url(#arrow)"
          />
          <text
            x={padding + drawWidth / 2}
            y={padding + drawHeight + 26}
            textAnchor="middle"
            className="fill-slate-600 text-[11px]"
          >
            {landLength.toFixed(1)} m
          </text>

          {/* Dimension — width */}
          <line
            x1={padding - 14}
            y1={padding}
            x2={padding - 14}
            y2={padding + drawHeight}
            stroke="#64748b"
            strokeWidth={1}
          />
          <text
            x={padding - 22}
            y={padding + drawHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90, ${padding - 22}, ${padding + drawHeight / 2})`}
            className="fill-slate-600 text-[11px]"
          >
            {landWidth.toFixed(1)} m
          </text>

          <defs>
            <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
            </marker>
          </defs>
        </svg>
      </div>

      <p className="mt-2 text-center text-xs text-slate-500">
        {columnsX} × {columnsY} grid · Spacing {spacingX.toFixed(2)} m × {spacingY.toFixed(2)} m ·{" "}
        {columnsX * columnsY} columns
      </p>
    </div>
  );
}
