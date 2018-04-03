/* eslint no-param-reassign: 0 */
const snackBarStore = {
  state: {
    text: '',
    show: false,
    snackBarDate: new Date(),
  },
  mutations: {
    showSnackBar(state, text) {
      state.snackBarDate = new Date();
      state.text = text;
      state.show = true;
    },
    setShow(state, show) {
      state.show = show;
    },
  },
  actions: {
    showSnackBar({ commit }, text) {
      commit('showSnackBar', text);
    },
    setShow({ commit }, show) {
      commit('setShow', show);
    },
  },
  getters: {
    text: state => state.text,
    show: state => state.show,
    snackBarkey: state => state.snackBarkey,
  },
};

export default snackBarStore;
