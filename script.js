    // 1. Firebase Configuration (Keep your existing config here)
// const firebaseConfig = { ... };
// firebase.initializeApp(firebaseConfig);

const database = firebase.database();
const auth = firebase.auth();

// 2. Function to handle Admin Login
function handleAuth() {
    const email = prompt("Enter Admin Email:");
    const password = prompt("Enter Admin Password:");
    if (email && password) {
        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                alert("Login successful!");
                document.querySelector('.admin-section').style.display = 'block';
                document.getElementById('loginBtn').innerText = "Logout";
                document.getElementById('loginBtn').onclick = () => {
                    auth.signOut().then(() => location.reload());
                };
            })
            .catch(err => alert("Login Failed: " + err.message));
    }
}

// 3. Function to save property to Firebase
function uploadAndSave() {
    const title = document.getElementById('homeTitle').value;
    const locationName = document.getElementById('homeLocation').value;
    const price = document.getElementById('homePrice').value;
    const phone = document.getElementById('homePhone').value;
    const imageUrl = document.getElementById('homeImageURL').value;

    if (!title || !locationName || !price || !phone) {
        alert("Please fill in all required fields.");
        return;
    }

    const newPostKey = database.ref().child('listings').push().key;
    const postData = {
        title: title,
        location: locationName,
        price: price,
        phone: phone,
        image: imageUrl || "https://via.placeholder.com/200", // Default image if empty
        createdAt: Date.now()
    };

    database.ref('listings/' + newPostKey).set(postData)
        .then(() => {
            alert("Registered successfully!");
            location.reload();
        })
        .catch(err => alert("Error: " + err.message));
}

// 4. Fetch and display data from Firebase (Real-time)
database.ref('listings').on('value', (snapshot) => {
    const data = snapshot.val();
    const container = document.getElementById('listingsContainer');
    container.innerHTML = "";
    
    if (!data) {
        container.innerHTML = "<p style='text-align:center; padding:20px; color:#666;'>No listings found. Please add a property.</p>";
        return;
    }

    for (let id in data) {
        const item = data[id];
        container.innerHTML += `
            <div class="card" style="margin:15px; background:white; border-radius:12px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.1); border: 1px solid #eee;">
                <img src="${item.image}" style="width:100%; height:220px; object-fit:cover;" onerror="this.src='https://via.placeholder.com/200'">
                <div style="padding:15px;">
                    <h3 style="margin:0 0 8px 0; font-size: 18px; color: #2c3e50;">${item.title}</h3>
                    <p style="margin:5px 0; color: #7f8c8d;">📍 ${item.location}</p>
                    <p style="color:#27ae60; font-weight:bold; font-size:20px; margin:12px 0;">${item.price}</p>
                    <div style="display:flex; gap:10px; margin-top:15px;">
                        <a href="tel:${item.phone}" style="flex:2; background:#27ae60; color:white; text-align:center; padding:12px; border-radius:8px; text-decoration:none; font-weight:bold; display: flex; align-items: center; justify-content: center; gap: 5px;">
                           📞 Call Now
                        </a>
                        ${auth.currentUser ? `
                            <button onclick="deleteHome('${id}')" style="flex:1; background:#e74c3c; color:white; border:none; padding:12px; border-radius:8px; cursor:pointer; font-weight:bold;">
                                🗑️ Delete
                            </button>` : ''}
                    </div>
                </div>
            </div>`;
    }
});

// 5. Delete property function
function deleteHome(id) {
    if (confirm("Are you sure you want to permanently delete this listing?")) {
        database.ref('listings/' + id).remove()
            .then(() => alert("Deleted successfully!"))
            .catch((error) => alert("Error: " + error.message));
    }
}

// 6. Search functionality
function searchFunction() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    database.ref('listings').once('value', (snapshot) => {
        const data = snapshot.val();
        const container = document.getElementById('listingsContainer');
        
        if (!data) return;

        container.innerHTML = ""; // Clear current list
        let foundCount = 0;

        for (let id in data) {
            const item = data[id];
            if (item.title.toLowerCase().includes(input) || item.location.toLowerCase().includes(input)) {
                foundCount++;
                // Re-use the same template for filtered items
                container.innerHTML += `
                    <div class="card" style="margin:15px; background:white; border-radius:12px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
                        <img src="${item.image}" style="width:100%; height:220px; object-fit:cover;">
                        <div style="padding:15px;">
                            <h3>${item.title}</h3>
                            <p>📍 ${item.location}</p>
                            <p style="color:#27ae60; font-weight:bold;">${item.price}</p>
                            <div style="display:flex; gap:10px; margin-top:15px;">
                                <a href="tel:${item.phone}" style="flex:1; background:#27ae60; color:white; text-align:center; padding:12px; border-radius:8px; text-decoration:none; font-weight:bold;">📞 Call Now</a>
                            </div>
                        </div>
                    </div>`;
            }
        }
        
        if (foundCount === 0) {
            container.innerHTML = `<p style='text-align:center; padding:20px;'>No results found for "${input}".</p>`;
        }
    });
}

