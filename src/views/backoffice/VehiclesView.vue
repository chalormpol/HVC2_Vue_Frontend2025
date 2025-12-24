<template>
  <div class="vehicles">
    <Navbar />
    <div class="main-layout">
      <Sidebar />
      <div class="content">
        <VehiclesTable />
      </div>
    </div>
  </div>
</template>

<script setup>
import Navbar from "@/components/nav/Navbar.vue";
import Sidebar from "@/components/nav/Sidebar.vue";
import VehiclesTable from "@/components/backoffice/VehiclesTable.vue";
</script>

<style scoped>
.vehicles {
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
