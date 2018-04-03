<template>
  <div v-if="menu">
    <v-toolbar dark color="primary">
      <v-btn icon @click="() => $router.go(-1)">
        <v-icon>arrow_back</v-icon>
      </v-btn>
      <v-toolbar-title class="white--text">{{menu.name}}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="isUpdateMode" icon dark @click="removeOrder">
          <v-icon>delete</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content>
      <v-form v-model="valid">
      <v-list subheader>
        <v-subheader>Price</v-subheader>
        <v-radio-group class="pt-0" v-model="order.price">
          <v-list-tile v-for="price in menu.prices" :key="price.name + price.value">
            <v-radio :label="`${price.name} - ฿${price.value}`" :value="price"></v-radio>
          </v-list-tile>
        </v-radio-group>

        <v-divider></v-divider>
        <v-subheader>Special instruction</v-subheader>
        <v-list-tile>
          <v-text-field v-model="order.optional" label="Add a note (extra sauce, no onions, etc.)" single-line></v-text-field>
        </v-list-tile>

        <v-divider></v-divider>
        <v-subheader>Quantity</v-subheader>
        <v-list-tile>
          <v-text-field @change="onQuantityChange" v-model.number="order.quantity" single-line type="number" min="1" :rules="[v => v > 0 || 'At least 1']"></v-text-field>
        </v-list-tile>
      </v-list>
      <v-btn v-if="!isUpdateMode" :disabled="!valid" @click="addToCart" class="my-0 bottomBtn" depressed block fixed dark>Add to cart</v-btn>
      </v-form>
    </v-content>

  </div>
</template>

<script>
import firebaseApp from '../connector/firebase';
import listToMap from '../util/listToMap';

export default {
  data() {
    const { restaurantId, menuId } = this.$route.params;
    const restaurantRef = firebaseApp
      .firestore()
      .collection('restaurant')
      .doc(restaurantId);
    const menuRef = firebaseApp
      .firestore()
      .collection('menu')
      .doc(menuId);
    return {
      valid: true,
      restaurantRef,
      order: {
        menu: {
          id: menuId,
          ref: menuRef,
        },
        price: null,
        optional: '',
        quantity: 1,
      },
    };
  },
  mounted() {
    if (this.isUpdateMode) {
      this.order = this.cartOrder;
    } else if (this.menu) {
      const defaultPrice = this.menu.prices[0];
      this.order.price = defaultPrice;
    }
  },
  watch: {
    menu(menu) {
      // For working when refreshing
      const defaultPrice = menu.prices[0];
      this.order.price = defaultPrice;
    },
  },
  computed: {
    menu() {
      const { menuId } = this.$route.params;
      return this.$store.getters.menu(menuId);
    },
    cartOrder() {
      const { cartIndex, billId } = this.$route.params;
      return this.$store.getters.cartOrderList(billId)[cartIndex];
    },
    isUpdateMode() {
      const { cartIndex } = this.$route.params;
      return cartIndex >= 0;
    },
  },
  methods: {
    onQuantityChange(v) {
      if (v < 1) {
        this.order.quantity = 1;
      }
    },
    addToCart() {
      const { billId, restaurantId } = this.$route.params;
      const order = { ...this.order };
      order.menu.name = this.menu.name;
      order.menu.categories = listToMap(this.menu.categories);
      this.$store.dispatch('addOrderToCart', {
        order,
        billId,
      });
      this.$router.replace({
        name: 'BillDetail',
        params: { restaurantId, billId },
      });
      this.$store.dispatch('showSnackBar', `${order.menu.name} has been added`);
    },
    removeOrder() {
      this.order.billId = '';
      this.$router.go(-1);
      this.$store.dispatch('showSnackBar', `${this.order.menu.name} has been removed`);
    },
  },
};
</script>

<style scoped>
a {
  text-decoration: none;
}
.bottomBtn {
  bottom: 0;
}
</style>
