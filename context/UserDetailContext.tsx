import { createContext } from "react";

export interface UserDetail {
  id: number;
  name: string;
  email: string;
  credits: number;
}

export interface UserDetailContextType {
  userDetail: UserDetail | null;
  setUserDetail: (user: UserDetail | null) => void;
}

export const UserDetailContext = createContext<UserDetailContextType | null>(null);