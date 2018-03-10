/* eslint no-param-reassign: 0 */
import billService from '../service/bill';

const billStore = {
  state: {
    billList: [],
    listeningBill: false,
  },
  mutations: {
    setBillList(state, billList) {
      state.billList = billList;
    },
    setListeningBill(state, listeningBill) {
      state.listeningBill = listeningBill;
    },
  },
  actions: {
    listenBillList({ commit, state }, restaurantId) {
      if (state.listeningBill === false) {
        billService.onSnapshot(restaurantId, 'open', (billList) => {
          commit('setBillList', billList);
          commit('setListeningBill', true);
        });
      }
    },
  },
  getters: {
    billList: state => state.billList,
    bill: state => id => state.billList.find(bill => bill.id === id),
  },
};

export default billStore;
