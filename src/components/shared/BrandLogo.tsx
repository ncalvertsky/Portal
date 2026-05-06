import { useTheme } from "../../ThemeContext";
import SkyOSLogo from "./SkyOSLogo";
import FractalLogo from "./FractalLogo";
import OutpaveLogo from "./OutpaveLogo";

/**
 * Brand-aware logo: renders the wordmark for whichever brand is currently
 * active in the theme context. Use this instead of the per-brand logo
 * components so cycling brands at runtime swaps the logo too.
 */
export default function BrandLogo({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const { brand } = useTheme();
  if (brand === "fractal") return <FractalLogo className={className} />;
  if (brand === "outpave") return <OutpaveLogo className={className} style={style} />;
  return <SkyOSLogo className={className} style={style} />;
}
