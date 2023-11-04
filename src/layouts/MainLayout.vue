<template>
  <q-layout view="lHh lpR fFf">

    <q-header bordered class="bg-accent text-secondary" height-hint="98">
      <q-toolbar style="height: 50px">
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer"/>
        <q-toolbar-title>
          {{ title }}
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered class="bg-secondary">
      <q-scroll-area style="height: calc(100% - 150px); margin-top: 150px;" class="text-info">
        <q-list>
          <div v-for="item in itemList">
            <q-expansion-item v-if="item.children !== undefined && item.children !== null && item.children.length !== 0"
                              v-model="item.isExpanded"
                              :header-class="item.isActivated?item.activateClass:''"
                              :icon="item.icon"
                              :label="item.name">
              <q-item v-for="subItem in item.children"
                      :active="subItem.isActivated" :active-class="'q-ml-lg '+item.activateClass"
                      class="q-ml-lg"
                      clickable
                      v-ripple
                      @click="changePage(subItem.path)"
              >
                <q-item-section avatar>
                  <q-icon :name="subItem.icon"/>
                </q-item-section>
                <q-item-section>
                  {{ subItem.name }}
                </q-item-section>
              </q-item>
            </q-expansion-item>
            <q-item v-else
                    clickable
                    v-ripple
                    :active="item.isActivated" :active-class="item.activateClass"
                    @click="changePage(item.path)"
            >
              <q-item-section avatar>
                <q-icon :name="item.icon"/>
              </q-item-section>
              <q-item-section>
                {{ item.name }}
              </q-item-section>
            </q-item>
          </div>
        </q-list>
      </q-scroll-area>
      <div class="absolute-top" style="height: 150px; padding: 40px 40px 40px 40px">
        <q-img :src="getPublicUrl('logo/logo.png')"></q-img>
      </div>

    </q-drawer>

    <q-page-container>
      <div v-if="error" class="text-accent typing" style="
      background-color:#333;
      padding: 45px 20px 20px;
      position: fixed;
      top: 50px;
      right: 0;
      bottom: 0;
      left: 300px;
      z-index: 100;" v-html="errorShow"></div>
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :style="{
            'background-image': 'url('+getPublicUrl('bg.png')+')',
            'background-color': '#f5f5f5',
            'background-repeat': 'no-repeat',
            'background-position': 'center center'
            }"
                     :is="Component"
                     @refreshActive="refreshActive"
                     @showError="showError"
                     @showLoading="showLoading"
                     @hideLoading="hideLoading"/>
        </keep-alive>
      </router-view>
      <q-inner-loading
        :showing="loading"
        label="加载中..."
        label-class="text-teal"
        label-style="font-size: 1.1em"
        style="background: rgb(255, 255, 255);"
      />
    </q-page-container>

  </q-layout>
</template>

<script>
import {defineComponent} from 'vue'
import {getPublicUrl} from "src/libs/imgUrl";

export default defineComponent({

  data() {
    return {
      leftDrawerOpen: true,
      title: "",
      itemList: [
        {
          name: "首页",
          icon: "fa-solid fa-house",
          path: "/",
          isActivated: false,
          isExpanded: false,
          children: null,
          activateClass: 'text-orange-4'
        },
        {
          name: "模型测试",
          icon: "fa-solid fa-flag-checkered",
          path: null,
          isActivated: false,
          isExpanded: false,
          activateClass: 'text-pink-4',
          children: [
            {
              name: "批量测试",
              icon: "fa-solid fa-trophy",
              path: "/test/auto",
              isActivated: false,
              isExpanded: false,
              activateClass: 'text-pink-4',
              children: null,
            },
            {
              name: "单独测试",
              icon: "fa-solid fa-person-rifle",
              path: "/test/manual",
              isActivated: false,
              isExpanded: false,
              activateClass: 'text-pink-4',
              children: null,
            },
          ],
        },
        {
          name: "模型管理",
          icon: "fa-solid fa-horse",
          path: "/manage/model",
          isActivated: false,
          isExpanded: false,
          activateClass: 'text-blue-4',
          children: null,
        },
        {
          name: "题库管理",
          icon: "fa-solid fa-road-barrier",
          path: "/manage/question",
          isActivated: false,
          isExpanded: false,
          activateClass: 'text-green-4',
          children: null,
        },
      ],

      error: false,
      errorShow: "",
      errorX: 0,
      errorY: 0,
      errorMessages: [],

      loading: false,
    }
  },

  methods: {
    getPublicUrl,
    toggleLeftDrawer() {
      this.leftDrawerOpen = !this.leftDrawerOpen;
    },
    refreshActive() {
      this.hideError();
      const nowPath = this.$route.path;
      this.itemList.forEach((item, index) => {
        this.refreshActiveDFS(nowPath, item);
      })
    },
    refreshActiveDFS(nowPath, item) {
      let res = false;
      if (item.children !== undefined && item.children !== null && item.children.length !== 0) {
        item.children.forEach((subItem, index) => {
          if (this.refreshActiveDFS(nowPath, subItem)) {
            res = true;
          }
        })
      } else if (item.path === nowPath) {
        this.title = item.name;
        res = true;
      }
      if (res) {
        item.isActivated = true;
        item.isExpanded = true;
      } else {
        item.isActivated = false;
      }
      return res;
    },
    changePage(path) {
      this.$router.push(path);
    },
    showError(message, err) {
      this.errorX = 0;
      this.errorY = 0;
      this.errorShow = "";
      this.error = true;
      this.errorMessages = [
        "∑( ° △ °|||)︴天啦噜! 看起来系统炸了。",
        "不过这再正常不过了。^_^||| ",
        "你可以刷新下看看能不能恢复。",
        "当然也可以选择摇人求助。",
        "~~~///(^v^)\\\\\\~~~"
      ]
      if (message && message.length > 0) {
        this.errorMessages.push("（ˇˍˇ） 嗯～，看起来错误的信息是：" + message);
      }
      if (err) {
        this.errorMessages.push("（⊙.⊙）错误的详情在这：" + err.toString());
      }
      this.nextType();
    },
    nextType() {
      if (this.errorY < this.errorMessages.length) {
        if (this.errorX < this.errorMessages[this.errorY].length) {
          this.errorShow += this.errorMessages[this.errorY].charAt(this.errorX++);
          setTimeout(this.nextType, 30);
        } else {
          this.errorShow += "<br />";
          this.errorY++;
          this.errorX = 0;
          this.nextType();
        }
      }
    },
    hideError() {
      this.error = false;
    },
    showLoading() {
      this.loading = true;
    },
    hideLoading() {
      this.loading = false;
    }
  }
})

</script>
<style>
.typing {
  position: relative;
  font-size: 18px;
  font-family: Arial, sans-serif;
  padding: 18px;
}

.typing::after {
  position: absolute;
  content: "_";
  animation: typing 1s linear infinite;
}

@keyframes typing {
  0%,
  49% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
}

.bg {
  background-color: #f5f5f5;
  background-image: url('/bg.png');
  background-repeat: no-repeat;
  background-position: center center;
}
</style>
