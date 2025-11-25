/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                neon: {
                    blue: '#00f3ff',
                    pink: '#ff00ff',
                    purple: '#bc13fe',
                    green: '#0aff00',
                },
                dark: {
                    bg: '#0a0a0a',
                    surface: '#1a1a1a',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
