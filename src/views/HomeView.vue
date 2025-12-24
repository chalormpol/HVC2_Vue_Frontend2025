<script setup>
import Navbar from "@/components/nav/Navbar.vue";
</script>

<template>
  <div class="app-layout">
    <!-- ✅ Navbar -->
    <Navbar />

    <!-- ✅ หน้าเพจตาม router -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: #f5f7fa;
}

.main-content {
  padding: 24px;
}
</style>