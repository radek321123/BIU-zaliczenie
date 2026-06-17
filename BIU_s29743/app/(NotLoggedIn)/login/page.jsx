"use client"
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import {useUsers} from "../../contexts/UsersContext";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending}>
            {pending ? "Logging in…" : "Login"}
        </button>
    );
}

export default () => {

    const router = useRouter();
    const {dispatch} = useUsers();

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .email("Invalid email address")
                .required("Email is required"),
            password: Yup.string()
                .required("Password is required"),
        }),
        onSubmit: async (values, { setStatus }) => {
            setStatus(undefined);
            try {
                const res = await fetch("/api/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: values.email,
                        password: values.password,
                        action: "login"
                    }),
                });

                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    throw new Error(data.error || "Login failed");
                }

                dispatch({
                    type: "LOGIN_USER",
                    payload: data.user,
                });

                router.push("/profile");
            } catch (err) {
                setStatus(err.message);
            }
        },
    });

    return (
        <div className="login-page">
            <div className="login-page-interface">
                <form action={() => formik.submitForm()}>
                    <h1>Login</h1>

                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.email}
                    />
                    {formik.touched.email && formik.errors.email ? (
                        <span className="field-error">{formik.errors.email}</span>
                    ) : (
                        <span className="field-error">&nbsp;</span>
                    )}

                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.password}
                    />
                    {formik.touched.password && formik.errors.password ? (
                        <span className="field-error">{formik.errors.password}</span>
                    ) : (
                        <span className="field-error">&nbsp;</span>
                    )}

                    {formik.status ? (
                        <span className="field-error">{formik.status}</span>
                    ) : null}

                    <SubmitButton />
                </form>
                <Link className="back-login-button" href="/">back</Link>
            </div>
        </div>
    )
};
