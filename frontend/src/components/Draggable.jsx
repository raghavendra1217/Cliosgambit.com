import React, { useRef, useState, useEffect } from 'react';

const Draggable = ({ children, className = '', style = {} }) => {
  const nodeRef = useRef(null);
  const [pos, setPos] = useState({ x: 100, y: 100 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Mouse events
  const onMouseDown = (e) => {
    // Only left mouse button
    if (e.button !== 0) return;
    // Prevent drag if clicking on a button or input
    if (e.target.closest('button, input, textarea, select, [data-nodrag]')) return;
    setDragging(true);
    setOffset({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    });
  };

  const onMouseMove = (e) => {
    if (!dragging) return;
    setPos({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  const onMouseUp = () => setDragging(false);

  // Touch events
  const onTouchStart = (e) => {
    if (e.target.closest('button, input, textarea, select, [data-nodrag]')) return;
    const touch = e.touches[0];
    setDragging(true);
    setOffset({
      x: touch.clientX - pos.x,
      y: touch.clientY - pos.y,
    });
  };

  const onTouchMove = (e) => {
    if (!dragging) return;
    const touch = e.touches[0];
    setPos({
      x: touch.clientX - offset.x,
      y: touch.clientY - offset.y,
    });
  };

  const onTouchEnd = () => setDragging(false);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onTouchEnd);
    } else {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };

  }, [dragging, offset]);

  return (
    <div
      ref={nodeRef}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      className={className}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        cursor: dragging ? 'grabbing' : 'grab',
        zIndex: 2000,
        userSelect: 'none',
        touchAction: 'none',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default Draggable; 