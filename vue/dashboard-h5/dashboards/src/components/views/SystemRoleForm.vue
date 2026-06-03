<template>
  <a-form :model="reqEntity" :style="{ width: '100%' }">




    <a-form-item field="name" label="名称" label-col-flex="80px" required>
      <a-input v-model="reqEntity.name" placeholder="请输入名称" />
    </a-form-item>
    <a-form-item field="status" label="状态" label-col-flex="80px" required>
      <a-radio-group v-model="reqEntity.status">
        <a-radio :value="1">启用</a-radio>
        <a-radio :value="0">禁用</a-radio>
      </a-radio-group>
    </a-form-item>
    <a-form-item field="remark" label="备注" label-col-flex="80px">
      <a-input v-model="reqEntity.remark" placeholder="请输入备注" />
    </a-form-item>

    <a-form-item label="菜单权限" label-col-flex="80px"  style="padding-bottom:100px;">
      <a-tree-select v-model="reqEntity.menuIds"  :multiple="true" @change="treeChange" :tree-checkable="true" :data="treeData"
        placeholder="请分配菜单权限" :max-tag-count="1" :tree-check-strictly="true"></a-tree-select>
    </a-form-item>




  </a-form>
</template>

<script setup lang="ts">
import { defineExpose, reactive, h, getCurrentInstance, ref, onBeforeMount } from "vue";
import { IconCalendar } from '@arco-design/web-vue/es/icon';
import { SaveSystemRoleReq } from '@/api/hcbApi';
import { Message } from '@arco-design/web-vue';
import { el, fa } from "element-plus/es/locale";
const { proxy } = getCurrentInstance() as any
const props = defineProps(['menuId'])
const reqEntity = ref<SaveSystemRoleReq>();

onBeforeMount(() => {
  reqEntity.value = new SaveSystemRoleReq();

})

const treeData = ref([]);
const menuIds = ref([]);

const form = reactive({
  name: '',
  post: '',
  isRead: false,
  radio: "1"
});

const treeChange = () => {

  console.log(reqEntity.value.menuIds);


}



const GetMenuTreeData = async () => {
  try {

    let resp = await proxy.$api.hcbApi.GetMenuTreeData(0);
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


  if (proxy.$api.checkIsEmpty(reqEntity.value?.name))
    throw new Error("请输入名称");

  if (reqEntity.value.status == undefined || reqEntity.value.status == null)
    throw new Error("请选择状态");
}


const initData = (menuId: any) => {
  GetMenuTreeData();
  if (!menuId) {
    reqEntity.value = new SaveSystemRoleReq();
    reqEntity.value.menuIds=[];
    reqEntity.value.status = 1;
  } else {
    getEntity(menuId);
  }

}

const getEntity = async (id: any) => {

  try {
    let resp = await proxy.$api.hcbApi.GetSystemRole(id);
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
    let resp = await proxy.$api.hcbApi.SaveSystemRole(reqEntity.value);
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
