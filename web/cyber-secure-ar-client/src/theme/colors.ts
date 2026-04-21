/**
 * 🎨 CyberSecure AR - Design System
 * Tema moderno com paleta de cores segurança operacional
 */

export const colors = {
  // Cores Primárias
  primary: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C3D66',
  },

  // Cores Secundárias (Verde Esmeralda)
  secondary: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#145231',
  },

  // Cores de Alerta
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FCD34D',
    300: '#FCA5A5',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Cores de Perigo
  danger: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // Cores de Sucesso
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#145231',
  },

  // Cores Neutras
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Dark Mode (Default)
  dark: {
    bg: {
      primary: '#0F172A',
      secondary: '#1E293B',
      tertiary: '#334155',
    },
    text: {
      primary: '#F3F4F6',
      secondary: '#CBD5E1',
      muted: '#94A3B8',
    },
    border: '#475569',
  },
};

/**
 * Theme CSS Variables
 * Para usar em CSS: var(--color-primary-600)
 */
export const generateCSSVariables = () => {
  let css = ':root {\n';

  Object.entries(colors).forEach(([category, shades]) => {
    if (typeof shades === 'object' && !Array.isArray(shades)) {
      Object.entries(shades).forEach(([shade, value]) => {
        css += `  --color-${category}-${shade}: ${value};\n`;
      });
    }
  });

  css += '}\n';
  return css;
};
