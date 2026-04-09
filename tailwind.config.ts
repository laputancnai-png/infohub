import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void:       '#0A0A14',
        surface:    '#1c1c1e',
        up:         '#1aff8c',
        'up-muted': '#1aad64',
        dn:         '#ff4d6a',
        'dn-muted': '#e0364f',
      },
      borderWidth: { hairline: '0.5px' },
      backdropBlur: { glass: '20px', card: '12px' },
    },
  },
  plugins: [],
};

export default config;
