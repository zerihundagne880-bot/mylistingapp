    }).then(() => {
        alert("Registered successfully!");
        location.reload();
    }).catch(err => alert("Error: " + err.message));
}

// 5. Fetch and display data from Firebase
database.ref('listings').on('value', (snapshot) => {
    const data = snapshot.val();
    const container = document.getElementById('listingsContainer');
    container.innerHTML = "";
    
    if (!data) {
        container.innerHTML = "<p style='text-align:center; padding:20px;'>No listings found.</p>";
        return;
    }

    for (let id in data) {
        const item = data[id];
        container.innerHTML += `
            <div class="card" style="margin:15px; background:white; border-radius:10px; overflow:hidden; box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                <img src="${item.image}" style="width:100%; height:200px; object-fit:cover;">
                <div style="padding:15px;">
                    <h3 style="margin:0 0 10px 0;">${item.title}</h3>
                    <p style="margin:5px 0;">📍 ${item.location}</p>
                    <p style="color:#27ae60; font-weight:bold; font-size:18px; margin:10px 0;">${item.price}</p>
                    <div style="display:flex; gap:10px; margin-top:15px;">
                        <a href="tel:${item.phone}" style="flex:1; background:#27ae60; color:white; text-align:center; padding:12px; border-radius:6px; text-decoration:none; font-weight:bold;">📞 Call Now</a>
                        ${auth.currentUser ? `<button onclick="deleteHome('${id}')" style="flex:1; background:#e74c3c; color:white; border:none; padding:12px; border-radius:6px; cursor:pointer; font-weight:bold;">🗑️ Delete</button>` : ''}
                    </div>
                </div>
            </div>`;
    }
});

// 6. Delete property function
function deleteHome(id) {
    if (confirm("Are you sure you want to delete this listing?")) {
        database.ref('listings/' + id).remove()
            .then(() => alert("Deleted successfully!"))
            .catch((error) => alert("Error: " + error.message));
    }
}

// 7. Search functionality
function searchFunction() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    database.ref('listings').once('value', (snapshot) => {
        const data = snapshot.val();
        const filteredData = {};
        let found = false;
        
        if (!data) return;

        for (let id in data) {
            if (data[id].title.toLowerCase().includes(input) || data[id].location.toLowerCase().includes(input)) {
                filteredData[id] = data[id];
                found = true;
            }
        }
        // Assuming you have an updateUI function or logic to refresh the display
        displayFilteredData(found ? filteredData : null);
    });
}
