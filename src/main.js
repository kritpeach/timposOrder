// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

import Vue from 'vue';
import Vuex from 'vuex';
import Vuetify from 'vuetify';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { setContext } from 'apollo-link-context';
import VueApollo from 'vue-apollo';
import VueTimeago from 'vue-timeago';
import 'vuetify/dist/vuetify.css';
import firebaseApp from './connector/firebase';
import storeModules from './storeModules';
import App from './App';
import router from './router';

const vueTimeAgoEn = require('vue-timeago/locales/en-US.json');

const httpLink = new HttpLink({
  uri: 'https://us-central1-tumtim-50d1c.cloudfunctions.net/api/graphql',
});
// http://localhost:5000/tumtim-50d1c/us-central1/api/graphql
const authLink = setContext(async (_, { headers }) => {
  let token = null;
  try {
    token = await firebaseApp.auth().currentUser.getIdToken();
  } catch (e) {
    token = null;
  }
  return {
    headers: {
      ...headers,
      authorization: token,
    },
  };
});

const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  connectToDevTools: true,
});

const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
});

Vue.use(Vuetify);
Vue.use(VueApollo);
Vue.use(Vuex);
Vue.use(VueTimeago, {
  name: 'timeago', // component name, `timeago` by default
  locale: 'en-US',
  locales: {
    // you will need json-loader in webpack 1
    'en-US': vueTimeAgoEn,
  },
});
Vue.config.productionTip = false;

const store = new Vuex.Store({
  modules: storeModules,
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  provide: apolloProvider.provide(),
  template: '<App/>',
  components: { App },
});
