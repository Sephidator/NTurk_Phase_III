<template>
    <div class="logIn">
        <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px">
            <el-form-item>
                <label class="label">密码登录</label>
            </el-form-item>
            <el-form-item label="账号" prop="account">
                <el-input class="input" auto-complete="off" v-model="ruleForm.account" placeholder="请用邮箱登录"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input class="input" type="password" v-model="ruleForm.password" auto-complete="off"
                          placeholder="请输入密码"></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 0">
                <el-button @click="submitForm('ruleForm')"
                           class="logInButton">登陆
                </el-button>
            </el-form-item>
            <el-form-item>
                <el-button type="text" class="otherChoice" style="padding-left: 1em;">忘记密码</el-button>
                <el-button type="text" class="otherChoice" @click="toSignUpPage()">免费注册</el-button>
                <el-button type="text" class="otherChoice">其他登录方式</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script scoped>
	// import store from '../../store/store.js'
	import PasswordValidator from '../../js/PasswordValidator.js'
	import AccountValidator from '../../js/AccountValidator.js'
	import VirtualInterface from '../../js/interfaces/VirtualInterface.js'
	import ValidatorInterface from '../../js/interfaces/ValidatorInterface.js'
	import UserUtils from '../../js/utils/UserUtils.js'

	export default {
		data() {
			var validatePassword = (rule, value, callback) => {
				let passwordValidator = new PasswordValidator(value);
				// make sure that passwordValidator has a method called validate
				VirtualInterface.ensureImplements(passwordValidator, ValidatorInterface);
				let result = passwordValidator.validate();
				return result.isValid ? callback() : callback(result.errMsg)
			};
			var validateAccount = (rule, value, callback) => {
				let accountValidator = new AccountValidator(value);
				// make sure that accountValidator has a method called validate
				VirtualInterface.ensureImplements(accountValidator, ValidatorInterface);
				let result = accountValidator.validate();
				return result.isValid ? callback() : callback(result.errMsg)
			};
			return {
				ruleForm: {
					password: '',
					account: '',
				},
				rules: {
					password: [
						{validator: validatePassword, trigger: 'blur'},
					],
					account: [
						{validator: validateAccount, trigger: 'blur'}
					],
				},
			};
		},
		mounted: function () {
			/*
                test if store.js work or not, after refreshing the pages
             */
			// console.log(sessionStorage);
			// console.log(this.$store.getters.getUserId);
			// console.log(this.$store.getters.getUserType);
			// console.log(this.$store.getters.getToken);
		},
		methods: {
			toSignUpPage: function () {
				this.$router.push({path: '/entry/signup'});
				this.$router.forward();
			},
			submitForm(formName) {
				this.$refs[formName].validate((valid) => {
					if (valid) {
						this.doTheLogIn();
					} else {
						return false;
					}
				});
			},
			doWhileLogInSuccess(response) {
				this.$store.dispatch('logIn', {
					userId: response.data.userId,
					token: response.data.token,
					userType: response.data.userType
				});
				if (UserUtils.isAdmin(this)) {
					this.$router.push({path: '/admin'});
				}
				else {
					this.$router.push({path: '/profile'});
				}
				this.showMsg("登入成功");
				this.$router.forward();
			},
			doTheLogIn: function () {
				let argu = {
					url: "http://localhost:8086/auth/",
					method: "POST",
					data: {
						emailAddress: this.ruleForm.account,
						password: this.ruleForm.password
					},
				};
				this.$http(argu)
					.then(this.doWhileLogInSuccess)
					.catch((error) => {
						this.showMsg("帐号或密码错误");
						//console.log(error);
					})
			},
			showMsg: function (msg) {
				this.$message({
					title: '通知',
					message: msg
				});
			},
		}
	}
</script>

<style scoped>
    .logIn {
        font-family: Microsoft YaHei;
        width: 50%;
    }

    .input {
        width: 90%;
    }

    .label {
        font-size: 24px;
    }

    .el-form-item__label {
        font-size: 16px;
    }

    .logInButton {
        font-family: Microsoft YaHei;
        color: #FFFFFF;
        width: 90%;
        background: #A9A9A9;
        border-color: #A9A9A9;
    }

    .otherChoice {
        font-family: Microsoft YaHei;
        color: #A9A9A9;
    }
</style>