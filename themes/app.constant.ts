import { Dimensions, Platform } from "react-native";

// Get screen dimensions
const { width, height } = Dimensions.get("window");

// Check if device is an iPad
export const IsIPAD = Platform.OS === "ios" && Math.min(width, height) >= 768;

// Window dimensions for responsive UI
export const windowWidth = (size: number) => (width * size) / 414;
export const windowHeight = (size: number) => (height * size) / 896;

// Font sizes for responsive text
export const fontSizes = {
  FONT10: windowWidth(10),
  FONT12: windowWidth(12),
  FONT14: windowWidth(14),
  FONT16: windowWidth(16),
  FONT18: windowWidth(18),
  FONT20: windowWidth(20),
  FONT22: windowWidth(22),
  FONT24: windowWidth(24),
  FONT26: windowWidth(26),
  FONT28: windowWidth(28),
  FONT30: windowWidth(30),
  FONT32: windowWidth(32),
}; 