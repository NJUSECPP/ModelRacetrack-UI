<template>
  <div class="fit">
    <q-card class="fixed-center q-py-md q-px-md">
    <q-card-section>
      <div class="text-h6">秘密设置</div>
    </q-card-section>
      <q-form
        class="q-gutter-md"
        style="min-width: 500px;"
      >
        <q-input
          filled
          v-model="localBaseUrl"
          label="后端请求的根地址（最后不加/）"
          :rules="[ val => !val || val.length === 0 || '注意后端跨域问题！']"
        />

        <div>
          <q-btn label="保存" @click="updateConfig" color="blue"/>
        </div>
      </q-form>
    </q-card>
  </div>
</template>

<script>
import {defineComponent} from 'vue'
import {showInfo} from "src/libs/message";

export default defineComponent({
  name: 'Home',
  activated() {
    this.active();
  },
  mounted() {
    this.active();
  },
  data() {
    return {
      localBaseUrl: "",
    }
  },
  methods: {
    active() {
      this.localBaseUrl = localStorage.getItem('baseUrl');
    },
    updateConfig() {
      localStorage.setItem('baseUrl', this.localBaseUrl);
      showInfo("保存成功")
    }
  }
})
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 300px
</style>
