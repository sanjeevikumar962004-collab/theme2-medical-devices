document.addEventListener("DOMContentLoaded", () => {
    // 1. Sidebar Toggle Logic
    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebarToggle");
    const sidebarClose = document.getElementById("sidebarClose");
    const sidebarOverlay = document.getElementById("sidebarOverlay");

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener("click", () => {
            sidebar.classList.add("active");
            if (sidebarOverlay) sidebarOverlay.classList.add("active");
        });
    }

    if (sidebarClose && sidebar) {
        sidebarClose.addEventListener("click", closeSidebar);
    }

    if (sidebarOverlay && sidebar) {
        // Close sidebar when clicking overlay
        sidebarOverlay.addEventListener('click', closeSidebar);
    }


    // 2. Mock Device Data
    const devices = [
        { name: "MRI System Unit 4", id: "SRL-88219-M", status: "Online", lastSync: "2 min ago", dept: "Radiology" },
        { name: "CT Scanner 1", id: "SRL-11023-C", status: "Warning", lastSync: "15 min ago", dept: "Imaging" },
        { name: "Ventilator V-82", id: "SRL-99210-V", status: "Online", lastSync: "Just now", dept: "Critical Care" },
        { name: "Infusion Pump P-12", id: "SRL-44231-P", status: "Offline", lastSync: "2 days ago", dept: "Pediatrics" },
        { name: "Patient Monitor M-1", id: "SRL-22109-M", status: "Online", lastSync: "5 min ago", dept: "ER" },
        { name: "Surgical Laser S-5", id: "SRL-77432-L", status: "Online", lastSync: "1 hour ago", dept: "Surgery" },
        { name: "X-Ray DX-4", id: "SRL-66543-X", status: "Online", lastSync: "20 min ago", dept: "Orthopedics" },
    ];

    const deviceTableBody = document.getElementById("deviceTableBody");

    function renderDevices() {
        if (!deviceTableBody) return;
        deviceTableBody.innerHTML = "";

        devices.forEach(device => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${device.name}</strong></td>
                <td><code style="background: rgba(0,0,0,0.05); padding: 2px 6px; border-radius: 4px; font-size: 0.85rem;">${device.id}</code></td>
                <td><span class="status-badge ${device.status.toLowerCase()}">${device.status}</span></td>
                <td>${device.lastSync}</td>
                <td>${device.dept}</td>
                <td>
                    <button class="table-action"><i class="fa-solid fa-ellipsis"></i></button>
                    <button class="table-action accent"><i class="fa-solid fa-gear"></i></button>
                </td>
            `;
            deviceTableBody.appendChild(tr);
        });
    }

    renderDevices();

    // 3. Simple Chart Animation with GSAP
    if (typeof gsap !== "undefined") {
        gsap.from(".chart-line", {
            drawSVG: "0%", // Note: requires DrawSVGPlugin (paid), but we can animate stroke-dashoffset manually
            duration: 2,
            ease: "power2.out",
            opacity: 0,
            y: 20
        });

        gsap.from(".chart-area", {
            duration: 1.5,
            opacity: 0,
            scaleY: 0,
            transformOrigin: "bottom",
            ease: "power3.out",
            delay: 0.5
        });

        // Stats Entry Animation
        gsap.from(".stat-card", {
            y: 30,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            delay: 0.2
        });
    }
});
