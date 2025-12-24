import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/login/LoginView.vue"),
  },
  {
    path: "/register",
    name: "register",
    component: () => import("../views/login/RegisterView.vue"),
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: () => import("../views/dashboard/DashboardView.vue"),
    meta: { requiresAuth: true, roles: ["admin"] },
  },
  {
    path: "/typecar",
    name: "typecar",
    component: () => import("../views/backoffice/TypeView.vue"),
    meta: { requiresAuth: true, roles: ["admin"] },
  },
  {
    path: "/vehicles",
    name: "vehicles",
    component: () => import("../views/backoffice/VehiclesView.vue"),
    meta: { requiresAuth: true, roles: ["admin"] },
  },
  {
    path: "/maintenance",
    name: "maintenance",
    component: () => import("../views/backoffice/MaintenanceView.vue"),
    meta: { requiresAuth: true, roles: ["admin"] },
  },
  {
    path: "/user",
    name: "user",
    component: () => import("../views/backoffice/UserView.vue"),
    meta: { requiresAuth: true, roles: ["admin"] },
  },
  {
    path: "/vehicles-employee",
    name: "vehicles-employee",
    component: () => import("../views/employee/VehiclesEmployeeView.vue"),
    meta: { requiresAuth: true, roles: ["admin", "employee"] },
  },
  {
    path: "/maintenance-employee",
    name: "maintenance-employee",
    component: () => import("../views/employee/MaintenanceEmployeeView.vue"),
    meta: { requiresAuth: true, roles: ["admin", "employee"] },
  },
  {
    path: "/add-vehicles",
    name: "add-vehicles",
    component: () => import("../views/frontoffice/AddVehiclesView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/maintenance-user",
    name: "maintenance-user",
    component: () => import("../views/frontoffice/MaintenanceUserView.vue"),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const roles = to.meta.roles as string[] | undefined;

  if (to.meta.requiresAuth && !user) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return next("/login");
  }

  if (roles && !roles.includes(user?.role)) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return next("/login");
  }

  next();
});

export default router;
