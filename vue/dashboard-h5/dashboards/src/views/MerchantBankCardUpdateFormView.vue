<template>
  <div class="boxBg2">
    <a-steps style="margin-top:20px;" changeable :current="current">
      <a-step>信息录入</a-step>
      <a-step>完成</a-step>
    </a-steps>


    <div :style="{
      width: '100%',
      height: '200px',
      textAlign: 'center',
      background: 'var(--color-bg-2)',
      color: '#C2C7CC',
    }">

      <!-- 第一步 -->
      <div class="formBox" style="text-algin:center;padding-bottom:100px" v-if="current == 1">
        <a-form :model="merchantEntry">

          <a-row :gutter="16">
            <a-col :span="20">
              <a-form-item label="资质照片" label-col-flex="120px" required>
                <a-space :style="{ width: '100%' }">                
                  <UploadItem :tip="'银行卡带卡号面'" :is-auto-upload="true" :credential-type="'BANK_CARD'"
                    @on-upload-success="onUploadSuccess" @on-change-success="onUploadChangeSuccess" />
                </a-space>
              </a-form-item>
            </a-col>

          </a-row>
          <a-row :gutter="16">
            <a-col :span="20">
              <a-form-item field="accountNo" label="开户账号" label-col-flex="120px" required>
                <a-input v-model="merchantEntry.accountNo" placeholder="请输入开户账号" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="10">
              <a-form-item label="开户银行" label-col-flex="120px">
                <a-select v-model="bankViewId" :allow-search="{ retainInputValue: true }" :options="bankViews"
                  :field-names="bankViewFieldNames" placeholder="请选择开户银行" @change="bankViewIdChange" />
              </a-form-item>
            </a-col>
            <a-col :span="10">
              <a-form-item label="支行所在城市" label-col-flex="120px">
                <BankAreasCascader @on-change-success="bankOnChangeSuccess" />
              </a-form-item>
            </a-col>

          </a-row>
          <a-row :gutter="16">
            <a-col :span="10">
              <a-form-item label="支行详情" label-col-flex="120px">
                <a-select @focus="onFocus" v-model="merchantEntry.bankCode" :allow-search="{ retainInputValue: true }"
                  :options="banks" :field-names="bankFieldNames" placeholder="请选择开户支行关键字搜索" :loading="bankloading"
                  allow-clear @search="handleSearch" @dropdown-reach-bottom="onDropdown" @change="bankCodeChange" />
              </a-form-item>
            </a-col>
            <a-col :span="10">
              <a-form-item field="bankCode" label="支行联行号" label-col-flex="120px" required>
                <a-input v-model="merchantEntry.bankCode" placeholder="请输入联行号" />
              </a-form-item>
            </a-col>

          </a-row>

      
      
          <a-row :gutter="16">
            <a-col :span="20">
              <div class="btnBox"> <a-button type="primary" :loading="visible" @click="onNext">确认提交</a-button>
              </div>

            </a-col>

          </a-row>


        </a-form>


      </div>
      <!-- 第一步结束 -->
      <!-- 第二步 -->

      <!-- 第二步结束 -->
      <div class="formBox" v-else>
        <a-result status="success" title="">
          <template #subtitle>
            提交成功
          </template>
          <template #extra>
            <a-space>
              <!-- <a-button type='primary' @click="btnReset">继续创建商户</a-button> -->
            </a-space>
          </template>
        </a-result>
      </div>
      <!-- <a-space size="large">
        <a-button type="secondary" :disabled="current <= 1" @click="onPrev">
          <IconLeft />上一步
        </a-button>
        <a-button type="primary" :disabled="current >= 3" @click="onNext">
          下一步
          <IconRight />
        </a-button>
      </a-space> -->
    </div>
  </div>
  <a-modal v-model:visible="visible" @ok="handleOk" @cancel="handleCancel" :simple="true" :footer="false" :mask="false"
    :width="70">
    <a-spin tip="正在请求..." />
  </a-modal>
</template>

<script lang="ts" setup>
import { h, ref, defineComponent, getCurrentInstance, onBeforeMount, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted, onMounted, defineAsyncComponent, reactive } from 'vue';
import { IconCalendar } from '@arco-design/web-vue/es/icon';
import { MerchantEntry, BankView, GetBanksReq } from '@/api/hcbApi';
import { Message, Modal } from '@arco-design/web-vue';
import Areas from '@/utils/areas';
import UploadItem from '@/components/UploadItem.vue';
import AreasCascader from '@/components/AreasCascader.vue';
import BankAreasCascader from '@/components/BankAreasCascader.vue';
import { fa, tr } from 'element-plus/es/locale';
import { kebabCase } from 'element-plus/es/utils';
const { proxy } = getCurrentInstance() as any
import { useRoute } from 'vue-router';
var current = ref(1);
var visible = ref(false);
var form = reactive({
  value1: '',
  value2: '',
  value3: '',
  value4: '',
  value5: '',
  radio: "1",
  section: '',
  options: '',
  payCompany: '华彩支付'
});
const areasCascader = ref();
var merchantEntry = ref<MerchantEntry>();
var merchantIndex = ref("");
var qualificationId = ref(-1);
var bankViewFieldNames = { value: 'bankViewId', label: 'name' }
var bankFieldNames = { value: 'bankCode', label: 'name' }
var bankViews = ref<Array<BankView>>([]);
var bankViewId = ref();
var bankCityId = ref();
var banks = ref([]);
var bankCode = ref();
var bankloading = ref(false);
var currentPage = ref(1);
var pageSize = ref(10);
var isloadFinsh = ref(false);
var kw = ref('');
var fileList = [];
var merchantEntryId = ref();
const merchant = ref({});
const treeData = [
  "18312109702-何先生",
  "13612365456-测试"

];
const payCompanys = [
  "华彩支付",
  "哆啦宝"

];
const onProgress = (currentFile: any) => {

}



const route = useRoute()

onBeforeMount(() => {
  merchantEntry.value = new MerchantEntry();
  bankViews.value = [];
  merchantEntryId.value = route.params.merchantEntryId;
  GetBankViews();
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


const GetBankViews = async () => {
  try {
    let resp = await proxy.$api.hcbApi.GetBankViewList();
    if (resp.code == 200) {
      bankViews.value = resp.data;

    }
    else {
      Message.info({ content: `${resp.Message}`, showIcon: true });
    }
  } catch (e) {
    Message.info({ content: `${e}`, showIcon: true });

  } finally {

  }

}

const onUploadChangeSuccess = (type: string, data2: any) => {
  console.log(type);
  console.log(data2);

  var old = fileList.find(x => x.type == type);
  if (old) {
    old.File = data2.file;

  } else {
    var fileItem = {};
    fileItem.type = type;
    fileItem.File = data2.file;
    fileList.push(fileItem);
  }


  if (type == 'FRONT_OF_ID_CARD') {

  }
  else if (type == 'BANK_CARD') {


  } else if (type == 'BACK_OF_ID_CARD') {

  } else if (type == 'SIGN_BOARD') {

  }
  else if (type == 'INTERIOR_PHOTO') {

  }


}
const areasOnChangeSuccess = (data: any) => {
  merchantEntry.value.regionCode = data;
  var countyCode = data;
  var cityCode = '';
  var provinceCode = '';
  var county = Areas.countyList.find(x => x.areaCode == countyCode);
  if (county) {
    cityCode = county.parentAreaCode;
    merchantEntry.value.county = county.name;
  }
  var city = Areas.cityList.find(x => x.areaCode == cityCode);
  if (city) {
    merchantEntry.value.city = city.name;
    provinceCode = city.parentAreaCode;
  }
  var province = Areas.provinceList.find(x => x.areaCode == provinceCode);
  if (province) {
    merchantEntry.value.province = province.name;

  }


}
const bankOnChangeSuccess = (data: any) => {
  bankCityId.value = data;
  banks.value = [];

}

const bankViewIdChange = (data: any) => {
  merchantEntry.value.bankViewId = data;

}

const bankCodeChange = (data: any, data2: any) => {


}



const onUploadSuccess = (type: string, data: any) => {

  if (type == 'FRONT_OF_ID_CARD') {
    merchantEntry.value.accountIdCard = data.idNumber;
    merchantEntry.value.accountName = data.name;
    merchantEntry.value.address = data.address;
    areasCascader.value.setAddress(data);

  }
  else if (type == 'BANK_CARD') {
    merchantEntry.value.accountNo = data.cardNumber;
    var bankView = bankViews.value.find(x => x.name == data.bankName);
    if (bankView) {
      bankViewId.value = bankView.bankViewId;
    }

  } else if (type == 'BACK_OF_ID_CARD') {
    merchantEntry.value.idCardStartDate = data.statrTime;
    merchantEntry.value.idCardEndDate = data.endTime;
  }



}

const handleSearch = async (value: any) => {

  if (proxy.$api.checkIsEmpty(bankViewId.value)) {
    Message.info({ content: `请先选择开户银行`, showIcon: true });
    return false;
  }
  // if (proxy.$api.checkIsEmpty(bankCityId.value)) {
  //   Message.info({ content: `请先选择开户城市`, showIcon: true });
  //   return false;
  // }
  pageSize.value = 20;
  currentPage.value = 1;
  banks.value = [];
  isloadFinsh.value = false;
  kw.value = value;
  getBanks(kw.value);
}
const getBanks = async (kw: string) => {

  try {
    bankloading.value = true;
    var getBanksReq = new GetBanksReq();
    getBanksReq.bankViewId = bankViewId.value;
    getBanksReq.cityId = bankCityId.value;
    getBanksReq.kw = kw;
    getBanksReq.pageSize = pageSize.value;
    getBanksReq.currentPage = currentPage.value;
    let resp = await proxy.$api.hcbApi.GetBanks(getBanksReq);
    if (resp.code == 200) {
      if (resp.data.length < pageSize.value)
        isloadFinsh.value = true;

      banks.value = banks.value.concat(resp.data);
    }
    else {
      Message.info({ content: `${resp.Message}`, showIcon: true });
    }
  } catch (e) {
    Message.info({ content: `${e}`, showIcon: true });

  } finally {
    bankloading.value = false;
  }


}

const SaveMerchantEntry = async () => {

  try {
    visible.value = true;
    var formData = new FormData();
    var entity = merchantEntry.value;

    formData.append("MerchantEntryId", merchant.value.merchantEntryId);
    formData.append("AccountNo", entity.accountNo);
    formData.append("BankCode", entity.bankCode);
    formData.append("BankViewId", entity.bankViewId ? entity.bankViewId : '');
    formData.append("BankCityId", entity.bankCityId ? entity.bankCityId : '');
    var file3 = fileList.find(x => x.type == "BANK_CARD");
    formData.append("BankCardFrontFile", file3.File);
    //console.log(formData);

    // fileList.forEach(row => {
    //   data.append(row.type, row.File);
    // });


    let resp = await proxy.$api.hcbApi.SettlementCardAlteration(formData);
    console.log(resp);
    if (resp.code == 200) {

      return true;
    }
    else {
      Message.info({ content: `${resp.message}`, showIcon: true });
      return false;
    }
  } catch (e) {
    Message.info({ content: `${e}`, showIcon: true });
    return false;

  } finally {
    visible.value = false;
  }


}
const onDropdown = async () => {
  if (isloadFinsh.value == false) {
    currentPage.value = currentPage.value + 1;
    getBanks(kw.value);

  }



}


const onChange = (key: string) => {

}

const onPrev = () => {
  current.value = Math.max(1, current.value - 1)
}

const onNext = async () => {
  if (current.value == 1) {
    //商户进件，进件后上传资质图片

    if (checkRegisterPerson()) {


      var result = await SaveMerchantEntry();
      if (!result)
        return false;

    } else {
      return false;
    }

  }
  current.value = Math.min(3, current.value + 1)
}
const btnReset = () => {
  merchantEntry.value = new MerchantEntry();
  fileList = [];
  current.value = 1;

}

const checkRegisterPerson = () => {
  try {
    var file1 = fileList.find(x => x.type == "BANK_CARD");
    if (!file1)
      throw new Error("请上传银行卡正面图片");

    if (proxy.$api.checkIsEmpty(merchantEntry.value?.accountNo))
      throw new Error("请填写开户账号");
    if (proxy.$api.checkIsEmpty(merchantEntry.value?.bankCode))
      throw new Error("请填写联行号");

    return true;

  } catch (error) {
    Message.error({ content: `` + error, showIcon: true });
    return false;
  }

}

const setCurrent = (_current: number) => {
  current.value = _current;
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

.btnBox {
  width: 100%;
  text-align: center;
  margin: 30px 0;
}
</style>
