<template>
  <a-form :model="reqEntity" :style="{ width: '100%' }">

    <a-form-item field="loginName" label="登录账号" label-col-flex="80px" required>
      <a-input :disabled="reqEntity.userId != 0" v-model="reqEntity.loginName" placeholder="请输入登录账号" />
    </a-form-item>


    <a-form-item field="nickName" label="姓名" label-col-flex="80px" required>
      <a-input v-model="reqEntity.nickName" placeholder="请输入姓名" />
    </a-form-item>

    <a-form-item field="mobilePhone" label="手机号" label-col-flex="80px">
      <a-input v-model="reqEntity.mobilePhone" placeholder="请输入手机号" />
    </a-form-item>
    <a-form-item field="wxAppId" label="微信APPID" label-col-flex="80px">
      <a-input v-model="reqEntity.wxAppId" placeholder="请输入关联微信APPID" />
    </a-form-item>
    <a-form-item field="payAuthDir" label="授权目录" label-col-flex="80px">
      <a-input v-model="reqEntity.payAuthDir" placeholder="请输入默认支付授权目录" />
    </a-form-item>




  </a-form>
</template>

<script setup lang="ts">
import { defineExpose, reactive, h, getCurrentInstance, ref, onBeforeMount } from "vue";
import { IconCalendar } from '@arco-design/web-vue/es/icon';
import { SaveUserReq } from '@/api/hcbApi';
import { Message } from '@arco-design/web-vue';
import { el, fa } from "element-plus/es/locale";
const { proxy } = getCurrentInstance() as any
const props = defineProps(['menuId'])
const reqEntity = ref<SaveUserReq>();

onBeforeMount(() => {
  reqEntity.value = new SaveUserReq();

})

const treeData = ref([]);
const menuIds = ref([]);

const form = reactive({
  name: '',
  post: '',
  isRead: false,
  radio: "1"
});




const GetSystemRoleTreeData = async () => {
  try {

    let resp = await proxy.$api.hcbApi.GetSystemRoleTreeData();
    console.log(resp);
    if (resp.code == 200) {
      treeData.value = resp.data;

    }
    else {
      Message.info({ content: `${resp.Message}`, showIcon: true });
    }
  } catch (e) {
    Message.info({ content: `${e}`, showIcon: true });

  } finally {

  }

}


const checkForm = () => {
  if (proxy.$api.checkIsEmpty(reqEntity.value?.loginName))
    throw new Error("请输入登录账号");


  if (proxy.$api.checkIsEmpty(reqEntity.value?.nickName))
    throw new Error("请输入姓名");

}


const initData = (menuId: any) => {
  GetSystemRoleTreeData();
  if (!menuId) {
    reqEntity.value = new SaveUserReq();
    reqEntity.value.roleIds = [];
    reqEntity.value.userId = 0;
    reqEntity.value.status = 1;
  } else {
    getEntity(menuId);
  }

}

const getEntity = async (id: any) => {

  try {
    let resp = await proxy.$api.hcbApi.GetUser(id);
    if (resp.code == 200) {
      reqEntity.value = resp.data;

    } else {
      throw new Error(resp.message);
    }


  } catch (e) {
    Message.error({ content: `` + e.message, showIcon: true });
    return false;
  }
}


const onSubmit = async () => {
  //console.log(props.menuId);
  //console.log(reqEntity.value?.parentId);
  try {
    checkForm();
    let resp = await proxy.$api.hcbApi.SaveUser(reqEntity.value);

    if (resp.code == 200) {
      Message.success({ content: `` + resp.message, showIcon: true });
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
defineExpose({ onSubmit, initData });
</script>
<!-- 

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

@Options({
  components: {
  },
  props: {
    userId: { type: Number },

  }
})
export default class UserForm extends Vue {
  form = {
    name: '',
    post: '',
    isRead: false,
    radio: "1"
  };

  onSubmit() {
    return true;

  }

}
</script> -->

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.ctitle {
  padding-left: 15px;
  padding-top: 0px;
  text-align: left;
  font-size: large;
  font-weight: bold;
}

.cfield {
  font-size: large;
  font-weight: bold;
}

.van-field {
  padding: 0 0px;
}
</style>
