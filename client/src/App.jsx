import { useState } from "react";
import axios from "axios";
import {useNavigate } from "react-router-dom";

function App() {

  const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);
const navigate = useNavigate()


const handleSubmit = async (e) => {
  e.preventDefault();


  setError("");
  setLoading(true);

  try {
    const response = await axios.post(
      "http://localhost:5000/api/auth/login",
      { email, password }
    );

    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));

    navigate("/dashboard");
  } catch (error) {
    setError(
      error.response?.data?.message || "Something went wrong."
    );
  } finally {
    setLoading(false);
  }
};
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-100">
      <section className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-2xl bg-white shadow-xl md:grid-cols-2">
      <div className="bg-[#19395B] p-8 text-white md:p-12">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-white p-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#19395B] shadow-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M12 21c4.418 0 8-3.582 8-8 0-5.25-8-12-8-12S4 7.75 4 13c0 4.418 3.582 8 8 8Z" />
              <path d="M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
            </svg>
          </span>
          Sweety
        </h1>
        <h2 className="text-2xl font-bold p-2 text-white">Blood glucose tracker</h2>
        <p className="text-white p-2">Welcome to Sweety, your personal blood glucose tracker.</p>
      </div>

      <div className="p-8 md:p-12">

  

              <h2 className="text-2xl font-bold p-2 text-[#19395B]">
                Welcome back

              </h2>

              <p className="text-[#19395B] text-lg">
                Sign in to your account to continue to Sweety.
                </p>
      


        <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-6">
          <label htmlFor="email" className="font-medium">
            Email
          </label>
          <input className="w-full rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" type="email" 
          name="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@example.com"
            required />
        
          <label htmlFor="password" className="font-medium">
            Password
          </label>
          <input 
          className="w-full rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" type="password"
           name="password" 
           id="password" 
           placeholder="Enter Your Password"
           value={password}
           onChange={(e) => setPassword(e.target.value)}
           required/>

           {error && <p className="text-red-600 mt-4">{error}</p>}

          {/* <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
            Login
          </button> */}

          <button className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          type="submit" disabled={loading}>
  {loading ? "Signing in..." : "Login"}
</button>
       </form>
        </div>
      </section>

   
      <footer className="p-4 mt-5 text-center text-sm text-slate-500">
        © 2026 Sweety. All rights reserved.
      </footer>
    </main>
  )
}

export default App
