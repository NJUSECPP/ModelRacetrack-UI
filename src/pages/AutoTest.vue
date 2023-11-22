<template>
  <q-page class="q-ma-none">
    <div class="full-width row">
      <div class="col-6 no-border text-secondary" style="background-color: #e5e4e4;">
        <div class="full-width row justify-end q-px-md q-py-sm" style="height: 56px;">
          <q-btn-group outline>
            <q-btn color="indigo-10" icon="fa-solid fa-plus" :disable="this.disableSetting"
                   @click="showSetting = true">
              <q-tooltip class="bg-accent text-secondary text-body1">添加模型和题目</q-tooltip>
              <q-badge floating rounded color="orange" v-show="this.showTips && this.tipNum === '1'"/>
            </q-btn>
            <q-btn color="pink-10" icon="fa-solid fa-play" :loading="this.waiting"
                   :disable="usingQuestionIds.length === 0 || usingModelIds.length === 0" @click="runAll">
              <q-tooltip v-if="!this.waiting" class="bg-accent text-secondary text-body1">全部运行</q-tooltip>
              <q-badge floating rounded color="orange"
                       v-show="this.showTips && this.tipNum === '2' && this.activatedQuestionId === -1"/>
            </q-btn>
          </q-btn-group>
        </div>
        <q-virtual-scroll
          :items="usingModelIds"
          class="MQListHeight"
          v-slot="{ item, index }"
        >
          <q-expansion-item v-model="usingModelStates[item].isExpanded"
                            :header-class="activatedModelId === item?'activeModel':''"
          >
            <template v-slot:header>
              <q-item-section avatar>
                <q-avatar rounded>
                  <q-icon size="30px" name="fa-solid fa-horse"/>
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-h6">{{ models[item].name }}</q-item-label>
                <q-item-label caption
                              v-if="usingModelStates[item].result !== null && !usingModelStates[item].waiting"
                              class="text-pink-10">
                  成功&nbsp{{ usingModelStates[item].result[0] }}&nbsp;&nbsp;
                  失败&nbsp{{ usingModelStates[item].result[1] }}&nbsp;&nbsp;
                  异常&nbsp{{ usingModelStates[item].result[2] }}&nbsp;&nbsp;
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="row items-center">
                  <q-btn flat dense color="primary" @click.stop v-if="usingQuestionIds.length > 0"
                         :loading="usingModelStates[item].waiting"
                         :icon="usingModelStates[item].ran ? 'fa-solid fa-rotate-right' : 'fa-solid fa-play'"
                         @click="runModel(item)">
                    <q-tooltip class="bg-accent text-secondary text-body1"
                               v-if="!usingModelStates[item].waiting"
                    >
                      {{ usingModelStates[item].ran ? '重新' : '' }}运行该模型所有题目
                    </q-tooltip>
                  </q-btn>
                  <q-btn flat dense color="pink-13" @click.stop
                         :disable="usingModelStates[item].disableSetting"
                         icon="fa-solid fa-xmark"
                         @click="removeUsingModel(item)">
                    <q-tooltip class="bg-accent text-secondary text-body1">取消选择</q-tooltip>
                  </q-btn>
                </div>
              </q-item-section>
            </template>

            <q-item v-for="questionId in usingQuestionIds"
                    :active="activatedModelId === item && activatedQuestionId === questionId"
                    active-class="activeModel2"
                    class="q-ml-lg q-py-none"
                    clickable
                    v-ripple
                    @click="showSession(item, questionId)"
            >
              <q-item-section avatar>
                <q-icon size="24px" name="fa-solid fa-road-barrier"/>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-body1">{{ questions[questionId].name }}</q-item-label>
                <q-item-label caption
                              v-if="sessions[item][questionId] && !sessions[item][questionId].waiting"
                              :class="'text-'+RESULT_COLORS[sessions[item][questionId].result]">
                  {{ RESULT_TIPS[sessions[item][questionId].result] }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-btn flat dense color="primary"
                       :icon="sessions[item][questionId] ? 'fa-solid fa-rotate-right' : 'fa-solid fa-play'"
                       :loading="sessions[item][questionId] ? sessions[item][questionId].waiting : false"
                       @click="runModelQuestion(item, questionId)">
                  <q-tooltip class="bg-accent text-secondary text-body1"
                             v-if="!sessions[item][questionId] || !sessions[item][questionId].waiting">
                    {{ sessions[item][questionId] ? '重新' : '' }}运行
                  </q-tooltip>
                  <q-badge floating rounded color="orange"
                           v-show="activatedModelId === item && activatedQuestionId === questionId &&
                           this.showTips && this.tipNum === '2'"/>
                </q-btn>
              </q-item-section>
            </q-item>
          </q-expansion-item>
        </q-virtual-scroll>
      </div>
      <div class="col-6">
        <div v-show="showTips" class="bg-accent FullHeight full-width row justify-center items-center">
          <q-card class="col-6">
            <q-carousel
              v-model="tipNum"
              transition-prev="slide-right"
              transition-next="slide-left"
              animated
            >
              <q-carousel-slide name="1" class="column no-wrap flex-center bg-indigo-10 text-accent">
                <q-icon name="fa-solid fa-1" size="56px"/>
                <div class="q-mt-md text-center text-h5">
                  <span>点击&nbsp;&nbsp;<q-icon name="fa-solid fa-plus"/>&nbsp;&nbsp;添加模型和题目</span>
                </div>
              </q-carousel-slide>
              <q-carousel-slide name="2" class="column no-wrap flex-center bg-pink-10 text-accent">
                <q-icon name="fa-solid fa-2" size="56px"/>
                <div class="q-mt-md text-center text-h5">
                  <span>点击&nbsp;&nbsp;<q-icon name="fa-solid fa-play"/>&nbsp;&nbsp;运行测试</span>
                </div>
              </q-carousel-slide>
              <q-carousel-slide name="3" class="column no-wrap flex-center bg-green-10 text-accent">
                <q-icon name="fa-solid fa-3" size="56px"/>
                <div class="q-mt-md text-center text-h5">
                  <span>选择题目查看详细会话</span>
                </div>
              </q-carousel-slide>
            </q-carousel>
          </q-card>
        </div>
        <div v-show="!showTips" class="bg-accent FullHeight">
          <q-scroll-area ref="scrollAreaRef" class="full-width FullHeight">
            <div class="row justify-center q-pa-lg"
                 v-for="message in (
                sessions[activatedModelId] && sessions[activatedModelId][activatedQuestionId]
                ? Object.values(sessions[activatedModelId][activatedQuestionId].messages) : [])">
              <q-chat-message
                class="q-mx-lg col-12"
                v-if="message.type !== MESSAGE_TYPE.SYSTEM"
                :avatar="message.type === MESSAGE_TYPE.SENT? getPublicUrl('logo/user.png'):getPublicUrl('logo/ai.png')"
                text-color="black"
                :bg-color="message.type === MESSAGE_TYPE.SENT?'positive':'white'"
                :sent="message.type === MESSAGE_TYPE.SENT"
              >
                <div style="white-space:normal;word-break:break-word;margin-top: 5px;margin-bottom: 5px;" v-html="message.htmlContent"></div>
              </q-chat-message>
              <q-card
                v-else
                class="bg-white col-6"
              >
                <q-card-section>
                  <div :class="['text-h4', 'text-'+RESULT_COLORS[message.result]]">
                    {{ this.RESULT_TIPS[message.result] }}
                  </div>
                  <div v-if="message.content.length > 0" class="text-body1 q-py-md">{{ message.content }}</div>
                </q-card-section>
                <q-separator/>
                <q-card-actions vertical>
                  <q-btn flat color="primary" :loading="sessions[activatedModelId] && sessions[activatedModelId][activatedQuestionId] ?
                  sessions[activatedModelId][activatedQuestionId].waiting : false"
                         @click="runModelQuestion(activatedModelId, activatedQuestionId)">再来一次
                  </q-btn>
                </q-card-actions>
              </q-card>
            </div>
            <div class="row justify-center" v-if="sessions[activatedModelId] && sessions[activatedModelId][activatedQuestionId] ? sessions[activatedModelId][activatedQuestionId].waiting : false">
              <q-spinner-dots size="2rem"/>
            </div>
          </q-scroll-area>
        </div>
      </div>

    </div>

    <q-dialog v-model="showSetting"
              position="right" class="q-pa-none">
      <q-card style="background-color: rgba(255,255,255,0.9);backdrop-filter: blur(20px);width: 500px;"
              class="q-px-sm q-pb-md full-height">
        <q-card-section>
          <div class="text-h6">添加模型和题目</div>
        </q-card-section>

        <q-item dense>
          <q-item-section style="width: 150px">
            <q-item-label>选择模型（多选）</q-item-label>
          </q-item-section>
          <q-select
            style="width: 300px"
            multiple
            use-input
            v-model="tempUsingModels"
            hide-selected
            fill-input
            input-debounce="0"
            :options="modelOptions"
            @filter="filterModel"
            @add="onAddUsingModel"
            @remove="onRemoveUsingModel"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-indigo-10">
                  找不到模型
                </q-item-section>
              </q-item>
            </template>

            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.name }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-item>

        <q-item dense>
          <div class="q-gutter-xs">
            <q-chip removable v-for="modelId in usingModelIds"
                    @remove="this.removeUsingModel(modelId)"
                    color="indigo-10" text-color="white">
              {{ this.models[modelId].name }}
            </q-chip>
          </div>
        </q-item>

        <q-item dense>
          <q-item-section style="width: 150px">
            <q-item-label>选择题目（多选）</q-item-label>
          </q-item-section>
          <q-select
            style="width: 300px"
            multiple
            use-input
            v-model="tempUsingQuestions"
            hide-selected
            fill-input
            input-debounce="0"
            :options="questionOptions"
            @filter="filterQuestion"
            @add="onAddUsingQuestion"
            @remove="onRemoveUsingQuestion"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-green-10">
                  找不到题目
                </q-item-section>
              </q-item>
            </template>

            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.name }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-item>

        <q-item dense>
          <div class="q-gutter-xs">
            <q-chip removable v-for="questionId in usingQuestionIds"
                    @remove="this.removeUsingQuestion(questionId)"
                    color="green-10" text-color="white">
              {{ this.questions[questionId].name }}
            </q-chip>
          </div>
        </q-item>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script>
import {defineComponent} from 'vue'
import {hideLoading, showLoading} from "src/libs/loading";
import {MESSAGE_TYPE, RESULT_TYPE, RESULT_TIPS, RESULT_COLORS} from "src/config/constant";
import {runWithOJ} from "src/api/runApi";
import {getAllQuestions} from "src/api/questionApi";
import {getPublicUrl} from "src/libs/imgUrl";
import {markdownToHtml} from "src/libs/markdown";
import 'highlight.js/styles/googlecode.css';

export default defineComponent({
  name: 'AutoTest',
  created() {
    window.addEventListener('resize', () => {
      this.resizeH();
    });
    this.active();
  },
  activated() {
    this.active();
  },
  computed: {
    RESULT_TYPE() {
      return RESULT_TYPE;
    },
    MESSAGE_TYPE() {
      return MESSAGE_TYPE;
    },
    RESULT_TIPS() {
      return RESULT_TIPS;
    },
    RESULT_COLORS() {
      return RESULT_COLORS;
    }
  },
  data() {
    return {
      waiting: false,
      disableSetting: false,
      ran: false,

      tempUsingModels: [],
      usingModelIds: [],
      usingModelStates: {},
      modelOptions: null,

      tempUsingQuestions: [],
      usingQuestionIds: [],
      questionOptions: [],

      sessions: {},
      activatedQuestionId: "",
      activatedModelId: "",

      showSetting: false,

      modelKeyword: "",

      ht: 0,

      showTips: true,
      tipNum: '1',

      models: {},
      questions: {},
    }
  },
  methods: {
    getPublicUrl,
    active() {
      this.$emit('refreshActive');
      this.resizeH();
      if(this.usingModelIds.length === 0){
        this.usingQuestionIds = [];
        this.models = {};
      }
      if(this.usingQuestionIds.length === 0){
        this.questions = {};
      }
    },
    resizeH() {
      this.ht = window.innerHeight
      let fhs = document.querySelectorAll(".FullHeight")
      for (let i = 0; i < fhs.length; i++) {
        fhs[i].style.height = (this.ht - 53) + 'px'
      }
      let mqlh = document.querySelectorAll(".MQListHeight")
      for (let i = 0; i < mqlh.length; i++) {
        mqlh[i].style.height = (this.ht - 109) + 'px'
      }
    },
    updateRan(hasRan) {
      if (hasRan) {
        this.ran = true;
      } else {
        this.ran = this.usingModelIds.findIndex(modelId => {
          return this.usingQuestionIds.findIndex(questionId => {
            return this.sessions[modelId] &&
              this.sessions[modelId][questionId] &&
              this.sessions[modelId][questionId].ran;
          }) > -1;
        }) > -1;
      }
      this.updateTips();
    },
    updateTips() {
      if (this.usingModelIds.length === 0 || this.usingQuestionIds.length === 0) {
        this.showTips = true;
        this.tipNum = '1';
      } else if (this.activatedModelId !== -1) {
        if (!this.sessions[this.activatedModelId] || !this.sessions[this.activatedModelId][this.activatedQuestionId]) {
          this.showTips = true;
          this.tipNum = '2';
        } else {
          this.showTips = false;
        }
      } else {
        if (this.ran) {
          this.showTips = true;
          this.tipNum = '3';
        } else {
          this.showTips = true;
          this.tipNum = '2';
        }
      }
    },
    showSession(modelId, questionId) {
      if (this.activatedModelId !== modelId) {
        this.activatedModelId = modelId;
      }
      if (this.activatedQuestionId !== questionId) {
        this.activatedQuestionId = questionId;
      }
      this.updateTips();
    },
    scrollToEnd(anime) {
      if (this.$refs.scrollAreaRef) {
        if (!anime) {
          this.$refs.scrollAreaRef.setScrollPosition('vertical', this.$refs.scrollAreaRef.getScroll().verticalSize)
        } else {
          this.$refs.scrollAreaRef.setScrollPosition('vertical', this.$refs.scrollAreaRef.getScroll().verticalSize, 300)
        }
      }
    },

    newSession(modelId, questionId) {
      return {
        modelId: modelId,
        questionId: questionId,
        messages: {},
        maxMessageIndex: -1,
        waiting: false,
        promise: null,
        result: this.RESULT_TYPE.FAIL,
      }
    },
    newModelState(modelId) {
      return {
        modelId: modelId,
        waiting: false,
        promise: null,
        ran: false,
        disableSetting: false,
        isExpanded: true,
        result: null,
      }
    },

    filterQuestion(val, update, abort) {
      getAllQuestions("", 1,2000).then(data => {
        for(let item of data.questions){
          this.questions[item.questionId] = item;
        }
        update(() => this.questionOptions = data.questions);
      }).catch(err => {
        this.$emit('showError', '请求题目时异常', err);
      })
    },
    onAddUsingQuestion(detail) {
      let questionId = detail.value.questionId;
      this.usingQuestionIds.push(questionId);
      this.updateTips();
    },
    onRemoveUsingQuestion(detail) {
      let questionId = detail.value.questionId;
      this.removeUsingQuestion(questionId, false);
    },
    removeUsingQuestion(questionId, removeTemp = true) {
      this.usingQuestionIds = this.usingQuestionIds.filter(v => v !== questionId);
      this.usingModelIds.forEach(modelId => {
        if (this.sessions[modelId][questionId]) {
          delete this.sessions[modelId][questionId];
        }
      })
      if (this.usingModelStates[questionId]) {
        delete this.usingModelStates[questionId];
      }
      if (this.activatedQuestionId === questionId) {
        this.activatedModelId = -1;
        this.activatedQuestionId = -1;
      }
      this.updateRan();
      if (removeTemp) {
        this.tempUsingQuestions = this.tempUsingQuestions.filter(v => v.questionId !== questionId);
      }
    },

    filterModel(val, update, abort) {
      this.$store.getters.getAllModels(val, 1,2000).then(data => {
        for(let item of data.models){
          this.models[item.id] = item;
        }
        update(() => this.modelOptions = data.models);
      }).catch(err => {
        this.$emit('showError', "请求模型时异常", err);
      })
    },
    onAddUsingModel(detail) {
      let modelId = detail.value.id;
      this.sessions[modelId] = {};
      this.usingModelStates[modelId] = this.newModelState(modelId);
      this.usingModelIds.push(modelId);
      this.updateTips();
    },
    onRemoveUsingModel(detail) {
      let modelId = detail.value;
      this.removeUsingModel(modelId, false);
    },
    removeUsingModel(modelId, removeTemp = true) {
      this.usingModelIds = this.usingModelIds.filter(v => v !== modelId);
      if (this.sessions[modelId]) {
        delete this.sessions[modelId];
      }
      if (this.activatedModelId === modelId) {
        this.activatedModelId = -1;
        this.activatedQuestionId = -1;
      }
      this.updateRan();
      if (removeTemp) {
        this.tempUsingModels = this.tempUsingModels.filter(v => v.id !== modelId);
      }
    },


    startRun(modelId, questionId) {
      this.disableSetting = true;
      this.usingModelStates[modelId].disableSetting = true;
      this.sessions[modelId][questionId] = this.newSession(modelId, questionId);
      this.sessions[modelId][questionId].waiting = true;
      this.sessions[modelId][questionId].ran = true;
      this.updateRan(true);
    },
    endRun(modelId, questionId, result) {
      this.sessions[modelId][questionId].result = result;
      this.sessions[modelId][questionId].waiting = false;
      this.disableSetting = false;
      this.usingModelStates[modelId].disableSetting = false;
    },
    revokeEndRun(modelId) {
      this.disableSetting = true;
      this.usingModelStates[modelId].disableSetting = true;
    },
    startRunModel(modelId) {
      this.disableSetting = true;
      this.usingModelStates[modelId].disableSetting = true;
      this.usingModelStates[modelId].waiting = true;
      this.usingModelStates[modelId].ran = true;
    },
    endRunModel(modelId, result) {
      this.usingModelStates[modelId].result = result;
      this.usingModelStates[modelId].waiting = false;
      this.disableSetting = false;
      this.usingModelStates[modelId].disableSetting = false;
    },
    revokeEndRunModel() {
      this.disableSetting = true;
    },
    startRunAll() {
      this.disableSetting = true;
      this.waiting = true;
    },
    endRunAll() {
      this.disableSetting = false;
      this.waiting = false;
    },
    runAll() {
      if (this.waiting) {
        return;
      }
      this.startRunAll();
      let subPromises = this.usingModelIds.map(modelId => {
        return this.runModel(modelId).then(() => {
          this.revokeEndRunModel();
        })
      })
      Promise.all(subPromises).then(() => {
        this.endRunAll();
      });
    },
    runModel(modelId) {
      if (this.usingModelStates[modelId].waiting) {
        return new Promise((resolve, reject) => {
          setTimeout(resolve, 100);
        }).then(() => {
          return this.usingModelStates[modelId].promise;
        })
      }
      this.startRunModel(modelId);
      let subPromises = this.usingQuestionIds.map((questionId, index) => {
        return this.runModelQuestion(modelId, questionId).then(data => {
          this.revokeEndRun(modelId);
          return data;
        })
      })
      this.usingModelStates[modelId].promise = Promise.all(subPromises).then(datas => {
        let result = [0, 0, 0];
        datas.forEach((data, index) => {
          result[data]++;
        })
        this.endRunModel(modelId, result);
      });
      return this.usingModelStates[modelId].promise;
    },
    runModelQuestion(modelId, questionId) {
      let that = this;
      if (this.sessions[modelId][questionId] && this.sessions[modelId][questionId].waiting) {
        return new Promise((resolve, reject) => {
          setTimeout(resolve, 50);
        }).then(() => {
          return this.sessions[modelId][questionId].promise;
        })
      }
      this.startRun(modelId, questionId);
      let res = RESULT_TYPE.SUCCESS;
      let modelName = this.models[modelId].name;
      this.sessions[modelId][questionId].promise = runWithOJ(modelName, questionId,
        message => {
          if(Object.keys(message).length === 0){
            that.appendMessage(modelId, questionId, "\n");
          } else if(message.type === MESSAGE_TYPE.APPEND){
            that.appendMessage(modelId, questionId, message.text, message.index, message.offset);
          } else {
            that.addMessage(modelId, questionId, message.type, message.result, message.text, message.index);
          }
          if(message.type === MESSAGE_TYPE.SYSTEM){
            res = message.result;
          }
        }
      ).catch(error => {
        res = RESULT_TYPE.ERROR;
        that.addMessage(modelId, questionId, MESSAGE_TYPE.SYSTEM, RESULT_TYPE.ERROR, error.message);
      }).then(() => {
        that.endRun(modelId, questionId, res);
        return res;
      })
      return this.sessions[modelId][questionId].promise;
    },

    addMessage(modelId, questionId, type, result, content, index=-1) {
      if (!this.sessions[modelId][questionId]) {
        this.sessions[modelId][questionId] = this.newSession(modelId, questionId);
      }
      if(index < 0){
        index = this.sessions[modelId][questionId].maxMessageIndex;
      }
      if(index > this.sessions[modelId][questionId].maxMessageIndex){
        this.sessions[modelId][questionId].maxMessageIndex = index;
      }
      this.sessions[modelId][questionId].messages[index] = {
        index: index,
        type: type,
        result: result,
        content: content,
        htmlContent: markdownToHtml(content)
      };
      this.$nextTick(() => {
        if (index === this.sessions[modelId][questionId].maxMessageIndex) {
          if (this.activatedModelId === modelId && this.activatedQuestionId === questionId) {
            this.scrollToEnd(true);
          }
        }
      });
    },
    appendMessage(modelId, questionId, content, index=-1, offset=-1) {
      if (!this.sessions[modelId][questionId]) {
        return;
      }
      if(index < 0){
        index = this.sessions[modelId][questionId].maxMessageIndex;
      }
      if (!this.sessions[modelId][questionId].messages[index]) {
        return;
      }
      if (this.sessions[modelId][questionId].messages[index].content.length < offset) {
        return;
      }
      let oldContent = "";
      if (offset >= 0) {
        oldContent = this.sessions[modelId][questionId].messages[index].content.slice(0, offset);
      } else {
        oldContent = this.sessions[modelId][questionId].messages[index].content;
      }
      this.sessions[modelId][questionId].messages[index].content = oldContent + content;
      this.sessions[modelId][questionId].messages[index].htmlContent = markdownToHtml(oldContent+content);
    }
  }
})
</script>

<style>
.q-menu.scroll {
  max-height: 300px !important;
}

.q-dialog__inner--right {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

pre {
  position: relative;
}

code {
  margin: 0 0.15em;
  padding: 0.125em 0.4em;
  border-radius: 2px;
  background: rgba(242, 107, 31, .07);
  color: rgba(242, 107, 31, 1);
  white-space: nowrap;
  font-size: calc(1rem * 0.95);
  line-height: inherit;
}

pre > code {
  padding: 48px 18px 18px 12px !important;
  font-size: 1rem;
  box-shadow: 0 1px 15px rgba(23, 114, 180, .3) !important;
  border-radius: 5px !important;
  background: rgba(250, 250, 250, 1) !important;
  white-space: pre-wrap !important;
  word-break: break-word !important;

}

pre > code:before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  height: 14px;
  margin-top: 18px;
  margin-bottom: 18px;
  margin-left: 12px;
  width: 100px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='54' height='14' viewBox='0 0 54 14'%3E%3Cg fill='none' fill-rule='evenodd' transform='translate(1 1)'%3E%3Ccircle cx='6' cy='6' r='6' fill='%23FF5F56' stroke='%23E0443E' stroke-width='.5'%3E%3C/circle%3E%3Ccircle cx='26' cy='6' r='6' fill='%23FFBD2E' stroke='%23DEA123' stroke-width='.5'%3E%3C/circle%3E%3Ccircle cx='46' cy='6' r='6' fill='%2327C93F' stroke='%231AAB29' stroke-width='.5'%3E%3C/circle%3E%3C/g%3E%3C/svg%3E");
  background-repeat: no-repeat;
}
</style>
