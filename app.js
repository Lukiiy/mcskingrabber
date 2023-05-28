let getskin_lock = false;
const loadingDiv = document.getElementById("loading");
const capeDiv = document.getElementById("cape");
const skinDiv = document.getElementById("skin");
const button = document.getElementById("button");

async function getSkin() {
    if (getskin_lock === true) {return;}
    getskin_lock = true;
    const username = document.getElementById("username").value.trim();

    if (username === "") {
        alert("Please enter a username.");
        return;
    }

    capeDiv.innerHTML = "";
    skinDiv.innerHTML = "";

    toggleState("loading");

    try {
        const response = await fetch(`https://api.ashcon.app/mojang/v2/user/${username}`);
        if (!response.ok) {throw new Error("Failed to retrieve player data!");}

        const data = await response.json();

        if (!data.textures || !data.textures.skin) {
            throw new Error("Failed to retrieve skin data!");
        }

        const skinUrl = data.textures.skin.url?.replace(/^http:\/\//i, "https://");
        const capeUrl = data.textures.cape?.url?.replace(/^http:\/\//i, "https://");

        await loadImage(skinUrl, "Skin", skinDiv);
        if (capeUrl) {
            await loadImage(capeUrl, "Cape", capeDiv);
        }

        toggleState("button");
    } catch (error) {
        toggleState("button");
        alert(error.message);
    }
    getskin_lock = false;
}

async function loadImage(url, alt, div) {
    if (url) {
        const img = document.createElement("img");
        img.src = url;
        img.alt = alt;
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });
        div.appendChild(img);
    }
}

function toggleState(state) {
    const loadingDiv = document.getElementById("loading");
    const button = document.getElementById("button");
    loadingDiv.style.display = state === "loading" ? "block" : "none";
    button.style.display = state === "button" ? "flex" : "none";
}

function dlContent(type) {
    const imgContainer = type === "skin" ? document.querySelector("#skin") : document.querySelector("#cape");
    const img = imgContainer.querySelector("img");
    if (!img) {
        alert("No image found!");
        return;
    }
    fetch(img.src)
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = type === "skin" ? "skin.png" : "cape.png";
            document.body.appendChild(a);
            a.click();
            a.remove();
        })
        .catch(() => alert(`Error downloading ${type}!`));
}

document.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        const username = document.getElementById("username").value.trim();
        if (username !== "") {getSkin();}
    }
});