<template>
  <div class="user-profile-page">
    <div class="coming-soon">
      <h1>User Profile Page</h1>
      <p>Coming soon! User ID: {{ id }}</p>
      <router-link to="/" class="btn-primary">Back to Home</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  id: string
}

defineProps<Props>()
</script>

<style lang="less" scoped>
.coming-soon {
  text-align: center;
  padding: @space-16;
  
  h1 {
    color: @color-text;
    margin-bottom: @space-4;
  }
  
  p {
    color: @color-text-dim;
    margin-bottom: @space-6;
  }
}

.btn-primary {
  .m-button-primary();
  text-decoration: none;
}
</style>
