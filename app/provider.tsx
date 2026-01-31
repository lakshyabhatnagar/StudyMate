"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { UserDetailContext } from "@/context/UserDetailContext";

function Provider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const [userDetail, setUserDetail] = useState<any>(null);

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

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      <div className="max-w-7xl mx-auto">{children}</div>
    </UserDetailContext.Provider>
  );
}

export default Provider;
