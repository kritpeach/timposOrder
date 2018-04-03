<template>
<v-app>
<router-view></router-view>
  <v-snackbar
    :key="$store.state.snackBar.snackBarDate"
    :timeout="1250"
    top
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
      console.log(this.$store.getters.snackBarDate);
      return this.$store.getters.snackBarDate;
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
