import { useState } from 'react';
import PreviewFrame from './PreviewFrame';

const PREVIEW_W = 500;
const PREVIEW_H = Math.round(1080 * (PREVIEW_W / 1920));

interface Props {
  path: string;
}

export default function PathLink({ path }: Props) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  function handleMouseMove(e: React.MouseEvent) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let x = e.clientX + 16;
    let y = e.clientY - Math.round(PREVIEW_H / 2);
    if (x + PREVIEW_W > vw) x = e.clientX - PREVIEW_W - 16;
    if (y < 8) y = 8;
    if (y + PREVIEW_H > vh - 8) y = vh - PREVIEW_H - 8;
    setPos({ x, y });
  }

  return (
    <span
      className="path-link"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onMouseMove={handleMouseMove}
    >
      <a href={path} target="_blank" rel="noreferrer">{path}</a>
      {show && (
        <div
          className="path-preview"
          style={{ left: pos.x, top: pos.y }}
        >
          <PreviewFrame src={path} displayWidth={PREVIEW_W} animate />
        </div>
      )}
    </span>
  );
}
