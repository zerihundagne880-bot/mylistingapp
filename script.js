// 1. Firebase Config - ይህ ያንተ መታወቂያ ስለሆነ አይጠፋም
const firebaseConfig = {
    apiKey: "AIzaSyDi6iX2bwnOZsc9ycjJrnpEePdgOMoIWcI",
    authDomain: "mylistingapp-86690.firebaseapp.com",
    projectId: "mylistingapp-86690",
    storageBucket: "mylistingapp-86690.appspot.com",
    messagingSenderId: "936086596730",
    appId: "1:936086596730:web:0c0a6ac94e13e211b0dfc3",
    databaseURL: "https://mylistingapp-86690-default-rtdb.firebaseio.com/"
};

// Firebaseን ማስጀመር
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

// 2. Authentication Observer (ማን እንደገባ ይከታተላል)
auth.onAuthStateChanged(user => {
    const adminSection = document.querySelector('.admin-section');
    const loginBtn = document.getElementById('loginBtn');
    
    if (user) {
        // አድሚን ከገባ መመዝገቢያው ይታይ
        if(adminSection) adminSection.style.display = 'block';
        if(loginBtn) loginBtn.textContent = "Log Out";
    } else {
        // አድሚን ካልገባ መመዝገቢያው ይደበቅ
        if(adminSection) adminSection.style.display = 'none';
        if(loginBtn) loginBtn.textContent = "Admin Login";
    }
});

// 3. Login እና Logout ማስተናገጃ
function handleAuth() {
    const user = auth.currentUser;
    if (user) {
        auth.signOut().then(() => alert("ወጥተዋል!"));
    } else {
        const email = prompt("የአድሚን ኢሜይል ያስገቡ:");
        const password = prompt("ፓስወርድ ያስገቡ:");
        if (email && password) {
            auth.signInWithEmailAndPassword(email, password)
                .then(() => alert("እንኳን ደህና መጡ!"))
                .catch(err => alert("ስህተት: " + err.message));
        }
    }
}

// 4. መረጃን የመመዝገብ ተግባር (Upload ወይም Link)
async function uploadAndSave() {
    const title = document.getElementById('homeTitle').value;
    const location = document.getElementById('homeLocation').value;
    const price = document.getElementById('homePrice').value;
    const phone = document.getElementById('homePhone').value;
    const imageURL = document.getElementById('homeImageURL').value; 
    const fileInput = document.getElementById('imageFile');
    const file = fileInput.files[0];

    if (!title || !location || !price || !phone) {
        alert("እባክዎ መረጃዎችን በትክክል ይሙሉ!");
        return;
    }

    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => saveToDatabase(title, location, price, phone, e.target.result);
        reader.readAsDataURL(file);
    } else {
        saveToDatabase(title, location, price, phone, imageURL || "https://via.placeholder.com/300");
    }
}

function saveToDatabase(title, location, price, phone, finalImage) {
    database.ref('listings').push({
        title: title,
        location: location,
        price: price,
        phone: phone,
        image: finalImage
    }).then(() => {
        alert("በተሳካ ሁኔታ ተመዝግቧል!");
        location.reload();
    }).catch(err => alert("ስህተት: " + err.message));
}

// 5. ዳታውን ከ Firebase ተቀብሎ ማሳየት
database.ref('listings').on('value', (snapshot) => {
    const data = snapshot.val();
    const container = document.getElementById('listingsContainer');
    container.innerHTML = "";
    
    if (!data) {
        container.innerHTML = "<p style='text-align:center; padding:20px;'>ምንም የተመዘገበ ቤት የለም።</p>";
        return;
    }

    for (let id in data) {
        const item = data[id];
        container.innerHTML += `
            <div class="card" style="margin:15px; background:white; border-radius:10px; overflow:hidden; box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                <img src="${item.image}" style="width:100%; height:200px; object-fit:cover;">
                <div style="padding:15px;">
                    <h3>${item.title}</h3>
                    <p>📍 ${item.location}</p>
                    <p style="color:#27ae60; font-weight:bold;">${item.price}</p>
                    <div style="display:flex; gap:10px; margin-top:10px;">
                        <a href="tel:${item.phone}" target="_blank" style="flex:1; background:#27ae60; color:white; text-align:center; padding:10px; border-radius:5px; text-decoration:none; font-weight:bold;">📞 ደውል</a>
                        ${auth.currentUser ? `<button onclick="deleteHome('${id}')" style="flex:1; background:#e74c3c; color:white; border:none; padding:10px; border-radius:5px; cursor:pointer;">🗑️ አጥፋ</button>` : ''}
                    </div>
                </div>
            </div>`;
    }
});

// 6. ቤት የማጥፋት ተግባር
function deleteHome(id) {
    if (confirm("ይህ መረጃ እንዲጠፋ እርግጠኛ ነዎት?")) {
        database.ref('listings/' + id).remove()
            .then(() => alert("ተሰርዟል!"))
            .catch((error) => alert("ስህተት፡ " + error.message));
    }
}

// 7. የመፈለጊያ ተግባር
function searchFunction() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    database.ref('listings').once('value', (snapshot) => {
        const data = snapshot.val();
        const filteredData = {};
        let found = false;
        for (let id in data) {
            if (data[id].title.toLowerCase().includes(input) || data[id].location.toLowerCase().includes(input)) {
                filteredData[id] = data[id];
                found = true;
            }
        }
        updateUI(found ? filteredData : null);
    });
}
