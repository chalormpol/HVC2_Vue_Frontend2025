<template>
  <div class="table-wrapper">
    <div class="table-card">
      <h2 class="title">รายการบำรุงรักษา</h2>

      <!-- ปุ่มเปิด Modal -->
      <div class="search-box">
        <button class="open-btn" @click="showModal = true">
          + เพิ่มบำรุงรักษา
        </button>

        <!-- Search Box -->
        <input
          v-model="searchQuery"
          type="text"
          placeholder="🔍 ค้นหาตามรหัส/เลขทะเบียน"
        />
      </div>

      <!-- Modal -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
            <div class="modal-card">
              <form
                @submit.prevent="
                  showEditModal
                    ? handleEditMaintenance()
                    : handleAddMaintenance()
                "
              >
                <h2 class="title">
                  {{
                    showEditModal ? "แก้ไขข้อมูลบำรุงรักษา" : "เพิ่มบำรุงรักษา"
                  }}
                </h2>

                <div class="form-grid">
                  <!-- ประเภทยานพาหนะ -->
                  <div class="input-group">
                    <select
                      v-model="maintenanceForm.vehicleId"
                      class="custom-select"
                      required
                    >
                      <option value="">เลือกยานพาหนะ</option>
                      <option v-for="v in vehicles" :key="v._id" :value="v._id">
                        {{ v.vehicle }}
                      </option>
                    </select>
                    <label style="top: -6px">ยานพาหนะ</label>
                  </div>

                  <!-- เลขทะเบียน -->
                  <div class="input-group">
                    <input
                      v-model="maintenanceForm.vehicleLicensePlate"
                      type="text"
                      readonly
                      placeholder=" "
                    />
                    <label>เลขทะเบียน</label>
                  </div>

                  <!-- เจ้าของ -->
                  <div class="input-group">
                    <input
                      type="text"
                      readonly
                      :value="vehicleOwnerDisplay"
                      placeholder=" "
                    />
                    <label>เจ้าของ</label>
                  </div>

                  <!-- ระยะทางปัจจุบัน -->
                  <div class="input-group">
                    <input
                      v-model="maintenanceForm.mileageRecord"
                      type="number"
                      required
                      placeholder=" "
                    />
                    <label>ระยะทางปัจจุบัน</label>
                  </div>

                  <!-- วันที่ -->
                  <div class="input-group">
                    <input
                      v-model="maintenanceForm.date"
                      type="date"
                      required
                      placeholder=" "
                    />
                    <label>วันที่</label>
                  </div>

                  <!-- ประเภทบริการ -->
                  <div class="input-group">
                    <input
                      v-model="maintenanceForm.serviceType"
                      type="text"
                      required
                      placeholder=" "
                    />
                    <label>ประเภทบริการ</label>
                  </div>

                  <!-- รายละเอียด -->
                  <div class="input-group">
                    <input
                      v-model="maintenanceForm.description"
                      type="text"
                      required
                      placeholder=" "
                    />
                    <label>รายละเอียด</label>
                  </div>

                  <!-- การแก้ไข -->
                  <div class="input-group">
                    <input
                      v-model="maintenanceForm.solving"
                      type="text"
                      required
                      placeholder=" "
                    />
                    <label>การแก้ไข</label>
                  </div>

                  <!-- ค่าบริการ -->
                  <div class="input-group">
                    <input
                      v-model="maintenanceForm.cost"
                      type="number"
                      required
                      placeholder=" "
                    />
                    <label>ค่าบริการ</label>
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
            <th>เลขทะเบียน</th>
            <th>ประเภทบริการ</th>
            <th>รายละเอียด</th>
            <th>การแก้ไข</th>
            <th>ค่าบริการ</th>
            <th>วันที่</th>
            <th style="width: 100px">เจ้าของ</th>
            <th style="width: 100px">ผู้ซ่อม</th>
            <th>การจัดการ</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in paginatedMaintenances" :key="item._id">
            <td>{{ item.displayIndex }}</td>
            <td>{{ item.vehicleLicensePlate }}</td>
            <td>{{ item.serviceType }}</td>
            <td>{{ item.description }}</td>
            <td>{{ item.solving }}</td>
            <td>{{ item.cost }}</td>
            <td>{{ formatDate(item.date) }}</td>
            <td>
              {{
                item.vehicleId?.userId
                  ? `${item.vehicleId.userId.firstName} ${item.vehicleId.userId.lastName}`
                  : "-"
              }}
            </td>
            <td>
              {{
                item.responsibleUserId?.firstName
                  ? `${item.responsibleUserId.firstName} ${item.responsibleUserId.lastName}`
                  : "-"
              }}
            </td>
            <td class="actions">
              <button class="edit-btn" @click="openEditModal(item)">
                แก้ไข
              </button>
              <button class="delete-btn" @click="deleteMaintenance(item._id)">
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
const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

import axios from "axios";
import Swal from "sweetalert2";
import { ref, onMounted, computed, watch } from "vue";

const localUser = JSON.parse(localStorage.getItem("user"));

const userId = ref(localUser.id);

const searchQuery = ref("");

const currentPage = ref(1);
const itemsPerPage = ref(5);

// จำนวนหน้าทั้งหมด
const totalPages = computed(() => {
  return Math.ceil(maintenances.value.length / itemsPerPage.value);
});

const filteredMaintenances = computed(() => {
  if (!searchQuery.value.trim()) {
    return maintenances.value.map((item, idx) => ({
      ...item,
      displayIndex: idx + 1,
    }));
  }

  const query = searchQuery.value.toLowerCase();

  return maintenances.value
    .map((item, idx) => ({
      ...item,
      displayIndex: idx + 1,
    }))
    .filter((maintenance) => {
      const realIndex = maintenance.displayIndex.toString();
      const vehicleLicensePlate =
        maintenance?.vehicleLicensePlate?.toLowerCase();
      return (
        realIndex === query ||
        (vehicleLicensePlate && vehicleLicensePlate.includes(query))
      );
    });
});

// คำนวณข้อมูลที่แสดงต่อหน้า
const paginatedMaintenances = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredMaintenances.value.slice(start, end);
});

const vehicles = ref([]);
const maintenances = ref([]);
const showModal = ref(false);
const showEditModal = ref(false);

const maintenanceForm = ref({
  vehicleLicensePlate: "",
  date: "",
  mileageRecord: "",
  serviceType: "",
  description: "",
  solving: "",
  cost: "",
  vehicleId: "",
  responsibleUserId: "",
});

const editId = ref("");

/* 🔹 ดึงประเภทยานพาหนะ */
const fetchVehicles = async () => {
  const res = await axios.get("http://localhost:3000/api/get/vehicle");
  vehicles.value = res.data;
};

/* 🔹 ดึงข้อมูลบำรุงรักษา */
const fetchMaintenances = async () => {
  const res = await axios.get("http://localhost:3000/api/get/maintenance");
  maintenances.value = res.data;

  if (currentPage.value > totalPages.value) {
    currentPage.value = 1;
  }
};

/* 🔹 ปิด modal + reset form */
const closeModal = () => {
  showModal.value = false;
  showEditModal.value = false;

  maintenanceForm.value = {
    vehicleLicensePlate: "",
    date: "",
    mileageRecord: "",
    serviceType: "",
    description: "",
    solving: "",
    cost: "",
    vehicleId: "",
    responsibleUserId: "",
  };
};

/* 🔹 เพิ่มบำรุงรักษา */
const handleAddMaintenance = async () => {
  if (
    !maintenanceForm.value.vehicleLicensePlate ||
    !maintenanceForm.value.date
  ) {
    Swal.fire("กรุณากรอกข้อมูลให้ครบ");
    return;
  }

  try {
    await axios.post("http://localhost:3000/api/add/maintenance", {
      ...maintenanceForm.value,
      responsibleUserId: userId.value,
    });

    closeModal();
    fetchMaintenances();

    Swal.fire({
      title: "เพิ่มบำรุงรักษาสำเร็จ!",
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

  maintenanceForm.value = {
    vehicleLicensePlate: item.vehicleLicensePlate,
    date: item.date,
    mileageRecord: item.mileageRecord,
    serviceType: item.serviceType,
    description: item.description,
    solving: item.solving,
    cost: item.cost,
    vehicleId: item.vehicleId?._id || "",
    responsibleUserId: userId.value,
  };

  showModal.value = true;
  showEditModal.value = true;
};

/* 🔹 แก้ไขบำรุงรักษา */
const handleEditMaintenance = async () => {
  try {
    await axios.put(
      `http://localhost:3000/api/update/maintenance/${editId.value}`,
      { ...maintenanceForm.value }
    );

    closeModal();
    fetchMaintenances();

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

// Delete Maintenance
const deleteMaintenance = async (id) => {
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
    await axios.put(`http://localhost:3000/api/delete/maintenance/${id}`);
    await fetchMaintenances();
    Swal.fire("ลบสำเร็จ!", "", "success");
  } catch (error) {
    Swal.fire("ลบไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง", "error");
  }
};

watch(
  () => maintenanceForm.value.vehicleId,
  (newVehicleId) => {
    if (showEditModal.value) return;

    if (!newVehicleId || !vehicles.value.length) {
      maintenanceForm.value.vehicleLicensePlate = "";
      maintenanceForm.value.mileageRecord = "";
      return;
    }

    const selectedVehicle = vehicles.value.find((v) => v._id === newVehicleId);

    if (selectedVehicle) {
      maintenanceForm.value.vehicleLicensePlate =
        selectedVehicle.licensePlate || "";

      maintenanceForm.value.mileageRecord =
        selectedVehicle.currentMileage || "";
    }
  }
);

const vehicleOwnerDisplay = computed(() => {
  if (!maintenanceForm.value.vehicleId || !vehicles.value.length) return "-";

  const vehicle = vehicles.value.find(
    (v) => v._id === maintenanceForm.value.vehicleId
  );

  return vehicle?.userId
    ? `${vehicle.userId.firstName} ${vehicle.userId.lastName}`
    : "-";
});

/* เริ่มโหลดข้อมูล */
onMounted(() => {
  fetchVehicles();
  fetchMaintenances();
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
  max-width: 1500px;
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
</style>
