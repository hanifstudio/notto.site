import Script from "next/script";

export function UmamiAnalytics() {
  return (
    <Script
      async
      src="https://cloud.umami.is/script.js"
      data-website-id="d4d9db45-f8af-4f20-951e-b7937c28648d"
      strategy="afterInteractive"
    />
  );
}
