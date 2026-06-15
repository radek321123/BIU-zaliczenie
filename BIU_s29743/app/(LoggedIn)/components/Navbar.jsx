import Link from "next/link";

export default function Navbar() {


    return (
        <nav>
            <div className="navbar-left">
                <Link href="/tasks">
                    all tasks
                </Link>
                <Link href="/add_task">
                    add task
                </Link>
            </div>
            <div className="navbar-right">
                <Link href="/">
                    logout
                </Link>
                <Link href="/profile">
                    profile
                </Link>
            </div>
        </nav>
    )
}