const capeImg = document.getElementById('cape');
const skinImg = document.getElementById('skin');
var button = document.querySelector('#btn');

async function getSkin(username) {
  if (button.disabled) return;
  btnState(false);

  if (username === "" || username == null) {
    alert("Please, insert a username!");
    btnState(true);
    return;
  }
  if (!(/^\w{3,16}$/).test(username)) {
    alert("Please, insert a valid username!");
    btnState(true);
    return;
  }

  skinImg.style.display = 'none';
  capeImg.style.display = 'none';
  skinImg.src = "";
  capeImg.src = "";

  try {
    const response = await fetch(`https://api.ashcon.app/mojang/v2/user/${username}`);
    if (!response.ok) throw new Error("Error while getting the player's data.");

    const data = await response.json();
    if (!data.textures) throw new Error("Error while getting player data.");

    skinImg.src = `data:image/png;base64,${data.textures.skin.data}`;
    skinImg.style.display = 'block';
    if (data.textures.cape.data != null) {
      capeImg.src = `data:image/png;base64,${data.textures.cape.data}`;
      capeImg.style.display = 'block';
    }
  } catch (error) {console.error(error.message);}
  btnState(true);
}

function btnState(state) {
  if (state === false) {
    button.textContent = 'Loading...';
    button.disabled = true;
    return;
  }
  button.disabled = false;
  button.textContent = 'Get Skin';
};

function dl(type) {
  var a = document.createElement("a");
  if (type === "Skin") a.href = skinImg.src;
  if (type === "Cape") a.href = capeImg.src;
  a.download = `${type}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

document.addEventListener("keydown", function(e) {
  if (e.key === "Enter") getSkin(document.getElementById('username').value.trim());
});