import { useCallback, useState } from "react";
import "./ResizeHandle.css";

interface ResizeHandleProps {
  direction: "horizontal" | "vertical";
  onResize: (delta: number) => void;
  onDoubleClick?: () => void;
}

export function ResizeHandle({
  direction,
  onResize,
  onDoubleClick,
}: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);

      const startX = e.clientX;
      const startY = e.clientY;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;
        onResize(direction === "horizontal" ? deltaX : deltaY);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [direction, onResize],
  );

  return (
    <div className="resize-handle-wrapper">
      <div
        role="separator"
        aria-orientation="vertical"
        tabIndex={0}
        className={`resize-handle ${direction} ${isDragging ? "dragging" : ""}`}
        onMouseDown={handleMouseDown}
        onDoubleClick={onDoubleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onDoubleClick) {
            onDoubleClick();
          }
        }}
      />
    </div>
  );
}
