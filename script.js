    // 1. Firebase Configuration (Keep your existing config here)
// const firebaseConfig = { ... };
// firebase.initializeApp(firebaseConfig);

const firebaseConfig = {
  apiKey: "AIzaSyDi6iX2bwnOZsc9ycjJrnpEePdgOMoIWcI",
  authDomain: "mylistingapp-86690.firebaseapp.com",
  databaseURL: "https://mylistingapp-86690-default-rtdb.firebaseio.com",
  projectId: "mylistingapp-86690",
  storageBucket: "mylistingapp-86690.firebasestorage.app",
  messagingSenderId: "936086596730",
  appId: "1:936086596730:web:a8ed267cae353c58b0dfc3",
  measurementId: "G-KBKNK3BQ3F"
};

// Initialize Firebase (Compat version)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const database = firebase.database();
const auth = firebase.auth();

// 2. Auth Observer (የአድሚን ሁኔታ መከታተያ)
auth.onAuthStateChanged((user) => {
    const adminSection = document.querySelector('.admin-section');
    const loginBtn = document.getElementById('loginBtn');

    if (user) {
        adminSection.style.display = 'block';
        loginBtn.innerText = "Logout";
        loginBtn.style.backgroundColor = "#e74c3c";
        loginBtn.onclick = () => {
            auth.signOut().then(() => {
                alert("Logged out!");
                location.reload();
            });
        };
    } else {
        adminSection.style.display = 'none';
        loginBtn.innerText = "Admin Login";
        loginBtn.style.backgroundColor = "#e67e22";
        loginBtn.onclick = handleAuth;
    }
});

// 3. Login Function
function handleAuth() {
    const email = prompt("Enter Admin Email:");
    const password = prompt("Enter Admin Password:");
    
    if (email && password) {
        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                alert("Login successful!");
            })
            .catch(err => alert("Login Failed: " + err.message));
    }
}

// 4. Register New Property
function uploadAndSave() {
    const title = document.getElementById('homeTitle').value;
    const locationName = document.getElementById('homeLocation').value;
    const price = document.getElementById('homePrice').value;
    const phone = document.getElementById('homePhone').value;
    const imageUrl = document.getElementById('homeImageURL').value;

    if (!title || !locationName || !price || !phone) {
        alert("Please fill in all fields.");
        return;
    }

    const newPostKey = database.ref().child('listings').push().key;
    const postData = {
        title: title,
        location: locationName,
        price: price,
        phone: phone,
        image: imageUrl || "https://via.placeholder.com/300x200?text=No+Image",
        createdAt: Date.now()
    };

    database.ref('listings/' + newPostKey).set(postData)
        .then(() => {
            alert("Property registered!");
            document.querySelectorAll('.admin-section input').forEach(input => input.value = "");
        })
        .catch(err => alert("Error: " + err.message));
}

// 5. Display Listings (Real-time)
database.ref('listings').on('value', (snapshot) => {
    const data = snapshot.val();
    const container = document.getElementById('listingsContainer');
    container.innerHTML = "";
    
    if (!data) {
        container.innerHTML = "<p style='text-align:center;'>No listings available.</p>";
        return;
    }

    for (let id in data) {
        const item = data[id];
        container.innerHTML += `
            <div class="card">
                <img src="${item.image}" onerror="this.src='https://via.placeholder.com/300x200'">
                <div class="card-info" style="padding:15px;">
                    <h3>${item.title}</h3>
                    <p>📍 ${item.location}</p>
                    <p class="price" style="color:#27ae60; font-weight:bold;">${item.price}</p>
                    <div style="display:flex; gap:10px; margin-top:10px;">
                        <a href="tel:${item.phone}" style="flex:2; background:#27ae60; color:white; text-align:center; padding:10px; border-radius:5px; text-decoration:none; font-weight:bold;">📞 Call</a>
                        ${auth.currentUser ? `<button onclick="deleteHome('${id}')" style="flex:1; background:#e74c3c; color:white; border:none; padding:10px; border-radius:5px; cursor:pointer;">🗑️</button>` : ''}
                    </div>
                </div>
            </div>`;
    }
});

// 6. Delete Listing
function deleteHome(id) {
    if (confirm("Delete this listing?")) {
        database.ref('listings/' + id).remove()
            .then(() => alert("Deleted!"))
            .catch(err => alert("Error: " + err.message));
    }
}

// 7. Search
function searchFunction() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    database.ref('listings').once('value', (snapshot) => {
        const data = snapshot.val();
        const container = document.getElementById('listingsContainer');
        if (!data) return;
        container.innerHTML = "";
        for (let id in data) {
            const item = data[id];
            if (item.title.toLowerCase().includes(input) || item.location.toLowerCase().includes(input)) {
                container.innerHTML += `<div class="card"><img src="${item.image}"><div class="card-info"><h3>${item.title}</h3><p>📍 ${item.location}</p><p class="price">${item.price}</p><a href="tel:${item.phone}" style="display:block; background:#27ae60; color:white; text-align:center; padding:10px; border-radius:5px; text-decoration:none;">📞 Call</a></div></div>`;
            }
        }
    });
}
