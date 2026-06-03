<template>
  <div class="boxBg2">
    <a-space class="tableHead">

      <a-button id="btnAdd" type="primary" @click="addEntity"  v-hasPermission="'menu:add'">添加</a-button>
      <a-button id="btnEdit" type="primary" status="success" :disabled="selectedKeys.length != 1"
        @click="editEntity"  v-hasPermission="'menu:edit'">修改</a-button>
      <a-button id="btnDelete" type="primary" status="danger" :disabled="selectedKeys.length == 0"
        @click="deleteEntity"  v-hasPermission="'menu:delete'">删除</a-button>
      <a-input-search v-model="pagination.kw" :style="{ width: '420px' }" placeholder="请输入菜单名称" search-button
        :allow-clear="true" @search="btnSearch">
        <template #button-icon>
          <icon-search />
        </template>
        <template #button-default>
          搜索
        </template>
      </a-input-search>

    </a-space>

    <a-table row-key="menuId" :row-selection="rowSelection" v-model:selectedKeys="selectedKeys" :columns="columns"
      :data="data" :pagination="false" :loading="loading" :hide-expand-button-on-empty="true">
      <template #menuType="{ record }">
        <a-tag color="blue" v-show="record.menuType == 1">
          目录
        </a-tag>
        <a-tag color="green" v-show="record.menuType == 0">
          页面
        </a-tag>
        <a-tag color="orange" v-show="record.menuType == 2">
          子页面
        </a-tag>
        <a-tag color="orangered" v-show="record.menuType == 3">
          按钮
        </a-tag>
      </template>
      <template #menuStatus="{ record }">
        <a-tag color="green" v-show="record.menuStatus == 1">
          正常
        </a-tag>
        <a-tag color="red" v-show="record.menuStatus == 0">
          禁用
        </a-tag>

      </template>
    </a-table>
    <a-pagination class="pagination" :current="pagination.currentPage" @change="currentPagechange"
      :page-size="pagination.pageSize" :total="pagination.totalCount" show-total />
  </div>


  <a-modal v-model:visible="visible" :on-before-ok="handleBeforeOk" @cancel="handleCancel" draggable>
    <template #title>
      编辑菜单
    </template>
    <div>
      <MenuForm ref="menuForm" :menuId="currSelectId"></MenuForm>


    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import MenuForm from '@/components/views/MenuForm.vue';
import { RequestModel } from '@/api/hcbApi';
import { Message, Modal } from '@arco-design/web-vue';

import { ref, defineComponent, getCurrentInstance, onBeforeMount, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted, onMounted, defineAsyncComponent, reactive } from 'vue';
const { proxy } = getCurrentInstance() as any
const visible = ref(false);
const pagination = ref<RequestModel>();
const currSelectId = ref(0);
const selectedKeys = ref([]);
const loading = ref(false);

//表头
const columns = [{
  title: '菜单名称',
  dataIndex: 'menuName',
}, {
  title: '菜单类型',
  slotName: 'menuType',
}, {
  title: '显示顺序',
  dataIndex: 'menuSort',
}, {
  title: '请求地址',
  dataIndex: 'menuUrl',
}, {
  title: '权限标识',
  dataIndex: 'authorize',
}, {
  title: '状态',
  slotName: 'menuStatus',
}];
//表格数据
const data = ref([])

//表格列选项
const rowSelection = {
  type: 'checkbox',
  showCheckedAll: true
};
//编辑组件
const menuForm = ref(); //获取组件实例

//编辑组件提交表单事件
const handleBeforeOk = async () => {
  var result = await menuForm.value.onSubmit();
  if (result)
    btnSearch();
  return result;

};
//编辑组件取消事件
const handleCancel = () => {

}
//分页码改变事件
const currentPagechange = (page: number) => {
  pagination.value.currentPage = page;
  loadData();
}

//搜索按钮点击事件
const btnSearch = () => {
  pagination.value.currentPage = 1;
  loadData();

}

//加载列表数据
const loadData = async () => {

  try {
    loading.value = true;
    let resp = await proxy.$api.hcbApi.GetMenuTreePageList(pagination.value);
    console.log(resp);
    if (resp.code == 200) {
      pagination.value.totalCount = resp.totalCount;
      data.value = resp.data;
      console.log(data);

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

//添加按钮事件
const addEntity = () => {
  ShowEdit(0);

}
//修改按钮事件
const editEntity = () => {
  if (selectedKeys.value.length == 0) {
    Message.info({ content: '请选择需要修改的记录', showIcon: true });
    return false;
  }
  if (selectedKeys.value.length > 1) {
    Message.info({ content: '只能选择一条记录进行编辑', showIcon: true });
    return false;
  }
  ShowEdit(selectedKeys.value[0]);

}
//删除按钮事件
const deleteEntity = () => {
  if (selectedKeys.value.length == 0) {
    Message.info({ content: '请选择需要修改的记录', showIcon: true });
    return false;
  }
  Modal.confirm({
    content: '是否确认要删除选中的数据', onOk: async () => {
      var req = {
        MenuIds: selectedKeys.value
      }
      let resp = await proxy.$api.hcbApi.RemoveMenu(req);
      if (resp.code == 200) {
        loadData();

      } else {
        Message.info({ content: resp.message, showIcon: true });
      }

    }
  });


  //ShowEdit(selectedKeys.value[0]);

}

//展示添加/修改实体表单组件
const ShowEdit = (id: any) => {
  currSelectId.value = id;

  menuForm.value.initData(id);
  visible.value = true;
}


defineComponent({
  created() {
    console.log("app-created")
  }
});


onBeforeMount(() => {
  pagination.value = new RequestModel();

})

onMounted(() => {
  loadData();
})

onBeforeUpdate(() => {

})

onUpdated(() => {

})

onBeforeUnmount(() => {

})

onUnmounted(() => {

})




</script> 

<style scoped lang="scss">
body {
  min-height: 100%;
}

.boxBg2 {
  width: 96%;
  height: 100%;
  padding: 0 1%;
  position: absolute;

}

.pagination {
  float: right;
  margin-top: 20px;
}
</style>
