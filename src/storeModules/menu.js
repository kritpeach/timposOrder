/* eslint no-param-reassign: 0 */
import menuService from '../service/menu';

const menuStore = {
  state: {
    menuList: [],
    listeningMenu: false,
  },
  mutations: {
    setMenuList(state, menuList) {
      state.menuList = menuList;
    },
    setListeningMenu(state, listeningMenu) {
      state.listeningMenu = listeningMenu;
    },
  },
  actions: {
    listenMenuList({ commit, state }, restaurantId) {
      if (state.listeningMenu === false) {
        menuService.onSnapshot(restaurantId, (menuList) => {
          commit('setMenuList', menuList);
          commit('setListeningMenu', true);
        });
      }
    },
  },
  getters: {
    findMenuList: state => name => state.menuList
      .filter(menu => menu.name.toLowerCase()
        .includes(name.toLowerCase())),
    menu: state => id => state.menuList.find(menu => menu.id === id),
  },
};
export default menuStore;
