<template>
  <div class="table-wrapper">
    <div class="table-card">
      <h2 class="title">รายการบำรุงรักษา</h2>

      <!-- Search -->
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="🔍 ค้นหาตามเลขทะเบียน"
        />
      </div>

      <!-- Cards -->
      <TransitionGroup
        name="card"
        tag="div"
        class="card-grid"
        v-if="paginatedMaintenances.length"
      >
        <div
          v-for="item in paginatedMaintenances"
          :key="item._id"
          class="maintenance-card"
          :ref="(el) => setCardRef(el, item._id)"
        >
          <div class="card-header">
            <span class="plate">{{ item.vehicleLicensePlate }}</span>
            <span class="date">{{ formatDate(item.date) }}</span>
          </div>

          <div class="card-body">
            <p><strong>ชื่อรถ:</strong> {{ item.vehicleId?.vehicle }}</p>
            <p><strong>ประเภทบริการ:</strong> {{ item.serviceType }}</p>
            <p><strong>รายละเอียด:</strong> {{ item.description }}</p>
            <p><strong>การแก้ไข:</strong> {{ item.solving }}</p>
            <p><strong>เลขไมล์:</strong> {{ item.mileageRecord }} กม.</p>
            <p><strong>ค่าบริการ:</strong> {{ item.cost }} บาท</p>
          </div>

          <div class="card-footer">
            <span>
              👤 เจ้าของ:
              {{
                item.vehicleId?.userId
                  ? `${item.vehicleId.userId.firstName} ${item.vehicleId.userId.lastName}`
                  : "-"
              }}
            </span>

            <span>
              🔧 ผู้ซ่อม:
              {{
                item.responsibleUserId
                  ? `${item.responsibleUserId.firstName} ${item.responsibleUserId.lastName}`
                  : "-"
              }}
            </span>

            <div class="action-buttons no-print">
              <button class="print-btn" @click="printCard(item._id)">
                🖨️ พิมพ์
              </button>
              <button class="pdf-btn" @click="exportPDF(item)">📄 PDF</button>
            </div>
          </div>
        </div>
      </TransitionGroup>

      <div v-else class="empty">ไม่พบข้อมูล</div>

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
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, computed, onMounted } from "vue";
import html2pdf from "html2pdf.js";

/* Utils */
const formatDate = (date) => new Date(date).toLocaleDateString("th-TH");

/* State */
const userId = JSON.parse(localStorage.getItem("user")).id;
const maintenances = ref([]);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = 6;
const cardRefs = ref({});

/* Computed */
const filteredMaintenances = computed(() => {
  if (!searchQuery.value) return maintenances.value;
  return maintenances.value.filter((m) =>
    m.vehicleLicensePlate
      ?.toLowerCase()
      .includes(searchQuery.value.toLowerCase())
  );
});

const totalPages = computed(() =>
  Math.ceil(filteredMaintenances.value.length / itemsPerPage)
);

const paginatedMaintenances = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredMaintenances.value.slice(start, start + itemsPerPage);
});

/* API */
const fetchMaintenances = async () => {
  const res = await axios.get(
    `http://localhost:3000/api/get/maintenance/${userId}`
  );
  maintenances.value = res.data;
};

/* Actions */
const setCardRef = (el, id) => {
  if (el) cardRefs.value[id] = el;
};

const printCard = (id) => {
  const card = cardRefs.value[id];
  if (!card) return;

  // clone การ์ด เพื่อไม่กระทบ DOM หลัก
  const clone = card.cloneNode(true);

  // ลบปุ่มพิมพ์ / pdf ออก
  const actions = clone.querySelector(".action-buttons");
  if (actions) actions.remove();

  const win = window.open("", "_blank");
  win.document.write(`
  <!DOCTYPE html>
  <html>
    <head>
      <title>Maintenance Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
        }
        .maintenance-card {
          border: 1px solid #ccc;
          border-radius: 14px;
          padding: 20px;
          max-width: 700px;
          margin: auto;
        }
      </style>
    </head>
    <body>
      ${clone.outerHTML}
      <script>
        window.onload = function () {
          window.print();
          window.close();
        };
      <\/script>
    </body>
  </html>
`);

  win.document.close();
};

const exportPDF = (item) => {
  const card = cardRefs.value[item._id];
  const filename = `maintenance_${item.vehicleLicensePlate}_${formatDate(
    item.date
  )}.pdf`;

  html2pdf()
    .set({
      margin: 10,
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(card)
    .save();
};

/* Lifecycle */
onMounted(fetchMaintenances);
</script>

<style scoped>
.table-wrapper {
  min-height: 60vh;
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
  margin-bottom: 20px;
}

/* Search + Actions */
.search-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box input {
  width: 260px;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #ddd;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.print-btn {
  background: #22c55e;
  color: white;
  padding: 8px 14px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
}

.pdf-btn {
  background: #6366f1;
  color: white;
  padding: 8px 14px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
}

/* Cards */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.maintenance-card {
  background: white;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.plate {
  font-size: 18px;
  font-weight: 700;
}

.date {
  font-size: 14px;
  color: #64748b;
}

.card-body p {
  margin: 6px 0;
}

.card-footer {
  margin-top: 10px;
  font-size: 14px;
  color: #334155;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Pagination */
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
}

.pagination button.active {
  background: #4facfe;
  color: white;
}

/* ---------------- Animations ---------------- */

/* Card enter animation */
.card-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.96);
}

.card-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.card-enter-active {
  transition: all 0.4s ease;
}

/* Card leave animation */
.card-leave-from {
  opacity: 1;
  transform: scale(1);
}

.card-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.card-leave-active {
  transition: all 0.3s ease;
  position: absolute;
}

/* Hover effect */
.maintenance-card {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.maintenance-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.18);
}

/* Button hover */
.print-btn,
.pdf-btn {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.print-btn:hover,
.pdf-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
}

/* Pagination animation */
.pagination button {
  transition: background 0.2s ease, transform 0.2s ease;
}

.pagination button:hover {
  transform: translateY(-2px);
}

/* Print */
@media print {
  .search-box,
  .pagination {
    display: none;
  }

  .maintenance-card {
    box-shadow: none;
    border: 1px solid #ccc;
    break-inside: avoid;
  }
}
</style>
