/* eslint no-param-reassign: 0 */
import orderService from '../service/order';

const orderStore = {
  state: {
    orderList: [],
    notDoneOrderList: [],
    listeningOrder: false,
    listenNotDoneOrder: false,
  },
  mutations: {
    setOrderList(state, orderList) {
      state.orderList = orderList;
    },
    setNotDoneOrderList(state, notDoneOrderList) {
      state.notDoneOrderList = notDoneOrderList;
    },
    setListeningOrder(state, isListen) {
      state.listeningOrder = isListen;
    },
    setListenNotDoneOrder(state, isListen) {
      state.listeningOrder = isListen;
    },
  },
  actions: {
    listenOrderList({ commit, state }, restaurantId) {
      if (state.listeningOrder === false) {
        orderService.onSnapshot(restaurantId, (orderList) => {
          commit('setOrderList', orderList);
          commit('setListeningOrder', true);
        });
      }
    },
    listenNotDoneOrderList({ commit, state }, restaurantId) {
      if (state.listenNotDoneOrder === false) {
        orderService.onSnapshotOnlyNotDone(restaurantId, (notDoneOrderList) => {
          commit('setNotDoneOrderList', notDoneOrderList);
          commit('setListenNotDoneOrder', true);
        });
      }
    },
  },
  getters: {
    orderList: state => state.orderList,
    notDoneOrderList: (state, getters) => {
      const notDoneOrderListWithBill = state.notDoneOrderList.map((order) => {
        if (order.bill) {
          const bill = getters.bill(order.bill.id);
          return { ...order, bill };
        }
        return order;
      });
      return notDoneOrderListWithBill;
    },
    order: state => id => state.orderList.find(order => order.id === id),
  },
};

export default orderStore;
