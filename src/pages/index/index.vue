<template>
  <view class="content">
    <image class="logo" src="/static/logo.png"></image>
    <view class="text-area">
      <text class="title">{{ title }}</text>
    </view>
    <button @click="goAbout">about</button>
    <button @click="goTest">test</button>
  </view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'

const goAbout = () => {
  uni.navigateTo({
    url: '/pages/about/index?id=1&name=uniapp'
  })
}

onShow(() => {
  console.log('App Show')
})

const goTest = () => {
  uni.navigateTo({
    url: '/pages/mac/index'
  })
}
</script>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 200rpx;
  width: 200rpx;
  margin-top: 200rpx;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 50rpx;
}

.text-area {
  display: flex;
  justify-content: center;
}

.title {
  font-size: 36rpx;
  color: #8f8f94;
}
</style>
