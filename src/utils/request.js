import axios from 'axios-miniprogram';
// import { globalBaseURL } from '@/utils/globalBaseURL'
// import { getCookie } from '@/utils/storage'

const pendingMap = new Map()

const loadingInstance = {
    _target: null,
    _count: 0
}

// function setBaseURL(name) {
//   return globalBaseURL()[name]
// }

export default function request(axiosConfig, customOptions, loadingOptions) {
    const service = axios.create({
        // baseURL: globalBaseURL().BAIDU_BASE_URL, // 设置统一的请求前缀
        timeout: 30000 // 设置统一的超时时长
    })

    // 自定义配置
    const custom_options = Object.assign({
        baseURL: null, // 后端接口地址，适配接口多域名情况
        isToken: true, // 是否携带token
        repeatRequestCancel: true, // 是否开启取消重复请求
        loading: true, // 是否开启loading层效果
        reductDataFormat: true, // 是否开启简洁的数据结构响应
        errorMessageShow: true, // 是否开启接口错误信息展示
        codeMessageShow: true // 是否开启code不为0时的信息提示
    }, customOptions)

    // 请求拦截
    service.interceptors.request.use(
        config => {
            config.baseURL = '' //setBaseURL(custom_options.baseURL || 'BAIDU_BASE_URL')
            removePending(config)
            custom_options.repeatRequestCancel && addPending(config)
            // 创建loading实例
            if (custom_options.loading) {
                loadingInstance._count++
                if (loadingInstance._count === 1) {
                    if (loadingOptions?.message) {
                        loadingInstance._target = uni.showLoading()
                    } else {
                        loadingInstance._target = uni.showLoading({
                            title: '加载中'
                        })
                    }
                }
            }
            // 自动携带token
            if (custom_options.isToken) {
                // config.headers['Authorization'] = getCookie() // 请求携带自定义token 请根据实际情况自行修改
            }

            return config
        },
        error => {
            return Promise.reject(error)
        }
    )

    // 响应拦截
    service.interceptors.response.use(
        response => {
            removePending(response.config)
            custom_options.loading && closeLoading(custom_options) // 关闭loading
            const { errno, error } = response.data
            // 关于code码的判断自行修改
            if (errno === '1111') {
                console.log('token失效')
                return Promise.reject(response.data)
            } else if (custom_options.codeMessageShow && response.data && errno !== '0') {
                return Promise.reject(response.data)
            } else {
                return custom_options.reductDataFormat ? response.data : response
            }
        },
        error => {
            error.config && removePending(error.config)
            custom_options.loading && closeLoading(custom_options) // 关闭loading
            custom_options.errorMessageShow && httpErrorStatusHandle(error) // 处理错误状态码
            return Promise.reject(error) // 错误继续返回给到具体页面
        }
    )

    return service(axiosConfig)
}

/**
 * 处理异常
 * @param {*} error
 */
function httpErrorStatusHandle(error) {
    // 处理被取消的请求
    if (axios.isCancel(error)) {
        return console.error('请求的重复请求：' + error.message)
    }
    let message = ''
    if (error && error.response) {
        switch (error.response.status) {
            case 401: message = '您未登录，或者登录已经超时，请先登录！'; break
            case 408: message = '请求超时！'; break
            case 500: message = '服务器内部错误！'; break
            default: message = '异常问题，请联系管理员！'; break
        }
    }
    if (error.message.includes('timeout')) {
        message = '网络请求超时！'
    }
    uni.showToast({
        title: message,
        icon: 'error',
        duration: 2000
    });
}

/**
 * 关闭Loading层实例
 * @param {*} options
 */
function closeLoading(options) {
    if (options.loading && loadingInstance._count > 0) loadingInstance._count--
    if (loadingInstance._count === 0) {
        loadingInstance._target.close()
        loadingInstance._target = null
    }
}

/**
 * 储存每个请求的唯一cancel回调, 以此为标识
 * @param {*} config
 */
function addPending(config) {
    const pendingKey = getPendingKey(config)
    config.cancelToken = config.cancelToken || new axios.CancelToken((cancel) => {
        if (!pendingMap.has(pendingKey)) {
            pendingMap.set(pendingKey, cancel)
        }
    })
}

/**
 * 删除重复的请求
 * @param {*} config
 */
function removePending(config) {
    const pendingKey = getPendingKey(config)
    if (pendingMap.has(pendingKey)) {
        const cancelToken = pendingMap.get(pendingKey)
        cancelToken(pendingKey)
        pendingMap.delete(pendingKey)
    }
}

/**
 * 生成唯一的每个请求的唯一key
 * @param {*} config
 * @returns
 */
function getPendingKey(config) {
    let { data } = config
    const { url, method, params } = config
    if (typeof data === 'string') data = JSON.parse(data) // response里面返回的config.data是个字符串对象
    return [url, method, JSON.stringify(params), JSON.stringify(data)].join('&')
}
