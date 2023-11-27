<template>
  <q-dialog v-model="showing" position="top" class="q-pa-none" :persistent="mode==='testcase' || action !== ACTION_TYPE.SHOW"
            @hide="hide">
    <q-tab-panels
      v-model="mode"
      height="1000px"
      style="min-width: 800px;"
      class="bg-white shadow-1 rounded-borders q-pa-md"
    >
      <q-tab-panel name="question">
        <q-form @submit="save">
          <q-item class="justify-center q-pb-md">
            <q-item-label class="text-h5">题目信息</q-item-label>
          </q-item>
          <q-item dense v-if="action !== ACTION_TYPE.INSERT">
            <q-item-section style="max-width: 250px; height: 56px">
              <q-item-label>题目id</q-item-label>
            </q-item-section>
            <q-input color="green-10" v-model="question.questionId" borderless readonly style="min-width: 470px"
                     :rules="[requireCheck]"/>
          </q-item>
          <q-item dense>
            <q-item-section style="max-width: 250px; height: 56px">
              <q-item-label>题目名称</q-item-label>
            </q-item-section>
            <q-input color="green-10" v-model="question.name" :borderless="action === ACTION_TYPE.SHOW"
                     :readonly="action === ACTION_TYPE.SHOW"
                     style="min-width: 470px" :rules="[requireCheck]"/>
          </q-item>
          <q-item dense>
            <q-item-section style="max-width: 250px; height: 56px">
              <q-item-label>题目描述</q-item-label>
            </q-item-section>
            <q-input color="green-10" v-model="question.description"
                     type="textarea"
                     autogrow
                     :borderless="action === ACTION_TYPE.SHOW" :readonly="action === ACTION_TYPE.SHOW"
                     style="min-width: 470px" :rules="[requireCheck]"/>
          </q-item>
          <q-item dense v-if="action !== ACTION_TYPE.INSERT">
            <q-item-section style="max-width: 250px; height: 56px">
              <q-item-label>用例数量</q-item-label>
            </q-item-section>
            <q-input color="green-10" v-model="pagination.rowsNumber" borderless readonly style="min-width: 470px"
                     :rules="[positiveCheck]"/>
          </q-item>
          <q-separator class="q-my-md"/>
          <q-item class="q-gutter-md justify-center ">
            <q-btn color="green-10" v-if="action === ACTION_TYPE.EDIT || action === ACTION_TYPE.INSERT"
                   type="submit" :loading="loading">保存</q-btn>
            <q-btn color="green-10" v-else @click="action = ACTION_TYPE.EDIT">编辑</q-btn>
            <q-btn color="green-10" flat @click="this.showing = false">返回</q-btn>
          </q-item>
        </q-form>
      </q-tab-panel>

      <q-tab-panel name="testcase">
        <q-item class="justify-center q-pb-md">
          <q-item-label class="text-h5">用例管理</q-item-label>
        </q-item>
        <div class="full-width row justify-center">
          <q-table
            style="width: 900px;"
            class="q-px-none"
            :rows="testcases"
            :columns="columns"
            row-key="id"
            binary-state-sort
            hide-bottom
            selection="multiple"
            v-model:selected="selectedTestcases"
            v-model:pagination="pagination"
            no-data-label="什么也没有"
          >
            <template v-slot:top>
              <q-btn color="purple-10"  label="新增用例" @click="openMaker(false)"/>
              <q-btn class="q-ml-sm" color="purple-10" label="批量导入" @click="openMaker(true)"/>
              <q-btn class="q-ml-sm" color="purple-10" outline @click="deleteTestcases" label="删除所选"/>
            </template>
          </q-table>
        </div>
        <div class="q-pa-lg flex flex-center justify-center" style="height: 70px">
          <q-pagination
            v-model="pagination.page"
            :max="(pagination.rowsNumber - 1) / pagination.rowsPerPage + 1"
            :max-pages="6"
            color="purple-10"
            boundary-numbers
            @update:model-value="pageLoad"
          />
          <div class="q-px-md text-indigo-10 text-bold">每页数量：</div>
          <q-select v-model="pagination.rowsPerPage" color="indigo-10" dense :options="[30,20,10,5]"
                    @update:model-value="pageLoad(1)"/>
        </div>
        <q-item class="q-gutter-md justify-center ">
          <q-btn color="purple-10" flat @click="backFromTestcase">返回</q-btn>
        </q-item>
      </q-tab-panel>

    </q-tab-panels>

    <TestcaseMaker ref="testcaseMaker" @refresh="pageLoad(pagination.page)"/>

    <q-inner-loading
      :showing="innerLoading"
      label="加载中..."
      label-class="text-teal"
      label-style="font-size: 1.1em"
      style="background: rgb(255, 255, 255);"
    />
  </q-dialog>
</template>

<script>
import {defineComponent} from "vue";
import {showInfo, showWarn} from "src/libs/message";
import {
  batchDeleteTestcases,
  getAllTestcasesByQuestionId, insertQuestion,
  updateQuestionById
} from "src/api/questionApi";
import {useQuasar} from "quasar";
import TestcaseMaker from "components/TestcaseMaker.vue";

const $q = useQuasar()

export default defineComponent({
  name: 'QuestionInfo',
  components: {TestcaseMaker},
  data() {
    return {
      showing: false,
      loading: false,
      innerLoading: false,

      mode: 'question',
      action: 0,

      edited: false,

      question: {
        id: "",
        name: "",
        description: "",
      },

      testcases: [],
      pagination: {
        page: 1,
        rowsPerPage: 5,
        rowsNumber: 0
      },

      selectedTestcases: [],

      ACTION_TYPE: {
        NONE: -1,
        SHOW: 0,
        EDIT: 1,
        INSERT: 2,
      },

      columns: [
        {name: 'id', align: 'center', label: 'id', field: 'id', sortable: false, style: "width:130px", headerStyle: "width:130px"},
        {name: 'input', align: 'left', label: '输入', field: 'inputDesc', sortable: false, style: "width:150px", headerStyle: "width:150px"},
        {name: 'output', align: 'left', label: '输出', field: 'outputDesc', sortable: false, style: "width:150px", headerStyle: "width:150px"},
        {name: 'tip', align: 'left', label: '提示', field: 'tipDesc', sortable: false, style: "width:250px", headerStyle: "width:250px"}
      ],



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
      if (val === undefined || val === null) {
        return "不能为空";
      }
      if (val < 0) {
        return "不能为负数";
      }
      return true;
    },
    show(question) {
      this.active(question, "question", this.ACTION_TYPE.SHOW);
    },
    edit(question) {
      this.active(question, "question", this.ACTION_TYPE.EDIT);
    },
    insert(){
      this.active(undefined, "question", this.ACTION_TYPE.INSERT);
    },
    manageTestcases(question) {
      this.active(question, "testcase", this.ACTION_TYPE.NONE);
    },
    active(question, mode, action) {
      Object.assign(this.$data, this.$options.data.call(this))
      if(question){
        this.question = {
          questionId: question.questionId,
          name: question.name,
          description: question.description
        };
        this.pageLoad(1);
      }
      this.mode = mode;
      this.action = action;
      this.testcases = [];
      this.showing = true;
    },

    save() {
      if(this.action === this.ACTION_TYPE.INSERT){
        this.loading = true;
        insertQuestion(this.question).then(data => {
          showInfo("保存成功")
          this.question.questionId = data.questionId;
          this.pageLoad(1);
          this.action = this.ACTION_TYPE.SHOW;
          this.edited = true;
        }).catch(err => {
          showWarn("保存失败");
        }).finally(() => {
          this.loading = false;
        })
      }else if(this.action === this.ACTION_TYPE.EDIT){
        this.loading = true;
        updateQuestionById(this.question).then(data => {
          showInfo("保存成功")
          this.pageLoad(1);
          this.action = this.ACTION_TYPE.SHOW;
          this.edited = true;
        }).catch(err => {
          showWarn("保存失败");
        }).finally(() => {
          this.loading = false;
        })
      }
    },
    pageLoad(index) {
      this.innerLoading = true;
      getAllTestcasesByQuestionId(this.question.questionId, index, this.pagination.rowsPerPage).then(data => {
        this.testcases = data.testcases;
        for(let testcase of this.testcases){
          testcase.inputDesc = this.getDesc(testcase.input, 20);
          testcase.outputDesc = this.getDesc(testcase.output, 20);
          testcase.tipDesc = this.getDesc(testcase.tip, 15);
        }
        this.pagination.rowsNumber = data.total;
        this.pagination.page = index;
      }).catch(err => {
        showWarn("请求用例数据时出错");
        this.backFromTestcase();
      }).finally(() => {
        this.innerLoading = false;
      })
    },
    getDesc(text, len){
      if(text.length < len){
        return text;
      }
      return text.slice(0, len-3) + "...";
    },
    hide(){
      if(this.edited){
        this.$emit("refresh");
      }
    },
    backFromTestcase(){
      if(this.action === this.ACTION_TYPE.NONE){
        this.showing = false;
      }else {
        this.mode = "question";
      }
    },
    deleteTestcases(){
      if(this.selectedTestcases.length === 0){
        showWarn("请选择要删除的数据!")
        return;
      }
      this.$q.dialog({
        title: '警告',
        message: '你即将删除'+this.selectedTestcases.length+"条用例,是否确认?",
        ok: {
          label: '确定',
          flat: true,
          color: 'purple-10'
        },
        cancel: {
          label: '算了',
          flat: true,
          color: 'purple-10'
        },
        persistent: true
      }).onOk(() => {
        let selectedIds = this.selectedTestcases.map(val => val.id);
        batchDeleteTestcases(selectedIds).then(data => {
          showInfo("删除成功!");
        }).catch(()=>{
          showWarn("删除失败!");
        }).finally(()=>{
          this.selectedTestcases = [];
          this.pageLoad(this.pagination.page);
        })
      })
    },
    openMaker(multiple){
      this.$refs.testcaseMaker.active(this.question.questionId, multiple);
    }
  }
})

</script>

<style>
.q-dialog__inner > .q-inner-loading{
  left: auto !important;
  right: auto !important;
  width: 800px !important;
  max-width: 100% !important;
}

</style>
