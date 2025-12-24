<template>
  <div class="login-wrapper">
    <form class="login-card" @submit.prevent="handleLogin">
      <h2 class="title">เข้าสู่ระบบ</h2>

      <div class="input-group">
        <input v-model="email" type="email" required placeholder=" " />
        <label>อีเมล</label>
      </div>

      <div class="input-group">
        <input v-model="password" type="password" required placeholder=" " />
        <label>รหัสผ่าน</label>
      </div>

      <button type="submit" class="login-btn" :disabled="loading">
        {{ loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ" }}
      </button>

      <router-link to="/register" class="register-btn">
        สมัครสมาชิก
      </router-link>

      <p class="footer-text">© 2025 Car Service Login</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "@/plugins/axios";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";

const router = useRouter();

const email = ref("");
const password = ref("");
const loading = ref(false);

const handleLogin = async () => {
  if (!email.value || !password.value) {
    Swal.fire("ผิดพลาด", "กรุณากรอกข้อมูลให้ครบ", "warning");
    return;
  }

  try {
    loading.value = true;

    const res = await axios.post("http://localhost:3000/api/login", {
      email: email.value,
      password: password.value,
    });

    // ✅ เก็บ Token + ข้อมูล user
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    await Swal.fire({
      title: "เข้าสู่ระบบสำเร็จ ✅",
      text: "ยินดีต้อนรับเข้าสู่ระบบ",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });

    if (res.data.user.role === "admin") {
      router.push("/dashboard");
    } else if (res.data.user.role === "employee") {
      router.push("/vehicles-employee");
    } else if (res.data.user.role === "user") {
      router.push("/add-vehicles");
    }
  } catch (error) {
    console.error("Login error:", error);

    Swal.fire("เข้าสู่ระบบไม่สำเร็จ", "อีเมลหรือรหัสผ่านไม่ถูกต้อง", "error");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* ✅ พื้นหลัง */
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2c2c2c, #2c2c2c, #ecf0f1);
}

/* ✅ กล่อง Login */
.login-card {
  width: 100%;
  max-width: 380px;
  padding: 40px 30px;
  background: white;
  border-radius: 18px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

/* ✅ หัวข้อ */
.title {
  text-align: center;
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 30px;
  color: #0f172a;
}

/* ✅ Input แบบลอย (แก้ label เด้งแล้ว ✅) */
.input-group {
  position: relative;
  margin-bottom: 24px;
}

.input-group input {
  width: 92%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #ddd;
  font-size: 15px;
  outline: none;
  transition: 0.2s;
}

.input-group input:focus {
  border-color: #4facfe;
  box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.25);
}

.input-group label {
  position: absolute;
  top: 50%;
  left: 14px;
  transform: translateY(-50%);
  background: white;
  padding: 0 6px;
  color: #999;
  font-size: 14px;
  pointer-events: none;
  transition: 0.2s;
}

/* ✅ แก้ปัญหา label เด้ง */
.input-group input:focus + label,
.input-group input:not(:placeholder-shown) + label {
  top: -6px;
  font-size: 12px;
  color: #4facfe;
}

/* ✅ ปุ่ม Login */
.login-btn {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: none;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  box-shadow: 0 8px 20px rgba(79, 172, 254, 0.45);
  transition: all 0.2s ease;
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

/* ✅ ข้อความด้านล่าง */
.footer-text {
  margin-top: 24px;
  text-align: center;
  font-size: 13px;
  color: #94a3b8;
}

/* ✅ ปุ่มสมัครสมาชิก */
.register-btn {
  display: block;
  margin-top: 12px;
  padding: 12px;
  text-align: center;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  color: #4facfe;
  border: 2px solid #4facfe;
  transition: all 0.2s ease;
}

.register-btn:hover {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: white;
  transform: translateY(-2px);
}
</style>
