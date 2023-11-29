/*eslint @typescript-eslint/no-explicit-any:*/
import ctxData from "@/common/ctx-data";
import axios from "axios";
import type { AxiosInstance } from "axios";

const apiClient: AxiosInstance = axios.create({
    baseURL: ctxData? ctxData.basePath : import.meta.env.VITE_BASE_API_URL,
    method: "post",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true
});

//apiClient.defaults.headers.common["Access-Control-Allow-Origin"] = "*";

apiClient.interceptors.request.use(
    async (config) => config,
    error => Promise.reject(error)
);

// function instanceOfAvailabilityResult(object: any): object is AvailabilityResult {
//     return 'flights' in object && 'fares' in object && 'tripOffers' in object;
// }

const isValidDateTime = (str: string): boolean => {
    const dateRegex = /^(\d{4}-\d{2}-\d{2})(T(\d{2}:\d{2}:\d{2})(\.\d+)?(Z|([+-]\d{2}:?\d{2})?))?$/;
    return dateRegex.test(str);
}

const parseDate = (text: string) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
        return new Date(`${text}T00:00:00`)
    } else {
        return new Date(text)
    }
}

const dateDeserializer = (obj: any) => {
    if (obj === null || obj === undefined || typeof obj !== "object")
        return obj;

    for (const key of Object.keys(obj)) {
        const value = obj[key];
        if (typeof value === 'string' && isValidDateTime(value)) obj[key] = parseDate(value);
        else if (typeof value === "object") dateDeserializer(value);
    }
}

apiClient.interceptors.response.use(
    (res) => {
        if (res && res.data) {
            if (res.data?.handleJsDate) {
                dateDeserializer(res.data.data)
            }
            return res.data;
        }
        return res;
    },
    (error) => {
        // Handle error ...
        // throw error;
        return Promise.reject(error);
    }
);

export default apiClient;

// paramsSerializer -> transform queryString only
// transformRequest -> transform request data

/** transformRequest for form submit using @ModelAttribute */ // --> Using: axios.postForm('post-url', data, {headers: {'content-type': 'application/x-www-form-urlencoded'}});
// export const transformRequestAsFormSubmit = ((data: any, headers: AxiosRequestHeaders) => {
//     headers["Content-Type"] = "application/x-www-form-urlencoded"
//     const dataReq = flattenData(data, {}, {connectionString: "."});
//     return new URLSearchParams(dataReq as any).toString()
//   }) as AxiosRequestTransformer