import Svg, { Path } from "react-native-svg";

type Props = {
  size?: number;
};

export function GoogleIcon({ size = 24 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        fill="#EA4335"
        d="M24 9.5c3.1 0 5.6 1.1 7.6 2.9l5.7-5.7C33.7 3.5 29.2 1.5 24 1.5 14.9 1.5 7.2 7 3.8 14.8l6.6 5.1C12.1 13.5 17.6 9.5 24 9.5z"
      />
      <Path
        fill="#4285F4"
        d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.5c-.5 2.8-2.1 5.2-4.5 6.8l7 5.4C43.2 36.7 46.1 31 46.1 24.5z"
      />
      <Path
        fill="#FBBC05"
        d="M10.4 28.6A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.1.8-4.6L3.8 14.3A23 23 0 0 0 1 24c0 3.7.9 7.2 2.5 10.3l6.9-5.7z"
      />
      <Path
        fill="#34A853"
        d="M24 46.5c5.3 0 9.8-1.8 13.1-4.7l-7-5.4c-1.8 1.2-4.1 2-6.1 2-6.4 0-11.8-4.3-13.7-10.1l-6.6 5.1C7.2 41 14.9 46.5 24 46.5z"
      />
    </Svg>
  );
}
