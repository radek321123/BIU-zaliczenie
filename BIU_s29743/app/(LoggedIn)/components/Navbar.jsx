import Link from "next/link";

export default function Navbar() {


    return (
        <nav>
            <div>
                <Link href="/">
                    logout
                </Link>
                <Link href="/profile">
                    profile
                </Link>
                <Link href="/tasks">
                    tasks
                </Link>
                <Link href="/add_task">
                    add task
                </Link>
            </div>
        </nav>
    )
}