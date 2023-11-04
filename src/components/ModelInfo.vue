<template>
  <q-dialog v-model="showing" position="top" class="q-pa-none" :persistent="editable" @hide="hide">
    <q-card
      height="1000px"
      style="min-width: 800px;"
      class="bg-white shadow-1 rounded-borders q-pa-md"
    >
      <q-form  @submit="save">
        <q-item class="justify-center q-pb-md">
          <q-item-label class="text-h5">模型信息</q-item-label>
        </q-item>
        <q-item dense>
          <q-item-section style="max-width: 250px; height: 56px">
            <q-item-label>模型id</q-item-label>
          </q-item-section>
          <q-input color="indigo-10" v-model="model.id" borderless readonly style="min-width: 470px" :rules="[requireCheck]"/>
        </q-item>
        <q-item dense>
          <q-item-section style="max-width: 250px; height: 56px">
            <q-item-label>模型名称</q-item-label>
          </q-item-section>
          <q-input color="indigo-10" v-model="model.name" :borderless="!editable" :readonly="!editable"
                   style="min-width: 470px" :rules="[requireCheck]"/>
        </q-item>


        <q-item dense>
          <q-item-section style="max-width: 250px; height: 56px">
            <q-item-label>生成代码错误最大重试次数</q-item-label>
          </q-item-section>
          <q-item-section style="max-width: 30px">
            <q-item-label>{{model.maxRetryTime}}</q-item-label>
          </q-item-section>
          <q-slider color="indigo-10" v-if="editable" v-model="model.maxRetryTime" label :min="0" :max="5" style="width: 440px" :rules="[positiveCheck]"/>
        </q-item>
        <q-separator class="q-my-md"/>
        <q-item class="justify-center q-pb-xl">
          <q-item-label class="text-h5">模板信息</q-item-label>
        </q-item>
        <q-item dense>
          <q-item-section style="max-width: 250px; height: 56px">
            <q-item-label>第一次提出问题的模板</q-item-label>
          </q-item-section>
          <q-input color="indigo-10" v-model="model.templateWhenFirstMessage"
                   type="textarea"
                   autogrow
                   :borderless="!editable" :readonly="!editable" style="min-width: 470px" :rules="[requireCheck]"/>
        </q-item>
        <q-item dense>
          <q-item-section style="max-width: 250px; height: 56px">
            <q-item-label>反馈编译错误的模板</q-item-label>
          </q-item-section>
          <q-input color="indigo-10" v-model="model.templateWhenCompileError"
                   type="textarea"
                   autogrow
                   :borderless="!editable" :readonly="!editable" style="min-width: 470px" :rules="[requireCheck]"/>
        </q-item>
        <q-item dense>
          <q-item-section style="max-width: 250px; height: 56px">
            <q-item-label>反馈运行时异常的模板</q-item-label>
          </q-item-section>
          <q-input color="indigo-10" v-model="model.templateWhenRuntimeError"
                   type="textarea"
                   autogrow
                   :borderless="!editable" :readonly="!editable" style="min-width: 470px" :rules="[requireCheck]"/>
        </q-item>
        <q-item dense>
          <q-item-section style="max-width: 250px; height: 56px">
            <q-item-label>反馈逻辑错误的模板</q-item-label>
          </q-item-section>
          <q-input color="indigo-10" v-model="model.templateWhenTestFail"
                   type="textarea"
                   autogrow
                   :borderless="!editable" :readonly="!editable" style="min-width: 470px" :rules="[requireCheck]"/>
        </q-item>
        <q-separator class="q-my-md"/>
        <q-item class="q-gutter-md justify-center ">
          <q-btn color="indigo-10" v-if="editable" type="submit" :loading="loading">保存</q-btn>
          <q-btn color="indigo-10" v-else @click="this.editable=true">编辑</q-btn>
          <q-btn color="indigo-10" flat @click="this.showing = false">返回</q-btn>
        </q-item>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import {defineComponent} from "vue";
import {updateModelById} from "src/api/modelApi";
import {showInfo, showWarn} from "src/libs/message";

export default defineComponent({
  name: 'ModelInfo',
  data() {
    return {
      showing: false,
      loading: false,
      editable: false,
      edited: false,
      model: {
        id: "",
        name: "",
        maxRetryTime: "",
        templateWhenFirstMessage: "",
        templateWhenCompileError: "",
        templateWhenRuntimeError: "",
        templateWhenTestFail: ""
      },
    }
  },
  methods: {
    requireCheck(val) {
      if (!val || val.length === '') {
        return "不能为空";
      }
      return true;
    },
    positiveCheck(val) {
      if (!val || val.length === '') {
        return "不能为空";
      }
      if (val < 0) {
        return "不能为负数";
      }
      return true;
    },
    show(model) {
      this.active(model, false);
    },
    edit(model) {
      this.active(model, true);
    },
    active(model, editable){
      this.model = {
        id: model.id,
        name: model.name,
        maxRetryTime: model.maxRetryTime,
        templateWhenFirstMessage: model.templateWhenFirstMessage,
        templateWhenCompileError: model.templateWhenCompileError,
        templateWhenRuntimeError: model.templateWhenRuntimeError,
        templateWhenTestFail: model.templateWhenTestFail
      };
      this.showing = true;
      this.editable = editable;
      this.edited = false;
    },
    save() {
      this.loading = true;
      updateModelById(this.model).then(() => {
        showInfo("保存成功")
        this.editable = false;
        this.edited = true;
      }).catch(err => {
        showWarn("保存失败");
      }).finally(() => {
        this.loading = false;
      })
    },
    hide(){
      if(this.edited){
        this.$emit("refresh");
      }
    }
  }
})

</script>

<style scoped>

</style>
