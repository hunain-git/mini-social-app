// AUTH
const signupBox = document.getElementById("signup-box");
const loginBox = document.getElementById("login-box");
const mainApp = document.getElementById("main-app");
let currentUser = "", profilePic = "images/profile1.jpg";

// Switch forms
document.getElementById("go-to-login").onclick = () => {
    signupBox.classList.add("hidden");
    loginBox.classList.remove("hidden");
};
document.getElementById("go-to-signup").onclick = () => {
    loginBox.classList.add("hidden");
    signupBox.classList.remove("hidden");
};

// Signup
document.getElementById("signup-btn").onclick = () => {
    currentUser = document.getElementById("signup-name").value || "User";
    profilePic = document.getElementById("signup-profile").value.trim() || "images/profile1.jpg";
    loginSuccess();
};

// Login
document.getElementById("login-btn").onclick = () => {
    currentUser = document.getElementById("login-email").value || "User";
    profilePic = "images/profile1.jpg";
    loginSuccess();
};


document.getElementById("logout-btn").onclick = () => location.reload();


function loginSuccess() {
    document.getElementById("auth-container").classList.add("hidden");
    mainApp.classList.remove("hidden");
    document.getElementById("left-username").innerText = currentUser;
    document.getElementById("profile-pic").src = profilePic;
    document.getElementById("small-profile").src = profilePic;
    renderPosts();
}


let posts = [];
let editId = null;
let activeCommentsPostId = null;

const postsFeed = document.getElementById("posts-feed");

document.getElementById("post-btn").onclick = () => {
    const text = document.getElementById("post-text").value.trim();
    const image = document.getElementById("post-image").value.trim();
    if (!text && !image) return;

    posts.unshift({
        id: Date.now(),
        user: currentUser,
        profile: profilePic,
        text,
        image,
        likes: 0,
        liked: false,
        comments: [],
        date: new Date().toLocaleString()
    });

    document.getElementById("post-text").value = "";
    document.getElementById("post-image").value = "";
    renderPosts();
};


function renderPosts(data = posts) {
    postsFeed.innerHTML = "";
    data.forEach(p => {
        const div = document.createElement("div");
        div.className = "post";
        div.innerHTML = `
            <div class="post-header">
                <img src="${p.profile}" class="post-profile">
                <strong>${p.user}</strong>
                <span style="margin-left:auto; font-size:12px;">${p.date}</span>
            </div>

            <div class="post-text">${p.text}</div>
            ${p.image ? `<img src="${p.image}" class="post-img">` : ""}

            <div class="post-actions">
                <button class="like-btn ${p.liked ? "liked" : ""}" data-id="${p.id}">❤️ ${p.likes}</button>
                <button class="edit-btn" data-id="${p.id}">Edit</button>
                <button class="delete-btn" data-id="${p.id}">Delete</button>
                <button class="comment-btn" data-id="${p.id}">Comments (${p.comments.length})</button>
            </div>
        `;
        postsFeed.appendChild(div);
    });
}


postsFeed.onclick = e => {
    const id = Number(e.target.dataset.id);
    const post = posts.find(p => p.id === id);
    if (!post) return;

    if (e.target.classList.contains("like-btn")) {
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;
        renderPosts();
    }

    if (e.target.classList.contains("delete-btn")) {
        posts = posts.filter(p => p.id !== id);
        renderPosts();
    }

    if (e.target.classList.contains("edit-btn")) {
        editId = id;
        document.getElementById("edit-text").value = post.text;
        document.getElementById("edit-image").value = post.image;
        document.getElementById("edit-modal").classList.remove("hidden");
    }

    if (e.target.classList.contains("comment-btn")) {
        activeCommentsPostId = id;
        renderComments(post);
        document.getElementById("comments-modal").classList.remove("hidden");
    }
};


document.getElementById("save-edit").onclick = () => {
    const post = posts.find(p => p.id === editId);
    post.text = document.getElementById("edit-text").value;
    post.image = document.getElementById("edit-image").value;
    document.getElementById("edit-modal").classList.add("hidden");
    renderPosts();
};


document.getElementById("cancel-edit").onclick = () => {
    document.getElementById("edit-modal").classList.add("hidden");
};

// COMMENTS 
const commentsModal = document.getElementById("comments-modal");
const commentsList = document.getElementById("comments-list");
const commentInput = document.getElementById("comment-input");
const addCommentBtn = document.getElementById("add-comment-btn");
document.getElementById("close-comments").onclick = () => commentsModal.classList.add("hidden");

function renderComments(post) {
    commentsList.innerHTML = "";
    post.comments.forEach(c => {
        const node = document.createElement("div");
        node.className = "comment";
        node.innerHTML = `
            <strong>${c.user}:</strong> ${c.text} 
            <span style="font-size:12px; margin-left:6px;">${new Date(c.date).toLocaleString()}</span>
            <button class="edit-comment" data-cid="${c.id}">Edit</button>
            <button class="delete-comment" data-cid="${c.id}">Delete</button>
        `;
        commentsList.appendChild(node);
    });
}

addCommentBtn.onclick = () => {
    const text = commentInput.value.trim(); 
    if (!text) return;
    const post = posts.find(p => p.id === activeCommentsPostId);
    post.comments.push({id: Date.now(), user: currentUser, text, date: new Date()});
    commentInput.value = "";
    renderComments(post); 
    renderPosts();
};

commentsList.onclick = e => {
    const btn = e.target.closest("button"); 
    if (!btn) return;
    const cid = Number(btn.dataset.cid); 
    const post = posts.find(p => p.id === activeCommentsPostId);
    if (btn.classList.contains("delete-comment")) {
        post.comments = post.comments.filter(c => c.id !== cid);
        renderComments(post); 
        renderPosts(); 
    }
    if (btn.classList.contains("edit-comment")) {
        const c = post.comments.find(c => c.id === cid); 
        const newText = prompt("Edit comment:", c.text); 
        if (newText !== null) { 
            c.text = newText.trim(); 
            renderComments(post); 
            renderPosts(); 
        }
    }
};


document.getElementById("search-posts").oninput = e => {
    const term = e.target.value.toLowerCase();
    const filtered = posts.filter(p => p.text.toLowerCase().includes(term));
    renderPosts(filtered);
};


document.getElementById("sort-posts").onchange = e => {
    let sorted = [...posts];
    if (e.target.value === "oldest") sorted.reverse();
    if (e.target.value === "mostliked") sorted.sort((a,b)=>b.likes-a.likes);
    renderPosts(sorted);
};


document.getElementById("toggle-theme").onclick = () => {
    document.body.classList.toggle("dark");
};
