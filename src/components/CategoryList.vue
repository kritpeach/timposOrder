<template>
	<v-app light>
		<v-toolbar dark color="primary">
			<v-btn icon>
				<v-icon>arrow_back</v-icon>
			</v-btn>
			<v-toolbar-title>Category</v-toolbar-title>
			<v-spacer></v-spacer>
			<router-link :to="{name:'SearchMenu', params: { restaurantId, billId }}">
				<v-btn icon>
					<v-icon>search</v-icon>
				</v-btn>
			</router-link>
		</v-toolbar>
		<v-content>
			<v-list>
				<v-list-tile avatar v-for="category in categoryList" :key="category.id">
					<v-list-tile-content>
						<v-list-tile-title v-text="category.name"></v-list-tile-title>
					</v-list-tile-content>
				</v-list-tile>
			</v-list>
		</v-content>
	</v-app>
</template>

<script>
import firebaseApp from '../connector/firebase';

export default {
  data() {
    const { restaurantId, billId } = this.$route.params;
    const restaurantRef = firebaseApp
      .firestore()
      .collection('restaurant')
      .doc(restaurantId);
    return {
      restaurantRef,
      restaurantId,
      billId,
    };
  },
  computed: {
    categoryList() {
      return this.$store.getters.categoryList;
    },
  },
};
</script>

<style scoped>
a {
  text-decoration: none;
}
</style>
