import './scss/styles.css'

export const metadata = {
    title: "BIU",
    description: "Zaawansowane todo",
};

export default function RootLayout({children}) {
    return (
        <html
            lang="en"
        >
        <body>
        {children}
        </body>
        </html>
    );
}
