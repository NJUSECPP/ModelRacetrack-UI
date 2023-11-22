<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md row justify-center items-start q-gutter-xl fit">
      <q-card class="my-card">
        <q-card-section class="bg-pink-10 text-accent q-px-xl q-py-md column items-center">
          <q-avatar class="col q-py-md" rounded>
            <q-icon size="30px" name="fa-solid fa-flag-checkered"/>
          </q-avatar>
          <div class="text-h6 text-center col">模型测试</div>
        </q-card-section>

        <q-separator/>

        <q-card-actions align="center">
          <q-btn outline color="pink-10" @click="changePage('/test/auto')">批量测试</q-btn>
          <q-btn outline color="pink-10" @click="changePage('/test/manual')">单独测试</q-btn>
        </q-card-actions>
      </q-card>
      <q-card class="my-card">
        <q-card-section class="bg-indigo-10 text-accent q-px-xl q-py-md column">
          <q-avatar class="col self-center q-py-md" rounded>
            <q-icon size="30px" name="fa-solid fa-horse"/>
          </q-avatar>
          <div class="text-h6 q-mr-lg self-center">当前模型数量：{{ this.modelCount }}</div>
        </q-card-section>

        <q-separator/>

        <q-card-actions align="center">
          <q-btn outline color="indigo-10" @click="changePage('/manage/model')">模型管理</q-btn>
        </q-card-actions>
      </q-card>
      <q-card class="my-card">
        <q-card-section class="bg-green-10 text-accent q-px-xl q-py-md column">
          <q-avatar class="col self-center q-py-md" rounded>
            <q-icon size="30px" name="fa-solid fa-road-barrier"/>
          </q-avatar>
          <div class="text-h6 q-mr-lg col self-center">当前题库数量：{{ this.questionCount }}</div>
        </q-card-section>

        <q-separator/>

        <q-card-actions align="center">
          <q-btn outline color="green-10" @click="changePage('/manage/question')">题库管理</q-btn>
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import {defineComponent} from 'vue'
import {hideLoading, showLoading} from "src/libs/loading";
import {mapGetters} from "vuex";
import {getAllQuestions} from "src/api/questionApi";

export default defineComponent({
  name: 'Home',
  activated() {
    this.active();
  },
  data() {
    return {
      modelCount: 0,
      questionCount: 0,
    }
  },
  methods: {
    active: function () {
      this.$emit('refreshActive');
      this.$emit('showLoading');
      Promise.all([this.$store.getters.getAllModels('', 1, 1), getAllQuestions('', 1, 1)]).then(datas => {
        this.modelCount = datas[0].total;
        this.questionCount = datas[1].total;
      }).catch(err => {
        this.$emit('showError', "请求服务时异常", err);
      }).finally(() => {
        this.$emit('hideLoading');
      })
    },
    changePage(path) {
      this.$router.push(path);
    }
  }
})
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 300px
</style>
