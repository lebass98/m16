import type { TableSection } from '../types';

interface Props {
  sections: TableSection[];
}

export default function BottomNav({ sections }: Props) {
  function handleNavClick(sectionIndex: number) {
    const el = document.getElementById(`section-${sectionIndex}`);
    if (!el) return;
    el.classList.remove('index-section--clicked');
    void el.offsetWidth;
    el.classList.add('index-section--clicked');
  }

  return (
    <div className="index-bottom">
      <div className="index-links">
        <div className="index-links__inner">
          {sections.map((section, i) => (
            <a
              key={i}
              href={`#section-${i}`}
              onClick={() => handleNavClick(i)}
            >
              {section.depth1}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
