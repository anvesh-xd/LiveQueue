type MarqueeProps = {
  items: string[];
  variant?: 'default' | 'strobe';
};

export function Marquee({ items, variant = 'default' }: MarqueeProps) {
  const doubled = [...items, ...items];
  return (
    <div className={`marquee ${variant === 'strobe' ? 'marquee--strobe' : ''}`}>
      <div className="marquee__track" aria-hidden="false">
        {doubled.map((item, i) => (
          <span key={`${item}-${i}`} className="marquee__item">
            <span className="marquee__star" aria-hidden="true" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
