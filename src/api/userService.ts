import { userDto } from "@/types/user.type";


const USER_KEY = "user_data";
export const userStorage ={
    async setUser(user : userDto){
        localStorage.setItem(USER_KEY, JSON.stringify(user))
    },

    async getUser(){
        const data = await localStorage.getItem(USER_KEY)

        if(!data) return null ;

        return JSON.parse(data)
    },

    async removeUser (){
        await localStorage.removeItem(USER_KEY)
    }
}