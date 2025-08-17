import React from 'react';

export const Brand: React.FC<{ className?: string }> = ({ className }) => (
  <span className={`text-pink-600 uppercase ${className ?? ''}`.trim()}>EVOLAINE</span>
);

export function renderWithBrand(text: string | undefined | null): React.ReactNode {
  if (!text) return null;
  const parts = text.split(/(EVOLAINE)/gi);
  return (
    <>
      {parts.map((part, idx) => {
        if (/^EVOLAINE$/i.test(part)) {
          return <Brand key={`brand-${idx}`} />;
        }
        return <React.Fragment key={`txt-${idx}`}>{part}</React.Fragment>;
      })}
    </>
  );
}
