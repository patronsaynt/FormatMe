import { useUI } from "../../store/uiStore";
import logoDark from "../../assets/logos/wordmark-dark.png";
import logoLight from "../../assets/logos/wordmark-light.png";

interface LogoProps {
  className?: string;
  height?: number;
}

/** Theme-aware wordmark: dark logo on light backgrounds, light logo on dark backgrounds. */
export function Logo({ className, height = 22 }: LogoProps) {
  const theme = useUI((s) => s.theme);
  const src = theme === "dark" ? logoLight : logoDark;
  return <img src={src} alt="FormatMe" height={height} className={className} style={{ height }} />;
}
