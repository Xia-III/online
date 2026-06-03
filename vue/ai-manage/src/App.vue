<template>
  <div>
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
  background-color: #f1f1f1;
  padding: 0;

  // padding-bottom: 140px;
  // background-color: #f1f1f1;
  .van-overflow-hidden {
    overflow: visible !important;
    overflow-x: visible !important;
    overflow-y: visible !important;
  }
}
</style>
