interface DownloadExtensionButtonProps {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const CHROME_STORE_URL =
  "https://chromewebstore.google.com/detail/gloaidjjigpehdlhlaihnekoikkbkcdp?utm_source=item-share-cb";

export function DownloadExtensionButton({
  variant = "primary",
  size = "md",
  className = "",
}: DownloadExtensionButtonProps) {
  const baseStyles =
    "inline-flex items-center gap-2 font-medium transition-colors rounded max-w-[200px]";

  const variantStyles = {
    primary: "bg-neutral-900 text-white hover:bg-neutral-800",
    secondary:
      "bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50",
  };

  const sizeStyles = {
    sm: "px-3 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-4 py-4 text-xs font-mono uppercase",
  };

  return (
    <a
      href={CHROME_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      <span className="mx-auto flex gap-2">
        Install Extension
        <iconify-icon icon="lucide:download" width="16"></iconify-icon>
      </span>
    </a>
  );
}
