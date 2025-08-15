import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  primary: '#144E7A',    // Main blue color
  secondary: '#FF9A33',  // Orange color
  white: '#FFFFFF',
  black: '#000000',
  gray: '#666666',
  lightGray: '#CCCCCC',
  success: '#4CAF50',    // Green color for success states
};

export const FONTS = {
  regular: {
    fontSize: Math.max(16, 14), // Responsive font size
    fontWeight: '400' as const,
  },
  medium: {
    fontSize: Math.max(16, 14), // Responsive font size
    fontWeight: '500' as const,
  },
  bold: {
    fontSize: Math.max(16, 14), // Responsive font size
    fontWeight: '700' as const,
  },
  title: {
    fontSize: Math.max(24, 20), // Responsive font size
    fontWeight: '700' as const,
    letterSpacing: 1.5,
  },
};

export const SIZES = {
  // Global sizes - responsive with minimums
  base: Math.max(8, 6),
  small: Math.max(12, 10),
  font: Math.max(14, 12),
  medium: Math.max(16, 14),
  large: Math.max(18, 16),
  extraLarge: Math.max(24, 20),

  // Screen dimensions
  width,
  height,

  // Spacing - responsive with minimums
  padding: {
    small: Math.max(width * 0.02, 8),
    medium: Math.max(width * 0.04, 12),
    large: Math.max(width * 0.06, 16),
  },
  margin: {
    small: Math.max(height * 0.01, 8),
    medium: Math.max(height * 0.02, 12),
    large: Math.max(height * 0.03, 16),
  },
};

export const SHADOWS = {
  light: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 4,
  },
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLogo: {
    height: Math.max(height * 0.1, 60), // Responsive with minimum
    marginBottom: SIZES.margin.large,
  },
  headerLogo: {
    height: Math.max(height * 0.04, 30), // Responsive with minimum
    marginTop: SIZES.margin.large,
    marginBottom: SIZES.margin.small,
    width: Math.min(width * 0.4, 150), // Responsive with maximum
  },
  input: {
    color: COLORS.white,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.white,
    paddingVertical: Math.max(8, 6), // Responsive padding
    fontSize: Math.max(SIZES.font, 12), // Responsive font size
    minHeight: 44, // Ensure minimum touch target size
  },
  button: {
    width: Math.min(width * 0.55, 200), // Responsive width with maximum
    paddingVertical: Math.max(height * 0.02, 16), // Responsive padding with minimum
    borderRadius: 24,
    alignItems: 'center',
    minHeight: 48, // Ensure minimum touch target size
  },
  primaryButton: {
    backgroundColor: COLORS.secondary,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: Math.max(SIZES.medium, 14), // Responsive font size
    fontWeight: 'bold',
    textAlign: 'center', // Ensure text is centered
  },
  label: {
    color: COLORS.white,
    fontSize: Math.max(SIZES.medium, 14), // Responsive font size
    marginBottom: Math.max(8, 6), // Responsive margin
    fontWeight: '600',
  },
}); 