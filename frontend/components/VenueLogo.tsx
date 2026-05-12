type VenueLogoProps = {
  name: string;
  logoUrl: string | null;
  variant?: 'card' | 'list';
};

export function VenueLogo({ name, logoUrl, variant = 'card' }: VenueLogoProps) {
  if (!logoUrl) return null;
  const cls = variant === 'list' ? 'venue-card__logo venue-card__logo--list' : 'venue-card__logo';
  return (
    <div className={cls}>
      <img src={logoUrl} alt={`${name} logo`} />
    </div>
  );
}
