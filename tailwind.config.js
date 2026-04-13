/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                paper: '#EEE9DA',
                'paper-2': '#E0DACA',
                ink: '#0A0A0A',
                klein: '#1D1DBF',
                tomato: '#E84A2A',
                'ink-soft': 'rgba(10,10,10,0.62)',
                'ink-mute': 'rgba(10,10,10,0.38)',
                line: 'rgba(10,10,10,0.14)',

                // legacy aliases
                electric: '#1D1DBF',
                sun: '#E84A2A',
                acid: '#1D1DBF',
                pink: '#E84A2A',
                sky: '#1D1DBF',
                violet: '#1D1DBF',
                'pop-cream': '#EEE9DA',
                'pop-black': '#0A0A0A',
                'pop-coral': '#E84A2A',
                'pop-pink': '#E84A2A',
                'pop-mint': '#1D1DBF',
                'pop-yellow': '#E84A2A',
                'pop-indigo': '#1D1DBF',
            },
            fontFamily: {
                display: ['"Archivo Black"', '"Archivo"', 'sans-serif'],
                body: ['"Satoshi"', 'sans-serif'],
                serif: ['"Boska"', '"Fraunces"', 'serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
            },
        },
    },
    plugins: [],
}
