import Vuex from 'vuex'
import Vue from 'vue'

Vue.use(Vuex);
/*
    use this.$store instead of import store.js
    use this.$store.dispatch('actionName') to set state.xxx
    use this.$store.getters.getXxxx instead of this.$store.state.xxxx
    WARNING: DON'T ADD () AFTER this.$store.getters.getXxxx
*/
var store = new Vuex.Store({
    state: {
        isLogin: false,
        userId: "",
        userType: "",
        token: null,
        imgNames:[],
        tagsForAnnotation:[],             //进入任务时新增的状态
        taskDescription:'',               //任务的描述...
        tagsOfTask: [],                   //任务的标签，理论上来说后面的可以直接通过taskId到后台去取，但是现在懒得这样做了
    },
    mutations: {
        LOG_IN(state, data) {  //登入，保存状态
            sessionStorage.setItem("userId", data.userId);  //添加到sessionStorage
            sessionStorage.setItem("token", data.token);  //添加到sessionStorage
            sessionStorage.setItem("userType", data.userType);
            sessionStorage.setItem("isLogin", true);
            state.userId = data.userId;           //同步的改变store中的状态
            state.token = data.token;
            state.userType = data.userType;
            state.isLogin = true
        },
        SIGN_OUT(state) {   //退出，删除状态
            sessionStorage.removeItem("userId");  //移除sessionStorage
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("userType");
            sessionStorage.removeItem("isLogin");
            sessionStorage.removeItem('annotationIds');
            sessionStorage.removeItem('imgNames');
            state.userId = '';           //同步的改变store中的状态
            state.token = null;
            state.userType = '';
            state.isLogin = false;
            state.imgNames = [];
            state.annotationIds = [];
            state.tagsForAnnotation = [];
            state.tagsOfTask = [];
        },
        changeImgNames(state,newList){
            let temp = JSON.stringify(newList);
            sessionStorage.setItem('imgNames',temp);
            state.imgNames = newList;
        },
        changeTagsForAnnotation(state,newList){
            let temp = JSON.stringify(newList);
            sessionStorage.setItem('tagsForAnnotation',temp);
            state.tagsForAnnotation = newList;
        },
        changeTaskDescription(state,description){
            sessionStorage.setItem('taskDescription',description);
            state.taskDescription = description;
        },
        changeTagsOfTask(state,newList){
            let temp = JSON.stringify(newList);
            sessionStorage.setItem('tagsOfTask',temp);
            state.tagsOfTask = newList;
        }
    },
    actions: {
        logIn({commit}, data) {
            commit("LOG_IN", data);
        },
        doSignOut({commit}) {
            commit("SIGN_OUT");
        }
    },
    getters: {
        getUserId(state) {
            if (!state.isLogin || state.isLogin === null || state.isLogin === undefined) {
                state.isLogin = sessionStorage.getItem('isLogin');   //从sessionStorage中读取状态
                state.userId = sessionStorage.getItem('userId');
                state.token = sessionStorage.getItem('token');
                state.userType = sessionStorage.getItem('userType');
            }
            return state.userId;
        },
        getToken(state) {
            if (!state.isLogin || state.isLogin === null || state.isLogin === undefined) {
                state.isLogin = sessionStorage.getItem('isLogin');   //从sessionStorage中读取状态
                state.userId = sessionStorage.getItem('userId');
                state.token = sessionStorage.getItem('token');
                state.userType = sessionStorage.getItem('userType');
            }
            return state.token;
        },
        getUserType(state) {
            if (!state.isLogin || state.isLogin === null || state.isLogin === undefined) {
                state.isLogin = sessionStorage.getItem('isLogin');   //从sessionStorage中读取状态
                state.userId = sessionStorage.getItem('userId');
                state.token = sessionStorage.getItem('token');
                state.userType = sessionStorage.getItem('userType');
            }
            return state.userType;
        },
        getImgNames(state){
            state.imgNames = JSON.parse(sessionStorage.getItem('imgNames'));
            return state.imgNames;
        },
        getTagsForAnnotation(state){
            state.tagsForAnnotation = JSON.parse(sessionStorage.getItem('tagsForAnnotation'));
            return state.tagsForAnnotation;
        },
        getTaskDescription(state){
            state.taskDescription = sessionStorage.getItem('taskDescription');
            return state.taskDescription;
        },
        getTagsOfTask(state){
            state.tagsOfTask = JSON.parse(sessionStorage.getItem('tagsOfTask'));
            return state.tagsOfTask;
        }
    }
});

Vue.prototype.$store = store;