let targetLocation = "";
if (window.screen.width >= 810) {
  targetLocation = window.location.origin + "/desktop.html";
} else {
  targetLocation = window.location.origin + "/mobile.html";
}

if (window.location.href !== targetLocation) {
  window.location = targetLocation;
}
