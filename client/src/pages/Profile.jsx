import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./styles/Profile.css";

export default function Profile() {
  const {
    isLoggedIn,
    isGuest,
    authLoading,
    authUserId,
    getCurrentUserData,
  } = useAuth();

  const [userData, setUserData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (authLoading) return;

      if (!isLoggedIn || isGuest) {
        setProfileLoading(false);
        return;
      }

      try {
        const user = await getCurrentUserData();
        setUserData(user);
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [authLoading, isLoggedIn, isGuest, getCurrentUserData]);

  if (authLoading || profileLoading) {
    return (
      <section className="profile-page">
        <div className="profile-card">
          <p className="profile-loading">Loading profile...</p>
        </div>
      </section>
    );
  }

  if (!isLoggedIn || isGuest) {
    return (
      <section className="profile-page">
        <div className="profile-card">
          <h2>Profile Locked</h2>
          <p>You need to log in with a full StudyZone account to view your profile.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {userData?.firstName?.[0]?.toUpperCase() || "U"}
          </div>

          <div>
            <h2>
              {userData?.firstName || "User"} {userData?.lastName || ""}
            </h2>
            <p>{userData?.email}</p>
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-item">
            <span>User ID</span>
            <p>{authUserId}</p>
          </div>

          <div className="profile-item">
            <span>First Name</span>
            <p>{userData?.firstName || "Not set"}</p>
          </div>

          <div className="profile-item">
            <span>Last Name</span>
            <p>{userData?.lastName || "Not set"}</p>
          </div>

          <div className="profile-item">
            <span>Email</span>
            <p>{userData?.email || "Not set"}</p>
          </div>

          <div className="profile-item">
            <span>Role</span>
            <p>{userData?.role || "Student"}</p>
          </div>
        </div>
      </div>
    </section>
  );
}