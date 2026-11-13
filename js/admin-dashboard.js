
document.addEventListener("DOMContentLoaded", function () {

    // SAFELY LOAD DATA FROM LOCAL STORAGE
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

    // LOAD STORE DATA
    const orders = getStorageData("veloraOrders");

    const adminProducts = getStorageData("veloraProducts");

    const savedCategories = getStorageData("veloraCategories");


    // DEFAULT STORE DATA
    const defaultCategories = [
        "Men",
        "Women",
        "Kids",
        "Maternity"
    ];

    // THE CUSTOMER SHOP PAGE CONTAINS 12 DEFAULT PRODUCTS
    const defaultProductCount = 12;


    // CALCULATE TOTAL PRODUCTS
    const productNames = new Set();

    adminProducts.forEach(function (product) {

        if (!product || !product.name) return;

        const productKey =
            product.name.trim().toLowerCase() +
            "|" +
            String(product.category || "").trim().toLowerCase();

        productNames.add(productKey);

    });

    // Add the 12 default products, avoiding duplicates
    // where an admin product has the same name and category.
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


    // CALCULATE TOTAL CATEGORIES
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


    // CALCULATE ORDER STATISTICS
    const totalOrders = orders.length;

    const pendingCount = orders.filter(function (order) {

        return order.status === "Pending" ||
            order.status === "Order Placed";

    }).length;

    const completedOrders = orders.filter(function (order) {

        return order.status === "Delivered";

    }).length;


    // CALCULATE TOTAL REVENUE
    const totalRevenue = orders.reduce(function (total, order) {

        return total + (Number(order.total) || 0);

    }, 0);


    // DISPLAY DASHBOARD STATISTICS
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


    // OPTIONAL DELIVERED ORDERS STATISTIC
    const deliveredOrders = document.getElementById(
        "dashboard-delivered-orders"
    );

    if (deliveredOrders) {
        deliveredOrders.textContent = completedOrders;
    }


    // RECENT ORDERS TABLE
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


    // SHOW FIVE NEWEST ORDERS
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
