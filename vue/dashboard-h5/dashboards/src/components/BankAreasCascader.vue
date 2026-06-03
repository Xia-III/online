<template>
  <a-cascader :default-value="defaultOpt" :options="areasOptions" @change="handleChange" :field-names="areasfieldNames"
    placeholder="请选择地址" />
</template>

<script setup lang="ts">
import { defineExpose, reactive, ref, getCurrentInstance, onBeforeMount } from "vue";
import { IconEdit, IconPlus } from '@arco-design/web-vue/es/icon';
import { Message } from '@arco-design/web-vue';
import { BankArea } from '@/api/hcbApi';
import Areas from '@/utils/areas';
import { fa, fi } from "element-plus/es/locale";
const { proxy } = getCurrentInstance() as any
const props = defineProps(['defaultValue'])
// 这个emits声明选项不是必须的
const emits = defineEmits({
  // 没有校验
  onChangeSuccess: null
})
var areasOptions = ref([]);
var bankProvinces = [];
var bankCitys = [];
var defaultOpt = ref([]);
const areasfieldNames = { value: 'areaCode', label: 'name' }


onBeforeMount(() => {
  GetBankAreas();
  if (proxy.$api.checkIsEmpty(props.defaultValue) == false) {
    var cityCode = props.defaultValue;
    var provinceCode = '';

    var city = bankCitys.find(x => x.areaCode == cityCode);
    if (city) {
      provinceCode = city.parentAreaCode;
    }
    var arr = [];
    arr.push(provinceCode);
    arr.push(cityCode);
    defaultOpt.value = defaultOpt.value.push(arr);

  }


})
const GetBankAreas = async () => {
  try {
    let resp = await proxy.$api.hcbApi.GetBankAreas();
    console.log(resp);
    if (resp.code == 200) {
      // areasOptions = resp.data;
      bankProvinces = resp.data.bankProvinces;
      bankCitys = resp.data.bankCitys;
      areasOptions.value = bankProvinces
      areasOptions.value.forEach(row => {
        var bankCityItems = bankCitys.filter(x => x.parentAreaCode == row.areaCode);
        if (bankCityItems.length == 0)
          row.isLeaf = true;
        else {
          row.children = bankCityItems;
        }



      });

    }
    else {
      Message.info({ content: `${resp.Message}`, showIcon: true });
    }
  } catch (e) {
    Message.info({ content: `${e}`, showIcon: true });

  } finally {

  }

}

const handleChange = (path: any) => {
  emits('onChangeSuccess', path)
}

const onSubmit = () => {

};
const setAddress = (data: any) => {
  console.log(data);

  var countyCode = '';
  var cityCode = '';
  var provinceCode = '';


  var province = Areas.provinceList.find(x => x.name == data.province);
  if (province) {
    provinceCode = province.areaCode;
  }
  var city = Areas.cityList.find(x => x.name == data.city);
  if (city) {
    cityCode = city.areaCode;
  }
  var county = Areas.countyList.find(x => x.name == data.county);
  if (county) {
    countyCode = county.areaCode;
    emits('onChangeSuccess', countyCode)
  }
  var arr = [];

  arr.push(provinceCode);
  arr.push(cityCode);
  arr.push(countyCode);
  defaultOpt.value = defaultOpt.value.push(arr);
  console.log(arr);

};
defineExpose({ setAddress });
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
