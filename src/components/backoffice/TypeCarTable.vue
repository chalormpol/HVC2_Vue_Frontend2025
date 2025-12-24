<template>
  <div class="table-wrapper">
    <div class="table-card">
      <h2 class="title">รายการประเภทยานพาหนะ</h2>

      <!-- ปุ่มเปิด Add Modal -->
      <div class="search-box">
        <button @click="showModal = true" class="open-btn">
          + เพิ่มประเภทยานพาหนะ
        </button>

        <!-- Search Box -->
        <input
          v-model="searchQuery"
          type="text"
          placeholder="🔍 ค้นหาตามรหัส/ประเภท"
        />
      </div>

      <!-- Add / Edit Modal -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
            <div class="modal-card">
              <form
                @submit.prevent="
                  showEditModal ? handleEditType() : handleAddType()
                "
              >
                <h2 class="title">
                  {{
                    showEditModal
                      ? "แก้ไขประเภทยานพาหนะ"
                      : "เพิ่มประเภทยานพาหนะ"
                  }}
                </h2>

                <div class="input-group">
                  <input
                    v-model="typeForm.name"
                    type="text"
                    required
                    placeholder=" "
                  />
                  <label>ชื่อประเภทยานพาหนะ</label>
                </div>

                <button type="submit" class="type-btn">
                  {{ showEditModal ? "บันทึกการแก้ไข" : "เพิ่มประเภทยานพาหนะ" }}
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
            <th>ชื่อประเภทยานพาหนะ</th>
            <th>การจัดการ</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in paginatedTypes" :key="item._id">
            <td>{{ item.displayIndex }}</td>
            <td>{{ item.name }}</td>

            <td class="actions">
              <button class="edit-btn" @click="openEditModal(item)">
                แก้ไข
              </button>
              <button class="delete-btn" @click="deleteType(item._id)">
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
      <div v-if="types.length === 0" class="empty">
        ไม่มีข้อมูลประเภทยานพาหนะ
      </div>
    </div>
  </div>
</template>

<script setup>
/* ------------------------------
   Imports
-------------------------------*/
import { ref, onMounted, computed } from "vue";
import axios from "@/plugins/axios";
import Swal from "sweetalert2";

/* ------------------------------
   State
-------------------------------*/
const types = ref([]);

const showModal = ref(false);
const showEditModal = ref(false);

const typeForm = ref({
  name: "",
});

const editTypeId = ref("");

const searchQuery = ref("");

const currentPage = ref(1);
const itemsPerPage = ref(5);

/* ------------------------------
   Computed
-------------------------------*/
const totalPages = computed(() =>
  Math.ceil(filteredTypes.value.length / itemsPerPage.value)
);

const filteredTypes = computed(() => {
  if (!searchQuery.value.trim()) {
    return types.value.map((item, idx) => ({
      ...item,
      displayIndex: idx + 1,
    }));
  }

  const query = searchQuery.value.toLowerCase();

  return types.value
    .map((item, idx) => ({
      ...item,
      displayIndex: idx + 1,
    }))
    .filter((item) => {
      const realIndex = item.displayIndex.toString();
      const name = item.name.toLowerCase();
      return realIndex === query || name.includes(query);
    });
});

const paginatedTypes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredTypes.value.slice(start, end);
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
const fetchTypes = async () => {
  try {
    const res = await axios.get("http://localhost:3000/api/get/typecar");
    types.value = res.data;
    adjustPageAfterChange();
  } catch (error) {
    Swal.fire("ไม่สามารถโหลดข้อมูลได้", "ลองรีเฟรชหน้า", "error");
  }
};

/* ------------------------------
   Add Type
-------------------------------*/
const handleAddType = async () => {
  if (!typeForm.value.name) {
    Swal.fire("กรุณากรอกประเภทยานพาหนะ");
    return;
  }

  try {
    await axios.post("http://localhost:3000/api/add/typecar", {
      ...typeForm.value,
    });

    closeModal();
    await fetchTypes();

    Swal.fire({
      title: "เพิ่มประเภทยานพาหนะสำเร็จ!",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    Swal.fire("เพิ่มไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง", "error");
  }
};

/* ------------------------------
   Edit Modal
-------------------------------*/
const openEditModal = (item) => {
  editTypeId.value = item._id;

  typeForm.value = {
    name: item.name,
  };

  showModal.value = true;
  showEditModal.value = true;
};

/* ------------------------------
   Edit Type
-------------------------------*/
const handleEditType = async () => {
  if (!typeForm.value.name) {
    Swal.fire("กรุณากรอกประเภทยานพาหนะ");
    return;
  }

  try {
    await axios.put(
      `http://localhost:3000/api/update/typecar/${editTypeId.value}`,
      { ...typeForm.value }
    );

    closeModal();
    await fetchTypes();

    Swal.fire({
      title: "แก้ไขประเภทยานพาหนะสำเร็จ!",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    Swal.fire("แก้ไขไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง", "error");
  }
};

/* ------------------------------
   Delete Type
-------------------------------*/
const deleteType = async (id) => {
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
    await axios.put(`http://localhost:3000/api/delete/typecar/${id}`);
    await fetchTypes();

    Swal.fire("ลบสำเร็จ!", "", "success");
  } catch (error) {
    Swal.fire("ลบไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง", "error");
  }
};

/* ------------------------------
   Close Modal
-------------------------------*/
const closeModal = () => {
  showModal.value = false;
  showEditModal.value = false;

  typeForm.value = {
    name: "",
  };
};

/* ------------------------------
   Lifecycle
-------------------------------*/
onMounted(fetchTypes);
</script>

<style scoped>
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
  background: #ef4444;
  color: white;
}

/* ------------------------------
   Layout
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

/* ------------------------------
   Table
-------------------------------*/
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
  max-width: 380px;
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
