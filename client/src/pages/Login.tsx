import { useAuth } from "../contexts/AuthContext";
import { useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import React from "react";
import "./Login.css";
import event_coordinator from "../assets/event-coordinator.svg";
import logo from "../assets/grassroots-logo.svg";
import { AuthError } from "firebase/auth";

export function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const username = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);

  // if (user) {
  //   return <Navigate to="/events" />;
  // }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    alert("Here");

    //Should never happen
    if (!username || !username.current || !password || !password.current) {
      return;
    }
    try {
      login(username.current.value, password.current.value);
    } catch (error) {
      let code = (error as AuthError).code;
      alert(code);
    }

    //alert("done");
  }

  const classNames = "rounded-lg px-8 py-4 text-2xl shadow-md outline-0";

  return (
    <div className="flex h-full flex-col items-center justify-start gap-2 overflow-auto rounded border bg-softGrayWhite px-4">
      <div className="h-32" />
      <div className="flex flex-col justify-between gap-10 rounded">
        <div className="flex flex-col items-center justify-center">
          <img className="w-2/3" src={logo} alt="grassroots logo" />
          <img
            className="w-1/3"
            src={event_coordinator}
            alt="event coordinator"
          />
        </div>
        <form onSubmit={(e) => handleSubmit(e)} className="flex flex-col gap-8">
          <input
            className={classNames}
            type="text"
            ref={username}
            name="username"
            required
            placeholder="username"
          />
          <input
            type="password"
            className={classNames}
            ref={password}
            placeholder="password"
            required
            autoComplete="False"
          />
          <button
            className="rounded-lg bg-newLeafGreen py-2 text-3xl font-bold text-white hover:cursor-pointer hover:brightness-110"
            type="submit"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
