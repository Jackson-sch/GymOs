"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export function useDragReposition(initialPosition: number, onCommit: (pos: number) => void) {
  const [isRepositioning, setIsRepositioning] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const [savedPosition, setSavedPosition] = useState(initialPosition);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startPos = useRef(initialPosition);

  const [prevInitialPosition, setPrevInitialPosition] = useState(initialPosition);

  if (initialPosition !== prevInitialPosition) {
    setPrevInitialPosition(initialPosition);
    setPosition(initialPosition);
    setSavedPosition(initialPosition);
  }

  const startDrag = useCallback((clientY: number) => {
    isDragging.current = true;
    startY.current = clientY;
    startPos.current = position;
  }, [position]);

  const moveDrag = useCallback((clientY: number) => {
    if (!isDragging.current) return;
    const delta = startY.current - clientY;
    const sensitivity = 0.6;
    const newPos = Math.min(100, Math.max(0, startPos.current + delta * sensitivity));
    setPosition(newPos);
  }, []);

  const endDrag = useCallback(() => {
    isDragging.current = false;
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isRepositioning) return;
    e.preventDefault();
    startDrag(e.clientY);
  }, [isRepositioning, startDrag]);

  useEffect(() => {
    if (!isRepositioning) return;
    const handleMouseMove = (e: MouseEvent) => moveDrag(e.clientY);
    const handleMouseUp = () => endDrag();
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isRepositioning, moveDrag, endDrag]);

  return {
    isRepositioning,
    position,
    enterReposition: () => { setSavedPosition(position); setIsRepositioning(true); },
    confirmReposition: () => { setIsRepositioning(false); setSavedPosition(position); onCommit(position); },
    cancelReposition: () => { setPosition(savedPosition); setIsRepositioning(false); },
    onMouseDown,
    onTouchStart: (e: React.TouchEvent) => { if (isRepositioning) startDrag(e.touches[0].clientY); },
    onTouchMove: (e: React.TouchEvent) => { if (isRepositioning) { e.preventDefault(); moveDrag(e.touches[0].clientY); } },
    onTouchEnd: () => endDrag(),
  };
}
