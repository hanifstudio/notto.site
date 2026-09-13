import Image from "next/image";
import Link from "next/link";

export function Wordmark() {
  return (
    <Link className="wordmark" href="/" aria-label="Notto home">
      <Image src="/notto-logo-negative.png" alt="Notto" width={96} height={24} priority />
    </Link>
  );
}
