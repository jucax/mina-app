import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions for design (assuming design was made for a standard phone)
const baseWidth = 375;
const baseHeight = 812;

// Responsive scaling functions
export const scale = (size: number): number => {
  const newSize = size * (SCREEN_WIDTH / baseWidth);
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const verticalScale = (size: number): number => {
  const newSize = size * (SCREEN_HEIGHT / baseHeight);
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const moderateScale = (size: number, factor = 0.5): number => {
  const newSize = size + (scale(size) - size) * factor;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Responsive sizing with minimums and maximums
export const responsiveSize = (
  size: number,
  minSize?: number,
  maxSize?: number
): number => {
  let responsiveSize = moderateScale(size);
  
  if (minSize !== undefined) {
    responsiveSize = Math.max(responsiveSize, minSize);
  }
  
  if (maxSize !== undefined) {
    responsiveSize = Math.min(responsiveSize, maxSize);
  }
  
  return responsiveSize;
};

// Responsive width percentage with constraints
export const responsiveWidth = (
  percentage: number,
  minWidth?: number,
  maxWidth?: number
): number => {
  let width = SCREEN_WIDTH * (percentage / 100);
  
  if (minWidth !== undefined) {
    width = Math.max(width, minWidth);
  }
  
  if (maxWidth !== undefined) {
    width = Math.min(width, maxWidth);
  }
  
  return width;
};

// Responsive height percentage with constraints
export const responsiveHeight = (
  percentage: number,
  minHeight?: number,
  maxHeight?: number
): number => {
  let height = SCREEN_HEIGHT * (percentage / 100);
  
  if (minHeight !== undefined) {
    height = Math.max(height, minHeight);
  }
  
  if (maxHeight !== undefined) {
    height = Math.min(height, maxHeight);
  }
  
  return height;
};

// Font size scaling with accessibility considerations
export const responsiveFontSize = (
  size: number,
  minSize?: number,
  maxSize?: number
): number => {
  // Get the system font scale factor
  const fontScale = PixelRatio.getFontScale();
  
  // Apply responsive scaling
  let responsiveSize = moderateScale(size);
  
  // Apply system font scale (respects user's accessibility settings)
  responsiveSize = responsiveSize * fontScale;
  
  // Apply constraints
  if (minSize !== undefined) {
    responsiveSize = Math.max(responsiveSize, minSize);
  }
  
  if (maxSize !== undefined) {
    responsiveSize = Math.min(responsiveSize, maxSize);
  }
  
  return Math.round(responsiveSize);
};

// Spacing utilities
export const responsiveSpacing = {
  xs: responsiveSize(4, 3, 6),
  sm: responsiveSize(8, 6, 12),
  md: responsiveSize(16, 12, 20),
  lg: responsiveSize(24, 18, 30),
  xl: responsiveSize(32, 24, 40),
  xxl: responsiveSize(48, 36, 60),
};

// Touch target sizes (following accessibility guidelines)
export const touchTargets = {
  small: responsiveSize(32, 28, 40),
  medium: responsiveSize(44, 40, 48),
  large: responsiveSize(48, 44, 56),
};

// Border radius scaling
export const responsiveBorderRadius = {
  small: responsiveSize(4, 3, 6),
  medium: responsiveSize(8, 6, 12),
  large: responsiveSize(16, 12, 20),
  xl: responsiveSize(24, 18, 30),
  round: responsiveSize(50, 40, 60),
};

// Icon sizes
export const responsiveIconSize = {
  xs: responsiveSize(12, 10, 16),
  sm: responsiveSize(16, 14, 20),
  md: responsiveSize(20, 18, 24),
  lg: responsiveSize(24, 20, 28),
  xl: responsiveSize(32, 28, 36),
  xxl: responsiveSize(48, 40, 56),
};

// Screen dimensions
export const screenDimensions = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmallDevice: SCREEN_WIDTH < 375,
  isMediumDevice: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
  isLargeDevice: SCREEN_WIDTH >= 414,
  isTablet: SCREEN_WIDTH >= 768,
};

// Responsive padding and margin
export const responsiveLayout = {
  padding: {
    xs: responsiveSpacing.xs,
    sm: responsiveSpacing.sm,
    md: responsiveSpacing.md,
    lg: responsiveSpacing.lg,
    xl: responsiveSpacing.xl,
  },
  margin: {
    xs: responsiveSpacing.xs,
    sm: responsiveSpacing.sm,
    md: responsiveSpacing.md,
    lg: responsiveSpacing.lg,
    xl: responsiveSpacing.xl,
  },
  gap: {
    xs: responsiveSpacing.xs,
    sm: responsiveSpacing.sm,
    md: responsiveSpacing.md,
    lg: responsiveSpacing.lg,
    xl: responsiveSpacing.xl,
  },
};

// Utility function to create responsive styles
export const createResponsiveStyle = (
  baseStyle: any,
  responsiveOverrides: any
) => {
  return {
    ...baseStyle,
    ...responsiveOverrides,
  };
};

export default {
  scale,
  verticalScale,
  moderateScale,
  responsiveSize,
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
  responsiveSpacing,
  touchTargets,
  responsiveBorderRadius,
  responsiveIconSize,
  screenDimensions,
  responsiveLayout,
  createResponsiveStyle,
}; 