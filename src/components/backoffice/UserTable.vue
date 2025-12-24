<template>
  <div class="table-wrapper">
    <div class="table-card">
      <h2 class="title">รายการผู้ใช้</h2>

      <!-- ปุ่มเปิด Add Modal -->
      <div class="search-box">
        <button @click="showModal = true" class="open-btn">
          + เพิ่มผู้ใช้
        </button>

        <!-- Search Box -->
        <input
          v-model="searchQuery"
          type="text"
          placeholder="🔍 ค้นหาตามรหัส/ชื่อ"
        />
      </div>

      <!-- ตาราง -->
      <table class="user-table">
        <thead>
          <tr>
            <th>#</th>
            <th>ชื่อผู้ใช้</th>
            <th>อีเมล</th>
            <th>เบอร์โทรศัพท์</th>
            <th>บทบาท</th>
            <th>การจัดการ</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in paginatedUsers" :key="item._id">
            <td>{{ item.displayIndex }}</td>
            <td>{{ item.firstName }} {{ item.lastName }}</td>
            <td>{{ item.email }}</td>
            <td>{{ item.phone }}</td>
            <td>{{ item.role }}</td>
            <td class="actions">
              <button class="edit-btn" @click="openModal(item)">แก้ไข</button>
              <button class="delete-btn" @click="handleDeleteUser(item._id)">
                ลบ
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
        <button :disabled="currentPage === 1" @click="currentPage--">
          ก่อนหน้า
        </button>

        <button
          v-for="page in totalPages"
          :key="page"
          :class="{ active: currentPage === page }"
          @click="currentPage = page"
        >
          {{ page }}
        </button>

        <button :disabled="currentPage === totalPages" @click="currentPage++">
          ถัดไป
        </button>
      </div>
      <!-- Empty State -->
      <div v-if="listUsers.length === 0" class="empty">ไม่มีข้อมูลผู้ใช้</div>
    </div>
  </div>

  <!-- Add / Edit Modal -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-card">
          <form
            @submit.prevent="showEditModal ? handleEditUser() : handleAddUser()"
          >
            <h2 class="title">
              {{ showEditModal ? "แก้ไขผู้ใช้" : "เพิ่มผู้ใช้" }}
            </h2>

            <div class="form-grid">
              <div class="input-group">
                <select
                  id="role"
                  v-model="userForm.role"
                  class="custom-select"
                  required
                  placeholder=" "
                >
                  <option value="">เลือกบทบาท</option>
                  <option
                    v-for="role in roles"
                    :key="role.value"
                    :value="role.value"
                  >
                    {{ role.label }}
                  </option>
                </select>
                <label for="role" style="top: -6px">บทบาท</label>
                <span class="error-message" v-if="errors.role">{{
                  errors.role
                }}</span>
              </div>

              <div class="input-group">
                <input
                  type="email"
                  id="email"
                  v-model="userForm.email"
                  required
                  placeholder=" "
                />
                <label for="email">อีเมล</label>
                <span class="error-message" v-if="errors.email">{{
                  errors.email
                }}</span>
              </div>

              <div class="input-group">
                <input
                  type="password"
                  id="password"
                  v-model="userForm.password"
                  placeholder=" "
                />
                <label for="password">รหัสผ่าน</label>
                <span class="error-message" v-if="errors.password">{{
                  errors.password
                }}</span>
              </div>

              <div class="input-group">
                <input
                  type="password"
                  id="ConfirmPassword"
                  v-model="userForm.ConfirmPassword"
                  placeholder=" "
                />
                <label for="ConfirmPassword">ยืนยันรหัสผ่าน</label>
                <span class="error-message" v-if="errors.ConfirmPassword">{{
                  errors.ConfirmPassword
                }}</span>
              </div>

              <div class="input-group">
                <input
                  type="text"
                  id="firstName"
                  v-model="userForm.firstName"
                  required
                  placeholder=" "
                />
                <label for="firstName">ชื่อ</label>
                <span class="error-message" v-if="errors.firstName">{{
                  errors.firstName
                }}</span>
              </div>

              <div class="input-group">
                <input
                  type="text"
                  id="lastName"
                  v-model="userForm.lastName"
                  required
                  placeholder=" "
                />
                <label for="lastName">นามสกุล</label>
                <span class="error-message" v-if="errors.lastName">{{
                  errors.lastName
                }}</span>
              </div>

              <div class="input-group">
                <input
                  type="tel"
                  id="phone"
                  v-model="userForm.phone"
                  placeholder=" "
                />
                <label for="phone">เบอร์โทรศัพท์</label>
                <span class="error-message" v-if="errors.phone">{{
                  errors.phone
                }}</span>
              </div>
            </div>

            <button type="submit" class="user-btn">
              {{ showEditModal ? "แก้ไข" : "เพิ่ม" }}
            </button>

            <button type="button" class="close-btn" @click="closeModal">
              ยกเลิก
            </button>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
/* ------------------------------
   Imports
-------------------------------*/
import { computed, ref, onMounted, watch } from "vue";
import Swal from "sweetalert2";
import axios from "axios";

/* ------------------------------
   State
-------------------------------*/
const listUsers = ref([]);
const userForm = ref({
  email: "",
  password: "",
  ConfirmPassword: "",
  firstName: "",
  lastName: "",
  phone: "",
  role: "",
});
const roles = ref([
  { value: "admin", label: "ผู้ดูแลระบบ" },
  { value: "employee", label: "พนักงาน" },
  { value: "user", label: "ผู้ใช้งาน" },
]);
const errors = ref({
  email: "",
  password: "",
  ConfirmPassword: "",
  firstName: "",
  lastName: "",
  phone: "",
  role: "",
});
const showModal = ref(false);
const showEditModal = ref(false);

const editUserId = ref("");

const searchQuery = ref("");

const currentPage = ref(1);
const itemsPerPage = ref(5);

/* ------------------------------
   Watch
-------------------------------*/

watch(searchQuery, () => {
  currentPage.value = 1;
});

/* ------------------------------
   Computed
-------------------------------*/
const totalPages = computed(() => {
  return Math.ceil(listUsers.value.length / itemsPerPage.value);
});

const filteredUsers = computed(() => {
  if (!searchQuery.value.trim()) {
    return listUsers.value.map((item, idx) => ({
      ...item,
      displayIndex: idx + 1,
    }));
  }

  const query = searchQuery.value.toLowerCase();

  return listUsers.value
    .map((item, idx) => ({
      ...item,
      displayIndex: idx + 1,
    }))
    .filter((item) => {
      const realIndex = item.displayIndex.toString();
      const name = `${item.firstName} ${item.lastName}`.toLowerCase();
      return realIndex === query || name.includes(query);
    });
});

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredUsers.value.slice(start, end);
});

/* ------------------------------
   Helpers
-------------------------------*/
const adjustPageAfterChange = () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value || 1;
  }
};

/* ------------------------------
   Fetch Data
-------------------------------*/
const fetchUsers = async () => {
  try {
    const response = await axios.get("http://localhost:3000/api/get/users");
    listUsers.value = response.data;
    adjustPageAfterChange();
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

/* ------------------------------
   Methods
-------------------------------*/
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

const validateForm = () => {
  let isValid = true;

  // Reset errors
  Object.keys(errors.value).forEach((key) => (errors.value[key] = ""));

  if (!userForm.value.role) {
    errors.value.role = "กรุณาเลือกบทบาท";
    isValid = false;
  }

  if (!validateEmail(userForm.value.email)) {
    errors.value.email = "กรุณากรอกอีเมลให้ถูกต้อง";
    isValid = false;
  }

  if (!validatePassword(userForm.value.password)) {
    errors.value.password =
      "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร และมีตัวเลข 1 ตัว";
    isValid = false;
  }

  if (userForm.value.password !== userForm.value.ConfirmPassword) {
    errors.value.ConfirmPassword = "รหัสผ่านไม่ตรงกัน";
    isValid = false;
  }

  if (!userForm.value.firstName) {
    errors.value.firstName = "กรุณากรอกชื่อ";
    isValid = false;
  }

  if (!userForm.value.lastName) {
    errors.value.lastName = "กรุณากรอกนามสกุล";
    isValid = false;
  }

  if (!validatePhone(userForm.value.phone)) {
    errors.value.phone = "กรุณากรอกเบอร์โทรศัพท์ 9-10 ตัวเลข";
    isValid = false;
  }

  return isValid;
};

const handleAddUser = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    const response = await axios.post(
      "http://localhost:3000/api/add/user",
      userForm.value
    );

    closeModal();
    await fetchUsers();

    Swal.fire({
      icon: "success",
      title: "เพิ่มผู้ใช้สำเร็จ",
      text: "เพิ่มผู้ใช้สำเร็จ",
      timer: 2000,
      timerProgressBar: true,
    });
    return;
  } catch (error) {
    console.error("Error adding user:", error);
    if (error.response?.data?.message === "อีเมลนี้ถูกใช้งานแล้ว") {
      errors.value.email = "อีเมลนี้ถูกใช้งานแล้ว";
    }
  }
};

const handleEditUser = async () => {
  if (!userForm.value.password) {
    delete userForm.value.password;
    delete userForm.value.ConfirmPassword;
  } else if (userForm.value.password !== userForm.value.ConfirmPassword) {
    errors.value.ConfirmPassword = "รหัสผ่านไม่ตรงกัน";
    return;
  }

  try {
    await axios.put(
      `http://localhost:3000/api/update/user/${editUserId.value}`,
      userForm.value
    );
    closeModal();
    await fetchUsers();
    Swal.fire({
      icon: "success",
      title: "แก้ไขผู้ใช้สำเร็จ",
      text: "แก้ไขผู้ใช้สำเร็จ",
      timer: 2000,
      timerProgressBar: true,
    });
  } catch (error) {
    console.error("Error editing user:", error);
    Swal.fire({
      icon: "error",
      title: "แก้ไขผู้ใช้ไม่สำเร็จ",
      text: "แก้ไขผู้ใช้ไม่สำเร็จ",
    });
  }
};

const handleDeleteUser = async (userId) => {
  try {
    await axios.delete(`http://localhost:3000/api/delete/user/${userId}`);
    await fetchUsers();
    Swal.fire({
      icon: "success",
      title: "ลบผู้ใช้สำเร็จ",
      text: "ลบผู้ใช้สำเร็จ",
      timer: 2000,
      timerProgressBar: true,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    Swal.fire({
      icon: "error",
      title: "ลบผู้ใช้ไม่สำเร็จ",
      text: "ลบผู้ใช้ไม่สำเร็จ",
    });
  }
};

/* ------------------------------
   Edit Modal
-------------------------------*/
const openModal = (user) => {
  showModal.value = true;
  showEditModal.value = true;
  editUserId.value = user._id;

  userForm.value = {
    email: user.email,
    password: "",
    ConfirmPassword: "",
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: user.role,
  };
};

/* ------------------------------
   Close Modal
-------------------------------*/
const closeModal = () => {
  showModal.value = false;
  showEditModal.value = false;

  userForm.value = {
    email: "",
    password: "",
    ConfirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "",
  };
};

/* ------------------------------
   Lifecycle
-------------------------------*/
onMounted(() => {
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
  fetchUsers();
});
</script>

<style scoped>
/* ------------------------------
   Table
-------------------------------*/
.table-wrapper {
  min-height: 59vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.table-card {
  width: 90%;
  max-width: 800px;
  background: white;
  padding: 30px;
  border-radius: 18px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.title {
  text-align: center;
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 25px;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table th,
.user-table td {
  padding: 14px 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.user-table th {
  background-color: #f1f5f9;
  font-weight: 700;
  color: #0f172a;
}

.actions {
  display: flex;
  gap: 10px;
}

.empty {
  text-align: center;
  padding: 20px;
  color: #64748b;
}

/* ------------------------------
   Pagination
-------------------------------*/
.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

.pagination button {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  cursor: pointer;
  font-size: 14px;
  background-color: white;
}

.pagination button:hover {
  background-color: #f1f5f9;
}

.pagination button.active {
  background: #4facfe;
  color: white;
  border-color: #4facfe;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ------------------------------
   Search Box
-------------------------------*/
.search-box {
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
}

.search-box input {
  height: 14px;
  padding: 10px 14px;
  width: 250px;
  border-radius: 10px;
  border: 1px solid #ddd;
  font-size: 15px;
  outline: none;
  transition: 0.2s;
}

.search-box input:focus {
  border-color: #4facfe;
  box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.25);
}

/* ------------------------------
   Form Grid
-------------------------------*/
.form-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.form-grid .input-group {
  flex: 1 1 calc(50% - 20px); /* 2 คอลัมน์ */
}

@media (max-width: 768px) {
  .form-grid .input-group {
    flex: 1 1 100%; /* มือถือ = 1 คอลัมน์ */
  }
}

/* ------------------------------
   Form Inputs
-------------------------------*/
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

.user-btn {
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
}

/* ------------------------------
   Select
-------------------------------*/
.custom-select {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #ddd;
  background: #fff;
  font-size: 15px;
  appearance: none;
  outline: none;
  cursor: pointer;
  transition: 0.2s;
  background-image: url("data:image/svg+xml;utf8,<svg fill='%23999' height='20' width='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'><polygon points='5,7 15,7 10,12'/></svg>");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 18px;
}

.custom-select:focus {
  border-color: #4facfe;
  box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.25);
}

.custom-select option {
  padding: 8px;
}
/* ------------------------------
   Buttons
-------------------------------*/
.open-btn {
  margin-bottom: 15px;
  padding: 10px 16px;
  background: #4facfe;
  color: white;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.open-btn:hover {
  background: #36d7f0;
}

.edit-btn,
.delete-btn {
  padding: 6px 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.edit-btn {
  background: #38bdf8;
  color: white;
}

.delete-btn {
  background: #dc2626;
  color: white;
}

/* ------------------------------
   Modal
-------------------------------*/
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-card {
  width: 100%;
  max-width: 580px;
  background: white;
  padding: 40px 30px;
  border-radius: 18px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.close-btn {
  width: 100%;
  padding: 12px;
  margin-top: 10px;
  border-radius: 10px;
  background: #ddd;
  border: none;
  cursor: pointer;
}

.error-message {
  color: #dc2626;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

/* ------------------------------
   Fade Animation
-------------------------------*/
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>