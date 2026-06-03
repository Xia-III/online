<template>
  <div class="boxBg2">
    <a-steps style="margin-top:20px;" changeable :current="current" @change="setCurrent">
      <a-step>填写信息</a-step>
      <a-step>选择结算方式</a-step>
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
      <div class="formBox" v-if="current == 1">
        <a-form :model="form">
          <a-row :gutter="16">
            <a-col :span="20">
              <a-form-item field="" label="资质类型" label-col-flex="100px" required>
                <a-space size="large">
                  <a-radio-group v-model="form.radio"> <a-radio value="1">个人</a-radio>
                    <a-radio value="2">个体户</a-radio>
                    <a-radio value="3">有限公司</a-radio></a-radio-group>

                </a-space>
              </a-form-item>
            </a-col>

          </a-row>
          <a-row :gutter="16">
            <a-col :span="10">
              <a-form-item field="value1" label="营业执照名称" label-col-flex="100px" required>
                <a-input v-model="form.value1" placeholder="please enter..." />
              </a-form-item>
            </a-col>
            <a-col :span="10">
              <a-form-item field="value2" label="营业执照证件" label-col-flex="100px" required>
                <a-input v-model="form.value2" placeholder="please enter..." />
              </a-form-item>
            </a-col>

          </a-row>
          <a-row :gutter="16">
            <a-col :span="10">
              <a-form-item field="value4" label="行业类别" label-col-flex="100px" required>
                <a-input v-model="form.value4" placeholder="please enter..." />
              </a-form-item>
            </a-col>
            <a-col :span="10">
              <a-form-item field="value5" label="经营类型" label-col-flex="100px" required>
                <a-input v-model="form.value5" placeholder="please enter..." />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="20">
              <a-form-item field="value4" label="经营地址" label-col-flex="100px" required>
                <a-input v-model="form.value4" placeholder="please enter..." />
              </a-form-item>
            </a-col>

          </a-row>
          <a-row :gutter="16">
            <a-col :span="20">
              <a-form-item field="value4" label="详细地址" label-col-flex="100px" required>
                <a-input v-model="form.value4" placeholder="please enter..." />
              </a-form-item>
            </a-col>

          </a-row>
          <a-row :gutter="16">
            <a-col :span="10">
              <a-form-item field="value4" label="登录账号" label-col-flex="100px" required>
                <a-input v-model="form.value4" placeholder="please enter..." />
              </a-form-item>
            </a-col>
            <a-col :span="10">
              <a-form-item field="value5" label="手机号码" label-col-flex="100px" required>
                <a-input v-model="form.value5" placeholder="please enter..." />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="10">
              <a-form-item field="value4" label="负责人姓名" label-col-flex="100px" required>
                <a-input v-model="form.value4" placeholder="please enter..." />
              </a-form-item>
            </a-col>
            <a-col :span="10">
              <a-form-item field="value5" label="证件类型" label-col-flex="100px" required>
                <a-input v-model="form.value5" placeholder="please enter..." />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="10">
              <a-form-item field="value4" label="证件号码" label-col-flex="100px" required>
                <a-input v-model="form.value4" placeholder="please enter..." />
              </a-form-item>
            </a-col>
            <a-col :span="10">
              <a-form-item field="value5" label="客服电话" label-col-flex="100px" required>
                <a-input v-model="form.value5" placeholder="please enter..." />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="10">
              <a-form-item field="value4" label="负责人微信" label-col-flex="100px">
                <a-input v-model="form.value4" placeholder="please enter..." />
              </a-form-item>
            </a-col>
            <a-col :span="10">
              <a-form-item field="value5" label="负责人QQ" label-col-flex="100px">
                <a-input v-model="form.value5" placeholder="please enter..." />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="20">
              <a-form-item label="资质照片" label-col-flex="100px" required>
                <a-space :style="{ width: '100%' }">
                  <UploadItem :tip="'身份证正面'" />
                  <UploadItem :tip="'身份证反面'" />
                  <UploadItem :tip="'门头照片'" />
                  <UploadItem :tip="'内景照片'" />

                </a-space>
              </a-form-item>
            </a-col>

          </a-row>

        </a-form>


      </div>
      <!-- 第一步结束 -->
      <!-- 第二步 -->
      <div class="formBox" v-else-if="current == 2">
        <a-form :model="form">

          <a-row :gutter="16">
            <a-col :span="10">
              <a-form-item field="value1" label="银行卡账户名" label-col-flex="100px" required>
                <a-input v-model="form.value1" placeholder="please enter..." />
              </a-form-item>
            </a-col>
            <a-col :span="10">
              <a-form-item field="value2" label="银行卡号" label-col-flex="100px" required>
                <a-input v-model="form.value2" placeholder="please enter..." />
              </a-form-item>
            </a-col>

          </a-row>
          <a-row :gutter="16">
            <a-col :span="10">
              <a-form-item field="value1" label="银行名称" label-col-flex="100px" required>
                <a-input v-model="form.value1" placeholder="please enter..." />
              </a-form-item>
            </a-col>
            <a-col :span="10">
              <a-form-item field="value2" label="联行号" label-col-flex="100px" required>
                <a-input v-model="form.value2" placeholder="please enter..." />
              </a-form-item>
            </a-col>

          </a-row>
          <a-row :gutter="16">
            <a-col :span="10">
              <a-form-item field="value1" label="开户支行省" label-col-flex="100px" required>
                <a-input v-model="form.value1" placeholder="please enter..." />
              </a-form-item>
            </a-col>
            <a-col :span="10">
              <a-form-item field="value2" label="开户支行市" label-col-flex="100px" required>
                <a-input v-model="form.value2" placeholder="please enter..." />
              </a-form-item>
            </a-col>

          </a-row>

          <a-row :gutter="16">
            <a-col :span="20">
              <a-form-item field="value4" label="银行卡照片" label-col-flex="100px" required>
                <a-space :style="{ width: '100%' }">
                  <UploadItem :tip="'银行卡带卡号面'" />


                </a-space>
              </a-form-item>
            </a-col>

          </a-row>

        </a-form>


      </div>
      <!-- 第二步结束 -->
      <div class="formBox" v-else>
        <a-result status="success" title="">
          <template #subtitle>
            提交成功
          </template>
          <template #extra>
            <a-space>
              <a-button type='primary'>前往创建商户</a-button>
            </a-space>
          </template>
        </a-result>
      </div>
      <a-space size="large">
        <a-button type="secondary" :disabled="current <= 1" @click="onPrev">
          <IconLeft />上一步
        </a-button>
        <a-button type="primary" :disabled="current >= 3" @click="onNext">
          下一步
          <IconRight />
        </a-button>
      </a-space>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineComponent, getCurrentInstance, onBeforeMount, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted, onMounted, defineAsyncComponent, reactive } from 'vue';
import UploadItem from '@/components/UploadItem.vue';
const { proxy } = getCurrentInstance() as any
var current = ref(1);
var form = reactive({
  value1: '',
  value2: '',
  value3: '',
  value4: '',
  value5: '',
  radio: "1"
});
const changeFile = (e: any) => {
    // 获取文件
    const file = e.target.files[0];
    console.log("file::::", file);


}

const onProgress = (currentFile: any) => {

}

const onPrev = () => {
  current.value = Math.max(1, current.value - 1)
}

const onNext = () => {
  current.value = Math.min(3, current.value + 1)
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
</style>
