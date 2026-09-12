import Link from "next/link";

export function Wordmark() {
  return (
    <Link className="wordmark" href="/" aria-label="Orbie home">
      <span className="orb" aria-hidden="true" />
      <span>Orbie</span>
    </Link>
  );
}
