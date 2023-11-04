<template>
  <q-page>
    <div class="bg-accent full-width q-px-lg q-pb-sm"
         style="height: 80px;border-bottom: 1px solid #ececec;border-right: 1px solid #ececec;">
      <q-input style="font-size: small" v-model="modelKeyword"  @change="changeModelKeyword" label="搜索">
        <template v-slot:append>
          <q-icon v-if="modelKeyword !== ''" name="close" @click="modelKeyword = ''" class="cursor-pointer"/>
          <q-icon name="search"/>
        </template>
      </q-input>
    </div>

    <q-scroll-area class="q-pa-md bg-transparent ModelGutterHeight full-width">
      <div class="q-gutter-lg">
        <q-card class="my-card" v-for="item in models" style="display: inline-block;">
          <q-card-section class="bg-indigo-10 text-accent q-px-xl q-py-md column">
            <div class="text-h6 q-mr-lg self-center">{{item.name}}</div>
          </q-card-section>

          <q-separator/>

          <q-card-actions align="center">
            <q-btn outline dense @click="showModel(item)" color="indigo-10">查看详情</q-btn>
            <q-btn outline dense @click="editModel(item)" color="pink-10">编辑</q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </q-scroll-area>
    <div class="q-pa-lg flex flex-center justify-center" style="height: 70px">
      <q-pagination
        v-model="modelPageIndex"
        :max="(modelTotal - 1) / modelPageSize + 1"
        :max-pages="6"
        color="indigo-10"
        boundary-numbers
        @update:model-value="pageLoad"
      />
      <div class="q-px-md text-indigo-10 text-bold">每页数量：</div>
      <q-select v-model="modelPageSize" color="indigo-10" dense :options="[50,40,30,20,10,5]" @update:model-value="pageLoad(1)"/>
    </div>

    <ModelInfo ref="modelInfo" @refresh="pageLoad(modelPageIndex)"></ModelInfo>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import ModelInfo from "components/ModelInfo.vue";
import {getAllModels} from "src/api/modelApi";

export default defineComponent({
  name: 'ModelMange',
  components: {ModelInfo},
  created() {
    window.addEventListener('resize', () => {
      this.resizeH();
    });
    this.active();
  },
  activated() {
    this.active();
  },
  data(){
    return {
      models: [],

      modelKeyword: "",
      modelPageSize: 20,
      modelPageIndex: 1,
      modelTotal: 999,
      modelLoading: false,

      ht: 0,
    }
  },
  methods: {
    active() {
      this.$emit('refreshActive');
      this.resizeH();
      this.pageLoad(this.modelPageIndex);
    },
    resizeH() {
      this.ht = window.innerHeight;
      let mghs = document.querySelectorAll(".ModelGutterHeight")
      for (let i = 0; i < mghs.length; i++) {
        mghs[i].style.height = (this.ht - 203) + 'px'
      }
    },
    pageLoad(index) {
      if(this.modelLoading){
        return;
      }
      this.$emit('showLoading')
      this.modelLoading = true;
      getAllModels(this.modelKeyword, index, this.modelPageSize).then(data => {
        this.models = data.models;
        this.modelTotal = data.total;
        this.modelPageIndex = index;
      }).catch(err => {
        this.$emit('showError', "请求模型时异常", err);
      }).finally(() => {
        this.modelLoading = false;
        this.$emit('hideLoading')
      })
    },
    changeModelKeyword() {
      if(!this.modelLoading){
        this.pageLoad(1);
      }
    },
    showModel(model){
      this.$refs.modelInfo.show(model)
    },
    editModel(model){
      this.$refs.modelInfo.edit(model)
    }
  }
})
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 280px
</style>
