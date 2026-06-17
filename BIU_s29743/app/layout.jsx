import './scss/styles.css'
import {UsersProvider} from "./contexts/UsersContext";

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
            <UsersProvider>
                {children}
            </UsersProvider>
        </body>
        </html>
);
}
