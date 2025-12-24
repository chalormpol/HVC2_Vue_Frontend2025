<template>
  <div class="register-wrapper">
    <form
      class="register-card"
      :class="{ success: success }"
      @submit.prevent="handleRegister"
    >
      <h2 class="title">สมัครสมาชิก</h2>

      <div class="input-group">
        <input v-model="email" type="email" required placeholder=" " />
        <label>อีเมล</label>
      </div>

      <div class="input-group">
        <input v-model="password" type="password" required placeholder=" " />
        <label>รหัสผ่าน</label>
      </div>

      <div class="input-group">
        <input
          v-model="confirmPassword"
          type="password"
          required
          placeholder=" "
          :class="{ error: password !== confirmPassword }"
        />
        <label>ยืนยันรหัสผ่าน</label>
      </div>

      <div class="input-group">
        <input v-model="firstName" type="text" required placeholder=" " />
        <label>ชื่อ</label>
      </div>

      <div class="input-group">
        <input v-model="lastName" type="text" required placeholder=" " />
        <label>นามสกุล</label>
      </div>

      <div class="input-group">
        <input v-model="phone" type="text" required placeholder=" " />
        <label>เบอร์โทรศัพท์</label>
      </div>

      <button type="submit" class="register-btn" :disabled="loading">
        {{ loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก" }}
      </button>

      <router-link to="/login" class="login-btn">เข้าสู่ระบบ</router-link>

      <p class="footer-text">© 2025 Car Service Register</p>
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
const confirmPassword = ref("");
const firstName = ref("");
const lastName = ref("");
const phone = ref("");
const loading = ref(false);
const success = ref(false);

const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return regex.test(email);
};

/* ✅ ตรวจรหัสผ่านอย่างน้อย 8 ตัว + มีตัวเลข */
const validatePassword = (pass) => {
  const regex = /^(?=.*\d).{8,}$/;
  return regex.test(pass);
};

const validatePhone = (phone) => {
  const regex = /^\d{9,10}$/;
  return regex.test(phone);
};

const handleRegister = async () => {
  if (!validateEmail(email.value)) {
    Swal.fire("อีเมลไม่ถูกต้อง", "กรุณากรอกอีเมลให้ถูกต้อง", "error");
    return;
  }

  if (password.value !== confirmPassword.value) {
    Swal.fire("ผิดพลาด", "รหัสผ่านไม่ตรงกัน", "error");
    return;
  }

  if (!validatePassword(password.value)) {
    Swal.fire(
      "รหัสผ่านไม่ปลอดภัย",
      "รหัสผ่านต้องมีอย่างน้อย 8 ตัว และมีตัวเลขอย่างน้อย 1 ตัว",
      "warning"
    );
    return;
  }

  if (!firstName.value || !lastName.value) {
    Swal.fire("ผิดพลาด", "กรุณากรอกชื่อและนามสกุล", "error");
    return;
  }

  if (!validatePhone(phone.value)) {
    Swal.fire({
      icon: "error",
      title: "กรุณากรอกข้อมูล",
      text: "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง",
    });
    return;
  }

  try {
    loading.value = true;

    const response = await axios.post("http://localhost:3000/api/register", {
      email: email.value.trim(),
      password: password.value,
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      phone: phone.value.trim(),
    });

    console.log(response.data);

    success.value = true;

    await Swal.fire({
      title: "สมัครสมาชิกสำเร็จ 🎉",
      text: "กำลังพาไปหน้าเข้าสู่ระบบ...",
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });

    router.push("/login");
  } catch (error) {
    console.error("Register error:", error);

    if (error.response?.status === 409) {
      Swal.fire("ผิดพลาด", "อีเมลนี้ถูกใช้งานแล้ว", "error");
    } else {
      Swal.fire("ผิดพลาด", "สมัครสมาชิกไม่สำเร็จ", "error");
    }

    if (!error.response) {
      Swal.fire("ผิดพลาด", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้", "error");
      return;
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.error {
  border-color: #ff4d4f;
  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.25);
}

/* ✅ Animation สมัครสำเร็จ */
.success {
  animation: pop 0.6s ease;
}

@keyframes pop {
  0% {
    transform: scale(0.95);
  }
  50% {
    transform: scale(1.03);
  }
  100% {
    transform: scale(1);
  }
}

/* ✅ พื้นหลัง */
.register-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2c2c2c, #2c2c2c, #ecf0f1);
}

/* ✅ กล่อง Register */
.register-card {
  width: 100%;
  max-width: 380px;
  padding: 40px 30px;
  background: white;
  border-radius: 18px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.title {
  text-align: center;
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 30px;
  color: #0f172a;
}

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

.input-group input:focus + label,
.input-group input:not(:placeholder-shown) + label {
  top: -6px;
  font-size: 12px;
  color: #4facfe;
}

/* ✅ ปุ่ม Register */
.register-btn {
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

.register-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.register-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

.footer-text {
  margin-top: 24px;
  text-align: center;
  font-size: 13px;
  color: #94a3b8;
}

/* ✅ ปุ่ม Login */
.login-btn {
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

.login-btn:hover {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: white;
  transform: translateY(-2px);
}
</style>
