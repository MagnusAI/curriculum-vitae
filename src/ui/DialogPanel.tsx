import { useEffect, useRef } from 'react';
import { DialogContent } from '../game/events';

interface DialogPanelProps {
  content: DialogContent;
  onClose: () => void;
  isTouch: boolean;
}

const CLOSE_KEYS = new Set(['Escape', 'KeyE', 'Enter', 'Space']);

export function DialogPanel({ content, onClose, isTouch }: DialogPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (CLOSE_KEYS.has(e.code)) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div
        ref={panelRef}
        className="pixel-panel dialog-panel"
        role="dialog"
        aria-modal="true"
        aria-label={content.title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-header">
          {content.icon && <span className="dialog-icon">{content.icon}</span>}
          <div>
            <h2 className="dialog-title">{content.title}</h2>
            {content.subtitle && <p className="dialog-subtitle">{content.subtitle}</p>}
          </div>
          <button className="dialog-close" onClick={onClose} aria-label="Close dialog">
            ✕
          </button>
        </div>
        <div className="dialog-body">
          {content.sections.map((section, i) => (
            <div className="dialog-section" key={i}>
              {section.heading && <h3>{section.heading}</h3>}
              {section.meta && <p className="dialog-meta">{section.meta}</p>}
              {section.lines?.map((line, j) => <p key={j}>{line}</p>)}
              {section.tags && (
                <div className="dialog-tags">
                  {section.tags.map((tag) => (
                    <span className="dialog-tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="dialog-hint">{isTouch ? 'tap outside to close' : 'E / Esc to close'}</div>
      </div>
    </div>
  );
}
