import { useAuth } from "../contexts/AuthContext";
import { useRef } from "react";
import { Navigate } from "react-router-dom";
import React from "react";
import event_coordinator from "../assets/event-coordinator.svg";
import logo from "../assets/grassroots-logo.svg";
import { useMutation } from "react-query";
import { API_BASE_URL } from "../httpUtils";
import { toastNotify } from "../uiUtils";
import { Loading } from "../components/Loading";

export function Login() {
  let { token, setToken } = useAuth();
  const username = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);

  const login = useMutation({
    mutationFn: async ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => {
      const resp = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.message);
      }
      return resp.json();
    },
    onSuccess(data, variables, context) {
      setToken(data.token);
      localStorage.setItem("token", data.token);
    },
    onError(error, variables, context) {
      console.error(error);
      let errorMessage = "Unable to log in";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toastNotify(errorMessage, "failure");
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    //Should never happen
    if (!username || !username.current || !password || !password.current) {
      return;
    }
    login.mutate({
      username: username.current.value,
      password: password.current.value,
    });
  }

  const inputStyles = "rounded-lg px-8 py-4 sm:text-2xl shadow-md outline-0";
  if (token) {
    return <Navigate to="/events" />;
  }

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
            className={inputStyles}
            type="text"
            ref={username}
            autoComplete="off"
            name="username"
            required
            placeholder="username"
          />
          <input
            type="password"
            autoComplete="off"
            className={inputStyles}
            ref={password}
            placeholder="password"
            required
          />
          <button
            className="rounded-lg bg-newLeafGreen py-2 text-xl font-bold text-white hover:cursor-pointer hover:brightness-110 sm:text-3xl"
            type="submit"
            disabled={login.status === "loading"}
          >
            {login.status === "loading" ? (
              <div className="relative h-7 min-h-full sm:h-9">
                <Loading size="xsmall" thickness="thin" />
              </div>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
