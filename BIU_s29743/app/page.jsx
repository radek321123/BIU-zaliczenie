import Link from "next/link";

export default function Home() {
    return (
        <div className="login-page">
            <div className="login-page-interface">
                <div className="login-part">
                    <h4 className="cormorant">The most Advanced </h4>
                    <h1 className="cormorant">Todo App</h1>
                </div>
                <div className="login-part">
                    <Link href="/login">
                        login
                    </Link>
                </div>
                <div className="login-part">
                    <Link href="/signup">
                        signup
                    </Link>
                </div>
            </div>
        </div>
    );
}
