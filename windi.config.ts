import { defineConfig } from 'windicss/helpers'

export default defineConfig({
  preflight: false,
  attributify: true,
  extract: {
    include: ['**/*.{jsx,tsx,css}'],
    exclude: ['node_modules', '.git', '.next']
  },
  theme: {
    extend: {
      colors: {
        page: '#f1f2f2',
        main: '#cb8158',
        lightMain: '#f3ccb6',
        darkMain: '#A7570F',
        red: '#ff4d4f',
        lightRed: '#fff1f0',
        green: '#00c29e',
        lightGreen: '#e6f9f5',
        orange: '#f9761a',
        lightOrange: '#f9761a1a',
        secondText: '#4C506B',
        border: '#e7e7e7'
      },
      spacing: {
        fit: 'fit-content',
        4: '4px',
        8: '8px',
        12: '12px',
        16: '16px',
        24: '24px',
        32: '32px'
      },
      borderRadius: {
        4: '4px',
        8: '8px',
        12: '12px'
      },
      lineHeight: {
        24: '24px',
        32: '32px'
      }
    },
    fontSize: {
      12: '12px',
      14: '14px',
      16: '16px',
      24: '24px'
    }
  },
  shortcuts: {
    flexCenter: 'flex justify-center items-center',
    ellipsis: 'w-full whitespace-nowrap overflow-hidden overflow-ellipsis'
  }
})
