"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { UserDetailContext, UserDetail, UserDetailContextType } from "@/context/UserDetailContext";
import Header from "./_components/Header";

function Provider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);

  const createNewUser = useCallback(async () => {
    try {
      const result = await axios.post("/api/user");
      setUserDetail(result.data);
    } catch (err) {
      console.error("User creation failed", err);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || userDetail) return;
    createNewUser();
  }, [isLoaded, isSignedIn, userDetail, createNewUser]);

  const contextValue: UserDetailContextType = {
    userDetail,
    setUserDetail,
  };

  return (
    <UserDetailContext.Provider value={contextValue}>
      <div className="max-w-7xl mx-auto">
        <Header />
        {children}
      </div>
    </UserDetailContext.Provider>
  );
}

export default Provider;
