import { useState } from "react";

export default function GuestLoginCard({ onGuestLogin, redirectTo }) {
  const [guestName, setGuestName] = useState("");

  const submitGuest = async () => {
    console.log("Submitting guest login:", guestName, redirectTo);

    const result = await onGuestLogin(guestName, redirectTo);

    if (result?.hasError) {
      console.log(result.message);
      return;
    }

    console.log("Guest login success");
  };

  return (
    <div>
      <input
        value={guestName}
        onChange={(e) => setGuestName(e.target.value)}
        placeholder="Enter guest name"
      />

      <button onClick={submitGuest}>
        Continue as Guest
      </button>
    </div>
  );
}