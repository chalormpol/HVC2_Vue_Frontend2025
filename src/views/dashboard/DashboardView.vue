<template>
  <div class="dashboard">
    <Navbar />
    <div class="main-layout">
      <Sidebar />
      <div class="content">
        <TypeCarTable />
      </div>
    </div>
  </div>
</template>

<script setup>
import Navbar from "@/components/nav/Navbar.vue";
import Sidebar from "@/components/nav/Sidebar.vue";
</script>

<style scoped>
.dashboard {
  background: linear-gradient(135deg, #2c2c2c, #2c2c2c, #ecf0f1);
  min-height: 100vh;
}

.main-layout {
  display: flex;
}

.content {
  flex: 1;
  padding: 2rem;
}
</style>