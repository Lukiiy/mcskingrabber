const capeImg = document.getElementById("cape");
const skinImg = document.getElementById("skin");
const button = document.getElementById("btn");
const usernameInput = document.getElementById("username");
const buttonOg = button.textContent;

let skinBlob = null;
let capeBlob = null;

function buttonState(state) {
    button.textContent = state ? buttonOg : "Loading...";
    button.disabled = !state;
}

async function fetchProfile(id) {
    const response = await fetch(`https://crafthead.net/profile/${id}`);
    if (!response.ok) throw new Error("Error while getting player data.");

    const data = await response.json();
    if (data.error === "User does not exist") {
        alert("User does not exist. Please check the username or UUID and try again.");

        throw new Error("User does not exist.");
    }

    return data;
}

async function execute(id) {
    if (button.disabled) return;

    buttonState(false);

    skinImg.src = "";
    capeImg.src = "";
    skinBlob = null;
    capeBlob = null;

    try {
        const profile = await fetchProfile(id);
        const properties = profile.properties?.find(p => p.name === "textures");

        usernameInput.value = profile.username ?? profile.name ?? id;

        let skinUrl = null;
        let capeUrl = null;

        if (properties?.value) {
            try {
                const decoded = JSON.parse(atob(properties.value)).textures;

                skinUrl = decoded?.SKIN?.url ?? null;
                capeUrl = decoded?.CAPE?.url ?? null;
            } catch (err) {
                console.warn("Failed to decode textures property.", err);
            }
        }

        if (!skinUrl) skinUrl = profile.skin_texture ?? null;
        if (!capeUrl) capeUrl = profile.cape_texture ?? null;
        if (!skinUrl && !capeUrl) throw new Error("Error while getting skin data.");

        if (skinUrl) skinBlob = await displayImg(skinUrl, skinImg);
        if (capeUrl) capeBlob = await displayImg(capeUrl, capeImg);

        setFavicon(`https://crafthead.net/helm/${profile.id}`);
    } catch (e) {
        console.error(e?.message ?? e);
    } finally {
        buttonState(true);
    }
}

async function displayImg(url, element) {
    const response = await fetch(url.replace(/^http:\/\//i, "https://"));
    const blob = await response.blob();

    element.src = URL.createObjectURL(blob);

    return blob;
}

function dl(type) {
    const blob = type === "skin" ? skinBlob : capeBlob;
    if (!blob) return;

    const a = document.createElement("a");

    a.href = URL.createObjectURL(blob);
    a.download = `${usernameInput.value}'s ${type}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function setFavicon(url) {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement("link");
        link.rel = "icon";

        document.head.appendChild(link);
    }

    link.href = url;
}

document.addEventListener("keydown", function(e) {
    if (e.key === "Enter" && document.activeElement === usernameInput) {
        e.preventDefault();
        execute(usernameInput.value.trim());
    };
});