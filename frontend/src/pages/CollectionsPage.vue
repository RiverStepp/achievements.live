<template>
  <div class="collections-page">
    <div class="coming-soon">
      <h1>Collections Page</h1>
      <p>Manage your game collections here!</p>
      <router-link to="/" class="btn-primary">Back to Home</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
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
