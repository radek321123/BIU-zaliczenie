"use client"

import Link from "next/link";

export default () => {

    return (
        <div className="login-page">
            <div className="login-page-interface">
                <form>
                    <h1>Log in</h1>
                    <label htmlFor="email">Email</label>
                    <input type="email" name="email" id="email"/>
                    <label htmlFor="password">Password</label>
                    <input type="password" name="password" id="password"/>
                    <button>Sign up</button>
                </form>
                <Link className="back-login-button" href="..">back</Link>
            </div>
        </div>
    )
};