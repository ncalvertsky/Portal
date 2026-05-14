import { useTheme } from "../../ThemeContext";
import SkyOSLogo from "./SkyOSLogo";
import FractalLogo from "./FractalLogo";
import OutpaveLogo from "./OutpaveLogo";
import SilviLogo from "./SilviLogo";

/**
 * Brand-aware logo: renders the wordmark for whichever brand is currently
 * active in the theme context. Use this instead of the per-brand logo
 * components so cycling brands at runtime swaps the logo too.
 *
 * The `white-label` brand mode renders the uploaded logo from
 * FractalSettings if one exists for the current theme (light/dark);
 * otherwise it falls back to the seeded Silvi Materials mark.
 */
export default function BrandLogo({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const { brand, theme, whiteLabelTheme } = useTheme();
  if (brand === "fractal") return <FractalLogo className={className} />;
  if (brand === "outpave") return <OutpaveLogo className={className} style={style} />;
  if (brand === "white-label") {
    // Pick the right uploaded logo for the current theme. If one isn't
    // uploaded for this mode, fall through to the seeded Silvi mark so the
    // header doesn't go blank.
    const uploaded = theme === "dark" ? whiteLabelTheme?.darkLogo : whiteLabelTheme?.lightLogo;
    if (uploaded) {
      // Mirror SilviLogo's default sizing (h-[52px] w-auto) so the image
      // doesn't render at its full natural pixel dimensions when callers
      // don't pass a size className. Caller-supplied className still wins
      // because it's appended last.
      return (
        <img
          src={uploaded}
          alt="Brand logo"
          className={`h-[52px] w-auto object-contain ${className}`}
          style={style}
        />
      );
    }
    return <SilviLogo className={className} style={style} />;
  }
  return <SkyOSLogo className={className} style={style} />;
}
