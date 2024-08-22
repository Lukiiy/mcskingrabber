const capeImg = document.getElementById('cape');
const skinImg = document.getElementById('skin');
const button = document.getElementById('btn');
const usernameInput = document.getElementById('username');
const dataBox = document.getElementById('data');

function isValidUsernameOrUUID(input) {
  const usernameRegex = /^\w{3,16}$/;
  const UUIDRegex = /^[0-9a-f]{32}$/i;
  const dashedUUIDRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return usernameRegex.test(input) || UUIDRegex.test(input) || dashedUUIDRegex.test(input);
}

function buttonState(state) {
  button.textContent = state ? 'Get Skin' : 'Loading...';
  button.disabled = !state;
}

function dl(type) {
  const img = type === "Skin" ? skinImg : capeImg;
  if (img.src) {
    const a = document.createElement('a');
    a.href = img.src;
    a.download = `${type}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
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
  if (!isValidUsernameOrUUID(identifier)) {
    alert("Please, insert a valid username or UUID!");
    return;
  }

  buttonState(false);
  skinImg.style.display = 'none';
  capeImg.style.display = 'none';
  skinImg.src = '';
  capeImg.src = '';

  try {
    const profile = await fetchProfile(identifier);
    const textureProperty = profile.properties.find(p => p.name === 'textures');
    if (!textureProperty) throw new Error("Error while getting skin data.");

    const decodedTextures = JSON.parse(atob(textureProperty.value));

    const skinUrl = decodedTextures.textures.SKIN?.url;
    const capeUrl = decodedTextures.textures.CAPE?.url;

    if (skinUrl) {
      skinImg.src = skinUrl;
      skinImg.style.display = 'block';
    } else {
      throw new Error("Skin not found.");
    }

    if (capeUrl) {
      capeImg.src = capeUrl;
      capeImg.style.display = 'block';
    }

  } catch (e) {
    console.error(e.message);
  } finally {
    buttonState(true);
  }
}

setTimeout(() => {
  document.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      execute(usernameInput.value.trim());
    };
  });

  skinImg.addEventListener("click", function(e) {
    e.preventDefault();
    dl("Skin");
  });

  capeImg.addEventListener("click", function(e) {
    e.preventDefault();
    dl("Cape");
  });
}, 300);
