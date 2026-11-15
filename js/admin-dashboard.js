
document.addEventListener("DOMContentLoaded", function () {

    // =====================================
    // 1. SAFELY LOAD DATA FROM LOCAL STORAGE
    // =====================================

    function getStorageData(key) {

        try {

            const saved = localStorage.getItem(key);

            if (!saved) return [];

            const parsed = JSON.parse(saved);

            return Array.isArray(parsed) ? parsed : [];

        } catch (error) {

            console.error("Could not load " + key + ":", error);

            return [];

        }

    }


    // =====================================
    // 2. LOAD STORE DATA
    // =====================================

    const orders = getStorageData("veloraOrders");

    const adminProducts = getStorageData("veloraProducts");

    const savedCategories = getStorageData("veloraCategories");


    // =====================================
    // 3. DEFAULT STORE DATA
    // =====================================

    const defaultCategories = [
        "Men",
        "Women",
        "Kids",
        "Maternity"
    ];

    const defaultProductCount = 12;


    // =====================================
    // 4. CALCULATE TOTAL PRODUCTS
    // =====================================

    const productNames = new Set();

    adminProducts.forEach(function (product) {

        if (!product || !product.name) return;

        const productKey =
            product.name.trim().toLowerCase() +
            "|" +
            String(product.category || "").trim().toLowerCase();

        productNames.add(productKey);

    });


    const defaultProductKeys = [
        "classic casual shirt|men",
        "elegant everyday outfit|women",
        "little trendsetter outfit|kids",
        "comfort maternity style|maternity"
    ];

    let duplicateDefaults = 0;

    defaultProductKeys.forEach(function (key) {

        if (productNames.has(key)) {
            duplicateDefaults++;
        }

    });


    const totalProducts =
        adminProducts.length +
        defaultProductCount -
        duplicateDefaults;


    // =====================================
    // 5. CALCULATE TOTAL CATEGORIES
    // =====================================

    const categoryNames = new Set(
        defaultCategories.map(function (category) {
            return category.toLowerCase();
        })
    );

    savedCategories.forEach(function (category) {

        const categoryName = typeof category === "string"
            ? category
            : category && category.name;

        if (categoryName) {
            categoryNames.add(categoryName.trim().toLowerCase());
        }

    });

    const totalCategories = categoryNames.size;


    // =====================================
    // 6. CALCULATE ORDER STATISTICS
    // =====================================

    const totalOrders = orders.length;

    const pendingCount = orders.filter(function (order) {

        return order.status === "Pending" ||
            order.status === "Order Placed";

    }).length;


    const completedOrders = orders.filter(function (order) {

        return order.status === "Delivered";

    }).length;


    // =====================================
    // 7. CALCULATE TOTAL REVENUE
    // =====================================

    const totalRevenue = orders.reduce(function (total, order) {

        return total + (Number(order.total) || 0);

    }, 0);


    // =====================================
    // 8. DISPLAY DASHBOARD STATISTICS
    // =====================================

    const statistics = {

        "dashboard-total-products": totalProducts,

        "dashboard-total-categories": totalCategories,

        "dashboard-total-orders": totalOrders,

        "dashboard-pending-orders": pendingCount,

        "dashboard-total-revenue":
            "₹" + totalRevenue.toLocaleString("en-IN")

    };


    Object.keys(statistics).forEach(function (id) {

        const element = document.getElementById(id);

        if (element) {
            element.textContent = statistics[id];
        }

    });


    // =====================================
    // 9. DELIVERED ORDERS STATISTIC
    // =====================================

    const deliveredOrders = document.getElementById(
        "dashboard-delivered-orders"
    );

    if (deliveredOrders) {
        deliveredOrders.textContent = completedOrders;
    }


    // =====================================
    // 10. MONTHLY SALES ANALYTICS
    // =====================================

    const chartContainer = document.getElementById(
        "monthly-sales-chart"
    );

    if (chartContainer) {

        const today = new Date();

        const monthlyData = [];


        // PREPARE LAST SIX MONTHS

        for (let i = 5; i >= 0; i--) {

            const date = new Date(
                today.getFullYear(),
                today.getMonth() - i,
                1
            );

            monthlyData.push({

                month: date.toLocaleString("en-IN", {
                    month: "short"
                }),

                monthNumber: date.getMonth(),

                year: date.getFullYear(),

                revenue: 0,

                orders: 0

            });

        }


        // ADD ACTUAL ORDER INFORMATION

        orders.forEach(function (order) {

            const rawDate =
                order.createdAt ||
                order.orderDate ||
                order.date ||
                order.timestamp;

            if (!rawDate) return;

            const orderDate = new Date(rawDate);

            if (isNaN(orderDate.getTime())) return;


            const monthData = monthlyData.find(function (item) {

                return (
                    item.monthNumber === orderDate.getMonth() &&
                    item.year === orderDate.getFullYear()
                );

            });


            if (monthData) {

                monthData.revenue += Number(order.total) || 0;

                monthData.orders++;

            }

        });


        // CALCULATE CHART TOTALS

        const chartRevenue = monthlyData.reduce(
            function (sum, item) {
                return sum + item.revenue;
            },
            0
        );


        const chartOrders = monthlyData.reduce(
            function (sum, item) {
                return sum + item.orders;
            },
            0
        );


        // DISPLAY ANALYTICS TOTALS

        const analyticsRevenue = document.getElementById(
            "analytics-revenue"
        );

        const analyticsOrders = document.getElementById(
            "analytics-orders"
        );


        if (analyticsRevenue) {

            analyticsRevenue.textContent =
                "₹" + chartRevenue.toLocaleString("en-IN");

        }


        if (analyticsOrders) {

            analyticsOrders.textContent = chartOrders;

        }


        // FIND MAXIMUM REVENUE

        const maximumRevenue = Math.max(
            ...monthlyData.map(function (item) {
                return item.revenue;
            }),
            1
        );


        // CLEAR PREVIOUS CHART

        chartContainer.innerHTML = "";


        // CREATE CHART COLUMNS

        monthlyData.forEach(function (item) {

            const column = document.createElement("div");

            column.className = "sales-chart-column";


            // REVENUE LABEL

            const amount = document.createElement("span");

            amount.className = "sales-chart-amount";

            amount.textContent =
                "₹" + item.revenue.toLocaleString("en-IN");


            // BAR WRAPPER

            const barWrapper = document.createElement("div");

            barWrapper.className = "sales-chart-bar-wrapper";


            // REVENUE BAR

            const bar = document.createElement("div");

            bar.className = "sales-chart-bar";


            const barHeight = item.revenue > 0
                ? Math.max(
                    5,
                    (item.revenue / maximumRevenue) * 100
                )
                : 0;


            bar.style.height = barHeight + "%";


            // MONTH LABEL

            const month = document.createElement("span");

            month.className = "sales-chart-month";

            month.textContent = item.month;


            // ORDER COUNT

            const orderCount = document.createElement("small");

            orderCount.className = "sales-chart-orders";

            orderCount.textContent =
                item.orders +
                (item.orders === 1 ? " order" : " orders");


            // ADD ELEMENTS

            barWrapper.appendChild(bar);

            column.append(
                amount,
                barWrapper,
                month,
                orderCount
            );

            chartContainer.appendChild(column);

        });

    }


    // =====================================
    // 11. RECENT ORDERS TABLE
    // =====================================

    const recentOrders = document.getElementById(
        "dashboard-recent-orders"
    );


    if (!recentOrders) return;


    recentOrders.innerHTML = "";


    // EMPTY STATE

    if (orders.length === 0) {

        const row = document.createElement("tr");

        const cell = document.createElement("td");

        cell.colSpan = 5;

        cell.textContent = "No customer orders yet.";

        row.appendChild(cell);

        recentOrders.appendChild(row);

        return;

    }


    // =====================================
    // 12. SHOW FIVE NEWEST ORDERS
    // =====================================

    const latestOrders = [...orders].reverse().slice(0, 5);


    latestOrders.forEach(function (order) {

        const row = document.createElement("tr");


        // GET PRODUCT NAMES

        const items = Array.isArray(order.items)
            ? order.items
            : [];


        const productNames = items.map(function (item) {

            return item.productName ||
                item.name ||
                item.title ||
                "Product";

        }).join(", ");


        // PREPARE ORDER INFORMATION

        const values = [

            order.orderId || "N/A",

            order.customerName || "Customer",

            productNames || "Product",

            "₹" + (Number(order.total) || 0).toLocaleString("en-IN"),

            order.status || "Order Placed"

        ];


        // ADD INFORMATION TO TABLE

        values.forEach(function (value) {

            const cell = document.createElement("td");

            cell.textContent = value;

            row.appendChild(cell);

        });


        recentOrders.appendChild(row);

    });

});
