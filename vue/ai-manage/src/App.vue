<template>
  <div class="app-wrapper">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>
<script setup>
import { showToast } from "vant";
import { getCurrentInstance, onMounted } from 'vue';
import { useRoute, useRouter } from "vue-router"
const router = useRouter()
const { proxy } = getCurrentInstance()
const getUrlParam = (name) => {
  let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
  let r = window.location.search.substr(1).match(reg);
  if (r != null) {
    return unescape(r[2]);
  }
  return null;
}

</script>
<style lang="less">
html,
body {
  height: 100%;
  overflow: hidden;
  position: fixed;
  width: 100%;
  background-color: #f1f1f1;
  padding: 0;
}

#app {
  height: 100%;
  overflow: hidden;
}

.app-wrapper {
  height: 100%;
}

.van-overflow-hidden {
  overflow: visible !important;
  overflow-x: visible !important;
  overflow-y: visible !important;
}
</style>
