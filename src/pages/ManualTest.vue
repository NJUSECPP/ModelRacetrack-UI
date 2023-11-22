<template>
  <q-page class="q-ma-none">
    <div class="full-width row">
      <div class="col-3 no-border text-secondary" style="background-color: #e5e4e4;">
        <div class="bg-accent full-width q-px-lg q-pb-sm"
             style="height: 50px;border-bottom: 1px solid #ececec;border-right: 1px solid #ececec;">
          <q-input style="font-size: small" v-model="modelKeyword" :dense="true" @change="changeModelKeyword"
                   label="搜索">
            <template v-slot:append>
              <q-icon v-if="modelKeyword !== ''" name="close" @click="modelKeyword = ''" class="cursor-pointer"/>
              <q-icon name="search"/>
            </template>
          </q-input>
        </div>
        <q-list class="q-pa-md ModelListHeight">
          <q-item clickable
                  v-ripple
                  :active="activatedModelId === item.id" active-class="activeModel"
                  @click="changeSession(item.id)"
                  v-for="item in Object.values(models)"
          >
            <q-item-section avatar>
              <q-avatar rounded>
                <img :src="getPublicUrl('logo/ai.png')">
                <q-badge floating color="red" rounded v-show="sessions[item.id] ? sessions[item.id].newReply : false"/>
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item.name }}</q-item-label>
              <q-item-label caption>{{ sessions[item.id] ? sessions[item.id].abstract : '' }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <div class="q-pa-lg flex flex-center justify-center" style="height: 150px">
          <q-pagination
            v-model="modelPageIndex"
            :max="(modelTotal - 1) / modelPageSize + 1"
            :max-pages="6"
            color="indigo-10"
            boundary-numbers
            @update:model-value="pageLoad"
          />
          <div class="q-px-sm text-indigo-10 text-bold">每页数量：</div>
          <q-select v-model="modelPageSize" color="indigo-10" dense :options="[20,10,5]"
                    @update:model-value="pageLoad(1)"/>
        </div>
      </div>
      <div class="col-9">
        <div v-show="this.activatedModelId !== -1" class="bg-accent ChatHeight">
          <q-scroll-area ref="scrollAreaRef" class="full-width ChatHeight">
            <div class="row justify-center q-pa-lg"
                 v-for="message in (this.sessions[activatedModelId] ? this.sessions[activatedModelId].messages : [])">
              <q-chat-message
                class="q-ma-lg col-12"
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
              </q-card>
            </div>
            <div class="row justify-center" v-if="this.sessions[activatedModelId] ? this.sessions[activatedModelId].waiting : false">
              <q-spinner-dots size="2rem"/>
            </div>
          </q-scroll-area>
        </div>
        <div v-if="this.sessions[activatedModelId]" class="bg-accent full-width"
             style="border-top: 2px solid #ececec;">
          <div class="full-width q-px-md" style="height: 251px;">
            <div class="full-width row" style="height: 45px;">
              <q-btn class=" q-mx-md" flat dense icon="settings" :disable="this.sessions[activatedModelId].waiting"
                     v-if="this.sessions[activatedModelId].freedomMode"
                     @click="showSetting=true;"></q-btn>
              <div v-else>
                <q-select
                  :disable="this.sessions[activatedModelId].waiting"
                  dense
                  style="width: 300px"
                  use-input
                  v-model="this.sessions[activatedModelId].activatedQuestion"
                  hide-selected
                  fill-input
                  input-debounce="0"
                  :options="questionOptions"
                  option-label="name"
                  label="选择题目"
                  @filter="filterQuestion"
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
              </div>
            </div>
            <div class="full-width" style="height: 150px;">
              <q-input style="height: 150px;" type="textarea" borderless standout
                       v-if="this.sessions[activatedModelId].freedomMode"
                       v-model="this.sessions[activatedModelId].nextMessage"></q-input>
              <div class="full-width questionDescBox" v-else>
                {{
                  this.sessions[activatedModelId].activatedQuestion ? this.sessions[activatedModelId].activatedQuestion.description : ""
                }}
              </div>
            </div>
            <div class="full-width row justify-end q-px-md q-py-sm" style="height: 56px;">
              <q-btn v-if="this.sessions[activatedModelId].freedomMode" dense color="primary" class="col-1" label="发送"
                     :disable="this.sessions[activatedModelId].waiting"
                     @click="send"/>
              <q-btn v-else dense color="primary" class="col-1" label="测试"
                     :disable="this.sessions[activatedModelId].waiting"
                     @click="test"/>
            </div>
          </div>
        </div>
      </div>
    </div>
    <q-dialog v-model="showSetting">
      <q-card style="width: 500px;background-color: rgba(255,255,255,0.9);backdrop-filter: blur(20px)"
              class="q-px-sm q-pb-md">
        <q-card-section>
          <div class="text-h6">设置</div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import {defineComponent} from 'vue'
import {showWarn} from "src/libs/message";
import {marked} from "marked";
import {MESSAGE_TYPE, RESULT_TYPE, RESULT_TIPS, RESULT_COLORS} from "src/config/constant";
import {getAllQuestions} from "src/api/questionApi";
import {runWithOJ} from "src/api/runApi";
import {getPublicUrl} from "src/libs/imgUrl";
import {markdownToHtml} from "src/libs/markdown";
import 'highlight.js/styles/googlecode.css';

export default defineComponent({
  name: 'ManualTest',

  created() {
    window.addEventListener('resize', () => {
      this.resizeH();
    });
    this.active(true);
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
      models: {},
      showModels: [],
      questions: {},
      sessions: {},
      activatedModelId: -1,
      showSetting: false,


      questionOptions: [],

      ht: 0,

      modelKeyword: "",
      modelPageSize: 10,
      modelPageIndex: 1,
      modelTotal: 999,
      modelLoading: false,
      modelResizeLoadingTimeout: undefined,
    }
  },
  methods: {
    getPublicUrl,
    active(reload) {
      this.$emit('refreshActive');
      this.resizeH();
      if (reload) {
        this.pageLoad(1);
      }
    },
    pageLoad(index) {
      if (this.modelLoading) {
        return;
      }
      this.$emit('showLoading')
      this.modelLoading = true;
      this.$store.getters.getAllModels(this.modelKeyword, index, this.modelPageSize).then(data => {
        let activatedExists = false;
        this.models = data.models.reduce((obj, item) => {
          if (item.id === this.activatedModelId) {
            activatedExists = true;
          }
          obj[item.id] = item;
          return obj;
        }, {});
        this.modelTotal = data.total;
        this.modelPageIndex = index;
        if (!activatedExists) {
          if (data.models.length > 0) {
            this.changeSession(data.models[0].id);
          } else {
            this.changeSession(-1);
          }
        }

      }).catch(err => {
        this.$emit('showError', "请求模型时异常", err);
      }).finally(() => {
        this.modelLoading = false;
        this.$emit('hideLoading')
      })
    },
    resizeH() {
      this.ht = window.innerHeight
      let chs = document.querySelectorAll(".ChatHeight")
      for (let i = 0; i < chs.length; i++) {
        chs[i].style.height = (this.ht - 304) + 'px'
      }
      let mlhs = document.querySelectorAll(".ModelListHeight")
      for (let i = 0; i < mlhs.length; i++) {
        mlhs[i].style.height = (this.ht - 253) + 'px'
      }
    },

    newSession(modelId) {
      return {
        modelId: modelId,
        messages: {},
        maxMessageIndex: -1,
        messageISN: 0,
        nextMessage: "",
        waiting: false,
        newReply: false,
        abstract: "",
        freedomMode: false,
        activatedQuestion: undefined,
        disableSetting: false,
      }
    },
    markdownToHtml(txt) {
      return marked(txt);
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

    startRun(modelId) {
      this.sessions[modelId].disableSetting = true;
      this.sessions[modelId].waiting = true;
    },

    endRun(modelId) {
      this.sessions[modelId].messageISN = this.sessions[modelId].maxMessageIndex + 1;
      this.sessions[modelId].waiting = false;
      this.sessions[modelId].disableSetting = false;
    },

    send() {
      let modelId = this.activatedModelId;
      let messageText = this.sessions[this.activatedModelId].nextMessage;
      this.sessions[this.activatedModelId].nextMessage = "";
      if (modelId === -1) {
        showWarn("系统错误，请换个模型重试！");
        return;
      }
      if (messageText.length === 0) {
        showWarn("不能发送空内容！");
        return;
      }

    },

    test() {
      let modelId = this.activatedModelId;
      let question = this.sessions[this.activatedModelId].activatedQuestion;
      let isn = this.sessions[this.activatedModelId].messageISN;
      if (modelId === -1) {
        showWarn("系统错误，请换个模型重试！");
        return;
      }
      if (!question) {
        showWarn("请先选择题目！");
        return;
      }
      let questionId = question.questionId;
      let modelName = this.models[modelId].name;
      this.startRun(modelId);
      let that = this;
      runWithOJ(modelName, questionId,
        message => {
          if (Object.keys(message).length === 0) {
            that.appendMessage(modelId, "\n", isn);
          } else if (message.type === -1) {
            that.appendMessage(modelId, message.text, isn, message.index, message.offset);
          } else {
            that.addMessage(modelId, message.type, message.result, message.text, isn, message.index);
          }
        }
      ).catch(error => {
        that.addMessage(modelId, MESSAGE_TYPE.SYSTEM, RESULT_TYPE.ERROR, error.message, isn);
      }).then(() => {
        that.endRun(modelId);
      })
    },

    addMessage(modelId, type, result, content, isn, index = -1) {
      if (!this.sessions[modelId]) {
        this.sessions[modelId] = this.newSession(modelId);
      }
      let absIndex = index + isn;
      if (index < 0) {
        absIndex = this.sessions[modelId].maxMessageIndex;
      }
      if (absIndex > this.sessions[modelId].maxMessageIndex) {
        this.sessions[modelId].maxMessageIndex = absIndex;
      }
      this.sessions[modelId].messages[absIndex] = {
        index: index,
        type: type,
        result: result,
        content: content,
        htmlContent: markdownToHtml(content)
      };
      this.$nextTick(() => {
        if (absIndex === this.sessions[modelId].maxMessageIndex) {
          const abstract = (type === MESSAGE_TYPE.REPLY ? this.models[modelId].name + ":" : "") + content;
          this.sessions[modelId].abstract = abstract.length < 24 ? abstract : abstract.slice(0, 24);
          if (this.activatedModelId === modelId) {
            this.scrollToEnd(true);
          } else {
            this.sessions[modelId].newReply = true;
          }
        }
      });
    },
    appendMessage(modelId, content, isn, index = -1, offset = -1) {
      if (!this.sessions[modelId]) {
        return;
      }
      let absIndex = index + isn;
      if (index < 0) {
        absIndex = this.sessions[modelId].maxMessageIndex;
      }
      if (!this.sessions[modelId].messages[absIndex]) {
        return;
      }
      if (this.sessions[modelId].messages[absIndex].content.length < offset) {
        return;
      }
      let oldContent = "";
      if (offset >= 0) {
        oldContent = this.sessions[modelId].messages[absIndex].content.slice(0, offset);
      } else {
        oldContent = this.sessions[modelId].messages[absIndex].content;
      }
      this.sessions[modelId].messages[absIndex].content = oldContent + content;
      this.sessions[modelId].messages[absIndex].htmlContent = markdownToHtml(oldContent+content);
      if (absIndex === this.sessions[modelId].maxMessageIndex) {
        const type = this.sessions[modelId].messages[absIndex].type;
        const abstract = (type === MESSAGE_TYPE.REPLY ? this.models[modelId].name + ":" : "")
          + this.sessions[modelId].messages[absIndex].content;
        this.sessions[modelId].abstract = abstract.length < 24 ? abstract : abstract.slice(0, 24);
      }
    },

    changeSession(modelId) {
      if (this.activatedModelId !== modelId) {
        if (modelId !== -1) {
          if (!this.sessions[modelId]) {
            this.sessions[modelId] = this.newSession(modelId);
          }
          this.sessions[modelId].newReply = false;
          this.scrollToEnd(false);
        }
        this.activatedModelId = modelId;
      }
    },
    changeModelKeyword() {
      if (!this.modelLoading) {
        this.pageLoad(1);
      }
    },

    filterQuestion(val, update, abort) {
      getAllQuestions(val, 1, 2000).then(data => {
        for (let item of data.questions) {
          this.questions[item.questionId] = item;
        }
        update(() => this.questionOptions = data.questions);
      }).catch(err => {
        this.$emit('showError', "请求题目时异常", err);
      })
    }
  }
})
</script>

<style>
textarea {
  resize: none !important;
}


p {
  margin: 0 !important;
}

pre {
  position: relative;
}

.q-message-text:last-child {
  min-height: 30px !important;
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
