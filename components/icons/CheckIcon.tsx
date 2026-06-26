import Svg, { Polyline } from "react-native-svg";

type Props = {
  color?: string;
  size?: number;
};

export function CheckIcon({ color = "#FFFFFF", size = 14 }: Props) {
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
