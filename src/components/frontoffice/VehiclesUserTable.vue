<template>
  <div class="table-wrapper">
    <div class="table-card">
      <h2 class="title">รายการยานพาหนะ</h2>

      <!-- ปุ่มเปิด Modal -->
      <div class="search-box">
        <button class="open-btn" @click="showModal = true">
          + เพิ่มยานพาหนะ
        </button>

        <!-- Search Box -->
        <input
          v-model="searchQuery"
          type="text"
          placeholder="🔍 ค้นหาตามรหัส/ประเภท/ชื่อ/ยี่ห้อ/รุ่น"
        />
      </div>

      <!-- Modal -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
            <div class="modal-card">
              <form
                @submit.prevent="
                  showEditModal ? handleEditVehicle() : handleAddVehicle()
                "
              >
                <h2 class="title">
                  {{ showEditModal ? "แก้ไขข้อมูลยานพาหนะ" : "เพิ่มยานพาหนะ" }}
                </h2>

                <div class="form-grid">
                  <!-- ประเภทยานพาหนะ -->
                  <div class="input-group">
                    <select
                      v-model="vehicleForm.typeCarId"
                      class="custom-select"
                      required
                    >
                      <option value="">เลือกประเภทยานพาหนะ</option>
                      <option v-for="t in types" :key="t._id" :value="t._id">
                        {{ t.name }}
                      </option>
                    </select>
                    <label style="top: -6px">ประเภทยานพาหนะ</label>
                  </div>

                  <!-- ชื่อยานพาหนะ -->
                  <div class="input-group">
                    <input
                      v-model="vehicleForm.vehicle"
                      type="text"
                      required
                      placeholder=" "
                    />
                    <label>ชื่อยานพาหนะ</label>
                  </div>

                  <!-- เลขทะเบียน -->
                  <div class="input-group">
                    <input
                      v-model="vehicleForm.licensePlate"
                      type="text"
                      required
                      placeholder=" "
                    />
                    <label>เลขทะเบียน</label>
                  </div>

                  <!-- ยี่ห้อ -->
                  <div class="input-group">
                    <input
                      v-model="vehicleForm.brand"
                      type="text"
                      required
                      placeholder=" "
                    />
                    <label>ยี่ห้อยานพาหนะ</label>
                  </div>

                  <!-- รุ่น -->
                  <div class="input-group">
                    <input
                      v-model="vehicleForm.model"
                      type="text"
                      required
                      placeholder=" "
                    />
                    <label>รุ่นยานพาหนะ</label>
                  </div>

                  <!-- หมายเลขตัวถัง -->
                  <div class="input-group">
                    <input
                      v-model="vehicleForm.vehicleIdentificationNumber"
                      type="text"
                      required
                      placeholder=" "
                    />
                    <label>หมายเลขตัวถัง</label>
                  </div>

                  <!-- ระยะทางปัจจุบัน -->
                  <div class="input-group">
                    <input
                      v-model="vehicleForm.currentMileage"
                      type="number"
                      required
                      placeholder=" "
                    />
                    <label>ระยะทางปัจจุบัน</label>
                  </div>

                  <!-- ปีผลิต -->
                  <div class="input-group">
                    <input
                      v-model="vehicleForm.productionYear"
                      type="number"
                      required
                      placeholder=" "
                    />
                    <label>ปีผลิต</label>
                  </div>

                  <!-- สี -->
                  <div class="input-group">
                    <input
                      v-model="vehicleForm.color"
                      type="text"
                      required
                      placeholder=" "
                    />
                    <label>สียานพาหนะ</label>
                  </div>

                  <!-- รูปยานพาหนะ -->
                  <div class="input-group full">
                    <input
                      type="file"
                      accept="image/*"
                      @change="handleImageChange"
                    />
                    <label style="top: -6px">รูปยานพาหนะ</label>
                  </div>
                  <!-- preview -->
                  <div v-if="imagePreview" class="preview-wrapper">
                    <img :src="imagePreview" class="preview-image" />
                  </div>
                </div>

                <button type="submit" class="type-btn">
                  {{ showEditModal ? "บันทึกการแก้ไข" : "เพิ่มยานพาหนะ" }}
                </button>

                <button type="button" class="close-btn" @click="closeModal">
                  ปิด
                </button>
              </form>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- ตาราง -->
      <table class="type-table">
        <thead>
          <tr>
            <th>#</th>
            <th>ประเภทรถ</th>
            <th>ชื่อรถ</th>
            <th>ยี่ห้อ</th>
            <th>รุ่น</th>
            <th>สี</th>
            <th>การจัดการ</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in paginatedVehicles" :key="item._id">
            <td>{{ item.displayIndex }}</td>
            <td>{{ item.typeCarId.name }}</td>
            <td>{{ item.vehicle }}</td>
            <td>{{ item.brand }}</td>
            <td>{{ item.model }}</td>
            <td>{{ item.color }}</td>

            <td class="actions">
              <button class="edit-btn" @click="openEditModal(item)">
                แก้ไข
              </button>
              <button class="delete-btn" @click="deleteVehicle(item._id)">
                ลบ
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
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

      <div v-if="vehicles.length === 0" class="empty">ไม่มีข้อมูลยานพาหนะ</div>
    </div>
  </div>
</template>


<script setup>
import axios from "axios";
import Swal from "sweetalert2";
import { ref, onMounted, computed } from "vue";

const vehicleImage = ref(null);
const imagePreview = ref(null);
const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  vehicleImage.value = file;
  imagePreview.value = URL.createObjectURL(file);
};

const localUser = JSON.parse(localStorage.getItem("user"));

const userId = ref(localUser.id);

const searchQuery = ref("");

const currentPage = ref(1);
const itemsPerPage = ref(5);

// จำนวนหน้าทั้งหมด
const totalPages = computed(() => {
  return Math.ceil(filteredVehicles.value.length / itemsPerPage.value);
});

const filteredVehicles = computed(() => {
  if (!searchQuery.value.trim()) {
    return vehicles.value.map((item, idx) => ({
      ...item,
      displayIndex: idx + 1,
    }));
  }

  const query = searchQuery.value.toLowerCase();

  return vehicles.value
    .map((item, idx) => ({
      ...item,
      displayIndex: idx + 1,
    }))
    .filter((vehicle) => {
      const realIndex = vehicle.displayIndex.toString();
      const type = vehicle?.typeCarId?.name?.toLowerCase();
      const vehicleName = vehicle?.vehicle?.toLowerCase();
      const brand = vehicle?.brand?.toLowerCase();
      const model = vehicle?.model?.toLowerCase();
      return (
        realIndex.includes(query) ||
        type.includes(query) ||
        vehicleName.includes(query) ||
        brand.includes(query) ||
        model.includes(query)
      );
    });
});

// คำนวณข้อมูลที่แสดงต่อหน้า
const paginatedVehicles = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredVehicles.value.slice(start, end);
});

const vehicles = ref([]);
const types = ref([]);
const showModal = ref(false);
const showEditModal = ref(false);

const vehicleForm = ref({
  vehicle: "",
  licensePlate: "",
  brand: "",
  model: "",
  vehicleIdentificationNumber: "",
  currentMileage: "",
  productionYear: "",
  color: "",
  typeCarId: "",
  userId: "",
});

const editId = ref("");

/* 🔹 ดึงประเภทยานพาหนะ */
const fetchTypes = async () => {
  const res = await axios.get("http://localhost:3000/api/get/typecar");
  types.value = res.data;
};

/* 🔹 ดึงข้อมูลยานพาหนะ */
const fetchVehicles = async () => {
  const res = await axios.get(
    `http://localhost:3000/api/get/vehicle/${userId.value}`
  );
  vehicles.value = res.data;

  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value || 1;
  }
};

/* 🔹 ปิด modal + reset form */
const closeModal = () => {
  showModal.value = false;
  showEditModal.value = false;

  vehicleForm.value = {
    vehicle: "",
    licensePlate: "",
    brand: "",
    model: "",
    vehicleIdentificationNumber: "",
    currentMileage: "",
    productionYear: "",
    color: "",
    typeCarId: "",
    userId: "",
  };
  imagePreview.value = null;
  vehicleImage.value = null;
};

/* 🔹 เพิ่มยานพาหนะ */
const handleAddVehicle = async () => {
  if (!vehicleForm.value.typeCarId || !vehicleForm.value.vehicle) {
    Swal.fire("กรุณากรอกข้อมูลให้ครบ");
    return;
  }

  try {
    const formData = new FormData();

    Object.keys(vehicleForm.value).forEach((key) => {
      if (key !== "userId") formData.append(key, vehicleForm.value[key]);
    });

    formData.append("userId", userId.value);
    if (vehicleImage.value) formData.append("image", vehicleImage.value);

    await axios.post("http://localhost:3000/api/add/vehicle", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    closeModal();
    fetchVehicles();

    Swal.fire({
      title: "เพิ่มยานพาหนะสำเร็จ!",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (e) {
    Swal.fire("เพิ่มไม่สำเร็จ", "ลองใหม่อีกครั้ง", "error");
  }
};

/* 🔹 เปิด Modal แก้ไข */
const openEditModal = (item) => {
  editId.value = item._id;

  vehicleForm.value = {
    vehicle: item.vehicle,
    licensePlate: item.licensePlate,
    brand: item.brand,
    model: item.model,
    vehicleIdentificationNumber: item.vehicleIdentificationNumber,
    currentMileage: item.currentMileage,
    productionYear: item.productionYear,
    color: item.color,
    typeCarId: item.typeCarId._id,
    userId: localUser._id,
  };

  // แสดง preview รูปเดิม
  imagePreview.value = item.image
    ? `http://localhost:3000/uploads/${item.image}`
    : null;
  vehicleImage.value = null;

  showModal.value = true;
  showEditModal.value = true;
};

/* 🔹 แก้ไขยานพาหนะ */
const handleEditVehicle = async () => {
  try {
    await axios.put(
      `http://localhost:3000/api/update/vehicle/${editId.value}`,
      { ...vehicleForm.value }
    );

    closeModal();
    fetchVehicles();

    Swal.fire({
      title: "แก้ไขสำเร็จ!",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (e) {
    Swal.fire("แก้ไขไม่สำเร็จ", "ลองใหม่อีกครั้ง", "error");
  }
};

// Delete Vehicle
const deleteVehicle = async (id) => {
  const confirm = await Swal.fire({
    title: "ต้องการลบใช่หรือไม่?",
    text: "ลบแล้วไม่สามารถกู้คืนได้!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "ลบ",
    cancelButtonText: "ยกเลิก",
  });

  if (!confirm.isConfirmed) return;

  try {
    await axios.put(`http://localhost:3000/api/delete/vehicle/${id}`);
    await fetchVehicles(); // ปรับหน้าอัตโนมัติ
    Swal.fire("ลบสำเร็จ!", "", "success");
  } catch (error) {
    Swal.fire("ลบไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง", "error");
  }
};

/* เริ่มโหลดข้อมูล */
onMounted(() => {
  fetchTypes();
  fetchVehicles();
});
</script>


<style scoped>
/* --- Buttons --- */
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
  background: #ef4444;
  color: white;
}

/* --- Table --- */
.table-wrapper {
  min-height: 59vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.table-card {
  width: 90%;
  max-width: 1000px;
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

.type-table {
  width: 100%;
  border-collapse: collapse;
}

.type-table th,
.type-table td {
  padding: 14px 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.type-table th {
  background: #f1f5f9;
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

/* --- Modals --- */
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
  max-width: 760px;
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

/* --- Form Inputs --- */
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

.type-btn {
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

.type-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* --- Fade Animation --- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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
  background: white;
  cursor: pointer;
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

/* --- Custom Select --- */
.custom-select {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #ddd;
  background: #fff;
  font-size: 15px;
  appearance: none; /* ซ่อน default arrow */
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

.preview-wrapper {
  display: flex; /* เพิ่มอันนี้ */
  justify-content: center; /* จัดกลางแนวนอน */
  align-items: center; /* จัดกลางแนวตั้ง */
  margin-bottom: 5px;
  width: 100%;
  flex-basis: 100%;
}

.preview-image {
  width: 200px;
  height: 200px;
  object-fit: cover; /* ภาพเต็มกรอบ ไม่ยืดเบี้ยว */
  border-radius: 10px; /* ขอบโค้ง */
  border: 2px solid #4facfe; /* ขอบฟ้าเล็ก ๆ */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* เงาเล็ก */
}
</style>
