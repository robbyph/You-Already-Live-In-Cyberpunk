// Set this once a donation service is chosen; both placements share this URL.
const SUPPORT_URL = "";

export default function SupportLink() {
  const label = <><span aria-hidden="true">♡</span> support this project</>;

  if (SUPPORT_URL) {
    return <a className="support-link" href={SUPPORT_URL}>{label}</a>;
  }

  return (
    <details className="support-details">
      <summary className="support-link">{label}</summary>
      <p className="mt-1 text-xs text-soft-white/70 leading-relaxed">
        thanks for your support! donation link coming soon.
      </p>
    </details>
  );
}
