import axios from 'axios-miniprogram';

export default function request(axiosConfig) {
  const service = axios.create({
    baseURL: 'https://jsonplaceholder.typicode.com', // 设置统一的请求前缀
    timeout: 15000 // 设置统一的超时时长
  })
  console.log('service: ', service);


  // 响应拦截
  service.interceptors.response.use(
    response => {
      console.log('response: ', response);
      const { status } = response
      const { error } = response.data
      // 关于code码的判断自行修改
      if (!response.data) {
        return Promise.reject(response.data)
      } else if (status === 200) {
        return response.data // 返回 response.data
      }
    },
    error => {
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
