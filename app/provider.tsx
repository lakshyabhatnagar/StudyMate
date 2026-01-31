"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { UserDetailContext } from "@/context/UserDetailContext";

function Provider({ children }: { children: React.ReactNode }) {
  const [userDetail, setUserDetail] = useState<any>(null);

  useEffect(() => {
    if (!userDetail) {
      CreateNewUser();
    }
  }, []);

  const CreateNewUser = async () => {
    try {
      const result = await axios.post("/api/user");
      setUserDetail(result.data);
    } catch (err) {
      console.error("User creation failed", err);
    }
  };

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      <div className="max-w-7xl mx-auto">{children}</div>
    </UserDetailContext.Provider>
  );
}

export default Provider;
