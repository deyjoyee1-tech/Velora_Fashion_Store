
document.addEventListener("DOMContentLoaded", function () {

    const chart = document.getElementById("order-status-chart");
    const legend = document.getElementById("order-status-legend");

    if (!chart || !legend) return;

    const colours = {
        Pending: "#D6AD72",
        Shipped: "#91A8B2",
        Delivered: "#91A68A",
        Cancelled: "#C58D91"
    };

    function getOrders() {
        try {
            const saved = JSON.parse(
                localStorage.getItem("veloraOrders") || "[]"
            );

            return Array.isArray(saved) ? saved : [];

        } catch (error) {
            console.error("Unable to read orders:", error);
            return [];
        }
    }

    function getStatus(status) {

        const value = String(status || "")
            .trim()
            .toLowerCase();

        if (
            value.includes("cancel") ||
            value.includes("reject")
        ) {
            return "Cancelled";
        }

        if (
            value.includes("deliver")
        ) {
            return "Delivered";
        }

        if (
            value.includes("ship") ||
            value.includes("transit") ||
            value.includes("out for delivery")
        ) {
            return "Shipped";
        }

        return "Pending";
    }

    function renderChart() {

     const orders = [
    { status: "Pending" },
    { status: "Shipped" },
    { status: "Shipped" },
    { status: "Delivered" }
];

        const counts = {
            Pending: 0,
            Shipped: 0,
            Delivered: 0,
            Cancelled: 0
        };

        orders.forEach(function (order) {
            const status = getStatus(order.status);
            counts[status]++;
        });

        const total = orders.length;

        const values = Object.entries(counts);

        let currentAngle = 0;

        const gradientParts = [];

        values.forEach(function ([status, count]) {

            const percentage = total
                ? (count / total) * 100
                : 0;

            const angle = (percentage / 100) * 360;

            if (angle > 0) {
                gradientParts.push(
                    `${colours[status]} ${currentAngle}deg ${currentAngle + angle}deg`
                );
            }

            currentAngle += angle;

        });

        if (total === 0) {
            chart.style.background =
                "conic-gradient(#eee8df 0deg 360deg)";
        } else {
            chart.style.background =
                `conic-gradient(${gradientParts.join(", ")})`;
        }

        chart.innerHTML = `
            <div class="velora-doughnut-center">
                <strong>${total}</strong>
                <span>TOTAL ORDERS</span>
            </div>
        `;

        legend.innerHTML = values.map(function ([status, count]) {

            const percentage = total
                ? ((count / total) * 100).toFixed(1)
                : "0.0";

            return `
                <div class="velora-legend-item">

                    <div class="velora-legend-left">
                        <span
                            class="velora-legend-dot"
                            style="background:${colours[status]}"
                        ></span>

                        <span>${status}</span>
                    </div>

                    <div class="velora-legend-right">
                        <strong>${count}</strong>
                        <span>${percentage}%</span>
                    </div>

                </div>
            `;

        }).join("");

        if (total === 0) {
            legend.innerHTML += `
                <p class="velora-chart-empty">
                    Your order statistics will appear here
                    when customers place orders.
                </p>
            `;
        }
    }

    renderChart();

    // Refresh when another admin script changes orders
    window.addEventListener("storage", renderChart);

    // Also refresh when this page remains open
    setInterval(renderChart, 3000);

});
