<template>
  <div class="vehicles">
    <NavbarUser />
    <div class="main-layout">
      <SidebarUser />
      <div class="content">
        <MaintenanceUserTable />
      </div>
    </div>
  </div>
</template>

<script setup>
import NavbarUser from "@/components/nav/NavbarUser.vue";
import SidebarUser from "@/components/nav/SidebarUser.vue";
import MaintenanceUserTable from "@/components/frontoffice/MaintenanceUserTable.vue";
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
