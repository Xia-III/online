<template>
  <a-form :model="saveMenuReq" :style="{ width: '100%' }">

    <a-form-item field="parentId" label="上级菜单" label-col-flex="80px" required>
      <a-tree-select v-model="saveMenuReq.parentId" :data="treeData" placeholder="请选择上级菜单"></a-tree-select>
    </a-form-item>
    <a-form-item field="menuType" label="菜单类型" label-col-flex="80px" required>
      <a-radio-group v-model="saveMenuReq.menuType">
        <a-radio :value="1">目录</a-radio>
        <a-radio :value="0">页面</a-radio>
        <a-radio :value="3">按钮</a-radio>
        <a-radio :value="2">子页面</a-radio>
      </a-radio-group>
    </a-form-item>

    <a-form-item field="menuStatus" label="菜单状态" label-col-flex="80px" required>
      <a-radio-group v-model="saveMenuReq.menuStatus">
        <a-radio :value="1">启用</a-radio>
        <a-radio :value="0">禁用</a-radio>
      </a-radio-group>
    </a-form-item>

    <a-form-item field="menuName" label="菜单名称" label-col-flex="80px" required>
      <a-input v-model="saveMenuReq.menuName" placeholder="请输入菜单名称" />
    </a-form-item>

    <a-form-item field="authorize" label="权限标识" label-col-flex="80px">
      <a-input v-model="saveMenuReq.authorize" placeholder="请输入权限标识" />
    </a-form-item>
    <a-form-item field="menuUrl" label="跳转连接" label-col-flex="80px">
      <a-input v-model="saveMenuReq.menuUrl" placeholder="请输入跳转连接" />
    </a-form-item>
    <a-form-item field="menuSort" label="显示排序" label-col-flex="80px">
      <a-input v-model="saveMenuReq.menuSort" placeholder="请输入显示排序" />
    </a-form-item>




  </a-form>
</template>

<script setup lang="ts">
import { defineExpose, reactive, h, getCurrentInstance, ref, onBeforeMount } from "vue";
import { IconCalendar } from '@arco-design/web-vue/es/icon';
import { SaveMenuReq } from '@/api/hcbApi';
import { Message } from '@arco-design/web-vue';
import { el, fa } from "element-plus/es/locale";
const { proxy } = getCurrentInstance() as any
const props = defineProps(['menuId'])
const saveMenuReq = ref<SaveMenuReq>();

onBeforeMount(() => {
  saveMenuReq.value = new SaveMenuReq();

})

const treeData = ref([]);

const form = reactive({
  name: '',
  post: '',
  isRead: false,
  radio: "1"
});


const GetMenuTreeData = async () => {
  try {

    let resp = await proxy.$api.hcbApi.GetMenuTreeData(1);
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

  if (saveMenuReq.value.parentId == undefined || saveMenuReq.value.parentId == null)
    throw new Error("请选择上级菜单");
  if (proxy.$api.checkIsEmpty(saveMenuReq.value?.menuName))
    throw new Error("请输入菜单名称");

  if (saveMenuReq.value.menuType == undefined || saveMenuReq.value.menuType == null)
    throw new Error("请选择菜单类型");

  if (saveMenuReq.value.menuStatus == undefined || saveMenuReq.value.menuStatus == null)
    throw new Error("请选择菜单状态");
}


const initData = (menuId: any) => {
  GetMenuTreeData();
  if (!menuId) {
    saveMenuReq.value = new SaveMenuReq();
    saveMenuReq.value.menuStatus = 1;
    saveMenuReq.value.menuType = 1;
    saveMenuReq.value.menuSort = 0;
  } else {
    getMenu(menuId);
  }

}

const getMenu = async (id: any) => {

  try {
    let resp = await proxy.$api.hcbApi.GetMenu(id);
    if (resp.code == 200) {
      saveMenuReq.value = resp.data;

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
  //console.log(saveMenuReq.value?.parentId);
  try {
    checkForm();
    let resp = await proxy.$api.hcbApi.SaveMenu(saveMenuReq.value);
    console.log(resp);
    if (resp.code == 200) {

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
