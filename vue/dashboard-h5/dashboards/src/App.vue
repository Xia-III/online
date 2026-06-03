<template>
  <router-view />
</template>

<script lang="ts" setup>
import { Options, Vue } from 'vue-class-component';
import { disabledScale } from './utils/disableScale'
import { ref, defineComponent, getCurrentInstance, onBeforeMount, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted, onMounted, defineAsyncComponent } from 'vue';
const { proxy } = getCurrentInstance() as any
import { provide } from 'vue';
disabledScale();

// 用于存储重连定时器的引用，以便在组件卸载时清理
let reconnectTimer: number | null = null;

defineComponent({
  created() {
    console.log("app-created")
  }




});







onMounted(() => {
  console.log("app-onMounted")

})


onBeforeUpdate(() => {
  console.log("app-onBeforeUpdate")
})

onUpdated(() => {
  console.log("app-onUpdated")
})

onBeforeUnmount(() => {
  console.log("app-onBeforeUnmount")
  // 清理重连定时器
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
})

onUnmounted(() => {
  console.log("app-onUnmounted")
  // 再次确保清理重连定时器
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
})



onBeforeMount(() => {
  //proxy.$toast({ message:  'test' })
  console.log('APP-onBeforeMount')
  checkSingnalR();
})

const checkSingnalR = async () => {

  // 清理之前的重连定时器
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  let isstop = false;
  let url = location.href;
  let url1 = (url.indexOf("/login") != -1);
  let url2 = (url.indexOf("/register") != -1);
  let url3 = (url.indexOf("/restPassword") != -1);
  let url4 = (url.indexOf("/wxsign") != -1);
  if (url1 == true) {
    isstop = true
  } else if (url2 == true) {
    isstop = true
  } else if (url3 == true) {
    isstop = true
  } else if (url4 == true) {
    isstop = true
  }
  isstop = false;
  if (isstop) {
    try {
      proxy.$api.stop();
    }
    catch {

    }

  } else {
    console.log('重连1');
    var falg = false;
    try {
      falg = await proxy.$api.start();


    } catch (err) {
      falg = false;
      //第一次连接失败，2000毫秒无限重连

    }
    if (falg == false)
      reconnectTimer = window.setTimeout(() => checkSingnalR(), 2000);


  }

}




</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;

}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

body {
  padding: 0;
  margin: 0;
  min-height: 100%;
}

.tableHead {
  padding: 20px 0px;
  text-align: left;
  width: 100%;
}

.boxBg2 {
  width: 96%;
  height: auto;
  padding: 0 1%;
  position: absolute;

  .arco-tag-checked {
    cursor: pointer;
  }
}

.pagination {
  float: right;
  margin-top: 20px;
}
</style>
