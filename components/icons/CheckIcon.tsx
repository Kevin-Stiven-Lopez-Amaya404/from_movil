import Svg, { Polyline } from "react-native-svg";

type Props = {
  /** Stroke color of the check. */
  color: string;
  /** SVG size. */
  size?: number;
};

/**
 * Reusable confirmation icon.
 *
 * Used in checkboxes and validation rules. It is a presentational component:
 * it holds no state or business logic.
 */
export function CheckIcon({ color, size = 14 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14">
      <Polyline
        points="2.4 7.4 5.5 10.3 11.8 3.7"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.2}
      />
    </Svg>
  );
}
