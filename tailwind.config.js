/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-canvas)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          elevated: 'var(--color-surface-elevated)',
        },
        border: {
          subtle: 'var(--color-border-subtle)',
          accent: 'var(--color-border-accent)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
        },
        primer: {
          text: {
            primary: 'var(--color-text-primary)',
            secondary: 'var(--color-text-secondary)',
            muted: 'var(--color-text-muted)',
          },
          state: {
            success: 'var(--color-success)',
            danger: 'var(--color-danger)',
            warning: 'var(--color-warning)',
          }
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Merriweather', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'Menlo', 'monospace'],
      },
      minHeight: {
        'dvh': '100dvh',
      },
      height: {
        'dvh': '100dvh',
      }
    },
  },
  plugins: [],
}

