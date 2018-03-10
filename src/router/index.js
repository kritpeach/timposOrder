import Vue from 'vue';
import Router from 'vue-router';
import Signin from '@/components/Signin';
import BillList from '@/components/BillList';
import BillDetail from '@/components/BillDetail';
import CategoryList from '@/components/CategoryList';
import SearchMenu from '@/components/SearchMenu';
import OrderMenu from '@/components/OrderMenu';
import Kitchen from '@/components/Kitchen';
import firebaseApp from '../connector/firebase';

const auth = (to, from, next) => {
  if (firebaseApp.auth().currentUser) {
    next();
  } else {
    next(`signin?to=${to.path}`);
  }
};

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/signin',
      name: 'SignIn',
      component: Signin,
    },
    {
      path: '/r/:restaurantId',
      name: 'BillList',
      component: BillList,
      beforeEnter: auth,
    },
    {
      path: '/r/:restaurantId/b/:billId',
      name: 'BillDetail',
      component: BillDetail,
      beforeEnter: auth,
    },
    {
      path: '/r/:restaurantId/b/:billId/order',
      name: 'Order',
      component: CategoryList,
      beforeEnter: auth,
    },
    {
      path: '/r/:restaurantId/b/:billId/order/searchMenu',
      name: 'SearchMenu',
      component: SearchMenu,
      beforeEnter: auth,
    },
    {
      path: '/r/:restaurantId/b/:billId/order/menu/:menuId',
      name: 'OrderMenu',
      component: OrderMenu,
      beforeEnter: auth,
    },
    {
      path: '/r/:restaurantId/b/:billId/order/menu/:menuId/:cartIndex',
      name: 'EditOrderMenu',
      component: OrderMenu,
      beforeEnter: auth,
    },
    {
      path: '/r/:restaurantId/kitchen',
      name: 'Kitchen',
      component: Kitchen,
      beforeEnter: auth,
    },
  ],
});
