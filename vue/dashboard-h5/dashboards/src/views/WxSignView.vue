<template>
  <div class="about">
    <!-- <h1>This is an about page</h1> -->
  </div>
</template>
<script setup lang="ts">
import { ref, onBeforeMount, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted , onMounted,getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
const { proxy } = getCurrentInstance() as any
const $router = useRouter();
const APPID='wx9d7b0dc783a15eed';

onBeforeMount(()=>{
  console.log("onBeforeMount")
  getCode();

})

const getCode = () => {
  let code = getUrlParam('code')
  if (proxy.$api.checkIsEmpty(code)) {
    const local = window.location.href
    window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + APPID + '&redirect_uri=' + encodeURIComponent(local) + '&response_type=code&scope=snsapi_userinfo&state=1#wechat_redirect';
  } else {
    sessionStorage.setItem('code', code); //把code保存在session中获取用户信息
    $router.push({ path: 'login' || '/' })
  }
  

};
const getUrlParam = (name: string) => {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
  var r = window.location.search.substr(1).match(reg);
  if (r != null) {
    return unescape(r[2]);
  }
  return '';
};

onMounted(() => {
  console.log("onMounted") 
})

onBeforeUpdate(()=>{
  console.log("onBeforeUpdate")
})

onUpdated(()=>{
  console.log("onUpdated")
})

onBeforeUnmount(()=>{
  console.log("onBeforeUnmount")
})

onUnmounted(()=>{
  console.log("onUnmounted")
})


</script>
