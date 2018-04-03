<template>
  <div>
    <v-toolbar dark color="primary">
      <v-btn icon @click="goToBilllist">
        <v-icon>arrow_back</v-icon>
      </v-btn>
      <v-toolbar-title v-if="bill" class="white--text">{{bill.name}}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu bottom left>
        <v-btn icon slot="activator" dark>
          <v-icon>more_vert</v-icon>
        </v-btn>
        <v-list>
          <template v-if="isAllOrderCancelled">
            <v-list-tile @click="cancelBill">
              <v-list-tile-title>Cancel bill</v-list-tile-title>
            </v-list-tile>
          </template>
          <template v-else>
            <v-list-tile disabled>
              <v-list-tile-title>Cancel bill</v-list-tile-title>
            </v-list-tile>
          </template>
        </v-list>
      </v-menu>
    </v-toolbar>
    <v-content>
      <v-list dense v-if="cartOrderList.length > 0" class="mb-2">
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
          <v-list-tile-action-text>฿ {{order.price.value * order.quantity}}</v-list-tile-action-text>
        </router-link>
      </v-list>

      <v-list v-if="orderList.length > 0" class="pa-0 mb-2" dense>
        <v-subheader>
          <span>Order</span>
          <v-spacer></v-spacer>
        </v-subheader>
        <v-divider></v-divider>
        <template v-for="(order,i) in orderList">
          <v-list-tile v-for="(orderItem,j) in order.order" :key="`${i}|${j}`">
            <v-list-tile-content :class="{cancel: orderItem.cancel, done: orderItem.done}">
              <v-list-tile-title>{{orderItem.menu.name}} {{orderItem.price.name}} x{{orderItem.quantity}}</v-list-tile-title>
              <v-list-tile-sub-title>{{orderItem.optional}}</v-list-tile-sub-title>
            </v-list-tile-content>
            <v-list-tile-action-text>฿ {{orderItem.price.value * orderItem.quantity}}</v-list-tile-action-text>
          </v-list-tile>
        </template>
      </v-list>

      <v-list v-if="orderList !== null && orderList.length > 0" class="mb-2 pa-0" dense>
        <v-subheader>
          <span>Summary</span>
          <v-spacer></v-spacer>
          <v-btn outline :disabled="notDoneOrderCount > 0" small color="primary" @click.stop="onClickBill">Bill</v-btn>
        </v-subheader>
        <v-divider></v-divider>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>Total price</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action-text>฿ {{summary.totalPrice}}</v-list-tile-action-text>
        </v-list-tile>
      </v-list>
      <div style="height: 200px"></div>
      <v-btn fixed dark fab bottom right color="pink" @click.stop="onClickAddFab" :to="{ name: 'SearchMenu', params: { restaurantId: $route.params.restaurantId, billId: $route.params.billId }}">
        <v-icon>add</v-icon>
      </v-btn>
      <v-dialog v-model="billDialog.show" persistent max-width="500px">
        <v-card>
          <v-form v-model="billDialog.valid" ref="form">
            <v-card-title>
              <span class="headline">Total price ฿{{summary.totalPrice}}</span>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex>
                    <v-text-field v-model.number="billDialog.form.receiveMoney" type="number" min="0" step="0.01" :rules="[rules.onlyNumber,rules.enoughMoney]" label="Receive money"></v-text-field>
                  </v-flex>
                </v-layout>
              </v-container>
              <span v-if="change >=0">Change ฿{{change}}</span>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click="billDialog.show = false">Close</v-btn>
              <v-btn color="primary" :loading="closingBill" :disabled="!billDialog.valid" @click="closeBill">Bill</v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-dialog>
    </v-content>
  </div>
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
      billDialog: {
        show: false,
        valid: false,
        form: {
          restaurant: restaurantRef,
        },
        error: {
          noMoney: false,
        },
      },
      closingBill: false,
      billList: null,
      sending: false,
      orderList: [],
      rules: {
        onlyNumber: (v) => {
          const pattern = /^[\d.]+$/;
          return pattern.test(v) || 'Please input only number';
        },
        enoughMoney: v => this.summary.totalPrice <= v || 'Not enough money',
      },
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
    async onClickBill() {
      this.$refs.form.reset();
      this.billDialog.error.noMoney = false;
      this.billDialog.show = true;
    },
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
      const { billId, restaurantId } = this.$route.params;
      this.closingBill = true;
      billService
        .update({
          id: billId,
          status: 'close',
        })
        .then(() => {
          this.closingBill = false;
          this.$router.push({ name: 'BillList', restaurantId });
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
    goToBilllist() {
      const { restaurantId } = this.$route.params;
      this.$router.replace({
        name: 'BillList',
        params: { restaurantId },
      });
    },
  },
  computed: {
    isAllOrderCancelled() {
      const isAllOrderCancelled = this.orderList.every(order =>
        order.order.every(orderListItem => orderListItem.cancel === true));
      return isAllOrderCancelled;
    },
    change() {
      return this.billDialog.form.receiveMoney - this.summary.totalPrice;
    },
    bill() {
      const { billId } = this.$route.params;
      return this.$store.getters.bill(billId);
    },
    cartOrderList() {
      const { billId } = this.$route.params;
      return this.$store.getters.cartOrderList(billId);
    },
    notDoneOrderCount() {
      return this.orderList.filter(order => order.doneAt === null).length;
    },
    summary() {
      const orderList = this.orderList || [];
      const sumOrder = e =>
        e.reduce((pV, cV) => {
          const total = cV.price.value * cV.quantity;
          return pV + total;
        }, 0);
      const totalPrice = orderList
        .map(e => e.order)
        .reduce(
          (pV, cV) =>
            pV +
            sumOrder(cV.filter(orderLineItem =>
              orderLineItem.cancel === false ||
                  typeof orderLineItem.cancel === 'undefined')),
          0,
        );
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

.cancel {
  text-decoration: line-through !important;
}

.done {
  color: #1b5e20;
}
</style>
