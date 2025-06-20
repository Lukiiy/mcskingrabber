const capeImg = document.getElementById('cape');
const skinImg = document.getElementById('skin');
const button = document.getElementById('btn');
const usernameInput = document.getElementById('username');

let textureData = null;
let skinBlob = null;
let capeBlob = null;

function buttonState(state) {
  button.textContent = state ? 'Get Skin' : 'Loading...';
  button.disabled = !state;
}

async function fetchProfile(identifier) {
  const response = await fetch(`https://crafthead.net/profile/${identifier}`);
  if (!response.ok) throw new Error("Error while getting player data.");

  const data = await response.json();
  if (data.error === "User does not exist") {
    alert("User does not exist. Please check the username or UUID and try again.");
    throw new Error("User does not exist.");
  }

  return data;
}

async function execute(identifier) {
  if (button.disabled) return;

  buttonState(false);
  skinImg.style.display = 'none';
  capeImg.style.display = 'none';
  skinImg.src = '';
  capeImg.src = '';
  textureData = null;
  skinBlob = null;
  capeBlob = null;

  try {
    const profile = await fetchProfile(identifier);
    const properties = profile.properties.find(p => p.name === 'textures');
    if (!properties) throw new Error("Error while getting skin data.");

    usernameInput.value = profile.name;
    const decoded = JSON.parse(atob(properties.value));
    textureData = decoded.textures;

    if (textureData.SKIN?.url) skinBlob = await displayImg(textureData.SKIN.url, skinImg);
    if (textureData.CAPE?.url) capeBlob = await displayImg(textureData.CAPE.url, capeImg);

  } catch (e) {
    console.error(e.message);
  } finally {
    buttonState(true);
  }
}

async function displayImg(url, element) {
  const response = await fetch(url);
  const blob = await response.blob();

  element.src = URL.createObjectURL(blob);
  element.style.display = 'block';

  return blob;
}

function dl(type) {
  const blob = type === "skin" ? skinBlob : capeBlob;
  if (!blob) return;

  const a = document.createElement('a');

  a.href = URL.createObjectURL(blob);
  a.download = `${usernameInput.value}'s ${type}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

setTimeout(() => {
  document.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      execute(usernameInput.value.trim());
    };
  });
}, 300);
