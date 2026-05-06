import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const useGuestLogin = () => {
  const { loginGuest } = useAuth();
  const navigate = useNavigate();

  const handleGuestLogin = async (guestName, redirectTo = "/") => {
    const name = String(guestName ?? "").trim();

    if (!name) {
      alert("Please enter a guest name.");
      return;
    }

    const guestData = await loginGuest({ name });

    if (guestData?.hasError) {
      alert(guestData.message || "Guest login failed.");
      return;
    }

    navigate(redirectTo);
  };

  return { handleGuestLogin };
};