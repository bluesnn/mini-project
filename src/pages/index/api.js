import request from "@/utils/request.js";

export const todo = () => {
    return request({
        url: '/todos/1',
        method: 'get'
    })
}