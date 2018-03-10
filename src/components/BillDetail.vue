<template>
  <v-app>
    <v-toolbar dark color="primary">
      <v-btn icon @click="() => $router.go(-1)">
        <v-icon>arrow_back</v-icon>
      </v-btn>
      <v-toolbar-title v-if="bill" class="white--text">{{bill.name}}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu bottom left>
        <v-btn icon slot="activator" dark>
          <v-icon>more_vert</v-icon>
        </v-btn>
        <v-list>
          <v-list-tile @click="cancelBill">
            <v-list-tile-title>Cancel bill</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-toolbar>
    <v-content>
      <v-list dense v-if="cartOrderList.length > 0" two-line class="mb-2">
        <v-subheader>
          <span>Unsend orders</span>
          <v-spacer></v-spacer>
          <v-btn @click="send" outline small :loading="sending" color="primary">Send
          </v-btn>
        </v-subheader>
        <v-divider></v-divider>
        <router-link tag="v-list-tile" v-for="(order,i) in cartOrderList" :key="i" :to="{name: 'EditOrderMenu', params: {
          restaurantId: $route.params.restaurantId,
          billId: $route.params.billId,
          cartIndex: i,
          menuId: order.menu.id }
        }">
          <v-list-tile-content>
            <v-list-tile-title>{{order.menu.name}} {{order.price.name}} x{{order.quantity}}</v-list-tile-title>
            <v-list-tile-sub-title>{{order.optional}}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action-text>฿ {{order.price.value}}</v-list-tile-action-text>
        </router-link>
      </v-list>

      <v-list class="mb-2 pa-0" two-line v-for="(order,i) in orderList" :key="i" dense>
        <v-subheader>
          <span v-if="order.createAt">
            <timeago :since="order.createAt" :auto-update="60"></timeago> by {{order.creator}}</span>
          <v-spacer></v-spacer>
        </v-subheader>
        <v-divider></v-divider>
        <v-list-tile v-for="(orderItem,j) in order.order" :key="`${i}|${j}`">
          <v-list-tile-content>
            <v-list-tile-title>{{orderItem.menu.name}} {{orderItem.price.name}} x{{orderItem.quantity}}</v-list-tile-title>
            <v-list-tile-sub-title>{{orderItem.optional}}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action-text>฿ {{orderItem.price.value}}</v-list-tile-action-text>
        </v-list-tile>
      </v-list>

      <v-list v-if="orderList !== null && orderList.length > 0"  class="mb-2 pa-0" dense>
        <v-subheader>
          <span>Summary</span>
          <v-spacer></v-spacer>
          <v-btn outline small color="primary" @click="closeBill">Bill</v-btn>
        </v-subheader>
        <v-divider></v-divider>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>Total price</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action-text>฿ {{summary.totalPrice}}</v-list-tile-action-text>
        </v-list-tile>
      </v-list>
      <v-btn fixed dark fab bottom right color="pink" @click.stop="onClickAddFab" :to="{ name: 'SearchMenu', params: { restaurantId: $route.params.restaurantId, billId: $route.params.billId }}">
        <v-icon>add</v-icon>
      </v-btn>
    </v-content>
  </v-app>
</template>

<script>
import firebaseApp from '../connector/firebase';
import orderService from '../service/order';
import billService from '../service/bill';

export default {
  data() {
    const { restaurantId } = this.$route.params;
    const restaurantRef = firebaseApp
      .firestore()
      .collection('restaurant')
      .doc(restaurantId);
    /*
    const billRef = firebaseApp
      .firestore()
      .collection('bill')
      .doc(billId);
      */
    return {
      managementDialog: {
        show: false,
        valid: false,
        form: {
          restaurant: restaurantRef,
        },
        error: {
          duplicate: false,
        },
      },
      creating: false,
      billList: null,
      sending: false,
      orderList: null,
    };
  },
  mounted() {
    const { billId } = this.$route.params;
    this.unsubscribe = orderService.onSnapshotByBillId(billId, (orderList) => {
      this.orderList = orderList;
    });
  },
  destroyed() {
    this.unsubscribe();
  },
  methods: {
    async onClickAddFab() {
      console.log('click');
    },
    async cancelBill() {
      const { billId, restaurantId } = this.$route.params;
      billService
        .update({
          id: billId,
          status: 'cancel',
        })
        .then(() => {
          this.$router.push({ name: 'BillList', restaurantId });
        });
    },
    async closeBill() {
      const { billId } = this.$route.params;
      billService
        .update({
          id: billId,
          status: 'close',
        })
        .then(() => {
          console.log('Close');
        });
    },
    async send() {
      this.sending = true;
      const { restaurantId, billId } = this.$route.params;
      const cartOrderList = this.$store.getters.cartOrderList(billId);
      const { uid } = firebaseApp.auth().currentUser;
      const restaurantRef = firebaseApp
        .firestore()
        .collection('restaurant')
        .doc(restaurantId);
      const billRef = firebaseApp
        .firestore()
        .collection('bill')
        .doc(billId);
      const order = {
        order: cartOrderList,
        restaurant: restaurantRef,
        bill: billRef,
        creator: uid,
        doneAt: null,
      };
      orderService.create(order).then(() => {
        this.$store.dispatch('removeOrderFromCartByBillId', billId);
        this.sending = false;
      });
    },
  },
  computed: {
    bill() {
      const { billId } = this.$route.params;
      return this.$store.getters.bill(billId);
    },
    cartOrderList() {
      const { billId } = this.$route.params;
      return this.$store.getters.cartOrderList(billId);
    },
    summary() {
      const orderList = this.orderList || [];
      const sumOrder = e =>
        e.reduce((pV, cV) => pV + (cV.price.value * cV.quantity), 0);
      const totalPrice = orderList
        .map(e => e.order)
        .reduce((pV, cV) => pV + sumOrder(cV), 0);
      return { totalPrice };
    },
  },
};
</script>

<style scoped>
a {
  text-decoration: none;
}

#app {
  background: #eeeeee;
}
</style>
