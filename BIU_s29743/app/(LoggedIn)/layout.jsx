import Navbar from "./components/Navbar";

export default ({children}) => {
    return (
        <>
            <Navbar />
            {children}
        </>
    )
}
