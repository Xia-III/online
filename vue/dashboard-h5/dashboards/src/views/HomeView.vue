<template>
  <div class="boxBg">
    <a-layout class="layout-demo">
      <a-layout-sider :collapsed="collapsed" breakpoint="xl">

        <div class="logo">
          <a-row class="grid-demo" align="center">
            <a-col :span="4">
              <img src="../assets/logo.png" style="width:50px;height:auto;" />
            </a-col>
            <a-col :span="20">
              <h4>华彩支付管理平台</h4>
            </a-col>

          </a-row>


        </div>
        <a-menu :default-selected-keys="[menuKey]" :selected-keys="[menuKey]" :default-open-keys="[menuKey]"
          :style="{ width: '100%' }" style="text-align: left;">
          <!-- <a-menu-item key="0_1">
            <icon-home />
            首页
          </a-menu-item> -->


          <block :key="item.menuId" v-for="item in menuList" @click="onClickMenuItem(item)">
            <a-sub-menu v-if="item.menuType==1">
              <template #title>
                <icon-apps style="margin-right:0;" />
                {{ item.menuName }}
              </template>
              <a-menu-item @click.stop="onClickMenuItem(item2)" v-for="item2 in item.children" :key="item2.menuId">{{ item2.menuName
              }}</a-menu-item>
            </a-sub-menu>
            <a-menu-item :key="item.menuId" v-else-if="item.menuType==0">
              <icon-apps style="margin-right:0;" />
              {{ item.menuName }}
            </a-menu-item>

          </block>


        </a-menu>
        <!-- trigger -->
        <template #trigger="{ collapsed }">
          <IconCaretRight v-if="collapsed"></IconCaretRight>
          <IconCaretLeft v-else></IconCaretLeft>
        </template>
      </a-layout-sider>


      <a-layout>
        <a-layout-header style="padding-left: 20px;text-align: left;">
          <a-row class="grid-demo" align="center">
            <a-col :span="2">
              <div> <a-button shape="round" @click="onCollapse">
                  <IconCaretRight v-if="collapsed" />
                  <IconCaretLeft v-else />
                </a-button></div>
            </a-col>
            <a-col :span="22" class="hearBox">
              <div>
                <a-space align="center" style="margin-top: 10px;">

                  <icon-notification size="24" style="margin-right:0px" />

                  <a-popover :position="'br'">
                    <a-button style="background:none;"> <a-avatar :style="{ backgroundColor: '#3370ff' }"
                        style="margin-right:10px">
                        {{jwtData.nickname}}
                      </a-avatar>
                      欢迎您，  {{jwtData.loginName}} &nbsp; <icon-down size="14" /> </a-button>

                    <template #content>
                      <p class="popoverP" @click="ShowEdit"><icon-user /> 个人信息</p>
                      <p class="popoverP" @click="pwdHandleClick" ><icon-pen-fill /> 修改密码</p>
                      <p class="popoverP" @click="onLogout"><icon-to-left /> 退出登录</p>
                    </template>
                  </a-popover>

                  <!-- 欢迎您，18312109702 -->



                </a-space>
              </div>
            </a-col>

          </a-row>

        </a-layout-header>
        <a-layout style="padding: 20px 24px;">

          <a-layout-content>
            <a-tabs type="card-gutter" @add="handleAdd" :active-key="tableKey" :editable="true" @delete="handleDelete"
              auto-switch lazy-load @tab-click="changeTabs">
              <a-tab-pane v-for="( item, index ) of  listData" :key="item.menuId" :title="item.menuName" :closable="index != 0">

                <router-view v-slot="{ Component }" :name="item.menuUrl" v-on:addTab="onClickMenuItem"  v-on:getCurrTable="getCurrTable" v-on:showLoading="showLoading" >
                  <keep-alive>
                    <component :is="Component" v-if="$route.meta.keepAlive" :key="$route.name" :name="item.menuUrl" />
                  </keep-alive>

                </router-view>
                <!-- 
                <keep-alive :include="item.url">
                  <router-view :name="item.url">


                  </router-view>
                </keep-alive> -->
              </a-tab-pane>
            </a-tabs>

          </a-layout-content>
          <!-- <a-layout-footer>Footer <icon-bytedance-color /></a-layout-footer> -->
        </a-layout>
      </a-layout>
    </a-layout>
  </div>

  <a-modal v-model:visible="pwdVisible" title="修改密码" @cancel="pwdHandleCancel" @before-ok="pwdHandleBeforeOk">
    <a-form :model="pwdForm">
      <a-form-item field="oldPassword" label="旧密码">
        <a-input-password  v-model="pwdForm.oldPassword"  placeholder="请输入旧密码"  />
      </a-form-item>
      <a-form-item field="password" label="新密码">
        <a-input-password  v-model="pwdForm.password" placeholder="请输入新密码" />
      </a-form-item>

      <a-form-item field="password2" label="确认密码">
        <a-input-password  v-model="pwdForm.password2" placeholder="再次确认新密码" />
      </a-form-item>

    </a-form>
  </a-modal>


  <a-modal v-model:visible="visible" :on-before-ok="handleBeforeOk" @cancel="handleCancel" draggable>
    <template #title>
      个人信息
    </template>
    <div>
      <UserFormV2 ref="userForm"></UserFormV2>


    </div>
  </a-modal>

  <a-modal v-model:visible="loading"  :simple="true" :footer="false" :mask="false"
    :width="70">
    <a-spin tip="正在请求..." />
  </a-modal>
</template>



<script lang="ts" setup>
import { Options, Vue } from 'vue-class-component';
import { Message, Modal } from '@arco-design/web-vue';
import { RequestModel } from '@/api/hcbApi';
import { ref, defineComponent, getCurrentInstance, onBeforeMount, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted, onMounted, defineAsyncComponent, reactive } from 'vue';
import { menuItem, menuType } from '@/api/index';
import { removeToken, getToken } from '@/utils/auth'
import jwt_decode from "jwt-decode";
import { useStore } from 'vuex';
import UserFormV2 from '@/components/views/UserFormV2.vue';
const store = useStore();

const { proxy } = getCurrentInstance() as any

const collapsed = ref(false);
const menuList = ref([]);
const tableKey = ref('0');
const menuKey = ref('0');
const parentId = ref('0');
const loading =ref(false);
const jwtData=ref({});
const pwdForm = reactive({ oldPassword: '', password: '', password2: '', });
const pwdVisible = ref(false);

const visible = ref(false);
// const listData = ref([{
//   menuId: "0",
//   menuName: '首页',
//   menuUrl: 'homeIndex',
//   parentId: "0",
//   menuType: 0,
//   authorize: 'homeIndex'
// }]);

const listData = ref([]);


onBeforeMount(() => {
 // menuList.value = new Array<menuItem>();
 loadData();

})

onMounted(() => {
  const token = getToken()
  const data = jwt_decode(token) as any;
  jwtData.value = data;



})


//加载菜单数据
const loadData = async () => {

try {
  loading.value = true;
  let resp = await proxy.$api.hcbApi.GetMenuAuthorizeList();

    if (resp.code == 200) {

      menuList.value = resp.data.menuTree;
      store.commit('initMenuList',resp.data.allMenu)

      if (resp.data.menuTree.length > 0){

        handleAdd(resp.data.menuTree[0]);
       changeTabs(resp.data.menuTree[0].menuId);
      }

    } else {
      throw new Error(resp.message);
    }


}
catch (e) {
  Message.error({ content: `` + e.message, showIcon: true });
  return false;
}
finally {
  loading.value = false;
}

}

const showLoading = (isshow: boolean)=>{
  loading.value = isshow;
}


const onClickMenuItem = (item: any) => {

  //Message.info({ content: `You select ${item.key}`, showIcon: true });
  if (proxy.$api.checkIsEmpty(item.menuUrl )==false) {
    var curItem = listData.value.find(x => x.menuId == item.menuId);

    if (curItem) {

    } else {

      handleAdd(item);
      // this.listData = this.listData.concat({
      //   key: item.key,
      //   title: item.name,
      //   url: item.url
      // })
      // this.$router.push({ path: '/' + item.url });
    }

    if (item.menuType == menuType.subpage)
      menuKey.value = item.parentId;
    else
      menuKey.value = item.menuId;

       changeTabs(item.menuId);

    } else {
     // menuKey.value = item.menuId;
    }


  }
  const changeTabs=(item: any) =>{

    tableKey.value = item;
    var curItem = listData.value.find(x => x.menuId == item);
    if (curItem) {
    if (curItem.menuType == menuType.subpage)
      menuKey.value = curItem.parentId;
    else
      menuKey.value = curItem.menuId;
    // menuKey.value = curItem.menuId;
    parentId.value = curItem.parentId || "0";
  }

  if (curItem.params){

    proxy.$router.push({ name: curItem?.menuUrl, params: curItem.params })
  }
  else
    proxy.$router.push({ name: curItem?.menuUrl })


  }

  const getCurrTable=(callback:any)=>{
    var curItem = listData.value.find(x => x.menuId == menuKey.value);
    callback(curItem);

  }

  const onCollapse=() =>{
    collapsed.value = !collapsed.value;
  }

  const  handleAdd=(item: any)=> {
    listData.value = listData.value.concat(item);
  }


const onLogout=()=>{
      Modal.confirm({
      content: '是否确定退出登录', onOk: () => {
        removeToken();
        window.location.reload();

      }
    });
}


const handleDelete = (key: any) => {

  var index = listData.value.findIndex(x => x.menuId == key);
  if (index > 0 && tableKey.value == key) {
    var curItem = listData.value[index - 1];
    changeTabs(curItem.menuId);
  }


  listData.value = listData.value.filter(item => item.menuId !== key)


}

const pwdHandleClick = () => {
  pwdVisible.value = true;
  pwdForm.oldPassword=undefined;
  pwdForm.password2=undefined;
  pwdForm.password=undefined;
};
const pwdHandleBeforeOk = async (done: any) => {

  
 

  try {

    if (proxy.$api.checkIsEmpty(pwdForm.oldPassword))
      throw new Error("请输入旧登录密码");
    if (proxy.$api.checkIsEmpty(pwdForm.password))
      throw new Error("请输入新登录密码");

    if (pwdForm.password.length < 6 || pwdForm.password.length > 20)
      throw new Error("登录密码需要6-20位字符");

    if (pwdForm.password != pwdForm.password2)
      throw new Error("密码不一致");
    let resp = await proxy.$api.hcbApi.ResetPwd(pwdForm);
    if (resp.code == 200) {
      Message.success({ content: '修改成功', showIcon: true });
    } else {
      throw new Error(resp.message);
    }


  }
  catch (e) {

    Message.error({ content: `` + e.message, showIcon: true });
    return false;
  }

  return true;


};
const pwdHandleCancel = () => {
  pwdVisible.value = false;
}


//编辑组件
const userForm = ref(); //获取组件实例

//编辑组件提交表单事件
const handleBeforeOk = async () => {
  var result = await userForm.value.onSubmit();
  return result;

};
//编辑组件取消事件
const handleCancel = () => {

}

//展示添加/修改实体表单组件
const ShowEdit = () => {
  userForm.value.initData(jwtData.value.nameid);
  visible.value = true;
}

</script>


<style scoped lang="scss">
body {
  min-height: 100%;
}

.boxBg {

  width: 100%;
  height: 98%;
  position: absolute;

}


.popoverP {
  padding: 0 10px;
  cursor: pointer;
}

.hearBox {
  text-align: right;
  padding-right: 20px;
}

.arco-tabs-content .arco-tabs-content-item.arco-tabs-content-item-active {
  height: 920px;
  // position: relative;
  // clear: both;
  // height: 100%;
}

.layout-demo {
  position: relative;
  clear: both;
  height: 100%;
  background: var(--color-fill-2);
  border: 1px solid var(--color-border);
}

.layout-demo :deep(.arco-layout-sider) .logo {
  height: 32px;
  margin: 12px 8px;

}

.layout-demo :deep(.arco-layout-sider-light) .logo {}

.layout-demo :deep(.arco-layout-header) {
  height: 64px;
  line-height: 64px;
  background: var(--color-bg-3);
}

.arco-menu-inner {
  text-align: left;
}

.layout-demo :deep(.arco-layout-footer) {
  height: 48px;
  color: var(--color-text-2);
  font-weight: 400;
  font-size: 14px;
  line-height: 48px;
}

.layout-demo :deep(.arco-layout-content) {
  color: var(--color-text-2);
  font-weight: 400;
  font-size: 14px;
  background: var(--color-bg-3);
}

.layout-demo :deep(.arco-layout-footer),
.layout-demo :deep(.arco-layout-content) {

  color: var(--color-white);
  font-size: 16px;
  font-stretch: condensed;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
