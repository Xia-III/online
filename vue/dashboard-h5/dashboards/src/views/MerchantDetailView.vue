<template>
  <div class="boxBg2">
    <a-tabs default-active-key="1">
      <a-tab-pane key="1" title="商户信息">
        <div class="tabBox" style="">
          <h3>经营信息</h3>
          <a-row class="grid-demo" justify="space-around">
            <a-col :span="4">
              <div>展示名称:<span>{{ merchant.showName }}</span></div>
            </a-col>
            <a-col :span="4">
              <div>商户号: <span>{{ merchant.merchantNo }}</span></div>
            </a-col>

            <a-col :span="4">
              <div>支付费率(万分之几): <span>{{ merchant.rate }}</span></div>
            </a-col>

          </a-row>
          <a-row class="grid-demo" justify="space-around">
            <a-col :span="4">
              <div>地区:<span>{{ merchant.province }}-{{ merchant.city }}-{{ merchant.county }}</span> </div>
            </a-col>
            <a-col :span="4">
              <div>详细地址: <span>{{ merchant.address }}</span></div>
            </a-col>
            <a-col :span="4">
              <div>手机号: <span>{{ merchant.bindMobile }}</span></div>
            </a-col>

          </a-row>
          <a-row class="grid-demo" justify="space-around">
            <a-col :span="4">
              <div>华彩宝进件号: <span>{{ merchant.registerOrderId }}</span></div>
            </a-col>
            <a-col :span="4">
              <div>进件日期: <span>{{ merchant.creationTime }}</span></div>
            </a-col>
            <a-col :span="4">
              <div>单据ID: <span>{{ merchant.merchantEntryId }}</span></div>
            </a-col>

          </a-row>
          <h3>银行卡信息</h3>
          <a-row class="grid-demo" justify="space-around">
            <a-col :span="4">
              <div>开户姓名:<span>{{ merchant.accountName }}</span></div>
            </a-col>
            <a-col :span="4">
              <div>银行卡号: <span>{{ merchant.accountNo }}</span></div>
            </a-col>
            <a-col :span="4">
              <div>联行号: <span>{{ merchant.bankCode }}</span></div>
            </a-col>

          </a-row>
          <a-row class="grid-demo" justify="space-around">
            <a-col :span="4">
              <div>身份证号:<span>{{ merchant.accountIdCard }}</span> </div>
            </a-col>
            <a-col :span="4">
              <div>身份证开始日期: <span>{{ merchant.idCardStartDate }}</span></div>
            </a-col>
            <a-col :span="4">
              <div>身份证结束日期: <span>{{ merchant.idCardEndDate }}</span></div>
            </a-col>


          </a-row>

          <a-row class="grid-demo" justify="space-around">
            <a-col :span="7">
              <div>支行详情: <span>{{ merchant.bankName }}</span></div>
            </a-col>
            <a-col :span="1">

            </a-col>

            <a-col :span="4">

            </a-col>

          </a-row>




        </div>
        <a-space :size="50" style="text-algin:center;">
          <a-image
            :src='merchant.idCardFrontFilename'
            title='身份证正面' width="150" footer-position="outer">
            <template #extra>
              <div class="actions actions-outer">

                <span class="action" @click="onDownLoad"><icon-download /></span>

              </div>
            </template>
          </a-image>

          <a-image
          :src='merchant.idCardBackFilename'
            title='身份证反面' width="150" footer-position="outer">
            <template #extra>
              <div class="actions actions-outer">

                <span class="action" @click="onDownLoad"><icon-download /></span>

              </div>
            </template>
          </a-image>
          <a-image
          :src='merchant.signBoardFilename'
            title='门头照片' width="150" footer-position="outer">
            <template #extra>
              <div class="actions actions-outer">

                <span class="action" @click="onDownLoad"><icon-download /></span>

              </div>
            </template>
          </a-image>
          <a-image
          :src='merchant.interiorPhotoFilename'
            title='内景照片' width="150" footer-position="outer">
            <template #extra>
              <div class="actions actions-outer">

                <span class="action" @click="onDownLoad"><icon-download /></span>

              </div>
            </template>
          </a-image>
          <a-image
          :src='merchant.bankCardFrontFilename'
            title='银行卡' width="150" footer-position="outer">
            <template #extra>
              <div class="actions actions-outer">

                <span class="action" @click="onDownLoad"><icon-download /></span>

              </div>
            </template>
          </a-image>
        </a-space>
      </a-tab-pane>
      <!-- <a-tab-pane key="2" title="通道信息">
        <a-table :columns="columns" :data="data" :span-method="spanMethod" span-all
          :bordered="{ wrapper: true, cell: true }">
          <template #optiona="{ record }">
            <a-space direction="vertical">
              <span>收款银行类型:{{ record.name }}</span>
              <span>收款人:{{ record.name }}</span>
              <span>收款银行:{{ record.name }}</span>
              <span>收款银行卡号:{{ record.name }}</span>
              <span>联行号:{{ record.name }}</span>


            </a-space>

          </template>
          <template #optional="{ record }">
            <a-space class="">
              <a-tag @click="toQualificationForm(record.key)" color='arcoblue'>详情</a-tag>
              <a-tag @click="toQualificationForm(record.key)" color='arcoblue'>申请商户</a-tag>

            </a-space>

          </template>
        </a-table>
      </a-tab-pane> -->

    </a-tabs>

  </div>
</template>

<script lang="ts" setup>
import { h, ref, defineComponent, getCurrentInstance, onBeforeMount, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted, onMounted, defineAsyncComponent, reactive } from 'vue';
import { IconCalendar, IconDownload } from '@arco-design/web-vue/es/icon';

import { Message } from '@arco-design/web-vue';
import { useRoute } from 'vue-router';
const { proxy } = getCurrentInstance() as any
const visible2 = ref(true);
const merchant = ref({});
var defaultOpt = ref([]);
const areasfieldNames = { value: 'areaCode', label: 'name' }
const merchantEntryId = ref();
const spanMethod = ({ rowIndex, columnIndex }) => {
  if (rowIndex === 0 && (columnIndex != 1 && columnIndex != 2)) {
    return {
      rowspan: 2,
      colspan: 1
    }
  }
  // if (rowIndex === 0 && columnIndex === 4) {
  //   return {
  //     rowspan: 2,
  //     colspan: 1
  //   }
  // }
};
const columns = [
  {
    title: '支付通道',
    dataIndex: 'name',
  },
  {
    title: '支付产品',
    dataIndex: 'salary',
  },
  {
    title: '签约状态',
    dataIndex: 'address',
  },
  {
    title: '启用状态',
    dataIndex: 'email',
  },
  {
    title: '收款参数',
    slotName: 'optiona'
  },
  {
    title: '费率',
    dataIndex: 'fee',
  }, {
    title: '操作',
    slotName: 'optional'
  }
];
const data = [{
  key: '1',
  name: '华彩支付',
  salary: '支付宝',
  address: '已开通',
  email: '启用',
  fee: '5%'
}, {
  key: '2',
  name: '华彩支付',
  salary: '微信',
  address: '已开通',
  email: '启用',
  fee: '6%'
}];
const onDownLoad = () => {

  console.log('下载');

}
const route = useRoute()
onBeforeMount(() => {
  merchantEntryId.value = route.params.merchantEntryId;


})

onMounted(() => {
  loadData();
})

//加载列表数据
const loadData = async () => {

  try {
    proxy.$emit('showLoading', true);
    let resp = await proxy.$api.hcbApi.GetMerchantEntry(merchantEntryId.value);
    console.log(resp);
    if (resp.code == 200) {
      merchant.value = resp.data;

    } else {
      throw new Error(resp.message);
    }


  }
  catch (e) {
    Message.error({ content: `` + e.message, showIcon: true });
    return false;
  }
  finally {
    proxy.$emit('showLoading', false);
  }

}

</script>
<!-- 

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { Message } from '@arco-design/web-vue';
import { IconEdit, IconPlus } from '@arco-design/web-vue/es/icon';
@Options({
  components: {
    IconPlus, IconEdit
  },
})

export default class QualificationForm extends Vue {
  current = 1;

  form = {
    value1: '',
    value2: '',
    value3: '',
    value4: '',
    value5: '',
    radio: "1"
  }

  onChange() {

  }
  onProgress(currentFile: any) {

  }
  onPrev() {
    this.current = Math.max(1, this.current - 1)
  }

  onNext() {
    this.current = Math.min(3, this.current + 1)
  }

  setCurrent(current: number) {
    this.current = current
  }
  created() {

  }
  mounted() {

  }



}
</script> -->


<style scoped lang="scss">
.formBox {
  width: 90%;
  height: auto;

  margin: 30px auto;
  padding: 30px;
  border: 1px solid var(--color-border-2);
  border-radius: 6px;

}

.tabBox {
  color: rgba(0, 0, 0, .85);
  text-align: left;
  width: 98%;
  padding: 0 1%;
}

.grid-demo {
  padding-bottom: 30px;
  font-size: 14px;
}

.grid-demo span {
  color: rgb(85, 85, 85);
}

h3 {
  color: rgba(0, 0, 0, .85);
  text-align: left;
}

.arco-image-footer-caption-title {
  color: rgb(var(primary-6)) !important;
}
</style>
