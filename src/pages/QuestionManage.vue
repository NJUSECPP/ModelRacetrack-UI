<template>
  <q-page>
    <div class="bg-accent full-width q-px-lg q-pb-sm row"
         style="height: 80px;border-bottom: 1px solid #ececec;border-right: 1px solid #ececec;">
      <div class="col-1 row justify-left items-center">
        <q-btn color="green-10" outline @click="insertQuestion">新增题目</q-btn>
      </div>
      <div class="col-11">
        <q-input style="font-size: small" v-model="questionKeyword"  @change="changeQuestionKeyword" label="搜索">
          <template v-slot:append>
            <q-icon v-if="questionKeyword !== ''" name="close" @click="questionKeyword = ''" class="cursor-pointer"/>
            <q-icon name="search"/>
          </template>
        </q-input>
      </div>
    </div>

    <q-scroll-area class="q-pa-md bg-transparent QuestionGutterHeight full-width">
      <div class="q-gutter-lg">
        <q-card class="my-card" v-for="item in questions" style="display: inline-block;">
          <q-card-section class="bg-green-10 text-accent q-px-xl q-py-md column">
            <div class="text-h6 q-mr-lg self-center">{{item.name}}</div>
          </q-card-section>

          <q-separator/>

          <q-card-actions align="center">
            <q-btn outline dense @click="showQuestion(item)" color="green-10">查看详情</q-btn>
            <q-btn outline dense @click="editQuestion(item)" color="pink-10">编辑</q-btn>
            <q-btn outline dense @click="manageTestcase(item)" color="purple-10">用例管理</q-btn>
            <q-btn outline dense color="red-10" @click="deleteQuestion(item.questionId)">删除</q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </q-scroll-area>
    <div class="q-pa-lg flex flex-center justify-center" style="height: 70px">
      <q-pagination
        v-model="questionPageIndex"
        :max="(questionTotal - 1) / questionPageSize + 1"
        :max-pages="6"
        color="green-10"
        boundary-numbers
        @update:model-value="pageLoad"
      />
      <div class="q-px-md text-green-10 text-bold">每页数量：</div>
      <q-select v-model="questionPageSize" color="green-10" dense :options="[50,40,30,20,10,5]" @update:model-value="pageLoad(1)"/>
    </div>
    <QuestionInfo ref="questionInfo" @refresh="pageLoad(questionPageIndex)"/>
  </q-page>

</template>

<script>
import { defineComponent } from 'vue';
import {deleteQuestionById, getAllQuestions} from "src/api/questionApi";

import {showInfo, showWarn} from "src/libs/message";
import QuestionInfo from "src/components/QuestionInfo.vue";

export default defineComponent({
  name: 'QuestionManage',
  components: {QuestionInfo},
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
      questions: [],

      questionKeyword: "",
      questionPageSize: 20,
      questionPageIndex: 1,
      questionTotal: 999,
      questionLoading: false,

      ht: 0,
    }
  },
  methods: {
    active() {
      this.$emit('refreshActive');
      this.resizeH();
      this.pageLoad(this.questionPageIndex);
    },
    resizeH() {
      this.ht = window.innerHeight;
      let qghs = document.querySelectorAll(".QuestionGutterHeight")
      for (let i = 0; i < qghs.length; i++) {
        qghs[i].style.height = (this.ht - 203) + 'px'
      }
    },
    pageLoad(index) {
      if(this.questionLoading){
        return;
      }
      this.$emit('showLoading')
      this.questionLoading = true;
      getAllQuestions(this.questionKeyword, index, this.questionPageSize).then(data => {
        this.questions = data.questions;
        this.questionTotal = data.total;
        this.questionPageIndex = index;
      }).catch(err => {
        this.$emit('showError', "请求问题时异常", err);
      }).finally(() => {
        this.questionLoading = false;
        this.$emit('hideLoading')
      })
    },
    changeQuestionKeyword() {
      if(!this.questionLoading){
        this.pageLoad(1);
      }
    },
    showQuestion(question){
      this.$refs.questionInfo.show(question)
    },
    editQuestion(question){
      this.$refs.questionInfo.edit(question)
    },
    manageTestcase(question){
      this.$refs.questionInfo.manageTestcases(question)
    },
    insertQuestion(){
      this.$refs.questionInfo.insert()
    },
    deleteQuestion(questionId){
      this.$q.dialog({
        title: '警告',
        message: '确认删除该题目吗?',
        ok: {
          label: '确定',
          flat: true,
          color: 'green-10'
        },
        cancel: {
          label: '算了',
          flat: true,
          color: 'green-10'
        },
        persistent: true
      }).onOk(() => {
        deleteQuestionById(questionId).then(data => {
          showInfo("删除成功!");
        }).catch(() => {
          showWarn("删除失败!");
        }).finally(() => {
          this.pageLoad(this.questionPageIndex);
        })
      })
    }
  }
})
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 280px
</style>
