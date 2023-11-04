<template>
  <q-dialog v-model="showing" position="left" class="q-pa-none" :persistent="!hasOne">
    <q-tab-panels
      v-model="mode"
      style="min-width: 500px;min-height: 600px"
      class="bg-white shadow-1 rounded-borders q-pa-md"
      animated
      transition-prev="slide-left"
      transition-next="slide-right"
    >
      <q-tab-panel name="simple">
        <q-form @submit="saveSimple">
          <q-item class="row q-pb-md">
            <q-item-label class="text-h5 col-9">新增用例</q-item-label>
            <q-btn flat dense color="purple-10" class="col-3" label="批量导入" :disable="loading"
                   @click="active(questionId, hasOne, true)"/>
          </q-item>
          <q-item dense>
            <q-item-section style="max-width: 150px; height: 56px">
              <q-item-label>输入</q-item-label>
            </q-item-section>
            <q-input color="indigo-10" v-model="testcase.input"
                     type="textarea"
                     style="min-width: 350px"/>
          </q-item>
          <q-item dense>
            <q-item-section style="max-width: 150px; height: 56px">
              <q-item-label>输出</q-item-label>
            </q-item-section>
            <q-input color="indigo-10" v-model="testcase.output"
                     type="textarea"
                     style="min-width: 350px"/>
          </q-item>
          <q-item dense>
            <q-item-section style="max-width: 150px; height: 56px">
              <q-item-label>提示</q-item-label>
            </q-item-section>
            <q-input color="indigo-10" v-model="testcase.tip"
                     type="textarea" autogrow
                     style="min-width: 350px"/>
          </q-item>
          <q-separator class="q-my-md"/>
          <q-item class="q-gutter-md justify-center ">
            <q-btn color="purple-10" v-if="hasOne" flat @click="close">返回</q-btn>
          </q-item>
        </q-form>
      </q-tab-panel>
      <q-tab-panel name="multiple">
        <q-item class="row q-pb-md">
          <q-item-label class="text-h5 col-9">批量导入</q-item-label>
          <q-btn flat dense color="purple-10" class="col-3" label="新增用例" :disable="loading"
                 @click="active(questionId, hasOne, false)"/>
        </q-item>
        <q-item dense>
          <q-item-section style="max-width: 250px; height: 56px">
            <q-item-label>选择CSV文件</q-item-label>
          </q-item-section>
          <q-file
            dense
            style="min-width: 200px"
            v-model="selectedFile"
            accept=".csv"
            :disable="loading"
            @update:model-value="checkCSV"
          />
        </q-item>
        <q-scroll-area style="margin-top:10px; height: 404px;background-color:#333;">
          <div class="text-accent typing bg-transparent" style="padding: 25px 20px 20px;"
               v-html="multipleCheckerShow"></div>
          <div v-if="showMultipleCheckerConfirm && !isTyping" class="row justify-center">
            <q-btn class="q-px-sm" flat color="accent" @click="this.multipleConfirmSure">确定</q-btn>
            <q-btn class="q-px-sm" flat color="accent" @click="this.multipleConfirmReject">算了</q-btn>
          </div>
        </q-scroll-area>

      </q-tab-panel>
    </q-tab-panels>
  </q-dialog>
</template>

<script>
import {defineComponent} from "vue";
import {showInfo, showWarn} from "src/libs/message";
import {updateModelById} from "src/api/modelApi";
import {batchInsertTestcases} from "src/api/questionApi";
import {parseCSV} from "src/libs/csvPaser";


export default defineComponent({
  name: 'TestcaseMaker',
  data() {
    return {
      mode: 'simple',
      showing: false,
      loading: false,

      questionId: -1,

      testcase: {
        input: '',
        output: '',
        tip: '',
      },
      selectedFile: "",
      multipleTestcases: [],

      multipleCheckerX: 0,
      multipleCheckerY: 0,
      multipleCheckerShow: "",
      multipleCheckerMessages: [],
      multipleCheckerPromise: Promise.resolve(),
      showMultipleCheckerConfirm: false,

      isTyping: false,

      hasOne: false,


    }
  },
  methods: {
    show(question) {
      this.active(question, false, false);
    },
    active(questionId, hasOne, multiple) {
      this.questionId = questionId
      this.innerLoading = false;
      this.testcase = {
        input: '',
        output: '',
        tip: '',
      }
      this.mode = multiple ? 'multiple' : 'simple';
      this.hasOne = hasOne;
      this.showing = true;
    },

    saveSimple() {
      this.loading = true;
      batchInsertTestcases(this.questionId, [this.testcase]).then(() => {
        showInfo("保存成功")
        this.close();
      }).catch(() => {
        showWarn("保存失败");
      }).finally(() => {
        this.loading = false;
      })
    },

    close() {
      this.$emit('refresh');
      this.showing = false;
    },

    checkCSV(fileName) {
      this.loading = true;
      this.multipleTestcases = []
      let success = true;
      this.multipleCheckerMessages.push("开始解析文件...");
      if (!this.isTyping) {
        this.nextType();
      }
      parseCSV(fileName, result => {
        if (result.errors.length > 0) {
          for (let error of result.errors) {
            const row = error.row;
            const message = error.message;
            this.multipleCheckerMessages.push("解析文件第" + row + "行出错啦 w(ﾟДﾟ)w! 错误原因是: " + message);
          }
          if (!this.isTyping) {
            this.nextType();
          }
          success = false;
        } else {
          this.multipleTestcases.push(result.data);
        }
      }, () => {
        if (this.multipleTestcases.length === 0) {
          this.multipleCheckerMessages.push("解析完成! 一个可以导入的用例都没有 w(ﾟДﾟ)w");
        }
        if (success) {
          this.multipleCheckerMessages.push("解析完成! 一共" + this.multipleTestcases.length + "个用例即将被导入 ヽ(✿ﾟ▽ﾟ)ノ");
          this.multipleCheckerMessages.push("是否确认导入?");
        } else {
          this.multipleCheckerMessages.push("解析完成! 除去出错的,一共" + this.multipleTestcases.length + "个用例即将被导入 ヽ(✿ﾟ▽ﾟ)ノ");
          this.multipleCheckerMessages.push("是否确认导入?");
        }
        this.showMultipleCheckerConfirm = true;
        if (!this.isTyping) {
          this.nextType();
        }
      })
    },
    multipleConfirmSure() {
      batchInsertTestcases(this.questionId, this.multipleTestcases)
        .then(() => {
          this.multipleCheckerMessages.push("导入成功!");
        }).catch(err => {
        if (err && err.message) {
          this.multipleCheckerMessages.push("导入时发生错误 w(ﾟДﾟ)w! 错误原因是: " + err.message);
        } else {
          this.multipleCheckerMessages.push("导入时发生错误 w(ﾟДﾟ)w! 错误原因未知");
        }
      }).finally(() => {
        if (!this.isTyping) {
          this.nextType();
        }
        this.loading = false;
        this.multipleTestcases = [];
        this.showMultipleCheckerConfirm = false;
      })
    },
    multipleConfirmReject() {
      this.multipleCheckerMessages.push("导入取消!");
      if (!this.isTyping) {
        this.nextType();
      }
      this.loading = false;
      this.multipleTestcases = [];
      this.showMultipleCheckerConfirm = false;
    },

    nextType() {
      this.isTyping = true;
      this.multipleCheckerPromise = this.multipleCheckerPromise.then(() => {
        if (this.multipleCheckerY < this.multipleCheckerMessages.length) {
          if (this.multipleCheckerX < this.multipleCheckerMessages[this.multipleCheckerY].length) {
            this.multipleCheckerShow += this.multipleCheckerMessages[this.multipleCheckerY].charAt(this.multipleCheckerX++);
            setTimeout(this.nextType, 30);
          } else {
            this.multipleCheckerShow += "<br />";
            this.multipleCheckerY++;
            this.multipleCheckerX = 0;
            this.nextType();
          }
        } else {
          this.isTyping = false;
        }

      })


    },
  }
})

</script>

<style scoped>

</style>
