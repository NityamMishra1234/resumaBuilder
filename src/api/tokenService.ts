'use client';

const ACCESS_TOKEN = "access_token";
const REFRESH_TOKEN = "refresh_token";

export const tokenServices ={
     getAccesToken (){
        return  localStorage.getItem(ACCESS_TOKEN)
    },

     getRefreshToken (){
        return  localStorage.getItem(REFRESH_TOKEN)
    },

     setTokens(access : string , refresh: string){
         localStorage.setItem(ACCESS_TOKEN , access)
         localStorage.setItem(REFRESH_TOKEN , refresh )
    },

     removeToken (){
         localStorage.removeItem(ACCESS_TOKEN)
         localStorage.removeItem(REFRESH_TOKEN)
    }

}