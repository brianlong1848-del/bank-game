const DragHandle = () => (
  <div style={{
    display: 'flex', flexDirection: 'column', gap: 4,
    padding: '6px 8px', cursor: 'grab', opacity: 0.45, flexShrink: 0,
    touchAction: 'none',
  }}>
    <div style={{ width: 20, height: 2.5, background: T.text, borderRadius: 2 }} />
    <div style={{ width: 20, height: 2.5, background: T.text, borderRadius: 2 }} />
    <div style={{ width: 20, height: 2.5, background: T.text, borderRadius: 2 }} />
  </div>
);

function DraggablePlayerList({ names, setNames }) {
  const [dragIdx, setDragIdx] = useState(null);
  const [dragY, setDragY] = useState(0);
  const [startY, setStartY] = useState(0);
  const [itemHeight, setItemHeight] = useState(56);
  const containerRef = useRef(null);
  const itemRefs = useRef([]);

  const onPointerDown = (e, i) => {
    e.preventDefault();
    const el = itemRefs.current[i];
    if (el) setItemHeight(el.getBoundingClientRect().height + 7);
    setDragIdx(i);
    setStartY(e.clientY);
    setDragY(0);

    const onMove = (ev) => {
      const dy = ev.clientY - e.clientY;
      setDragY(dy);

      // Figure out which slot we've dragged into
      const newIdx = Math.max(0, Math.min(
        names.length - 1,
        i + Math.round(dy / itemHeight)
      ));

      if (newIdx !== i) {
        setNames(prev => {
          const next = [...prev];
          const [moved] = next.splice(i, 1);
          next.splice(newIdx, 0, moved);
          return next;
        });
        // Update anchor so delta stays smooth
        e.clientY = e.clientY + (newIdx - i) * itemHeight;
        // update i reference
        i = newIdx;
        setDragIdx(newIdx);
        setDragY(0);
      }
    };

    const onUp = () => {
      setDragIdx(null);
      setDragY(0);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <div ref={containerRef}>
      {names.map((n, i) => {
        const isDragging = dragIdx === i;
        return (
          <div
            key={n + i}
            ref={el => itemRefs.current[i] = el}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '11px 10px 11px 4px', marginBottom: 7, borderRadius: 12,
              background: isDragging ? T.s3 : T.s2,
              border: `1px solid ${isDragging ? T.gold : T.border}`,
              transform: isDragging ? `translateY(${dragY}px) scale(1.02)` : 'translateY(0) scale(1)',
              boxShadow: isDragging ? `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${T.gGlow}` : 'none',
              transition: isDragging ? 'box-shadow 0.15s, border 0.15s' : 'transform 0.18s ease, box-shadow 0.15s',
              position: 'relative',
              zIndex: isDragging ? 10 : 1,
              touchAction: 'none',
            }}
          >
            <div
              onPointerDown={e => onPointerDown(e, i)}
              style={{ touchAction: 'none', cursor: 'grab' }}
            >
              <DragHandle />
            </div>
            <span style={{ color: T.sub, fontSize: 12, minWidth: 18, textAlign: 'center' }}>{i + 1}</span>
            <span style={{ flex: 1, fontWeight: 600, fontSize: 15 }}>{n}</span>
            <IBtn danger onClick={() => setNames(a => a.filter((_, j) => j !== i))}>✕</IBtn>
          </div>
        );
      })}
    </div>
  );
}