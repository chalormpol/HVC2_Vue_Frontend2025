<template>
  <div class="sidebar">
    <nav class="menu">
      <!-- <router-link to="/" class="link" exact-active-class="active"
        >Home</router-link
      > -->

      <template v-if="isLogin">
        <router-link
          to="/vehicles-employee"
          class="link"
          exact-active-class="active"
          >ยานพาหนะ</router-link
        >
        <router-link
          to="/maintenance-employee"
          class="link"
          exact-active-class="active"
          >การบำรุงรักษา</router-link
        >
        <label class="link logout" @click="logout">Logout</label>
      </template>

      <template v-else>
        <router-link to="/login" class="link" exact-active-class="active"
          >Login</router-link
        >
      </template>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const isLogin = ref(false);
const router = useRouter();

const checkLogin = () => {
  isLogin.value = !!localStorage.getItem("token");
};

const logout = () => {
  const confirmLogout = confirm("คุณต้องการออกจากระบบใช่หรือไม่?");
  if (confirmLogout) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
    checkLogin();
  }
};

onMounted(() => {
  checkLogin();
});
</script>

<style scoped>
.sidebar {
  width: 150px;
  min-height: 100vh;
  background-color: #404040;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  box-shadow: 4px 0 14px rgba(0, 0, 0, 0.12);
}

.logo {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 40px;
  cursor: pointer;
  transition: transform 0.3s ease, text-shadow 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.link {
  color: white;
  text-decoration: none;
  font-weight: 500;
  opacity: 0.8;
  position: relative;
  padding: 6px 0;
  transition: all 0.25s ease;
}

.link::after {
  content: "";
  position: absolute;
  width: 0%;
  height: 2px;
  left: 50%;
  bottom: 0;
  background: white;
  transition: 0.3s;
  transform: translateX(-50%);
}

.link:hover {
  opacity: 1;
  transform: translateX(4px);
}

.link:hover::after {
  width: 100%;
}

.active {
  opacity: 1;
  font-weight: 600;
}

.active::after {
  width: 100%;
}

.logout {
  cursor: pointer;
}
</style>
