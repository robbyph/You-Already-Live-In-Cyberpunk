const SUPPORT_URL = "https://ko-fi.com/robbyhoover";

export default function SupportLink() {
  const label = <><span aria-hidden="true">♡</span> support this project</>;

  return (
    <a className="support-link" href={SUPPORT_URL} target="_blank" rel="noopener noreferrer">
      {label}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
