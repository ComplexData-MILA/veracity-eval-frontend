"use client"
import { useUser } from '@auth0/nextjs-auth0/client';

export function getUserPhoto() {
  const { user } = useUser();
    if (user && user.picture !== null){
      return user.picture
    }
    else return "/assets/profile.svg"
}

export function getUserFirstName() {
  const { user } = useUser();
  if (user && user.name !== undefined && user.name !== null){
    return user.name.split(" ")[0]
   }
   else {return ""}
}