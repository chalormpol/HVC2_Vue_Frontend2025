<template>
  <nav class="navbar">
    <h2 class="logo" @click="router.push('/vehicles-employee')">Car Service</h2>

    <div class="menu">
      <!-- <router-link to="/" class="link">Home</router-link> -->

      <template v-if="isLogin">
        <label for="" class="link">ยินดีต้อนรับ {{ localUser.role }} </label>
        <label for="" class="link" @click="logout">Logout</label>
      </template>

      <template v-else>
        <router-link to="/login" class="link">Login</router-link>
      </template>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const isLogin = ref(false);
const router = useRouter();

const localUser = JSON.parse(localStorage.getItem("user"));

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
.navbar {
  height: 64px;
  background-color: #404040;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
}

.logo {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;

  /* ✅ Logo hover เด้งนิด ๆ */
  transition: transform 0.3s ease, text-shadow 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
}

.menu {
  display: flex;
  gap: 20px;
}

.link {
  color: white;
  text-decoration: none;
  font-weight: 500;
  opacity: 0.8;
  position: relative;

  /* ✅ transition นุ่ม */
  transition: all 0.25s ease;
}

/* ✅ เส้นขีดใต้วิ่งจากกลาง */
.link::after {
  content: "";
  position: absolute;
  width: 0%;
  height: 2px;
  left: 50%;
  bottom: -6px;
  background: white;
  transition: 0.3s;
  transform: translateX(-50%);
}

.link:hover {
  opacity: 1;
  transform: translateY(-2px);
}

.link:hover::after {
  width: 100%;
}

/* ✅ เมนูที่ active */
.active {
  opacity: 1;
  font-weight: 600;
}

.active::after {
  width: 100%;
}
</style>
