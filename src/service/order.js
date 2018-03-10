import firebase from 'firebase';
import firebaseApp from '../connector/firebase';

const create = async (order) => {
  const { id, ...noIdOrder } = order;
  const orderWithTimestamp = {
    ...noIdOrder,
    createAt: firebase.firestore.FieldValue.serverTimestamp(),
  };
  return firebaseApp
    .firestore()
    .collection('order')
    .add(orderWithTimestamp);
};

const update = async (order) => {
  const { id, ...noIdOrder } = order;
  return firebaseApp
    .firestore()
    .collection('order')
    .doc(id)
    .update(noIdOrder);
};

const remove = async orderId => firebaseApp
  .firestore()
  .collection('order')
  .doc(orderId)
  .delete();


const onSnapshot = (restaurantId, callback) => {
  const restaurant = firebaseApp.firestore().collection('restaurant').doc(restaurantId);
  const unsubscribe = firebaseApp
    .firestore()
    .collection('order')
    .where('restaurant', '==', restaurant)
    .orderBy('createAt')
    .onSnapshot((snap) => {
      const orderList = snap.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      }));
      callback(orderList);
    });
  return unsubscribe;
};

const onSnapshotOnlyNotDone = (restaurantId, callback) => {
  const restaurant = firebaseApp.firestore().collection('restaurant').doc(restaurantId);
  const unsubscribe = firebaseApp
    .firestore()
    .collection('order')
    .where('restaurant', '==', restaurant)
    .where('doneAt', '==', null)
    .orderBy('createAt')
    .onSnapshot((snap) => {
      const orderList = snap.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      }));
      callback(orderList);
    });
  return unsubscribe;
};

const onSnapshotByBillId = (billId, callback) => {
  const bill = firebaseApp.firestore().collection('bill').doc(billId);
  const unsubscribe = firebaseApp
    .firestore()
    .collection('order')
    .where('bill', '==', bill)
    .orderBy('createAt')
    .onSnapshot((snap) => {
      const orderList = snap.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      }));
      callback(orderList);
    });
  return unsubscribe;
};

const getAll = async (restaurantId) => {
  const restaurant = firebaseApp.firestore().collection('restaurant').doc(restaurantId);
  const snap = await firebaseApp
    .firestore()
    .collection('order')
    .where('restaurant', '==', restaurant)
    .orderBy('createAt')
    .get();
  const orderList = snap.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
  }));
  return orderList;
};

export default {
  create, update, remove, onSnapshot, getAll, onSnapshotByBillId, onSnapshotOnlyNotDone,
};

