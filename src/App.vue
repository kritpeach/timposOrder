<template>
<v-app>
<router-view></router-view>
</v-app>
</template>

<script>
export default {
  data: () => ({
    snackbar: true,
    text: 'Hi! vBros',
  }),
};
</script>
