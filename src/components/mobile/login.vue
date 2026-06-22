<script>
import { ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, helpers } from '@vuelidate/validators';
export default {
  name: 'mlogin',
  setup: () => ({ v$: useVuelidate() }),
  data: () => ({
    userId: '',
    passwd: '',
  }),
  validations() {
    return {
      userId: {
        required: helpers.withMessage('ID를 입력하여 주세요.', required),
      },
      passwd: {
        required: helpers.withMessage('비밀번호를 입력하여 주세요.', required),
        // minLength: helpers.withMessage("비밀번호는 4자 이상 입니다.", minLength(4)),
      },
    };
  },
  methods: {
    async doLogin(info) {
      let validateMsg = '';
      const result = await this.v$.$validate();
      if (this.v$.$errors.length > 0) {
        this.$popup({
          type: 'mobileAlert',
          msg: this.v$.$errors[0].$message,
        });
        return false;
      }
      const params = {
        userId: this.userId,
        passwd: this.passwd,
      };
      this.$store.dispatch('auth/login', params).then(
        (res) => {
          this.$store.commit('auth/SET_LOGGED_OUT', false); // 로그아웃 상태 초기화
          this.$router.push('/mobile');
        },
        (error) => {
          this.message =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString();
          this.$popup({
            type: 'alert',
            msg: error?.message,
          });
        },
      );
    },
  },
};
</script>
<template>
  <div id="login" class="mobile">
    <div class="LoginForm">
      <div class="LoginImg"></div>
      <p>mobile</p>
      <div class="LoginBox">
        <!-- <div class="logo"></div> -->
        <div class="Hgroup">
          <div class="form_wrap">
            <span class="form_cell form_input login">
              <input v-model="userId" type="text" placeholder="아이디" required />
            </span>
          </div>
          <div class="form_wrap">
            <span class="form_cell form_input login">
              <input v-model="passwd" type="password" placeholder="비밀번호" required />
            </span>
          </div>
        </div>
        <div class="LoginMenu">
          <div>
            <div class="form_wrap">
              <span class="form_cell form_check login">
                <input type="checkbox" id="check01" />
                <label for="check01" class="checkbox">
                  <span>아이디 저장</span>
                </label>
              </span>
            </div>
          </div>
          <!-- <button type="button">
                        <span>비밀번호 찾기</span>
                    </button> -->
        </div>
        <button type="button" class="LoginBtn" @click="doLogin">
          <span>LOGIN</span>
        </button>
      </div>
    </div>
  </div>
</template>
