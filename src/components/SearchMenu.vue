<template>
    <v-app light transition="slide-x-transition">
        <v-toolbar color="primary">
          <v-text-field class="darken-4" autofocus prepend-icon="arrow_back" :prepend-icon-cb="() => $router.go(-1)" solo hide-details single-line v-model="keyword"></v-text-field>
        </v-toolbar>
        <v-content>
        <v-list>
          <router-link tag="v-list-tile" :to="{ name: 'OrderMenu', params: { restaurantId, billId, menuId: menu.id }}" avatar v-for="menu in menuList" :key="menu.id">
            <v-list-tile-content>
              <v-list-tile-title v-text="menu.name"></v-list-tile-title>
            </v-list-tile-content>
          </router-link>
        </v-list>
        </v-content>
    </v-app>
</template>

<script>
import firebaseApp from '../connector/firebase';

export default {
  data() {
    const { restaurantId, billId } = this.$route.params;
    const restaurantRef = firebaseApp
      .firestore()
      .collection('restaurant')
      .doc(restaurantId);
    return {
      restaurantRef,
      restaurantId,
      billId,
      keyword: '',
    };
  },
  computed: {
    menuList() {
      return this.$store.getters.findMenuList(this.keyword);
    },
  },
};
</script>

<style scoped>
a {
  text-decoration: none;
}
</style>
