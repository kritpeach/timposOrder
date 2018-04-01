<template>
  <v-app light>

    <v-navigation-drawer fixed v-model="drawer" right app>
      <v-list dense>
        <v-subheader>Filter by categories</v-subheader>
        <v-divider></v-divider>
        <v-list-tile v-for="category in categoryList" :key="category.id">
          <v-list-tile-action>
            <v-checkbox v-model="filter.categoryIds" :value="category.id"></v-checkbox>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{category.name}}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-action>
            <v-checkbox v-model="filter.showNoCategory"></v-checkbox>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>No category</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar dark color="primary" fixed app>
      
      <router-link :to="{ name: 'BillList', params: {restaurantId: $route.params.restaurantId}}">
                <v-btn icon>
        <v-icon>arrow_back</v-icon>
      </v-btn>
            </router-link>
      <v-toolbar-title>Kitchen</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click.stop="drawer = !drawer">
        <v-icon>filter_list</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content>
      <v-container grid-list-md>
        <v-layout row wrap>
          <v-flex xs12 sm6 md4 xl3 v-for="order in notDoneOrderList" :key="order.id">
            <v-card>
              {{filter}}
              <v-list dense two-line>
                <v-subheader v-if="order.bill">{{order.bill.name}}&nbsp;-&nbsp;
                  <timeago :since="order.createAt" :auto-update="60"></timeago>
                </v-subheader>
                <v-divider></v-divider>
                <v-list-tile v-for="(menu,i) in order.order" v-if="filtered(menu)" :key="order.id + i" :class="{cancel: menu.cancel}">
                  <v-list-tile-action>
                    <v-checkbox v-if="!menu.cancel" @change="onCheckBoxChange(order)" v-model="menu.done"></v-checkbox>
                  </v-list-tile-action>
                  <v-list-tile-content>
                    <v-list-tile-title>{{menu.menu.name}}
                      <template v-if="menu.quantity > 1">x{{menu.quantity}}</template>
                    </v-list-tile-title>
                    <v-list-tile-sub-title>{{menu.optional}}</v-list-tile-sub-title>
                  </v-list-tile-content>
                  <v-list-tile-action>
                    <v-btn v-if="!menu.cancel && !menu.done" @click="onDeleteBtnClick(order,i)" icon ripple>
                      <v-icon color="grey lighten-1">delete</v-icon>
                    </v-btn>
                  </v-list-tile-action>
                </v-list-tile>
              </v-list>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
/* eslint no-param-reassign: 0 */
import firebase from 'firebase';
import firebaseApp from '../connector/firebase';

export default {
  data() {
    const { restaurantId } = this.$route.params;
    const restaurantRef = firebaseApp
      .firestore()
      .collection('restaurant')
      .doc(restaurantId);
    return {
      restaurantRef,
      drawer: null,
      filter: {
        categoryIds: [],
        showNoCategory: true,
      },
    };
  },
  mounted() {
    const { restaurantId } = this.$route.params;
    this.$store.dispatch('listenNotDoneOrderList', restaurantId);
    const timer = setInterval(() => {
      if (this.categoryList.length > 0) {
        const allCategoryId = this.categoryList.map(category => category.id);
        this.filter.categoryIds = allCategoryId;
        clearInterval(timer);
      }
    }, 250);
  },
  computed: {
    notDoneOrderList() {
      return this.$store.getters.notDoneOrderList;
    },
    categoryList() {
      return this.$store.getters.categoryList;
    },
  },
  methods: {
    filtered(menu) {
      const menuCategoryIds = menu.menu.categories;
      const filterCategoryIds = this.filter.categoryIds;
      if (this.filter.showNoCategory && Object.keys(menuCategoryIds).length === 0) {
        return true;
      }
      return filterCategoryIds.some(categoryId =>
        Object.prototype.hasOwnProperty.call(menuCategoryIds, categoryId));
    },
    onDeleteBtnClick(order, cancelIndex) {
      const newOrderList = [...order.order].map((o, i) => {
        if (cancelIndex === i) {
          return { ...o, cancel: true };
        }
        return o;
      });
      const notDoneAndNotCancel = newOrderList.filter(o => !(o.done || o.cancel));
      if (notDoneAndNotCancel.length > 0) {
        firebaseApp
          .firestore()
          .collection('order')
          .doc(order.id)
          .update({
            order: newOrderList,
          });
      } else {
        firebaseApp
          .firestore()
          .collection('order')
          .doc(order.id)
          .update({
            order: newOrderList,
            doneAt: firebase.firestore.FieldValue.serverTimestamp(),
          });
      }
    },
    onCheckBoxChange(order) {
      const notDoneAndNotCancel = order.order.filter(o => !(o.done || o.cancel));
      if (notDoneAndNotCancel.length > 0) {
        firebaseApp
          .firestore()
          .collection('order')
          .doc(order.id)
          .update({
            order: order.order,
          });
      } else {
        firebaseApp
          .firestore()
          .collection('order')
          .doc(order.id)
          .update({
            order: order.order,
            doneAt: firebase.firestore.FieldValue.serverTimestamp(),
          });
      }
    },
  },
};
</script>

<style scoped>
a {
  text-decoration: none;
}
.cancel {
  text-decoration: line-through;
}
</style>
