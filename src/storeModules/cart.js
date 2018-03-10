/* eslint no-param-reassign: 0 */

const orderCartStore = {
  state: {
    cartOrderList: [],
  },
  mutations: {
    addOrderToCart(state, payload) {
      state.cartOrderList = [...state.cartOrderList,
        { ...payload.order, done: false, billId: payload.billId }];
    },
    removeOrderFromCartByBillId(state, billId) {
      state.cartOrderList = state.cartOrderList.map(cartOrder => cartOrder.billId !== billId);
    },
  },
  actions: {
    addOrderToCart({ commit }, payload) {
      commit('addOrderToCart', payload);
    },
    removeOrderFromCartByBillId({ commit }, billId) {
      commit('removeOrderFromCartByBillId', billId);
    },
  },
  getters: {
    cartOrderList: state => billId => state.cartOrderList
      .filter(cartOrder => cartOrder.billId === billId),
  },
};

export default orderCartStore;
