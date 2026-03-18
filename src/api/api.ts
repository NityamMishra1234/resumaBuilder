import axios from "axios"
import { tokenServices } from "./tokenService";



const api = axios.create({
    baseURL: "http://localhost:3000",
    timeout: 50000,
})

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
}
api.interceptors.request.use(
    async (config) => {
        const token = await tokenServices.getAccesToken()

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

api.interceptors.response.use(
    (responce) => responce,

    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401
            &&
            !originalRequest._retry
        ) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject })
                })
                    .then((token) => {
                        originalRequest.headers["Authorization"] = "Bearer " + token;
                        return api(originalRequest);
                    })
                    .catch((error) => Promise.reject(error))
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = tokenServices.getRefreshToken();

                const res = await axios.post(
                    "http://localhost:3000/auth/refreshtoken",
                    { refreshToken }
                )
                const newAccesToken = res.data.accessToken;
                const newRefreshToken = res.data.refreshToken

                tokenServices.setTokens(newAccesToken, newRefreshToken)

                api.defaults.headers.common["Authorization"] =
                    `Bearer ${newAccesToken}`

                processQueue(null, newAccesToken)

                return api(originalRequest)
            } catch (error) {
                processQueue(error, null);
                await tokenServices.removeToken();
                return Promise.reject(error);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error)
    }
);

export default api;