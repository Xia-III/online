<template>
  <div class="boxBg2">
    <a-space class="tableHead" style="color:rgb(var(--gray-10));font-size:14px;">

      <a-button type="primary" @click="editMerchant" v-hasPermission="'merchant:add'">添加商户</a-button>
      <div> <span>创建日期:</span> <a-date-picker style="width: 200px;" placeholder="请选择开始日期"
          v-model="pagination.startDate" /> -
        <a-date-picker style="width: 200px;" placeholder="请选择结束日期" v-model="pagination.endDate" />
      </div>
      <a-input-search v-model="pagination.kw" :style="{ width: '420px' }" placeholder="账户/手机/姓名" search-button
        @search="btnSearch">
        <template #button-icon>
          <icon-search />
        </template>
        <template #button-default>
          搜索
        </template>
      </a-input-search>

    </a-space>

    <a-table row-key="merchantEntryId" :row-selection="rowSelection" v-model:selectedKeys="selectedKeys"
      :columns="columns" :data="data" :pagination="false" :loading="loading" :hide-expand-button-on-empty="true">

      <template #optional="{ record }">
        <a-space class="">
          <a-space>
            <template #split>
              <a-divider direction="vertical" />
            </template>
            <a-tag @click="toMerchantDetail(record.merchantEntryId, record.accountName)" color='arcoblue'>详细</a-tag>
            <a-tag @click="toMerchantBankCardUpdate(record.merchantEntryId, record.accountName)"
              color='arcoblue'>变更结算卡</a-tag>
            <a-tag @click="showWxAuth(record.merchantEntryId, record.showName)" color='arcoblue'>新增授权</a-tag>
          </a-space>
        </a-space>
      </template>
    </a-table>
    <a-pagination class="pagination" :current="pagination.currentPage" @change="currentPagechange"
      :page-size="pagination.pageSize" :total="pagination.totalCount" show-total />
  </div>


  <a-modal v-model:visible="wxAuthShow" title="变更授权目录" @cancel="handleCancel" @before-ok="btnWxAuth">
    <a-form>
      <a-form-item label="商户">
        <a-input v-model="showName" disabled />
      </a-form-item>
      <a-form-item label="子商户号" required>
        <a-input v-model="subMerchantNo" />
      </a-form-item>
      <a-form-item label="授权Url" required>
        <a-input v-model="authUrl" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { Options, Vue } from 'vue-class-component';
import { RequestModel } from '@/api/hcbApi';
import { menuItem, menuType } from '@/api/index';
import { useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue';
import { ref, toRaw, defineComponent, getCurrentInstance, onBeforeMount, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted, onMounted, defineAsyncComponent, reactive, onActivated } from 'vue';
const { proxy } = getCurrentInstance() as any
const visible = ref(false);
const pagination = ref<RequestModel>();
const currSelectId = ref(0);
const selectedKeys = ref([]);
const loading = ref(false);
const wxAuthShow = ref(false);
const showName = ref('');
const subMerchantNo = ref('');
const merchantId = ref(0);
const authUrl = ref('https://www.huacaizn.com/;https://www.huanxizn.com/')

//表头
const columns = [{
  title: '姓名',
  dataIndex: 'accountName',
}, {
  title: '身份证号',
  dataIndex: 'accountIdCard',
}, {
  title: '开户账号',
  dataIndex: 'accountNo',
}, {
  title: '手机号',
  dataIndex: 'bindMobile',
}, {
  title: '联行号',
  dataIndex: 'bankCode',
}, {
  title: '商户号',
  dataIndex: 'merchantNo',
}, {
  title: '费率（万分之几）',
  dataIndex: 'rate',
}, {
  title: '展示名',
  dataIndex: 'showName',
}, {
  title: '创建时间',
  dataIndex: 'creationTime',
}
  , {
  title: '操作',
  slotName: 'optional',
}];
//表格数据
const data = ref([])

//表格列选项
const rowSelection = {
  type: 'checkbox',
  showCheckedAll: true
};

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
    let resp = await proxy.$api.hcbApi.GetMerchantEntryPageList(pagination.value);
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



const userForm = ref(); //获取组件实例
const handleBeforeOk = () => {
  return userForm.value.onSubmit();

};
const handleCancel = () => {

}
const btnWxAuth = async () => {
  console.log(proxy.$api.checkIsEmpty(authUrl.value));

  try {
    if (proxy.$api.checkIsEmpty(authUrl.value))
      throw new Error('请输入授权目录');
    if (proxy.$api.checkIsEmpty(subMerchantNo.value))
      throw new Error('请输入微信子商户号');

    var req = {
      MerchantEntryId: merchantId.value,
      AuthUrl: authUrl.value,
      SubMerchantNo: subMerchantNo.value
    };
    let resp = await proxy.$api.hcbApi.WxPublicApply(req);
    console.log(resp);
    if (resp.code == 200) {

      Message.info({ content: `` + resp.message, showIcon: true });
      return true;

    } else {
      throw new Error(resp.message);
    }


  }
  catch (e) {
    Message.error({ content: `` + e.message, showIcon: true });
    return false;
  }
  finally {

  }


}
const showWxAuth = (id: any, name: any) => {
  wxAuthShow.value = true;
  showName.value = name;
  subMerchantNo.value = '';
  merchantId.value = id;

}



const editUser = (userId: any) => {
  visible.value = true;
}

const editMerchant = (id: any) => {

  let item24: menuItem = {
    menuName: "添加商户" + name,
    menuId: "1_3_1",
    menuUrl: 'merchantForm',
    parentId: "1_3",
    menuType: menuType.subpage,
    children: [],
    authorize: 'merchantForm'
  };
  proxy.$emit('getCurrTable', (menu: any) => {
    console.log(menu);
    item24.menuId = menu.menuId + '_' + id
    item24.parentId = menu.menuId

  });
  console.log(item24);
  proxy.$emit('addTab', item24);



}
const toMerchantDetail = (id: any, name: any) => {
  // let item24: menuItem = {
  //   name: "商户详情",
  //   key: "1_3_2",
  //   url: 'merchantDetail',
  //   parentId: "1_3",
  //   menuType: menuType.subpage,
  //   icon: '',
  //   items: []
  // };
  // proxy.$emit('addTab', item24);

  let item24: menuItem = {
    menuName: "商户详情[" + name + "]",
    menuId: "1_3_2",
    menuUrl: 'merchantDetail',
    parentId: "1_3",
    menuType: menuType.subpage,
    children: [],
    authorize: 'merchantDetail',
    params: { 'merchantEntryId': id }
  };
  proxy.$emit('getCurrTable', (menu: any) => {

    item24.menuId = menu.menuId + '_' + id
    item24.parentId = menu.menuId

  });

  proxy.$emit('addTab', item24);

}
const toMerchantBankCardUpdate = (id: any, name: any) => {
  // let item24: menuItem = {
  //   name: "商户详情",
  //   key: "1_3_2",
  //   url: 'merchantDetail',
  //   parentId: "1_3",
  //   menuType: menuType.subpage,
  //   icon: '',
  //   items: []
  // };
  // proxy.$emit('addTab', item24);

  let item24: menuItem = {
    menuName: "结算卡信息变更[" + name + "]",
    menuId: "1_3_2",
    menuUrl: 'merchantBankCardUpdateFormView',
    parentId: "1_3",
    menuType: menuType.subpage,
    children: [],
    authorize: 'merchantBankCardUpdateFormView',
    params: { 'merchantEntryId': id }
  };
  proxy.$emit('getCurrTable', (menu: any) => {

    item24.menuId = menu.menuId + '_updateBnakCard' + id
    item24.parentId = menu.menuId

  });

  proxy.$emit('addTab', item24);

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

onActivated(() => {
  // authUrl.value = 'baidu.com';
  // console.log(authUrl.value);
  // alert(111);
})







</script> 



<!-- 
<script lang = "ts" >
import { Options, Vue } from 'vue-class-component';
import { Message } from '@arco-design/web-vue';
import { setToken, UserInfo, addUsers, deleteAll, deleteUsers, getUserLists } from '@/utils/auth'
import {
  IconCaretRight,
  IconCaretLeft,
  IconHome,
  IconCalendar,
} from '@arco-design/web-vue/es/icon';
import { menuItem, menuType } from '@/api/index';
import UserForm from '@/components/UserForm.vue';

@Options({
  components: {
    IconCaretRight,
    IconCaretLeft,
    IconHome,
    IconCalendar,
    UserForm
  },
})

export default class User extends Vue {
  show = true;
  rowSelection = {
    type: 'checkbox',
    showCheckedAll: true
  };
  visible = false;
  editUser() {
    this.visible = true;
  }
  async handleBeforeOk() {
    //this.$refs.userForm.onSubmit();
    return true;

  }
  handleCancel() {

  }
  columns = [{
    title: '登录账号',
    dataIndex: 'name',
  }, {
    title: '姓名',
    dataIndex: 'salary',
  }, {
    title: '联系电话',
    dataIndex: 'address',
  }, {
    title: '余额',
    dataIndex: 'email',
  }, {
    title: '支付分余额',
    dataIndex: 'email',
  }, {
    title: '状态',
    dataIndex: 'email',
  }, {
    title: '最近登录',
    dataIndex: 'email',
  }, {
    title: '登录次数',
    dataIndex: 'email',
  }, {
    title: '创建时间',
    dataIndex: 'email',
  }
    , {
    title: '操作',
    slotName: 'optional'
  }];
  dataList = [{
    key: '1',
    name: 'Jane Doe',
    first: 'Jane',
    last: 'Doe',
    salary: 23000,
    address: '32 Park Road, London',
    email: 'jane.doe@example.com'
  }, {
    key: '2',
    name: 'Alisa Ross',
    first: 'Alisa',
    last: 'Ross',
    salary: 25000,
    address: '35 Park Road, London',
    email: 'alisa.ross@example.com'
  }, {
    key: '3',
    name: 'Kevin Sandra',
    first: 'Kevin',
    last: 'Sandra',
    salary: 22000,
    address: '31 Park Road, London',
    email: 'kevin.sandra@example.com'
  }, {
    key: '4',
    name: 'Ed Hellen',
    first: 'Ed',
    last: 'Hellen',
    salary: 17000,
    address: '42 Park Road, London',
    email: 'ed.hellen@example.com'
  }, {
    key: '5',
    name: 'William Smith',
    first: 'William',
    last: 'Smith',
    salary: 27000,
    address: '62 Park Road, London',
    email: 'william.smith@example.com'
  }];

  toQualificationForm() {
    let item24: menuItem = {
      name: "资质详情",
      key: "1_1_1",
      url: 'qualificationForm',
      parentId: "1_2",
      menuType: menuType.subpage,
      icon: '',
      items: []
    };
    this.$emit('addTab', item24);

  }

  created() {

  }
  mounted() {

  }


}
</script> -->


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
</style>
