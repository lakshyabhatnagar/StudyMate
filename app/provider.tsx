"use client"
import React, { useEffect } from 'react'
import axios from 'axios'
import { UserDetailContext } from '@/context/UserDetailContext';

function Provider({children }: { children: React.ReactNode }) {
    const [userDetail,setUserDetail]=React.useState(null);
    useEffect(()=>{
        //call create new user function on component mount
        CreateNewUser();
    },[])

    const CreateNewUser=async ()=>{
        //user API endpoint to create new user
        const result=await axios.post('/api/user',{});
        console.log("New user created:",result.data);
        setUserDetail(result?.data);
    }
  return (
    <div>
        <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
        <div className="max-w-7xl mx-auto">
            {children}
        </div>
        </UserDetailContext.Provider>
    </div>
  )
}

export default Provider