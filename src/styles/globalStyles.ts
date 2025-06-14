import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  primary: '#144E7A',    // Main blue color
  secondary: '#FF9A33',  // Orange color
  white: '#FFFFFF',
  black: '#000000',
  gray: '#666666',
  lightGray: '#CCCCCC',
};

export const FONTS = {
  regular: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  medium: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  bold: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: 1.5,
  },
};

export const SIZES = {
  // Global sizes
  base: 8,
  small: 12,
  font: 14,
  medium: 16,
  large: 18,
  extraLarge: 24,

  // Screen dimensions
  width,
  height,

  // Spacing
  padding: {
    small: width * 0.02,
    medium: width * 0.04,
    large: width * 0.06,
  },
  margin: {
    small: height * 0.01,
    medium: height * 0.02,
    large: height * 0.03,
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
  input: {
    color: COLORS.white,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.white,
    paddingVertical: 8,
    fontSize: SIZES.font,
  },
  button: {
    width: width * 0.55,
    paddingVertical: height * 0.02,
    borderRadius: 24,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.secondary,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  label: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    marginBottom: 8,
  },
}); 