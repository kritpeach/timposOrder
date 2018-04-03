<template>
  <div v-if="authInited">
    <div class="box elevation-4">
      <h1>Staff sign in</h1>
      <v-form v-model="valid">
        <v-text-field label="E-mail or Restaurant ID" v-model="username" required></v-text-field>
        <v-text-field label="Password" :rules="passwordRules" v-model="password" :append-icon="passwordIcon ? 'visibility' : 'visibility_off'" :append-icon-cb="() => (passwordIcon = !passwordIcon)" :type="passwordIcon ? 'password' : 'text'" required></v-text-field>
        <div style="text-align: right;">
          <v-btn depressed :loading="signingIn" :disabled="!valid" color="primary" @click="signin" class="nosideMargin">
            Sign in
          </v-btn>
        </div>
        <v-alert v-if="signinError" type="error" :value="true">
          {{signinError}}
        </v-alert>
      </v-form>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag';
import firebaseApp from '../connector/firebase';

function b64DecodeUnicode(str) {
  // Going backwards: from bytestream, to percent-encoding, to original string.
  return decodeURIComponent(atob(str)
    .split('')
    .map(c => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
    .join(''));
}
export default {
  mounted() {
    firebaseApp.auth().onAuthStateChanged(async (user) => {
      this.authInited = true;
      if (user) {
        const idToken = await user.getIdToken();
        const payload = JSON.parse(b64DecodeUnicode(idToken.split('.')[1]));
        if (payload.role === 'staff') {
          console.log(this.$route.query);
          this.$store.dispatch('listenBillList', payload.restaurantId);
          this.$store.dispatch('listenCategoryList', payload.restaurantId);
          this.$store.dispatch('listenMenuList', payload.restaurantId);
          const { to } = this.$route.query;
          if (to) {
            this.$router.replace(to);
          } else {
            this.$router.replace({
              name: 'BillList',
              params: { restaurantId: payload.restaurantId },
            });
          }
        }
      }
    });
  },
  data: () => ({
    authInited: false,
    valid: true,
    username: '',
    password: '',
    passwordIcon: true,
    signingIn: false,
    signinError: null,
    customToken: '',
    emailRules: [
      v => !!v || 'E-mail is required',
      v =>
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
        'E-mail must be valid',
    ],
    passwordRules: [
      v => !!v || 'Password is required',
      v => v.length >= 8 || 'At least 8 character',
    ],
  }),
  methods: {
    async signin() {
      this.signingIn = true;
      this.signinError = null;
      try {
        const gqlRespone = await this.$apollo.query({
          query: gql`
            query($restaurantName: String!, $employeePassword: String!) {
              employeeToken(
                restaurantName: $restaurantName
                employeePassword: $employeePassword
              ) {
                success
                employeeDoesNotExist
                restaurantNameDoesNotExist
                token
              }
            }
          `,
          variables: {
            restaurantName: this.username,
            employeePassword: this.password,
          },
        });
        const { employeeToken } = gqlRespone.data;
        if (employeeToken.success) {
          await firebaseApp.auth().signInWithCustomToken(employeeToken.token);
        } else if (employeeToken.restaurantNameDoesNotExist) {
          this.signinError = 'restaurantNameDoesNotExist';
        } else if (employeeToken.employeeDoesNotExist) {
          this.signinError = 'employeeDoesNotExist';
        }
      } catch (e) {
        console.error(e);
      }
      this.signingIn = false;
    },
  },
};
</script>

<style scoped>
.box {
  width: 360px;
  background: white;
  margin: 7% auto;
  padding: 24px;
}
#app {
  background: #d2d6de;
}
.nosideMargin {
  margin: 6px 0px 6px 0px;
}
</style>

