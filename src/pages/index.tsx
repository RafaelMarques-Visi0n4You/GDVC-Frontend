import { ButtonVariants } from "@/common/components/button";
import { InputEmail } from "@/common/components/inputemail";
import { InputPassword } from "@/common/components/inputpassword";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../common/components/AuthContext";
import styles from "../common/components/bg.module.css";

function Login() {
  const [errors, setErrors] = useState({});
  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  const { Login } = useAuth();

  const handleInput = (event: any) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    let hasErrors = false;
    if (values.email.trim() === "" || !values.email) {
      toast.error("Email em falta!");
      setErrors((prev) => ({ ...prev, email: "Email em falta" }));
      hasErrors = true;
    }
    if (values.password.trim() === "" || !values.password) {
      toast.error("Password em falta!");
      setErrors((prev) => ({ ...prev, password: "Password em falta" }));
      hasErrors = true;
    }

    if (hasErrors) return;

    try {
      await Login(values);
      toast.success("Login bem-sucedido!");
    } catch (error: any) {
      if (error.message === "Conta inativa!") {
        toast.error("Conta inativa!");
      } else {
        toast.error("Email ou password incorretos!");
      }
    }
  };

  return (
    <main className="overflow-hidden h-full">
      <div className={styles.bg}>
        <div className={styles.container}>
          <div className="flex justify-center items-center h-full">
            <div className="w-full max-w-md">
              <h1 className="text-3xl font-bold mb-4 text-center">LOGIN</h1>
              <p className="text-center mb-8">Bem-vindo</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <InputEmail
                  value={values.email}
                  onChange={handleInput}
                  placeholder="Email"
                />
                <InputPassword
                  value={values.password}
                  onChange={handleInput}
                  placeholder="Password"
                />

                <ButtonVariants onClick={handleSubmit} type="submit">
                  Login
                </ButtonVariants>
              </form>
            </div>
            <Toaster containerStyle={{ zIndex: 99999 }} />
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;
