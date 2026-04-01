import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../api";

const GOOGLE_SCRIPT_ID = "google-identity-services";
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function GoogleAuthButton({ setUser, redirectPath = "/" }) {
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !buttonRef.current) {
      return;
    }

    const handleCredentialResponse = async (response) => {
      try {
        const { data } = await api.post("/google-auth/", {
          credential: response.credential,
        });

        localStorage.setItem("token", data.access);
        localStorage.setItem("refreshToken", data.refresh);
        localStorage.setItem("user", JSON.stringify(data.user));

        if (setUser) {
          setUser(data.user);
        }

        navigate(redirectPath);
      } catch (error) {
        console.error("Google auth failed:", error);
        alert("Google sign-in could not be completed.");
      }
    };

    const renderButton = () => {
      if (!window.google?.accounts?.id || !buttonRef.current) {
        return;
      }

      buttonRef.current.innerHTML = "";

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: 300,
        text: "continue_with",
        shape: "pill",
      });
    };

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existingScript) {
      renderButton();
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderButton;
    document.body.appendChild(script);
  }, [navigate, redirectPath, setUser]);

  if (!GOOGLE_CLIENT_ID) {
    // Hide the Google button until a real client ID is provided via env.
    return null;
  }

  return (
    <div className="mt-3">
      <div className="text-center text-muted small mb-2">or</div>
      <div ref={buttonRef} className="d-flex justify-content-center" />
    </div>
  );
}

export default GoogleAuthButton;
