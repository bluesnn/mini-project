const whiteList = [
    '/pages/index/index'
]
function hasPermission(url) {
    console.log('url: ', url);
    let islogin = uni.getStorageSync('isLogin')
    console.log('islogin: ', islogin);
    islogin = Boolean(Number(islogin));//返回布尔值
    // 在白名单中或有登录判断条件可以直接跳转
    if (whiteList.indexOf(url) !== -1 || islogin) {
        return true
    }
    return false
}
uni.addInterceptor('navigateTo', {
    // 页面跳转前进行拦截, invoke根据返回值进行判断是否继续执行跳转
    invoke(e) {
        console.log('navigateToe: ', e, e.success(), e.fail());
        if (!hasPermission(e.url)) {
            // uni.reLaunch({
            //     url: '/pages/my/my'
            // })
            return true
        }
        return true
    },
    success(e) {
    }
})
uni.addInterceptor('switchTab', {
    // tabbar页面跳转前进行拦截
    invoke(e) {
        console.log('switchTabe: ', e);
        if (!hasPermission(e.url)) {
            uni.reLaunch({
                url: '/pages/my/my'
            })
            return false
        }
        return true
    },
    success(e) {
    }
})
