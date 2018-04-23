<template>
<v-app>
<router-view></router-view>
  <v-snackbar
    :key="snackBarDate"
    :timeout="1250"
    bottom
    v-model="show">
    {{ text }}
    <!--<v-btn flat color="pink" @click.native="$store.dispatch('setShow', false)">Close</v-btn>-->
  </v-snackbar>
  </v-app>
</template>

<script>
export default {
  computed: {
    text() {
      return this.$store.getters.text;
    },
    snackBarDate() {
      return this.$store.state.snackBar.snackBarDate.toISOString();
    },
    show: {
      get() {
        return this.$store.getters.text;
      },
      set(val) {
        this.$store.dispatch('setShow', val);
      },
    },
  },
};
</script>
