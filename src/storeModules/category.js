/* eslint no-param-reassign: 0 */
import categoryService from '../service/category';

const categoryStore = {
  state: {
    categoryList: [],
    listeningCategory: false,
  },
  mutations: {
    setCategoryList(state, categoryList) {
      state.categoryList = categoryList;
    },
    setListeningCategory(state, listeningCategory) {
      state.listeningCategory = listeningCategory;
    },
  },
  actions: {
    listenCategoryList({ commit, state }, restaurantId) {
      if (state.listeningCategory === false) {
        categoryService.onSnapshot(restaurantId, (categoryList) => {
          commit('setCategoryList', categoryList);
          commit('setListeningCategory', true);
        });
      }
    },
  },
  getters: {
    categoryList: state => state.categoryList,
  },
};

export default categoryStore;
