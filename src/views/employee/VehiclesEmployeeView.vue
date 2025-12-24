<template>
  <div class="vehicles">
    <NavbarEmployee />
    <div class="main-layout">
      <SidebarEmployee />
      <div class="content">
        <VehiclesTable />
      </div>
    </div>
  </div>
</template>

<script setup>
import NavbarEmployee from "@/components/nav/NavbarEmployee.vue";
import SidebarEmployee from "@/components/nav/SidebarEmployee.vue";
import VehiclesTable from "@/components/employee/VehiclesEmployeeTable.vue";
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
