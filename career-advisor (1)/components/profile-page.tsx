"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from "next/navigation";

interface UserProfile {
  email: string;
  // Add other user details you want to display
}

interface HexacoScores {
  honesty_humility: number;
  emotionality: number;
  extraversion: number;
  agreeableness: number;
  conscientiousness: number;
  openness_to_experience: number;
}

const ProfilePage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [hexacoScores, setHexacoScores] = useState<HexacoScores | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/auth'); // Redirect to login if no token
        return;
      }

      try {
        // Fetch user profile (you might need a new endpoint for this)
        // For now, let's assume we can get email from the token or a generic user endpoint
        // Or, if the backend sends user details with hexaco scores, we can use that.
        // For simplicity, let's assume a /me endpoint or similar exists.
        const userResponse = await axios.get('http://localhost:8000/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserProfile(userResponse.data);

        // Fetch HEXACO scores
        const hexacoResponse = await axios.get('http://localhost:8000/hexaco_scores', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setHexacoScores(hexacoResponse.data);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data.');
        // Optionally redirect to login if token is invalid
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          router.push('/auth');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [router]);

  if (loading) {
    return <div className="p-4">Loading profile...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!userProfile) {
    return <div className="p-4">No user profile found.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      <p><strong>Email:</strong> {userProfile.email}</p>

      {hexacoScores ? (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3">HEXACO Scores</h2>
          <ul>
            <li><strong>Honesty-Humility:</strong> {hexacoScores.honesty_humility}</li>
            <li><strong>Emotionality:</strong> {hexacoScores.emotionality}</li>
            <li><strong>Extraversion:</strong> {hexacoScores.extraversion}</li>
            <li><strong>Agreeableness:</strong> {hexacoScores.agreeableness}</li>
            <li><strong>Conscientiousness:</strong> {hexacoScores.conscientiousness}</li>
            <li><strong>Openness to Experience:</strong> {hexacoScores.openness_to_experience}</li>
          </ul>
        </div>
      ) : (
        <p className="mt-6">No HEXACO scores found. Please complete the personality quiz.</p>
      )}
    </div>
  );
};

export default ProfilePage;