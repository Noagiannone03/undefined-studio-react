/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                lilac: '#E6E6FA',
                lavender: '#DCD0FF',
                black: '#000000',
                white: '#FFFFFF',
            },
            fontFamily: {
                display: ['"Archivo Black"', 'sans-serif'],
                body: ['"DM Sans"', 'sans-serif'],
            },
            borderWidth: {
                '3': '3px',
            },
            boxShadow: {
                'hard': '4px 4px 0px 0px #000000',
                'hard-sm': '2px 2px 0px 0px #000000',
            },
        },
    },
    plugins: [],
}
