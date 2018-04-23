<template>
  <div>
    <v-toolbar dark color="primary">
      <v-toolbar-title class="white--text">Bill</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu bottom left>
        <v-btn icon slot="activator" dark>
          <v-icon>more_vert</v-icon>
        </v-btn>
        <v-list>
          <router-link tag="v-list-tile" :to="{ name: 'Kitchen', params: {restaurantId: $route.params.restaurantId}}">
            <v-list-tile-title>Kitchen board</v-list-tile-title>
          </router-link>
          <v-list-tile @click="signout">
            <v-list-tile-title>Sign out</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-toolbar>
    <v-content>
      <v-list v-if="billList.length > 0" two-line>
        <router-link v-for="bill in billList" tag="v-list-tile" :key="bill.id" :to="{ name: 'BillDetail', params: {restaurantId: $route.params.restaurantId, billId: bill.id}}">
          <v-list-tile-content>
            <v-list-tile-title v-text="bill.name"></v-list-tile-title>
            <v-list-tile-sub-title>
              <timeago :since="bill.createAt" :auto-update="60"></timeago>
            </v-list-tile-sub-title>
          </v-list-tile-content>
        </router-link>
      </v-list>
      <div class="container centerContainer text-xs-center">
        <div v-if="!listeningBillList">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>        
        <template v-else-if="billList.length === 0">
        <div><v-icon size="200px">list</v-icon></div>
        <div class="title">
          Once you create a new bill, you'll see it listed here
        </div>
        </template>
      </div>
      <div style="height: 200px"></div>
      <v-btn fixed dark fab bottom right color="pink" @click.stop="onClickAddFab">
        <v-icon>add</v-icon>
      </v-btn>
    </v-content>
    <v-dialog v-model="managementDialog.show" persistent max-width="500px">
      <v-card>
        <v-form v-model="managementDialog.valid" ref="form">
          <v-card-title>
            <span class="headline">Open bill</span>
          </v-card-title>
          <v-card-text>
            <v-alert type="warning" :value="true" v-if="managementDialog.error.duplicate">This bill name has already been used.</v-alert>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex>
                  <v-text-field v-model="managementDialog.form.name" :rules="[v => !!v || 'Required']" label="Bill name"></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click="managementDialog.show = false">Close</v-btn>
            <v-btn color="primary" :loading="creating" :disabled="!managementDialog.valid" @click="createBill()">Create</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import firebaseApp from '../connector/firebase';
import billService from '../service/bill';

export default {
  data() {
    const { restaurantId } = this.$route.params;
    const restaurantRef = firebaseApp
      .firestore()
      .collection('restaurant')
      .doc(restaurantId);
    return {
      managementDialog: {
        show: false,
        valid: false,
        form: {
          name: '',
          status: 'open',
          restaurant: restaurantRef,
        },
        error: {
          duplicate: false,
        },
      },
      creating: false,
    };
  },
  computed: {
    billList() {
      return this.$store.getters.billList;
    },
    listeningBillList() {
      return this.$store.getters.listeningBillList;
    },
  },
  mounted() {
    /* const timer = setInterval(() => {
      if (this.billList.length === 0) {
        this.managementDialog.show = true;
        clearInterval(timer);
      }
    }, 250);
    */
  },
  methods: {
    async onClickAddFab() {
      this.$refs.form.reset();
      this.managementDialog.error.duplicate = false;
      this.managementDialog.show = true;
    },
    async signout() {
      try {
        await firebaseApp.auth().signOut();
        this.$router.push('/signin');
      } catch (e) {
        console.log(e);
      }
    },
    async createBill() {
      this.creating = true;
      await billService.create(this.managementDialog.form).then((bill) => {
        const { restaurantId } = this.$route.params;
        this.$router.push({
          name: 'BillDetail',
          params: { restaurantId, billId: bill.id },
        });
        this.managementDialog.show = false;
      });
      this.creating = false;
    },
  },
};
</script>

<style scoped>
a {
  text-decoration: none;
}
html,
body,
.container {
  height: 100%;
}
.centerContainer {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
</style>
